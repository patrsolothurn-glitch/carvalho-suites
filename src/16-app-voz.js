// ══════════════════════════════════════════════════════════════════
// APP VOZ — Gravador de notas de voz + Tradutor DE↔PT (admin only)
// Todo o estado em VozApp (sem hooks em sub-componentes)
// ══════════════════════════════════════════════════════════════════

var VZ_BUCKET = 'voz';
var VZ_MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
var VZ_LANGS = {
  'de-pt': { srcCode: 'de', dstCode: 'pt', srcSpeech: 'de-DE', dstSpeech: 'pt-PT', label: 'DE → PT' },
  'pt-de': { srcCode: 'pt', dstCode: 'de', srcSpeech: 'pt-PT', dstSpeech: 'de-DE', label: 'PT → DE' }
};

function vzPickMimeType() {
  for (var i = 0; i < VZ_MIME_CANDIDATES.length; i++) {
    if (window.MediaRecorder && MediaRecorder.isTypeSupported(VZ_MIME_CANDIDATES[i])) return VZ_MIME_CANDIDATES[i];
  }
  return '';
}

function vzFmtDuration(sec) {
  var s = Math.max(0, Math.round(sec || 0));
  var m = Math.floor(s / 60);
  var r = s % 60;
  return m + ':' + (r < 10 ? '0' : '') + r;
}

function vzFmtDateTime(d) {
  d = d ? new Date(d) : new Date();
  return d.toLocaleDateString('de-CH') + ' ' + d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
}

function vzMonthKey(d) {
  d = d || new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

function vzUploadRecording(db, userId, blob, mimeType) {
  var path = userId + '/' + vzMonthKey() + '/' + Date.now() + '.webm';
  return db.storage.from(VZ_BUCKET).upload(path, blob, { contentType: mimeType || 'audio/webm', upsert: false })
    .then(function(res) {
      if (res.error) throw res.error;
      return path;
    });
}

// ── Tradução (MyMemory, sem chave, direto do browser) ────────────
function vzByteLen(s) {
  return new TextEncoder().encode(s).length;
}
function vzSplitForTranslate(text) {
  var MAX_BYTES = 450;
  if (vzByteLen(text) <= MAX_BYTES) return [text];
  var sentences = text.split(/(?<=[.!?])\s+/).filter(function(s) { return s.length > 0; });
  var chunks = [];
  var cur = '';
  sentences.forEach(function(s) {
    var candidate = cur ? cur + ' ' + s : s;
    if (vzByteLen(candidate) > MAX_BYTES && cur) {
      chunks.push(cur);
      cur = s;
    } else {
      cur = candidate;
    }
  });
  if (cur) chunks.push(cur);
  return chunks.length ? chunks : [text];
}
function vzTranslateChunk(text, langpair) {
  var url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) +
    '&langpair=' + encodeURIComponent(langpair) + '&de=patr.carvalho@hotmail.com';
  return fetch(url).then(function(r) { return r.json(); }).then(function(data) {
    if (!data || Number(data.responseStatus) !== 200 || !data.responseData) {
      throw new Error((data && data.responseDetails) || 'Falha na tradução');
    }
    return data.responseData.translatedText;
  });
}
function vzTranslate(text, langpair) {
  var chunks = vzSplitForTranslate(text);
  var out = [];
  var chain = Promise.resolve();
  chunks.forEach(function(c) {
    chain = chain.then(function() { return vzTranslateChunk(c, langpair); }).then(function(t) { out.push(t); });
  });
  return chain.then(function() { return out.join(' '); });
}

// ── UI pequenas peças ao nível do módulo ──────────────────────────
var VzHdr = function VzHdr(props) {
  return React.createElement('div', { style: { background: T.surface, padding: '12px 16px', borderBottom: '1px solid ' + T.border, display: 'flex', alignItems: 'center', gap: 10 } },
    React.createElement('button', { onClick: props.onBack, style: { background: T.surface2, border: 'none', color: T.muted, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 14 } }, '←'),
    React.createElement('div', { style: { fontWeight: 800, fontSize: 17, color: T.text } }, '🎙️ Voz')
  );
};

var VzErro = function VzErro(props) {
  if (!props.msg) return null;
  return React.createElement('div', { style: { background: 'rgba(239,68,68,0.15)', border: '1px solid ' + T.red, color: T.red, borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, fontWeight: 600 } }, '⚠ ' + props.msg);
};

var VzGravacaoRow = function VzGravacaoRow(props) {
  var g = props.g;
  var isPlaying = props.playingId === g.id;
  return React.createElement('div', { style: { background: T.surface2, borderRadius: 12, padding: 12, marginBottom: 8 } },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
      React.createElement('button', {
        onClick: function() { props.onPlay(g); },
        style: { background: isPlaying ? T.green : T.gold, border: 'none', borderRadius: '50%', width: 40, height: 40, flexShrink: 0, cursor: 'pointer', fontSize: 16, color: T.bg }
      }, isPlaying ? '⏸' : '▶'),
      React.createElement('div', { style: { flex: 1, minWidth: 0 } },
        React.createElement('div', { style: { fontWeight: 700, fontSize: 14, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, g.titulo),
        React.createElement('div', { style: { fontSize: 11, color: T.muted, marginTop: 2 } }, vzFmtDateTime(g.gravado_em) + ' · ' + vzFmtDuration(g.duracao_seg))
      ),
      React.createElement('button', { onClick: function() { props.onEdit(g); }, style: { background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 16, padding: 6 } }, '✏️'),
      React.createElement('button', { onClick: function() { props.onDelete(g); }, style: { background: 'none', border: 'none', color: T.red, cursor: 'pointer', fontSize: 16, padding: 6 } }, '🗑️')
    ),
    isPlaying && props.playingUrl && React.createElement('audio', { controls: true, autoPlay: true, src: props.playingUrl, style: { width: '100%', marginTop: 10 }, onEnded: props.onPlayEnded })
  );
};

var VzRecorderTab = function VzRecorderTab(p) {
  if (p.gravando) {
    return React.createElement('div', { style: { textAlign: 'center', padding: '40px 16px' } },
      React.createElement('div', { style: { fontSize: 44, fontWeight: 900, color: T.red, marginBottom: 24, fontVariantNumeric: 'tabular-nums' } }, vzFmtDuration(p.elapsedSec)),
      React.createElement('button', {
        onClick: p.onStop,
        style: { width: 120, height: 120, borderRadius: '50%', background: T.red, border: 'none', color: 'white', fontSize: 40, cursor: 'pointer', boxShadow: '0 0 0 8px rgba(239,68,68,0.18)' }
      }, '⏹'),
      React.createElement('div', { style: { marginTop: 16, color: T.muted, fontSize: 13 } }, 'A gravar… toca para parar')
    );
  }

  if (p.recordedBlob) {
    return React.createElement('div', { style: { padding: 16 } },
      React.createElement(VzErro, { msg: p.erro }),
      React.createElement('audio', { controls: true, src: p.recordedUrl, style: { width: '100%', marginBottom: 16 } }),
      React.createElement('div', { style: { fontSize: 12, color: T.muted, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' } }, 'Título'),
      React.createElement('input', {
        type: 'text', autoComplete: 'off', value: p.saveTitulo, placeholder: vzFmtDateTime(new Date()),
        onChange: function(e) { p.onTituloChange(e.target.value); },
        style: { width: '100%', background: T.surface2, border: '1px solid ' + T.border, borderRadius: 10, padding: '12px 14px', color: T.text, fontSize: 15, marginBottom: 14, boxSizing: 'border-box' }
      }),
      React.createElement('div', { style: { fontSize: 12, color: T.muted, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' } }, 'Pasta'),
      React.createElement('select', {
        value: p.savePastaId || '', onChange: function(e) { p.onPastaChange(e.target.value || null); },
        style: { width: '100%', background: T.surface2, border: '1px solid ' + T.border, borderRadius: 10, padding: '12px 14px', color: T.text, fontSize: 15, marginBottom: 20, boxSizing: 'border-box' }
      },
        React.createElement('option', { value: '' }, 'Sem pasta'),
        p.pastas.map(function(pa) { return React.createElement('option', { key: pa.id, value: pa.id }, pa.titulo); })
      ),
      React.createElement('div', { style: { display: 'flex', gap: 10 } },
        React.createElement('button', { onClick: p.onDescartar, disabled: p.saving, style: { flex: 1, background: T.surface2, color: T.muted, border: 'none', borderRadius: 10, padding: 14, fontWeight: 700, fontSize: 14, cursor: 'pointer' } }, 'Descartar'),
        React.createElement('button', { onClick: p.onGuardar, disabled: p.saving, style: { flex: 2, background: 'linear-gradient(135deg,' + T.gold + ',' + T.goldL + ')', color: T.bg, border: 'none', borderRadius: 10, padding: 14, fontWeight: 800, fontSize: 15, cursor: 'pointer', opacity: p.saving ? 0.6 : 1 } }, p.saving ? 'A guardar…' : '💾 Guardar')
      )
    );
  }

  return React.createElement('div', null,
    React.createElement(VzErro, { msg: p.erro }),
    React.createElement('div', { style: { textAlign: 'center', padding: '40px 16px 30px' } },
      React.createElement('button', {
        onClick: p.onStart,
        style: { width: 120, height: 120, borderRadius: '50%', background: 'linear-gradient(135deg,' + T.gold + ',' + T.goldL + ')', border: 'none', color: T.bg, fontSize: 40, cursor: 'pointer' }
      }, '🎙️'),
      React.createElement('div', { style: { marginTop: 16, color: T.muted, fontSize: 13 } }, 'Toca para gravar')
    ),
    p.loading && React.createElement('div', { style: { textAlign: 'center', color: T.muted, padding: 20 } }, 'A carregar…'),
    !p.loading && p.grupos.map(function(grupo) {
      return React.createElement('div', { key: grupo.key, style: { marginBottom: 18 } },
        React.createElement('div', { style: { fontSize: 12, fontWeight: 800, color: T.gold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 } }, '📁 ' + grupo.nome),
        grupo.itens.length === 0 && React.createElement('div', { style: { color: T.muted, fontSize: 13, padding: '4px 0 8px' } }, 'Sem gravações'),
        grupo.itens.map(function(g) {
          return React.createElement(VzGravacaoRow, {
            key: g.id, g: g, playingId: p.playingId, playingUrl: p.playingUrl,
            onPlay: p.onPlay, onPlayEnded: p.onPlayEnded, onEdit: p.onEditGravacao, onDelete: p.onDeleteGravacao
          });
        })
      );
    }),
    !p.loading && React.createElement('div', { style: { marginTop: 24, borderTop: '1px solid ' + T.border, paddingTop: 16 } },
      React.createElement('div', { style: { fontSize: 12, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 } }, 'Pastas'),
      p.pastas.map(function(pa) {
        return React.createElement('div', { key: pa.id, style: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' } },
          React.createElement('div', { style: { flex: 1, color: T.text, fontSize: 14 } }, pa.titulo),
          React.createElement('button', { onClick: function() { p.onEditPasta(pa); }, style: { background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 15 } }, '✏️'),
          React.createElement('button', { onClick: function() { p.onDeletePasta(pa); }, style: { background: 'none', border: 'none', color: T.red, cursor: 'pointer', fontSize: 15 } }, '🗑️')
        );
      }),
      React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 10 } },
        React.createElement('input', {
          type: 'text', autoComplete: 'off', placeholder: 'Nova pasta…', value: p.novaPastaNome,
          onChange: function(e) { p.onNovaPastaChange(e.target.value); },
          style: { flex: 1, background: T.surface2, border: '1px solid ' + T.border, borderRadius: 10, padding: '10px 12px', color: T.text, fontSize: 14, boxSizing: 'border-box' }
        }),
        React.createElement('button', { onClick: p.onCriarPasta, style: { background: T.gold, color: T.bg, border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 700, cursor: 'pointer' } }, '+')
      )
    )
  );
};

var VzTradutorTab = function VzTradutorTab(p) {
  var langs = VZ_LANGS[p.direction];
  return React.createElement('div', { style: { padding: 16 } },
    React.createElement(VzErro, { msg: p.erro }),
    React.createElement('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: 24 } },
      React.createElement('button', {
        onClick: p.onSwapDirection,
        style: { background: T.surface2, border: '1px solid ' + T.border, borderRadius: 30, padding: '10px 22px', color: T.text, fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }
      }, langs.label, React.createElement('span', { style: { fontSize: 18 } }, '🔄'))
    ),
    React.createElement('div', { style: { textAlign: 'center', marginBottom: 26 } },
      React.createElement('button', {
        onClick: p.listening ? p.onStopListening : p.onStartListening,
        style: {
          width: 110, height: 110, borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: 38, color: p.listening ? 'white' : T.bg,
          background: p.listening ? T.red : 'linear-gradient(135deg,' + T.gold + ',' + T.goldL + ')',
          boxShadow: p.listening ? '0 0 0 8px rgba(239,68,68,0.18)' : 'none'
        }
      }, '🎙️'),
      React.createElement('div', { style: { marginTop: 12, color: T.muted, fontSize: 13 } }, p.listening ? 'A ouvir… (' + langs.srcSpeech + ')' : 'Toca para falar')
    ),
    React.createElement('div', { style: { fontSize: 12, color: T.muted, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' } }, 'Original'),
    React.createElement('div', { style: { background: T.surface2, borderRadius: 10, padding: '14px 16px', minHeight: 50, color: T.text, fontSize: 15, marginBottom: 18 } },
      p.originalText || React.createElement('span', { style: { color: T.muted } }, p.interimText || '—')
    ),
    React.createElement('div', { style: { fontSize: 12, color: T.muted, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' } }, 'Tradução'),
    React.createElement('div', { style: { background: T.surface2, borderRadius: 10, padding: '14px 16px', minHeight: 50, color: T.gold, fontSize: 15, fontWeight: 600, marginBottom: 18 } },
      p.translating ? 'A traduzir…' : (p.translatedText || '—')
    ),
    p.translatedText && !p.translating && React.createElement('button', {
      onClick: p.onRepetir,
      style: { width: '100%', background: T.surface2, border: '1px solid ' + T.border, borderRadius: 10, padding: 14, color: T.text, fontWeight: 700, fontSize: 14, cursor: 'pointer' }
    }, '🔁 Repetir áudio')
  );
};

// ── App principal (todo o estado aqui) ────────────────────────────
function VozApp(props) {
  var onBack = props.onBack, profile = props.profile;
  var db = window.supabaseClient;

  var _s1 = React.useState('gravador'); var tab = _s1[0], setTab = _s1[1];
  var _s2 = React.useState(true); var loading = _s2[0], setLoading = _s2[1];
  var _s3 = React.useState([]); var pastas = _s3[0], setPastas = _s3[1];
  var _s4 = React.useState([]); var gravacoes = _s4[0], setGravacoes = _s4[1];
  var _s5 = React.useState(null); var erro = _s5[0], setErro = _s5[1];

  // Gravação
  var _s6 = React.useState(false); var gravando = _s6[0], setGravando = _s6[1];
  var _s7 = React.useState(0); var elapsedSec = _s7[0], setElapsedSec = _s7[1];
  var _s8 = React.useState(null); var recordedBlob = _s8[0], setRecordedBlob = _s8[1];
  var _s9 = React.useState(''); var recordedUrl = _s9[0], setRecordedUrl = _s9[1];
  var _s10 = React.useState(''); var recordedMime = _s10[0], setRecordedMime = _s10[1];
  var _s11 = React.useState(0); var recordedDurationSec = _s11[0], setRecordedDurationSec = _s11[1];
  var _s12 = React.useState(''); var saveTitulo = _s12[0], setSaveTitulo = _s12[1];
  var _s13 = React.useState(null); var savePastaId = _s13[0], setSavePastaId = _s13[1];
  var _s14 = React.useState(false); var saving = _s14[0], setSaving = _s14[1];
  var mediaRecorderRef = React.useRef(null);
  var chunksRef = React.useRef([]);
  var streamRef = React.useRef(null);
  var startedAtRef = React.useRef(0);
  var timerRef = React.useRef(null);

  // Pastas / gravações — edição
  var _s15 = React.useState(''); var novaPastaNome = _s15[0], setNovaPastaNome = _s15[1];
  var _s16 = React.useState(null); var editPasta = _s16[0], setEditPasta = _s16[1];
  var _s17 = React.useState(null); var editGravacao = _s17[0], setEditGravacao = _s17[1];

  // Reprodução
  var _s18 = React.useState(null); var playingId = _s18[0], setPlayingId = _s18[1];
  var _s19 = React.useState(''); var playingUrl = _s19[0], setPlayingUrl = _s19[1];

  // Tradutor
  var _s20 = React.useState('de-pt'); var direction = _s20[0], setDirection = _s20[1];
  var _s21 = React.useState(false); var listening = _s21[0], setListening = _s21[1];
  var _s22 = React.useState(''); var interimText = _s22[0], setInterimText = _s22[1];
  var _s23 = React.useState(''); var originalText = _s23[0], setOriginalText = _s23[1];
  var _s24 = React.useState(''); var translatedText = _s24[0], setTranslatedText = _s24[1];
  var _s25 = React.useState(false); var translating = _s25[0], setTranslating = _s25[1];
  var _s26 = React.useState(null); var erroTrad = _s26[0], setErroTrad = _s26[1];
  var recognitionRef = React.useRef(null);

  function carregar() {
    if (!db) { setLoading(false); setErro('Sem ligação à base de dados.'); return; }
    setLoading(true);
    Promise.all([
      db.from('voz_pastas').select('*').order('titulo', { ascending: true }),
      db.from('voz_gravacoes').select('*').is('arquivado_em', null).order('gravado_em', { ascending: false })
    ]).then(function(res) {
      var pRes = res[0], gRes = res[1];
      if (pRes.error) { setErro('Falha ao carregar pastas: ' + pRes.error.message); setLoading(false); return; }
      if (gRes.error) { setErro('Falha ao carregar gravações: ' + gRes.error.message); setLoading(false); return; }
      setPastas(pRes.data || []);
      setGravacoes(gRes.data || []);
      setLoading(false);
    }).catch(function(e) {
      setErro('Falha ao carregar: ' + (e && e.message ? e.message : e));
      setLoading(false);
    });
  }
  React.useEffect(function() { carregar(); }, []);

  // ── Gravar ──
  function iniciarGravacao() {
    setErro(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErro('Este browser não suporta gravação de áudio.');
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
      var mime = vzPickMimeType();
      if (!mime) { setErro('Nenhum formato de áudio suportado neste browser.'); stream.getTracks().forEach(function(t) { t.stop(); }); return; }
      streamRef.current = stream;
      chunksRef.current = [];
      var rec;
      try {
        rec = new MediaRecorder(stream, { mimeType: mime });
      } catch (e) {
        setErro('Falha ao iniciar o gravador: ' + (e && e.message ? e.message : e));
        stream.getTracks().forEach(function(t) { t.stop(); });
        return;
      }
      rec.ondataavailable = function(e) { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = function() {
        var blob = new Blob(chunksRef.current, { type: mime });
        var durSec = Math.round((Date.now() - startedAtRef.current) / 1000);
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
        setRecordedMime(mime);
        setRecordedDurationSec(durSec);
        setSaveTitulo('');
        setSavePastaId(null);
        if (streamRef.current) { streamRef.current.getTracks().forEach(function(t) { t.stop(); }); streamRef.current = null; }
      };
      mediaRecorderRef.current = rec;
      startedAtRef.current = Date.now();
      setElapsedSec(0);
      rec.start();
      setGravando(true);
      timerRef.current = setInterval(function() { setElapsedSec(function(s) { return s + 1; }); }, 1000);
    }).catch(function(e) {
      setErro('Permissão de microfone negada ou indisponível: ' + (e && e.message ? e.message : e));
    });
  }
  function pararGravacao() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop();
    setGravando(false);
  }
  function descartarGravacao() {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null); setRecordedUrl(''); setRecordedMime(''); setRecordedDurationSec(0);
    setErro(null);
  }
  function guardarGravacao() {
    if (!db) { setErro('Sem ligação à base de dados.'); return; }
    if (!profile || !profile.id) { setErro('Sem utilizador identificado.'); return; }
    setSaving(true);
    setErro(null);
    var titulo = saveTitulo.trim() || vzFmtDateTime(new Date());
    var gravadoEm = new Date().toISOString();
    var uploadedPath = null;
    vzUploadRecording(db, profile.id, recordedBlob, recordedMime).then(function(path) {
      uploadedPath = path;
      return db.from('voz_gravacoes').insert({
        pasta_id: savePastaId,
        titulo: titulo,
        gravado_em: gravadoEm,
        duracao_seg: recordedDurationSec,
        mime_type: recordedMime,
        storage_path: path
      }).select();
    }).then(function(res) {
      if (res.error) throw res.error;
      var novaLinha = (res.data && res.data[0]) || { id: 'tmp-' + Date.now(), pasta_id: savePastaId, titulo: titulo, gravado_em: gravadoEm, duracao_seg: recordedDurationSec, mime_type: recordedMime, storage_path: uploadedPath };
      setGravacoes(function(prev) { return [novaLinha].concat(prev); });
      descartarGravacao();
      setSaving(false);
    }).catch(function(e) {
      setSaving(false);
      var msg = 'Falha ao guardar: ' + (e && e.message ? e.message : e);
      if (uploadedPath) {
        db.storage.from(VZ_BUCKET).remove([uploadedPath]).then(function(rmRes) {
          if (rmRes.error) setErro(msg + ' (e falhou também limpar o ficheiro já enviado — fica órfão no storage: ' + rmRes.error.message + ')');
          else setErro(msg);
        }).catch(function() { setErro(msg + ' (e falhou também limpar o ficheiro já enviado)'); });
      } else {
        setErro(msg);
      }
    });
  }

  // ── Reprodução (URL assinado, gerado no momento) ──
  function tocarGravacao(g) {
    setErro(null);
    if (playingId === g.id) { setPlayingId(null); setPlayingUrl(''); return; }
    if (!db) { setErro('Sem ligação à base de dados.'); return; }
    db.storage.from(VZ_BUCKET).createSignedUrl(g.storage_path, 3600).then(function(res) {
      if (res.error) throw res.error;
      setPlayingId(g.id);
      setPlayingUrl(res.data.signedUrl);
    }).catch(function(e) {
      setErro('Falha ao gerar link de reprodução: ' + (e && e.message ? e.message : e));
    });
  }

  // ── Pastas ──
  function criarPasta() {
    var titulo = novaPastaNome.trim();
    if (!titulo || !db) return;
    setErro(null);
    db.from('voz_pastas').insert({ titulo: titulo }).select().then(function(res) {
      if (res.error) throw res.error;
      setPastas(function(prev) { return prev.concat(res.data || []).sort(function(a, b) { return a.titulo.localeCompare(b.titulo); }); });
      setNovaPastaNome('');
    }).catch(function(e) { setErro('Falha ao criar pasta: ' + (e && e.message ? e.message : e)); });
  }
  function guardarEdicaoPasta() {
    if (!editPasta || !db) return;
    var titulo = (editPasta.titulo || '').trim();
    if (!titulo) { setErro('O nome da pasta não pode ficar vazio.'); return; }
    setErro(null);
    db.from('voz_pastas').update({ titulo: titulo }).eq('id', editPasta.id).then(function(res) {
      if (res.error) throw res.error;
      setPastas(function(prev) { return prev.map(function(pa) { return pa.id === editPasta.id ? Object.assign({}, pa, { titulo: titulo }) : pa; }); });
      setEditPasta(null);
    }).catch(function(e) { setErro('Falha ao renomear pasta: ' + (e && e.message ? e.message : e)); });
  }
  function apagarPasta(pa) {
    if (!db) return;
    if (!confirm('Apagar a pasta "' + pa.titulo + '"? As gravações lá dentro ficam sem pasta.')) return;
    setErro(null);
    db.from('voz_pastas').delete().eq('id', pa.id).then(function(res) {
      if (res.error) throw res.error;
      setPastas(function(prev) { return prev.filter(function(x) { return x.id !== pa.id; }); });
      setGravacoes(function(prev) { return prev.map(function(g) { return g.pasta_id === pa.id ? Object.assign({}, g, { pasta_id: null }) : g; }); });
    }).catch(function(e) { setErro('Falha ao apagar pasta: ' + (e && e.message ? e.message : e)); });
  }

  // ── Gravações — renomear / mover / apagar ──
  function guardarEdicaoGravacao() {
    if (!editGravacao || !db) return;
    var titulo = (editGravacao.titulo || '').trim();
    if (!titulo) { setErro('O título não pode ficar vazio.'); return; }
    setErro(null);
    db.from('voz_gravacoes').update({ titulo: titulo, pasta_id: editGravacao.pasta_id }).eq('id', editGravacao.id).then(function(res) {
      if (res.error) throw res.error;
      setGravacoes(function(prev) { return prev.map(function(g) { return g.id === editGravacao.id ? Object.assign({}, g, { titulo: titulo, pasta_id: editGravacao.pasta_id }) : g; }); });
      setEditGravacao(null);
    }).catch(function(e) { setErro('Falha ao atualizar gravação: ' + (e && e.message ? e.message : e)); });
  }
  function apagarGravacao(g) {
    if (!db) return;
    if (!confirm('Apagar a gravação "' + g.titulo + '"? Não é possível desfazer.')) return;
    setErro(null);
    db.storage.from(VZ_BUCKET).remove([g.storage_path]).then(function(rmRes) {
      if (rmRes.error) throw rmRes.error;
      return db.from('voz_gravacoes').delete().eq('id', g.id);
    }).then(function(res) {
      if (res.error) throw res.error;
      setGravacoes(function(prev) { return prev.filter(function(x) { return x.id !== g.id; }); });
      if (playingId === g.id) { setPlayingId(null); setPlayingUrl(''); }
    }).catch(function(e) { setErro('Falha ao apagar gravação: ' + (e && e.message ? e.message : e)); });
  }

  // ── Tradutor ──
  function pararEscuta() {
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) {} }
    setListening(false);
  }
  function iniciarEscuta() {
    setErroTrad(null);
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setErroTrad('Este browser não suporta reconhecimento de voz.'); return; }
    setOriginalText(''); setInterimText(''); setTranslatedText('');
    var rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = VZ_LANGS[direction].srcSpeech;
    rec.onresult = function(e) {
      var interim = '', final = '';
      for (var i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      if (interim) setInterimText(interim);
      if (final) {
        setOriginalText(final);
        setInterimText('');
        traduzirTexto(final);
      }
    };
    rec.onerror = function(e) {
      setErroTrad('Falha no reconhecimento de voz: ' + (e && e.error ? e.error : 'desconhecida'));
      setListening(false);
    };
    rec.onend = function() { setListening(false); };
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  }
  function traduzirTexto(texto) {
    setTranslating(true);
    setErroTrad(null);
    var langs = VZ_LANGS[direction];
    vzTranslate(texto, langs.srcCode + '|' + langs.dstCode).then(function(t) {
      setTranslatedText(t);
      setTranslating(false);
      falarTraducao(t);
    }).catch(function(e) {
      setTranslating(false);
      setErroTrad('Falha ao traduzir: ' + (e && e.message ? e.message : e));
    });
  }
  function falarTraducao(texto) {
    if (!window.speechSynthesis || !texto) return;
    var u = new SpeechSynthesisUtterance(texto);
    u.lang = VZ_LANGS[direction].dstSpeech;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }
  function trocarDirecao() {
    pararEscuta();
    setDirection(function(d) { return d === 'de-pt' ? 'pt-de' : 'de-pt'; });
    setOriginalText(''); setInterimText(''); setTranslatedText(''); setErroTrad(null);
  }

  React.useEffect(function() {
    return function() {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(function(t) { t.stop(); });
      if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) {} }
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, []);

  var grupos = pastas.map(function(pa) {
    return { key: pa.id, nome: pa.titulo, itens: gravacoes.filter(function(g) { return g.pasta_id === pa.id; }) };
  }).concat([{ key: 'sem-pasta', nome: 'Sem pasta', itens: gravacoes.filter(function(g) { return !g.pasta_id; }) }])
    .filter(function(grupo) { return grupo.itens.length > 0 || grupo.key !== 'sem-pasta' || pastas.length === 0; });

  return React.createElement('div', { style: { minHeight: '100vh', background: T.bg, color: T.text, fontFamily: "'Inter',system-ui,sans-serif", paddingBottom: 40 } },
    React.createElement(VzHdr, { onBack: onBack }),
    React.createElement('div', { style: { display: 'flex', gap: 8, padding: '14px 16px 0' } },
      React.createElement('button', {
        onClick: function() { setTab('gravador'); },
        style: { flex: 1, background: tab === 'gravador' ? T.gold : T.surface2, color: tab === 'gravador' ? T.bg : T.text, border: 'none', borderRadius: 10, padding: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer' }
      }, '🎙️ Gravador'),
      React.createElement('button', {
        onClick: function() { setTab('tradutor'); },
        style: { flex: 1, background: tab === 'tradutor' ? T.gold : T.surface2, color: tab === 'tradutor' ? T.bg : T.text, border: 'none', borderRadius: 10, padding: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer' }
      }, '🌐 Tradutor')
    ),
    React.createElement('div', { style: { padding: '16px' } },
      tab === 'gravador' && React.createElement(VzRecorderTab, {
        gravando: gravando, elapsedSec: elapsedSec, onStart: iniciarGravacao, onStop: pararGravacao,
        recordedBlob: recordedBlob, recordedUrl: recordedUrl, saveTitulo: saveTitulo, savePastaId: savePastaId,
        onTituloChange: setSaveTitulo, onPastaChange: setSavePastaId, onDescartar: descartarGravacao, onGuardar: guardarGravacao, saving: saving,
        pastas: pastas, grupos: grupos, loading: loading, erro: erro,
        playingId: playingId, playingUrl: playingUrl, onPlay: tocarGravacao, onPlayEnded: function() { setPlayingId(null); setPlayingUrl(''); },
        onEditGravacao: function(g) { setEditGravacao(Object.assign({}, g)); }, onDeleteGravacao: apagarGravacao,
        novaPastaNome: novaPastaNome, onNovaPastaChange: setNovaPastaNome, onCriarPasta: criarPasta,
        onEditPasta: function(pa) { setEditPasta(Object.assign({}, pa)); }, onDeletePasta: apagarPasta
      }),
      tab === 'tradutor' && React.createElement(VzTradutorTab, {
        direction: direction, onSwapDirection: trocarDirecao,
        listening: listening, onStartListening: iniciarEscuta, onStopListening: pararEscuta,
        interimText: interimText, originalText: originalText, translatedText: translatedText, translating: translating,
        onRepetir: function() { falarTraducao(translatedText); }, erro: erroTrad
      })
    ),

    // ── Modal: editar gravação (título / pasta) ──
    editGravacao && React.createElement('div', { style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end', zIndex: 50 } },
      React.createElement('div', { style: { background: T.surface, borderRadius: '18px 18px 0 0', padding: 20, width: '100%' } },
        React.createElement('div', { style: { fontWeight: 800, fontSize: 16, marginBottom: 14 } }, 'Editar gravação'),
        React.createElement('input', {
          type: 'text', autoComplete: 'off', value: editGravacao.titulo,
          onChange: function(e) { setEditGravacao(Object.assign({}, editGravacao, { titulo: e.target.value })); },
          style: { width: '100%', background: T.surface2, border: '1px solid ' + T.border, borderRadius: 10, padding: '12px 14px', color: T.text, fontSize: 15, marginBottom: 10, boxSizing: 'border-box' }
        }),
        React.createElement('select', {
          value: editGravacao.pasta_id || '', onChange: function(e) { setEditGravacao(Object.assign({}, editGravacao, { pasta_id: e.target.value || null })); },
          style: { width: '100%', background: T.surface2, border: '1px solid ' + T.border, borderRadius: 10, padding: '12px 14px', color: T.text, fontSize: 15, marginBottom: 18, boxSizing: 'border-box' }
        },
          React.createElement('option', { value: '' }, 'Sem pasta'),
          pastas.map(function(pa) { return React.createElement('option', { key: pa.id, value: pa.id }, pa.titulo); })
        ),
        React.createElement('div', { style: { display: 'flex', gap: 10 } },
          React.createElement('button', { onClick: function() { setEditGravacao(null); }, style: { flex: 1, background: T.surface2, color: T.muted, border: 'none', borderRadius: 10, padding: 14, fontWeight: 700, cursor: 'pointer' } }, 'Cancelar'),
          React.createElement('button', { onClick: guardarEdicaoGravacao, style: { flex: 1, background: T.gold, color: T.bg, border: 'none', borderRadius: 10, padding: 14, fontWeight: 800, cursor: 'pointer' } }, 'Guardar')
        )
      )
    ),

    // ── Modal: editar pasta (renomear) ──
    editPasta && React.createElement('div', { style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end', zIndex: 50 } },
      React.createElement('div', { style: { background: T.surface, borderRadius: '18px 18px 0 0', padding: 20, width: '100%' } },
        React.createElement('div', { style: { fontWeight: 800, fontSize: 16, marginBottom: 14 } }, 'Renomear pasta'),
        React.createElement('input', {
          type: 'text', autoComplete: 'off', value: editPasta.titulo,
          onChange: function(e) { setEditPasta(Object.assign({}, editPasta, { titulo: e.target.value })); },
          style: { width: '100%', background: T.surface2, border: '1px solid ' + T.border, borderRadius: 10, padding: '12px 14px', color: T.text, fontSize: 15, marginBottom: 18, boxSizing: 'border-box' }
        }),
        React.createElement('div', { style: { display: 'flex', gap: 10 } },
          React.createElement('button', { onClick: function() { setEditPasta(null); }, style: { flex: 1, background: T.surface2, color: T.muted, border: 'none', borderRadius: 10, padding: 14, fontWeight: 700, cursor: 'pointer' } }, 'Cancelar'),
          React.createElement('button', { onClick: guardarEdicaoPasta, style: { flex: 1, background: T.gold, color: T.bg, border: 'none', borderRadius: 10, padding: 14, fontWeight: 800, cursor: 'pointer' } }, 'Guardar')
        )
      )
    )
  );
}
