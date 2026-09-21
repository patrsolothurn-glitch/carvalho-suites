// ══════════════════════════════════════════════════════════════════
// APP PÓLEN — Previsão e diário de alergias ao pólen. Disponível a
// quem for admin ou tiver 'pollen' em profiles.allowed_apps (ver
// src/02-theme.js e src/10-shell.js). pollen_perfis e pollen_termos
// são partilhados por toda a família com acesso ao Pólen (RLS por
// is_admin/allowed_apps, ver supabase/pollen.sql) — não filtrados por
// profile_id no carregar(); profile_id em pollen_perfis/pollen_termos
// continua a guardar quem criou. pollen_diario é por perfil escolhido,
// também partilhado. pollen_estacoes/pollen_medicoes são só de leitura
// aqui (alimentadas pelo workflow .github/workflows/pollen-fetch.yml).
// Nunca mistura com tabelas de outra app.
// ══════════════════════════════════════════════════════════════════

// ── Tipos de pólen: nome DE/PT, variável Open-Meteo (null se essa
// fonte não tiver o tipo) — a MeteoSwiss não tem uma "variável" fixa
// aqui porque o tipo (coluna) é lido do cabeçalho do CSV pelo script
// de fetch (ver scripts/pollen-fetch.py); o que decide se há "—" do
// lado da MeteoSwiss é simplesmente não haver medição para esse tipo
// na estação escolhida.
var POL_TIPOS = [
  { id: 'erle', de: 'Erle', pt: 'amieiro', omVar: 'alder_pollen' },
  { id: 'hasel', de: 'Hasel', pt: 'aveleira', omVar: null },
  { id: 'esche', de: 'Esche', pt: 'freixo', omVar: null },
  { id: 'birke', de: 'Birke', pt: 'bétula', omVar: 'birch_pollen' },
  { id: 'buche', de: 'Buche', pt: 'faia', omVar: null },
  { id: 'eiche', de: 'Eiche', pt: 'carvalho', omVar: null },
  { id: 'graeser', de: 'Gräser', pt: 'gramíneas', omVar: 'grass_pollen' },
  { id: 'beifuss', de: 'Beifuss', pt: 'artemísia', omVar: 'mugwort_pollen' },
  { id: 'ambrosia', de: 'Ambrosia', pt: 'ambrósia', omVar: 'ragweed_pollen' },
  { id: 'olive', de: 'Olive', pt: 'oliveira', omVar: 'olive_pollen' }
];
function polTipoInfo(id) {
  for (var i = 0; i < POL_TIPOS.length; i++) { if (POL_TIPOS[i].id === id) return POL_TIPOS[i]; }
  return null;
}

// ── Níveis de carga polínica (grãos/m³, média/pico diário) ─────────
// Fonte: MeteoSchweiz, "Belastungsklassen der allergenen Pollenarten"
// https://www.meteoschweiz.admin.ch/dam/jcr:5a46f08a-68a1-413c-9718-821e27540b27/Belastungsklassen-allergener-Pollenarten_D.pdf
// (Erle/Hasel não têm classe "fraco" na fonte — começam logo em
// "moderado". A oliveira não consta na classificação suíça; usa-se
// aqui a mesma escala do freixo como aproximação, a confirmar.)
var POL_LIMITES = {
  erle: [[1, 10, 'moderado'], [11, 69, 'forte'], [70, Infinity, 'muito_forte']],
  hasel: [[1, 10, 'moderado'], [11, 69, 'forte'], [70, Infinity, 'muito_forte']],
  esche: [[1, 10, 'fraco'], [11, 99, 'moderado'], [100, 349, 'forte'], [350, Infinity, 'muito_forte']],
  birke: [[1, 10, 'fraco'], [11, 69, 'moderado'], [70, 299, 'forte'], [300, Infinity, 'muito_forte']],
  buche: [[1, 49, 'fraco'], [50, 129, 'moderado'], [130, 399, 'forte'], [400, Infinity, 'muito_forte']],
  eiche: [[1, 49, 'fraco'], [50, 129, 'moderado'], [130, 399, 'forte'], [400, Infinity, 'muito_forte']],
  graeser: [[1, 19, 'fraco'], [20, 49, 'moderado'], [50, 149, 'forte'], [150, Infinity, 'muito_forte']],
  beifuss: [[1, 5, 'fraco'], [6, 14, 'moderado'], [15, 49, 'forte'], [50, Infinity, 'muito_forte']],
  ambrosia: [[1, 5, 'fraco'], [6, 14, 'moderado'], [15, 49, 'forte'], [50, Infinity, 'muito_forte']],
  olive: [[1, 10, 'fraco'], [11, 99, 'moderado'], [100, 349, 'forte'], [350, Infinity, 'muito_forte']]
};
var POL_NIVEL_INFO = {
  vestigios: { label: 'Vestígios', cor: '#CBD5E1' },
  fraco: { label: 'Fraco', cor: '#12A150' },
  moderado: { label: 'Moderado', cor: '#FFD21F' },
  forte: { label: 'Forte', cor: '#F97316' },
  muito_forte: { label: 'Muito forte', cor: '#DC2626' }
};
// Classifica um valor (grãos/m³, pode vir com decimais da Open-Meteo) num
// nível. As faixas de POL_LIMITES só têm limites inteiros (fonte MeteoSchweiz),
// por isso classifica-se SÓ pelo limite INFERIOR de cada faixa, do nível
// mais alto para o mais baixo — nunca pelos dois limites em conjunto, que
// deixava valores decimais "entre faixas" (ex.: 5.5, 19.6) cair no
// 'muito_forte' por defeito no fim da função. Valores > 0 e < 1 (vestígios
// de pólen, ainda não uma carga real) ficam num nível à parte, que não
// conta para alertas. valor <= 0 ou sem valor devolve null (o chamador
// decide se é "fora de época" ou "sem dados" a partir do valor em si).
function polClassificarNivel(tipoId, valor) {
  if (valor == null || valor <= 0) return null;
  if (valor < 1) return 'vestigios';
  var faixas = POL_LIMITES[tipoId];
  if (!faixas) return null;
  for (var i = faixas.length - 1; i >= 0; i--) {
    if (valor >= faixas[i][0]) return faixas[i][2];
  }
  // Abaixo do limite inferior da faixa mais baixa definida (só acontece
  // para Erle/Hasel, que na fonte não têm classe "fraco" — aqui ficam
  // "fraco" na mesma em vez de "sem nível", por consistência com os outros.
  return 'fraco';
}
// Autoteste de polClassificarNivel — só corre em modo admin (window.__cs_admin,
// ver src/10-shell.js), uma vez no arranque da app. Cobre os casos que
// motivaram o BUG A (decimais da Open-Meteo entre faixas e abaixo de 1),
// para nunca mais cair em "muito forte" por defeito.
// Nota sobre "5.5 beifuss": as faixas de beifuss são fraco[1,5] e
// moderado[6,14] — 5.5 fica ABAIXO do limite inferior de moderado (6), logo
// classifica como 'fraco' com a regra "só pelo limite inferior" pedida. Só
// passaria a 'moderado' se o limite inferior de moderado fosse <= 5.5.
function polAutoteste() {
  console.assert(polClassificarNivel('graeser', 0.4) === 'vestigios', '[pollen autoteste] 0.4 graeser devia ser vestigios');
  console.assert(polClassificarNivel('beifuss', 5.5) === 'fraco', '[pollen autoteste] 5.5 beifuss devia ser fraco (moderado só a partir de 6)');
  console.assert(polClassificarNivel('graeser', 19.6) === 'fraco', '[pollen autoteste] 19.6 graeser devia ser fraco');
  console.assert(polClassificarNivel('graeser', 20) === 'moderado', '[pollen autoteste] 20 graeser devia ser moderado');
  console.assert(polClassificarNivel('graeser', 150) === 'muito_forte', '[pollen autoteste] 150 graeser devia ser muito_forte');
  console.assert(polClassificarNivel('graeser', 0) === null, '[pollen autoteste] 0 devia ser fora de época (null)');
}

// ── Kantone + cidades principais (com Selzach, Solothurn e Grenchen)
var POL_KANTONE = [
  { kanton: 'Zürich', cidade: 'Zürich', lat: 47.3769, lon: 8.5417 },
  { kanton: 'Bern', cidade: 'Bern', lat: 46.9480, lon: 7.4474 },
  { kanton: 'Luzern', cidade: 'Luzern', lat: 47.0502, lon: 8.3093 },
  { kanton: 'Uri', cidade: 'Altdorf', lat: 46.8808, lon: 8.6437 },
  { kanton: 'Schwyz', cidade: 'Schwyz', lat: 47.0207, lon: 8.6530 },
  { kanton: 'Obwalden', cidade: 'Sarnen', lat: 46.8974, lon: 8.2458 },
  { kanton: 'Nidwalden', cidade: 'Stans', lat: 46.9581, lon: 8.3667 },
  { kanton: 'Glarus', cidade: 'Glarus', lat: 47.0404, lon: 9.0680 },
  { kanton: 'Zug', cidade: 'Zug', lat: 47.1662, lon: 8.5155 },
  { kanton: 'Fribourg', cidade: 'Fribourg', lat: 46.8065, lon: 7.1619 },
  { kanton: 'Solothurn', cidade: 'Solothurn', lat: 47.2088, lon: 7.5323 },
  { kanton: 'Solothurn', cidade: 'Selzach', lat: 47.2225, lon: 7.4842 },
  { kanton: 'Solothurn', cidade: 'Grenchen', lat: 47.1917, lon: 7.3959 },
  { kanton: 'Basel-Stadt', cidade: 'Basel', lat: 47.5596, lon: 7.5886 },
  { kanton: 'Basel-Landschaft', cidade: 'Liestal', lat: 47.4840, lon: 7.7350 },
  { kanton: 'Schaffhausen', cidade: 'Schaffhausen', lat: 47.6970, lon: 8.6350 },
  { kanton: 'Appenzell Ausserrhoden', cidade: 'Herisau', lat: 47.3853, lon: 9.2795 },
  { kanton: 'Appenzell Innerrhoden', cidade: 'Appenzell', lat: 47.3315, lon: 9.4092 },
  { kanton: 'St. Gallen', cidade: 'St. Gallen', lat: 47.4245, lon: 9.3767 },
  { kanton: 'Graubünden', cidade: 'Chur', lat: 46.8499, lon: 9.5330 },
  { kanton: 'Aargau', cidade: 'Aarau', lat: 47.3925, lon: 8.0442 },
  { kanton: 'Thurgau', cidade: 'Frauenfeld', lat: 47.5590, lon: 8.8990 },
  { kanton: 'Ticino', cidade: 'Bellinzona', lat: 46.1944, lon: 9.0175 },
  { kanton: 'Vaud', cidade: 'Lausanne', lat: 46.5197, lon: 6.6323 },
  { kanton: 'Valais', cidade: 'Sion', lat: 46.2331, lon: 7.3606 },
  { kanton: 'Neuchâtel', cidade: 'Neuchâtel', lat: 46.9900, lon: 6.9293 },
  { kanton: 'Genève', cidade: 'Genève', lat: 46.2044, lon: 6.1432 },
  { kanton: 'Jura', cidade: 'Delémont', lat: 47.3659, lon: 7.3448 }
];

// ── Termos base (só leitura) ─────────────────────────────────────
var POL_TERMOS_BASE = [
  { de: 'Erle', pt: 'amieiro', categoria: 'polen' },
  { de: 'Hasel', pt: 'aveleira', categoria: 'polen' },
  { de: 'Esche', pt: 'freixo', categoria: 'polen' },
  { de: 'Birke', pt: 'bétula', categoria: 'polen' },
  { de: 'Buche', pt: 'faia', categoria: 'polen' },
  { de: 'Eiche', pt: 'carvalho', categoria: 'polen' },
  { de: 'Gräser', pt: 'gramíneas', categoria: 'polen' },
  { de: 'Beifuss', pt: 'artemísia', categoria: 'polen' },
  { de: 'Ambrosia', pt: 'ambrósia', categoria: 'polen' },
  { de: 'Wegerich', pt: 'tanchagem', categoria: 'polen' },
  { de: 'Olive', pt: 'oliveira', categoria: 'polen' },
  { de: 'Heuschnupfen', pt: 'rinite alérgica (febre dos fenos)', categoria: 'medico' },
  { de: 'Pollenflug', pt: 'pólen no ar', categoria: 'medico' },
  { de: 'Pollensaison', pt: 'época do pólen', categoria: 'medico' },
  { de: 'Pollenbelastung', pt: 'carga de pólen', categoria: 'medico' },
  { de: 'Kreuzallergie', pt: 'alergia cruzada', categoria: 'medico', explicacao: 'Ex.: quem reage à bétula pode reagir a maçã, avelã ou cenoura cruas; quem reage à artemísia pode reagir ao aipo e a especiarias.' },
  { de: 'Hyposensibilisierung', pt: 'dessensibilização / imunoterapia', categoria: 'medico', explicacao: 'Tratamento de vários anos que habitua o corpo ao alergénio.' },
  { de: 'Allergologe', pt: 'alergologista', categoria: 'medico' },
  { de: 'Pricktest', pt: 'teste cutâneo de alergia', categoria: 'medico' },
  { de: 'Bluttest IgE', pt: 'análise ao sangue (anticorpos IgE)', categoria: 'medico' },
  { de: 'Antihistaminikum', pt: 'anti-histamínico', categoria: 'medico' },
  { de: 'Kortison-Nasenspray', pt: 'spray nasal com corticoide', categoria: 'medico' },
  { de: 'Augentropfen', pt: 'colírio', categoria: 'medico' },
  { de: 'Inhalator', pt: 'inalador', categoria: 'medico' },
  { de: 'Notfallset', pt: 'kit de emergência', categoria: 'medico' },
  { de: 'Adrenalin-Autoinjektor', pt: 'caneta de adrenalina', categoria: 'medico' },
  { de: 'Nebenwirkungen', pt: 'efeitos secundários', categoria: 'medico' },
  { de: 'rezeptpflichtig', pt: 'só com receita', categoria: 'medico' },
  { de: 'Niesen', pt: 'espirros', categoria: 'medico' },
  { de: 'Fliessschnupfen', pt: 'nariz a pingar', categoria: 'medico' },
  { de: 'verstopfte Nase', pt: 'nariz entupido', categoria: 'medico' },
  { de: 'Juckreiz', pt: 'comichão', categoria: 'medico' },
  { de: 'tränende Augen', pt: 'olhos lacrimejantes', categoria: 'medico' },
  { de: 'Bindehautentzündung', pt: 'conjuntivite', categoria: 'medico' },
  { de: 'Asthma', pt: 'asma', categoria: 'medico' },
  { de: 'Atemnot', pt: 'falta de ar', categoria: 'medico' },
  { de: 'Husten', pt: 'tosse', categoria: 'medico' }
];

// ── Pesquisa tolerante (fonética) + Levenshtein ─────────────────────
function polNormalizarTermo(s) {
  var t = (s || '').toLowerCase();
  t = t.replace(/([aeiouäöü])h/g, '$1'); // h mudo após vogal
  t = t.replace(/äu/g, 'oi').replace(/eu/g, 'oi');
  t = t.replace(/ei/g, 'ai');
  t = t.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
  t = t.normalize ? t.normalize('NFD').replace(/[̀-ͯ]/g, '') : t;
  t = t.replace(/sch/g, 'x');
  t = t.replace(/tz/g, 'ts').replace(/z/g, 'ts');
  t = t.replace(/v/g, 'f');
  t = t.replace(/w/g, 'v');
  t = t.replace(/ck/g, 'k');
  t = t.replace(/[^a-z0-9]/g, '');
  return t;
}
function polLevenshtein(a, b) {
  var m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  var d = [];
  for (var i = 0; i <= m; i++) { d.push([i]); }
  for (var j = 0; j <= n; j++) { d[0][j] = j; }
  for (var i2 = 1; i2 <= m; i2++) {
    for (var j2 = 1; j2 <= n; j2++) {
      var custo = a[i2 - 1] === b[j2 - 1] ? 0 : 1;
      d[i2][j2] = Math.min(d[i2 - 1][j2] + 1, d[i2][j2 - 1] + 1, d[i2 - 1][j2 - 1] + custo);
    }
  }
  return d[m][n];
}
function polTermoCorresponde(campo, queryNorm) {
  if (!queryNorm) return true;
  var campoNorm = polNormalizarTermo(campo);
  if (campoNorm.indexOf(queryNorm) !== -1) return true;
  return polLevenshtein(campoNorm, queryNorm) <= 2;
}

// ── Geo ──────────────────────────────────────────────────────────
function polHaversine(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function polEstacaoMaisProxima(estacoes, lat, lon) {
  if (!estacoes || !estacoes.length) return null;
  var melhor = null, melhorDist = Infinity;
  estacoes.forEach(function (e) {
    var d = polHaversine(lat, lon, e.lat, e.lon);
    if (d < melhorDist) { melhorDist = d; melhor = e; }
  });
  return melhor ? { estacao: melhor, distanciaKm: melhorDist } : null;
}

// ── Datas ────────────────────────────────────────────────────────
function polHojeIso() { var n = new Date(); return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate())).toISOString().slice(0, 10); }
function polIsoHaDias(n) { var d = new Date(); d.setUTCDate(d.getUTCDate() - n); return d.toISOString(); }
function polFmtHora(iso) {
  if (!iso) return '—';
  var d = new Date(iso);
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
function polFmtDataCurta(dateStr) {
  var p = dateStr.split('-');
  return p[2] + '.' + p[1] + '.';
}
// "YYYY-MM-DDTHH:00" na hora local de Zurique — mesmo formato do
// hourly.time devolvido pela Open-Meteo (pedido com timezone=Europe/Zurich),
// para encontrar o índice da hora atual nesse array.
function polHoraAtualZurich() {
  var partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false
  }).formatToParts(new Date());
  var obj = {};
  partes.forEach(function (p) { obj[p.type] = p.value; });
  var hora = obj.hour === '24' ? '00' : obj.hour;
  return obj.year + '-' + obj.month + '-' + obj.day + 'T' + hora + ':00';
}
// Valor da Open-Meteo para a hora atual (fallback do ecrã Hoje quando não
// há medição real da estação) — null se não houver previsão carregada ou
// se este tipo de pólen não tiver variável na Open-Meteo (omVar null).
function polValorHoraAtual(previsao, omVar) {
  if (!previsao || !previsao.hourly || !previsao.hourly.time || !omVar) return null;
  var arr = previsao.hourly[omVar];
  if (!arr) return null;
  var idx = previsao.hourly.time.indexOf(polHoraAtualZurich());
  if (idx === -1) return null;
  var v = arr[idx];
  return v == null ? null : v;
}
// Medição da estação ainda válida para mostrar como "medido" no ecrã Hoje
// — só se tiver menos de 6h (senão é dada como não-medida e cai-se para a
// previsão da Open-Meteo).
var POL_MEDICAO_VALIDA_MS = 6 * 60 * 60 * 1000;
function polMedicaoRecente(m) {
  if (!m) return false;
  var idade = Date.now() - new Date(m.ts).getTime();
  return idade >= 0 && idade <= POL_MEDICAO_VALIDA_MS;
}

// ── Voz (ler o termo alemão) ─────────────────────────────────────
function polFalarAlemao(texto) {
  if (!window.speechSynthesis) return;
  try {
    var utter = new SpeechSynthesisUtterance(texto);
    var vozes = window.speechSynthesis.getVoices() || [];
    var voz = vozes.filter(function (v) { return v.lang === 'de-CH'; })[0] ||
      vozes.filter(function (v) { return v.lang === 'de-DE'; })[0] ||
      vozes.filter(function (v) { return /^de/i.test(v.lang); })[0];
    utter.lang = voz ? voz.lang : 'de-DE';
    if (voz) utter.voice = voz;
    window.speechSynthesis.speak(utter);
  } catch (e) { console.error('[pollen] speechSynthesis:', e); }
}

// ── Design ───────────────────────────────────────────────────────
function polTemaEscuro() { return T.bg === T_DARK.bg; }
var POL_CSS = '' +
  '.pol-app{--pol-fundo:#F8FAFC;--pol-cartao:#FFFFFF;--pol-borda:#E2E8F0;--pol-texto:#0F172A;--pol-texto2:#475569;' +
  '--pol-verde:#0E8A45;--pol-verde-texto:#FFFFFF;--pol-amarelo:#B8860B;' +
  'background:var(--pol-fundo);color:var(--pol-texto);min-height:100vh;padding-bottom:40px;' +
  'font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
  '.pol-app.pol-dark{--pol-fundo:#0B1220;--pol-cartao:#111A2E;--pol-borda:#1E293B;--pol-texto:#E2E8F0;--pol-texto2:#94A3B8;' +
  '--pol-verde:#12A150;--pol-verde-texto:#04140B;--pol-amarelo:#FFD21F}' +
  '.pol-card{background:var(--pol-cartao);border-radius:16px;border:1px solid var(--pol-borda);padding:14px}' +
  '.pol-chip{background:var(--pol-cartao);border:1px solid var(--pol-borda);color:var(--pol-texto2);border-radius:20px;padding:7px 14px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap}' +
  '.pol-chip.pol-chip-ativo{background:var(--pol-verde);color:var(--pol-verde-texto);border-color:var(--pol-verde)}' +
  '.pol-tab{flex:1;background:var(--pol-cartao);color:var(--pol-texto);border:1px solid var(--pol-borda);border-radius:10px;padding:9px 0;font-weight:800;font-size:12px;cursor:pointer}' +
  '.pol-tab.pol-tab-ativo{background:var(--pol-verde);color:var(--pol-verde-texto);border-color:var(--pol-verde)}' +
  '.pol-nivel-pill{display:inline-flex;align-items:center;border-radius:20px;padding:3px 10px;font-size:12px;font-weight:800;white-space:nowrap}' +
  '.pol-input{width:100%;box-sizing:border-box;background:var(--pol-cartao);border:1px solid var(--pol-borda);color:var(--pol-texto);border-radius:10px;padding:10px 12px;font-size:14px}' +
  '.pol-btn{background:var(--pol-cartao);color:var(--pol-texto);border:1px solid var(--pol-borda);border-radius:10px;padding:10px 14px;font-size:13px;font-weight:700;cursor:pointer}' +
  '.pol-btn-ativo{background:var(--pol-verde);color:var(--pol-verde-texto);border-color:var(--pol-verde)}' +
  '.pol-sintoma-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 4px;border-radius:12px;border:1px solid var(--pol-borda);background:var(--pol-cartao);color:var(--pol-texto);cursor:pointer;font-weight:700;font-size:12px}' +
  '.pol-sintoma-btn.pol-sintoma-ativo{background:var(--pol-amarelo);color:#231a00;border-color:var(--pol-amarelo)}';

// ── Pequenas peças ──────────────────────────────────────────────
function PolCard(p) { return React.createElement('div', { className: 'pol-card', style: p.style }, p.children); }
// 3 estados, decididos pelo valor em si (não só pelo nível já calculado):
// valor null/undefined -> sem qualquer medição/previsão disponível (não
// confundir com valor 0, que É um dado real: fora de época). valor > 0
// mostra o nível com cor; com mostrarValor:true acrescenta o número
// arredondado a 1 casa (ex.: "Fraco · 4.2").
function PolNivelPill(p) {
  var cinzento = { background: 'var(--pol-borda)', color: 'var(--pol-texto2)' };
  if (p.valor == null) return React.createElement('span', { className: 'pol-nivel-pill', style: cinzento }, '⚠︎ Sem dados');
  if (p.valor <= 0) return React.createElement('span', { className: 'pol-nivel-pill', style: cinzento }, 'Fora de época');
  var info = p.nivel ? POL_NIVEL_INFO[p.nivel] : null;
  if (!info) return React.createElement('span', { className: 'pol-nivel-pill', style: cinzento }, '—');
  var texto = info.label + (p.mostrarValor ? ' · ' + (Math.round(p.valor * 10) / 10) : '');
  var corTexto = (p.nivel === 'moderado' || p.nivel === 'vestigios') ? '#231a00' : '#fff';
  return React.createElement('span', { className: 'pol-nivel-pill', style: { background: info.cor, color: corTexto } }, texto);
}
function PolTipoNome(p) {
  return React.createElement('span', null, p.tipo.de, ' · ', p.tipo.pt);
}

// ── Componente principal ───────────────────────────────────────────
function PollenApp(props) {
  var onBack = props.onBack, profile = props.profile;
  var db = window.supabaseClient;

  var _s1 = React.useState(true); var loading = _s1[0], setLoading = _s1[1];
  var _s2 = React.useState(null); var erro = _s2[0], setErro = _s2[1];
  var _s3 = React.useState('hoje'); var tab = _s3[0], setTab = _s3[1]; // hoje|previsao|diario|dicionario|definicoes

  var _s4 = React.useState([]); var perfis = _s4[0], setPerfis = _s4[1];
  var _s5 = React.useState(null); var perfilAtivoId = _s5[0], setPerfilAtivoId = _s5[1];
  var _s6 = React.useState([]); var estacoes = _s6[0], setEstacoes = _s6[1];
  var _s7 = React.useState([]); var medicoesHoje = _s7[0], setMedicoesHoje = _s7[1];
  var _s8 = React.useState(false); var outrosAbertos = _s8[0], setOutrosAbertos = _s8[1];

  var _s9 = React.useState(null); var previsao = _s9[0], setPrevisao = _s9[1];
  var _s10 = React.useState(null); var previsaoErro = _s10[0], setPrevisaoErro = _s10[1];

  var _s11 = React.useState([]); var diario = _s11[0], setDiario = _s11[1];
  var _s12 = React.useState(null); var diarioEditandoId = _s12[0], setDiarioEditandoId = _s12[1];
  var _s13 = React.useState(polHojeIso()); var fData = _s13[0], setFData = _s13[1];
  var _s14 = React.useState(0); var fSintomas = _s14[0], setFSintomas = _s14[1];
  var _s15 = React.useState(''); var fMedicamento = _s15[0], setFMedicamento = _s15[1];
  var _s16 = React.useState(''); var fNota = _s16[0], setFNota = _s16[1];
  var _s17 = React.useState(false); var diarioSaving = _s17[0], setDiarioSaving = _s17[1];
  var _s18 = React.useState([]); var medicoesHistorico = _s18[0], setMedicoesHistorico = _s18[1];

  var _s19 = React.useState(''); var dicQuery = _s19[0], setDicQuery = _s19[1];
  var _s20 = React.useState([]); var termosPessoais = _s20[0], setTermosPessoais = _s20[1];
  var _s21 = React.useState(false); var novoTermoAberto = _s21[0], setNovoTermoAberto = _s21[1];
  var _s22 = React.useState(''); var ntDe = _s22[0], setNtDe = _s22[1];
  var _s23 = React.useState(''); var ntPt = _s23[0], setNtPt = _s23[1];
  var _s24 = React.useState(''); var ntExp = _s24[0], setNtExp = _s24[1];
  var _s25 = React.useState(null); var ntEditandoId = _s25[0], setNtEditandoId = _s25[1];

  var _s26 = React.useState(false); var perfilEditorAberto = _s26[0], setPerfilEditorAberto = _s26[1];
  var _s27 = React.useState(null); var perfilEditandoId = _s27[0], setPerfilEditandoId = _s27[1];
  var _s28 = React.useState(''); var pfNome = _s28[0], setPfNome = _s28[1];
  var _s29 = React.useState([]); var pfAlergias = _s29[0], setPfAlergias = _s29[1];
  var _s30 = React.useState(null); var pfLocal = _s30[0], setPfLocal = _s30[1]; // { kanton, cidade, lat, lon }
  var _s31 = React.useState(true); var pfNotificar = _s31[0], setPfNotificar = _s31[1];
  var _s32 = React.useState(''); var pfPesquisaCidade = _s32[0], setPfPesquisaCidade = _s32[1];
  var _s33 = React.useState([]); var pfResultadosPesquisa = _s33[0], setPfResultadosPesquisa = _s33[1];
  var _s34 = React.useState(false); var perfilSaving = _s34[0], setPerfilSaving = _s34[1];
  var _s35 = React.useState(null); var confirmApagarPerfil = _s35[0], setConfirmApagarPerfil = _s35[1];
  var _s36 = React.useState(null); var confirmApagarDiario = _s36[0], setConfirmApagarDiario = _s36[1];
  var _s37 = React.useState([]); var pessoasPollen = _s37[0], setPessoasPollen = _s37[1];
  var _s38 = React.useState([]); var pfAvisarIds = _s38[0], setPfAvisarIds = _s38[1];

  function carregar() {
    if (!db) { setLoading(false); setErro('Sem ligação à base de dados.'); return; }
    setLoading(true);
    Promise.all([
      db.from('pollen_perfis').select('*').order('created_at', { ascending: true }),
      db.from('pollen_termos').select('*').order('created_at', { ascending: true }),
      db.from('pollen_estacoes').select('*'),
      db.from('profiles').select('id, display_name, email, is_admin, allowed_apps, disabled')
    ]).then(function (res) {
      var perfisRes = res[0], termosRes = res[1], estacoesRes = res[2], profilesRes = res[3];
      if (perfisRes.error) { setErro('Falha ao carregar perfis: ' + perfisRes.error.message); setLoading(false); window.mostrarErro('Pólen', perfisRes.error); return; }
      if (termosRes.error) { console.error('[pollen] carregar termos:', termosRes.error); window.mostrarErro('Pólen', termosRes.error); }
      if (estacoesRes.error) { console.error('[pollen] carregar estações:', estacoesRes.error); window.mostrarErro('Pólen', estacoesRes.error); }
      if (profilesRes.error) { console.error('[pollen] carregar pessoas:', profilesRes.error); window.mostrarErro('Pólen', profilesRes.error); }
      var novosPerfis = perfisRes.data || [];
      setPerfis(novosPerfis);
      setTermosPessoais(termosRes.data || []);
      setEstacoes(estacoesRes.data || []);
      setPessoasPollen((profilesRes.data || []).filter(function (p) {
        return !p.disabled && (p.is_admin || (p.allowed_apps || []).indexOf('pollen') !== -1);
      }).map(function (p) {
        return { id: p.id, nome: p.display_name || p.email || 'Utilizador' };
      }));
      setPerfilAtivoId(function (atual) {
        if (atual && novosPerfis.some(function (p) { return p.id === atual; })) return atual;
        return novosPerfis.length ? novosPerfis[0].id : null;
      });
      setErro(null);
      setLoading(false);
    }).catch(function (e) {
      console.error('[pollen] carregar:', e);
      setErro('Falha ao carregar: ' + (e && e.message ? e.message : e));
      setLoading(false);
      window.mostrarErro('Pólen', e);
    });
  }
  React.useEffect(function () { carregar(); }, []);
  React.useEffect(function () { return window.csAoVoltarRede(function () { carregar(); }); }, []);
  React.useEffect(function () { if (window.__cs_admin) polAutoteste(); }, []);

  var perfilAtivo = perfis.filter(function (p) { return p.id === perfilAtivoId; })[0] || null;
  var estacaoInfo = perfilAtivo ? polEstacaoMaisProxima(estacoes, perfilAtivo.lat, perfilAtivo.lon) : null;

  // ── Medições recentes (últimas 48h, só a estação escolhida) ──
  React.useEffect(function () {
    if (!db || !estacaoInfo) { setMedicoesHoje([]); return; }
    db.from('pollen_medicoes').select('*').eq('estacao', estacaoInfo.estacao.codigo).gte('ts', polIsoHaDias(2)).order('ts', { ascending: false }).then(function (res) {
      if (res.error) { console.error('[pollen] medições recentes:', res.error); window.mostrarErro('Pólen', res.error); return; }
      setMedicoesHoje(res.data || []);
    }).catch(function (e) { console.error('[pollen] medições recentes:', e); window.mostrarErro('Pólen', e); });
  }, [estacaoInfo && estacaoInfo.estacao.codigo]);

  // Último valor por tipo (a medição mais recente dentro das 48h)
  var ultimoPorTipo = {};
  medicoesHoje.forEach(function (m) {
    if (!ultimoPorTipo[m.tipo] || m.ts > ultimoPorTipo[m.tipo].ts) ultimoPorTipo[m.tipo] = m;
  });
  var horaUltimaMedicao = medicoesHoje.length ? medicoesHoje[0].ts : null;

  // ── Previsão Open-Meteo (chamada direta do browser) ──
  React.useEffect(function () {
    if (!perfilAtivo) { setPrevisao(null); return; }
    setPrevisaoErro(null);
    var vars = POL_TIPOS.filter(function (t) { return t.omVar; }).map(function (t) { return t.omVar; }).join(',');
    var url = 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=' + perfilAtivo.lat + '&longitude=' + perfilAtivo.lon +
      '&hourly=' + vars + '&timezone=Europe%2FZurich&forecast_days=4';
    fetch(url).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (data) {
      setPrevisao(data);
    }).catch(function (e) {
      console.error('[pollen] previsão Open-Meteo:', e);
      setPrevisaoErro('Não foi possível obter a previsão agora.');
      window.mostrarErro('Pólen', e);
    });
  }, [perfilAtivo && perfilAtivo.id]);

  // Agrupa a previsão horária em máximos diários por tipo
  var previsaoDias = React.useMemo(function () {
    if (!previsao || !previsao.hourly || !previsao.hourly.time) return [];
    var porDia = {}; // { 'YYYY-MM-DD': { tipoId: max } }
    var ordemDias = [];
    previsao.hourly.time.forEach(function (tsStr, i) {
      var dia = tsStr.slice(0, 10);
      if (!porDia[dia]) { porDia[dia] = {}; ordemDias.push(dia); }
      POL_TIPOS.forEach(function (t) {
        if (!t.omVar) return;
        var arr = previsao.hourly[t.omVar];
        if (!arr) return;
        var v = arr[i];
        if (v == null) return;
        if (porDia[dia][t.id] == null || v > porDia[dia][t.id]) porDia[dia][t.id] = v;
      });
    });
    return ordemDias.slice(0, 4).map(function (d) { return { data: d, valores: porDia[d] }; });
  }, [previsao]);

  // ── Diário (últimos 30 dias) + histórico de medições p/ gráfico ──
  React.useEffect(function () {
    if (!db || !perfilAtivo) { setDiario([]); setMedicoesHistorico([]); return; }
    db.from('pollen_diario').select('*').eq('perfil_id', perfilAtivo.id).gte('data', polIsoHaDias(30).slice(0, 10)).order('data', { ascending: false }).then(function (res) {
      if (res.error) { console.error('[pollen] carregar diário:', res.error); window.mostrarErro('Pólen', res.error); return; }
      setDiario(res.data || []);
    }).catch(function (e) { console.error('[pollen] carregar diário:', e); window.mostrarErro('Pólen', e); });
    if (estacaoInfo && perfilAtivo.alergias && perfilAtivo.alergias.length) {
      db.from('pollen_medicoes').select('*').eq('estacao', estacaoInfo.estacao.codigo).in('tipo', perfilAtivo.alergias).gte('ts', polIsoHaDias(30)).order('ts', { ascending: true }).then(function (res) {
        if (res.error) { console.error('[pollen] histórico de medições:', res.error); window.mostrarErro('Pólen', res.error); return; }
        setMedicoesHistorico(res.data || []);
      }).catch(function (e) { console.error('[pollen] histórico de medições:', e); window.mostrarErro('Pólen', e); });
    } else {
      setMedicoesHistorico([]);
    }
  }, [perfilAtivo && perfilAtivo.id, estacaoInfo && estacaoInfo.estacao.codigo]);

  // pólen máximo (dentro das alergias do perfil) por dia, últimos 30 dias
  var polenMaxPorDia = React.useMemo(function () {
    var out = {};
    medicoesHistorico.forEach(function (m) {
      var dia = m.ts.slice(0, 10);
      if (out[dia] == null || m.valor > out[dia]) out[dia] = m.valor;
    });
    return out;
  }, [medicoesHistorico]);

  // ── Ações: Perfis ──────────────────────────────────────────────
  function abrirNovoPerfil() {
    setPerfilEditandoId(null); setPfNome(''); setPfAlergias([]); setPfLocal(null); setPfNotificar(true);
    setPfAvisarIds(profile && profile.id ? [profile.id] : []);
    setPfPesquisaCidade(''); setPfResultadosPesquisa([]);
    setPerfilEditorAberto(true);
  }
  function abrirEditarPerfil(p) {
    setPerfilEditandoId(p.id); setPfNome(p.nome); setPfAlergias(p.alergias || []);
    setPfLocal({ kanton: p.kanton, cidade: p.cidade, lat: p.lat, lon: p.lon });
    setPfNotificar(p.notificar !== false);
    setPfAvisarIds((p.avisar_ids && p.avisar_ids.length) ? p.avisar_ids : (p.profile_id ? [p.profile_id] : []));
    setPfPesquisaCidade(''); setPfResultadosPesquisa([]);
    setPerfilEditorAberto(true);
  }
  function toggleAlergiaPerfil(tipoId) {
    setPfAlergias(function (atual) {
      return atual.indexOf(tipoId) !== -1 ? atual.filter(function (t) { return t !== tipoId; }) : atual.concat([tipoId]);
    });
  }
  function toggleAvisarPerfil(profileId) {
    setPfAvisarIds(function (atual) {
      return atual.indexOf(profileId) !== -1 ? atual.filter(function (id) { return id !== profileId; }) : atual.concat([profileId]);
    });
  }
  function pesquisarCidade() {
    if (!pfPesquisaCidade.trim()) { setPfResultadosPesquisa([]); return; }
    var url = 'https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(pfPesquisaCidade.trim()) + '&country_code=CH&language=de';
    fetch(url).then(function (r) { return r.json(); }).then(function (data) {
      setPfResultadosPesquisa((data && data.results) || []);
    }).catch(function (e) {
      console.error('[pollen] pesquisa de cidade:', e);
      window.mostrarErro('Pólen', e);
    });
  }
  function guardarPerfil() {
    if (!pfNome.trim() || !pfLocal) { setErro('Indica o nome e a localização do perfil.'); return; }
    setPerfilSaving(true);
    var payload = { nome: pfNome.trim(), alergias: pfAlergias, kanton: pfLocal.kanton || null, cidade: pfLocal.cidade, lat: pfLocal.lat, lon: pfLocal.lon, notificar: pfNotificar, avisar_ids: pfAvisarIds };
    var query = perfilEditandoId
      ? db.from('pollen_perfis').update(payload).eq('id', perfilEditandoId).select()
      : db.from('pollen_perfis').insert(Object.assign({ profile_id: profile.id }, payload)).select();
    query.then(function (res) {
      setPerfilSaving(false);
      if (res.error) { setErro('Falha ao guardar perfil: ' + res.error.message); window.mostrarErro('Pólen', res.error); return; }
      setPerfilEditorAberto(false);
      carregar();
    }).catch(function (e) {
      setPerfilSaving(false);
      console.error('[pollen] guardar perfil:', e);
      setErro('Falha ao guardar perfil.');
      window.mostrarErro('Pólen', e);
    });
  }
  function apagarPerfil(id) {
    db.from('pollen_perfis').delete().eq('id', id).then(function (res) {
      if (res.error) { setErro('Falha ao apagar perfil: ' + res.error.message); window.mostrarErro('Pólen', res.error); return; }
      setConfirmApagarPerfil(null);
      carregar();
    }).catch(function (e) {
      console.error('[pollen] apagar perfil:', e);
      setErro('Falha ao apagar perfil.');
      window.mostrarErro('Pólen', e);
    });
  }

  // ── Ações: Diário ──────────────────────────────────────────────
  function iniciarNovoRegisto() {
    setDiarioEditandoId(null); setFData(polHojeIso()); setFSintomas(0); setFMedicamento(''); setFNota('');
  }
  function editarRegisto(r) {
    setDiarioEditandoId(r.id); setFData(r.data); setFSintomas(r.sintomas); setFMedicamento(r.medicamento || ''); setFNota(r.nota || '');
  }
  function guardarDiario() {
    if (!perfilAtivo) return;
    setDiarioSaving(true);
    db.from('pollen_diario').upsert({ perfil_id: perfilAtivo.id, data: fData, sintomas: fSintomas, medicamento: fMedicamento || null, nota: fNota || null }, { onConflict: 'perfil_id,data' }).select().then(function (res) {
      setDiarioSaving(false);
      if (res.error) { setErro('Falha ao guardar registo: ' + res.error.message); window.mostrarErro('Pólen', res.error); return; }
      iniciarNovoRegisto();
      db.from('pollen_diario').select('*').eq('perfil_id', perfilAtivo.id).gte('data', polIsoHaDias(30).slice(0, 10)).order('data', { ascending: false }).then(function (res2) {
        if (res2.error) { console.error('[pollen] recarregar diário:', res2.error); window.mostrarErro('Pólen', res2.error); return; }
        setDiario(res2.data || []);
      }).catch(function (e) { console.error('[pollen] recarregar diário:', e); window.mostrarErro('Pólen', e); });
    }).catch(function (e) {
      setDiarioSaving(false);
      console.error('[pollen] guardar diário:', e);
      setErro('Falha ao guardar registo.');
      window.mostrarErro('Pólen', e);
    });
  }
  function apagarDiario(id) {
    db.from('pollen_diario').delete().eq('id', id).then(function (res) {
      if (res.error) { setErro('Falha ao apagar registo: ' + res.error.message); window.mostrarErro('Pólen', res.error); return; }
      setConfirmApagarDiario(null);
      setDiario(function (atual) { return atual.filter(function (d) { return d.id !== id; }); });
    }).catch(function (e) {
      console.error('[pollen] apagar diário:', e);
      setErro('Falha ao apagar registo.');
      window.mostrarErro('Pólen', e);
    });
  }

  // ── Ações: Termos pessoais ─────────────────────────────────────
  function iniciarNovoTermo() { setNtEditandoId(null); setNtDe(''); setNtPt(''); setNtExp(''); setNovoTermoAberto(true); }
  function editarTermo(t) { setNtEditandoId(t.id); setNtDe(t.de); setNtPt(t.pt); setNtExp(t.explicacao || ''); setNovoTermoAberto(true); }
  function guardarTermo() {
    if (!ntDe.trim() || !ntPt.trim()) return;
    var payload = { de: ntDe.trim(), pt: ntPt.trim(), explicacao: ntExp.trim() || null, categoria: 'polen' };
    var query = ntEditandoId
      ? db.from('pollen_termos').update(payload).eq('id', ntEditandoId).select()
      : db.from('pollen_termos').insert(Object.assign({ profile_id: profile.id }, payload)).select();
    query.then(function (res) {
      if (res.error) { setErro('Falha ao guardar termo: ' + res.error.message); window.mostrarErro('Pólen', res.error); return; }
      setNovoTermoAberto(false);
      db.from('pollen_termos').select('*').order('created_at', { ascending: true }).then(function (res2) {
        if (res2.error) { console.error('[pollen] recarregar termos:', res2.error); window.mostrarErro('Pólen', res2.error); return; }
        setTermosPessoais(res2.data || []);
      }).catch(function (e) { console.error('[pollen] recarregar termos:', e); window.mostrarErro('Pólen', e); });
    }).catch(function (e) {
      console.error('[pollen] guardar termo:', e);
      setErro('Falha ao guardar termo.');
      window.mostrarErro('Pólen', e);
    });
  }
  function apagarTermo(id) {
    db.from('pollen_termos').delete().eq('id', id).then(function (res) {
      if (res.error) { setErro('Falha ao apagar termo: ' + res.error.message); window.mostrarErro('Pólen', res.error); return; }
      setTermosPessoais(function (atual) { return atual.filter(function (t) { return t.id !== id; }); });
    }).catch(function (e) {
      console.error('[pollen] apagar termo:', e);
      setErro('Falha ao apagar termo.');
      window.mostrarErro('Pólen', e);
    });
  }

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  var appClass = 'pol-app' + (polTemaEscuro() ? ' pol-dark' : '');

  if (loading) {
    return React.createElement('div', { className: appClass },
      React.createElement('style', null, POL_CSS),
      React.createElement('div', { style: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pol-texto2)' } }, 'A carregar…')
    );
  }

  var header = React.createElement('div', { style: { background: 'var(--pol-cartao)', padding: '12px 16px', borderBottom: '1px solid var(--pol-borda)', display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, zIndex: 20 } },
    React.createElement('button', { onClick: onBack, style: { background: 'var(--pol-fundo)', border: '1px solid var(--pol-borda)', color: 'var(--pol-texto2)', borderRadius: 10, width: 40, height: 40, cursor: 'pointer', fontSize: 16, flex: 'none' } }, '←'),
    pollenIconSvg(30),
    React.createElement('div', { style: { flex: 1, minWidth: 0 } },
      React.createElement('div', { style: { fontWeight: 800, fontSize: 16, color: 'var(--pol-texto)' } }, 'Pólen'),
      React.createElement('div', { style: { fontSize: 11, color: 'var(--pol-texto2)', marginTop: 1 } }, perfilAtivo ? (perfilAtivo.cidade) : 'Sem perfil')
    ),
    React.createElement('button', { onClick: function () { setTab('definicoes'); }, style: { background: 'none', border: 'none', color: 'var(--pol-texto2)', fontSize: 20, cursor: 'pointer', flex: 'none' } }, '⚙️')
  );

  var tabs = tab !== 'definicoes' && React.createElement('div', { style: { display: 'flex', gap: 6, padding: '10px 16px 0' } },
    [['hoje', 'Hoje'], ['previsao', 'Previsão'], ['diario', 'Diário'], ['dicionario', 'Dicionário']].map(function (t) {
      return React.createElement('button', { key: t[0], className: 'pol-tab' + (tab === t[0] ? ' pol-tab-ativo' : ''), onClick: function () { setTab(t[0]); } }, t[1]);
    })
  );

  var chipsPerfil = perfis.length > 1 && tab !== 'definicoes' && React.createElement('div', { style: { display: 'flex', gap: 6, padding: '10px 16px 0', overflowX: 'auto' } },
    perfis.map(function (p) {
      return React.createElement('button', { key: p.id, className: 'pol-chip' + (p.id === perfilAtivoId ? ' pol-chip-ativo' : ''), onClick: function () { setPerfilAtivoId(p.id); } }, p.nome);
    })
  );

  function renderSemPerfil() {
    return React.createElement('div', { style: { padding: 16 } },
      React.createElement(PolCard, { style: { textAlign: 'center', padding: 24 } },
        React.createElement('p', { style: { fontSize: 14, color: 'var(--pol-texto2)', marginBottom: 16 } }, 'Ainda não há nenhum perfil de alergias.'),
        React.createElement('button', { className: 'pol-btn pol-btn-ativo', style: { width: '100%', padding: '14px 0', fontSize: 14 }, onClick: abrirNovoPerfil }, '🌼 Criar primeiro perfil')
      )
    );
  }

  function renderHoje() {
    if (!perfilAtivo) return renderSemPerfil();
    var alergiaIds = perfilAtivo.alergias || [];
    var tiposAlergia = POL_TIPOS.filter(function (t) { return alergiaIds.indexOf(t.id) !== -1; });
    var outrosTipos = POL_TIPOS.filter(function (t) { return alergiaIds.indexOf(t.id) === -1; });
    function linhaTipo(t) {
      var m = ultimoPorTipo[t.id];
      var medicaoValida = polMedicaoRecente(m);
      var valor, fonteLabel;
      if (medicaoValida) {
        valor = m.valor;
        fonteLabel = 'medido · ' + estacaoInfo.estacao.nome + ' ' + polFmtHora(m.ts);
      } else {
        valor = polValorHoraAtual(previsao, t.omVar);
        fonteLabel = valor != null ? 'previsão' : null;
      }
      var nivel = polClassificarNivel(t.id, valor);
      return React.createElement('div', { key: t.id, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid var(--pol-borda)' } },
        React.createElement('div', null,
          React.createElement(PolTipoNome, { tipo: t }),
          fonteLabel && React.createElement('div', { style: { fontSize: 10, color: 'var(--pol-texto2)', marginTop: 1 } }, fonteLabel)
        ),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          valor != null && React.createElement('span', { style: { fontSize: 12, color: 'var(--pol-texto2)' } }, Math.round(valor) + ' /m³'),
          React.createElement(PolNivelPill, { valor: valor, nivel: nivel })
        )
      );
    }
    return React.createElement('div', { style: { padding: 16, display: 'flex', flexDirection: 'column', gap: 12 } },
      React.createElement(PolCard, null,
        React.createElement('div', { style: { fontWeight: 800, fontSize: 15, marginBottom: 4 } }, perfilAtivo.cidade + (perfilAtivo.kanton ? ' · ' + perfilAtivo.kanton : '')),
        estacaoInfo
          ? React.createElement('div', { style: { fontSize: 12, color: 'var(--pol-texto2)' } },
              'Estação mais próxima: ' + estacaoInfo.estacao.nome + ' (' + estacaoInfo.distanciaKm.toFixed(1) + ' km)' +
              (horaUltimaMedicao ? ' · última medição às ' + polFmtHora(horaUltimaMedicao) : ' · sem medições ainda')
            )
          : React.createElement('div', { style: { fontSize: 12, color: 'var(--pol-texto2)' } }, 'Estações ainda não carregadas.')
      ),
      React.createElement(PolCard, null,
        React.createElement('div', { style: { fontWeight: 800, fontSize: 13, marginBottom: 4, textTransform: 'uppercase', color: 'var(--pol-texto2)' } }, 'Os teus pólens'),
        tiposAlergia.length ? tiposAlergia.map(linhaTipo) : React.createElement('p', { style: { fontSize: 13, color: 'var(--pol-texto2)' } }, 'Este perfil ainda não tem alergias escolhidas.')
      ),
      React.createElement('div', null,
        React.createElement('button', { className: 'pol-btn', style: { width: '100%' }, onClick: function () { setOutrosAbertos(!outrosAbertos); } }, (outrosAbertos ? '▾' : '▸') + ' Outros pólens'),
        outrosAbertos && React.createElement(PolCard, { style: { marginTop: 8 } }, outrosTipos.map(linhaTipo))
      )
    );
  }

  function renderPrevisao() {
    if (!perfilAtivo) return renderSemPerfil();
    return React.createElement('div', { style: { padding: 16 } },
      previsaoErro && React.createElement(PolCard, { style: { marginBottom: 12 } }, React.createElement('p', { style: { color: '#DC2626', fontSize: 13 } }, '⚠️ ' + previsaoErro)),
      React.createElement(PolCard, { style: { overflowX: 'auto', padding: 0 } },
        React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 12 } },
          React.createElement('thead', null,
            React.createElement('tr', null,
              React.createElement('th', { style: { textAlign: 'left', padding: '10px 12px', color: 'var(--pol-texto2)' } }, 'Pólen'),
              previsaoDias.map(function (d) { return React.createElement('th', { key: d.data, style: { padding: '10px 6px', color: 'var(--pol-texto2)', fontSize: 11 } }, polFmtDataCurta(d.data)); })
            )
          ),
          React.createElement('tbody', null,
            POL_TIPOS.map(function (t) {
              return React.createElement('tr', { key: t.id, style: { borderTop: '1px solid var(--pol-borda)' } },
                React.createElement('td', { style: { padding: '8px 12px', fontWeight: 700 } }, React.createElement(PolTipoNome, { tipo: t })),
                t.omVar
                  ? previsaoDias.map(function (d) {
                      var v = d.valores[t.id];
                      var nivel = polClassificarNivel(t.id, v);
                      return React.createElement('td', { key: d.data, style: { padding: '6px', textAlign: 'center' } }, React.createElement(PolNivelPill, { valor: v, nivel: nivel, mostrarValor: true }));
                    })
                  : previsaoDias.map(function (d) {
                      return React.createElement('td', { key: d.data, style: { padding: '6px', textAlign: 'center', color: 'var(--pol-texto2)' } }, '—');
                    })
              );
            }),
            !previsaoDias.length && React.createElement('tr', null, React.createElement('td', { colSpan: 5, style: { padding: 16, color: 'var(--pol-texto2)', fontSize: 13 } }, 'A carregar previsão…'))
          )
        )
      ),
      React.createElement('p', { style: { fontSize: 11, color: 'var(--pol-texto2)', marginTop: 10 } }, 'Hasel, Esche, Buche e Eiche não têm previsão — só medição real na aba Hoje.')
    );
  }

  function renderDiarioGrafico() {
    var dias = [];
    for (var i = 29; i >= 0; i--) { var d = new Date(); d.setUTCDate(d.getUTCDate() - i); dias.push(d.toISOString().slice(0, 10)); }
    var diarioPorData = {};
    diario.forEach(function (r) { diarioPorData[r.data] = r; });
    var maxPolen = Math.max.apply(Math, dias.map(function (d) { return polenMaxPorDia[d] || 0; }).concat([1]));
    return React.createElement(PolCard, { style: { marginTop: 12 } },
      React.createElement('div', { style: { fontWeight: 800, fontSize: 13, marginBottom: 10, textTransform: 'uppercase', color: 'var(--pol-texto2)' } }, 'Últimos 30 dias'),
      React.createElement('div', { style: { display: 'flex', alignItems: 'flex-end', gap: 2, height: 90, position: 'relative' } },
        dias.map(function (d) {
          var r = diarioPorData[d];
          var sint = r ? r.sintomas : 0;
          var h = sint > 0 ? Math.max(4, sint / 3 * 70) : 2;
          var polenVal = polenMaxPorDia[d];
          var pontoY = polenVal != null ? (polenVal / maxPolen * 80) : null;
          return React.createElement('div', { key: d, style: { flex: 1, position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end' } },
            React.createElement('div', { style: { width: '100%', height: h, background: sint >= 2 ? '#F97316' : (sint === 1 ? '#FFD21F' : 'var(--pol-borda)'), borderRadius: '3px 3px 0 0' } }),
            pontoY != null && React.createElement('div', { style: { position: 'absolute', bottom: pontoY, left: '50%', width: 5, height: 5, borderRadius: '50%', background: '#12A150', transform: 'translateX(-50%)' } })
          );
        })
      ),
      React.createElement('p', { style: { fontSize: 11, color: 'var(--pol-texto2)', marginTop: 8 } }, 'Barras: sintomas (0–3) · ponto verde: pólen máximo das tuas alergias nesse dia (só onde houver medições guardadas).')
    );
  }

  function renderDiario() {
    if (!perfilAtivo) return renderSemPerfil();
    return React.createElement('div', { style: { padding: 16, display: 'flex', flexDirection: 'column', gap: 12 } },
      React.createElement(PolCard, null,
        React.createElement('div', { style: { fontWeight: 800, fontSize: 13, marginBottom: 10 } }, diarioEditandoId ? 'A editar registo de ' + polFmtDataCurta(fData) : 'Novo registo'),
        React.createElement('input', { type: 'date', className: 'pol-input', autoComplete: 'off', value: fData, onChange: function (e) { setFData(e.target.value); }, style: { marginBottom: 10 } }),
        React.createElement('div', { style: { display: 'flex', gap: 6, marginBottom: 10 } },
          [[0, 'Bem'], [1, 'Ligeiro'], [2, 'Moderado'], [3, 'Forte']].map(function (s) {
            return React.createElement('button', { key: s[0], className: 'pol-sintoma-btn' + (fSintomas === s[0] ? ' pol-sintoma-ativo' : ''), onClick: function () { setFSintomas(s[0]); } },
              React.createElement('span', { style: { fontSize: 16 } }, s[0]), React.createElement('span', null, s[1]));
          })
        ),
        React.createElement('input', { type: 'text', className: 'pol-input', autoComplete: 'off', placeholder: 'Medicamento (opcional)', value: fMedicamento, onChange: function (e) { setFMedicamento(e.target.value); }, style: { marginBottom: 10 } }),
        React.createElement('textarea', { className: 'pol-input', autoComplete: 'off', placeholder: 'Nota (opcional)', value: fNota, onChange: function (e) { setFNota(e.target.value); }, style: { marginBottom: 10, minHeight: 60, resize: 'vertical' } }),
        React.createElement('div', { style: { display: 'flex', gap: 8 } },
          diarioEditandoId && React.createElement('button', { className: 'pol-btn', style: { flex: 1 }, onClick: iniciarNovoRegisto }, 'Cancelar'),
          React.createElement('button', { className: 'pol-btn pol-btn-ativo', style: { flex: 1 }, disabled: diarioSaving, onClick: guardarDiario }, diarioSaving ? 'A guardar…' : (diarioEditandoId ? 'Guardar alterações' : '✓ Guardar'))
        )
      ),
      React.createElement(PolCard, { style: { padding: 0 } },
        diario.length
          ? diario.map(function (r) {
              return React.createElement('div', { key: r.id, style: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderTop: '1px solid var(--pol-borda)' } },
                React.createElement('div', { style: { flex: 1 } },
                  React.createElement('div', { style: { fontWeight: 700, fontSize: 13 } }, polFmtDataCurta(r.data) + ' · sintomas ' + r.sintomas + '/3'),
                  (r.medicamento || r.nota) && React.createElement('div', { style: { fontSize: 11, color: 'var(--pol-texto2)' } }, [r.medicamento, r.nota].filter(Boolean).join(' · '))
                ),
                React.createElement('button', { onClick: function () { editarRegisto(r); }, style: { background: 'none', border: 'none', fontSize: 15, cursor: 'pointer' } }, '✏️'),
                React.createElement('button', { onClick: function () { setConfirmApagarDiario(r.id); }, style: { background: 'none', border: 'none', fontSize: 15, cursor: 'pointer' } }, '🗑️')
              );
            })
          : React.createElement('p', { style: { padding: 16, fontSize: 13, color: 'var(--pol-texto2)' } }, 'Ainda sem registos.')
      ),
      renderDiarioGrafico()
    );
  }

  function renderDicionario() {
    var queryNorm = polNormalizarTermo(dicQuery);
    var todos = POL_TERMOS_BASE.concat(termosPessoais.map(function (t) { return Object.assign({}, t, { pessoal: true }); }));
    var resultados = todos.filter(function (t) {
      return polTermoCorresponde(t.de, queryNorm) || polTermoCorresponde(t.pt, queryNorm);
    });
    return React.createElement('div', { style: { padding: 16, display: 'flex', flexDirection: 'column', gap: 12 } },
      React.createElement('input', { type: 'text', className: 'pol-input', autoComplete: 'off', placeholder: 'Pesquisar (alemão ou português)…', value: dicQuery, onChange: function (e) { setDicQuery(e.target.value); } }),
      React.createElement('button', { className: 'pol-btn', onClick: novoTermoAberto ? function () { setNovoTermoAberto(false); } : iniciarNovoTermo }, novoTermoAberto ? 'Cancelar' : '+ Novo termo pessoal'),
      novoTermoAberto && React.createElement(PolCard, null,
        React.createElement('input', { type: 'text', className: 'pol-input', autoComplete: 'off', placeholder: 'Termo em alemão', value: ntDe, onChange: function (e) { setNtDe(e.target.value); }, style: { marginBottom: 8 } }),
        React.createElement('input', { type: 'text', className: 'pol-input', autoComplete: 'off', placeholder: 'Tradução em português', value: ntPt, onChange: function (e) { setNtPt(e.target.value); }, style: { marginBottom: 8 } }),
        React.createElement('input', { type: 'text', className: 'pol-input', autoComplete: 'off', placeholder: 'Explicação (opcional)', value: ntExp, onChange: function (e) { setNtExp(e.target.value); }, style: { marginBottom: 8 } }),
        React.createElement('button', { className: 'pol-btn pol-btn-ativo', style: { width: '100%' }, onClick: guardarTermo }, ntEditandoId ? 'Guardar alterações' : '✓ Adicionar')
      ),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        resultados.map(function (t, i) {
          return React.createElement(PolCard, { key: i },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
              React.createElement('span', { style: { fontWeight: 800, flex: 1 } }, t.de + ' · ' + t.pt),
              React.createElement('button', { onClick: function () { polFalarAlemao(t.de); }, style: { background: 'none', border: 'none', fontSize: 16, cursor: 'pointer' } }, '🔊'),
              t.pessoal && React.createElement('button', { onClick: function () { editarTermo(t); }, style: { background: 'none', border: 'none', fontSize: 14, cursor: 'pointer' } }, '✏️'),
              t.pessoal && React.createElement('button', { onClick: function () { apagarTermo(t.id); }, style: { background: 'none', border: 'none', fontSize: 14, cursor: 'pointer' } }, '🗑️')
            ),
            t.explicacao && React.createElement('p', { style: { fontSize: 12, color: 'var(--pol-texto2)', marginTop: 6 } }, t.explicacao)
          );
        }),
        !resultados.length && React.createElement('p', { style: { fontSize: 13, color: 'var(--pol-texto2)' } }, 'Nenhum termo encontrado.')
      )
    );
  }

  function renderPerfilEditor() {
    return React.createElement(PolCard, { style: { marginBottom: 12 } },
      React.createElement('div', { style: { fontWeight: 800, fontSize: 14, marginBottom: 10 } }, perfilEditandoId ? 'Editar perfil' : 'Novo perfil'),
      React.createElement('input', { type: 'text', className: 'pol-input', autoComplete: 'off', placeholder: 'Nome', value: pfNome, onChange: function (e) { setPfNome(e.target.value); }, style: { marginBottom: 10 } }),
      React.createElement('p', { style: { fontSize: 11, fontWeight: 700, color: 'var(--pol-texto2)', textTransform: 'uppercase', marginBottom: 6 } }, 'Alergias'),
      React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 } },
        POL_TIPOS.map(function (t) {
          var on = pfAlergias.indexOf(t.id) !== -1;
          return React.createElement('button', { key: t.id, className: 'pol-chip' + (on ? ' pol-chip-ativo' : ''), onClick: function () { toggleAlergiaPerfil(t.id); } }, t.de + ' · ' + t.pt);
        })
      ),
      React.createElement('p', { style: { fontSize: 11, fontWeight: 700, color: 'var(--pol-texto2)', textTransform: 'uppercase', marginBottom: 6 } }, 'Localização'),
      pfLocal && React.createElement('div', { style: { fontSize: 13, marginBottom: 8, color: 'var(--pol-texto)' } }, '📍 ' + pfLocal.cidade + (pfLocal.kanton ? ' · ' + pfLocal.kanton : '')),
      React.createElement('select', { className: 'pol-input', style: { marginBottom: 8 }, value: '', onChange: function (e) {
        var idx = +e.target.value;
        if (!isNaN(idx) && POL_KANTONE[idx]) setPfLocal(POL_KANTONE[idx]);
      } },
        React.createElement('option', { value: '' }, 'Escolher Kanton / cidade…'),
        POL_KANTONE.map(function (k, i) { return React.createElement('option', { key: i, value: i }, k.kanton + ' — ' + k.cidade); })
      ),
      React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 8 } },
        React.createElement('input', { type: 'text', className: 'pol-input', autoComplete: 'off', placeholder: 'ou pesquisar outra cidade…', value: pfPesquisaCidade, onChange: function (e) { setPfPesquisaCidade(e.target.value); } }),
        React.createElement('button', { className: 'pol-btn', onClick: pesquisarCidade }, 'Pesquisar')
      ),
      pfResultadosPesquisa.length > 0 && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 } },
        pfResultadosPesquisa.map(function (r, i) {
          return React.createElement('button', { key: i, className: 'pol-btn', style: { textAlign: 'left' }, onClick: function () {
            setPfLocal({ kanton: r.admin1 || null, cidade: r.name, lat: r.latitude, lon: r.longitude });
            setPfResultadosPesquisa([]); setPfPesquisaCidade('');
          } }, r.name + (r.admin1 ? ' · ' + r.admin1 : '') + (r.country ? ' (' + r.country + ')' : ''));
        })
      ),
      React.createElement('div', { style: { marginBottom: 14 } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          React.createElement('input', { type: 'checkbox', checked: pfNotificar, onChange: function (e) { setPfNotificar(e.target.checked); } }),
          React.createElement('span', { style: { fontSize: 13 } }, 'Receber avisos de pólen alto')
        ),
        React.createElement('p', { style: { fontSize: 11, fontWeight: 700, color: 'var(--pol-texto2)', textTransform: 'uppercase', margin: '10px 0 6px' } }, 'Quem recebe o aviso'),
        React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
          pessoasPollen.map(function (u) {
            var on = pfAvisarIds.indexOf(u.id) !== -1;
            return React.createElement('button', { key: u.id, className: 'pol-chip' + (on ? ' pol-chip-ativo' : ''), onClick: function () { toggleAvisarPerfil(u.id); } }, u.nome);
          })
        ),
        !pessoasPollen.length && React.createElement('p', { style: { fontSize: 11, color: 'var(--pol-texto2)', margin: '4px 0 0' } }, 'Ainda ninguém tem o Pólen ativo.'),
        React.createElement('p', { style: { fontSize: 11, color: 'var(--pol-texto2)', margin: '6px 0 0' } }, 'O alerta usa a cidade do perfil.')
      ),
      React.createElement('div', { style: { display: 'flex', gap: 8 } },
        React.createElement('button', { className: 'pol-btn', style: { flex: 1 }, onClick: function () { setPerfilEditorAberto(false); } }, 'Cancelar'),
        React.createElement('button', { className: 'pol-btn pol-btn-ativo', style: { flex: 1 }, disabled: perfilSaving, onClick: guardarPerfil }, perfilSaving ? 'A guardar…' : '✓ Guardar')
      )
    );
  }

  function renderDefinicoes() {
    return React.createElement('div', { style: { padding: 16, display: 'flex', flexDirection: 'column', gap: 12 } },
      React.createElement('button', { className: 'pol-btn', onClick: function () { setTab('hoje'); } }, '← Voltar'),
      React.createElement('div', { style: { fontWeight: 800, fontSize: 15 } }, 'Perfis'),
      perfilEditorAberto ? renderPerfilEditor() : React.createElement('button', { className: 'pol-btn pol-btn-ativo', onClick: abrirNovoPerfil }, '+ Novo perfil'),
      perfis.map(function (p) {
        return React.createElement(PolCard, { key: p.id },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
            React.createElement('div', null,
              React.createElement('div', { style: { fontWeight: 800, fontSize: 14 } }, p.nome),
              React.createElement('div', { style: { fontSize: 11, color: 'var(--pol-texto2)' } }, p.cidade + (p.kanton ? ' · ' + p.kanton : '') + (p.notificar === false ? ' · avisos desligados' : ''))
            ),
            React.createElement('div', { style: { display: 'flex', gap: 6 } },
              React.createElement('button', { onClick: function () { abrirEditarPerfil(p); }, style: { background: 'none', border: 'none', fontSize: 15, cursor: 'pointer' } }, '✏️'),
              React.createElement('button', { onClick: function () { setConfirmApagarPerfil(p.id); }, style: { background: 'none', border: 'none', fontSize: 15, cursor: 'pointer' } }, '🗑️')
            )
          )
        );
      })
    );
  }

  var corpo;
  if (tab === 'definicoes') corpo = renderDefinicoes();
  else if (tab === 'hoje') corpo = renderHoje();
  else if (tab === 'previsao') corpo = renderPrevisao();
  else if (tab === 'diario') corpo = renderDiario();
  else corpo = renderDicionario();

  var modalConfirmApagarPerfil = confirmApagarPerfil && React.createElement('div', {
    style: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 },
    onClick: function (e) { if (e.target === e.currentTarget) setConfirmApagarPerfil(null); }
  },
    React.createElement(PolCard, { style: { maxWidth: 340, width: '100%' } },
      React.createElement('p', { style: { fontWeight: 700, marginBottom: 16 } }, 'Apagar este perfil e todo o seu diário?'),
      React.createElement('div', { style: { display: 'flex', gap: 10 } },
        React.createElement('button', { className: 'pol-btn', style: { flex: 1 }, onClick: function () { setConfirmApagarPerfil(null); } }, 'Cancelar'),
        React.createElement('button', { className: 'pol-btn', style: { flex: 1, background: '#DC2626', color: '#fff', borderColor: '#DC2626' }, onClick: function () { apagarPerfil(confirmApagarPerfil); } }, 'Apagar')
      )
    )
  );
  var modalConfirmApagarDiario = confirmApagarDiario && React.createElement('div', {
    style: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 },
    onClick: function (e) { if (e.target === e.currentTarget) setConfirmApagarDiario(null); }
  },
    React.createElement(PolCard, { style: { maxWidth: 340, width: '100%' } },
      React.createElement('p', { style: { fontWeight: 700, marginBottom: 16 } }, 'Apagar este registo do diário?'),
      React.createElement('div', { style: { display: 'flex', gap: 10 } },
        React.createElement('button', { className: 'pol-btn', style: { flex: 1 }, onClick: function () { setConfirmApagarDiario(null); } }, 'Cancelar'),
        React.createElement('button', { className: 'pol-btn', style: { flex: 1, background: '#DC2626', color: '#fff', borderColor: '#DC2626' }, onClick: function () { apagarDiario(confirmApagarDiario); } }, 'Apagar')
      )
    )
  );

  return React.createElement('div', { className: appClass },
    React.createElement('style', null, POL_CSS),
    header,
    tabs,
    chipsPerfil,
    erro && React.createElement('div', { style: { padding: '10px 16px 0' } }, React.createElement(PolCard, null, React.createElement('p', { style: { color: '#DC2626', fontSize: 13 } }, '⚠️ ' + erro))),
    corpo,
    React.createElement('p', { style: { textAlign: 'center', fontSize: 11, color: 'var(--pol-texto2)', padding: '8px 16px 24px' } }, 'Informação indicativa — não substitui o médico.'),
    modalConfirmApagarPerfil,
    modalConfirmApagarDiario
  );
}
