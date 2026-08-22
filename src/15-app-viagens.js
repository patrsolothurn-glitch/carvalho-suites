// ══════════════════════════════════════════════════════════════════
// VIAGENS & VISITAS — histórico de férias e visitas da família,
// organizado por mês/ano. Tabela Supabase: family_trips (partilhada,
// visível a quem tiver acesso — mesmo modelo de family_events).
// ══════════════════════════════════════════════════════════════════

var VG_TYPES = [
  { id: 'ferias', emoji: '🏖️', label: 'Férias', color: T.orange },
  { id: 'visita', emoji: '👥', label: 'Visita', color: T.green },
  { id: 'evento', emoji: '🎉', label: 'Evento', color: '#A855F7' },
  { id: 'outro',  emoji: '📍', label: 'Outro',  color: T.muted }
];
function vgType(id) {
  for (var i = 0; i < VG_TYPES.length; i++) if (VG_TYPES[i].id === id) return VG_TYPES[i];
  return VG_TYPES[3];
}
function vgBg(color) {
  var h = color.replace('#', '');
  if (h.length !== 6) return 'rgba(122,122,144,0.14)';
  var r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',0.14)';
}

var VG_MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
var VG_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function vgBlankForm(mes) {
  return { tipo: 'ferias', titulo: '', local: '', mes: mes || 0, dia_inicio: '', dia_fim: '', notas: '', foto: null };
}
function vgResizeImage(dataUrl, maxSize) {
  return new Promise(function (resolve) {
    try {
      var img = new Image();
      img.onload = function () {
        try {
          var size = maxSize || 600;
          var canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          var ctx = canvas.getContext('2d');
          var scale = Math.max(size / img.width, size / img.height);
          var w = img.width * scale, h = img.height * scale;
          var x = (size - w) / 2, y = (size - h) / 2;
          ctx.drawImage(img, x, y, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        } catch (e) { resolve(dataUrl); }
      };
      img.onerror = function () { resolve(dataUrl); };
      img.src = dataUrl;
    } catch (e) { resolve(dataUrl); }
  });
}

// ── Cartão de entrada ────────────────────────────────────────────────
function VgTripCard(props) {
  var trip = props.trip, onEdit = props.onEdit, onDelete = props.onDelete, onPhotoClick = props.onPhotoClick;
  var ti = vgType(trip.tipo);
  var days = (trip.dia_inicio && trip.dia_fim) ? (trip.dia_inicio + '–' + trip.dia_fim + ' ' + VG_SHORT[trip.mes])
    : trip.dia_inicio ? (trip.dia_inicio + ' ' + VG_SHORT[trip.mes]) : null;

  return React.createElement(Card, {
    style: { padding: '13px 15px', borderLeft: '4px solid ' + ti.color, display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }
  },
    trip.foto && React.createElement('img', {
      src: trip.foto, onClick: function () { if (onPhotoClick) onPhotoClick(trip.foto); },
      style: { width: 56, height: 56, borderRadius: 12, objectFit: 'cover', flexShrink: 0, border: '1px solid ' + T.border, cursor: 'pointer' }
    }),
    React.createElement('div', { style: { flex: 1, minWidth: 0 } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, flexWrap: 'wrap' } },
        React.createElement('span', { style: { fontSize: 11, fontWeight: 800, color: '#fff', background: ti.color, padding: '3px 10px', borderRadius: 20 } }, ti.emoji + ' ' + ti.label),
        days && React.createElement('span', { style: { fontSize: 11, color: T.muted } }, days)
      ),
      React.createElement('div', { style: { fontWeight: 800, fontSize: 15.5, marginBottom: 2, color: T.text } }, trip.titulo),
      React.createElement('div', { style: { color: T.muted, fontSize: 13 } }, '📍 ' + trip.local),
      trip.notas && React.createElement('div', { style: { color: T.muted, fontSize: 12, marginTop: 5, lineHeight: 1.4, opacity: 0.85 } }, trip.notas)
    ),
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 5 } },
      React.createElement('button', { onClick: onEdit, style: { background: 'none', border: '1px solid ' + T.border, borderRadius: 9, padding: '6px 9px', fontSize: 13, cursor: 'pointer' } }, '✏️'),
      React.createElement('button', { onClick: onDelete, style: { background: 'none', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 9, padding: '6px 9px', fontSize: 13, cursor: 'pointer' } }, '🗑️')
    )
  );
}

// ── Formulário (nova / editar) ──────────────────────────────────────
function VgForm(props) {
  var form = props.form, setForm = props.setForm, onSave = props.onSave, onCancel = props.onCancel, isEdit = props.isEdit, saving = props.saving;
  var valid = form.titulo.trim() && form.local.trim();

  function field(label, input) {
    return React.createElement('div', { style: { marginBottom: 12 } },
      React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 5, letterSpacing: '0.06em' } }, label),
      input
    );
  }
  var inputStyle = { width: '100%', padding: '11px 13px', borderRadius: 10, border: '1px solid ' + T.border, background: T.surface2, color: T.text, fontSize: 14, boxSizing: 'border-box', outline: 'none' };

  return React.createElement('div', { style: { padding: 16, maxWidth: 520, margin: '0 auto' } },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 } },
      React.createElement('button', { onClick: onCancel, style: { background: 'none', border: 'none', color: T.muted, fontSize: 24, cursor: 'pointer' } }, '‹'),
      React.createElement('span', { style: { fontWeight: 800, fontSize: 18 } }, isEdit ? 'Editar Entrada' : 'Nova Entrada')
    ),

    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 } },
      VG_TYPES.map(function (t) {
        var sel = form.tipo === t.id;
        return React.createElement('button', {
          key: t.id,
          onClick: function () { setForm(Object.assign({}, form, { tipo: t.id })); },
          style: { padding: '10px 6px', borderRadius: 11, fontWeight: 800, cursor: 'pointer', fontSize: 13, border: '2px solid ' + (sel ? t.color : T.border), background: sel ? t.color : T.surface2, color: sel ? '#fff' : T.muted }
        }, t.emoji + ' ' + t.label);
      })
    ),

    field('MÊS', React.createElement('select', {
      value: form.mes, onChange: function (e) { setForm(Object.assign({}, form, { mes: parseInt(e.target.value, 10) })); }, style: inputStyle
    }, VG_MONTHS.map(function (m, i) { return React.createElement('option', { key: i, value: i }, m); }))),

    field('TÍTULO', React.createElement('input', {
      value: form.titulo, onChange: function (e) { setForm(Object.assign({}, form, { titulo: e.target.value })); }, placeholder: 'Ex: Férias em família', style: inputStyle
    })),

    field('LOCAL', React.createElement('input', {
      value: form.local, onChange: function (e) { setForm(Object.assign({}, form, { local: e.target.value })); }, placeholder: 'Ex: Fafe, Portugal', style: inputStyle
    })),

    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 } },
      field('DIA INÍCIO', React.createElement('input', {
        type: 'number', min: 1, max: 31, value: form.dia_inicio, onChange: function (e) { setForm(Object.assign({}, form, { dia_inicio: e.target.value })); }, placeholder: '1', style: inputStyle
      })),
      field('DIA FIM', React.createElement('input', {
        type: 'number', min: 1, max: 31, value: form.dia_fim, onChange: function (e) { setForm(Object.assign({}, form, { dia_fim: e.target.value })); }, placeholder: '31', style: inputStyle
      }))
    ),

    field('FOTO (OPCIONAL)', form.foto
      ? React.createElement('div', { style: { position: 'relative', width: 90, height: 90 } },
          React.createElement('img', { src: form.foto, style: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12, border: '1px solid ' + T.border } }),
          React.createElement('button', {
            onClick: function () { setForm(Object.assign({}, form, { foto: null })); },
            style: { position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%', background: '#EF4444', color: '#fff', border: '2px solid ' + T.surface, fontSize: 12, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }
          }, '✕')
        )
      : React.createElement('label', {
          style: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 90, height: 90, borderRadius: 12, border: '2px dashed ' + T.border, background: T.surface2, cursor: 'pointer', color: T.muted, fontSize: 24 }
        },
          '➕',
          React.createElement('input', {
            type: 'file', accept: 'image/*', style: { display: 'none' },
            onChange: function (e) {
              var file = e.target.files[0];
              if (!file) return;
              var reader = new FileReader();
              reader.onload = function (ev2) {
                vgResizeImage(ev2.target.result, 600).then(function (resized) {
                  setForm(Object.assign({}, form, { foto: resized }));
                });
              };
              reader.readAsDataURL(file);
            }
          })
        )
    ),

    field('NOTAS', React.createElement('textarea', {
      value: form.notas, onChange: function (e) { setForm(Object.assign({}, form, { notas: e.target.value })); }, placeholder: 'Quem foi, o que fizeram...', rows: 3, style: Object.assign({}, inputStyle, { resize: 'vertical' })
    })),

    React.createElement('button', {
      onClick: onSave, disabled: !valid || saving,
      style: { width: '100%', padding: 14, marginTop: 8, borderRadius: 12, border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer', background: 'linear-gradient(135deg,' + T.gold + ',' + T.goldL + ')', color: T.bg, opacity: (!valid || saving) ? 0.45 : 1 }
    }, saving ? 'A guardar…' : (isEdit ? 'Guardar Alterações' : '✚ Adicionar'))
  );
}

// ── App principal ────────────────────────────────────────────────────
function ViagensApp(props) {
  var onBack = props.onBack;
  var profile = props.profile;
  var db = window.supabaseClient;

  var _stTrips = React.useState([]);
  var trips = _stTrips[0], setTrips = _stTrips[1];
  var _stLoading = React.useState(true);
  var loading = _stLoading[0], setLoading = _stLoading[1];
  var _stYear = React.useState(new Date().getFullYear());
  var year = _stYear[0], setYear = _stYear[1];
  var _stSelMonth = React.useState(null);
  var selMonth = _stSelMonth[0], setSelMonth = _stSelMonth[1];
  var _stForm = React.useState(null); // null | 'new' | trip object (edit)
  var form = _stForm[0], setForm = _stForm[1];
  var _stFormData = React.useState(vgBlankForm());
  var formData = _stFormData[0], setFormData = _stFormData[1];
  var _stSaving = React.useState(false);
  var saving = _stSaving[0], setSaving = _stSaving[1];
  var _stConfirmDel = React.useState(null);
  var confirmDel = _stConfirmDel[0], setConfirmDel = _stConfirmDel[1];
  var _stLightbox = React.useState(null);
  var fotoLightbox = _stLightbox[0], setFotoLightbox = _stLightbox[1];

  function load() {
    if (!db) { setLoading(false); return; }
    setLoading(true);
    db.from('family_trips').select('*').order('ano', { ascending: false }).order('mes').then(function (r) {
      setTrips(r.data || []);
      setLoading(false);
    }).catch(function () { setLoading(false); });
  }
  React.useEffect(load, []);

  function byMonth(y, m) {
    return trips.filter(function (t) { return t.ano === y && t.mes === m; })
      .sort(function (a, b) { return (parseInt(a.dia_inicio, 10) || 0) - (parseInt(b.dia_inicio, 10) || 0); });
  }
  var yearTrips = trips.filter(function (t) { return t.ano === year; });

  function openAdd(mes) { setFormData(vgBlankForm(mes)); setForm('new'); }
  function openEdit(trip) {
    setFormData({ tipo: trip.tipo, titulo: trip.titulo, local: trip.local, mes: trip.mes, dia_inicio: trip.dia_inicio || '', dia_fim: trip.dia_fim || '', notas: trip.notas || '', foto: trip.foto || null });
    setForm(trip);
  }
  function saveTrip() {
    if (!formData.titulo.trim() || !formData.local.trim()) return;
    setSaving(true);
    var payload = {
      tipo: formData.tipo, titulo: formData.titulo.trim(), local: formData.local.trim(),
      ano: year, mes: formData.mes,
      dia_inicio: formData.dia_inicio ? parseInt(formData.dia_inicio, 10) : null,
      dia_fim: formData.dia_fim ? parseInt(formData.dia_fim, 10) : null,
      notas: formData.notas.trim(),
      foto: formData.foto || null,
      created_by: profile && profile.id
    };
    var op = (form === 'new')
      ? db.from('family_trips').insert(payload)
      : db.from('family_trips').update(payload).eq('id', form.id);
    op.then(function () { setSaving(false); setForm(null); load(); }).catch(function () { setSaving(false); });
  }
  function deleteTrip(id) {
    db.from('family_trips').delete().eq('id', id).then(function () { setConfirmDel(null); load(); });
  }

  var headerBar = React.createElement('div', {
    style: { background: T.surface, borderBottom: '1px solid ' + T.goldBrd, padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 200 }
  },
    React.createElement('button', { onClick: onBack, style: { background: 'none', border: 'none', color: T.gold, fontSize: 26, cursor: 'pointer', lineHeight: 1, padding: 0 } }, '‹'),
    React.createElement('div', null,
      React.createElement('div', { style: { fontWeight: 800, fontSize: 17 } }, '✈️ Viagens & Visitas'),
      React.createElement('div', { style: { fontSize: 11, color: T.muted } }, 'Onde fomos e quando')
    )
  );

  if (form) {
    return React.createElement('div', { style: Object.assign({}, wrap, { paddingBottom: 40 }) },
      headerBar,
      React.createElement(VgForm, { form: formData, setForm: setFormData, onSave: saveTrip, onCancel: function () { setForm(null); }, isEdit: form !== 'new', saving: saving })
    );
  }

  var confirmModal = confirmDel && React.createElement('div', {
    style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: 24 }
  },
    React.createElement(Card, { style: { padding: 22, maxWidth: 340, width: '100%' } },
      React.createElement('div', { style: { fontWeight: 800, fontSize: 16, marginBottom: 8 } }, 'Apagar esta entrada?'),
      React.createElement('div', { style: { color: T.muted, fontSize: 13, marginBottom: 18 } }, 'Esta ação não pode ser desfeita.'),
      React.createElement('div', { style: { display: 'flex', gap: 10 } },
        React.createElement('button', { onClick: function () { setConfirmDel(null); }, style: { flex: 1, padding: 11, borderRadius: 10, border: '1px solid ' + T.border, background: 'none', color: T.muted, fontWeight: 700, cursor: 'pointer' } }, 'Cancelar'),
        React.createElement('button', { onClick: function () { deleteTrip(confirmDel); }, style: { flex: 1, padding: 11, borderRadius: 10, border: 'none', background: '#EF4444', color: '#fff', fontWeight: 700, cursor: 'pointer' } }, 'Apagar')
      )
    )
  );

  var fotoLightboxModal = fotoLightbox && React.createElement('div', {
    onClick: function () { setFotoLightbox(null); },
    style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600, padding: 20 }
  },
    React.createElement('img', { src: fotoLightbox, style: { maxWidth: '100%', maxHeight: '85vh', borderRadius: 14, objectFit: 'contain' } })
  );

  if (selMonth !== null) {
    var mTrips = byMonth(year, selMonth);
    return React.createElement('div', { style: Object.assign({}, wrap, { paddingBottom: 40 }) },
      headerBar,
      React.createElement('div', { style: { padding: 16, maxWidth: 520, margin: '0 auto' } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
            React.createElement('button', { onClick: function () { setSelMonth(null); }, style: { background: 'none', border: 'none', color: T.muted, fontSize: 22, cursor: 'pointer' } }, '←'),
            React.createElement('div', null,
              React.createElement('div', { style: { fontWeight: 800, fontSize: 19 } }, VG_MONTHS[selMonth]),
              React.createElement('div', { style: { fontSize: 12, color: T.muted } }, year + ' · ' + mTrips.length + ' entrada' + (mTrips.length !== 1 ? 's' : ''))
            )
          ),
          React.createElement(GoldBtn, { onClick: function () { openAdd(selMonth); }, style: { padding: '9px 16px', fontSize: 13 } }, '+ Novo')
        ),
        loading && React.createElement('div', { style: { textAlign: 'center', padding: 30, color: T.muted } }, 'A carregar…'),
        !loading && mTrips.length === 0 && React.createElement('div', { style: { textAlign: 'center', padding: '46px 16px', color: T.muted } },
          React.createElement('div', { style: { fontSize: 44, marginBottom: 10 } }, '📅'),
          React.createElement('div', { style: { fontSize: 14, marginBottom: 14 } }, 'Nenhuma entrada neste mês'),
          React.createElement('button', { onClick: function () { openAdd(selMonth); }, style: { background: 'none', border: '1px dashed ' + T.border, borderRadius: 10, padding: '9px 16px', color: T.muted, cursor: 'pointer' } }, 'Adicionar entrada')
        ),
        !loading && mTrips.map(function (t) {
          return React.createElement(VgTripCard, { key: t.id, trip: t, onEdit: function () { openEdit(t); }, onDelete: function () { setConfirmDel(t.id); }, onPhotoClick: function (foto) { setFotoLightbox(foto); } });
        })
      ),
      confirmModal,
      fotoLightboxModal
    );
  }

  var now = new Date();
  return React.createElement('div', { style: Object.assign({}, wrap, { paddingBottom: 40 }) },
    headerBar,
    React.createElement('div', { style: { padding: 16, maxWidth: 520, margin: '0 auto' } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 } },
        React.createElement('div', { style: { fontSize: 12.5, color: T.muted } }, yearTrips.length + ' entrada' + (yearTrips.length !== 1 ? 's' : '') + ' em ' + year),
        React.createElement(GoldBtn, { onClick: function () { openAdd(now.getMonth()); }, style: { padding: '9px 16px', fontSize: 13 } }, '+ Novo')
      ),

      React.createElement(Card, { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '11px 0', marginBottom: 14 } },
        React.createElement('button', { onClick: function () { setYear(year - 1); }, style: { background: 'none', border: 'none', color: T.muted, fontSize: 22, cursor: 'pointer' } }, '‹'),
        React.createElement('span', { style: { fontWeight: 900, fontSize: 22 } }, year),
        React.createElement('button', { onClick: function () { setYear(year + 1); }, style: { background: 'none', border: 'none', color: T.muted, fontSize: 22, cursor: 'pointer' } }, '›')
      ),

      loading && React.createElement('div', { style: { textAlign: 'center', padding: 30, color: T.muted } }, 'A carregar…'),

      !loading && React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 } },
        VG_MONTHS.map(function (_, idx) {
          var mTrips = byMonth(year, idx);
          var isCurrent = now.getFullYear() === year && now.getMonth() === idx;
          return React.createElement('button', {
            key: idx, onClick: function () { setSelMonth(idx); },
            style: {
              background: isCurrent ? T.goldDim : T.surface, border: '2px solid ' + (isCurrent ? T.gold : (mTrips.length ? T.goldBrd : T.border)),
              borderRadius: 13, padding: '11px 10px', cursor: 'pointer', textAlign: 'left'
            }
          },
            React.createElement('div', { style: { fontWeight: 700, fontSize: 11, color: isCurrent ? T.gold : T.muted, marginBottom: 6 } }, VG_SHORT[idx]),
            mTrips.length === 0
              ? React.createElement('div', { style: { color: T.border, fontSize: 10 } }, '—')
              : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 3 } },
                  mTrips.slice(0, 3).map(function (t) {
                    var ti = vgType(t.tipo);
                    return React.createElement('div', { key: t.id, style: { fontSize: 10, fontWeight: 700, color: '#fff', background: ti.color, padding: '2px 6px', borderRadius: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, t.titulo);
                  }),
                  mTrips.length > 3 && React.createElement('div', { style: { fontSize: 10, color: T.muted } }, '+' + (mTrips.length - 3) + ' mais')
                )
          );
        })
      ),

      React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 16, justifyContent: 'center' } },
        VG_TYPES.map(function (t) {
          return React.createElement('span', { key: t.id, style: { fontSize: 11, fontWeight: 800, color: '#fff', background: t.color, padding: '3px 10px', borderRadius: 20 } }, t.emoji + ' ' + t.label);
        })
      )
    ),
    confirmModal,
    fotoLightboxModal
  );
}
