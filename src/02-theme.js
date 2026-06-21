// ── TOKENS ─────────────────────────────────────────────────────────
var T_DARK = {
  bg: '#09090E',
  surface: '#131319',
  surface2: '#1C1C26',
  gold: '#C9A847',
  goldL: '#E8C96C',
  goldDim: 'rgba(201,168,71,0.15)',
  goldBrd: 'rgba(201,168,71,0.22)',
  text: '#F0EEE8',
  muted: '#7A7A90',
  border: '#2A2A38',
  green: '#22C55E',
  red: '#EF4444',
  orange: '#F97316',
  blue: '#3B82F6'
};
var T_LIGHT = {
  bg: '#FBF7EF',
  surface: '#FFFFFF',
  surface2: '#F2ECDD',
  gold: '#B8862E',
  goldL: '#D4A94A',
  goldDim: 'rgba(184,134,46,0.12)',
  goldBrd: 'rgba(184,134,46,0.28)',
  text: '#2A2118',
  muted: '#8A7F6E',
  border: 'rgba(0,0,0,0.08)',
  green: '#16A34A',
  red: '#DC2626',
  orange: '#EA580C',
  blue: '#2563EB'
};
var T = Object.assign({}, T_DARK);
var wrap = {
  minHeight: '100vh',
  background: T.bg,
  fontFamily: "'Inter',system-ui,sans-serif",
  color: T.text,
  overflowX: 'hidden'
};
function applyTheme(themeName) {
  var src = themeName === 'light' ? T_LIGHT : T_DARK;
  Object.assign(T, src);
  wrap.background = T.bg;
  wrap.color = T.text;
}

// ── NOTIFICAÇÕES: filtro por preferências e horário de silêncio ──────
function isInQuietHours(qs, qe) {
  if (!qs || !qe) return false;
  var now = new Date();
  var cur = now.getHours() * 60 + now.getMinutes();
  var sParts = qs.split(':');
  var eParts = qe.split(':');
  var s = parseInt(sParts[0], 10) * 60 + parseInt(sParts[1], 10);
  var e = parseInt(eParts[0], 10) * 60 + parseInt(eParts[1], 10);
  if (isNaN(s) || isNaN(e) || s === e) return false;
  if (s < e) return cur >= s && cur < e;
  return cur >= s || cur < e; // intervalo atravessa a meia-noite
}
function getEligibleProfileIds(appId, onlyMemberId) {
  if (!window.supabaseClient) return Promise.resolve([]);
  var q = window.supabaseClient.from('profiles').select('id, notification_prefs, disabled, member_id');
  if (onlyMemberId) q = q.eq('member_id', onlyMemberId);
  return q.then(function (res) {
    var rows = res.data || [];
    return rows.filter(function (p) {
      if (p.disabled) return false;
      var prefs = p.notification_prefs || {};
      var disabledApps = prefs.disabledApps || [];
      if (disabledApps.indexOf(appId) !== -1) return false;
      if (isInQuietHours(prefs.quietStart, prefs.quietEnd)) return false;
      return true;
    }).map(function (p) {
      return p.id;
    });
  }).catch(function () {
    return [];
  });
}

// ── DATA ────────────────────────────────────────────────────────────
var APPS_DATA = [{
  id: 'horaspr',
  emoji: '⏱️',
  name: 'Patricio Time',
  desc: 'Registo de horas e CHF',
  badge: null,
  color: T.gold
}, {
  id: 'agenda',
  emoji: '📋',
  name: 'Patricio Work',
  desc: 'Gestão de trabalho',
  badge: null,
  color: T.orange
}, {
  id: 'familia',
  emoji: '🏠',
  name: 'Família Carvalho',
  desc: 'Calendário familiar',
  badge: null,
  color: T.blue
}, {
  id: 'nutri',
  emoji: '💊',
  name: 'Nutriguima',
  desc: 'Loja de suplementos',
  badge: null,
  color: T.green
}, {
  id: 'escolar',
  emoji: '📚',
  name: 'Carvalho Schule',
  desc: 'Escola do Lucas · SEK P',
  badge: null,
  color: '#A855F7'
}];
