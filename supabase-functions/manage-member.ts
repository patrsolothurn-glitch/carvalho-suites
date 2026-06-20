import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

function json(body, status = 200) {
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Não autenticado' }, 401);

    const userClient = createClient(SUPABASE_URL, SERVICE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: 'Sessão inválida' }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: callerProfile } = await admin
      .from('profiles')
      .select('is_admin')
      .eq('id', userData.user.id)
      .single();

    if (!callerProfile?.is_admin) return json({ error: 'Apenas o admin pode fazer isto' }, 403);

    const body = await req.json();
    const { action } = body;

    if (action === 'create') {
      const { email, password, display_name, member_id, allowed_apps } = body;
      if (!email || !password) return json({ error: 'Email e password são obrigatórios' }, 400);

      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
      });
      if (createErr) return json({ error: createErr.message }, 400);

      const newId = created.user.id;
      const { error: profileErr } = await admin.from('profiles').insert({
        id: newId,
        email: email,
        display_name: display_name || null,
        member_id: member_id || null,
        allowed_apps: allowed_apps || [],
        is_admin: false,
        disabled: false,
      });
      if (profileErr) {
        await admin.auth.admin.deleteUser(newId);
        return json({ error: profileErr.message }, 400);
      }
      return json({ ok: true, id: newId });
    }

    if (action === 'delete') {
      const { id } = body;
      if (!id) return json({ error: 'id é obrigatório' }, 400);
      if (id === userData.user.id) return json({ error: 'Não podes apagar a tua própria conta de admin' }, 400);

      await admin.from('profiles').delete().eq('id', id);
      const { error: delErr } = await admin.auth.admin.deleteUser(id);
      if (delErr) return json({ error: delErr.message }, 400);
      return json({ ok: true });
    }

    return json({ error: 'Ação desconhecida' }, 400);
  } catch (e) {
    return json({ error: String((e && e.message) || e) }, 500);
  }
});
