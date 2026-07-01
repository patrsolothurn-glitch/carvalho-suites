// supabase-functions/subby-reminders.ts
// Corre 1x por dia (agendado via pg_cron). Verifica subscrições cuja
// próxima cobrança está a "lembrete_dias" de distância (ou menos) e
// envia push a quem tem a app "subby" ativa nas notificações.
//
// Deploy manual (Patricio):
//   supabase functions deploy subby-reminders
// Depois agenda no Supabase Dashboard → Database → Cron Jobs (ou via SQL,
// ver ficheiro subby-reminders-cron.sql) para correr 1x/dia, ex: 08:00.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1) Buscar subscrições ativas
    const subsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/subscriptions?select=*&ativa=eq.true`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
    );
    const subs = await subsRes.json();

    const hoje = new Date();
    hoje.setUTCHours(0, 0, 0, 0);

    const devidas = (subs || []).filter((s: any) => {
      if (!s.proxima_cobranca) return false;
      const alvo = new Date(s.proxima_cobranca + 'T00:00:00Z');
      const dias = Math.ceil((alvo.getTime() - hoje.getTime()) / 86400000);
      const lembrete = s.lembrete_dias ?? 3;
      // Só avisa no dia exato em que entra na janela de lembrete,
      // para não repetir o aviso todos os dias até lá.
      return dias === lembrete || dias === 0;
    });

    if (!devidas.length) {
      return new Response(JSON.stringify({ ok: true, avisos: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2) Descobrir quem quer receber avisos da app "subby"
    const profilesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=id,notification_prefs,disabled`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
    );
    const profiles = await profilesRes.json();
    const profileIds = (profiles || [])
      .filter((p: any) => {
        if (p.disabled) return false;
        const disabledApps = (p.notification_prefs && p.notification_prefs.disabledApps) || [];
        return disabledApps.indexOf('subby') === -1;
      })
      .map((p: any) => p.id);

    if (!profileIds.length) {
      return new Response(JSON.stringify({ ok: true, avisos: 0, motivo: 'sem destinatários' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3) Enviar um push por subscrição devida (reaproveita a função send-push)
    let enviados = 0;
    for (const s of devidas) {
      const dias = Math.ceil(
        (new Date(s.proxima_cobranca + 'T00:00:00Z').getTime() - hoje.getTime()) / 86400000
      );
      const quando = dias <= 0 ? 'hoje' : `em ${dias} dia${dias === 1 ? '' : 's'}`;
      const title = '💳 Abo Kontrolle';
      const body = `${s.icone || '🔔'} ${s.nome} renova ${quando} — ${Number(s.valor).toFixed(2)} ${s.moeda}`;

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
