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
// Cada nota tem importância (1 importante / 2 normal / 3 baixo) e pode ser fixada (sql/35, sql/36); a lista tem
// copiar, pesquisa, vistas (por data / por importância) e filtros — tudo só estado do ecrã, sem
// pedidos ao Supabase. Só fixar e mudar a importância gravam, e só a coluna alterada, por id.
// ══════════════════════════════════════════════════════════════════

var NT_ACENTO = '#EC4899';
var NT_DIAS_LIXO = 30;
var NT_NOMES = { patricio: 'Patricio', esposa: 'Cristina', lucas: 'Lucas', liam: 'Liam', familia: 'Família' };
var NT_EMOJIS = { patricio: '👨‍💼', esposa: '👩', lucas: '🧒', liam: '👦', familia: '🏠' };
var NT_MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
var NT_MEMBROS = ['patricio', 'esposa', 'lucas', 'liam'];
// Importância (colunas importancia/fixada: sql/35; regra com 'baixo': sql/36). A cor NUNCA vai sozinha: sempre com o número.
//   1 · Importante = vermelho, 2 · Normal = âmbar (por omissão), 3 · Baixo = verde.
var NT_IMP = {
  importante: { num: '1', rot: 'Importante', cor: '#EF4444', corClara: '#DC2626' },
  normal: { num: '2', rot: 'Normal', cor: '#F59E0B', corClara: '#B45309' },
  baixo: { num: '3', rot: 'Baixo', cor: '#22C55E', corClara: '#15803D' }
};
// Aspeto: contorno fino na cor do nível (nunca blocos de cor cheia). No tema claro usa-se um tom mais escuro para o
// contorno e o número continuarem legíveis sobre o fundo claro.
function ntCor(k) {
  var d = NT_IMP[k] || NT_IMP.normal;
  return T.bg === T_LIGHT.bg ? d.corClara : d.cor;
}
function ntAlfa(hex, a) {
  var h = String(hex).replace('#', '');
  return 'rgba(' + parseInt(h.slice(0, 2), 16) + ',' + parseInt(h.slice(2, 4), 16) + ',' + parseInt(h.slice(4, 6), 16) + ',' + a + ')';
}
var NT_IMP_ORDEM = ['importante', 'normal', 'baixo'];
// Pastas (coluna pasta, sql/38): só no cartão do Patricio, duas caixas. null/em falta/desconhecido = 'privado'.
var NT_PASTAS = [
  { key: 'privado', nome: 'Privado', icone: '🔒' },
  { key: 'geschaeft', nome: 'Geschäft', icone: '💼' }
];
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

// Texto visível ao utilizador com a mensagem REAL devolvida pelo Supabase: "[código] mensagem — detalhes".
function ntMsgErro(err) {
  var c = err && err.code;
  var m = (err && (err.message || err.msg)) || String(err);
  var d = err && (err.details || err.hint);
  return (c ? '[' + c + '] ' : '') + m + (d ? ' — ' + d : '');
}
var NT_ZERO_LINHAS = 'A base não atualizou nenhuma linha (0 linhas afetadas)';

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
// Arquivo (coluna feita_em, sql/37): NÃO é o Lixo. Nota feita = feita_em preenchida; null/em falta = ativa.
function ntFeita(n) { return !!(n && n.feita_em); }
function ntNaLista(n) { return ntAtiva(n) && !ntFeita(n); }   // lista principal, filtros, pesquisa, Fixadas, por importância
function ntNoArquivo(n) { return ntAtiva(n) && ntFeita(n); }  // Arquivo: feita_em preenchida e deleted_at nula

function ntChavesDe(iso) {
  var d = new Date(iso);
  var y = d.getFullYear(), m = d.getMonth(), w = ntGetISOWeek(d);
  var kA = 'a' + y, kM = kA + '-m' + (m < 9 ? '0' : '') + (m + 1), kS = kM + '-s' + (w < 10 ? '0' : '') + w;
  return { y: y, m: m, w: w, kA: kA, kM: kM, kS: kS };
}

// Agrupa Ano > Mês > Semana ISO por created_at (o grupo de cada nota é sempre
// pela data — isso não muda). Dentro de cada semana, por importância e depois
// pela mais recente (ntPorImportanciaEDataDesc) — só a ORDEM dentro da semana.
function ntAgrupar(notas) {
  var ord = notas.slice().sort(ntPorImportanciaEDataDesc);
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

// A purga só olha para deleted_at: uma nota só arquivada (feita_em preenchida, deleted_at nula) NUNCA é vencida nem apagada.
function ntLixoVencido(n, agora) {
  if (!n.deleted_at) return false;
  return agora.getTime() - new Date(n.deleted_at).getTime() > NT_DIAS_LIXO * 86400000;
}
// Dias que faltam até à purga definitiva (NT_DIAS_LIXO, inalterado); nunca negativo (a purga já a teria apagado).
function ntDiasParaPurga(n, agora) {
  var passados = (agora.getTime() - new Date(n.deleted_at).getTime()) / 86400000;
  return Math.max(0, Math.ceil(NT_DIAS_LIXO - passados));
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

// 'urgente' (valor antigo) conta como 'importante'; null/em falta/desconhecido = 'normal'. Não fixada se null.
function ntImp(n) {
  var v = n && n.importancia;
  if (v === 'urgente') return 'importante';
  return v === 'importante' || v === 'baixo' ? v : 'normal';
}
function ntPasta(n) { return n && n.pasta === 'geschaeft' ? 'geschaeft' : 'privado'; }
function ntNomePasta(k) { return k === 'geschaeft' ? 'Geschäft' : 'Privado'; }
function ntFixada(n) { return !!(n && n.fixada === true); }
function ntPorDataDesc(a, b) { return new Date(b.created_at) - new Date(a.created_at); }
// Vista "Por data": dentro da lista direta e de cada semana, ordena por
// importância primeiro (1 Importante, 2 Normal, 3 Baixo — NT_IMP_ORDEM) e,
// dentro de cada nível, a mais recente primeiro. Não usada nas Fixadas
// (essas continuam só por data) nem na vista "Por importância" (que já
// agrupa por nível à parte).
function ntPorImportanciaEDataDesc(a, b) {
  var oa = NT_IMP_ORDEM.indexOf(ntImp(a));
  var ob = NT_IMP_ORDEM.indexOf(ntImp(b));
  if (oa !== ob) return oa - ob;
  return ntPorDataDesc(a, b);
}

// ── LISTAS DE COMPRAS (só no cartão Família) ─────────────────────────
// Uma lista é uma linha de notas_notas com tipo = 'lista' (por isso Lixo, Arquivo, fixar, importância, purga e RLS
// são os das notas). Cada artigo é uma LINHA PRÓPRIA em notas_lista_itens (nota_id, texto, comprado, comprado_em):
// duas pessoas a marcar artigos diferentes ao mesmo tempo nunca se sobrepõem (cada UPDATE é só por id do artigo).
var NT_MAX_ITEM = 200;
function ntELista(n) { return !!(n && n.tipo === 'lista'); }
function ntItensDaLista(todos, id) { return (todos || []).filter(function (x) { return x.nota_id === id; }); }
function ntContaItens(itens) {
  var total = itens ? itens.length : 0, c = 0;
  for (var i = 0; i < total; i++) { if (itens[i].comprado) c++; }
  return { total: total, comprados: c };
}
// Por comprar primeiro (pela ordem em que foram escritos); comprados no fim (pela ordem em que foram marcados).
function ntOrdenarItens(itens) {
  var t = function (v) { return v ? new Date(v).getTime() : 0; };
  return (itens || []).slice().sort(function (a, b) {
    if (!!a.comprado !== !!b.comprado) return a.comprado ? 1 : -1;
    var ka = a.comprado ? t(a.comprado_em) : t(a.created_at), kb = b.comprado ? t(b.comprado_em) : t(b.created_at);
    if (ka !== kb) return ka - kb;
    return String(a.id) < String(b.id) ? -1 : 1;
  });
}
function ntTxtProgresso(cont) { return cont.comprados + '/' + cont.total; }
function ntLinhasLista(itens) {
  return ntOrdenarItens(itens).map(function (x) { return (x.comprado ? '☑ ' : '☐ ') + x.texto; }).join('\n');
}
// Para copiar/partilhar: a lista passa a "nota" com os artigos como texto (☐ por comprar, ☑ comprado).
function ntNotaParaCopia(n, itens) { return ntELista(n) ? Object.assign({}, n, { texto: ntLinhasLista(itens) }) : n; }

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
  var bg = kind === 'accent' ? NT_ACENTO : kind === 'danger' ? T.red : kind === 'contorno' ? 'transparent' : T.surface2;
  var cor = kind === 'ghost' ? T.text : kind === 'contorno' ? NT_ACENTO : '#fff';
  return React.createElement('button', {
    onClick: p.onClick,
    disabled: !!p.disabled,
    style: {
      background: bg, color: cor, border: kind === 'ghost' ? '1px solid ' + T.border : kind === 'contorno' ? '2px solid ' + NT_ACENTO : 'none',
      borderRadius: 12, padding: p.small ? '8px 12px' : '13px 18px', fontSize: p.small ? 13 : 15,
      fontWeight: 800, cursor: p.disabled ? 'default' : 'pointer', opacity: p.disabled ? 0.55 : 1,
      flex: p.flex ? 1 : undefined, minHeight: 44, boxSizing: 'border-box'
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

// Selo de importância. Na lista só o número ("curto"); na nota aberta o nome completo: "1 · Importante". Cor + número.
function NtBadge(p) {
  var d = NT_IMP[p.imp] || NT_IMP.normal;
  var cor = ntCor(p.imp);
  return React.createElement('span', {
    title: d.num + ' · ' + d.rot,
    style: {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, lineHeight: 1,
      minWidth: p.curto ? 18 : undefined, padding: p.curto ? '2px 5px' : '2px 8px', borderRadius: 999,
      background: 'transparent', color: cor, border: '1.5px solid ' + cor
    }
  }, p.curto ? d.num : d.num + ' · ' + d.rot);
}

// Botão-pílula (vistas, filtros, importância no formulário).
function NtChip(p) {
  var cor = p.cor || NT_ACENTO;
  var suave = !!p.suave; // contorno na cor; selecionado = fundo muito suave (15%), nunca um bloco cheio
  return React.createElement('button', {
    type: 'button',
    onClick: p.onClick,
    'aria-pressed': !!p.ativo,
    disabled: !!p.disabled,
    style: {
      minHeight: 38, padding: '6px 12px', borderRadius: 999, fontSize: 13, fontWeight: 800, cursor: p.disabled ? 'default' : 'pointer',
      flex: p.grow ? 1 : undefined,
      background: suave ? (p.ativo ? ntAlfa(cor, 0.15) : 'transparent') : (p.ativo ? cor : T.surface2),
      color: suave ? T.text : (p.ativo ? (p.corTexto || '#fff') : T.text),
      border: suave ? ((p.ativo ? '2px' : '1.5px') + ' solid ' + cor) : ((p.borda ? '2px' : '1px') + ' solid ' + (p.ativo ? cor : (p.borda || T.border)))
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
    return React.createElement(NtChip, { key: k, ativo: f.imp === k, cor: cor, suave: true, onClick: function () { set('imp', k); } }, txt);
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
      chipImp('todas', 'Todas', NT_ACENTO),
      chipImp('importante', '1 · Importante', ntCor('importante')),
      chipImp('normal', '2 · Normal', ntCor('normal')),
      chipImp('baixo', '3 · Baixo', ntCor('baixo'))
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
          : p.total + (p.total === 1 ? ' nota' : ' notas') + (p.imp > 0 ? ' · ' + p.imp + (p.imp === 1 ? ' importante' : ' importantes') : '')),
      p.filtrando ? React.createElement(NtBtn, { small: true, kind: 'ghost', onClick: p.onLimpar }, 'Limpar filtros') : null
    )
  );
}

// Bloco do código do cofre, no cartão de cada PESSOA (só o admin o vê). Grava só salt + hash (PBKDF2); o código em claro
// nunca é guardado, registado nem enviado. Tocar aqui NÃO abre o cartão.
function NtCodigoCartao(p) {
  var _v = React.useState(''); var val = _v[0], setVal = _v[1];
  var _c = React.useState(false); var conf = _c[0], setConf = _c[1];
  var _b = React.useState(false); var busy = _b[0], setBusy = _b[1];
  var busyRef = React.useRef(false);
  var vivo = React.useRef(true);
  React.useEffect(function () { return function () { vivo.current = false; }; }, []);
  var parar = function (e) { if (e && e.stopPropagation) e.stopPropagation(); };
  var tem = p.tem === true;

  function gravar() {
    if (busyRef.current || val.length !== 4) return;
    busyRef.current = true; setBusy(true); p.onErro('');
    var codigo = val;
    var salt = ntCofreSaltNovo();
    ntCofreHash(codigo, salt).then(function (hash) {
      return p.db.from('notas_cofre_pin').upsert({ dono: p.dono, salt: salt, hash: hash, updated_at: new Date().toISOString() }, { onConflict: 'dono' }).select('dono').then(function (res) {
        if (!vivo.current) return;
        if (res && res.error) { ntCofreAvisar('guardar código do cofre', res.error); p.onErro('Não foi possível guardar o código de ' + p.nome + ': ' + ntCofreMsg(res.error)); return; }
        if (!res || !res.data || !res.data.length) { ntAvisar('guardar código do cofre', { message: NT_ZERO_LINHAS }); p.onErro('Não foi possível guardar o código de ' + p.nome + ': ' + NT_ZERO_LINHAS); return; }
        setVal(''); setConf(false); p.onGravado(p.dono);
      });
    }).catch(function (e) {
      ntCofreAvisar('guardar código do cofre', e);
      if (vivo.current) p.onErro('Não foi possível guardar o código de ' + p.nome + ': ' + ntCofreMsg(e));
    }).then(function () { busyRef.current = false; if (vivo.current) setBusy(false); });
  }
  function aoGuardar() { if (busyRef.current || val.length !== 4) return; if (tem && !conf) { setConf(true); return; } gravar(); }

  var mini = { minHeight: 40, boxSizing: 'border-box', border: '1px solid ' + T.border, borderRadius: 10, padding: '6px 10px', fontSize: 13, fontWeight: 800, cursor: 'pointer', background: T.surface2, color: T.text, whiteSpace: 'nowrap' };
  return React.createElement('div', { onClick: parar, onPointerDown: parar, style: { flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4, width: 84 } },
    React.createElement('input', {
      type: 'text', name: 'cs-cod-' + p.dono, value: val, inputMode: 'numeric', pattern: '[0-9]*', maxLength: 4, autoComplete: 'off', autoCorrect: 'off', spellCheck: false,
      placeholder: '••••', 'aria-label': 'Código do cofre de ' + p.nome, disabled: busy,
      onChange: function (e) { setVal(String(e.target.value).replace(/[^0-9]/g, '').slice(0, 4)); setConf(false); },
      style: { width: '100%', height: 48, boxSizing: 'border-box', textAlign: 'center', letterSpacing: 3, fontSize: 18, fontWeight: 800, background: T.surface2, color: T.text, border: '1px solid ' + T.border, borderRadius: 10, padding: '0 4px' }
    }),
    p.tem === null ? React.createElement('div', { style: { textAlign: 'center', fontSize: 11, fontWeight: 700, color: T.muted } }, '…')
      : tem ? React.createElement('div', { 'aria-label': 'Código definido', style: { textAlign: 'center', fontSize: 11, fontWeight: 800, color: '#16a34a' } }, '✓ definido')
        : React.createElement('div', { 'aria-label': 'Sem código', style: { textAlign: 'center', fontSize: 11, fontWeight: 700, color: T.muted } }, '○ sem código'),
    val.length === 4 && !conf ? React.createElement('button', { type: 'button', disabled: busy, onClick: aoGuardar, style: Object.assign({}, mini, { background: NT_ACENTO, color: '#fff', border: 'none' }) }, busy ? 'A guardar…' : 'Guardar') : null,
    conf ? React.createElement('div', { role: 'alertdialog', style: { fontSize: 12, fontWeight: 700 } },
      React.createElement('div', { style: { marginBottom: 4 } }, 'Substituir o código de ' + p.nome + '?'),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
        React.createElement('button', { type: 'button', disabled: busy, onClick: gravar, style: Object.assign({}, mini, { background: NT_ACENTO, color: '#fff', border: 'none' }) }, busy ? 'A guardar…' : 'Substituir'),
        React.createElement('button', { type: 'button', disabled: busy, onClick: function () { setConf(false); }, style: mini }, 'Cancelar'))) : null
  );
}

function NtCartaoDono(p) {
  var corpoCartao = [
    React.createElement('span', { key: 'e', style: { fontSize: 34 } }, p.emoji),
    React.createElement('span', { key: 't', style: { flex: 1, minWidth: 0, overflow: 'hidden' } },
      React.createElement('div', { style: Object.assign({ fontSize: 20, fontWeight: 900 }, p.codigo ? { overflowWrap: 'break-word', lineHeight: 1.15 } : {}) }, p.nome),
      React.createElement('div', { style: Object.assign({ fontSize: 12, color: T.muted, marginTop: 3, fontWeight: 600 }, p.codigo ? { overflowWrap: 'break-word' } : {}) }, p.sub)
    )
  ];
  var seta = React.createElement('span', { key: 's', style: { color: NT_ACENTO, fontSize: 26, fontWeight: 900 } }, '›');
  if (!p.codigo) {
    return React.createElement('button', {
      onClick: p.onClick,
      style: {
        display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
        background: T.surface, border: '2px solid ' + NT_ACENTO, borderRadius: 18, padding: '18px 16px',
        cursor: 'pointer', color: T.text, marginBottom: 12
      }
    }, corpoCartao, seta);
  }
  // Cartão com bloco de código (admin): o cartão inteiro abre ao tocar; o bloco pára o clique (stopPropagation).
  // Bloco + seta ficam sempre juntos, com a seta no fim; se o espaço for muito curto (zoom), passam para a linha de baixo.
  return React.createElement('div', {
    onClick: p.onClick,
    style: {
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 8, rowGap: 8, width: '100%', boxSizing: 'border-box', textAlign: 'left',
      background: T.surface, border: '2px solid ' + NT_ACENTO, borderRadius: 18, padding: '14px 12px',
      cursor: 'pointer', color: T.text, marginBottom: 12
    }
  },
    React.createElement('button', { type: 'button', 'aria-label': 'Abrir ' + p.nome, style: { flex: '1 1 9em', fontSize: 16, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: 0, margin: 0, textAlign: 'left', color: T.text, cursor: 'pointer' } }, corpoCartao),
    React.createElement('div', { style: { flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' } },
      p.codigo,
      React.createElement('span', { style: { color: NT_ACENTO, fontSize: 26, fontWeight: 900 } }, '›'))
  );
}

function NtGrupoCab(p) {
  var tam = p.nivel === 0 ? 20 : p.nivel === 1 ? 16 : 13;
  // Ano / Fixadas / níveis: barra só com contorno fino (ano 2px, os outros 1,5px). Mês e semana: só uma linha por baixo.
  // (sem chaves com undefined: o React poria borderBottom = '' e apagava a borda de baixo do contorno)
  var bordas = p.nivel === 0
    ? { border: (p.fino ? '1.5px' : '2px') + ' solid ' + (p.cor || NT_ACENTO) }
    : { border: 'none', borderBottom: '1px solid ' + T.border };
  return React.createElement('button', {
    id: p.id,
    onClick: p.onToggle,
    style: Object.assign({
      display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', scrollMarginTop: 70,
      background: p.nivel === 0 ? T.surface : 'transparent', color: T.text,
      borderRadius: p.nivel === 0 ? 12 : 0, padding: p.nivel === 0 ? '10px 14px' : '8px 4px',
      marginTop: p.nivel === 0 ? 14 : 8, marginLeft: p.nivel * 10, cursor: 'pointer',
      width: 'calc(100% - ' + (p.nivel * 10) + 'px)'
    }, bordas)
  },
    React.createElement('span', { style: { fontSize: 12, width: 14 } }, p.minimizado ? '▶' : '▼'),
    React.createElement('span', { style: { flex: 1, fontWeight: 900, fontSize: tam } }, p.label),
    React.createElement('span', { style: { fontSize: 12, fontWeight: 700, opacity: 0.8 } }, p.count)
  );
}

// Só aspeto: ecrã largo (PC) = caixas grandes; ecrã estreito = caixas compactas (ícone | título | seta).
// Tamanhos com clamp() para o texto e o ícone não crescerem sem limite com o zoom/tamanho de letra do sistema.
function ntUseLargo() {
  var ler = function () {
    try { return window.matchMedia ? window.matchMedia('(min-width: 700px)').matches : (window.innerWidth || 0) >= 700; } catch (e) { return false; }
  };
  var _s = React.useState(ler); var largo = _s[0], setLargo = _s[1];
  React.useEffect(function () {
    var f = function () { setLargo(ler()); };
    window.addEventListener('resize', f);
    return function () { window.removeEventListener('resize', f); };
  }, []);
  return largo;
}
// Caixa do ecrã inicial do cartão. p.sub / p.extra (opcionais): subtítulo e linha extra por baixo do título.
function NtCaixa(p) {
  var borda = '2px solid ' + NT_ACENTO;
  var icone = function (tam) { return React.createElement('span', { 'aria-hidden': 'true', style: tam }, p.icone); };
  var texto = function (tit, sub) {
    return [
      React.createElement('div', { key: 't', style: { fontSize: tit, fontWeight: 900, lineHeight: 1.15, letterSpacing: 0.2, overflowWrap: 'anywhere' } }, p.titulo),
      p.sub ? React.createElement('div', { key: 's', style: { fontSize: sub, color: T.muted, fontWeight: 700, marginTop: 4 } }, p.sub) : null,
      p.extra ? React.createElement(React.Fragment, { key: 'x' }, p.extra) : null
    ];
  };
  if (p.largo) {
    return React.createElement('button', {
      type: 'button', 'aria-label': p.aria, onClick: p.onAbrir,
      style: { flex: '1 1 240px', minHeight: 170, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'left', background: T.surface, color: T.text, border: borda, borderRadius: 20, padding: '22px 22px', cursor: 'pointer' }
    },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 } },
        icone({ fontSize: 46, lineHeight: 1 }),
        React.createElement('span', { style: { color: NT_ACENTO, fontSize: 30, fontWeight: 900 } }, '›')),
      React.createElement('div', null, texto(28, 15)));
  }
  return React.createElement('button', {
    type: 'button', 'aria-label': p.aria, onClick: p.onAbrir,
    style: { width: '100%', minHeight: 76, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', background: T.surface, color: T.text, border: borda, borderRadius: 18, padding: '10px 14px', cursor: 'pointer' }
  },
    icone({ flex: '0 0 auto', minWidth: '1.3em', textAlign: 'center', whiteSpace: 'nowrap', fontSize: 'clamp(28px, 8vw, 40px)', lineHeight: 1 }),
    React.createElement('div', { style: { flex: '1 1 auto', minWidth: 0 } }, texto('clamp(17px, 5vw, 22px)', 'clamp(12px, 3.4vw, 14px)')),
    React.createElement('span', { style: { flex: '0 0 auto', color: NT_ACENTO, fontSize: 'clamp(22px, 6vw, 28px)', fontWeight: 900 } }, '›'));
}

// Ecrã das caixas (só no cartão do Patricio): uma caixa grande por pasta. Padrão visual da Voz (src/16-app-voz.js,
// VZ_CATEGORIAS 💼/🏠 e VzCategoriaTabs) e do cartão de dono das Notas, mas maior; distinguem-se pelo ícone e pelo nome.
function NtCaixas(p) {
  var largo = ntUseLargo();
  var contas = {};
  NT_PASTAS.forEach(function (pa) {
    var daPasta = p.notas.filter(function (n) { return ntPasta(n) === pa.key; });
    contas[pa.key] = { total: daPasta.length, imp: daPasta.filter(function (n) { return ntImp(n) === 'importante'; }).length };
  });
  return React.createElement('div', null,
    p.podeEditar ? React.createElement(NtBtn, { onClick: p.onNova }, '+ Nova nota') : null,
    React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', flexDirection: largo ? 'row' : 'column', gap: largo ? 14 : 10, marginTop: p.podeEditar ? 16 : 0 } },
      p.cofre ? React.createElement(NtCaixaCofre, { key: 'cofre', onAbrir: p.cofre.onAbrir }) : null,
      p.cofre && p.cofre.onFamilia ? React.createElement(NtCaixaCofre, { key: 'familia', rotulo: 'Cofres da família', icone: '👪🔑', onAbrir: p.cofre.onFamilia }) : null,
      NT_PASTAS.map(function (pa) {
        var c = contas[pa.key];
        return React.createElement(NtCaixa, {
          key: pa.key, largo: largo, aria: 'Abrir ' + pa.nome, icone: pa.icone, titulo: pa.nome, onAbrir: function () { p.onAbrir(pa.key); },
          sub: c.total + (c.total === 1 ? ' nota' : ' notas'),
          extra: c.imp > 0 ? React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginTop: largo ? 10 : 6, flexWrap: 'wrap' } },
            React.createElement(NtBadge, { imp: 'importante', curto: true }),
            React.createElement('span', { style: { fontSize: largo ? 14 : 13, fontWeight: 800 } }, c.imp + (c.imp === 1 ? ' importante' : ' importantes'))) : null
        });
      })
    )
  );
}

// Círculo "marcar como feita" à esquerda do cartão (como uma caixa de verificação). Área de toque 40 px.
function NtCirculo(p) {
  return React.createElement('button', {
    type: 'button',
    disabled: !!p.busy,
    'aria-label': 'Marcar como feita',
    title: 'Marcar como feita',
    onClick: function (e) { if (e && e.stopPropagation) e.stopPropagation(); p.onFeita(p.nota); },
    style: {
      flex: '0 0 44px', width: 44, height: 44, padding: 0, background: 'transparent', border: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: p.busy ? 'default' : 'pointer', opacity: p.busy ? 0.55 : 1
    }
  }, React.createElement('span', { style: { display: 'block', width: 24, height: 24, borderRadius: '50%', border: '2px solid ' + T.text, boxSizing: 'border-box' } }));
}

// Caixote vermelho (mover para o Lixo; pede confirmação em quem o usa). 40 px, no canto inferior direito.
function NtCaixote(p) {
  return React.createElement('button', {
    type: 'button',
    disabled: !!p.busy,
    'aria-label': 'Mover para o Lixo',
    title: 'Mover para o Lixo',
    onClick: function (e) { if (e && e.stopPropagation) e.stopPropagation(); p.onApagar(p.nota); },
    style: {
      position: 'absolute', bottom: 4, right: 4, width: 44, height: 44, boxSizing: 'border-box',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
      background: T.surface2, color: T.red, border: '2px solid ' + T.red, borderRadius: 12,
      cursor: p.busy ? 'default' : 'pointer', opacity: p.busy ? 0.55 : 1
    }
  }, React.createElement('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
    React.createElement('path', { d: 'M3 6h18' }),
    React.createElement('path', { d: 'M8 6V4h8v2' }),
    React.createElement('path', { d: 'M6 6l1 14h10l1-14' }),
    React.createElement('path', { d: 'M10 11v6' }),
    React.createElement('path', { d: 'M14 11v6' })));
}

// Barra curta "Nota arquivada · Anular" (cerca de 6 s, não bloqueia nada).
function NtBarraDesfazer(p) {
  return React.createElement('div', {
    role: 'status',
    style: {
      position: 'fixed', left: 12, right: 12, bottom: 16, zIndex: 30, display: 'flex', alignItems: 'center', gap: 10,
      background: T.surface2, color: T.text, border: '2px solid ' + NT_ACENTO, borderRadius: 12, padding: '6px 6px 6px 14px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
    }
  },
    React.createElement('span', { style: { flex: 1, fontSize: 14, fontWeight: 800 } }, 'Nota arquivada ·'),
    React.createElement('button', {
      type: 'button', onClick: p.onDesfazer,
      style: { minHeight: 44, padding: '0 16px', borderRadius: 10, border: 'none', background: NT_ACENTO, color: '#fff', fontSize: 14, fontWeight: 900, cursor: 'pointer' }
    }, 'Anular')
  );
}

// Arquivo: notas e listas feitas (feita_em preenchida, deleted_at nula), da mais recentemente feita para a mais antiga.
// Um só Arquivo, em duas secções com cabeçalho (como os grupos de importância): "☑ Listas" e "📝 Notas". Cada secção abre/fecha
// tocando no cabeçalho (estado guardado no NotasApp, enquanto a app está aberta); uma secção vazia não aparece.
// Só muda a APRESENTAÇÃO: os mesmos itens, a mesma pesquisa e as mesmas ações (reabrir, apagar para o Lixo, usar outra vez).
function NtArquivo(p) {
  var inp = {
    width: '100%', boxSizing: 'border-box', background: T.surface, color: T.text, border: '2px solid ' + T.border,
    borderRadius: 12, padding: '10px 48px 10px 12px', fontSize: 16, fontFamily: 'inherit', outline: 'none', minWidth: 0
  };
  var cartao = function (n) {
    var lista = ntELista(n);
    var itensN = lista ? ntItensDaLista(p.itens, n.id) : null;
    var resumo = lista ? '' : ntResumo(n.texto);
    return React.createElement('div', { key: n.id, style: { position: 'relative', marginTop: 8 } },
      React.createElement('button', {
        onClick: function () { p.onOpen(n); },
        style: {
          display: 'block', width: '100%', boxSizing: 'border-box', textAlign: 'left', background: T.surface,
          border: '1.5px solid ' + ntCor(ntImp(n)), borderRadius: 12, padding: '11px 56px ' + (p.readOnly ? '11px' : (lista && p.onUsarOutra ? '104px' : '52px')) + ' 13px', cursor: 'pointer', color: T.text,
          minHeight: p.readOnly ? undefined : (lista && p.onUsarOutra ? 156 : 104)
        }
      },
        React.createElement('div', { style: { fontSize: 17, fontWeight: 900, lineHeight: 1.25, wordBreak: 'break-word' } }, n.titulo),
        React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 4 } },
          React.createElement('span', { style: { fontSize: 11, color: T.muted, fontWeight: 700 } }, 'Feita em ' + ntDataFmt(n.feita_em)),
          React.createElement(NtBadge, { imp: ntImp(n), curto: true })
        ),
        lista ? React.createElement('div', { style: { fontSize: 14, fontWeight: 900, marginTop: 4 } }, '☑ ' + (p.itensOk ? ntContaItens(itensN).comprados + '/' + ntContaItens(itensN).total : '…')) : null,
        resumo ? React.createElement('div', { style: { fontSize: 13, color: T.muted, marginTop: 4, lineHeight: 1.35, wordBreak: 'break-word' } }, resumo) : null
      ),
      React.createElement(NtCopiar, { nota: ntNotaParaCopia(n, itensN) }),
      p.readOnly ? null : React.createElement('div', { style: { position: 'absolute', left: 13, bottom: 4, display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: 'calc(100% - 78px)' } }, // quebra de linha em ecrã estreito: não encosta ao caixote
        React.createElement('button', {
          type: 'button', disabled: !!(p.feitaBusy && p.feitaBusy[n.id]), 'aria-label': 'Reabrir nota', onClick: function () { p.onReabrir(n); },
          style: { minHeight: 44, padding: '0 14px', borderRadius: 10, border: 'none', background: NT_ACENTO, color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', opacity: (p.feitaBusy && p.feitaBusy[n.id]) ? 0.55 : 1 }
        }, '↩ Reabrir'),
        lista && p.onUsarOutra ? React.createElement('button', {
          type: 'button', disabled: !!(p.usarBusy && p.usarBusy[n.id]), 'aria-label': 'Usar a lista outra vez', onClick: function () { p.onUsarOutra(n); },
          style: { minHeight: 44, padding: '0 14px', borderRadius: 10, border: '2px solid ' + NT_ACENTO, background: 'transparent', color: NT_ACENTO, fontSize: 13, fontWeight: 800, cursor: 'pointer', opacity: (p.usarBusy && p.usarBusy[n.id]) ? 0.55 : 1 }
        }, '↻ Usar outra vez') : null
      ),
      p.readOnly ? null : React.createElement(NtCaixote, { nota: n, busy: p.busyId === n.id, onApagar: p.onApagar })
    );
  };
  var listasArq = p.notas.filter(ntELista);
  var notasArq = p.notas.filter(function (n) { return !ntELista(n); });
  var secoes = [
    { k: 'listas', label: '☑ Listas', itens: listasArq },
    { k: 'notas', label: '📝 Notas', itens: notasArq }
  ].filter(function (x) { return x.itens.length; }); // secção vazia não aparece
  return React.createElement('div', null,
    React.createElement('div', { style: { fontSize: 12, color: T.muted, fontWeight: 600, marginBottom: 4 } },
      'O Arquivo guarda as notas e listas feitas para sempre (não é o Lixo).'),
    p.total ? React.createElement('div', { style: { position: 'relative', marginTop: 8 } },
      React.createElement('input', {
        type: 'text', value: p.busca, autoComplete: 'off', placeholder: 'Pesquisar no Arquivo…', 'aria-label': 'Pesquisar no Arquivo',
        onChange: function (e) { p.onBusca(e.target.value); }, style: inp
      }),
      p.busca ? React.createElement('button', {
        type: 'button', 'aria-label': 'Limpar pesquisa do Arquivo', onClick: function () { p.onBusca(''); },
        style: { position: 'absolute', top: 3, right: 3, width: 40, height: 40, borderRadius: 10, border: 'none', background: 'transparent', color: T.text, fontSize: 18, fontWeight: 900, cursor: 'pointer' }
      }, '✕') : null
    ) : null,
    !p.notas.length
      ? React.createElement('div', { style: { textAlign: 'center', color: T.muted, padding: '40px 10px', fontSize: 14, fontWeight: 600 } }, p.total ? 'Nenhuma nota com esta pesquisa' : 'O Arquivo está vazio.')
      : secoes.map(function (x) {
        var min = !!(p.secMinim && p.secMinim[x.k]);
        return React.createElement('div', { key: 'sec-' + x.k, 'data-seccao': x.k },
          React.createElement(NtGrupoCab, { nivel: 0, fino: true, label: x.label, count: x.itens.length, minimizado: min, onToggle: function () { p.onSecao(x.k); } }),
          min ? null : x.itens.map(cartao));
      })
  );
}

function NtLinha(p) {
  var n = p.nota;
  var lista = ntELista(n);
  var cont = lista ? ntContaItens(p.itens) : null;
  var resumo = lista ? '' : ntResumo(n.texto);
  var imp = ntImp(n), fix = ntFixada(n);
  var cor = ntCor(imp);
  // Wrapper (não é um <button> dentro de outro): o cartão abre a nota; copiar e fixar ficam por cima, no canto.
  return React.createElement('div', {
    style: { display: 'flex', alignItems: 'center', gap: 2, width: 'calc(100% - ' + (p.podeEditar ? 0 : (p.recuo || 0)) + 'px)', marginLeft: p.podeEditar ? 0 : (p.recuo || 0), marginTop: 8 }
  },
    p.podeEditar ? React.createElement(NtCirculo, { nota: n, busy: p.feitaBusy, onFeita: p.onFeita }) : null,
    React.createElement('div', { style: { position: 'relative', flex: 1, minWidth: 0 } },
    React.createElement('button', {
      onClick: function () { p.onOpen(n); },
      style: {
        display: 'block', width: '100%', boxSizing: 'border-box', textAlign: 'left',
        background: T.surface, border: '1.5px solid ' + cor,
        borderRadius: 12, padding: '11px ' + (p.podeEditar ? 108 : 56) + 'px 11px 13px', cursor: 'pointer', color: T.text,
        minHeight: p.podeEditar ? 104 : undefined // espaço para copiar/fixar em cima e o caixote em baixo, sem encostarem
      }
    },
      React.createElement('div', { style: { fontSize: 17, fontWeight: 900, lineHeight: 1.25, wordBreak: 'break-word' } }, n.titulo),
      React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 4 } },
        React.createElement('span', { style: { fontSize: 11, color: T.muted, fontWeight: 700 } }, ntDataFmt(n.created_at)),
        React.createElement(NtBadge, { imp: imp, curto: true }),
        fix ? React.createElement('span', { style: { fontSize: 11, color: T.text, fontWeight: 800 } }, '📌 Fixada') : null
      ),
      lista ? React.createElement('div', { 'data-progresso': n.id, style: { fontSize: 15, fontWeight: 900, marginTop: 4 } }, '☑ ' + (p.itensOk ? ntTxtProgresso(cont) : '…')) : null,
      resumo ? React.createElement('div', { style: { fontSize: 13, color: T.muted, marginTop: 4, lineHeight: 1.35, wordBreak: 'break-word' } }, resumo) : null
    ),
    React.createElement(NtCopiar, { nota: ntNotaParaCopia(n, p.itens) }),
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
    }, '📌') : null,
    // Apagar (canto inferior direito, afastado de copiar e fixar): pede confirmação; só em cartões editáveis.
    p.podeEditar ? React.createElement(NtCaixote, { nota: n, busy: p.apagarBusy, onApagar: p.onApagar }) : null
    )
  );
}

// Lista. "Por data": Ano > Mês > Semana; dentro de cada nível (e na lista direta,
// com menos de NT_LIMITE_LISTA notas), por importância e depois por data (ntPorImportanciaEDataDesc).
// "Por importância": 1 Importante, 2 Normal, 3 Baixo (por data dentro de cada nível).
// O bloco "Fixadas" fica no topo nas duas vistas. Só é montada depois de as notas carregarem, para o useState
// inicial já poder calcular o Set de minimizadas (tudo menos o atual; com filtros/pesquisa tudo aberto).
function NtLista(p) {
  var _s = React.useState(function () { return p.filtrando ? new Set() : ntMinimizadasIniciais(p.notas, new Date()); });
  var minim = _s[0], setMinim = _s[1];
  var largo = ntUseLargo();
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
    return React.createElement(NtLinha, { key: key, nota: n, recuo: recuo == null ? 20 : recuo, onOpen: p.onOpen, podeEditar: !p.readOnly, onFixar: p.onFixar, fixBusy: !!(p.fixBusy && p.fixBusy[n.id]), onApagar: p.onApagar, apagarBusy: p.busyId === n.id, onFeita: p.onFeita, feitaBusy: !!(p.feitaBusy && p.feitaBusy[n.id]), itens: ntELista(n) ? ntItensDaLista(p.itens, n.id) : null, itensOk: p.itensOk });
  };
  var filhos = [React.createElement('div', { key: 'topo', id: 'nt-topo', style: { scrollMarginTop: 70 } })];
  // Uma nota fixada aparece SÓ no bloco "Fixadas" (nas duas vistas); o resto é organizado abaixo.
  var fixadas = p.notas.filter(ntFixada).sort(ntPorDataDesc);
  var resto = p.notas.filter(function (n) { return !ntFixada(n); });
  // Poucas notas (visíveis, depois de pesquisa e filtros): lista direta, sem cabeçalhos Ano > Mês > Semana.
  var direta = p.modo !== 'imp' && p.notas.length < NT_LIMITE_LISTA;
  if (fixadas.length) {
    var fMin = minim.has('fixadas');
    filhos.push(React.createElement(NtGrupoCab, { key: 'g-fixadas', nivel: 0, fino: true, label: '📌 Fixadas', count: fixadas.length, minimizado: fMin, onToggle: function () { toggle('fixadas'); } }));
    if (!fMin) fixadas.forEach(function (n) { filhos.push(linha(n, 'fx-' + n.id)); });
    // Espaço a separar do resto da lista, só no telemóvel (no PC já há bastante respiro visual).
    if (resto.length && !largo) filhos.push(React.createElement('div', { key: 'sep-fixadas', style: { height: 14 } }));
  }
  if (direta) {
    resto.slice().sort(ntPorImportanciaEDataDesc).forEach(function (n) { filhos.push(linha(n, n.id, 0)); });
  } else if (p.modo === 'imp') {
    NT_IMP_ORDEM.forEach(function (nivel) {
      var doNivel = resto.filter(function (n) { return ntImp(n) === nivel; }).sort(ntPorDataDesc);
      if (!doNivel.length) return;
      var k = 'i-' + nivel, kMin = minim.has(k), d = NT_IMP[nivel];
      filhos.push(React.createElement(NtGrupoCab, { key: k, nivel: 0, label: d.num + ' · ' + d.rot, count: doNivel.length, minimizado: kMin, cor: ntCor(nivel), fino: true, onToggle: function () { toggle(k); } }));
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
  var agora = new Date();
  var aExpirar = p.notas.filter(function (n) { return ntDiasParaPurga(n, agora) <= 5; });
  return React.createElement('div', null,
    React.createElement('div', { style: { fontSize: 12, color: T.muted, fontWeight: 600, marginBottom: 4 } },
      'As notas no Lixo há mais de ' + NT_DIAS_LIXO + ' dias são apagadas definitivamente.'),
    aExpirar.length ? React.createElement('div', {
      role: 'alert',
      style: { background: ntAlfa('#F59E0B', 0.16), border: '1.5px solid #F59E0B', borderRadius: 12, padding: '10px 12px', marginTop: 8, fontSize: 13, fontWeight: 800 }
    }, '⚠️ ' + aExpirar.length + (aExpirar.length === 1 ? ' nota vai ser apagada definitivamente em 5 dias ou menos.' : ' notas vão ser apagadas definitivamente em 5 dias ou menos.')) : null,
    p.notas.map(function (n) {
      var dias = ntDiasParaPurga(n, agora);
      return React.createElement('div', { key: n.id, style: { position: 'relative', background: T.surface, border: '1px solid ' + T.border, borderLeft: '5px solid ' + T.muted, borderRadius: 12, padding: '11px 13px', marginTop: 8 } },
        React.createElement(NtCopiar, { nota: ntNotaParaCopia(n, ntELista(n) ? ntItensDaLista(p.itens, n.id) : null) }),
        React.createElement('div', { style: { fontSize: 16, fontWeight: 900, wordBreak: 'break-word', paddingRight: 44 } }, n.titulo),
        React.createElement('div', { style: { fontSize: 11, color: T.muted, marginTop: 3, fontWeight: 700, paddingRight: 44 } }, 'Apagada em ' + ntDataFmt(n.deleted_at)),
        React.createElement('div', { style: { fontSize: 11, color: dias <= 5 ? '#F59E0B' : T.muted, marginTop: 2, fontWeight: 800, paddingRight: 44 } },
          dias <= 0 ? 'Apaga definitivamente hoje' : ('Apaga definitivamente em ' + dias + (dias === 1 ? ' dia' : ' dias'))),
        ntELista(n) ? React.createElement('div', { style: { fontSize: 13, fontWeight: 900, marginTop: 4, paddingRight: 44 } }, '☑ Lista · ' + (p.itensOk ? ntTxtProgresso(ntContaItens(ntItensDaLista(p.itens, n.id))) : '…')) : null,
        ntResumo(n.texto) ? React.createElement('div', { style: { fontSize: 13, color: T.muted, marginTop: 4, wordBreak: 'break-word', paddingRight: 44 } }, ntResumo(n.texto)) : null,
        p.readOnly ? null : React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 10 } },
          React.createElement(NtBtn, { small: true, flex: true, disabled: p.busyId === n.id, onClick: function () { p.onRestaurar(n); } }, 'Restaurar'),
          React.createElement(NtBtn, { small: true, flex: true, kind: 'danger', disabled: p.busyId === n.id, onClick: function () { p.onApagarDef(n); } }, 'Apagar de vez')
        )
      );
    })
  );
}

// Aviso de erro de gravação, visível no ecrã (não só na consola), com a mensagem real do Supabase.
function NtAvisoErro(p) {
  return React.createElement('div', {
    role: 'alert',
    style: { background: '#7f1d1d', border: '1px solid #ef4444', borderRadius: 12, padding: '10px 12px', color: '#fff', marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 10 }
  },
    React.createElement('div', { style: { flex: 1, fontSize: 13, fontWeight: 700, wordBreak: 'break-word' } },
      React.createElement('div', { style: { fontWeight: 900, marginBottom: 2 } }, '⚠️ Não foi gravado'),
      p.texto),
    React.createElement('button', { type: 'button', 'aria-label': 'Fechar aviso', onClick: p.onFechar,
      style: { background: 'none', border: 'none', color: '#fff', fontSize: 18, fontWeight: 900, cursor: 'pointer', minWidth: 32, minHeight: 32 } }, '✕')
  );
}

function NtVista(p) {
  var n = p.nota;
  var cp = ntUseCopia();
  var imp = ntImp(n), fix = ntFixada(n);
  var cor = ntCor(imp);
  // Ações secundárias: pequenas e discretas. Editar é o botão principal; Apagar vai para o fundo, separado.
  var peq = { minHeight: 36, padding: '6px 12px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', background: 'transparent', color: T.muted, border: '1px solid ' + T.border };
  var ativo = { background: NT_ACENTO, color: '#fff', border: '1px solid ' + NT_ACENTO };
  return React.createElement('div', null,
    React.createElement('div', { style: { fontSize: 24, fontWeight: 900, lineHeight: 1.25, wordBreak: 'break-word', borderLeft: '3px solid ' + cor, paddingLeft: 12 } }, n.titulo),
    React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 8 } },
      React.createElement('span', { style: { fontSize: 12, color: T.muted, fontWeight: 700 } },
        'Criada ' + ntDataFmt(n.created_at) + (n.updated_at && n.updated_at !== n.created_at ? ' · editada ' + ntDataFmt(n.updated_at) : '') + (n.feita_em ? ' · feita em ' + ntDataFmt(n.feita_em) : '')),
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
      }, fix ? '📌 Desafixar' : '📌 Fixar'),
      p.onReabrir ? React.createElement('button', { type: 'button', 'aria-label': 'Reabrir nota', onClick: p.onReabrir, style: Object.assign({}, peq, ativo) }, '↩ Reabrir') : null
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

// Lista de compras aberta: progresso, artigos (texto à esquerda, quadrado grande à direita), novo artigo, limpar comprados, arquivar.
// Componente do módulo; só desenha e chama os callbacks (as gravações honestas estão no NotasApp).
function NtListaVista(p) {
  var n = p.nota;
  var cp = ntUseCopia();
  var _nv = React.useState(''); var novo = _nv[0], setNovo = _nv[1];
  var _ei = React.useState(null); var editId = _ei[0], setEditId = _ei[1];
  var _et = React.useState(''); var editTxt = _et[0], setEditTxt = _et[1];
  var refNovo = React.useRef(null);
  var itens = ntOrdenarItens(p.itens);
  var cont = ntContaItens(itens);
  var pend = itens.filter(function (x) { return !x.comprado; });
  var comp = itens.filter(function (x) { return x.comprado; });
  var imp = ntImp(n), fix = ntFixada(n), cor = ntCor(imp);
  var ro = !!p.readOnly;
  var notaCopia = ntNotaParaCopia(n, itens);
  var peq = { minHeight: 44, padding: '6px 12px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', background: 'transparent', color: T.muted, border: '1px solid ' + T.border };
  var ativo = { background: NT_ACENTO, color: '#fff', border: '1px solid ' + NT_ACENTO };
  var inp = { width: '100%', boxSizing: 'border-box', background: T.surface, color: T.text, border: '2px solid ' + T.border, borderRadius: 12, padding: '12px 13px', fontSize: 16, fontFamily: 'inherit', outline: 'none', minWidth: 0, minHeight: 48 };

  function adicionar() {
    var t = novo.trim();
    if (!t) return;
    p.onAdd(t).then(function (ok) {
      if (ok) { setNovo(''); if (refNovo.current && refNovo.current.focus) refNovo.current.focus(); } // a linha seguinte fica logo aberta
    });
  }
  function iniciarEdicao(x) { if (ro) return; setEditId(x.id); setEditTxt(x.texto); }
  function cancelarEdicao() { setEditId(null); setEditTxt(''); }
  function gravarEdicao(x) {
    var t = editTxt.trim();
    if (!t || t === x.texto) { cancelarEdicao(); return; } // vazio ou igual: não grava nada
    p.onEdit(x, t).then(function (ok) { if (ok) cancelarEdicao(); });
  }

  function linhaItem(x) {
    var ocupado = !!(p.itemBusy && p.itemBusy[x.id]);
    var emEdicao = editId === x.id;
    var btn44 = { flex: '0 0 auto', width: 44, height: 44, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, borderRadius: 12, fontSize: 18, fontWeight: 900, cursor: 'pointer', background: T.surface2, color: T.text, border: '1px solid ' + T.border };
    return React.createElement('div', { key: x.id, 'data-item': x.id, style: { display: 'flex', alignItems: 'center', gap: 8, minHeight: 60, padding: '6px 0', borderBottom: '1px solid ' + T.border } },
      emEdicao
        ? React.createElement('input', {
            type: 'text', value: editTxt, autoComplete: 'off', autoFocus: true, maxLength: NT_MAX_ITEM, 'aria-label': 'Editar artigo',
            onChange: function (e) { setEditTxt(e.target.value); },
            onKeyDown: function (e) { if (e.key === 'Enter') { e.preventDefault(); gravarEdicao(x); } else if (e.key === 'Escape') { cancelarEdicao(); } },
            style: Object.assign({}, inp, { flex: 1 })
          })
        : React.createElement('button', {
            type: 'button', disabled: ro, 'aria-label': 'Editar artigo ' + x.texto, onClick: function () { iniciarEdicao(x); },
            style: { flex: 1, minWidth: 0, minHeight: 48, textAlign: 'left', background: 'none', border: 'none', padding: '4px 2px', fontFamily: 'inherit', fontSize: 18, fontWeight: x.comprado ? 600 : 800, lineHeight: 1.25, wordBreak: 'break-word', cursor: ro ? 'default' : 'text',
              color: x.comprado ? T.muted : T.text, textDecoration: x.comprado ? 'line-through' : 'none' }
          }, x.texto),
      emEdicao
        ? [
          React.createElement('button', { key: 'ok', type: 'button', disabled: ocupado, 'aria-label': 'Guardar artigo', onClick: function () { gravarEdicao(x); }, style: Object.assign({}, btn44, ativo) }, '✓'),
          React.createElement('button', { key: 'no', type: 'button', 'aria-label': 'Cancelar edição', onClick: cancelarEdicao, style: btn44 }, '✕')
        ]
        : [
          ro ? null : React.createElement('button', { key: 'del', type: 'button', disabled: ocupado, 'aria-label': 'Apagar artigo ' + x.texto, title: 'Apagar artigo', onClick: function () { p.onDel(x); },
            style: Object.assign({}, btn44, { color: T.red, opacity: ocupado ? 0.55 : 1 }) }, '🗑'),
          React.createElement('button', { key: 'chk', type: 'button', disabled: ro || ocupado, 'aria-pressed': !!x.comprado, 'aria-label': (x.comprado ? 'Desmarcar ' : 'Marcar como comprado ') + x.texto, onClick: function () { p.onToggle(x); },
            style: { flex: '0 0 auto', width: 48, height: 48, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, borderRadius: 10, fontSize: 28, fontWeight: 900, lineHeight: 1, cursor: ro ? 'default' : 'pointer',
              border: '3px solid ' + NT_ACENTO, background: x.comprado ? NT_ACENTO : 'transparent', color: '#fff', opacity: ocupado ? 0.55 : 1 } }, x.comprado ? '✓' : '')
        ]
    );
  }

  return React.createElement('div', null,
    React.createElement('div', { style: { fontSize: 24, fontWeight: 900, lineHeight: 1.25, wordBreak: 'break-word', borderLeft: '3px solid ' + cor, paddingLeft: 12 } }, n.titulo),
    React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 8 } },
      React.createElement('span', { style: { fontSize: 12, color: T.muted, fontWeight: 700 } }, 'Lista criada ' + ntDataFmt(n.created_at) + (n.feita_em ? ' · arquivada em ' + ntDataFmt(n.feita_em) : '')),
      React.createElement(NtBadge, { imp: imp }),
      fix ? React.createElement('span', { style: { fontSize: 12, color: T.text, fontWeight: 800 } }, '📌 Fixada') : null
    ),
    // Progresso no topo
    React.createElement('div', { style: { marginTop: 16 } },
      React.createElement('div', { 'data-progresso': '1', style: { fontSize: 22, fontWeight: 900 } }, p.itensOk ? (cont.comprados + '/' + cont.total + ' comprados') : 'A carregar artigos…'),
      React.createElement('div', { style: { height: 8, borderRadius: 6, background: T.surface2, border: '1px solid ' + T.border, marginTop: 6, overflow: 'hidden' } },
        React.createElement('div', { style: { height: '100%', width: (cont.total ? Math.round(cont.comprados / cont.total * 100) : 0) + '%', background: NT_ACENTO } }))
    ),
    p.itensErro ? React.createElement('div', { role: 'alert', style: { color: T.red, fontSize: 13, fontWeight: 800, marginTop: 8 } }, p.itensErro) : null,
    // Artigos por comprar
    React.createElement('div', { style: { marginTop: 10 } }, pend.map(linhaItem)),
    // Novo artigo (Enter adiciona e mantém a linha seguinte aberta)
    ro ? null : React.createElement('div', { style: { display: 'flex', gap: 8, alignItems: 'center', marginTop: 10 } },
      React.createElement('input', {
        ref: refNovo, type: 'text', name: 'novo-artigo', value: novo, autoComplete: 'off', placeholder: 'Novo artigo…', maxLength: NT_MAX_ITEM, 'aria-label': 'Novo artigo',
        onChange: function (e) { setNovo(e.target.value); },
        onKeyDown: function (e) { if (e.key === 'Enter') { e.preventDefault(); adicionar(); } },
        style: Object.assign({}, inp, { flex: 1, borderColor: NT_ACENTO })
      }),
      React.createElement('button', { type: 'button', 'aria-label': 'Adicionar artigo', disabled: !novo.trim(), onClick: adicionar,
        style: { flex: '0 0 auto', width: 48, height: 48, boxSizing: 'border-box', borderRadius: 12, border: 'none', background: NT_ACENTO, color: '#fff', fontSize: 26, fontWeight: 900, cursor: novo.trim() ? 'pointer' : 'default', opacity: novo.trim() ? 1 : 0.5 } }, '＋')
    ),
    // Comprados (riscados, no fim)
    comp.length ? React.createElement('div', { style: { marginTop: 18, fontSize: 12, fontWeight: 800, color: T.muted, letterSpacing: 0.5 } }, 'COMPRADOS (' + comp.length + ')') : null,
    comp.length ? React.createElement('div', { style: { marginTop: 4 } }, comp.map(linhaItem)) : null,
    !itens.length && p.itensOk ? React.createElement('div', { style: { textAlign: 'center', color: T.muted, padding: '24px 10px', fontSize: 14, fontWeight: 600 } }, ro ? 'Lista vazia.' : 'Lista vazia. Escreve o primeiro artigo acima e carrega em Enter.') : null,
    // Ações
    React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20 } },
      React.createElement('button', { type: 'button', 'aria-label': cp.feito ? 'Lista copiada' : 'Copiar a lista', onClick: function () { cp.copiar(notaCopia); }, style: Object.assign({}, peq, cp.feito ? ativo : {}) }, cp.feito ? '✓ Copiada' : '📋 Copiar'),
      React.createElement('button', { type: 'button', 'aria-label': 'Partilhar a lista', onClick: function () { ntPartilhar(notaCopia, cp); }, style: peq }, '📤 Partilhar'),
      ro ? null : React.createElement('button', { type: 'button', disabled: !!p.fixBusy, 'aria-pressed': fix, 'aria-label': fix ? 'Desafixar nota' : 'Fixar nota', onClick: p.onFixar,
        style: Object.assign({}, peq, fix ? ativo : {}, p.fixBusy ? { opacity: 0.55, cursor: 'default' } : {}) }, fix ? '📌 Desafixar' : '📌 Fixar'),
      ro ? null : React.createElement('button', { type: 'button', 'aria-label': 'Editar título e importância', onClick: p.onEditar, style: peq }, '✏️ Título')
    ),
    ro ? null : React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 16 } },
      React.createElement(NtBtn, { flex: true, kind: 'ghost', disabled: !cont.comprados || !!p.limparBusy, onClick: p.onLimpar }, p.limparBusy ? 'A limpar…' : 'Limpar comprados'),
      React.createElement(NtBtn, { flex: true, disabled: !!p.feitaBusy, onClick: p.onArquivar }, 'Arquivar lista')
    ),
    ro && p.onReabrir ? React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 16 } },
      React.createElement(NtBtn, { flex: true, kind: 'ghost', disabled: !!p.feitaBusy, onClick: p.onReabrir }, '↩ Reabrir'),
      p.onUsarOutra ? React.createElement(NtBtn, { flex: true, disabled: !!p.usarBusy, onClick: p.onUsarOutra }, p.usarBusy ? 'A copiar…' : '↻ Usar outra vez') : null
    ) : null,
    ro ? null : React.createElement('div', { style: { marginTop: 56, paddingTop: 14, borderTop: '1px solid ' + T.border, textAlign: 'center' } },
      React.createElement('button', {
        type: 'button', disabled: !!p.busy, onClick: p.onApagar,
        style: { background: 'none', border: 'none', color: T.red, fontSize: 13, fontWeight: 700, minHeight: 44, padding: '6px 12px', cursor: p.busy ? 'default' : 'pointer', opacity: p.busy ? 0.55 : 1 }
      }, 'Apagar lista (vai para o Lixo)')
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
      type: 'text', value: p.titulo, autoComplete: 'off', placeholder: p.soTitulo ? 'Título da lista (ex.: Compras da semana)' : 'Título da nota', maxLength: 200,
      onChange: function (e) { p.onTitulo(e.target.value); }, style: inp
    }),
    p.soTitulo ? null : React.createElement('div', { style: { fontSize: 13, fontWeight: 800, color: T.muted, margin: '14px 0 6px' } }, 'Texto'),
    p.soTitulo ? null : React.createElement('textarea', {
      value: p.texto, autoComplete: 'off', placeholder: 'Escreve aqui…', rows: 12,
      onChange: function (e) { p.onTexto(e.target.value); }, style: Object.assign({}, inp, { resize: 'vertical', lineHeight: 1.45 })
    }),
    React.createElement('div', { style: { fontSize: 13, fontWeight: 800, color: T.muted, margin: '14px 0 6px' } }, 'Importância'),
    React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
      NT_IMP_ORDEM.map(function (k) {
        var d = NT_IMP[k];
        return React.createElement(NtChip, { key: k, ativo: p.imp === k, cor: ntCor(k), suave: true, disabled: p.saving, onClick: function () { p.onImp(k); } }, d.num + ' · ' + d.rot);
      })
    ),
    p.mostrarPasta ? React.createElement('div', { style: { fontSize: 13, fontWeight: 800, color: T.muted, margin: '14px 0 6px' } }, 'Pasta') : null,
    p.mostrarPasta ? React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
      NT_PASTAS.map(function (pa) {
        return React.createElement(NtChip, { key: pa.key, ativo: p.pasta === pa.key, disabled: p.saving, onClick: function () { p.onPasta(pa.key); } }, pa.icone + ' ' + pa.nome);
      })
    ) : null,
    p.erro ? React.createElement('div', { style: { color: T.red, fontSize: 13, fontWeight: 700, marginTop: 10 } }, p.erro) : null,
    p.conflito ? React.createElement(NtAvisoConflito, { baseConflito: p.baseConflito, saving: p.saving, onVerBase: p.onVerBase, onGravarPorCima: p.onGravarPorCima }) : null,
    React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 16 } },
      React.createElement(NtBtn, { flex: true, kind: 'ghost', disabled: p.saving, onClick: p.onCancelar }, 'Cancelar'),
      p.conflito ? null : React.createElement(NtBtn, { flex: true, disabled: p.saving || !p.titulo.trim(), onClick: p.onGuardar }, p.saving ? 'A guardar…' : (p.editando ? 'Guardar alterações' : (p.soTitulo ? 'Criar lista' : 'Criar nota')))
    )
  );
}

// Aviso de conflito entre aparelhos: outro aparelho gravou esta nota depois de o formulário ter aberto aqui.
// Nunca grava sozinho — só com uma das duas escolhas explícitas, cada uma com área de toque ≥44 px.
function NtAvisoConflito(p) {
  var b = p.baseConflito;
  return React.createElement('div', {
    style: { background: ntAlfa('#F59E0B', 0.14), border: '1.5px solid #F59E0B', borderRadius: 12, padding: 12, marginTop: 12 }
  },
    React.createElement('div', { style: { fontWeight: 800, fontSize: 14, marginBottom: 4 } }, '⚠️ Esta nota foi alterada noutro aparelho'),
    React.createElement('div', { style: { fontSize: 13, color: T.muted, marginBottom: 10 } }, 'As tuas alterações ainda NÃO foram gravadas. Escolhe uma opção.'),
    React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } },
      React.createElement(NtBtn, { kind: 'ghost', disabled: p.saving, onClick: p.onVerBase }, 'Ver a versão da base'),
      React.createElement(NtBtn, { kind: 'danger', disabled: p.saving, onClick: p.onGravarPorCima }, p.saving ? 'A gravar…' : 'Gravar por cima mesmo assim')
    ),
    b === 'a_carregar' ? React.createElement('div', { style: { fontSize: 13, color: T.muted, marginTop: 10 } }, 'A carregar a versão da base…') : null,
    b && b.erro ? React.createElement('div', { style: { color: T.red, fontSize: 13, fontWeight: 700, marginTop: 10 } }, 'Não foi possível ler a base: ' + b.erro) : null,
    b && b.nota ? React.createElement('div', { style: { background: T.surface, borderRadius: 10, padding: 10, marginTop: 10, fontSize: 13 } },
      React.createElement('div', { style: { fontWeight: 800, marginBottom: 4 } }, 'Versão da base (' + ntDataFmt(b.nota.updated_at) + '):'),
      React.createElement('div', { style: { fontWeight: 700, overflowWrap: 'anywhere' } }, b.nota.titulo),
      b.nota.texto ? React.createElement('div', { style: { color: T.muted, marginTop: 4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' } }, b.nota.texto) : null
    ) : null
  );
}

// Barra de topo das Notas. Só aspeto e área de toque: o voltar faz exactamente o mesmo de antes (onBack).
function NtTopBar(p) {
  return React.createElement('div', {
    style: {
      position: 'sticky', top: 0, zIndex: 200, boxSizing: 'border-box', minHeight: 56, display: 'flex', alignItems: 'center',
      background: T.surface, borderBottom: '1px solid ' + T.goldBrd, padding: '0 12px 0 4px'
    }
  },
    p.onBack ? React.createElement('button', {
      type: 'button', 'aria-label': 'Voltar', onClick: p.onBack,
      style: {
        flex: '1 1 auto', minWidth: 48, height: 56, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 6,
        background: 'none', border: 'none', padding: '0 8px', margin: 0, textAlign: 'left', cursor: 'pointer', color: T.text
      }
    },
      React.createElement('svg', { width: 30, height: 30, viewBox: '0 0 24 24', fill: 'none', stroke: T.gold, strokeWidth: 3.2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true', style: { flex: '0 0 30px' } },
        React.createElement('path', { d: 'M15 5 L8 12 L15 19' })),
      React.createElement('span', { style: { flex: '1 1 auto', minWidth: 0, fontWeight: 800, fontSize: 17, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, p.title)
    ) : React.createElement('span', { style: { flex: '1 1 auto', minWidth: 0, padding: '0 14px', fontWeight: 800, fontSize: 17, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, p.title),
    p.right ? React.createElement('div', { style: { flex: '0 1 auto', minWidth: 0, marginLeft: 8 } }, p.right) : null
  );
}

// ── COFRE DE PASSWORDS ──────────────────────────────────────────────
// ATENÇÃO: o código de 4 dígitos é um CADEADO DE ECRÃ, NÃO é encriptação. As passwords ficam em claro na tabela
// notas_cofre (protegida só por RLS: cada pessoa só lê as suas). Guardar aqui só passwords sem importância.
// Regras firmes: nada disto vai para localStorage/sessionStorage/IndexedDB/cache; nada vai para a consola nem para
// window.mostrarErro (só código + mensagem do Supabase, sem o conteúdo dos campos); as tabelas não entram no backup.
var NT_COFRE_ITER = 200000;
var NT_COFRE_BLOQUEIO_S = 60;
var NT_COFRE_TENTATIVAS = 5;
var NT_COFRE_TRANCA_MS = 60000;
var NT_COFRE_VER_MS = 10000;
var NT_COFRE_TENT = {}; // só em memória: { dono: { n, ate } } (contagem de erros seguidos e fim do bloqueio)

// Erro seguro para mostrar/registar: só código e mensagem (nunca details/hint, que podem trazer valores da linha).
function ntCofreErr(err) {
  var m = err && (err.message || err.msg);
  return { code: err && err.code ? err.code : undefined, message: m ? String(m) : 'Erro desconhecido' };
}
function ntCofreMsg(err) {
  var e = ntCofreErr(err);
  return (e.code ? '[' + e.code + '] ' : '') + e.message;
}
function ntCofreAvisar(op, err) { ntAvisar(op, ntCofreErr(err)); }

function ntBytesParaHex(buf) {
  var b = new Uint8Array(buf), s = '';
  for (var i = 0; i < b.length; i++) s += (b[i] < 16 ? '0' : '') + b[i].toString(16);
  return s;
}
function ntHexParaBytes(h) {
  var out = new Uint8Array(Math.floor(h.length / 2));
  for (var i = 0; i < out.length; i++) out[i] = parseInt(h.substr(i * 2, 2), 16);
  return out;
}
// PBKDF2-SHA256 (Web Crypto) do código com o salt (hex). Devolve Promise do hash em hex.
function ntCofreHash(pin, saltHex) {
  var c = window.crypto && window.crypto.subtle;
  if (!c) return Promise.reject(new Error('Este navegador não suporta Web Crypto.'));
  return c.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']).then(function (k) {
    return c.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: ntHexParaBytes(saltHex), iterations: NT_COFRE_ITER }, k, 256);
  }).then(ntBytesParaHex);
}
function ntCofreSaltNovo() {
  var b = new Uint8Array(16);
  window.crypto.getRandomValues(b);
  return ntBytesParaHex(b);
}
function ntCofreIgual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  var r = 0;
  for (var i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// Caixa "Passwords" (🔑). Sem contagem nem selos. Admin tem um botão pequeno "Códigos" (fora do botão principal).
function NtCaixaCofre(p) {
  var largo = ntUseLargo();
  return React.createElement('div', { style: { display: 'flex', flex: p.compacta || !largo ? undefined : '1 1 240px', width: p.compacta || !largo ? '100%' : undefined, marginBottom: p.compacta ? 14 : 0 } },
    React.createElement(NtCaixa, { largo: largo && !p.compacta, aria: 'Abrir ' + (p.rotulo || 'Passwords'), icone: p.icone || '🔑', titulo: p.rotulo || 'Passwords', onAbrir: p.onAbrir }));
}

// Teclado numérico: botões 0-9 e apagar, 4 pontos. Sem <input> (não abre o teclado do sistema, sem autocomplete).
function NtCofreTeclado(p) {
  var _d = React.useState(''); var dig = _d[0], setDig = _d[1];
  var toque = function (k) {
    if (p.disabled) return;
    if (k === 'del') { setDig(function (d) { return d.slice(0, -1); }); return; }
    var novo = dig + k;
    if (novo.length >= 4) { setDig(''); p.onCompleto(novo.slice(0, 4)); return; }
    setDig(novo);
  };
  var teclas = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];
  return React.createElement('div', { style: { maxWidth: 300, margin: '0 auto', textAlign: 'center' } },
    p.titulo ? React.createElement('div', { style: { fontSize: 16, fontWeight: 800, marginBottom: 12 } }, p.titulo) : null,
    React.createElement('div', { role: 'img', 'aria-label': dig.length + ' de 4 dígitos', style: { display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 16 } },
      [0, 1, 2, 3].map(function (i) {
        return React.createElement('span', { key: i, style: { width: 16, height: 16, borderRadius: 8, boxSizing: 'border-box', border: '2px solid ' + NT_ACENTO, background: i < dig.length ? NT_ACENTO : 'transparent' } });
      })),
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 } },
      teclas.map(function (k, i) {
        if (k === '') return React.createElement('span', { key: i });
        return React.createElement('button', {
          key: i, type: 'button', disabled: !!p.disabled, 'aria-label': k === 'del' ? 'Apagar' : k, onClick: function () { toque(k); },
          style: { minHeight: 60, boxSizing: 'border-box', background: T.surface2, color: T.text, border: '1px solid ' + T.border, borderRadius: 14, fontSize: 24, fontWeight: 800, cursor: p.disabled ? 'default' : 'pointer', opacity: p.disabled ? 0.5 : 1 }
        }, k === 'del' ? '⌫' : k);
      }))
  );
}

var ntCofreInp = { width: '100%', boxSizing: 'border-box', background: T.surface2, color: T.text, border: '1px solid ' + T.border, borderRadius: 10, padding: '11px 12px', fontSize: 16, fontFamily: 'inherit' };
var ntCofreMini = { background: T.surface2, color: T.text, border: '1px solid ' + T.border, borderRadius: 10, padding: '8px 12px', minHeight: 44, fontSize: 13, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' };

// Cofre da própria pessoa. Montado só no cartão próprio. Ao sair do ecrã (desmontar) tudo desaparece da memória.
function NtCofre(p) {
  var db = p.db, dono = p.dono;
  var _c = React.useState('a-carregar'); var estado = _c[0], setEstado = _c[1];   // a-carregar | sem-codigo | pedir | erro
  var _pn = React.useState(null); var pin = _pn[0], setPin = _pn[1];             // { salt, hash } (só memória)
  var _u = React.useState(false); var aberto = _u[0], setAberto = _u[1];
  var _en = React.useState([]); var entradas = _en[0], setEntradas = _en[1];
  var _ce = React.useState(false); var carregaEnt = _ce[0], setCarregaEnt = _ce[1];
  var _bq = React.useState(''); var busca = _bq[0], setBusca = _bq[1];
  var _vm = React.useState({}); var mostrar = _vm[0], setMostrar = _vm[1];       // id -> true enquanto a password está visível
  var _cp = React.useState(''); var copiado = _cp[0], setCopiado = _cp[1];       // "id:campo" com visto
  var _f = React.useState(null); var form = _f[0], setForm = _f[1];              // { id, titulo, utilizador, segredo, nota }
  var _fe = React.useState(''); var formErro = _fe[0], setFormErro = _fe[1];
  var _er = React.useState(''); var erro = _er[0], setErro = _er[1];
  var _ap = React.useState(null); var apagarId = _ap[0], setApagarId = _ap[1];
  var _bz = React.useState(false); var busy = _bz[0], setBusy = _bz[1];
  var _vr = React.useState(''); var verif = _vr[0], setVerif = _vr[1];           // '' | 'a-verificar'
  var _tk = React.useState(0); var tick = _tk[0], setTick = _tk[1];
  var _aa = React.useState(''); var aviso = _aa[0], setAviso = _aa[1];           // erro do teclado (código errado)
  var busyRef = React.useRef(false);
  var vivo = React.useRef(true);
  var tTranca = React.useRef(null);
  var tVer = React.useRef({});
  var tCopia = React.useRef(null);

  function limparTimersVer() { Object.keys(tVer.current).forEach(function (k) { clearTimeout(tVer.current[k]); }); tVer.current = {}; }
  // Tranca: LIMPA entradas, passwords mostradas, formulário e pesquisa da memória e volta a pedir o código.
  function trancar() {
    if (tTranca.current) { clearTimeout(tTranca.current); tTranca.current = null; }
    limparTimersVer();
    if (tCopia.current) { clearTimeout(tCopia.current); tCopia.current = null; }
    if (!vivo.current) return;
    setAberto(false); setEntradas([]); setMostrar({}); setCopiado(''); setForm(null); setFormErro('');
    setErro(''); setApagarId(null); setBusca(''); setAviso('');
  }
  function atividade() {
    if (!aberto) return;
    if (tTranca.current) clearTimeout(tTranca.current);
    tTranca.current = setTimeout(trancar, NT_COFRE_TRANCA_MS);
  }
  React.useEffect(function () {
    if (aberto) { if (tTranca.current) clearTimeout(tTranca.current); tTranca.current = setTimeout(trancar, NT_COFRE_TRANCA_MS); }
  }, [aberto]);
  React.useEffect(function () {
    var oculta = function () { if (document.hidden) trancar(); };
    document.addEventListener('visibilitychange', oculta);
    window.addEventListener('pagehide', trancar);
    return function () {
      vivo.current = false;
      document.removeEventListener('visibilitychange', oculta);
      window.removeEventListener('pagehide', trancar);
      if (tTranca.current) clearTimeout(tTranca.current);
      if (tCopia.current) clearTimeout(tCopia.current);
      Object.keys(tVer.current).forEach(function (k) { clearTimeout(tVer.current[k]); });
    };
  }, []);

  React.useEffect(function () {
    if (!db) { setEstado('erro'); setErro('Sem ligação ao servidor.'); return; }
    db.from('notas_cofre_pin').select('salt,hash').eq('dono', dono).then(function (res) {
      if (!vivo.current) return;
      if (res && res.error) { ntCofreAvisar('ler o código do cofre', res.error); setErro('Não foi possível abrir o cofre: ' + ntCofreMsg(res.error)); setEstado('erro'); return; }
      var r = res && res.data && res.data[0];
      if (!r || !r.salt || !r.hash) { setEstado('sem-codigo'); return; }
      setPin({ salt: r.salt, hash: r.hash }); setEstado('pedir');
    }).catch(function (e) { ntCofreAvisar('ler o código do cofre', e); if (vivo.current) { setErro('Não foi possível abrir o cofre: ' + ntCofreMsg(e)); setEstado('erro'); } });
  }, []);

  // Bloqueio por erros seguidos: contador visível a descer.
  var tent = NT_COFRE_TENT[dono] || { n: 0, ate: 0 };
  var restante = Math.max(0, Math.ceil((tent.ate - Date.now()) / 1000));
  React.useEffect(function () {
    if (!restante) return;
    var iv = setInterval(function () { setTick(function (t) { return t + 1; }); }, 1000);
    return function () { clearInterval(iv); };
  }, [restante > 0]);

  function carregarEntradas() {
    setCarregaEnt(true);
    db.from('notas_cofre').select('id,titulo,utilizador,segredo,nota,created_at').eq('dono', dono).order('titulo', { ascending: true }).then(function (res) {
      if (!vivo.current) return;
      setCarregaEnt(false);
      if (res && res.error) { ntCofreAvisar('carregar o cofre', res.error); setErro('Não foi possível carregar as entradas: ' + ntCofreMsg(res.error)); return; }
      setEntradas((res && res.data) || []);
    }).catch(function (e) { ntCofreAvisar('carregar o cofre', e); if (vivo.current) { setCarregaEnt(false); setErro('Não foi possível carregar as entradas: ' + ntCofreMsg(e)); } });
  }

  function tentar(codigo) {
    if (!pin || verif || restante) return;
    setVerif('a-verificar'); setAviso('');
    ntCofreHash(codigo, pin.salt).then(function (h) {
      if (!vivo.current) return;
      setVerif('');
      if (ntCofreIgual(h, pin.hash)) {
        NT_COFRE_TENT[dono] = { n: 0, ate: 0 };
        setErro(''); setAberto(true); carregarEntradas();
        return;
      }
      var t = NT_COFRE_TENT[dono] || { n: 0, ate: 0 };
      var n = t.n + 1;
      if (n >= NT_COFRE_TENTATIVAS) { NT_COFRE_TENT[dono] = { n: 0, ate: Date.now() + NT_COFRE_BLOQUEIO_S * 1000 }; setAviso(''); }
      else { NT_COFRE_TENT[dono] = { n: n, ate: 0 }; setAviso('Código errado (' + n + ' de ' + NT_COFRE_TENTATIVAS + ').'); }
      setTick(function (x) { return x + 1; });
    }).catch(function (e) { ntCofreAvisar('verificar o código do cofre', e); if (vivo.current) { setVerif(''); setErro('Não foi possível verificar o código: ' + ntCofreMsg(e)); } });
  }

  function ver(id) {
    setMostrar(function (m) { var n = Object.assign({}, m); n[id] = true; return n; });
    if (tVer.current[id]) clearTimeout(tVer.current[id]);
    tVer.current[id] = setTimeout(function () {
      delete tVer.current[id];
      if (vivo.current) setMostrar(function (m) { var n = Object.assign({}, m); delete n[id]; return n; });
    }, NT_COFRE_VER_MS);
  }
  function esconder(id) {
    if (tVer.current[id]) { clearTimeout(tVer.current[id]); delete tVer.current[id]; }
    setMostrar(function (m) { var n = Object.assign({}, m); delete n[id]; return n; });
  }
  function copiar(e, campo) {
    var valor = campo === 'segredo' ? e.segredo : e.utilizador;
    ntCopiarTexto(valor || '').then(function () {
      if (!vivo.current) return;
      setCopiado(e.id + ':' + campo);
      if (tCopia.current) clearTimeout(tCopia.current);
      tCopia.current = setTimeout(function () { tCopia.current = null; if (vivo.current) setCopiado(''); }, 1500);
    }, function () {
      ntAvisar('copiar do cofre', { message: 'Não foi possível copiar para a área de transferência.' });
      if (vivo.current) setErro('Não foi possível copiar para a área de transferência.');
    });
  }

  function abrirNova() { setFormErro(''); setErro(''); setForm({ id: null, titulo: '', utilizador: '', segredo: '', nota: '' }); }
  function abrirEditar(e) { setFormErro(''); setErro(''); setForm({ id: e.id, titulo: e.titulo || '', utilizador: e.utilizador || '', segredo: e.segredo || '', nota: e.nota || '' }); }
  function cancelarForm() { setForm(null); setFormErro(''); }
  function campo(k, v) { setForm(function (f) { var n = Object.assign({}, f); n[k] = v; return n; }); }

  function guardar() {
    if (busyRef.current || !form) return;
    var titulo = form.titulo.trim();
    if (!titulo) { setFormErro('O título é obrigatório.'); return; }
    busyRef.current = true; setBusy(true); setFormErro('');
    var dados = { titulo: titulo, utilizador: form.utilizador, segredo: form.segredo, nota: form.nota };
    var idForm = form.id;
    var q;
    if (idForm) q = db.from('notas_cofre').update(Object.assign({}, dados, { updated_at: new Date().toISOString() })).eq('id', idForm).select('id');
    else { var id = ntNovoId(); dados.id = id; dados.dono = dono; q = db.from('notas_cofre').insert(dados).select('id'); }
    q.then(function (res) {
      if (!vivo.current) return;
      var oQue = idForm ? 'guardar as alterações' : 'criar a entrada';
      if (res && res.error) { ntCofreAvisar(oQue + ' no cofre', res.error); setFormErro('Não foi possível ' + oQue + ': ' + ntCofreMsg(res.error)); return; }
      if (!res || !res.data || !res.data.length) { ntAvisar(oQue + ' no cofre', { message: NT_ZERO_LINHAS }); setFormErro('Não foi possível ' + oQue + ': ' + NT_ZERO_LINHAS); return; }
      var nova = { id: idForm || dados.id, titulo: titulo, utilizador: form.utilizador, segredo: form.segredo, nota: form.nota };
      setEntradas(function (prev) {
        var lista = idForm ? prev.map(function (x) { return x.id === idForm ? Object.assign({}, x, nova) : x; }) : prev.concat([nova]);
        return lista.slice().sort(function (a, b) { return ntNorm(a.titulo) < ntNorm(b.titulo) ? -1 : ntNorm(a.titulo) > ntNorm(b.titulo) ? 1 : 0; });
      });
      if (idForm) esconder(idForm);
      setForm(null);
    }).catch(function (e) {
      ntCofreAvisar('gravar no cofre', e);
      if (vivo.current) setFormErro('Não foi possível gravar: ' + ntCofreMsg(e));
    }).then(function () { busyRef.current = false; if (vivo.current) setBusy(false); });
  }

  function apagar(e) {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); setErro('');
    db.from('notas_cofre').delete().eq('id', e.id).select('id').then(function (res) {
      if (!vivo.current) return;
      if (res && res.error) { ntCofreAvisar('apagar do cofre', res.error); setErro('Não foi possível apagar: ' + ntCofreMsg(res.error)); return; }
      if (!res || !res.data || !res.data.length) { ntAvisar('apagar do cofre', { message: NT_ZERO_LINHAS }); setErro('Não foi possível apagar: ' + NT_ZERO_LINHAS); return; }
      esconder(e.id);
      setEntradas(function (prev) { return prev.filter(function (x) { return x.id !== e.id; }); });
      setApagarId(null);
    }).catch(function (er) {
      ntCofreAvisar('apagar do cofre', er);
      if (vivo.current) setErro('Não foi possível apagar: ' + ntCofreMsg(er));
    }).then(function () { busyRef.current = false; if (vivo.current) setBusy(false); });
  }

  var nota = function (txt, cor) { return React.createElement('div', { style: { textAlign: 'center', color: cor || T.muted, fontWeight: 700, fontSize: 14, padding: '24px 10px' } }, txt); };
  var corpo;
  if (estado === 'a-carregar') corpo = nota('A carregar…');
  else if (estado === 'erro') corpo = erro ? null : nota('Não foi possível abrir o cofre.');
  else if (estado === 'sem-codigo') corpo = nota('O Patricio ainda não definiu o teu código');
  else if (!aberto) {
    corpo = React.createElement('div', { style: { padding: '8px 0' } },
      React.createElement(NtCofreTeclado, { titulo: restante ? 'Cofre bloqueado' : 'Introduz o código', onCompleto: tentar, disabled: !!restante || !!verif }),
      restante ? React.createElement('div', { role: 'alert', style: { textAlign: 'center', color: T.red, fontWeight: 800, marginTop: 14 } }, 'Demasiados erros. Espera ' + restante + ' s.') :
        aviso ? React.createElement('div', { role: 'alert', style: { textAlign: 'center', color: T.red, fontWeight: 800, marginTop: 14 } }, aviso) : null,
      React.createElement('div', { style: { textAlign: 'center', color: T.muted, fontSize: 12, fontWeight: 600, marginTop: 18 } }, 'Se te esqueceres do código, fala com o Patricio.'));
  } else if (form) {
    corpo = React.createElement('div', null,
      formErro ? React.createElement(NtAvisoErro, { texto: formErro, onFechar: function () { setFormErro(''); } }) : null,
      React.createElement('div', { style: { fontWeight: 900, fontSize: 17, marginBottom: 10 } }, form.id ? 'Editar entrada' : 'Nova entrada'),
      React.createElement('label', { style: { display: 'block', fontSize: 12, fontWeight: 800, color: T.muted, marginBottom: 4 } }, 'Título *'),
      React.createElement('input', { type: 'text', name: 'campo-a', value: form.titulo, autoComplete: 'off', onChange: function (e) { campo('titulo', e.target.value); }, style: Object.assign({}, ntCofreInp, { marginBottom: 10 }) }),
      React.createElement('label', { style: { display: 'block', fontSize: 12, fontWeight: 800, color: T.muted, marginBottom: 4 } }, 'Utilizador'),
      React.createElement('input', { type: 'text', name: 'campo-b', value: form.utilizador, autoComplete: 'off', autoCapitalize: 'off', autoCorrect: 'off', spellCheck: false, onChange: function (e) { campo('utilizador', e.target.value); }, style: Object.assign({}, ntCofreInp, { marginBottom: 10 }) }),
      React.createElement('label', { style: { display: 'block', fontSize: 12, fontWeight: 800, color: T.muted, marginBottom: 4 } }, 'Password'),
      React.createElement('input', { type: 'text', name: 'campo-c', value: form.segredo, autoComplete: 'off', autoCapitalize: 'off', autoCorrect: 'off', spellCheck: false, onChange: function (e) { campo('segredo', e.target.value); }, style: Object.assign({}, ntCofreInp, { marginBottom: 10 }) }),
      React.createElement('label', { style: { display: 'block', fontSize: 12, fontWeight: 800, color: T.muted, marginBottom: 4 } }, 'Nota'),
      React.createElement('textarea', { name: 'campo-d', value: form.nota, autoComplete: 'off', rows: 3, onChange: function (e) { campo('nota', e.target.value); }, style: Object.assign({}, ntCofreInp, { marginBottom: 14, resize: 'vertical' }) }),
      React.createElement('div', { style: { display: 'flex', gap: 10 } },
        React.createElement(NtBtn, { onClick: guardar, disabled: busy, flex: true }, busy ? 'A guardar…' : (form.id ? 'Guardar alterações' : 'Criar entrada')),
        React.createElement(NtBtn, { kind: 'ghost', onClick: cancelarForm, disabled: busy }, 'Cancelar')));
  } else {
    var q = ntNorm(busca.trim());
    var vis = entradas.filter(function (e) { return !q || ntNorm(e.titulo).indexOf(q) !== -1; });
    corpo = React.createElement('div', null,
      React.createElement(NtBtn, { onClick: abrirNova }, '+ Nova entrada'),
      entradas.length ? React.createElement('input', { type: 'search', name: 'cofre-pesquisa', value: busca, autoComplete: 'off', placeholder: 'Pesquisar por título', 'aria-label': 'Pesquisar por título', onChange: function (e) { setBusca(e.target.value); }, style: Object.assign({}, ntCofreInp, { marginTop: 14 }) }) : null,
      carregaEnt ? nota('A carregar…') : null,
      !carregaEnt && !entradas.length ? nota('Ainda não há passwords guardadas.') : null,
      !carregaEnt && entradas.length && !vis.length ? nota('Nenhuma entrada com esse título.') : null,
      React.createElement('div', { style: { marginTop: 14 } },
        vis.map(function (e) {
          var visivel = !!mostrar[e.id];
          return React.createElement('div', { key: e.id, style: { background: T.surface, border: '1px solid ' + T.border, borderRadius: 14, padding: '12px 14px', marginBottom: 10 } },
            React.createElement('div', { style: { fontWeight: 800, fontSize: 16, wordBreak: 'break-word' } }, e.titulo),
            e.utilizador ? React.createElement('div', { style: { fontSize: 14, color: T.muted, fontWeight: 600, wordBreak: 'break-word', marginTop: 2 } }, e.utilizador) : null,
            React.createElement('div', { 'data-cofre-pw': e.id, style: { fontSize: 16, fontWeight: 700, fontFamily: 'monospace', marginTop: 6, wordBreak: 'break-all' } }, visivel ? (e.segredo || '(vazia)') : '••••••'),
            e.nota ? React.createElement('div', { style: { fontSize: 13, color: T.muted, marginTop: 6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' } }, e.nota) : null,
            React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 } },
              React.createElement('button', { type: 'button', style: ntCofreMini, onClick: function () { if (visivel) esconder(e.id); else ver(e.id); } }, visivel ? 'Esconder' : 'Ver'),
              React.createElement('button', { type: 'button', style: ntCofreMini, onClick: function () { copiar(e, 'utilizador'); } }, copiado === e.id + ':utilizador' ? '✓ Copiado' : 'Copiar utilizador'),
              React.createElement('button', { type: 'button', style: ntCofreMini, onClick: function () { copiar(e, 'segredo'); } }, copiado === e.id + ':segredo' ? '✓ Copiado' : 'Copiar password'),
              React.createElement('button', { type: 'button', style: ntCofreMini, onClick: function () { abrirEditar(e); } }, 'Editar'),
              React.createElement('button', { type: 'button', style: Object.assign({}, ntCofreMini, { color: T.red }), onClick: function () { setApagarId(e.id); } }, 'Apagar')),
            apagarId === e.id ? React.createElement('div', { style: { marginTop: 10, border: '1px solid ' + T.red, borderRadius: 10, padding: 10 } },
              React.createElement('div', { style: { fontSize: 13, fontWeight: 700, marginBottom: 8 } }, 'Apagar de vez? Esta entrada não vai para o Lixo e não se pode desfazer.'),
              React.createElement('div', { style: { display: 'flex', gap: 8 } },
                React.createElement(NtBtn, { kind: 'danger', small: true, disabled: busy, onClick: function () { apagar(e); } }, busy ? 'A apagar…' : 'Apagar de vez'),
                React.createElement(NtBtn, { kind: 'ghost', small: true, disabled: busy, onClick: function () { setApagarId(null); } }, 'Cancelar'))) : null);
        })),
      React.createElement('div', { style: { textAlign: 'center', marginTop: 8 } },
        React.createElement('button', { type: 'button', style: ntCofreMini, onClick: trancar }, '🔒 Trancar agora')),
      React.createElement('div', { style: { textAlign: 'center', color: T.muted, fontSize: 12, fontWeight: 600, marginTop: 14 } }, 'Tranca sozinho ao fim de 1 minuto sem usar.'));
  }

  return React.createElement('div', { 'data-cofre': aberto ? 'aberto' : 'fechado', onPointerDown: atividade, onKeyDown: atividade, onClick: atividade, onInput: atividade },
    erro && !form ? React.createElement(NtAvisoErro, { texto: erro, onFechar: function () { setErro(''); } }) : null,
    corpo);
}

// Painel "Cofres da família" — SÓ para o admin e SÓ LEITURA. Abre com o código do PRÓPRIO admin (notas_cofre_pin do admin).
// Lê as entradas de Cristina/Lucas/Liam (política "cofre: admin lê"). Não faz NENHUM pedido de escrita.
// É um cadeado de ecrã, NÃO encriptação. Ao trancar, sair ou ir para segundo plano, limpa tudo da memória.
var NT_FAMILIA_PESSOAS = ['esposa', 'lucas', 'liam'];
function NtCofresFamilia(p) {
  var db = p.db, adminId = p.adminId;
  var _c = React.useState('a-carregar'); var estado = _c[0], setEstado = _c[1];   // a-carregar | sem-codigo | pedir | erro
  var _pn = React.useState(null); var pin = _pn[0], setPin = _pn[1];
  var _u = React.useState(false); var aberto = _u[0], setAberto = _u[1];
  var _ct = React.useState(null); var contas = _ct[0], setContas = _ct[1];       // { dono: nº de entradas }
  var _ps = React.useState(null); var pessoa = _ps[0], setPessoa = _ps[1];
  var _en = React.useState([]); var entradas = _en[0], setEntradas = _en[1];
  var _ce = React.useState(false); var carregaEnt = _ce[0], setCarregaEnt = _ce[1];
  var _bq = React.useState(''); var busca = _bq[0], setBusca = _bq[1];
  var _vm = React.useState({}); var mostrar = _vm[0], setMostrar = _vm[1];
  var _cp = React.useState(''); var copiado = _cp[0], setCopiado = _cp[1];
  var _er = React.useState(''); var erro = _er[0], setErro = _er[1];
  var _vr = React.useState(''); var verif = _vr[0], setVerif = _vr[1];
  var _tk = React.useState(0); var tick = _tk[0], setTick = _tk[1];
  var _aa = React.useState(''); var aviso = _aa[0], setAviso = _aa[1];
  var vivo = React.useRef(true);
  var tTranca = React.useRef(null);
  var tVer = React.useRef({});
  var tCopia = React.useRef(null);

  function limparTimersVer() { Object.keys(tVer.current).forEach(function (k) { clearTimeout(tVer.current[k]); }); tVer.current = {}; }
  function trancar() {
    if (tTranca.current) { clearTimeout(tTranca.current); tTranca.current = null; }
    limparTimersVer();
    if (tCopia.current) { clearTimeout(tCopia.current); tCopia.current = null; }
    if (!vivo.current) return;
    setAberto(false); setContas(null); setPessoa(null); setEntradas([]); setMostrar({}); setCopiado('');
    setErro(''); setBusca(''); setAviso('');
  }
  function atividade() {
    if (!aberto) return;
    if (tTranca.current) clearTimeout(tTranca.current);
    tTranca.current = setTimeout(trancar, NT_COFRE_TRANCA_MS);
  }
  React.useEffect(function () {
    if (aberto) { if (tTranca.current) clearTimeout(tTranca.current); tTranca.current = setTimeout(trancar, NT_COFRE_TRANCA_MS); }
  }, [aberto]);
  React.useEffect(function () {
    var oculta = function () { if (document.hidden) trancar(); };
    document.addEventListener('visibilitychange', oculta);
    window.addEventListener('pagehide', trancar);
    return function () {
      vivo.current = false;
      document.removeEventListener('visibilitychange', oculta);
      window.removeEventListener('pagehide', trancar);
      if (tTranca.current) clearTimeout(tTranca.current);
      if (tCopia.current) clearTimeout(tCopia.current);
      Object.keys(tVer.current).forEach(function (k) { clearTimeout(tVer.current[k]); });
    };
  }, []);

  React.useEffect(function () {
    if (!db) { setEstado('erro'); setErro('Sem ligação ao servidor.'); return; }
    db.from('notas_cofre_pin').select('salt,hash').eq('dono', adminId).then(function (res) {
      if (!vivo.current) return;
      if (res && res.error) { ntCofreAvisar('ler o código do cofre', res.error); setErro('Não foi possível abrir o painel: ' + ntCofreMsg(res.error)); setEstado('erro'); return; }
      var r = res && res.data && res.data[0];
      if (!r || !r.salt || !r.hash) { setEstado('sem-codigo'); return; }
      setPin({ salt: r.salt, hash: r.hash }); setEstado('pedir');
    }).catch(function (e) { ntCofreAvisar('ler o código do cofre', e); if (vivo.current) { setErro('Não foi possível abrir o painel: ' + ntCofreMsg(e)); setEstado('erro'); } });
  }, []);

  var tent = NT_COFRE_TENT[adminId] || { n: 0, ate: 0 };
  var restante = Math.max(0, Math.ceil((tent.ate - Date.now()) / 1000));
  React.useEffect(function () {
    if (!restante) return;
    var iv = setInterval(function () { setTick(function (t) { return t + 1; }); }, 1000);
    return function () { clearInterval(iv); };
  }, [restante > 0]);

  function carregarContas() {
    db.from('notas_cofre').select('dono').in('dono', NT_FAMILIA_PESSOAS).then(function (res) {
      if (!vivo.current) return;
      if (res && res.error) { ntCofreAvisar('contar entradas dos cofres', res.error); setErro('Não foi possível ler os cofres: ' + ntCofreMsg(res.error)); setContas({}); return; }
      var m = {}; ((res && res.data) || []).forEach(function (r) { m[r.dono] = (m[r.dono] || 0) + 1; }); setContas(m);
    }).catch(function (e) { ntCofreAvisar('contar entradas dos cofres', e); if (vivo.current) { setErro('Não foi possível ler os cofres: ' + ntCofreMsg(e)); setContas({}); } });
  }
  function abrirPessoa(d) {
    setPessoa(d); setEntradas([]); setBusca(''); setMostrar({}); limparTimersVer(); setErro(''); setCarregaEnt(true);
    db.from('notas_cofre').select('id,titulo,utilizador,segredo,nota,created_at').eq('dono', d).order('titulo', { ascending: true }).then(function (res) {
      if (!vivo.current) return;
      setCarregaEnt(false);
      if (res && res.error) { ntCofreAvisar('ler o cofre de outra pessoa', res.error); setErro('Não foi possível ler as entradas: ' + ntCofreMsg(res.error)); return; }
      setEntradas((res && res.data) || []);
    }).catch(function (e) { ntCofreAvisar('ler o cofre de outra pessoa', e); if (vivo.current) { setCarregaEnt(false); setErro('Não foi possível ler as entradas: ' + ntCofreMsg(e)); } });
  }
  function fecharPessoa() { limparTimersVer(); setPessoa(null); setEntradas([]); setMostrar({}); setBusca(''); setCopiado(''); carregarContas(); }

  function tentar(codigo) {
    if (!pin || verif || restante) return;
    setVerif('a-verificar'); setAviso('');
    ntCofreHash(codigo, pin.salt).then(function (h) {
      if (!vivo.current) return;
      setVerif('');
      if (ntCofreIgual(h, pin.hash)) { NT_COFRE_TENT[adminId] = { n: 0, ate: 0 }; setErro(''); setAberto(true); carregarContas(); return; }
      var t = NT_COFRE_TENT[adminId] || { n: 0, ate: 0 };
      var n = t.n + 1;
      if (n >= NT_COFRE_TENTATIVAS) { NT_COFRE_TENT[adminId] = { n: 0, ate: Date.now() + NT_COFRE_BLOQUEIO_S * 1000 }; setAviso(''); }
      else { NT_COFRE_TENT[adminId] = { n: n, ate: 0 }; setAviso('Código errado (' + n + ' de ' + NT_COFRE_TENTATIVAS + ').'); }
      setTick(function (x) { return x + 1; });
    }).catch(function (e) { ntCofreAvisar('verificar o código do cofre', e); if (vivo.current) { setVerif(''); setErro('Não foi possível verificar o código: ' + ntCofreMsg(e)); } });
  }

  function ver(id) {
    setMostrar(function (m) { var n = Object.assign({}, m); n[id] = true; return n; });
    if (tVer.current[id]) clearTimeout(tVer.current[id]);
    tVer.current[id] = setTimeout(function () {
      delete tVer.current[id];
      if (vivo.current) setMostrar(function (m) { var n = Object.assign({}, m); delete n[id]; return n; });
    }, NT_COFRE_VER_MS);
  }
  function esconder(id) {
    if (tVer.current[id]) { clearTimeout(tVer.current[id]); delete tVer.current[id]; }
    setMostrar(function (m) { var n = Object.assign({}, m); delete n[id]; return n; });
  }
  function copiar(e, campo) {
    ntCopiarTexto((campo === 'segredo' ? e.segredo : e.utilizador) || '').then(function () {
      if (!vivo.current) return;
      setCopiado(e.id + ':' + campo);
      if (tCopia.current) clearTimeout(tCopia.current);
      tCopia.current = setTimeout(function () { tCopia.current = null; if (vivo.current) setCopiado(''); }, 1500);
    }, function () {
      ntAvisar('copiar do cofre', { message: 'Não foi possível copiar para a área de transferência.' });
      if (vivo.current) setErro('Não foi possível copiar para a área de transferência.');
    });
  }

  var nota = function (txt, cor) { return React.createElement('div', { style: { textAlign: 'center', color: cor || T.muted, fontWeight: 700, fontSize: 14, padding: '24px 10px' } }, txt); };
  var corpo;
  if (estado === 'a-carregar') corpo = nota('A carregar…');
  else if (estado === 'erro') corpo = erro ? null : nota('Não foi possível abrir o painel.');
  else if (estado === 'sem-codigo') corpo = nota('O Patricio ainda não definiu o teu código');
  else if (!aberto) {
    corpo = React.createElement('div', { style: { padding: '8px 0' } },
      React.createElement(NtCofreTeclado, { titulo: restante ? 'Painel bloqueado' : 'Introduz o teu código', onCompleto: tentar, disabled: !!restante || !!verif }),
      restante ? React.createElement('div', { role: 'alert', style: { textAlign: 'center', color: T.red, fontWeight: 800, marginTop: 14 } }, 'Demasiados erros. Espera ' + restante + ' s.') :
        aviso ? React.createElement('div', { role: 'alert', style: { textAlign: 'center', color: T.red, fontWeight: 800, marginTop: 14 } }, aviso) : null);
  } else {
    var aviso2 = React.createElement('div', { style: { fontSize: 12, color: T.muted, fontWeight: 600, marginBottom: 10 } }, 'Estás a ver passwords de outra pessoa. Só para ajudar, não as partilhes.');
    var lerSo = React.createElement('div', { style: { display: 'inline-block', fontSize: 12, fontWeight: 800, color: T.muted, border: '1px solid ' + T.border, borderRadius: 8, padding: '3px 8px', marginBottom: 10 } }, '👁 Só leitura');
    var trancarBtn = React.createElement('div', { style: { textAlign: 'center', marginTop: 8 } }, React.createElement('button', { type: 'button', style: ntCofreMini, onClick: trancar }, '🔒 Trancar agora'));
    if (!pessoa) {
      corpo = React.createElement('div', null, aviso2, lerSo,
        NT_FAMILIA_PESSOAS.map(function (d) {
          var c = contas ? (contas[d] || 0) : null;
          return React.createElement('button', { key: d, type: 'button', 'aria-label': 'Abrir cofre de ' + NT_NOMES[d], onClick: function () { abrirPessoa(d); },
            style: { display: 'flex', alignItems: 'center', gap: 12, width: '100%', boxSizing: 'border-box', textAlign: 'left', background: T.surface, color: T.text, border: '2px solid ' + NT_ACENTO, borderRadius: 16, padding: '14px 14px', minHeight: 64, marginBottom: 10, cursor: 'pointer' } },
            React.createElement('span', { 'aria-hidden': 'true', style: { fontSize: 30 } }, NT_EMOJIS[d]),
            React.createElement('span', { style: { flex: 1, minWidth: 0 } },
              React.createElement('div', { style: { fontSize: 18, fontWeight: 900 } }, NT_NOMES[d]),
              React.createElement('div', { style: { fontSize: 12, color: T.muted, fontWeight: 600 } }, c === null ? '…' : c + (c === 1 ? ' entrada' : ' entradas'))),
            React.createElement('span', { style: { color: NT_ACENTO, fontSize: 26, fontWeight: 900 } }, '›'));
        }), trancarBtn);
    } else {
      var q = ntNorm(busca.trim());
      var vis = entradas.filter(function (e) { return !q || ntNorm(e.titulo).indexOf(q) !== -1; });
      corpo = React.createElement('div', null, aviso2,
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 } },
          React.createElement('button', { type: 'button', style: ntCofreMini, onClick: fecharPessoa }, '‹ Pessoas'),
          React.createElement('div', { style: { fontWeight: 900, fontSize: 17 } }, 'Cofre de ' + NT_NOMES[pessoa])),
        lerSo,
        entradas.length ? React.createElement('input', { type: 'search', name: 'cofre-pesquisa', value: busca, autoComplete: 'off', placeholder: 'Pesquisar por título', 'aria-label': 'Pesquisar por título', onChange: function (e) { setBusca(e.target.value); }, style: Object.assign({}, ntCofreInp, { marginBottom: 12 }) }) : null,
        carregaEnt ? nota('A carregar…') : null,
        !carregaEnt && !entradas.length && !erro ? nota('Sem entradas.') : null,
        !carregaEnt && entradas.length && !vis.length ? nota('Nenhuma entrada com esse título.') : null,
        vis.map(function (e) {
          var visivel = !!mostrar[e.id];
          return React.createElement('div', { key: e.id, style: { background: T.surface, border: '1px solid ' + T.border, borderRadius: 14, padding: '12px 14px', marginBottom: 10 } },
            React.createElement('div', { style: { fontWeight: 800, fontSize: 16, wordBreak: 'break-word' } }, e.titulo),
            e.utilizador ? React.createElement('div', { style: { fontSize: 14, color: T.muted, fontWeight: 600, wordBreak: 'break-word', marginTop: 2 } }, e.utilizador) : null,
            React.createElement('div', { style: { fontSize: 16, fontWeight: 700, fontFamily: 'monospace', marginTop: 6, wordBreak: 'break-all' } }, visivel ? (e.segredo || '(vazia)') : '••••••'),
            e.nota ? React.createElement('div', { style: { fontSize: 13, color: T.muted, marginTop: 6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' } }, e.nota) : null,
            React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 } },
              React.createElement('button', { type: 'button', style: ntCofreMini, onClick: function () { if (visivel) esconder(e.id); else ver(e.id); } }, visivel ? 'Esconder' : 'Ver'),
              React.createElement('button', { type: 'button', style: ntCofreMini, onClick: function () { copiar(e, 'utilizador'); } }, copiado === e.id + ':utilizador' ? '✓ Copiado' : 'Copiar utilizador'),
              React.createElement('button', { type: 'button', style: ntCofreMini, onClick: function () { copiar(e, 'segredo'); } }, copiado === e.id + ':segredo' ? '✓ Copiado' : 'Copiar password')));
        }),
        trancarBtn);
    }
  }
  return React.createElement('div', { 'data-cofre-familia': aberto ? 'aberto' : 'fechado', onPointerDown: atividade, onKeyDown: atividade, onClick: atividade, onInput: atividade },
    erro ? React.createElement(NtAvisoErro, { texto: erro, onFechar: function () { setErro(''); } }) : null,
    corpo);
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
  var _ps = React.useState(null); var pasta = _ps[0], setPasta = _ps[1];        // pasta aberta no cartão do Patricio (null = ecrã das caixas)
  var _fp = React.useState('privado'); var fPasta = _fp[0], setFPasta = _fp[1]; // pasta escolhida no formulário
  var _md = React.useState(ntLerVista); var modo = _md[0], setModoRaw = _md[1]; // data | imp (guardado só neste aparelho)
  var _bs = React.useState(''); var busca = _bs[0], setBusca = _bs[1];
  var _ff = React.useState(NT_FILTROS_VAZIOS); var filtros = _ff[0], setFiltros = _ff[1];
  var _fb = React.useState({}); var fixBusy = _fb[0], setFixBusy = _fb[1];
  var _eg = React.useState(''); var erroGrav = _eg[0], setErroGrav = _eg[1]; // erro de gravação visível (fixar)
  var _fe = React.useState({}); var feitaBusy = _fe[0], setFeitaBusy = _fe[1];   // pedidos "feita" em curso, por id
  var _bd = React.useState(null); var desfazer = _bd[0], setDesfazer = _bd[1];   // barra "Nota arquivada · Anular"
  var _ba = React.useState(''); var buscaArq = _ba[0], setBuscaArq = _ba[1];     // pesquisa dentro do Arquivo
  var _no = React.useState('lista'); var notaOrigem = _no[0], setNotaOrigem = _no[1]; // de onde se abriu a nota
  var _cm = React.useState(null); var cofreModo = _cm[0], setCofreModo = _cm[1]; // null | 'cofre' | 'familia' (cofre de passwords; 'familia' = painel só leitura do admin)
  var _cd = React.useState(null); var codigos = _cd[0], setCodigos = _cd[1];   // admin: { dono: true } de quem tem código (só colunas dono, updated_at)
  var _eu = React.useState(null); var editAbertaEm = _eu[0], setEditAbertaEm = _eu[1]; // updated_at da nota quando o formulário abriu (para detetar conflito)
  var _cf = React.useState(null); var conflito = _cf[0], setConflito = _cf[1]; // { idEd, patch } quando a base mudou desde que o formulário abriu
  var _cfb = React.useState(null); var baseConflito = _cfb[0], setBaseConflito = _cfb[1]; // 'a_carregar' | { nota } | { erro }
  var _lt = React.useState([]); var itens = _lt[0], setItens = _lt[1];           // artigos de todas as listas visíveis (uma linha por artigo)
  var _lo = React.useState(false); var itensOk = _lo[0], setItensOk = _lo[1];    // artigos já carregados
  var _le = React.useState(''); var erroItens = _le[0], setErroItens = _le[1];
  var _lbz = React.useState({}); var itemBusy = _lbz[0], setItemBusy = _lbz[1];   // artigos com pedido em curso, por id
  var _llb = React.useState(false); var limparBusy = _llb[0], setLimparBusy = _llb[1];
  var _lub = React.useState({}); var usarBusy = _lub[0], setUsarBusy = _lub[1];  // "usar outra vez" em curso, por id da lista
  var _ltp = React.useState('nota'); var fTipo = _ltp[0], setFTipo = _ltp[1];     // 'nota' | 'lista' (formulário aberto)
  var _am = React.useState({}); var arqMinim = _am[0], setArqMinim = _am[1];       // secções do Arquivo minimizadas ({ listas, notas }), só em memória
  var carregarItensRef = React.useRef(null);
  var desfazerTimer = React.useRef(null);
  React.useEffect(function () { return function () { if (desfazerTimer.current) clearTimeout(desfazerTimer.current); }; }, []);

  var db = window.supabaseClient;
  var listaIdsKey = notas.filter(ntELista).map(function (n) { return n.id; }).sort().join(','); // ids das listas (muda ao criar/apagar de vez)

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
  // Admin: quem já tem código no cofre. Lê SÓ dono e updated_at de notas_cofre_pin (nunca salt nem hash).
  React.useEffect(function () {
    if (!isAdmin || !db) return;
    var vivo = true;
    db.from('notas_cofre_pin').select('dono,updated_at').then(function (res) {
      if (!vivo) return;
      if (res && res.error) { ntCofreAvisar('ver quem tem código do cofre', res.error); setCodigos({}); setErroGrav('Não foi possível ver quem tem código: ' + ntCofreMsg(res.error)); return; }
      var m = {}; ((res && res.data) || []).forEach(function (r) { m[r.dono] = true; }); setCodigos(m);
    }).catch(function (e) { ntCofreAvisar('ver quem tem código do cofre', e); if (vivo) setCodigos({}); });
    return function () { vivo = false; };
  }, [isAdmin]);
  React.useEffect(function () { return window.csAoVoltarRede(function () { carregarRef.current(); carregarItensRef.current(); }); }, []);
  // Artigos das listas: lê quando as listas carregam/mudam e quando a app volta ao primeiro plano (ver o que a outra pessoa marcou).
  React.useEffect(function () { if (!loading) carregarItensRef.current(); }, [listaIdsKey, loading]);
  React.useEffect(function () {
    var f = function () { if (typeof document !== 'undefined' && document.visibilityState === 'visible') carregarItensRef.current(); };
    document.addEventListener('visibilitychange', f);
    return function () { document.removeEventListener('visibilitychange', f); };
  }, []);

  var podeEditar = cartao ? ntPodeEditar(cartao, myId) : false;
  var temCofre = !!cartao && cartao === myId && NT_MEMBROS.indexOf(myId) !== -1 && podeEditar; // só o cartão PRÓPRIO; nunca Família nem só leitura
  var usaPastas = cartao === 'patricio'; // só o cartão do Patricio tem caixas; os outros ficam como estão
  var doTodos = cartao ? notas.filter(function (n) { return n.dono === cartao; }) : [];
  var doCartao = usaPastas && pasta ? doTodos.filter(function (n) { return ntPasta(n) === pasta; }) : doTodos;
  var ativas = doCartao.filter(ntNaLista); // as arquivadas (feita_em) NÃO entram na lista, filtros, pesquisa, Fixadas nem por importância
  var arquivadas = doCartao.filter(ntNoArquivo).sort(function (a, b) { return new Date(b.feita_em) - new Date(a.feita_em); });
  var arquivadasVis = ntFiltrar(arquivadas, NT_FILTROS_VAZIOS, buscaArq, new Date());
  var lixo = doTodos.filter(function (n) { return !ntAtiva(n); }).sort(function (a, b) { return new Date(b.deleted_at) - new Date(a.deleted_at); });
  var notaSel = null;
  if (selId) { for (var i = 0; i < notas.length; i++) { if (notas[i].id === selId) { notaSel = notas[i]; break; } } }

  function setModo(m) { setModoRaw(m); ntGuardarVista(m); }
  function resetFiltros() { setBusca(''); setFiltros(NT_FILTROS_VAZIOS); setBuscaArq(''); }

  function abrirNova(tipo) {
    if (!podeEditar) return;
    var tp = tipo === 'lista' && cartao === 'familia' ? 'lista' : 'nota'; // listas só no cartão Família (o onClick passa o evento: ignora-o)
    setFTipo(tp);
    setEditId(null); setFTitulo(''); setFTexto(''); setFImp('normal'); setFPasta(usaPastas && pasta ? pasta : 'privado'); setFErro('');
    setEditAbertaEm(null); setConflito(null); setBaseConflito(null);
    setVista('form');
  }
  function abrirEditar(n) {
    if (!ntPodeEditar(n.dono, myId)) return;
    setFTipo(ntELista(n) ? 'lista' : 'nota');
    setEditId(n.id); setFTitulo(n.titulo); setFTexto(n.texto || ''); setFImp(ntImp(n)); setFPasta(ntPasta(n)); setFErro('');
    setEditAbertaEm(n.updated_at); setConflito(null); setBaseConflito(null);
    setVista('form');
  }
  function cancelarForm() {
    if (savingRef.current) return;
    setFErro(''); setConflito(null); setBaseConflito(null);
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
      if (usaPastas && fPasta !== ntPasta(anterior)) patch.pasta = fPasta; // mudar só a pasta envia só id e pasta
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
    var novaListaId = null; // id da lista nova (para abri-la depois de criada)
    var ehConflito = false; // editId: 0 linhas pode ser conflito (updated_at mudou noutro aparelho) em vez de erro genérico
    if (editId) {
      var idEd = editId;
      ehConflito = true;
      // Sem atualização otimista: só se mostra o resultado depois de a base confirmar (carregar a seguir).
      removeOptimistic = function () {};
      // Conflito entre aparelhos: só grava se o updated_at da base ainda for o que a nota tinha quando o
      // formulário abriu. Se outro aparelho gravou primeiro, o updated_at já não bate e vêm 0 linhas — nunca
      // sobrescreve sozinha (ver abaixo: mostra aviso com "Ver a versão da base" / "Gravar por cima mesmo assim").
      consulta = db.from('notas_notas').update(patch).eq('id', idEd).eq('updated_at', editAbertaEm).select('id');
    } else {
      var nova = { id: ntNovoId(), dono: cartao, titulo: titulo, texto: fTexto, importancia: fImp, fixada: false, pasta: usaPastas ? fPasta : 'privado', created_at: agoraIso, updated_at: agoraIso, deleted_at: null };
      setNotas(function (p) { return [nova].concat(p); });
      removeOptimistic = function () {
        setNotas(function (p) { return p.filter(function (n) { return n.id !== nova.id; }); });
      };
      var linhaNova = { id: nova.id, dono: nova.dono, titulo: nova.titulo, texto: nova.texto, created_at: agoraIso, updated_at: agoraIso };
      if (fImp !== 'normal') linhaNova.importancia = fImp; // 'normal' é o valor por omissão da coluna
      if (usaPastas && fPasta === 'geschaeft') linhaNova.pasta = 'geschaeft'; // 'privado' é o valor por omissão da coluna
      if (fTipo === 'lista' && cartao === 'familia') { nova.tipo = 'lista'; linhaNova.tipo = 'lista'; novaListaId = nova.id; } // lista de compras (coluna tipo)
      consulta = db.from('notas_notas').insert(linhaNova).select('id');
    }
    var ok = false;
    consulta.then(function (res) {
      savingRef.current = false;
      setSaving(false);
      if (res && res.error) {
        ntAvisarRes(editId ? 'editar nota' : 'criar nota', res.error);
        setFErro('Erro ao guardar: ' + ntMsgErro(res.error));
        removeOptimistic();
        return;
      }
      if (!res || !res.data || !res.data.length) { // 0 linhas afetadas
        if (ehConflito) { // conflito: outro aparelho gravou primeiro — nunca sobrescreve sozinha
          setConflito({ idEd: idEd, patch: patch });
          return;
        }
        ntAvisar(editId ? 'editar nota' : 'criar nota', new Error(NT_ZERO_LINHAS));
        setFErro('Erro ao guardar: ' + NT_ZERO_LINHAS);
        removeOptimistic();
        return;
      }
      ok = true;
      setFErro(''); setConflito(null); setBaseConflito(null);
      setFTitulo(''); setFTexto(''); setFImp('normal');
      var idFinal = editId;
      setEditId(null);
      if (usaPastas && !idFinal) setPasta(fPasta); // nota nova: abre a pasta onde ficou
      if (novaListaId) { setNotaOrigem('lista'); setSelId(novaListaId); setVista('nota'); } // lista nova: abre-a para escrever os artigos
      else setVista(idFinal ? 'nota' : 'lista');
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

  // "Ver a versão da base": lê a nota tal como está agora na base (sem gravar nada).
  function verVersaoDaBase() {
    if (!conflito || !db) return;
    setBaseConflito('a_carregar');
    db.from('notas_notas').select('titulo,texto,importancia,updated_at').eq('id', conflito.idEd).maybeSingle().then(function (res) {
      if (res && res.error) { ntAvisarRes('ver versão da base', res.error); setBaseConflito({ erro: ntMsgErro(res.error) }); return; }
      if (!res || !res.data) { setBaseConflito({ erro: 'Nota não encontrada na base (pode ter sido apagada).' }); return; }
      setBaseConflito({ nota: res.data });
    }).catch(function (e) {
      ntAvisar('ver versão da base', e);
      setBaseConflito({ erro: (e && e.message) || String(e) });
    });
  }

  // "Gravar por cima mesmo assim": grava o patch sem comparar updated_at — só depois de o utilizador escolher.
  function gravarPorCimaConflito() {
    if (!conflito || savingRef.current || !db) return;
    savingRef.current = true;
    setSaving(true);
    var idEd = conflito.idEd, patch = conflito.patch;
    db.from('notas_notas').update(patch).eq('id', idEd).select('id').then(function (res) {
      savingRef.current = false;
      setSaving(false);
      if (res && res.error) { ntAvisarRes('gravar por cima (conflito)', res.error); setFErro('Erro ao guardar: ' + ntMsgErro(res.error)); return; }
      if (!res || !res.data || !res.data.length) { ntAvisar('gravar por cima (conflito)', new Error(NT_ZERO_LINHAS)); setFErro('Erro ao guardar: ' + NT_ZERO_LINHAS); return; }
      setFErro(''); setConflito(null); setBaseConflito(null);
      setFTitulo(''); setFTexto(''); setFImp('normal');
      setEditId(null);
      setVista('nota');
      carregarRef.current();
    }).catch(function (e) {
      savingRef.current = false;
      setSaving(false);
      ntAvisar('gravar por cima (conflito)', e);
      setFErro('Erro de ligação: ' + ((e && e.message) || String(e)));
    });
  }

  // Fixar/desafixar: UPDATE só da coluna fixada, por id, com .select('id'). SEM atualização otimista: o ecrã só
  // muda DEPOIS de a base confirmar (1 linha). Erro ou 0 linhas afetadas = erro visível; nunca mostra "Fixada" sem gravar.
  // .then com verificação, .catch depois do .then, trava contra duplo clique.
  function alternarFixada(n) {
    if (!ntPodeEditar(n.dono, myId)) return;
    if (!db) return;
    var chave = 'fix:' + n.id;
    if (busyRef.current[chave]) return;
    var novo = !ntFixada(n);
    busyRef.current[chave] = true;
    setFixBusy(function (p) { var x = Object.assign({}, p); x[n.id] = true; return x; });
    setErroGrav('');
    var soltar = function () {
      busyRef.current[chave] = false;
      setFixBusy(function (p) { var x = Object.assign({}, p); delete x[n.id]; return x; });
    };
    var aplicar = function (v) {
      setNotas(function (p) { return p.map(function (x) { return x.id === n.id ? Object.assign({}, x, { fixada: v }) : x; }); });
    };
    var ok = false;
    db.from('notas_notas').update({ fixada: novo }).eq('id', n.id).select('id').then(function (res) {
      soltar();
      if (res && res.error) {
        ntAvisarRes('fixar nota', res.error);
        setErroGrav('Não foi possível ' + (novo ? 'fixar' : 'desafixar') + ' a nota: ' + ntMsgErro(res.error));
        return;
      }
      if (!res || !res.data || !res.data.length) {
        ntAvisar('fixar nota', new Error(NT_ZERO_LINHAS));
        setErroGrav('Não foi possível ' + (novo ? 'fixar' : 'desafixar') + ' a nota: ' + NT_ZERO_LINHAS);
        return;
      }
      ok = true;
      aplicar(novo);
    }).catch(function (e) {
      soltar();
      if (ok) { ntLog('depois de fixar', e); return; }
      ntAvisar('fixar nota', e);
      setErroGrav('Não foi possível ' + (novo ? 'fixar' : 'desafixar') + ' a nota: ' + ntMsgErro(e));
    });
  }

  // Marcar como feita / reabrir: UPDATE só de feita_em, por id, com .select('id'). NUNCA toca em deleted_at (o Arquivo não é o Lixo).
  // SEM atualização otimista: a nota só muda DEPOIS de a base confirmar 1 linha. Erro ou 0 linhas = erro visível (ntAvisar +
  // faixa NtAvisoErro com a mensagem real). .then com verificação, .catch depois do .then, trava contra duplo clique.
  function mudarFeita(n, valor, op, oQue, depois) {
    if (!ntPodeEditar(n.dono, myId)) return;
    if (!db) return;
    var chave = 'feita:' + n.id;
    if (busyRef.current[chave]) return;
    busyRef.current[chave] = true;
    setFeitaBusy(function (p) { var x = Object.assign({}, p); x[n.id] = true; return x; });
    setErroGrav('');
    var soltar = function () {
      busyRef.current[chave] = false;
      setFeitaBusy(function (p) { var x = Object.assign({}, p); delete x[n.id]; return x; });
    };
    var ok = false;
    db.from('notas_notas').update({ feita_em: valor }).eq('id', n.id).select('id').then(function (res) {
      soltar();
      if (res && res.error) {
        ntAvisarRes(op, res.error);
        setErroGrav('Não foi possível ' + oQue + ': ' + ntMsgErro(res.error));
        return;
      }
      if (!res || !res.data || !res.data.length) {
        ntAvisar(op, new Error(NT_ZERO_LINHAS));
        setErroGrav('Não foi possível ' + oQue + ': ' + NT_ZERO_LINHAS);
        return;
      }
      ok = true;
      setNotas(function (p) { return p.map(function (x) { return x.id === n.id ? Object.assign({}, x, { feita_em: valor }) : x; }); });
      if (depois) depois();
    }).catch(function (e) {
      soltar();
      if (ok) { ntLog('depois de ' + op, e); return; }
      ntAvisar(op, e);
      setErroGrav('Não foi possível ' + oQue + ': ' + ntMsgErro(e));
    });
  }
  function fecharDesfazer() {
    if (desfazerTimer.current) { clearTimeout(desfazerTimer.current); desfazerTimer.current = null; }
    setDesfazer(null);
  }
  function marcarFeita(n, extra) {
    mudarFeita(n, new Date().toISOString(), 'marcar nota como feita', 'marcar a nota como feita', function () {
      if (typeof extra === 'function') extra();
      if (desfazerTimer.current) clearTimeout(desfazerTimer.current);
      setDesfazer(n);
      desfazerTimer.current = setTimeout(function () { desfazerTimer.current = null; setDesfazer(null); }, 6000);
    });
  }
  function anularFeita(n) { fecharDesfazer(); mudarFeita(n, null, 'anular nota feita', 'anular (voltar a pôr a nota na lista)'); }
  function reabrir(n, depois) { mudarFeita(n, null, 'reabrir nota', 'reabrir a nota', depois); }

  // Mover para o Lixo / restaurar: UPDATE só de deleted_at, por id, com .select('id'). SEM atualização otimista: a nota só
  // sai da lista (ou do Lixo) DEPOIS de a base confirmar 1 linha. Erro ou 0 linhas afetadas = erro visível (ntAvisar + faixa
  // NtAvisoErro com a mensagem real). .then com verificação, .catch depois do .then, trava contra duplo clique.
  function mudarDeletedAt(n, valor, op, depois) {
    if (!ntPodeEditar(n.dono, myId)) return;
    if (!db || busyRef.current[n.id]) return;
    busyRef.current[n.id] = true; setBusyId(n.id);
    setErroGrav('');
    var soltar = function () { busyRef.current[n.id] = false; setBusyId(null); };
    var oQue = valor ? 'mover a nota para o Lixo' : 'restaurar a nota';
    var ok = false;
    db.from('notas_notas').update({ deleted_at: valor }).eq('id', n.id).select('id').then(function (res) {
      soltar();
      if (res && res.error) {
        ntAvisarRes(op, res.error);
        setErroGrav('Não foi possível ' + oQue + ': ' + ntMsgErro(res.error));
        return;
      }
      if (!res || !res.data || !res.data.length) {
        ntAvisar(op, new Error(NT_ZERO_LINHAS));
        setErroGrav('Não foi possível ' + oQue + ': ' + NT_ZERO_LINHAS);
        return;
      }
      ok = true;
      setNotas(function (p) { return p.map(function (x) { return x.id === n.id ? Object.assign({}, x, { deleted_at: valor }) : x; }); });
      if (depois) depois();
    }).catch(function (e) {
      soltar();
      if (ok) { ntLog('depois de ' + op, e); return; }
      ntAvisar(op, e);
      setErroGrav('Não foi possível ' + oQue + ': ' + ntMsgErro(e));
    });
  }
  function apagarParaLixo(n) {
    var volta = vista === 'arquivo' ? 'arquivo' : 'lista'; // apagar a partir do Arquivo não tira a pessoa do Arquivo
    mudarDeletedAt(n, new Date().toISOString(), 'apagar nota', function () { setSelId(null); setVista(volta); });
  }
  function restaurar(n) { mudarDeletedAt(n, null, 'restaurar nota'); }
  // Mesmo caminho para o "Apagar nota" da nota aberta e para o caixote da lista: confirmação e depois gravação honesta.
  function pedirApagar(n) {
    if (!ntPodeEditar(n.dono, myId)) return;
    if (busyRef.current[n.id]) return;
    if (typeof window.confirm === 'function' && !window.confirm('Mover “' + n.titulo + '” para o Lixo?')) return;
    apagarParaLixo(n);
  }

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

  // ── Listas de compras (cartão Família) ─────────────────────────────────────────
  // Artigos em notas_lista_itens, uma linha por artigo. Todas as escritas são honestas: SEM atualização otimista (o ecrã só
  // muda depois de a base confirmar), .select('id'), erro ou 0 linhas = ntAvisar + faixa NtAvisoErro com a mensagem real,
  // travas contra duplo clique (busyRef/itemBusy) e .catch com console.error depois do .then. Permissões: as da nota (ntPodeEditar).
  function carregarItens() {
    if (!db) return;
    var ids = listaIdsKey ? listaIdsKey.split(',') : [];
    if (!ids.length) { setItens([]); setItensOk(true); return; }
    db.from('notas_lista_itens').select('*').in('nota_id', ids).order('created_at', { ascending: true }).then(function (res) {
      if (res && res.error) {
        ntAvisarRes('carregar artigos das listas', res.error);
        setErroItens('Não foi possível carregar os artigos: ' + ntMsgErro(res.error));
        return;
      }
      setErroItens('');
      setItens((res && res.data) || []);
      setItensOk(true);
    }).catch(function (e) {
      ntAvisar('carregar artigos das listas', e);
      setErroItens('Não foi possível carregar os artigos: ' + ntMsgErro(e));
    });
  }
  carregarItensRef.current = carregarItens;

  function itemSoltar(chave, id) {
    busyRef.current[chave] = false;
    setItemBusy(function (p) { var x = Object.assign({}, p); delete x[id]; return x; });
  }
  // Marcar/desmarcar um artigo: UPDATE só desse artigo (por id) — duas pessoas a marcar artigos diferentes não se sobrepõem.
  function alternarItem(nota, x) {
    if (!nota || !ntPodeEditar(nota.dono, myId) || !db) return;
    var chave = 'item:' + x.id;
    if (busyRef.current[chave]) return;
    busyRef.current[chave] = true;
    setItemBusy(function (p) { var o = Object.assign({}, p); o[x.id] = true; return o; });
    setErroGrav('');
    var novo = !x.comprado, agora = new Date().toISOString();
    var patch = { comprado: novo, comprado_em: novo ? agora : null, updated_at: agora };
    var oQue = novo ? 'marcar o artigo como comprado' : 'desmarcar o artigo';
    var ok = false;
    db.from('notas_lista_itens').update(patch).eq('id', x.id).select('id').then(function (res) {
      itemSoltar(chave, x.id);
      if (res && res.error) { ntAvisarRes('marcar artigo', res.error); setErroGrav('Não foi possível ' + oQue + ': ' + ntMsgErro(res.error)); return; }
      if (!res || !res.data || !res.data.length) { ntAvisar('marcar artigo', new Error(NT_ZERO_LINHAS)); setErroGrav('Não foi possível ' + oQue + ': ' + NT_ZERO_LINHAS); return; }
      ok = true;
      setItens(function (p) { return p.map(function (y) { return y.id === x.id ? Object.assign({}, y, patch) : y; }); });
    }).catch(function (e) {
      itemSoltar(chave, x.id);
      if (ok) { ntLog('depois de marcar artigo', e); return; }
      ntAvisar('marcar artigo', e); setErroGrav('Não foi possível ' + oQue + ': ' + ntMsgErro(e));
    });
  }
  // Devolvem uma Promise que resolve true/false (nunca rejeita): o componente só limpa o campo quando a base confirmou.
  function adicionarItem(nota, texto) {
    var t = String(texto || '').trim().slice(0, NT_MAX_ITEM);
    if (!t || !nota || !ntPodeEditar(nota.dono, myId) || !db) return Promise.resolve(false);
    var chave = 'add:' + nota.id;
    if (busyRef.current[chave]) return Promise.resolve(false);
    busyRef.current[chave] = true;
    setErroGrav('');
    var agora = new Date().toISOString();
    var linha = { id: ntNovoId(), nota_id: nota.id, texto: t, comprado: false, created_at: agora, updated_at: agora };
    var ok = false;
    return db.from('notas_lista_itens').insert(linha).select('id').then(function (res) {
      busyRef.current[chave] = false;
      if (res && res.error) { ntAvisarRes('adicionar artigo', res.error); setErroGrav('Não foi possível adicionar o artigo: ' + ntMsgErro(res.error)); return false; }
      if (!res || !res.data || !res.data.length) { ntAvisar('adicionar artigo', new Error(NT_ZERO_LINHAS)); setErroGrav('Não foi possível adicionar o artigo: ' + NT_ZERO_LINHAS); return false; }
      ok = true;
      setItens(function (p) { return p.concat([linha]); });
      return true;
    }).catch(function (e) {
      busyRef.current[chave] = false;
      if (ok) { ntLog('depois de adicionar artigo', e); return true; }
      ntAvisar('adicionar artigo', e); setErroGrav('Não foi possível adicionar o artigo: ' + ntMsgErro(e));
      return false;
    });
  }
  function editarItem(nota, x, texto) {
    var t = String(texto || '').trim().slice(0, NT_MAX_ITEM);
    if (!t || !nota || !ntPodeEditar(nota.dono, myId) || !db) return Promise.resolve(false);
    var chave = 'item:' + x.id;
    if (busyRef.current[chave]) return Promise.resolve(false);
    busyRef.current[chave] = true;
    setItemBusy(function (p) { var o = Object.assign({}, p); o[x.id] = true; return o; });
    setErroGrav('');
    var patch = { texto: t, updated_at: new Date().toISOString() };
    var ok = false;
    return db.from('notas_lista_itens').update(patch).eq('id', x.id).select('id').then(function (res) {
      itemSoltar(chave, x.id);
      if (res && res.error) { ntAvisarRes('editar artigo', res.error); setErroGrav('Não foi possível editar o artigo: ' + ntMsgErro(res.error)); return false; }
      if (!res || !res.data || !res.data.length) { ntAvisar('editar artigo', new Error(NT_ZERO_LINHAS)); setErroGrav('Não foi possível editar o artigo: ' + NT_ZERO_LINHAS); return false; }
      ok = true;
      setItens(function (p) { return p.map(function (y) { return y.id === x.id ? Object.assign({}, y, patch) : y; }); });
      return true;
    }).catch(function (e) {
      itemSoltar(chave, x.id);
      if (ok) { ntLog('depois de editar artigo', e); return true; }
      ntAvisar('editar artigo', e); setErroGrav('Não foi possível editar o artigo: ' + ntMsgErro(e));
      return false;
    });
  }
  function apagarItem(nota, x) {
    if (!nota || !ntPodeEditar(nota.dono, myId) || !db) return;
    var chave = 'item:' + x.id;
    if (busyRef.current[chave]) return;
    busyRef.current[chave] = true;
    setItemBusy(function (p) { var o = Object.assign({}, p); o[x.id] = true; return o; });
    setErroGrav('');
    var ok = false;
    db.from('notas_lista_itens').delete().eq('id', x.id).select('id').then(function (res) {
      itemSoltar(chave, x.id);
      if (res && res.error) { ntAvisarRes('apagar artigo', res.error); setErroGrav('Não foi possível apagar o artigo: ' + ntMsgErro(res.error)); return; }
      if (!res || !res.data || !res.data.length) { ntAvisar('apagar artigo', new Error(NT_ZERO_LINHAS)); setErroGrav('Não foi possível apagar o artigo: ' + NT_ZERO_LINHAS); return; }
      ok = true;
      setItens(function (p) { return p.filter(function (y) { return y.id !== x.id; }); });
    }).catch(function (e) {
      itemSoltar(chave, x.id);
      if (ok) { ntLog('depois de apagar artigo', e); return; }
      ntAvisar('apagar artigo', e); setErroGrav('Não foi possível apagar o artigo: ' + ntMsgErro(e));
    });
  }
  // Limpar comprados: apaga SÓ os artigos riscados desta lista (nota_id + comprado = true).
  function limparComprados(nota) {
    if (!nota || !ntPodeEditar(nota.dono, myId) || !db) return;
    var chave = 'limpar:' + nota.id;
    if (busyRef.current[chave]) return;
    var nComp = ntItensDaLista(itens, nota.id).filter(function (x) { return x.comprado; }).length;
    if (!nComp) return;
    if (typeof window.confirm === 'function' && !window.confirm('Apagar os ' + nComp + ' artigos comprados desta lista?')) return;
    busyRef.current[chave] = true; setLimparBusy(true); setErroGrav('');
    var ok = false;
    db.from('notas_lista_itens').delete().eq('nota_id', nota.id).eq('comprado', true).select('id').then(function (res) {
      busyRef.current[chave] = false; setLimparBusy(false);
      if (res && res.error) { ntAvisarRes('limpar comprados', res.error); setErroGrav('Não foi possível limpar os comprados: ' + ntMsgErro(res.error)); return; }
      if (!res || !res.data || !res.data.length) { // outro aparelho já os tinha limpado: avisa e volta a ler
        ntAvisar('limpar comprados', new Error(NT_ZERO_LINHAS)); setErroGrav('Não foi possível limpar os comprados: ' + NT_ZERO_LINHAS);
        carregarItensRef.current();
        return;
      }
      ok = true;
      var apagados = {}; res.data.forEach(function (r) { apagados[r.id] = true; });
      setItens(function (p) { return p.filter(function (y) { return !apagados[y.id]; }); });
    }).catch(function (e) {
      busyRef.current[chave] = false; setLimparBusy(false);
      if (ok) { ntLog('depois de limpar comprados', e); return; }
      ntAvisar('limpar comprados', e); setErroGrav('Não foi possível limpar os comprados: ' + ntMsgErro(e));
    });
  }
  // "Usar outra vez" (Arquivo): copia a lista (título, importância e artigos) com tudo por riscar, como lista NOVA.
  // 1) insere a nota nova; 2) insere os artigos num só pedido; se o 2) falhar, apaga a nota nova (sem deixar lista vazia a meio).
  function usarOutraVez(n) {
    if (!ntELista(n) || !ntPodeEditar(n.dono, myId) || !db) return;
    var chave = 'usar:' + n.id;
    if (busyRef.current[chave]) return;
    busyRef.current[chave] = true; setUsarBusy(function (p) { var o = Object.assign({}, p); o[n.id] = true; return o; }); setErroGrav('');
    var soltar = function () { busyRef.current[chave] = false; setUsarBusy(function (p) { var o = Object.assign({}, p); delete o[n.id]; return o; }); };
    var agora = new Date().toISOString();
    var nova = { id: ntNovoId(), dono: n.dono, titulo: n.titulo, texto: '', tipo: 'lista', importancia: ntImp(n), fixada: false, pasta: 'privado', created_at: agora, updated_at: agora, deleted_at: null };
    var linhaNova = { id: nova.id, dono: nova.dono, titulo: nova.titulo, texto: '', tipo: 'lista', created_at: agora, updated_at: agora };
    if (ntImp(n) !== 'normal') linhaNova.importancia = ntImp(n);
    var novosItens = ntOrdenarItens(ntItensDaLista(itens, n.id)).map(function (x, i) {
      var t = new Date(Date.now() + i).toISOString(); // ordem de escrita preservada
      return { id: ntNovoId(), nota_id: nova.id, texto: x.texto, comprado: false, created_at: t, updated_at: t };
    });
    var falhou = function (op, err, msg) { soltar(); ntAvisar(op, err); setErroGrav('Não foi possível usar a lista outra vez: ' + msg); };
    var ok = false;
    db.from('notas_notas').insert(linhaNova).select('id').then(function (r1) {
      if (r1 && r1.error) { falhou('usar lista outra vez', r1.error, ntMsgErro(r1.error)); return; }
      if (!r1 || !r1.data || !r1.data.length) { falhou('usar lista outra vez', new Error(NT_ZERO_LINHAS), NT_ZERO_LINHAS); return; }
      var concluir = function () {
        ok = true; soltar();
        setNotas(function (p) { return [nova].concat(p); });
        setItens(function (p) { return p.concat(novosItens); });
        setNotaOrigem('lista'); setSelId(nova.id); setVista('nota');
      };
      if (!novosItens.length) { concluir(); return; }
      return db.from('notas_lista_itens').insert(novosItens).select('id').then(function (r2) {
        var erro2 = r2 && r2.error ? r2.error : ((!r2 || !r2.data || r2.data.length !== novosItens.length) ? new Error('Só ' + ((r2 && r2.data && r2.data.length) || 0) + ' de ' + novosItens.length + ' artigos foram gravados') : null);
        if (!erro2) { concluir(); return; }
        // limpeza: não deixar a lista nova sem artigos
        return db.from('notas_notas').delete().eq('id', nova.id).select('id').then(function (r3) {
          if (r3 && r3.error) ntAvisarRes('limpar lista nova', r3.error);
          falhou('usar lista outra vez (artigos)', erro2, ntMsgErro(erro2));
        });
      });
    }).catch(function (e) {
      if (ok) { ntLog('depois de usar a lista outra vez', e); return; }
      falhou('usar lista outra vez', e, ntMsgErro(e));
    });
  }

  function abrirNota(n, origem) { setNotaOrigem(origem === 'arquivo' ? 'arquivo' : 'lista'); setSelId(n.id); setVista('nota'); if (ntELista(n)) carregarItensRef.current(); }
  function voltar() {
    if (!cartao) { onBack(); return; }
    if (cofreModo) { setCofreModo(null); return; } // sair do cofre desmonta-o e tranca-o
    if (vista === 'form') { cancelarForm(); return; }
    if (vista === 'nota') { setSelId(null); setVista(notaOrigem === 'arquivo' ? 'arquivo' : 'lista'); return; }
    if (vista === 'lixo' || vista === 'arquivo') { setSelId(null); setVista('lista'); return; }
    if (usaPastas && pasta) { resetFiltros(); setPasta(null); return; } // da pasta volta às caixas
    setErroGrav('');
    resetFiltros();
    setCartao(null);
  }

  var titulo = 'Notas Carvalho';
  if (cartao && cofreModo && temCofre) {
    titulo = cofreModo === 'familia' && isAdmin ? 'Cofres da família' : 'Passwords';
  } else if (cartao) {
    titulo = (usaPastas && pasta ? ntNomePasta(pasta) : (cartao === myId && profile.display_name ? profile.display_name : NT_NOMES[cartao])) + (vista === 'lixo' ? ' · Lixo' : vista === 'arquivo' ? ' · Arquivo' : '');
  }
  var direita = null;
  if (cartao && vista === 'lista' && !cofreModo) {
    var estiloTopo = { background: 'none', border: '1px solid ' + T.border, color: T.text, borderRadius: 10, padding: '6px 9px', fontSize: 13, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' };
    direita = React.createElement('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', padding: '4px 0' } },
      usaPastas && !pasta ? null : React.createElement('button', { onClick: function () { setBuscaArq(''); setVista('arquivo'); }, style: estiloTopo }, '📦 Arquivo' + (arquivadas.length ? ' (' + arquivadas.length + ')' : '')),
      React.createElement('button', { onClick: function () { setVista('lixo'); }, style: estiloTopo }, '🗑 Lixo' + (lixo.length ? ' (' + lixo.length + ')' : ''))
    );
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
      isAdmin ? React.createElement('div', { style: { fontSize: 12, color: T.muted, fontWeight: 600, marginBottom: 12 } }, 'Códigos de 4 dígitos são um cadeado simples. Guarda só passwords sem importância.') : null,
      donos.map(function (d) {
        var n = notas.filter(function (x) { return x.dono === d && ntNaLista(x); }).length;
        var nome = d === myId && profile.display_name ? profile.display_name : NT_NOMES[d];
        var sub = (d === myId ? 'As minhas notas' : d === 'familia' ? 'Partilhadas por todos' : 'Só leitura') + ' · ' + n + (n === 1 ? ' nota' : ' notas');
        var temBloco = isAdmin && NT_MEMBROS.indexOf(d) !== -1;
        return React.createElement(NtCartaoDono, { key: d, emoji: NT_EMOJIS[d], nome: nome, sub: sub,
          codigo: temBloco ? React.createElement(NtCodigoCartao, { dono: d, nome: NT_NOMES[d], db: db, tem: codigos === null ? null : !!codigos[d], onErro: setErroGrav, onGravado: function (k) { setErroGrav(''); setCodigos(function (pr) { var n = Object.assign({}, pr || {}); n[k] = true; return n; }); } }) : null,
          onClick: function () { setVista('lista'); setSelId(null); resetFiltros(); setPasta(null); setCartao(d); } });
      }));
  } else if (cofreModo && temCofre) {
    corpo = cofreModo === 'familia'
      ? (isAdmin ? React.createElement(NtCofresFamilia, { key: 'familia|' + myId, db: db, adminId: myId }) : null)
      : React.createElement(NtCofre, { key: 'cofre|' + myId, db: db, dono: myId });
  } else if (vista === 'form') {
    corpo = React.createElement(NtForm, {
      titulo: fTitulo, texto: fTexto, imp: fImp, erro: fErro, saving: saving, editando: !!editId,
      mostrarPasta: usaPastas && podeEditar, pasta: fPasta, onPasta: setFPasta, soTitulo: fTipo === 'lista',
      onTitulo: setFTitulo, onTexto: setFTexto, onImp: setFImp, onGuardar: guardar, onCancelar: cancelarForm,
      conflito: conflito, baseConflito: baseConflito, onVerBase: verVersaoDaBase, onGravarPorCima: gravarPorCimaConflito
    });
  } else if (vista === 'nota') {
    corpo = notaSel && ntAtiva(notaSel) && ntELista(notaSel)
      ? React.createElement(NtListaVista, {
          nota: notaSel, itens: ntItensDaLista(itens, notaSel.id), itensOk: itensOk, itensErro: erroItens, itemBusy: itemBusy, limparBusy: limparBusy,
          readOnly: !podeEditar || ntFeita(notaSel), busy: busyId === notaSel.id, fixBusy: !!fixBusy[notaSel.id], feitaBusy: !!feitaBusy[notaSel.id], usarBusy: !!usarBusy[notaSel.id],
          onAdd: function (t) { return adicionarItem(notaSel, t); }, onEdit: function (x, t) { return editarItem(notaSel, x, t); },
          onToggle: function (x) { alternarItem(notaSel, x); }, onDel: function (x) { apagarItem(notaSel, x); }, onLimpar: function () { limparComprados(notaSel); },
          onArquivar: function () { marcarFeita(notaSel, function () { setSelId(null); setVista('lista'); }); },
          onReabrir: (podeEditar && ntFeita(notaSel)) ? function () { reabrir(notaSel, function () { setSelId(null); setVista('lista'); }); } : undefined,
          onUsarOutra: (podeEditar && ntFeita(notaSel)) ? function () { usarOutraVez(notaSel); } : undefined,
          onFixar: function () { alternarFixada(notaSel); }, onEditar: function () { abrirEditar(notaSel); }, onApagar: function () { pedirApagar(notaSel); }
        })
      : notaSel && ntAtiva(notaSel)
      ? React.createElement(NtVista, { nota: notaSel, readOnly: !podeEditar || ntFeita(notaSel), onReabrir: (podeEditar && ntFeita(notaSel)) ? function () { reabrir(notaSel, function () { setSelId(null); setVista('lista'); }); } : undefined, busy: busyId === notaSel.id, fixBusy: !!fixBusy[notaSel.id], onFixar: function () { alternarFixada(notaSel); }, onEditar: function () { abrirEditar(notaSel); }, onApagar: function () { pedirApagar(notaSel); } })
      : React.createElement('div', { style: { color: T.muted, textAlign: 'center', padding: 30 } }, 'Nota não encontrada.');
  } else if (vista === 'arquivo') {
    corpo = React.createElement(NtArquivo, {
      notas: arquivadasVis, total: arquivadas.length, busca: buscaArq, onBusca: setBuscaArq, readOnly: !podeEditar,
      onOpen: function (n) { abrirNota(n, 'arquivo'); }, onReabrir: function (n) { reabrir(n); }, onApagar: pedirApagar,
      feitaBusy: feitaBusy, busyId: busyId, itens: itens, itensOk: itensOk, usarBusy: usarBusy, onUsarOutra: usarOutraVez,
      secMinim: arqMinim, onSecao: function (k) { setArqMinim(function (pv) { var o = Object.assign({}, pv); o[k] = !o[k]; return o; }); }
    });
  } else if (vista === 'lixo') {
    corpo = React.createElement(NtLixoLista, { notas: lixo, readOnly: !podeEditar, busyId: busyId, onRestaurar: restaurar, onApagarDef: apagarDefinitivo, itens: itens, itensOk: itensOk });
  } else if (usaPastas && !pasta) {
    corpo = React.createElement(NtCaixas, { notas: doTodos.filter(ntNaLista), podeEditar: podeEditar, onNova: abrirNova, onAbrir: function (k) { resetFiltros(); setPasta(k); },
      cofre: temCofre ? { onAbrir: function () { setCofreModo('cofre'); }, onFamilia: isAdmin ? function () { setCofreModo('familia'); } : null } : null });
  } else {
    // Vista, pesquisa e filtros são só estado do ecrã: nunca gravam nem pedem nada ao Supabase.
    var filtrando = ntFiltrosAtivos(filtros, busca);
    var filtradas = ntFiltrar(ativas, filtros, busca, new Date());
    corpo = React.createElement('div', null,
      temCofre && !usaPastas ? React.createElement(NtCaixaCofre, { compacta: true, onAbrir: function () { setCofreModo('cofre'); }}) : null,
      podeEditar
        ? (cartao === 'familia'
          ? React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'stretch' } }, // só no cartão Família: + Nova nota | ☑ Nova lista, mesma altura
            React.createElement(NtBtn, { flex: true, onClick: abrirNova }, '+ Nova nota'),
            React.createElement(NtBtn, { flex: true, kind: 'contorno', onClick: function () { abrirNova('lista'); } }, '☑ Nova lista'))
          : React.createElement(NtBtn, { onClick: abrirNova }, '+ Nova nota'))
        : React.createElement('div', { style: { fontSize: 12, color: T.muted, fontWeight: 700 } }, '👁 Só leitura'),
      ativas.length ? React.createElement(NtFiltros, {
        modo: modo, onModo: setModo, busca: busca, onBusca: setBusca, filtros: filtros, onFiltros: setFiltros,
        total: ativas.length, imp: ativas.filter(function (n) { return ntImp(n) === 'importante'; }).length,
        mostradas: filtradas.length, filtrando: filtrando, onLimpar: resetFiltros
      }) : null,
      ativas.length && !filtradas.length
        ? React.createElement('div', { style: { textAlign: 'center', color: T.muted, padding: '40px 10px', fontSize: 14, fontWeight: 600 } }, 'Nenhuma nota com estes filtros')
        : React.createElement(NtLista, {
            key: cartao + '|' + modo + '|' + (filtrando ? 'f' : 'n'), notas: filtradas, readOnly: !podeEditar, modo: modo, filtrando: filtrando,
            onOpen: abrirNota, onFixar: alternarFixada, fixBusy: fixBusy, onApagar: pedirApagar, busyId: busyId, onFeita: function (n) { marcarFeita(n); }, feitaBusy: feitaBusy,
            itens: itens, itensOk: itensOk
          }));
  }

  return React.createElement('div', { style: Object.assign({}, wrap, { paddingBottom: 60 }) },
    React.createElement(NtTopBar, { onBack: voltar, title: titulo, right: direita }),
    React.createElement('div', { style: { padding: '16px 16px 0', maxWidth: 640, margin: '0 auto' } },
      erroGrav && vista !== 'form' ? React.createElement(NtAvisoErro, { texto: erroGrav, onFechar: function () { setErroGrav(''); } }) : null,
      corpo),
    desfazer ? React.createElement(NtBarraDesfazer, { onDesfazer: function () { anularFeita(desfazer); } }) : null
  );
}
