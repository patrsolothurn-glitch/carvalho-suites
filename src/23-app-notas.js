// ══════════════════════════════════════════════════════════════════
// APP NOTAS CARVALHO — Notas da família. Tabela public.notas_notas
// (ver sql/33_notas_notas.sql). Cada pessoa tem o seu cartão + o cartão
// "Família" (partilhado por quem tem a app). O admin vê ainda os cartões
// da Cristina (esposa), do Lucas e do Liam, SÓ LEITURA (ver sql/34).
// A RLS é que manda — o código só espelha-a (esconde botões).
// Organização: Ano > Mês > Semana ISO (por created_at), tudo minimizável;
// por omissão só o ano/mês/semana atuais ficam abertos.
// Apagar = Lixo (deleted_at); Lixo por cartão com restaurar e apagar
// definitivo; no Lixo há mais de 30 dias apaga-se definitivamente ao abrir
// (só as do próprio e da Família). Componentes todos ao nível do módulo.
// Cada nota tem importância (normal/importante/urgente) e pode ser fixada (sql/35); a lista tem
// copiar, pesquisa, vistas (por data / por importância) e filtros — tudo só estado do ecrã, sem
// pedidos ao Supabase. Só fixar e mudar a importância gravam, e só a coluna alterada, por id.
// ══════════════════════════════════════════════════════════════════

var NT_ACENTO = '#EC4899';
var NT_DIAS_LIXO = 30;
var NT_NOMES = { patricio: 'Patricio', esposa: 'Cristina', lucas: 'Lucas', liam: 'Liam', familia: 'Família' };
var NT_EMOJIS = { patricio: '👨‍💼', esposa: '👩', lucas: '🧒', liam: '👦', familia: '🏠' };
var NT_MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
var NT_MEMBROS = ['patricio', 'esposa', 'lucas', 'liam'];
// Importância (colunas importancia/fixada: sql/35). Cor E texto/ícone, nunca só a cor.
var NT_URGENTE = '#DC2626';
var NT_IMPORTANTE = '#F97316';
var NT_IMP = {
  normal: { rot: 'Normal', icone: '○', cor: NT_ACENTO, fundo: null, texto: null },
  importante: { rot: 'Importante', icone: '▲', cor: NT_IMPORTANTE, fundo: NT_IMPORTANTE, texto: '#1A0F00' },
  urgente: { rot: 'Urgente', icone: '❗', cor: NT_URGENTE, fundo: NT_URGENTE, texto: '#FFFFFF' }
};
var NT_IMP_ORDEM = ['urgente', 'importante', 'normal'];
var NT_VISTA_KEY = 'notas_vista';
var NT_FILTROS_VAZIOS = { imp: 'todas', datas: 'todas', de: '', ate: '', fix: false };
// Na vista "Por data": com menos notas visíveis do que isto (depois de pesquisa e filtros) a lista é direta,
// da mais recente para a mais antiga, sem cabeçalhos Ano > Mês > Semana. Com este número ou mais, agrupa.
var NT_LIMITE_LISTA = 15;

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

// Cartões que a pessoa pode ver (a RLS decide o resto). Admin: próprio, Família, Cristina, Lucas, Liam
// (os três últimos só leitura). Quem não é admin nunca vê o cartão de outra pessoa.
function ntDonosVisiveis(myId, isAdmin) {
  var out = [];
  if (NT_MEMBROS.indexOf(myId) !== -1) out.push(myId);
  out.push('familia');
  if (isAdmin) {
    ['esposa', 'lucas', 'liam'].forEach(function (k) { if (out.indexOf(k) === -1) out.push(k); });
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

// Notas antigas (sem coluna / null) tratam-se como 'normal' e não fixada.
function ntImp(n) {
  var v = n && n.importancia;
  return v === 'importante' || v === 'urgente' ? v : 'normal';
}
function ntFixada(n) { return !!(n && n.fixada === true); }
function ntPorDataDesc(a, b) { return new Date(b.created_at) - new Date(a.created_at); }

// Pesquisa: sem maiúsculas nem acentos; todas as palavras têm de aparecer (título + texto).
function ntNorm(s) {
  var t = String(s == null ? '' : s);
  try { t = t.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) {}
  return t.toLowerCase();
}
function ntDiaLocal(d) {
  var p = function (x) { return (x < 10 ? '0' : '') + x; };
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}
function ntFiltrosAtivos(f, busca) {
  return f.imp !== 'todas' || f.datas !== 'todas' || !!f.fix || !!String(busca || '').trim();
}
// Filtro de datas sobre created_at (hora local). Semana = segunda a domingo.
function ntPassaData(n, f, agora) {
  var d = new Date(n.created_at);
  if (f.datas === 'hoje') return ntDiaLocal(d) === ntDiaLocal(agora);
  if (f.datas === 'semana') {
    var ini = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - ((agora.getDay() + 6) % 7));
    var fim = new Date(ini.getFullYear(), ini.getMonth(), ini.getDate() + 7);
    return d >= ini && d < fim;
  }
  if (f.datas === 'mes') return d.getFullYear() === agora.getFullYear() && d.getMonth() === agora.getMonth();
  if (f.datas === 'ano') return d.getFullYear() === agora.getFullYear();
  if (f.datas === 'escolher') {
    var de = f.de || '', ate = f.ate || '';
    if (de && ate && de > ate) { var t = de; de = ate; ate = t; }
    var dia = ntDiaLocal(d);
    if (de && dia < de) return false;
    if (ate && dia > ate) return false;
  }
  return true;
}
function ntFiltrar(notas, f, busca, agora) {
  var palavras = ntNorm(busca).split(/\s+/).filter(Boolean);
  return notas.filter(function (n) {
    if (f.imp !== 'todas' && ntImp(n) !== f.imp) return false;
    if (f.fix && !ntFixada(n)) return false;
    if (!ntPassaData(n, f, agora)) return false;
    if (palavras.length) {
      var h = ntNorm((n.titulo || '') + ' ' + (n.texto || ''));
      for (var i = 0; i < palavras.length; i++) { if (h.indexOf(palavras[i]) === -1) return false; }
    }
    return true;
  });
}
// A vista escolhida fica só neste aparelho; sem localStorage (ou a falhar) a app funciona na mesma.
function ntLerVista() {
  try { return window.localStorage.getItem(NT_VISTA_KEY) === 'imp' ? 'imp' : 'data'; } catch (e) { return 'data'; }
}
function ntGuardarVista(v) {
  try { window.localStorage.setItem(NT_VISTA_KEY, v); } catch (e) {}
}
function ntRolarPara(id) {
  var el = typeof document !== 'undefined' ? document.getElementById(id) : null;
  if (el && typeof el.scrollIntoView === 'function') {
    try { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { el.scrollIntoView(); }
  } else if (id === 'nt-topo' && typeof window.scrollTo === 'function') {
    try { window.scrollTo(0, 0); } catch (e2) {}
  }
}

// Texto copiado: título, linha em branco e o texto inteiro. Sem texto, só o título.
function ntTextoParaCopiar(n) {
  var titulo = String(n.titulo || '');
  var texto = String(n.texto || '');
  return texto.trim() ? titulo + '\n\n' + texto : titulo;
}
// Plano B (PWA instalada / sem navigator.clipboard): textarea escondido + execCommand('copy').
// Devolve true só se o navegador confirmou a cópia.
function ntCopiarPlanoB(texto) {
  var ta = null, ok = false;
  try {
    ta = document.createElement('textarea');
    ta.value = texto;
    ta.setAttribute('readonly', '');
    ta.setAttribute('aria-hidden', 'true');
    ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:0;opacity:0;font-size:16px;';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, texto.length);
    ok = !!document.execCommand('copy');
  } catch (e) {
    ok = false;
  }
  if (ta && ta.parentNode) ta.parentNode.removeChild(ta);
  return ok;
}
// Devolve uma Promise: resolve só se copiou mesmo; rejeita se os dois caminhos falharem.
function ntCopiarTexto(texto) {
  var falhaPlanoB = function (primeiro) {
    return Promise.reject(primeiro || new Error('Não foi possível copiar para a área de transferência.'));
  };
  var nav = typeof navigator !== 'undefined' ? navigator : null;
  if (nav && nav.clipboard && typeof nav.clipboard.writeText === 'function') {
    var p;
    try { p = nav.clipboard.writeText(texto); } catch (e) { p = Promise.reject(e); }
    return Promise.resolve(p).catch(function (err) {
      return ntCopiarPlanoB(texto) ? undefined : falhaPlanoB(err);
    });
  }
  return ntCopiarPlanoB(texto) ? Promise.resolve() : falhaPlanoB();
}

// Hook de copiar (módulo): feedback ✓ ~1,5 s; se falhar tudo, window.mostrarErro('Notas', err) e nunca finge.
function ntUseCopia() {
  var _f = React.useState(false); var feito = _f[0], setFeito = _f[1];
  var timer = React.useRef(null);
  React.useEffect(function () { return function () { if (timer.current) clearTimeout(timer.current); }; }, []);
  var marcar = function () {
    setFeito(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(function () { timer.current = null; setFeito(false); }, 1500);
  };
  var falhar = function (err) {
    setFeito(false);
    ntLog('copiar a nota', err);
    if (typeof window.mostrarErro === 'function') window.mostrarErro('Notas', err);
  };
  var copiar = function (n) { return ntCopiarTexto(ntTextoParaCopiar(n)).then(marcar, falhar); };
  return { feito: feito, copiar: copiar };
}
// Partilhar: navigator.share (título + texto); sem ele (ou se falhar) cai para copiar. Não grava nada.
function ntPartilhar(n, cp) {
  var nav = typeof navigator !== 'undefined' ? navigator : null;
  if (!nav || typeof nav.share !== 'function') return cp.copiar(n);
  var pr;
  try { pr = nav.share({ title: String(n.titulo || ''), text: String(n.texto || '').trim() ? String(n.texto) : String(n.titulo || '') }); } catch (e) { pr = Promise.reject(e); }
  return Promise.resolve(pr).catch(function (err) {
    if (err && err.name === 'AbortError') return undefined; // a pessoa fechou a folha de partilha
    return cp.copiar(n);
  });
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

// Botão de copiar a nota (lista e Lixo). Não grava nada nem fala com o Supabase.
function NtCopiar(p) {
  var cp = ntUseCopia();
  var feito = cp.feito;
  return React.createElement('button', {
    type: 'button',
    onClick: function (e) { if (e && e.stopPropagation) e.stopPropagation(); cp.copiar(p.nota); },
    'aria-label': feito ? 'Nota copiada' : 'Copiar a nota',
    title: feito ? 'Nota copiada' : 'Copiar a nota',
    style: {
      position: 'absolute', top: 4, right: 4, width: 44, height: 44, boxSizing: 'border-box',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
      background: feito ? NT_ACENTO : T.surface2, color: feito ? '#fff' : NT_ACENTO,
      border: '2px solid ' + NT_ACENTO, borderRadius: 12, fontSize: feito ? 22 : 20, fontWeight: 900,
      lineHeight: 1, cursor: 'pointer'
    }
  }, feito ? '✓' : '📋');
}

// Etiqueta de importância: cor + ícone + texto.
function NtBadge(p) {
  var d = NT_IMP[p.imp] || NT_IMP.normal;
  if (!d.texto) return null; // "Normal" não tem selo: só Importante e Urgente (o formulário continua a oferecer os três)
  return React.createElement('span', {
    style: {
      display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, lineHeight: 1,
      padding: '3px 8px', borderRadius: 999, background: d.fundo, color: d.texto, border: '1px solid ' + d.fundo
    }
  }, d.icone + ' ' + d.rot);
}

// Botão-pílula (vistas, filtros, importância no formulário).
function NtChip(p) {
  var cor = p.cor || NT_ACENTO;
  return React.createElement('button', {
    type: 'button',
    onClick: p.onClick,
    'aria-pressed': !!p.ativo,
    disabled: !!p.disabled,
    style: {
      minHeight: 38, padding: '6px 12px', borderRadius: 999, fontSize: 13, fontWeight: 800, cursor: p.disabled ? 'default' : 'pointer',
      flex: p.grow ? 1 : undefined, background: p.ativo ? cor : T.surface2, color: p.ativo ? (p.corTexto || '#fff') : T.text,
      border: '1px solid ' + (p.ativo ? cor : T.border)
    }
  }, p.children);
}

// Vista, pesquisa e filtros (só estado do ecrã: NUNCA grava nem pede nada ao Supabase).
function NtFiltros(p) {
  var f = p.filtros;
  // Os filtros ficam recolhidos por omissão (num telemóvel ocupam muito); abrem sozinhos se já houver filtros ativos.
  var _a = React.useState(!!p.filtrando); var aberto = _a[0], setAberto = _a[1];
  var nAtivos = (f.imp !== 'todas' ? 1 : 0) + (f.datas !== 'todas' ? 1 : 0) + (f.fix ? 1 : 0);
  var set = function (campo, valor) { var n = Object.assign({}, f); n[campo] = valor; p.onFiltros(n); };
  var inp = {
    boxSizing: 'border-box', background: T.surface, color: T.text, border: '2px solid ' + T.border,
    borderRadius: 12, padding: '10px 12px', fontSize: 16, fontFamily: 'inherit', outline: 'none', minWidth: 0
  };
  var linha = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 8 };
  var rot = { fontSize: 12, fontWeight: 800, color: T.muted, marginRight: 2 };
  var chipImp = function (k, txt, cor, corTexto) {
    return React.createElement(NtChip, { key: k, ativo: f.imp === k, cor: cor, corTexto: corTexto, onClick: function () { set('imp', k); } }, txt);
  };
  var datas = [['todas', 'Todas'], ['hoje', 'Hoje'], ['semana', 'Esta semana'], ['mes', 'Este mês'], ['ano', 'Este ano'], ['escolher', 'Escolher datas']];
  return React.createElement('div', null,
    React.createElement('div', { style: { display: 'flex', gap: 6, marginTop: 12 } },
      React.createElement(NtChip, { grow: true, ativo: p.modo === 'data', onClick: function () { p.onModo('data'); } }, 'Por data'),
      React.createElement(NtChip, { grow: true, ativo: p.modo === 'imp', onClick: function () { p.onModo('imp'); } }, 'Por importância')
    ),
    React.createElement('div', { style: { position: 'relative', marginTop: 10 } },
      React.createElement('input', {
        type: 'text', value: p.busca, autoComplete: 'off', placeholder: 'Pesquisar no título e no texto…', 'aria-label': 'Pesquisar notas',
        onChange: function (e) { p.onBusca(e.target.value); }, style: Object.assign({}, inp, { width: '100%', paddingRight: 48 })
      }),
      p.busca ? React.createElement('button', {
        type: 'button', 'aria-label': 'Limpar pesquisa', onClick: function () { p.onBusca(''); },
        style: { position: 'absolute', top: 3, right: 3, width: 40, height: 40, borderRadius: 10, border: 'none', background: 'transparent', color: T.text, fontSize: 18, fontWeight: 900, cursor: 'pointer' }
      }, '✕') : null
    ),
    React.createElement('div', { style: linha },
      React.createElement('button', {
        type: 'button', 'aria-expanded': aberto, onClick: function () { setAberto(!aberto); },
        style: { minHeight: 38, padding: '6px 12px', borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: 'pointer', background: nAtivos ? NT_ACENTO : T.surface2, color: nAtivos ? '#fff' : T.text, border: '1px solid ' + (nAtivos ? NT_ACENTO : T.border) }
      }, 'Filtros ' + (aberto ? '▴' : '▾') + (nAtivos ? ' (' + nAtivos + ')' : ''))
    ),
    aberto ? React.createElement('div', { style: linha },
      React.createElement('span', { style: rot }, 'Importância:'),
      chipImp('todas', 'Todas', NT_ACENTO, '#fff'),
      chipImp('importante', '▲ Importante', NT_IMPORTANTE, '#1A0F00'),
      chipImp('urgente', '❗ Urgente', NT_URGENTE, '#fff')
    ) : null,
    aberto ? React.createElement('div', { style: linha },
      React.createElement('span', { style: rot }, 'Datas:'),
      datas.map(function (d) {
        return React.createElement(NtChip, { key: d[0], ativo: f.datas === d[0], onClick: function () { set('datas', d[0]); } }, d[1]);
      })
    ) : null,
    aberto && f.datas === 'escolher' ? React.createElement('div', { style: linha },
      React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: T.muted } }, 'De',
        React.createElement('input', { type: 'date', value: f.de, autoComplete: 'off', 'aria-label': 'Data inicial', onChange: function (e) { set('de', e.target.value); }, style: Object.assign({}, inp, { width: 150 }) })),
      React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: T.muted } }, 'até',
        React.createElement('input', { type: 'date', value: f.ate, autoComplete: 'off', 'aria-label': 'Data final', onChange: function (e) { set('ate', e.target.value); }, style: Object.assign({}, inp, { width: 150 }) }))
    ) : null,
    aberto ? React.createElement('div', { style: linha },
      React.createElement(NtChip, { ativo: !!f.fix, onClick: function () { set('fix', !f.fix); } }, '📌 Só fixadas')
    ) : null,
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 10 } },
      React.createElement('span', { 'aria-live': 'polite', style: { fontSize: 13, fontWeight: 700, color: T.muted } },
        p.filtrando
          ? p.mostradas + (p.mostradas === 1 ? ' nota coincide' : ' notas coincidem') + ' (de ' + p.total + ')'
          : p.total + (p.total === 1 ? ' nota' : ' notas')),
      p.filtrando ? React.createElement(NtBtn, { small: true, kind: 'ghost', onClick: p.onLimpar }, 'Limpar filtros') : null
    )
  );
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
    id: p.id,
    onClick: p.onToggle,
    style: {
      display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', scrollMarginTop: 70,
      background: p.nivel === 0 ? (p.cor || NT_ACENTO) : 'transparent', color: p.nivel === 0 ? (p.corTexto || '#fff') : T.text,
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
  var imp = ntImp(n), fix = ntFixada(n);
  var cor = imp === 'normal' ? NT_ACENTO : NT_IMP[imp].cor;
  // Wrapper (não é um <button> dentro de outro): o cartão abre a nota; copiar e fixar ficam por cima, no canto.
  return React.createElement('div', {
    style: { position: 'relative', width: 'calc(100% - ' + (p.recuo || 0) + 'px)', marginLeft: p.recuo || 0, marginTop: 8 }
  },
    React.createElement('button', {
      onClick: function () { p.onOpen(n); },
      style: {
        display: 'block', width: '100%', boxSizing: 'border-box', textAlign: 'left',
        background: T.surface, border: '1px solid ' + T.border, borderLeft: '5px solid ' + cor,
        borderRadius: 12, padding: '11px ' + (p.podeEditar ? 108 : 56) + 'px 11px 13px', cursor: 'pointer', color: T.text
      }
    },
      React.createElement('div', { style: { fontSize: 17, fontWeight: 900, lineHeight: 1.25, wordBreak: 'break-word' } }, n.titulo),
      React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 4 } },
        React.createElement('span', { style: { fontSize: 11, color: T.muted, fontWeight: 700 } }, ntDataFmt(n.created_at)),
        React.createElement(NtBadge, { imp: imp }),
        fix ? React.createElement('span', { style: { fontSize: 11, color: T.text, fontWeight: 800 } }, '📌 Fixada') : null
      ),
      resumo ? React.createElement('div', { style: { fontSize: 13, color: T.muted, marginTop: 4, lineHeight: 1.35, wordBreak: 'break-word' } }, resumo) : null
    ),
    React.createElement(NtCopiar, { nota: n }),
    p.podeEditar ? React.createElement('button', {
      type: 'button',
      disabled: !!p.fixBusy,
      'aria-pressed': fix,
      'aria-label': fix ? 'Desafixar nota' : 'Fixar nota',
      title: fix ? 'Desafixar nota' : 'Fixar nota',
      onClick: function (e) { if (e && e.stopPropagation) e.stopPropagation(); p.onFixar(n); },
      style: {
        position: 'absolute', top: 4, right: 52, width: 44, height: 44, boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
        background: fix ? NT_ACENTO : T.surface2, color: fix ? '#fff' : T.text,
        border: '2px solid ' + (fix ? NT_ACENTO : T.border), borderRadius: 12, fontSize: 20, lineHeight: 1,
        cursor: p.fixBusy ? 'default' : 'pointer', opacity: p.fixBusy ? 0.55 : (fix ? 1 : 0.8)
      }
    }, '📌') : null
  );
}

// Lista. "Por data": Ano > Mês > Semana. "Por importância": Urgente, Importante, Normal (por data dentro).
// O bloco "Fixadas" fica no topo nas duas vistas. Só é montada depois de as notas carregarem, para o useState
// inicial já poder calcular o Set de minimizadas (tudo menos o atual; com filtros/pesquisa tudo aberto).
function NtLista(p) {
  var _s = React.useState(function () { return p.filtrando ? new Set() : ntMinimizadasIniciais(p.notas, new Date()); });
  var minim = _s[0], setMinim = _s[1];
  var pend = React.useRef(false);
  React.useEffect(function () { if (pend.current) { pend.current = false; ntRolarPara('nt-sem-atual'); } });
  var toggle = function (key) {
    setMinim(function (prev) {
      var next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };
  if (!p.notas.length) {
    return React.createElement('div', { style: { textAlign: 'center', color: T.muted, padding: '40px 10px', fontSize: 14, fontWeight: 600 } },
      p.readOnly ? 'Sem notas.' : 'Ainda não há notas. Toca em “+ Nova nota”.');
  }
  var cur = ntChavesDe(new Date().toISOString());
  var linha = function (n, key, recuo) {
    return React.createElement(NtLinha, { key: key, nota: n, recuo: recuo == null ? 20 : recuo, onOpen: p.onOpen, podeEditar: !p.readOnly, onFixar: p.onFixar, fixBusy: !!(p.fixBusy && p.fixBusy[n.id]) });
  };
  var filhos = [React.createElement('div', { key: 'topo', id: 'nt-topo', style: { scrollMarginTop: 70 } })];
  // Uma nota fixada aparece SÓ no bloco "Fixadas" (nas duas vistas); o resto é organizado abaixo.
  var fixadas = p.notas.filter(ntFixada).sort(ntPorDataDesc);
  var resto = p.notas.filter(function (n) { return !ntFixada(n); });
  // Poucas notas (visíveis, depois de pesquisa e filtros): lista direta, sem cabeçalhos Ano > Mês > Semana.
  var direta = p.modo !== 'imp' && p.notas.length < NT_LIMITE_LISTA;
  if (fixadas.length) {
    var fMin = minim.has('fixadas');
    filhos.push(React.createElement(NtGrupoCab, { key: 'g-fixadas', nivel: 0, label: '📌 Fixadas', count: fixadas.length, minimizado: fMin, onToggle: function () { toggle('fixadas'); } }));
    if (!fMin) fixadas.forEach(function (n) { filhos.push(linha(n, 'fx-' + n.id)); });
  }
  if (direta) {
    resto.slice().sort(ntPorDataDesc).forEach(function (n) { filhos.push(linha(n, n.id, 0)); });
  } else if (p.modo === 'imp') {
    NT_IMP_ORDEM.forEach(function (nivel) {
      var doNivel = resto.filter(function (n) { return ntImp(n) === nivel; }).sort(ntPorDataDesc);
      if (!doNivel.length) return;
      var k = 'i-' + nivel, kMin = minim.has(k), d = NT_IMP[nivel];
      filhos.push(React.createElement(NtGrupoCab, { key: k, nivel: 0, label: d.icone + ' ' + d.rot, count: doNivel.length, minimizado: kMin, cor: d.fundo || NT_ACENTO, corTexto: d.texto || '#fff', onToggle: function () { toggle(k); } }));
      if (kMin) return;
      doNivel.forEach(function (n) { filhos.push(linha(n, n.id)); });
    });
  } else {
    ntAgrupar(resto).forEach(function (a) {
      var aMin = minim.has(a.key);
      filhos.push(React.createElement(NtGrupoCab, { key: a.key, nivel: 0, label: a.label, count: a.n, minimizado: aMin, onToggle: function () { toggle(a.key); } }));
      if (aMin) return;
      a.meses.forEach(function (m) {
        var mMin = minim.has(m.key);
        filhos.push(React.createElement(NtGrupoCab, { key: m.key, nivel: 1, label: m.label, count: m.n, minimizado: mMin, onToggle: function () { toggle(m.key); } }));
        if (mMin) return;
        m.semanas.forEach(function (s) {
          var sMin = minim.has(s.key);
          filhos.push(React.createElement(NtGrupoCab, { key: s.key, id: s.key === cur.kS ? 'nt-sem-atual' : undefined, nivel: 2, label: s.label, count: s.n, minimizado: sMin, onToggle: function () { toggle(s.key); } }));
          if (sMin) return;
          s.notas.forEach(function (n) { filhos.push(linha(n, n.id)); });
        });
      });
    });
  }
  // Botões flutuantes discretos: só quando a lista é comprida. "Hoje" só na vista por data.
  var longa = p.notas.length >= 8;
  var temHoje = p.modo !== 'imp' && !direta && resto.some(function (n) { return ntChavesDe(n.created_at).kS === cur.kS; });
  var flut = { minHeight: 40, minWidth: 40, borderRadius: 999, border: '2px solid ' + NT_ACENTO, background: T.surface, color: NT_ACENTO, fontSize: 14, fontWeight: 900, cursor: 'pointer', opacity: 0.92, boxShadow: '0 2px 8px rgba(0,0,0,0.35)', padding: '0 12px' };
  var irHoje = function () {
    pend.current = true;
    setMinim(function (prev) {
      var next = new Set(prev);
      [cur.kA, cur.kM, cur.kS].forEach(function (k) { next.delete(k); });
      return next;
    });
  };
  return React.createElement('div', null, filhos,
    longa ? React.createElement('div', { style: { position: 'fixed', right: 12, bottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, zIndex: 20 } },
      temHoje ? React.createElement('button', { type: 'button', 'aria-label': 'Ir para a semana de hoje', onClick: irHoje, style: flut }, 'Hoje') : null,
      React.createElement('button', { type: 'button', 'aria-label': 'Ir ao topo', onClick: function () { ntRolarPara('nt-topo'); }, style: flut }, '↑')
    ) : null
  );
}

function NtLixoLista(p) {
  if (!p.notas.length) {
    return React.createElement('div', { style: { textAlign: 'center', color: T.muted, padding: '40px 10px', fontSize: 14, fontWeight: 600 } }, 'O Lixo está vazio.');
  }
  return React.createElement('div', null,
    React.createElement('div', { style: { fontSize: 12, color: T.muted, fontWeight: 600, marginBottom: 4 } },
      'As notas no Lixo há mais de ' + NT_DIAS_LIXO + ' dias são apagadas definitivamente.'),
    p.notas.map(function (n) {
      return React.createElement('div', { key: n.id, style: { position: 'relative', background: T.surface, border: '1px solid ' + T.border, borderLeft: '5px solid ' + T.muted, borderRadius: 12, padding: '11px 13px', marginTop: 8 } },
        React.createElement(NtCopiar, { nota: n }),
        React.createElement('div', { style: { fontSize: 16, fontWeight: 900, wordBreak: 'break-word', paddingRight: 44 } }, n.titulo),
        React.createElement('div', { style: { fontSize: 11, color: T.muted, marginTop: 3, fontWeight: 700, paddingRight: 44 } }, 'Apagada em ' + ntDataFmt(n.deleted_at)),
        ntResumo(n.texto) ? React.createElement('div', { style: { fontSize: 13, color: T.muted, marginTop: 4, wordBreak: 'break-word', paddingRight: 44 } }, ntResumo(n.texto)) : null,
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
  var cp = ntUseCopia();
  var imp = ntImp(n), fix = ntFixada(n);
  var cor = imp === 'normal' ? NT_ACENTO : NT_IMP[imp].cor;
  // Ações secundárias: pequenas e discretas. Editar é o botão principal; Apagar vai para o fundo, separado.
  var peq = { minHeight: 36, padding: '6px 12px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', background: 'transparent', color: T.muted, border: '1px solid ' + T.border };
  var ativo = { background: NT_ACENTO, color: '#fff', border: '1px solid ' + NT_ACENTO };
  return React.createElement('div', null,
    React.createElement('div', { style: { fontSize: 24, fontWeight: 900, lineHeight: 1.25, wordBreak: 'break-word', borderLeft: '6px solid ' + cor, paddingLeft: 12 } }, n.titulo),
    React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 8 } },
      React.createElement('span', { style: { fontSize: 12, color: T.muted, fontWeight: 700 } },
        'Criada ' + ntDataFmt(n.created_at) + (n.updated_at && n.updated_at !== n.created_at ? ' · editada ' + ntDataFmt(n.updated_at) : '')),
      React.createElement(NtBadge, { imp: imp }),
      fix ? React.createElement('span', { style: { fontSize: 12, color: T.text, fontWeight: 800 } }, '📌 Fixada') : null
    ),
    React.createElement('div', { style: { fontSize: 16, color: T.text, marginTop: 16, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' } }, n.texto || ''),
    React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20 } },
      React.createElement('button', { type: 'button', 'aria-label': cp.feito ? 'Nota copiada' : 'Copiar a nota', onClick: function () { cp.copiar(n); },
        style: Object.assign({}, peq, cp.feito ? ativo : {}) }, cp.feito ? '✓ Copiada' : '📋 Copiar'),
      React.createElement('button', { type: 'button', 'aria-label': 'Partilhar a nota', onClick: function () { ntPartilhar(n, cp); }, style: peq }, '📤 Partilhar'),
      p.readOnly ? null : React.createElement('button', {
        type: 'button', disabled: !!p.fixBusy, 'aria-pressed': fix, 'aria-label': fix ? 'Desafixar nota' : 'Fixar nota', onClick: p.onFixar,
        style: Object.assign({}, peq, fix ? ativo : {}, p.fixBusy ? { opacity: 0.55, cursor: 'default' } : {})
      }, fix ? '📌 Desafixar' : '📌 Fixar')
    ),
    cp.feito ? React.createElement('div', { 'aria-live': 'polite', style: { marginTop: 8, fontSize: 13, fontWeight: 800, color: NT_ACENTO } }, 'Nota copiada') : null,
    p.readOnly ? null : React.createElement('div', { style: { display: 'flex', marginTop: 16 } },
      React.createElement(NtBtn, { flex: true, onClick: p.onEditar }, 'Editar')
    ),
    p.readOnly ? null : React.createElement('div', { style: { marginTop: 56, paddingTop: 14, borderTop: '1px solid ' + T.border, textAlign: 'center' } },
      React.createElement('button', {
        type: 'button', disabled: !!p.busy, onClick: p.onApagar,
        style: { background: 'none', border: 'none', color: T.red, fontSize: 13, fontWeight: 700, minHeight: 36, padding: '6px 12px', cursor: p.busy ? 'default' : 'pointer', opacity: p.busy ? 0.55 : 1 }
      }, 'Apagar nota')
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
    React.createElement('div', { style: { fontSize: 13, fontWeight: 800, color: T.muted, margin: '14px 0 6px' } }, 'Importância'),
    React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
      NT_IMP_ORDEM.slice().reverse().map(function (k) {
        var d = NT_IMP[k];
        return React.createElement(NtChip, { key: k, ativo: p.imp === k, cor: d.fundo || NT_ACENTO, corTexto: d.texto || '#fff', disabled: p.saving, onClick: function () { p.onImp(k); } }, d.icone + ' ' + d.rot);
      })
    ),
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
  var _c = React.useState(!isAdmin && NT_MEMBROS.indexOf(myId) !== -1 ? myId : null); var cartao = _c[0], setCartao = _c[1]; // não-admin entra direto no seu; admin abre na lista de cartões
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
  var _fi = React.useState('normal'); var fImp = _fi[0], setFImp = _fi[1];
  var _md = React.useState(ntLerVista); var modo = _md[0], setModoRaw = _md[1]; // data | imp (guardado só neste aparelho)
  var _bs = React.useState(''); var busca = _bs[0], setBusca = _bs[1];
  var _ff = React.useState(NT_FILTROS_VAZIOS); var filtros = _ff[0], setFiltros = _ff[1];
  var _fb = React.useState({}); var fixBusy = _fb[0], setFixBusy = _fb[1];

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

  function setModo(m) { setModoRaw(m); ntGuardarVista(m); }
  function resetFiltros() { setBusca(''); setFiltros(NT_FILTROS_VAZIOS); }

  function abrirNova() {
    if (!podeEditar) return;
    setEditId(null); setFTitulo(''); setFTexto(''); setFImp('normal'); setFErro(''); setVista('form');
  }
  function abrirEditar(n) {
    if (!ntPodeEditar(n.dono, myId)) return;
    setEditId(n.id); setFTitulo(n.titulo); setFTexto(n.texto || ''); setFImp(ntImp(n)); setFErro(''); setVista('form');
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
    var agoraIso = new Date().toISOString();
    var anterior = null;
    var patch = null;
    if (editId) {
      for (var j = 0; j < notas.length; j++) { if (notas[j].id === editId) { anterior = notas[j]; break; } }
      if (!anterior) return;
      // Só as colunas que mudaram (importancia só quando muda; updated_at só se mudou o conteúdo).
      patch = {};
      var mudouConteudo = false;
      if (titulo !== anterior.titulo) { patch.titulo = titulo; mudouConteudo = true; }
      if (fTexto !== (anterior.texto || '')) { patch.texto = fTexto; mudouConteudo = true; }
      if (fImp !== ntImp(anterior)) patch.importancia = fImp;
      if (mudouConteudo) patch.updated_at = agoraIso;
      if (!Object.keys(patch).length) { // nada mudou: fecha sem pedir nada
        setFErro(''); setFTitulo(''); setFTexto(''); setFImp('normal'); setEditId(null); setVista('nota');
        return;
      }
    }
    savingRef.current = true;
    setSaving(true);
    setFErro('');
    var removeOptimistic;
    var consulta;
    if (editId) {
      var idEd = editId;
      setNotas(function (p) { return p.map(function (n) { return n.id === idEd ? Object.assign({}, n, patch) : n; }); });
      removeOptimistic = function () {
        setNotas(function (p) { return p.map(function (n) { return n.id === idEd ? anterior : n; }); });
      };
      consulta = db.from('notas_notas').update(patch).eq('id', idEd);
    } else {
      var nova = { id: ntNovoId(), dono: cartao, titulo: titulo, texto: fTexto, importancia: fImp, fixada: false, created_at: agoraIso, updated_at: agoraIso, deleted_at: null };
      setNotas(function (p) { return [nova].concat(p); });
      removeOptimistic = function () {
        setNotas(function (p) { return p.filter(function (n) { return n.id !== nova.id; }); });
      };
      var linhaNova = { id: nova.id, dono: nova.dono, titulo: nova.titulo, texto: nova.texto, created_at: agoraIso, updated_at: agoraIso };
      if (fImp !== 'normal') linhaNova.importancia = fImp; // 'normal' é o valor por omissão da coluna
      consulta = db.from('notas_notas').insert(linhaNova);
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
      setFTitulo(''); setFTexto(''); setFImp('normal');
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

  // Fixar/desafixar: UPDATE só da coluna fixada, por id. Molde addEvent: otimista, .then com res.error
  // (reverte), .catch depois do .then, trava contra duplo clique.
  function alternarFixada(n) {
    if (!ntPodeEditar(n.dono, myId)) return;
    if (!db) return;
    var chave = 'fix:' + n.id;
    if (busyRef.current[chave]) return;
    var anterior = ntFixada(n);
    var novo = !anterior;
    busyRef.current[chave] = true;
    setFixBusy(function (p) { var x = Object.assign({}, p); x[n.id] = true; return x; });
    var soltar = function () {
      busyRef.current[chave] = false;
      setFixBusy(function (p) { var x = Object.assign({}, p); delete x[n.id]; return x; });
    };
    var aplicar = function (v) {
      setNotas(function (p) { return p.map(function (x) { return x.id === n.id ? Object.assign({}, x, { fixada: v }) : x; }); });
    };
    aplicar(novo);
    var ok = false;
    db.from('notas_notas').update({ fixada: novo }).eq('id', n.id).then(function (res) {
      soltar();
      if (res && res.error) { ntAvisarRes('fixar nota', res.error); aplicar(anterior); return; }
      ok = true;
    }).catch(function (e) {
      soltar();
      if (ok) { ntLog('depois de fixar', e); return; }
      ntAvisar('fixar nota', e); aplicar(anterior);
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
    resetFiltros();
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
        return React.createElement(NtCartaoDono, { key: d, emoji: NT_EMOJIS[d], nome: nome, sub: sub, onClick: function () { setVista('lista'); setSelId(null); resetFiltros(); setCartao(d); } });
      }));
  } else if (vista === 'form') {
    corpo = React.createElement(NtForm, {
      titulo: fTitulo, texto: fTexto, imp: fImp, erro: fErro, saving: saving, editando: !!editId,
      onTitulo: setFTitulo, onTexto: setFTexto, onImp: setFImp, onGuardar: guardar, onCancelar: cancelarForm
    });
  } else if (vista === 'nota') {
    corpo = notaSel && ntAtiva(notaSel)
      ? React.createElement(NtVista, { nota: notaSel, readOnly: !podeEditar, busy: busyId === notaSel.id, fixBusy: !!fixBusy[notaSel.id], onFixar: function () { alternarFixada(notaSel); }, onEditar: function () { abrirEditar(notaSel); }, onApagar: function () { if (typeof window.confirm === 'function' && !window.confirm('Mover “' + notaSel.titulo + '” para o Lixo?')) return; apagarParaLixo(notaSel); } })
      : React.createElement('div', { style: { color: T.muted, textAlign: 'center', padding: 30 } }, 'Nota não encontrada.');
  } else if (vista === 'lixo') {
    corpo = React.createElement(NtLixoLista, { notas: lixo, readOnly: !podeEditar, busyId: busyId, onRestaurar: restaurar, onApagarDef: apagarDefinitivo });
  } else {
    // Vista, pesquisa e filtros são só estado do ecrã: nunca gravam nem pedem nada ao Supabase.
    var filtrando = ntFiltrosAtivos(filtros, busca);
    var filtradas = ntFiltrar(ativas, filtros, busca, new Date());
    corpo = React.createElement('div', null,
      podeEditar ? React.createElement(NtBtn, { onClick: abrirNova }, '+ Nova nota') : React.createElement('div', { style: { fontSize: 12, color: T.muted, fontWeight: 700 } }, '👁 Só leitura'),
      ativas.length ? React.createElement(NtFiltros, {
        modo: modo, onModo: setModo, busca: busca, onBusca: setBusca, filtros: filtros, onFiltros: setFiltros,
        total: ativas.length, mostradas: filtradas.length, filtrando: filtrando, onLimpar: resetFiltros
      }) : null,
      ativas.length && !filtradas.length
        ? React.createElement('div', { style: { textAlign: 'center', color: T.muted, padding: '40px 10px', fontSize: 14, fontWeight: 600 } }, 'Nenhuma nota com estes filtros')
        : React.createElement(NtLista, {
            key: cartao + '|' + modo + '|' + (filtrando ? 'f' : 'n'), notas: filtradas, readOnly: !podeEditar, modo: modo, filtrando: filtrando,
            onOpen: abrirNota, onFixar: alternarFixada, fixBusy: fixBusy
          }));
  }

  return React.createElement('div', { style: Object.assign({}, wrap, { paddingBottom: 60 }) },
    React.createElement(TopBar, { onBack: voltar, title: titulo, right: direita }),
    React.createElement('div', { style: { padding: '16px 16px 0', maxWidth: 640, margin: '0 auto' } }, corpo)
  );
}
