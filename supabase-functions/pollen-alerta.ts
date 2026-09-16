// supabase-functions/pollen-alerta.ts
// Corre 1x por dia (agendado via pg_cron, ver supabase/pollen.sql).
// Para cada pollen_perfis com notificar=true, vai buscar a previsão de
// HOJE à Open-Meteo Air Quality API para a lat/lon do perfil; se algum
// pólen das alergias do perfil chegar a "forte" ou "muito forte" hoje,
// envia um push ao profile_id dono do perfil (reaproveita a função
// send-push já existente). Um push por perfil por dia no máximo (a
// função só corre 1x/dia via cron). Respeita
// profile.notification_prefs.disabledApps ('pollen').
//
// Deploy manual (Patricio):
//   supabase functions deploy pollen-alerta
// Agendar: ver o bloco pg_cron em supabase/pollen.sql.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Mesmos ids/nomes/limites de src/19-app-pollen.js (POL_TIPOS/
// POL_LIMITES) — duplicados aqui de propósito: a Edge Function corre
// isolada em Deno, sem acesso ao bundle do browser. Se um dia os
// limites do app mudarem, atualiza também aqui.
const OM_VARS: Record<string, string> = {
  erle: 'alder_pollen', birke: 'birch_pollen', graeser: 'grass_pollen',
  beifuss: 'mugwort_pollen', ambrosia: 'ragweed_pollen', olive: 'olive_pollen',
};
const NOMES_DE: Record<string, string> = {
  erle: 'Erle', hasel: 'Hasel', esche: 'Esche', birke: 'Birke', buche: 'Buche',
  eiche: 'Eiche', graeser: 'Gräser', beifuss: 'Beifuss', ambrosia: 'Ambrosia', olive: 'Olive',
};
const NOMES_PT: Record<string, string> = {
  erle: 'amieiro', hasel: 'aveleira', esche: 'freixo', birke: 'bétula', buche: 'faia',
  eiche: 'carvalho', graeser: 'gramíneas', beifuss: 'artemísia', ambrosia: 'ambrósia', olive: 'oliveira',
};
const LIMITES: Record<string, [number, number, string][]> = {
  erle: [[1, 10, 'moderado'], [11, 69, 'forte'], [70, Infinity, 'muito forte']],
  hasel: [[1, 10, 'moderado'], [11, 69, 'forte'], [70, Infinity, 'muito forte']],
  esche: [[1, 10, 'fraco'], [11, 99, 'moderado'], [100, 349, 'forte'], [350, Infinity, 'muito forte']],
  birke: [[1, 10, 'fraco'], [11, 69, 'moderado'], [70, 299, 'forte'], [300, Infinity, 'muito forte']],
  buche: [[1, 49, 'fraco'], [50, 129, 'moderado'], [130, 399, 'forte'], [400, Infinity, 'muito forte']],
  eiche: [[1, 49, 'fraco'], [50, 129, 'moderado'], [130, 399, 'forte'], [400, Infinity, 'muito forte']],
  graeser: [[1, 19, 'fraco'], [20, 49, 'moderado'], [50, 149, 'forte'], [150, Infinity, 'muito forte']],
  beifuss: [[1, 5, 'fraco'], [6, 14, 'moderado'], [15, 49, 'forte'], [50, Infinity, 'muito forte']],
  ambrosia: [[1, 5, 'fraco'], [6, 14, 'moderado'], [15, 49, 'forte'], [50, Infinity, 'muito forte']],
  olive: [[1, 10, 'fraco'], [11, 99, 'moderado'], [100, 349, 'forte'], [350, Infinity, 'muito forte']],
};
function classificar(tipo: string, valor: number): string | null {
  if (valor == null || valor <= 0) return null;
  const faixas = LIMITES[tipo];
  if (!faixas) return null;
  for (const [min, max, nivel] of faixas) {
    if (valor >= min && valor <= max) return nivel;
  }
  return 'muito forte';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1) Perfis com alertas ligados
    const perfisRes = await fetch(`${SUPABASE_URL}/rest/v1/pollen_perfis?select=*&notificar=eq.true`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    const perfis = await perfisRes.json();
    if (!Array.isArray(perfis) || !perfis.length) {
      return new Response(JSON.stringify({ ok: true, avisos: 0, motivo: 'sem perfis com notificar=true' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2) Quem tem a app "pollen" ativa nas notificações
    const profilesRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id,notification_prefs,disabled`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    const profiles = await profilesRes.json();
    const elegivel = new Map<string, boolean>();
    for (const p of profiles || []) {
      if (p.disabled) { elegivel.set(p.id, false); continue; }
      const disabledApps = (p.notification_prefs && p.notification_prefs.disabledApps) || [];
      elegivel.set(p.id, disabledApps.indexOf('pollen') === -1);
    }

    let enviados = 0;
    for (const perfil of perfis) {
      if (!elegivel.get(perfil.profile_id)) continue;
      const alergias: string[] = perfil.alergias || [];
      if (!alergias.length) continue;
      const vars = [...new Set(alergias.map((a) => OM_VARS[a]).filter(Boolean))];
      if (!vars.length) continue; // nenhuma das alergias tem fonte de previsão Open-Meteo

      let dados: any;
      try {
        const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${perfil.lat}&longitude=${perfil.lon}&hourly=${vars.join(',')}&timezone=Europe%2FZurich&forecast_days=1`;
        const r = await fetch(url);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        dados = await r.json();
      } catch (e) {
        console.error('[pollen-alerta] previsão Open-Meteo falhou para perfil', perfil.id, e);
        continue;
      }

      const hoje = new Date().toISOString().slice(0, 10);
      const linhas: string[] = [];
      for (const tipoId of alergias) {
        const omVar = OM_VARS[tipoId];
        if (!omVar || !dados.hourly || !dados.hourly[omVar]) continue;
        let max = 0;
        (dados.hourly.time || []).forEach((t: string, i: number) => {
          if (t.slice(0, 10) !== hoje) return;
          const v = dados.hourly[omVar][i];
          if (v != null && v > max) max = v;
        });
        const nivel = classificar(tipoId, max);
        if (nivel === 'forte' || nivel === 'muito forte') {
          linhas.push(`${NOMES_DE[tipoId]} · ${NOMES_PT[tipoId]}: ${nivel}`);
        }
      }
      if (!linhas.length) continue;

      const title = `🌼 Pólen alto hoje — ${perfil.cidade}`;
      const body = linhas.join('\n');
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
          method: 'POST',
          headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, body, profileIds: [perfil.profile_id] }),
        });
        enviados++;
      } catch (e) {
        console.error('[pollen-alerta] send-push falhou para perfil', perfil.id, e);
      }
    }

    return new Response(JSON.stringify({ ok: true, avisos: enviados }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[pollen-alerta]', err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
