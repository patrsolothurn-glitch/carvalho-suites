// ── RAPPORT APP ────────────────────────────────────────────────────
// Wochen Planung + Tagesrapport + Wochenrapport für Arnold AG
// Admin only. Dados em Supabase (rapport_planung, rapport_tages,
// rapport_wochen).
// ──────────────────────────────────────────────────────────────────

var RP_TASKS = {
  muffe:    { label: 'Muffe',          color: '#F59E0B', emoji: '🔩' },
  bep:      { label: 'BEP Install.',   color: '#3B82F6', emoji: '📦' },
  splicing: { label: 'Splicing',       color: '#A78BFA', emoji: '✂️'  },
  otdr:     { label: 'OTDR Messung',   color: '#06B6D4', emoji: '📡' },
  kabel:    { label: 'Kabelzug',       color: '#F97316', emoji: '🔌' },
  hauswart: { label: 'Hauswart',       color: '#10B981', emoji: '🏠' },
  graben:   { label: 'Grabenarbeiten', color: '#EF4444', emoji: '⛏️'  },
  andere:   { label: 'Andere',         color: '#94A3B8', emoji: '🔧' },
};

var RP_STATUS_MAP = {
  planned:   { label: 'Geplant',    dot: '#64748B' },
  active:    { label: 'Laufend',    dot: '#F59E0B' },
  done:      { label: 'Fertig',     dot: '#10B981' },
  cancelled: { label: 'Annulliert', dot: '#EF4444' },
};

var RP_WETTER_OPTS = [
  { value: 'sonnig',     label: '☀️ Sonnig' },
  { value: 'bewoelkt',   label: '⛅ Bewölkt' },
  { value: 'regnerisch', label: '🌧️ Regnerisch' },
  { value: 'schnee',     label: '❄️ Schnee' },
  { value: 'windig',     label: '💨 Windig' },
];

var RP_KANTONE = ['SO','BE','AG','ZH','BS','BL','FR','LU','JU','VS','TG','SH','GR','GL','SG','AR','AI','NE','GE','VD','TI'];

// ── utility ────────────────────────────────────────────────────────
function rpToday() { return new Date().toISOString().slice(0, 10); }

function rpFmtD(d, opts) {
  if (!d) return '';
  return new Date(d + 'T12:00:00').toLocaleDateString('de-CH', opts || { weekday: 'short', day: '2-digit', month: '2-digit' });
}

function rpKW(dateStr) {
  var d = new Date((dateStr || rpToday()) + 'T12:00:00');
  var day = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - day);
  var y = d.getFullYear();
  var jan4 = new Date(y, 0, 4);
  return { kw: Math.ceil((((d - jan4) / 86400000) + ((jan4.getDay() || 7) - 1)) / 7), jahr: y };
}

function rpMondayOf(dateStr) {
  var d = new Date((dateStr || rpToday()) + 'T12:00:00');
  var wd = d.getDay() || 7;
  d.setDate(d.getDate() - (wd - 1));
  return d.toISOString().slice(0, 10);
}

function rpShiftWeek(mondayStr, n) {
  var d = new Date(mondayStr + 'T12:00:00');
  d.setDate(d.getDate() + n * 7);
  return d.toISOString().slice(0, 10);
}

function rpWeekDays(monday) {
  var DE = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];
  var out = [];
  for (var i = 0; i < 5; i++) {
    var d = new Date(monday + 'T12:00:00');
    d.setDate(d.getDate() + i);
    out.push({ label: DE[i], date: d.toISOString().slice(0, 10), num: d.getDate() });
  }
  return out;
}

function rpStunden(hs, he) {
  if (!hs || !he) return 0;
  var sp = hs.split(':').map(Number);
  var ep = he.split(':').map(Number);
  return Math.max(0, ((ep[0] * 60 + ep[1]) - (sp[0] * 60 + sp[1])) / 60);
}

function rpMondayOfKW(kw, jahr) {
  // Thursday of week 1 is always in Jan. Work back to Monday.
  var jan4 = new Date(jahr, 0, 4);
  var thu1 = new Date(jan4);
  var wd = thu1.getDay() || 7;
  thu1.setDate(jan4.getDate() + (4 - wd)); // Thursday of KW1
  var mon1 = new Date(thu1);
  mon1.setDate(thu1.getDate() - 3); // Monday of KW1
  var monKW = new Date(mon1);
  monKW.setDate(mon1.getDate() + (kw - 1) * 7);
  return monKW.toISOString().slice(0, 10);
}

// ── shared style helpers ───────────────────────────────────────────
var rpS = {
  page:   { background: '#0D1117', minHeight: '100vh', color: '#E2E8F0', fontFamily: "'Inter',system-ui,sans-serif" },
  card:   { background: '#111827', border: '1px solid #1E293B', borderRadius: 10, padding: '12px 14px', marginBottom: 10 },
  label:  { display: 'block', fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 },
  input:  { width: '100%', boxSizing: 'border-box', background: '#0D1117', border: '1px solid #1E293B', borderRadius: 8, padding: '8px 10px', color: '#E2E8F0', fontSize: 13, outline: 'none' },
  muted:  { color: '#64748B', fontSize: 12 },
};

function RpLabel(props) { return React.createElement('label', { style: rpS.label }, props.text); }
function RpInput(props) {
  return React.createElement('input', {
    type: props.type || 'text',
    value: props.value,
    placeholder: props.placeholder || '',
    onChange: function(e) { props.onChange(e.target.value); },
    style: Object.assign({}, rpS.input, props.style || {})
  });
}
function RpTextarea(props) {
  return React.createElement('textarea', {
    value: props.value,
    placeholder: props.placeholder || '',
    rows: props.rows || 3,
    onChange: function(e) { props.onChange(e.target.value); },
    style: Object.assign({}, rpS.input, { resize: 'vertical' })
  });
}
function RpSelect(props) {
  return React.createElement('select', {
    value: props.value,
    onChange: function(e) { props.onChange(e.target.value); },
    style: rpS.input
  }, props.opts.map(function(o) {
    return React.createElement('option', { key: o.value || o, value: o.value || o }, o.label || o);
  }));
}
function RpBtn(props) {
  var bg = props.ghost ? 'transparent' : (props.color || '#F59E0B');
  var col = props.ghost ? '#94A3B8' : '#0D1117';
  return React.createElement('button', {
    onClick: props.onClick,
    style: { background: bg, color: col, border: props.ghost ? '1px solid #1E293B' : 'none', borderRadius: 8, padding: props.sm ? '6px 12px' : '10px 18px', fontSize: props.sm ? 12 : 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }
  }, props.label);
}
function RpField(props) {
  return React.createElement('div', { style: { marginBottom: 12 } }, props.label && RpLabel({ text: props.label }), props.children);
}

// ── Overlay form shell ─────────────────────────────────────────────
function RpOverlay(props) {
  return React.createElement('div', {
    style: { position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column' }
  },
    React.createElement('div', { style: { flex: 1, background: 'rgba(0,0,0,0.6)' }, onClick: props.onClose }),
    React.createElement('div', {
      style: { background: '#111827', borderTop: '1px solid #1E293B', borderRadius: '16px 16px 0 0', maxHeight: '90vh', overflowY: 'auto', padding: '0 0 32px' }
    },
      // drag handle
      React.createElement('div', { style: { display: 'flex', justifyContent: 'center', padding: '12px 0 8px' } },
        React.createElement('div', { style: { width: 36, height: 4, borderRadius: 2, background: '#1E293B' } })
      ),
      // title bar
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 12px', borderBottom: '1px solid #1E293B', marginBottom: 16 } },
        React.createElement('div', { style: { fontSize: 15, fontWeight: 700 } }, props.title),
        React.createElement('button', { onClick: props.onClose, style: { background: 'none', border: 'none', color: '#64748B', fontSize: 18, cursor: 'pointer', padding: '4px 8px' } }, '✕')
      ),
      React.createElement('div', { style: { padding: '0 16px' } }, props.children)
    )
  );
}

// ── Confirm dialog ─────────────────────────────────────────────────
function RpConfirm(props) {
  return React.createElement('div', {
    style: { position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }
  },
    React.createElement('div', { style: { background: '#1E293B', borderRadius: 14, padding: '24px', maxWidth: 280, width: '90%' } },
      React.createElement('div', { style: { fontSize: 15, fontWeight: 700, marginBottom: 8 } }, props.title || 'Sicher?'),
      React.createElement('div', { style: { fontSize: 13, color: '#94A3B8', marginBottom: 20 } }, props.msg),
      React.createElement('div', { style: { display: 'flex', gap: 10 } },
        RpBtn({ label: 'Nein', ghost: true, onClick: props.onNo }),
        RpBtn({ label: 'Löschen', color: '#EF4444', onClick: props.onYes })
      )
    )
  );
}

// ════════════════════════════════════════════════════════════════════
// PLANUNG VIEW
// ════════════════════════════════════════════════════════════════════
function RpPlanungView(props) {
  var userId = props.userId;
  var db = window.supabaseClient;

  var _stMonday = React.useState(rpMondayOf(rpToday()));
  var monday = _stMonday[0], setMonday = _stMonday[1];

  var _stJobs = React.useState([]);
  var jobs = _stJobs[0], setJobs = _stJobs[1];

  var _stLoading = React.useState(false);
  var loading = _stLoading[0], setLoading = _stLoading[1];

  var _stExpanded = React.useState(null);
  var expanded = _stExpanded[0], setExpanded = _stExpanded[1];

  var _stForm = React.useState(null); // null | 'new' | job object
  var form = _stForm[0], setForm = _stForm[1];

  var _stConfirm = React.useState(null);
  var confirm = _stConfirm[0], setConfirm = _stConfirm[1];

  // form fields
  var _fDate = React.useState(rpToday());
  var fDate = _fDate[0], setFDate = _fDate[1];
  var _fBau = React.useState('');
  var fBau = _fBau[0], setFBau = _fBau[1];
  var _fKanton = React.useState('SO');
  var fKanton = _fKanton[0], setFKanton = _fKanton[1];
  var _fTask = React.useState('muffe');
  var fTask = _fTask[0], setFTask = _fTask[1];
  var _fHS = React.useState('07:00');
  var fHS = _fHS[0], setFHS = _fHS[1];
  var _fHE = React.useState('17:00');
  var fHE = _fHE[0], setFHE = _fHE[1];
  var _fTeam = React.useState('');
  var fTeam = _fTeam[0], setFTeam = _fTeam[1];
  var _fKm = React.useState('');
  var fKm = _fKm[0], setFKm = _fKm[1];
  var _fStatus = React.useState('planned');
  var fStatus = _fStatus[0], setFStatus = _fStatus[1];
  var _fNotiz = React.useState('');
  var fNotiz = _fNotiz[0], setFNotiz = _fNotiz[1];
  var _fSaving = React.useState(false);
  var fSaving = _fSaving[0], setFSaving = _fSaving[1];

  var kwInfo = rpKW(monday);
  var days = rpWeekDays(monday);
  var todayStr = rpToday();

  function loadJobs() {
    if (!db) return;
    var mon = monday;
    var fri = rpShiftWeek(monday, 1); // exclusive end = next monday
    setLoading(true);
    db.from('rapport_planung')
      .select('*')
      .gte('datum', mon)
      .lt('datum', fri)
      .order('datum')
      .order('h_start')
      .then(function(r) {
        setJobs(r.data || []);
        setLoading(false);
      });
  }

  React.useEffect(function() { loadJobs(); }, [monday]);

  function openNew(date) {
    setFDate(date || rpToday());
    setFBau(''); setFKanton('SO'); setFTask('muffe');
    setFHS('07:00'); setFHE('17:00'); setFTeam('');
    setFKm(''); setFStatus('planned'); setFNotiz('');
    setForm('new');
  }

  function openEdit(job) {
    setFDate(job.datum); setFBau(job.baustelle); setFKanton(job.kanton || 'SO');
    setFTask(job.task_type || 'muffe'); setFHS(job.h_start || '07:00'); setFHE(job.h_end || '17:00');
    setFTeam(job.team || ''); setFKm(String(job.km || '')); setFStatus(job.status || 'planned');
    setFNotiz(job.notiz || '');
    setForm(job);
  }

  function saveJob() {
    if (!fBau.trim()) return;
    setFSaving(true);
    var payload = {
      user_id: userId,
      datum: fDate,
      baustelle: fBau.trim(),
      kanton: fKanton,
      task_type: fTask,
      h_start: fHS,
      h_end: fHE,
      team: fTeam.trim(),
      km: parseInt(fKm) || 0,
      status: fStatus,
      notiz: fNotiz.trim(),
    };
    var op;
    if (form === 'new') {
      op = db.from('rapport_planung').insert(payload);
    } else {
      op = db.from('rapport_planung').update(payload).eq('id', form.id);
    }
    op.then(function() {
      setForm(null); setFSaving(false); loadJobs();
    }).catch(function() { setFSaving(false); });
  }

  function deleteJob(id) {
    db.from('rapport_planung').delete().eq('id', id).then(function() {
      setConfirm(null); setExpanded(null); loadJobs();
    });
  }

  function toggleStatus(job) {
    var order = ['planned', 'active', 'done'];
    var next = order[(order.indexOf(job.status || 'planned') + 1) % order.length];
    db.from('rapport_planung').update({ status: next }).eq('id', job.id).then(loadJobs);
  }

  var totalKm = jobs.reduce(function(s, j) { return s + (j.km || 0); }, 0);
  var doneCount = jobs.filter(function(j) { return j.status === 'done'; }).length;

  return React.createElement('div', { style: { paddingBottom: 80 } },
    // ── Week navigator
    React.createElement('div', { style: { background: '#111827', borderBottom: '1px solid #1E293B', padding: '12px 16px' } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 600, margin: '0 auto' } },
        React.createElement('button', { onClick: function() { setMonday(rpShiftWeek(monday, -1)); setExpanded(null); }, style: { background: 'none', border: '1px solid #1E293B', borderRadius: 8, width: 36, height: 36, color: '#94A3B8', fontSize: 18, cursor: 'pointer' } }, '‹'),
        React.createElement('div', { style: { textAlign: 'center' } },
          React.createElement('div', { style: { fontWeight: 800, fontSize: 16, color: '#F59E0B' } }, 'KW ' + kwInfo.kw + ' · ' + kwInfo.jahr),
          React.createElement('div', { style: { fontSize: 11, color: '#475569', marginTop: 2 } },
            days[0].num + '.' + (new Date(days[0].date + 'T12:00:00').getMonth() + 1) + ' – ' +
            days[4].num + '.' + (new Date(days[4].date + 'T12:00:00').getMonth() + 1)
          )
        ),
        React.createElement('button', { onClick: function() { setMonday(rpShiftWeek(monday, 1)); setExpanded(null); }, style: { background: 'none', border: '1px solid #1E293B', borderRadius: 8, width: 36, height: 36, color: '#94A3B8', fontSize: 18, cursor: 'pointer' } }, '›')
      ),
      // stats row
      React.createElement('div', { style: { display: 'flex', gap: 16, justifyContent: 'center', marginTop: 10 } },
        React.createElement('span', { style: { fontSize: 11, color: '#64748B' } }, '📋 ' + jobs.length + ' Aufträge'),
        React.createElement('span', { style: { fontSize: 11, color: '#10B981' } }, '✓ ' + doneCount + ' fertig'),
        React.createElement('span', { style: { fontSize: 11, color: '#64748B' } }, '🚗 ~' + totalKm + ' km')
      )
    ),

    loading && React.createElement('div', { style: { textAlign: 'center', padding: 24, color: '#475569' } }, 'Lade...'),

    // ── Day rows
    React.createElement('div', { style: { padding: '12px 14px', maxWidth: 600, margin: '0 auto' } },
      days.map(function(day) {
        var dayJobs = jobs.filter(function(j) { return j.datum === day.date; });
        var isToday = day.date === todayStr;
        return React.createElement('div', { key: day.date, style: { marginBottom: 14 } },
          // Day header
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 } },
            React.createElement('div', {
              style: { width: 42, height: 42, borderRadius: 10, background: isToday ? '#F59E0B' : '#1E293B', color: isToday ? '#0D1117' : '#94A3B8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: isToday ? 'none' : '1px solid #263347' }
            },
              React.createElement('span', { style: { fontSize: 9, fontWeight: 600, opacity: 0.7 } }, day.label),
              React.createElement('span', { style: { fontSize: 17, fontWeight: 800, lineHeight: 1.1 } }, day.num)
            ),
            React.createElement('div', { style: { flex: 1, height: 1, background: isToday ? '#F59E0B33' : '#1E293B' } }),
            isToday && React.createElement('span', { style: { fontSize: 10, color: '#F59E0B', fontWeight: 700, letterSpacing: '0.5px' } }, 'HEUTE'),
            React.createElement('button', {
              onClick: function() { openNew(day.date); },
              style: { background: '#1E293B', border: '1px solid #263347', borderRadius: 8, width: 28, height: 28, color: '#94A3B8', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
            }, '+')
          ),

          // Job cards
          React.createElement('div', { style: { paddingLeft: 52, display: 'flex', flexDirection: 'column', gap: 6 } },
            dayJobs.length === 0 && React.createElement('div', { style: { fontSize: 12, color: '#334155', padding: '6px 0' } }, 'Nix geplant'),
            dayJobs.map(function(job) {
              var t = RP_TASKS[job.task_type] || RP_TASKS.andere;
              var s = RP_STATUS_MAP[job.status] || RP_STATUS_MAP.planned;
              var isExp = expanded === job.id;
              return React.createElement('div', {
                key: job.id,
                onClick: function() { setExpanded(isExp ? null : job.id); },
                style: { background: '#111827', border: '1px solid ' + (isExp ? t.color + '44' : '#1E293B'), borderLeft: '3px solid ' + t.color, borderRadius: 10, padding: '9px 12px', cursor: 'pointer', transition: 'border-color 0.15s' }
              },
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' } },
                  React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 } },
                    React.createElement('span', { style: { fontSize: 11, fontWeight: 700, color: t.color, background: t.color + '18', padding: '1px 6px', borderRadius: 5, whiteSpace: 'nowrap', flexShrink: 0 } }, t.label),
                    React.createElement('span', { style: { fontSize: 13, fontWeight: 600, color: '#CBD5E1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, job.baustelle),
                    job.kanton && React.createElement('span', { style: { fontSize: 10, color: '#475569', flexShrink: 0 } }, '[' + job.kanton + ']')
                  ),
                  React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 } },
                    React.createElement('div', { style: { width: 6, height: 6, borderRadius: '50%', background: s.dot } }),
                    React.createElement('span', { style: { fontSize: 10, color: '#64748B' } }, s.label)
                  )
                ),
                React.createElement('div', { style: { display: 'flex', gap: 12, marginTop: 5, flexWrap: 'wrap' } },
                  job.h_start && React.createElement('span', { style: { fontSize: 11, color: '#64748B' } }, '🕐 ' + job.h_start + (job.h_end ? '–' + job.h_end : '')),
                  job.team && React.createElement('span', { style: { fontSize: 11, color: '#64748B' } }, '👷 ' + job.team),
                  job.km > 0 && React.createElement('span', { style: { fontSize: 11, color: '#64748B' } }, '🚗 ' + job.km + ' km')
                ),
                isExp && React.createElement('div', { style: { marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 } },
                  job.notiz && React.createElement('div', { style: { fontSize: 12, color: '#94A3B8', padding: '6px 8px', background: '#0D1117', borderRadius: 6, borderLeft: '2px solid ' + t.color + '55' } }, job.notiz),
                  React.createElement('div', { style: { display: 'flex', gap: 6, marginTop: 4 }, onClick: function(e) { e.stopPropagation(); } },
                    React.createElement('button', { onClick: function(e) { e.stopPropagation(); toggleStatus(job); }, style: { fontSize: 11, background: '#1E293B', border: 'none', borderRadius: 6, padding: '4px 10px', color: '#94A3B8', cursor: 'pointer' } }, '↻ Status'),
                    React.createElement('button', { onClick: function(e) { e.stopPropagation(); openEdit(job); }, style: { fontSize: 11, background: '#1E293B', border: 'none', borderRadius: 6, padding: '4px 10px', color: '#94A3B8', cursor: 'pointer' } }, '✏️ Bearbeiten'),
                    React.createElement('button', { onClick: function(e) { e.stopPropagation(); setConfirm(job.id); }, style: { fontSize: 11, background: '#EF444420', border: 'none', borderRadius: 6, padding: '4px 10px', color: '#EF4444', cursor: 'pointer' } }, '🗑️')
                  )
                )
              );
            })
          )
        );
      })
    ),

    // ── Form overlay
    form !== null && RpOverlay({
      title: form === 'new' ? 'Neuer Auftrag' : 'Auftrag bearbeiten',
      onClose: function() { setForm(null); },
      children: React.createElement('div', null,
        RpField({ label: 'Datum', children: RpInput({ type: 'date', value: fDate, onChange: setFDate }) }),
        RpField({ label: 'Baustelle / Ort', children: RpInput({ value: fBau, onChange: setFBau, placeholder: 'z.B. Grenchen Industriestr.' }) }),
        React.createElement('div', { style: { display: 'flex', gap: 10, marginBottom: 12 } },
          React.createElement('div', { style: { flex: 2 } }, RpLabel({ text: 'Arbeitstyp' }), RpSelect({ value: fTask, onChange: setFTask, opts: Object.keys(RP_TASKS).map(function(k) { return { value: k, label: RP_TASKS[k].emoji + ' ' + RP_TASKS[k].label }; }) })),
          React.createElement('div', { style: { flex: 1 } }, RpLabel({ text: 'Kanton' }), RpSelect({ value: fKanton, onChange: setFKanton, opts: RP_KANTONE.map(function(k) { return { value: k, label: k }; }) }))
        ),
        React.createElement('div', { style: { display: 'flex', gap: 10, marginBottom: 12 } },
          React.createElement('div', { style: { flex: 1 } }, RpLabel({ text: 'Von' }), RpInput({ type: 'time', value: fHS, onChange: setFHS })),
          React.createElement('div', { style: { flex: 1 } }, RpLabel({ text: 'Bis' }), RpInput({ type: 'time', value: fHE, onChange: setFHE })),
          React.createElement('div', { style: { flex: 1 } }, RpLabel({ text: 'KM' }), RpInput({ type: 'number', value: fKm, onChange: setFKm, placeholder: '0' }))
        ),
        RpField({ label: 'Team / Equipa', children: RpInput({ value: fTeam, onChange: setFTeam, placeholder: 'z.B. Wälchli + Pat' }) }),
        RpField({ label: 'Status', children: RpSelect({ value: fStatus, onChange: setFStatus, opts: Object.keys(RP_STATUS_MAP).map(function(k) { return { value: k, label: RP_STATUS_MAP[k].label }; }) }) }),
        RpField({ label: 'Notiz', children: RpTextarea({ value: fNotiz, onChange: setFNotiz, placeholder: 'Bemerkungen, Material, Details...' }) }),
        React.createElement('div', { style: { display: 'flex', gap: 10, marginTop: 4 } },
          RpBtn({ label: 'Abbrechen', ghost: true, onClick: function() { setForm(null); } }),
          RpBtn({ label: fSaving ? '...' : (form === 'new' ? 'Speichern' : 'Aktualisieren'), onClick: saveJob })
        )
      )
    }),

    // ── Confirm delete
    confirm !== null && RpConfirm({
      title: 'Auftrag löschen?',
      msg: 'Dieser Auftrag wird dauerhaft entfernt.',
      onNo: function() { setConfirm(null); },
      onYes: function() { deleteJob(confirm); }
    })
  );
}

// ════════════════════════════════════════════════════════════════════
// TAGESRAPPORT VIEW
// ════════════════════════════════════════════════════════════════════
var RP_FAHRZEUG_OPTS = [
  { value: 'PW',     label: 'PW' },
  { value: 'GFz',    label: 'GFz' },
  { value: 'Jeep',   label: 'Jeep' },
  { value: 'andere', label: 'Andere' },
];
var RP_BEP_KABEL = ['2S','1S','S','M'];
var RP_MUFFE_TYP = ['BC8','FD6','FD8','BF8','BE8'];

function rpPrintTages(item) {
  var w = window.open('', '_blank');
  var typ   = item.typ === 'regierapport' ? 'Tagesregierapport' : 'Tagesarbeitsrapport';
  var datum = item.datum ? new Date(item.datum+'T12:00:00').toLocaleDateString('de-CH',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'}) : '—';
  function row(label, val) { return val ? '<tr><td class="lbl">'+label+'</td><td class="val">'+val+'</td></tr>' : ''; }
  function chk(label, val) { return '<span style="margin-right:12px">'+(val?'☑':'☐')+' '+label+'</span>'; }
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+typ+' '+datum+'</title>'
    +'<style>'
    +'body{font-family:Arial,sans-serif;font-size:11px;margin:12mm;color:#000}'
    +'.hdr{display:flex;justify-content:space-between;border-bottom:2px solid #F06400;padding-bottom:6px;margin-bottom:10px}'
    +'.mark{width:10px;height:10px;background:#F06400;display:inline-block;margin-right:4px;vertical-align:middle}'
    +'.logo-name{font-size:18px;font-weight:900;vertical-align:middle}'
    +'.logo-sub{font-size:9px;color:#555;margin-top:1px}'
    +'table{width:100%;border-collapse:collapse;margin-bottom:8px}'
    +'th.sec{background:#F06400;color:#fff;font-size:10px;text-align:left;padding:3px 6px;text-transform:uppercase;letter-spacing:.5px}'
    +'.lbl{width:32%;background:#f5f5f5;border:1px solid #ccc;padding:3px 5px;font-weight:bold;font-size:9px;text-transform:uppercase;vertical-align:top}'
    +'.val{border:1px solid #ccc;padding:3px 5px;vertical-align:top}'
    +'.sig{display:flex;gap:15px;margin-top:14px}'
    +'.sig-box{flex:1;border:1px solid #000;height:50px;position:relative}'
    +'.sig-lbl{position:absolute;top:-8px;left:6px;background:#fff;padding:0 3px;font-size:9px;font-weight:bold}'
    +'@media print{@page{margin:10mm}button{display:none}}'
    +'</style></head><body>'
    +'<div class="hdr"><div><span class="mark"></span><span class="logo-name">Arnold</span><div class="logo-sub">Infra Services</div></div>'
    +'<div style="text-align:right"><div style="font-size:10px">'+typ+'</div>'
    +(item.rapport_nr?'<div>Nr. <strong>'+item.rapport_nr+'</strong></div>':'')+'</div></div>'
    +'<table><tr><th class="sec" colspan="2">Auftragsdaten</th></tr>'
    +row('Datum',datum)+row('Kunde',item.kunde)+row('Montageort',item.montageort)
    +row('Auftrag Nr.',item.auftrag_nr)+'</table>'
    +'<table><tr><th class="sec" colspan="2">Beschrieb der Arbeiten</th></tr>'
    +'<tr><td colspan="2" class="val" style="min-height:60px;white-space:pre-wrap">'+(item.beschrieb||'')+'</td></tr></table>'
    +'<table><tr><th class="sec" colspan="2">Personal / Arbeitszeit</th></tr>'
    +row('Team',item.team)+row('Arbeitszeit',(item.h_start||'—')+' – '+(item.h_end||'—'))
    +row('Fahrzeug / KM',(item.fahrzeug||'')+(item.km?' · '+item.km+' km':''))+'</table>'
    +(item.bep_kabel_typ||item.bep_godoo||item.bep_gag
      ?'<table><tr><th class="sec" colspan="2">BEP Spezifisch</th></tr>'
       +row('Kabel Typ',item.bep_kabel_typ+(item.bep_kabel_typ_custom?' / '+item.bep_kabel_typ_custom:''))
       +row('Zuständig (Godoo)',item.bep_godoo)
       +row('GAG Messung',item.bep_gag?item.bep_gag+' dB':'')
       +row('Swisscom Messung',item.bep_swisscom?item.bep_swisscom+' dB':'')
       +(item.bep_fotos?'<tr><td colspan="2" class="val">☑ Fotos gemacht</td></tr>':'')
       +'</table>':''  )
    +(item.muffe_anzahl>0||item.muffe_typ
      ?'<table><tr><th class="sec" colspan="2">Muffe Spezifisch</th></tr>'
       +row('Anzahl Muffes',item.muffe_anzahl)
       +row('Muffe Typ',item.muffe_typ+(item.muffe_typ_custom?' / '+item.muffe_typ_custom:''))
       +row('Fasern Gespleisst',item.muffe_fasern)
       +'<tr><td colspan="2" class="val">'+chk('OTDR OK',item.otdr_ok)+chk('OTDR N.OK',item.otdr_nok)+chk('Fotos',item.muffe_fotos)+'</td></tr>'
       +'</table>':''  )
    +(item.material?'<table><tr><th class="sec" colspan="2">Material</th></tr>'
       +'<tr><td colspan="2" class="val" style="white-space:pre-wrap">'+item.material+'</td></tr></table>':'')
    +'<div class="sig">'
    +'<div class="sig-box"><span class="sig-lbl">Unterschrift Kunde</span></div>'
    +'<div class="sig-box"><span class="sig-lbl">Unterschrift Arnold AG</span></div>'
    +'</div>'
    +'<div style="text-align:right;margin-top:4px;font-size:9px;color:#888">Arnold Infra Services · Selzach · BKW Gruppe</div>'
    +'</body></html>';
  w.document.write(html);
  w.document.close();
  w.onload = function() { w.print(); };
}

function RpTagesView(props) {
  var userId = props.userId;
  var db = window.supabaseClient;

  var _stList = React.useState([]);
  var list = _stList[0], setList = _stList[1];
  var _stLoading = React.useState(false);
  var loading = _stLoading[0], setLoading = _stLoading[1];
  var _stForm = React.useState(null);
  var form = _stForm[0], setForm = _stForm[1];
  var _stView = React.useState(null);
  var viewItem = _stView[0], setViewItem = _stView[1];
  var _stConfirm = React.useState(null);
  var confirm = _stConfirm[0], setConfirm = _stConfirm[1];

  // form fields matching paper rapport
  var _fTyp     = React.useState('arbeitsrapport'); var fTyp = _fTyp[0], setFTyp = _fTyp[1];
  var _fNr      = React.useState('');               var fNr = _fNr[0], setFNr = _fNr[1];
  var _fDate    = React.useState(rpToday());        var fDate = _fDate[0], setFDate = _fDate[1];
  var _fKunde   = React.useState('');               var fKunde = _fKunde[0], setFKunde = _fKunde[1];
  var _fOrt     = React.useState('');               var fOrt = _fOrt[0], setFOrt = _fOrt[1];
  var _fAuftrag = React.useState('');               var fAuftrag = _fAuftrag[0], setFAuftrag = _fAuftrag[1];
  var _fBeschrieb = React.useState('');             var fBeschrieb = _fBeschrieb[0], setFBeschrieb = _fBeschrieb[1];
  var _fTeam    = React.useState('');               var fTeam = _fTeam[0], setFTeam = _fTeam[1];
  var _fHS      = React.useState('07:00');          var fHS = _fHS[0], setFHS = _fHS[1];
  var _fHE      = React.useState('17:00');          var fHE = _fHE[0], setFHE = _fHE[1];
  var _fFahrzeug = React.useState('PW');            var fFahrzeug = _fFahrzeug[0], setFFahrzeug = _fFahrzeug[1];
  var _fKm      = React.useState('');               var fKm = _fKm[0], setFKm = _fKm[1];
  var _fMat     = React.useState('');               var fMat = _fMat[0], setFMat = _fMat[1];
  var _fStatus  = React.useState('draft');          var fStatus = _fStatus[0], setFStatus = _fStatus[1];
  var _fSaving  = React.useState(false);            var fSaving = _fSaving[0], setFSaving = _fSaving[1];
  // BEP Spezifisch
  var _fBepKab  = React.useState('');               var fBepKab = _fBepKab[0], setFBepKab = _fBepKab[1];
  var _fBepKabC = React.useState('');               var fBepKabC = _fBepKabC[0], setFBepKabC = _fBepKabC[1];
  var _fBepGod  = React.useState('');               var fBepGod = _fBepGod[0], setFBepGod = _fBepGod[1];
  var _fBepGAG  = React.useState('');               var fBepGAG = _fBepGAG[0], setFBepGAG = _fBepGAG[1];
  var _fBepSws  = React.useState('');               var fBepSws = _fBepSws[0], setFBepSws = _fBepSws[1];
  var _fBepFot  = React.useState(false);            var fBepFot = _fBepFot[0], setFBepFot = _fBepFot[1];
  // Muffe Spezifisch
  var _fMufAnz  = React.useState('0');              var fMufAnz = _fMufAnz[0], setFMufAnz = _fMufAnz[1];
  var _fMufTyp  = React.useState('');               var fMufTyp = _fMufTyp[0], setFMufTyp = _fMufTyp[1];
  var _fMufTypC = React.useState('');               var fMufTypC = _fMufTypC[0], setFMufTypC = _fMufTypC[1];
  var _fMufFas  = React.useState('0');              var fMufFas = _fMufFas[0], setFMufFas = _fMufFas[1];
  var _fOtdrOk  = React.useState(false);            var fOtdrOk = _fOtdrOk[0], setFOtdrOk = _fOtdrOk[1];
  var _fOtdrNok = React.useState(false);            var fOtdrNok = _fOtdrNok[0], setFOtdrNok = _fOtdrNok[1];
  var _fMufFot  = React.useState(false);            var fMufFot = _fMufFot[0], setFMufFot = _fMufFot[1];
  var _fProb    = React.useState('');               var fProb = _fProb[0], setFProb = _fProb[1];

  function load() {
    if (!db) return;
    setLoading(true);
    db.from('rapport_tages').select('*').eq('user_id', userId).order('datum', { ascending: false })
      .then(function(r) { setList(r.data || []); setLoading(false); });
  }
  React.useEffect(load, []);

  function resetForm() {
    setFTyp('arbeitsrapport'); setFNr(''); setFDate(rpToday());
    setFKunde(''); setFOrt(''); setFAuftrag(''); setFBeschrieb('');
    setFTeam(''); setFHS('07:00'); setFHE('17:00');
    setFFahrzeug('PW'); setFKm(''); setFMat(''); setFStatus('draft');
    setFBepKab(''); setFBepKabC(''); setFBepGod(''); setFBepGAG(''); setFBepSws(''); setFBepFot(false);
    setFMufAnz('0'); setFMufTyp(''); setFMufTypC(''); setFMufFas('0'); setFOtdrOk(false); setFOtdrNok(false); setFMufFot(false);
    setFProb('');
  }
  function openNew() { resetForm(); setForm('new'); }
  function openEdit(item) {
    setFTyp(item.typ || 'arbeitsrapport');
    setFNr(item.rapport_nr || '');
    setFDate(item.datum);
    setFKunde(item.kunde || item.baustelle || '');
    setFOrt(item.montageort || '');
    setFAuftrag(item.auftrag_nr || '');
    setFBeschrieb(item.beschrieb || item.arbeit || '');
    setFTeam(item.team || '');
    setFHS(item.h_start || '07:00');
    setFHE(item.h_end || '17:00');
    setFFahrzeug(item.fahrzeug || 'PW');
    setFKm(String(item.km || ''));
    setFMat(item.material || '');
    setFStatus(item.status || 'draft');
    setFBepKab(item.bep_kabel_typ||''); setFBepKabC(item.bep_kabel_typ_custom||'');
    setFBepGod(item.bep_godoo||''); setFBepGAG(item.bep_gag||''); setFBepSws(item.bep_swisscom||''); setFBepFot(!!item.bep_fotos);
    setFMufAnz(String(item.muffe_anzahl||0)); setFMufTyp(item.muffe_typ||''); setFMufTypC(item.muffe_typ_custom||'');
    setFMufFas(String(item.muffe_fasern||0)); setFOtdrOk(!!item.otdr_ok); setFOtdrNok(!!item.otdr_nok); setFMufFot(!!item.muffe_fotos);
    setFProb(item.probleme || item.bemerkungen || '');
    setViewItem(null); setForm(item);
  }
  function save() {
    if (!fKunde.trim() && !fOrt.trim()) return;
    setFSaving(true);
    var h = rpStunden(fHS, fHE);
    var payload = {
      user_id: userId,
      typ: fTyp,
      rapport_nr: fNr.trim(),
      datum: fDate,
      kunde: fKunde.trim(),
      montageort: fOrt.trim(),
      auftrag_nr: fAuftrag.trim(),
      beschrieb: fBeschrieb.trim(),
      team: fTeam.trim(),
      h_start: fHS,
      h_end: fHE,
      stunden: h,
      fahrzeug: fFahrzeug,
      km: parseInt(fKm) || 0,
      material: fMat.trim(),
      status: fStatus,
      bep_kabel_typ: fBepKab, bep_kabel_typ_custom: fBepKabC.trim(),
      bep_godoo: fBepGod.trim(), bep_gag: fBepGAG.trim(), bep_swisscom: fBepSws.trim(), bep_fotos: fBepFot,
      muffe_anzahl: parseInt(fMufAnz)||0, muffe_typ: fMufTyp, muffe_typ_custom: fMufTypC.trim(),
      muffe_fasern: parseInt(fMufFas)||0, otdr_ok: fOtdrOk, otdr_nok: fOtdrNok, muffe_fotos: fMufFot,
      probleme: fProb.trim()
    };
    var op = form === 'new'
      ? db.from('rapport_tages').insert(payload)
      : db.from('rapport_tages').update(payload).eq('id', form.id);
    op.then(function() { setForm(null); setFSaving(false); load(); })
      .catch(function() { setFSaving(false); });
  }
  function del(id) {
    db.from('rapport_tages').delete().eq('id', id)
      .then(function() { setConfirm(null); setViewItem(null); load(); });
  }
  function toggleStatus(item) {
    var next = item.status === 'draft' ? 'submitted' : 'draft';
    db.from('rapport_tages').update({ status: next }).eq('id', item.id).then(load);
  }

  return React.createElement('div', { style: { padding: '12px 14px', paddingBottom: 80, maxWidth: 600, margin: '0 auto' } },

    // header
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 } },
      React.createElement('div', { style: { fontSize: 13, color: '#64748B' } }, list.length + ' Rapporte'),
      RpBtn({ label: '+ Neuer Rapport', onClick: openNew })
    ),

    loading && React.createElement('div', { style: { textAlign: 'center', padding: 24, color: '#475569' } }, 'Lade...'),
    !loading && list.length === 0 && React.createElement('div', { style: Object.assign({}, rpS.card, { textAlign: 'center', color: '#475569', fontSize: 13 }) }, 'Noch keine Tagesrapporte.'),

    // list
    list.map(function(item) {
      var h = rpStunden(item.h_start, item.h_end);
      var isSubmitted = item.status === 'submitted';
      var statusColor = isSubmitted ? '#10B981' : '#F59E0B';
      var isOpen = viewItem && viewItem.id === item.id;
      var titel = item.kunde || item.baustelle || item.montageort || '—';
      var subtitel = [item.montageort, item.auftrag_nr ? 'Auftrag: ' + item.auftrag_nr : ''].filter(Boolean).join(' · ');
      return React.createElement('div', {
        key: item.id,
        onClick: function() { setViewItem(isOpen ? null : item); },
        style: Object.assign({}, rpS.card, { cursor: 'pointer', borderLeft: '3px solid ' + statusColor })
      },
        // top row
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
          React.createElement('div', { style: { flex: 1, minWidth: 0 } },
            React.createElement('div', { style: { fontWeight: 700, fontSize: 13 } },
              rpFmtD(item.datum, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
              + (item.rapport_nr ? '  ·  Nr. ' + item.rapport_nr : '')
            ),
            React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: '#E2E8F0', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, titel),
            subtitel && React.createElement('div', { style: { fontSize: 11, color: '#64748B', marginTop: 1 } }, subtitel)
          ),
          React.createElement('div', { style: { textAlign: 'right', flexShrink: 0, marginLeft: 8 } },
            React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: statusColor, textTransform: 'uppercase' } }, isSubmitted ? 'Abgegeben' : 'Entwurf'),
            React.createElement('div', { style: { fontSize: 10, color: '#64748B', marginTop: 2 } }, item.typ === 'regierapport' ? 'Regie' : 'Arbeitsrapport'),
            React.createElement('div', { style: { display: 'flex', gap: 6, marginTop: 8, justifyContent: 'flex-end' }, onClick: function(e) { e.stopPropagation(); } },
              RpBtn({ label: '✏️', sm: true, ghost: true, onClick: function() { openEdit(item); } }),
              RpBtn({ label: '🖨️', sm: true, color: '#3B82F6', onClick: function() { rpPrintTages(item); } }),
              RpBtn({ label: '🗑️', sm: true, color: '#EF4444', onClick: function() { setConfirm(item.id); } })
            )
          )
        ),
        // stats row
        React.createElement('div', { style: { display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' } },
          React.createElement('span', { style: { fontSize: 11, color: '#64748B' } }, '🕐 ' + (item.h_start || '—') + '–' + (item.h_end || '—') + ' (' + h.toFixed(1) + 'h)'),
          item.team && React.createElement('span', { style: { fontSize: 11, color: '#64748B' } }, '👷 ' + item.team),
          item.km > 0 && React.createElement('span', { style: { fontSize: 11, color: '#64748B' } }, '🚗 ' + item.fahrzeug + ' ' + item.km + ' km')
        ),
        // Probleme highlight
        item.probleme && React.createElement('div', {
          style: { marginTop: 6, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 7, padding: '4px 8px', fontSize: 11, color: '#FCA5A5', fontWeight: 600 }
        }, '⚠️ ' + item.probleme),
        // expanded detail
        isOpen && React.createElement('div', { style: { marginTop: 10, borderTop: '1px solid #1E293B', paddingTop: 10 }, onClick: function(e) { e.stopPropagation(); } },
          (item.beschrieb || item.arbeit) && React.createElement('div', { style: { marginBottom: 8 } },
            React.createElement('div', { style: rpS.label }, 'Beschrieb der Arbeiten'),
            React.createElement('div', { style: { fontSize: 12, color: '#CBD5E1', whiteSpace: 'pre-wrap' } }, item.beschrieb || item.arbeit)
          ),
          (item.material) && React.createElement('div', { style: { marginBottom: 8 } },
            React.createElement('div', { style: rpS.label }, 'Material'),
            React.createElement('div', { style: { fontSize: 12, color: '#CBD5E1' } }, item.material)
          ),
          // Probleme (old field, backward compat)
          item.probleme && React.createElement('div', { style: { marginBottom: 8 } },
            React.createElement('div', { style: rpS.label }, 'Probleme / Bemerkungen'),
            React.createElement('div', { style: { fontSize: 12, color: '#FCA5A5', whiteSpace: 'pre-wrap' } }, item.probleme)
          ),
          // BEP summary card
          (item.bep_kabel_typ || item.bep_godoo || item.bep_gag) && React.createElement('div', {
            style: { background: '#1E3A5F', border: '1px solid #3B82F644', borderRadius: 10, padding: '8px 10px', marginBottom: 8 }
          },
            React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: '#3B82F6', marginBottom: 5 } }, '📦 BEP'),
            React.createElement('div', { style: { display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 11, color: '#CBD5E1' } },
              item.bep_kabel_typ && React.createElement('span', null, '🗂 ' + item.bep_kabel_typ + (item.bep_kabel_typ_custom ? ' / ' + item.bep_kabel_typ_custom : '')),
              item.bep_godoo && React.createElement('span', null, '📱 Godoo: ' + item.bep_godoo)
            ),
            (item.bep_godoo || item.bep_gag || item.bep_swisscom) && React.createElement('div', { style: { display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 11, color: '#94A3B8', marginTop: 3 } },
              item.bep_godoo && React.createElement('span', null, '📍 ' + item.bep_godoo),
              item.bep_gag && React.createElement('span', null, 'GAG: ' + item.bep_gag),
              item.bep_swisscom && React.createElement('span', null, 'Swisscom: ' + item.bep_swisscom)
            ),
            item.bep_fotos && React.createElement('div', { style: { fontSize: 11, color: '#10B981', marginTop: 3 } }, '📷 Fotos ✓')
          ),
          // Muffe summary card
          (item.muffe_anzahl > 0 || item.muffe_typ) && React.createElement('div', {
            style: { background: '#2D1F00', border: '1px solid #F59E0B44', borderRadius: 10, padding: '8px 10px', marginBottom: 8 }
          },
            React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: '#F59E0B', marginBottom: 5 } }, '🔩 Muffe'),
            React.createElement('div', { style: { display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 11, color: '#CBD5E1' } },
              item.muffe_anzahl > 0 && React.createElement('span', null, item.muffe_anzahl + ' Muffe'),
              item.muffe_typ && React.createElement('span', { style: { background: '#F59E0B22', border: '1px solid #F59E0B44', borderRadius: 4, padding: '1px 6px', fontWeight: 700 } }, item.muffe_typ),
              item.muffe_fasern > 0 && React.createElement('span', null, item.muffe_fasern + ' Fasern')
            ),
            React.createElement('div', { style: { display: 'flex', gap: 10, marginTop: 4, fontSize: 11 } },
              React.createElement('span', { style: { color: item.otdr_ok ? '#10B981' : '#475569' } }, (item.otdr_ok ? '✅' : '⬜') + ' OTDR OK'),
              React.createElement('span', { style: { color: item.otdr_nok ? '#EF4444' : '#475569' } }, (item.otdr_nok ? '⚠️' : '⬜') + ' OTDR N.OK'),
              item.muffe_fotos && React.createElement('span', { style: { color: '#10B981' } }, '📷 Fotos ✓')
            )
          )
        )
      );
    }),

    // form overlay
    form !== null && RpOverlay({
      title: form === 'new' ? 'Neuer Tagesrapport' : 'Rapport bearbeiten',
      onClose: function() { setForm(null); },
      children: React.createElement('div', null,

        // Typ toggle
        React.createElement('div', { style: { display: 'flex', gap: 6, marginBottom: 14 } },
          ['arbeitsrapport', 'regierapport'].map(function(t) {
            var active = fTyp === t;
            return React.createElement('button', {
              key: t, onClick: function() { setFTyp(t); },
              style: { flex: 1, padding: '7px 0', borderRadius: 8, border: '1px solid ' + (active ? '#F06400' : '#2A2A38'), background: active ? '#F0640022' : 'transparent', color: active ? '#F06400' : '#64748B', fontSize: 12, fontWeight: active ? 700 : 400, cursor: 'pointer' }
            }, t === 'arbeitsrapport' ? 'Tagesarbeitsrapport' : 'Tagesregierapport');
          })
        ),

        // Rapport Nr + Datum
        React.createElement('div', { style: { display: 'flex', gap: 10, marginBottom: 12 } },
          React.createElement('div', { style: { flex: 1 } }, RpLabel({ text: 'Rapport Nr.' }), RpInput({ value: fNr, onChange: setFNr, placeholder: 'z.B. 2151' })),
          React.createElement('div', { style: { flex: 2 } }, RpLabel({ text: 'Datum' }), RpInput({ type: 'date', value: fDate, onChange: setFDate }))
        ),

        // Kunde + Montageort
        RpField({ label: 'Kunde', children: RpInput({ value: fKunde, onChange: setFKunde, placeholder: 'Kundenname' }) }),
        RpField({ label: 'Montageort', children: RpInput({ value: fOrt, onChange: setFOrt, placeholder: 'z.B. Grenchen, Industriestrasse 5' }) }),

        // Auftrag Nr.
        RpField({ label: 'Auftrag Nr. Arnold', children: RpInput({ value: fAuftrag, onChange: setFAuftrag, placeholder: 'Interne Auftragsnummer' }) }),

        // Beschrieb der Arbeiten
        RpField({ label: 'Beschrieb der Arbeiten', children: RpTextarea({ value: fBeschrieb, onChange: setFBeschrieb, placeholder: 'Was wurde gemacht? (Muffe, Splicing, BEP, Kabelzug...)' }) }),

        // Team + Zeiten
        RpField({ label: 'Personal / Team', children: RpInput({ value: fTeam, onChange: setFTeam, placeholder: 'z.B. Wälchli + Carvalho' }) }),
        React.createElement('div', { style: { display: 'flex', gap: 10, marginBottom: 12 } },
          React.createElement('div', { style: { flex: 1 } }, RpLabel({ text: 'Von' }), RpInput({ type: 'time', value: fHS, onChange: setFHS })),
          React.createElement('div', { style: { flex: 1 } }, RpLabel({ text: 'Bis' }), RpInput({ type: 'time', value: fHE, onChange: setFHE }))
        ),

        // Fahrzeug + KM
        React.createElement('div', { style: { display: 'flex', gap: 10, marginBottom: 12 } },
          React.createElement('div', { style: { flex: 1 } }, RpLabel({ text: 'Fahrzeug' }), RpSelect({ value: fFahrzeug, onChange: setFFahrzeug, opts: RP_FAHRZEUG_OPTS })),
          React.createElement('div', { style: { flex: 1 } }, RpLabel({ text: 'KM' }), RpInput({ type: 'number', value: fKm, onChange: setFKm, placeholder: '0' }))
        ),

        // Material
        RpField({ label: 'Material', children: RpTextarea({ value: fMat, onChange: setFMat, rows: 2, placeholder: 'z.B. 2× Muffe 6×4, 50m Kabel...' }) }),

        // BEP Spezifisch
        React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: '#3B82F6', marginBottom: 6, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 } }, '📦 BEP Spezifisch'),
        React.createElement('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 } },
          RP_BEP_KABEL.map(function(k) {
            return React.createElement('button', { key: k, onClick: function() { setFBepKab(fBepKab === k ? '' : k); },
              style: { padding: '5px 12px', borderRadius: 6, border: '1px solid ' + (fBepKab === k ? '#3B82F6' : '#2A2A38'),
                background: fBepKab === k ? '#3B82F622' : 'transparent', color: fBepKab === k ? '#3B82F6' : '#94A3B8', fontSize: 12, fontWeight: 700, cursor: 'pointer' } }, k);
          }),
          RpInput({ value: fBepKabC, onChange: setFBepKabC, placeholder: 'oder eigener Typ...' })
        ),
        React.createElement('div', { style: { display: 'flex', gap: 10, marginBottom: 8 } },
          React.createElement('div', { style: { flex: 1 } }, RpLabel({ text: 'Zuständig (Godoo)' }), RpInput({ value: fBepGod, onChange: setFBepGod, placeholder: 'Name Zuständiger' })),
        ),
        React.createElement('div', { style: { display: 'flex', gap: 10, marginBottom: 8 } },
          React.createElement('div', { style: { flex: 1 } }, RpLabel({ text: 'GAG Messung' }), RpInput({ value: fBepGAG, onChange: setFBepGAG, placeholder: 'z.B. 1.2 dB' })),
          React.createElement('div', { style: { flex: 1 } }, RpLabel({ text: 'Swisscom Messung' }), RpInput({ value: fBepSws, onChange: setFBepSws, placeholder: 'z.B. 0.8 dB' }))
        ),
        React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, cursor: 'pointer' } },
          React.createElement('input', { type: 'checkbox', checked: fBepFot, onChange: function(e) { setFBepFot(e.target.checked); } }),
          React.createElement('span', { style: { fontSize: 12 } }, '📷 Fotos gemacht')
        ),

        // Muffe Spezifisch
        React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: '#F59E0B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 } }, '🔩 Muffe Spezifisch'),
        RpField({ label: 'Anzahl Muffes', children: RpInput({ type: 'number', value: fMufAnz, onChange: setFMufAnz }) }),
        React.createElement('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 } },
          RP_MUFFE_TYP.map(function(t) {
            return React.createElement('button', { key: t, onClick: function() { setFMufTyp(fMufTyp === t ? '' : t); },
              style: { padding: '5px 12px', borderRadius: 6, border: '1px solid ' + (fMufTyp === t ? '#F59E0B' : '#2A2A38'),
                background: fMufTyp === t ? '#F59E0B22' : 'transparent', color: fMufTyp === t ? '#F59E0B' : '#94A3B8', fontSize: 12, fontWeight: 700, cursor: 'pointer' } }, t);
          }),
          RpInput({ value: fMufTypC, onChange: setFMufTypC, placeholder: 'oder eigener Typ...' })
        ),
        RpField({ label: 'Fasern Gespleisst', children: RpInput({ type: 'number', value: fMufFas, onChange: setFMufFas }) }),
        React.createElement('div', { style: { display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' } },
          React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' } },
            React.createElement('input', { type: 'checkbox', checked: fOtdrOk, onChange: function(e) { setFOtdrOk(e.target.checked); } }),
            React.createElement('span', { style: { fontSize: 12 } }, '✅ OTDR OK')
          ),
          React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' } },
            React.createElement('input', { type: 'checkbox', checked: fOtdrNok, onChange: function(e) { setFOtdrNok(e.target.checked); } }),
            React.createElement('span', { style: { fontSize: 12 } }, '⚠️ OTDR N.OK')
          ),
          React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' } },
            React.createElement('input', { type: 'checkbox', checked: fMufFot, onChange: function(e) { setFMufFot(e.target.checked); } }),
            React.createElement('span', { style: { fontSize: 12 } }, '📷 Fotos')
          )
        ),

        // Probleme / Bemerkungen
        RpField({ label: 'Probleme / Bemerkungen', children: RpTextarea({ value: fProb, onChange: setFProb, rows: 2, placeholder: 'OTDR Messung, offene Punkte...' }) }),

        // Status
        RpField({ label: 'Status', children: RpSelect({ value: fStatus, onChange: setFStatus, opts: [{ value: 'draft', label: '📝 Entwurf' }, { value: 'submitted', label: '✅ Abgegeben' }] }) }),

        React.createElement('div', { style: { display: 'flex', gap: 10, flexWrap: 'wrap' } },
          RpBtn({ label: 'Abbrechen', ghost: true, onClick: function() { setForm(null); } }),
          form !== 'new' && RpBtn({ label: '🖨️ Drucken', color: '#3B82F6', onClick: function() { rpPrintTages(form); } }),
          RpBtn({ label: fSaving ? '...' : '💾 Speichern', onClick: save })
        )
      )
    }),

    confirm && RpConfirm({
      title: 'Rapport löschen?',
      msg: 'Dieser Tagesrapport wird dauerhaft gelöscht.',
      onNo: function() { setConfirm(null); },
      onYes: function() { del(confirm); }
    })
  );
}

// ════════════════════════════════════════════════════════════════════
// WOCHENRAPPORT VIEW
// ════════════════════════════════════════════════════════════════════
function rpPrintWochen(item) {
  var w = window.open('', '_blank');
  function row(label, val) { return val ? '<tr><td class="lbl">'+label+'</td><td class="val">'+val+'</td></tr>' : ''; }
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Wochenbericht KW'+item.kw+'/'+item.jahr+'</title>'
    +'<style>'
    +'body{font-family:Arial,sans-serif;font-size:11px;margin:12mm;color:#000}'
    +'.hdr{display:flex;justify-content:space-between;border-bottom:2px solid #F06400;padding-bottom:6px;margin-bottom:10px}'
    +'.mark{width:10px;height:10px;background:#F06400;display:inline-block;margin-right:4px;vertical-align:middle}'
    +'.logo-name{font-size:18px;font-weight:900;vertical-align:middle}'
    +'table{width:100%;border-collapse:collapse;margin-bottom:8px}'
    +'th.sec{background:#F06400;color:#fff;font-size:10px;text-align:left;padding:3px 6px;text-transform:uppercase;letter-spacing:.5px}'
    +'.lbl{width:32%;background:#f5f5f5;border:1px solid #ccc;padding:3px 5px;font-weight:bold;font-size:9px;text-transform:uppercase;vertical-align:top}'
    +'.val{border:1px solid #ccc;padding:3px 5px;vertical-align:top}'
    +'.sig{display:flex;gap:15px;margin-top:14px}'
    +'.sig-box{flex:1;border:1px solid #000;height:50px;position:relative}'
    +'.sig-lbl{position:absolute;top:-8px;left:6px;background:#fff;padding:0 3px;font-size:9px;font-weight:bold}'
    +'@media print{@page{margin:10mm}}'
    +'</style></head><body>'
    +'<div class="hdr"><div><span class="mark"></span><span class="logo-name">Arnold</span><div style="font-size:9px;color:#555">Infra Services</div></div>'
    +'<div style="text-align:right"><div style="font-size:10px">Wochenbericht</div><div><strong>KW '+item.kw+' / '+item.jahr+'</strong></div>'
    +(item.datum_von&&item.datum_bis?'<div style="font-size:9px">'+item.datum_von+' – '+item.datum_bis+'</div>':'')+'</div></div>'
    +'<table><tr><th class="sec" colspan="2">Übersicht</th></tr>'
    +row('Total Stunden',item.total_stunden?item.total_stunden+' h':'')
    +row('Total KM',item.total_km?item.total_km+' km':'')
    +row('Status',item.status==='submitted'?'Abgegeben':'Entwurf')+'</table>'
    +'<table><tr><th class="sec" colspan="2">Zusammenfassung der Woche</th></tr>'
    +'<tr><td colspan="2" class="val" style="min-height:80px;white-space:pre-wrap">'+(item.zusammenfassung||'')+'</td></tr></table>'
    +(item.offene_arbeiten?'<table><tr><th class="sec" colspan="2">Offene Arbeiten</th></tr>'
      +'<tr><td colspan="2" class="val" style="white-space:pre-wrap">'+item.offene_arbeiten+'</td></tr></table>':'')
    +(item.bemerkungen?'<table><tr><th class="sec" colspan="2">Bemerkungen</th></tr>'
      +'<tr><td colspan="2" class="val" style="white-space:pre-wrap">'+item.bemerkungen+'</td></tr></table>':'')
    +'<div class="sig">'
    +'<div class="sig-box"><span class="sig-lbl">Unterschrift Monteur</span></div>'
    +'<div class="sig-box"><span class="sig-lbl">Unterschrift Arnold AG</span></div>'
    +'<div class="sig-box"><span class="sig-lbl">Datum</span></div>'
    +'</div>'
    +'<div style="text-align:right;margin-top:4px;font-size:9px;color:#888">Arnold Infra Services · Selzach · BKW Gruppe</div>'
    +'</body></html>';
  w.document.write(html);
  w.document.close();
  w.onload = function() { w.print(); };
}

function RpWochenView(props) {
  var userId = props.userId;
  var db = window.supabaseClient;

  var _stList = React.useState([]);
  var list = _stList[0], setList = _stList[1];
  var _stLoading = React.useState(false);
  var loading = _stLoading[0], setLoading = _stLoading[1];
  var _stForm = React.useState(null);
  var form = _stForm[0], setForm = _stForm[1];
  var _stExpanded = React.useState(null);
  var expanded = _stExpanded[0], setExpanded = _stExpanded[1];
  var _stConfirm = React.useState(null);
  var confirm = _stConfirm[0], setConfirm = _stConfirm[1];

  var kNow = rpKW(rpToday());
  var _fKW = React.useState(String(kNow.kw));        var fKW = _fKW[0], setFKW = _fKW[1];
  var _fJahr = React.useState(String(kNow.jahr));    var fJahr = _fJahr[0], setFJahr = _fJahr[1];
  var _fZus = React.useState('');                    var fZus = _fZus[0], setFZus = _fZus[1];
  var _fStd = React.useState('');                    var fStd = _fStd[0], setFStd = _fStd[1];
  var _fKm = React.useState('');                     var fKm = _fKm[0], setFKm = _fKm[1];
  var _fOff = React.useState('');                    var fOff = _fOff[0], setFOff = _fOff[1];
  var _fBem = React.useState('');                    var fBem = _fBem[0], setFBem = _fBem[1];
  var _fStatus = React.useState('draft');            var fStatus = _fStatus[0], setFStatus = _fStatus[1];
  var _fSaving = React.useState(false);              var fSaving = _fSaving[0], setFSaving = _fSaving[1];

  function load() {
    if (!db) return;
    setLoading(true);
    db.from('rapport_wochen').select('*').eq('user_id', userId).order('jahr', { ascending: false }).order('kw', { ascending: false })
      .then(function(r) { setList(r.data || []); setLoading(false); });
  }
  React.useEffect(load, []);

  function autoFill(kw, jahr) {
    // load tagesrapporte for that KW and compute totals
    if (!db) return;
    var monday = rpMondayOfKW(parseInt(kw), parseInt(jahr));
    var friday = rpShiftWeek(monday, 1);
    db.from('rapport_tages').select('h_start,h_end,km,beschrieb,arbeit').eq('user_id', userId).gte('datum', monday).lt('datum', friday)
      .then(function(r) {
        var items = r.data || [];
        var totalH = items.reduce(function(s, i) { return s + rpStunden(i.h_start, i.h_end); }, 0);
        var beschriebe = items.map(function(i) { return i.beschrieb || i.arbeit || ''; }).filter(Boolean);
        var totalKm = items.reduce(function(s, i) { return s + (i.km || 0); }, 0);
        var arbeitList = items.map(function(i) { return i.arbeit; }).filter(Boolean).join('\n\n');
        setFStd(totalH > 0 ? totalH.toFixed(1) : '');
        setFKm(totalKm > 0 ? String(totalKm) : '');
        setFZus(arbeitList ? 'Zusammenfassung KW ' + kw + ':\n' + arbeitList : '');
      });
  }

  function openNew() {
    var kNowX = rpKW(rpToday());
    setFKW(String(kNowX.kw)); setFJahr(String(kNowX.jahr));
    setFZus(''); setFStd(''); setFKm(''); setFOff(''); setFBem(''); setFStatus('draft');
    setForm('new');
    autoFill(kNowX.kw, kNowX.jahr);
  }
  function openEdit(item) {
    setFKW(String(item.kw)); setFJahr(String(item.jahr));
    setFZus(item.zusammenfassung || ''); setFStd(String(item.total_stunden || ''));
    setFKm(String(item.total_km || '')); setFOff(item.offene_arbeiten || '');
    setFBem(item.bemerkungen || ''); setFStatus(item.status || 'draft');
    setExpanded(null); setForm(item);
  }
  function save() {
    setFSaving(true);
    var mon = rpMondayOfKW(parseInt(fKW), parseInt(fJahr));
    var fri = new Date(mon + 'T12:00:00'); fri.setDate(fri.getDate() + 4);
    var payload = { user_id: userId, kw: parseInt(fKW), jahr: parseInt(fJahr), datum_von: mon, datum_bis: fri.toISOString().slice(0,10), zusammenfassung: fZus.trim(), total_stunden: parseFloat(fStd) || 0, total_km: parseInt(fKm) || 0, offene_arbeiten: fOff.trim(), bemerkungen: fBem.trim(), status: fStatus };
    var op = form === 'new' ? db.from('rapport_wochen').insert(payload) : db.from('rapport_wochen').update(payload).eq('id', form.id);
    op.then(function() { setForm(null); setFSaving(false); load(); }).catch(function() { setFSaving(false); });
  }
  function del(id) {
    db.from('rapport_wochen').delete().eq('id', id).then(function() { setConfirm(null); load(); });
  }

  return React.createElement('div', { style: { padding: '12px 14px', paddingBottom: 80, maxWidth: 600, margin: '0 auto' } },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 } },
      React.createElement('div', { style: { fontSize: 13, color: '#64748B' } }, list.length + ' Wochenberichte'),
      RpBtn({ label: '+ Neuer Wochenbericht', onClick: openNew })
    ),

    loading && React.createElement('div', { style: { textAlign: 'center', padding: 24, color: '#475569' } }, 'Lade...'),

    !loading && list.length === 0 && React.createElement('div', { style: Object.assign({}, rpS.card, { textAlign: 'center', color: '#475569', fontSize: 13 }) }, 'Noch keine Wochenberichte.'),

    list.map(function(item) {
      var isExp = expanded === item.id;
      var statusColor = item.status === 'submitted' ? '#10B981' : '#F59E0B';
      var mon = item.datum_von ? rpFmtD(item.datum_von, { day: '2-digit', month: '2-digit' }) : '';
      var fri = item.datum_bis ? rpFmtD(item.datum_bis, { day: '2-digit', month: '2-digit' }) : '';
      return React.createElement('div', {
        key: item.id,
        onClick: function() { setExpanded(isExp ? null : item.id); },
        style: Object.assign({}, rpS.card, { cursor: 'pointer', borderLeft: '3px solid ' + statusColor })
      },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
          React.createElement('div', null,
            React.createElement('div', { style: { fontWeight: 800, fontSize: 16, color: '#F59E0B' } }, 'KW ' + item.kw + ' · ' + item.jahr),
            mon && React.createElement('div', { style: { fontSize: 11, color: '#475569', marginTop: 2 } }, mon + ' – ' + fri)
          ),
          React.createElement('div', { style: { textAlign: 'right' } },
            React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: statusColor, textTransform: 'uppercase' } }, item.status === 'submitted' ? 'Abgegeben' : 'Entwurf'),
            React.createElement('div', { style: { display: 'flex', gap: 6, marginTop: 6, justifyContent: 'flex-end' } },
              item.total_stunden > 0 && React.createElement('span', { style: { fontSize: 11, color: '#64748B' } }, '⏱ ' + item.total_stunden + ' h'),
              item.total_km > 0 && React.createElement('span', { style: { fontSize: 11, color: '#64748B' } }, '🚗 ' + item.total_km + ' km')
            ),
            React.createElement('div', { style: { display: 'flex', gap: 6, marginTop: 8, justifyContent: 'flex-end' }, onClick: function(e) { e.stopPropagation(); } },
              RpBtn({ label: '✏️', sm: true, ghost: true, onClick: function() { openEdit(item); } }),
              RpBtn({ label: '🖨️', sm: true, color: '#3B82F6', onClick: function() { rpPrintWochen(item); } }),
              RpBtn({ label: '🗑️', sm: true, color: '#EF4444', onClick: function() { setConfirm(item.id); } })
            )
          )
        ),

        isExp && React.createElement('div', { style: { marginTop: 10, borderTop: '1px solid #1E293B', paddingTop: 10 }, onClick: function(e) { e.stopPropagation(); } },
          item.zusammenfassung && React.createElement('div', { style: { marginBottom: 8 } },
            React.createElement('div', { style: rpS.label }, 'Zusammenfassung'),
            React.createElement('div', { style: { fontSize: 12, color: '#CBD5E1', whiteSpace: 'pre-wrap' } }, item.zusammenfassung)
          ),
          item.offene_arbeiten && React.createElement('div', { style: { marginBottom: 8 } },
            React.createElement('div', { style: rpS.label }, 'Offene Arbeiten'),
            React.createElement('div', { style: { fontSize: 12, color: '#FCA5A5', whiteSpace: 'pre-wrap' } }, item.offene_arbeiten)
          ),
          item.bemerkungen && React.createElement('div', { style: { marginBottom: 8 } },
            React.createElement('div', { style: rpS.label }, 'Bemerkungen'),
            React.createElement('div', { style: { fontSize: 12, color: '#94A3B8', whiteSpace: 'pre-wrap' } }, item.bemerkungen)
          ),
          React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' } },
            RpBtn({ label: '✏️', sm: true, ghost: true, onClick: function() { openEdit(item); } }),
            RpBtn({ label: item.status === 'draft' ? '✓ Abgeben' : '↺ Entwurf', sm: true, color: item.status === 'draft' ? '#10B981' : '#475569', onClick: function() { db.from('rapport_wochen').update({ status: item.status === 'draft' ? 'submitted' : 'draft' }).eq('id', item.id).then(load); } }),
            RpBtn({ label: '🖨️ Drucken', sm: true, color: '#3B82F6', onClick: function() { rpPrintWochen(item); } }),
            RpBtn({ label: '🗑️', sm: true, color: '#EF4444', onClick: function() { setConfirm(item.id); } })
          )
        )
      );
    }),

    form !== null && RpOverlay({
      title: form === 'new' ? 'Neuer Wochenbericht' : 'Wochenbericht bearbeiten',
      onClose: function() { setForm(null); },
      children: React.createElement('div', null,
        React.createElement('div', { style: { display: 'flex', gap: 10, marginBottom: 12 } },
          React.createElement('div', { style: { flex: 1 } }, RpLabel({ text: 'KW' }), RpInput({ type: 'number', value: fKW, onChange: function(v) { setFKW(v); if (v && fJahr) autoFill(v, fJahr); } })),
          React.createElement('div', { style: { flex: 1 } }, RpLabel({ text: 'Jahr' }), RpInput({ type: 'number', value: fJahr, onChange: setFJahr })),
          React.createElement('div', { style: { flex: 1 } }, RpLabel({ text: 'Total Std.' }), RpInput({ type: 'number', value: fStd, onChange: setFStd, placeholder: '42.5' })),
          React.createElement('div', { style: { flex: 1 } }, RpLabel({ text: 'Total KM' }), RpInput({ type: 'number', value: fKm, onChange: setFKm }))
        ),
        React.createElement('div', { style: { fontSize: 11, color: '#475569', marginBottom: 10, padding: '6px 8px', background: '#0D1117', borderRadius: 6 } }, '💡 Std. und KM werden automatisch aus den Tagesrapporten dieser KW berechnet.'),
        RpField({ label: 'Zusammenfassung der Woche', children: RpTextarea({ value: fZus, onChange: setFZus, rows: 5, placeholder: 'Was wurde diese Woche gemacht?' }) }),
        RpField({ label: 'Offene Arbeiten', children: RpTextarea({ value: fOff, onChange: setFOff, rows: 2, placeholder: 'Was bleibt noch offen?' }) }),
        RpField({ label: 'Bemerkungen', children: RpTextarea({ value: fBem, onChange: setFBem, rows: 2, placeholder: 'Sonstiges...' }) }),
        RpField({ label: 'Status', children: RpSelect({ value: fStatus, onChange: setFStatus, opts: [{ value: 'draft', label: '📝 Entwurf' }, { value: 'submitted', label: '✅ Abgegeben' }] }) }),
        React.createElement('div', { style: { display: 'flex', gap: 10, flexWrap: 'wrap' } },
          RpBtn({ label: 'Abbrechen', ghost: true, onClick: function() { setForm(null); } }),
          form !== 'new' && RpBtn({ label: '🖨️ Drucken', color: '#3B82F6', onClick: function() { rpPrintWochen(form); } }),
          RpBtn({ label: fSaving ? '...' : '💾 Speichern', onClick: save })
        )
      )
    }),

    confirm && RpConfirm({
      title: 'Wochenbericht löschen?',
      msg: 'Dieser Bericht wird dauerhaft gelöscht.',
      onNo: function() { setConfirm(null); },
      onYes: function() { del(confirm); }
    })
  );
}

// ════════════════════════════════════════════════════════════════════
// MAIN RAPPORT APP
// ════════════════════════════════════════════════════════════════════
function RapportApp(props) {
  var onBack = props.onBack;
  var userId = props.profile && props.profile.id;

  var _stTab = React.useState('planung');
  var tab = _stTab[0], setTab = _stTab[1];

  var TABS = [
    { id: 'planung',  label: '📋 Planung' },
    { id: 'tages',   label: '📄 Tagesrapport' },
    { id: 'wochen',  label: '📊 Wochenbericht' },
  ];

  return React.createElement('div', { style: rpS.page },
    // ── Header
    React.createElement('div', {
      style: { background: '#0D1117', borderBottom: '1px solid #1E293B', padding: '14px 16px 0', position: 'sticky', top: 0, zIndex: 100 }
    },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 } },
        React.createElement('button', { onClick: onBack, style: { background: 'none', border: 'none', color: '#64748B', fontSize: 22, cursor: 'pointer', padding: 0 } }, '‹'),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          React.createElement('svg', { width: 32, height: 32, viewBox: '0 0 32 32', xmlns: 'http://www.w3.org/2000/svg' },
            React.createElement('rect', { width: 32, height: 32, fill: '#111111' }),
            React.createElement('rect', { x: 4, y: 4, width: 14, height: 14, fill: '#F06400' })
          ),
          React.createElement('div', null,
            React.createElement('div', { style: { fontWeight: 800, fontSize: 15 } }, 'Arnold Rapport'),
            React.createElement('div', { style: { fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' } }, 'Arnold AG · Selzach')
          )
        )
      ),
      // ── Tab bar
      React.createElement('div', { style: { display: 'flex', overflowX: 'auto' } },
        TABS.map(function(t) {
          var active = tab === t.id;
          return React.createElement('button', {
            key: t.id,
            onClick: function() { setTab(t.id); },
            style: { background: 'none', border: 'none', padding: '8px 14px', fontSize: 13, fontWeight: active ? 700 : 500, color: active ? '#F59E0B' : '#475569', borderBottom: '2px solid ' + (active ? '#F59E0B' : 'transparent'), cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }
          }, t.label);
        })
      )
    ),

    // ── Content
    tab === 'planung'  && React.createElement(RpPlanungView, { userId: userId }),
    tab === 'tages'    && React.createElement(RpTagesView,   { userId: userId }),
    tab === 'wochen'   && React.createElement(RpWochenView,  { userId: userId })
  );
}
