// supabase-functions/escolar-test-reminder.ts
// Corre 1x por semana, sexta à noite (agendado via pg_cron). Verifica
// testes/exames pendentes do Lucas e do Liam cuja data caia na semana
// seguinte (até 8 dias à frente) e envia push a quem tem a app "escolar"
// ativa nas notificações — para dar tempo de estudar no fim de semana.
//
// Deploy manual (Patricio):
//   supabase functions deploy escolar-test-reminder
// Depois agenda no Supabase Dashboard → Database → Cron Jobs (ou via SQL,
// ver ficheiro escolar-test-reminder-cron.sql) para correr às sextas à
// noite.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Até quantos dias à frente (a partir de sexta) um teste conta como
// "da próxima semana" e por isso gera aviso.
const JANELA_DIAS = 8;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1) Buscar testes/exames pendentes (todos os alunos)
    const tpcRes = await fetch(
      `${SUPABASE_URL}/rest/v1/escolar_tpc?select=*&tipo=eq.teste&feito=eq.false`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
    );
    const testes = await tpcRes.json();

    const hoje = new Date();
    hoje.setUTCHours(0, 0, 0, 0);

    const proximos = (testes || []).filter((t: any) => {
      if (!t.data) return false;
      const alvo = new Date(t.data + 'T00:00:00Z');
      const dias = Math.ceil((alvo.getTime() - hoje.getTime()) / 86400000);
      return dias >= 0 && dias <= JANELA_DIAS;
    });

    if (!proximos.length) {
      return new Response(JSON.stringify({ ok: true, avisos: 0, motivo: 'sem testes na próxima semana' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2) Descobrir disciplinas envolvidas (para mostrar o nome, não só o id)
    const discIds = [...new Set(proximos.map((t: any) => t.disc_id))];
    const discRes = await fetch(
      `${SUPABASE_URL}/rest/v1/escolar_disciplinas?select=id,nome,emoji&id=in.(${discIds.join(',')})`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
    );
    const discs = await discRes.json();
    const discMap: Record<string, any> = {};
    (discs || []).forEach((d: any) => { discMap[d.id] = d; });

    // 3) Descobrir quem quer receber avisos da app "escolar"
    const profilesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=id,notification_prefs,disabled`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
    );
    const profiles = await profilesRes.json();
    const profileIds = (profiles || [])
      .filter((p: any) => {
        if (p.disabled) return false;
        const disabledApps = (p.notification_prefs && p.notification_prefs.disabledApps) || [];
        return disabledApps.indexOf('escolar') === -1;
      })
      .map((p: any) => p.id);

    if (!profileIds.length) {
      return new Response(JSON.stringify({ ok: true, avisos: 0, motivo: 'sem destinatários' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4) Agrupar por aluno e montar uma única mensagem (evita spam de vários pushes)
    const porAluno: Record<string, any[]> = {};
    proximos.forEach((t: any) => {
      const key = t.aluno || 'lucas';
      if (!porAluno[key]) porAluno[key] = [];
      porAluno[key].push(t);
    });

    let enviados = 0;
    for (const aluno of Object.keys(porAluno)) {
      const lista = porAluno[aluno]
        .sort((a: any, b: any) => (a.data || '').localeCompare(b.data || ''))
        .map((t: any) => {
          const d = discMap[t.disc_id];
          const nomeDisc = d ? `${d.emoji || ''} ${d.nome}`.trim() : 'Escola';
          return `${nomeDisc} (${t.data})`;
        });

      const nomeAluno = aluno === 'liam' ? 'Liam' : 'Lucas';
      const title = `📚 Testes da próxima semana — ${nomeAluno}`;
      const body = lista.join(' · ');

      await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
        method: 'POST',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, body, profileIds }),
      }).catch(() => {});
      enviados++;
    }

    return new Response(JSON.stringify({ ok: true, avisos: enviados }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
