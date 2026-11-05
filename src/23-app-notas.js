// ══════════════════════════════════════════════════════════════════
// APP NOTAS CARVALHO — Notas da família. Tabela public.notas_notas
// (ver sql/33_notas_notas.sql). Cada pessoa tem o seu cartão + o cartão
// "Família" (partilhado por quem tem a app). O admin vê ainda os cartões
// do Lucas e do Liam, SÓ LEITURA; o cartão da esposa nunca aparece ao
// admin. A RLS é que manda — o código só espelha-a (esconde botões).
// Organização: Ano > Mês > Semana ISO (por created_at), tudo minimizável;
// por omissão só o ano/mês/semana atuais ficam abertos.
// Apagar = Lixo (deleted_at); Lixo por cartão com restaurar e apagar
// definitivo; no Lixo há mais de 30 dias apaga-se definitivamente ao abrir
// (só as do próprio e da Família). Componentes todos ao nível do módulo.
// ══════════════════════════════════════════════════════════════════

var NT_ACENTO = '#EC4899';
var NT_DIAS_LIXO = 30;
var NT_NOMES = { patricio: 'Patricio', esposa: 'Esposa', lucas: 'Lucas', liam: 'Liam', familia: 'Família' };
var NT_EMOJIS = { patricio: '👨‍💼', esposa: '👩', lucas: '🧒', liam: '👦', familia: '🏠' };
var NT_MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
var NT_MEMBROS = ['patricio', 'esposa', 'lucas', 'liam'];

function ntLog(op, err) {
  console.error('[notas] falha ao ' + op + ':', err);
}
function ntAvisar(op, err) {
  ntLog(op, err);
  if (typeof window.mostrarErro === 'function') window.mostrarErro('Notas Carvalho — ' + op, err);
}
// Erro vindo de res.error: o interceptor do head.html já mostra o cartão (exceto PGRST116/PGRST205) — aqui só consola.
function ntAvisarRes(op, err) {
  var code = err && err.code;
  if (window.__sbErrPatched && code !== 'PGRST116' && code !== 'PGRST205') ntLog(op, err);
  else ntAvisar(op, err);
}

// Semana ISO — cópia do helper de src/07-app-familia.js (não há helper partilhado)
var ntGetISOWeek = function ntGetISOWeek(date) {
  var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  var dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

function ntNovoId() {
  try {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
  } catch (e) {}
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 3 | 8)).toString(16);
  });
}

// Cartões que a pessoa pode ver (a RLS decide o resto). Nunca 'esposa' para quem não é a esposa.
function ntDonosVisiveis(myId, isAdmin) {
  var out = [];
  if (NT_MEMBROS.indexOf(myId) !== -1) out.push(myId);
  out.push('familia');
  if (isAdmin) {
    ['lucas', 'liam'].forEach(function (k) { if (out.indexOf(k) === -1) out.push(k); });
  }
  return out;
}
function ntPodeEditar(dono, myId) {
  return dono === 'familia' || (NT_MEMBROS.indexOf(myId) !== -1 && dono === myId);
}
function ntAtiva(n) { return !n.deleted_at; }

function ntChavesDe(iso) {
  var d = new Date(iso);
  var y = d.getFullYear(), m = d.getMonth(), w = ntGetISOWeek(d);
  var kA = 'a' + y, kM = kA + '-m' + (m < 9 ? '0' : '') + (m + 1), kS = kM + '-s' + (w < 10 ? '0' : '') + w;
  return { y: y, m: m, w: w, kA: kA, kM: kM, kS: kS };
}

// Agrupa Ano > Mês > Semana ISO por created_at; tudo do mais recente para o mais antigo.
function ntAgrupar(notas) {
  var ord = notas.slice().sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
  var anos = [], mapa = {};
  ord.forEach(function (n) {
    var k = ntChavesDe(n.created_at);
    var a = mapa[k.kA];
    if (!a) { a = mapa[k.kA] = { key: k.kA, label: String(k.y), n: 0, meses: [] }; anos.push(a); }
    var mes = mapa[k.kM];
    if (!mes) { mes = mapa[k.kM] = { key: k.kM, label: NT_MESES[k.m], n: 0, semanas: [] }; a.meses.push(mes); }
    var s = mapa[k.kS];
    if (!s) { s = mapa[k.kS] = { key: k.kS, label: 'Semana ' + k.w, n: 0, notas: [] }; mes.semanas.push(s); }
    a.n++; mes.n++; s.n++;
    s.notas.push(n);
  });
  return anos;
}

// Set de chaves minimizadas com TUDO exceto o ano/mês/semana atuais.
function ntMinimizadasIniciais(notas, agora) {
  var cur = ntChavesDe(agora.toISOString());
  var atuais = {};
  atuais[cur.kA] = true; atuais[cur.kM] = true; atuais[cur.kS] = true;
  var set = new Set();
  notas.forEach(function (n) {
    var k = ntChavesDe(n.created_at);
    [k.kA, k.kM, k.kS].forEach(function (x) { if (!atuais[x]) set.add(x); });
  });
  return set;
}

function ntLixoVencido(n, agora) {
  if (!n.deleted_at) return false;
  return agora.getTime() - new Date(n.deleted_at).getTime() > NT_DIAS_LIXO * 86400000;
}
function ntResumo(txt) {
  var s = String(txt || '').replace(/\s+/g, ' ').trim();
  return s.length > 110 ? s.slice(0, 110).trim() + '…' : s;
}
function ntDataFmt(iso) {
  var d = new Date(iso);
  var p = function (x) { return (x < 10 ? '0' : '') + x; };
  return p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear() + ' · ' + p(d.getHours()) + ':' + p(d.getMinutes());
}

// ── COMPONENTES (todos ao nível do módulo) ──────────────────────────
function NtBtn(p) {
  var kind = p.kind || 'accent';
  var bg = kind === 'accent' ? NT_ACENTO : kind === 'danger' ? T.red : T.surface2;
  var cor = kind === 'ghost' ? T.text : '#fff';
  return React.createElement('button', {
    onClick: p.onClick,
    disabled: !!p.disabled,
    style: {
      background: bg, color: cor, border: kind === 'ghost' ? '1px solid ' + T.border : 'none',
      borderRadius: 12, padding: p.small ? '8px 12px' : '13px 18px', fontSize: p.small ? 13 : 15,
      fontWeight: 800, cursor: p.disabled ? 'default' : 'pointer', opacity: p.disabled ? 0.55 : 1,
      flex: p.flex ? 1 : undefined
    }
  }, p.children);
}

function NtCartaoDono(p) {
  return React.createElement('button', {
    onClick: p.onClick,
    style: {
      display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
      background: T.surface, border: '2px solid ' + NT_ACENTO, borderRadius: 18, padding: '18px 16px',
      cursor: 'pointer', color: T.text, marginBottom: 12
    }
  },
    React.createElement('span', { style: { fontSize: 34 } }, p.emoji),
    React.createElement('span', { style: { flex: 1 } },
      React.createElement('div', { style: { fontSize: 20, fontWeight: 900 } }, p.nome),
      React.createElement('div', { style: { fontSize: 12, color: T.muted, marginTop: 3, fontWeight: 600 } }, p.sub)
    ),
    React.createElement('span', { style: { color: NT_ACENTO, fontSize: 26, fontWeight: 900 } }, '›')
  );
}

function NtGrupoCab(p) {
  var tam = p.nivel === 0 ? 20 : p.nivel === 1 ? 16 : 13;
  return React.createElement('button', {
    onClick: p.onToggle,
    style: {
      display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left',
      background: p.nivel === 0 ? NT_ACENTO : 'transparent', color: p.nivel === 0 ? '#fff' : T.text,
      border: 'none', borderBottom: p.nivel === 0 ? 'none' : '1px solid ' + T.border,
      borderRadius: p.nivel === 0 ? 12 : 0, padding: p.nivel === 0 ? '10px 14px' : '8px 4px',
      marginTop: p.nivel === 0 ? 14 : 8, marginLeft: p.nivel * 10, cursor: 'pointer',
      width: 'calc(100% - ' + (p.nivel * 10) + 'px)'
    }
  },
    React.createElement('span', { style: { fontSize: 12, width: 14 } }, p.minimizado ? '▶' : '▼'),
    React.createElement('span', { style: { flex: 1, fontWeight: 900, fontSize: tam } }, p.label),
    React.createElement('span', { style: { fontSize: 12, fontWeight: 700, opacity: 0.8 } }, p.count)
  );
}

function NtLinha(p) {
  var n = p.nota;
  var resumo = ntResumo(n.texto);
  return React.createElement('button', {
    onClick: function () { p.onOpen(n); },
    style: {
      display: 'block', width: 'calc(100% - ' + (p.recuo || 0) + 'px)', marginLeft: p.recuo || 0, textAlign: 'left',
      background: T.surface, border: '1px solid ' + T.border, borderLeft: '5px solid ' + NT_ACENTO,
      borderRadius: 12, padding: '11px 13px', marginTop: 8, cursor: 'pointer', color: T.text
    }
  },
    React.createElement('div', { style: { fontSize: 17, fontWeight: 900, lineHeight: 1.25, wordBreak: 'break-word' } }, n.titulo),
    React.createElement('div', { style: { fontSize: 11, color: T.muted, marginTop: 3, fontWeight: 700 } }, ntDataFmt(n.created_at)),
    resumo ? React.createElement('div', { style: { fontSize: 13, color: T.muted, marginTop: 4, lineHeight: 1.35, wordBreak: 'break-word' } }, resumo) : null
  );
}

// Lista Ano > Mês > Semana. Só é montada depois de as notas carregarem, para o
// useState inicial já poder calcular o Set de minimizadas (tudo menos o atual).
function NtLista(p) {
  var _s = React.useState(function () { return ntMinimizadasIniciais(p.notas, new Date()); });
  var minim = _s[0], setMinim = _s[1];
  var toggle = function (key) {
    setMinim(function (prev) {
      var next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };
  var anos = ntAgrupar(p.notas);
  var filhos = [];
  anos.forEach(function (a) {
    var aMin = minim.has(a.key);
    filhos.push(React.createElement(NtGrupoCab, { key: a.key, nivel: 0, label: a.label, count: a.n, minimizado: aMin, onToggle: function () { toggle(a.key); } }));
    if (aMin) return;
    a.meses.forEach(function (m) {
      var mMin = minim.has(m.key);
      filhos.push(React.createElement(NtGrupoCab, { key: m.key, nivel: 1, label: m.label, count: m.n, minimizado: mMin, onToggle: function () { toggle(m.key); } }));
      if (mMin) return;
      m.semanas.forEach(function (s) {
        var sMin = minim.has(s.key);
        filhos.push(React.createElement(NtGrupoCab, { key: s.key, nivel: 2, label: s.label, count: s.n, minimizado: sMin, onToggle: function () { toggle(s.key); } }));
        if (sMin) return;
        s.notas.forEach(function (n) {
          filhos.push(React.createElement(NtLinha, { key: n.id, nota: n, recuo: 20, onOpen: p.onOpen }));
        });
      });
    });
  });
  if (!anos.length) {
    return React.createElement('div', { style: { textAlign: 'center', color: T.muted, padding: '40px 10px', fontSize: 14, fontWeight: 600 } },
      p.readOnly ? 'Sem notas.' : 'Ainda não há notas. Toca em “+ Nova nota”.');
  }
  return React.createElement('div', null, filhos);
}

function NtLixoLista(p) {
  if (!p.notas.length) {
    return React.createElement('div', { style: { textAlign: 'center', color: T.muted, padding: '40px 10px', fontSize: 14, fontWeight: 600 } }, 'O Lixo está vazio.');
  }
  return React.createElement('div', null,
    React.createElement('div', { style: { fontSize: 12, color: T.muted, fontWeight: 600, marginBottom: 4 } },
      'As notas no Lixo há mais de ' + NT_DIAS_LIXO + ' dias são apagadas definitivamente.'),
    p.notas.map(function (n) {
      return React.createElement('div', { key: n.id, style: { background: T.surface, border: '1px solid ' + T.border, borderLeft: '5px solid ' + T.muted, borderRadius: 12, padding: '11px 13px', marginTop: 8 } },
        React.createElement('div', { style: { fontSize: 16, fontWeight: 900, wordBreak: 'break-word' } }, n.titulo),
        React.createElement('div', { style: { fontSize: 11, color: T.muted, marginTop: 3, fontWeight: 700 } }, 'Apagada em ' + ntDataFmt(n.deleted_at)),
        ntResumo(n.texto) ? React.createElement('div', { style: { fontSize: 13, color: T.muted, marginTop: 4, wordBreak: 'break-word' } }, ntResumo(n.texto)) : null,
        p.readOnly ? null : React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 10 } },
          React.createElement(NtBtn, { small: true, flex: true, disabled: p.busyId === n.id, onClick: function () { p.onRestaurar(n); } }, 'Restaurar'),
          React.createElement(NtBtn, { small: true, flex: true, kind: 'danger', disabled: p.busyId === n.id, onClick: function () { p.onApagarDef(n); } }, 'Apagar de vez')
        )
      );
    })
  );
}

function NtVista(p) {
  var n = p.nota;
  return React.createElement('div', null,
    React.createElement('div', { style: { fontSize: 24, fontWeight: 900, lineHeight: 1.25, wordBreak: 'break-word', borderLeft: '6px solid ' + NT_ACENTO, paddingLeft: 12 } }, n.titulo),
    React.createElement('div', { style: { fontSize: 12, color: T.muted, marginTop: 8, fontWeight: 700 } },
      'Criada ' + ntDataFmt(n.created_at) + (n.updated_at && n.updated_at !== n.created_at ? ' · editada ' + ntDataFmt(n.updated_at) : '')),
    React.createElement('div', { style: { fontSize: 16, color: T.text, marginTop: 16, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' } }, n.texto || ''),
    p.readOnly ? null : React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 24 } },
      React.createElement(NtBtn, { flex: true, onClick: p.onEditar }, 'Editar'),
      React.createElement(NtBtn, { flex: true, kind: 'danger', disabled: p.busy, onClick: p.onApagar }, 'Apagar')
    )
  );
}

function NtForm(p) {
  var inp = {
    width: '100%', boxSizing: 'border-box', background: T.surface, color: T.text, border: '2px solid ' + T.border,
    borderRadius: 12, padding: '12px 13px', fontSize: 16, fontFamily: 'inherit', outline: 'none'
  };
  return React.createElement('div', null,
    React.createElement('div', { style: { fontSize: 13, fontWeight: 800, color: T.muted, marginBottom: 6 } }, 'Título'),
    React.createElement('input', {
      type: 'text', value: p.titulo, autoComplete: 'off', placeholder: 'Título da nota', maxLength: 200,
      onChange: function (e) { p.onTitulo(e.target.value); }, style: inp
    }),
    React.createElement('div', { style: { fontSize: 13, fontWeight: 800, color: T.muted, margin: '14px 0 6px' } }, 'Texto'),
    React.createElement('textarea', {
      value: p.texto, autoComplete: 'off', placeholder: 'Escreve aqui…', rows: 12,
      onChange: function (e) { p.onTexto(e.target.value); }, style: Object.assign({}, inp, { resize: 'vertical', lineHeight: 1.45 })
    }),
    p.erro ? React.createElement('div', { style: { color: T.red, fontSize: 13, fontWeight: 700, marginTop: 10 } }, p.erro) : null,
    React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 16 } },
      React.createElement(NtBtn, { flex: true, kind: 'ghost', disabled: p.saving, onClick: p.onCancelar }, 'Cancelar'),
      React.createElement(NtBtn, { flex: true, disabled: p.saving || !p.titulo.trim(), onClick: p.onGuardar }, p.saving ? 'A guardar…' : (p.editando ? 'Guardar alterações' : 'Criar nota'))
    )
  );
}

// ── APP ─────────────────────────────────────────────────────────────
function NotasApp(props) {
  var onBack = props.onBack, profile = props.profile || {};
  var myId = profile.member_id || '';
  var isAdmin = !!profile.is_admin;
  var donos = ntDonosVisiveis(myId, isAdmin);
  var donosKey = donos.join(',');

  var _n = React.useState([]); var notas = _n[0], setNotas = _n[1];
  var _l = React.useState(true); var loading = _l[0], setLoading = _l[1];
  var _e = React.useState(''); var erroCarga = _e[0], setErroCarga = _e[1];
  var _c = React.useState(NT_MEMBROS.indexOf(myId) !== -1 ? myId : null); var cartao = _c[0], setCartao = _c[1]; // entra automático no seu
  var _v = React.useState('lista'); var vista = _v[0], setVista = _v[1]; // lista | nota | form | lixo
  var _sel = React.useState(null); var selId = _sel[0], setSelId = _sel[1];
  var _ed = React.useState(null); var editId = _ed[0], setEditId = _ed[1];
  var _ft = React.useState(''); var fTitulo = _ft[0], setFTitulo = _ft[1];
  var _fx = React.useState(''); var fTexto = _fx[0], setFTexto = _fx[1];
  var _fe = React.useState(''); var fErro = _fe[0], setFErro = _fe[1];
  var _sv = React.useState(false); var saving = _sv[0], setSaving = _sv[1];
  var _bz = React.useState(null); var busyId = _bz[0], setBusyId = _bz[1];
  var savingRef = React.useRef(false);
  var busyRef = React.useRef({});
  var purgaFeita = React.useRef(false);
  var carregarRef = React.useRef(null);

  var db = window.supabaseClient;

  function carregar() {
    if (!db) { setErroCarga('Sem ligação ao servidor.'); setLoading(false); return; }
    db.from('notas_notas').select('*').in('dono', donos).order('created_at', { ascending: false }).then(function (res) {
      if (res && res.error) {
        ntAvisarRes('carregar notas', res.error);
        setErroCarga('Não foi possível carregar as notas.');
        setLoading(false);
        return;
      }
      var rows = (res && res.data) || [];
      setNotas(rows);
      setErroCarga('');
      setLoading(false);
      purgar(rows);
    }).catch(function (e) {
      ntAvisar('carregar notas', e);
      setErroCarga('Não foi possível carregar as notas.');
      setLoading(false);
    });
  }
  carregarRef.current = carregar;

  // Ao abrir a app: apaga de vez, por id, as do Lixo há mais de 30 dias (só as do próprio e da Família).
  function purgar(rows) {
    if (purgaFeita.current || !db) return;
    purgaFeita.current = true;
    var agora = new Date();
    var ids = rows.filter(function (n) { return ntLixoVencido(n, agora) && ntPodeEditar(n.dono, myId); }).map(function (n) { return n.id; });
    if (!ids.length) return;
    db.from('notas_notas').delete().in('id', ids).then(function (res) {
      if (res && res.error) { ntAvisarRes('limpar Lixo antigo', res.error); return; }
      setNotas(function (prev) { return prev.filter(function (n) { return ids.indexOf(n.id) === -1; }); });
    }).catch(function (e) { ntAvisar('limpar Lixo antigo', e); });
  }

  React.useEffect(function () { carregarRef.current(); }, [donosKey]);
  React.useEffect(function () { return window.csAoVoltarRede(function () { carregarRef.current(); }); }, []);

  var podeEditar = cartao ? ntPodeEditar(cartao, myId) : false;
  var doCartao = cartao ? notas.filter(function (n) { return n.dono === cartao; }) : [];
  var ativas = doCartao.filter(ntAtiva);
  var lixo = doCartao.filter(function (n) { return !ntAtiva(n); }).sort(function (a, b) { return new Date(b.deleted_at) - new Date(a.deleted_at); });
  var notaSel = null;
  if (selId) { for (var i = 0; i < notas.length; i++) { if (notas[i].id === selId) { notaSel = notas[i]; break; } } }

  function abrirNova() {
    if (!podeEditar) return;
    setEditId(null); setFTitulo(''); setFTexto(''); setFErro(''); setVista('form');
  }
  function abrirEditar(n) {
    if (!ntPodeEditar(n.dono, myId)) return;
    setEditId(n.id); setFTitulo(n.titulo); setFTexto(n.texto || ''); setFErro(''); setVista('form');
  }
  function cancelarForm() {
    if (savingRef.current) return;
    setFErro('');
    setVista(editId && notaSel ? 'nota' : 'lista');
  }

  // Gravar (criar/editar) pelo molde addEvent da Família: trava contra duplo-submit,
  // atualização otimista, removeOptimistic(), .then(res) com revert em erro SEM fechar
  // nem limpar o formulário, depois .catch(). Só no sucesso limpa e fecha.
  function guardar() {
    var titulo = fTitulo.trim();
    if (!titulo) return;
    if (savingRef.current) return;
    if (!cartao || !ntPodeEditar(cartao, myId)) return;
    if (!db) { setFErro('Sem ligação ao servidor — não foi guardado.'); return; }
    savingRef.current = true;
    setSaving(true);
    setFErro('');
    var agoraIso = new Date().toISOString();
    var anterior = null;
    var removeOptimistic;
    var consulta;
    if (editId) {
      var idEd = editId;
      for (var j = 0; j < notas.length; j++) { if (notas[j].id === idEd) { anterior = notas[j]; break; } }
      if (!anterior) { savingRef.current = false; setSaving(false); return; }
      var patch = { titulo: titulo, texto: fTexto, updated_at: agoraIso };
      setNotas(function (p) { return p.map(function (n) { return n.id === idEd ? Object.assign({}, n, patch) : n; }); });
      removeOptimistic = function () {
        setNotas(function (p) { return p.map(function (n) { return n.id === idEd ? anterior : n; }); });
      };
      consulta = db.from('notas_notas').update(patch).eq('id', idEd);
    } else {
      var nova = { id: ntNovoId(), dono: cartao, titulo: titulo, texto: fTexto, created_at: agoraIso, updated_at: agoraIso, deleted_at: null };
      setNotas(function (p) { return [nova].concat(p); });
      removeOptimistic = function () {
        setNotas(function (p) { return p.filter(function (n) { return n.id !== nova.id; }); });
      };
      consulta = db.from('notas_notas').insert({ id: nova.id, dono: nova.dono, titulo: nova.titulo, texto: nova.texto, created_at: agoraIso, updated_at: agoraIso });
    }
    var ok = false;
    consulta.then(function (res) {
      savingRef.current = false;
      setSaving(false);
      if (res && res.error) {
        ntAvisarRes(editId ? 'editar nota' : 'criar nota', res.error);
        setFErro('Erro ao guardar: ' + res.error.message);
        removeOptimistic();
        return;
      }
      ok = true;
      setFErro('');
      setFTitulo(''); setFTexto('');
      var idFinal = editId;
      setEditId(null);
      setVista(idFinal ? 'nota' : 'lista');
      carregarRef.current();
    }).catch(function (e) {
      savingRef.current = false;
      setSaving(false);
      if (ok) { ntLog('depois de guardar', e); return; }
      ntAvisar(editId ? 'editar nota' : 'criar nota', e);
      setFErro('Erro de ligação: ' + ((e && e.message) || String(e)));
      removeOptimistic();
    });
  }

  // Atualização por id (apagar para o Lixo / restaurar), otimista, com reverter.
  function mudarDeletedAt(n, valor, op, depois) {
    if (!ntPodeEditar(n.dono, myId)) return;
    if (!db || busyRef.current[n.id]) return;
    busyRef.current[n.id] = true; setBusyId(n.id);
    setNotas(function (p) { return p.map(function (x) { return x.id === n.id ? Object.assign({}, x, { deleted_at: valor }) : x; }); });
    var reverter = function () { setNotas(function (p) { return p.map(function (x) { return x.id === n.id ? n : x; }); }); };
    var ok = false;
    db.from('notas_notas').update({ deleted_at: valor }).eq('id', n.id).then(function (res) {
      busyRef.current[n.id] = false; setBusyId(null);
      if (res && res.error) { ntAvisarRes(op, res.error); reverter(); return; }
      ok = true;
      if (depois) depois();
    }).catch(function (e) {
      busyRef.current[n.id] = false; setBusyId(null);
      if (ok) { ntLog('depois de ' + op, e); return; }
      ntAvisar(op, e); reverter();
    });
  }
  function apagarParaLixo(n) {
    mudarDeletedAt(n, new Date().toISOString(), 'apagar nota', function () { setSelId(null); setVista('lista'); });
  }
  function restaurar(n) { mudarDeletedAt(n, null, 'restaurar nota'); }

  function apagarDefinitivo(n) {
    if (!ntPodeEditar(n.dono, myId)) return;
    if (!db || busyRef.current[n.id]) return;
    if (typeof window.confirm === 'function' && !window.confirm('Apagar “' + n.titulo + '” de vez? Não dá para desfazer.')) return;
    busyRef.current[n.id] = true; setBusyId(n.id);
    setNotas(function (p) { return p.filter(function (x) { return x.id !== n.id; }); });
    var reverter = function () { setNotas(function (p) { return [n].concat(p); }); };
    var ok = false;
    db.from('notas_notas').delete().eq('id', n.id).then(function (res) {
      busyRef.current[n.id] = false; setBusyId(null);
      if (res && res.error) { ntAvisarRes('apagar nota de vez', res.error); reverter(); return; }
      ok = true;
    }).catch(function (e) {
      busyRef.current[n.id] = false; setBusyId(null);
      if (ok) { ntLog('depois de apagar de vez', e); return; }
      ntAvisar('apagar nota de vez', e); reverter();
    });
  }

  function abrirNota(n) { setSelId(n.id); setVista('nota'); }
  function voltar() {
    if (!cartao) { onBack(); return; }
    if (vista === 'form') { cancelarForm(); return; }
    if (vista === 'nota' || vista === 'lixo') { setSelId(null); setVista('lista'); return; }
    setCartao(null);
  }

  var titulo = 'Notas Carvalho';
  if (cartao) {
    titulo = (cartao === myId && profile.display_name ? profile.display_name : NT_NOMES[cartao]) + (vista === 'lixo' ? ' · Lixo' : '');
  }
  var direita = null;
  if (cartao && vista === 'lista') {
    direita = React.createElement('button', {
      onClick: function () { setVista('lixo'); },
      style: { background: 'none', border: '1px solid ' + T.border, color: T.text, borderRadius: 10, padding: '6px 10px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }
    }, '🗑 Lixo' + (lixo.length ? ' (' + lixo.length + ')' : ''));
  }

  var corpo;
  if (loading) {
    corpo = React.createElement('div', { style: { textAlign: 'center', color: T.muted, padding: 40, fontWeight: 700 } }, 'A carregar…');
  } else if (erroCarga && !notas.length) {
    corpo = React.createElement('div', { style: { textAlign: 'center', padding: 30 } },
      React.createElement('div', { style: { color: T.red, fontWeight: 800, marginBottom: 14 } }, erroCarga),
      React.createElement(NtBtn, { onClick: function () { setLoading(true); carregar(); } }, 'Tentar outra vez'));
  } else if (!cartao) {
    corpo = React.createElement('div', null,
      donos.map(function (d) {
        var n = notas.filter(function (x) { return x.dono === d && ntAtiva(x); }).length;
        var nome = d === myId && profile.display_name ? profile.display_name : NT_NOMES[d];
        var sub = (d === myId ? 'As minhas notas' : d === 'familia' ? 'Partilhadas por todos' : 'Só leitura') + ' · ' + n + (n === 1 ? ' nota' : ' notas');
        return React.createElement(NtCartaoDono, { key: d, emoji: NT_EMOJIS[d], nome: nome, sub: sub, onClick: function () { setVista('lista'); setSelId(null); setCartao(d); } });
      }));
  } else if (vista === 'form') {
    corpo = React.createElement(NtForm, {
      titulo: fTitulo, texto: fTexto, erro: fErro, saving: saving, editando: !!editId,
      onTitulo: setFTitulo, onTexto: setFTexto, onGuardar: guardar, onCancelar: cancelarForm
    });
  } else if (vista === 'nota') {
    corpo = notaSel && ntAtiva(notaSel)
      ? React.createElement(NtVista, { nota: notaSel, readOnly: !podeEditar, busy: busyId === notaSel.id, onEditar: function () { abrirEditar(notaSel); }, onApagar: function () { apagarParaLixo(notaSel); } })
      : React.createElement('div', { style: { color: T.muted, textAlign: 'center', padding: 30 } }, 'Nota não encontrada.');
  } else if (vista === 'lixo') {
    corpo = React.createElement(NtLixoLista, { notas: lixo, readOnly: !podeEditar, busyId: busyId, onRestaurar: restaurar, onApagarDef: apagarDefinitivo });
  } else {
    corpo = React.createElement('div', null,
      podeEditar ? React.createElement(NtBtn, { onClick: abrirNova }, '+ Nova nota') : React.createElement('div', { style: { fontSize: 12, color: T.muted, fontWeight: 700 } }, '👁 Só leitura'),
      React.createElement(NtLista, { key: cartao, notas: ativas, readOnly: !podeEditar, onOpen: abrirNota }));
  }

  return React.createElement('div', { style: Object.assign({}, wrap, { paddingBottom: 60 }) },
    React.createElement(TopBar, { onBack: voltar, title: titulo, right: direita }),
    React.createElement('div', { style: { padding: '16px 16px 0', maxWidth: 640, margin: '0 auto' } }, corpo)
  );
}
