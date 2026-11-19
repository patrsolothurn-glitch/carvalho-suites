// ════════════════════════════════════════════════════════════════════════════
// APP CARVALHO SAÚDE — papéis clínicos organizados por Pessoa → Caso → Documentos, e lista de Zeugnis.
// Só admin (registo mínimo em src/10-shell.js; o cartão do menu acrescenta-se no fim deste ficheiro).
// App independente: tabelas saude_pessoas, saude_casos, saude_docs, saude_zeugnis e bucket PRIVADO saude-docs
// (ver SQL-SAUDE.md). Os ficheiros só se abrem por URL assinado de curta duração, nunca por URL público.
// Os dados clínicos NUNCA vão para o backup do GitHub (nem as tabelas nem o Storage); a cópia de segurança é
// o Drive do Patricio (âmbito drive.file, só os ficheiros que esta app cria).
// Regras: escritas honestas (.select('id'), erro real, 0 linhas = erro, ecrã só muda depois de a base confirmar),
// autocomplete="off" em todos os inputs, tudo o que se cria tem editar e apagar.
// ════════════════════════════════════════════════════════════════════════════

var SA_ACENTO = '#0EA5E9';
var SA_BUCKET = 'saude-docs';
var SA_MAX_BYTES = 15 * 1024 * 1024;       // igual ao limite do bucket
var SA_URL_SEGUNDOS = 300;                 // URL assinado de curta duração
var SA_MAX_NOME = 100, SA_MAX_TITULO = 150, SA_MAX_NOTAS = 2000, SA_MAX_MEDICO = 150, SA_MAX_LINK = 500;
var SA_TIPOS = [
  { key: 'exame', rot: 'Exame', emoji: '🧪' }, { key: 'relatorio', rot: 'Relatório', emoji: '📄' },
  { key: 'receita', rot: 'Receita', emoji: '💊' }, { key: 'zeugnis', rot: 'Zeugnis', emoji: '🏢' }, { key: 'outro', rot: 'Outro', emoji: '📎' }
];
var SA_MIMES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
var SA_EXT_MIME = { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', heic: 'image/heic', heif: 'image/heif' };
var SA_CORES = ['#E11D48', '#F59E0B', '#22C55E', '#0EA5E9', '#8B5CF6', '#EC4899'];
var SA_LS_PENDENTES = 'saude_ficheiros_pendentes';
var SA_LS_CLIENTE = 'saude_google_client_id';
var SA_DRIVE_PASTA = 'Carvalho Saude';

function saLog(op, err) { console.error('[saude] falha ao ' + op + ':', err); }
function saMsgErro(err) {
  var c = err && err.code, m = (err && (err.message || err.msg)) || String(err), d = err && (err.details || err.hint);
  return (c ? '[' + c + '] ' : '') + m + (d ? ' — ' + d : '');
}
var SA_ZERO_LINHAS = 'A base não atualizou nenhuma linha (0 linhas afetadas)';
// Tabelas ainda não criadas (SQL-SAUDE.md por correr): 42P01 (Postgres) / PGRST205 (PostgREST).
function saTabelaEmFalta(err) { var c = err && err.code; return c === '42P01' || c === 'PGRST205'; }
var SA_MSG_SEM_TABELAS = 'A app Saúde ainda não está preparada na base de dados: faltam as tabelas. Corre o SQL-SAUDE.md (blocos 1 a 4) e volta a abrir.';

function saNovoId() {
  try { if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID(); } catch (e) { /* sem randomUUID: usa o gerador abaixo */ }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });
}

// ── datas ──
function saPad(n) { return (n < 10 ? '0' : '') + n; }
function saDiasDoMes(a, m) { return [31, (a % 4 === 0 && (a % 100 !== 0 || a % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]; }
function saDataValida(s) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
  if (!m) return false;
  var mes = +m[2], dia = +m[3];
  return mes >= 1 && mes <= 12 && dia >= 1 && dia <= saDiasDoMes(+m[1], mes);
}
function saHoje() { var d = new Date(); return d.getFullYear() + '-' + saPad(d.getMonth() + 1) + '-' + saPad(d.getDate()); }
function saDataFmt(s) { return saDataValida(s) ? s.slice(8, 10) + '.' + s.slice(5, 7) + '.' + s.slice(0, 4) : '—'; }

// ── texto ──
function saSemAcentos(s) { var t = String(s == null ? '' : s); try { t = t.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) { /* sem normalize */ } return t.toLowerCase(); }
function saEsc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function saRotuloTipo(k) { for (var i = 0; i < SA_TIPOS.length; i++) { if (SA_TIPOS[i].key === k) return SA_TIPOS[i].rot; } return 'Outro'; }
function saEmojiTipo(k) { for (var i = 0; i < SA_TIPOS.length; i++) { if (SA_TIPOS[i].key === k) return SA_TIPOS[i].emoji; } return '📎'; }
function saTipoValido(k) { for (var i = 0; i < SA_TIPOS.length; i++) { if (SA_TIPOS[i].key === k) return true; } return false; }

// ── ficheiros ──
function saExtensao(nome) { var m = /\.([A-Za-z0-9]{1,5})$/.exec(String(nome || '')); return m ? m[1].toLowerCase() : ''; }
// Tipo MIME do ficheiro escolhido: o do navegador se for aceite; senão pela extensão (HEIC costuma vir sem tipo).
function saMimeDe(file) {
  var t = file && file.type ? String(file.type).toLowerCase() : '';
  if (SA_MIMES.indexOf(t) !== -1) return t;
  var porExt = SA_EXT_MIME[saExtensao(file && file.name)];
  return (!t || t === 'application/octet-stream') && porExt ? porExt : '';
}
function saTipoFicheiro(path) { var e = saExtensao(path); return e === 'pdf' ? 'pdf' : (SA_EXT_MIME[e] ? 'imagem' : 'outro'); }
function saValidaFicheiro(file) {
  if (!file) return 'Escolhe um ficheiro (foto ou PDF).';
  if (!(file.size > 0)) return 'O ficheiro está vazio.';
  if (file.size > SA_MAX_BYTES) return 'O ficheiro é demasiado grande (máximo 15 MB).';
  if (!saMimeDe(file)) return 'Só aceito PDF e fotos (JPEG, PNG, WebP, HEIC).';
  return null;
}
// Nome de ficheiro seguro para o Storage (sem acentos, espaços nem símbolos). Mantém a extensão.
function saNomeSeguro(nome) {
  var ext = saExtensao(nome), base = String(nome || '').replace(/\.[A-Za-z0-9]{1,5}$/, '');
  var b = saSemAcentos(base).replace(/[^a-z0-9_-]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  return (b || 'documento') + (ext ? '.' + ext : '');
}
// <dono>/<id do documento>/<nome>: a primeira pasta é o dono (é o que as políticas do bucket verificam).
function saCaminho(dono, docId, nomeOriginal) {
  var ok = /^[0-9a-fA-F-]{8,40}$/;
  if (!ok.test(String(dono || '')) || !ok.test(String(docId || ''))) return null;
  return dono + '/' + docId + '/' + saNomeSeguro(nomeOriginal);
}

// ── validação dos formulários (devolvem a mensagem ou null) ──
function saValidaPessoa(nome, notas) {
  var n = String(nome == null ? '' : nome).trim();
  if (!n) return 'Escreve o nome da pessoa.';
  if (n.length > SA_MAX_NOME) return 'O nome tem mais de ' + SA_MAX_NOME + ' caracteres.';
  if (String(notas || '').length > SA_MAX_NOTAS) return 'As notas têm mais de ' + SA_MAX_NOTAS + ' caracteres.';
  return null;
}
function saValidaCaso(nome, cor) {
  var n = String(nome == null ? '' : nome).trim();
  if (!n) return 'Escreve o nome do caso.';
  if (n.length > SA_MAX_NOME) return 'O nome tem mais de ' + SA_MAX_NOME + ' caracteres.';
  if (!/^#[0-9A-Fa-f]{6}$/.test(String(cor || ''))) return 'Escolhe uma cor.';
  return null;
}
function saValidaDoc(o, comFicheiro) {
  var t = String(o.titulo == null ? '' : o.titulo).trim();
  if (!t) return 'Escreve o título do documento.';
  if (t.length > SA_MAX_TITULO) return 'O título tem mais de ' + SA_MAX_TITULO + ' caracteres.';
  if (!saDataValida(o.data_doc)) return 'Escolhe a data do documento.';
  if (!saTipoValido(o.tipo)) return 'Escolhe o tipo de documento.';
  if (!o.caso) return 'Escolhe o caso.';
  if (String(o.notas || '').length > SA_MAX_NOTAS) return 'As notas têm mais de ' + SA_MAX_NOTAS + ' caracteres.';
  if (comFicheiro) { var ef = saValidaFicheiro(o.file); if (ef) return ef; }
  return null;
}
function saValidaZeugnis(o) {
  if (!saDataValida(o.de)) return 'Escolhe a data de início.';
  if (!saDataValida(o.ate)) return 'Escolhe a data de fim.';
  if (o.ate < o.de) return 'A data de fim é anterior à data de início.';
  var p = String(o.percentagem == null ? '' : o.percentagem).trim();
  if (!/^\d{1,3}$/.test(p) || parseInt(p, 10) > 100) return 'A percentagem tem de ser um número inteiro de 0 a 100.';
  if (String(o.medico || '').length > SA_MAX_MEDICO) return 'O nome do médico tem mais de ' + SA_MAX_MEDICO + ' caracteres.';
  return null;
}
// Link da cópia no Drive: só https e só drive.google.com / docs.google.com. Vazio = sem link.
function saLinkDrive(texto) {
  var s = String(texto == null ? '' : texto).trim();
  if (!s) return { ok: true, valor: null, erro: null };
  if (s.length > SA_MAX_LINK) return { ok: false, valor: null, erro: 'O link é demasiado longo.' };
  if (/[\s\u0000-\u001f\u007f​-‏‪-‮⁠]/.test(s)) return { ok: false, valor: null, erro: 'O link não pode ter espaços nem caracteres estranhos.' };
  var m = /^https:\/\/([^\/?#]*)/i.exec(s);
  if (!m || /[@:\\]/.test(m[1]) || ['drive.google.com', 'docs.google.com'].indexOf(m[1].toLowerCase()) === -1) return { ok: false, valor: null, erro: 'O link tem de ser https:// e do Google Drive.' };
  return { ok: true, valor: s, erro: null };
}

// ── ordenar e filtrar ──
function saOrdenarDocs(docs) {
  return (docs || []).slice().sort(function (a, b) {
    if (a.data_doc !== b.data_doc) return a.data_doc < b.data_doc ? 1 : -1;
    var ca = a.created_at || '', cb = b.created_at || '';
    return ca === cb ? 0 : (ca < cb ? 1 : -1);
  });
}
// f = { caso: 'todos' | id, tipo: 'todos' | chave, texto }. O texto procura no título e nas notas, sem acentos nem maiúsculas.
function saFiltrarDocs(docs, f) {
  f = f || {};
  var q = saSemAcentos(String(f.texto || '').trim());
  return saOrdenarDocs((docs || []).filter(function (d) {
    if (f.caso && f.caso !== 'todos' && d.caso !== f.caso) return false;
    if (f.tipo && f.tipo !== 'todos' && d.tipo !== f.tipo) return false;
    return !q || saSemAcentos(d.titulo).indexOf(q) !== -1 || saSemAcentos(d.notas).indexOf(q) !== -1;
  }));
}
function saFiltrosAtivos(f) { return !!(f && ((f.caso && f.caso !== 'todos') || (f.tipo && f.tipo !== 'todos') || String(f.texto || '').trim())); }
function saContarDocsDoCaso(docs, casoId) { var n = 0; (docs || []).forEach(function (d) { if (d.caso === casoId) n++; }); return n; }
function saOrdenarCasos(casos) {
  return (casos || []).slice().sort(function (a, b) {
    if ((a.ordem || 0) !== (b.ordem || 0)) return (a.ordem || 0) - (b.ordem || 0);
    var ca = a.created_at || '', cb = b.created_at || '';
    return ca === cb ? 0 : (ca < cb ? -1 : 1);
  });
}
// Zeugnis: "por enviar" primeiro; dentro de cada estado, o período mais recente primeiro.
function saOrdenarZeugnis(lista) {
  return (lista || []).slice().sort(function (a, b) {
    var ea = a.estado === 'enviado' ? 1 : 0, eb = b.estado === 'enviado' ? 1 : 0;
    if (ea !== eb) return ea - eb;
    if (a.de !== b.de) return a.de < b.de ? 1 : -1;
    return (a.created_at || '') < (b.created_at || '') ? 1 : -1;
  });
}
function saResumoZeugnis(lista) {
  var r = { porEnviar: 0, enviados: 0 };
  (lista || []).forEach(function (z) { if (z.estado === 'enviado') r.enviados++; else r.porEnviar++; });
  return r;
}
// Um toque para marcar Enviado (com a data) e outro para desfazer.
function saPatchEnviado(hoje) { return { estado: 'enviado', enviado_em: hoje }; }
function saPatchPorEnviar() { return { estado: 'por_enviar', enviado_em: null }; }

// ── HTML para imprimir (tudo escapado) ──
function saHtmlBase(titulo, corpo) {
  return '<!doctype html><html><head><meta charset="utf-8"><title>' + saEsc(titulo) + '</title><meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<style>body{font-family:Arial,Helvetica,sans-serif;color:#000;margin:18px}h1{font-size:20px;margin:0 0 6px}.meta{font-size:13px;margin:0 0 14px}'
    + 'table{border-collapse:collapse;width:100%;font-size:13px}th,td{border:1px solid #000;padding:6px 8px;text-align:left}th{background:#eee}img{max-width:100%;height:auto}'
    + '.bp{padding:12px 18px;font-size:16px;font-weight:bold;margin-bottom:14px}@media print{.bp{display:none}}</style></head><body>'
    + '<button class="bp" onclick="window.print()">🖨️ Imprimir</button>' + corpo
    + '<script>window.onload=function(){setTimeout(function(){try{window.print();}catch(e){}},400);};<\/script></body></html>';
}
function saHtmlDoc(doc, nomeCaso, nomePessoa, urlImagem) {
  return saHtmlBase(doc.titulo, '<h1>' + saEsc(doc.titulo) + '</h1><p class="meta">' + saEsc(nomePessoa) + ' · ' + saEsc(nomeCaso) + ' · ' + saEsc(saRotuloTipo(doc.tipo)) + ' · ' + saEsc(saDataFmt(doc.data_doc)) + '</p>'
    + (doc.notas ? '<p>' + saEsc(doc.notas) + '</p>' : '') + (urlImagem ? '<img src="' + saEsc(urlImagem) + '" alt="">' : ''));
}
function saHtmlZeugnis(nomePessoa, lista) {
  var linhas = saOrdenarZeugnis(lista).map(function (z) {
    return '<tr><td>' + saEsc(saDataFmt(z.de)) + ' – ' + saEsc(saDataFmt(z.ate)) + '</td><td>' + saEsc(z.percentagem) + '%</td><td>' + saEsc(z.medico || '—') + '</td><td>'
      + (z.estado === 'enviado' ? 'Enviado à firma' + (z.enviado_em ? ' em ' + saEsc(saDataFmt(z.enviado_em)) : '') : 'Por enviar') + '</td></tr>';
  }).join('');
  return saHtmlBase('Zeugnis', '<h1>Zeugnis · ' + saEsc(nomePessoa) + '</h1><p class="meta">Impresso em ' + saEsc(saDataFmt(saHoje())) + '</p>'
    + '<table><thead><tr><th>Período</th><th>%</th><th>Médico</th><th>Estado</th></tr></thead><tbody>' + (linhas || '<tr><td colspan="4">Sem Zeugnis.</td></tr>') + '</tbody></table>');
}

// ── ficheiros por limpar (se uma remoção falhar, fica aqui e é tentada outra vez) ──
function saLerPendentes() {
  try { var v = JSON.parse(window.localStorage.getItem(SA_LS_PENDENTES) || '[]'); return Array.isArray(v) ? v.filter(function (x) { return typeof x === 'string' && x; }) : []; } catch (e) { return []; }
}
function saGuardarPendentes(lista) {
  try { window.localStorage.setItem(SA_LS_PENDENTES, JSON.stringify(lista || [])); } catch (e) { saLog('guardar lista de ficheiros por limpar', e); }
}
function saAdicionarPendente(path) { var l = saLerPendentes(); if (path && l.indexOf(path) === -1) { l.push(path); saGuardarPendentes(l); } return l; }

// ── ler o ficheiro para a memória ANTES de o enviar ──
// Um ficheiro que vem de um content:// virtual (por exemplo do Google Drive no Android) nem sempre pode ser transmitido
// diretamente pelo browser ("Failed to fetch"). Por isso lê-se tudo para a memória (arrayBuffer, ou FileReader se o
// browser não tiver arrayBuffer) e envia-se um Blob normal, com o mesmo tipo MIME.
var SA_MSG_LER = 'Não foi possível ler o ficheiro do telemóvel (se vem do Drive, torna-o disponível offline e tenta outra vez). Nada foi guardado.';
// Log de uma falha com o nome, o tamanho e o tipo do ficheiro (NUNCA o conteúdo), para perceber o que falhou.
function saLogFicheiro(op, err, file) {
  console.error('[saude] falha ao ' + op + ' — ficheiro: ' + (file && file.name) + ', ' + (file && file.size) + ' bytes, tipo ' + (file && file.type) + ':', err);
}
function saLerFicheiro(file) {
  var mime = saMimeDe(file);
  var porBuffer = function (buf) {
    if (!buf || !(buf.byteLength > 0)) return { ok: false, erro: 'O ficheiro está vazio (não foi lido nenhum byte). Nada foi guardado.' };
    if (buf.byteLength > SA_MAX_BYTES) return { ok: false, erro: 'O ficheiro é demasiado grande (máximo 15 MB). Nada foi guardado.' };
    return { ok: true, blob: new Blob([buf], { type: mime }), bytes: buf.byteLength };
  };
  var falha = function (e) { saLogFicheiro('ler o ficheiro do telemóvel', e, file); return { ok: false, erro: SA_MSG_LER + ' Erro: ' + saMsgErro(e) }; };
  try {
    var lido = typeof file.arrayBuffer === 'function'
      ? file.arrayBuffer()
      : new Promise(function (resolve, reject) {
        var fr = new FileReader();
        fr.onload = function () { resolve(fr.result); };
        fr.onerror = function () { reject(fr.error || new Error('A leitura do ficheiro falhou')); };
        fr.readAsArrayBuffer(file);
      });
    return lido.then(porBuffer).then(null, falha);
  } catch (e) {
    return Promise.resolve(falha(e));
  }
}

// ── operações com ficheiro + linha (sem deixar ficheiros órfãos nem linhas sem ficheiro) ──
// Criar: 1) envia o ficheiro; 2) grava a linha; se o 2) falhar, remove o ficheiro. Se a remoção também falhar,
// devolve o caminho em "orfao" (a app põe-no na lista de limpeza). Nunca rejeita: devolve { ok, erro, orfao, row }.
function saCriarDoc(db, o) {
  var path = saCaminho(o.dono, o.row.id, o.file && o.file.name);
  if (!path) return Promise.resolve({ ok: false, erro: 'Não foi possível preparar o caminho do ficheiro. Nada foi guardado.' });
  var row = Object.assign({}, o.row, { ficheiro_path: path });
  var enviado = false;
  var desfazer = function (base) {
    return db.storage.from(SA_BUCKET).remove([path]).then(function (rm) {
      if (rm && rm.error) { saLog('remover ficheiro enviado', rm.error); return { ok: false, erro: base + ' O ficheiro enviado também não foi removido (' + saMsgErro(rm.error) + '); fica na lista de limpeza.', orfao: path }; }
      return { ok: false, erro: base + ' O ficheiro enviado foi removido: nada ficou guardado.' };
    }, function (e) { saLog('remover ficheiro enviado', e); return { ok: false, erro: base + ' O ficheiro enviado também não foi removido (' + saMsgErro(e) + '); fica na lista de limpeza.', orfao: path }; });
  };
  return saLerFicheiro(o.file).then(function (lf) {
    if (!lf.ok) return { ok: false, erro: lf.erro };   // não se leu: não se envia nada (nem fica nada para limpar)
    return db.storage.from(SA_BUCKET).upload(path, lf.blob, { contentType: saMimeDe(o.file), upsert: false }).then(function (up) {
    if (up && up.error) { saLogFicheiro('enviar ficheiro', up.error, o.file); return { ok: false, erro: 'Não foi possível enviar o ficheiro: ' + saMsgErro(up.error) + '. Nada foi guardado.' }; }
    enviado = true;
    return db.from('saude_docs').insert(row).select('id').then(function (ins) {
      if (ins && ins.error) { saLog('guardar documento', ins.error); return desfazer('Não foi possível guardar o documento: ' + saMsgErro(ins.error) + '.'); }
      if (!ins || !ins.data || !ins.data.length) { saLog('guardar documento', new Error(SA_ZERO_LINHAS)); return desfazer('Não foi possível guardar o documento: ' + SA_ZERO_LINHAS + '.'); }
      return { ok: true, row: row };
    });
    });
  }).then(null, function (e) {
    saLogFicheiro('criar documento', e, o.file);
    return enviado ? desfazer('Não foi possível guardar o documento: ' + saMsgErro(e) + '.') : { ok: false, erro: 'Não foi possível enviar o ficheiro: ' + saMsgErro(e) + '. Nada foi guardado.' };
  });
}
// Apagar: 1) apaga a linha (se falhar, nada mudou); 2) remove o ficheiro (se falhar, o documento já não existe,
// por isso o ficheiro vai para a lista de limpeza e a app avisa). Nunca rejeita.
function saApagarDoc(db, doc) {
  var semLinha = function (e) { saLog('apagar documento', e); return { ok: false, erro: 'Não foi possível apagar o documento: ' + saMsgErro(e) + '. Nada foi apagado.' }; };
  return db.from('saude_docs').delete().eq('id', doc.id).select('id').then(function (del) {
    if (del && del.error) return semLinha(del.error);
    if (!del || !del.data || !del.data.length) return semLinha(new Error(SA_ZERO_LINHAS));
    var aviso = function (e) { saLog('remover ficheiro do documento apagado', e); return { ok: true, aviso: 'O documento foi apagado, mas o ficheiro não foi removido do armazenamento (' + saMsgErro(e) + '). Fica na lista de limpeza e a app tenta outra vez.', orfao: doc.ficheiro_path }; };
    return db.storage.from(SA_BUCKET).remove([doc.ficheiro_path]).then(function (rm) {
      return rm && rm.error ? aviso(rm.error) : { ok: true };
    }, aviso);
  }).then(null, semLinha);
}
// Tenta remover os ficheiros pendentes. Devolve { restantes: [...] } (os que continuam por remover).
function saLimparPendentes(db, lista) {
  if (!lista || !lista.length) return Promise.resolve({ restantes: [] });
  return db.storage.from(SA_BUCKET).remove(lista).then(function (rm) {
    if (rm && rm.error) { saLog('limpar ficheiros pendentes', rm.error); return { restantes: lista.slice() }; }
    return { restantes: [] };
  }, function (e) { saLog('limpar ficheiros pendentes', e); return { restantes: lista.slice() }; });
}
function saUrlAssinado(db, path) {
  return db.storage.from(SA_BUCKET).createSignedUrl(path, SA_URL_SEGUNDOS).then(function (res) {
    if (res && res.error) return { ok: false, erro: 'Não foi possível abrir o ficheiro: ' + saMsgErro(res.error) };
    var u = res && res.data && (res.data.signedUrl || res.data.signedURL);
    return u ? { ok: true, url: u } : { ok: false, erro: 'Não foi possível abrir o ficheiro (sem endereço).' };
  }, function (e) { saLog('abrir ficheiro', e); return { ok: false, erro: 'Não foi possível abrir o ficheiro: ' + saMsgErro(e) }; });
}

// ── backup no Drive (âmbito drive.file: a app só vê os ficheiros que ela própria cria) ──
// Precisa de um "ID de cliente" OAuth (Web) criado pelo Patricio no Google Cloud; guarda-se só neste aparelho.
var saDriveSessao = { token: null, expira: 0, pasta: null };
function saDriveClientId() { try { return String(window.localStorage.getItem(SA_LS_CLIENTE) || '').trim(); } catch (e) { return ''; } }
function saValidaClientId(s) { return /^[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com$/i.test(String(s || '').trim()); }
function saCarregarGis() {
  if (window.google && window.google.accounts && window.google.accounts.oauth2) return Promise.resolve();
  return new Promise(function (resolve, reject) {
    var s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
    s.onload = function () { resolve(); };
    s.onerror = function () { reject(new Error('Não foi possível carregar o login do Google.')); };
    document.head.appendChild(s);
  });
}
// Token de acesso (1 hora). Pedir um novo abre o ecrã de consentimento do Google: tem de vir de um toque.
function saDriveToken() {
  if (saDriveSessao.token && saDriveSessao.expira > Date.now() + 60000) return Promise.resolve(saDriveSessao.token);
  var cid = saDriveClientId();
  if (!saValidaClientId(cid)) return Promise.reject(new Error('Falta o ID de cliente do Google (Definições da app Saúde).'));
  return saCarregarGis().then(function () {
    return new Promise(function (resolve, reject) {
      var tc = window.google.accounts.oauth2.initTokenClient({
        client_id: cid, scope: 'https://www.googleapis.com/auth/drive.file',
        callback: function (r) {
          if (!r || r.error || !r.access_token) { reject(new Error('O Google não deu autorização' + (r && r.error ? ' (' + r.error + ')' : '') + '.')); return; }
          saDriveSessao.token = r.access_token; saDriveSessao.expira = Date.now() + (Number(r.expires_in) || 3600) * 1000;
          resolve(saDriveSessao.token);
        },
        error_callback: function (e) { reject(new Error('Não foi possível ligar ao Google' + (e && e.type ? ' (' + e.type + ')' : '') + '.')); }
      });
      tc.requestAccessToken({ prompt: '' });
    });
  });
}
function saDriveFetch(url, token, init) {
  var h = Object.assign({ Authorization: 'Bearer ' + token }, (init && init.headers) || {});
  return window.fetch(url, Object.assign({}, init, { headers: h })).then(function (r) {
    if (r.ok) return r.json();
    return r.text().then(function () { throw new Error('O Drive respondeu ' + r.status + '.'); });
  });
}
// A pasta "Carvalho Saude" é criada pela app (por isso o drive.file consegue vê-la): procura-a e, se não existir, cria-a.
function saDriveGarantirPasta(token) {
  if (saDriveSessao.pasta) return Promise.resolve(saDriveSessao.pasta);
  var q = "name='" + SA_DRIVE_PASTA + "' and mimeType='application/vnd.google-apps.folder' and trashed=false";
  return saDriveFetch('https://www.googleapis.com/drive/v3/files?q=' + encodeURIComponent(q) + '&fields=' + encodeURIComponent('files(id,name)') + '&spaces=drive', token).then(function (r) {
    if (r && r.files && r.files.length) { saDriveSessao.pasta = r.files[0].id; return saDriveSessao.pasta; }
    return saDriveFetch('https://www.googleapis.com/drive/v3/files?fields=id', token, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: SA_DRIVE_PASTA, mimeType: 'application/vnd.google-apps.folder' })
    }).then(function (c) { saDriveSessao.pasta = c.id; return c.id; });
  });
}
function saDriveEnviar(token, pastaId, blob, nome, mime) {
  var fronteira = 'saude' + Date.now().toString(36);
  var meta = JSON.stringify({ name: nome, parents: [pastaId] });
  var corpo = new Blob(['--' + fronteira + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + meta + '\r\n--' + fronteira + '\r\nContent-Type: ' + mime + '\r\n\r\n', blob, '\r\n--' + fronteira + '--']);
  return saDriveFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=' + encodeURIComponent('id,webViewLink'), token, {
    method: 'POST', headers: { 'Content-Type': 'multipart/related; boundary=' + fronteira }, body: corpo
  });
}
// Copia um documento já guardado para o Drive e grava o link. Nunca rejeita; nunca mexe no documento se falhar.
function saDriveCopiar(db, doc) {
  var passo = 'ligar ao Google';
  return saDriveToken().then(function (token) {
    passo = 'ler o ficheiro';
    return db.storage.from(SA_BUCKET).download(doc.ficheiro_path).then(function (dl) {
      if (dl && dl.error) throw new Error('Não foi possível ler o ficheiro: ' + saMsgErro(dl.error));
      if (!dl || !dl.data) throw new Error('Não foi possível ler o ficheiro.');
      passo = 'enviar para o Drive';
      return saDriveGarantirPasta(token).then(function (pasta) {
        return saDriveEnviar(token, pasta, dl.data, saNomeSeguro(doc.titulo + '.' + (saExtensao(doc.ficheiro_path) || 'bin')), saMimeDe({ name: doc.ficheiro_path, type: dl.data.type }) || 'application/octet-stream');
      });
    });
  }).then(function (r) {
    var lk = saLinkDrive(r && r.webViewLink);
    if (!lk.ok || !lk.valor) throw new Error('O Drive não devolveu um link válido.');
    passo = 'gravar o link';
    return db.from('saude_docs').update({ drive_backup_url: lk.valor, updated_at: new Date().toISOString() }).eq('id', doc.id).select('id').then(function (up) {
      if (up && up.error) throw new Error('A cópia foi para o Drive, mas não foi possível gravar o link: ' + saMsgErro(up.error));
      if (!up || !up.data || !up.data.length) throw new Error('A cópia foi para o Drive, mas não foi possível gravar o link: ' + SA_ZERO_LINHAS);
      return { ok: true, url: lk.valor };
    });
  }).then(null, function (e) {
    saLog('copiar para o Drive (' + passo + ')', e);
    return { ok: false, erro: (e && e.message ? e.message : String(e)) + ' (passo: ' + passo + '). O documento continua guardado.' };
  });
}

// ── componentes pequenos (ao nível do módulo, para não remontarem) ──
function SaBtn(p) {
  var kind = p.kind || 'accent';
  var bg = kind === 'accent' ? SA_ACENTO : kind === 'danger' ? T.red : kind === 'contorno' ? 'transparent' : T.surface2;
  var cor = kind === 'ghost' ? T.text : kind === 'contorno' ? SA_ACENTO : '#fff';
  return React.createElement('button', {
    type: 'button', onClick: p.onClick, disabled: !!p.disabled, 'aria-label': p.aria,
    style: {
      background: bg, color: cor, border: kind === 'ghost' ? '1.5px solid ' + T.border : kind === 'contorno' ? '2px solid ' + SA_ACENTO : 'none',
      borderRadius: 14, padding: p.small ? '10px 14px' : '15px 20px', fontSize: p.small ? 14 : 16, fontWeight: 900, cursor: p.disabled ? 'default' : 'pointer',
      opacity: p.disabled ? 0.55 : 1, flex: p.flex ? 1 : undefined, minHeight: p.small ? 48 : 56, boxSizing: 'border-box', width: p.cheio ? '100%' : undefined
    }
  }, p.children);
}
function SaChip(p) {
  var cor = p.cor || SA_ACENTO;
  return React.createElement('button', {
    type: 'button', onClick: p.onClick, disabled: !!p.disabled, 'aria-pressed': !!p.ativo,
    style: {
      minHeight: 44, padding: '8px 14px', borderRadius: 999, fontSize: 14, fontWeight: 800, cursor: p.disabled ? 'default' : 'pointer', flex: p.grow ? 1 : undefined,
      background: p.ativo ? ntAlfaSaude(cor, 0.18) : 'transparent', color: T.text, border: (p.ativo ? '2.5px' : '1.5px') + ' solid ' + (p.ativo ? cor : T.border)
    }
  }, p.children);
}
function ntAlfaSaude(hex, a) {
  var h = String(hex).replace('#', '');
  return 'rgba(' + parseInt(h.slice(0, 2), 16) + ',' + parseInt(h.slice(2, 4), 16) + ',' + parseInt(h.slice(4, 6), 16) + ',' + a + ')';
}
function SaAviso(p) {
  var erro = p.tipo !== 'aviso';
  return React.createElement('div', { role: 'alert', style: { background: erro ? '#7f1d1d' : '#78350f', border: '1px solid ' + (erro ? '#ef4444' : '#f59e0b'), borderRadius: 12, padding: '10px 12px', color: '#fff', marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 10 } },
    React.createElement('div', { style: { flex: 1, fontSize: 14, fontWeight: 700, wordBreak: 'break-word' } }, React.createElement('div', { style: { fontWeight: 900, marginBottom: 2 } }, erro ? '⚠️ Não foi possível' : 'ℹ️ Atenção'), p.texto),
    React.createElement('button', { type: 'button', 'aria-label': 'Fechar aviso', onClick: p.onFechar, style: { background: 'none', border: 'none', color: '#fff', fontSize: 20, fontWeight: 900, cursor: 'pointer', minWidth: 40, minHeight: 40 } }, '✕'));
}
function SaBarra(p) {
  return React.createElement('div', { style: { position: 'sticky', top: 0, zIndex: 200, boxSizing: 'border-box', minHeight: 60, display: 'flex', alignItems: 'center', background: T.surface, borderBottom: '2px solid ' + SA_ACENTO, padding: '0 12px 0 4px' } },
    React.createElement('button', { type: 'button', 'aria-label': 'Voltar', onClick: p.onBack, style: { flex: '1 1 auto', minWidth: 56, height: 60, display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: '0 10px', textAlign: 'left', cursor: 'pointer', color: T.text } },
      React.createElement('span', { style: { color: SA_ACENTO, fontSize: 30, fontWeight: 900, lineHeight: 1 } }, '‹'),
      React.createElement('span', { style: { fontSize: 18, fontWeight: 900, overflowWrap: 'anywhere' } }, p.titulo)));
}

// ── a app ──
function SaudeApp(props) {
  var onBack = props.onBack, profile = props.profile || {};
  var db = window.supabaseClient;
  var dono = profile.id || '';
  var h = React.createElement;

  var _p = React.useState([]); var pessoas = _p[0], setPessoas = _p[1];
  var _c = React.useState([]); var casos = _c[0], setCasos = _c[1];
  var _d = React.useState([]); var docs = _d[0], setDocs = _d[1];
  var _z = React.useState([]); var zeug = _z[0], setZeug = _z[1];
  var _ca = React.useState(false); var carregado = _ca[0], setCarregado = _ca[1];
  var _ec = React.useState(''); var erroCarga = _ec[0], setErroCarga = _ec[1];
  var _e = React.useState('pessoas'); var ecra = _e[0], setEcra = _e[1];   // pessoas | pessoa | caso | docs | doc | zeugnis | fpessoa | fcaso | fdoc | fzeug | config
  var _pi = React.useState(null); var pessoaId = _pi[0], setPessoaId = _pi[1];
  var _ci = React.useState(null); var casoId = _ci[0], setCasoId = _ci[1];
  var _di = React.useState(null); var docId = _di[0], setDocId = _di[1];
  var _or = React.useState('pessoas'); var origem = _or[0], setOrigem = _or[1];   // para onde volta um formulário / o ecrã do documento
  var _ed = React.useState(null); var editId = _ed[0], setEditId = _ed[1];
  var _fn = React.useState(''); var fNome = _fn[0], setFNome = _fn[1];
  var _fo = React.useState(''); var fNotas = _fo[0], setFNotas = _fo[1];
  var _fc = React.useState(SA_CORES[0]); var fCor = _fc[0], setFCor = _fc[1];
  var _ft = React.useState(''); var fTitulo = _ft[0], setFTitulo = _ft[1];
  var _fd = React.useState(''); var fData = _fd[0], setFData = _fd[1];
  var _fp = React.useState('exame'); var fTipo = _fp[0], setFTipo = _fp[1];
  var _fk = React.useState(''); var fCaso = _fk[0], setFCaso = _fk[1];
  var _ff = React.useState(null); var fFicheiro = _ff[0], setFFicheiro = _ff[1];
  var _za = React.useState(''); var zDe = _za[0], setZDe = _za[1];
  var _zb = React.useState(''); var zAte = _zb[0], setZAte = _zb[1];
  var _zc = React.useState('100'); var zPerc = _zc[0], setZPerc = _zc[1];
  var _zd = React.useState(''); var zMedico = _zd[0], setZMedico = _zd[1];
  var _ze = React.useState(''); var zDoc = _ze[0], setZDoc = _ze[1];
  var _fe = React.useState(''); var fErro = _fe[0], setFErro = _fe[1];       // validação do formulário
  var _er = React.useState(''); var erro = _er[0], setErro = _er[1];         // erro real devolvido
  var _av = React.useState(''); var aviso = _av[0], setAviso = _av[1];
  var _sv = React.useState(false); var saving = _sv[0], setSaving = _sv[1];
  var _fl1 = React.useState('todos'); var filtroCaso = _fl1[0], setFiltroCaso = _fl1[1];
  var _fl2 = React.useState('todos'); var filtroTipo = _fl2[0], setFiltroTipo = _fl2[1];
  var _fl3 = React.useState(''); var filtroTexto = _fl3[0], setFiltroTexto = _fl3[1];
  var _ui = React.useState(''); var urlImg = _ui[0], setUrlImg = _ui[1];
  var _dm = React.useState(null); var driveMsg = _dm[0], setDriveMsg = _dm[1];   // { id, ok, texto }
  var _db = React.useState(null); var driveBusy = _db[0], setDriveBusy = _db[1];
  var _pn = React.useState(saLerPendentes().length); var pendentes = _pn[0], setPendentes = _pn[1];
  var _cg = React.useState(saDriveClientId()); var fCliente = _cg[0], setFCliente = _cg[1];
  var savingRef = React.useRef(false);
  var carregarRef = React.useRef(null);

  function carregar() {
    if (!db) { setErroCarga('Sem ligação ao servidor.'); setCarregado(true); return; }
    var ler = function (tabela, col, asc) {
      return db.from(tabela).select('*').order(col, { ascending: asc }).then(function (r) {
        if (r && r.error) { throw r.error; }
        return (r && r.data) || [];
      });
    };
    Promise.all([ler('saude_pessoas', 'created_at', true), ler('saude_casos', 'created_at', true), ler('saude_docs', 'data_doc', false), ler('saude_zeugnis', 'de', false)]).then(function (r) {
      setPessoas(r[0]); setCasos(r[1]); setDocs(r[2]); setZeug(r[3]); setErroCarga(''); setCarregado(true);
    }).catch(function (e) {
      saLog('carregar', e);
      setErroCarga(saTabelaEmFalta(e) ? SA_MSG_SEM_TABELAS : 'Não foi possível carregar: ' + saMsgErro(e));
      setCarregado(true);
    });
  }
  carregarRef.current = carregar;
  React.useEffect(function () {
    carregarRef.current();
    var pend = saLerPendentes();   // ficheiros que ficaram por remover: tenta outra vez ao abrir
    if (db && pend.length) {
      saLimparPendentes(db, pend).then(function (r) { saGuardarPendentes(r.restantes); setPendentes(r.restantes.length); });
    }
  }, []);

  // Escrita honesta: só muda o ecrã depois de a base confirmar pelo menos 1 linha.
  function gravar(oQue, consulta, depois) {
    if (savingRef.current) return;
    savingRef.current = true; setSaving(true); setErro('');
    var falhou = function (msg) { savingRef.current = false; setSaving(false); setErro('Não foi possível ' + oQue + ': ' + msg); };
    consulta.then(function (res) {
      if (res && res.error) { saLog(oQue, res.error); falhou(saMsgErro(res.error)); return; }
      if (!res || !res.data || !res.data.length) { saLog(oQue, new Error(SA_ZERO_LINHAS)); falhou(SA_ZERO_LINHAS); return; }
      savingRef.current = false; setSaving(false);
      depois(res.data);
    }).catch(function (e) { saLog(oQue, e); falhou(saMsgErro(e)); });
  }
  // Bloqueio de toques repetidos nas operações com ficheiro (que não passam pelo gravar acima).
  function comBloqueio(fn) {
    if (savingRef.current) return;
    savingRef.current = true; setSaving(true); setErro(''); setAviso('');
    var fim = function () { savingRef.current = false; setSaving(false); };
    fn(fim);
  }
  function ir(novo, orig) { setErro(''); setAviso(''); setFErro(''); if (orig) setOrigem(orig); setEcra(novo); }

  var pessoa = null, i;
  for (i = 0; i < pessoas.length; i++) { if (pessoas[i].id === pessoaId) { pessoa = pessoas[i]; break; } }
  var caso = null; for (i = 0; i < casos.length; i++) { if (casos[i].id === casoId) { caso = casos[i]; break; } }
  var doc = null; for (i = 0; i < docs.length; i++) { if (docs[i].id === docId) { doc = docs[i]; break; } }
  var casosDaPessoa = saOrdenarCasos(casos.filter(function (c) { return pessoa && c.pessoa === pessoa.id; }));
  var idsCasos = casosDaPessoa.map(function (c) { return c.id; });
  var docsDaPessoa = docs.filter(function (d) { return idsCasos.indexOf(d.caso) !== -1; });
  var zeugDaPessoa = zeug.filter(function (z) { return pessoa && z.pessoa === pessoa.id; });
  function casoPorId(id) { for (var k = 0; k < casos.length; k++) { if (casos[k].id === id) return casos[k]; } return null; }

  // Pré-visualização de imagens: pede um URL assinado de curta duração só quando se abre o documento.
  React.useEffect(function () {
    setUrlImg('');
    if (ecra !== 'doc' || !doc || saTipoFicheiro(doc.ficheiro_path) !== 'imagem' || !db) return;
    var vivo = true;
    saUrlAssinado(db, doc.ficheiro_path).then(function (r) { if (vivo && r.ok) setUrlImg(r.url); });
    return function () { vivo = false; };
  }, [ecra, docId]);

  function voltar() {
    if (saving) return;
    setErro(''); setAviso(''); setFErro('');
    if (ecra === 'pessoas') { onBack(); return; }
    if (ecra === 'pessoa' || ecra === 'config') { setEcra('pessoas'); return; }
    if (ecra === 'caso' || ecra === 'docs' || ecra === 'zeugnis') { setEcra('pessoa'); return; }
    if (ecra === 'doc') { setEcra(origem === 'caso' || origem === 'docs' || origem === 'zeugnis' ? origem : 'pessoa'); return; }
    if (ecra === 'fdoc' && editId) { setEcra('doc'); return; }   // editar um documento volta ao documento
    setEcra(origem);   // formulários
  }

  // ── pessoas ──
  function abrirNovaPessoa() { setEditId(null); setFNome(''); setFNotas(''); ir('fpessoa', 'pessoas'); }
  function abrirEditarPessoa(p, orig) { setEditId(p.id); setFNome(p.nome); setFNotas(p.notas || ''); ir('fpessoa', orig); }
  function guardarPessoa() {
    var v = saValidaPessoa(fNome, fNotas); if (v) { setFErro(v); return; } setFErro('');
    var campos = { nome: fNome.trim(), notas: fNotas.trim() };
    if (editId) {
      gravar('guardar a pessoa', db.from('saude_pessoas').update(Object.assign({}, campos, { updated_at: new Date().toISOString() })).eq('id', editId).select('id'), function () { carregarRef.current(); setEcra(origem); });
    } else {
      var nova = Object.assign({ id: saNovoId(), dono: dono }, campos);
      gravar('criar a pessoa', db.from('saude_pessoas').insert(nova).select('id'), function () { setPessoas(function (pv) { return pv.concat([Object.assign({ created_at: new Date().toISOString() }, nova)]); }); setPessoaId(nova.id); carregarRef.current(); setEcra('pessoa'); });
    }
  }
  // Apagar pessoa/caso apaga em cascata as linhas; os ficheiros no armazenamento têm de ser removidos à parte (sem órfãos).
  function apagarComFicheiros(oQue, consulta, paths, depois) {
    gravar(oQue, consulta, function () {
      if (!paths.length) { depois(); return; }
      saLimparPendentes(db, paths).then(function (r) {
        if (r.restantes.length) {
          r.restantes.forEach(saAdicionarPendente); setPendentes(saLerPendentes().length);
          setAviso('Apagado, mas ' + r.restantes.length + (r.restantes.length === 1 ? ' ficheiro não foi removido' : ' ficheiros não foram removidos') + ' do armazenamento. Ficam na lista de limpeza (Definições) e a app tenta outra vez.');
        }
        depois();
      });
    });
  }
  function caminhosDosCasos(ids) { return docs.filter(function (d) { return ids.indexOf(d.caso) !== -1; }).map(function (d) { return d.ficheiro_path; }); }
  function apagarPessoa(p) {
    var cs = casos.filter(function (c) { return c.pessoa === p.id; }).map(function (c) { return c.id; });
    var paths = caminhosDosCasos(cs), nz = zeug.filter(function (z) { return z.pessoa === p.id; }).length;
    var msg = 'Apagar “' + p.nome + '”' + (cs.length ? ', ' + cs.length + (cs.length === 1 ? ' caso' : ' casos') : '') + (paths.length ? ', ' + paths.length + (paths.length === 1 ? ' documento (com o ficheiro)' : ' documentos (com os ficheiros)') : '') + (nz ? ' e ' + nz + ' Zeugnis' : '') + '? Não dá para desfazer.';
    if (typeof window.confirm === 'function' && !window.confirm(msg)) return;
    apagarComFicheiros('apagar a pessoa', db.from('saude_pessoas').delete().eq('id', p.id).select('id'), paths, function () { setPessoaId(null); carregarRef.current(); setEcra('pessoas'); });
  }

  // ── casos ──
  function abrirNovoCaso() { setEditId(null); setFNome(''); setFCor(SA_CORES[casosDaPessoa.length % SA_CORES.length]); ir('fcaso', 'pessoa'); }
  function abrirEditarCaso(c) { setEditId(c.id); setFNome(c.nome); setFCor(c.cor || SA_CORES[0]); ir('fcaso', 'pessoa'); }
  function guardarCaso() {
    var v = saValidaCaso(fNome, fCor); if (v) { setFErro(v); return; } setFErro('');
    if (editId) {
      gravar('guardar o caso', db.from('saude_casos').update({ nome: fNome.trim(), cor: fCor, updated_at: new Date().toISOString() }).eq('id', editId).select('id'), function () { carregarRef.current(); setEcra('pessoa'); });
    } else {
      var novo = { id: saNovoId(), pessoa: pessoa.id, nome: fNome.trim(), cor: fCor, ordem: casosDaPessoa.length };
      gravar('criar o caso', db.from('saude_casos').insert(novo).select('id'), function () { carregarRef.current(); setEcra('pessoa'); });
    }
  }
  function apagarCaso(c) {
    var paths = caminhosDosCasos([c.id]);
    var msg = 'Apagar o caso “' + c.nome + '”' + (paths.length ? ' e ' + paths.length + (paths.length === 1 ? ' documento (com o ficheiro)' : ' documentos (com os ficheiros)') : '') + '? Não dá para desfazer.';
    if (typeof window.confirm === 'function' && !window.confirm(msg)) return;
    apagarComFicheiros('apagar o caso', db.from('saude_casos').delete().eq('id', c.id).select('id'), paths, function () { carregarRef.current(); setEcra('pessoa'); });
  }

  // ── documentos ──
  function abrirNovoDoc(casoPre, orig) {
    setEditId(null); setFTitulo(''); setFData(saHoje()); setFTipo('exame'); setFNotas(''); setFFicheiro(null);
    setFCaso(casoPre || (casosDaPessoa[0] ? casosDaPessoa[0].id : '')); ir('fdoc', orig);
  }
  function abrirEditarDoc(d) { setEditId(d.id); setFTitulo(d.titulo); setFData(d.data_doc); setFTipo(d.tipo); setFNotas(d.notas || ''); setFFicheiro(null); setFCaso(d.caso); ir('fdoc'); }   // sem mudar 'origem': o documento continua a saber de onde veio
  function escolherFicheiro(e) {
    var f = e && e.target && e.target.files && e.target.files[0];
    setFFicheiro(f || null);
    if (f && !fTitulo.trim()) setFTitulo(f.name.replace(/\.[A-Za-z0-9]{1,5}$/, '').slice(0, SA_MAX_TITULO));
  }
  function guardarDoc() {
    var dados = { titulo: fTitulo, data_doc: fData, tipo: fTipo, caso: fCaso, notas: fNotas, file: fFicheiro };
    var v = saValidaDoc(dados, !editId); if (v) { setFErro(v); return; } setFErro('');
    if (editId) {
      gravar('guardar o documento', db.from('saude_docs').update({ titulo: fTitulo.trim(), data_doc: fData, tipo: fTipo, caso: fCaso, notas: fNotas.trim(), updated_at: new Date().toISOString() }).eq('id', editId).select('id'), function () { carregarRef.current(); setEcra('doc'); });
      return;
    }
    comBloqueio(function (fim) {
      var row = { id: saNovoId(), caso: fCaso, titulo: fTitulo.trim(), data_doc: fData, tipo: fTipo, notas: fNotas.trim() };
      saCriarDoc(db, { dono: dono, row: row, file: fFicheiro }).then(function (r) {
        fim();
        if (r.orfao) { saAdicionarPendente(r.orfao); setPendentes(saLerPendentes().length); }
        if (!r.ok) { setErro(r.erro); return; }
        setDocs(function (pv) { return pv.concat([Object.assign({ created_at: new Date().toISOString() }, r.row)]); });   // já confirmado pela base
        setDocId(r.row.id); setCasoId(fCaso); carregarRef.current(); setEcra('doc'); setOrigem('docs');
        // Backup no Drive: só se já houver sessão do Google (um toque antes). Nunca bloqueia nem faz falhar o guardar.
        if (saDriveSessao.token && saDriveSessao.expira > Date.now() + 60000) {
          setDriveBusy(r.row.id);
          saDriveCopiar(db, r.row).then(function (d) { setDriveBusy(null); setDriveMsg({ id: r.row.id, ok: d.ok, texto: d.ok ? 'Copiado para o Drive.' : d.erro }); if (d.ok) carregarRef.current(); });
        }
      });
    });
  }
  function apagarDoc(d) {
    if (typeof window.confirm === 'function' && !window.confirm('Apagar “' + d.titulo + '” e o ficheiro? Não dá para desfazer.')) return;
    comBloqueio(function (fim) {
      saApagarDoc(db, d).then(function (r) {
        fim();
        if (r.orfao) { saAdicionarPendente(r.orfao); setPendentes(saLerPendentes().length); }
        if (!r.ok) { setErro(r.erro); return; }
        if (r.aviso) setAviso(r.aviso);
        carregarRef.current(); setDocId(null); setEcra(origem === 'caso' || origem === 'docs' || origem === 'zeugnis' ? origem : 'pessoa');
      });
    });
  }
  function abrirEmJanela(d, imprimir) {
    var w = window.open('', '_blank');
    if (!w) { setErro('O navegador bloqueou a janela. Permite pop-ups para esta app e tenta outra vez.'); return; }
    saUrlAssinado(db, d.ficheiro_path).then(function (r) {
      if (!r.ok) { try { w.close(); } catch (e) { saLog('fechar janela', e); } setErro(r.erro); return; }
      if (imprimir && saTipoFicheiro(d.ficheiro_path) === 'imagem') {
        var c = casoPorId(d.caso), pe = null; for (var k = 0; k < pessoas.length; k++) { if (c && pessoas[k].id === c.pessoa) pe = pessoas[k]; }
        w.document.write(saHtmlDoc(d, c ? c.nome : '', pe ? pe.nome : '', r.url)); w.document.close();
      } else { w.location.href = r.url; }
    });
  }
  function copiarParaDrive(d) {
    setDriveMsg(null); setDriveBusy(d.id);
    saDriveCopiar(db, d).then(function (r) { setDriveBusy(null); setDriveMsg({ id: d.id, ok: r.ok, texto: r.ok ? 'Copiado para o Drive.' : r.erro }); if (r.ok) carregarRef.current(); });
  }
  function removerLinkDrive(d) {
    if (typeof window.confirm === 'function' && !window.confirm('Remover o link da cópia do Drive? O ficheiro no Drive não é apagado.')) return;
    gravar('remover o link do Drive', db.from('saude_docs').update({ drive_backup_url: null, updated_at: new Date().toISOString() }).eq('id', d.id).select('id'), function () { setDriveMsg(null); carregarRef.current(); });
  }

  // ── Zeugnis ──
  function abrirNovoZeugnis() { setEditId(null); setZDe(saHoje()); setZAte(saHoje()); setZPerc('100'); setZMedico(''); setZDoc(''); ir('fzeug', 'zeugnis'); }
  function abrirEditarZeugnis(z) { setEditId(z.id); setZDe(z.de); setZAte(z.ate); setZPerc(String(z.percentagem)); setZMedico(z.medico || ''); setZDoc(z.doc || ''); ir('fzeug', 'zeugnis'); }
  function guardarZeugnis() {
    var v = saValidaZeugnis({ de: zDe, ate: zAte, percentagem: zPerc, medico: zMedico }); if (v) { setFErro(v); return; } setFErro('');
    var campos = { de: zDe, ate: zAte, percentagem: parseInt(String(zPerc).trim(), 10), medico: zMedico.trim(), doc: zDoc || null };
    if (editId) {
      gravar('guardar o Zeugnis', db.from('saude_zeugnis').update(Object.assign({}, campos, { updated_at: new Date().toISOString() })).eq('id', editId).select('id'), function () { carregarRef.current(); setEcra('zeugnis'); });
    } else {
      gravar('criar o Zeugnis', db.from('saude_zeugnis').insert(Object.assign({ id: saNovoId(), pessoa: pessoa.id }, campos)).select('id'), function () { carregarRef.current(); setEcra('zeugnis'); });
    }
  }
  function marcarEnviado(z, enviado) {
    gravar(enviado ? 'marcar como enviado' : 'desfazer o envio', db.from('saude_zeugnis').update(Object.assign({}, enviado ? saPatchEnviado(saHoje()) : saPatchPorEnviar(), { updated_at: new Date().toISOString() })).eq('id', z.id).select('id'), function () { carregarRef.current(); });
  }
  function apagarZeugnis(z) {
    if (typeof window.confirm === 'function' && !window.confirm('Apagar este Zeugnis (' + saDataFmt(z.de) + ' – ' + saDataFmt(z.ate) + ')? Não dá para desfazer.')) return;
    gravar('apagar o Zeugnis', db.from('saude_zeugnis').delete().eq('id', z.id).select('id'), function () { carregarRef.current(); });
  }
  function imprimirZeugnis() {
    var w = window.open('', '_blank');
    if (!w) { setErro('O navegador bloqueou a janela de impressão. Permite pop-ups para esta app e tenta outra vez.'); return; }
    w.document.write(saHtmlZeugnis(pessoa ? pessoa.nome : '', zeugDaPessoa)); w.document.close();
  }

  // ── definições (Drive e ficheiros por limpar) ──
  function guardarCliente() {
    var v = String(fCliente || '').trim();
    if (v && !saValidaClientId(v)) { setFErro('O ID de cliente não tem o formato certo (termina em .apps.googleusercontent.com).'); return; }
    setFErro('');
    try { if (v) window.localStorage.setItem(SA_LS_CLIENTE, v); else window.localStorage.removeItem(SA_LS_CLIENTE); setAviso(v ? 'ID de cliente guardado neste aparelho.' : 'ID de cliente removido deste aparelho.'); } catch (e) { saLog('guardar o ID de cliente', e); setErro('Não foi possível guardar neste aparelho: ' + saMsgErro(e)); }
    saDriveSessao.token = null; saDriveSessao.pasta = null;
  }
  function ligarDrive() {
    setErro(''); setAviso(''); setDriveBusy('ligar');
    saDriveToken().then(function () { setDriveBusy(null); setAviso('Ligado ao Drive por 1 hora. Os documentos novos são copiados sozinhos.'); }, function (e) { saLog('ligar ao Drive', e); setDriveBusy(null); setErro(e && e.message ? e.message : String(e)); });
  }
  function limparPendentes() {
    var pend = saLerPendentes();
    comBloqueio(function (fim) { saLimparPendentes(db, pend).then(function (r) { fim(); saGuardarPendentes(r.restantes); setPendentes(r.restantes.length); if (r.restantes.length) setErro('Ainda não foi possível remover ' + r.restantes.length + ' ficheiro(s). Tenta outra vez mais tarde.'); else setAviso('Ficheiros por limpar: tudo removido.'); }); });
  }

  // ── aspeto ──
  var cartao = { background: T.surface, color: T.text, border: '2px solid ' + T.border, borderRadius: 18, padding: 14, marginBottom: 12, boxSizing: 'border-box' };
  var cartaoPessoa = Object.assign({}, cartao, { border: '2px solid ' + SA_ACENTO });
  var inp = { width: '100%', boxSizing: 'border-box', background: T.surface, color: T.text, border: '2px solid ' + T.text, borderRadius: 12, padding: '14px 13px', fontSize: 16, fontFamily: 'inherit', outline: 'none', minHeight: 52 };
  var rotulo = { fontSize: 14, fontWeight: 800, color: T.muted, margin: '16px 0 6px' };
  var ocupado = !!saving;
  var linhaBotoes = { display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' };
  function pilula(txt, forte, cor) { return h('span', { style: { display: 'inline-block', fontSize: 12, fontWeight: 900, letterSpacing: 0.3, padding: '4px 10px', borderRadius: 999, border: (forte ? '2px' : '1.5px') + ' solid ' + (cor || (forte ? SA_ACENTO : T.border)), color: T.text } }, txt); }
  function campoTexto(aria, valor, setValor, o) {
    o = o || {};
    return h('input', { type: o.tipo || 'text', value: valor, autoComplete: 'off', maxLength: o.max, placeholder: o.ph, 'aria-label': aria, disabled: ocupado, inputMode: o.modo, min: o.min, max: o.maxN, onChange: function (e) { setValor(e.target.value); }, style: inp });
  }
  function botoesForm(rotuloOk, aoGuardar) {
    return h('div', { style: { display: 'flex', gap: 8, marginTop: 20 } }, h(SaBtn, { flex: true, kind: 'ghost', disabled: ocupado, onClick: voltar }, 'Cancelar'), h(SaBtn, { flex: true, disabled: ocupado, onClick: aoGuardar }, ocupado ? 'A guardar…' : rotuloOk));
  }
  function msgForm() { return fErro ? h('div', { role: 'alert', style: { color: T.red, fontSize: 14, fontWeight: 800, marginTop: 12 } }, fErro) : null; }

  // ── ecrãs ──
  function renderPessoas() {
    return h('div', null,
      h(SaBtn, { cheio: true, onClick: abrirNovaPessoa }, '+ Nova pessoa'),
      !pessoas.length ? h('div', { style: { textAlign: 'center', color: T.muted, padding: '36px 10px', fontSize: 15, fontWeight: 700 } }, 'Ainda não há pessoas. Cria uma pessoa e, dentro dela, os casos (por exemplo “AVC”, “Operação Joelho”, “Operação Pé”) com os documentos.') : null,
      h('div', { style: { marginTop: 16 } }, pessoas.map(function (p) {
        var cs = casos.filter(function (c) { return c.pessoa === p.id; }), ids = cs.map(function (c) { return c.id; });
        var nd = docs.filter(function (d) { return ids.indexOf(d.caso) !== -1; }).length, rz = saResumoZeugnis(zeug.filter(function (z) { return z.pessoa === p.id; }));
        return h('div', { key: p.id, style: cartaoPessoa },
          h('button', { type: 'button', 'aria-label': 'Abrir ' + p.nome, onClick: function () { setPessoaId(p.id); setCasoId(null); setFiltroCaso('todos'); setFiltroTipo('todos'); setFiltroTexto(''); ir('pessoa'); },
            style: { display: 'block', width: '100%', textAlign: 'left', background: 'transparent', color: T.text, border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' } },
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } }, h('div', { style: { flex: 1, minWidth: 0, fontSize: 22, fontWeight: 900, overflowWrap: 'anywhere' } }, p.nome), h('span', { style: { color: SA_ACENTO, fontSize: 30, fontWeight: 900 } }, '›')),
            h('div', { style: { fontSize: 14, fontWeight: 800, marginTop: 6 } }, cs.length + (cs.length === 1 ? ' caso' : ' casos') + ' · ' + nd + (nd === 1 ? ' documento' : ' documentos') + (rz.porEnviar ? ' · ' + rz.porEnviar + ' Zeugnis por enviar' : ''))),
          h('div', { style: linhaBotoes }, h(SaBtn, { small: true, flex: true, kind: 'ghost', disabled: ocupado, onClick: function () { abrirEditarPessoa(p, 'pessoas'); } }, 'Editar'), h(SaBtn, { small: true, flex: true, kind: 'danger', disabled: ocupado, onClick: function () { apagarPessoa(p); } }, 'Apagar')));
      })),
      h('div', { style: { marginTop: 8 } }, h(SaBtn, { cheio: true, kind: 'ghost', onClick: function () { setFCliente(saDriveClientId()); ir('config'); } }, '⚙️ Definições (Drive e ficheiros por limpar' + (pendentes ? ': ' + pendentes : '') + ')')));
  }

  function renderCartaoDoc(d, mostrarCaso, orig) {
    var c = casoPorId(d.caso), cor = (c && c.cor) || T.border;
    return h('button', { key: d.id, type: 'button', 'aria-label': 'Abrir documento ' + d.titulo, onClick: function () { setDocId(d.id); setDriveMsg(null); ir('doc', orig); },
      style: { display: 'block', width: '100%', textAlign: 'left', background: T.surface, color: T.text, border: '2px solid ' + T.border, borderLeft: '10px solid ' + cor, borderRadius: 14, padding: '12px 14px', marginBottom: 10, cursor: 'pointer', font: 'inherit', boxSizing: 'border-box' } },
      h('div', { style: { fontSize: 17, fontWeight: 900, overflowWrap: 'anywhere' } }, d.titulo),
      h('div', { style: { fontSize: 14, fontWeight: 800, marginTop: 4, color: T.text } }, saEmojiTipo(d.tipo) + ' ' + saRotuloTipo(d.tipo) + ' · ' + saDataFmt(d.data_doc) + (mostrarCaso && c ? ' · ' + c.nome : '') + (d.drive_backup_url ? ' · ☁️' : '')));
  }
  function renderFiltros(comCaso, casosOpc) {
    return h('div', { style: { marginBottom: 12 } },
      h('input', { type: 'text', value: filtroTexto, autoComplete: 'off', placeholder: 'Pesquisar no título e nas notas…', 'aria-label': 'Pesquisar documentos', onChange: function (e) { setFiltroTexto(e.target.value); }, style: inp }),
      comCaso ? h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 } }, h(SaChip, { ativo: filtroCaso === 'todos', onClick: function () { setFiltroCaso('todos'); } }, 'Todos os casos'),
        casosOpc.map(function (c) { return h(SaChip, { key: c.id, ativo: filtroCaso === c.id, cor: c.cor, onClick: function () { setFiltroCaso(c.id); } }, c.nome); })) : null,
      h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 } }, h(SaChip, { ativo: filtroTipo === 'todos', onClick: function () { setFiltroTipo('todos'); } }, 'Todos os tipos'),
        SA_TIPOS.map(function (t) { return h(SaChip, { key: t.key, ativo: filtroTipo === t.key, onClick: function () { setFiltroTipo(t.key); } }, t.emoji + ' ' + t.rot); })));
  }

  function renderPessoa() {
    if (!pessoa) return h('div', { style: { color: T.muted, textAlign: 'center', padding: 30, fontWeight: 700 } }, 'Pessoa não encontrada.');
    var rz = saResumoZeugnis(zeugDaPessoa);
    return h('div', null,
      h('div', { style: cartaoPessoa }, h('div', { style: { fontSize: 24, fontWeight: 900, overflowWrap: 'anywhere' } }, pessoa.nome), pessoa.notas ? h('div', { style: { fontSize: 14, fontWeight: 700, marginTop: 6, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' } }, pessoa.notas) : null,
        h('div', { style: linhaBotoes }, h(SaBtn, { small: true, flex: true, kind: 'ghost', disabled: ocupado, onClick: function () { abrirEditarPessoa(pessoa, 'pessoa'); } }, 'Editar pessoa'), h(SaBtn, { small: true, flex: true, kind: 'danger', disabled: ocupado, onClick: function () { apagarPessoa(pessoa); } }, 'Apagar pessoa'))),
      h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 } },
        h(SaBtn, { flex: true, kind: 'contorno', onClick: function () { ir('zeugnis'); } }, '🏢 Zeugnis' + (rz.porEnviar ? ' (' + rz.porEnviar + ' por enviar)' : '')),
        h(SaBtn, { flex: true, kind: 'contorno', onClick: function () { setFiltroCaso('todos'); ir('docs'); } }, '📚 Todos os documentos (' + docsDaPessoa.length + ')')),
      h('div', { style: { fontSize: 18, fontWeight: 900, margin: '18px 0 10px' } }, 'Casos'),
      h(SaBtn, { cheio: true, onClick: abrirNovoCaso }, '+ Novo caso'),
      !casosDaPessoa.length ? h('div', { style: { textAlign: 'center', color: T.muted, padding: '28px 10px', fontSize: 15, fontWeight: 700 } }, 'Ainda não há casos. Cria o primeiro (por exemplo “AVC”, “Operação Joelho” ou “Operação Pé”).') : null,
      h('div', { style: { marginTop: 14 } }, casosDaPessoa.map(function (c) {
        var n = saContarDocsDoCaso(docs, c.id);
        return h('div', { key: c.id, style: Object.assign({}, cartao, { borderLeft: '12px solid ' + c.cor }) },
          h('button', { type: 'button', 'aria-label': 'Abrir caso ' + c.nome, onClick: function () { setCasoId(c.id); setFiltroTipo('todos'); setFiltroTexto(''); ir('caso'); },
            style: { display: 'block', width: '100%', textAlign: 'left', background: 'transparent', color: T.text, border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' } },
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } }, h('div', { style: { flex: 1, minWidth: 0, fontSize: 20, fontWeight: 900, overflowWrap: 'anywhere' } }, c.nome), h('span', { style: { color: c.cor, fontSize: 28, fontWeight: 900 } }, '›')),
            h('div', { style: { fontSize: 14, fontWeight: 800, marginTop: 4 } }, n + (n === 1 ? ' documento' : ' documentos'))),
          h('div', { style: linhaBotoes }, h(SaBtn, { small: true, flex: true, kind: 'ghost', disabled: ocupado, onClick: function () { abrirEditarCaso(c); } }, 'Editar'), h(SaBtn, { small: true, flex: true, kind: 'danger', disabled: ocupado, onClick: function () { apagarCaso(c); } }, 'Apagar')));
      })));
  }

  function renderCaso() {
    if (!caso) return h('div', { style: { color: T.muted, textAlign: 'center', padding: 30, fontWeight: 700 } }, 'Caso não encontrado.');
    var lista = saFiltrarDocs(docs, { caso: caso.id, tipo: filtroTipo, texto: filtroTexto }), total = saContarDocsDoCaso(docs, caso.id);
    return h('div', null,
      h('div', { style: Object.assign({}, cartao, { borderLeft: '12px solid ' + caso.cor }) }, h('div', { style: { fontSize: 22, fontWeight: 900, overflowWrap: 'anywhere' } }, caso.nome), h('div', { style: { fontSize: 14, fontWeight: 800, marginTop: 4 } }, total + (total === 1 ? ' documento' : ' documentos'))),
      h(SaBtn, { cheio: true, onClick: function () { abrirNovoDoc(caso.id, 'caso'); } }, '+ Adicionar documento (foto ou PDF)'),
      total ? h('div', { style: { marginTop: 14 } }, renderFiltros(false, [])) : null,
      !total ? h('div', { style: { textAlign: 'center', color: T.muted, padding: '32px 10px', fontSize: 15, fontWeight: 700 } }, 'Ainda não há documentos neste caso.') : null,
      total && !lista.length ? h('div', { style: { textAlign: 'center', color: T.muted, padding: '28px 10px', fontSize: 15, fontWeight: 700 } }, 'Nenhum documento com estes filtros.') : null,
      h('div', { style: { marginTop: 6 } }, lista.map(function (d) { return renderCartaoDoc(d, false, 'caso'); })));
  }

  function renderDocs() {
    var lista = saFiltrarDocs(docsDaPessoa, { caso: filtroCaso, tipo: filtroTipo, texto: filtroTexto });
    return h('div', null,
      h(SaBtn, { cheio: true, onClick: function () { abrirNovoDoc(filtroCaso !== 'todos' ? filtroCaso : '', 'docs'); } }, '+ Adicionar documento (foto ou PDF)'),
      h('div', { style: { marginTop: 14 } }, renderFiltros(true, casosDaPessoa)),
      !docsDaPessoa.length ? h('div', { style: { textAlign: 'center', color: T.muted, padding: '28px 10px', fontSize: 15, fontWeight: 700 } }, 'Ainda não há documentos.') : null,
      docsDaPessoa.length && !lista.length ? h('div', { style: { textAlign: 'center', color: T.muted, padding: '28px 10px', fontSize: 15, fontWeight: 700 } }, 'Nenhum documento com estes filtros.') : null,
      h('div', null, lista.map(function (d) { return renderCartaoDoc(d, true, 'docs'); })));
  }

  function renderDoc() {
    if (!doc) return h('div', { style: { color: T.muted, textAlign: 'center', padding: 30, fontWeight: 700 } }, 'Documento não encontrado.');
    var c = casoPorId(doc.caso), tf = saTipoFicheiro(doc.ficheiro_path), lk = saLinkDrive(doc.drive_backup_url);
    var temCliente = saValidaClientId(saDriveClientId()), dm = driveMsg && driveMsg.id === doc.id ? driveMsg : null;
    return h('div', null,
      h('div', { style: Object.assign({}, cartao, { borderLeft: '12px solid ' + ((c && c.cor) || T.border) }) },
        h('div', { style: { fontSize: 22, fontWeight: 900, overflowWrap: 'anywhere' } }, doc.titulo),
        h('div', { style: { fontSize: 15, fontWeight: 800, marginTop: 6 } }, saEmojiTipo(doc.tipo) + ' ' + saRotuloTipo(doc.tipo) + ' · ' + saDataFmt(doc.data_doc) + (c ? ' · ' + c.nome : '')),
        doc.notas ? h('div', { style: { fontSize: 15, fontWeight: 700, marginTop: 10, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' } }, doc.notas) : null),
      tf === 'imagem' && urlImg ? h('img', { src: urlImg, alt: 'Pré-visualização de ' + doc.titulo, style: { display: 'block', maxWidth: '100%', borderRadius: 12, border: '2px solid ' + T.border, marginBottom: 12 } }) : null,
      h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
        h(SaBtn, { flex: true, disabled: ocupado, onClick: function () { abrirEmJanela(doc, false); } }, '📂 Abrir ficheiro'),
        h(SaBtn, { flex: true, kind: 'contorno', disabled: ocupado, onClick: function () { abrirEmJanela(doc, true); } }, '🖨️ Imprimir')),
      tf === 'pdf' ? h('div', { style: { fontSize: 12, fontWeight: 700, color: T.muted, marginTop: 6 } }, 'PDF: abre no leitor do telemóvel, onde está a opção de imprimir.') : null,
      h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 } },
        h(SaBtn, { flex: true, kind: 'ghost', disabled: ocupado, onClick: function () { abrirEditarDoc(doc); } }, 'Editar'),
        h(SaBtn, { flex: true, kind: 'danger', disabled: ocupado, onClick: function () { apagarDoc(doc); } }, 'Apagar')),
      h('div', { style: Object.assign({}, cartao, { marginTop: 16 }) },
        h('div', { style: { fontSize: 16, fontWeight: 900 } }, '☁️ Cópia de segurança no Drive'),
        lk.ok && lk.valor
          ? h('div', null, h('div', { style: { fontSize: 14, fontWeight: 800, marginTop: 6 } }, 'Copiado para o Drive.'),
              h('div', { style: linhaBotoes }, h('a', { href: lk.valor, target: '_blank', rel: 'noopener noreferrer', style: { flex: 1, minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 14, border: '1.5px solid ' + T.border, background: T.surface2, color: T.text, fontWeight: 900, textDecoration: 'none', fontSize: 14 } }, '📎 Abrir no Drive'),
                h(SaBtn, { small: true, flex: true, kind: 'ghost', disabled: ocupado, onClick: function () { removerLinkDrive(doc); } }, 'Remover link')))
          : h('div', null, h('div', { style: { fontSize: 14, fontWeight: 800, marginTop: 6 } }, 'Sem cópia no Drive.'),
              h('div', { style: linhaBotoes }, h(SaBtn, { small: true, flex: true, disabled: ocupado || !!driveBusy || !temCliente, onClick: function () { copiarParaDrive(doc); } }, driveBusy === doc.id ? 'A copiar…' : '☁️ Copiar para o Drive')),
              !temCliente ? h('div', { style: { fontSize: 12, fontWeight: 700, color: T.muted, marginTop: 6 } }, 'Para ligar ao Drive, define o ID de cliente do Google nas Definições (no ecrã das pessoas).') : null),
        dm ? h('div', { role: 'status', style: { fontSize: 13, fontWeight: 800, marginTop: 8, color: dm.ok ? T.text : T.red, overflowWrap: 'anywhere' } }, dm.texto) : null));
  }

  function renderZeugnis() {
    var lista = saOrdenarZeugnis(zeugDaPessoa), rz = saResumoZeugnis(zeugDaPessoa);
    return h('div', null,
      h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } }, h(SaBtn, { flex: true, onClick: abrirNovoZeugnis }, '+ Novo Zeugnis'), h(SaBtn, { flex: true, kind: 'contorno', disabled: !lista.length, onClick: imprimirZeugnis }, '🖨️ Imprimir lista')),
      h('div', { style: { fontSize: 15, fontWeight: 900, margin: '14px 0' } }, rz.porEnviar + ' por enviar · ' + rz.enviados + (rz.enviados === 1 ? ' enviado à firma' : ' enviados à firma')),
      !lista.length ? h('div', { style: { textAlign: 'center', color: T.muted, padding: '28px 10px', fontSize: 15, fontWeight: 700 } }, 'Ainda não há Zeugnis.') : null,
      lista.map(function (z) {
        var enviado = z.estado === 'enviado', dz = null; for (var k = 0; k < docs.length; k++) { if (docs[k].id === z.doc) dz = docs[k]; }
        return h('div', { key: z.id, 'data-estado': enviado ? 'enviado' : 'por-enviar', style: Object.assign({}, cartao, { border: (enviado ? '2px solid ' + T.border : '3px solid ' + SA_ACENTO), background: enviado ? T.surface : ntAlfaSaude(SA_ACENTO, 0.1) }) },
          h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' } },
            h('div', { style: { fontSize: 18, fontWeight: 900 } }, saDataFmt(z.de) + ' – ' + saDataFmt(z.ate)), pilula(enviado ? 'ENVIADO À FIRMA ✓' : 'POR ENVIAR', !enviado)),
          h('div', { style: { fontSize: 15, fontWeight: 800, marginTop: 6 } }, z.percentagem + '%' + (z.medico ? ' · ' + z.medico : '')),
          enviado && z.enviado_em ? h('div', { style: { fontSize: 14, fontWeight: 800, marginTop: 4 } }, 'Enviado à firma em ' + saDataFmt(z.enviado_em)) : null,
          h('div', { style: linhaBotoes },
            enviado ? h(SaBtn, { flex: true, kind: 'ghost', disabled: ocupado, onClick: function () { marcarEnviado(z, false); } }, '↩ Desfazer envio') : h(SaBtn, { flex: true, disabled: ocupado, onClick: function () { marcarEnviado(z, true); } }, '✓ Marcar Enviado à firma')),
          h('div', { style: linhaBotoes },
            dz ? h(SaBtn, { small: true, flex: true, kind: 'contorno', disabled: ocupado, onClick: function () { setDocId(dz.id); setDriveMsg(null); ir('doc', 'zeugnis'); } }, '📄 Ver documento') : null,
            h(SaBtn, { small: true, flex: true, kind: 'ghost', disabled: ocupado, onClick: function () { abrirEditarZeugnis(z); } }, 'Editar'),
            h(SaBtn, { small: true, flex: true, kind: 'danger', disabled: ocupado, onClick: function () { apagarZeugnis(z); } }, 'Apagar')));
      }));
  }

  function renderFormPessoa() {
    return h('div', null, h('div', { style: { fontSize: 20, fontWeight: 900 } }, editId ? 'Editar pessoa' : 'Nova pessoa'),
      h('div', { style: rotulo }, 'Nome'), campoTexto('Nome da pessoa', fNome, setFNome, { max: SA_MAX_NOME, ph: 'Nome' }),
      h('div', { style: rotulo }, 'Notas (opcional)'), h('textarea', { value: fNotas, autoComplete: 'off', rows: 4, maxLength: SA_MAX_NOTAS, 'aria-label': 'Notas da pessoa', disabled: ocupado, onChange: function (e) { setFNotas(e.target.value); }, style: Object.assign({}, inp, { resize: 'vertical', lineHeight: 1.4 }) }),
      msgForm(), botoesForm(editId ? 'Guardar alterações' : 'Criar pessoa', guardarPessoa));
  }
  function renderFormCaso() {
    return h('div', null, h('div', { style: { fontSize: 20, fontWeight: 900 } }, editId ? 'Editar caso' : 'Novo caso'),
      h('div', { style: rotulo }, 'Nome do caso'), campoTexto('Nome do caso', fNome, setFNome, { max: SA_MAX_NOME, ph: 'Por exemplo: AVC, Operação Joelho, Operação Pé' }),
      h('div', { style: rotulo }, 'Cor'), h('div', { style: { display: 'flex', gap: 10, flexWrap: 'wrap' } }, SA_CORES.map(function (cor) {
        return h('button', { key: cor, type: 'button', 'aria-label': 'Cor ' + cor, 'aria-pressed': fCor === cor, disabled: ocupado, onClick: function () { setFCor(cor); }, style: { width: 52, height: 52, borderRadius: 14, background: cor, border: fCor === cor ? '4px solid ' + T.text : '2px solid ' + T.border, cursor: 'pointer' } });
      })),
      msgForm(), botoesForm(editId ? 'Guardar alterações' : 'Criar caso', guardarCaso));
  }
  function renderFormDoc() {
    return h('div', null, h('div', { style: { fontSize: 20, fontWeight: 900 } }, editId ? 'Editar documento' : 'Novo documento'),
      !editId ? h('div', null, h('div', { style: rotulo }, 'Foto ou PDF (até 15 MB)'),
        h('input', { type: 'file', accept: 'image/*,application/pdf', autoComplete: 'off', 'aria-label': 'Ficheiro do documento', disabled: ocupado, onChange: escolherFicheiro, style: Object.assign({}, inp, { padding: 12 }) }),
        fFicheiro ? h('div', { style: { fontSize: 13, fontWeight: 700, marginTop: 6, overflowWrap: 'anywhere' } }, fFicheiro.name + ' · ' + Math.max(1, Math.round(fFicheiro.size / 1024)) + ' KB') : null) : h('div', { style: { fontSize: 13, fontWeight: 700, color: T.muted, marginTop: 6 } }, 'O ficheiro não se muda ao editar: para trocar, apaga o documento e adiciona outro.'),
      h('div', { style: rotulo }, 'Título'), campoTexto('Título do documento', fTitulo, setFTitulo, { max: SA_MAX_TITULO, ph: 'Por exemplo: Relatório de controlo' }),
      h('div', { style: rotulo }, 'Data do documento'), campoTexto('Data do documento', fData, setFData, { tipo: 'date' }),
      h('div', { style: rotulo }, 'Caso'), h('select', { value: fCaso, autoComplete: 'off', 'aria-label': 'Caso', disabled: ocupado, onChange: function (e) { setFCaso(e.target.value); }, style: inp },
        h('option', { value: '' }, 'Escolhe o caso…'), casosDaPessoa.map(function (c) { return h('option', { key: c.id, value: c.id }, c.nome); })),
      h('div', { style: rotulo }, 'Tipo'), h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } }, SA_TIPOS.map(function (t) { return h(SaChip, { key: t.key, ativo: fTipo === t.key, disabled: ocupado, onClick: function () { setFTipo(t.key); } }, t.emoji + ' ' + t.rot); })),
      h('div', { style: rotulo }, 'Notas (opcional)'), h('textarea', { value: fNotas, autoComplete: 'off', rows: 3, maxLength: SA_MAX_NOTAS, 'aria-label': 'Notas do documento', disabled: ocupado, onChange: function (e) { setFNotas(e.target.value); }, style: Object.assign({}, inp, { resize: 'vertical', lineHeight: 1.4 }) }),
      msgForm(), botoesForm(editId ? 'Guardar alterações' : 'Guardar documento', guardarDoc));
  }
  function renderFormZeugnis() {
    var docsZ = docsDaPessoa.filter(function (d) { return d.tipo === 'zeugnis'; });
    return h('div', null, h('div', { style: { fontSize: 20, fontWeight: 900 } }, editId ? 'Editar Zeugnis' : 'Novo Zeugnis'),
      h('div', { style: { display: 'flex', gap: 10 } }, h('div', { style: { flex: 1, minWidth: 0 } }, h('div', { style: rotulo }, 'De'), campoTexto('Zeugnis de', zDe, setZDe, { tipo: 'date' })), h('div', { style: { flex: 1, minWidth: 0 } }, h('div', { style: rotulo }, 'Até'), campoTexto('Zeugnis até', zAte, setZAte, { tipo: 'date' }))),
      h('div', { style: rotulo }, 'Percentagem (0 a 100)'), campoTexto('Percentagem', zPerc, setZPerc, { tipo: 'number', modo: 'numeric', min: 0, maxN: 100 }),
      h('div', { style: rotulo }, 'Médico (opcional)'), campoTexto('Médico', zMedico, setZMedico, { max: SA_MAX_MEDICO, ph: 'Nome do médico' }),
      h('div', { style: rotulo }, 'Documento ligado (opcional)'), h('select', { value: zDoc, autoComplete: 'off', 'aria-label': 'Documento ligado', disabled: ocupado, onChange: function (e) { setZDoc(e.target.value); }, style: inp },
        h('option', { value: '' }, 'Nenhum'), docsZ.map(function (d) { return h('option', { key: d.id, value: d.id }, d.titulo + ' (' + saDataFmt(d.data_doc) + ')'); })),
      msgForm(), botoesForm(editId ? 'Guardar alterações' : 'Criar Zeugnis', guardarZeugnis));
  }
  function renderConfig() {
    var pend = saLerPendentes();
    return h('div', null, h('div', { style: { fontSize: 20, fontWeight: 900 } }, 'Definições'),
      h('div', { style: Object.assign({}, cartao, { marginTop: 12 }) },
        h('div', { style: { fontSize: 16, fontWeight: 900 } }, '☁️ Backup no Drive'),
        h('div', { style: { fontSize: 13, fontWeight: 700, marginTop: 6 } }, 'Cada documento pode ser copiado para a pasta “' + SA_DRIVE_PASTA + '” do teu Drive. A app só vê os ficheiros que ela própria cria (âmbito drive.file). Precisa de um ID de cliente Web criado por ti no Google Cloud (ver o relatório). Fica só neste aparelho.'),
        h('div', { style: rotulo }, 'ID de cliente do Google'), campoTexto('ID de cliente do Google', fCliente, setFCliente, { max: 200, ph: '123456789-xxxx.apps.googleusercontent.com' }),
        msgForm(),
        h('div', { style: linhaBotoes }, h(SaBtn, { small: true, flex: true, disabled: ocupado, onClick: guardarCliente }, 'Guardar ID'), h(SaBtn, { small: true, flex: true, kind: 'contorno', disabled: ocupado || driveBusy === 'ligar', onClick: ligarDrive }, driveBusy === 'ligar' ? 'A ligar…' : 'Ligar ao Drive agora'))),
      h('div', { style: cartao }, h('div', { style: { fontSize: 16, fontWeight: 900 } }, '🧹 Ficheiros por limpar'),
        h('div', { style: { fontSize: 13, fontWeight: 700, marginTop: 6 } }, pend.length ? pend.length + (pend.length === 1 ? ' ficheiro' : ' ficheiros') + ' não removido(s) do armazenamento por uma falha. A app tenta outra vez ao abrir; podes tentar já.' : 'Nada por limpar.'),
        pend.length ? h('div', { style: linhaBotoes }, h(SaBtn, { small: true, flex: true, disabled: ocupado, onClick: limparPendentes }, 'Tentar limpar agora')) : null));
  }

  var titulo = 'Carvalho Saúde';
  if (ecra === 'pessoa' && pessoa) titulo = pessoa.nome; else if (ecra === 'caso' && caso) titulo = caso.nome; else if (ecra === 'docs') titulo = 'Documentos'; else if (ecra === 'doc') titulo = 'Documento'; else if (ecra === 'zeugnis') titulo = 'Zeugnis'; else if (ecra === 'config') titulo = 'Definições';
  var corpo;
  if (!carregado) corpo = h('div', { style: { textAlign: 'center', color: T.muted, padding: 40, fontWeight: 700 } }, 'A carregar…');
  else if (erroCarga) corpo = h('div', { style: { textAlign: 'center', padding: 24 } }, h('div', { role: 'alert', style: { color: T.red, fontWeight: 800, marginBottom: 16, overflowWrap: 'anywhere', fontSize: 15 } }, erroCarga), h(SaBtn, { onClick: function () { setCarregado(false); carregar(); } }, 'Tentar outra vez'));
  else if (ecra === 'fpessoa') corpo = renderFormPessoa();
  else if (ecra === 'fcaso') corpo = renderFormCaso();
  else if (ecra === 'fdoc') corpo = renderFormDoc();
  else if (ecra === 'fzeug') corpo = renderFormZeugnis();
  else if (ecra === 'config') corpo = renderConfig();
  else if (ecra === 'doc') corpo = renderDoc();
  else if (ecra === 'zeugnis') corpo = renderZeugnis();
  else if (ecra === 'docs') corpo = renderDocs();
  else if (ecra === 'caso') corpo = renderCaso();
  else if (ecra === 'pessoa') corpo = renderPessoa();
  else corpo = renderPessoas();

  return h('div', { style: Object.assign({}, wrap, { paddingBottom: 80 }) },
    h(SaBarra, { onBack: voltar, titulo: titulo }),
    h('div', { style: { padding: '16px 16px 0', maxWidth: 640, margin: '0 auto' } },
      erro ? h(SaAviso, { texto: erro, onFechar: function () { setErro(''); } }) : null,
      aviso ? h(SaAviso, { tipo: 'aviso', texto: aviso, onFechar: function () { setAviso(''); } }) : null,
      corpo));
}

// Cartão no menu (só admin): acrescenta-se aqui para não mexer no src/02-theme.js. O render fica em src/10-shell.js.
(function () {
  if (typeof APPS_DATA !== 'undefined' && Array.isArray(APPS_DATA) && !APPS_DATA.some(function (a) { return a.id === 'saude'; })) {
    APPS_DATA.push({ id: 'saude', emoji: '🩺', name: 'Carvalho Saúde', desc: 'Papéis clínicos e Zeugnis', badge: null, color: '#0EA5E9', adminOnly: true });
  }
})();
