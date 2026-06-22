import webpush from 'npm:web-push@3.6.7';

const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

webpush.setVapidDetails('mailto:patr.carvalho@hotmail.com', VAPID_PUBLIC, VAPID_PRIVATE);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // O navegador manda sempre um pedido OPTIONS antes do POST (preflight).
  // Tem de ser respondido já aqui, sem tentar ler o corpo do pedido.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { title, body, profileIds } = await req.json();
    let url = `${SUPABASE_URL}/rest/v1/push_subscriptions?select=*`;
    if (profileIds && Array.isArray(profileIds) && profileIds.length > 0) {
      url += `&profile_id=in.(${profileIds.join(',')})`;
    }
    const res = await fetch(url, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    const subs = await res.json();
    const payload = JSON.stringify({ title: title || 'Carvalho Suite', body: body || '' });
    const results = await Promise.allSettled(
      (subs || []).map((s: any) =>
        webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload
        )
      )
    );
    return new Response(JSON.stringify({ sent: results.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
