// ── HOME EXTRAS ─────────────────────────────────────────────────────
// (1) Popup "Kompliment des Tages" — 1x por dia por utilizador
// (2) Cartão do tempo (Open-Meteo, Selzach) ao lado da saudação
// (3) Painel admin do Kompliment (ligar/desligar + criar/editar/apagar textos)
// Independente das apps. Usa só React, T, Card (carregados antes). Nada aqui
// pode partir a Home: tudo falha em silêncio e cai nos valores por defeito.

var KOTD_DEFAULT_ITEMS = [
  'Dein Werkzeugkoffer ist perfekt organisiert. Man findet darin alles – ausser Werkzeug.',
  'Deine Arbeitsweise verdient ein eigenes Handbuch.',
  'Heute arbeitest du auf Profi-Niveau.',
  'Effizienz könnte von dir noch etwas lernen.',
  'Probleme lösen sich fast von selbst, wenn du da bist.',
  'Kaffee arbeitet hart, aber du arbeitest härter.',
  'Dein Auge fürs Detail ist beeindruckend.',
  'Wieder ein Tag, wieder ein erfolgreicher Auftrag.',
  'Du brauchst keine Montageanleitung – du weisst es sowieso besser.',
  'Was du festschraubst, hält für die Ewigkeit.',
  'Deine Wasserwaage ist neidisch auf deine Genauigkeit.',
  'Bei dir passt jedes Teil auf Anhieb – und am Ende bleibt keine Schraube übrig.',
  'Wo du warst, ist danach alles gerade.',
  'Aus einem Haufen Kartons machst du ein fertiges Zimmer.',
  'Dein Akkuschrauber läuft leer – du nie.'
];
var KOTD_CFG_KEY = 'carvalho_kotd_config';
var KOTD_MAX_LEN = 220;

function kotdSafeGet(k) {
  try { return localStorage.getItem(k); } catch (e) { return null; }
}
function kotdSafeSet(k, v) {
  try { localStorage.setItem(k, v); return true; } catch (e) { return false; }
}

// Data LOCAL (não UTC) em YYYY-MM-DD.
function kotdLocalDate(d) {
  var m = d.getMonth() + 1, day = d.getDate();
  return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
}
function kotdDayOfYear(d) {
  var a = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  var b = Date.UTC(d.getFullYear(), 0, 0);
  return Math.round((a - b) / 86400000);
}
// Lista efectiva: a personalizada se tiver textos válidos, senão a por defeito.
function kotdEffectiveItems(items) {
  var l = Array.isArray(items) ? items.filter(function (s) { return typeof s === 'string' && s.trim(); }) : [];
  return l.length ? l : KOTD_DEFAULT_ITEMS;
}
// Próximo índice: último+1 (rotação); sem histórico, baseado no dia do ano.
// Com 2+ textos nunca devolve o mesmo índice do último mostrado.
function kotdNextIndex(n, last, now) {
  if (n <= 0) return 0;
  var idx = (last && typeof last.index === 'number' && last.index >= 0)
    ? (last.index + 1) % n
    : kotdDayOfYear(now) % n;
  if (n > 1 && last && idx === last.index) idx = (idx + 1) % n;
  return idx;
}
function kotdStoreKey(userId) { return 'kotd_' + userId; }
function kotdReadShown(userId) {
  try {
    var o = JSON.parse(kotdSafeGet(kotdStoreKey(userId)) || 'null');
    return o && typeof o.date === 'string' ? o : null;
  } catch (e) { return null; }
}
// Decide o que mostrar: devolve {text,index,date} ou null (já mostrado hoje / desligado / sem utilizador).
function kotdDecide(userId, cfg, now) {
  if (!userId || !cfg || cfg.enabled === false) return null;
  var today = kotdLocalDate(now);
  var shown = kotdReadShown(userId);
  if (shown && shown.date === today) return null;
  var list = kotdEffectiveItems(cfg.items);
  var idx = kotdNextIndex(list.length, shown, now);
  return { text: list[idx], index: idx, date: today };
}
function kotdMarkShown(userId, d) {
  kotdSafeSet(kotdStoreKey(userId), JSON.stringify({ date: d.date, index: d.index }));
}

function kotdCachedConfig() {
  try {
    var o = JSON.parse(kotdSafeGet(KOTD_CFG_KEY) || 'null');
    if (o && typeof o === 'object') {
      return { enabled: o.enabled !== false, items: Array.isArray(o.items) ? o.items : [] };
    }
  } catch (e) {}
  return { enabled: true, items: [] };
}
// Lê a config partilhada (tabela app_settings, se existir) e guarda em cache local.
// Se a tabela não existir / sem rede / demora > 3,5 s → usa a cache local.
function kotdLoadConfig() {
  var base = kotdCachedConfig();
  if (typeof window === 'undefined' || !window.supabaseClient) return Promise.resolve(base);
  var remote;
  try {
    remote = Promise.resolve(window.supabaseClient.from('app_settings').select('value').eq('key', 'kotd').maybeSingle())
      .then(function (res) {
        if (!res || res.error || !res.data || !res.data.value) return base;
        var v = res.data.value;
        var cfg = { enabled: v.enabled !== false, items: Array.isArray(v.items) ? v.items : [] };
        kotdSafeSet(KOTD_CFG_KEY, JSON.stringify(cfg));
        return cfg;
      }).catch(function () { return base; });
  } catch (e) { return Promise.resolve(base); }
  var timeout = new Promise(function (resolve) { setTimeout(function () { resolve(base); }, 3500); });
  return Promise.race([remote, timeout]);
}
// Guarda sempre em local; tenta partilhar via Supabase. Resolve {remote:boolean}.
function kotdSaveConfig(cfg) {
  kotdSafeSet(KOTD_CFG_KEY, JSON.stringify(cfg));
  if (typeof window === 'undefined' || !window.supabaseClient) return Promise.resolve({ remote: false });
  try {
    return Promise.resolve(window.supabaseClient.from('app_settings').upsert({
      key: 'kotd', value: cfg, updated_at: new Date().toISOString()
    })).then(function (res) { return { remote: !(res && res.error) }; })
      .catch(function () { return { remote: false }; });
  } catch (e) { return Promise.resolve({ remote: false }); }
}

// ── Popup ──
function KotdPopup(props) {
  var userId = props.userId;
  var _s = React.useState(null), item = _s[0], setItem = _s[1];
  var _v = React.useState(false), vis = _v[0], setVis = _v[1];
  var closeTimer = React.useRef(null);
  var unmountTimer = React.useRef(null);
  var autoTimer = React.useRef(null);

  React.useEffect(function () {
    if (!userId) return;
    var cancelled = false;
    kotdLoadConfig().then(function (cfg) {
      if (cancelled) return;
      var d = kotdDecide(userId, cfg, new Date());
      if (!d) return;
      kotdMarkShown(userId, d);
      setItem(d);
      requestAnimationFrame(function () { requestAnimationFrame(function () { if (!cancelled) setVis(true); }); });
      autoTimer.current = setTimeout(function () { close(); }, 12000);
    });
    return function () {
      cancelled = true;
      clearTimeout(autoTimer.current);
      clearTimeout(closeTimer.current);
      clearTimeout(unmountTimer.current);
    };
  }, [userId]);

  function close() {
    clearTimeout(autoTimer.current);
    setVis(false);
    unmountTimer.current = setTimeout(function () { setItem(null); }, 350);
  }
  if (!item) return null;
  var BLUE = '#2563EB';
  return React.createElement('div', {
    role: 'status', 'aria-live': 'polite',
    style: {
      position: 'fixed', top: 'calc(env(safe-area-inset-top, 0px) + 12px)', left: '50%',
      width: 'calc(100% - 24px)', maxWidth: 420, zIndex: 600,
      opacity: vis ? 1 : 0,
      transform: 'translate(-50%,' + (vis ? '0' : '-14px') + ')',
      transition: 'opacity .35s ease, transform .35s ease',
      pointerEvents: vis ? 'auto' : 'none'
    }
  }, React.createElement('div', {
    style: {
      position: 'relative', background: '#FFFFFF', borderRadius: 20, overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,.28)', borderTop: '4px solid ' + BLUE,
      padding: '16px 44px 16px 16px', display: 'flex', gap: 12, alignItems: 'flex-start'
    }
  },
    React.createElement('div', {
      'aria-hidden': 'true',
      style: { width: 40, height: 40, borderRadius: '50%', background: BLUE, color: '#fff', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, lineHeight: 1, paddingTop: 6, fontFamily: 'Georgia,serif' }
    }, '”'),
    React.createElement('div', { style: { minWidth: 0 } },
      React.createElement('p', { style: { color: BLUE, fontSize: 11, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 6 } }, 'Elogio do Dia'),
      React.createElement('p', { style: { color: '#1F2937', fontSize: 15, fontWeight: 600, lineHeight: 1.4, wordBreak: 'break-word' } }, item.text)
    ),
    React.createElement('button', {
      onClick: close, 'aria-label': 'Schliessen',
      style: { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: '50%', border: 'none',
        background: 'transparent', color: '#6B7280', fontSize: 20, lineHeight: 1, cursor: 'pointer' }
    }, '×')
  ));
}

// ── Tempo ──
var WX_FALLBACK = { lat: 47.21, lon: 7.48, name: 'Selzach' };
var WX_KEY = 'carvalho_wx_cache';
var WX_TTL = 30 * 60 * 1000;
var WX_MAX_KM = 5;
// Só em memória, por sessão: posição já obtida e pedido recusado (não voltar a pedir).
var wxSessionPos = null;
var wxGeoDenied = false;

function wxUrl(lat, lon) {
  return 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
    '&current=temperature_2m,weather_code&daily=temperature_2m_min,temperature_2m_max,weather_code&timezone=auto';
}
function wxGeoUrl(lat, lon) {
  return 'https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + lat + '&longitude=' + lon + '&localityLanguage=de';
}
// Distância em km entre dois pontos {lat,lon} (haversine).
function wxDistKm(a, b) {
  var R = 6371, rad = Math.PI / 180;
  var dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
  var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
function wxRound(n) { return Math.round(n * 1000) / 1000; }
// A cache só serve sem pedir de novo se tem menos de 30 min E a posição está a <= 5 km.
function wxCacheFresh(c, pos, now) {
  return !!c && now - c.t < WX_TTL && wxDistKm(c, pos) <= WX_MAX_KM;
}

function wxDescribe(code) {
  if (code === 0) return { i: '☀️', t: 'Sol' };
  if (code === 1) return { i: '🌤️', t: 'Pouco nublado' };
  if (code === 2) return { i: '⛅', t: 'Nublado' };
  if (code === 3) return { i: '☁️', t: 'Encoberto' };
  if (code === 45 || code === 48) return { i: '🌫️', t: 'Nevoeiro' };
  if (code >= 51 && code <= 57) return { i: '🌦️', t: 'Chuvisco' };
  if (code >= 61 && code <= 67) return { i: '🌧️', t: 'Chuva' };
  if (code >= 71 && code <= 77) return { i: '🌨️', t: 'Neve' };
  if (code >= 80 && code <= 82) return { i: '🌦️', t: 'Aguaceiros' };
  if (code === 85 || code === 86) return { i: '🌨️', t: 'Neve' };
  if (code >= 95 && code <= 99) return { i: '⛈️', t: 'Trovoada' };
  return { i: '🌡️', t: 'Tempo' };
}
function wxParse(j) {
  if (!j || !j.current || typeof j.current.temperature_2m !== 'number') return null;
  var min = j.daily && j.daily.temperature_2m_min && j.daily.temperature_2m_min[0];
  var max = j.daily && j.daily.temperature_2m_max && j.daily.temperature_2m_max[0];
  return { temp: Math.round(j.current.temperature_2m), code: j.current.weather_code,
    min: typeof min === 'number' ? Math.round(min) : null, max: typeof max === 'number' ? Math.round(max) : null };
}
function wxReadCache() {
  try {
    var o = JSON.parse(kotdSafeGet(WX_KEY) || 'null');
    if (!o || !o.data || typeof o.t !== 'number') return null;
    // cache antiga (sem coordenadas) veio sempre de Selzach
    if (typeof o.lat !== 'number' || typeof o.lon !== 'number') {
      return { t: o.t, data: o.data, lat: WX_FALLBACK.lat, lon: WX_FALLBACK.lon, name: WX_FALLBACK.name };
    }
    return { t: o.t, data: o.data, lat: o.lat, lon: o.lon, name: typeof o.name === 'string' ? o.name : '' };
  } catch (e) { return null; }
}
// GET json; nunca rejeita (devolve null em qualquer falha/timeout).
function wxFetchJson(url, ms) {
  return new Promise(function (resolve) {
    var ctrl = null, to = null;
    try {
      ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      to = setTimeout(function () { if (ctrl) ctrl.abort(); resolve(null); }, ms);
      fetch(url, { cache: 'no-store', signal: ctrl ? ctrl.signal : undefined })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { clearTimeout(to); resolve(j); })
        .catch(function () { clearTimeout(to); resolve(null); });
    } catch (e) { clearTimeout(to); resolve(null); }
  });
}
// Posição aproximada do aparelho; qualquer recusa/erro/timeout/falta de suporte → Selzach, em silêncio.
// Resolve sempre {lat,lon,fallback}.
function wxGetPosition() {
  var fb = { lat: WX_FALLBACK.lat, lon: WX_FALLBACK.lon, fallback: true };
  if (wxSessionPos && Date.now() - wxSessionPos.t < WX_TTL) return Promise.resolve(wxSessionPos.pos);
  if (wxGeoDenied || typeof navigator === 'undefined' || !navigator.geolocation) return Promise.resolve(fb);
  var ask = function () {
    return new Promise(function (resolve) {
      var done = false;
      var finish = function (p) { if (!done) { done = true; resolve(p); } };
      var guard = setTimeout(function () { finish(fb); }, 10000);
      try {
        navigator.geolocation.getCurrentPosition(function (p) {
          clearTimeout(guard);
          var pos = { lat: wxRound(p.coords.latitude), lon: wxRound(p.coords.longitude), fallback: false };
          wxSessionPos = { t: Date.now(), pos: pos };
          finish(pos);
        }, function (err) {
          clearTimeout(guard);
          if (err && err.code === 1) wxGeoDenied = true;
          finish(fb);
        }, { enableHighAccuracy: false, timeout: 8000, maximumAge: WX_TTL });
      } catch (e) { clearTimeout(guard); finish(fb); }
    });
  };
  try {
    if (navigator.permissions && navigator.permissions.query) {
      return navigator.permissions.query({ name: 'geolocation' }).then(function (st) {
        if (st && st.state === 'denied') { wxGeoDenied = true; return fb; }
        return ask();
      }, function () { return ask(); });
    }
  } catch (e) {}
  return ask();
}

function HomeWeather() {
  var _s = React.useState(wxReadCache), wx = _s[0], setWx = _s[1];
  // estado quando não há valor para mostrar: 'a obter' | 'offline' | 'erro'
  var _st = React.useState('a obter'), status = _st[0], setStatus = _st[1];
  var _t = React.useState(0), tick = _t[0], setTick = _t[1];
  var _w = React.useState(function () { return typeof window !== 'undefined' && window.innerWidth < 520; }), narrow = _w[0], setNarrow = _w[1];
  React.useEffect(function () {
    var h = function () { setNarrow(window.innerWidth < 520); };
    window.addEventListener('resize', h);
    return function () { window.removeEventListener('resize', h); };
  }, []);
  React.useEffect(function () {
    var cancelled = false;
    wxGetPosition().then(function (pos) {
      if (cancelled) return;
      var cached = wxReadCache();
      if (wxCacheFresh(cached, pos, Date.now())) { setWx(cached); return; }
      if (typeof navigator !== 'undefined' && navigator.onLine === false) { setStatus('offline'); return; } // offline: fica o último valor, se houver
      wxFetchJson(wxUrl(pos.lat, pos.lon), 6000).then(function (j) {
        var d = wxParse(j);
        if (cancelled) return;
        if (!d) { setStatus('erro'); return; }
        var near = cached && wxDistKm(cached, pos) <= WX_MAX_KM;
        var name = pos.fallback ? WX_FALLBACK.name : ((near && cached.name) || '');
        var save = function (nm) {
          // as coordenadas ficam só aqui, no localStorage deste aparelho
          var rec = { t: Date.now(), data: d, lat: pos.lat, lon: pos.lon, name: nm };
          kotdSafeSet(WX_KEY, JSON.stringify(rec));
          if (!cancelled) setWx(rec);
        };
        if (name) { save(name); return; }
        wxFetchJson(wxGeoUrl(pos.lat, pos.lon), 5000).then(function (g) {
          save(g && typeof (g.city || g.locality) === 'string' ? (g.city || g.locality) : '');
        });
      });
    });
    return function () { cancelled = true; };
  }, [tick]);

  // telemóvel: linha própria, por baixo da data (largura toda); ecrãs largos: à direita da saudação
  var box = narrow
    ? { flex: '1 1 100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }
    : { flex: '0 0 auto', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 };
  var shell = Object.assign({ background: T.surface, border: '1px solid ' + T.goldBrd, borderRadius: 16, padding: '8px 12px' }, box);

  if (!wx) {
    var msg = status === 'a obter' ? 'A obter o tempo…'
      : status === 'offline' ? 'Tempo indisponível · sem rede' : 'Tempo indisponível · toca para repetir';
    return React.createElement('div', {
      role: 'button', title: 'Tempo', onClick: function () { setStatus('a obter'); setTick(tick + 1); },
      style: Object.assign({ cursor: 'pointer' }, shell)
    },
      React.createElement('span', { style: { fontSize: 22, lineHeight: 1 } }, '🌡️'),
      React.createElement('span', { style: { color: T.muted, fontSize: 12, fontWeight: 700 } }, msg)
    );
  }
  var w = wx.data;
  var d = wxDescribe(w.code);
  var label = d.t + (w.min !== null ? ' · ' + w.min + '°' : '');
  return React.createElement('div', {
    title: (wx.name || '') + (w.max !== null ? (wx.name ? ' · ' : '') + 'máx ' + w.max + '°' : ''),
    style: shell
  },
    React.createElement('span', { style: { fontSize: 28, lineHeight: 1 } }, d.i),
    React.createElement('div', { style: { color: T.text, fontSize: 26, fontWeight: 900, lineHeight: 1, letterSpacing: '-1px' } }, w.temp + '°'),
    React.createElement('div', { style: { textAlign: 'right', minWidth: 0, maxWidth: narrow ? 'none' : 130, marginLeft: narrow ? 'auto' : 0 } },
      React.createElement('div', { style: { color: T.muted, fontSize: 11, fontWeight: 700 } }, label),
      wx.name && React.createElement('div', { style: { color: T.muted, fontSize: 10, fontWeight: 600, marginTop: 1, opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, wx.name)
    )
  );
}

// ── Painel admin (Definições) ──
var KOTD_LISTA_ABERTA_KEY = 'carvalho_kotd_lista_aberta';
function KotdAdmin() {
  var _c = React.useState(kotdCachedConfig), cfg = _c[0], setCfg = _c[1];
  var _m = React.useState(''), msg = _m[0], setMsg = _m[1];
  var _n = React.useState(''), novo = _n[0], setNovo = _n[1];
  var _e = React.useState(null), ed = _e[0], setEd = _e[1]; // {i, text}
  // Lista de textos recolhível: só preferência de interface (fechada na 1.ª vez)
  var _a = React.useState(function () { return kotdSafeGet(KOTD_LISTA_ABERTA_KEY) === '1'; }), aberto = _a[0], setAberto = _a[1];
  function alternarLista() {
    var v = !aberto;
    setAberto(v);
    kotdSafeSet(KOTD_LISTA_ABERTA_KEY, v ? '1' : '0');
  }
  var usingDefault = !cfg.items.some(function (s) { return s && s.trim(); });
  var list = kotdEffectiveItems(cfg.items);

  React.useEffect(function () {
    var alive = true;
    kotdLoadConfig().then(function (c) { if (alive) setCfg(c); });
    return function () { alive = false; };
  }, []);

  function persist(next, okMsg) {
    setCfg(next);
    kotdSaveConfig(next).then(function (r) {
      setMsg(r.remote ? okMsg : okMsg + ' — só neste aparelho (falta a tabela app_settings no Supabase).');
    });
  }
  // Ao editar a lista por defeito, parte-se dela (copia) para personalizar.
  function baseItems() { return usingDefault ? KOTD_DEFAULT_ITEMS.slice() : cfg.items.slice(); }
  function clean(s) { return String(s || '').replace(/\s+/g, ' ').trim().slice(0, KOTD_MAX_LEN); }

  var inp = { width: '100%', background: T.surface2, border: '1px solid ' + T.goldBrd, borderRadius: 10, padding: '10px 12px', color: T.text, fontSize: 14 };
  var btn = function (c) { return { background: 'transparent', border: '1px solid ' + c, color: c, borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }; };

  return React.createElement('div', { style: { marginBottom: 14 } },
    React.createElement('p', { style: { color: T.gold, fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 } }, 'Elogio do Dia'),
    React.createElement(Card, { style: { padding: 16 } },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 } },
        React.createElement('span', { style: { color: T.text, fontSize: 14, fontWeight: 700 } }, 'Mostrar popup diário'),
        React.createElement('button', {
          onClick: function () { persist({ enabled: !cfg.enabled, items: cfg.items }, cfg.enabled ? 'Desligado' : 'Ligado'); },
          'aria-pressed': cfg.enabled,
          style: { width: 52, height: 30, borderRadius: 15, border: 'none', cursor: 'pointer', background: cfg.enabled ? '#2563EB' : T.surface2, position: 'relative' }
        }, React.createElement('span', { style: { position: 'absolute', top: 3, left: cfg.enabled ? 25 : 3, width: 24, height: 24, borderRadius: '50%', background: '#fff', transition: 'left .2s' } }))
      ),
      React.createElement('p', { style: { color: T.muted, fontSize: 11.5, marginBottom: 10 } },
        usingDefault ? 'Lista por defeito (' + list.length + ' textos). Ao adicionar ou editar passa a lista personalizada.' : 'Lista personalizada (' + list.length + ' textos).'),
      React.createElement('button', {
        type: 'button', onClick: alternarLista,
        'aria-expanded': aberto, 'aria-controls': 'kotd-lista',
        'aria-label': (aberto ? 'Esconder' : 'Mostrar') + ' os textos do Elogio do Dia (' + list.length + ')',
        style: { width: '100%', minHeight: 44, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', borderTop: '1px solid ' + T.goldBrd, padding: '0 2px', color: T.text, fontSize: 14, fontWeight: 700, cursor: 'pointer', textAlign: 'left' }
      },
        React.createElement('span', null, 'Textos (' + list.length + ')'),
        React.createElement('span', { 'aria-hidden': true, style: { color: T.gold, fontSize: 16 } }, aberto ? '▾' : '▸')
      ),
      aberto && React.createElement('div', { id: 'kotd-lista' },
      list.map(function (t, i) {
        var editing = ed && ed.i === i;
        return React.createElement('div', { key: i, style: { borderTop: '1px solid ' + T.goldBrd, padding: '10px 0' } },
          editing
            ? React.createElement('div', null,
                React.createElement('textarea', { value: ed.text, rows: 3, maxLength: KOTD_MAX_LEN, onChange: function (e) { setEd({ i: i, text: e.target.value }); }, style: inp }),
                React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 8 } },
                  React.createElement('button', { style: btn('#22C55E'), onClick: function () {
                    var t = clean(ed.text); if (!t) return;
                    var b = baseItems(); b[i] = t; setEd(null); persist({ enabled: cfg.enabled, items: b }, 'Texto guardado');
                  } }, 'Guardar'),
                  React.createElement('button', { style: btn(T.muted), onClick: function () { setEd(null); } }, 'Cancelar')))
            : React.createElement('div', null,
                React.createElement('p', { style: { color: T.text, fontSize: 13.5, lineHeight: 1.4, marginBottom: 8 } }, t),
                React.createElement('div', { style: { display: 'flex', gap: 8 } },
                  React.createElement('button', { style: btn(T.gold), onClick: function () { setEd({ i: i, text: t }); } }, 'Editar'),
                  React.createElement('button', { style: btn('#DC2626'), onClick: function () {
                    if (window.confirm && !window.confirm('Apagar este texto?')) return;
                    var b = baseItems(); b.splice(i, 1);
                    persist({ enabled: cfg.enabled, items: b }, b.length ? 'Texto apagado' : 'Lista vazia — volta a usar a lista por defeito');
                  } }, 'Apagar')))
        );
      }),
      React.createElement('div', { style: { borderTop: '1px solid ' + T.goldBrd, paddingTop: 12, marginTop: 4 } },
        React.createElement('textarea', { value: novo, rows: 2, maxLength: KOTD_MAX_LEN, placeholder: 'Novo elogio…', onChange: function (e) { setNovo(e.target.value); }, style: inp }),
        React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' } },
          React.createElement('button', { style: btn('#22C55E'), onClick: function () {
            var t = clean(novo); if (!t) return;
            var b = baseItems(); b.push(t); setNovo(''); persist({ enabled: cfg.enabled, items: b }, 'Texto adicionado');
          } }, '+ Adicionar'),
          !usingDefault && React.createElement('button', { style: btn(T.muted), onClick: function () {
            persist({ enabled: cfg.enabled, items: [] }, 'Lista por defeito reposta');
          } }, 'Repor lista por defeito'))
      )
      ),
      msg && React.createElement('p', { style: { color: T.gold, fontSize: 12, marginTop: 10, lineHeight: 1.4 } }, msg)
    )
  );
}
