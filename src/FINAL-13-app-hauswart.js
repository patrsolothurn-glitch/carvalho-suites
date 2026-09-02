// ── HAUSWART APP ──────────────────────────────────────────────────────
// Faturação trimestral pessoal do Patricio (trabalho independente).
// Admin only. Dados em localStorage (prefixo hw_).
// ─────────────────────────────────────────────────────────────────────

var HW_DEFAULTS = {
  name: 'Patricio Norberto Antunes Carvalho',
  address: 'Gassackerweg 4b',
  city: '2545 Selzach',
  phone: '079 888 43 84',
  email: 'patr.carvalho@hotmail.com',
  iban: 'CH63 0830 7000 4824 1931 8',
  bank: 'Neon Bank',
  rate: 35,
  pauschale: 1350,
  location: 'Passionsstrasse 6, 2545 Selzach',
  clientName: 'Verwaltung der SWEGT',
  clientContact: 'Roland Aeschbacher',
  clientAddress: 'Gartenstrasse 12',
  clientCity: '4513 Langendorf',
  quarter: 'Q3',
  year: new Date().getFullYear(),
  invoiceDate: '',
  serviceDate: '',
};

var HW_QUARTERS = [
  { key: 'Q1', from: '1. Januar',  to: '31. März',      startDay: '01-01', endDay: '03-31' },
  { key: 'Q2', from: '1. April',   to: '30. Juni',       startDay: '04-01', endDay: '06-30' },
  { key: 'Q3', from: '1. Juli',    to: '30. September',  startDay: '07-01', endDay: '09-30' },
  { key: 'Q4', from: '1. Oktober', to: '31. Dezember',   startDay: '10-01', endDay: '12-31' },
];

var HW_MONTHS = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];

function hwLoad(key) {
  try { var v = localStorage.getItem('hw_' + key); return v ? JSON.parse(v) : null; } catch(e) { return null; }
}
function hwSave(key, val) {
  try { localStorage.setItem('hw_' + key, JSON.stringify(val)); } catch(e) {}
}
function hwUid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,5); }
function hwChf(n) { return 'CHF ' + (n || 0).toFixed(2); }
function hwFmtDate(d) {
  if (!d) return '';
  return new Date(d + 'T12:00:00').toLocaleDateString('de-CH');
}
function hwToday() { return new Date().toISOString().slice(0,10); }

// ── DatePick ──
function hwPlus30Days(dt) {
  var r = new Date(dt.getTime());
  r.setDate(r.getDate() + 30);
  return r;
}

function fmtCHF(n) {
  var v = (Math.round(Number(n) * 100) / 100).toFixed(2);
  var p = v.split('.');
  return p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + '.' + p[1];
}

var HW_MONTHS_FULL = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

function hwFmtMonthYear(d) {
  if (!d) return '';
  var dt = new Date(d + 'T12:00:00');
  return HW_MONTHS_FULL[dt.getMonth()] + ' ' + dt.getFullYear();
}

function HwDatePick(props) {
  var label = props.label, value = props.value, onChange = props.onChange;

  var _useStateOpen = React.useState(false);
  var open = _useStateOpen[0], setOpen = _useStateOpen[1];

  var today = new Date();
  var DE_DOW = ['Mo','Di','Mi','Do','Fr','Sa','So'];
  var DE_MON = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

  var parseVal = function(v) {
    if (!v) return { y: today.getFullYear(), m: today.getMonth(), d: 0 };
    var p = v.split('-');
    return { y: parseInt(p[0]), m: parseInt(p[1]) - 1, d: parseInt(p[2]) };
  };
  var pv = parseVal(value);

  var _useStateView = React.useState({ y: pv.y, m: pv.m });
  var view = _useStateView[0], setView = _useStateView[1];

  var openCal = function() {
    var p2 = parseVal(value);
    setView({ y: p2.y, m: p2.m });
    setOpen(true);
  };

  var prevM = function() { setView(function(v) { return v.m === 0 ? { y: v.y-1, m: 11 } : { y: v.y, m: v.m-1 }; }); };
  var nextM = function() { setView(function(v) { return v.m === 11 ? { y: v.y+1, m: 0 } : { y: v.y, m: v.m+1 }; }); };

  var firstDOW = (new Date(view.y, view.m, 1).getDay() + 6) % 7; // Mon=0
  var daysInM  = new Date(view.y, view.m + 1, 0).getDate();

  var cells = [];
  for (var i = 0; i < firstDOW; i++) cells.push(null);
  for (var n = 1; n <= daysInM; n++) cells.push(n);
  while (cells.length % 7 !== 0) cells.push(null);

  // ISO week number helper
  var isoWeek = function(d) {
    var dt = new Date(view.y, view.m, d); dt.setHours(0,0,0,0);
    dt.setDate(dt.getDate() + 3 - (dt.getDay() + 6) % 7);
    var w1 = new Date(dt.getFullYear(), 0, 4);
    return 1 + Math.round(((dt.getTime() - w1.getTime()) / 86400000 - 3 + (w1.getDay() + 6) % 7) / 7);
  };

  // Group cells into weeks
  var weeks = [];
  for (var wi = 0; wi < cells.length / 7; wi++) weeks.push(cells.slice(wi*7, (wi+1)*7));

  var selInView = pv.d > 0 && pv.y === view.y && pv.m === view.m;
  var selDay    = selInView ? pv.d : null;
  var todayInV  = today.getFullYear() === view.y && today.getMonth() === view.m;
  var todayDay  = todayInV ? today.getDate() : null;

  var pick = function(day) {
    onChange(view.y + '-' + String(view.m+1).padStart(2,'0') + '-' + String(day).padStart(2,'0'));
    setOpen(false);
  };

  var dispText = value
    ? new Date(value + 'T12:00:00').toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : 'Datum auswählen';

  var selDateDisplay = selDay
    ? new Date(view.y, view.m, selDay).toLocaleDateString('de-CH', { weekday: 'long' }) + ', ' + selDay + '/' + String(view.m+1).padStart(2,'0')
    : DE_MON[view.m];

  return React.createElement('div', { style: { marginBottom: 12 } },
    label && React.createElement('label', { style: { display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 } }, label),

    // Trigger
    React.createElement('button', {
      onClick: openCal,
      style: { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '10px 12px', color: value ? '#f1f5f9' : '#475569', fontSize: 14, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }
    },
      React.createElement('span', null, '📅'),
      React.createElement('span', null, dispText)
    ),

    // Calendar Modal
    open && React.createElement('div', {
      onClick: function(e) { if (e.target === e.currentTarget) setOpen(false); },
      style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px' }
    },
      React.createElement('div', { style: { background: '#1e293b', borderRadius: 16, width: '100%', maxWidth: 360, overflow: 'hidden' } },

        // Header — dark top section
        React.createElement('div', { style: { background: '#0f172a', padding: '20px 20px 16px' } },
          React.createElement('div', { style: { fontSize: 13, color: '#64748b', marginBottom: 2 } }, view.y),
          React.createElement('div', { style: { fontSize: 24, fontWeight: 700, color: '#f1f5f9' } }, selDateDisplay)
        ),

        // Month nav
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 8px' } },
          React.createElement('button', { onClick: prevM, style: { background: 'none', border: 'none', color: '#3b82f6', fontSize: 22, cursor: 'pointer', padding: '4px 10px', lineHeight: 1 } }, '‹'),
          React.createElement('span', { style: { fontWeight: 700, fontSize: 15, color: '#f1f5f9' } }, DE_MON[view.m] + ' ' + view.y),
          React.createElement('button', { onClick: nextM, style: { background: 'none', border: 'none', color: '#3b82f6', fontSize: 22, cursor: 'pointer', padding: '4px 10px', lineHeight: 1 } }, '›')
        ),

        // Day headers — with KW column
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '28px repeat(7,1fr)', padding: '0 12px', marginBottom: 4 } },
          React.createElement('div', { style: { textAlign: 'center', fontSize: 9, color: '#334155', fontWeight: 700, padding: '4px 0' } }, 'KW'),
          DE_DOW.map(function(h) {
            return React.createElement('div', { key: h, style: { textAlign: 'center', fontSize: 12, color: '#64748b', fontWeight: 600, padding: '4px 0' } }, h);
          })
        ),

        // Day grid — rows with KW number
        React.createElement('div', { style: { padding: '0 12px', marginBottom: 8 } },
          weeks.map(function(week, wi) {
            var firstValid = week.find(function(x) { return x !== null; });
            var kw = firstValid ? isoWeek(firstValid) : null;
            return React.createElement('div', { key: wi, style: { display: 'grid', gridTemplateColumns: '28px repeat(7,1fr)', gap: '2px 0', marginBottom: 2 } },
              React.createElement('div', { style: { textAlign: 'center', fontSize: 9, color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, kw || ''),
              week.map(function(day, di) {
                if (!day) return React.createElement('div', { key: 'e'+wi+di });
                var isSel = day === selDay;
                var isToday = day === todayDay;
                return React.createElement('button', {
                  key: day, onClick: function() { pick(day); },
                  style: {
                    background: isSel ? '#3b82f6' : 'none',
                    border: !isSel && isToday ? '2px solid #3b82f6' : '2px solid transparent',
                    borderRadius: '50%',
                    color: isSel ? 'white' : isToday ? '#60a5fa' : '#e2e8f0',
                    fontWeight: isSel || isToday ? 700 : 400,
                    fontSize: 14, padding: '7px 0', cursor: 'pointer',
                    textAlign: 'center', width: '100%', aspectRatio: '1', lineHeight: 1,
                  }
                }, day);
              })
            );
          })
        ),

        // Actions
        React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 4, padding: '10px 16px 16px', borderTop: '1px solid #334155' } },
          React.createElement('button', { onClick: function() { onChange(''); setOpen(false); }, style: { background: 'none', border: 'none', color: '#64748b', fontSize: 14, cursor: 'pointer', padding: '8px 12px' } }, 'Limpar'),
          React.createElement('button', { onClick: function() { setOpen(false); }, style: { background: 'none', border: 'none', color: '#3b82f6', fontSize: 14, cursor: 'pointer', padding: '8px 12px' } }, 'Cancelar'),
          React.createElement('button', { onClick: function() { setOpen(false); }, style: { background: '#3b82f6', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: '8px 20px' } }, 'Definir')
        )
      )
    )
  );
}

// ── Field ──
function HwFld(props) {
  var label = props.label, value = props.value, onChange = props.onChange;
  var type = props.type || 'text', step = props.step, min = props.min;
  var placeholder = props.placeholder || '', mono = props.mono;
  return React.createElement('div', { style: { marginBottom: 12 } },
    React.createElement('label', { style: { display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 } }, label),
    React.createElement('input', {
      type: type, step: step, min: min,
      value: value || '', placeholder: placeholder,
      onChange: function(e) { onChange(e.target.value); },
      style: { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '9px 12px', color: '#f1f5f9', fontSize: mono ? 12 : 14, fontFamily: mono ? 'monospace' : 'inherit', boxSizing: 'border-box', outline: 'none' }
    })
  );
}

// ── Hdr ──
function HwHdr(props) {
  var title = props.title, back = props.back, btn = props.btn;
  return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 } },
    back && React.createElement('button', { onClick: back, style: { background: '#334155', border: 'none', color: '#94a3b8', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontSize: 16 } }, '←'),
    React.createElement('div', { style: { flex: 1, fontWeight: 700, fontSize: 18 } }, title),
    btn && React.createElement('button', { onClick: btn.fn, style: { background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' } }, btn.label)
  );
}

// ── Empty ──
function HwEmpty(props) {
  return React.createElement('div', { style: { textAlign: 'center', padding: '36px 20px' } },
    React.createElement('div', { style: { fontSize: 40, marginBottom: 10 } }, props.icon),
    React.createElement('div', { style: { fontWeight: 600, color: '#94a3b8', marginBottom: 4 } }, props.text),
    props.sub && React.createElement('div', { style: { fontSize: 13, color: '#475569' } }, props.sub)
  );
}

// ── MAIN APP ──
var HauswartApp = function(props) {
  var onBack = props.onBack;
  var profile = props.profile;
  var owner = (profile && profile.member_id) || 'patricio';
  var T = window.T || { bg: '#0f172a', surface: '#1e293b', surface2: '#0f172a', text: '#e2e8f0', muted: '#64748b', gold: '#C9A847' };

  var _useState = React.useState('dash');
  var tab = _useState[0], setTab = _useState[1];
  var _useStateW = React.useState(hwLoad('works') || []);
  var works = _useStateW[0], setWorksRaw = _useStateW[1];
  var _useStateM = React.useState(hwLoad('mats') || []);
  var mats = _useStateM[0], setMatsRaw = _useStateM[1];
  var _useStateC = React.useState(Object.assign({}, HW_DEFAULTS, hwLoad('cfg') || {}));
  var cfg = _useStateC[0], setCfgRaw = _useStateC[1];
  var _useStateA = React.useState(hwLoad('archive') || []);
  var archive = _useStateA[0], setArchiveRaw = _useStateA[1];
  var _useStateReady = React.useState(false);
  var ready = _useStateReady[0], setReady = _useStateReady[1];
  var _useStatePrint = React.useState(false);
  var printMode = _useStatePrint[0], setPrint = _useStatePrint[1];

  React.useEffect(function() {
    if (!window.supabaseClient) { setReady(true); return; }
    window.supabaseClient.from('hauswart_data').select('*').eq('member_id', owner).single()
      .then(function(res) {
        if (!res.error && res.data) {
          var d = res.data;
          if (d.works && d.works.length) { setWorksRaw(d.works); hwSave('works', d.works); }
          if (d.mats  && d.mats.length)  { setMatsRaw(d.mats);   hwSave('mats',  d.mats); }
          if (d.cfg   && Object.keys(d.cfg).length) { var m2 = Object.assign({}, HW_DEFAULTS, d.cfg); setCfgRaw(m2); hwSave('cfg', m2); }
          if (d.archive && d.archive.length) { setArchiveRaw(d.archive); hwSave('archive', d.archive); }
        } else {
          var lw = hwLoad('works') || []; var lm = hwLoad('mats') || [];
          var lc = hwLoad('cfg') || {}; var la = hwLoad('archive') || [];
          if (lw.length > 0 || lm.length > 0 || la.length > 0) {
            window.supabaseClient.from('hauswart_data').upsert(
              { member_id: owner, works: lw, mats: lm, cfg: lc, archive: la, updated_at: new Date().toISOString() },
              { onConflict: 'member_id' }
            ).then(function() {});
          }
        }
        setReady(true);
      });
  }, []);

  var hwSync = function(w, m, c, a) {
    hwSave('works', w); hwSave('mats', m); hwSave('cfg', c); hwSave('archive', a);
    if (!window.supabaseClient) return;
    window.supabaseClient.from('hauswart_data').upsert(
      { member_id: owner, works: w, mats: m, cfg: c, archive: a, updated_at: new Date().toISOString() },
      { onConflict: 'member_id' }
    ).then(function(res) {
      if (res && res.error && res.error.code !== 'PGRST205') console.warn('hwSync:', res.error.message);
    });
  };

  var updW = function(v) { setWorksRaw(v); hwSync(v, mats, cfg, archive); };
  var updM = function(v) { setMatsRaw(v);  hwSync(works, v, cfg, archive); };
  var updC = function(v) { setCfgRaw(v);   hwSync(works, mats, v, archive); };
  var updA = function(v) { setArchiveRaw(v); hwSync(works, mats, cfg, v); };

  if (!ready) return React.createElement('div', {
    style: { display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0f172a', color:'#64748b', fontFamily:'system-ui', fontSize:16 }
  }, '\uD83D\uDD27 A carregar...');

  var pauschale = cfg.pauschale || 0;
  var totalWork = works.reduce(function(s, w) { return s + w.hours * w.rate; }, 0);
  var totalMats = mats.reduce(function(s, m) { return s + m.price; }, 0);
  var total = pauschale + totalWork + totalMats;

  var qObj = HW_QUARTERS.find(function(q) { return q.key === cfg.quarter; }) || HW_QUARTERS[2];
  var beschreibung = 'Für geleistete Hauswartung vom ' + qObj.from + ' bis ' + qObj.to + ' ' + cfg.year + ', ' + cfg.location;
  var referenz = 'Hauswart ' + cfg.quarter + ' ' + cfg.year;
  var qNum = { Q1:1, Q2:2, Q3:3, Q4:4 }[cfg.quarter] || 1;
  var invNum = 'R' + cfg.year + '-' + String(qNum).padStart(4,'0');
  var invLabel = cfg.quarter + ' Rechnung ' + invNum;
  var leistungszeitraum = new Date(cfg.year + '-' + qObj.startDay + 'T12:00:00').toLocaleDateString('de-CH')
    + ' \u2013 '
    + new Date(cfg.year + '-' + qObj.endDay + 'T12:00:00').toLocaleDateString('de-CH');

  var S = {
    wrap: { fontFamily: 'system-ui,sans-serif', background: T.bg, minHeight: '100vh', color: '#e2e8f0', display: 'flex', flexDirection: 'column' },
    header: { background: T.surface, padding: '12px 16px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
    content: { flex: 1, overflowY: 'auto', padding: 16, paddingBottom: 80 },
    nav: { background: T.surface, borderTop: '1px solid #334155', display: 'flex', padding: '6px 0 2px', position: 'fixed', bottom: 0, left: 0, right: 0 },
    navBtn: function(active) { return { flex: 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 0', color: active ? '#3b82f6' : '#64748b' }; },
    card: { background: T.surface, borderRadius: 12, padding: 14, marginBottom: 10 },
    item: { background: T.surface, borderRadius: 10, padding: 14, marginBottom: 8, display: 'flex', alignItems: 'flex-start' },
    secLabel: { fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
    btn: { background: '#3b82f6', color: 'white', border: 'none', borderRadius: 10, padding: '13px 18px', fontWeight: 700, fontSize: 15, cursor: 'pointer', width: '100%' },
    totalBox: { background: T.surface, borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  };

  if (printMode) {
    return React.createElement(HwPrintView, {
      works: works, mats: mats, cfg: cfg, total: total,
      totalWork: totalWork, totalMats: totalMats, pauschale: pauschale,
      beschreibung: beschreibung, referenz: referenz, invLabel: invLabel,
      leistungszeitraum: leistungszeitraum,
      onBack: function() { setPrint(false); },
      onNew: function() {
        // Guardar no arquivo antes de limpar
        var entry = {
          id: hwUid(),
          year: cfg.year,
          quarter: cfg.quarter,
          referenz: referenz,
          invLabel: invLabel,
          beschreibung: beschreibung,
          leistungszeitraum: leistungszeitraum,
          total: total,
          totalWork: totalWork,
          totalMats: totalMats,
          pauschale: pauschale,
          works: works.slice(),
          mats: mats.slice(),
          cfg: Object.assign({}, cfg),
          dateArchived: hwToday(),
          paid: false,
          datePaid: null,
        };
        updA(archive.concat([entry]));
        updW([]); updM([]);
        updC(Object.assign({}, cfg, { invoiceDate: '', serviceDate: '' }));
        setPrint(false); setTab('arquivo');
      }
    });
  }

  var unreadArchive = archive.filter(function(a) { return !a.paid; }).length;

  var TABS = [
    { id: 'dash', icon: '🏠', label: 'Início' },
    { id: 'work', icon: '🔧', label: 'Arbeit' },
    { id: 'mats', icon: '🛒', label: 'Material' },
    { id: 'invoice', icon: '🧾', label: 'Rechnung' },
    { id: 'arquivo', icon: '📁', label: 'Arquivo', badge: unreadArchive > 0 ? unreadArchive : 0 },
    { id: 'cfg', icon: '⚙️', label: 'Config' },
  ];

  return React.createElement('div', { style: S.wrap },
    // Header
    React.createElement('div', { style: S.header },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
        React.createElement('button', { onClick: onBack, style: { background: '#334155', border: 'none', color: '#94a3b8', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 14 } }, '←'),
        React.createElement('div', null,
          React.createElement('div', { style: { fontWeight: 700, fontSize: 16, color: '#f1f5f9' } }, '🔧 Hauswart'),
          React.createElement('div', { style: { fontSize: 11, color: '#64748b' } }, referenz + ' · ' + hwChf(total))
        )
      ),
      (works.length > 0 || mats.length > 0) && React.createElement('button', { onClick: function() { setTab('invoice'); }, style: { background: '#3b82f622', color: '#93c5fd', border: '1px solid #3b82f644', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 } }, '🧾 Rechnung')
    ),
    // Content
    React.createElement('div', { style: S.content },
      tab === 'dash' && React.createElement(HwDash, { works: works, mats: mats, pauschale: pauschale, total: total, totalWork: totalWork, totalMats: totalMats, setTab: setTab, S: S, cfg: cfg }),
      tab === 'work' && React.createElement(HwWorkTab, { works: works, cfg: cfg, updW: updW, S: S }),
      tab === 'mats' && React.createElement(HwMatsTab, { mats: mats, updM: updM, S: S }),
      tab === 'invoice' && React.createElement(HwInvoiceTab, { works: works, mats: mats, cfg: cfg, total: total, totalWork: totalWork, totalMats: totalMats, pauschale: pauschale, beschreibung: beschreibung, referenz: referenz, invLabel: invLabel, updC: updC, onPrint: function() { setPrint(true); }, S: S }),
      tab === 'arquivo' && React.createElement(HwArquivoTab, { archive: archive, updA: updA, S: S }),
      tab === 'cfg' && React.createElement(HwCfgTab, { cfg: cfg, updC: updC, S: S })
    ),
    // Nav
    React.createElement('nav', { style: S.nav },
      TABS.map(function(t) {
        return React.createElement('button', { key: t.id, onClick: function() { setTab(t.id); }, style: S.navBtn(tab === t.id) },
          React.createElement('span', { style: { position: 'relative', fontSize: 20 } },
            t.icon,
            t.badge > 0 && React.createElement('span', { style: { position: 'absolute', top: -4, right: -8, background: '#f59e0b', color: 'white', borderRadius: 10, fontSize: 9, padding: '1px 4px', fontWeight: 700 } }, t.badge)
          ),
          React.createElement('span', { style: { fontSize: 9 } }, t.label)
        );
      })
    )
  );
};

// ── DASH ──
function HwDash(props) {
  var works = props.works, mats = props.mats, pauschale = props.pauschale, total = props.total;
  var totalWork = props.totalWork, totalMats = props.totalMats, setTab = props.setTab, S = props.S, cfg = props.cfg;

  var cards = [
    { label: 'Pauschale', val: hwChf(pauschale), color: '#3b82f6', tab: 'cfg' },
    { label: 'Extra Arbeit', val: hwChf(totalWork), sub: works.length + ' Einträge', color: '#22c55e', tab: 'work' },
    { label: 'Material', val: hwChf(totalMats), sub: mats.length + ' Artikel', color: '#f59e0b', tab: 'mats' },
    { label: 'TOTAL', val: hwChf(total), color: '#e2e8f0', tab: 'invoice' },
  ];

  return React.createElement('div', null,
    React.createElement(HwHdr, { title: cfg.quarter + ' ' + cfg.year }),
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 } },
      cards.map(function(c) {
        return React.createElement('div', {
          key: c.label, onClick: function() { setTab(c.tab); },
          style: Object.assign({}, S.card, { borderLeft: '3px solid ' + c.color, cursor: 'pointer' })
        },
          React.createElement('div', { style: { fontSize: 11, color: '#64748b', marginBottom: 2 } }, c.label),
          React.createElement('div', { style: { fontWeight: 700, fontSize: 18, color: c.color } }, c.val),
          c.sub && React.createElement('div', { style: { fontSize: 11, color: '#475569' } }, c.sub)
        );
      })
    ),
    works.length === 0 && mats.length === 0 && React.createElement('div', { style: Object.assign({}, S.card, { textAlign: 'center', color: '#475569', padding: 24 }) },
      React.createElement('div', { style: { fontSize: 32, marginBottom: 8 } }, '🔧'),
      React.createElement('div', { style: { fontWeight: 600, marginBottom: 4 } }, 'Bereit für ' + cfg.quarter + ' ' + cfg.year),
      React.createElement('div', { style: { fontSize: 13 } }, 'Pauschale CHF ' + (cfg.pauschale || 0) + ' já incluída. Adiciona trabalho extra ou materiais se necessário.')
    ),
    works.length > 0 && React.createElement('div', null,
      React.createElement('div', { style: { fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 8 } }, 'Últimos trabalhos'),
      works.slice(-3).reverse().map(function(w) {
        return React.createElement('div', { key: w.id, style: S.item },
          React.createElement('div', { style: { flex: 1 } },
            React.createElement('div', { style: { fontWeight: 600, fontSize: 14 } }, w.description),
            React.createElement('div', { style: { fontSize: 12, color: '#64748b' } }, hwFmtDate(w.date) + ' · ' + w.hours + 'h')
          ),
          React.createElement('div', { style: { fontWeight: 700, color: '#22c55e' } }, hwChf(w.hours * w.rate))
        );
      })
    )
  );
}

// ── WORK TAB ──
function HwWorkTab(props) {
  var works = props.works, cfg = props.cfg, updW = props.updW, S = props.S;
  var _useStateV = React.useState('list');
  var view = _useStateV[0], setView = _useStateV[1];
  var _useStateE = React.useState(null);
  var editing = _useStateE[0], setEditing = _useStateE[1];
  var _useStateF = React.useState({});
  var f = _useStateF[0], setF = _useStateF[1];
  var upd = function(k, v) { setF(function(p) { var n = {}; Object.assign(n, p); n[k] = v; return n; }); };

  var openNew = function() { setF({ date: hwToday(), description: '', hours: 1, rate: cfg.rate || 35 }); setEditing(null); setView('form'); };
  var openEdit = function(w) { setF(Object.assign({}, w)); setEditing(w); setView('form'); };
  var onSave = function() {
    if (!f.description || !f.hours) return;
    var entry = Object.assign({}, f, { hours: parseFloat(f.hours), rate: parseFloat(f.rate) });
    if (editing) updW(works.map(function(w) { return w.id === f.id ? entry : w; }));
    else updW(works.concat([Object.assign({}, entry, { id: hwUid() })]));
    setView('list');
  };
  var onDel = function(id) { if (confirm('Löschen?')) updW(works.filter(function(w) { return w.id !== id; })); };
  var total = works.reduce(function(s, w) { return s + w.hours * w.rate; }, 0);

  if (view === 'form') {
    return React.createElement('div', null,
      React.createElement(HwHdr, { title: editing ? 'Arbeit bearbeiten' : 'Neue Arbeit', back: function() { setView('list'); } }),
      React.createElement(HwDatePick, { label: 'Datum', value: f.date, onChange: function(v) { upd('date', v); } }),
      React.createElement(HwFld, { label: 'Beschreibung', value: f.description, onChange: function(v) { upd('description', v); }, placeholder: 'z.B. Treppenhaus reinigen...' }),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
        React.createElement(HwFld, { label: 'Stunden', type: 'number', step: '0.25', value: f.hours, onChange: function(v) { upd('hours', v); } }),
        React.createElement(HwFld, { label: 'CHF/Std.', type: 'number', step: '0.5', value: f.rate, onChange: function(v) { upd('rate', v); } })
      ),
      f.hours && f.rate && React.createElement('div', { style: Object.assign({}, S.card, { borderLeft: '3px solid #22c55e', marginBottom: 16 }) },
        React.createElement('div', { style: { fontSize: 12, color: '#64748b' } }, 'Total'),
        React.createElement('div', { style: { fontSize: 22, fontWeight: 700, color: '#22c55e' } }, hwChf(parseFloat(f.hours||0) * parseFloat(f.rate||0)))
      ),
      React.createElement('button', { onClick: onSave, style: S.btn }, editing ? '✓ Speichern' : '+ Hinzufügen')
    );
  }

  return React.createElement('div', null,
    React.createElement(HwHdr, { title: 'Geleistete Arbeit', btn: { label: '+ Neu', fn: openNew } }),
    works.length > 0 && React.createElement('div', { style: S.totalBox },
      React.createElement('span', { style: { color: '#64748b', fontSize: 13 } }, works.length + ' Einträge'),
      React.createElement('span', { style: { fontWeight: 700, color: '#22c55e' } }, hwChf(total))
    ),
    works.length === 0
      ? React.createElement(HwEmpty, { icon: '🔧', text: 'Noch keine extra Arbeit', sub: 'Datum + Beschreibung + Stunden' })
      : works.sort(function(a,b) { return new Date(a.date)-new Date(b.date); }).map(function(w) {
          return React.createElement('div', { key: w.id, style: S.item },
            React.createElement('div', { style: { flex: 1, minWidth: 0 } },
              React.createElement('div', { style: { fontWeight: 600, fontSize: 14, marginBottom: 2 } }, w.description),
              React.createElement('div', { style: { fontSize: 12, color: '#64748b' } }, hwFmtDate(w.date) + ' · ' + w.hours + 'h × CHF ' + w.rate)
            ),
            React.createElement('div', { style: { textAlign: 'right', marginLeft: 10, flexShrink: 0 } },
              React.createElement('div', { style: { fontWeight: 700, color: '#22c55e' } }, hwChf(w.hours * w.rate)),
              React.createElement('div', { style: { display: 'flex', gap: 5, marginTop: 6, justifyContent: 'flex-end' } },
                React.createElement('button', { onClick: function() { openEdit(w); }, style: { background: '#334155', color: '#94a3b8', border: 'none', borderRadius: 6, padding: '4px 9px', cursor: 'pointer', fontSize: 13 } }, '✏️'),
                React.createElement('button', { onClick: function() { onDel(w.id); }, style: { background: '#450a0a', color: '#f87171', border: 'none', borderRadius: 6, padding: '4px 9px', cursor: 'pointer', fontSize: 13 } }, '🗑️')
              )
            )
          );
        })
  );
}

// ── MATS TAB ──
function HwMatsTab(props) {
  var mats = props.mats, updM = props.updM, S = props.S;
  var _useStateV = React.useState('list');
  var view = _useStateV[0], setView = _useStateV[1];
  var _useStateE = React.useState(null);
  var editing = _useStateE[0], setEditing = _useStateE[1];
  var _useStateF = React.useState({});
  var f = _useStateF[0], setF = _useStateF[1];
  var upd = function(k, v) { setF(function(p) { var n = {}; Object.assign(n, p); n[k] = v; return n; }); };

  var openNew = function() { setF({ date: hwToday(), description: '', price: '' }); setEditing(null); setView('form'); };
  var openEdit = function(m) { setF(Object.assign({}, m)); setEditing(m); setView('form'); };
  var onSave = function() {
    if (!f.description || !f.price) return;
    if (editing) updM(mats.map(function(m) { return m.id === f.id ? Object.assign({}, f, { price: parseFloat(f.price) }) : m; }));
    else updM(mats.concat([Object.assign({}, f, { id: hwUid(), price: parseFloat(f.price) })]));
    setView('list');
  };
  var onDel = function(id) { if (confirm('Löschen?')) updM(mats.filter(function(m) { return m.id !== id; })); };
  var total = mats.reduce(function(s, m) { return s + m.price; }, 0);

  if (view === 'form') {
    return React.createElement('div', null,
      React.createElement(HwHdr, { title: editing ? 'Material bearbeiten' : 'Neues Material', back: function() { setView('list'); } }),
      React.createElement(HwDatePick, { label: 'Datum', value: f.date, onChange: function(v) { upd('date', v); } }),
      React.createElement(HwFld, { label: 'Beschreibung', value: f.description, onChange: function(v) { upd('description', v); }, placeholder: 'z.B. Reinigungsmittel 5L...' }),
      React.createElement(HwFld, { label: 'Preis (CHF)', type: 'number', step: '0.05', value: f.price, onChange: function(v) { upd('price', v); }, placeholder: '0.00' }),
      React.createElement('button', { onClick: onSave, style: S.btn }, editing ? '✓ Speichern' : '+ Hinzufügen')
    );
  }

  return React.createElement('div', null,
    React.createElement(HwHdr, { title: 'Material & Einkäufe', btn: { label: '+ Neu', fn: openNew } }),
    mats.length > 0 && React.createElement('div', { style: S.totalBox },
      React.createElement('span', { style: { color: '#64748b', fontSize: 13 } }, mats.length + ' Artikel'),
      React.createElement('span', { style: { fontWeight: 700, color: '#f59e0b' } }, hwChf(total))
    ),
    mats.length === 0
      ? React.createElement(HwEmpty, { icon: '🛒', text: 'Noch kein Material', sub: 'Beschreibung + Preis' })
      : mats.sort(function(a,b) { return new Date(a.date)-new Date(b.date); }).map(function(m) {
          return React.createElement('div', { key: m.id, style: S.item },
            React.createElement('div', { style: { flex: 1, minWidth: 0 } },
              React.createElement('div', { style: { fontWeight: 600, fontSize: 14, marginBottom: 2 } }, m.description),
              React.createElement('div', { style: { fontSize: 12, color: '#64748b' } }, hwFmtDate(m.date))
            ),
            React.createElement('div', { style: { textAlign: 'right', marginLeft: 10, flexShrink: 0 } },
              React.createElement('div', { style: { fontWeight: 700, color: '#f59e0b' } }, hwChf(m.price)),
              React.createElement('div', { style: { display: 'flex', gap: 5, marginTop: 6, justifyContent: 'flex-end' } },
                React.createElement('button', { onClick: function() { openEdit(m); }, style: { background: '#334155', color: '#94a3b8', border: 'none', borderRadius: 6, padding: '4px 9px', cursor: 'pointer', fontSize: 13 } }, '✏️'),
                React.createElement('button', { onClick: function() { onDel(m.id); }, style: { background: '#450a0a', color: '#f87171', border: 'none', borderRadius: 6, padding: '4px 9px', cursor: 'pointer', fontSize: 13 } }, '🗑️')
              )
            )
          );
        })
  );
}

// ── INVOICE TAB ──
function HwInvoiceTab(props) {
  var works = props.works, mats = props.mats, cfg = props.cfg, total = props.total;
  var totalWork = props.totalWork, totalMats = props.totalMats, pauschale = props.pauschale;
  var beschreibung = props.beschreibung, referenz = props.referenz, invLabel = props.invLabel;
  var updC = props.updC, onPrint = props.onPrint, S = props.S;

  return React.createElement('div', null,
    React.createElement(HwHdr, { title: 'Rechnung Vorschau' }),

    // Von / An
    React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 10 } },
      React.createElement('div', { style: Object.assign({}, S.card, { flex: 1, borderLeft: '3px solid #3b82f6' }) },
        React.createElement('div', { style: { fontSize: 10, color: '#64748b', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 } }, 'Von'),
        React.createElement('div', { style: { fontSize: 13, fontWeight: 700, lineHeight: 1.4 } }, cfg.name),
        React.createElement('div', { style: { fontSize: 11, color: '#64748b' } }, cfg.city),
        React.createElement('div', { style: { fontSize: 11, color: '#64748b' } }, cfg.phone)
      ),
      React.createElement('div', { style: Object.assign({}, S.card, { flex: 1, borderLeft: '3px solid #22c55e' }) },
        React.createElement('div', { style: { fontSize: 10, color: '#64748b', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 } }, 'An'),
        React.createElement('div', { style: { fontSize: 13, fontWeight: 700, lineHeight: 1.4 } }, cfg.clientName),
        React.createElement('div', { style: { fontSize: 11, color: '#94a3b8' } }, cfg.clientContact),
        React.createElement('div', { style: { fontSize: 11, color: '#64748b' } }, cfg.clientCity)
      )
    ),

    // Beschreibung
    React.createElement('div', { style: Object.assign({}, S.card, { marginBottom: 10 }) },
      React.createElement('div', { style: { fontSize: 11, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 } }, invLabel + ' · ' + referenz),
      React.createElement('div', { style: { fontSize: 13, color: '#93c5fd', lineHeight: 1.5 } }, beschreibung)
    ),

    // Pauschale
    pauschale > 0 && React.createElement('div', { style: Object.assign({}, S.card, { marginBottom: 10 }) },
      React.createElement('div', { style: S.secLabel }, '💰 Quartalspauschale'),
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
        React.createElement('div', { style: { fontSize: 13 } }, 'Hauswartung ' + cfg.quarter + ' ' + cfg.year),
        React.createElement('div', { style: { fontWeight: 700, fontSize: 20, color: '#3b82f6' } }, hwChf(pauschale))
      )
    ),

    // Arbeit
    works.length > 0 && React.createElement('div', { style: Object.assign({}, S.card, { marginBottom: 10 }) },
      React.createElement('div', { style: S.secLabel }, '🔧 Dienstleistungen (' + works.length + ')'),
      works.sort(function(a,b) { return new Date(a.date)-new Date(b.date); }).map(function(w) {
        return React.createElement('div', { key: w.id, style: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #0f172a' } },
          React.createElement('div', null,
            React.createElement('div', { style: { fontSize: 13 } }, w.description),
            React.createElement('div', { style: { fontSize: 11, color: '#64748b' } }, hwFmtDate(w.date) + ' · ' + w.hours + 'h × CHF ' + w.rate)
          ),
          React.createElement('div', { style: { fontWeight: 600, fontSize: 13, color: '#22c55e', marginLeft: 10, flexShrink: 0 } }, hwChf(w.hours * w.rate))
        );
      })
    ),

    // Material
    mats.length > 0 && React.createElement('div', { style: Object.assign({}, S.card, { marginBottom: 10 }) },
      React.createElement('div', { style: S.secLabel }, '🛒 Materialeinkauf (' + mats.length + ')'),
      mats.sort(function(a,b) { return new Date(a.date)-new Date(b.date); }).map(function(m) {
        return React.createElement('div', { key: m.id, style: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #0f172a' } },
          React.createElement('div', null,
            React.createElement('div', { style: { fontSize: 13 } }, m.description),
            React.createElement('div', { style: { fontSize: 11, color: '#64748b' } }, hwFmtDate(m.date))
          ),
          React.createElement('div', { style: { fontWeight: 600, fontSize: 13, color: '#f59e0b', marginLeft: 10, flexShrink: 0 } }, hwChf(m.price))
        );
      })
    ),

    // Datas
    React.createElement('div', { style: Object.assign({}, S.card, { marginBottom: 14 }) },
      React.createElement('div', { style: S.secLabel }, '📅 Datas da fatura'),
      React.createElement(HwDatePick, { label: '🚀 Data de envio (Rechnungsdatum)', value: cfg.invoiceDate || '', onChange: function(v) { updC(Object.assign({}, cfg, { invoiceDate: v })); } }),
      !cfg.invoiceDate && React.createElement('div', { style: { fontSize: 11, color: '#475569', marginTop: -8, marginBottom: 10 } }, '📌 Vazio = hoje automático'),
      React.createElement('div', { style: { marginTop: 10, fontSize: 12, color: '#64748b' } }, '📋 Leistungszeitraum (automático pelo trimestre)'),
      React.createElement('div', { style: { background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '9px 12px', color: '#93c5fd', fontSize: 13, fontWeight: 600, marginTop: 4 } },
        (function() {
          var qP = HW_QUARTERS.find(function(q) { return q.key === cfg.quarter; }) || HW_QUARTERS[2];
          var s = new Date(cfg.year + '-' + qP.startDay + 'T12:00:00').toLocaleDateString('de-CH');
          var e = new Date(cfg.year + '-' + qP.endDay + 'T12:00:00').toLocaleDateString('de-CH');
          return s + ' – ' + e;
        })()
      )
    ),

    // Total
    React.createElement('div', { style: Object.assign({}, S.card, { borderLeft: '4px solid #3b82f6', marginBottom: 20 }) },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
        React.createElement('div', null,
          React.createElement('div', { style: { fontWeight: 700, fontSize: 16 } }, 'GESAMTBETRAG'),
          React.createElement('div', { style: { fontSize: 12, color: '#64748b', marginTop: 2 } }, 'Ohne MwSt.')
        ),
        React.createElement('div', { style: { fontWeight: 700, fontSize: 26, color: '#3b82f6' } }, hwChf(total))
      )
    ),
    React.createElement('button', { onClick: onPrint, style: S.btn }, '🖨️ Rechnung drucken / PDF')
  );
}

// ── CONFIG TAB ──
function HwCfgTab(props) {
  var cfg = props.cfg, updC = props.updC, S = props.S;
  var _useStateF = React.useState(Object.assign({}, cfg));
  var f = _useStateF[0], setF = _useStateF[1];
  var _useStateSaved = React.useState(false);
  var saved = _useStateSaved[0], setSaved = _useStateSaved[1];
  var upd = function(k, v) { setF(function(p) { var n = {}; Object.assign(n, p); n[k] = v; return n; }); };

  var onSave = function() { updC(f); setSaved(true); setTimeout(function() { setSaved(false); }, 2000); };

  return React.createElement('div', null,
    React.createElement(HwHdr, { title: 'Einstellungen' }),

    React.createElement('div', { style: Object.assign({}, S.card, { marginBottom: 12 }) },
      React.createElement('div', { style: S.secLabel }, '📅 Quartal & Jahr'),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 } },
        HW_QUARTERS.map(function(q) {
          var active = f.quarter === q.key;
          return React.createElement('button', {
            key: q.key, onClick: function() { upd('quarter', q.key); },
            style: { background: active ? '#1d4ed8' : '#0f172a', border: '1px solid ' + (active ? '#3b82f6' : '#334155'), borderRadius: 8, padding: '10px 8px', color: active ? 'white' : '#94a3b8', cursor: 'pointer', fontSize: 12, fontWeight: active ? 700 : 400, textAlign: 'center' }
          }, q.key, React.createElement('br', null), React.createElement('span', { style: { fontSize: 10, opacity: 0.8 } }, q.from.split('. ')[1] + '–' + q.to.split('. ')[1]));
        })
      ),
      React.createElement(HwFld, { label: 'Jahr', type: 'number', value: f.year, onChange: function(v) { upd('year', parseInt(v) || 2026); } }),
      React.createElement('div', { style: { fontSize: 12, color: '#3b82f6', background: '#1d4ed822', borderRadius: 8, padding: '8px 10px', lineHeight: 1.5 } },
        'Für geleistete Hauswartung vom ', (HW_QUARTERS.find(function(q) { return q.key === f.quarter; }) || HW_QUARTERS[2]).from, ' bis ', (HW_QUARTERS.find(function(q) { return q.key === f.quarter; }) || HW_QUARTERS[2]).to, ' ', f.year
      )
    ),

    React.createElement('div', { style: Object.assign({}, S.card, { marginBottom: 12 }) },
      React.createElement('div', { style: S.secLabel }, '💰 Preços'),
      React.createElement(HwFld, { label: 'Quartalspauschale (CHF)', type: 'number', step: '10', value: f.pauschale, onChange: function(v) { upd('pauschale', parseFloat(v) || 0); } }),
      React.createElement(HwFld, { label: 'CHF/Stunde (extra)', type: 'number', step: '0.5', value: f.rate, onChange: function(v) { upd('rate', parseFloat(v) || 35); } })
    ),

    React.createElement('div', { style: Object.assign({}, S.card, { marginBottom: 12 }) },
      React.createElement('div', { style: S.secLabel }, '👤 Empfänger'),
      React.createElement(HwFld, { label: 'Firma', value: f.clientName, onChange: function(v) { upd('clientName', v); } }),
      React.createElement(HwFld, { label: 'Kontakt', value: f.clientContact, onChange: function(v) { upd('clientContact', v); } }),
      React.createElement(HwFld, { label: 'Strasse', value: f.clientAddress, onChange: function(v) { upd('clientAddress', v); } }),
      React.createElement(HwFld, { label: 'PLZ Ort', value: f.clientCity, onChange: function(v) { upd('clientCity', v); } })
    ),

    React.createElement('div', { style: Object.assign({}, S.card, { marginBottom: 12 }) },
      React.createElement('div', { style: S.secLabel }, '📍 Arbeitsort'),
      React.createElement(HwFld, { label: 'Adresse', value: f.location, onChange: function(v) { upd('location', v); } })
    ),

    React.createElement('div', { style: Object.assign({}, S.card, { marginBottom: 12 }) },
      React.createElement('div', { style: S.secLabel }, '👤 Meine Daten'),
      React.createElement(HwFld, { label: 'Name', value: f.name, onChange: function(v) { upd('name', v); } }),
      React.createElement(HwFld, { label: 'Strasse', value: f.address, onChange: function(v) { upd('address', v); } }),
      React.createElement(HwFld, { label: 'PLZ Ort', value: f.city, onChange: function(v) { upd('city', v); } }),
      React.createElement(HwFld, { label: 'Telefon', value: f.phone, onChange: function(v) { upd('phone', v); } }),
      React.createElement(HwFld, { label: 'E-Mail', value: f.email, onChange: function(v) { upd('email', v); } }),
      React.createElement(HwFld, { label: 'IBAN', value: f.iban, onChange: function(v) { upd('iban', v); }, mono: true }),
      React.createElement(HwFld, { label: 'Bank', value: f.bank, onChange: function(v) { upd('bank', v); } })
    ),

    React.createElement('button', { onClick: onSave, style: Object.assign({}, S.btn, { background: saved ? '#14532d' : '#3b82f6', color: saved ? '#4ade80' : 'white' }) },
      saved ? '✓ Gespeichert!' : 'Speichern'
    )
  );
}

// ── ARQUIVO ──
function HwArquivoTab(props) {
  var archive = props.archive, updA = props.updA, S = props.S;
  var _useStateOpen = React.useState({});
  var openYears = _useStateOpen[0], setOpenYears = _useStateOpen[1];

  var toggleYear = function(y) {
    setOpenYears(function(p) { var n = Object.assign({}, p); n[y] = !n[y]; return n; });
  };

  var markPaid = function(id) {
    updA(archive.map(function(a) {
      return a.id === id ? Object.assign({}, a, { paid: true, datePaid: hwToday() }) : a;
    }));
  };

  var delEntry = function(id) {
    if (confirm('Apagar este registo do arquivo?')) updA(archive.filter(function(a) { return a.id !== id; }));
  };

  if (archive.length === 0) return React.createElement('div', null,
    React.createElement(HwHdr, { title: 'Arquivo' }),
    React.createElement(HwEmpty, { icon: '📁', text: 'Arquivo vazio', sub: 'As faturas arquivadas aparecem aqui organizadas por ano e trimestre' })
  );

  // Group by year
  var byYear = {};
  archive.forEach(function(a) {
    if (!byYear[a.year]) byYear[a.year] = [];
    byYear[a.year].push(a);
  });
  var years = Object.keys(byYear).sort(function(a, b) { return b - a; });

  var totalPaid = archive.filter(function(a) { return a.paid; }).reduce(function(s, a) { return s + a.total; }, 0);
  var totalOpen = archive.filter(function(a) { return !a.paid; }).reduce(function(s, a) { return s + a.total; }, 0);

  return React.createElement('div', null,
    React.createElement(HwHdr, { title: 'Arquivo' }),

    // Summary
    React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 14 } },
      React.createElement('div', { style: Object.assign({}, S.card, { flex: 1, borderLeft: '3px solid #22c55e', marginBottom: 0 }) },
        React.createElement('div', { style: { fontSize: 10, color: '#64748b' } }, 'Pagas'),
        React.createElement('div', { style: { fontWeight: 700, fontSize: 16, color: '#22c55e' } }, hwChf(totalPaid))
      ),
      React.createElement('div', { style: Object.assign({}, S.card, { flex: 1, borderLeft: '3px solid #f59e0b', marginBottom: 0 }) },
        React.createElement('div', { style: { fontSize: 10, color: '#64748b' } }, 'Em aberto'),
        React.createElement('div', { style: { fontWeight: 700, fontSize: 16, color: '#f59e0b' } }, hwChf(totalOpen))
      )
    ),

    // Year folders
    years.map(function(year) {
      var entries = byYear[year].sort(function(a, b) {
        var qn = { Q1:1, Q2:2, Q3:3, Q4:4 };
        return (qn[b.quarter] || 0) - (qn[a.quarter] || 0);
      });
      var isOpen = openYears[year] !== false; // open by default
      var yearPaid = entries.every(function(a) { return a.paid; });
      var yearTotal = entries.reduce(function(s, a) { return s + a.total; }, 0);

      return React.createElement('div', { key: year, style: { marginBottom: 8 } },
        // Year header
        React.createElement('div', {
          onClick: function() { toggleYear(year); },
          style: { background: '#1e293b', borderRadius: isOpen ? '10px 10px 0 0' : 10, padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, borderBottom: isOpen ? '1px solid #334155' : 'none' }
        },
          React.createElement('span', { style: { fontSize: 18 } }, isOpen ? '📂' : '📁'),
          React.createElement('div', { style: { flex: 1 } },
            React.createElement('div', { style: { fontWeight: 700, fontSize: 15 } }, year + ''),
            React.createElement('div', { style: { fontSize: 11, color: '#64748b' } }, entries.length + ' fatura(s) · ' + hwChf(yearTotal))
          ),
          yearPaid && React.createElement('span', { style: { fontSize: 11, background: '#14532d44', color: '#4ade80', borderRadius: 20, padding: '2px 8px' } }, '✓ Pago'),
          React.createElement('span', { style: { color: '#64748b', fontSize: 14 } }, isOpen ? '▲' : '▼')
        ),

        // Entries
        isOpen && React.createElement('div', { style: { background: '#1e293b', borderRadius: '0 0 10px 10px', overflow: 'hidden' } },
          entries.map(function(a, i) {
            return React.createElement('div', {
              key: a.id,
              style: { padding: '12px 14px', borderBottom: i < entries.length - 1 ? '1px solid #0f172a' : 'none', display: 'flex', alignItems: 'flex-start', gap: 10 }
            },
              // Quarter icon
              React.createElement('div', { style: { fontSize: 20, flexShrink: 0, marginTop: 2 } }, a.paid ? '✅' : '📄'),
              // Info
              React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                React.createElement('div', { style: { fontWeight: 700, fontSize: 14 } }, a.invLabel || a.referenz),
                React.createElement('div', { style: { fontSize: 11, color: '#64748b' } }, a.leistungszeitraum),
                React.createElement('div', { style: { fontSize: 11, color: '#64748b' } }, 'Arquivado: ' + hwFmtDate(a.dateArchived)),
                a.paid && React.createElement('div', { style: { fontSize: 11, color: '#4ade80', marginTop: 2 } }, '✓ Pago em ' + hwFmtDate(a.datePaid))
              ),
              // Right side
              React.createElement('div', { style: { textAlign: 'right', flexShrink: 0 } },
                React.createElement('div', { style: { fontWeight: 700, fontSize: 15, color: a.paid ? '#22c55e' : '#f59e0b' } }, hwChf(a.total)),
                React.createElement('div', { style: { display: 'flex', gap: 5, marginTop: 8, justifyContent: 'flex-end' } },
                  !a.paid && React.createElement('button', {
                    onClick: function() { markPaid(a.id); },
                    style: { background: '#14532d', color: '#4ade80', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }
                  }, '✓ Pago'),
                  React.createElement('button', {
                    onClick: function() { delEntry(a.id); },
                    style: { background: '#450a0a', color: '#f87171', border: 'none', borderRadius: 6, padding: '5px 8px', fontSize: 12, cursor: 'pointer' }
                  }, '🗑️')
                )
              )
            );
          })
        )
      );
    })
  );
}

// ── PRINT VIEW ──
function HwPrintView(props) {
  var works = props.works, mats = props.mats, cfg = props.cfg, total = props.total;
  var pauschale = props.pauschale;
  var beschreibung = props.beschreibung, referenz = props.referenz, invNum = props.invNum;
  var leistungszeitraum = props.leistungszeitraum;
  var onBack = props.onBack, onNew = props.onNew;

  var _useStateScale = React.useState(1);
  var scale = _useStateScale[0], setScale = _useStateScale[1];

  React.useEffect(function() {
    var updateScreen = function() {
      var w = window.innerWidth;
      setScale(w < 820 ? (w - 16) / 794 : 1);
    };
    updateScreen();
    window.addEventListener('resize', updateScreen);
    var beforePrint = function() {
      var pp = document.getElementById('print-page');
      if (!pp) return;
      var A4H = Math.round(297 * 96 / 25.4);
      var h = pp.scrollHeight;
      if (h > A4H) {
        var s = (A4H / h).toFixed(4);
        pp.dataset.ps = s;
        pp.style.transform = 'scale(' + s + ')';
        pp.style.transformOrigin = 'top left';
        pp.style.height = Math.round(h * parseFloat(s)) + 'px';
      }
    };
    var afterPrint = function() {
      var pp = document.getElementById('print-page');
      if (pp && pp.dataset.ps) { pp.style.transform = ''; pp.style.height = ''; delete pp.dataset.ps; }
    };
    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
    return function() {
      window.removeEventListener('resize', updateScreen);
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint', afterPrint);
    };
  }, []);

  var invoiceDateObj = cfg.invoiceDate ? new Date(cfg.invoiceDate + 'T12:00:00') : new Date();
  var dateStr = invoiceDateObj.toLocaleDateString('de-CH');
  var faelligStr = hwPlus30Days(invoiceDateObj).toLocaleDateString('de-CH');

  var grupos = [
    {
      key: 'hauswartung', label: 'Hauswartung',
      rows: pauschale > 0 ? [{ titel: 'Hauswartung ' + cfg.quarter + ' ' + cfg.year, sub: 'Pauschale', betrag: pauschale }] : []
    },
    {
      key: 'dienstleistungen', label: 'Dienstleistungen',
      rows: works.slice().sort(function(a, b) { return new Date(a.date) - new Date(b.date); }).map(function(w) {
        return { titel: w.description, sub: hwFmtMonthYear(w.date), menge: w.hours, ansatz: w.rate, betrag: w.hours * w.rate };
      })
    },
    {
      key: 'material', label: 'Materialeinkauf',
      rows: mats.slice().sort(function(a, b) { return new Date(a.date) - new Date(b.date); }).map(function(m) {
        return { titel: m.description, sub: hwFmtDate(m.date), menge: m.menge, ansatz: m.ansatz, betrag: m.price };
      })
    }
  ].filter(function(g) { return g.rows.length > 0; });

  grupos.forEach(function(g) {
    g.sum = g.rows.reduce(function(a, r) { return a + Number(r.betrag || 0); }, 0);
  });

  var tbodyRows = [];
  grupos.forEach(function(g) {
    tbodyRows.push(React.createElement('tr', { key: g.key + '-head', className: 'section' },
      React.createElement('td', { colSpan: 4 }, g.label)
    ));
    g.rows.forEach(function(r, i) {
      tbodyRows.push(React.createElement('tr', { key: g.key + '-' + i },
        React.createElement('td', null,
          React.createElement('div', { className: 'pos-title' }, r.titel),
          r.sub && React.createElement('div', { className: 'pos-sub' }, r.sub)
        ),
        React.createElement('td', { className: 'num' }, r.menge ? r.menge : '—'),
        React.createElement('td', { className: 'num' }, r.ansatz ? fmtCHF(r.ansatz) : '—'),
        React.createElement('td', { className: 'num' }, fmtCHF(r.betrag))
      ));
    });
    tbodyRows.push(React.createElement('tr', { key: g.key + '-sub', className: 'subtotal' },
      React.createElement('td', { colSpan: 3 }, 'Zwischensumme ' + g.label),
      React.createElement('td', { className: 'num' }, fmtCHF(g.sum))
    ));
  });

  return React.createElement('div', { className: 'hw-print-outer', style: { background: '#94a3b8' } },
    // Toolbar
    React.createElement('div', { className: 'no-print', style: { background: '#1e293b', padding: '10px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 } },
      React.createElement('button', { onClick: onBack, style: { background: '#334155', color: '#94a3b8', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13 } }, '← Zurück'),
      React.createElement('button', { onClick: function() { window.print(); }, style: { background: '#1d4ed8', color: 'white', border: 'none', borderRadius: 8, padding: '8px 22px', cursor: 'pointer', fontSize: 14, fontWeight: 700 } }, '🖨️ Drucken / PDF'),
      React.createElement('button', {
        onClick: function() {
          var qrData = hwQrContent(cfg, total, referenz);
          var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&ecc=M&data=' + encodeURIComponent(qrData);
          var lz = leistungszeitraum;
          var w = window.open('', '_blank');
          var html = '<!DOCTYPE html><html><head>'
            + '<title>Zahlteil ' + referenz + '</title>'
            + '<meta name="viewport" content="width=device-width,initial-scale=1">'
            + '<style>'
            + '*{box-sizing:border-box;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;}'
            + 'body{background:#0f172a;}'
            + '.bar{background:#1e293b;padding:10px 14px;display:flex;gap:8px;align-items:center;position:sticky;top:0;}'
            + '.bp{background:#1d4ed8;color:white;border:none;border-radius:8px;padding:9px 20px;cursor:pointer;font-size:14px;font-weight:700;}'
            + '.bc{background:#334155;color:#94a3b8;border:none;border-radius:8px;padding:9px 12px;cursor:pointer;font-size:13px;}'
            + '.bi{color:#64748b;font-size:11px;}'
            + '.wrap{background:white;margin:12px;border-radius:8px;overflow:hidden;}'
            + '.cut{display:flex;align-items:center;gap:6px;padding:6px 8px;}'
            + '.cut span{font-size:14px;color:#444;}'
            + '.cut hr{flex:1;border:none;border-top:1px dashed #777;}'
            + '.slip{display:flex;border:1px solid #333;}'
            + '.emp{width:35%;padding:10px 8px;display:flex;flex-direction:column;border-right:1px solid #333;}'
            + '.zahl{flex:1;padding:10px 8px 10px 12px;display:flex;flex-direction:column;}'
            + '.qrimg{width:min(120px,35vw);height:min(120px,35vw);display:block;}'
            + '.lbl{font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:.3px;margin-bottom:2px;color:#000;}'
            + '.val{font-size:9px;line-height:1.45;color:#000;}'
            + '.big{font-size:11px;font-weight:700;color:#000;}'
            + '.row{display:flex;gap:10px;margin-top:6px;}'
            + '.col{display:flex;flex-direction:column;}'
            + '.spacer{flex:1;}'
            + '.annahme{font-size:6px;text-align:right;color:#000;margin-top:4px;}'
            + '@media print{'
            + '  @page{size:A4 portrait;margin:0;}'
            + '  .bar{display:none!important;}'
            + '  body{background:white;margin:0;padding:0;}'
            + '  .spacer-page{display:none;}'
            + '  .wrap{'
            + '    position:fixed;bottom:20mm;left:0;right:0;'
            + '    margin:0;border-radius:0;'
            + '  }'
            + '  .emp{width:62mm;padding:3mm 4mm;}'
            + '  .slip{height:105mm;}'
            + '  .lbl{font-size:6pt;}'
            + '  .val{font-size:8pt;}'
            + '  .big{font-size:10pt;}'
            + '  .qrimg{width:46mm!important;height:46mm!important;}'
            + '  *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}'
            + '}'
            + '@media screen{.spacer-page{display:none;}}'
            + '</style></head><body>'
            + '<div class="bar">'
            + '<button class="bp" onclick="window.print()">🖨️ Imprimir / PDF</button>'
            + '<button class="bc" onclick="window.close()">✕ Fechar</button>'
            + '<span class="bi">' + referenz + ' — CHF ' + total.toFixed(2) + '</span>'
            + '</div>'
            + '<div class="spacer-page"></div>'
            + '<div class="wrap">'
            + '<div class="cut"><span>✂</span><hr></div>'
            + '<div class="slip">'
            + '<div class="emp">'
            + '<div style="font-size:10px;font-weight:900;margin-bottom:6px;">Empfangsschein</div>'
            + '<div style="margin-bottom:6px;"><div class="lbl">Konto / Zahlbar an</div><div class="val">' + cfg.iban + '<br>' + cfg.name + '<br>' + cfg.address + '<br>' + cfg.city + '</div></div>'
            + '<div style="margin-bottom:6px;"><div class="lbl">Zahlbar durch</div><div style="border:.5pt solid #000;height:12mm;margin-top:2px;"></div></div>'
            + '<div class="spacer"></div>'
            + '<div class="row"><div class="col"><div class="lbl">Währung</div><div class="big">CHF</div></div><div class="col"><div class="lbl">Betrag</div><div class="big">' + total.toFixed(2) + '</div></div></div>'
            + '<div class="annahme">Annahmestelle</div>'
            + '</div>'
            + '<div class="zahl">'
            + '<div style="font-size:12px;font-weight:900;margin-bottom:6px;">Zahlteil</div>'
            + '<div style="display:flex;gap:8px;align-items:flex-start;">'
            + '<div><img src="' + qrUrl + '" class="qrimg" alt="QR"/>'
            + '<div class="row"><div class="col"><div class="lbl">Währung</div><div class="big">CHF</div></div><div class="col"><div class="lbl">Betrag</div><div class="big">' + total.toFixed(2) + '</div></div></div>'
            + '</div>'
            + '<div style="flex:1;min-width:0;">'
            + '<div style="margin-bottom:5px;"><div class="lbl">Konto / Zahlbar an</div><div class="val">' + cfg.iban + '<br>' + cfg.name + '<br>' + cfg.address + '<br>' + cfg.city + '</div></div>'
            + '<div style="margin-bottom:5px;"><div class="lbl">Zahlbar durch</div><div style="border:.5pt solid #000;height:12mm;margin-top:2px;"></div></div>'
            + '<div style="margin-bottom:4px;"><div class="lbl">Referenz</div><div class="val">' + referenz + '</div></div>'
            + '<div><div class="lbl">Leistungszeitraum</div><div class="val">' + lz + '</div></div>'
            + '</div></div>'
            + '</div>'
            + '</div></div>'
            + '</body></html>';
          w.document.write(html);
          w.document.close();
        },
        style: { background: '#7c3aed', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }
      }, '🖨️ Imprimir QR'),
      React.createElement('button', { onClick: onNew, style: { background: '#14532d', color: '#4ade80', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13 } }, '✓ Abgerechnet — Neue Rechnung')
    ),

    // A4
    React.createElement('div', { className: 'hw-scale-outer', style: { width: '100%', overflow: 'hidden', background: '#94a3b8', paddingBottom: 32 } },
      React.createElement('div', { className: 'hw-scale-inner', style: { width: 794, transformOrigin: 'top left', transform: 'scale(' + scale + ')', height: scale < 1 ? (1123 * scale) + 'px' : 'auto' } },
        React.createElement('div', { id: 'print-page', className: 'page' },
          React.createElement('div', { className: 'body-flex' },
            // Absender + Titel
            React.createElement('div', { className: 'top' },
              React.createElement('div', { className: 'sender' },
                React.createElement('div', { className: 'name' }, cfg.name),
                React.createElement('div', { className: 'line' }, cfg.address),
                React.createElement('div', { className: 'line' }, cfg.city),
                cfg.phone && React.createElement('div', { className: 'line' }, cfg.phone),
                cfg.email && React.createElement('div', { className: 'line' }, cfg.email)
              ),
              React.createElement('div', { className: 'doctype' },
                React.createElement('h1', null, 'Rechnung'),
                React.createElement('div', { className: 'nr' }, invNum),
                React.createElement('div', { className: 'place' }, 'Selzach, ' + dateStr)
              )
            ),
            React.createElement('div', { className: 'rule' }),

            // Empfänger + Details
            React.createElement('div', { className: 'band' },
              React.createElement('div', null,
                React.createElement('div', { className: 'eyebrow' }, 'Rechnungsempfänger'),
                React.createElement('div', { className: 'recipient' },
                  React.createElement('div', { className: 'org' }, cfg.clientName),
                  cfg.clientContact && React.createElement('div', null, cfg.clientContact),
                  React.createElement('div', null, cfg.clientAddress),
                  React.createElement('div', null, cfg.clientCity)
                )
              ),
              React.createElement('dl', { className: 'meta' },
                [['Rechnungsnummer', invNum], ['Rechnungsdatum', dateStr], ['Fällig bis', faelligStr], ['Leistungszeitraum', leistungszeitraum], ['Arbeitsort', cfg.location]].map(function(row) {
                  return React.createElement('div', { key: row[0] },
                    React.createElement('dt', null, row[0]),
                    React.createElement('dd', null, row[1])
                  );
                })
              )
            ),

            // Betreff
            React.createElement('p', { className: 'subject' },
              React.createElement('strong', null, 'Hauswartung ' + cfg.quarter + '. Quartal ' + cfg.year),
              React.createElement('br', null),
              beschreibung
            ),

            // POSITIONEN
            React.createElement('table', null,
              React.createElement('thead', null,
                React.createElement('tr', null,
                  React.createElement('th', null, 'Position'),
                  React.createElement('th', { className: 'num' }, 'Menge'),
                  React.createElement('th', { className: 'num' }, 'Ansatz'),
                  React.createElement('th', { className: 'num' }, 'Betrag CHF')
                )
              ),
              React.createElement('tbody', null, tbodyRows)
            ),

            // TOTAL
            React.createElement('div', { className: 'totals' },
              React.createElement('div', { className: 'box' },
                grupos.map(function(g) {
                  return React.createElement('div', { className: 'row', key: g.key },
                    React.createElement('span', null, g.label),
                    React.createElement('span', null, fmtCHF(g.sum))
                  );
                }),
                React.createElement('div', { className: 'grand' },
                  React.createElement('span', { className: 'lbl' }, 'Total CHF'),
                  React.createElement('span', { className: 'val' }, fmtCHF(total))
                ),
                React.createElement('div', { className: 'note' }, 'Ohne Mehrwertsteuer — nicht steuerpflichtig')
              )
            ),

            // BANK
            React.createElement('div', { className: 'pay' },
              React.createElement('div', null,
                React.createElement('div', { className: 'eyebrow' }, 'Zahlbar an'),
                React.createElement('div', { className: 'iban' }, cfg.iban),
                React.createElement('div', null, cfg.bank + ' · ' + cfg.name)
              ),
              React.createElement('div', { className: 'term' },
                React.createElement('div', { className: 'eyebrow' }, 'Zahlungsfrist'),
                React.createElement('div', null, '30 Tage netto, bis ' + faelligStr),
                React.createElement('div', { className: 'ref' }, 'Referenz: ' + referenz)
              )
            )
          ), // body-flex

          // FOOTER
          React.createElement('footer', null,
            React.createElement('span', null, 'Vielen Dank für Ihr Vertrauen.'),
            React.createElement('span', null, cfg.name + ' · ' + cfg.city + ' · Seite 1/1')
          )
        ) // #print-page
      ) // scale wrapper
    ), // outer grey bg

    // ── ZAHLTEIL: separate page, bottom-aligned ──
    React.createElement('div', { className: 'hw-zahlteil-print', style: { display: 'none' } },
      React.createElement('div', { id: 'zahlteil-page' },
        React.createElement(HwZahlteil, { cfg: cfg, total: total, referenz: referenz, leistungszeitraum: leistungszeitraum })
      )
    ),

    React.createElement('style', null,
      '#print-page.page, #print-page.page *{box-sizing:border-box;}' +
      '#print-page.page{width:210mm;min-height:297mm;padding:18mm 18mm 14mm;display:flex;flex-direction:column;background:#fff;font-family:Helvetica,Arial,"Helvetica Neue",sans-serif;color:#14181d;box-shadow:0 8px 40px rgba(0,0,0,.3);}' +
      '#print-page .body-flex{flex:1;}' +
      '#print-page .top{display:flex;justify-content:space-between;align-items:flex-start;}' +
      '#print-page .sender{font-size:9.5pt;line-height:1.5;}' +
      '#print-page .sender .name{font-weight:700;font-size:10.5pt;}' +
      '#print-page .sender .line{color:#6b7280;}' +
      '#print-page .doctype{text-align:right;}' +
      '#print-page .doctype h1{margin:0;font-size:17pt;font-weight:600;letter-spacing:.22em;text-transform:uppercase;}' +
      '#print-page .doctype .nr{margin-top:4px;font-size:10pt;font-weight:600;color:#1d4ed8;font-variant-numeric:tabular-nums;}' +
      '#print-page .doctype .place{margin-top:2px;font-size:9pt;color:#6b7280;}' +
      '#print-page .rule{height:1px;background:#14181d;margin-top:12px;}' +
      '#print-page .band{display:flex;justify-content:space-between;margin-top:18px;}' +
      '#print-page .eyebrow{font-size:7.5pt;letter-spacing:.14em;text-transform:uppercase;color:#6b7280;margin-bottom:5px;}' +
      '#print-page .recipient{font-size:10pt;line-height:1.5;}' +
      '#print-page .recipient .org{font-weight:700;}' +
      '#print-page .meta{width:76mm;font-size:9pt;border-top:1px solid #dfe3e8;margin:0;}' +
      '#print-page .meta div{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #dfe3e8;}' +
      '#print-page .meta dt{color:#6b7280;}' +
      '#print-page .meta dd{margin:0;text-align:right;font-weight:600;font-variant-numeric:tabular-nums;}' +
      '#print-page .subject{margin-top:18px;font-size:10pt;line-height:1.55;}' +
      '#print-page table{width:100%;border-collapse:collapse;margin-top:14px;font-size:9.5pt;}' +
      '#print-page thead th{font-size:7.5pt;letter-spacing:.12em;text-transform:uppercase;color:#6b7280;font-weight:600;text-align:left;padding:0 0 5px;border-bottom:1px solid #14181d;}' +
      '#print-page thead th.num{text-align:right;}' +
      '#print-page tr.section td{padding:14px 0 5px;font-size:7.5pt;letter-spacing:.14em;text-transform:uppercase;font-weight:700;border-bottom:1px solid #14181d;}' +
      '#print-page tbody td{padding:8px 0;border-bottom:1px solid #dfe3e8;vertical-align:top;}' +
      '#print-page tbody td.num{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;}' +
      '#print-page .pos-title{font-weight:600;}' +
      '#print-page .pos-sub{color:#6b7280;font-size:8pt;margin-top:2px;}' +
      '#print-page tr.subtotal td{padding:6px 0;border-bottom:0;color:#6b7280;font-size:8.5pt;}' +
      '#print-page tr.subtotal td.num{color:#14181d;font-weight:600;}' +
      '#print-page tr{break-inside:avoid;page-break-inside:avoid;}' +
      '#print-page .totals{margin-top:14px;display:flex;justify-content:flex-end;}' +
      '#print-page .totals .box{width:76mm;}' +
      '#print-page .totals .row{display:flex;justify-content:space-between;padding:4px 0;font-size:9pt;color:#6b7280;}' +
      '#print-page .totals .row span:last-child{color:#14181d;font-variant-numeric:tabular-nums;}' +
      '#print-page .totals .grand{display:flex;justify-content:space-between;align-items:baseline;margin-top:5px;padding-top:8px;border-top:2px solid #14181d;}' +
      '#print-page .totals .grand .lbl{font-size:9pt;font-weight:700;letter-spacing:.08em;text-transform:uppercase;}' +
      '#print-page .totals .grand .val{font-size:15pt;font-weight:700;font-variant-numeric:tabular-nums;}' +
      '#print-page .totals .note{margin-top:5px;font-size:8pt;color:#6b7280;text-align:right;}' +
      '#print-page .pay{margin-top:20px;padding-top:12px;border-top:1px solid #dfe3e8;display:flex;justify-content:space-between;font-size:9pt;line-height:1.55;}' +
      '#print-page .pay .iban{font-family:"Courier New",monospace;font-size:9.5pt;letter-spacing:.04em;}' +
      '#print-page .pay .term{text-align:right;}' +
      '#print-page .pay .term .ref{font-weight:700;margin-top:2px;}' +
      '#print-page footer{margin-top:auto;padding-top:12px;border-top:1px solid #dfe3e8;display:flex;justify-content:space-between;font-size:8pt;color:#6b7280;}'
    ),
    React.createElement('style', null,
      '@media print {' +
      '  @page { size: A4 portrait; margin: 0; }' +
      '  .no-print { display: none !important; }' +
      '  body { margin: 0 !important; padding: 0 !important; background: white !important; }' +
      '  .hw-print-outer { background: white !important; }' +
      '  .hw-scale-outer { background: white !important; padding: 0 !important; width: 100% !important; overflow: visible !important; }' +
      '  .hw-scale-inner { transform: none !important; width: 100% !important; height: auto !important; }' +
      '  #print-page.page { box-shadow: none !important; } ' +
      '  .hw-zahlteil-print { display: block !important; background: white !important; }' +
      '  #zahlteil-page { background: white !important; }' +
      '  #zahlteil-page > div { background: white !important; width: 100% !important; }' +
      '  #zahlteil-page {' +
      '    page-break-before: always;' +
      '    break-before: always;' +
      '    width: 100%;' +
      '    height: 297mm;' +
      '    display: flex;' +
      '    flex-direction: column;' +
      '    justify-content: flex-end;' +
      '  }' +
      '  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }' +
      '}'
    )
  );
}

// ── SWISS QR BILL (Zahlteil) ──────────────────────────────────────────

function hwQrContent(cfg, total, referenz) {
  var iban = (cfg.iban || '').replace(/\s/g, '');
  return [
    'SPC', '0200', '1',
    iban,
    'K', cfg.name || '', cfg.address || '', cfg.city || '', '', '', 'CH',
    '', '', '', '', '', '', '',
    total.toFixed(2), 'CHF',
    '', '', '', '', '', '', '',
    'NON', '',
    referenz || '',
    'EPD'
  ].join('\n');
}

function HwZahlteil(props) {
  var cfg = props.cfg, total = props.total, referenz = props.referenz, leistungszeitraum = props.leistungszeitraum;

  var qrData = hwQrContent(cfg, total, referenz);
  var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=175x175&ecc=M&data=' + encodeURIComponent(qrData);

  var F = { fontFamily: 'Arial, Helvetica, sans-serif', color: '#000' };
  var label = function(t) { return React.createElement('div', { style: Object.assign({}, F, { fontSize: 7, fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }) }, t); };
  var val = function(t) { return React.createElement('div', { style: Object.assign({}, F, { fontSize: 9, lineHeight: 1.5 }) }, t); };

  // Empfangsschein (left)
  var emp = React.createElement('div', { style: { width: 178, padding: '5mm 4mm 5mm 4mm', display: 'flex', flexDirection: 'column', gap: '3mm', boxSizing: 'border-box' } },
    React.createElement('div', { style: Object.assign({}, F, { fontSize: 11, fontWeight: 900, marginBottom: '1mm' }) }, 'Empfangsschein'),
    React.createElement('div', null,
      label('Konto / Zahlbar an'),
      val(cfg.iban), val(cfg.name), val(cfg.address), val(cfg.city)
    ),
    React.createElement('div', null,
      label('Zahlbar durch'),
      React.createElement('div', { style: { border: '0.75px solid #000', height: 28, marginTop: 3 } })
    ),
    React.createElement('div', { style: { flex: 1 } }),
    React.createElement('div', { style: { display: 'flex', gap: 12 } },
      React.createElement('div', null, label('Währung'), React.createElement('div', { style: Object.assign({}, F, { fontSize: 11, fontWeight: 700 }) }, 'CHF')),
      React.createElement('div', null, label('Betrag'), React.createElement('div', { style: Object.assign({}, F, { fontSize: 11, fontWeight: 700 }) }, total.toFixed(2)))
    ),
    React.createElement('div', { style: Object.assign({}, F, { fontSize: 7, textAlign: 'right', marginTop: '3mm' }) }, 'Annahmestelle')
  );

  // Zahlteil (right)
  var zahl = React.createElement('div', { style: { flex: 1, padding: '5mm 5mm 5mm 10mm', display: 'flex', flexDirection: 'column', gap: '3mm', boxSizing: 'border-box' } },
    React.createElement('div', { style: Object.assign({}, F, { fontSize: 14, fontWeight: 900, marginBottom: '1mm' }) }, 'Zahlteil'),
    React.createElement('div', { style: { display: 'flex', gap: '5mm', alignItems: 'flex-start' } },
      // QR code block
      React.createElement('div', null,
        React.createElement('img', {
          src: qrUrl, width: 133, height: 133, alt: 'Swiss QR',
          style: { display: 'block', border: '1px solid #e0e0e0' }
        }),
        React.createElement('div', { style: { display: 'flex', gap: 12, marginTop: '4mm' } },
          React.createElement('div', null, label('Währung'), React.createElement('div', { style: Object.assign({}, F, { fontSize: 12, fontWeight: 700 }) }, 'CHF')),
          React.createElement('div', null, label('Betrag'), React.createElement('div', { style: Object.assign({}, F, { fontSize: 12, fontWeight: 700 }) }, total.toFixed(2)))
        )
      ),
      // Info right of QR
      React.createElement('div', { style: { flex: 1 } },
        React.createElement('div', { style: { marginBottom: '3mm' } },
          label('Konto / Zahlbar an'),
          val(cfg.iban), val(cfg.name), val(cfg.address), val(cfg.city)
        ),
        React.createElement('div', { style: { marginBottom: '3mm' } },
          label('Zahlbar durch'),
          React.createElement('div', { style: { border: '0.75px solid #000', height: 32, width: '85%', marginTop: 3 } })
        ),
        referenz && React.createElement('div', null,
          label('Referenz'),
          val(referenz)
        ),
        leistungszeitraum && React.createElement('div', { style: { marginTop: '2mm' } },
          label('Leistungszeitraum'),
          val(leistungszeitraum)
        )
      )
    )
  );

  return React.createElement('div', { style: { width: 794, background: 'white', fontFamily: 'Arial', marginTop: 0 } },
    // Scissors line
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', padding: '6px 12px', gap: 8 } },
      React.createElement('span', { style: { fontSize: 16, color: '#555' } }, '✂'),
      React.createElement('div', { style: { flex: 1, borderTop: '1px dashed #888' } })
    ),
    // Payment slip
    React.createElement('div', { style: { display: 'flex', border: '1px solid #555', borderTop: 'none', minHeight: 105 * 3.78 } },
      emp,
      React.createElement('div', { style: { width: 1, background: '#555', flexShrink: 0 } }),
      zahl
    )
  );
}
