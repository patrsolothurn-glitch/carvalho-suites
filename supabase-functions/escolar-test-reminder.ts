// supabase-functions/escolar-test-reminder.ts
// Corre todos os dias de manhã (agendado via pg_cron, ver
// escolar-test-reminder-cron.sql). Verifica testes/exames e eventos
// escolares (tipo 'teste' ou 'tpc') pendentes cuja data caia nos
// próximos DIAS_ANTES dias, e envia lembrete a Patricio, Cristina e
// Lucas. Cada teste/tpc só gera um lembrete (ver reminder_sent_at,
// coluna nova em escolar_tpc — ver bloco SQL entregue à parte).
//
// Deploy manual (Patricio):
//   supabase functions deploy escolar-test-reminder
// Depois corre escolar-test-reminder-cron.sql no SQL editor do Supabase
// para agendar (ou reagendar) o cron job.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Quantos dias à frente um teste/tpc conta como "a chegar" e gera
// lembrete. Fácil de mudar aqui sem mexer no resto da função.
const DIAS_ANTES = 2;

// Só estes membros da família recebem o lembrete antecipado (member_id
// na tabela profiles). Cristina está gravada como 'esposa'.
const DESTINATARIOS_MEMBER_IDS = ['patricio', 'esposa', 'lucas'];

function jsonRes(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1) Buscar testes/exames/eventos pendentes e ainda sem lembrete
    // enviado (reminder_sent_at is null é o que evita duplicados).
    const tpcRes = await fetch(
      `${SUPABASE_URL}/rest/v1/escolar_tpc?select=*&tipo=in.(teste,tpc)&feito=eq.false&reminder_sent_at=is.null`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
    );
    if (!tpcRes.ok) {
      const errText = await tpcRes.text();
      console.error('[escolar-test-reminder] falha ao ler escolar_tpc:', tpcRes.status, errText);
      return jsonRes({ ok: false, error: 'falha ao ler escolar_tpc: ' + errText }, 500);
    }
    const testes = await tpcRes.json();
    if (testes && testes.error) {
      console.error('[escolar-test-reminder] erro na resposta de escolar_tpc:', testes.error);
      return jsonRes({ ok: false, error: testes.error }, 500);
    }

    const hoje = new Date();
    hoje.setUTCHours(0, 0, 0, 0);

    const proximos = (testes || []).filter((t: any) => {
      if (!t.data) return false;
      const alvo = new Date(t.data + 'T00:00:00Z');
      const dias = Math.ceil((alvo.getTime() - hoje.getTime()) / 86400000);
      return dias >= 0 && dias <= DIAS_ANTES;
    });

    if (!proximos.length) {
      return jsonRes({ ok: true, avisos: 0, motivo: `sem testes/tpc nos próximos ${DIAS_ANTES} dias` });
    }

    // 2) Descobrir disciplinas envolvidas (para mostrar o nome, não só o id)
    const discIds = [...new Set(proximos.map((t: any) => t.disc_id).filter((id: any) => id != null))];
    const discMap: Record<string, any> = {};
    if (discIds.length) {
      const discRes = await fetch(
        `${SUPABASE_URL}/rest/v1/escolar_disciplinas?select=id,nome,emoji&id=in.(${discIds.join(',')})`,
        { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
      );
      if (!discRes.ok) {
        console.error('[escolar-test-reminder] falha ao ler escolar_disciplinas:', discRes.status, await discRes.text());
        // não bloqueia o resto — só perde o nome bonito da disciplina
      } else {
        const discs = await discRes.json();
        (discs || []).forEach((d: any) => { discMap[d.id] = d; });
      }
    }

    // 3) Descobrir destinatários: só Patricio, Cristina e Lucas, e só
    // quem tem a app "escolar" ativa nas notificações.
    const profilesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=id,member_id,notification_prefs,disabled,allowed_apps,is_admin&member_id=in.(${DESTINATARIOS_MEMBER_IDS.join(',')})`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
    );
    if (!profilesRes.ok) {
      const errText = await profilesRes.text();
      console.error('[escolar-test-reminder] falha ao ler profiles:', profilesRes.status, errText);
      return jsonRes({ ok: false, error: 'falha ao ler profiles: ' + errText }, 500);
    }
    const profiles = await profilesRes.json();
    if (profiles && profiles.error) {
      console.error('[escolar-test-reminder] erro na resposta de profiles:', profiles.error);
      return jsonRes({ ok: false, error: profiles.error }, 500);
    }
    const profileIds = (profiles || [])
      .filter((p: any) => {
        if (p.disabled) return false;
        const allowed = p.allowed_apps || [];
        if (!p.is_admin && allowed.indexOf('escolar') === -1) return false;
        const disabledApps = (p.notification_prefs && p.notification_prefs.disabledApps) || [];
        return disabledApps.indexOf('escolar') === -1;
      })
      .map((p: any) => p.id);

    if (!profileIds.length) {
      console.warn('[escolar-test-reminder] sem destinatários elegíveis entre', DESTINATARIOS_MEMBER_IDS.join(','));
      return jsonRes({ ok: true, avisos: 0, motivo: 'sem destinatários' });
    }

    // 4) Agrupar por aluno e montar uma única mensagem por aluno (evita spam)
    const porAluno: Record<string, any[]> = {};
    proximos.forEach((t: any) => {
      const key = t.aluno || 'lucas';
      if (!porAluno[key]) porAluno[key] = [];
      porAluno[key].push(t);
    });

    let enviados = 0;
    const falhas: any[] = [];

    for (const aluno of Object.keys(porAluno)) {
      const itens = porAluno[aluno].sort((a: any, b: any) => (a.data || '').localeCompare(b.data || ''));
      const lista = itens.map((t: any) => {
        const d = discMap[t.disc_id];
        const nomeDisc = d ? `${d.emoji || ''} ${d.nome}`.trim() : null;
        const rotulo = t.tipo === 'teste' ? (nomeDisc || 'Escola') : (t.titulo || nomeDisc || 'Evento escolar');
        return `${rotulo} (${t.data})`;
      });

      const nomeAluno = aluno === 'liam' ? 'Liam' : aluno === 'lucas' ? 'Lucas' : aluno;
      const title = `📚 Testes/eventos a chegar — ${nomeAluno}`;
      const body = lista.join(' · ');

      try {
        const pushRes = await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
          method: 'POST',
          headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, body, profileIds }),
        });
        const pushJson = await pushRes.json().catch(() => null);
        if (!pushRes.ok || !pushJson || pushJson.error || !(pushJson.sent > 0)) {
          console.error('[escolar-test-reminder] send-push falhou para', aluno, ':', pushRes.status, pushJson);
          falhas.push({ aluno, status: pushRes.status, resposta: pushJson });
          continue; // não marca como enviado — tenta de novo amanhã
        }
        enviados++;

        // 5) Marcar como enviado (evita repetir o aviso nos próximos
        // dias) — só depois do push ter sido efetivamente entregue.
        const ids = itens.map((t: any) => t.id);
        const markRes = await fetch(
          `${SUPABASE_URL}/rest/v1/escolar_tpc?id=in.(${ids.join(',')})`,
          {
            method: 'PATCH',
            headers: {
              apikey: SERVICE_KEY,
              Authorization: `Bearer ${SERVICE_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal',
            },
            body: JSON.stringify({ reminder_sent_at: new Date().toISOString() }),
          }
        );
        if (!markRes.ok) {
          const markErrText = await markRes.text();
          console.error('[escolar-test-reminder] falha ao marcar reminder_sent_at para', aluno, ':', markRes.status, markErrText);
          falhas.push({ aluno, etapa: 'marcar reminder_sent_at', status: markRes.status, resposta: markErrText });
        }
      } catch (err) {
        console.error('[escolar-test-reminder] erro inesperado ao processar', aluno, ':', err);
        falhas.push({ aluno, erro: String(err) });
      }
    }

    return jsonRes({ ok: true, avisos: enviados, falhas });
  } catch (err) {
    console.error('[escolar-test-reminder] erro fatal:', err);
    return jsonRes({ ok: false, error: String(err) }, 500);
  }
});
