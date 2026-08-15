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
function HwDatePick(props) {
  var label = props.label, value = props.value, onChange = props.onChange;
  var parts = value ? value.split('-') : [];
  var y = parts[0] || String(new Date().getFullYear());
  var m = parts[1] || String(new Date().getMonth()+1).padStart(2,'0');
  var d = parts[2] || String(new Date().getDate()).padStart(2,'0');
  var daysInMonth = new Date(parseInt(y), parseInt(m), 0).getDate();
  var emit = function(ny, nm, nd) {
    var dd = Math.min(parseInt(nd), new Date(parseInt(ny), parseInt(nm), 0).getDate());
    onChange(ny + '-' + String(nm).padStart(2,'0') + '-' + String(dd).padStart(2,'0'));
  };
  var selStyle = { background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '9px 6px', color: '#f1f5f9', fontSize: 14, flex: 1, outline: 'none' };
  return React.createElement('div', { style: { marginBottom: 12 } },
    React.createElement('label', { style: { display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 } }, label),
    React.createElement('div', { style: { display: 'flex', gap: 6 } },
      React.createElement('select', { value: d, onChange: function(e) { emit(y, m, e.target.value); }, style: selStyle },
        Array.from({ length: daysInMonth }, function(_, i) { return i+1; }).map(function(n) {
          return React.createElement('option', { key: n, value: String(n).padStart(2,'0') }, n);
        })
      ),
      React.createElement('select', { value: m, onChange: function(e) { emit(y, e.target.value, d); }, style: selStyle },
        HW_MONTHS.map(function(name, i) {
          return React.createElement('option', { key: i, value: String(i+1).padStart(2,'0') }, name);
        })
      ),
      React.createElement('select', { value: y, onChange: function(e) { emit(e.target.value, m, d); }, style: selStyle },
        [2024,2025,2026,2027,2028].map(function(yr) {
          return React.createElement('option', { key: yr, value: yr }, yr);
        })
      )
    ),
    value && React.createElement('div', { style: { fontSize: 11, color: '#64748b', marginTop: 3 } },
      '✓ ', new Date(value + 'T12:00:00').toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
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
  var _useStatePrint = React.useState(false);
  var printMode = _useStatePrint[0], setPrint = _useStatePrint[1];

  var updW = function(v) { setWorksRaw(v); hwSave('works', v); };
  var updM = function(v) { setMatsRaw(v); hwSave('mats', v); };
  var updC = function(v) { setCfgRaw(v); hwSave('cfg', v); };
  var updA = function(v) { setArchiveRaw(v); hwSave('archive', v); };

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
      React.createElement('div', { style: S.secLabel }, '🔧 Zusätzliche Arbeit (' + works.length + ')'),
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
      React.createElement('div', { style: S.secLabel }, '🛒 Reise, Zeit & Material (' + mats.length + ')'),
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
  var totalWork = props.totalWork, totalMats = props.totalMats, pauschale = props.pauschale;
  var beschreibung = props.beschreibung, referenz = props.referenz, invLabel = props.invLabel;
  var leistungszeitraum = props.leistungszeitraum;
  var onBack = props.onBack, onNew = props.onNew;

  var _useStateScale = React.useState(1);
  var scale = _useStateScale[0], setScale = _useStateScale[1];

  React.useEffect(function() {
    var update = function() {
      var w = window.innerWidth;
      setScale(w < 820 ? (w - 16) / 794 : 1);
    };
    update();
    window.addEventListener('resize', update);
    return function() { window.removeEventListener('resize', update); };
  }, []);

  var dateStr = cfg.invoiceDate
    ? new Date(cfg.invoiceDate + 'T12:00:00').toLocaleDateString('de-CH')
    : new Date().toLocaleDateString('de-CH');

  var Row = function(rp) {
    return React.createElement('div', { style: { display: 'flex', alignItems: 'flex-start', padding: '11px 16px', borderBottom: '1px solid #e8edf8', background: rp.shade ? '#f5f7ff' : 'white' } },
      React.createElement('div', { style: { flex: 1, paddingRight: 20 } },
        React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: '#111' } }, rp.label),
        rp.sub && React.createElement('div', { style: { fontSize: 11, color: '#777', marginTop: 2 } }, rp.sub)
      ),
      React.createElement('div', { style: { minWidth: 110, textAlign: 'right', fontWeight: 700, fontSize: 13, color: '#111', whiteSpace: 'nowrap' } }, rp.value)
    );
  };

  var SecHead = function(sp) {
    return React.createElement('div', { style: { background: '#1d4ed8', padding: '7px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
      React.createElement('span', { style: { color: 'white', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 } }, sp.title),
      React.createElement('span', { style: { color: '#93c5fd', fontWeight: 600, fontSize: 10, textTransform: 'uppercase' } }, 'Betrag CHF')
    );
  };

  var SubTotal = function(stp) {
    return React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '8px 16px', background: '#eef2ff', borderTop: '1px solid #c7d2fe' } },
      React.createElement('span', { style: { fontSize: 11, fontWeight: 700, color: '#3730a3' } }, stp.label),
      React.createElement('span', { style: { fontSize: 12, fontWeight: 800, color: '#3730a3', whiteSpace: 'nowrap' } }, stp.value)
    );
  };

  return React.createElement('div', { style: { background: '#94a3b8' } },
    // Toolbar
    React.createElement('div', { className: 'no-print', style: { background: '#1e293b', padding: '10px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 } },
      React.createElement('button', { onClick: onBack, style: { background: '#334155', color: '#94a3b8', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13 } }, '← Zurück'),
      React.createElement('button', { onClick: function() { window.print(); }, style: { background: '#1d4ed8', color: 'white', border: 'none', borderRadius: 8, padding: '8px 22px', cursor: 'pointer', fontSize: 14, fontWeight: 700 } }, '🖨️ Drucken / PDF'),
      React.createElement('button', {
        onClick: function() {
          var qrData = hwQrContent(cfg, total, referenz);
          var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&ecc=M&data=' + encodeURIComponent(qrData);
          var w = window.open('', '_blank');
          w.document.write('<!DOCTYPE html><html><head><title>QR ' + referenz + '</title>'
            + '<meta name="viewport" content="width=device-width,initial-scale=1">'
            + '<style>'
            + '*{box-sizing:border-box;margin:0;padding:0;}'
            + 'body{background:#0f172a;display:flex;flex-direction:column;align-items:center;font-family:Arial,sans-serif;gap:18px;padding:28px 16px;min-height:100vh;}'
            + '.qr{background:white;padding:20px;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.6);width:calc(100vw - 60px);max-width:340px;}'
            + '.qr img{display:block;width:100%;height:auto;}'
            + '.ref{color:#60a5fa;font-weight:700;font-size:17px;text-align:center;}'
            + '.amt{color:#4ade80;font-weight:800;font-size:26px;text-align:center;}'
            + '.info{color:#94a3b8;font-size:12px;text-align:center;line-height:1.7;}'
            + '.btn{background:#3b82f6;color:white;border:none;border-radius:12px;padding:14px 0;font-size:16px;font-weight:700;cursor:pointer;text-decoration:none;display:block;width:calc(100vw - 60px);max-width:340px;text-align:center;}'
            + '.tip{color:#475569;font-size:11px;text-align:center;}'
            + '</style></head><body>'
            + '<div class="qr"><img src="' + qrUrl + '" alt="Swiss QR ' + referenz + '"/></div>'
            + '<div class="ref">' + referenz + '</div>'
            + '<div class="amt">CHF ' + total.toFixed(2) + '</div>'
            + '<div class="info">Swiss QR-Rechnung<br>' + cfg.name + '<br>IBAN: ' + cfg.iban + '</div>'
            + '<a href="' + qrUrl + '" download="QR-' + referenz.replace(/\s/g, '-') + '.png" class="btn">⬇️ Guardar imagem</a>'
            + '<div class="tip">Ou pressiona longamente a imagem para guardar</div>'
            + '</body></html>');
          w.document.close();
        },
        style: { background: '#0891b2', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }
      }, '⬇️ Guardar QR'),
      React.createElement('button', {
        onClick: function() {
          var qrData = hwQrContent(cfg, total, referenz);
          var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&ecc=M&data=' + encodeURIComponent(qrData);
          var lz = leistungszeitraum;
          var w = window.open('', '_blank');
          var html = '<!DOCTYPE html><html><head><title>Zahlteil ' + referenz + '</title>'
            + '<meta name="viewport" content="width=device-width,initial-scale=1">'
            + '<style>'
            + '* { box-sizing: border-box; margin: 0; padding: 0; }'
            + '.no-print { background: #1e293b; padding: 10px 14px; display: flex; gap: 8px; align-items: center; }'
            + '.btn-print { background: #1d4ed8; color: white; border: none; border-radius: 8px; padding: 9px 20px; cursor: pointer; font-size: 14px; font-weight: 700; }'
            + '.btn-close { background: #334155; color: #94a3b8; border: none; border-radius: 8px; padding: 9px 12px; cursor: pointer; font-size: 13px; }'
            + '.info-bar { background: #1e293b; padding: 6px 14px; font-size: 12px; color: #64748b; }'
            + '.zahlteil-wrap { max-width: 210mm; margin: 0 auto; background: white; }'
            + '.scissors { display: flex; align-items: center; gap: 6px; padding: 6px 4px; }'
            + '.scissors span { font-size: 13px; color: #444; }'
            + '.scissors hr { flex: 1; border: none; border-top: 1px dashed #777; }'
            + '.slip { display: flex; border: 0.5pt solid #333; min-height: 105mm; }'
            + '.emp { width: 62mm; padding: 3mm 4mm; display: flex; flex-direction: column; border-right: 0.5pt solid #333; }'
            + '.zahl { flex: 1; padding: 3mm 4mm 3mm 8mm; display: flex; flex-direction: column; }'
            + '.lbl { font-size: 6pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 1mm; color: #000; font-family: Arial; }'
            + '.val { font-size: 8pt; line-height: 1.45; color: #000; font-family: Arial; }'
            + '.big { font-size: 10pt; font-weight: 700; color: #000; font-family: Arial; }'
            + '.row { display: flex; gap: 6mm; }'
            + '.col { display: flex; flex-direction: column; }'
            + '.grow { flex: 1; }'
            + '@media print {'
            + '  @page { size: A4 portrait; margin: 0; }'
            + '  .no-print { display: none !important; }'
            + '  .info-bar { display: none !important; }'
            + '  .print-spacer { display: block; height: 192mm; }'
            + '  body { margin: 0; background: white; }'
            + '  .zahlteil-wrap { max-width: 100%; }'
            + '  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }'
            + '}'
            + '@media screen {'
            + '  body { background: #0f172a; }'
            + '  .print-spacer { display: none; }'
            + '}'
            + '</style></head><body>'
            + '<div class="no-print">'
            + '<button class="btn-print" onclick="window.print()">🖨️ Imprimir / PDF</button>'
            + '<button class="btn-close" onclick="window.close()">✕ Fechar</button>'
            + '</div>'
            + '<div class="info-bar">Zahlteil — ' + referenz + ' — CHF ' + total.toFixed(2) + '</div>'
            + '<div class="print-spacer"></div>'
            + '<div class="zahlteil-wrap">'
            + '<div class="scissors"><span>✂</span><hr></div>'
            + '<div class="slip">'
            + '<div class="emp">'
            + '<div style="font-size:9pt;font-weight:900;margin-bottom:2mm;font-family:Arial;">Empfangsschein</div>'
            + '<div style="margin-bottom:2mm;"><div class="lbl">Konto / Zahlbar an</div><div class="val">' + cfg.iban + '<br>' + cfg.name + '<br>' + cfg.address + '<br>' + cfg.city + '</div></div>'
            + '<div style="margin-bottom:2mm;"><div class="lbl">Zahlbar durch</div><div style="border:0.5pt solid #000;height:15mm;margin-top:1mm;"></div></div>'
            + '<div class="grow"></div>'
            + '<div class="row"><div class="col"><div class="lbl">Währung</div><div class="big">CHF</div></div><div class="col"><div class="lbl">Betrag</div><div class="big">' + total.toFixed(2) + '</div></div></div>'
            + '<div style="font-size:6pt;text-align:right;margin-top:2mm;font-family:Arial;">Annahmestelle</div>'
            + '</div>'
            + '<div class="zahl">'
            + '<div style="font-size:11pt;font-weight:900;margin-bottom:2mm;font-family:Arial;">Zahlteil</div>'
            + '<div style="display:flex;gap:5mm;align-items:flex-start;">'
            + '<div><img src="' + qrUrl + '" style="width:46mm;height:46mm;display:block;" alt="Swiss QR"/>'
            + '<div class="row" style="margin-top:2mm;"><div class="col"><div class="lbl">Währung</div><div class="big">CHF</div></div><div class="col"><div class="lbl">Betrag</div><div class="big">' + total.toFixed(2) + '</div></div></div>'
            + '</div>'
            + '<div style="flex:1;">'
            + '<div style="margin-bottom:2mm;"><div class="lbl">Konto / Zahlbar an</div><div class="val">' + cfg.iban + '<br>' + cfg.name + '<br>' + cfg.address + '<br>' + cfg.city + '</div></div>'
            + '<div style="margin-bottom:2mm;"><div class="lbl">Zahlbar durch</div><div style="border:0.5pt solid #000;height:18mm;width:85%;margin-top:1mm;"></div></div>'
            + '<div style="margin-bottom:1.5mm;"><div class="lbl">Referenz</div><div class="val">' + referenz + '</div></div>'
            + '<div><div class="lbl">Leistungszeitraum</div><div class="val">' + lz + '</div></div>'
            + '</div></div>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '</body></html>';
          w.document.write(html);
          w.document.close();
        },
        style: { background: '#7c3aed', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }
      }, '🖨️ Imprimir QR'),
      React.createElement('button', { onClick: onNew, style: { background: '#14532d', color: '#4ade80', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13 } }, '✓ Abgerechnet — Neue Rechnung')
    ),

    // A4
    React.createElement('div', { style: { width: '100%', overflow: 'hidden', background: '#94a3b8', paddingBottom: 32 } },
      React.createElement('div', { style: { width: 794, transformOrigin: 'top left', transform: 'scale(' + scale + ')', height: scale < 1 ? (1123 * scale) + 'px' : 'auto' } },
        React.createElement('div', { id: 'print-page', style: { width: 794, background: 'white', boxShadow: '0 8px 40px rgba(0,0,0,0.3)', fontFamily: 'Arial, Helvetica, sans-serif', color: '#111', display: 'flex', flexDirection: 'column', minHeight: 1123 } },

          // KOPF
          React.createElement('div', { style: { padding: '40px 52px 0' } },
            // Absender + Titel
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 } },
              React.createElement('div', { style: { lineHeight: 1.7, fontSize: 12 } },
                React.createElement('div', { style: { fontWeight: 700, fontSize: 15, marginBottom: 2 } }, cfg.name),
                React.createElement('div', { style: { color: '#444' } }, cfg.address),
                React.createElement('div', { style: { color: '#444' } }, cfg.city),
                cfg.phone && React.createElement('div', { style: { color: '#444' } }, 'Tel. ' + cfg.phone),
                cfg.email && React.createElement('div', { style: { color: '#444' } }, cfg.email)
              ),
              React.createElement('div', { style: { textAlign: 'right' } },
                React.createElement('div', { style: { fontSize: 40, fontWeight: 900, letterSpacing: 4, color: '#1d4ed8', lineHeight: 1 } }, 'RECHNUNG'),
                React.createElement('div', { style: { fontSize: 17, fontWeight: 700, color: '#334155', marginTop: 8 } }, invLabel),
                React.createElement('div', { style: { fontSize: 12, color: '#64748b', marginTop: 4 } }, 'Selzach, ' + dateStr)
              )
            ),
            // Gradient line
            React.createElement('div', { style: { height: 4, background: 'linear-gradient(90deg,#1d4ed8 0%,#3b82f6 60%,#93c5fd 100%)', borderRadius: 2, marginBottom: 28 } }),
            // Empfänger + Details
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 } },
              React.createElement('div', null,
                React.createElement('div', { style: { fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 } }, 'Rechnungsempfänger'),
                React.createElement('div', { style: { fontWeight: 700, fontSize: 15 } }, cfg.clientName),
                cfg.clientContact && React.createElement('div', { style: { fontSize: 13, color: '#444', marginTop: 2 } }, cfg.clientContact),
                React.createElement('div', { style: { fontSize: 13, color: '#444', marginTop: 2 } }, cfg.clientAddress),
                React.createElement('div', { style: { fontSize: 13, color: '#444', marginTop: 2 } }, cfg.clientCity)
              ),
              React.createElement('div', { style: { background: '#f0f5ff', border: '1px solid #dde8f8', borderRadius: 8, padding: '16px 22px', minWidth: 250, fontSize: 12 } },
                [['Rechnungsnummer', invLabel], ['Rechnungsdatum', dateStr], ['Leistungszeitraum', leistungszeitraum], ['Referenz', referenz], ['Arbeitsort', cfg.location]].map(function(row) {
                  return React.createElement('div', { key: row[0], style: { display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 6 } },
                    React.createElement('span', { style: { color: '#64748b', whiteSpace: 'nowrap' } }, row[0]),
                    React.createElement('span', { style: { fontWeight: 700, textAlign: 'right', color: row[0] === 'Referenz' ? '#1d4ed8' : '#111' } }, row[1])
                  );
                })
              )
            ),
            // Betreff
            React.createElement('div', { style: { background: '#eff6ff', borderLeft: '5px solid #1d4ed8', borderRadius: '0 6px 6px 0', padding: '13px 18px', marginBottom: 28, fontSize: 13, lineHeight: 1.75, color: '#1e3a8a', fontWeight: 500 } },
              beschreibung
            )
          ),

          // POSITIONEN
          React.createElement('div', { style: { paddingLeft: 52, paddingRight: 52 } },
            React.createElement('div', { style: { border: '1px solid #dde6f8', borderRadius: 8, overflow: 'hidden' } },
              pauschale > 0 && React.createElement('div', null,
                React.createElement(SecHead, { title: 'Hauswartung' }),
                React.createElement(Row, { label: 'Hauswartung ' + cfg.quarter + ' ' + cfg.year, value: pauschale.toFixed(2), sub: cfg.location })
              ),
              works.length > 0 && React.createElement('div', null,
                React.createElement(SecHead, { title: 'Dienstleistungen' }),
                works.sort(function(a,b) { return new Date(a.date)-new Date(b.date); }).map(function(w, i) {
                  return React.createElement(Row, { key: w.id, label: w.description, value: (w.hours * w.rate).toFixed(2), sub: hwFmtDate(w.date) + ' · ' + w.hours + ' Std. × CHF ' + w.rate + '.–', shade: i % 2 === 1 });
                }),
                works.length > 1 && React.createElement(SubTotal, { label: 'Zwischensumme Dienstleistungen', value: totalWork.toFixed(2) })
              ),
              mats.length > 0 && React.createElement('div', null,
                React.createElement(SecHead, { title: 'Reise, Zeit & Materialeinkauf' }),
                mats.sort(function(a,b) { return new Date(a.date)-new Date(b.date); }).map(function(m, i) {
                  return React.createElement(Row, { key: m.id, label: m.description, value: m.price.toFixed(2), sub: hwFmtDate(m.date), shade: i % 2 === 1 });
                }),
                mats.length > 1 && React.createElement(SubTotal, { label: 'Zwischensumme Material', value: totalMats.toFixed(2) })
              ),
              React.createElement('div', { style: { height: 4, background: 'linear-gradient(90deg,#1d4ed8 0%,#93c5fd 100%)' } })
            )
          ),

          // SPACER
          React.createElement('div', { style: { flex: 1, minHeight: 40 } }),

          // TOTAL + BANK + FOOTER
          React.createElement('div', { style: { padding: '0 52px 40px' } },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', marginBottom: 22 } },
              React.createElement('div', { style: { background: '#1d4ed8', borderRadius: 10, padding: '20px 36px', display: 'flex', alignItems: 'center', gap: 40 } },
                React.createElement('div', null,
                  React.createElement('div', { style: { color: '#bfdbfe', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 } }, 'Gesamtbetrag'),
                  React.createElement('div', { style: { color: '#93c5fd', fontSize: 11 } }, 'Ohne Mehrwertsteuer (nicht steuerpflichtig)')
                ),
                React.createElement('div', { style: { color: 'white', fontSize: 32, fontWeight: 900, whiteSpace: 'nowrap', letterSpacing: 1 } }, hwChf(total))
              )
            ),
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8faff', border: '1px solid #dde6f8', borderRadius: 8, padding: '16px 24px', marginBottom: 22 } },
              React.createElement('div', null,
                React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 } }, 'Bankverbindung'),
                React.createElement('div', { style: { fontSize: 13, marginBottom: 4 } }, 'IBAN:\u00a0', React.createElement('span', { style: { fontFamily: 'Courier New,monospace', fontWeight: 700, letterSpacing: 0.5 } }, cfg.iban)),
                cfg.bank && React.createElement('div', { style: { fontSize: 12, color: '#444', marginBottom: 2 } }, 'Bank: ' + cfg.bank),
                React.createElement('div', { style: { fontSize: 12, color: '#444' } }, 'Begünstigter: ', React.createElement('strong', null, cfg.name))
              ),
              React.createElement('div', { style: { textAlign: 'right' } },
                React.createElement('div', { style: { fontSize: 10, color: '#94a3b8', marginBottom: 6 } }, 'Bitte Referenz angeben'),
                React.createElement('div', { style: { fontSize: 18, fontWeight: 800, color: '#1d4ed8' } }, referenz)
              )
            ),
            React.createElement('div', { style: { height: 4, background: 'linear-gradient(90deg,#1d4ed8 0%,#3b82f6 60%,#93c5fd 100%)', borderRadius: 1, marginBottom: 14 } }),
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' } },
              React.createElement('span', null, 'Vielen Dank für Ihr Vertrauen!'),
              React.createElement('span', null, cfg.name + ' · ' + cfg.city + ' · ' + dateStr)
            )
          ) // total+bank+footer div

        ) // #print-page
      ) // scale wrapper
    ), // outer grey bg

    // ── SWISS QR BILL ──
    React.createElement('div', { style: { width: '100%', overflow: 'hidden', background: '#94a3b8', paddingBottom: 32 } },
      React.createElement('div', { style: { width: 794, transformOrigin: 'top left', transform: 'scale(' + scale + ')', height: scale < 1 ? (397 * scale) + 'px' : 'auto' } },
        React.createElement(HwZahlteil, { cfg: cfg, total: total, referenz: referenz, leistungszeitraum: leistungszeitraum })
      )
    ),

    React.createElement('style', null, '@media print { @page { size: A4 portrait; margin: 10mm 12mm; } .no-print { display: none !important; } body { background: white !important; margin: 0 !important; } #print-page { width: 100% !important; box-shadow: none !important; transform: none !important; } * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }')
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
