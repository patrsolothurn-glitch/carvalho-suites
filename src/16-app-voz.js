// ══════════════════════════════════════════════════════════════════
// APP VOZ — Gravador de notas de voz + Tradutor DE↔PT (admin only)
// Todo o estado em VozApp (sem hooks em sub-componentes)
// ══════════════════════════════════════════════════════════════════

var VZ_BUCKET = 'voz';
var VZ_MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];

// Tradutor — idiomas disponíveis (código curto para a API de tradução,
// código de voz para SpeechRecognition/SpeechSynthesis). Alemão usa de-CH
// com fallback de-DE quando o aparelho não tem voz suíça instalada.
var VZ_LANGUAGES = [
  { code: 'pt', label: 'Português', speech: 'pt-PT' },
  { code: 'de', label: 'Alemão', speech: 'de-CH', speechFallback: 'de-DE' },
  { code: 'fr', label: 'Francês', speech: 'fr-FR' },
  { code: 'en', label: 'Inglês', speech: 'en-GB' },
  { code: 'it', label: 'Italiano', speech: 'it-IT' }
];
function vzLangByCode(code) {
  for (var i = 0; i < VZ_LANGUAGES.length; i++) { if (VZ_LANGUAGES[i].code === code) return VZ_LANGUAGES[i]; }
  return null;
}
var VZ_LANG_PAIR_KEY = 'vz_lang_pair';
function vzLoadLangPair() {
  try {
    var raw = localStorage.getItem(VZ_LANG_PAIR_KEY);
    if (raw) {
      var o = JSON.parse(raw);
      if (o && o.origem !== o.destino && vzLangByCode(o.origem) && vzLangByCode(o.destino)) {
        return { origem: o.origem, destino: o.destino };
      }
    }
  } catch (e) {}
  return { origem: 'de', destino: 'pt' };
}
function vzSaveLangPair(origem, destino) {
  try { localStorage.setItem(VZ_LANG_PAIR_KEY, JSON.stringify({ origem: origem, destino: destino })); } catch (e) {}
}

// Reconhecimento de voz — fecho de frase por silêncio (não pelo motor)
var VZ_SILENCE_MS = 3000;

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

function vzTitleCase(s) {
  if (!s) return s;
  return s.toLowerCase().replace(/(^|[^\p{L}])(\p{L})/gu, function(_, sep, ch) { return sep + ch.toUpperCase(); });
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

var VzIconEdit = function VzIconEdit(props) {
  var c = props.color || '#6E7183';
  return React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none' },
    React.createElement('path', { d: 'M4 20l1-4L16.5 4.5a1.5 1.5 0 0 1 2.12 0l.88.88a1.5 1.5 0 0 1 0 2.12L8 19l-4 1z', stroke: c, strokeWidth: 1.6, strokeLinejoin: 'round', strokeLinecap: 'round' })
  );
};

var VzIconTrash = function VzIconTrash(props) {
  var c = props.color || '#6E7183';
  return React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none' },
    React.createElement('path', { d: 'M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0v12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7', stroke: c, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' })
  );
};

var VzIconCopy = function VzIconCopy(props) {
  var c = props.color || '#6E7183';
  return React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none' },
    React.createElement('rect', { x: 8, y: 8, width: 12, height: 12, rx: 2, stroke: c, strokeWidth: 1.6 }),
    React.createElement('path', { d: 'M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2', stroke: c, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' })
  );
};

var VzIconCheck = function VzIconCheck(props) {
  var c = props.color || '#22C55E';
  return React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none' },
    React.createElement('path', { d: 'M5 13l4 4L19 7', stroke: c, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' })
  );
};

var VzIconPlayPause = function VzIconPlayPause(props) {
  var c = props.color || '#E8E9EF';
  if (props.playing) {
    return React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24' },
      React.createElement('rect', { x: 5, y: 4, width: 5, height: 16, rx: 1.5, fill: c }),
      React.createElement('rect', { x: 14, y: 4, width: 5, height: 16, rx: 1.5, fill: c })
    );
  }
  return React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24' },
    React.createElement('path', { d: 'M6 4.5v15a1 1 0 0 0 1.5.87l13-7.5a1 1 0 0 0 0-1.74l-13-7.5A1 1 0 0 0 6 4.5z', fill: c })
  );
};

// Anel exterior fixo (r=48) nunca muda de tamanho — só a cor do anel e a
// forma interior (círculo+microfone parado / quadrado sem microfone a gravar)
// transitam, sempre via atributos SVG animáveis por CSS (~150ms), nunca scale/transform.
var VzRecordButton = function VzRecordButton(props) {
  var gravando = !!props.gravando;
  var shapeStyle = { transition: 'x 150ms ease, y 150ms ease, width 150ms ease, height 150ms ease, rx 150ms ease' };
  var shapeProps = gravando
    ? { x: 33, y: 33, width: 34, height: 34, rx: 8 }
    : { x: 13, y: 13, width: 74, height: 74, rx: 37 };
  return React.createElement('button', {
    onClick: props.onClick,
    style: { width: 120, height: 120, background: 'none', border: 'none', cursor: 'pointer', padding: 0, borderRadius: '50%' }
  },
    React.createElement('svg', { viewBox: '0 0 100 100', width: 120, height: 120 },
      React.createElement('circle', {
        className: gravando ? 'vz-ring vz-ring-pulse' : 'vz-ring',
        cx: 50, cy: 50, r: 48, fill: 'none', stroke: gravando ? '#E23B3B' : '#3A3D4D', strokeWidth: 3,
        style: { transition: 'stroke 150ms ease' }
      }),
      React.createElement('rect', Object.assign({ fill: '#E23B3B', style: shapeStyle }, shapeProps)),
      React.createElement('g', { style: { opacity: gravando ? 0 : 1, transition: 'opacity 150ms ease' } },
        React.createElement('rect', { x: 44, y: 30, width: 12, height: 20, rx: 6, fill: 'white' }),
        React.createElement('path', { d: 'M38 46a12 12 0 0 0 24 0', stroke: 'white', strokeWidth: 3, fill: 'none', strokeLinecap: 'round' }),
        React.createElement('line', { x1: 50, y1: 58, x2: 50, y2: 64, stroke: 'white', strokeWidth: 3, strokeLinecap: 'round' }),
        React.createElement('line', { x1: 43, y1: 64, x2: 57, y2: 64, stroke: 'white', strokeWidth: 3, strokeLinecap: 'round' })
      )
    )
  );
};

var VzErro = function VzErro(props) {
  if (!props.msg) return null;
  return React.createElement('div', { style: { background: 'rgba(239,68,68,0.15)', border: '1px solid ' + T.red, color: T.red, borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, fontWeight: 600 } }, '⚠ ' + props.msg);
};

var VzGravacaoRow = function VzGravacaoRow(props) {
  var g = props.g;
  var isPlaying = props.playingId === g.id;
  var arquivada = !!g.arquivado_em;
  var temTranscricao = !!g.transcricao;
  var expandida = !!props.transcricaoExpandida;
  var copiado = props.copiedId === g.id;
  return React.createElement('div', { style: { background: '#14161D', border: '0.5px solid #22252F', borderRadius: 10, padding: 12, marginBottom: 8 } },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
      arquivada
        ? React.createElement('button', {
            onClick: function() { if (g.drive_url) window.open(g.drive_url, '_blank'); },
            disabled: !g.drive_url,
            title: g.drive_url ? 'Abrir no Google Drive' : 'Arquivada, sem link do Drive',
            style: { background: 'transparent', border: '1.5px solid #40445A', borderRadius: '50%', width: 36, height: 36, flexShrink: 0, cursor: g.drive_url ? 'pointer' : 'default', fontSize: 15, color: '#8E91A2', opacity: g.drive_url ? 1 : 0.5 }
          }, '☁️')
        : React.createElement('button', {
            onClick: function() { props.onPlay(g); },
            style: { background: 'transparent', border: '1.5px solid #40445A', borderRadius: '50%', width: 36, height: 36, flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }
          }, React.createElement(VzIconPlayPause, { playing: isPlaying, color: '#E8E9EF' })),
      React.createElement('div', { style: { flex: 1, minWidth: 0 } },
        React.createElement('div', {
          onClick: temTranscricao ? function() { props.onToggleTranscricao(g.id); } : undefined,
          style: { fontWeight: 700, fontSize: 14, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: temTranscricao ? 'pointer' : 'default' }
        }, vzTitleCase(g.titulo), temTranscricao && React.createElement('span', { style: { color: '#6E7183', fontSize: 11, marginLeft: 6 } }, expandida ? '▴' : '▾')),
        React.createElement('div', { style: { fontSize: 11, color: T.muted, marginTop: 2 } }, vzFmtDateTime(g.gravado_em) + ' · ' + vzFmtDuration(g.duracao_seg) + (arquivada ? ' · no Drive' : '')),
        temTranscricao && expandida && React.createElement('div', { style: { fontSize: 12, color: T.muted, marginTop: 4, fontStyle: 'italic', whiteSpace: 'pre-wrap' } }, '“' + g.transcricao + '”')
      ),
      React.createElement('button', { onClick: function() { props.onEdit(g); }, style: { background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex' } }, React.createElement(VzIconEdit, { color: '#6E7183' })),
      React.createElement('button', {
        onClick: function() { props.onCopiarTranscricao(g); }, disabled: !temTranscricao, title: temTranscricao ? 'Copiar transcrição' : 'Sem transcrição',
        style: { background: 'none', border: 'none', cursor: temTranscricao ? 'pointer' : 'default', padding: 6, display: 'flex', opacity: temTranscricao ? 1 : 0.35 }
      }, copiado ? React.createElement(VzIconCheck, { color: '#22C55E' }) : React.createElement(VzIconCopy, { color: '#6E7183' })),
      React.createElement('button', { onClick: function() { props.onDelete(g); }, style: { background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex' } }, React.createElement(VzIconTrash, { color: '#6E7183' }))
    ),
    isPlaying && props.playingUrl && React.createElement('audio', { controls: true, autoPlay: true, src: props.playingUrl, style: { width: '100%', marginTop: 10 }, onEnded: props.onPlayEnded })
  );
};

function vzToggleSet(setter, key) {
  setter(function(prev) {
    var s = new Set(prev);
    if (s.has(key)) s.delete(key); else s.add(key);
    return s;
  });
}

var VZ_LIMITE_LISTA = 3;

var VzGrupoPastas = function VzGrupoPastas(p) {
  var grupo = p.grupo;
  var n = grupo.itens.length;
  var collapsed = p.collapsed;
  var expanded = p.expanded;
  var visiveis = expanded ? grupo.itens : grupo.itens.slice(0, VZ_LIMITE_LISTA);
  var restantes = n - visiveis.length;
  return React.createElement('div', { style: { marginBottom: 14 } },
    React.createElement('div', {
      onClick: p.onToggleCollapse,
      style: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 0', marginBottom: collapsed ? 0 : 8 }
    },
      React.createElement('span', { style: { fontSize: 11, color: T.gold, width: 12 } }, collapsed ? '▸' : '▾'),
      React.createElement('span', { style: { fontSize: 12, fontWeight: 800, color: T.gold, textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 } }, '📁 ' + grupo.nome + ' (' + n + ')')
    ),
    !collapsed && n === 0 && React.createElement('div', { style: { color: T.muted, fontSize: 13, padding: '4px 0 8px' } }, 'Sem gravações'),
    !collapsed && visiveis.map(function(g) {
      return React.createElement(VzGravacaoRow, {
        key: g.id, g: g, playingId: p.playingId, playingUrl: p.playingUrl,
        onPlay: p.onPlay, onPlayEnded: p.onPlayEnded, onEdit: p.onEdit, onDelete: p.onDelete,
        transcricaoExpandida: p.expandedTranscricoes.has(g.id), onToggleTranscricao: p.onToggleTranscricao,
        copiedId: p.copiedId, onCopiarTranscricao: p.onCopiarTranscricao
      });
    }),
    !collapsed && restantes > 0 && React.createElement('button', {
      onClick: p.onToggleExpand,
      style: { width: '100%', background: 'none', border: 'none', color: '#8E91A2', fontWeight: 700, fontSize: 13, padding: '8px 0', cursor: 'pointer', textAlign: 'center' }
    }, '▾ Ver mais ' + restantes),
    !collapsed && expanded && n > VZ_LIMITE_LISTA && React.createElement('button', {
      onClick: p.onToggleExpand,
      style: { width: '100%', background: 'none', border: 'none', color: T.muted, fontWeight: 700, fontSize: 13, padding: '8px 0', cursor: 'pointer', textAlign: 'center' }
    }, '▴ Ver menos')
  );
};

var VzRecorderTab = function VzRecorderTab(p) {
  if (p.gravando) {
    return React.createElement('div', { style: { textAlign: 'center', padding: '40px 16px' } },
      React.createElement(VzRecordButton, { gravando: true, onClick: p.onStop }),
      React.createElement('div', { style: { marginTop: 16, color: '#7E8291', fontSize: 13, fontVariantNumeric: 'tabular-nums' } }, 'A gravar · ' + vzFmtDuration(p.elapsedSec))
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
        React.createElement('button', { onClick: p.onGuardar, disabled: p.saving, style: { flex: 2, background: '#40445A', color: '#E8E9EF', border: 'none', borderRadius: 10, padding: 14, fontWeight: 800, fontSize: 15, cursor: 'pointer', opacity: p.saving ? 0.6 : 1 } }, p.saving ? 'A guardar…' : '💾 Guardar')
      )
    );
  }

  return React.createElement('div', null,
    React.createElement(VzErro, { msg: p.erro }),
    React.createElement('div', { style: { textAlign: 'center', padding: '40px 16px 30px' } },
      React.createElement(VzRecordButton, { gravando: false, onClick: p.onStart }),
      React.createElement('div', { style: { marginTop: 16, color: '#7E8291', fontSize: 13 } }, 'Toca para gravar')
    ),
    p.loading && React.createElement('div', { style: { textAlign: 'center', color: T.muted, padding: 20 } }, 'A carregar…'),
    !p.loading && p.grupos.map(function(grupo) {
      return React.createElement(VzGrupoPastas, {
        key: grupo.key, grupo: grupo,
        collapsed: p.collapsedGroups.has(grupo.key),
        expanded: p.expandedGroups.has(grupo.key),
        onToggleCollapse: function() { p.onToggleCollapse(grupo.key); },
        onToggleExpand: function() { p.onToggleExpand(grupo.key); },
        playingId: p.playingId, playingUrl: p.playingUrl, onPlay: p.onPlay, onPlayEnded: p.onPlayEnded,
        onEdit: p.onEditGravacao, onDelete: p.onDeleteGravacao,
        expandedTranscricoes: p.expandedTranscricoes, onToggleTranscricao: p.onToggleTranscricao,
        copiedId: p.copiedId, onCopiarTranscricao: p.onCopiarTranscricao
      });
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
        React.createElement('button', { onClick: p.onCriarPasta, style: { background: '#40445A', color: '#E8E9EF', border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 700, cursor: 'pointer' } }, '+')
      )
    )
  );
};

var VzSelectStyle = { flex: 1, background: '#14161D', border: '0.5px solid #22252F', borderRadius: 10, padding: '12px 10px', color: '#E8E9EF', fontSize: 14, fontWeight: 700 };

var VzTradutorTab = function VzTradutorTab(p) {
  var origemLang = vzLangByCode(p.origem) || VZ_LANGUAGES[0];
  return React.createElement('div', { style: { padding: 16 } },
    React.createElement(VzErro, { msg: p.erro }),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 } },
      React.createElement('select', {
        value: p.origem, onChange: function(e) { p.onOrigemChange(e.target.value); }, style: VzSelectStyle
      }, VZ_LANGUAGES.map(function(l) { return React.createElement('option', { key: l.code, value: l.code }, l.label); })),
      React.createElement('button', {
        onClick: p.onSwap, title: 'Trocar',
        style: { background: '#14161D', border: '0.5px solid #22252F', borderRadius: 10, width: 40, height: 40, flexShrink: 0, color: '#8E91A2', fontSize: 17, cursor: 'pointer' }
      }, '⇄'),
      React.createElement('select', {
        value: p.destino, onChange: function(e) { p.onDestinoChange(e.target.value); }, style: VzSelectStyle
      }, VZ_LANGUAGES.map(function(l) { return React.createElement('option', { key: l.code, value: l.code }, l.label); }))
    ),
    React.createElement('div', { style: { textAlign: 'center', marginBottom: 26 } },
      React.createElement('button', {
        onClick: p.listening ? p.onStopListening : p.onStartListening,
        style: {
          width: 110, height: 110, borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: 38, color: p.listening ? 'white' : '#8E91A2',
          background: p.listening ? T.red : '#1C1F29',
          boxShadow: p.listening ? '0 0 0 8px rgba(239,68,68,0.18)' : 'none'
        }
      }, '🎙️'),
      React.createElement('div', { style: { marginTop: 12, color: T.muted, fontSize: 13 } }, p.listening ? 'A ouvir… (' + origemLang.speech + ') · toca para parar' : 'Toca para falar')
    ),
    React.createElement('div', { style: { fontSize: 12, color: T.muted, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' } }, 'Original'),
    p.interimText && React.createElement('div', { style: { fontSize: 13, color: '#7E8291', marginBottom: 4, fontStyle: 'italic' } }, '… ' + p.interimText),
    React.createElement('textarea', {
      value: p.originalText, autoComplete: 'off', placeholder: 'Escreve ou cola aqui…',
      onChange: function(e) { p.onOriginalTextChange(e.target.value); },
      rows: 4,
      style: { width: '100%', background: '#14161D', border: '0.5px solid #22252F', borderRadius: 10, padding: '14px 16px', color: T.text, fontSize: 15, marginBottom: 10, boxSizing: 'border-box', resize: 'vertical', fontFamily: "'Inter',system-ui,sans-serif" }
    }),
    React.createElement('div', { style: { display: 'flex', gap: 10, marginBottom: 18 } },
      React.createElement('button', {
        onClick: p.onTraduzir, disabled: p.translating || !p.originalText.trim(),
        style: { flex: 2, background: '#40445A', color: '#E8E9EF', border: 'none', borderRadius: 10, padding: 14, fontWeight: 800, fontSize: 14, cursor: 'pointer', opacity: (p.translating || !p.originalText.trim()) ? 0.6 : 1 }
      }, p.translating ? 'A traduzir…' : 'Traduzir'),
      React.createElement('button', {
        onClick: p.onLimpar, disabled: !p.originalText && !p.translatedText,
        style: { flex: 1, background: '#14161D', border: '0.5px solid #22252F', borderRadius: 10, padding: 14, color: T.muted, fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: (!p.originalText && !p.translatedText) ? 0.5 : 1 }
      }, 'Limpar')
    ),
    React.createElement('div', { style: { fontSize: 12, color: T.muted, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' } }, 'Tradução'),
    React.createElement('div', { style: { background: '#14161D', border: '0.5px solid #22252F', borderRadius: 10, padding: '14px 16px', minHeight: 50, color: T.text, fontSize: 15, fontWeight: 600, marginBottom: p.vozIndisponivel ? 6 : 18 } },
      p.translating ? 'A traduzir…' : (p.translatedText || '—')
    ),
    p.vozIndisponivel && React.createElement('div', { style: { fontSize: 12, color: T.muted, marginBottom: 18 } }, 'Voz não disponível neste aparelho'),
    p.translatedText && !p.translating && React.createElement('div', { style: { display: 'flex', gap: 10 } },
      React.createElement('button', {
        onClick: p.onRepetir,
        style: { flex: 1, background: '#14161D', border: '0.5px solid #22252F', borderRadius: 10, padding: 14, color: T.text, fontWeight: 700, fontSize: 14, cursor: 'pointer' }
      }, '🔁 Repetir áudio'),
      React.createElement('button', {
        onClick: p.onCopiar,
        style: { flex: 1, background: '#14161D', border: '0.5px solid #22252F', borderRadius: 10, padding: 14, color: T.text, fontWeight: 700, fontSize: 14, cursor: 'pointer' }
      }, p.copiado ? '✓ Copiado' : '📋 Copiar')
    )
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

  // Listas colapsáveis — abertas por omissão, limitadas a 3; só local
  var _s27 = React.useState(new Set()); var collapsedGroups = _s27[0], setCollapsedGroups = _s27[1];
  var _s28 = React.useState(new Set()); var expandedGroups = _s28[0], setExpandedGroups = _s28[1];

  // Transcrição — colapsada por omissão; copiar
  var _s32 = React.useState(new Set()); var expandedTranscricoes = _s32[0], setExpandedTranscricoes = _s32[1];
  var _s33 = React.useState(null); var copiedId = _s33[0], setCopiedId = _s33[1];
  var copiedIdTimerRef = React.useRef(null);

  // Reprodução
  var _s18 = React.useState(null); var playingId = _s18[0], setPlayingId = _s18[1];
  var _s19 = React.useState(''); var playingUrl = _s19[0], setPlayingUrl = _s19[1];

  // Tradutor
  var _s20 = React.useState(function() { return vzLoadLangPair().origem; }); var origem = _s20[0], setOrigemState = _s20[1];
  var _s21 = React.useState(false); var listening = _s21[0], setListening = _s21[1];
  var _s22 = React.useState(''); var interimText = _s22[0], setInterimText = _s22[1];
  var _s23 = React.useState(''); var originalText = _s23[0], setOriginalText = _s23[1];
  var _s24 = React.useState(''); var translatedText = _s24[0], setTranslatedText = _s24[1];
  var _s25 = React.useState(false); var translating = _s25[0], setTranslating = _s25[1];
  var _s26 = React.useState(null); var erroTrad = _s26[0], setErroTrad = _s26[1];
  var _s29 = React.useState(function() { return vzLoadLangPair().destino; }); var destino = _s29[0], setDestinoState = _s29[1];
  var _s30 = React.useState(false); var vozIndisponivel = _s30[0], setVozIndisponivel = _s30[1];
  var _s31 = React.useState(false); var copiado = _s31[0], setCopiado = _s31[1];
  var recognitionRef = React.useRef(null);
  var copiadoTimerRef = React.useRef(null);
  var accumulatedRef = React.useRef('');
  var silenceTimerRef = React.useRef(null);
  var manualStopRef = React.useRef(false);

  function carregar() {
    if (!db) { setLoading(false); setErro('Sem ligação à base de dados.'); return; }
    setLoading(true);
    Promise.all([
      db.from('voz_pastas').select('*').order('titulo', { ascending: true }),
      db.from('voz_gravacoes').select('*').order('gravado_em', { ascending: false })
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
    var aviso = g.arquivado_em
      ? 'Apagar a gravação "' + g.titulo + '"? Está no Drive — isto só apaga o registo aqui, não o ficheiro no Drive.'
      : 'Apagar a gravação "' + g.titulo + '"? Não é possível desfazer.';
    if (!confirm(aviso)) return;
    setErro(null);
    // Arquivada: o ficheiro já não está no bucket (foi para o Drive), só apagar a linha.
    var removerDoStorage = g.arquivado_em
      ? Promise.resolve({ error: null })
      : db.storage.from(VZ_BUCKET).remove([g.storage_path]);
    removerDoStorage.then(function(rmRes) {
      if (rmRes.error) throw rmRes.error;
      return db.from('voz_gravacoes').delete().eq('id', g.id);
    }).then(function(res) {
      if (res.error) throw res.error;
      setGravacoes(function(prev) { return prev.filter(function(x) { return x.id !== g.id; }); });
      if (playingId === g.id) { setPlayingId(null); setPlayingUrl(''); }
    }).catch(function(e) { setErro('Falha ao apagar gravação: ' + (e && e.message ? e.message : e)); });
  }
  function toggleTranscricao(id) {
    vzToggleSet(setExpandedTranscricoes, id);
  }
  function copiarTranscricao(g) {
    if (!g.transcricao || !navigator.clipboard) return;
    navigator.clipboard.writeText(g.transcricao).then(function() {
      setCopiedId(g.id);
      if (copiedIdTimerRef.current) clearTimeout(copiedIdTimerRef.current);
      copiedIdTimerRef.current = setTimeout(function() { setCopiedId(null); }, 1500);
    }).catch(function(e) {
      setErro('Falha ao copiar transcrição: ' + (e && e.message ? e.message : e));
    });
  }

  // ── Tradutor ──
  function clearSilenceTimer() {
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
  }
  function resetSilenceTimer() {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(function() {
      silenceTimerRef.current = null;
      var texto = accumulatedRef.current.trim();
      accumulatedRef.current = '';
      if (texto) traduzirTexto(texto);
    }, VZ_SILENCE_MS);
  }
  // Para por ação do utilizador: fecha já a frase pendente (sem esperar o silêncio) e
  // desliga a escuta de vez. Usada para trocar de idioma / desmontar: cancelarEscuta.
  function pararEscuta() {
    manualStopRef.current = true;
    clearSilenceTimer();
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) {} }
    setListening(false);
    var texto = accumulatedRef.current.trim();
    accumulatedRef.current = '';
    setInterimText('');
    if (texto) traduzirTexto(texto);
  }
  function cancelarEscuta() {
    manualStopRef.current = true;
    clearSilenceTimer();
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) {} }
    accumulatedRef.current = '';
    setListening(false);
  }
  function iniciarEscuta() {
    setErroTrad(null);
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setErroTrad('Este browser não suporta reconhecimento de voz.'); return; }
    setOriginalText(''); setInterimText(''); setTranslatedText(''); setVozIndisponivel(false);
    accumulatedRef.current = '';
    manualStopRef.current = false;
    var origemLang = vzLangByCode(origem) || VZ_LANGUAGES[1];
    var rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 3;
    rec.lang = origemLang.speech;
    rec.onresult = function(e) {
      resetSilenceTimer();
      var interim = '';
      for (var i = e.resultIndex; i < e.results.length; i++) {
        var result = e.results[i];
        if (result.isFinal) {
          var melhor = result[0];
          for (var j = 1; j < result.length; j++) {
            if (result[j].confidence > melhor.confidence) melhor = result[j];
          }
          accumulatedRef.current = (accumulatedRef.current ? accumulatedRef.current + ' ' : '') + melhor.transcript.trim();
          setOriginalText(accumulatedRef.current);
        } else {
          interim += result[0].transcript;
        }
      }
      setInterimText(interim);
    };
    rec.onerror = function(e) {
      setErroTrad('Falha no reconhecimento de voz: ' + (e && e.error ? e.error : 'desconhecida'));
      setListening(false);
      clearSilenceTimer();
    };
    rec.onend = function() {
      // Motor terminou sozinho (limite interno do browser) e o utilizador não
      // carregou em parar: recomeça já, mantendo o transcript já acumulado.
      if (!manualStopRef.current) {
        try { rec.start(); } catch (e) { setListening(false); }
      }
    };
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  }
  function traduzirTexto(texto) {
    setTranslating(true);
    setErroTrad(null);
    vzTranslate(texto, origem + '|' + destino).then(function(t) {
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
    var destLang = vzLangByCode(destino) || VZ_LANGUAGES[0];
    var voices = window.speechSynthesis.getVoices() || [];
    var achar = function(speechCode) {
      return voices.filter(function(v) { return v.lang === speechCode; })[0]
        || voices.filter(function(v) { return v.lang.indexOf(speechCode.split('-')[0] + '-') === 0; })[0];
    };
    var vozEscolhida = null;
    if (voices.length > 0) {
      vozEscolhida = achar(destLang.speech);
      if (!vozEscolhida && destLang.speechFallback) vozEscolhida = achar(destLang.speechFallback);
      if (!vozEscolhida) { setVozIndisponivel(true); return; }
    }
    setVozIndisponivel(false);
    var u = new SpeechSynthesisUtterance(texto);
    if (vozEscolhida) { u.voice = vozEscolhida; u.lang = vozEscolhida.lang; }
    else u.lang = destLang.speech;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }
  function resetarEstadoTraducao() {
    setOriginalText(''); setInterimText(''); setTranslatedText(''); setErroTrad(null); setVozIndisponivel(false);
  }
  function selecionarOrigem(code) {
    if (code === origem) return;
    cancelarEscuta();
    var novoDestino = code === destino ? origem : destino;
    setOrigemState(code);
    if (novoDestino !== destino) setDestinoState(novoDestino);
    vzSaveLangPair(code, novoDestino);
    resetarEstadoTraducao();
  }
  function selecionarDestino(code) {
    if (code === destino) return;
    cancelarEscuta();
    var novoOrigem = code === origem ? destino : origem;
    setDestinoState(code);
    if (novoOrigem !== origem) setOrigemState(novoOrigem);
    vzSaveLangPair(novoOrigem, code);
    resetarEstadoTraducao();
  }
  function trocarDirecao() {
    cancelarEscuta();
    var novoOrigem = destino, novoDestino = origem;
    setOrigemState(novoOrigem);
    setDestinoState(novoDestino);
    vzSaveLangPair(novoOrigem, novoDestino);
    resetarEstadoTraducao();
  }
  function traduzirManual() {
    var texto = originalText.trim();
    if (!texto) return;
    traduzirTexto(texto);
  }
  function limparTraducao() {
    cancelarEscuta();
    resetarEstadoTraducao();
  }
  function copiarTraducao() {
    if (!translatedText || !navigator.clipboard) return;
    navigator.clipboard.writeText(translatedText).then(function() {
      setCopiado(true);
      if (copiadoTimerRef.current) clearTimeout(copiadoTimerRef.current);
      copiadoTimerRef.current = setTimeout(function() { setCopiado(false); }, 1500);
    }).catch(function(e) {
      setErroTrad('Falha ao copiar: ' + (e && e.message ? e.message : e));
    });
  }

  React.useEffect(function() {
    return function() {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(function(t) { t.stop(); });
      manualStopRef.current = true;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (copiadoTimerRef.current) clearTimeout(copiadoTimerRef.current);
      if (copiedIdTimerRef.current) clearTimeout(copiedIdTimerRef.current);
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
    React.createElement('style', null, '@keyframes vzPulse{0%{opacity:1}50%{opacity:.55}100%{opacity:1}}.vz-ring-pulse{animation:vzPulse 1.6s ease-in-out infinite;}'),
    React.createElement(VzHdr, { onBack: onBack }),
    React.createElement('div', { style: { display: 'flex', gap: 8, padding: '14px 16px 0' } },
      React.createElement('button', {
        onClick: function() { setTab('gravador'); },
        style: { flex: 1, background: tab === 'gravador' ? '#D9B94E' : T.surface2, color: tab === 'gravador' ? '#3A2E05' : T.text, border: 'none', borderRadius: 10, padding: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer' }
      }, '🎙️ Gravador'),
      React.createElement('button', {
        onClick: function() { setTab('tradutor'); },
        style: { flex: 1, background: tab === 'tradutor' ? '#D9B94E' : T.surface2, color: tab === 'tradutor' ? '#3A2E05' : T.text, border: 'none', borderRadius: 10, padding: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer' }
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
        onEditPasta: function(pa) { setEditPasta(Object.assign({}, pa)); }, onDeletePasta: apagarPasta,
        collapsedGroups: collapsedGroups, expandedGroups: expandedGroups,
        onToggleCollapse: function(key) { vzToggleSet(setCollapsedGroups, key); },
        onToggleExpand: function(key) { vzToggleSet(setExpandedGroups, key); },
        expandedTranscricoes: expandedTranscricoes, onToggleTranscricao: toggleTranscricao,
        copiedId: copiedId, onCopiarTranscricao: copiarTranscricao
      }),
      tab === 'tradutor' && React.createElement(VzTradutorTab, {
        origem: origem, destino: destino,
        onOrigemChange: selecionarOrigem, onDestinoChange: selecionarDestino, onSwap: trocarDirecao,
        listening: listening, onStartListening: iniciarEscuta, onStopListening: pararEscuta,
        interimText: interimText, originalText: originalText, translatedText: translatedText, translating: translating,
        vozIndisponivel: vozIndisponivel, copiado: copiado,
        onOriginalTextChange: setOriginalText, onTraduzir: traduzirManual, onLimpar: limparTraducao, onCopiar: copiarTraducao,
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
          React.createElement('button', { onClick: guardarEdicaoGravacao, style: { flex: 1, background: '#40445A', color: '#E8E9EF', border: 'none', borderRadius: 10, padding: 14, fontWeight: 800, cursor: 'pointer' } }, 'Guardar')
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
          React.createElement('button', { onClick: guardarEdicaoPasta, style: { flex: 1, background: '#40445A', color: '#E8E9EF', border: 'none', borderRadius: 10, padding: 14, fontWeight: 800, cursor: 'pointer' } }, 'Guardar')
        )
      )
    )
  );
}
