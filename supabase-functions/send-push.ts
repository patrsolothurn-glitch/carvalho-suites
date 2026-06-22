import webpush from 'npm:web-push@3.6.7';

const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

webpush.setVapidDetails('mailto:' + 'patr.carvalho' + '@' + 'hotmail.com', VAPID_PUBLIC, VAPID_PRIVATE);

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

    let sentCount = 0;
    const errors: any[] = [];
    const deadEndpoints: string[] = [];

    results.forEach((r: any, i: number) => {
      if (r.status === 'fulfilled') {
        sentCount++;
      } else {
        const reason = r.reason || {};
        const statusCode = reason.statusCode;
        errors.push({
          endpoint: (subs[i].endpoint || '').slice(0, 50),
          statusCode,
          message: String(reason.body || reason.message || reason),
        });
        if (statusCode === 404 || statusCode === 410) {
          deadEndpoints.push(subs[i].endpoint);
        }
      }
    });

    // Limpa subscrições mortas (o navegador/dispositivo já não as reconhece)
    if (deadEndpoints.length > 0) {
      await fetch(
        `${SUPABASE_URL}/rest/v1/push_subscriptions?endpoint=in.(${deadEndpoints.map((e) => encodeURIComponent(e)).join(',')})`,
        {
          method: 'DELETE',
          headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
        }
      ).catch(() => {});
    }

    return new Response(
      JSON.stringify({
        attempted: results.length,
        sent: sentCount,
        failed: errors.length,
        removed: deadEndpoints.length,
        errors,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
