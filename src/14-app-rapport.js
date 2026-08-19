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

  // form state
  var _fDate = React.useState(rpToday());   var fDate = _fDate[0], setFDate = _fDate[1];
  var _fBau = React.useState('');           var fBau = _fBau[0], setFBau = _fBau[1];
  var _fKant = React.useState('SO');        var fKant = _fKant[0], setFKant = _fKant[1];
  var _fWet = React.useState('sonnig');     var fWet = _fWet[0], setFWet = _fWet[1];
  var _fHS = React.useState('07:00');       var fHS = _fHS[0], setFHS = _fHS[1];
  var _fHE = React.useState('17:00');       var fHE = _fHE[0], setFHE = _fHE[1];
  var _fTeam = React.useState('');          var fTeam = _fTeam[0], setFTeam = _fTeam[1];
  var _fArbeit = React.useState('');        var fArbeit = _fArbeit[0], setFArbeit = _fArbeit[1];
  var _fMat = React.useState('');           var fMat = _fMat[0], setFMat = _fMat[1];
  var _fKm = React.useState('');            var fKm = _fKm[0], setFKm = _fKm[1];
  var _fProb = React.useState('');          var fProb = _fProb[0], setFProb = _fProb[1];
  var _fStatus = React.useState('draft');   var fStatus = _fStatus[0], setFStatus = _fStatus[1];
  var _fSaving = React.useState(false);     var fSaving = _fSaving[0], setFSaving = _fSaving[1];

  function load() {
    if (!db) return;
    setLoading(true);
    db.from('rapport_tages').select('*').eq('user_id', userId).order('datum', { ascending: false })
      .then(function(r) { setList(r.data || []); setLoading(false); });
  }
  React.useEffect(load, []);

  function openNew() {
    setFDate(rpToday()); setFBau(''); setFKant('SO'); setFWet('sonnig');
    setFHS('07:00'); setFHE('17:00'); setFTeam(''); setFArbeit('');
    setFMat(''); setFKm(''); setFProb(''); setFStatus('draft');
    setForm('new');
  }
  function openEdit(item) {
    setFDate(item.datum); setFBau(item.baustelle || ''); setFKant(item.kanton || 'SO');
    setFWet(item.wetter || 'sonnig'); setFHS(item.h_start || '07:00'); setFHE(item.h_end || '17:00');
    setFTeam(item.team || ''); setFArbeit(item.arbeit || ''); setFMat(item.material || '');
    setFKm(String(item.km || '')); setFProb(item.probleme || ''); setFStatus(item.status || 'draft');
    setViewItem(null); setForm(item);
  }
  function save() {
    if (!fBau.trim()) return;
    setFSaving(true);
    var h = rpStunden(fHS, fHE);
    var payload = { user_id: userId, datum: fDate, baustelle: fBau.trim(), kanton: fKant, wetter: fWet, h_start: fHS, h_end: fHE, stunden: h, team: fTeam.trim(), arbeit: fArbeit.trim(), material: fMat.trim(), km: parseInt(fKm) || 0, probleme: fProb.trim(), status: fStatus };
    var op = form === 'new' ? db.from('rapport_tages').insert(payload) : db.from('rapport_tages').update(payload).eq('id', form.id);
    op.then(function() { setForm(null); setFSaving(false); load(); }).catch(function() { setFSaving(false); });
  }
  function del(id) {
    db.from('rapport_tages').delete().eq('id', id).then(function() { setConfirm(null); setViewItem(null); load(); });
  }

  var wetterLabel = { sonnig: '☀️', bewoelkt: '⛅', regnerisch: '🌧️', schnee: '❄️', windig: '💨' };

  return React.createElement('div', { style: { padding: '12px 14px', paddingBottom: 80, maxWidth: 600, margin: '0 auto' } },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 } },
      React.createElement('div', { style: { fontSize: 13, color: '#64748B' } }, list.length + ' Rapporte'),
      RpBtn({ label: '+ Neuer Tagesrapport', onClick: openNew })
    ),

    loading && React.createElement('div', { style: { textAlign: 'center', padding: 24, color: '#475569' } }, 'Lade...'),

    !loading && list.length === 0 && React.createElement('div', { style: Object.assign({}, rpS.card, { textAlign: 'center', color: '#475569', fontSize: 13 }) }, 'Noch keine Tagesrapporte.'),

    list.map(function(item) {
      var h = rpStunden(item.h_start, item.h_end);
      var statusColor = item.status === 'submitted' ? '#10B981' : '#F59E0B';
      return React.createElement('div', {
        key: item.id,
        onClick: function() { setViewItem(viewItem && viewItem.id === item.id ? null : item); },
        style: Object.assign({}, rpS.card, { cursor: 'pointer', borderLeft: '3px solid ' + statusColor })
      },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
          React.createElement('div', null,
            React.createElement('div', { style: { fontWeight: 700, fontSize: 14 } }, rpFmtD(item.datum, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })),
            React.createElement('div', { style: { fontSize: 12, color: '#94A3B8', marginTop: 2 } }, item.baustelle + (item.kanton ? ' [' + item.kanton + ']' : ''))
          ),
          React.createElement('div', { style: { textAlign: 'right' } },
            React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: statusColor, textTransform: 'uppercase' } }, item.status === 'submitted' ? 'Abgegeben' : 'Entwurf'),
            React.createElement('div', { style: { fontSize: 11, color: '#64748B', marginTop: 2 } }, wetterLabel[item.wetter] || '☀️' )
          )
        ),
        React.createElement('div', { style: { display: 'flex', gap: 14, marginTop: 6, flexWrap: 'wrap' } },
          React.createElement('span', { style: { fontSize: 11, color: '#64748B' } }, '🕐 ' + (item.h_start || '—') + '–' + (item.h_end || '—') + ' (' + h.toFixed(1) + ' h)'),
          item.team && React.createElement('span', { style: { fontSize: 11, color: '#64748B' } }, '👷 ' + item.team),
          item.km > 0 && React.createElement('span', { style: { fontSize: 11, color: '#64748B' } }, '🚗 ' + item.km + ' km')
        ),

        viewItem && viewItem.id === item.id && React.createElement('div', { style: { marginTop: 10, borderTop: '1px solid #1E293B', paddingTop: 10 }, onClick: function(e) { e.stopPropagation(); } },
          item.arbeit && React.createElement('div', { style: { marginBottom: 8 } },
            React.createElement('div', { style: rpS.label }, 'Ausgeführte Arbeiten'),
            React.createElement('div', { style: { fontSize: 12, color: '#CBD5E1', whiteSpace: 'pre-wrap' } }, item.arbeit)
          ),
          item.material && React.createElement('div', { style: { marginBottom: 8 } },
            React.createElement('div', { style: rpS.label }, 'Material'),
            React.createElement('div', { style: { fontSize: 12, color: '#CBD5E1' } }, item.material)
          ),
          item.probleme && React.createElement('div', { style: { marginBottom: 8 } },
            React.createElement('div', { style: rpS.label }, 'Probleme / Bemerkungen'),
            React.createElement('div', { style: { fontSize: 12, color: '#FCA5A5', whiteSpace: 'pre-wrap' } }, item.probleme)
          ),
          React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 8 } },
            RpBtn({ label: '✏️ Bearbeiten', sm: true, ghost: true, onClick: function() { openEdit(item); } }),
            RpBtn({ label: item.status === 'draft' ? '✓ Abgeben' : '↺ Entwurf', sm: true, color: item.status === 'draft' ? '#10B981' : '#475569', onClick: function() { db.from('rapport_tages').update({ status: item.status === 'draft' ? 'submitted' : 'draft' }).eq('id', item.id).then(load); } }),
            RpBtn({ label: '🗑️', sm: true, color: '#EF4444', onClick: function() { setConfirm(item.id); } })
          )
        )
      );
    }),

    form !== null && RpOverlay({
      title: form === 'new' ? 'Neuer Tagesrapport' : 'Rapport bearbeiten',
      onClose: function() { setForm(null); },
      children: React.createElement('div', null,
        React.createElement('div', { style: { display: 'flex', gap: 10, marginBottom: 12 } },
          React.createElement('div', { style: { flex: 2 } }, RpLabel({ text: 'Datum' }), RpInput({ type: 'date', value: fDate, onChange: setFDate })),
          React.createElement('div', { style: { flex: 1 } }, RpLabel({ text: 'Wetter' }), RpSelect({ value: fWet, onChange: setFWet, opts: RP_WETTER_OPTS }))
        ),
        RpField({ label: 'Baustelle / Ort', children: RpInput({ value: fBau, onChange: setFBau, placeholder: 'z.B. Grenchen Industriestr.' }) }),
        React.createElement('div', { style: { display: 'flex', gap: 10, marginBottom: 12 } },
          React.createElement('div', { style: { flex: 1 } }, RpLabel({ text: 'Kanton' }), RpSelect({ value: fKant, onChange: setFKant, opts: RP_KANTONE.map(function(k) { return { value: k, label: k }; }) })),
          React.createElement('div', { style: { flex: 1 } }, RpLabel({ text: 'Von' }), RpInput({ type: 'time', value: fHS, onChange: setFHS })),
          React.createElement('div', { style: { flex: 1 } }, RpLabel({ text: 'Bis' }), RpInput({ type: 'time', value: fHE, onChange: setFHE })),
          React.createElement('div', { style: { flex: 1 } }, RpLabel({ text: 'KM' }), RpInput({ type: 'number', value: fKm, onChange: setFKm }))
        ),
        RpField({ label: 'Team / Equipa', children: RpInput({ value: fTeam, onChange: setFTeam, placeholder: 'z.B. Wälchli + Pat' }) }),
        RpField({ label: 'Ausgeführte Arbeiten', children: RpTextarea({ value: fArbeit, onChange: setFArbeit, placeholder: 'Was wurde gemacht? (Muffe, Splicing, BEP...)' }) }),
        RpField({ label: 'Material verwendet', children: RpInput({ value: fMat, onChange: setFMat, placeholder: 'z.B. 2× Muffe 6×4, 50m Kabel...' }) }),
        RpField({ label: 'Probleme / Bemerkungen', children: RpTextarea({ value: fProb, onChange: setFProb, rows: 2, placeholder: 'Probleme, offene Punkte...' }) }),
        RpField({ label: 'Status', children: RpSelect({ value: fStatus, onChange: setFStatus, opts: [{ value: 'draft', label: '📝 Entwurf' }, { value: 'submitted', label: '✅ Abgegeben' }] }) }),
        React.createElement('div', { style: { display: 'flex', gap: 10 } },
          RpBtn({ label: 'Abbrechen', ghost: true, onClick: function() { setForm(null); } }),
          RpBtn({ label: fSaving ? '...' : 'Speichern', onClick: save })
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
    db.from('rapport_tages').select('h_start,h_end,km,arbeit').eq('user_id', userId).gte('datum', monday).lt('datum', friday)
      .then(function(r) {
        var items = r.data || [];
        var totalH = items.reduce(function(s, i) { return s + rpStunden(i.h_start, i.h_end); }, 0);
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
            React.createElement('div', { style: { display: 'flex', gap: 10, marginTop: 4, justifyContent: 'flex-end' } },
              item.total_stunden > 0 && React.createElement('span', { style: { fontSize: 11, color: '#64748B' } }, '⏱ ' + item.total_stunden + ' h'),
              item.total_km > 0 && React.createElement('span', { style: { fontSize: 11, color: '#64748B' } }, '🚗 ' + item.total_km + ' km')
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
          React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 8 } },
            RpBtn({ label: '✏️ Bearbeiten', sm: true, ghost: true, onClick: function() { openEdit(item); } }),
            RpBtn({ label: item.status === 'draft' ? '✓ Abgeben' : '↺ Entwurf', sm: true, color: item.status === 'draft' ? '#10B981' : '#475569', onClick: function() { db.from('rapport_wochen').update({ status: item.status === 'draft' ? 'submitted' : 'draft' }).eq('id', item.id).then(load); } }),
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
        React.createElement('div', { style: { display: 'flex', gap: 10 } },
          RpBtn({ label: 'Abbrechen', ghost: true, onClick: function() { setForm(null); } }),
          RpBtn({ label: fSaving ? '...' : 'Speichern', onClick: save })
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
          React.createElement('div', { style: { width: 30, height: 30, borderRadius: 8, background: '#F59E0B22', border: '1px solid #F59E0B44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 } }, '📋'),
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
