// ══════════════════════════════════════════════════════════════════
// VIAGENS & VISITAS — grelha de meses, lista e detalhe
// Todo o estado em ViagensApp (sem hooks em sub-componentes)
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
var VG_MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
var VG_SHORT  = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
var VG_SUPABASE_URL = 'https://qtynznppkxjmihxiquze.supabase.co';
var VG_BUCKET = 'trip-photos';

function vgBlankForm(mes) {
  return { tipo: 'ferias', titulo: '', local: '', mes: mes !== undefined ? mes : new Date().getMonth(), dia_inicio: '', dia_fim: '', notas: '', fotos: [], album_url: '', _pendingFiles: [] };
}
function vgUploadFoto(db, file, tripId, idx) {
  return new Promise(function(resolve, reject) {
    var ext = (file.name || 'jpg').split('.').pop();
    var path = tripId + '/' + Date.now() + '_' + idx + '.' + ext;
    db.storage.from(VG_BUCKET).upload(path, file, { upsert: true })
      .then(function(r) { if (r.error) { reject(r.error); return; } resolve(VG_SUPABASE_URL + '/storage/v1/object/public/' + VG_BUCKET + '/' + path); })
      .catch(reject);
  });
}

// ── App principal (todo o estado aqui) ───────────────────────────
function ViagensApp(props) {
  var onBack = props.onBack, profile = props.profile;
  var db = window.supabaseClient;

  // Estado principal
  var _s1 = React.useState([]); var trips = _s1[0], setTrips = _s1[1];
  var _s2 = React.useState(true); var loading = _s2[0], setLoading = _s2[1];
  var _s3 = React.useState(new Date().getFullYear()); var year = _s3[0], setYear = _s3[1];
  var _s4 = React.useState(null); var selMonth = _s4[0], setSelMonth = _s4[1];
  // Estado do formulário
  var _s5 = React.useState(null); var form = _s5[0], setForm = _s5[1];
  var _s6 = React.useState(vgBlankForm()); var formData = _s6[0], setFormData = _s6[1];
  var _s7 = React.useState(false); var saving = _s7[0], setSaving = _s7[1];
  var _s8 = React.useState(null); var progress = _s8[0], setProgress = _s8[1];
  var _s9 = React.useState(false); var formExpanded = _s9[0], setFormExpanded = _s9[1];
  // Estado do detalhe
  var _s10 = React.useState(null); var detailTrip = _s10[0], setDetailTrip = _s10[1];
  var _s11 = React.useState([]); var detailFotos = _s11[0], setDetailFotos = _s11[1];
  var _s12 = React.useState(false); var detailLoading = _s12[0], setDetailLoading = _s12[1];
  var _s13 = React.useState(null); var lightbox = _s13[0], setLightbox = _s13[1];
  // Confirmação de apagar
  var _s14 = React.useState(null); var confirmDel = _s14[0], setConfirmDel = _s14[1];

  // Carregar viagens
  function load() {
    if (!db) { setLoading(false); return; }
    setLoading(true);
    function doLoad() {
      db.from('family_trips_list').select('*').eq('ano', year)
        .order('mes').order('dia_inicio')
        .then(function(r) { setTrips(r.data || []); setLoading(false); })
        .catch(function(err) {
          if (err && (err.code === 'PGRST303' || (err.message && err.message.indexOf('future') !== -1))) {
            db.auth.refreshSession().then(function() { doLoad(); }).catch(function() { setLoading(false); });
          } else { setLoading(false); }
        });
    }
    db.auth.refreshSession().then(function() { doLoad(); }).catch(function() { doLoad(); });
  }
  React.useEffect(load, [year]);

  function byMonth(m) { return trips.filter(function(t) { return t.mes === m; }); }

  // Abrir detalhe
  function openDetail(trip) {
    setDetailTrip(trip);
    setDetailFotos([]);
    setDetailLoading(true);
    setLightbox(null);
    db.from('family_trips').select('fotos').eq('id', trip.id).single()
      .then(function(r) { setDetailFotos((r.data && r.data.fotos) || []); setDetailLoading(false); })
      .catch(function() { setDetailLoading(false); });
  }

  // Abrir formulário
  function openAdd(mes) {
    setFormData(vgBlankForm(mes !== undefined ? mes : new Date().getMonth()));
    setFormExpanded(false);
    setForm('new');
  }
  function openEdit(trip) {
    setFormData({ tipo: trip.tipo, titulo: trip.titulo, local: trip.local, mes: trip.mes, dia_inicio: trip.dia_inicio || '', dia_fim: trip.dia_fim || '', notas: trip.notas || '', fotos: [], album_url: trip.album_url || '', _pendingFiles: [] });
    setFormExpanded(false);
    setForm(trip);
    db.from('family_trips').select('fotos').eq('id', trip.id).single()
      .then(function(r) { if (r.data && r.data.fotos) setFormData(function(prev) { return Object.assign({}, prev, { fotos: r.data.fotos }); }); });
  }

  // Guardar
  function saveTrip() {
    if (!formData.titulo.trim() || !formData.local.trim()) return;
    setSaving(true);
    var pendingFiles = formData._pendingFiles || [];
    var existingUrls = formData.fotos.slice(0, formData.fotos.length - pendingFiles.length);
    function doSave(uploadedUrls) {
      var payload = { tipo: formData.tipo, titulo: formData.titulo.trim(), local: formData.local.trim(), ano: year, mes: formData.mes, dia_inicio: formData.dia_inicio ? parseInt(formData.dia_inicio, 10) : null, dia_fim: formData.dia_fim ? parseInt(formData.dia_fim, 10) : null, notas: formData.notas.trim(), album_url: formData.album_url || null, fotos: existingUrls.concat(uploadedUrls), created_by: profile && profile.id };
      var op = (form === 'new') ? db.from('family_trips').insert(payload) : db.from('family_trips').update(payload).eq('id', form.id);
      op.then(function() { setSaving(false); setProgress(null); setForm(null); load(); }).catch(function() { setSaving(false); setProgress(null); });
    }
    if (pendingFiles.length === 0) { doSave([]); return; }
    var tripId = form !== 'new' ? form.id : ('tmp_' + Date.now()), total = pendingFiles.length, done = 0, urls = new Array(total);
    setProgress({ done: 0, total: total });
    function uploadBatch(files, startIdx, cb) {
      if (files.length === 0) { cb(); return; }
      var batch = files.slice(0, 5), rest = files.slice(5);
      Promise.all(batch.map(function(f, i) { return vgUploadFoto(db, f, tripId, startIdx + i); }))
        .then(function(batchUrls) { for (var i = 0; i < batchUrls.length; i++) urls[startIdx + i] = batchUrls[i]; done += batch.length; setProgress({ done: done, total: total }); uploadBatch(rest, startIdx + batch.length, cb); })
        .catch(function() { setSaving(false); setProgress(null); });
    }
    uploadBatch(pendingFiles, 0, function() { doSave(urls.filter(Boolean)); });
  }

  function deleteTrip(id) { db.from('family_trips').delete().eq('id', id).then(function() { setConfirmDel(null); load(); }); }

  var wrap = { minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'system-ui,sans-serif', paddingBottom: 40 };
  var inp = { width: '100%', padding: '11px 13px', borderRadius: 10, border: '1px solid ' + T.border, background: T.surface2, color: T.text, fontSize: 14, boxSizing: 'border-box', outline: 'none' };

  var headerBar = React.createElement('div', { style: { background: T.surface, borderBottom: '1px solid ' + T.goldBrd, padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 200 } },
    React.createElement('button', { onClick: onBack, style: { background: 'none', border: 'none', color: T.gold, fontSize: 26, cursor: 'pointer', lineHeight: 1, padding: 0 } }, '‹'),
    React.createElement('div', null,
      React.createElement('div', { style: { fontWeight: 800, fontSize: 17 } }, '✈️ Viagens & Visitas'),
      React.createElement('div', { style: { fontSize: 11, color: T.muted } }, 'Onde fomos e quando')
    )
  );

  var confirmModal = confirmDel && React.createElement('div', { style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: 24 } },
    React.createElement(Card, { style: { padding: 22, maxWidth: 340, width: '100%' } },
      React.createElement('div', { style: { fontWeight: 800, fontSize: 16, marginBottom: 8 } }, 'Apagar esta entrada?'),
      React.createElement('div', { style: { color: T.muted, fontSize: 13, marginBottom: 18 } }, 'Esta ação não pode ser desfeita.'),
      React.createElement('div', { style: { display: 'flex', gap: 10 } },
        React.createElement('button', { onClick: function() { setConfirmDel(null); }, style: { flex: 1, padding: 11, borderRadius: 10, border: '1px solid ' + T.border, background: 'none', color: T.muted, fontWeight: 700, cursor: 'pointer' } }, 'Cancelar'),
        React.createElement('button', { onClick: function() { deleteTrip(confirmDel); }, style: { flex: 1, padding: 11, borderRadius: 10, border: 'none', background: '#EF4444', color: '#fff', fontWeight: 700, cursor: 'pointer' } }, 'Apagar')
      )
    )
  );

  // ── Vista de detalhe ──────────────────────────────────────────
  if (detailTrip) {
    var ti = vgType(detailTrip.tipo);
    var days = detailTrip.dia_inicio ? (detailTrip.dia_inicio + (detailTrip.dia_fim ? '–' + detailTrip.dia_fim : '') + ' de ' + VG_MONTHS[detailTrip.mes]) : VG_MONTHS[detailTrip.mes];
    return React.createElement('div', { style: wrap },
      React.createElement('div', { style: { background: T.surface, borderBottom: '1px solid ' + T.goldBrd, padding: '13px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 200 } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
          React.createElement('button', { onClick: function() { setDetailTrip(null); setLightbox(null); }, style: { background: 'none', border: 'none', color: T.gold, fontSize: 26, cursor: 'pointer', lineHeight: 1, padding: 0 } }, '‹'),
          React.createElement('span', { style: { fontWeight: 800, fontSize: 17 } }, detailTrip.titulo)
        ),
        React.createElement('button', { onClick: function() { openEdit(detailTrip); setDetailTrip(null); }, style: { background: 'none', border: '1px solid ' + T.border, borderRadius: 9, padding: '7px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 700 } }, '✏️ Editar')
      ),
      React.createElement('div', { style: { padding: 16, maxWidth: 520, margin: '0 auto' } },
        React.createElement(Card, { style: { padding: 16, marginBottom: 14 } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' } },
            React.createElement('span', { style: { fontSize: 12, fontWeight: 800, color: '#fff', background: ti.color, padding: '4px 12px', borderRadius: 20 } }, ti.emoji + ' ' + ti.label),
            React.createElement('span', { style: { fontSize: 13, color: T.muted } }, days)
          ),
          React.createElement('div', { style: { fontSize: 15, fontWeight: 700, marginBottom: 4 } }, '📍 ' + detailTrip.local),
          detailTrip.notas && React.createElement('div', { style: { fontSize: 13, color: T.muted, lineHeight: 1.6, marginTop: 8 } }, detailTrip.notas),
          detailTrip.album_url && React.createElement('a', { href: detailTrip.album_url, target: '_blank', rel: 'noopener', style: { display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '9px 16px', background: '#4285F4', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: 'none' } }, '📷 Abrir Álbum Google Fotos')
        ),
        React.createElement('div', { style: { fontWeight: 700, fontSize: 12, color: T.muted, marginBottom: 10, letterSpacing: '0.06em' } }, 'FOTOS' + (detailTrip.fotos_count > 0 ? ' (' + detailTrip.fotos_count + ')' : '')),
        detailLoading && React.createElement('div', { style: { textAlign: 'center', padding: 30, color: T.muted } }, 'A carregar fotos…'),
        !detailLoading && detailFotos.length === 0 && React.createElement('div', { style: { textAlign: 'center', padding: '24px 0', color: T.muted, fontSize: 13 } }, 'Sem fotos nesta entrada'),
        !detailLoading && detailFotos.length > 0 && React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 } },
          detailFotos.map(function(url, idx) {
            return React.createElement('div', { key: idx, onClick: function() { setLightbox({ urls: detailFotos, idx: idx }); }, style: { position: 'relative', paddingBottom: '100%', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', background: T.surface2 } },
              React.createElement('img', { src: url, style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } })
            );
          })
        )
      ),
      lightbox && React.createElement('div', { onClick: function() { setLightbox(null); }, style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600, padding: 16 } },
        React.createElement('div', { onClick: function(e) { e.stopPropagation(); }, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, maxWidth: '100%' } },
          React.createElement('img', { src: lightbox.urls[lightbox.idx], style: { maxWidth: '100%', maxHeight: '75vh', borderRadius: 14, objectFit: 'contain' } }),
          lightbox.urls.length > 1 && React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 18 } },
            React.createElement('button', { onClick: function() { setLightbox({ urls: lightbox.urls, idx: (lightbox.idx - 1 + lightbox.urls.length) % lightbox.urls.length }); }, style: { background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 42, height: 42, borderRadius: '50%', fontSize: 22, cursor: 'pointer' } }, '‹'),
            React.createElement('span', { style: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 700 } }, (lightbox.idx + 1) + ' / ' + lightbox.urls.length),
            React.createElement('button', { onClick: function() { setLightbox({ urls: lightbox.urls, idx: (lightbox.idx + 1) % lightbox.urls.length }); }, style: { background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 42, height: 42, borderRadius: '50%', fontSize: 22, cursor: 'pointer' } }, '›')
          ),
          React.createElement('button', { onClick: function() { setLightbox(null); }, style: { background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '8px 22px', borderRadius: 20, cursor: 'pointer', fontSize: 13 } }, 'Fechar')
        )
      )
    );
  }

  // ── Formulário ────────────────────────────────────────────────
  if (form) {
    var fotos = formData.fotos || [];
    var visiveis = (!formExpanded && fotos.length > 3) ? fotos.slice(0, 3) : fotos;
    function addFiles(files) {
      var current = fotos.slice(), pf = (formData._pendingFiles || []).slice(), arr = Array.prototype.slice.call(files);
      Promise.all(arr.map(function(f) { return new Promise(function(res) { var r = new FileReader(); r.onload = function(e) { res(e.target.result); }; r.readAsDataURL(f); }); }))
        .then(function(results) { setFormData(Object.assign({}, formData, { fotos: current.concat(results), _pendingFiles: pf.concat(arr) })); });
    }
    function removePhoto(idx) {
      var nf = fotos.slice(); nf.splice(idx, 1);
      var npf = (formData._pendingFiles || []).slice(), existing = fotos.length - (formData._pendingFiles || []).length;
      if (idx >= existing) npf.splice(idx - existing, 1);
      setFormData(Object.assign({}, formData, { fotos: nf, _pendingFiles: npf }));
    }
    var valid = formData.titulo.trim() && formData.local.trim();
    return React.createElement('div', { style: wrap },
      headerBar,
      React.createElement('div', { style: { padding: 16, maxWidth: 520, margin: '0 auto' } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 } },
          React.createElement('button', { onClick: function() { setForm(null); }, style: { background: 'none', border: 'none', color: T.muted, fontSize: 24, cursor: 'pointer' } }, '‹'),
          React.createElement('span', { style: { fontWeight: 800, fontSize: 18 } }, form === 'new' ? 'Nova Entrada' : 'Editar Entrada')
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 } },
          VG_TYPES.map(function(t) { var sel = formData.tipo === t.id; return React.createElement('button', { key: t.id, onClick: function() { setFormData(Object.assign({}, formData, { tipo: t.id })); }, style: { padding: '10px 6px', borderRadius: 11, fontWeight: 800, cursor: 'pointer', fontSize: 13, border: '2px solid ' + (sel ? t.color : T.border), background: sel ? t.color : T.surface2, color: sel ? '#fff' : T.muted } }, t.emoji + ' ' + t.label); })
        ),
        React.createElement('div', { style: { marginBottom: 12 } },
          React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 5, letterSpacing: '0.06em' } }, 'MÊS'),
          React.createElement('select', { value: formData.mes, onChange: function(e) { setFormData(Object.assign({}, formData, { mes: parseInt(e.target.value, 10) })); }, style: inp },
            VG_MONTHS.map(function(m, i) { return React.createElement('option', { key: i, value: i }, m); })
          )
        ),
        React.createElement('div', { style: { marginBottom: 12 } },
          React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 5, letterSpacing: '0.06em' } }, 'TÍTULO'),
          React.createElement('input', { value: formData.titulo, onChange: function(e) { setFormData(Object.assign({}, formData, { titulo: e.target.value })); }, placeholder: 'Ex: Férias em família', style: inp })
        ),
        React.createElement('div', { style: { marginBottom: 12 } },
          React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 5, letterSpacing: '0.06em' } }, 'LOCAL'),
          React.createElement('input', { value: formData.local, onChange: function(e) { setFormData(Object.assign({}, formData, { local: e.target.value })); }, placeholder: 'Ex: Barcelona, Espanha', style: inp })
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 } },
          React.createElement('div', null, React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 5, letterSpacing: '0.06em' } }, 'DIA INÍCIO'), React.createElement('input', { type: 'number', min: 1, max: 31, value: formData.dia_inicio, onChange: function(e) { setFormData(Object.assign({}, formData, { dia_inicio: e.target.value })); }, placeholder: '1', style: inp })),
          React.createElement('div', null, React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 5, letterSpacing: '0.06em' } }, 'DIA FIM'), React.createElement('input', { type: 'number', min: 1, max: 31, value: formData.dia_fim, onChange: function(e) { setFormData(Object.assign({}, formData, { dia_fim: e.target.value })); }, placeholder: '31', style: inp }))
        ),
        React.createElement('div', { style: { marginBottom: 12 } },
          React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 5, letterSpacing: '0.06em' } }, 'ÁLBUM GOOGLE FOTOS'),
          React.createElement('input', { value: formData.album_url || '', onChange: function(e) { setFormData(Object.assign({}, formData, { album_url: e.target.value })); }, placeholder: 'https://photos.app.goo.gl/...', style: inp })
        ),
        React.createElement('div', { style: { marginBottom: 12 } },
          React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 5, letterSpacing: '0.06em' } }, 'FOTOS'),
          React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } },
            visiveis.map(function(url, idx) {
              return React.createElement('div', { key: idx, style: { position: 'relative', width: 80, height: 80, flexShrink: 0 } },
                React.createElement('img', { src: url, style: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: 11, border: '1px solid ' + T.border, display: 'block' } }),
                React.createElement('button', { onClick: function() { removePhoto(idx); }, style: { position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#EF4444', color: '#fff', border: '2px solid ' + T.surface, fontSize: 11, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 } }, '✕')
              );
            }),
            !formExpanded && fotos.length > 3 && React.createElement('button', { onClick: function() { setFormExpanded(true); }, style: { width: 80, height: 80, borderRadius: 11, border: '2px solid ' + T.border, background: T.surface2, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, flexShrink: 0 } }, React.createElement('span', { style: { fontSize: 22 } }, '📁'), React.createElement('span', { style: { fontSize: 10, fontWeight: 800, color: T.muted } }, '+' + (fotos.length - 3))),
            formExpanded && fotos.length > 3 && React.createElement('button', { onClick: function() { setFormExpanded(false); }, style: { width: 80, height: 80, borderRadius: 11, border: '2px solid ' + T.border, background: T.surface2, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, flexShrink: 0 } }, React.createElement('span', { style: { fontSize: 22 } }, '📁'), React.createElement('span', { style: { fontSize: 10, fontWeight: 800, color: T.muted } }, 'Fechar')),
            React.createElement('label', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: 11, border: '2px dashed ' + T.border, background: T.surface2, cursor: 'pointer', color: T.muted, fontSize: 24, gap: 2, flexShrink: 0 } },
              '➕', fotos.length > 0 && React.createElement('span', { style: { fontSize: 9, fontWeight: 700 } }, 'MAIS'),
              React.createElement('input', { type: 'file', accept: 'image/*', multiple: true, style: { display: 'none' }, onChange: function(e) { if (e.target.files && e.target.files.length) addFiles(e.target.files); } })
            )
          )
        ),
        React.createElement('div', { style: { marginBottom: 12 } },
          React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 5, letterSpacing: '0.06em' } }, 'NOTAS'),
          React.createElement('textarea', { value: formData.notas, onChange: function(e) { setFormData(Object.assign({}, formData, { notas: e.target.value })); }, placeholder: 'Quem foi, o que fizeram...', rows: 3, style: Object.assign({}, inp, { resize: 'vertical' }) })
        ),
        React.createElement('button', { onClick: saveTrip, disabled: !valid || saving, style: { width: '100%', padding: 14, marginTop: 8, borderRadius: 12, border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer', background: 'linear-gradient(135deg,' + T.gold + ',' + T.goldL + ')', color: T.bg, opacity: (!valid || saving) ? 0.45 : 1 } },
          saving ? (progress ? 'A guardar ' + progress.done + '/' + progress.total + '…' : 'A guardar…') : (form === 'new' ? '✚ Adicionar' : 'Guardar Alterações')
        )
      )
    );
  }

  var now = new Date();

  // ── Vista do mês ──────────────────────────────────────────────
  if (selMonth !== null) {
    var mTrips = byMonth(selMonth);
    return React.createElement('div', { style: wrap },
      headerBar,
      React.createElement('div', { style: { padding: 16, maxWidth: 520, margin: '0 auto' } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
            React.createElement('button', { onClick: function() { setSelMonth(null); }, style: { background: 'none', border: 'none', color: T.muted, fontSize: 22, cursor: 'pointer' } }, '←'),
            React.createElement('div', null,
              React.createElement('div', { style: { fontWeight: 800, fontSize: 19 } }, VG_MONTHS[selMonth]),
              React.createElement('div', { style: { fontSize: 12, color: T.muted } }, year + ' · ' + mTrips.length + ' entrada' + (mTrips.length !== 1 ? 's' : ''))
            )
          ),
          React.createElement(GoldBtn, { onClick: function() { openAdd(selMonth); }, style: { padding: '9px 16px', fontSize: 13 } }, '+ Novo')
        ),
        loading && React.createElement('div', { style: { textAlign: 'center', padding: 30, color: T.muted } }, 'A carregar…'),
        !loading && mTrips.length === 0 && React.createElement('div', { style: { textAlign: 'center', padding: '46px 16px', color: T.muted } },
          React.createElement('div', { style: { fontSize: 44, marginBottom: 10 } }, '📅'),
          React.createElement('div', { style: { fontSize: 14, marginBottom: 14 } }, 'Nenhuma entrada neste mês'),
          React.createElement('button', { onClick: function() { openAdd(selMonth); }, style: { background: 'none', border: '1px dashed ' + T.border, borderRadius: 10, padding: '9px 16px', color: T.muted, cursor: 'pointer' } }, 'Adicionar entrada')
        ),
        !loading && mTrips.map(function(t) {
          var ti = vgType(t.tipo);
          var days = t.dia_inicio ? (t.dia_inicio + (t.dia_fim ? '–' + t.dia_fim : '') + ' ' + VG_SHORT[t.mes]) : VG_SHORT[t.mes];
          return React.createElement(Card, {
            key: t.id,
            style: { padding: '13px 15px', borderLeft: '4px solid ' + ti.color, display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10, cursor: 'pointer' },
            onClick: function() { openDetail(t); }
          },
            React.createElement('div', { style: { flex: 1, minWidth: 0 } },
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, flexWrap: 'wrap' } },
                React.createElement('span', { style: { fontSize: 11, fontWeight: 800, color: '#fff', background: ti.color, padding: '3px 10px', borderRadius: 20 } }, ti.emoji + ' ' + ti.label),
                React.createElement('span', { style: { fontSize: 11, color: T.muted } }, days)
              ),
              React.createElement('div', { style: { fontWeight: 800, fontSize: 15.5, marginBottom: 2, color: T.text } }, t.titulo),
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
                React.createElement('span', { style: { color: T.muted, fontSize: 13 } }, '📍 ' + t.local),
                t.fotos_count > 0 && React.createElement('span', { style: { fontSize: 11, fontWeight: 700, color: T.gold, background: T.goldDim, padding: '1px 7px', borderRadius: 10 } }, '📷 ' + t.fotos_count),
                t.album_url && React.createElement('span', { style: { fontSize: 11, fontWeight: 700, color: '#4285F4', background: 'rgba(66,133,244,0.12)', padding: '1px 7px', borderRadius: 10 } }, '🔗')
              ),
              t.notas && React.createElement('div', { style: { color: T.muted, fontSize: 12, marginTop: 4, lineHeight: 1.4, opacity: 0.85 } }, t.notas)
            ),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 5 }, onClick: function(e) { e.stopPropagation(); } },
              React.createElement('button', { onClick: function() { openEdit(t); }, style: { background: 'none', border: '1px solid ' + T.border, borderRadius: 9, padding: '6px 9px', fontSize: 13, cursor: 'pointer' } }, '✏️'),
              React.createElement('button', { onClick: function() { setConfirmDel(t.id); }, style: { background: 'none', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 9, padding: '6px 9px', fontSize: 13, cursor: 'pointer' } }, '🗑️')
            )
          );
        })
      ),
      confirmModal
    );
  }

  // ── Grelha de meses (vista principal) ─────────────────────────
  return React.createElement('div', { style: wrap },
    headerBar,
    React.createElement('div', { style: { padding: 16, maxWidth: 520, margin: '0 auto' } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 } },
        React.createElement('div', { style: { fontSize: 12.5, color: T.muted } }, trips.length + ' entrada' + (trips.length !== 1 ? 's' : '') + ' em ' + year),
        React.createElement(GoldBtn, { onClick: function() { openAdd(now.getMonth()); }, style: { padding: '9px 16px', fontSize: 13 } }, '+ Novo')
      ),
      React.createElement(Card, { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '11px 0', marginBottom: 14 } },
        React.createElement('button', { onClick: function() { setYear(year - 1); }, style: { background: 'none', border: 'none', color: T.muted, fontSize: 22, cursor: 'pointer' } }, '‹'),
        React.createElement('span', { style: { fontWeight: 900, fontSize: 22 } }, year),
        React.createElement('button', { onClick: function() { setYear(year + 1); }, style: { background: 'none', border: 'none', color: T.muted, fontSize: 22, cursor: 'pointer' } }, '›')
      ),
      loading && React.createElement('div', { style: { textAlign: 'center', padding: 30, color: T.muted } }, 'A carregar…'),
      !loading && React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 } },
        VG_MONTHS.map(function(_, idx) {
          var mTrips = byMonth(idx);
          var isCurrent = now.getFullYear() === year && now.getMonth() === idx;
          return React.createElement('button', {
            key: idx, onClick: function() { setSelMonth(idx); },
            style: { background: isCurrent ? T.goldDim : T.surface, border: '2px solid ' + (isCurrent ? T.gold : (mTrips.length ? T.goldBrd : T.border)), borderRadius: 13, padding: '11px 10px', cursor: 'pointer', textAlign: 'left' }
          },
            React.createElement('div', { style: { fontWeight: 700, fontSize: 11, color: isCurrent ? T.gold : (mTrips.length ? vgType(mTrips[0].tipo).color : T.muted), marginBottom: 6 } }, VG_SHORT[idx]),
            mTrips.length === 0
              ? React.createElement('div', { style: { color: T.border, fontSize: 10 } }, '—')
              : React.createElement('div', null,
                  React.createElement('div', { style: { display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 3 } },
                    mTrips.slice(0, 3).map(function(t) { var ti = vgType(t.tipo); return React.createElement('span', { key: t.id, style: { fontSize: 14 } }, ti.emoji); })
                  ),
                  React.createElement('div', { style: { fontSize: 9, fontWeight: 800, color: isCurrent ? T.gold : T.text, padding: '1px 0' } }, mTrips.length + (mTrips.length === 1 ? ' entrada' : ' entradas')),
                  mTrips.some(function(t) { return t.fotos_count > 0; }) && React.createElement('div', { style: { fontSize: 9, color: T.gold } }, '📷 ' + mTrips.reduce(function(s, t) { return s + (t.fotos_count || 0); }, 0))
                )
          );
        })
      ),
      React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 16, justifyContent: 'center' } },
        VG_TYPES.map(function(t) { return React.createElement('span', { key: t.id, style: { fontSize: 11, fontWeight: 800, color: '#fff', background: t.color, padding: '3px 10px', borderRadius: 20 } }, t.emoji + ' ' + t.label); })
      )
    ),
    confirmModal
  );
}
