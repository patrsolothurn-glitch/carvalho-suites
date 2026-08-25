// ── VIAGENS FAMÍLIA ─────────────────────────────────────────────────
// Registo de férias e visitas importantes por mês/ano
// Tabela Supabase: family_trips (fotos jsonb)
// ─────────────────────────────────────────────────────────────────────

var MESES_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function ViagemCard(props) {
  var v = props.viagem;
  var onClick = props.onClick;
  var fotos = v.fotos || [];
  var mesNome = MESES_PT[(v.mes || 1) - 1];
  return React.createElement('div', {
    onClick: onClick,
    style: { background: T.surface, border: '1px solid ' + T.border, borderLeft: '3px solid #06B6D4', borderRadius: 14, padding: '12px 14px', cursor: 'pointer', marginBottom: 10 }
  },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
      React.createElement('div', { style: { flex: 1 } },
        React.createElement('div', { style: { fontWeight: 700, fontSize: 15, color: T.text } }, v.destino || '—'),
        React.createElement('div', { style: { fontSize: 12, color: '#06B6D4', fontWeight: 600, marginTop: 2 } },
          mesNome + ' ' + v.ano + (v.data_inicio ? ' · ' + v.data_inicio : '') + (v.data_fim ? ' – ' + v.data_fim : '')
        ),
        v.descricao && React.createElement('div', { style: { fontSize: 12, color: T.muted, marginTop: 4 } }, v.descricao)
      ),
      fotos.length > 0 && React.createElement('div', { style: { width: 52, height: 52, borderRadius: 10, overflow: 'hidden', flexShrink: 0, marginLeft: 10 } },
        React.createElement('img', { src: fotos[0], style: { width: '100%', height: '100%', objectFit: 'cover' }, alt: '' })
      )
    ),
    fotos.length > 1 && React.createElement('div', { style: { display: 'flex', gap: 6, marginTop: 8, overflowX: 'auto' } },
      fotos.slice(1, 5).map(function(f, i) {
        return React.createElement('img', { key: i, src: f, style: { width: 44, height: 44, borderRadius: 7, objectFit: 'cover', flexShrink: 0 }, alt: '' });
      }),
      fotos.length > 5 && React.createElement('div', { style: { width: 44, height: 44, borderRadius: 7, background: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: T.muted, flexShrink: 0 } }, '+' + (fotos.length - 5))
    )
  );
}

function ViagensApp(props) {
  var userId = props.userId;
  var db = window.supabaseClient;

  var _stList = React.useState([]);  var list = _stList[0], setList = _stList[1];
  var _stLoading = React.useState(true); var loading = _stLoading[0], setLoading = _stLoading[1];
  var _stAno = React.useState(new Date().getFullYear()); var filtroAno = _stAno[0], setFiltroAno = _stAno[1];
  var _stForm = React.useState(null); var form = _stForm[0], setForm = _stForm[1];
  var _stDetail = React.useState(null); var detail = _stDetail[0], setDetail = _stDetail[1];
  var _stLightbox = React.useState(null); var lightbox = _stLightbox[0], setLightbox = _stLightbox[1];
  var _stConfirm = React.useState(null); var confirm = _stConfirm[0], setConfirm = _stConfirm[1];

  // form state
  var _fDest = React.useState('');    var fDest = _fDest[0], setFDest = _fDest[1];
  var _fAno = React.useState(String(new Date().getFullYear()));  var fAno = _fAno[0], setFAno = _fAno[1];
  var _fMes = React.useState(String(new Date().getMonth() + 1)); var fMes = _fMes[0], setFMes = _fMes[1];
  var _fDi = React.useState('');      var fDi = _fDi[0], setFDi = _fDi[1];
  var _fDf = React.useState('');      var fDf = _fDf[0], setFDf = _fDf[1];
  var _fDesc = React.useState('');    var fDesc = _fDesc[0], setFDesc = _fDesc[1];
  var _fFotos = React.useState([]);   var fFotos = _fFotos[0], setFFotos = _fFotos[1];
  var _fSaving = React.useState(false); var fSaving = _fSaving[0], setFSaving = _fSaving[1];

  function load() {
    if (!db) return;
    db.from('family_trips').select('*').order('ano', { ascending: false }).then(function(r) {
      setList(r.data || []); setLoading(false);
    });
  }
  React.useEffect(load, []);

  var anos = [];
  list.forEach(function(v) { if (v.ano && !anos.includes(v.ano)) anos.push(v.ano); });
  if (!anos.includes(filtroAno)) anos.push(filtroAno);
  anos.sort(function(a, b) { return b - a; });

  var listFiltrada = list.filter(function(v) { return v.ano === filtroAno; });

  function resetForm() {
    setFDest(''); setFAno(String(new Date().getFullYear())); setFMes(String(new Date().getMonth() + 1));
    setFDi(''); setFDf(''); setFDesc(''); setFFotos([]);
  }
  function openNew() { resetForm(); setForm('new'); setDetail(null); }
  function openEdit(v) {
    setFDest(v.destino || ''); setFAno(String(v.ano || new Date().getFullYear())); setFMes(String(v.mes || 1));
    setFDi(v.data_inicio || ''); setFDf(v.data_fim || ''); setFDesc(v.descricao || ''); setFFotos(v.fotos || []);
    setDetail(null); setForm(v);
  }

  function addFotos(e) {
    var files = Array.from(e.target.files);
    files.forEach(function(file) {
      var reader = new FileReader();
      reader.onload = function(ev) {
        var img = new Image();
        img.onload = function() {
          var canvas = document.createElement('canvas');
          var max = 800;
          var ratio = Math.min(max / img.width, max / img.height, 1);
          canvas.width = Math.round(img.width * ratio);
          canvas.height = Math.round(img.height * ratio);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          var dataUrl = canvas.toDataURL('image/jpeg', 0.75);
          setFFotos(function(prev) { return prev.concat([dataUrl]); });
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
  function removeFoto(i) { setFFotos(function(prev) { return prev.filter(function(_, j) { return j !== i; }); }); }

  function save() {
    if (!fDest.trim()) return;
    setFSaving(true);
    var payload = {
      user_id: userId,
      destino: fDest.trim(),
      ano: parseInt(fAno),
      mes: parseInt(fMes),
      data_inicio: fDi || null,
      data_fim: fDf || null,
      descricao: fDesc.trim(),
      fotos: fFotos
    };
    var op = form === 'new'
      ? db.from('family_trips').insert(payload)
      : db.from('family_trips').update(payload).eq('id', form.id);
    op.then(function() { setForm(null); setFSaving(false); load(); }).catch(function() { setFSaving(false); });
  }
  function del(id) {
    db.from('family_trips').delete().eq('id', id).then(function() { setConfirm(null); setDetail(null); load(); });
  }

  var btnBase = { borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, padding: '9px 16px' };
  var s = { input: { width: '100%', background: T.surface2, border: '1px solid ' + T.border, borderRadius: 8, color: T.text, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box', outline: 'none' }, label: { fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, display: 'block' } };

  function Inp(p) { return React.createElement('input', Object.assign({ style: s.input }, p)); }
  function Lbl(p) { return React.createElement('label', { style: s.label }, p.text); }
  function Fld(p) { return React.createElement('div', { style: { marginBottom: 12 } }, p.children); }

  return React.createElement('div', { style: { padding: '12px 14px', paddingBottom: 80, maxWidth: 600, margin: '0 auto' } },

    // Header + ano filter
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 } },
      React.createElement('div', { style: { display: 'flex', gap: 6, alignItems: 'center' } },
        React.createElement('button', { onClick: function() { setFiltroAno(function(y) { return y - 1; }); }, style: Object.assign({}, btnBase, { padding: '6px 12px', background: T.surface2, color: T.text }) }, '‹'),
        React.createElement('div', { style: { fontWeight: 800, fontSize: 16, color: '#06B6D4', minWidth: 50, textAlign: 'center' } }, filtroAno),
        React.createElement('button', { onClick: function() { setFiltroAno(function(y) { return y + 1; }); }, style: Object.assign({}, btnBase, { padding: '6px 12px', background: T.surface2, color: T.text }) }, '›')
      ),
      React.createElement('button', { onClick: openNew, style: Object.assign({}, btnBase, { background: '#06B6D4', color: '#fff', padding: '9px 16px' }) }, '+ Nova Viagem')
    ),

    loading && React.createElement('div', { style: { textAlign: 'center', padding: 32, color: T.muted } }, 'A carregar...'),

    !loading && listFiltrada.length === 0 && React.createElement('div', {
      style: { textAlign: 'center', padding: 40, color: T.muted, fontSize: 14 }
    }, React.createElement('div', { style: { fontSize: 36, marginBottom: 8 } }, '✈️'), 'Sem viagens em ' + filtroAno),

    listFiltrada.sort(function(a, b) { return b.mes - a.mes; }).map(function(v) {
      return React.createElement(ViagemCard, {
        key: v.id, viagem: v,
        onClick: function() { setDetail(detail && detail.id === v.id ? null : v); }
      });
    }),

    // Detail overlay
    detail && React.createElement('div', {
      style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', flexDirection: 'column', overflow: 'auto' },
      onClick: function(e) { if (e.target === e.currentTarget) setDetail(null); }
    },
      React.createElement('div', { style: { background: T.surface, margin: '20px 14px', borderRadius: 18, padding: 18, maxWidth: 560, width: '100%', alignSelf: 'center' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 } },
          React.createElement('div', { style: { fontWeight: 800, fontSize: 18, color: T.text } }, detail.destino),
          React.createElement('button', { onClick: function() { setDetail(null); }, style: { background: 'transparent', border: 'none', color: T.muted, fontSize: 22, cursor: 'pointer' } }, '×')
        ),
        React.createElement('div', { style: { fontSize: 13, color: '#06B6D4', fontWeight: 600, marginBottom: 10 } },
          MESES_PT[(detail.mes || 1) - 1] + ' ' + detail.ano +
          (detail.data_inicio ? ' · ' + detail.data_inicio : '') +
          (detail.data_fim ? ' – ' + detail.data_fim : '')
        ),
        detail.descricao && React.createElement('p', { style: { fontSize: 13, color: T.muted, marginBottom: 12 } }, detail.descricao),
        (detail.fotos || []).length > 0 && React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 } },
          (detail.fotos || []).map(function(f, i) {
            return React.createElement('img', {
              key: i, src: f,
              style: { width: 'calc(33% - 6px)', aspectRatio: '1', objectFit: 'cover', borderRadius: 10, cursor: 'pointer' },
              onClick: function() { setLightbox({ fotos: detail.fotos, idx: i }); },
              alt: ''
            });
          })
        ),
        React.createElement('div', { style: { display: 'flex', gap: 8 } },
          React.createElement('button', { onClick: function() { openEdit(detail); }, style: Object.assign({}, btnBase, { background: T.surface2, color: T.text, flex: 1 }) }, '✏️ Editar'),
          React.createElement('button', { onClick: function() { setConfirm(detail.id); }, style: Object.assign({}, btnBase, { background: '#EF4444', color: '#fff' }) }, '🗑️')
        )
      )
    ),

    // Lightbox
    lightbox && React.createElement('div', {
      style: { position: 'fixed', inset: 0, background: '#000', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' },
      onClick: function() { setLightbox(null); }
    },
      React.createElement('img', { src: lightbox.fotos[lightbox.idx], style: { maxWidth: '95vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 12 }, onClick: function(e) { e.stopPropagation(); }, alt: '' }),
      lightbox.idx > 0 && React.createElement('button', {
        onClick: function(e) { e.stopPropagation(); setLightbox(function(lb) { return { fotos: lb.fotos, idx: lb.idx - 1 }; }); },
        style: { position: 'fixed', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 28, borderRadius: '50%', width: 48, height: 48, cursor: 'pointer' }
      }, '‹'),
      lightbox.idx < lightbox.fotos.length - 1 && React.createElement('button', {
        onClick: function(e) { e.stopPropagation(); setLightbox(function(lb) { return { fotos: lb.fotos, idx: lb.idx + 1 }; }); },
        style: { position: 'fixed', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 28, borderRadius: '50%', width: 48, height: 48, cursor: 'pointer' }
      }, '›'),
      React.createElement('button', { onClick: function() { setLightbox(null); }, style: { position: 'fixed', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 22, borderRadius: '50%', width: 40, height: 40, cursor: 'pointer' } }, '×'),
      React.createElement('div', { style: { position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.6)', fontSize: 13 } }, (lightbox.idx + 1) + ' / ' + lightbox.fotos.length)
    ),

    // Form overlay
    form !== null && React.createElement('div', {
      style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'flex-start', overflowY: 'auto' }
    },
      React.createElement('div', { style: { background: T.surface, margin: '20px 14px', borderRadius: 18, padding: 18, maxWidth: 560, width: '100%', alignSelf: 'flex-start' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } },
          React.createElement('div', { style: { fontWeight: 800, fontSize: 16 } }, form === 'new' ? '✈️ Nova Viagem' : '✏️ Editar Viagem'),
          React.createElement('button', { onClick: function() { setForm(null); }, style: { background: 'transparent', border: 'none', color: T.muted, fontSize: 22, cursor: 'pointer' } }, '×')
        ),
        Fld({ children: [Lbl({ text: 'Destino' }), Inp({ value: fDest, onChange: function(e) { setFDest(e.target.value); }, placeholder: 'Ex: Algarve, Portugal' })] }),
        React.createElement('div', { style: { display: 'flex', gap: 10, marginBottom: 12 } },
          React.createElement('div', { style: { flex: 1 } }, Lbl({ text: 'Ano' }), Inp({ type: 'number', value: fAno, onChange: function(e) { setFAno(e.target.value); } })),
          React.createElement('div', { style: { flex: 1 } }, Lbl({ text: 'Mês' }),
            React.createElement('select', { value: fMes, onChange: function(e) { setFMes(e.target.value); }, style: s.input },
              MESES_PT.map(function(m, i) { return React.createElement('option', { key: i, value: i + 1 }, m); })
            )
          )
        ),
        React.createElement('div', { style: { display: 'flex', gap: 10, marginBottom: 12 } },
          React.createElement('div', { style: { flex: 1 } }, Lbl({ text: 'Início' }), Inp({ type: 'date', value: fDi, onChange: function(e) { setFDi(e.target.value); } })),
          React.createElement('div', { style: { flex: 1 } }, Lbl({ text: 'Fim' }), Inp({ type: 'date', value: fDf, onChange: function(e) { setFDf(e.target.value); } }))
        ),
        Fld({ children: [Lbl({ text: 'Notas' }), React.createElement('textarea', { value: fDesc, onChange: function(e) { setFDesc(e.target.value); }, placeholder: 'Onde ficaram, o que fizeram...', rows: 3, style: Object.assign({}, s.input, { resize: 'vertical', fontFamily: 'inherit' }) })] }),
        // Photos
        React.createElement('div', { style: { marginBottom: 14 } },
          Lbl({ text: 'Fotos' }),
          React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: T.surface2, border: '1px dashed ' + T.border, borderRadius: 8, padding: '10px 14px', marginBottom: 8 } },
            React.createElement('span', { style: { fontSize: 18 } }, '📷'),
            React.createElement('span', { style: { fontSize: 13, color: T.muted } }, 'Adicionar fotos'),
            React.createElement('input', { type: 'file', accept: 'image/*', multiple: true, style: { display: 'none' }, onChange: addFotos })
          ),
          fFotos.length > 0 && React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } },
            fFotos.map(function(f, i) {
              return React.createElement('div', { key: i, style: { position: 'relative' } },
                React.createElement('img', { src: f, style: { width: 70, height: 70, objectFit: 'cover', borderRadius: 8 }, alt: '' }),
                React.createElement('button', { onClick: function() { removeFoto(i); }, style: { position: 'absolute', top: -6, right: -6, background: '#EF4444', border: 'none', color: '#fff', borderRadius: '50%', width: 20, height: 20, fontSize: 12, cursor: 'pointer', lineHeight: '20px', textAlign: 'center' } }, '×')
              );
            })
          )
        ),
        React.createElement('div', { style: { display: 'flex', gap: 10 } },
          React.createElement('button', { onClick: function() { setForm(null); }, style: Object.assign({}, btnBase, { background: T.surface2, color: T.text, flex: 1 }) }, 'Cancelar'),
          React.createElement('button', { onClick: save, style: Object.assign({}, btnBase, { background: '#06B6D4', color: '#fff', flex: 2 }) }, fSaving ? '...' : '💾 Guardar')
        )
      )
    ),

    // Confirm delete
    confirm && React.createElement('div', {
      style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }
    },
      React.createElement('div', { style: { background: T.surface, borderRadius: 16, padding: 24, maxWidth: 340, width: '100%', textAlign: 'center' } },
        React.createElement('div', { style: { fontSize: 22, marginBottom: 8 } }, '🗑️'),
        React.createElement('div', { style: { fontWeight: 700, marginBottom: 8 } }, 'Apagar viagem?'),
        React.createElement('div', { style: { fontSize: 13, color: T.muted, marginBottom: 20 } }, 'Esta acção não pode ser desfeita.'),
        React.createElement('div', { style: { display: 'flex', gap: 10 } },
          React.createElement('button', { onClick: function() { setConfirm(null); }, style: Object.assign({}, btnBase, { background: T.surface2, color: T.text, flex: 1 }) }, 'Cancelar'),
          React.createElement('button', { onClick: function() { del(confirm); }, style: Object.assign({}, btnBase, { background: '#EF4444', color: '#fff', flex: 1 }) }, 'Apagar')
        )
      )
    )
  );
}
