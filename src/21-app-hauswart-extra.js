// ── HAUSWART EXTRA ────────────────────────────────────────────────────
// Parte nova e separada da Hauswart: trabalhos leves às sextas (casa leve,
// compras, ajuda com PC e telemóvel). Admin only (só é aberta a partir do
// botão "➕ Extra" do HauswartApp). Agenda (trabalhos e séries), Ofertas, Clientes (com locais), Preços e Ajustes.
// Tabelas hwx_clientes, hwx_servicos, hwx_locais, hwx_config, hwx_ofertas, hwx_trabalhos, hwx_series
// (sql/24_hwx_base.sql … sql/27_hwx_agenda.sql).
// hauswart_data: SÓ LIDA (separador Totais: select + maybeSingle); nunca escrita. localStorage só para lembrar filtros (hwx_f_*).
// Única exportação: window.HwxApp. Tudo o resto fica dentro desta IIFE.
// ─────────────────────────────────────────────────────────────────────
(function () {
  try {

    // ── Cores FIXAS (preto/cinzento; cor só para estados) ──
    var HX = {
      bg: '#000000', surface: '#141414', surface2: '#1f1f1f', field: '#0a0a0a',
      border: '#404040', borderStrong: '#737373',
      text: '#ffffff', muted: '#a3a3a3',
      ok: '#22c55e', okBg: '#052e16', okText: '#86efac',
      warn: '#f59e0b', warnBg: '#2b1a02', warnText: '#fcd34d',
      bad: '#ef4444', badBg: '#2a0a0a', badText: '#fecaca'
    };
    var HWX_MAXW = 960;

    var HWX_DEFAULT_CATS = [
      { id: 'casa', nome: 'Casa' },
      { id: 'compras', nome: 'Compras' },
      { id: 'pc_telemovel', nome: 'PC e telemóvel' },
      { id: 'outro', nome: 'Outro' }
    ];
    var HWX_UNITS = [
      { v: 'hora', l: 'Por hora', s: '/ Std.' },
      { v: '30min', l: 'Por 30 min', s: '/ 30 Min.' },
      { v: 'peca', l: 'Por peça', s: '/ Stk.' },
      { v: 'fixo', l: 'Fixo por vez', s: 'fixo' },
      { v: 'mes', l: 'Por mês', s: '/ Monat' },
      { v: 'trimestre', l: 'Por trimestre', s: '/ Quartal' },
      { v: 'ano', l: 'Por ano', s: '/ Jahr' }
    ];
    var HWX_UNITS_MIN = ['hora', '30min', 'peca'];
    var HWX_LANGS = [
      { v: 'de', l: 'DE' }, { v: 'fr', l: 'FR' }, { v: 'it', l: 'IT' }, { v: 'en', l: 'EN' }, { v: 'pt', l: 'PT' }
    ];
    var HWX_SERV_ESTADOS = [
      { v: 'ativo', l: 'Ativo' }, { v: 'pausado', l: 'Pausado' }, { v: 'sazonal', l: 'Sazonal' },
      { v: 'consulta', l: 'Sob consulta' }, { v: 'arquivado', l: 'Arquivado' }
    ];
    var HWX_CLI_ESTADOS = [
      { v: 'ativo', l: 'Ativo' }, { v: 'fixo', l: 'Fixo' }, { v: 'pausado', l: 'Pausado' },
      { v: 'contacto', l: 'Contacto' }, { v: 'arquivado', l: 'Arquivado' }
    ];
    var HWX_MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    // Cores por estado (sem azul)
    var HWX_ESTADO_COR = {
      ativo: HX.ok, fixo: '#e5e5e5', pausado: HX.warn, sazonal: '#fb923c',
      consulta: '#c084fc', contacto: '#c084fc', arquivado: '#737373'
    };

    // ── Números, datas e texto ──
    // Aceita vírgula ou ponto; tira espaços e apóstrofos (milhares suíços).
    // Devolve número ou null.
    function hwxNum(v) {
      if (typeof v === 'number') return isFinite(v) ? v : null;
      var s = String(v == null ? '' : v).replace(/[\s'’]/g, '').replace(',', '.');
      if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
      var n = parseFloat(s);
      return isFinite(n) ? n : null;
    }
    // Valores monetários em Rappen inteiros; guardados como CHF com 2 casas.
    function hwxToRappen(n) { return Math.round(Number(n) * 100); }
    function hwxFromRappen(r) { return r / 100; }
    function hwxChf(n) {
      var r = hwxToRappen(n), neg = r < 0;
      r = Math.abs(r);
      var cents = ('0' + (r % 100)).slice(-2);
      var whole = String(Math.floor(r / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, '’');
      return 'CHF ' + (neg ? '-' : '') + whole + '.' + cents;
    }
    function hwxQty(n) { return String(Math.round(Number(n) * 100) / 100); }
    function hwxNorm(s) {
      var t = String(s == null ? '' : s).toLowerCase();
      try { t = t.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) { console.error('[hwx] normalize', e); }
      return t;
    }
    function hwxSlug(s) {
      var t = hwxNorm(s).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      return t || 'categoria';
    }
    function hwxToday() {
      var d = new Date();
      return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    }
    function hwxFmtDate(s) {
      if (!s) return '';
      return new Date(s + 'T12:00:00').toLocaleDateString('de-CH');
    }
    // Só dígitos; 00XX… → XX…; 0XX… → 41XX…; +41 (0)79… → 4179…
    function hwxPhone(raw) {
      var d = String(raw == null ? '' : raw).replace(/\D/g, '');
      if (!d) return '';
      if (d.indexOf('00') === 0) d = d.slice(2);
      else if (d.charAt(0) === '0') d = '41' + d.slice(1);
      if (d.indexOf('410') === 0 && d.length === 12) d = '41' + d.slice(3);
      return d.length >= 8 ? d : '';
    }
    // Chave para comparar números (dedup): mesmo número escrito de formas diferentes
    function hwxPhoneKey(raw) {
      var d = hwxPhone(raw);
      return d || String(raw == null ? '' : raw).replace(/\D/g, '');
    }
    // Só para MOSTRAR (o que está gravado não muda): +41 79 597 22 62 / 079 597 22 62
    function hwxFmtPhone(raw) {
      var s = String(raw == null ? '' : raw).trim();
      if (!s) return '';
      var d = s.replace(/\D/g, '');
      if (/^(\+|00)/.test(s.replace(/\s/g, ''))) {
        if (d.indexOf('00') === 0) d = d.slice(2);
        if (d.indexOf('410') === 0 && d.length === 12) d = '41' + d.slice(3);
        if (/^41\d{9}$/.test(d)) return '+41 ' + d.slice(2, 4) + ' ' + d.slice(4, 7) + ' ' + d.slice(7, 9) + ' ' + d.slice(9, 11);
        return s;
      }
      if (/^0[1-9]\d{8}$/.test(d)) return d.slice(0, 3) + ' ' + d.slice(3, 6) + ' ' + d.slice(6, 8) + ' ' + d.slice(8, 10);
      return s;
    }
    // PLZ suíço = 4 dígitos. Avisa (não bloqueia).
    function hwxPlzWarn(v) {
      var s = String(v == null ? '' : v).trim();
      if (s && !/^\d{4}$/.test(s)) return 'O PLZ suíço tem 4 dígitos (podes gravar na mesma).';
      return '';
    }
    // ⓘ + exemplo em cinzento de cada campo, pelo rótulo. Um campo pode trazer o seu próprio `info`/`placeholder`.
    var HWX_AJUDA = {
      'Nome': ['Nome da pessoa ou da entrada. Aparece nas listas e nos documentos.', 'ex.: Hans Müller'],
      'Firma (opcional)': ['Nome da empresa ou administração, se o cliente for uma firma. Aparece à frente do nome.', 'ex.: Verwaltung Müller AG'],
      'Rua': ['Rua e número da morada.', 'ex.: Gartenstrasse 12'],
      'PLZ': ['Código postal suíço: 4 dígitos.', '2545'],
      'Localidade': ['Localidade (Ort) da morada.', 'Selzach'],
      'Telemóvel': ['Número para ligar e para o WhatsApp. Podes escrevê-lo com espaços.', '079 123 45 67'],
      'Telefone fixo': ['Número fixo, se houver.', '032 123 45 67'],
      'Telefone': ['Número de telefone para os documentos.', '032 123 45 67'],
      'E-mail': ['Endereço de e-mail.', 'nome@exemplo.ch'],
      'Notas': ['Notas só para ti: não saem nas ofertas nem nos trabalhos.', 'ex.: a chave está com o vizinho'],
      'Nota': ['Nota curta sobre o serviço (por exemplo como se cobra).', 'ex.: preço por visita'],
      'Número de cliente': ['Número do cliente. Se deixares vazio, a base dá o próximo.', 'automático'],
      'Subnúmero': ['Número do local dentro do cliente (1.1, 1.2…). Vazio = o próximo.', 'automático'],
      'Nome do local': ['Nome curto para reconheceres este local de trabalho.', 'ex.: Passionsstrasse 6'],
      'Limite anual (CHF)': ['Máximo de rendimento anual (Extra + Hauswart, sem material). A barra dos Totais usa este valor.', 'ex.: 2500'],
      'Preço base por hora (CHF)': ['Preço por hora das linhas livres. Também serve para avisar quando uma taxa parece preço de trabalho.', 'ex.: 35,00'],
      'Horas que quero trabalhar por sexta': ['Limite de horas de uma sexta. A Agenda avisa quando o dia passa deste valor.', 'ex.: 8'],
      'Horas de referência (só para mim)': ['Quantas horas costuma levar este serviço. Serve só para planear; não aparece nas ofertas.', 'ex.: 3'],
      'Preço (CHF)': ['Preço do serviço na unidade escolhida.', 'ex.: 35,00'],
      'Mínimo (ex.: 1)': ['Quantidade mínima que se cobra (por exemplo 2 horas).', 'ex.: 2'],
      'Pesquisar por nome': ['Escreve parte do nome para filtrar a lista.', 'nome do serviço'],
      'Procurar cliente': ['Escreve o número, o nome ou a firma para encontrar o cliente.', 'nº, nome ou firma'],
      'Título': ['Título curto, para reconheceres a oferta ou o trabalho na lista.', 'ex.: Gartenpflege Frühling'],
      'Descrição': ['O que se faz. Aparece na linha da oferta/trabalho e na lista das séries.', 'ex.: Rasen mähen'],
      'Horas': ['Horas de deslocação cobradas (só na Anfahrt por hora).', 'ex.: 1'],
      'Quantidade': ['Quantidade na unidade escolhida (horas, peças…). Usa vírgula para decimais.', 'ex.: 3'],
      'Valor (%)': ['Percentagem de desconto sobre o total das linhas.', 'ex.: 10'],
      'Valor (CHF)': ['Valor fixo em francos.', 'ex.: 20,00'],
      'Notas para o cliente (impressas)': ['Texto que vai impresso na oferta, para o cliente ler.', 'ex.: Pagamento a 30 dias.'],
      'Notas internas (só para mim — nunca impressas nem enviadas)': ['Notas só para ti: nunca saem na impressão nem nas mensagens.', 'ex.: portão com código'],
      'Hora': ['Hora de início prevista.', ''],
      'Horas reais': ['Horas que realmente demoraste. Servem para o preço real médio por hora nos Totais.', 'ex.: 2,5'],
      'Material (CHF)': ['Material comprado para o cliente (reembolso). Soma ao total e conta à parte nos Totais.', 'ex.: 12,50'],
      'Notas para o cliente': ['Texto para o cliente, se for preciso.', 'ex.: Levo as ferramentas.'],
      'Notas internas (só para mim)': ['Notas só para ti.', 'ex.: confirmar a chave antes'],
      'De quantos em quantos dias': ['Intervalo entre ocorrências. 14 = de duas em duas semanas; 7 = todas as semanas.', 'ex.: 14'],
      'Horas previstas': ['Horas previstas por ocorrência. Servem para a barra de horas da sexta.', 'ex.: 2,5'],
      'Notas (só para mim)': ['Notas só para ti.', 'ex.: cliente prefere de manhã'],
      'Nome (escrever)': ['Nome da zona, normalmente a localidade.', 'ex.: Grenchen'],
      'Valor (CHF por hora)': ['Quanto se acrescenta por hora de trabalho nesta zona (só deslocação).', 'ex.: 10,00'],
      'Valor (CHF por ida)': ['Taxa fixa de deslocação por ida nesta zona.', 'ex.: 25,00'],
      'Preço por hora (CHF)': ['Preço por hora da deslocação.', 'ex.: 10,00'],
      'Pesquisar (nº': ['Escreve um número ou parte do nome para filtrar.', 'ex.: 2, 2.2 ou nome'],
      // selects e datas (só ⓘ)
      'Ano': ['Ano a mostrar.', ''],
      'Categoria': ['Grupo do serviço na tabela de preços.', ''],
      'Cliente': ['Filtra por cliente.', ''],
      'Desconto': ['Desconto em francos ou em percentagem sobre o total das linhas.', ''],
      'Estado': ['Em que ponto está: rascunho, enviada, aceite… ou planeado, feito, cancelado.', ''],
      'Local de trabalho': ['Onde se trabalha. Se o cliente só tiver um local, vem escolhido.', ''],
      'Língua': ['Língua das mensagens e da oferta deste cliente.', ''],
      'Mover os serviços para': ['Categoria que recebe os serviços da que vais apagar.', ''],
      'Nome da zona': ['Zona de deslocação. Escolhe uma habitual ou "Outra".', ''],
      'Ordenar por': ['Ordem da lista.', ''],
      'Serviço (tabela de preços)': ['Serviço da tabela de preços que esta série repete.', ''],
      'Tipo de deslocação': ['Como se cobra a deslocação desta zona: incluída, por hora ou taxa por ida.', ''],
      'Tipo de deslocação (só esta oferta)': ['Como se cobra a deslocação só nesta oferta.', ''],
      'Tipo': ['Tipo de cobrança.', ''],
      'Unidade': ['Como se conta: por hora, por 30 min, valor fixo, por mês…', ''],
      'Zona por defeito': ['Zona usada quando o local não tem uma.', ''],
      'Zona': ['Zona de deslocação: decide a Anfahrt sugerida.', ''],
      'Data de pagamento': ['Dia em que o cliente pagou.', ''],
      'Data': ['Dia do trabalho. As séries e a Agenda usam sextas-feiras.', ''],
      'Fim (vazio = sem fim)': ['Última data da série. Vazio = continua para sempre.', ''],
      'Pausado até (opcional)': ['Enquanto durar a pausa o serviço não aparece nas ofertas.', ''],
      'Primeira data': ['Primeira data da série. As seguintes contam a partir daqui.', ''],
      'Sexta de referência da semana A': ['Uma sexta que seja semana A. As outras alternam A/B a partir dela.', ''],
      'Válida até': ['Data até à qual a oferta vale.', ''],
      'Última data (fim)': ['Última data em que a série ainda gera trabalhos.', ''],
      'A partir de': ['Data em que a nova série começa; a atual acaba na véspera.', '']
    };
    function hwxAjuda(label) {
      var l = String(label == null ? '' : label);
      if (HWX_AJUDA[l]) return { info: HWX_AJUDA[l][0], ph: HWX_AJUDA[l][1] };
      var pre = ['Pesquisar (nº', 'Valor (CHF por', 'Preço (CHF,', 'Pesquisar (número'];
      for (var i = 0; i < pre.length; i++) {
        if (l.indexOf(pre[i]) === 0) {
          if (pre[i] === 'Preço (CHF,') return { info: 'Preço desta linha. Fica congelado: mudar a tabela de preços depois não o altera.', ph: 'ex.: 35,00' };
          if (pre[i] === 'Pesquisar (número') return { info: 'Escreve o número (O… ou T…), o título ou o cliente.', ph: 'ex.: O2026-0001' };
          if (pre[i] === 'Valor (CHF por') return { info: 'Valor da deslocação desta zona.', ph: 'ex.: 10,00' };
          return { info: HWX_AJUDA['Pesquisar (nº'][0], ph: HWX_AJUDA['Pesquisar (nº'][1] };
        }
      }
      return { info: '', ph: '' };
    }
    function hwxEmailBad(v) {
      var s = String(v == null ? '' : v).trim();
      return !!s && !/^[^\s@]+@[^\s@]+$/.test(s);
    }
    function hwxLabel(list, v) {
      for (var i = 0; i < list.length; i++) if (list[i].v === v) return list[i].l;
      return v || '';
    }
    function hwxUnit(u) {
      for (var i = 0; i < HWX_UNITS.length; i++) if (HWX_UNITS[i].v === u) return HWX_UNITS[i];
      return { v: u, l: u, s: u };
    }
    function hwxCatName(cats, id) {
      for (var i = 0; i < cats.length; i++) if (cats[i].id === id) return cats[i].nome;
      return id || '';
    }
    function hwxCatIndex(cats, id) {
      for (var i = 0; i < cats.length; i++) if (cats[i].id === id) return i;
      return 999;
    }
    function hwxCmpText(a, b) { return String(a == null ? '' : a).localeCompare(String(b == null ? '' : b), 'de'); }

    // ── Zonas com tipo (guardadas no jsonb de hwx_config) ──
    var HWX_ZONA_TIPOS = [
      { v: 'incluida', l: 'Deslocação incluída' },
      { v: 'acrescimo_hora', l: '+ CHF por hora' },
      { v: 'taxa_ida', l: 'Taxa fixa por ida' }
    ];
    // Zonas antigas sem tipo: 0 → incluida, senão acrescimo_hora ("confirmar" até gravar)
    function hwxZonaNorm(z) {
      var v = Number(z.valor) || 0;
      var ok = z.tipo === 'incluida' || z.tipo === 'acrescimo_hora' || z.tipo === 'taxa_ida';
      var tipo = ok ? z.tipo : (v === 0 ? 'incluida' : 'acrescimo_hora');
      return { nome: z.nome, valor: tipo === 'incluida' ? 0 : v, tipo: tipo, confirmar: !ok };
    }
    function hwxZonaPorNome(zonas, nome) {
      if (!nome) return null;
      for (var i = 0; i < zonas.length; i++) if (zonas[i].nome === nome) return hwxZonaNorm(zonas[i]);
      return null;
    }
    function hwxZonaTexto(z) {
      if (z.tipo === 'incluida') return 'Deslocação incluída';
      if (z.tipo === 'acrescimo_hora') return '+ ' + hwxChf(z.valor) + ' por hora';
      return 'Taxa fixa ' + hwxChf(z.valor) + ' por ida';
    }

    // ── Cálculo das ofertas (sempre em Rappen inteiros) ──
    // Preço unitário efetivo: por hora soma o acréscimo; por 30 min soma metade (o acréscimo é por hora)
    function hwxLinhaUnitR(l) {
      var base = hwxToRappen(hwxNum(l.preco) || 0);
      var acr = Number(l.acrescimo_hora) || 0;
      if (l.unidade === 'hora') base += hwxToRappen(acr);
      else if (l.unidade === '30min') base += Math.round(hwxToRappen(acr) / 2);
      return base;
    }
    function hwxLinhaTotalR(l) {
      var q = hwxNum(l.qtd);
      return Math.round((q === null ? 0 : q) * hwxLinhaUnitR(l));
    }
    function hwxOfertaTotais(linhas, dTipo, dVal) {
      var sub = 0;
      (linhas || []).forEach(function (l) { sub += hwxLinhaTotalR(l); });
      var v = hwxNum(dVal) || 0, d;
      if (dTipo === 'pct') d = Math.round(sub * Math.min(Math.max(v, 0), 100) / 100);
      else d = Math.min(hwxToRappen(Math.max(v, 0)), sub);
      return { sub: sub, desc: d, total: sub - d };
    }
    function hwxAddDays(s, n) {
      var p = String(s || hwxToday()).split('-');
      var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + n));
      return d.getUTCFullYear() + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + d.getUTCDate()).slice(-2);
    }
    var hwxKeySeq = 0;
    function hwxNewKey() { hwxKeySeq += 1; return 'k' + hwxKeySeq; }

    // ── Deslocação (Anfahrt): SEMPRE numa linha própria; a zona só sugere ──
    // Horas do trabalho = linhas por hora + linhas por 30 min (qtd / 2); a Anfahrt não conta
    function hwxHorasTrabalho(linhas) {
      var h = 0;
      (linhas || []).forEach(function (l) {
        if (l.tipo === 'anfahrt') return;
        var q = hwxNum(l.qtd);
        if (q === null || q <= 0) return;
        if (l.unidade === 'hora') h += q; else if (l.unidade === '30min') h += q / 2;
      });
      return Math.round(h * 100) / 100;
    }
    function hwxAnfahrtSug(zi, linhas) {
      if (!zi || zi.tipo === 'incluida' || !(Number(zi.valor) > 0)) return null;
      if (zi.tipo === 'taxa_ida') return { unidade: 'fixo', qtd: '1', preco: String(zi.valor) };
      var h = hwxHorasTrabalho(linhas);
      if (!(h > 0)) return null;
      return { unidade: 'hora', qtd: String(h), preco: String(zi.valor) };
    }
    // Atualiza só a linha Anfahrt "automática" (nunca editada à mão); devolve o mesmo objeto se nada mudou
    function hwxSyncAnfahrt(p, zi, dismissed) {
      var linhas = p.linhas, idx = -1, temAnf = false;
      linhas.forEach(function (l, i) { if (l.tipo === 'anfahrt') { temAnf = true; if (l.auto && idx < 0) idx = i; } });
      var sug = dismissed ? null : hwxAnfahrtSug(zi, linhas);
      if (idx >= 0) {
        if (!sug) return Object.assign({}, p, { linhas: linhas.filter(function (l, i) { return i !== idx; }) });
        var a = linhas[idx];
        if (a.unidade === sug.unidade && a.qtd === sug.qtd && a.preco === sug.preco) return p;
        return Object.assign({}, p, { linhas: linhas.map(function (l, i) { return i === idx ? Object.assign({}, l, { unidade: sug.unidade, qtd: sug.qtd, preco: sug.preco }) : l; }) });
      }
      if (sug && !temAnf) {
        return Object.assign({}, p, { linhas: linhas.concat([{ k: hwxNewKey(), tipo: 'anfahrt', servico_id: null, descricao: 'Anfahrt', unidade: sug.unidade, qtd: sug.qtd, preco: sug.preco, acrescimo_hora: 0, auto: true }]) });
      }
      return p;
    }
    // A zona só serve para a deslocação: NUNCA altera rua, PLZ nem localidade.
    // Se logo depois de mexer na zona chegar uma alteração a esses campos que não foi escrita (sem inputType:
    // preenchimento automático do navegador), é ignorada e avisada. Escrever, colar e ditar passam sempre.
    function hwxUseAddrGuard(notify) {
      var t = React.useRef(0);
      return {
        zona: function () { t.current = Date.now(); },
        bloqueia: function (e) {
          var escrito = e && e.nativeEvent && e.nativeEvent.inputType;
          if (escrito || Date.now() - t.current > 2500) return false;
          console.error('[hwx] alteração de morada ignorada: não foi escrita por ti (preenchimento automático do navegador depois de mexeres na zona)');
          notify('warn', 'A zona não altera a morada: ignorei um preenchimento automático do navegador.');
          return true;
        }
      };
    }
    // Erros de formulário: nunca em silêncio — aviso em cima + salta até ao primeiro campo marcado
    function hwxScrollErr() {
      setTimeout(function () {
        var el = document.querySelector('[data-hwx-err="1"]');
        if (!el) return;
        try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { console.error('[hwx] scroll', e); }
        var inp = el.querySelector('input,select,textarea');
        if (inp && inp.focus) { try { inp.focus({ preventScroll: true }); } catch (e2) { console.error('[hwx] focus', e2); } }
      }, 60);
    }
    function hwxReportErrs(notify, msgs) {
      notify('error', msgs.slice(0, 4).join(' · ') + (msgs.length > 4 ? ' · +' + (msgs.length - 4) : ''));
      hwxScrollErr();
    }
    // ── Datas da Agenda (aritmética em UTC pura: o horário de verão nunca muda o dia) ──
    var HWX_DAY = 86400000;
    var HWX_JANELA_DIAS = 84; // séries: só se calculam as próximas 12 semanas
    function hwxPD(s) { var p = String(s).split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
    function hwxFD(ms) { var d = new Date(ms); return d.getUTCFullYear() + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + d.getUTCDate()).slice(-2); }
    function hwxDow(s) { return new Date(hwxPD(s)).getUTCDay(); } // 0 = domingo … 5 = sexta
    function hwxProximaSexta(s) { return hwxAddDays(s, (5 - hwxDow(s) + 7) % 7); }
    function hwxSegunda(s) { return hwxAddDays(s, -((hwxDow(s) + 6) % 7)); }
    function hwxFimMes(s) { var p = String(s).split('-'); return hwxFD(Date.UTC(+p[0], +p[1], 0)); }
    // Ocorrências de uma série entre duas datas (inclusivas): inicio + k × intervalo, até ao fim (se houver)
    function hwxOcorrencias(serie, de, ate) {
      var out = [];
      if (!serie || !serie.ativa) return out;
      var iv = Number(serie.intervalo_dias) || 14, ini = hwxPD(serie.inicio);
      var lo = Math.max(hwxPD(de), ini), hi = hwxPD(ate);
      if (serie.fim) hi = Math.min(hi, hwxPD(serie.fim));
      if (hi < lo) return out;
      var k = Math.max(0, Math.ceil((lo - ini) / (iv * HWX_DAY)));
      for (var g = 0; g < 400; g++, k++) {
        var t = ini + k * iv * HWX_DAY;
        if (t > hi) break;
        out.push({ k: k, data: hwxFD(t) });
      }
      return out;
    }
    // Semana A/B = semana do CALENDÁRIO, igual para todas as sextas (UTC puro, também antes da referência).
    // Referência: a sexta 9.10.2026 é semana A (configurável em Ajustes: remetente.semana_a_ref).
    var HWX_REF_A_DEFAULT = '2026-10-09';
    var hwxRefA = HWX_REF_A_DEFAULT;
    function hwxSetRefA(v) { hwxRefA = /^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? String(v) : HWX_REF_A_DEFAULT; }
    function hwxSemanaAB(data) {
      var semanas = Math.round((hwxPD(hwxSegunda(data)) - hwxPD(hwxSegunda(hwxRefA))) / (7 * HWX_DAY));
      return ((semanas % 2) + 2) % 2 === 0 ? 'A' : 'B';
    }
    // Letra de uma série: só se o intervalo for múltiplo de 14 dias (fica sempre A ou sempre B); senão, nenhuma
    function hwxSerieSemana(inicio, intervalo) {
      var iv = Number(intervalo);
      return iv > 0 && iv % 14 === 0 && inicio ? hwxSemanaAB(inicio) : '';
    }
    var HWX_DIAS = {
      de: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
      fr: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
      it: ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'],
      en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      pt: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']
    };
    var HWX_DIAS_PT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
    var HWX_MESES_PT = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    function hwxDiaCurto(s) { return HWX_DIAS_PT[hwxDow(s)] + ' ' + hwxFmtDate(s); }
    function hwxHora(h) { return h ? String(h).slice(0, 5) : ''; }
    // WhatsApp de aviso ao cliente, na língua dele (ex.: DE "Ich komme am Freitag, 9.10., um 9:00 Uhr.")
    function hwxAvisoTexto(lingua, nome, data, hora, meuNome) {
      var L = HWX_WA[lingua] || HWX_WA.de, lg = HWX_DIAS[lingua] ? lingua : 'de';
      var dia = HWX_DIAS[lg][hwxDow(data)], p = String(data).split('-');
      var dm = lg === 'de' ? (+p[2]) + '.' + (+p[1]) + '.' : (+p[2]) + '/' + (+p[1]);
      var h = hwxHora(hora), hh = h ? (+h.slice(0, 2)) + ':' + h.slice(3, 5) : '';
      var linha;
      if (lg === 'de') linha = 'Ich komme am ' + dia + ', ' + dm + (hh ? ', um ' + hh + ' Uhr' : '') + '.';
      else if (lg === 'fr') linha = 'Je viens le ' + dia + ' ' + dm + (hh ? ' à ' + (+h.slice(0, 2)) + 'h' + h.slice(3, 5) : '') + '.';
      else if (lg === 'it') linha = 'Vengo ' + dia + ' ' + dm + (hh ? ' alle ' + hh : '') + '.';
      else if (lg === 'en') linha = 'I will come on ' + dia + ', ' + dm + (hh ? ', at ' + hh : '') + '.';
      else linha = 'Vou no dia ' + dm + ' (' + dia + ')' + (hh ? ' às ' + hh : '') + '.';
      var out = [L.hi + (nome ? ' ' + nome : ''), '', linha, '', L.bye];
      if (meuNome) out.push(meuNome);
      return out.join('\n');
    }
    // Horas de um trabalho: reais (se já feito) ou as das linhas por hora e por 30 min; séries: as previstas
    function hwxTrabHoras(t) {
      if (t.horas_reais != null && t.horas_reais !== '') return Number(t.horas_reais) || 0;
      var h = hwxHorasTrabalho(t.linhas || []);
      return h > 0 ? h : (Number(t.horas_previstas) || 0);
    }
    // ── Avisos âmbar (informam, nunca bloqueiam a gravação) ──
    var HWX_TAXA_AVISO = 35; // CHF: uma taxa de deslocação a partir daqui parece preço de trabalho
    function hwxLimiteTaxa(precoBase) { return precoBase > 0 && precoBase < HWX_TAXA_AVISO ? precoBase : HWX_TAXA_AVISO; }
    var HWX_DIAS_LONGOS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    function hwxNaoSexta(data) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data || ''))) return '';
      var d = hwxDow(data);
      return d === 5 ? '' : 'A data ' + hwxFmtDate(data) + ' é ' + HWX_DIAS_LONGOS[d] + ', não é sexta-feira (podes gravar na mesma).';
    }
    function hwxZonaLocalAviso(zona, ort) {
      var z = String(zona || '').trim(), o = String(ort || '').trim();
      if (!z || !o || hwxNorm(z) === hwxNorm(o)) return '';
      return 'A zona «' + z + '» não é a localidade deste local («' + o + '»). Confirma que é a zona certa (podes gravar na mesma).';
    }
    // Trabalhos (linhas gravadas e ocorrências calculadas de séries ainda sem linha) de um dia, sem contar o que se está a editar
    function hwxItensDoDia(data, trabs, series, ignoreId, ignoreSerie) {
      var out = [], hoje = hwxToday();
      (trabs || []).forEach(function (t) {
        if (t.data !== data || t.estado === 'cancelado' || t.id === ignoreId) return;
        out.push({ cliente_id: t.cliente_id, nome: t.numero, horas: hwxTrabHoras(t) });
      });
      if (data >= hoje) (series || []).forEach(function (se) {
        hwxOcorrencias(se, data, data).forEach(function (o) {
          if ((trabs || []).some(function (t) { return t.serie_id === se.id && t.data_serie === o.data; })) return;
          if (ignoreSerie && ignoreSerie.serie_id === se.id && ignoreSerie.data_serie === o.data) return;
          out.push({ cliente_id: se.cliente_id, nome: '🔁 ' + (se.descricao || 'série'), horas: Number(se.horas_previstas) || hwxHorasTrabalho(se.linhas || []) });
        });
      });
      return out;
    }
    var HWX_TRAB_ESTADOS = [{ v: 'planeado', l: 'Planeado' }, { v: 'feito', l: 'Feito' }, { v: 'cancelado', l: 'Cancelado' }];
    var HWX_TRAB_COR = { planeado: '#e5e5e5', feito: '#22c55e', cancelado: '#737373' };

    var HWX_OF_ESTADOS = [
      { v: 'rascunho', l: 'Rascunho' }, { v: 'enviada', l: 'Enviada' }, { v: 'aceite', l: 'Aceite' }, { v: 'recusada', l: 'Recusada' }
    ];
    var HWX_OF_COR = { rascunho: '#a3a3a3', enviada: '#fb923c', aceite: '#22c55e', recusada: '#ef4444' };
    var HWX_UNIT_DE = { hora: 'Std.', '30min': '30 Min.', peca: 'Stk.', fixo: 'pauschal', mes: 'Monat', trimestre: 'Quartal', ano: 'Jahr' };

    // Texto curto do WhatsApp na língua da oferta (sem notas internas nem horas de referência)
    var HWX_WA = {
      de: { hi: 'Guten Tag', word: 'Offerte', total: 'Total', valid: 'Gültig bis', bye: 'Freundliche Grüsse' },
      fr: { hi: 'Bonjour', word: 'Offre', total: 'Total', valid: "Valable jusqu'au", bye: 'Cordialement' },
      it: { hi: 'Buongiorno', word: 'Offerta', total: 'Totale', valid: 'Valida fino al', bye: 'Cordiali saluti' },
      en: { hi: 'Hello', word: 'Offer', total: 'Total', valid: 'Valid until', bye: 'Kind regards' },
      pt: { hi: 'Olá', word: 'Oferta', total: 'Total', valid: 'Válida até', bye: 'Com os melhores cumprimentos' }
    };
    function hwxWaTexto(o, meuNome) {
      var L = HWX_WA[o.lingua] || HWX_WA.de, cs = o.cliente_snap || {};
      var nome = cs.contacto_nome || cs.firma || cs.nome || '';
      // saudação, linha em branco, texto (sem linhas em branco), linha em branco, despedida e, na linha seguinte, o meu nome
      var corpo = [L.word + ' ' + o.numero];
      if (o.titulo) corpo.push(o.titulo);
      (o.linhas || []).forEach(function (l) { corpo.push('• ' + l.descricao + ': ' + hwxChf(hwxFromRappen(hwxLinhaTotalR(l)))); });
      corpo.push(L.total + ': ' + hwxChf(o.total));
      if (o.valida_ate) corpo.push(L.valid + ': ' + hwxFmtDate(o.valida_ate));
      var out = [L.hi + (nome ? ' ' + nome : ''), ''].concat(corpo, ['', L.bye]);
      if (meuNome) out.push(meuNome);
      return out.join('\n');
    }
    // Telemóvel do contacto ou, se não houver, do cliente (da fotografia da oferta)
    function hwxOfertaWa(o, meuNome) {
      var cs = o.cliente_snap || {};
      var d = hwxPhone(cs.contacto_telemovel) || hwxPhone(cs.telemovel);
      if (!d) return '';
      return 'https://wa.me/' + d + '?text=' + encodeURIComponent(hwxWaTexto(o, meuNome));
    }

    // Referências (SÓ PARA MIM): horas de referência → preço real por hora / por trabalho
    function hwxRefText(r) {
      var H = Number(r.horas_incluidas);
      if (!(H > 0) || r.estado === 'consulta') return '';
      var pr = hwxToRappen(r.preco);
      if (r.unidade === 'hora') return '≈ ' + hwxQty(H) + ' Std. → ' + hwxChf(hwxFromRappen(Math.round(pr * H))) + ' por trabalho';
      if (r.unidade === '30min') return '≈ ' + hwxQty(H) + ' Std. → ' + hwxChf(hwxFromRappen(Math.round(pr * 2 * H))) + ' por trabalho';
      return '≈ ' + hwxQty(H) + ' Std. → ' + hwxChf(hwxFromRappen(Math.round(pr / H))) + ' / Std. real';
    }

    // Preço + período + mínimo (as horas de referência NUNCA entram aqui: são só para mim)
    function hwxPriceText(s) {
      if (s.estado === 'consulta') return 'Preço sob consulta';
      var u = hwxUnit(s.unidade);
      var base = hwxChf(s.preco) + (u.v === 'fixo' ? ' fixo' : ' ' + u.s);
      if (HWX_UNITS_MIN.indexOf(s.unidade) !== -1) {
        if (s.minimo != null && Number(s.minimo) > 0) {
          var suf = s.unidade === 'hora' ? ' Std.' : s.unidade === '30min' ? ' × 30 Min.' : ' Stk.';
          base += ' · mín. ' + hwxQty(s.minimo) + suf;
        }
      }
      return base;
    }
    // Estado efetivo (calculado no ecrã): pausado com data já passada volta a Ativo
    function hwxEfEstado(r) {
      if (r.estado === 'pausado' && r.pausado_ate && r.pausado_ate < hwxToday()) return 'ativo';
      return r.estado || 'ativo';
    }
    function hwxForaEpoca(r) {
      if (r.estado !== 'sazonal' || !r.meses || !r.meses.length) return false;
      return r.meses.indexOf(new Date().getMonth() + 1) === -1;
    }
    function hwxMesesText(ms) {
      return (ms || []).slice().sort(function (a, b) { return a - b; }).map(function (m) { return HWX_MONTHS[m - 1]; }).join(' ');
    }

    // ── Filtros lembrados (localStorage só para isto, chaves hwx_f_*) ──
    var hwxStoreWarned = false;
    function hwxStoreWarn(notify) {
      if (hwxStoreWarned || !notify) return;
      hwxStoreWarned = true;
      notify('warn', 'Não consegui lembrar os filtros neste aparelho.');
    }
    function hwxStoreGet(key, notify) {
      try {
        var v = window.localStorage.getItem(key);
        return v ? JSON.parse(v) : null;
      } catch (e) {
        console.error('[hwx] localStorage (ler ' + key + ')', e);
        hwxStoreWarn(notify);
        return null;
      }
    }
    function hwxStoreSet(key, val, notify) {
      try {
        window.localStorage.setItem(key, JSON.stringify(val));
      } catch (e) {
        console.error('[hwx] localStorage (gravar ' + key + ')', e);
        hwxStoreWarn(notify);
      }
    }

    // ── Erros: console.error('[hwx] …') + aviso visível ──
    function hwxOffline(msg) {
      return (typeof navigator !== 'undefined' && navigator.onLine === false) || /Failed to fetch|NetworkError|Load failed/i.test(String(msg || ''));
    }
    function hwxFail(notify, ctx, err, isWrite) {
      console.error('[hwx] ' + ctx, err);
      var code = err && err.code;
      var msg = (err && (err.message || err.msg)) || String(err);
      var text;
      if ((code === 'PGRST204' || code === '42703') && (/incluido_pauschale/.test(msg) || /(linhas|oferta_id)[\s\S]*hwx_series|hwx_series[\s\S]*(linhas|oferta_id)/.test(msg))) {
        text = 'Base de dados por atualizar — correr sql/28_hwx_series_oferta.sql';
      } else if ((code === 'PGRST205' || code === 'PGRST204' || code === '42703' || code === '42P01') && /hwx_trabalhos|hwx_series|ultimo_trab|horas_sexta/.test(msg)) {
        text = 'Base de dados por atualizar — correr sql/27_hwx_agenda.sql';
      } else if ((code === 'PGRST205' || code === 'PGRST204' || code === '42703' || code === '42P01') && /hwx_ofertas|preco_base_hora|ultimo_oferta/.test(msg)) {
        text = 'Base de dados por atualizar — correr sql/26_hwx_ofertas.sql';
      } else if (code === 'PGRST205' && /hwx_(clientes|servicos|config)\b/.test(msg)) {
        text = 'Tabelas hwx_ ainda não criadas — correr sql/24_hwx_base.sql';
      } else if (code === 'PGRST205' || code === 'PGRST204' || code === '42703' || code === '42P01') {
        text = 'Base de dados por atualizar — correr sql/25_hwx_melhorias.sql';
      } else if (code === '23505') {
        text = /numero/.test(msg + ' ' + (err.details || '')) && !/sub_numero/.test(msg + ' ' + (err.details || ''))
          ? 'Não gravado — esse número de cliente já está a ser usado por outro cliente.'
          : /sub_numero/.test(msg + ' ' + (err.details || ''))
            ? 'Não gravado — esse subnúmero já está a ser usado neste cliente.'
            : /ofertas|numero/.test(msg) ? 'Não gravado — esse número de oferta já existe.' : 'Não gravado — já existe um registo igual.';
      } else if (hwxOffline(msg)) {
        text = isWrite ? 'Não gravado — sem rede. Tenta outra vez quando houver ligação.' : 'Sem rede — não consegui carregar os dados.';
      } else {
        text = isWrite ? 'Não gravado — ' + msg : 'Erro (' + ctx + '): ' + msg;
      }
      notify('error', text);
      // Exceções (sem código do Supabase) também vão para o monitor global.
      if (!(err && err.code !== undefined) && typeof window.mostrarErro === 'function') {
        window.mostrarErro('Hauswart Extra', err);
      }
    }

    // ── Acesso à base (sempre .from(...)…then(fn).catch(fn)) ──
    function hwxUseList(table, orderCol, notify) {
      var _r = React.useState(null);
      var rows = _r[0], setRows = _r[1];
      var _l = React.useState(true);
      var loading = _l[0], setLoading = _l[1];
      var _e = React.useState(false);
      var failed = _e[0], setFailed = _e[1];
      var alive = React.useRef(true);

      var load = function () {
        if (!window.supabaseClient) {
          setLoading(false); setFailed(true);
          hwxFail(notify, 'carregar ' + table, { message: 'Sem ligação à base de dados.' }, false);
          return;
        }
        setLoading(true);
        window.supabaseClient.from(table).select('*').order(orderCol, { ascending: true }).then(function (res) {
          if (!alive.current) return;
          setLoading(false);
          if (res.error) { setFailed(true); hwxFail(notify, 'carregar ' + table, res.error, false); return; }
          setFailed(false);
          setRows(res.data || []);
        }).catch(function (e) {
          if (!alive.current) return;
          setLoading(false); setFailed(true);
          hwxFail(notify, 'carregar ' + table, e, false);
        });
      };

      React.useEffect(function () {
        alive.current = true;
        load();
        var off = window.csAoVoltarRede(function () { load(); });
        return function () { alive.current = false; off(); };
      }, []);

      return { rows: rows, loading: loading, failed: failed, load: load, setRows: setRows };
    }

    function hwxPreWrite(notify, ctx, onEnd) {
      if (!window.supabaseClient) {
        hwxFail(notify, ctx, { message: 'Sem ligação à base de dados.' }, true);
        onEnd(false); return false;
      }
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        hwxFail(notify, ctx, { message: 'Failed to fetch' }, true);
        onEnd(false); return false;
      }
      return true;
    }

    // Insere (id vazio) ou atualiza uma linha. onOk(linha) / onEnd(sucesso).
    function hwxWrite(table, id, payload, notify, onOk, onEnd) {
      if (!hwxPreWrite(notify, 'gravar ' + table, onEnd)) return;
      var onRes = function (res) {
        if (res.error) { hwxFail(notify, 'gravar ' + table, res.error, true); onEnd(false); return; }
        var row = res.data && res.data[0];
        if (!row) {
          hwxFail(notify, 'gravar ' + table, { message: 'a base não confirmou a gravação (linha apagada ou sem permissão).' }, true);
          onEnd(false); return;
        }
        notify('ok', 'Gravado ✓');
        onOk(row);
        onEnd(true);
      };
      var onErr = function (e) { hwxFail(notify, 'gravar ' + table, e, true); onEnd(false); };
      if (id) {
        window.supabaseClient.from(table).update(payload).eq('id', id).select().then(onRes).catch(onErr);
      } else {
        window.supabaseClient.from(table).insert(payload).select().then(onRes).catch(onErr);
      }
    }

    function hwxRemove(table, id, notify, onOk, onEnd) {
      if (!hwxPreWrite(notify, 'apagar ' + table, onEnd)) return;
      window.supabaseClient.from(table).delete().eq('id', id).select().then(function (res) {
        if (res.error) { hwxFail(notify, 'apagar ' + table, res.error, true); onEnd(false); return; }
        if (!res.data || !res.data.length) {
          hwxFail(notify, 'apagar ' + table, { message: 'a base não confirmou que apagou (já não existe ou sem permissão).' }, true);
          onEnd(false); return;
        }
        notify('ok', 'Apagado ✓');
        onOk();
        onEnd(true);
      }).catch(function (e) { hwxFail(notify, 'apagar ' + table, e, true); onEnd(false); });
    }

    // Grava a coluna "ordem" de várias linhas, uma a uma (pára à primeira falha).
    function hwxSaveOrder(table, items, notify, onEnd) {
      if (!items.length) { onEnd(true); return; }
      if (!hwxPreWrite(notify, 'gravar ordem ' + table, onEnd)) return;
      var i = 0;
      var step = function () {
        if (i >= items.length) { notify('ok', 'Ordem gravada ✓'); onEnd(true); return; }
        var it = items[i++];
        window.supabaseClient.from(table).update({ ordem: it.ordem }).eq('id', it.id).select().then(function (res) {
          if (res.error) { hwxFail(notify, 'gravar ordem ' + table, res.error, true); onEnd(false); return; }
          step();
        }).catch(function (e) { hwxFail(notify, 'gravar ordem ' + table, e, true); onEnd(false); });
      };
      step();
    }

    // ── Contextos (largura, proteção de alterações, ecrã de formulário) ──
    var HxCtx = React.createContext({ wide: false, guard: null, ui: null });

    function hwxUseWide() {
      var _w = React.useState(typeof window !== 'undefined' && window.innerWidth >= 720);
      React.useEffect(function () {
        var h = function () { _w[1](window.innerWidth >= 720); };
        window.addEventListener('resize', h);
        return function () { window.removeEventListener('resize', h); };
      }, []);
      return _w[0];
    }

    // Marca um formulário como "com alterações por guardar" no guarda global.
    function hwxUseDirty(key, snapshot, current, saveFn) {
      var ctx = React.useContext(HxCtx);
      var guard = ctx.guard;
      var snapRef = React.useRef(JSON.stringify(snapshot));
      snapRef.current = JSON.stringify(snapshot);
      var saveRef = React.useRef(saveFn);
      saveRef.current = saveFn;
      var dirty = JSON.stringify(current) !== snapRef.current;
      React.useEffect(function () {
        guard.set(key, dirty, function (ok, fail) { saveRef.current(ok, fail); });
      }, [dirty]);
      React.useEffect(function () {
        return function () { guard.set(key, false); };
      }, []);
      return dirty;
    }

    // Esc fecha o formulário aberto (passando pela proteção)
    function hwxUseEsc(fn) {
      var ctx = React.useContext(HxCtx);
      var ref = React.useRef(fn);
      ref.current = fn;
      React.useEffect(function () {
        return ctx.guard.pushEsc(function () { ref.current(); });
      }, []);
    }

    // ── Componentes de interface ──
    var HXS = {
      card: { background: HX.surface, border: '1px solid ' + HX.border, borderRadius: 12, padding: 14, marginBottom: 10 },
      label: { display: 'block', fontSize: 13, color: HX.muted, marginBottom: 4, fontWeight: 600 },
      input: { width: '100%', minHeight: 44, background: HX.field, border: '1px solid ' + HX.borderStrong, borderRadius: 8, padding: '10px 12px', color: HX.text, fontSize: 16, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit', colorScheme: 'dark', accentColor: '#a3a3a3' },
      err: { fontSize: 13, color: HX.badText, marginTop: 4 },
      warn: { fontSize: 13, color: HX.warnText, marginTop: 4 },
      sec: { fontSize: 12, color: HX.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }
    };

    function HxBtn(props) {
      var kind = props.kind || 'ghost';
      var st = { minHeight: 44, minWidth: 44, borderRadius: 8, padding: '0 16px', fontSize: 15, fontWeight: 700, cursor: props.disabled ? 'not-allowed' : 'pointer', opacity: props.disabled ? 0.45 : 1, fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxSizing: 'border-box' };
      if (kind === 'primary') { st.background = HX.text; st.color = '#000'; st.border = '1px solid ' + HX.text; }
      else if (kind === 'danger') { st.background = 'transparent'; st.color = HX.badText; st.border = '1px solid ' + HX.bad; }
      else { st.background = HX.surface2; st.color = HX.text; st.border = '1px solid ' + HX.borderStrong; }
      if (props.big) { st.minHeight = 56; st.fontSize = 17; }
      if (props.full) st.width = '100%';
      return React.createElement('button', { type: 'button', onClick: props.disabled ? undefined : props.onClick, disabled: !!props.disabled, 'aria-label': props.aria, title: props.title, style: st }, props.label);
    }

    // Faixa âmbar (avisa, nunca bloqueia)
    function HxAviso(props) {
      return React.createElement('div', { role: 'status', 'data-hwx-aviso': '1', style: { background: HX.warnBg, border: '1px solid ' + HX.warn, color: HX.warnText, borderRadius: 8, padding: '8px 10px', marginTop: 6, marginBottom: props.mb == null ? 8 : props.mb, fontSize: 14, fontWeight: 600, wordBreak: 'break-word' } }, '⚠️ ' + props.text);
    }
    // ⓘ ao lado do rótulo (alvo 44 px) e a explicação curta por baixo (texto simples)
    function hwxUseInfo(label, info) {
      var _o = React.useState(false); var open = _o[0], setOpen = _o[1];
      var btn = info ? React.createElement('button', {
        type: 'button', 'aria-label': 'Ajuda: ' + label, 'aria-expanded': open, onClick: function () { setOpen(!open); },
        style: { position: 'absolute', top: -14, right: -8, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: open ? HX.text : HX.muted, fontSize: 18, cursor: 'pointer', fontFamily: 'inherit', padding: 0, zIndex: 1 }
      }, 'ⓘ') : null;
      var note = info && open ? React.createElement('div', { role: 'note', style: { background: HX.surface2, border: '1px solid ' + HX.border, borderRadius: 8, padding: '8px 10px', marginBottom: 6, fontSize: 13, color: HX.text } }, info) : null;
      return { btn: btn, note: note, labelStyle: info ? Object.assign({}, HXS.label, { paddingRight: 36 }) : HXS.label };
    }
    function HxField(props) {
      var aj = hwxAjuda(props.label), ui = hwxUseInfo(props.label, props.info || aj.info);
      var inStyle = props.error ? Object.assign({}, HXS.input, { borderColor: HX.bad }) : HXS.input;
      var inputProps = {
        value: props.value == null ? '' : props.value,
        onChange: function (e) { props.onChange(e.target.value, e); },
        placeholder: props.placeholder || (props.type === 'time' || props.type === 'date' ? '' : aj.ph) || '',
        autoComplete: 'off',
        style: inStyle
      };
      if (props.onBlur) inputProps.onBlur = props.onBlur;
      var el;
      if (props.multiline) {
        inputProps.rows = props.rows || 3;
        inputProps.style = Object.assign({}, inStyle, { resize: 'vertical' });
        el = React.createElement('textarea', inputProps);
      } else {
        inputProps.type = props.type || 'text';
        if (props.inputMode) inputProps.inputMode = props.inputMode;
        if (props.list) inputProps.list = props.list;
        if (props.onEnter) {
          inputProps.onKeyDown = function (e) {
            if (e.key === 'Enter') { e.preventDefault(); props.onEnter(); }
          };
        }
        el = React.createElement('input', inputProps);
      }
      return React.createElement('div', { style: { marginBottom: props.tight ? 0 : 12, minWidth: 0, position: 'relative' }, 'data-hwx-err': props.error ? '1' : undefined },
        ui.btn,
        props.label && React.createElement('label', { style: ui.labelStyle }, props.label),
        el,
        ui.note,
        props.hint && React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginTop: 4 } }, props.hint),
        props.warn && React.createElement(HxAviso, { text: props.warn }),
        props.error && React.createElement('div', { style: HXS.err }, props.error)
      );
    }

    function HxDate(props) {
      var ui = hwxUseInfo(props.label, props.info || hwxAjuda(props.label).info);
      return React.createElement('div', { style: { marginBottom: 12, minWidth: 0, position: 'relative' }, 'data-hwx-err': props.error ? '1' : undefined },
        ui.btn,
        React.createElement('label', { style: ui.labelStyle }, props.label),
        React.createElement('input', {
          type: 'date', value: props.value || '', autoComplete: 'off',
          onChange: function (e) { props.onChange(e.target.value); },
          style: props.error ? Object.assign({}, HXS.input, { borderColor: HX.bad }) : HXS.input
        }),
        ui.note,
        props.warn && React.createElement(HxAviso, { text: props.warn })
      );
    }

    function HxSelect(props) {
      var ui = hwxUseInfo(props.label, props.info || hwxAjuda(props.label).info);
      return React.createElement('div', { style: { marginBottom: props.tight ? 0 : 12, minWidth: 0, position: 'relative' }, 'data-hwx-err': props.error ? '1' : undefined },
        ui.btn,
        props.label && React.createElement('label', { style: ui.labelStyle }, props.label),
        React.createElement('select', {
          value: props.value, autoComplete: 'off',
          onChange: function (e) { props.onChange(e.target.value); },
          style: Object.assign({}, HXS.input, { padding: '10px 8px' }, props.error ? { borderColor: HX.bad } : {})
        }, props.options.map(function (o) {
          return React.createElement('option', { key: o.v, value: o.v }, o.l);
        })),
        ui.note,
        props.warn && React.createElement(HxAviso, { text: props.warn }),
        props.error && React.createElement('div', { style: HXS.err }, props.error)
      );
    }

    // Campos curtos lado a lado em ecrãs largos; uma coluna no telemóvel
    function HxRow(props) {
      var ctx = React.useContext(HxCtx);
      var n = props.cols || 2;
      return React.createElement('div', {
        style: { display: 'grid', gridTemplateColumns: ctx.wide ? 'repeat(' + n + ', minmax(0, 1fr))' : 'minmax(0, 1fr)', gap: ctx.wide ? 12 : 0 }
      }, props.children);
    }

    function HxSection(props) {
      return React.createElement('div', { style: HXS.card },
        React.createElement('div', { style: HXS.sec }, props.title),
        props.children
      );
    }

    function HxChips(props) {
      return React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8, marginBottom: 12 } },
        props.items.map(function (it) {
          var on = props.value.indexOf(it.v) !== -1;
          return React.createElement('button', {
            key: it.v, type: 'button', 'aria-pressed': on, onClick: function () { props.onToggle(it.v); },
            style: { minHeight: 44, borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: on ? HX.text : HX.surface2, color: on ? '#000' : HX.text, border: '1px solid ' + (on ? HX.text : HX.borderStrong) }
          }, it.l);
        })
      );
    }

    // Interruptor (ligado = verde): botão de 44 px de altura
    function HxToggle(props) {
      var on = !!props.value;
      return React.createElement('button', {
        type: 'button', role: 'switch', 'aria-checked': on, 'aria-label': props.aria || 'ativo', disabled: !!props.disabled,
        onClick: function () { if (!props.disabled) props.onChange(!on); },
        style: { minWidth: 56, minHeight: 44, background: 'transparent', border: 'none', padding: 0, cursor: props.disabled ? 'not-allowed' : 'pointer', opacity: props.disabled ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }
      },
        React.createElement('span', { style: { width: 48, height: 28, borderRadius: 14, background: on ? HX.ok : '#525252', position: 'relative', display: 'block', border: '1px solid ' + (on ? HX.ok : HX.borderStrong) } },
          React.createElement('span', { style: { position: 'absolute', top: 2, left: on ? 22 : 2, width: 22, height: 22, borderRadius: 11, background: on ? '#000' : '#fff', display: 'block' } })
        )
      );
    }

    function HxFormToggle(props) {
      return React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, minHeight: 44, marginBottom: 12 } },
        React.createElement('span', { style: { fontSize: 15, fontWeight: 600 } }, props.label),
        React.createElement(HxToggle, { value: props.value, onChange: props.onChange, aria: props.label })
      );
    }

    function HxHead(props) {
      return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, minHeight: 44 } },
        props.back && React.createElement(HxBtn, { label: '←', onClick: props.back, aria: 'Voltar' }),
        React.createElement('div', { style: { flex: 1, fontWeight: 800, fontSize: 20, minWidth: 0, wordBreak: 'break-word' } }, props.title)
      );
    }

    function HxEmpty(props) {
      return React.createElement('div', { style: { textAlign: 'center', padding: '32px 16px', color: HX.muted } },
        React.createElement('div', { style: { fontSize: 36, marginBottom: 8 } }, props.icon),
        React.createElement('div', { style: { fontWeight: 700, color: HX.text, marginBottom: 4 } }, props.text),
        props.sub && React.createElement('div', { style: { fontSize: 14 } }, props.sub),
        props.action && React.createElement('div', { style: { marginTop: 14 } }, props.action)
      );
    }

    function HxPill(props) {
      var c = props.color || HX.borderStrong;
      var t = props.color ? props.color : HX.muted;
      return React.createElement('span', { style: { display: 'inline-block', fontSize: 12, fontWeight: 700, color: t, border: '1px solid ' + c, borderRadius: 20, padding: '2px 9px', marginRight: 6, marginTop: 4 } }, props.text);
    }

    function HxBanner(props) {
      var n = props.notice;
      if (!n) return null;
      var k = n.kind;
      var col = k === 'ok' ? HX.ok : k === 'warn' ? HX.warn : HX.bad;
      var bg = k === 'ok' ? HX.okBg : k === 'warn' ? HX.warnBg : HX.badBg;
      var tx = k === 'ok' ? HX.okText : k === 'warn' ? HX.warnText : HX.badText;
      return React.createElement('div', {
        role: k === 'error' ? 'alert' : 'status',
        style: { position: 'sticky', top: 0, zIndex: 120, background: bg, border: '1px solid ' + col, borderRadius: 10, padding: '10px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10, color: tx, fontSize: 14, fontWeight: 600 }
      },
        React.createElement('div', { style: { flex: 1, wordBreak: 'break-word' } }, (k === 'ok' ? '' : '⚠️ ') + n.text),
        React.createElement('button', { type: 'button', onClick: props.onClose, 'aria-label': 'Fechar aviso', style: { minWidth: 44, minHeight: 44, background: 'transparent', border: 'none', color: tx, fontSize: 18, cursor: 'pointer' } }, '✕')
      );
    }

    function HxModal(props) {
      return React.createElement('div', {
        role: 'dialog', 'aria-modal': 'true',
        style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }
      },
        React.createElement('div', { style: { background: HX.surface, border: '1px solid ' + HX.borderStrong, borderRadius: 14, padding: 18, width: '100%', maxWidth: 440, maxHeight: '100%', overflowY: 'auto', boxSizing: 'border-box', color: HX.text } },
          React.createElement('div', { style: { fontWeight: 800, fontSize: 18, marginBottom: 8 } }, props.title),
          props.children
        )
      );
    }

    // Apagar: faixa vermelha com o que será afetado e dois botões bem separados. d = { titulo, aviso, linhas[], bloqueio, forte, busy }
    function HwxApagarDlg(props) {
      var d = props.d;
      return React.createElement(HxModal, { title: d.titulo },
        React.createElement('div', { role: 'alert', 'data-hwx-apagar': d.forte ? 'forte' : '1', style: { background: HX.badBg, border: (d.forte ? '2px' : '1px') + ' solid ' + HX.bad, color: HX.badText, borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 14, fontWeight: d.forte ? 800 : 600 } }, '⚠️ ' + d.aviso),
        d.linhas && d.linhas.length > 0 && React.createElement('div', { style: { marginBottom: 12, fontSize: 14 } }, d.linhas.map(function (li, i) { return React.createElement('div', { key: i, style: { padding: '3px 0' } }, '• ' + li); })),
        d.bloqueio && React.createElement('div', { style: { background: HX.warnBg, border: '1px solid ' + HX.warn, color: HX.warnText, borderRadius: 8, padding: '8px 10px', marginBottom: 12, fontSize: 14, fontWeight: 600 } }, d.bloqueio),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 } },
          React.createElement(HxBtn, { label: 'Cancelar', onClick: props.onCancel, disabled: !!d.busy }),
          React.createElement(HxBtn, { label: d.busy ? 'A apagar…' : '🗑️ Apagar', kind: 'danger', aria: 'Apagar', onClick: props.onConfirm, disabled: !!d.busy || !!d.bloqueio })
        )
      );
    }

    // Ecrã de formulário: título "Novo …"/"Editar …" e barra Guardar/Cancelar FIXA em baixo
    function HxFormShell(props) {
      var ctx = React.useContext(HxCtx);
      React.useEffect(function () {
        ctx.ui.formOpen(true);
        return function () { ctx.ui.formOpen(false); };
      }, []);
      return React.createElement('div', null,
        React.createElement(HxHead, { title: props.title, back: props.onCancel }),
        props.children,
        React.createElement('div', { style: { height: 96 } }),
        React.createElement('div', { style: { position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 20, background: '#0a0a0a', borderTop: '1px solid ' + HX.border, paddingBottom: 'env(safe-area-inset-bottom)' } },
          React.createElement('div', { style: { maxWidth: HWX_MAXW, margin: '0 auto', padding: 12, display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 } },
            React.createElement(HxBtn, { label: 'Cancelar', onClick: props.onCancel, disabled: props.busy }),
            React.createElement(HxBtn, { label: props.busy ? 'A gravar…' : '✓ ' + (props.saveLabel || 'Guardar'), onClick: props.onSave, kind: 'primary', disabled: props.busy })
          )
        )
      );
    }

    function HxFilterBar(props) {
      return React.createElement('div', { style: { marginBottom: 12 } },
        React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' } },
          React.createElement(HxBtn, { label: '🔍 Filtros' + (props.active > 0 ? ' (' + props.active + ' ativo' + (props.active > 1 ? 's' : '') + ')' : '') + (props.open ? ' ▲' : ' ▼'), onClick: props.onToggle }),
          props.active > 0 && React.createElement(HxBtn, { label: 'Limpar filtros', onClick: props.onClear })
        ),
        props.open && React.createElement('div', { style: Object.assign({}, HXS.card, { marginTop: 10, marginBottom: 0 }) }, props.children)
      );
    }

    function HxLoadState(props) {
      var list = props.list;
      if (list.rows !== null) return null;
      if (list.loading) return React.createElement(HxEmpty, { icon: '⏳', text: 'A carregar…' });
      return React.createElement(HxEmpty, {
        icon: '⚠️', text: 'Não consegui carregar', sub: 'Vê o aviso acima.',
        action: React.createElement(HxBtn, { label: 'Tentar de novo', onClick: list.load })
      });
    }

    // Bloco de um cartão: título pequeno, maiúsculas, cinzento; linha fina por cima; texto indentado
    function HxBlock(props) {
      return React.createElement('div', { style: { borderTop: '1px solid ' + HX.border, marginTop: 10, paddingTop: 10 } },
        React.createElement('div', { style: { fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: HX.muted, marginBottom: 6 } }, props.title),
        React.createElement('div', { style: { paddingLeft: 20, minWidth: 0 } }, props.children)
      );
    }

    // Notas fechadas por defeito; abrem ao tocar
    function HxNotes(props) {
      var _o = React.useState(false);
      var open = _o[0], setOpen = _o[1];
      return React.createElement('div', { style: { borderTop: '1px solid ' + HX.border, marginTop: 10, paddingTop: 2 } },
        React.createElement('button', {
          type: 'button', 'aria-expanded': open, onClick: function () { setOpen(!open); },
          style: { minHeight: 44, width: '100%', background: 'transparent', border: 'none', color: HX.muted, fontSize: 14, fontWeight: 700, textAlign: 'left', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }
        }, '📝 ' + (props.label || 'Notas') + (open ? ' ▾' : ' ▸')),
        open && React.createElement('div', { style: { fontSize: 14, color: HX.text, paddingLeft: 20, paddingBottom: 6, wordBreak: 'break-word', whiteSpace: 'pre-wrap' } }, props.text)
      );
    }

    // Botão/ligação da barra de ações: todos do mesmo tamanho (ícone em cima, nome pequeno por baixo)
    function HxActBtn(props) {
      var st = { minHeight: 52, width: '100%', minWidth: 0, borderRadius: 8, padding: '4px 2px', fontFamily: 'inherit', fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, textDecoration: 'none', boxSizing: 'border-box', cursor: 'pointer', background: HX.surface2, color: HX.text, border: '1px solid ' + HX.borderStrong };
      if (props.kind === 'danger') { st.background = 'transparent'; st.color = HX.badText; st.border = '1px solid ' + HX.bad; }
      if (props.disabled) { st.opacity = 0.4; st.cursor = 'not-allowed'; }
      var kids = [
        React.createElement('span', { key: 'i', style: { fontSize: 18, lineHeight: 1 } }, props.icon),
        React.createElement('span', { key: 'l', style: { fontSize: 12, lineHeight: 1.2 } }, props.label)
      ];
      if (props.href && !props.disabled) {
        return React.createElement('a', { href: props.href, target: props.blank ? '_blank' : undefined, rel: props.blank ? 'noopener noreferrer' : undefined, style: st, 'aria-label': props.aria }, kids);
      }
      return React.createElement('button', { type: 'button', onClick: props.disabled ? undefined : props.onClick, disabled: !!props.disabled, 'aria-label': props.aria, 'aria-expanded': props.expanded, title: props.title, style: st }, kids);
    }

    // Números do cliente e do contacto para "Ligar"/"WhatsApp", sem repetir números iguais
    function hwxCallEntries(c) {
      var out = [], seen = {};
      var add = function (label, raw, mobile) {
        var d = hwxPhone(raw);
        if (!d || seen[d]) return;
        seen[d] = true;
        out.push({ label: label, raw: raw, digits: d, mobile: mobile });
      };
      add('Telemóvel', c.telemovel, true);
      add('Fixo', c.telefone_fixo, false);
      add('Contacto · telemóvel', c.contacto_telemovel, true);
      add('Contacto · fixo', c.contacto_telefone, false);
      return out;
    }

    // Dados do bloco CONTACTO (cliente + contacto, sem repetições)
    function hwxContactoDados(c) {
      var nums = [], seen = {}, emails = [], seenM = {};
      var addN = function (kind, raw) {
        var v = String(raw == null ? '' : raw).trim();
        if (!v) return;
        var k = hwxPhoneKey(v);
        if (seen[k]) return;
        seen[k] = true;
        nums.push({ kind: kind, raw: v });
      };
      var addM = function (raw) {
        var v = String(raw == null ? '' : raw).trim();
        if (!v || seenM[v.toLowerCase()]) return;
        seenM[v.toLowerCase()] = true;
        emails.push(v);
      };
      addN('mob', c.contacto_telemovel); addN('fix', c.contacto_telefone); addN('mob', c.telemovel); addN('fix', c.telefone_fixo);
      addM(c.contacto_email); addM(c.email);
      return { nome: String(c.contacto_nome || '').trim(), nums: nums, emails: emails };
    }

    // Um local como "1.1  rua" e, por baixo, "PLZ localidade" + zona
    function hwxLocalLines(c, l) {
      var rua = l.rua || l.nome || '';
      var zona = l.zona || c.zona || '';
      var cp = [l.plz, l.ort].filter(Boolean).join(' ');
      return React.createElement('div', { style: { minWidth: 0 } },
        React.createElement('div', { style: { display: 'flex', gap: 8, fontSize: 15, alignItems: 'baseline' } },
          React.createElement('span', { style: { fontWeight: 800, minWidth: 34, flexShrink: 0 } }, c.numero + '.' + l.sub_numero),
          React.createElement('span', { style: { wordBreak: 'break-word', minWidth: 0 } }, rua,
            l.rua && l.nome && l.nome !== l.rua ? React.createElement('span', { style: { color: HX.muted } }, ' · ' + l.nome) : null)
        ),
        (cp || zona) && React.createElement('div', { style: { paddingLeft: 42, fontSize: 14, color: HX.muted } }, cp, zona ? React.createElement(HxPill, { text: zona }) : null)
      );
    }

    // Barra de ações do cartão de cliente, numa só linha: [📞 Ligar] [💬 WhatsApp] [✏️] [🗑]
    function HxCardActions(props) {
      var _o = React.useState(null);
      var open = _o[0], setOpen = _o[1];
      var phones = props.entries, was = phones.filter(function (e) { return e.mobile; });
      var btns = [];
      if (phones.length === 1) btns.push(React.createElement(HxActBtn, { key: 'call', icon: '📞', label: 'Ligar', href: 'tel:+' + phones[0].digits, aria: 'Ligar a ' + props.name }));
      else if (phones.length > 1) btns.push(React.createElement(HxActBtn, { key: 'call', icon: '📞', label: 'Ligar ' + (open === 'call' ? '▲' : '▼'), expanded: open === 'call', aria: 'Ligar a ' + props.name, onClick: function () { setOpen(open === 'call' ? null : 'call'); } }));
      if (was.length === 1) btns.push(React.createElement(HxActBtn, { key: 'wa', icon: '💬', label: 'WhatsApp', href: 'https://wa.me/' + was[0].digits, blank: true, aria: 'WhatsApp para ' + props.name }));
      else if (was.length > 1) btns.push(React.createElement(HxActBtn, { key: 'wa', icon: '💬', label: 'WhatsApp ' + (open === 'wa' ? '▲' : '▼'), expanded: open === 'wa', aria: 'WhatsApp para ' + props.name, onClick: function () { setOpen(open === 'wa' ? null : 'wa'); } }));
      btns.push(React.createElement(HxActBtn, { key: 'ed', icon: '✏️', label: 'Editar', aria: 'Editar ' + props.name, onClick: props.onEdit, disabled: props.disabled }));
      btns.push(React.createElement(HxActBtn, { key: 'del', icon: '🗑️', label: 'Apagar', kind: 'danger', aria: 'Apagar ' + props.name, onClick: props.onDel, disabled: props.disabled }));
      var lista = open === 'call' ? phones : open === 'wa' ? was : [];
      return React.createElement('div', { style: { marginTop: 12 } },
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(' + btns.length + ', minmax(0, 1fr))', gap: 8 } }, btns),
        lista.length > 0 && React.createElement('div', { style: { display: 'grid', gap: 6, marginTop: 8 } },
          lista.map(function (e) {
            return React.createElement('a', {
              key: e.digits, href: (open === 'wa' ? 'https://wa.me/' : 'tel:+') + e.digits, target: open === 'wa' ? '_blank' : undefined, rel: open === 'wa' ? 'noopener noreferrer' : undefined,
              style: { minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '0 12px', borderRadius: 8, textDecoration: 'none', boxSizing: 'border-box', background: HX.surface2, color: HX.text, border: '1px solid ' + HX.borderStrong, fontSize: 15, fontWeight: 700 }
            },
              React.createElement('span', null, e.label),
              React.createElement('span', { style: { color: HX.muted, fontWeight: 600 } }, hwxFmtPhone(e.raw))
            );
          })
        )
      );
    }

    // Linha cinzenta de referência (SÓ PARA MIM): toca para editar as horas de referência
    function HxRefLine(props) {
      var r = props.r;
      var _e = React.useState(false); var editing = _e[0], setEditing = _e[1];
      var _v = React.useState(''); var val = _v[0], setVal = _v[1];
      var _er = React.useState(''); var err = _er[0], setErr = _er[1];
      var _b = React.useState(false); var busy = _b[0], setBusy = _b[1];
      var txt = hwxRefText(r);
      var open = function () { setVal(r.horas_incluidas == null ? '' : String(r.horas_incluidas)); setErr(''); setEditing(true); };
      var save = function (limpar) {
        if (busy) return;
        var n = null;
        if (!limpar) {
          n = hwxNum(val);
          if (n === null || n <= 0 || n > 9999.99) { setErr('Indica horas maiores que 0 (ex.: 3 ou 1,5).'); return; }
          n = Math.round(n * 100) / 100;
        }
        setBusy(true);
        props.onSave(r, n, function (ok) { setBusy(false); if (ok) setEditing(false); });
      };
      if (!editing) {
        return React.createElement('button', {
          type: 'button', onClick: open, 'aria-label': 'Horas de referência de ' + r.nome,
          style: { minHeight: 44, width: '100%', background: 'transparent', border: 'none', borderTop: '1px dashed ' + HX.border, marginTop: 8, color: HX.muted, fontSize: 14, textAlign: 'left', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }
        }, txt || '＋ Horas de referência (só para mim)');
      }
      return React.createElement('div', { style: { borderTop: '1px dashed ' + HX.border, marginTop: 8, paddingTop: 8 } },
        React.createElement(HxField, { label: 'Horas de referência (só para mim)', value: val, inputMode: 'decimal', onChange: setVal, error: err, placeholder: 'ex.: 3', onEnter: function () { save(false); } }),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: r.horas_incluidas != null ? '1fr 1fr 1fr' : '1fr 1fr', gap: 8 } },
          React.createElement(HxBtn, { label: 'Cancelar', onClick: function () { setEditing(false); }, disabled: busy }),
          r.horas_incluidas != null && React.createElement(HxBtn, { label: 'Apagar', kind: 'danger', onClick: function () { save(true); }, disabled: busy }),
          React.createElement(HxBtn, { label: busy ? 'A gravar…' : '✓ Guardar', kind: 'primary', onClick: function () { save(false); }, disabled: busy })
        )
      );
    }

    // ── PREÇOS (hwx_servicos) ──
    function hwxServForm0(r, cats, ordemNova) {
      if (!r) {
        return { nome: '', categoria: cats.length ? cats[0].id : 'outro', unidade: 'hora', preco: '', minimo: '', horas_incluidas: '', nota: '', estado: 'ativo', pausado_ate: '', meses: [] };
      }
      return {
        nome: r.nome || '', categoria: r.categoria || (cats.length ? cats[0].id : 'outro'), unidade: r.unidade || 'hora',
        preco: String(r.preco), minimo: r.minimo == null ? '' : String(r.minimo),
        horas_incluidas: r.horas_incluidas == null ? '' : String(r.horas_incluidas),
        nota: r.nota || '', estado: r.estado || 'ativo', pausado_ate: r.pausado_ate || '', meses: (r.meses || []).slice()
      };
    }

    function HwxServicoForm(props) {
      var cats = props.cats, editing = props.editing, notify = props.notify;
      var _f = React.useState(function () { return hwxServForm0(editing || props.preset, cats); });
      var f = _f[0], setF = _f[1];
      var _er = React.useState({}); var errs = _er[0], setErrs = _er[1];
      var _b = React.useState(false); var busy = _b[0], setBusy = _b[1];
      var busyRef = React.useRef(false);
      var snap = React.useRef(hwxServForm0(editing, cats)).current;
      var upd = function (k, v) { setF(function (p) { var n = Object.assign({}, p); n[k] = v; return n; }); };
      var toggleMes = function (m) {
        setF(function (p) {
          var n = Object.assign({}, p), arr = p.meses.slice(), i = arr.indexOf(m);
          if (i === -1) arr.push(m); else arr.splice(i, 1);
          n.meses = arr; return n;
        });
      };

      var doSave = function (ok, fail) {
        if (busyRef.current) return;
        var e = {};
        var nome = String(f.nome || '').trim();
        var consulta = f.estado === 'consulta';
        var preco = String(f.preco).trim() === '' && consulta ? 0 : hwxNum(f.preco);
        var usaMin = HWX_UNITS_MIN.indexOf(f.unidade) !== -1;
        var minTxt = String(usaMin ? f.minimo : '').trim();
        var qtd = minTxt === '' ? null : hwxNum(minTxt);
        var hrTxt = String(f.horas_incluidas == null ? '' : f.horas_incluidas).trim();
        var hr = hrTxt === '' ? null : hwxNum(hrTxt);
        if (!nome) e.nome = 'Indica o nome do serviço.';
        if (preco === null || preco < 0 || preco > 99999999.99) e.preco = 'Indica um preço válido (ex.: 45 ou 45,50).';
        if (minTxt !== '' && (qtd === null || qtd <= 0 || qtd > 999.99)) e.minimo = 'Tem de ser maior que 0 (ex.: 1 ou 1,5), ou deixa vazio.';
        if (hrTxt !== '' && (hr === null || hr <= 0 || hr > 9999.99)) e.horas_incluidas = 'Tem de ser maior que 0 (ex.: 3 ou 1,5), ou deixa vazio.';
        if (f.estado === 'sazonal' && !f.meses.length) e.meses = 'Escolhe pelo menos um mês.';
        setErrs(e);
        if (Object.keys(e).length) {
          var msgs = [];
          if (e.nome) msgs.push('Falta: nome do serviço');
          if (e.preco) msgs.push('Preço inválido');
          if (e.minimo) msgs.push('Mínimo inválido');
          if (e.horas_incluidas) msgs.push('Horas de referência inválidas');
          if (e.meses) msgs.push('Falta: escolher pelo menos um mês');
          hwxReportErrs(notify, msgs);
          if (fail) fail(); return;
        }
        var payload = {
          nome: nome, categoria: f.categoria, unidade: f.unidade,
          preco: hwxFromRappen(hwxToRappen(preco)),
          minimo: usaMin && qtd !== null ? Math.round(qtd * 100) / 100 : null,
          horas_incluidas: hr !== null ? Math.round(hr * 100) / 100 : null,
          nota: String(f.nota || '').trim(), estado: f.estado,
          pausado_ate: f.estado === 'pausado' && f.pausado_ate ? f.pausado_ate : null,
          meses: f.estado === 'sazonal' ? f.meses.slice().sort(function (a, b) { return a - b; }) : null
        };
        if (!editing) payload.ordem = props.ordemNova;
        busyRef.current = true; setBusy(true);
        hwxWrite('hwx_servicos', editing ? editing.id : null, payload, notify, function (row) {
          props.onSaved(row);
          if (ok) ok(); else props.onClose();
        }, function (success) {
          busyRef.current = false; setBusy(false);
          if (!success && fail) fail();
        });
      };

      hwxUseDirty('servico', snap, f, doSave);
      var tryClose = function () { if (!busy) props.guard.attempt(props.onClose, ['servico']); };
      hwxUseEsc(tryClose);

      var usaMin = HWX_UNITS_MIN.indexOf(f.unidade) !== -1;
      // sugestão: com horas de referência e o preço vazio, propõe horas × preço base
      var hSug = hwxNum(f.horas_incluidas);
      var sugestao = (String(f.preco).trim() === '' && hSug !== null && hSug > 0 && hSug <= 9999.99 && f.estado !== 'consulta')
        ? { h: hSug, base: props.precoBase, val: hwxFromRappen(Math.round(hSug * hwxToRappen(props.precoBase))) } : null;
      var catOpts = cats.map(function (c) { return { v: c.id, l: c.nome }; });
      if (f.categoria && !cats.some(function (c) { return c.id === f.categoria; })) catOpts.push({ v: f.categoria, l: f.categoria + ' (já não existe)' });

      return React.createElement(HxFormShell, { title: editing ? 'Editar serviço' : 'Novo serviço', onCancel: tryClose, onSave: function () { doSave(); }, busy: busy },
        React.createElement(HxField, { label: 'Nome', info: 'Nome do serviço, como aparece na tabela de preços e nas ofertas.', value: f.nome, onChange: function (v) { upd('nome', v); }, error: errs.nome, placeholder: 'ex.: Ajuda com telemóvel', onEnter: function () { doSave(); } }),
        React.createElement(HxSelect, { label: 'Categoria', value: f.categoria, options: catOpts, onChange: function (v) { upd('categoria', v); } }),
        React.createElement(HxRow, { cols: 2 },
          React.createElement(HxField, { label: 'Preço (CHF)', value: f.preco, inputMode: 'decimal', onChange: function (v) { upd('preco', v); }, error: errs.preco, onEnter: function () { doSave(); } }),
          React.createElement(HxSelect, { label: 'Unidade', value: f.unidade, options: HWX_UNITS.map(function (u) { return { v: u.v, l: u.l }; }), onChange: function (v) { upd('unidade', v); } })
        ),
        usaMin && React.createElement(HxField, { label: 'Mínimo (ex.: 1)', value: f.minimo, inputMode: 'decimal', onChange: function (v) { upd('minimo', v); }, error: errs.minimo, placeholder: 'ex.: 2', onEnter: function () { doSave(); } }),
        React.createElement(HxField, { label: 'Horas de referência (só para mim)', value: f.horas_incluidas, inputMode: 'decimal', onChange: function (v) { upd('horas_incluidas', v); }, error: errs.horas_incluidas, placeholder: 'opcional, ex.: 3', hint: 'Não aparece em ofertas, impressões nem WhatsApp.', onEnter: function () { doSave(); } }),
        sugestao && React.createElement('div', { style: { marginBottom: 12 } },
          React.createElement(HxBtn, { label: 'Usar sugestão: ' + hwxQty(sugestao.h) + ' Std. × ' + hwxChf(sugestao.base) + ' = ' + hwxChf(sugestao.val), full: true, onClick: function () { upd('preco', String(sugestao.val)); } })
        ),
        React.createElement(HxSelect, { label: 'Estado', value: f.estado, options: HWX_SERV_ESTADOS, onChange: function (v) { upd('estado', v); } }),
        f.estado === 'pausado' && React.createElement(HxDate, { label: 'Pausado até (opcional)', value: f.pausado_ate, onChange: function (v) { upd('pausado_ate', v); } }),
        f.estado === 'sazonal' && React.createElement('div', null,
          React.createElement('label', { style: HXS.label }, 'Meses em que se faz'),
          React.createElement(HxChips, { items: HWX_MONTHS.map(function (m, i) { return { v: i + 1, l: m }; }), value: f.meses, onToggle: toggleMes }),
          errs.meses && React.createElement('div', { 'data-hwx-err': '1', style: Object.assign({}, HXS.err, { marginTop: -8, marginBottom: 12 }) }, errs.meses)
        ),
        f.estado === 'consulta' && React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginBottom: 12 } }, 'Na lista aparece "Preço sob consulta"; o preço pode ficar vazio.'),
        React.createElement(HxField, { label: 'Nota', value: f.nota, multiline: true, onChange: function (v) { upd('nota', v); } })
      );
    }

    function HwxPrecos(props) {
      var notify = props.notify, cats = props.cats, ctx = React.useContext(HxCtx);
      var list = hwxUseList('hwx_servicos', 'ordem', notify);
      var F0 = { q: '', cat: 'all', uni: 'all', est: 'visiveis', sort: 'ordem', open: false, refs: true };

      var _fl = React.useState(function () { return Object.assign({}, F0, hwxStoreGet('hwx_f_precos', notify) || {}); });
      var flt = _fl[0], setFlt = _fl[1];
      var updF = function (k, v) { setFlt(function (p) { var n = Object.assign({}, p); n[k] = v; return n; }); };
      React.useEffect(function () { hwxStoreSet('hwx_f_precos', flt, notify); }, [flt]);

      var _v = React.useState(null); var form = _v[0], setForm = _v[1]; // null | { editing, preset }
      var _p = React.useState({}); var pending = _p[0], setPending = _p[1];
      var dragRef = React.useRef(null);

      var setPend = function (id, on) {
        setPending(function (p) { var n = Object.assign({}, p); if (on) n[id] = true; else delete n[id]; return n; });
      };
      var replaceRow = function (row) {
        list.setRows(function (prev) {
          var arr = prev || [], found = false;
          var out = arr.map(function (r) { if (r.id === row.id) { found = true; return row; } return r; });
          if (!found) out.push(row);
          return out;
        });
      };
      var rows = list.rows || [];
      var maxOrdem = 0;
      rows.forEach(function (r) { if ((r.ordem || 0) > maxOrdem) maxOrdem = r.ordem || 0; });

      if (form) {
        return React.createElement(HwxServicoForm, {
          editing: form.editing, preset: form.preset, cats: cats, notify: notify, guard: ctx.guard, ordemNova: maxOrdem + 1, precoBase: props.precoBase,
          onSaved: replaceRow, onClose: function () { setForm(null); }
        });
      }

      var saveHoras = function (r, horas, done) {
        hwxWrite('hwx_servicos', r.id, { horas_incluidas: horas }, notify, replaceRow, function (okFlag) { done(okFlag); });
      };
      var onChangeEstado = function (r, estado) {
        if (pending[r.id]) return;
        if (estado === 'sazonal' && !(r.meses && r.meses.length)) {
          setForm({ editing: r, preset: Object.assign({}, r, { estado: 'sazonal' }) });
          return;
        }
        setPend(r.id, true);
        hwxWrite('hwx_servicos', r.id, { estado: estado }, notify, replaceRow, function () { setPend(r.id, false); });
      };
      var onDel = function (r) {
        if (pending[r.id]) return;
        if (!window.confirm('Apagar o serviço "' + r.nome + '"?')) return;
        setPend(r.id, true);
        hwxRemove('hwx_servicos', r.id, notify, function () {
          list.setRows(function (prev) { return (prev || []).filter(function (x) { return x.id !== r.id; }); });
        }, function () { setPend(r.id, false); });
      };

      // ordem: lista completa por (ordem, nome); mexer = reatribuir 1..n e gravar só o que mudou
      var fullOrdered = rows.slice().sort(function (a, b) { return ((a.ordem || 0) - (b.ordem || 0)) || hwxCmpText(a.nome, b.nome); });
      var applyOrder = function (ids) {
        var byId = {}; rows.forEach(function (r) { byId[r.id] = r; });
        var changes = [];
        ids.forEach(function (id, i) { if (byId[id] && byId[id].ordem !== i + 1) changes.push({ id: id, ordem: i + 1 }); });
        if (!changes.length) return;
        var map = {}; changes.forEach(function (c) { map[c.id] = c.ordem; });
        list.setRows(function (prev) { return (prev || []).map(function (r) { return map[r.id] ? Object.assign({}, r, { ordem: map[r.id] }) : r; }); });
        hwxSaveOrder('hwx_servicos', changes, notify, function (okFlag) { if (!okFlag) list.load(); });
      };
      var moveBy = function (id, dir, visibleIds) {
        var vi = visibleIds.indexOf(id), ni = vi + dir;
        if (vi === -1 || ni < 0 || ni >= visibleIds.length) return;
        var ids = fullOrdered.map(function (r) { return r.id; });
        var a = ids.indexOf(visibleIds[vi]), b = ids.indexOf(visibleIds[ni]);
        var tmp = ids[a]; ids[a] = ids[b]; ids[b] = tmp;
        applyOrder(ids);
      };
      var dropOn = function (targetId) {
        var fromId = dragRef.current; dragRef.current = null;
        if (!fromId || fromId === targetId) return;
        var ids = fullOrdered.map(function (r) { return r.id; }).filter(function (x) { return x !== fromId; });
        ids.splice(ids.indexOf(targetId), 0, fromId);
        applyOrder(ids);
      };

      var nq = hwxNorm(flt.q).trim();
      var shown = rows.filter(function (r) {
        if (flt.cat !== 'all' && r.categoria !== flt.cat) return false;
        if (flt.uni !== 'all' && r.unidade !== flt.uni) return false;
        var ef = hwxEfEstado(r);
        if (flt.est === 'visiveis' && r.estado === 'arquivado') return false;
        if (flt.est !== 'visiveis' && flt.est !== 'todos' && ef !== flt.est) return false;
        if (nq && hwxNorm(r.nome).indexOf(nq) === -1) return false;
        return true;
      }).sort(function (a, b) {
        if (flt.sort === 'nome') return hwxCmpText(a.nome, b.nome);
        if (flt.sort === 'preco') return (Number(a.preco) - Number(b.preco)) || hwxCmpText(a.nome, b.nome);
        if (flt.sort === 'categoria') return (hwxCatIndex(cats, a.categoria) - hwxCatIndex(cats, b.categoria)) || ((a.ordem || 0) - (b.ordem || 0)) || hwxCmpText(a.nome, b.nome);
        return ((a.ordem || 0) - (b.ordem || 0)) || hwxCmpText(a.nome, b.nome);
      });
      var visibleIds = shown.map(function (r) { return r.id; });
      var canOrder = flt.sort === 'ordem';
      var active = (flt.q.trim() ? 1 : 0) + (flt.cat !== 'all' ? 1 : 0) + (flt.uni !== 'all' ? 1 : 0) + (flt.est !== 'visiveis' ? 1 : 0);

      var catFilterOpts = [{ v: 'all', l: 'Todas' }].concat(cats.map(function (c) { return { v: c.id, l: c.nome }; }));
      var estFilterOpts = [{ v: 'visiveis', l: 'Todos menos arquivados' }].concat(HWX_SERV_ESTADOS).concat([{ v: 'todos', l: 'Todos' }]);

      return React.createElement('div', null,
        React.createElement(HxHead, { title: 'Preços' }),
        React.createElement('div', { style: { marginBottom: 12 } },
          React.createElement(HxBtn, { label: '+ Novo serviço', kind: 'primary', big: true, full: true, onClick: function () { setForm({ editing: null, preset: null }); } })
        ),
        React.createElement('div', { style: { marginBottom: 12 } },
          React.createElement(HxBtn, { label: '👁 Referências: ' + (flt.refs ? 'visíveis' : 'escondidas'), full: true, onClick: function () { updF('refs', !flt.refs); } })
        ),
        React.createElement(HxField, { label: 'Pesquisar por nome', value: flt.q, onChange: function (v) { updF('q', v); }, list: 'hwx-dl-servicos', placeholder: 'nome do serviço' }),
        React.createElement('datalist', { id: 'hwx-dl-servicos' }, rows.map(function (r) { return React.createElement('option', { key: r.id, value: r.nome }); })),
        React.createElement(HxFilterBar, {
          active: active, open: flt.open, onToggle: function () { updF('open', !flt.open); },
          onClear: function () { setFlt(function (p) { return Object.assign({}, F0, { sort: p.sort, open: p.open, refs: p.refs }); }); }
        },
          React.createElement(HxRow, { cols: 2 },
            React.createElement(HxSelect, { label: 'Categoria', value: flt.cat, onChange: function (v) { updF('cat', v); }, options: catFilterOpts }),
            React.createElement(HxSelect, { label: 'Unidade', value: flt.uni, onChange: function (v) { updF('uni', v); }, options: [{ v: 'all', l: 'Todas' }].concat(HWX_UNITS.map(function (u) { return { v: u.v, l: u.l }; })) })
          ),
          React.createElement(HxRow, { cols: 2 },
            React.createElement(HxSelect, { label: 'Estado', value: flt.est, onChange: function (v) { updF('est', v); }, options: estFilterOpts }),
            React.createElement(HxSelect, { label: 'Ordenar por', value: flt.sort, onChange: function (v) { updF('sort', v); }, options: [{ v: 'ordem', l: 'A minha ordem' }, { v: 'nome', l: 'Nome' }, { v: 'preco', l: 'Preço' }, { v: 'categoria', l: 'Categoria' }] })
          )
        ),
        React.createElement(HxLoadState, { list: list }),
        list.rows !== null && React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginBottom: 8 } }, shown.length + ' de ' + rows.length + ' serviço(s)' + (canOrder ? '' : ' · ordenar à mão só em "A minha ordem"')),
        list.rows !== null && rows.length === 0 && React.createElement(HxEmpty, { icon: '🏷️', text: 'Ainda não há serviços', sub: 'Toca em "+ Novo serviço" para criar o primeiro.' }),
        list.rows !== null && rows.length > 0 && shown.length === 0 && React.createElement(HxEmpty, { icon: '🔎', text: 'Nenhum serviço com estes filtros' }),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: ctx.wide ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)', gap: 12, alignItems: 'start' } },
          shown.map(function (r, idx) {
            var wait = !!pending[r.id];
            var ef = hwxEfEstado(r), fora = hwxForaEpoca(r);
            var cor = HWX_ESTADO_COR[ef] || HX.muted;
            var canDrag = canOrder && ctx.wide && !wait;
            return React.createElement('div', {
              key: r.id,
              draggable: canDrag,
              onDragStart: canDrag ? function () { dragRef.current = r.id; } : undefined,
              onDragOver: canDrag ? function (e) { e.preventDefault(); } : undefined,
              onDrop: canDrag ? function (e) { e.preventDefault(); dropOn(r.id); } : undefined,
              style: Object.assign({}, HXS.card, { marginBottom: 0, opacity: (r.estado === 'arquivado' || fora) ? 0.6 : 1, cursor: canDrag ? 'grab' : 'default' })
            },
              React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'flex-start' } },
                React.createElement('div', { style: { flex: 1, minWidth: 0, fontWeight: 800, fontSize: 18, wordBreak: 'break-word', paddingTop: 8 } }, r.nome),
                // a etiqueta do estado é também a escolha do estado (toca para mudar)
                React.createElement('select', {
                  value: ef, autoComplete: 'off', disabled: wait, 'aria-label': 'Estado de ' + r.nome,
                  onChange: function (e) { onChangeEstado(r, e.target.value); },
                  style: { minHeight: 44, borderRadius: 22, background: HX.field, color: cor, border: '1px solid ' + cor, fontWeight: 700, fontSize: 14, padding: '0 10px', fontFamily: 'inherit', colorScheme: 'dark', accentColor: '#a3a3a3', maxWidth: 150 }
                }, HWX_SERV_ESTADOS.map(function (o) { return React.createElement('option', { key: o.v, value: o.v }, o.l); }))
              ),
              React.createElement('div', { style: { fontWeight: 800, fontSize: 21, marginTop: 4, color: fora ? HX.muted : HX.text, wordBreak: 'break-word' } }, hwxPriceText(r)),
              React.createElement('div', null,
                React.createElement(HxPill, { text: hwxCatName(cats, r.categoria) }),
                ef === 'pausado' && r.pausado_ate && React.createElement(HxPill, { text: 'Pausado até ' + hwxFmtDate(r.pausado_ate), color: HWX_ESTADO_COR.pausado }),
                r.estado === 'pausado' && ef === 'ativo' && React.createElement(HxPill, { text: 'Pausa terminou em ' + hwxFmtDate(r.pausado_ate), color: HX.muted }),
                r.estado === 'sazonal' && React.createElement(HxPill, { text: (fora ? 'Fora de época · ' : '') + hwxMesesText(r.meses), color: fora ? '#737373' : HWX_ESTADO_COR.sazonal })
              ),
              flt.refs && r.estado !== 'consulta' && React.createElement(HxRefLine, { r: r, onSave: saveHoras }),
              r.nota && React.createElement(HxNotes, { text: r.nota, label: 'Nota' }),
              React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8, marginTop: 12 } },
                React.createElement(HxActBtn, { icon: '↑', label: 'Subir', aria: 'Subir ' + r.nome, title: canOrder ? 'Subir' : 'Muda para "A minha ordem" para ordenar', disabled: !canOrder || wait || idx === 0, onClick: function () { moveBy(r.id, -1, visibleIds); } }),
                React.createElement(HxActBtn, { icon: '↓', label: 'Descer', aria: 'Descer ' + r.nome, title: canOrder ? 'Descer' : 'Muda para "A minha ordem" para ordenar', disabled: !canOrder || wait || idx === shown.length - 1, onClick: function () { moveBy(r.id, 1, visibleIds); } }),
                React.createElement(HxActBtn, { icon: '✏️', label: 'Editar', aria: 'Editar ' + r.nome, disabled: wait, onClick: function () { setForm({ editing: r, preset: null }); } }),
                React.createElement(HxActBtn, { icon: '🗑️', label: 'Apagar', kind: 'danger', aria: 'Apagar ' + r.nome, disabled: wait, onClick: function () { onDel(r); } })
              )
            );
          })
        )
      );
    }

    // ── CLIENTES (hwx_clientes + hwx_locais) ──
    // Estado inicial do formulário de cliente. O bloco CONTACTO mostra o contacto; se a coluna do contacto
    // estiver vazia, mostra o valor da coluna do cliente (nada fica escondido).
    function hwxCli0(r) {
      var s = function (k) { return r && r[k] != null ? String(r[k]) : ''; };
      return {
        numero: r ? String(r.numero) : '', nome: s('nome'), estado: (r && r.estado) || 'ativo', pausado_ate: s('pausado_ate'),
        lingua: (r && r.lingua) || 'de', zona: s('zona'),
        firma: s('firma'), rua: s('rua'), plz: s('plz'), ort: s('ort'),
        c_nome: s('contacto_nome'), c_tel: s('contacto_telemovel') || s('telemovel'), c_fixo: s('contacto_telefone') || s('telefone_fixo'), c_email: s('contacto_email') || s('email'),
        notas: s('notas')
      };
    }
    function hwxSamePhone(a, b) { return hwxPhoneKey(a) === hwxPhoneKey(b); }
    function hwxSameMail(a, b) { return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase(); }
    function hwxZonaCurto(z) {
      if (z.tipo === 'incluida') return 'incluída';
      if (z.tipo === 'acrescimo_hora') return '+' + hwxChf(z.valor) + '/h';
      return 'taxa ' + hwxChf(z.valor);
    }
    function hwxZonaOpts(zonas, atual, vazio) {
      var opts = [{ v: '', l: vazio }].concat(zonas.map(function (z) { return { v: z.nome, l: z.nome + ' (' + hwxZonaCurto(hwxZonaNorm(z)) + ')' }; }));
      if (atual && !zonas.some(function (z) { return z.nome === atual; })) opts.push({ v: atual, l: atual + ' (já não existe nos Ajustes)' });
      return opts;
    }

    function HwxLocalForm(props) {
      var notify = props.notify, cli = props.cliente, editing = props.editing, zonas = props.zonas;
      var next = props.proximoSub;
      var f0 = function (r) {
        var s = function (k) { return r && r[k] != null ? String(r[k]) : ''; };
        return { sub_numero: r ? String(r.sub_numero) : '', nome: s('nome'), rua: s('rua'), plz: s('plz'), ort: s('ort'), zona: s('zona'), notas: s('notas') };
      };
      var _f = React.useState(function () { return f0(editing); });
      var f = _f[0], setF = _f[1];
      var _er = React.useState({}); var errs = _er[0], setErrs = _er[1];
      var _b = React.useState(false); var busy = _b[0], setBusy = _b[1];
      var busyRef = React.useRef(false);
      var snap = React.useRef(f0(editing)).current;
      var upd = function (k, v) { setF(function (p) { var n = Object.assign({}, p); n[k] = v; return n; }); };
      var ag = hwxUseAddrGuard(notify);
      var updA = function (k) { return function (v, ev) { if (ag.bloqueia(ev)) return; upd(k, v); }; };

      var doSave = function (ok, fail) {
        if (busyRef.current) return;
        var e = {};
        var nome = String(f.nome || '').trim();
        var subTxt = String(f.sub_numero).trim();
        var sub = subTxt === '' ? null : hwxNum(subTxt);
        if (!nome) e.nome = 'Indica o nome do local.';
        if (subTxt !== '') {
          if (sub === null || sub <= 0 || Math.round(sub) !== sub || sub > 2147483647) e.sub_numero = 'O subnúmero tem de ser um inteiro maior que 0.';
          else if (props.locais.some(function (l) { return l.sub_numero === sub && (!editing || l.id !== editing.id); })) e.sub_numero = 'O subnúmero ' + cli.numero + '.' + sub + ' já está ocupado neste cliente.';
        }
        setErrs(e);
        if (Object.keys(e).length) {
          var msgs = [];
          if (e.sub_numero) msgs.push('Subnúmero inválido');
          if (e.nome) msgs.push('Falta: nome do local');
          hwxReportErrs(notify, msgs);
          if (fail) fail(); return;
        }
        var payload = {
          nome: nome, rua: String(f.rua || '').trim(), plz: String(f.plz || '').trim(), ort: String(f.ort || '').trim(),
          zona: f.zona || '', notas: String(f.notas || '').trim()
        };
        if (sub !== null) payload.sub_numero = sub;
        if (!editing) { payload.cliente_id = cli.id; payload.ordem = props.ordemNova; }
        busyRef.current = true; setBusy(true);
        hwxWrite('hwx_locais', editing ? editing.id : null, payload, notify, function (row) {
          props.onSaved(row);
          if (ok) ok(); else props.onClose();
        }, function (success) {
          busyRef.current = false; setBusy(false);
          if (!success && fail) fail();
        });
      };

      hwxUseDirty('local', snap, f, doSave);
      var tryClose = function () { if (!busy) props.guard.attempt(props.onClose, ['local']); };
      hwxUseEsc(tryClose);

      return React.createElement(HxFormShell, { title: (editing ? 'Editar local' : 'Novo local') + ' · #' + cli.numero + ' ' + (cli.firma || cli.nome), onCancel: tryClose, onSave: function () { doSave(); }, busy: busy },
        React.createElement(HxField, { label: 'Subnúmero', value: f.sub_numero, inputMode: 'numeric', onChange: function (v) { upd('sub_numero', v); }, error: errs.sub_numero, placeholder: 'automático (próximo: ' + cli.numero + '.' + next + ')', hint: editing ? 'Local ' + cli.numero + '.' + editing.sub_numero : undefined, onEnter: function () { doSave(); } }),
        React.createElement(HxField, { label: 'Nome do local', value: f.nome, onChange: function (v) { upd('nome', v); }, error: errs.nome, placeholder: 'ex.: Passionsstrasse 6', onEnter: function () { doSave(); } }),
        React.createElement(HxField, { label: 'Rua', value: f.rua, onChange: updA('rua'), onEnter: function () { doSave(); } }),
        React.createElement(HxRow, { cols: 2 },
          React.createElement(HxField, { label: 'PLZ', value: f.plz, inputMode: 'numeric', onChange: updA('plz'), warn: hwxPlzWarn(f.plz), onEnter: function () { doSave(); } }),
          React.createElement(HxField, { label: 'Localidade', value: f.ort, onChange: updA('ort'), onEnter: function () { doSave(); } })
        ),
        React.createElement(HxSelect, { label: 'Zona', warn: hwxZonaLocalAviso(f.zona, f.ort), value: f.zona, options: hwxZonaOpts(zonas, f.zona, '— a do cliente —'), onChange: function (v) { ag.zona(); upd('zona', v); } }),
        React.createElement(HxField, { label: 'Notas', value: f.notas, multiline: true, onChange: function (v) { upd('notas', v); } })
      );
    }

    function HwxClienteForm(props) {
      var notify = props.notify, editing = props.editing, zonas = props.zonas, clientes = props.clientes;
      var _f = React.useState(function () { return hwxCli0(editing); });
      var f = _f[0], setF = _f[1];
      var _er = React.useState({}); var errs = _er[0], setErrs = _er[1];
      var _b = React.useState(false); var busy = _b[0], setBusy = _b[1];
      var busyRef = React.useRef(false);
      var snap = React.useRef(hwxCli0(editing)).current;
      var upd = function (k, v) { setF(function (p) { var n = Object.assign({}, p); n[k] = v; return n; }); };
      var ag = hwxUseAddrGuard(notify);
      var updA = function (k) { return function (v, ev) { if (ag.bloqueia(ev)) return; upd(k, v); }; };

      var maxNum = 0;
      clientes.forEach(function (c) { if (c.numero > maxNum) maxNum = c.numero; });
      var proximo = Math.max(maxNum, props.contador || 0) + 1;

      var doSave = function (ok, fail) {
        if (busyRef.current) return;
        var e = {};
        var nome = String(f.nome || '').trim();
        var numTxt = String(f.numero).trim();
        var num = numTxt === '' ? null : hwxNum(numTxt);
        if (!nome) e.nome = 'Indica o nome do cliente.';
        if (numTxt !== '') {
          if (num === null || num <= 0 || Math.round(num) !== num || num > 2147483647) e.numero = 'O número tem de ser um inteiro maior que 0.';
          else {
            var uso = clientes.filter(function (c) { return c.numero === num && (!editing || c.id !== editing.id); })[0];
            if (uso) e.numero = 'O número ' + num + ' já é do cliente "' + (uso.nome || uso.firma) + '".';
          }
        }
        if (hwxEmailBad(f.c_email)) e.c_email = 'E-mail inválido.';
        setErrs(e);
        if (Object.keys(e).length) {
          var msgs = [];
          if (e.nome) msgs.push('Falta: nome do cliente');
          if (e.numero) msgs.push('Número de cliente inválido');
          if (e.c_email) msgs.push('E-mail inválido');
          hwxReportErrs(notify, msgs);
          if (fail) fail(); return;
        }
        var t = function (k) { return String(f[k] || '').trim(); };
        var payload = {
          nome: nome, lingua: f.lingua, zona: f.zona || '', estado: f.estado,
          pausado_ate: f.estado === 'pausado' && f.pausado_ate ? f.pausado_ate : null,
          firma: t('firma'), rua: t('rua'), plz: t('plz'), ort: t('ort'),
          contacto_nome: t('c_nome'), contacto_telemovel: t('c_tel'), contacto_telefone: t('c_fixo'), contacto_email: t('c_email'),
          notas: t('notas')
        };
        if (editing) {
          // Se o que vias no CONTACTO vinha da coluna do cliente e o mudaste ou apagaste, limpa-a também
          // (senão o valor antigo continuava a aparecer no cartão).
          var limpa = function (col, key, same) {
            var old = String(editing[col] || '').trim();
            if (old && same(old, snap[key]) && !same(t(key), snap[key])) payload[col] = '';
          };
          limpa('telemovel', 'c_tel', hwxSamePhone);
          limpa('telefone_fixo', 'c_fixo', hwxSamePhone);
          limpa('email', 'c_email', hwxSameMail);
        }
        if (num !== null) payload.numero = num;
        busyRef.current = true; setBusy(true);
        hwxWrite('hwx_clientes', editing ? editing.id : null, payload, notify, function (row) {
          props.onSaved(row);
          if (ok) ok(); else props.onClose();
        }, function (success) {
          busyRef.current = false; setBusy(false);
          if (!success && fail) fail();
        });
      };

      hwxUseDirty('cliente', snap, f, doSave);
      var tryClose = function () { if (!busy) props.guard.attempt(props.onClose, ['cliente']); };
      hwxUseEsc(tryClose);

      var meusLocais = props.locais.slice().sort(function (a, b) { return a.sub_numero - b.sub_numero; });
      var enter = function () { doSave(); };
      var zonaOpts = hwxZonaOpts(zonas, f.zona, '— sem zona —');

      return React.createElement(HxFormShell, { title: editing ? 'Editar cliente' : 'Novo cliente', onCancel: tryClose, onSave: function () { doSave(); }, busy: busy },
        React.createElement(HxSection, { title: 'Cliente' },
          React.createElement(HxField, { label: 'Número de cliente', value: f.numero, inputMode: 'numeric', onChange: function (v) { upd('numero', v); }, error: errs.numero, placeholder: 'automático (próximo: ' + proximo + ')', hint: editing ? undefined : 'Deixa vazio para a base atribuir o próximo.', onEnter: enter }),
          React.createElement(HxField, { label: 'Nome', value: f.nome, onChange: function (v) { upd('nome', v); }, error: errs.nome, onEnter: enter }),
          React.createElement(HxRow, { cols: 2 },
            React.createElement(HxSelect, { label: 'Estado', value: f.estado, options: HWX_CLI_ESTADOS, onChange: function (v) { upd('estado', v); } }),
            f.estado === 'pausado' ? React.createElement(HxDate, { label: 'Pausado até (opcional)', value: f.pausado_ate, onChange: function (v) { upd('pausado_ate', v); } }) : null
          ),
          React.createElement(HxRow, { cols: 2 },
            React.createElement(HxSelect, { label: 'Língua', value: f.lingua, options: HWX_LANGS, onChange: function (v) { upd('lingua', v); } }),
            React.createElement(HxSelect, { label: 'Zona por defeito', warn: hwxZonaLocalAviso(f.zona, f.ort), value: f.zona, options: zonaOpts, onChange: function (v) { ag.zona(); upd('zona', v); } })
          ),
          zonas.length === 0 && React.createElement('div', { style: { fontSize: 13, color: HX.warnText, marginTop: -6 } }, 'Ainda não há zonas — cria-as em Ajustes.')
        ),
        React.createElement(HxSection, { title: '💰 QUEM PAGA' },
          React.createElement(HxField, { label: 'Firma (opcional)', value: f.firma, onChange: function (v) { upd('firma', v); }, onEnter: enter }),
          React.createElement(HxField, { label: 'Rua', value: f.rua, onChange: updA('rua'), onEnter: enter }),
          React.createElement(HxRow, { cols: 2 },
            React.createElement(HxField, { label: 'PLZ', value: f.plz, inputMode: 'numeric', onChange: updA('plz'), warn: hwxPlzWarn(f.plz), onEnter: enter }),
            React.createElement(HxField, { label: 'Localidade', value: f.ort, onChange: updA('ort'), onEnter: enter })
          )
        ),
        React.createElement(HxSection, { title: '👤 CONTACTO' },
          React.createElement(HxField, { label: 'Nome', info: 'Pessoa de contacto (usada na saudação das mensagens de WhatsApp).', placeholder: 'ex.: Roland Aeschbacher', value: f.c_nome, onChange: function (v) { upd('c_nome', v); }, onEnter: enter }),
          React.createElement(HxRow, { cols: 2 },
            React.createElement(HxField, { label: 'Telemóvel', value: f.c_tel, type: 'tel', inputMode: 'tel', onChange: function (v) { upd('c_tel', v); }, placeholder: '079 123 45 67', onEnter: enter }),
            React.createElement(HxField, { label: 'Telefone fixo', value: f.c_fixo, type: 'tel', inputMode: 'tel', onChange: function (v) { upd('c_fixo', v); }, placeholder: '032 123 45 67', onEnter: enter })
          ),
          React.createElement(HxField, { label: 'E-mail', value: f.c_email, type: 'email', inputMode: 'email', onChange: function (v) { upd('c_email', v); }, error: errs.c_email, onEnter: enter })
        ),
        React.createElement(HxSection, { title: '📍 ONDE É O TRABALHO' },
          meusLocais.length === 0 && React.createElement('div', { style: { fontSize: 14, color: HX.muted, marginBottom: 10 } }, 'Igual à morada de quem paga'),
          !editing && React.createElement('div', { style: { fontSize: 13, color: HX.muted } }, 'Guarda o cliente primeiro; depois podes juntar locais.'),
          editing && meusLocais.map(function (l) {
            return React.createElement('div', { key: l.id, style: { display: 'flex', gap: 8, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid ' + HX.border } },
              React.createElement('div', { style: { flex: 1, minWidth: 0 } }, hwxLocalLines(editing, l)),
              React.createElement(HxBtn, { label: '✏️', aria: 'Editar local ' + l.nome, onClick: function () { props.onEditLocal(l); } }),
              React.createElement(HxBtn, { label: '🗑️', kind: 'danger', aria: 'Apagar local ' + l.nome, onClick: function () { props.onDelLocal(l); } })
            );
          }),
          editing && React.createElement('div', { style: { marginTop: 10 } },
            React.createElement(HxBtn, { label: '+ Local', onClick: function () { props.onNewLocal(); }, full: true })
          )
        ),
        React.createElement(HxSection, { title: '📝 Notas' },
          React.createElement(HxField, { label: 'Notas', value: f.notas, multiline: true, onChange: function (v) { upd('notas', v); } })
        )
      );
    }

    // Pesquisa por tokens: número, nome, firma, contacto, telemóvel, fixo, PLZ, localidade (e locais)
    function hwxClienteMatch(c, locais, tokens) {
      return tokens.every(function (tk) {
        var t = tk.charAt(0) === '#' ? tk.slice(1) : tk;
        if (!t) return true;
        if (/^\d+(\.\d+)?$/.test(t)) {
          if (String(c.numero) === t) return true;
          if (t.indexOf('.') !== -1 && locais.some(function (l) { return c.numero + '.' + l.sub_numero === t; })) return true;
          if (t.length >= 3) {
            var phones = [c.telemovel, c.telefone_fixo, c.contacto_telemovel, c.contacto_telefone].join(' ').replace(/\D/g, '');
            if (phones.indexOf(t) !== -1) return true;
            if (String(c.plz || '').indexOf(t) !== -1) return true;
            if (locais.some(function (l) { return String(l.plz || '').indexOf(t) !== -1; })) return true;
          }
          return false;
        }
        var hay = hwxNorm([c.firma, c.nome, c.contacto_nome, c.telemovel, c.telefone_fixo, c.contacto_telemovel, c.contacto_telefone, c.plz, c.ort, c.rua, c.email, c.contacto_email].join(' '));
        if (hay.indexOf(hwxNorm(t)) !== -1) return true;
        return locais.some(function (l) { return hwxNorm([l.nome, l.rua, l.plz, l.ort].join(' ')).indexOf(hwxNorm(t)) !== -1; });
      });
    }

    function HwxClientes(props) {
      var notify = props.notify, zonas = props.zonas || [], ctx = React.useContext(HxCtx);
      var clientes = hwxUseList('hwx_clientes', 'numero', notify);
      var locais = hwxUseList('hwx_locais', 'ordem', notify);
      var F0 = { q: '', est: 'visiveis', open: false };
      var _fl = React.useState(function () { return Object.assign({}, F0, hwxStoreGet('hwx_f_clientes', notify) || {}); });
      var flt = _fl[0], setFlt = _fl[1];
      var updF = function (k, v) { setFlt(function (p) { var n = Object.assign({}, p); n[k] = v; return n; }); };
      React.useEffect(function () { hwxStoreSet('hwx_f_clientes', flt, notify); }, [flt]);

      // view: null (lista) | { kind: 'cliente', editing } | { kind: 'local', cliente, editing }
      var _v = React.useState(null); var view = _v[0], setView = _v[1];
      var _p = React.useState({}); var pending = _p[0], setPending = _p[1];

      var rows = clientes.rows || [];
      var locRows = locais.rows || [];
      var replaceIn = function (list) {
        return function (row) {
          list.setRows(function (prev) {
            var arr = prev || [], found = false;
            var out = arr.map(function (r) { if (r.id === row.id) { found = true; return row; } return r; });
            if (!found) out.push(row);
            return out;
          });
        };
      };
      var locaisDe = function (id) { return locRows.filter(function (l) { return l.cliente_id === id; }); };

      var _dd = React.useState(null); var delDlg = _dd[0], setDelDlg = _dd[1];
      var clearPend = function (id) { setPending(function (p) { var n = Object.assign({}, p); delete n[id]; return n; }); };
      var removerCliente = function (c) {
        setDelDlg(function (d) { return d ? Object.assign({}, d, { busy: true }) : d; });
        hwxRemove('hwx_clientes', c.id, notify, function () {
          clientes.setRows(function (prev) { return (prev || []).filter(function (x) { return x.id !== c.id; }); });
          locais.setRows(function (prev) { return (prev || []).filter(function (x) { return x.cliente_id !== c.id; }); });
          setDelDlg(null);
        }, function (ok) {
          clearPend(c.id);
          if (!ok) setDelDlg(null);
        });
      };
      // Conta o que depende do cliente (ofertas, trabalhos, séries) ANTES de pedir confirmação; se não conseguir contar, não apaga
      var delCliente = function (c) {
        if (pending[c.id]) return;
        setPending(function (p) { var n = Object.assign({}, p); n[c.id] = true; return n; });
        var res = {}, falta = 3, falhou = false;
        var fim = function () {
          falta -= 1;
          if (falta > 0) return;
          if (falhou) { clearPend(c.id); return; }
          var nl = locaisDe(c.id).length;
          var linhas = [];
          linhas.push(res.hwx_ofertas + ' oferta(s): ficam sem cliente (com os dados copiados)');
          linhas.push(res.hwx_trabalhos + ' trabalho(s): ficam sem cliente (com os dados copiados)');
          linhas.push(nl + ' local(is) de trabalho: são apagados com o cliente');
          linhas.push(res.hwx_series + ' série(s)');
          setDelDlg({
            c: c, titulo: 'Apagar o cliente #' + c.numero + ' «' + (c.firma || c.nome) + '»?',
            aviso: 'Isto não se desfaz.' + (res.hwx_ofertas + res.hwx_trabalhos > 0 ? ' O cliente tem ' + res.hwx_ofertas + ' oferta(s) e ' + res.hwx_trabalhos + ' trabalho(s).' : ''),
            linhas: linhas,
            bloqueio: res.hwx_series > 0 ? 'A base não deixa apagar um cliente com séries: apaga primeiro as ' + res.hwx_series + ' série(s) (Agenda › Séries).' : ''
          });
        };
        var contar = function (table) {
          window.supabaseClient.from(table).select('id').eq('cliente_id', c.id).then(function (r) {
            if (r.error) { falhou = true; hwxFail(notify, 'contar ' + table + ' do cliente', r.error, false); } else res[table] = (r.data || []).length;
            fim();
          }).catch(function (e) { falhou = true; hwxFail(notify, 'contar ' + table + ' do cliente', e, false); fim(); });
        };
        contar('hwx_ofertas'); contar('hwx_trabalhos'); contar('hwx_series');
      };
      var delLocal = function (l) {
        if (!window.confirm('Apagar o local "' + l.nome + '"?')) return;
        hwxRemove('hwx_locais', l.id, notify, function () {
          locais.setRows(function (prev) { return (prev || []).filter(function (x) { return x.id !== l.id; }); });
        }, function () {});
      };

      function clienteForm(editing) {
        var live = editing ? (rows.filter(function (c) { return c.id === editing.id; })[0] || editing) : null;
        return React.createElement(HwxClienteForm, {
          key: editing ? editing.id : 'novo',
          editing: live, clientes: rows, zonas: zonas, notify: notify, guard: ctx.guard, contador: props.contador,
          locais: live ? locaisDe(live.id) : [],
          onSaved: function (row) { replaceIn(clientes)(row); props.onReloadCfg(); },
          onClose: function () { setView(null); },
          onNewLocal: function () { setView({ kind: 'local', cliente: live, editing: null }); },
          onEditLocal: function (l) { setView({ kind: 'local', cliente: live, editing: l }); },
          onDelLocal: delLocal
        });
      }

      if (view && view.kind === 'series') {
        return React.createElement(HwxSeries, { notify: notify, zonas: zonas, cats: props.cats, saveCfg: props.saveCfg, precoBase: props.precoBase, clienteId: view.cliente.id, onReloadCfg: props.onReloadCfg, onBack: function () { setView(null); }, onChanged: function () {} });
      }
      if (view) {
        // O formulário do cliente fica sempre montado (escondido quando se edita um local)
        // para não perder o que ainda não foi guardado.
        var emLocal = view.kind === 'local';
        var cliForm = clienteForm(emLocal ? view.cliente : view.editing);
        var localForm = null;
        if (emLocal) {
          var cli = rows.filter(function (c) { return c.id === view.cliente.id; })[0] || view.cliente;
          var mine0 = locaisDe(cli.id);
          var maxSub = 0, maxOrd = 0;
          mine0.forEach(function (l) { if (l.sub_numero > maxSub) maxSub = l.sub_numero; if ((l.ordem || 0) > maxOrd) maxOrd = l.ordem || 0; });
          localForm = React.createElement(HwxLocalForm, {
            key: 'local', cliente: cli, editing: view.editing, locais: mine0, zonas: zonas, notify: notify, guard: ctx.guard,
            proximoSub: Math.max(maxSub, cli.ultimo_sub_numero || 0) + 1, ordemNova: maxOrd + 1,
            onSaved: function (row) { replaceIn(locais)(row); clientes.load(); },
            onClose: function () { setView({ kind: 'cliente', editing: view.cliente }); }
          });
        }
        return React.createElement('div', null,
          React.createElement('div', { key: 'cli', style: { display: emLocal ? 'none' : 'block' } }, cliForm),
          localForm
        );
      }

      var tokens = hwxNorm(flt.q).split(/\s+/).filter(Boolean);
      var shown = rows.filter(function (c) {
        var ef = hwxEfEstado(c);
        if (flt.est === 'visiveis' && c.estado === 'arquivado') return false;
        if (flt.est !== 'visiveis' && flt.est !== 'todos' && ef !== flt.est) return false;
        if (tokens.length && !hwxClienteMatch(c, locaisDe(c.id), tokens)) return false;
        return true;
      }).sort(function (a, b) { return (a.numero || 0) - (b.numero || 0); });
      var active = (flt.q.trim() ? 1 : 0) + (flt.est !== 'visiveis' ? 1 : 0);
      var estFilterOpts = [{ v: 'visiveis', l: 'Todos menos arquivados' }].concat(HWX_CLI_ESTADOS).concat([{ v: 'todos', l: 'Todos' }]);

      return React.createElement('div', null,
        React.createElement(HxHead, { title: 'Clientes' }),
        delDlg && React.createElement(HwxApagarDlg, { d: delDlg, onCancel: function () { clearPend(delDlg.c.id); setDelDlg(null); }, onConfirm: function () { removerCliente(delDlg.c); } }),
        React.createElement('div', { style: { marginBottom: 12 } },
          React.createElement(HxBtn, { label: '+ Novo cliente', kind: 'primary', big: true, full: true, onClick: function () { setView({ kind: 'cliente', editing: null }); } })
        ),
        React.createElement(HxField, { label: 'Pesquisar (nº, nome, firma, contacto, telefone, PLZ, localidade)', value: flt.q, onChange: function (v) { updF('q', v); }, list: 'hwx-dl-clientes', placeholder: 'ex.: 2, 2.2 ou nome' }),
        React.createElement('datalist', { id: 'hwx-dl-clientes' }, rows.map(function (c) { return React.createElement('option', { key: c.id, value: '#' + c.numero + ' ' + (c.firma || c.nome) }); })),
        React.createElement(HxFilterBar, {
          active: active, open: flt.open, onToggle: function () { updF('open', !flt.open); },
          onClear: function () { setFlt(function (p) { return Object.assign({}, F0, { open: p.open }); }); }
        },
          React.createElement(HxSelect, { label: 'Estado', value: flt.est, onChange: function (v) { updF('est', v); }, options: estFilterOpts })
        ),
        React.createElement(HxLoadState, { list: clientes }),
        clientes.rows !== null && React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginBottom: 8 } }, shown.length + ' de ' + rows.length + ' cliente(s)'),
        clientes.rows !== null && rows.length === 0 && React.createElement(HxEmpty, { icon: '👥', text: 'Ainda não há clientes', sub: 'Toca em "+ Novo cliente" para criar o primeiro.' }),
        clientes.rows !== null && rows.length > 0 && shown.length === 0 && React.createElement(HxEmpty, { icon: '🔎', text: 'Nenhum cliente com estes filtros' }),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: ctx.wide ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)', gap: 12, alignItems: 'start' } },
          shown.map(function (c) {
            var wait = !!pending[c.id];
            var ef = hwxEfEstado(c);
            var mine = locaisDe(c.id).slice().sort(function (a, b) { return a.sub_numero - b.sub_numero; });
            var cp = [c.plz, c.ort].filter(Boolean).join(' ');
            var cont = hwxContactoDados(c);
            var temCont = !!(cont.nome || cont.nums.length || cont.emails.length);
            return React.createElement('div', { key: c.id, style: Object.assign({}, HXS.card, { marginBottom: 0, opacity: c.estado === 'arquivado' ? 0.65 : 1 }) },
              React.createElement('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 10 } },
                React.createElement('div', { style: { flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' } },
                  React.createElement('div', { style: { fontWeight: 800, fontSize: 26, lineHeight: 1.1 } }, '#' + c.numero),
                  React.createElement('div', { style: { fontWeight: 800, fontSize: 18, wordBreak: 'break-word', minWidth: 0 } }, c.firma || c.nome)
                ),
                React.createElement(HxPill, { text: hwxLabel(HWX_CLI_ESTADOS, ef) + (ef === 'pausado' && c.pausado_ate ? ' até ' + hwxFmtDate(c.pausado_ate) : ''), color: HWX_ESTADO_COR[ef] })
              ),
              c.firma && c.nome && c.nome !== c.firma && React.createElement('div', { style: { fontSize: 14, color: HX.muted, marginTop: 2 } }, c.nome),
              React.createElement(HxBlock, { title: '💰 QUEM PAGA' },
                React.createElement('div', { style: { fontSize: 15, fontWeight: 700, wordBreak: 'break-word' } }, c.firma || c.nome),
                c.rua && React.createElement('div', { style: { fontSize: 15, wordBreak: 'break-word' } }, c.rua),
                cp && React.createElement('div', { style: { fontSize: 15 } }, cp)
              ),
              temCont && React.createElement(HxBlock, { title: '👤 CONTACTO' },
                cont.nome && React.createElement('div', { style: { fontSize: 15, fontWeight: 700, wordBreak: 'break-word' } }, cont.nome),
                cont.nums.map(function (n) { return React.createElement('div', { key: 'n' + n.raw, style: { fontSize: 15 } }, (n.kind === 'mob' ? '📱 ' : '☎️ ') + hwxFmtPhone(n.raw)); }),
                cont.emails.map(function (m) { return React.createElement('div', { key: 'm' + m, style: { fontSize: 15, wordBreak: 'break-all' } }, '✉️ ' + m); })
              ),
              React.createElement(HxBlock, { title: '📍 ONDE É O TRABALHO' },
                mine.length === 0
                  ? React.createElement('div', { style: { fontSize: 15 } }, 'Igual à morada de quem paga', c.zona ? React.createElement(HxPill, { text: c.zona }) : null)
                  : mine.map(function (l) { return React.createElement('div', { key: l.id, style: { padding: '2px 0' } }, hwxLocalLines(c, l)); })
              ),
              c.notas && React.createElement(HxNotes, { text: c.notas }),
              React.createElement(HxCardActions, { entries: hwxCallEntries(c), name: c.firma || c.nome, disabled: wait, onEdit: function () { setView({ kind: 'cliente', editing: c }); }, onDel: function () { delCliente(c); } }),
              React.createElement('div', { style: { marginTop: 8 } }, React.createElement(HxBtn, { label: '🔁 Séries', full: true, aria: 'Séries de ' + (c.firma || c.nome), onClick: function () { setView({ kind: 'series', cliente: c }); } }))
            );
          })
        )
      );
    }

    // ── AJUSTES (hwx_config, uma linha) ──
    var HWX_ZONA_PRESETS = ['Selzach', 'Outros'];

    var HWX_ZONA_AVISO = 'Este valor é só a deslocação — o preço do trabalho vem da tabela de preços';
    function hwxZonaAvisoBase(tipo, valor, precoBase) {
      return tipo !== 'incluida' && valor !== null && valor > 0 && valor >= hwxLimiteTaxa(precoBase) ? HWX_ZONA_AVISO : undefined;
    }
    function HwxZonaForm(props) {
      var notify = props.notify, editing = props.editing, zonas = props.zonas;
      var preset = function (nome) { return HWX_ZONA_PRESETS.indexOf(nome) !== -1 ? nome : '__outra'; };
      var f0 = function (z) { return z ? { sel: preset(z.nome), outra: HWX_ZONA_PRESETS.indexOf(z.nome) !== -1 ? '' : z.nome, tipo: hwxZonaNorm(z).tipo, valor: String(z.valor == null ? '' : z.valor) } : { sel: 'Selzach', outra: '', tipo: 'incluida', valor: '' }; };
      var _f = React.useState(function () { return f0(editing); });
      var f = _f[0], setF = _f[1];
      var _er = React.useState({}); var errs = _er[0], setErrs = _er[1];
      var _b = React.useState(false); var busy = _b[0], setBusy = _b[1];
      var busyRef = React.useRef(false);
      var snap = React.useRef(f0(editing)).current;
      var upd = function (k, v) { setF(function (p) { var n = Object.assign({}, p); n[k] = v; return n; }); };

      var doSave = function (ok, fail) {
        if (busyRef.current) return;
        var e = {};
        var nome = f.sel === '__outra' ? String(f.outra || '').trim() : f.sel;
        var val = f.tipo === 'incluida' ? 0 : hwxNum(f.valor);
        if (!nome) e.nome = 'Escreve o nome da zona.';
        else if (zonas.some(function (z) { return hwxNorm(z.nome) === hwxNorm(nome) && (!editing || z.nome !== editing.nome); })) e.nome = 'Já existe uma zona com este nome.';
        if (val === null || val < 0 || val > 99999999.99) e.valor = 'Valor inválido (ex.: 10 ou 7,50).';
        setErrs(e);
        if (Object.keys(e).length) {
          var msgs = [];
          if (e.nome) msgs.push(e.nome === 'Escreve o nome da zona.' ? 'Falta: nome da zona' : 'Nome da zona repetido');
          if (e.valor) msgs.push('Valor da zona inválido');
          hwxReportErrs(notify, msgs);
          if (fail) fail(); return;
        }
        var nova = { nome: nome, valor: hwxFromRappen(hwxToRappen(val)), tipo: f.tipo };
        var lista = editing
          ? zonas.map(function (z) { return z.nome === editing.nome ? nova : z; })
          : zonas.concat([nova]);
        busyRef.current = true; setBusy(true);
        props.saveCfg({ zonas: lista }, function () {
          if (ok) ok(); else props.onClose();
        }, function () {
          busyRef.current = false; setBusy(false);
          if (fail) fail();
        });
      };
      hwxUseDirty('zona', snap, f, doSave);
      var tryClose = function () { if (!busy) props.guard.attempt(props.onClose, ['zona']); };
      hwxUseEsc(tryClose);

      return React.createElement(HxFormShell, { title: editing ? 'Editar zona' : 'Nova zona', onCancel: tryClose, onSave: function () { doSave(); }, busy: busy },
        React.createElement(HxSelect, { label: 'Nome da zona', value: f.sel, onChange: function (v) { upd('sel', v); }, options: [{ v: 'Selzach', l: 'Selzach' }, { v: 'Outros', l: 'Outros' }, { v: '__outra', l: 'Outra (escrever)' }] }),
        f.sel === '__outra' && React.createElement(HxField, { label: 'Nome (escrever)', value: f.outra, onChange: function (v) { upd('outra', v); }, error: errs.nome, placeholder: 'ex.: Grenchen', onEnter: function () { doSave(); } }),
        f.sel !== '__outra' && errs.nome && React.createElement('div', { 'data-hwx-err': '1', style: Object.assign({}, HXS.err, { marginTop: -8, marginBottom: 12 }) }, errs.nome),
        React.createElement(HxSelect, { label: 'Tipo de deslocação', value: f.tipo, onChange: function (v) { upd('tipo', v); }, options: HWX_ZONA_TIPOS }),
        f.tipo !== 'incluida' && React.createElement(HxField, { label: f.tipo === 'acrescimo_hora' ? 'Valor (CHF por hora)' : 'Valor (CHF por ida)', value: f.valor, inputMode: 'decimal', onChange: function (v) { upd('valor', v); }, error: errs.valor, hint: 'Valor sugerido para a deslocação (podes mudar em cada oferta)', warn: hwxZonaAvisoBase(f.tipo, hwxNum(f.valor), props.precoBase), onEnter: function () { doSave(); } })
      );
    }

    function HwxCategoriaForm(props) {
      var notify = props.notify, editing = props.editing, cats = props.cats;
      var _f = React.useState(editing ? editing.nome : '');
      var nome = _f[0], setNome = _f[1];
      var _er = React.useState(''); var err = _er[0], setErr = _er[1];
      var _b = React.useState(false); var busy = _b[0], setBusy = _b[1];
      var busyRef = React.useRef(false);
      var snap = React.useRef(editing ? editing.nome : '').current;

      var doSave = function (ok, fail) {
        if (busyRef.current) return;
        var n = String(nome || '').trim();
        var e = '';
        if (!n) e = 'Indica o nome da categoria.';
        else if (cats.some(function (c) { return hwxNorm(c.nome) === hwxNorm(n) && (!editing || c.id !== editing.id); })) e = 'Já existe uma categoria com este nome.';
        setErr(e);
        if (e) { hwxReportErrs(notify, [e === 'Indica o nome da categoria.' ? 'Falta: nome da categoria' : 'Nome da categoria repetido']); if (fail) fail(); return; }
        var lista;
        if (editing) {
          lista = cats.map(function (c) { return c.id === editing.id ? { id: c.id, nome: n } : c; });
        } else {
          var base = hwxSlug(n), id = base, k = 2;
          while (cats.some(function (c) { return c.id === id; })) { id = base + '_' + k; k++; }
          lista = cats.concat([{ id: id, nome: n }]);
        }
        busyRef.current = true; setBusy(true);
        props.saveCfg({ categorias: lista }, function () {
          if (ok) ok(); else props.onClose();
        }, function () {
          busyRef.current = false; setBusy(false);
          if (fail) fail();
        });
      };
      hwxUseDirty('categoria', snap, nome, doSave);
      var tryClose = function () { if (!busy) props.guard.attempt(props.onClose, ['categoria']); };
      hwxUseEsc(tryClose);

      return React.createElement(HxFormShell, { title: editing ? 'Editar categoria' : 'Nova categoria', onCancel: tryClose, onSave: function () { doSave(); }, busy: busy },
        React.createElement(HxField, { label: 'Nome', info: 'Nome da categoria de serviços.', value: nome, onChange: setNome, error: err, placeholder: 'ex.: Jardim', onEnter: function () { doSave(); }, hint: editing ? 'O identificador interno (' + editing.id + ') não muda.' : 'O identificador interno é gerado a partir do nome e não muda depois.' })
      );
    }

    function HwxAjustes(props) {
      var notify = props.notify, cfg = props.cfg, cats = props.cats, ctx = React.useContext(HxCtx);
      var row = cfg.row;
      var rem0 = (row && row.remetente) || {};
      // compatibilidade: remetente antigo só com plz_ort ("NNNN Localidade")
      var plz0 = rem0.plz, ort0 = rem0.ort;
      if (plz0 == null && ort0 == null && rem0.plz_ort) {
        var m = /^\s*(\d{4})\s+(.+?)\s*$/.exec(String(rem0.plz_ort));
        if (m) { plz0 = m[1]; ort0 = m[2]; } else { ort0 = rem0.plz_ort; }
      }

      var _lim = React.useState(row ? String(row.limite_anual) : '2500');
      var limite = _lim[0], setLimite = _lim[1];
      var _bs = React.useState(row && row.preco_base_hora != null ? String(row.preco_base_hora) : '35');
      var base = _bs[0], setBase = _bs[1];
      var temHoras = !!(row && row.horas_sexta != null);
      var _hs = React.useState(temHoras ? String(row.horas_sexta) : '8');
      var horasSex = _hs[0], setHorasSex = _hs[1];
      var _ra = React.useState(rem0.semana_a_ref || HWX_REF_A_DEFAULT); var refA = _ra[0], setRefA = _ra[1];
      var _mw = React.useState(rem0.mwst_nota !== false);
      var mwst = _mw[0], setMwst = _mw[1];
      var _rm = React.useState({ nome: rem0.nome || '', rua: rem0.rua || '', plz: plz0 || '', ort: ort0 || '', telefone: rem0.telefone || '', email: rem0.email || '' });
      var rem = _rm[0], setRem = _rm[1];
      var _er = React.useState({}); var errs = _er[0], setErrs = _er[1];
      var _st = React.useState('idle'); var status = _st[0], setStatus = _st[1];
      var _fv = React.useState(null); var sub = _fv[0], setSub = _fv[1]; // null | {kind:'zona'|'cat', editing}
      var _dl = React.useState(null); var delCat = _dl[0], setDelCat = _dl[1];
      var _mv = React.useState(''); var moveTo = _mv[0], setMoveTo = _mv[1];
      var _mb = React.useState(false); var moveBusy = _mb[0], setMoveBusy = _mb[1];

      var timerRef = React.useRef(null);
      var dirtyRef = React.useRef(false);
      var mounted = React.useRef(false);
      var aliveRef = React.useRef(true);
      var updRem = function (k, v) { setRem(function (p) { var n = Object.assign({}, p); n[k] = v; return n; }); };

      // gravação automática (limite + os meus dados); zonas e categorias gravam nos seus próprios formulários
      var doSave = function (ok, fail) {
        if (cfg.failed) { if (fail) fail(); return; }
        var e = {};
        var lim = hwxNum(limite);
        if (lim === null || lim < 0 || lim > 9999999999.99) e.limite = 'Indica um valor válido (ex.: 2500 ou 2500,00).';
        var pb = hwxNum(base);
        if (pb === null || pb < 0 || pb > 99999999.99) e.base = 'Indica um valor válido (ex.: 35 ou 35,00).';
        if (hwxEmailBad(rem.email)) e.email = 'E-mail inválido.';
        if (!/^\d{4}-\d{2}-\d{2}$/.test(refA || '') || hwxDow(refA) !== 5) e.refA = 'Tem de ser uma sexta-feira.';
        var hs = hwxNum(horasSex);
        if (hs === null || hs <= 0 || hs > 24) e.horas = 'Horas entre 0 e 24 (ex.: 8).';
        if (aliveRef.current) setErrs(e);
        if (e.limite || e.email || e.base || e.horas || e.refA) { if (aliveRef.current) setStatus('invalid'); if (fail) fail(); return; }
        var t = function (k) { return String(rem[k] || '').trim(); };
        var payload = {
          limite_anual: hwxFromRappen(hwxToRappen(lim)),
          preco_base_hora: hwxFromRappen(hwxToRappen(pb)),
          remetente: { nome: t('nome'), rua: t('rua'), plz: t('plz'), ort: t('ort'), plz_ort: [t('plz'), t('ort')].filter(Boolean).join(' '), telefone: t('telefone'), email: t('email'), mwst_nota: !!mwst, semana_a_ref: refA }
        };
        if (temHoras) payload.horas_sexta = Math.round(hs * 10) / 10;
        if (aliveRef.current) setStatus('saving');
        props.saveCfg(payload, function () {
          dirtyRef.current = false;
          if (aliveRef.current) setStatus('saved');
          if (ok) ok();
        }, function () {
          if (aliveRef.current) setStatus('error');
          if (fail) fail();
        });
      };
      var saveRef = React.useRef(doSave);
      saveRef.current = doSave;

      React.useEffect(function () {
        if (!mounted.current) { mounted.current = true; return; }
        dirtyRef.current = true;
        setStatus('pending');
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(function () { timerRef.current = null; saveRef.current(); }, 1200);
      }, [limite, rem, base, mwst, horasSex, refA]);
      React.useEffect(function () {
        aliveRef.current = true;
        return function () {
          aliveRef.current = false;
          if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; if (dirtyRef.current) saveRef.current(); }
        };
      }, []);

      var statusText = status === 'pending' ? 'Alterações por gravar…' : status === 'saving' ? 'A gravar…' : status === 'saved' ? 'Gravado ✓' : status === 'error' ? 'Não gravado — vê o aviso' : status === 'invalid' ? 'Corrige os campos a vermelho' : 'Grava sozinho depois de parares de escrever';
      var statusCor = status === 'saved' ? HX.okText : status === 'error' || status === 'invalid' ? HX.badText : status === 'pending' || status === 'saving' ? HX.warnText : HX.muted;

      if (sub && sub.kind === 'zona') {
        return React.createElement(HwxZonaForm, { editing: sub.editing, zonas: props.zonas, precoBase: hwxNum(base) || 0, notify: notify, guard: ctx.guard, saveCfg: props.saveCfg, onClose: function () { setSub(null); } });
      }
      if (sub && sub.kind === 'cat') {
        return React.createElement(HwxCategoriaForm, { editing: sub.editing, cats: cats, notify: notify, guard: ctx.guard, saveCfg: props.saveCfg, onClose: function () { setSub(null); } });
      }

      var delZona = function (z) {
        if (!window.confirm('Apagar a zona "' + z.nome + '"? Os clientes e locais que a usam ficam com o nome, mas a zona deixa de existir na lista.')) return;
        props.saveCfg({ zonas: props.zonas.filter(function (x) { return x.nome !== z.nome; }) }, function () {}, function () {});
      };
      var moveCat = function (idx, dir) {
        var ni = idx + dir;
        if (ni < 0 || ni >= cats.length) return;
        var l = cats.slice(), t = l[idx]; l[idx] = l[ni]; l[ni] = t;
        props.saveCfg({ categorias: l }, function () {}, function () {});
      };
      // apagar categoria: se tiver serviços, pergunta para qual os mover e só apaga depois de os mover
      var startDelCat = function (c) {
        if (!window.supabaseClient) { hwxFail(notify, 'apagar categoria', { message: 'Sem ligação à base de dados.' }, true); return; }
        window.supabaseClient.from('hwx_servicos').select('id').eq('categoria', c.id).then(function (res) {
          if (res.error) { hwxFail(notify, 'contar serviços da categoria', res.error, false); return; }
          var n = (res.data || []).length;
          if (n === 0) {
            if (!window.confirm('Apagar a categoria "' + c.nome + '"?')) return;
            props.saveCfg({ categorias: cats.filter(function (x) { return x.id !== c.id; }) }, function () {}, function () {});
            return;
          }
          var outras = cats.filter(function (x) { return x.id !== c.id; });
          setMoveTo(outras.length ? outras[0].id : '');
          setDelCat({ cat: c, n: n });
        }).catch(function (e) { hwxFail(notify, 'contar serviços da categoria', e, false); });
      };
      var confirmDelCat = function () {
        if (!delCat || !moveTo || moveBusy) return;
        if (!hwxPreWrite(notify, 'mover serviços', function () {})) return;
        setMoveBusy(true);
        window.supabaseClient.from('hwx_servicos').update({ categoria: moveTo }).eq('categoria', delCat.cat.id).select().then(function (res) {
          if (res.error) { setMoveBusy(false); hwxFail(notify, 'mover serviços', res.error, true); return; }
          props.saveCfg({ categorias: cats.filter(function (x) { return x.id !== delCat.cat.id; }) }, function () {
            setMoveBusy(false); setDelCat(null);
          }, function () { setMoveBusy(false); });
        }).catch(function (e) { setMoveBusy(false); hwxFail(notify, 'mover serviços', e, true); });
      };

      var zonas = props.zonas;
      var outrasCats = delCat ? cats.filter(function (x) { return x.id !== delCat.cat.id; }) : [];

      return React.createElement('div', null,
        React.createElement(HxHead, { title: 'Ajustes' }),
        !row && !cfg.failed && React.createElement('div', { style: { background: HX.warnBg, border: '1px solid ' + HX.warn, color: HX.warnText, borderRadius: 10, padding: '10px 12px', marginBottom: 12, fontSize: 14, fontWeight: 600 } },
          'Ainda não guardado — estes são os valores por defeito. A linha só é criada na primeira gravação.'),
        cfg.failed && React.createElement(HxEmpty, {
          icon: '⚠️', text: 'Não consegui ler os ajustes', sub: 'Por segurança não deixo gravar sem os ler primeiro.',
          action: React.createElement(HxBtn, { label: 'Tentar de novo', onClick: props.onReload })
        }),
        !cfg.failed && React.createElement('div', null,
          React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: statusCor, marginBottom: 10 }, role: 'status' }, statusText),
          React.createElement(HxSection, { title: 'Limite anual' },
            React.createElement(HxField, { label: 'Limite anual (CHF)', value: limite, inputMode: 'decimal', onChange: setLimite, error: errs.limite })
          ),
          React.createElement(HxSection, { title: 'Preço base (só para mim)' },
            React.createElement(HxField, { label: 'Preço base por hora (CHF)', value: base, inputMode: 'decimal', onChange: setBase, error: errs.base, hint: 'Usado para sugerir preços a partir das horas de referência. Nunca aparece em ofertas, impressões nem WhatsApp.' })
          ),
          React.createElement(HxSection, { title: 'Agenda' },
            React.createElement(HxDate, { label: 'Sexta de referência da semana A', value: refA, error: errs.refA, onChange: setRefA }),
            errs.refA && React.createElement('div', { style: Object.assign({}, HXS.err, { marginTop: -8, marginBottom: 12 }) }, errs.refA),
            React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginTop: -6, marginBottom: 12 } }, 'A letra A/B é a da semana do calendário, igual para todas as sextas: A se o número de semanas desde esta sexta for par, B se for ímpar.'),
            React.createElement(HxField, { label: 'Horas que quero trabalhar por sexta', value: horasSex, inputMode: 'decimal', onChange: setHorasSex, error: errs.horas, hint: temHoras ? 'Usado na barra "X de N h ocupadas" da Agenda.' : 'Só grava depois de correres sql/27_hwx_agenda.sql (até lá a Agenda usa 8 h).' })
          ),
          React.createElement(HxSection, { title: 'Zonas de deslocação' },
            React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginBottom: 10 } }, 'Valor sugerido para a deslocação (podes mudar em cada oferta)'),
            zonas.length === 0 && React.createElement('div', { style: { fontSize: 14, color: HX.muted, marginBottom: 10 } }, 'Sem zonas. Toca em "+ Nova zona" para criar.'),
            zonas.map(function (z) {
              return React.createElement('div', { key: z.nome, style: { display: 'flex', gap: 8, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid ' + HX.border } },
                React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                  React.createElement('div', { style: { fontWeight: 700, wordBreak: 'break-word' } }, z.nome),
                  React.createElement('div', { style: { fontSize: 13, color: HX.muted } }, hwxZonaTexto(hwxZonaNorm(z)),
                    hwxZonaNorm(z).confirmar ? React.createElement(HxPill, { text: 'Confirma o tipo', color: HX.warn }) : null),
                  hwxZonaAvisoBase(hwxZonaNorm(z).tipo, hwxZonaNorm(z).valor, hwxNum(base) || 0) && React.createElement(HxAviso, { text: HWX_ZONA_AVISO })
                ),
                React.createElement(HxBtn, { label: '✏️', aria: 'Editar zona ' + z.nome, onClick: function () { setSub({ kind: 'zona', editing: z }); } }),
                React.createElement(HxBtn, { label: '🗑️', kind: 'danger', aria: 'Apagar zona ' + z.nome, onClick: function () { delZona(z); } })
              );
            }),
            React.createElement('div', { style: { marginTop: 10 } }, React.createElement(HxBtn, { label: '+ Nova zona', onClick: function () { setSub({ kind: 'zona', editing: null }); }, full: true }))
          ),
          React.createElement(HxSection, { title: 'Categorias de serviços' },
            cats.map(function (c, i) {
              return React.createElement('div', { key: c.id, style: { display: 'flex', gap: 6, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid ' + HX.border } },
                React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                  React.createElement('div', { style: { fontWeight: 700, wordBreak: 'break-word' } }, c.nome),
                  React.createElement('div', { style: { fontSize: 12, color: HX.muted } }, c.id)
                ),
                React.createElement(HxBtn, { label: '↑', aria: 'Subir ' + c.nome, disabled: i === 0, onClick: function () { moveCat(i, -1); } }),
                React.createElement(HxBtn, { label: '↓', aria: 'Descer ' + c.nome, disabled: i === cats.length - 1, onClick: function () { moveCat(i, 1); } }),
                React.createElement(HxBtn, { label: '✏️', aria: 'Editar categoria ' + c.nome, onClick: function () { setSub({ kind: 'cat', editing: c }); } }),
                React.createElement(HxBtn, { label: '🗑️', kind: 'danger', aria: 'Apagar categoria ' + c.nome, onClick: function () { startDelCat(c); } })
              );
            }),
            React.createElement('div', { style: { marginTop: 10 } }, React.createElement(HxBtn, { label: '+ Nova categoria', onClick: function () { setSub({ kind: 'cat', editing: null }); }, full: true }))
          ),
          React.createElement(HxSection, { title: 'Os meus dados (quem emite)' },
            React.createElement(HxField, { label: 'Nome', info: 'O teu nome: aparece nas ofertas e assina as mensagens.', placeholder: 'ex.: Patricio Carvalho', value: rem.nome, onChange: function (v) { updRem('nome', v); } }),
            React.createElement(HxField, { label: 'Rua', value: rem.rua, onChange: function (v) { updRem('rua', v); } }),
            React.createElement(HxRow, { cols: 2 },
              React.createElement(HxField, { label: 'PLZ', value: rem.plz, inputMode: 'numeric', onChange: function (v) { updRem('plz', v); }, warn: hwxPlzWarn(rem.plz) }),
              React.createElement(HxField, { label: 'Localidade', value: rem.ort, onChange: function (v) { updRem('ort', v); } })
            ),
            React.createElement(HxRow, { cols: 2 },
              React.createElement(HxField, { label: 'Telefone', value: rem.telefone, type: 'tel', inputMode: 'tel', onChange: function (v) { updRem('telefone', v); } }),
              React.createElement(HxField, { label: 'E-mail', value: rem.email, type: 'email', inputMode: 'email', onChange: function (v) { updRem('email', v); }, error: errs.email })
            )
          ),
          React.createElement(HxSection, { title: 'Offerte (impressão)' },
            React.createElement(HxFormToggle, { label: "Mostrar 'Nicht MWST-pflichtig' na Offerte", value: mwst, onChange: setMwst }),
            React.createElement('div', { style: { fontSize: 13, color: HX.muted } }, 'Ligado: a linha aparece pequena por baixo do TOTAL na impressão.')
          ),
          React.createElement(HxBtn, { label: '✓ Guardar agora', big: true, full: true, kind: 'primary', onClick: function () { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } doSave(); } })
        ),
        delCat && React.createElement(HxModal, { title: 'Apagar categoria "' + delCat.cat.nome + '"' },
          React.createElement('div', { style: { fontSize: 15, marginBottom: 12, color: HX.muted } }, 'Esta categoria tem ' + delCat.n + ' serviço(s). Para onde os queres mover? Só apago a categoria depois de os mover.'),
          outrasCats.length === 0
            ? React.createElement('div', { style: { color: HX.warnText, marginBottom: 12 } }, 'Não há outra categoria. Cria primeiro uma nova categoria.')
            : React.createElement(HxSelect, { label: 'Mover os serviços para', value: moveTo, onChange: setMoveTo, options: outrasCats.map(function (x) { return { v: x.id, l: x.nome }; }) }),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } },
            React.createElement(HxBtn, { label: 'Cancelar', onClick: function () { setDelCat(null); }, disabled: moveBusy }),
            React.createElement(HxBtn, { label: moveBusy ? 'A mover…' : 'Mover e apagar', kind: 'danger', onClick: confirmDelCat, disabled: moveBusy || !moveTo })
          )
        )
      );
    }

    // ── OFERTAS (hwx_ofertas) ──
    function hwxClienteSnap(c) {
      if (!c) return {};
      return {
        numero: c.numero, nome: c.nome || '', firma: c.firma || '', rua: c.rua || '', plz: c.plz || '', ort: c.ort || '',
        contacto_nome: c.contacto_nome || '', contacto_telemovel: c.contacto_telemovel || '', contacto_telefone: c.contacto_telefone || '', contacto_email: c.contacto_email || '',
        telemovel: c.telemovel || '', lingua: c.lingua || 'de'
      };
    }
    function hwxLocalSnap(l) {
      if (!l) return {};
      return { sub_numero: l.sub_numero, nome: l.nome || '', rua: l.rua || '', plz: l.plz || '', ort: l.ort || '', zona: l.zona || '' };
    }
    // Zona da oferta: a do local; se não houver, a por defeito do cliente
    function hwxZonaDe(cli, loc, zonas) {
      var nome = (loc && loc.zona) || (cli && cli.zona) || '';
      if (!nome) return { nome: '', info: null };
      return { nome: nome, info: hwxZonaPorNome(zonas, nome) };
    }
    function hwxOfertaTituloCliente(o) {
      var cs = o.cliente_snap || {};
      var nome = cs.firma || cs.nome || '';
      var s = cs.numero != null ? '#' + cs.numero + ' ' + nome : nome;
      var ls = o.local_snap || {};
      if (ls.sub_numero != null) s += ' · ' + cs.numero + '.' + ls.sub_numero + ' ' + (ls.rua || ls.nome || '');
      return s.trim();
    }
    function hwxOf0(r) {
      var linhas = ((r && r.linhas) || []).map(function (l) {
        return { k: hwxNewKey(), tipo: l.tipo || 'livre', servico_id: l.servico_id || null, descricao: l.descricao || '', unidade: l.unidade || 'fixo',
          qtd: String(l.qtd == null ? '' : l.qtd), preco: String(l.preco == null ? '' : l.preco), acrescimo_hora: Number(l.acrescimo_hora) || 0 };
      });
      return {
        cliente_id: r && r.cliente_id ? r.cliente_id : '', local_id: r && r.local_id ? r.local_id : '',
        titulo: r ? r.titulo || '' : '', data: r ? r.data : hwxToday(), valida_ate: r ? (r.valida_ate || '') : hwxAddDays(hwxToday(), 30),
        lingua: r ? r.lingua || 'de' : 'de', estado: r ? r.estado : 'rascunho', enviada_em: r ? r.enviada_em || null : null, respondida_em: r ? r.respondida_em || null : null,
        linhas: linhas, desconto_tipo: r ? r.desconto_tipo || 'chf' : 'chf', desconto_valor: r && Number(r.desconto_valor) ? String(r.desconto_valor) : '',
        notas_cliente: r ? r.notas_cliente || '' : '', notas_internas: r ? r.notas_internas || '' : '',
        zona_over: r && r.zona_snap && r.zona_snap.manual ? { nome: r.zona_snap.nome || '', tipo: r.zona_snap.tipo, valor: Number(r.zona_snap.valor) || 0, manual: true } : null
      };
    }

    // Escolher serviços da tabela de preços (ativos, sazonais na época e sob consulta)
    function HwxPicker(props) {
      var pctx = React.useContext(HxCtx);
      React.useEffect(function () {
        pctx.ui.formOpen(true);
        return function () { pctx.ui.formOpen(false); };
      }, []);
      var _q = React.useState(''); var q = _q[0], setQ = _q[1];
      var _c = React.useState('all'); var cat = _c[0], setCat = _c[1];
      var _n = React.useState(0); var n = _n[0], setN = _n[1];
      var nq = hwxNorm(q).trim();
      var items = props.servicos.filter(function (s) {
        var ef = hwxEfEstado(s);
        if (ef === 'arquivado' || ef === 'pausado') return false;
        if (ef === 'sazonal' && hwxForaEpoca(s)) return false;
        if (cat !== 'all' && s.categoria !== cat) return false;
        if (nq && hwxNorm(s.nome).indexOf(nq) === -1) return false;
        return true;
      }).sort(function (a, b) { return ((a.ordem || 0) - (b.ordem || 0)) || hwxCmpText(a.nome, b.nome); });
      var catOpts = [{ v: 'all', l: 'Todas' }].concat(props.cats.map(function (c) { return { v: c.id, l: c.nome }; }));
      return React.createElement('div', null,
        React.createElement(HxHead, { title: 'Da tabela de preços', back: props.onBack }),
        React.createElement(HxField, { label: 'Pesquisar por nome', value: q, onChange: setQ, placeholder: 'nome do serviço' }),
        React.createElement(HxSelect, { label: 'Categoria', value: cat, onChange: setCat, options: catOpts }),
        n > 0 && React.createElement('div', { style: { fontSize: 14, color: HX.okText, fontWeight: 700, marginBottom: 8 } }, n + ' linha(s) adicionada(s) à oferta'),
        items.length === 0 && React.createElement(HxEmpty, { icon: '🔎', text: 'Nenhum serviço disponível' }),
        items.map(function (s) {
          return React.createElement('div', { key: s.id, style: Object.assign({}, HXS.card, { display: 'flex', gap: 10, alignItems: 'center' }) },
            React.createElement('div', { style: { flex: 1, minWidth: 0 } },
              React.createElement('div', { style: { fontWeight: 700, wordBreak: 'break-word' } }, s.nome),
              React.createElement('div', { style: { fontSize: 14, color: HX.muted } }, hwxPriceText(s)),
              s.estado === 'consulta' && React.createElement('div', { style: { fontSize: 13, color: HX.warnText } }, 'Pede o preço depois de adicionar')
            ),
            React.createElement(HxBtn, { label: '+ Adicionar', aria: 'Adicionar ' + s.nome, onClick: function () { props.onAdd(s); setN(n + 1); } })
          );
        }),
        React.createElement('div', { style: { height: 12 } }),
        React.createElement(HxBtn, { label: '✓ Concluir', kind: 'primary', big: true, full: true, onClick: props.onBack })
      );
    }

    // Validação da oferta (usada pelo Guardar e pelo rascunho automático)
    // Valida as linhas do editor (oferta, trabalho, série): { errs: {chave: {descricao, qtd, preco}}, msgs: [...] }
    function hwxLinhasValidar(linhas) {
      var errs = {}, msgs = [];
      (linhas || []).forEach(function (l, i) {
        var le = {}, n = 'Linha #' + (i + 1) + ': ';
        if (!String(l.descricao || '').trim()) { le.descricao = 'Indica a descrição.'; msgs.push(n + 'falta a descrição'); }
        var q = hwxNum(l.qtd), pr = hwxNum(l.preco);
        if (q === null || q <= 0 || q > 99999) { le.qtd = 'Quantidade inválida.'; msgs.push(n + (String(l.qtd || '').trim() === '' ? 'falta a quantidade' : 'quantidade inválida')); }
        if (pr === null || pr < 0 || pr > 99999999.99) { le.preco = 'Indica o preço.'; msgs.push(n + (String(l.preco || '').trim() === '' ? 'falta o preço' : 'preço inválido')); }
        if (le.descricao || le.qtd || le.preco) errs[l.k] = le;
      });
      return { errs: errs, msgs: msgs };
    }
    // Linhas do editor → linhas gravadas (preços congelados, total por linha)
    function hwxLinhasGravar(linhas) {
      return (linhas || []).map(function (l) {
        return {
          tipo: l.tipo, servico_id: l.servico_id || null, descricao: String(l.descricao).trim(), unidade: l.unidade,
          qtd: hwxNum(l.qtd), preco: hwxFromRappen(hwxToRappen(hwxNum(l.preco))), acrescimo_hora: Number(l.acrescimo_hora) || 0,
          total: hwxFromRappen(hwxLinhaTotalR(l))
        };
      });
    }
    function hwxOfValidar(f) {
      var e = { linhas: {} }, msgs = [];
      if (!f.cliente_id) { e.cliente = 'Escolhe o cliente.'; msgs.push('Falta: cliente'); }
      if (!f.data) { e.data = 'Indica a data.'; msgs.push('Falta: data'); }
      if (f.valida_ate && f.data && f.valida_ate < f.data) { e.valida = 'A validade não pode ser antes da data.'; msgs.push('A validade não pode ser antes da data'); }
      var lv = hwxLinhasValidar(f.linhas);
      e.linhas = lv.errs; msgs = msgs.concat(lv.msgs);
      var dv = f.desconto_valor === '' ? 0 : hwxNum(f.desconto_valor);
      if (dv === null || dv < 0 || (f.desconto_tipo === 'pct' && dv > 100)) { e.desconto = f.desconto_tipo === 'pct' ? 'Desconto entre 0 e 100 %.' : 'Desconto inválido.'; msgs.push('Desconto inválido'); }
      var ok = !(e.cliente || e.data || e.valida || e.desconto || Object.keys(e.linhas).length);
      return { e: e, msgs: msgs, ok: ok };
    }

    // Criar um cliente sem sair da oferta (modal). Grava em hwx_clientes (o número vem do trigger).
    function HwxClienteRapido(props) {
      var notify = props.notify, zonas = props.zonas;
      var _f = React.useState({ nome: props.nome0 || '', tel: '', rua: '', plz: '', ort: '', zona: '', lingua: 'de' });
      var f = _f[0], setF = _f[1];
      var _er = React.useState({}); var errs = _er[0], setErrs = _er[1];
      var _b = React.useState(false); var busy = _b[0], setBusy = _b[1];
      var _m = React.useState(''); var msg = _m[0], setMsg = _m[1];
      var busyRef = React.useRef(false);
      var alive = React.useRef(true);
      React.useEffect(function () { alive.current = true; return function () { alive.current = false; }; }, []);
      var upd = function (k, v) { setF(function (p) { var n = Object.assign({}, p); n[k] = v; return n; }); };
      var ag = hwxUseAddrGuard(notify);
      var updA = function (k) { return function (v, ev) { if (ag.bloqueia(ev)) return; upd(k, v); }; };
      hwxUseEsc(function () { if (!busyRef.current) props.onCancel(); });
      var save = function () {
        if (busyRef.current) return;
        var nome = String(f.nome || '').trim();
        var e = {};
        if (!nome) e.nome = 'Indica o nome do cliente.';
        setErrs(e);
        if (e.nome) { setMsg('Falta: nome do cliente'); hwxScrollErr(); return; }
        setMsg('');
        var t = function (k) { return String(f[k] || '').trim(); };
        var payload = {
          nome: nome, lingua: f.lingua, zona: f.zona || '', estado: 'ativo', firma: '', rua: t('rua'), plz: t('plz'), ort: t('ort'),
          contacto_nome: '', contacto_telemovel: t('tel'), contacto_telefone: '', contacto_email: '', notas: ''
        };
        busyRef.current = true; setBusy(true);
        // erros ficam no próprio modal (e no console); o "Gravado ✓" genérico é substituído por "Cliente #N criado ✓"
        var qn = function (kind, text) { if (kind === 'error') setMsg(text); };
        hwxWrite('hwx_clientes', null, payload, qn, function (row) {
          props.onCreated(row);
          notify('ok', 'Cliente #' + row.numero + ' criado ✓');
        }, function () {
          busyRef.current = false;
          if (alive.current) setBusy(false);
        });
      };
      return React.createElement(HxModal, { title: 'Novo cliente' },
        msg && React.createElement('div', { role: 'alert', style: { background: HX.badBg, border: '1px solid ' + HX.bad, color: HX.badText, borderRadius: 8, padding: '8px 10px', marginBottom: 12, fontSize: 14, fontWeight: 600 } }, '⚠️ ' + msg),
        React.createElement(HxField, { label: 'Nome', value: f.nome, onChange: function (v) { upd('nome', v); }, error: errs.nome, onEnter: save }),
        React.createElement(HxField, { label: 'Telemóvel', value: f.tel, type: 'tel', inputMode: 'tel', onChange: function (v) { upd('tel', v); }, placeholder: '079 123 45 67', onEnter: save }),
        React.createElement(HxField, { label: 'Rua', value: f.rua, onChange: updA('rua'), onEnter: save }),
        React.createElement(HxRow, { cols: 2 },
          React.createElement(HxField, { label: 'PLZ', value: f.plz, inputMode: 'numeric', onChange: updA('plz'), warn: hwxPlzWarn(f.plz), onEnter: save }),
          React.createElement(HxField, { label: 'Localidade', value: f.ort, onChange: updA('ort'), onEnter: save })
        ),
        React.createElement(HxRow, { cols: 2 },
          React.createElement(HxSelect, { label: 'Zona', warn: hwxZonaLocalAviso(f.zona, f.ort), value: f.zona, options: hwxZonaOpts(zonas, f.zona, '— sem zona —'), onChange: function (v) { ag.zona(); upd('zona', v); } }),
          React.createElement(HxSelect, { label: 'Língua', value: f.lingua, options: HWX_LANGS, onChange: function (v) { upd('lingua', v); } })
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 } },
          React.createElement(HxBtn, { label: 'Cancelar', onClick: props.onCancel, disabled: busy }),
          React.createElement(HxBtn, { label: busy ? 'A gravar…' : '✓ Guardar', kind: 'primary', onClick: save, disabled: busy })
        )
      );
    }

    // Mudar a zona SÓ desta oferta (ou também nos Ajustes, se a caixa estiver ligada)
    function HwxZonaOferta(props) {
      var zonas = props.zonas, at = props.atual;
      var _f = React.useState({ nome: at.nome || '', tipo: at.tipo || 'incluida', valor: at.tipo && at.tipo !== 'incluida' ? String(at.valor) : '', gravar: false });
      var f = _f[0], setF = _f[1];
      var _er = React.useState(''); var err = _er[0], setErr = _er[1];
      var _b = React.useState(false); var busy = _b[0], setBusy = _b[1];
      var alive = React.useRef(true);
      React.useEffect(function () { alive.current = true; return function () { alive.current = false; }; }, []);
      hwxUseEsc(function () { if (!busy) props.onCancel(); });
      var upd = function (k, v) { setF(function (p) { var n = Object.assign({}, p); n[k] = v; return n; }); };
      var escolher = function (nome) {
        var z = hwxZonaPorNome(zonas, nome);
        setF(z ? { nome: nome, tipo: z.tipo, valor: z.tipo === 'incluida' ? '' : String(z.valor), gravar: false }
               : { nome: nome, tipo: 'incluida', valor: '', gravar: false });
      };
      var val = f.tipo === 'incluida' ? 0 : hwxNum(f.valor);
      var zAj = hwxZonaPorNome(zonas, f.nome);
      var difere = !!zAj && (zAj.tipo !== f.tipo || (val !== null && hwxToRappen(zAj.valor) !== hwxToRappen(val)));
      var apply = function () {
        if (busy) return;
        if (val === null || val < 0 || val > 99999999.99) { setErr('Valor inválido (ex.: 10 ou 7,50).'); hwxScrollErr(); return; }
        setErr('');
        var res = { nome: f.nome, tipo: f.tipo, valor: f.tipo === 'incluida' ? 0 : hwxFromRappen(hwxToRappen(val)), manual: true };
        if (f.gravar && difere) {
          setBusy(true);
          props.saveCfg({ zonas: zonas.map(function (x) { return x.nome === f.nome ? { nome: x.nome, valor: res.valor, tipo: res.tipo } : x; }) }, function () {
            props.onApply(res);
          }, function () {
            if (alive.current) { setBusy(false); setErr('Não gravado nos Ajustes — vê o aviso. A zona desta oferta não mudou.'); }
          });
          return;
        }
        props.onApply(res);
      };
      return React.createElement(HxModal, { title: 'Zona desta oferta' },
        err && React.createElement('div', { role: 'alert', style: { background: HX.badBg, border: '1px solid ' + HX.bad, color: HX.badText, borderRadius: 8, padding: '8px 10px', marginBottom: 12, fontSize: 14, fontWeight: 600 } }, '⚠️ ' + err),
        React.createElement(HxSelect, { label: 'Zona', value: f.nome, options: hwxZonaOpts(zonas, f.nome, '— sem zona —'), onChange: escolher }),
        React.createElement(HxSelect, { label: 'Tipo de deslocação (só esta oferta)', value: f.tipo, options: HWX_ZONA_TIPOS, onChange: function (v) { upd('tipo', v); } }),
        f.tipo !== 'incluida' && React.createElement(HxField, { label: f.tipo === 'acrescimo_hora' ? 'Valor (CHF por hora)' : 'Valor (CHF por ida)', value: f.valor, inputMode: 'decimal', onChange: function (v) { upd('valor', v); }, hint: 'Valor sugerido para a deslocação (podes mudar em cada oferta)', warn: hwxZonaAvisoBase(f.tipo, val, props.precoBase), onEnter: apply }),
        difere && React.createElement(HxFormToggle, { label: 'Guardar também nos Ajustes', value: f.gravar, onChange: function (v) { upd('gravar', v); } }),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 } },
          React.createElement(HxBtn, { label: 'Cancelar', onClick: props.onCancel, disabled: busy }),
          React.createElement(HxBtn, { label: busy ? 'A gravar…' : '✓ Aplicar', kind: 'primary', onClick: apply, disabled: busy })
        )
      );
    }

    // Se o cliente tem exatamente UM local de trabalho, esse local vem escolhido por defeito (vários ou nenhum: não)
    function hwxLocalUnico(locais, clienteId) {
      var ls = locais.filter(function (l) { return l.cliente_id === clienteId; });
      return ls.length === 1 ? ls[0] : null;
    }
    // ── Linhas (tabela de preços, linha livre, Anfahrt) — partilhado pela oferta e pelo trabalho ──
    // A Anfahrt é SEMPRE uma linha própria; a zona só sugere. Linhas abertas para edição (syncOn = false) só mudam
    // quando mudas a zona (cliente/local/Mudar), nunca ao editar linhas.
    function hwxUseLinhasOps(setF, zRef, syncOn, precoBase) {
      var dismissedRef = React.useRef(false);
      var withSync = function (n) { return syncOn ? hwxSyncAnfahrt(n, zRef.current, dismissedRef.current) : n; };
      var zonaMudou = function (n, zi) { dismissedRef.current = false; return hwxSyncAnfahrt(n, zi, false); };
      var updLinha = function (k, campo, v) {
        setF(function (p) {
          return withSync(Object.assign({}, p, { linhas: p.linhas.map(function (l) {
            if (l.k !== k) return l;
            var n = Object.assign({}, l); n[campo] = v;
            if (l.tipo === 'anfahrt') n.auto = false;
            // linha livre "por hora" / "por 30 min" com o preço vazio: sugere o preço base dos Ajustes (nunca escreve por cima)
            if (campo === 'unidade' && l.tipo === 'livre' && String(l.preco == null ? '' : l.preco).trim() === '' && precoBase > 0) {
              if (v === 'hora') n.preco = hwxFromRappen(hwxToRappen(precoBase)).toFixed(2);
              else if (v === '30min') n.preco = hwxFromRappen(Math.round(hwxToRappen(precoBase) / 2)).toFixed(2);
            }
            return n;
          }) }));
        });
      };
      var setModoAnf = function (k, modo) {
        setF(function (p) {
          return Object.assign({}, p, { linhas: p.linhas.map(function (l) {
            if (l.k !== k) return l;
            var h = hwxHorasTrabalho(p.linhas);
            return Object.assign({}, l, { unidade: modo, qtd: modo === 'fixo' ? '1' : (h > 0 ? String(h) : ''), auto: false });
          }) });
        });
      };
      var delLinha = function (k) {
        setF(function (p) {
          var gone = p.linhas.filter(function (l) { return l.k === k; })[0];
          if (gone && gone.tipo === 'anfahrt') dismissedRef.current = true;
          return withSync(Object.assign({}, p, { linhas: p.linhas.filter(function (l) { return l.k !== k; }) }));
        });
      };
      var moveLinha = function (k, dir) {
        setF(function (p) {
          var arr = p.linhas.slice(), i = -1;
          arr.forEach(function (l, ix) { if (l.k === k) i = ix; });
          var j = i + dir;
          if (i < 0 || j < 0 || j >= arr.length) return p;
          var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
          return Object.assign({}, p, { linhas: arr });
        });
      };
      // a linha Anfahrt automática fica sempre no fim: as novas entram antes dela
      var addLinha = function (l) {
        setF(function (p) {
          var arr = p.linhas.slice(), last = arr[arr.length - 1];
          if (last && last.tipo === 'anfahrt' && last.auto) arr.splice(arr.length - 1, 0, l); else arr.push(l);
          return withSync(Object.assign({}, p, { linhas: arr }));
        });
      };
      var addServico = function (sv) {
        var usaMin = HWX_UNITS_MIN.indexOf(sv.unidade) !== -1;
        addLinha({
          k: hwxNewKey(), tipo: 'servico', servico_id: sv.id, descricao: sv.nome, unidade: sv.unidade,
          qtd: String(usaMin && sv.minimo != null && Number(sv.minimo) > 0 ? Number(sv.minimo) : 1),
          preco: sv.estado === 'consulta' ? '' : String(sv.preco), acrescimo_hora: 0
        });
      };
      var addLivre = function () {
        addLinha({ k: hwxNewKey(), tipo: 'livre', servico_id: null, descricao: '', unidade: 'fixo', qtd: '1', preco: '', acrescimo_hora: 0 });
      };
      var addAnfahrt = function () {
        setF(function (p) { return Object.assign({}, p, { linhas: p.linhas.concat([{ k: hwxNewKey(), tipo: 'anfahrt', servico_id: null, descricao: 'Anfahrt', unidade: 'fixo', qtd: '1', preco: '', acrescimo_hora: 0, auto: false }]) }); });
      };
      return { withSync: withSync, zonaMudou: zonaMudou, updLinha: updLinha, setModoAnf: setModoAnf, delLinha: delLinha, moveLinha: moveLinha, addLinha: addLinha, addServico: addServico, addLivre: addLivre, addAnfahrt: addAnfahrt };
    }

    // Secção "Linhas" do editor. o = { linhas, errs, ops, servicos, precoBase, onPick }
    function hwxRenderLinhas(o) {
      var linhas = o.linhas, ops = o.ops, servicos = o.servicos, linhaErr = (o.errs && o.errs.linhas) || {};
      var horasTrab = hwxHorasTrabalho(linhas);
      var lineBox = { background: HX.surface2, border: '1px solid ' + HX.border, borderRadius: 10, padding: 10, marginBottom: 10 };
      var anfBox = Object.assign({}, lineBox, { background: '#2b2b2b', borderLeft: '4px solid ' + HX.muted });
      var lineHead = { fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: HX.muted, marginBottom: 6 };
      var lineFoot = function (l, idx, totalR) {
        return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          React.createElement('div', { style: { flex: 1, fontWeight: 800, fontSize: 17 } }, 'Total ' + hwxChf(hwxFromRappen(totalR))),
          React.createElement(HxBtn, { label: '↑', aria: 'Subir linha ' + (idx + 1), disabled: idx === 0, onClick: function () { ops.moveLinha(l.k, -1); } }),
          React.createElement(HxBtn, { label: '↓', aria: 'Descer linha ' + (idx + 1), disabled: idx === linhas.length - 1, onClick: function () { ops.moveLinha(l.k, 1); } }),
          React.createElement(HxBtn, { label: '🗑️', kind: 'danger', aria: 'Apagar linha ' + (idx + 1), onClick: function () { ops.delLinha(l.k); } })
        );
      };
      return React.createElement(HxSection, { title: 'Linhas' },
        linhas.length === 0 && React.createElement('div', { style: { fontSize: 14, color: HX.muted, marginBottom: 10 } }, 'Ainda sem linhas.'),
        linhas.map(function (l, idx) {
          var le = linhaErr[l.k] || {};
          var totalR = hwxLinhaTotalR(l);
          if (l.tipo === 'anfahrt') {
            var porHora = l.unidade === 'hora';
            var prAnf = hwxNum(l.preco);
            var pareceTrabalho = prAnf !== null && prAnf >= hwxLimiteTaxa(o.precoBase);
            return React.createElement('div', { key: l.k, style: anfBox },
              React.createElement('div', { style: lineHead }, '#' + (idx + 1) + ' · 🚗 Anfahrt' + (l.auto ? ' · sugerida pela zona' : '')),
              React.createElement(HxField, { label: 'Descrição', info: 'Texto da linha de deslocação.', placeholder: 'Anfahrt', value: l.descricao, onChange: function (v) { ops.updLinha(l.k, 'descricao', v); }, error: le.descricao }),
              React.createElement(HxRow, { cols: porHora ? 3 : 2 },
                React.createElement(HxSelect, { label: 'Tipo', value: porHora ? 'hora' : 'fixo', options: [{ v: 'hora', l: 'Por hora' }, { v: 'fixo', l: 'Valor fixo (pauschal)' }], onChange: function (v) { ops.setModoAnf(l.k, v); } }),
                porHora && React.createElement(HxField, { label: 'Horas', value: l.qtd, inputMode: 'decimal', onChange: function (v) { ops.updLinha(l.k, 'qtd', v); }, error: le.qtd }),
                React.createElement(HxField, { label: porHora ? 'Preço por hora (CHF)' : 'Valor (CHF)', value: l.preco, inputMode: 'decimal', onChange: function (v) { ops.updLinha(l.k, 'preco', v); }, error: le.preco, })
              ),
              pareceTrabalho && React.createElement(HxAviso, { text: "Isto parece trabalho, não deslocação — para o trabalho usa '+ Linha livre' ou '+ Da tabela de preços' (uma taxa de deslocação a partir de CHF " + HWX_TAXA_AVISO + " parece trabalho)" }),
              porHora && React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginBottom: 8 } }, 'Horas do trabalho (linhas por hora e por 30 min): ' + hwxQty(horasTrab)),
              lineFoot(l, idx, totalR)
            );
          }
          var sv = l.servico_id ? servicos.filter(function (s) { return s.id === l.servico_id; })[0] : null;
          var qn = hwxNum(l.qtd);
          var minimo = sv && HWX_UNITS_MIN.indexOf(l.unidade) !== -1 && sv.minimo != null ? Number(sv.minimo) : 0;
          var abaixo = minimo > 0 && qn !== null && qn < minimo;
          var acr = Number(l.acrescimo_hora) || 0;
          var acrUnit = l.unidade === '30min' ? acr / 2 : acr;
          return React.createElement('div', { key: l.k, style: lineBox },
            React.createElement('div', { style: lineHead }, '#' + (idx + 1) + ' · ' + (l.tipo === 'servico' ? 'Da tabela' : 'Linha livre')),
            React.createElement(HxField, { label: 'Descrição', value: l.descricao, onChange: function (v) { ops.updLinha(l.k, 'descricao', v); }, error: le.descricao }),
            React.createElement(HxRow, { cols: 3 },
              React.createElement(HxField, { label: 'Quantidade', value: l.qtd, inputMode: 'decimal', onChange: function (v) { ops.updLinha(l.k, 'qtd', v); }, error: le.qtd }),
              React.createElement(HxSelect, { label: 'Unidade', value: l.unidade, options: HWX_UNITS.map(function (u) { return { v: u.v, l: u.l }; }), onChange: function (v) { ops.updLinha(l.k, 'unidade', v); } }),
              React.createElement(HxField, { label: o.precoLabel || 'Preço (CHF, só nesta oferta)', value: l.preco, inputMode: 'decimal', onChange: function (v) { ops.updLinha(l.k, 'preco', v); }, error: le.preco, placeholder: sv && sv.estado === 'consulta' ? 'sob consulta: indica o preço' : 'ex.: 35,00' })
            ),
            abaixo && React.createElement('div', { style: Object.assign({}, HXS.warn, { marginBottom: 8 }) },
              '⚠️ Abaixo do mínimo deste serviço (' + hwxQty(minimo) + '). ',
              React.createElement('button', { type: 'button', onClick: function () { ops.updLinha(l.k, 'qtd', String(minimo)); }, style: { minHeight: 44, background: 'transparent', border: '1px solid ' + HX.warn, borderRadius: 8, color: HX.warnText, fontWeight: 700, padding: '0 12px', cursor: 'pointer', fontFamily: 'inherit' } }, 'Usar o mínimo')
            ),
            acr > 0 && React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginBottom: 8 } }, hwxChf(hwxNum(l.preco) || 0).slice(4) + ' + ' + hwxChf(acrUnit).slice(4) + ' Anfahrt (linha antiga, gravada assim)'),
            lineFoot(l, idx, totalR)
          );
        }),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
          React.createElement(HxBtn, { label: '+ Da tabela de preços', onClick: o.onPick }),
          React.createElement(HxBtn, { label: '+ Linha livre', onClick: ops.addLivre })
        ),
        React.createElement('div', { style: { marginTop: 8 } }, React.createElement(HxBtn, { label: '+ Anfahrt', full: true, onClick: ops.addAnfahrt }))
      );
    }

    // Cliente (pesquisa + lista de toque + "+ Criar cliente"), local e zona — partilhado pela oferta, pelo trabalho e pelas séries
    // props: f {cliente_id, local_id, zona_over}, cli, clientes, locais, zonas, zonaNome, zonaInfo, errCliente, comZona, extraCliente,
    //        onCliente(id, row), onLocal(id), onZonaApply(res), onClienteCriado(row), notify, saveCfg, precoBase
    function HwxClienteLocal(props) {
      var clientes = props.clientes, locais = props.locais, f = props.f, cli = props.cli;
      var _cs = React.useState(''); var cq = _cs[0], setCq = _cs[1];
      var _cp = React.useState(!f.cliente_id); var cliPick = _cp[0], setCliPick = _cp[1];
      var _nc = React.useState(null); var novoCli = _nc[0], setNovoCli = _nc[1];
      var _zm = React.useState(false); var zonaModal = _zm[0], setZonaModal = _zm[1];
      var tokens = hwxNorm(cq).split(/\s+/).filter(Boolean);
      var cqTxt = cq.trim();
      var matches = clientes.filter(function (c) {
        if (c.estado === 'arquivado') return false;
        return !tokens.length || hwxClienteMatch(c, locais.filter(function (l) { return l.cliente_id === c.id; }), tokens);
      }).sort(function (a, b) { return (a.numero || 0) - (b.numero || 0); });
      var cliNome = function (c) { return '#' + c.numero + ' ' + (c.firma || c.nome); };
      var escolhendo = cliPick || !f.cliente_id;
      var pick = function (id, row) { props.onCliente(id, row); setCliPick(false); setCq(''); };
      var clienteBloco = escolhendo
        ? React.createElement('div', { 'data-hwx-err': props.errCliente ? '1' : undefined, style: props.errCliente ? { border: '1px solid ' + HX.bad, borderRadius: 10, padding: 8, marginBottom: 12 } : { marginBottom: 4 } },
            React.createElement(HxField, { label: 'Procurar cliente', value: cq, onChange: setCq, placeholder: 'nº, nome ou firma' }),
            props.errCliente && React.createElement('div', { style: Object.assign({}, HXS.err, { marginTop: -8, marginBottom: 8 }) }, props.errCliente),
            matches.slice(0, 8).map(function (c) {
              var cp = [c.plz, c.ort].filter(Boolean).join(' ');
              return React.createElement('button', {
                key: c.id, type: 'button', onClick: function () { pick(c.id); },
                style: { display: 'block', width: '100%', minHeight: 44, textAlign: 'left', background: HX.surface2, border: '1px solid ' + HX.borderStrong, borderRadius: 8, padding: '8px 12px', marginBottom: 6, color: HX.text, cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 700 }
              }, cliNome(c), cp && React.createElement('span', { style: { display: 'block', fontSize: 13, color: HX.muted, fontWeight: 400 } }, cp));
            }),
            matches.length > 8 && React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginBottom: 6 } }, '+ ' + (matches.length - 8) + ' cliente(s) — escreve para filtrar'),
            cqTxt && matches.length === 0 && React.createElement(HxBtn, { label: '+ Criar cliente "' + cqTxt + '"', full: true, onClick: function () { setNovoCli({ nome: cqTxt }); } }),
            f.cliente_id && React.createElement('div', { style: { marginTop: 6 } }, React.createElement(HxBtn, { label: 'Manter o cliente atual', onClick: function () { setCliPick(false); setCq(''); } }))
          )
        : React.createElement('div', { style: { marginBottom: 12 } },
            React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'center', background: HX.surface2, border: '1px solid ' + HX.borderStrong, borderRadius: 10, padding: '8px 12px' } },
              React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                React.createElement('div', { style: { fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: HX.muted } }, 'Cliente'),
                React.createElement('div', { style: { fontWeight: 800, fontSize: 17, wordBreak: 'break-word' } }, cli ? cliNome(cli) : '…')
              ),
              React.createElement(HxBtn, { label: 'Mudar', aria: 'Mudar de cliente', onClick: function () { setCliPick(true); } })
            ),
            props.extraCliente ? React.createElement('div', { style: { marginTop: 8 } }, props.extraCliente) : null
          );
      var meusLocais = f.cliente_id ? locais.filter(function (l) { return l.cliente_id === f.cliente_id; }).sort(function (a, b) { return a.sub_numero - b.sub_numero; }) : [];
      var locOpts = [{ v: '', l: 'Morada de quem paga' }].concat(meusLocais.map(function (l) { return { v: l.id, l: (cli ? cli.numero + '.' : '') + l.sub_numero + ' ' + (l.rua || l.nome) }; }));
      var comZona = props.comZona !== false;
      var semTel = props.avisoTel !== false && !escolhendo && cli && !(hwxPhone(cli.telemovel) || hwxPhone(cli.contacto_telemovel));
      return React.createElement('div', null,
        clienteBloco,
        semTel && React.createElement(HxAviso, { text: 'O cliente #' + cli.numero + ' não tem telemóvel: não consigo abrir o WhatsApp. Podes juntá-lo na ficha do cliente.' }),
        f.cliente_id && React.createElement(HxSelect, { label: 'Local de trabalho', value: f.local_id, options: locOpts, onChange: props.onLocal }),
        comZona && f.cliente_id && React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' } },
          React.createElement('div', { style: { flex: 1, minWidth: 0, fontSize: 14, color: HX.muted } },
            props.zonaNome ? ('Zona: ' + props.zonaNome + ' · ' + (props.zonaInfo ? hwxZonaTexto(props.zonaInfo) : 'não existe nos Ajustes — sem deslocação')) : 'Sem zona — sem deslocação',
            f.zona_over ? React.createElement(HxPill, { text: 'escolhida nesta oferta' }) : null),
          React.createElement(HxBtn, { label: '✏️ Mudar', aria: 'Mudar a zona desta oferta', onClick: function () { setZonaModal(true); } })
        ),
        novoCli && React.createElement(HwxClienteRapido, {
          nome0: novoCli.nome, zonas: props.zonas, notify: props.notify,
          onCancel: function () { setNovoCli(null); },
          onCreated: function (row) { props.onClienteCriado(row); setNovoCli(null); pick(row.id, row); }
        }),
        zonaModal && React.createElement(HwxZonaOferta, {
          zonas: props.zonas, precoBase: props.precoBase, saveCfg: props.saveCfg,
          atual: props.zonaInfo ? { nome: props.zonaNome, tipo: props.zonaInfo.tipo, valor: props.zonaInfo.valor } : { nome: '', tipo: 'incluida', valor: 0 },
          onCancel: function () { setZonaModal(false); },
          onApply: function (res) { setZonaModal(false); props.onZonaApply(res); }
        })
      );
    }

    function HwxOfertaForm(props) {
      var notify = props.notify, editing = props.editing, clientes = props.clientes, locais = props.locais, servicos = props.servicos, zonas = props.zonas;
      var snap = React.useRef(hwxOf0(editing)).current;
      var _f = React.useState(snap);
      var f = _f[0], setF = _f[1];
      var _sr = React.useState(editing || null);
      var savedRow = _sr[0], setSavedRow = _sr[1];
      var _er = React.useState({}); var errs = _er[0], setErrs = _er[1];
      var _b = React.useState(false); var busy = _b[0], setBusy = _b[1];
      var _ab = React.useState(false); var autoBusy = _ab[0], setAutoBusy = _ab[1];
      var _pk = React.useState(false); var picking = _pk[0], setPicking = _pk[1];
      var _ca = React.useState(false); var cancelAsk = _ca[0], setCancelAsk = _ca[1];
      var _gv = React.useState(''); var gravadoTxt = _gv[0], setGravadoTxt = _gv[1];
      var _kk = React.useState(0); var kick = _kk[0], setKick = _kk[1];
      var _au = React.useState(false); var atualizando = _au[0], setAtualizando = _au[1];
      var busyRef = React.useRef(false);
      var pendingRef = React.useRef(null);
      var fRef = React.useRef(f); fRef.current = f;
      var savedRowRef = React.useRef(editing || null);
      var savedSnapRef = React.useRef(snap);
      var zRef = React.useRef(null);
      var cliRef = React.useRef(null);
      var doSaveRef = React.useRef(null);
      var autoRef = React.useRef(null);
      var alive = React.useRef(true);
      React.useEffect(function () { alive.current = true; return function () { alive.current = false; }; }, []);
      var upd = function (k, v) { setF(function (p) { var n = Object.assign({}, p); n[k] = v; return n; }); };

      var cliLista = clientes.filter(function (c) { return c.id === f.cliente_id; })[0] || null;
      if (cliLista) cliRef.current = cliLista;
      // se a lista estiver a recarregar e deixar de ter o cliente, mantém o último conhecido (nunca volta a "escolhe o cliente")
      var cli = cliLista || (f.cliente_id && cliRef.current && cliRef.current.id === f.cliente_id ? cliRef.current : null);
      var loc = f.local_id ? (locais.filter(function (l) { return l.id === f.local_id; })[0] || null) : null;
      var base = savedRow;
      // Oferta já enviada/aceite/recusada com a mesma seleção: mantém a zona fotografada
      var congelada = base && base.estado !== 'rascunho' && f.cliente_id === (base.cliente_id || '') && f.local_id === (base.local_id || '') && base.zona_snap && base.zona_snap.nome;
      var zonaLive = hwxZonaDe(cli, loc, zonas);
      var over = f.zona_over;
      var zonaInfo = over ? hwxZonaNorm(over) : (congelada ? hwxZonaNorm(base.zona_snap) : zonaLive.info);
      var zonaNome = over ? over.nome : (congelada ? base.zona_snap.nome : zonaLive.nome);
      zRef.current = zonaInfo;

      var ops = hwxUseLinhasOps(setF, zRef, !editing, props.precoBase);
      var onCliente = function (id, row) {
        setF(function (p) {
          var c2 = row || clientes.filter(function (c) { return c.id === id; })[0];
          var l1 = hwxLocalUnico(locais, id);
          var n = Object.assign({}, p, { cliente_id: id, local_id: l1 ? l1.id : '', zona_over: null });
          if (c2 && !editing) n.lingua = c2.lingua || 'de';
          return ops.zonaMudou(n, hwxZonaDe(c2 || null, l1, zonas).info);
        });
      };
      var onLocal = function (id) {
        setF(function (p) {
          var l2 = id ? (locais.filter(function (l) { return l.id === id; })[0] || null) : null;
          return ops.zonaMudou(Object.assign({}, p, { local_id: id, zona_over: null }), hwxZonaDe(cli, l2, zonas).info);
        });
      };
      var onZonaApply = function (res) { setF(function (p) { return ops.zonaMudou(Object.assign({}, p, { zona_over: res }), hwxZonaNorm(res)); }); };

      var tot = hwxOfertaTotais(f.linhas, f.desconto_tipo, f.desconto_valor);

      // Grava (insere ou atualiza). quiet = rascunho automático (sem "Gravado ✓" em banner; erros continuam visíveis)
      var persist = function (ff, quiet, ok, fail) {
        var b = savedRowRef.current;
        var refresh = !b || b.estado === 'rascunho' || ff.cliente_id !== (b.cliente_id || '') || ff.local_id !== (b.local_id || '');
        var tt = hwxOfertaTotais(ff.linhas, ff.desconto_tipo, ff.desconto_valor);
        var dv = ff.desconto_valor === '' ? 0 : hwxNum(ff.desconto_valor);
        var linhas = ff.linhas.map(function (l) {
          return {
            tipo: l.tipo, servico_id: l.servico_id || null, descricao: String(l.descricao).trim(), unidade: l.unidade,
            qtd: hwxNum(l.qtd), preco: hwxFromRappen(hwxToRappen(hwxNum(l.preco))), acrescimo_hora: Number(l.acrescimo_hora) || 0,
            total: hwxFromRappen(hwxLinhaTotalR(l))
          };
        });
        var ov = ff.zona_over;
        var zsnap = ov ? { nome: ov.nome, tipo: ov.tipo, valor: ov.valor, manual: true }
          : (refresh ? (zonaInfo ? { nome: zonaNome, tipo: zonaInfo.tipo, valor: zonaInfo.valor } : {}) : b.zona_snap);
        var payload = {
          cliente_id: ff.cliente_id || null, local_id: ff.local_id || null,
          cliente_snap: refresh ? hwxClienteSnap(cli) : b.cliente_snap,
          local_snap: refresh ? hwxLocalSnap(loc) : b.local_snap,
          zona_snap: zsnap,
          titulo: String(ff.titulo || '').trim(), data: ff.data, valida_ate: ff.valida_ate || null, estado: ff.estado, lingua: ff.lingua,
          linhas: linhas, desconto_tipo: ff.desconto_tipo, desconto_valor: hwxFromRappen(hwxToRappen(dv)), total: hwxFromRappen(tt.total),
          notas_cliente: String(ff.notas_cliente || '').trim(), notas_internas: String(ff.notas_internas || '').trim(),
          enviada_em: ff.enviada_em, respondida_em: ff.respondida_em
        };
        busyRef.current = true;
        if (quiet) setAutoBusy(true); else setBusy(true);
        var wn = quiet ? function (kind, text) { if (kind !== 'ok') notify(kind, text); } : notify;
        hwxWrite('hwx_ofertas', b ? b.id : null, payload, wn, function (row) {
          savedRowRef.current = row;
          savedSnapRef.current = ff;
          if (alive.current) setSavedRow(row);
          if (row.estado !== payload.estado) {
            notify('error', 'A base gravou o estado "' + row.estado + '" em vez de "' + payload.estado + '". Confirma o estado e grava outra vez.');
          } else if (alive.current) {
            var d = new Date();
            setGravadoTxt(('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2));
          }
          props.onSaved(row, !b);
          if (ok) ok(); else if (!quiet) props.onClose();
        }, function (success) {
          busyRef.current = false;
          if (alive.current) { setBusy(false); setAutoBusy(false); }
          if (!success && fail) fail();
          if (pendingRef.current) {
            var pd = pendingRef.current; pendingRef.current = null;
            setTimeout(function () { if (doSaveRef.current) doSaveRef.current(pd.ok, pd.fail); }, 0);
          } else if (alive.current) setKick(function (x) { return x + 1; });
        });
      };

      var doSave = function (ok, fail) {
        if (busyRef.current) { pendingRef.current = { ok: ok, fail: fail }; return; }
        var v = hwxOfValidar(f);
        setErrs(v.e);
        if (!v.ok) { hwxReportErrs(notify, v.msgs); if (fail) fail(); return; }
        persist(f, false, ok, fail);
      };
      doSaveRef.current = doSave;

      // Rascunho automático: só em ofertas novas, com cliente e pelo menos uma linha (válidas); nunca cria ofertas vazias
      autoRef.current = function () {
        if (busyRef.current) return;
        var ff = fRef.current;
        if (!ff.cliente_id) return;
        if (!ff.linhas.some(function (l) { return !(l.tipo === 'anfahrt' && l.auto); })) return;
        if (!hwxOfValidar(ff).ok) return;
        if (JSON.stringify(ff) === JSON.stringify(savedSnapRef.current)) return;
        persist(ff, true);
      };
      var fJson = JSON.stringify(f);
      React.useEffect(function () {
        if (editing) return undefined;
        var t = setTimeout(function () { if (autoRef.current) autoRef.current(); }, 1200);
        return function () { clearTimeout(t); };
      }, [fJson, kick]);

      hwxUseDirty('oferta', savedSnapRef.current, f, doSave);
      var tryClose = function () {
        if (busy) return;
        if (cancelAsk) { setCancelAsk(false); return; }
        if (picking) { setPicking(false); return; }
        if (!editing && savedRowRef.current) { setCancelAsk(true); return; }
        props.guard.attempt(props.onClose, ['oferta']);
      };
      hwxUseEsc(tryClose);

      var manterRascunho = function () {
        setCancelAsk(false);
        var dirty = JSON.stringify(f) !== JSON.stringify(savedSnapRef.current);
        if (!dirty) { props.onClose(); return; }
        if (!hwxOfValidar(f).ok) {
          notify('warn', 'Mantive o último rascunho gravado — as últimas alterações estavam incompletas.');
          props.onClose(); return;
        }
        doSave(function () { props.onClose(); }, function () {});
      };
      var apagarRascunho = function () {
        var b = savedRowRef.current;
        if (busyRef.current) { notify('warn', 'A gravar… tenta outra vez dentro de um segundo.'); return; }
        setCancelAsk(false);
        if (!b) { props.onClose(); return; }
        hwxRemove('hwx_ofertas', b.id, notify, function () { props.onDeleted(b.id); props.onClose(); }, function () {});
      };

      // ↻ Atualizar dados do cliente (só rascunhos): volta a copiar os dados ATUAIS do cliente, do local e da zona
      // para cliente_snap, local_snap e zona_snap. Lê sempre da base (a lista do ecrã pode estar desatualizada).
      var atualizarDados = function () {
        if (atualizando || busyRef.current || !f.cliente_id) return;
        if (!window.supabaseClient) { hwxFail(notify, 'atualizar dados do cliente', { message: 'Sem ligação à base de dados.' }, false); return; }
        var cid = f.cliente_id, lid = f.local_id, over0 = f.zona_over;
        setAtualizando(true);
        var fim = function () { if (alive.current) setAtualizando(false); };
        var falha = function (e) { hwxFail(notify, 'atualizar dados do cliente', e, false); fim(); };
        var aplicar = function (cRow, lRow, zs) {
          var zi = hwxZonaDe(cRow, lRow, zs);
          var zsnap = over0 ? { nome: over0.nome, tipo: over0.tipo, valor: over0.valor, manual: true }
            : (zi.info ? { nome: zi.nome, tipo: zi.info.tipo, valor: zi.info.valor } : {});
          props.reloadLists();
          var b = savedRowRef.current;
          if (!b) { fim(); notify('ok', 'Dados atualizados ✓'); return; }
          var quiet = function (kind, text) { if (kind !== 'ok') notify(kind, text); };
          hwxWrite('hwx_ofertas', b.id, { cliente_snap: hwxClienteSnap(cRow), local_snap: hwxLocalSnap(lRow), zona_snap: zsnap }, quiet, function (row) {
            savedRowRef.current = row;
            if (alive.current) setSavedRow(row);
            props.onSaved(row, false);
            notify('ok', 'Dados atualizados ✓');
          }, fim);
        };
        var comLocal = function (cRow, lRow) {
          window.supabaseClient.from('hwx_config').select('zonas').order('created_at', { ascending: true }).limit(1).then(function (r3) {
            if (r3.error) { falha(r3.error); return; }
            var cfgRow = r3.data && r3.data[0];
            aplicar(cRow, lRow, cfgRow && Array.isArray(cfgRow.zonas) ? cfgRow.zonas : zonas);
          }).catch(falha);
        };
        window.supabaseClient.from('hwx_clientes').select('*').eq('id', cid).then(function (r1) {
          if (r1.error) { falha(r1.error); return; }
          var cRow = r1.data && r1.data[0];
          if (!cRow) { falha({ message: 'o cliente já não existe.' }); return; }
          if (!lid) { comLocal(cRow, null); return; }
          window.supabaseClient.from('hwx_locais').select('*').eq('id', lid).then(function (r2) {
            if (r2.error) { falha(r2.error); return; }
            comLocal(cRow, r2.data && r2.data[0] ? r2.data[0] : null);
          }).catch(falha);
        }).catch(falha);
      };
      var podeAtualizar = f.estado === 'rascunho' && (!savedRow || savedRow.estado === 'rascunho');

      if (picking) {
        return React.createElement(HwxPicker, { servicos: servicos, cats: props.cats, onAdd: ops.addServico, onBack: function () { setPicking(false); } });
      }

      var agora = function () { return new Date().toISOString(); };
      var setEstado = function (estado) {
        setF(function (p) {
          var n = Object.assign({}, p, { estado: estado });
          if (estado === 'enviada') { n.enviada_em = agora(); n.respondida_em = null; }
          else if (estado === 'rascunho') { n.enviada_em = null; n.respondida_em = null; }
          else { n.respondida_em = agora(); if (!n.enviada_em) n.enviada_em = null; }
          return n;
        });
      };

      var enter = function () { doSave(); };
      var estadoInfo = f.estado === 'enviada' && f.enviada_em ? 'Enviada em ' + new Date(f.enviada_em).toLocaleString('de-CH')
        : (f.estado === 'aceite' || f.estado === 'recusada') && f.respondida_em ? hwxLabel(HWX_OF_ESTADOS, f.estado) + ' em ' + new Date(f.respondida_em).toLocaleString('de-CH') : hwxLabel(HWX_OF_ESTADOS, f.estado);
      var statusLinha = autoBusy ? 'A gravar rascunho…' : gravadoTxt ? 'Gravado ✓ ' + gravadoTxt : (!editing ? 'O rascunho grava-se sozinho quando houver cliente e linhas.' : '');

      return React.createElement(HxFormShell, { title: savedRow ? 'Editar oferta ' + savedRow.numero : 'Nova oferta', onCancel: tryClose, onSave: function () { doSave(); }, busy: busy },
        React.createElement('div', { role: 'status', style: { fontSize: 13, color: gravadoTxt && !autoBusy ? HX.okText : HX.muted, marginBottom: 10, minHeight: 18 } }, statusLinha),
        React.createElement(HxSection, { title: 'Cliente e local' },
          React.createElement(HwxClienteLocal, {
            f: f, cli: cli, clientes: clientes, locais: locais, zonas: zonas, zonaNome: zonaNome, zonaInfo: zonaInfo, errCliente: errs.cliente,
            notify: notify, saveCfg: props.saveCfg, precoBase: props.precoBase,
            onCliente: onCliente, onLocal: onLocal, onZonaApply: onZonaApply, onClienteCriado: function (row) { cliRef.current = row; props.onClienteCriado(row); },
            extraCliente: podeAtualizar ? React.createElement(HxBtn, { label: atualizando ? 'A atualizar…' : '↻ Atualizar dados do cliente', full: true, disabled: atualizando, onClick: atualizarDados }) : null
          })
        ),
        React.createElement(HxSection, { title: 'Oferta' },
          React.createElement(HxField, { label: 'Título', value: f.titulo, onChange: function (v) { upd('titulo', v); }, placeholder: 'ex.: Gartenpflege Frühling', onEnter: enter }),
          React.createElement(HxRow, { cols: 2 },
            React.createElement(HxDate, { label: 'Data', value: f.data, error: errs.data, onChange: function (v) { upd('data', v); } }),
            React.createElement(HxDate, { label: 'Válida até', value: f.valida_ate, error: errs.valida, onChange: function (v) { upd('valida_ate', v); } })
          ),
          (errs.data || errs.valida) && React.createElement('div', { style: Object.assign({}, HXS.err, { marginTop: -8, marginBottom: 12 }) }, errs.data || errs.valida),
          React.createElement(HxSelect, { label: 'Língua', value: f.lingua, options: HWX_LANGS, onChange: function (v) { upd('lingua', v); } })
        ),
        hwxRenderLinhas({ linhas: f.linhas, errs: errs, ops: ops, servicos: servicos, precoBase: props.precoBase, onPick: function () { setPicking(true); } }),
        React.createElement(HxSection, { title: 'Desconto e total' },
          React.createElement(HxRow, { cols: 2 },
            React.createElement(HxSelect, { label: 'Desconto', value: f.desconto_tipo, options: [{ v: 'chf', l: 'em CHF' }, { v: 'pct', l: 'em %' }], onChange: function (v) { upd('desconto_tipo', v); } }),
            React.createElement(HxField, { label: f.desconto_tipo === 'pct' ? 'Valor (%)' : 'Valor (CHF)', value: f.desconto_valor, inputMode: 'decimal', onChange: function (v) { upd('desconto_valor', v); }, error: errs.desconto, placeholder: '0' })
          ),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 15, padding: '4px 0' } }, React.createElement('span', null, 'Subtotal'), React.createElement('span', null, hwxChf(hwxFromRappen(tot.sub)))),
          tot.desc > 0 && React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 15, padding: '4px 0', color: HX.muted } }, React.createElement('span', null, 'Desconto'), React.createElement('span', null, '− ' + hwxChf(hwxFromRappen(tot.desc)))),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 22, fontWeight: 800, padding: '8px 0 0', borderTop: '1px solid ' + HX.borderStrong, marginTop: 6 } }, React.createElement('span', null, 'TOTAL'), React.createElement('span', null, hwxChf(hwxFromRappen(tot.total))))
        ),
        React.createElement(HxSection, { title: 'Notas' },
          React.createElement(HxField, { label: 'Notas para o cliente (impressas)', value: f.notas_cliente, multiline: true, onChange: function (v) { upd('notas_cliente', v); } }),
          React.createElement(HxField, { label: 'Notas internas (só para mim — nunca impressas nem enviadas)', value: f.notas_internas, multiline: true, onChange: function (v) { upd('notas_internas', v); } })
        ),
        React.createElement(HxSection, { title: 'Estado' },
          React.createElement('div', { style: { marginBottom: 10 } }, React.createElement(HxPill, { text: estadoInfo, color: HWX_OF_COR[f.estado] })),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 } },
            f.estado === 'rascunho' && React.createElement(HxBtn, { label: 'Marcar como enviada', onClick: function () { setEstado('enviada'); } }),
            f.estado !== 'aceite' && React.createElement(HxBtn, { label: 'Aceite', onClick: function () { setEstado('aceite'); } }),
            f.estado !== 'recusada' && React.createElement(HxBtn, { label: 'Recusada', onClick: function () { setEstado('recusada'); } }),
            f.estado !== 'rascunho' && React.createElement(HxBtn, { label: 'Voltar a rascunho', onClick: function () { setEstado('rascunho'); } })
          ),
          React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginTop: 8 } }, 'O estado escolhido grava-se com a oferta (Guardar ou rascunho automático).')
        ),
        cancelAsk && React.createElement(HxModal, { title: 'Esta oferta já está gravada como rascunho' },
          React.createElement('div', { style: { fontSize: 15, color: HX.muted, marginBottom: 14 } }, 'Queres manter o rascunho ou apagá-lo?'),
          React.createElement('div', { style: { display: 'grid', gap: 10 } },
            React.createElement(HxBtn, { label: 'Manter rascunho', kind: 'primary', full: true, onClick: manterRascunho }),
            React.createElement(HxBtn, { label: 'Apagar', kind: 'danger', full: true, onClick: apagarRascunho }),
            React.createElement(HxBtn, { label: 'Continuar a editar', full: true, onClick: function () { setCancelAsk(false); } })
          )
        )
      );
    }

    // ══════════════ FASE 3: TRABALHOS, AGENDA E SÉRIES (hwx_trabalhos, hwx_series) ══════════════
    function hwxReplaceRow(list, row) {
      list.setRows(function (prev) {
        var arr = prev || [], found = false;
        var out = arr.map(function (r) { if (r.id === row.id) { found = true; return row; } return r; });
        if (!found) out.push(row);
        return out;
      });
    }
    function hwxLinhasForm(linhas) {
      return (linhas || []).map(function (l) {
        return { k: hwxNewKey(), tipo: l.tipo || 'livre', servico_id: l.servico_id || null, descricao: l.descricao || '', unidade: l.unidade || 'fixo',
          qtd: String(l.qtd == null ? '' : l.qtd), preco: String(l.preco == null ? '' : l.preco), acrescimo_hora: Number(l.acrescimo_hora) || 0 };
      });
    }
    // Estado inicial do editor de trabalho: r = linha gravada; p = pré-preenchimento (novo trabalho); estado = forçar (ex.: "Feito")
    function hwxTrab0(r, p, estado) {
      var src = r || p || {};
      var f = {
        cliente_id: src.cliente_id || '', local_id: src.local_id || '', data: r ? r.data : (p && p.data) || hwxProximaSexta(hwxToday()),
        hora: hwxHora(src.hora), titulo: src.titulo || '', estado: r ? r.estado : (p && p.estado) || 'planeado',
        linhas: hwxLinhasForm(src.linhas),
        horas_reais: src.horas_reais != null && src.horas_reais !== '' ? String(src.horas_reais) : '',
        material: Number(src.material) ? String(src.material) : '', pago: !!(r && r.pago), data_pago: (r && r.data_pago) || '',
        notas_cliente: src.notas_cliente || '', notas_internas: src.notas_internas || '',
        desconto_tipo: 'chf', desconto_valor: '', zona_over: null,
        oferta_id: src.oferta_id || null, serie_id: src.serie_id || null, data_serie: src.data_serie || null,
        incluido: !!src.incluido_pauschale
      };
      if (estado) f.estado = estado;
      if (f.estado === 'feito' && f.horas_reais === '') { var h = hwxHorasTrabalho(f.linhas); if (h > 0) f.horas_reais = String(h); else if (src.horas_previstas) f.horas_reais = String(src.horas_previstas); }
      return f;
    }
    function hwxTrabValidar(f) {
      var v = hwxOfValidar(f);
      var hr = String(f.horas_reais || '').trim() === '' ? 0 : hwxNum(f.horas_reais);
      if (hr === null || hr < 0 || hr > 9999.99) { v.e.horas = 'Horas inválidas (ex.: 3 ou 2,5).'; v.msgs.push('Horas reais inválidas'); v.ok = false; }
      var mt = String(f.material || '').trim() === '' ? 0 : hwxNum(f.material);
      if (mt === null || mt < 0 || mt > 99999999.99) { v.e.material = 'Material inválido (ex.: 20 ou 12,50).'; v.msgs.push('Material inválido'); v.ok = false; }
      return v;
    }
    function hwxTrabTotais(f) {
      var sub = 0;
      (f.linhas || []).forEach(function (l) { sub += hwxLinhaTotalR(l); });
      var mat = hwxToRappen(hwxNum(f.material) || 0);
      return { sub: sub, mat: mat, total: f.incluido ? 0 : sub + mat };
    }
    // Pré-preenchimento de uma ocorrência de série (linha do serviço da série, se houver)
    function hwxPresetDeSerie(se, data, servicos, cliente) {
      var linhas = [];
      var sv = se.servico_id ? servicos.filter(function (s) { return s.id === se.servico_id; })[0] : null;
      if (Array.isArray(se.linhas) && se.linhas.length) {
        linhas = se.linhas.map(function (l) { return Object.assign({}, l); });
      } else if (sv) {
        var usaMin = HWX_UNITS_MIN.indexOf(sv.unidade) !== -1;
        var q = sv.unidade === 'hora' ? (Number(se.horas_previstas) || (sv.minimo != null ? Number(sv.minimo) : 0) || 1)
          : sv.unidade === '30min' ? (Number(se.horas_previstas) ? Number(se.horas_previstas) * 2 : (sv.minimo != null ? Number(sv.minimo) : 0) || 1)
          : (usaMin && sv.minimo != null && Number(sv.minimo) > 0 ? Number(sv.minimo) : 1);
        linhas.push({ tipo: 'servico', servico_id: sv.id, descricao: sv.nome, unidade: sv.unidade, qtd: q, preco: sv.estado === 'consulta' ? '' : sv.preco, acrescimo_hora: 0 });
      }
      return { serie_id: se.id, data_serie: data, data: data, hora: se.hora, cliente_id: se.cliente_id, local_id: se.local_id, titulo: se.descricao || '', linhas: linhas, horas_previstas: se.horas_previstas, notas_cliente: '', notas_internas: se.notas || '', incluido_pauschale: !!se.incluido_pauschale };
    }
    // Mover/cancelar/concluir UMA data de uma série: uma só linha por (serie_id, data_serie) — atualiza a que existir, senão insere
    function hwxUpsertExcecao(payload, notify, onOk, onEnd) {
      if (!hwxPreWrite(notify, 'gravar hwx_trabalhos', onEnd)) return;
      window.supabaseClient.from('hwx_trabalhos').select('*').eq('serie_id', payload.serie_id).eq('data_serie', payload.data_serie).then(function (res) {
        if (res.error) { hwxFail(notify, 'gravar hwx_trabalhos', res.error, true); onEnd(false); return; }
        var ex = res.data && res.data[0];
        hwxWrite('hwx_trabalhos', ex ? ex.id : null, payload, notify, onOk, onEnd);
      }).catch(function (e) { hwxFail(notify, 'gravar hwx_trabalhos', e, true); onEnd(false); });
    }

    // Botões em segmentos (44 px)
    function HxSeg(props) {
      return React.createElement('div', { role: 'group', 'aria-label': props.aria, style: { display: 'grid', gridTemplateColumns: 'repeat(' + props.items.length + ', minmax(0, 1fr))', gap: 6, marginBottom: props.tight ? 0 : 12 } },
        props.items.map(function (it) {
          var on = props.value === it.v;
          return React.createElement('button', {
            key: it.v, type: 'button', 'aria-pressed': on, onClick: function () { props.onChange(it.v); },
            style: { minHeight: 44, borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: on ? HX.text : HX.surface2, color: on ? '#000' : HX.text, border: '1px solid ' + (on ? HX.text : HX.borderStrong) }
          }, it.l);
        })
      );
    }

    function HwxTrabalhoForm(props) {
      var notify = props.notify, editing = props.editing, clientes = props.clientes, locais = props.locais, servicos = props.servicos, zonas = props.zonas;
      var snap = React.useRef(hwxTrab0(editing, props.preset, props.estado)).current;
      var _f = React.useState(snap);
      var f = _f[0], setF = _f[1];
      var _sr = React.useState(editing || null);
      var savedRow = _sr[0], setSavedRow = _sr[1];
      var _er = React.useState({}); var errs = _er[0], setErrs = _er[1];
      var _b = React.useState(false); var busy = _b[0], setBusy = _b[1];
      var _pk = React.useState(false); var picking = _pk[0], setPicking = _pk[1];
      var _as = React.useState(null); var ask = _as[0], setAsk = _as[1];
      var askedRef = React.useRef('');
      var busyRef = React.useRef(false);
      var savedRowRef = React.useRef(editing || null);
      var savedSnapRef = React.useRef(snap);
      var zRef = React.useRef(null);
      var cliRef = React.useRef(null);
      var alive = React.useRef(true);
      React.useEffect(function () { alive.current = true; return function () { alive.current = false; }; }, []);
      var upd = function (k, v) { setF(function (p) { var n = Object.assign({}, p); n[k] = v; return n; }); };

      var cliLista = clientes.filter(function (c) { return c.id === f.cliente_id; })[0] || null;
      if (cliLista) cliRef.current = cliLista;
      var cli = cliLista || (f.cliente_id && cliRef.current && cliRef.current.id === f.cliente_id ? cliRef.current : null);
      var loc = f.local_id ? (locais.filter(function (l) { return l.id === f.local_id; })[0] || null) : null;
      var zonaLive = hwxZonaDe(cli, loc, zonas);
      var over = f.zona_over;
      var zonaInfo = over ? hwxZonaNorm(over) : zonaLive.info;
      var zonaNome = over ? over.nome : zonaLive.nome;
      zRef.current = zonaInfo;
      // Trabalho de SÉRIE: a Anfahrt nunca entra sozinha (nem ao abrir, nem ao editar, nem ao mudar de local/zona);
      // a zona só a sugere e é o utilizador que a aceita. Nos outros trabalhos mantém-se a Anfahrt automática pela zona.
      var semAuto = !!snap.serie_id;
      var ops = hwxUseLinhasOps(setF, zRef, !editing && !semAuto, props.precoBase);
      var zm = function (n, zi) { return semAuto ? n : ops.zonaMudou(n, zi); };
      // trabalho novo com cliente já escolhido (oferta aceite): a zona sugere a Anfahrt à entrada
      React.useEffect(function () {
        if (editing || semAuto || !f.cliente_id) return;
        setF(function (p) { return zm(p, zRef.current); });
      }, []);
      var onCliente = function (id, row) {
        setF(function (p) {
          var c2 = row || clientes.filter(function (c) { return c.id === id; })[0];
          var l1 = hwxLocalUnico(locais, id);
          return zm(Object.assign({}, p, { cliente_id: id, local_id: l1 ? l1.id : '', zona_over: null }), hwxZonaDe(c2 || null, l1, zonas).info);
        });
      };
      var onLocal = function (id) {
        setF(function (p) {
          var l2 = id ? (locais.filter(function (l) { return l.id === id; })[0] || null) : null;
          return zm(Object.assign({}, p, { local_id: id, zona_over: null }), hwxZonaDe(cli, l2, zonas).info);
        });
      };
      var onZonaApply = function (res) { setF(function (p) { return zm(Object.assign({}, p, { zona_over: res }), hwxZonaNorm(res)); }); };
      // série: sugestão de Anfahrt (nunca acrescentada sozinha)
      var sugAnf = semAuto && !f.incluido && f.estado !== 'cancelado' && !f.linhas.some(function (l) { return l.tipo === 'anfahrt'; }) ? hwxAnfahrtSug(zonaInfo, f.linhas) : null;
      var aceitarAnf = function () {
        if (!sugAnf) return;
        setF(function (p) {
          if (p.linhas.some(function (l) { return l.tipo === 'anfahrt'; })) return p;
          return Object.assign({}, p, { linhas: p.linhas.concat([{ k: hwxNewKey(), tipo: 'anfahrt', servico_id: null, descricao: 'Anfahrt', unidade: sugAnf.unidade, qtd: sugAnf.qtd, preco: sugAnf.preco, acrescimo_hora: 0, auto: false }]) });
        });
      };

      var tot = hwxTrabTotais(f);
      var persist = function (ff, ok, fail) {
        var b = savedRowRef.current;
        var refresh = !b || b.estado === 'planeado' || ff.cliente_id !== (b.cliente_id || '') || ff.local_id !== (b.local_id || '');
        var tt = hwxTrabTotais(ff);
        var linhas = hwxLinhasGravar(ff.linhas);
        var hr = String(ff.horas_reais || '').trim() === '' ? null : hwxNum(ff.horas_reais);
        var payload = {
          cliente_id: ff.cliente_id || null, local_id: ff.local_id || null,
          cliente_snap: refresh ? hwxClienteSnap(cli) : b.cliente_snap, local_snap: refresh ? hwxLocalSnap(loc) : b.local_snap,
          oferta_id: ff.oferta_id || null, serie_id: ff.serie_id || null, data_serie: ff.serie_id ? ff.data_serie : null,
          data: ff.data, hora: ff.hora || null, estado: ff.estado, titulo: String(ff.titulo || '').trim(), linhas: linhas,
          horas_reais: hr === null ? null : Math.round(hr * 100) / 100, material: hwxFromRappen(hwxToRappen(hwxNum(ff.material) || 0)), total: hwxFromRappen(tt.total),
          pago: !ff.incluido && !!ff.pago, data_pago: !ff.incluido && ff.pago ? (ff.data_pago || hwxToday()) : null,
          notas_cliente: String(ff.notas_cliente || '').trim(), notas_internas: String(ff.notas_internas || '').trim()
        };
        // coluna do SQL 28: só vai na gravação quando é preciso (marcada, ou a linha já a tem) — assim nada muda antes do SQL
        if (ff.incluido || (b && 'incluido_pauschale' in b)) payload.incluido_pauschale = !!ff.incluido;
        busyRef.current = true; setBusy(true);
        var onOk = function (row) {
          savedRowRef.current = row; savedSnapRef.current = ff;
          if (alive.current) setSavedRow(row);
          if (row.estado !== payload.estado) notify('error', 'A base gravou o estado "' + row.estado + '" em vez de "' + payload.estado + '". Confirma o estado e grava outra vez.');
          props.onSaved(row, !b);
          if (ok) ok(); else props.onClose();
        };
        var onEnd = function (success) {
          busyRef.current = false;
          if (alive.current) setBusy(false);
          if (!success && fail) fail();
        };
        if (!b && payload.serie_id) hwxUpsertExcecao(payload, notify, onOk, onEnd);
        else hwxWrite('hwx_trabalhos', b ? b.id : null, payload, notify, onOk, onEnd);
      };
      var doSave = function (ok, fail) {
        if (busyRef.current) return;
        var v = hwxTrabValidar(f);
        setErrs(v.e);
        if (!v.ok) { hwxReportErrs(notify, v.msgs); if (fail) fail(); return; }
        persist(f, ok, fail);
      };
      hwxUseDirty('trabalho', savedSnapRef.current, f, doSave);
      var tryClose = function () {
        if (busy) return;
        if (picking) { setPicking(false); return; }
        props.guard.attempt(props.onClose, ['trabalho']);
      };
      hwxUseEsc(tryClose);

      if (picking) {
        return React.createElement(HwxPicker, { servicos: servicos, cats: props.cats, onAdd: ops.addServico, onBack: function () { setPicking(false); } });
      }
      var setEstado = function (estado) {
        setF(function (p) {
          var n = Object.assign({}, p, { estado: estado });
          if (estado === 'feito' && String(p.horas_reais || '').trim() === '') { var h = hwxHorasTrabalho(p.linhas); if (h > 0) n.horas_reais = String(h); }
          return n;
        });
      };
      // Ao pôr as horas reais de um trabalho "Feito" com UMA linha por hora (ou por 30 min) que não bate certo: pergunta se atualiza
      var onHorasBlur = function () {
        if (f.estado !== 'feito') return;
        var h = String(f.horas_reais || '').trim() === '' ? null : hwxNum(f.horas_reais);
        if (h === null || h <= 0 || askedRef.current === String(f.horas_reais)) return;
        var el = f.linhas.filter(function (l) { return l.tipo !== 'anfahrt' && (l.unidade === 'hora' || l.unidade === '30min'); });
        if (el.length !== 1) return;
        var l = el[0], q = hwxNum(l.qtd), cur = q === null ? null : (l.unidade === 'hora' ? q : q / 2);
        if (cur !== null && Math.abs(cur - h) < 0.005) return;
        askedRef.current = String(f.horas_reais);
        setAsk({ k: l.k, desc: l.descricao || '(sem descrição)', h: h, unidade: l.unidade });
      };
      var duplicar = function () {
        var b = savedRowRef.current;
        if (!b || busyRef.current) return;
        props.guard.attempt(function () { props.onDuplicar(b); }, ['trabalho']);
      };
      var serie = f.serie_id ? (props.series || []).filter(function (s) { return s.id === f.serie_id; })[0] : null;
      var horasLinhas = hwxHorasTrabalho(f.linhas);
      // avisos do dia: sexta cheia (B6) e cliente já com trabalho nesse dia (B9)
      var avisoSexta = '', avisoCliente = '';
      if (f.data && f.estado !== 'cancelado') {
        var itensDia = hwxItensDoDia(f.data, props.trabalhos, props.series, savedRow ? savedRow.id : null, f.serie_id ? { serie_id: f.serie_id, data_serie: f.data_serie } : null);
        var hAtual = String(f.horas_reais || '').trim() !== '' && hwxNum(f.horas_reais) > 0 ? hwxNum(f.horas_reais) : horasLinhas;
        var hDia = Math.round((itensDia.reduce(function (a, i) { return a + (Number(i.horas) || 0); }, 0) + hAtual) * 100) / 100;
        var limH = Number(props.horasSexta) > 0 ? Number(props.horasSexta) : 8;
        if (hwxDow(f.data) === 5 && hDia > limH) avisoSexta = 'A sexta ' + hwxFmtDate(f.data) + ' fica com ' + hwxQty(hDia) + ' h marcadas — o limite dos Ajustes é ' + hwxQty(limH) + ' h (podes gravar na mesma).';
        var mesmo = f.cliente_id ? itensDia.filter(function (i) { return i.cliente_id === f.cliente_id; }) : [];
        if (mesmo.length) avisoCliente = 'Este cliente já tem trabalho em ' + hwxFmtDate(f.data) + ': ' + mesmo.map(function (i) { return i.nome; }).join(', ') + ' (podes gravar na mesma).';
      }
      var enter = function () { doSave(); };

      return React.createElement(HxFormShell, { title: savedRow ? 'Editar trabalho ' + savedRow.numero : 'Novo trabalho', onCancel: tryClose, onSave: function () { doSave(); }, busy: busy },
        f.serie_id && React.createElement('div', { style: { background: HX.surface2, border: '1px solid ' + HX.borderStrong, borderRadius: 10, padding: '8px 12px', marginBottom: 12, fontSize: 14 } },
          '🔁 Série' + (serie && serie.descricao ? ' «' + serie.descricao + '»' : '') + ' · data original ' + hwxFmtDate(f.data_serie) + '. Mudar a data move só esta ocorrência.'),
        f.oferta_id && React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginBottom: 10 } }, '📄 Criado a partir de uma oferta aceite.'),
        React.createElement(HxSection, { title: 'Cliente e local' },
          React.createElement(HwxClienteLocal, {
            f: f, cli: cli, clientes: clientes, locais: locais, zonas: zonas, zonaNome: zonaNome, zonaInfo: zonaInfo, errCliente: errs.cliente,
            notify: notify, saveCfg: props.saveCfg, precoBase: props.precoBase,
            onCliente: onCliente, onLocal: onLocal, onZonaApply: onZonaApply, onClienteCriado: function (row) { cliRef.current = row; props.onClienteCriado(row); }
          })
        ),
        React.createElement(HxSection, { title: 'Quando' },
          React.createElement(HxRow, { cols: 2 },
            React.createElement(HxDate, { label: 'Data', warn: hwxNaoSexta(f.data), value: f.data, error: errs.data, onChange: function (v) { upd('data', v); } }),
            React.createElement(HxField, { label: 'Hora', value: f.hora, type: 'time', onChange: function (v) { upd('hora', v); } })
          ),
          errs.data && React.createElement('div', { style: Object.assign({}, HXS.err, { marginTop: -8, marginBottom: 12 }) }, errs.data),
          avisoSexta && React.createElement(HxAviso, { text: avisoSexta }),
          avisoCliente && React.createElement(HxAviso, { text: avisoCliente }),
          React.createElement('div', { style: { marginBottom: 12 } }, React.createElement(HxBtn, { label: '📅 Próxima sexta (' + hwxFmtDate(hwxProximaSexta(hwxToday())) + ')', full: true, onClick: function () { upd('data', hwxProximaSexta(hwxToday())); } })),
          React.createElement(HxField, { label: 'Título', value: f.titulo, onChange: function (v) { upd('titulo', v); }, placeholder: 'ex.: Gartenpflege', onEnter: enter }),
          React.createElement('label', { style: HXS.label }, 'Estado'),
          React.createElement(HxSeg, { aria: 'Estado do trabalho', items: [{ v: 'planeado', l: 'Planeado' }, { v: 'feito', l: '✓ Feito' }, { v: 'cancelado', l: 'Cancelado' }], value: f.estado, onChange: setEstado })
        ),
        sugAnf && React.createElement('div', { style: { background: HX.warnBg, border: '1px solid ' + HX.warn, color: HX.warnText, borderRadius: 10, padding: '10px 12px', marginBottom: 12, fontSize: 14 } },
          React.createElement('div', { style: { fontWeight: 600, marginBottom: 8 } }, '🚗 A zona «' + zonaNome + '» sugere Anfahrt: ' + (sugAnf.unidade === 'hora' ? hwxQty(sugAnf.qtd) + ' h × ' + hwxChf(hwxNum(sugAnf.preco)) + ' = ' + hwxChf(hwxFromRappen(Math.round(hwxNum(sugAnf.qtd) * hwxToRappen(hwxNum(sugAnf.preco))))) : hwxChf(hwxNum(sugAnf.preco)) + ' (valor fixo)') + '. Não foi acrescentada: nos trabalhos de série só entra se aceitares.'),
          React.createElement(HxBtn, { label: '+ Acrescentar Anfahrt sugerida', full: true, onClick: aceitarAnf })),
        hwxRenderLinhas({ linhas: f.linhas, errs: errs, ops: ops, servicos: servicos, precoBase: props.precoBase, precoLabel: 'Preço (CHF, só neste trabalho)', onPick: function () { setPicking(true); } }),
        React.createElement(HxSection, { title: 'Horas, material e total' },
          React.createElement(HxRow, { cols: 2 },
            React.createElement(HxField, { label: 'Horas reais', value: f.horas_reais, inputMode: 'decimal', onChange: function (v) { upd('horas_reais', v); }, onBlur: onHorasBlur, error: errs.horas, hint: 'Horas das linhas: ' + hwxQty(horasLinhas), placeholder: 'ex.: 2,5' }),
            React.createElement(HxField, { label: 'Material (CHF)', value: f.material, inputMode: 'decimal', onChange: function (v) { upd('material', v); }, error: errs.material, })
          ),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 15, padding: '4px 0' } }, React.createElement('span', null, 'Linhas'), React.createElement('span', null, hwxChf(hwxFromRappen(tot.sub)))),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 15, padding: '4px 0' } }, React.createElement('span', null, 'Material'), React.createElement('span', null, hwxChf(hwxFromRappen(tot.mat)))),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 22, fontWeight: 800, padding: '8px 0 0', borderTop: '1px solid ' + HX.borderStrong, marginTop: 6 } }, React.createElement('span', null, 'TOTAL'), React.createElement('span', null, (f.incluido ? 'incluído · ' : '') + hwxChf(hwxFromRappen(tot.total)))),
          f.incluido && React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginTop: 4 } }, 'Valor das linhas (não cobrado): ' + hwxChf(hwxFromRappen(tot.sub + tot.mat)))
        ),
        React.createElement(HxSection, { title: 'Pauschale Hauswart' },
          React.createElement(HxFormToggle, { label: '☑ Incluído na Pauschale Hauswart', value: f.incluido, onChange: function (v) { upd('incluido', v); } }),
          React.createElement('div', { style: { fontSize: 13, color: HX.muted } }, 'Fica CHF 0 e nunca conta nos totais do Extra (a Pauschale já é contada na Hauswart).')
        ),
        !f.incluido && React.createElement(HxSection, { title: 'Pagamento' },
          React.createElement(HxFormToggle, { label: 'Pago', value: f.pago, onChange: function (v) { setF(function (p) { return Object.assign({}, p, { pago: v, data_pago: v ? (p.data_pago || hwxToday()) : '' }); }); } }),
          f.pago && React.createElement(HxDate, { label: 'Data de pagamento', value: f.data_pago, onChange: function (v) { upd('data_pago', v); } })
        ),
        React.createElement(HxSection, { title: 'Notas' },
          React.createElement(HxField, { label: 'Notas para o cliente', value: f.notas_cliente, multiline: true, onChange: function (v) { upd('notas_cliente', v); } }),
          React.createElement(HxField, { label: 'Notas internas (só para mim)', value: f.notas_internas, multiline: true, onChange: function (v) { upd('notas_internas', v); } })
        ),
        savedRow && React.createElement('div', { style: { marginBottom: 12 } }, React.createElement(HxBtn, { label: '⧉ Duplicar este trabalho', full: true, onClick: duplicar })),
        ask && React.createElement(HxModal, { title: 'Atualizar a linha?' },
          React.createElement('div', { style: { fontSize: 15, marginBottom: 14 } }, "Atualizar a linha '" + ask.desc + "' para " + hwxQty(ask.h) + ' h?'),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } },
            React.createElement(HxBtn, { label: 'Não', onClick: function () { setAsk(null); } }),
            React.createElement(HxBtn, { label: 'Sim', kind: 'primary', onClick: function () { ops.updLinha(ask.k, 'qtd', String(ask.unidade === 'hora' ? ask.h : Math.round(ask.h * 200) / 100)); setAsk(null); } })
          )
        )
      );
    }

    // ── Séries (clientes fixos) ──
    function hwxSerie0(r, p) {
      var src = r || p || {};
      return {
        cliente_id: src.cliente_id || '', local_id: src.local_id || '', servico_id: src.servico_id || '', descricao: src.descricao || '',
        inicio: r ? r.inicio : (p && p.inicio) || hwxProximaSexta(hwxToday()), fim: (r && r.fim) || '',
        intervalo_dias: String(src.intervalo_dias || 14), hora: hwxHora(src.hora),
        horas_previstas: src.horas_previstas != null && src.horas_previstas !== '' ? String(src.horas_previstas) : '',
        ativa: r ? !!r.ativa : true, notas: src.notas || '',
        linhas: hwxLinhasForm(src.linhas), oferta_id: src.oferta_id || null, incluido: !!src.incluido_pauschale
      };
    }
    // Escolher uma oferta para copiar (cliente, local, título e TODAS as linhas) para a série
    function HwxOfertaPicker(props) {
      var pctx = React.useContext(HxCtx);
      var ofertas = hwxUseList('hwx_ofertas', 'data', props.notify);
      React.useEffect(function () {
        pctx.ui.formOpen(true);
        return function () { pctx.ui.formOpen(false); };
      }, []);
      var _q = React.useState(''); var q = _q[0], setQ = _q[1];
      var _t = React.useState(false); var todas = _t[0], setTodas = _t[1];
      var tokens = hwxNorm(q).split(/\s+/).filter(Boolean);
      var all = (ofertas.rows || []).filter(function (o) { return o.estado !== 'recusada'; });
      var items = all.filter(function (o) {
        if (!todas && o.estado !== 'aceite') return false;
        if (!tokens.length) return true;
        var hay = hwxNorm([o.numero, o.titulo, hwxOfertaTituloCliente(o)].join(' '));
        return tokens.every(function (tk) { return hay.indexOf(tk) !== -1; });
      }).sort(function (a, b) { return String(b.data).localeCompare(String(a.data)) || String(b.numero).localeCompare(String(a.numero)); });
      var outras = all.filter(function (o) { return o.estado !== 'aceite'; }).length;
      return React.createElement('div', null,
        React.createElement(HxHead, { title: '📄 Usar uma oferta', back: props.onBack }),
        React.createElement(HxField, { label: 'Pesquisar (número O…, título, cliente)', value: q, onChange: setQ, placeholder: 'ex.: O2026-0001' }),
        React.createElement(HxLoadState, { list: ofertas }),
        ofertas.rows !== null && items.length === 0 && React.createElement(HxEmpty, { icon: '📄', text: todas ? 'Nenhuma oferta encontrada' : 'Nenhuma oferta aceite encontrada', sub: todas || outras === 0 ? '' : 'Podes mostrar também as ofertas ainda não aceites.' }),
        items.map(function (o) {
          return React.createElement('div', { key: o.id, style: Object.assign({}, HXS.card, { display: 'flex', gap: 10, alignItems: 'center' }) },
            React.createElement('div', { style: { flex: 1, minWidth: 0 } },
              React.createElement('div', { style: { fontWeight: 800 } }, o.numero + ' · ' + hwxChf(o.total)),
              o.titulo && React.createElement('div', { style: { fontWeight: 700, fontSize: 14, wordBreak: 'break-word' } }, o.titulo),
              React.createElement('div', { style: { fontSize: 14, color: HX.muted, wordBreak: 'break-word' } }, (hwxOfertaTituloCliente(o) || '(cliente apagado)') + ' · ' + hwxFmtDate(o.data) + ' · ' + hwxLabel(HWX_OF_ESTADOS, o.estado) + ' · ' + (o.linhas || []).length + ' linha(s)')),
            React.createElement(HxBtn, { label: 'Usar', kind: 'primary', aria: 'Usar a oferta ' + o.numero, onClick: function () { props.onPick(o); } }));
        }),
        outras > 0 && React.createElement('div', { style: { marginTop: 8 } }, React.createElement(HxBtn, { label: todas ? 'Mostrar só as aceites' : 'Mostrar também as não aceites (' + outras + ')', full: true, onClick: function () { setTodas(!todas); } }))
      );
    }
    function HwxSerieForm(props) {
      var notify = props.notify, editing = props.editing, clientes = props.clientes, locais = props.locais, servicos = props.servicos;
      var snap = React.useRef(hwxSerie0(editing, props.preset)).current;
      var _f = React.useState(snap);
      var f = _f[0], setF = _f[1];
      var _er = React.useState({}); var errs = _er[0], setErrs = _er[1];
      var _b = React.useState(false); var busy = _b[0], setBusy = _b[1];
      var busyRef = React.useRef(false);
      var cliRef = React.useRef(null);
      var upd = function (k, v) { setF(function (p) { var n = Object.assign({}, p); n[k] = v; return n; }); };
      var cliLista = clientes.filter(function (c) { return c.id === f.cliente_id; })[0] || null;
      if (cliLista) cliRef.current = cliLista;
      var cli = cliLista || (f.cliente_id && cliRef.current && cliRef.current.id === f.cliente_id ? cliRef.current : null);
      var term = props.preset && props.preset.terminarAnterior ? props.preset.terminarAnterior : null;
      var _pk = React.useState(false); var picking = _pk[0], setPicking = _pk[1];
      var _po = React.useState(false); var pickOf = _po[0], setPickOf = _po[1];
      var zRef = React.useRef(null); // a série não tem zona: a Anfahrt é uma linha como as outras (vem da oferta ou põe-se à mão)
      var ops = hwxUseLinhasOps(setF, zRef, false, props.precoBase);

      var usarOferta = function (o) {
        var tem = f.linhas.length > 0;
        if (tem && !window.confirm('Substituir as ' + f.linhas.length + ' linha(s) atuais pelas da oferta ' + o.numero + '?')) return;
        if (Number(o.desconto_valor) > 0) notify('warn', 'A oferta tinha desconto; a série não leva desconto — ajusta as linhas se quiseres.');
        setF(function (p) {
          return Object.assign({}, p, {
            cliente_id: o.cliente_id || p.cliente_id, local_id: o.cliente_id ? (o.local_id || '') : p.local_id,
            descricao: String(o.titulo || '').trim() || p.descricao, linhas: hwxLinhasForm(o.linhas), oferta_id: o.id
          });
        });
        setPickOf(false);
      };

      var doSave = function (ok, fail) {
        if (busyRef.current) return;
        var e = {}, msgs = [];
        var iv = hwxNum(f.intervalo_dias);
        var hp = String(f.horas_previstas || '').trim() === '' ? null : hwxNum(f.horas_previstas);
        if (!f.cliente_id) { e.cliente = 'Escolhe o cliente.'; msgs.push('Falta: cliente'); }
        if (!f.inicio) { e.inicio = 'Indica a primeira data.'; msgs.push('Falta: primeira data'); }
        if (iv === null || iv < 1 || iv > 366 || Math.round(iv) !== iv) { e.intervalo = 'Dias entre 1 e 366.'; msgs.push('Intervalo inválido (1 a 366 dias)'); }
        if (f.fim && f.inicio && f.fim < f.inicio) { e.fim = 'O fim não pode ser antes do início.'; msgs.push('O fim não pode ser antes do início'); }
        if (hp !== null && (hp <= 0 || hp > 999.99)) { e.horas = 'Horas maiores que 0 (ex.: 2,5), ou deixa vazio.'; msgs.push('Horas previstas inválidas'); }
        var lv = hwxLinhasValidar(f.linhas);
        e.linhas = lv.errs; msgs = msgs.concat(lv.msgs);
        setErrs(e);
        if (msgs.length) { hwxReportErrs(notify, msgs); if (fail) fail(); return; }
        var payload = {
          cliente_id: f.cliente_id, local_id: f.local_id || null, servico_id: f.servico_id || null, descricao: String(f.descricao || '').trim(),
          inicio: f.inicio, fim: f.fim || null, intervalo_dias: Math.round(iv), hora: f.hora || null,
          horas_previstas: hp === null ? null : Math.round(hp * 100) / 100, ativa: !!f.ativa, notas: String(f.notas || '').trim()
        };
        // colunas do SQL 28: só vão na gravação quando é preciso (há linhas / oferta / marca, ou a linha já as tem) — antes do SQL nada muda
        var tem28 = editing && ('linhas' in editing);
        if (f.linhas.length || f.oferta_id || tem28) { payload.linhas = hwxLinhasGravar(f.linhas); payload.oferta_id = f.oferta_id || null; }
        if (f.incluido || (editing && 'incluido_pauschale' in editing)) payload.incluido_pauschale = !!f.incluido;
        busyRef.current = true; setBusy(true);
        hwxWrite('hwx_series', editing ? editing.id : null, payload, notify, function (row) {
          props.onSaved(row);
          if (term) {
            // "daqui para a frente": só depois de a nova série estar gravada se termina a anterior (fim = véspera)
            hwxWrite('hwx_series', term.id, { fim: term.fim }, notify, function (old) {
              props.onSaved(old);
              notify('ok', 'Série anterior terminada em ' + hwxFmtDate(term.fim) + ' ✓');
            }, function (success) {
              if (!success) notify('error', 'A nova série foi gravada, mas não consegui terminar a anterior. Termina-a à mão (fim = ' + hwxFmtDate(term.fim) + ').');
            });
          }
          if (ok) ok(); else props.onClose();
        }, function (success) {
          busyRef.current = false; setBusy(false);
          if (!success && fail) fail();
        });
      };
      hwxUseDirty('serie', snap, f, doSave);
      var tryClose = function () { if (!busy) props.guard.attempt(props.onClose, ['serie']); };
      hwxUseEsc(tryClose);
      if (picking) return React.createElement(HwxPicker, { servicos: servicos, cats: props.cats || [], onAdd: ops.addServico, onBack: function () { setPicking(false); } });
      if (pickOf) return React.createElement(HwxOfertaPicker, { notify: notify, onPick: usarOferta, onBack: function () { setPickOf(false); } });
      var totLinhas = 0;
      f.linhas.forEach(function (l) { totLinhas += hwxLinhaTotalR(l); });
      var svSel = f.servico_id ? servicos.filter(function (x) { return x.id === f.servico_id; })[0] : null;
      var porMes = (svSel && svSel.unidade === 'mes') || f.linhas.some(function (l) { return l.unidade === 'mes'; });
      var svOpts = [{ v: '', l: '— sem serviço —' }].concat(servicos.filter(function (s) { return s.estado !== 'arquivado'; }).map(function (s) { return { v: s.id, l: s.nome }; }));
      var meusLocais = f.cliente_id ? locais.filter(function (l) { return l.cliente_id === f.cliente_id; }).sort(function (a, b) { return a.sub_numero - b.sub_numero; }) : [];
      var next = hwxOcorrencias({ ativa: true, inicio: f.inicio || hwxToday(), fim: f.fim || null, intervalo_dias: hwxNum(f.intervalo_dias) || 14 }, hwxToday(), hwxAddDays(hwxToday(), 400)).slice(0, 4);
      return React.createElement(HxFormShell, { title: editing ? 'Editar série' : 'Nova série', onCancel: tryClose, onSave: function () { doSave(); }, busy: busy },
        term && React.createElement('div', { style: { background: HX.warnBg, border: '1px solid ' + HX.warn, color: HX.warnText, borderRadius: 10, padding: '8px 12px', marginBottom: 12, fontSize: 14, fontWeight: 600 } },
          'Ao guardar, a série atual termina em ' + hwxFmtDate(term.fim) + ' e esta passa a valer a partir de ' + hwxFmtDate(f.inicio) + '. O passado fica intacto.'),
        React.createElement('div', { style: { marginBottom: 12 } }, React.createElement(HxBtn, { label: '📄 Usar uma oferta', full: true, onClick: function () { setPickOf(true); } })),
        f.oferta_id && React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginBottom: 10 } }, '📄 Linhas copiadas de uma oferta' + ' — podes editá-las à vontade.'),
        React.createElement(HxSection, { title: 'Cliente e local' },
          React.createElement(HwxClienteLocal, {
            f: f, cli: cli, clientes: clientes, locais: locais, zonas: props.zonas, comZona: false, avisoTel: false, errCliente: errs.cliente, notify: notify, saveCfg: props.saveCfg, precoBase: props.precoBase,
            onCliente: function (id, row) { setF(function (p) { return Object.assign({}, p, { cliente_id: id, local_id: '' }); }); },
            onLocal: function (id) { upd('local_id', id); },
            onZonaApply: function () {}, onClienteCriado: function (row) { cliRef.current = row; props.onClienteCriado(row); }
          })
        ),
        React.createElement(HxSection, { title: 'O que se faz' },
          React.createElement(HxField, { label: 'Descrição', value: f.descricao, onChange: function (v) { upd('descricao', v); }, placeholder: 'ex.: Gartenpflege', onEnter: function () { doSave(); } }),
          React.createElement(HxSelect, { label: 'Serviço (tabela de preços)', warn: porMes ? 'Este serviço é cobrado «por mês», mas uma série conta horas/ocorrências. Confirma que queres uma série (podes gravar na mesma).' : '', value: f.servico_id, options: svOpts, onChange: function (v) { upd('servico_id', v); } })
        ),
        React.createElement(HxSection, { title: 'Quando' },
          React.createElement(HxRow, { cols: 2 },
            React.createElement(HxDate, { label: 'Primeira data', warn: hwxNaoSexta(f.inicio), value: f.inicio, error: errs.inicio, onChange: function (v) { upd('inicio', v); } }),
            React.createElement(HxDate, { label: 'Fim (vazio = sem fim)', value: f.fim, error: errs.fim, onChange: function (v) { upd('fim', v); } })
          ),
          (errs.inicio || errs.fim) && React.createElement('div', { style: Object.assign({}, HXS.err, { marginTop: -8, marginBottom: 12 }) }, errs.inicio || errs.fim),
          React.createElement('div', { style: { marginBottom: 12 } }, React.createElement(HxBtn, { label: '📅 Próxima sexta (' + hwxFmtDate(hwxProximaSexta(hwxToday())) + ')', full: true, onClick: function () { upd('inicio', hwxProximaSexta(hwxToday())); } })),
          React.createElement(HxRow, { cols: 3 },
            React.createElement(HxField, { label: 'De quantos em quantos dias', value: f.intervalo_dias, inputMode: 'numeric', onChange: function (v) { upd('intervalo_dias', v); }, error: errs.intervalo }),
            React.createElement(HxField, { label: 'Hora', value: f.hora, type: 'time', onChange: function (v) { upd('hora', v); } }),
            React.createElement(HxField, { label: 'Horas previstas', value: f.horas_previstas, inputMode: 'decimal', onChange: function (v) { upd('horas_previstas', v); }, error: errs.horas, placeholder: 'ex.: 2,5' })
          ),
          next.length > 0 && React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginBottom: 8 } }, 'Próximas datas: ' + next.map(function (o) { return hwxDiaCurto(o.data); }).join(' · ') + (hwxSerieSemana(f.inicio, hwxNum(f.intervalo_dias)) ? ' · semana ' + hwxSerieSemana(f.inicio, hwxNum(f.intervalo_dias)) : '')),
          React.createElement(HxFormToggle, { label: 'Série ativa', value: f.ativa, onChange: function (v) { upd('ativa', v); } })
        ),
        hwxRenderLinhas({ linhas: f.linhas, errs: errs, ops: ops, servicos: servicos, precoBase: props.precoBase, precoLabel: 'Preço (CHF, cada ocorrência)', onPick: function () { setPicking(true); } }),
        f.linhas.length > 0 && React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, marginBottom: 12 } },
          React.createElement('span', null, 'Total por ocorrência'), React.createElement('span', null, (f.incluido ? 'incluído · ' + hwxChf(0) : hwxChf(hwxFromRappen(totLinhas))))),
        React.createElement(HxSection, { title: 'Pauschale Hauswart' },
          React.createElement(HxFormToggle, { label: '☑ Incluído na Pauschale Hauswart', value: f.incluido, onChange: function (v) { upd('incluido', v); } }),
          React.createElement('div', { style: { fontSize: 13, color: HX.muted } }, 'Os trabalhos desta série herdam a marca: ficam CHF 0 e nunca contam nos totais do Extra.')
        ),
        React.createElement(HxSection, { title: 'Notas' },
          React.createElement(HxField, { label: 'Notas (só para mim)', value: f.notas, multiline: true, onChange: function (v) { upd('notas', v); } })
        )
      );
    }

    // Lista de séries: criar, editar, terminar, mudar daqui para a frente e apagar. clienteId opcional (a partir do cartão do cliente)
    function HwxSeries(props) {
      var notify = props.notify, ctx = React.useContext(HxCtx), zonas = props.zonas || [];
      var series = hwxUseList('hwx_series', 'inicio', notify);
      var clientes = hwxUseList('hwx_clientes', 'numero', notify);
      var locais = hwxUseList('hwx_locais', 'ordem', notify);
      var servicos = hwxUseList('hwx_servicos', 'ordem', notify);
      var _v = React.useState(props.abrirPreset ? { editing: null, preset: props.abrirPreset } : null); var form = _v[0], setForm = _v[1];
      var _p = React.useState({}); var pending = _p[0], setPending = _p[1];
      var _t = React.useState(null); var termDlg = _t[0], setTermDlg = _t[1]; // { serie, kind: 'terminar'|'frente', data, err }
      var _dd = React.useState(null); var delDlg = _dd[0], setDelDlg = _dd[1]; // diálogo de apagar
      React.useEffect(function () { if (props.abrirPreset && props.onPresetUsed) props.onPresetUsed(); }, []);
      var rows = (series.rows || []).filter(function (s) { return !props.clienteId || s.cliente_id === props.clienteId; });
      var cli = function (id) { return (clientes.rows || []).filter(function (c) { return c.id === id; })[0] || null; };
      var hoje = hwxToday();

      if (form) {
        return React.createElement(HwxSerieForm, {
          editing: form.editing, preset: form.preset, clientes: clientes.rows || [], locais: locais.rows || [], servicos: servicos.rows || [], zonas: zonas, cats: props.cats || [],
          notify: notify, guard: ctx.guard, saveCfg: props.saveCfg, precoBase: props.precoBase,
          onSaved: function (row) { hwxReplaceRow(series, row); if (props.onChanged) props.onChanged(row); },
          onClienteCriado: function (row) { clientes.setRows(function (prev) { return (prev || []).filter(function (x) { return x.id !== row.id; }).concat([row]); }); clientes.load(); props.onReloadCfg(); },
          onClose: function () { setForm(null); }
        });
      }
      var setPend = function (id, on) { setPending(function (p) { var n = Object.assign({}, p); if (on) n[id] = true; else delete n[id]; return n; }); };
      var removerSerie = function (s) {
        setDelDlg(function (d) { return d ? Object.assign({}, d, { busy: true }) : d; });
        hwxRemove('hwx_series', s.id, notify, function () {
          series.setRows(function (prev) { return (prev || []).filter(function (x) { return x.id !== s.id; }); });
          if (props.onChanged) props.onChanged(null);
          setDelDlg(null);
        }, function (ok) { setPend(s.id, false); if (!ok) setDelDlg(null); });
      };
      // Conta os trabalhos ligados à série ANTES de pedir confirmação; se não conseguir contar, não apaga
      var apagar = function (s) {
        if (pending[s.id]) return;
        setPend(s.id, true);
        window.supabaseClient.from('hwx_trabalhos').select('id,data,estado,data_serie').eq('serie_id', s.id).then(function (r) {
          if (r.error) { hwxFail(notify, 'contar trabalhos da série', r.error, false); setPend(s.id, false); return; }
          var rows = r.data || [], hj = hwxToday();
          var futuros = rows.filter(function (t) { return t.data >= hj && t.estado !== 'cancelado'; }).length;
          var materializadas = {};
          rows.forEach(function (t) { if (t.data_serie) materializadas[t.data_serie] = true; });
          var calc = hwxOcorrencias(s, hj, hwxAddDays(hj, HWX_JANELA_DIAS)).filter(function (o) { return !materializadas[o.data]; }).length;
          setDelDlg({
            s: s, titulo: 'Apagar a série «' + (s.descricao || 'sem descrição') + '»?',
            aviso: 'Isto não se desfaz.' + (futuros > 0 ? ' ' + futuros + ' trabalho(s) futuro(s) ficam avulsos (sem série).' : ''),
            linhas: [
              rows.length + ' trabalho(s) ligado(s) à série ficam como trabalhos avulsos (' + futuros + ' futuro(s), a partir de hoje)',
              calc + ' data(s) calculada(s) nas próximas 12 semanas, ainda sem trabalho, deixam de aparecer na Agenda'
            ]
          });
        }).catch(function (e) { hwxFail(notify, 'contar trabalhos da série', e, false); setPend(s.id, false); });
      };
      var confirmarDlg = function () {
        var d = termDlg; if (!d || d.busy) return;
        var s = d.serie;
        if (d.kind === 'terminar') {
          if (!d.data || d.data < s.inicio) { setTermDlg(Object.assign({}, d, { err: 'A data tem de ser igual ou depois do início (' + hwxFmtDate(s.inicio) + ').' })); return; }
          setTermDlg(Object.assign({}, d, { busy: true, err: '' }));
          hwxWrite('hwx_series', s.id, { fim: d.data }, notify, function (row) { hwxReplaceRow(series, row); if (props.onChanged) props.onChanged(row); }, function (ok) { setTermDlg(ok ? null : Object.assign({}, d, { busy: false })); });
          return;
        }
        // daqui para a frente: a atual acaba na véspera; abre-se uma nova série (cópia) a partir desta data
        if (!d.data || d.data <= s.inicio) { setTermDlg(Object.assign({}, d, { err: 'A data tem de ser depois do início da série atual (' + hwxFmtDate(s.inicio) + ').' })); return; }
        setTermDlg(null);
        setForm({ editing: null, preset: Object.assign({}, s, { inicio: d.data, fim: '', terminarAnterior: { id: s.id, fim: hwxAddDays(d.data, -1) } }) });
      };

      var ordenadas = rows.slice().sort(function (a, b) { return (a.ativa === b.ativa ? 0 : a.ativa ? -1 : 1) || String(a.inicio).localeCompare(String(b.inicio)); });
      var clienteFiltro = props.clienteId ? cli(props.clienteId) : null;
      return React.createElement('div', null,
        delDlg && React.createElement(HwxApagarDlg, { d: delDlg, onCancel: function () { setPend(delDlg.s.id, false); setDelDlg(null); }, onConfirm: function () { removerSerie(delDlg.s); } }),
        React.createElement(HxHead, { title: '🔁 Séries' + (clienteFiltro ? ' · #' + clienteFiltro.numero + ' ' + (clienteFiltro.firma || clienteFiltro.nome) : ''), back: props.onBack }),
        React.createElement('div', { style: { marginBottom: 12 } },
          React.createElement(HxBtn, { label: '+ Nova série', kind: 'primary', big: true, full: true, onClick: function () { setForm({ editing: null, preset: props.clienteId ? { cliente_id: props.clienteId } : null }); } })),
        React.createElement(HxLoadState, { list: series }),
        series.rows !== null && rows.length === 0 && React.createElement(HxEmpty, { icon: '🔁', text: 'Ainda não há séries', sub: 'Uma série repete um trabalho de N em N dias (14 por defeito).' }),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: ctx.wide ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)', gap: 12, alignItems: 'start' } },
          ordenadas.map(function (s) {
            var c = cli(s.cliente_id), wait = !!pending[s.id];
            var terminada = s.fim && s.fim < hoje;
            var estado = !s.ativa ? 'inativa' : terminada ? 'terminada' : 'ativa';
            var prox = hwxOcorrencias(s, hoje, hwxAddDays(hoje, HWX_JANELA_DIAS)).slice(0, 3);
            var lc = s.local_id ? (locais.rows || []).filter(function (l) { return l.id === s.local_id; })[0] : null;
            var sv = s.servico_id ? (servicos.rows || []).filter(function (x) { return x.id === s.servico_id; })[0] : null;
            return React.createElement('div', { key: s.id, style: Object.assign({}, HXS.card, { marginBottom: 0, opacity: estado === 'ativa' ? 1 : 0.7 }) },
              React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'flex-start' } },
                React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                  React.createElement('div', { style: { fontWeight: 800, fontSize: 17, wordBreak: 'break-word' } }, s.descricao || '(sem descrição)'),
                  React.createElement('div', { style: { fontSize: 14, color: HX.muted, marginTop: 2 } }, c ? '#' + c.numero + ' ' + (c.firma || c.nome) : '(cliente)') ),
                React.createElement(HxPill, { text: estado, color: estado === 'ativa' ? HX.ok : HX.borderStrong })
              ),
              React.createElement('div', { style: { fontSize: 14, marginTop: 6 } }, 'de ' + s.intervalo_dias + ' em ' + s.intervalo_dias + ' dias' + (hwxSerieSemana(s.inicio, s.intervalo_dias) ? ' · semana ' + hwxSerieSemana(s.inicio, s.intervalo_dias) : '') + ' · desde ' + hwxFmtDate(s.inicio) + (s.fim ? ' · até ' + hwxFmtDate(s.fim) : ' · sem fim') + (s.hora ? ' · ' + hwxHora(s.hora) : '') + (s.horas_previstas ? ' · ' + hwxQty(s.horas_previstas) + ' h' : '')),
              (lc || sv) && React.createElement('div', { style: { fontSize: 14, color: HX.muted, marginTop: 2 } }, [lc ? '📍 ' + (c ? c.numero + '.' : '') + lc.sub_numero + ' ' + (lc.rua || lc.nome) : '', sv ? '🏷️ ' + sv.nome : ''].filter(Boolean).join(' · ')),
              Array.isArray(s.linhas) && s.linhas.length > 0 && React.createElement('div', { style: { fontSize: 14, marginTop: 2 } },
                '🧾 ' + s.linhas.length + ' linha(s) · ' + (s.incluido_pauschale ? 'incluído · ' + hwxChf(0) : hwxChf(hwxFromRappen(s.linhas.reduce(function (a, l) { return a + hwxLinhaTotalR(l); }, 0)))) + (s.oferta_id ? ' · 📄 de uma oferta' : '')),
              s.incluido_pauschale && !(Array.isArray(s.linhas) && s.linhas.length > 0) && React.createElement('div', { style: { fontSize: 14, marginTop: 2 } }, 'Incluído na Pauschale Hauswart · ' + hwxChf(0)),
              prox.length > 0 && React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginTop: 6 } }, 'Próximas: ' + prox.map(function (o) { return hwxDiaCurto(o.data); }).join(' · ')),
              React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8, marginTop: 12 } },
                React.createElement(HxActBtn, { icon: '✏️', label: 'Editar', aria: 'Editar série ' + (s.descricao || ''), disabled: wait, onClick: function () { setForm({ editing: s }); } }),
                React.createElement(HxActBtn, { icon: '↪', label: 'Daqui p/ a frente', aria: 'Mudar a série daqui para a frente ' + (s.descricao || ''), disabled: wait || !s.ativa, onClick: function () { var n = prox[0] ? prox[0].data : hwxProximaSexta(hoje); setTermDlg({ serie: s, kind: 'frente', data: n, err: '' }); } }),
                React.createElement(HxActBtn, { icon: '⏹', label: 'Terminar', aria: 'Terminar série ' + (s.descricao || ''), disabled: wait || estado === 'terminada', onClick: function () { setTermDlg({ serie: s, kind: 'terminar', data: hoje, err: '' }); } }),
                React.createElement(HxActBtn, { icon: '🗑️', label: 'Apagar', kind: 'danger', aria: 'Apagar série ' + (s.descricao || ''), disabled: wait, onClick: function () { apagar(s); } })
              )
            );
          })
        ),
        termDlg && React.createElement(HxModal, { title: termDlg.kind === 'terminar' ? 'Terminar série' : 'Mudar daqui para a frente' },
          React.createElement('div', { style: { fontSize: 14, color: HX.muted, marginBottom: 10 } }, termDlg.kind === 'terminar'
            ? 'A série deixa de gerar datas depois desta (fim). O passado fica intacto.'
            : 'A série atual acaba na véspera desta data e abre-se uma nova a partir dela. O passado fica intacto.'),
          termDlg.err && React.createElement('div', { role: 'alert', style: { background: HX.badBg, border: '1px solid ' + HX.bad, color: HX.badText, borderRadius: 8, padding: '8px 10px', marginBottom: 12, fontSize: 14, fontWeight: 600 } }, '⚠️ ' + termDlg.err),
          React.createElement(HxDate, { label: termDlg.kind === 'terminar' ? 'Última data (fim)' : 'A partir de', value: termDlg.data, onChange: function (v) { setTermDlg(Object.assign({}, termDlg, { data: v })); } }),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 } },
            React.createElement(HxBtn, { label: 'Cancelar', onClick: function () { setTermDlg(null); }, disabled: !!termDlg.busy }),
            React.createElement(HxBtn, { label: termDlg.busy ? 'A gravar…' : (termDlg.kind === 'terminar' ? '⏹ Terminar' : '↪ Continuar'), kind: 'primary', onClick: confirmarDlg, disabled: !!termDlg.busy })
          )
        )
      );
    }

    // ── AGENDA ──
    function HwxAgenda(props) {
      var notify = props.notify, ctx = React.useContext(HxCtx), zonas = props.zonas, meuNome = props.meuNome;
      var trabalhos = hwxUseList('hwx_trabalhos', 'data', notify);
      var series = hwxUseList('hwx_series', 'inicio', notify);
      var clientes = hwxUseList('hwx_clientes', 'numero', notify);
      var locais = hwxUseList('hwx_locais', 'ordem', notify);
      var servicos = hwxUseList('hwx_servicos', 'ordem', notify);
      var F0 = { view: 'sexta', q: '', est: 'todos', cli: 'all', open: false };
      var _fl = React.useState(function () { return Object.assign({}, F0, hwxStoreGet('hwx_f_agenda', notify) || {}); });
      var flt = _fl[0], setFlt = _fl[1];
      var updF = function (k, v) { setFlt(function (p) { var n = Object.assign({}, p); n[k] = v; return n; }); };
      React.useEffect(function () { hwxStoreSet('hwx_f_agenda', flt, notify); }, [flt]);
      var hoje = hwxToday();
      var _r = React.useState(hwxProximaSexta(hoje)); var ref = _r[0], setRef = _r[1];
      var _fm = React.useState(props.preset ? { editing: null, preset: props.preset } : (props.abrir ? { editing: props.abrir } : null)); var form = _fm[0], setForm = _fm[1];
      var _sp = React.useState(props.seriePreset || null); var serPreset = _sp[0], setSerPreset = _sp[1];
      var _sv = React.useState(!!props.seriePreset); var verSeries = _sv[0], setVerSeries = _sv[1];
      var _cc = React.useState(false); var verCanc = _cc[0], setVerCanc = _cc[1]; // canceladas escondidas por defeito
      var _p = React.useState({}); var pending = _p[0], setPending = _p[1];
      React.useEffect(function () { if (props.preset && props.onPresetUsed) props.onPresetUsed(); if (props.abrir && props.onAbrirUsado) props.onAbrirUsado(); if (props.seriePreset && props.onSerieUsed) props.onSerieUsed(); }, []);
      var setPend = function (id, on) { setPending(function (p) { var n = Object.assign({}, p); if (on) n[id] = true; else delete n[id]; return n; }); };
      var cliRows = clientes.rows || [], locRows = locais.rows || [], serRows = series.rows || [], trabRows = trabalhos.rows || [];

      if (verSeries) {
        return React.createElement(HwxSeries, { notify: notify, zonas: zonas, cats: props.cats, saveCfg: props.saveCfg, precoBase: props.precoBase, onReloadCfg: props.onReloadCfg, abrirPreset: serPreset, onPresetUsed: function () { setSerPreset(null); }, onBack: function () { setVerSeries(false); series.load(); trabalhos.load(); }, onChanged: function () {} });
      }
      if (form) {
        return React.createElement(HwxTrabalhoForm, {
          key: form.editing ? form.editing.id : 'novo',
          editing: form.editing, preset: form.preset, estado: form.estado, clientes: cliRows, locais: locRows, servicos: servicos.rows || [], series: serRows, trabalhos: trabRows, horasSexta: props.horasSexta, zonas: zonas, cats: props.cats,
          notify: notify, guard: ctx.guard, precoBase: props.precoBase, saveCfg: props.saveCfg,
          onSaved: function (row) { hwxReplaceRow(trabalhos, row); props.onReloadCfg(); },
          onClienteCriado: function (row) { clientes.setRows(function (prev) { return (prev || []).filter(function (x) { return x.id !== row.id; }).concat([row]); }); clientes.load(); props.onReloadCfg(); },
          onDuplicar: function (t) {
            var payload = {
              cliente_id: t.cliente_id, cliente_snap: t.cliente_snap, local_id: t.local_id, local_snap: t.local_snap, oferta_id: null, serie_id: null, data_serie: null,
              data: hwxProximaSexta(hoje), hora: t.hora, estado: 'planeado', titulo: t.titulo, linhas: t.linhas, horas_reais: null, material: t.material, total: t.total,
              pago: false, data_pago: null, notas_cliente: t.notas_cliente, notas_internas: t.notas_internas
            };
            if ('incluido_pauschale' in t) payload.incluido_pauschale = !!t.incluido_pauschale;
            hwxWrite('hwx_trabalhos', null, payload, notify, function (row) { hwxReplaceRow(trabalhos, row); props.onReloadCfg(); setForm({ editing: row }); }, function () {});
          },
          onClose: function () { setForm(null); }
        });
      }

      // intervalo visível
      var de, ate;
      if (flt.view === 'sexta') { de = ref; ate = ref; }
      else if (flt.view === 'semana') { de = hwxSegunda(ref); ate = hwxAddDays(de, 6); }
      else { de = ref.slice(0, 8) + '01'; ate = hwxFimMes(ref); }
      var limite = hwxAddDays(hoje, HWX_JANELA_DIAS);
      var serieDe = function (id) { return serRows.filter(function (s) { return s.id === id; })[0] || null; };
      var cliDe = function (id) { return cliRows.filter(function (c) { return c.id === id; })[0] || null; };
      var locDe = function (id) { return locRows.filter(function (l) { return l.id === id; })[0] || null; };
      var items = [];
      trabRows.forEach(function (t) {
        if (t.data < de || t.data > ate) return;
        var se = t.serie_id ? serieDe(t.serie_id) : null;
        var k = se ? Math.round((hwxPD(t.data_serie) - hwxPD(se.inicio)) / (Math.max(1, Number(se.intervalo_dias) || 14) * HWX_DAY)) : null;
        items.push({ key: t.id, kind: 'row', t: t, data: t.data, hora: hwxHora(t.hora), k: k, serie: se });
      });
      serRows.forEach(function (se) {
        var d0 = de > hoje ? de : hoje, d1 = ate < limite ? ate : limite;
        hwxOcorrencias(se, d0, d1).forEach(function (o) {
          if (trabRows.some(function (t) { return t.serie_id === se.id && t.data_serie === o.data; })) return;
          items.push({ key: 's' + se.id + o.data, kind: 'virt', serie: se, data: o.data, hora: hwxHora(se.hora), k: o.k });
        });
      });
      // dados de apresentação
      items.forEach(function (it) {
        if (it.kind === 'row') {
          var t = it.t, cs = t.cliente_snap || {}, ls = t.local_snap || {};
          it.cs = cs; it.numero = t.numero; it.titulo = t.titulo; it.estado = t.estado; it.total = Number(t.total) || 0; it.horas = hwxTrabHoras(t); it.incl = !!t.incluido_pauschale;
          it.cliTxt = cs.numero != null ? '#' + cs.numero + ' ' + (cs.firma || cs.nome || '') : '';
          it.locTxt = ls.sub_numero != null ? cs.numero + '.' + ls.sub_numero + ' ' + (ls.rua || ls.nome || '') : '';
        } else {
          var se = it.serie, c = cliDe(se.cliente_id), l = se.local_id ? locDe(se.local_id) : null;
          it.cs = c ? hwxClienteSnap(c) : {}; it.numero = ''; it.titulo = se.descricao || ''; it.estado = 'planeado'; it.incl = !!se.incluido_pauschale;
          var sl = Array.isArray(se.linhas) ? se.linhas : [];
          it.total = sl.reduce(function (a, l) { return a + hwxLinhaTotalR(l); }, 0) / 100; it.horas = Number(se.horas_previstas) || hwxHorasTrabalho(sl);
          it.cliTxt = c ? '#' + c.numero + ' ' + (c.firma || c.nome) : '';
          it.locTxt = l && c ? c.numero + '.' + l.sub_numero + ' ' + (l.rua || l.nome || '') : '';
        }
        it.ab = it.serie ? hwxSemanaAB(it.data) : '';
      });
      var tokens = hwxNorm(flt.q).split(/\s+/).filter(Boolean);
      var nCanc = 0;
      var shown = items.filter(function (it) {
        if (flt.est !== 'todos' && it.estado !== flt.est) return false;
        if (flt.cli !== 'all' && String(it.cs.numero) !== flt.cli) return false;
        if (tokens.length) { var hay = hwxNorm([it.numero, it.titulo, it.cs.nome, it.cs.firma, it.cliTxt].join(' ')); if (!tokens.every(function (tk) { return hay.indexOf(hwxNorm(tk)) !== -1; })) return false; }
        if (it.estado === 'cancelado' && flt.est !== 'cancelado') { nCanc++; if (!verCanc) return false; }
        return true;
      }).sort(function (a, b) { return String(a.data).localeCompare(String(b.data)) || String(a.hora || '99').localeCompare(String(b.hora || '99')); });
      var cliSeen = {}, cliOpts = [{ v: 'all', l: 'Todos' }];
      items.concat(trabRows.map(function (t) { return { cs: t.cliente_snap || {} }; })).forEach(function (it) {
        if (it.cs && it.cs.numero != null && !cliSeen[it.cs.numero]) { cliSeen[it.cs.numero] = true; cliOpts.push({ v: String(it.cs.numero), l: '#' + it.cs.numero + ' ' + (it.cs.firma || it.cs.nome || '') }); }
      });
      var active = (flt.q.trim() ? 1 : 0) + (flt.est !== 'todos' ? 1 : 0) + (flt.cli !== 'all' ? 1 : 0);

      var horasSexta = Number(props.horasSexta) > 0 ? Number(props.horasSexta) : 8;
      var ocupadas = 0;
      shown.forEach(function (it) { if (it.estado !== 'cancelado') ocupadas += it.horas; });
      ocupadas = Math.round(ocupadas * 100) / 100;

      // ações
      var abrir = function (it, estado) {
        if (it.kind === 'row') { setForm({ editing: it.t, estado: estado }); return; }
        setForm({ editing: null, estado: estado, preset: hwxPresetDeSerie(it.serie, it.data, servicos.rows || [], it.cs) });
      };
      var cancelar = function (it) {
        if (it.kind === 'virt') {
          if (!window.confirm('Cancelar só a data ' + hwxFmtDate(it.data) + ' desta série?')) return;
          var c = cliDe(it.serie.cliente_id), l = it.serie.local_id ? locDe(it.serie.local_id) : null;
          var pr = hwxPresetDeSerie(it.serie, it.data, servicos.rows || [], c);
          var payload = { cliente_id: it.serie.cliente_id, cliente_snap: hwxClienteSnap(c), local_id: it.serie.local_id, local_snap: hwxLocalSnap(l), oferta_id: null, serie_id: it.serie.id, data_serie: it.data, data: it.data, hora: it.serie.hora, estado: 'cancelado', titulo: pr.titulo, linhas: [], horas_reais: null, material: 0, total: 0, pago: false, data_pago: null, notas_cliente: '', notas_internas: '' };
          setPend(it.key, true);
          hwxUpsertExcecao(payload, notify, function (row) { hwxReplaceRow(trabalhos, row); props.onReloadCfg(); }, function () { setPend(it.key, false); });
          return;
        }
        var t = it.t;
        if (t.serie_id && t.estado === 'planeado') {
          if (!window.confirm('Cancelar só a data ' + hwxFmtDate(t.data_serie) + ' desta série?')) return;
          setPend(it.key, true);
          hwxWrite('hwx_trabalhos', t.id, { estado: 'cancelado' }, notify, function (row) { hwxReplaceRow(trabalhos, row); }, function () { setPend(it.key, false); });
          return;
        }
        var msg = t.serie_id && t.estado === 'cancelado' ? 'Repor a ocorrência ' + hwxFmtDate(t.data_serie) + ' da série? (apaga o cancelamento)' : 'Apagar o trabalho ' + t.numero + '?';
        if (!window.confirm(msg)) return;
        setPend(it.key, true);
        hwxRemove('hwx_trabalhos', t.id, notify, function () { trabalhos.setRows(function (prev) { return (prev || []).filter(function (x) { return x.id !== t.id; }); }); }, function () { setPend(it.key, false); });
      };

      // navegação
      var nav = function (dir) {
        if (flt.view === 'mes') { var p = ref.split('-'); setRef(hwxFD(Date.UTC(+p[0], +p[1] - 1 + dir, 1))); }
        else setRef(hwxAddDays(ref, 7 * dir));
      };
      var titulo = flt.view === 'sexta' ? 'Sexta ' + hwxFmtDate(ref) + ' · semana ' + hwxSemanaAB(ref) : flt.view === 'semana' ? 'Semana ' + hwxFmtDate(de) + ' – ' + hwxFmtDate(ate) : HWX_MESES_PT[+ref.slice(5, 7) - 1] + ' ' + ref.slice(0, 4);
      var navLabel = flt.view === 'sexta' ? ['← Sexta anterior', 'Sexta seguinte →'] : flt.view === 'semana' ? ['← Semana anterior', 'Semana seguinte →'] : ['← Mês anterior', 'Mês seguinte →'];
      var pct = Math.min(100, Math.round(ocupadas / horasSexta * 100));
      var cheia = ocupadas > horasSexta;
      var lastDate = null;

      return React.createElement('div', null,
        React.createElement(HxHead, { title: 'Agenda' }),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8, marginBottom: 12 } },
          React.createElement(HxBtn, { label: '+ Novo trabalho', kind: 'primary', big: true, full: true, onClick: function () { setForm({ editing: null, preset: { data: flt.view === 'sexta' ? ref : hwxProximaSexta(hoje) } }); } }),
          React.createElement(HxBtn, { label: '🔁 Séries', big: true, full: true, onClick: function () { setVerSeries(true); } })
        ),
        React.createElement(HxSeg, { aria: 'Vista', items: [{ v: 'sexta', l: 'Sexta' }, { v: 'semana', l: 'Semana' }, { v: 'mes', l: 'Mês' }], value: flt.view, onChange: function (v) { updF('view', v); } }),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 } },
          React.createElement(HxBtn, { label: navLabel[0], onClick: function () { nav(-1); } }),
          React.createElement(HxBtn, { label: navLabel[1], onClick: function () { nav(1); } })
        ),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 } },
          React.createElement('div', { style: { flex: 1, fontWeight: 800, fontSize: 20 } }, titulo),
          React.createElement(HxBtn, { label: 'Próxima sexta', onClick: function () { setRef(hwxProximaSexta(hoje)); } })
        ),
        flt.view === 'sexta' && React.createElement('div', { style: Object.assign({}, HXS.card, { padding: 12 }) },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: 6, color: cheia ? HX.warnText : HX.text } },
            React.createElement('span', null, hwxQty(ocupadas) + ' de ' + hwxQty(horasSexta) + ' h ocupadas'), cheia ? React.createElement('span', null, '⚠️ a mais') : null),
          React.createElement('div', { role: 'progressbar', 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100, style: { height: 12, background: HX.field, border: '1px solid ' + HX.borderStrong, borderRadius: 6, overflow: 'hidden' } },
            React.createElement('div', { style: { width: pct + '%', height: '100%', background: cheia ? HX.warn : '#e5e5e5' } }))
        ),
        React.createElement(HxField, { label: 'Pesquisar (número T…, título, cliente)', value: flt.q, onChange: function (v) { updF('q', v); }, placeholder: 'ex.: T2026-0001' }),
        React.createElement(HxFilterBar, {
          active: active, open: flt.open, onToggle: function () { updF('open', !flt.open); },
          onClear: function () { setFlt(function (p) { return Object.assign({}, F0, { open: p.open, view: p.view }); }); }
        },
          React.createElement(HxRow, { cols: 2 },
            React.createElement(HxSelect, { label: 'Estado', value: flt.est, onChange: function (v) { updF('est', v); }, options: [{ v: 'todos', l: 'Todos' }].concat(HWX_TRAB_ESTADOS) }),
            React.createElement(HxSelect, { label: 'Cliente', value: flt.cli, onChange: function (v) { updF('cli', v); }, options: cliOpts })
          )
        ),
        React.createElement(HxLoadState, { list: trabalhos }),
        trabalhos.rows !== null && flt.view !== 'sexta' && React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginBottom: 8 } }, shown.length + ' trabalho(s)'),
        trabalhos.rows !== null && nCanc > 0 && flt.est !== 'cancelado' && React.createElement('div', { style: { marginBottom: 8 } },
          React.createElement(HxBtn, { label: verCanc ? 'Esconder ' + (nCanc === 1 ? 'a cancelada' : 'as ' + nCanc + ' canceladas') : nCanc + (nCanc === 1 ? ' cancelada' : ' canceladas') + ' · mostrar', full: true, aria: verCanc ? 'Esconder canceladas' : 'Mostrar canceladas', onClick: function () { setVerCanc(!verCanc); } })),
        trabalhos.rows !== null && shown.length === 0 && React.createElement(HxEmpty, { icon: '📅', text: items.length ? (nCanc > 0 && !verCanc && shown.length === 0 && nCanc === items.length ? 'Só há datas canceladas' : 'Nada com estes filtros') : 'Nada marcado', sub: items.length ? '' : 'Toca em "+ Novo trabalho" ou cria uma série (🔁).' }),
        hoje < de && de > limite && React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginBottom: 8 } }, 'As séries só se calculam até ' + hwxFmtDate(limite) + ' (12 semanas).'),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: ctx.wide && flt.view !== 'sexta' ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)', gap: 12, alignItems: 'start' } },
          shown.map(function (it) {
            var wait = !!pending[it.key];
            var head = flt.view !== 'sexta' && it.data !== lastDate ? React.createElement('div', { key: 'h' + it.data, style: { gridColumn: '1 / -1', fontWeight: 800, fontSize: 15, color: HX.muted, marginTop: 6 } }, hwxDiaCurto(it.data) + (hwxDow(it.data) === 5 ? ' · semana ' + hwxSemanaAB(it.data) : '')) : null;
            lastDate = it.data;
            var cs = it.cs, tel = hwxPhone(cs.contacto_telemovel) || hwxPhone(cs.telemovel) || hwxPhone(cs.contacto_telefone) || hwxPhone(cs.telefone_fixo);
            var wa = hwxPhone(cs.contacto_telemovel) || hwxPhone(cs.telemovel);
            var nome = cs.contacto_nome || cs.firma || cs.nome || '';
            var aviso = wa && it.estado === 'planeado' ? 'https://wa.me/' + wa + '?text=' + encodeURIComponent(hwxAvisoTexto(cs.lingua, nome, it.data, it.hora, meuNome)) : '';
            var isSerie = !!it.serie;
            var cancelLabel = it.kind === 'virt' ? 'Cancelar esta data' : (isSerie && it.t.estado === 'cancelado') ? 'Repor' : (isSerie && it.t.estado === 'planeado') ? 'Cancelar esta data' : 'Apagar';
            var cancelIcon = cancelLabel === 'Repor' ? '↩' : '🗑️';
            var cancelLongo = cancelLabel === 'Cancelar esta data'; // nome comprido: botão em linha própria, não cabe na grelha de 5
            var btns = [
              React.createElement(HxActBtn, { key: 'ab', icon: '✏️', label: 'Abrir', aria: 'Abrir ' + (it.numero || it.titulo || 'trabalho'), disabled: wait, onClick: function () { abrir(it); } }),
              React.createElement(HxActBtn, { key: 'fe', icon: '✓', label: 'Feito', aria: 'Feito ' + (it.numero || it.titulo || 'trabalho'), disabled: wait || it.estado === 'feito' || it.estado === 'cancelado', onClick: function () { abrir(it, 'feito'); } }),
              React.createElement(HxActBtn, { key: 'tel', icon: '📞', label: 'Ligar', aria: 'Ligar ' + (it.numero || it.titulo || 'cliente'), href: tel ? 'tel:+' + tel : undefined, disabled: !tel }),
              React.createElement(HxActBtn, { key: 'wa', icon: '💬', label: 'Aviso', aria: 'WhatsApp aviso ' + (it.numero || it.titulo || 'cliente'), href: aviso || undefined, blank: true, disabled: !aviso }),
              !cancelLongo && React.createElement(HxActBtn, { key: 'dl', icon: cancelIcon, label: cancelLabel, kind: cancelLabel === 'Repor' ? undefined : 'danger', aria: cancelLabel + ' ' + (it.numero || it.titulo || 'trabalho'), disabled: wait, onClick: function () { cancelar(it); } })
            ].filter(Boolean);
            var card = React.createElement('div', { key: it.key, 'data-hwx-trab': it.kind, style: Object.assign({}, HXS.card, { marginBottom: 0, opacity: it.estado === 'cancelado' ? 0.65 : 1 }) },
              React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'flex-start' } },
                React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                  React.createElement('div', { style: { display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' } },
                    React.createElement('span', { style: { fontWeight: 800, fontSize: 22 } }, it.hora || '—:—'),
                    isSerie && React.createElement('span', { style: { fontWeight: 700, fontSize: 13, color: HX.muted } }, '🔁 ' + (it.ab ? 'semana ' + it.ab : 'série')),
                    it.numero && React.createElement('span', { style: { fontSize: 13, color: HX.muted } }, it.numero)),
                  React.createElement('div', { style: { fontWeight: 700, fontSize: 16, wordBreak: 'break-word', marginTop: 2 } }, it.titulo || '(sem título)')),
                React.createElement(HxPill, { text: hwxLabel(HWX_TRAB_ESTADOS, it.estado), color: HWX_TRAB_COR[it.estado] })),
              React.createElement('div', { style: { fontSize: 14, color: HX.muted, marginTop: 6, wordBreak: 'break-word' } }, it.cliTxt || '(cliente apagado)', it.locTxt ? ' · ' + it.locTxt : ''),
              React.createElement('div', { style: { fontSize: 14, marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' } },
                it.horas > 0 && React.createElement('span', null, '⏱ ' + hwxQty(it.horas) + ' h'),
                it.incl && React.createElement('span', { style: { fontWeight: 800 } }, 'incluído · ' + hwxChf(0)),
                !it.incl && it.total > 0 && React.createElement('span', { style: { fontWeight: 800 } }, hwxChf(it.total)),
                !it.incl && it.kind === 'row' && it.t.pago && React.createElement('span', { style: { color: HX.okText, fontWeight: 700 } }, '✓ pago' + (it.t.data_pago ? ' ' + hwxFmtDate(it.t.data_pago) : ''))),
              React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(' + btns.length + ', minmax(0, 1fr))', gap: 8, marginTop: 12 } }, btns),
              cancelLongo && React.createElement('div', { style: { marginTop: 8 } }, React.createElement(HxBtn, { label: '🗑️ Cancelar esta data', kind: 'danger', full: true, aria: 'Cancelar esta data ' + hwxFmtDate(it.data) + ' ' + (it.titulo || 'série'), disabled: wait, onClick: function () { cancelar(it); } }))
            );
            return head ? [head, card] : card;
          })
        )
      );
    }

    // ══════════════ FASE 4: TOTAIS (Extra + Hauswart só LEITURA) ══════════════
    function hwxCsvField(v) {
      var s = String(v == null ? '' : v);
      return /[;"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }
    function hwxCsvNum(r) { return (r / 100).toFixed(2).replace('.', ','); }
    function hwxClienteTxt(cs) {
      cs = cs || {};
      var nome = cs.firma || cs.nome || '';
      return cs.numero != null ? '#' + cs.numero + (nome ? ' ' + nome : '') : (nome || '(sem cliente)');
    }
    // Trabalhos do Extra com estado "feito", pelo ano da data do trabalho (tudo em Rappen inteiros)
    function hwxTotaisExtra(trabs, ano, servicos, cats) {
      var out = { n: 0, total: 0, mat: 0, rec: { n: 0, total: 0, mat: 0 }, por: { n: 0, total: 0, mat: 0 }, porLista: [],
        meses: [], clientes: {}, cats: {}, horas: 0, semHoras: 0, comHoras: 0, jobs: [], incl: 0 };
      for (var m = 0; m < 12; m++) out.meses.push({ n: 0, sem: 0, mat: 0 });
      (trabs || []).forEach(function (t) {
        if (t.estado !== 'feito' || String(t.data).slice(0, 4) !== ano) return;
        if (t.incluido_pauschale) { out.incl++; return; } // incluído na Pauschale Hauswart: nunca conta (evita contar 2×)
        var tot = hwxToRappen(Number(t.total) || 0), mat = hwxToRappen(Number(t.material) || 0), sem = tot - mat;
        out.n++; out.total += tot; out.mat += mat; out.jobs.push(t);
        var grp = t.pago ? out.rec : out.por;
        grp.n++; grp.total += tot; grp.mat += mat;
        if (!t.pago) out.porLista.push(t);
        var mi = +String(t.data).slice(5, 7) - 1;
        if (mi >= 0 && mi < 12) { out.meses[mi].n++; out.meses[mi].sem += sem; out.meses[mi].mat += mat; }
        var ck = hwxClienteTxt(t.cliente_snap), c = out.clientes[ck] || (out.clientes[ck] = { n: 0, sem: 0 });
        c.n++; c.sem += sem;
        (t.linhas || []).forEach(function (l) {
          var nome;
          if (l.tipo === 'anfahrt') nome = 'Deslocação';
          else if (l.tipo === 'servico' && l.servico_id) {
            var sv = (servicos || []).filter(function (x) { return x.id === l.servico_id; })[0];
            nome = sv ? hwxCatName(cats, sv.categoria) : 'Outro';
          } else nome = 'Outro';
          out.cats[nome] = (out.cats[nome] || 0) + hwxLinhaTotalR(l);
        });
        var hr = t.horas_reais != null && t.horas_reais !== '' ? Number(t.horas_reais) : 0;
        if (hr > 0) { out.horas += hr; out.comHoras += sem; }
      });
      out.porLista.sort(function (a, b) { return String(a.data).localeCompare(String(b.data)); });
      return out;
    }
    // Lê o que a app Hauswart guardou (hauswart_data: archive, works, mats, cfg). NUNCA escreve.
    function hwxTotaisHw(row, ano) {
      var out = { itens: [], ignoradas: 0, total: 0, mat: 0, emCurso: null };
      if (!row) return out;
      var arch = Array.isArray(row.archive) ? row.archive : [], arquivados = {};
      arch.forEach(function (a) {
        var tot = a && a.total != null ? hwxNum(a.total) : null;
        if (tot === null) { out.ignoradas++; return; }
        var semData = !(a.invoiceDate && String(a.invoiceDate).length >= 4);
        var y = semData ? String(a.year == null ? '' : a.year) : String(a.invoiceDate).slice(0, 4);
        arquivados[String(a.year == null ? y : a.year) + '|' + (a.quarter || '')] = true;
        if (y !== ano) return;
        var mat;
        var tm = a.totalMats != null ? hwxNum(a.totalMats) : null;
        if (tm !== null) mat = hwxToRappen(tm);
        else { mat = 0; (Array.isArray(a.mats) ? a.mats : []).forEach(function (mm) { mat += hwxToRappen(hwxNum(mm && mm.price) || 0); }); }
        var t = hwxToRappen(tot);
        out.itens.push({ a: a, total: t, mat: mat, quarter: a.quarter || '', semData: semData, pago: !!a.paid, data: a.invoiceDate || '', num: a.invNum || a.invLabel || a.referenz || '' });
        out.total += t; out.mat += mat;
      });
      out.itens.sort(function (x, y) { return String(x.quarter).localeCompare(String(y.quarter)) || String(x.data).localeCompare(String(y.data)); });
      // trimestre em curso: ainda não arquivado (pauschale + trabalhos + materiais da linha viva)
      var cfg = row.cfg && typeof row.cfg === 'object' ? row.cfg : {};
      var cy = String(cfg.year == null ? '' : cfg.year);
      if (cy && cy === ano && !arquivados[cy + '|' + (cfg.quarter || '')]) {
        var t2 = hwxToRappen(hwxNum(cfg.pauschale) || 0), m2 = 0;
        (Array.isArray(row.works) ? row.works : []).forEach(function (w) { t2 += Math.round((hwxNum(w && w.hours) || 0) * (hwxNum(w && w.rate) || 0) * 100); });
        (Array.isArray(row.mats) ? row.mats : []).forEach(function (mm) { var v = hwxToRappen(hwxNum(mm && mm.price) || 0); t2 += v; m2 += v; });
        out.emCurso = { quarter: cfg.quarter || '', total: t2, mat: m2 };
      }
      return out;
    }

    function HxBarra(props) {
      return React.createElement('div', { role: 'progressbar', 'aria-valuenow': Math.round(props.pct), 'aria-valuemin': 0, 'aria-valuemax': 100, style: { height: props.h || 12, background: HX.field, border: '1px solid ' + HX.borderStrong, borderRadius: 6, overflow: 'hidden' } },
        React.createElement('div', { style: { width: Math.max(0, Math.min(100, props.pct)) + '%', height: '100%', background: props.cor || '#e5e5e5' } }));
    }
    function HxLinhaVal(props) {
      return React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: props.big ? 17 : 15, padding: '4px 0', fontWeight: props.bold ? 800 : 400, color: props.muted ? HX.muted : HX.text } },
        React.createElement('span', { style: { minWidth: 0, wordBreak: 'break-word' } }, props.l), React.createElement('span', { style: { whiteSpace: 'nowrap' } }, props.v));
    }

    function HwxTotais(props) {
      var notify = props.notify, ctx = React.useContext(HxCtx);
      var trabalhos = hwxUseList('hwx_trabalhos', 'data', notify);
      var servicos = hwxUseList('hwx_servicos', 'ordem', notify);
      var owner = (props.profile && props.profile.member_id) || 'patricio'; // o mesmo owner que a app Hauswart usa
      var _hw = React.useState({ s: 'carregar', row: null }); var hw = _hw[0], setHw = _hw[1];
      var alive = React.useRef(true);
      var csvUrl = React.useRef('');
      var _a = React.useState(hwxToday().slice(0, 4)); var ano = _a[0], setAno = _a[1];
      var loadHw = function () {
        if (!window.supabaseClient) { console.error('[hwx] ler hauswart_data: sem ligação à base de dados'); setHw({ s: 'erro', row: null }); return; }
        // SÓ LEITURA: select + maybeSingle (nunca .single(), upsert nem update)
        window.supabaseClient.from('hauswart_data').select('archive, works, mats, cfg').eq('member_id', owner).maybeSingle().then(function (res) {
          if (!alive.current) return;
          if (res.error) { console.error('[hwx] ler hauswart_data (só leitura)', res.error); setHw({ s: 'erro', row: null }); return; }
          setHw({ s: 'ok', row: res.data || null });
        }).catch(function (e) {
          if (!alive.current) return;
          console.error('[hwx] ler hauswart_data (só leitura)', e);
          setHw({ s: 'erro', row: null });
        });
      };
      React.useEffect(function () {
        alive.current = true;
        loadHw();
        var off = window.csAoVoltarRede(function () { loadHw(); });
        return function () { alive.current = false; off(); if (csvUrl.current) { URL.revokeObjectURL(csvUrl.current); csvUrl.current = ''; } };
      }, []);

      var trabRows = trabalhos.rows || [], svRows = servicos.rows || [];
      var ex = hwxTotaisExtra(trabRows, ano, svRows, props.cats);
      var hx = hwxTotaisHw(hw.row, ano);
      var hwOk = hw.s === 'ok';
      // anos disponíveis
      var anos = {}; anos[hwxToday().slice(0, 4)] = true;
      trabRows.forEach(function (t) { if (t.estado === 'feito') anos[String(t.data).slice(0, 4)] = true; });
      if (hw.row && Array.isArray(hw.row.archive)) hw.row.archive.forEach(function (a) { var y = a && a.invoiceDate ? String(a.invoiceDate).slice(0, 4) : String(a && a.year || ''); if (/^\d{4}$/.test(y)) anos[y] = true; });
      var anoOpts = Object.keys(anos).sort().reverse().map(function (y) { return { v: y, l: y }; });
      if (!anos[ano]) anoOpts.unshift({ v: ano, l: ano });

      // JUNTO: Extra + Hauswart arquivada; "incluindo em curso" à parte
      var junto = { total: ex.total + (hwOk ? hx.total : 0), mat: ex.mat + (hwOk ? hx.mat : 0) };
      var curso = hwOk && hx.emCurso ? hx.emCurso : null;
      var juntoCurso = { total: junto.total + (curso ? curso.total : 0), mat: junto.mat + (curso ? curso.mat : 0) };
      var baseLimite = juntoCurso.total - juntoCurso.mat; // sem material, incluindo o em curso
      var limiteR = hwxToRappen(props.cfg && props.cfg.row && props.cfg.row.limite_anual != null ? Number(props.cfg.row.limite_anual) : 0);
      var pctLim = limiteR > 0 ? baseLimite / limiteR * 100 : 0;
      var corLim = pctLim >= 100 ? HX.bad : pctLim >= 80 ? HX.warn : HX.ok;
      // Trabalhos do Extra feitos e por pagar há mais de 30 dias (só leitura; os incluídos na Pauschale nunca contam)
      var hojeT = hwxToday();
      var atrasados = trabRows.filter(function (t) { return t.estado === 'feito' && !t.pago && !t.incluido_pauschale && t.data && Math.round((hwxPD(hojeT) - hwxPD(t.data)) / HWX_DAY) > 30; })
        .map(function (t) { var d = Math.round((hwxPD(hojeT) - hwxPD(t.data)) / HWX_DAY); return { t: t, dias: d, atraso: d - 30 }; })
        .sort(function (a, b) { return b.dias - a.dias; });
      var faltam = limiteR - baseLimite;

      // CSV do ano (uma linha por trabalho do Extra e por fatura da Hauswart), gerado no aparelho
      var linhasCsv = [['data', 'origem', 'numero', 'cliente', 'total', 'material', 'pago']];
      ex.jobs.slice().sort(function (a, b) { return String(a.data).localeCompare(String(b.data)); }).forEach(function (t) {
        linhasCsv.push([hwxFmtDate(t.data), 'Extra', t.numero, hwxClienteTxt(t.cliente_snap), hwxCsvNum(hwxToRappen(Number(t.total) || 0)), hwxCsvNum(hwxToRappen(Number(t.material) || 0)), t.pago ? 'sim' : 'não']);
      });
      if (hwOk) hx.itens.forEach(function (i) {
        var cn = i.a.cfg && i.a.cfg.clientName ? i.a.cfg.clientName : '';
        linhasCsv.push([i.data ? hwxFmtDate(i.data) : '', 'Hauswart', i.num, cn, hwxCsvNum(i.total), hwxCsvNum(i.mat), i.pago ? 'sim' : 'não']);
      });
      var csvTexto = '﻿' + linhasCsv.map(function (r) { return r.map(hwxCsvField).join(';'); }).join('\r\n') + '\r\n';
      var csvHref = '';
      try {
        if (csvUrl.current) URL.revokeObjectURL(csvUrl.current);
        csvUrl.current = URL.createObjectURL(new Blob([csvTexto], { type: 'text/csv;charset=utf-8' }));
        csvHref = csvUrl.current;
      } catch (e) { console.error('[hwx] gerar CSV', e); }
      var maxMes = 1; ex.meses.forEach(function (m) { if (m.sem > maxMes) maxMes = m.sem; });
      var clientesOrd = Object.keys(ex.clientes).sort(function (a, b) { return ex.clientes[b].sem - ex.clientes[a].sem; });
      var catsOrd = Object.keys(ex.cats).sort(function (a, b) { return ex.cats[b] - ex.cats[a]; });
      var precoMedio = ex.horas > 0 ? ex.comHoras / ex.horas : 0;
      var R = function (r) { return hwxChf(hwxFromRappen(r)); };
      var trimOrd = ['Q1', 'Q2', 'Q3', 'Q4'];

      return React.createElement('div', null,
        React.createElement(HxHead, { title: '📊 Totais' }),
        React.createElement(HxSelect, { label: 'Ano', value: ano, options: anoOpts, onChange: setAno }),
        React.createElement(HxLoadState, { list: trabalhos }),
        hw.s === 'erro' && React.createElement('div', { role: 'alert', style: { background: HX.warnBg, border: '1px solid ' + HX.warn, color: HX.warnText, borderRadius: 10, padding: '10px 12px', marginBottom: 12, fontSize: 14, fontWeight: 600, display: 'flex', gap: 10, alignItems: 'center' } },
          React.createElement('span', { style: { flex: 1 } }, '⚠️ Hauswart não pôde ser lida — os totais do Extra aparecem na mesma.'),
          React.createElement(HxBtn, { label: 'Tentar de novo', onClick: loadHw })),
        hwOk && hx.ignoradas > 0 && React.createElement('div', { role: 'status', style: { background: HX.warnBg, border: '1px solid ' + HX.warn, color: HX.warnText, borderRadius: 10, padding: '8px 12px', marginBottom: 12, fontSize: 14 } },
          '⚠️ ' + hx.ignoradas + ' entrada(s) do arquivo da Hauswart sem total numérico foram ignoradas.'),
        // ── limite anual ──
        React.createElement(HxSection, { title: 'Limite anual ' + ano },
          limiteR > 0
            ? React.createElement('div', null,
                React.createElement(HxBarra, { pct: pctLim, cor: corLim, h: 16 }),
                React.createElement('div', { style: { marginTop: 8, fontWeight: 700, color: pctLim >= 100 ? HX.badText : pctLim >= 80 ? HX.warnText : HX.okText } },
                  'CHF ' + hwxMoneyDe(hwxFromRappen(baseLimite)) + ' de CHF ' + hwxMoneyDe(hwxFromRappen(limiteR)) + ' (' + Math.round(pctLim) + '%) — ' + (faltam >= 0 ? 'faltam CHF ' + hwxMoneyDe(hwxFromRappen(faltam)) : 'acima por CHF ' + hwxMoneyDe(hwxFromRappen(-faltam)))),
                React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginTop: 4 } }, 'Extra + Hauswart, sem material, incluindo o trimestre em curso.'))
            : React.createElement('div', { style: { fontSize: 14, color: HX.muted } }, 'Define o limite anual em Ajustes.')
        ),
        limiteR > 0 && pctLim >= 100 && React.createElement('div', { role: 'alert', 'data-hwx-limite': 'vermelho', style: { background: HX.badBg, border: '1px solid ' + HX.bad, color: HX.badText, borderRadius: 10, padding: '10px 12px', marginBottom: 12, fontSize: 14, fontWeight: 700 } },
          '⛔ Chegaste ao limite anual: ' + Math.round(pctLim) + ' % (CHF ' + hwxMoneyDe(hwxFromRappen(baseLimite)) + ' de CHF ' + hwxMoneyDe(hwxFromRappen(limiteR)) + ', sem material e com o trimestre em curso).'),
        limiteR > 0 && pctLim >= 80 && pctLim < 100 && React.createElement('div', { role: 'status', 'data-hwx-limite': 'ambar', style: { background: HX.warnBg, border: '1px solid ' + HX.warn, color: HX.warnText, borderRadius: 10, padding: '10px 12px', marginBottom: 12, fontSize: 14, fontWeight: 700 } },
          '⚠️ Perto do limite anual: ' + Math.round(pctLim) + ' % (faltam CHF ' + hwxMoneyDe(hwxFromRappen(faltam)) + ', sem material e com o trimestre em curso).'),
        atrasados.length > 0 && React.createElement(HxSection, { title: 'Por pagar há mais de 30 dias' },
          React.createElement(HxAviso, { text: atrasados.length + ' trabalho(s) feito(s) e por pagar há mais de 30 dias.', mb: 10 }),
          atrasados.map(function (a) {
            return React.createElement('div', { key: a.t.id, 'data-hwx-atrasado': a.t.numero, style: { display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', minHeight: 44, padding: '6px 0', borderBottom: '1px solid ' + HX.border, fontSize: 14 } },
              React.createElement('span', { style: { minWidth: 0, wordBreak: 'break-word' } }, React.createElement('b', null, a.t.numero), ' · ' + hwxClienteTxt(a.t.cliente_snap) + ' · feito ' + hwxFmtDate(a.t.data)),
              React.createElement('span', { style: { whiteSpace: 'nowrap', textAlign: 'right', color: HX.warnText, fontWeight: 700 } }, a.atraso + ' dia(s) em atraso', React.createElement('span', { style: { display: 'block', fontSize: 12, color: HX.muted, fontWeight: 400 } }, 'há ' + a.dias + ' dias · ' + hwxChf(Number(a.t.total) || 0))));
          })
        ),
        // ── junto ──
        React.createElement(HxSection, { title: 'Extra + Hauswart · ' + ano },
          React.createElement(HxLinhaVal, { l: 'Total (com material)', v: R(junto.total) }),
          React.createElement(HxLinhaVal, { l: 'Material (reembolso)', v: R(junto.mat), muted: true }),
          React.createElement(HxLinhaVal, { l: 'Total sem material', v: R(junto.total - junto.mat), bold: true, big: true }),
          curso && React.createElement('div', { style: { borderTop: '1px solid ' + HX.border, marginTop: 6, paddingTop: 6 } },
            React.createElement(HxLinhaVal, { l: 'Total incluindo em curso (com material)', v: R(juntoCurso.total) }),
            React.createElement(HxLinhaVal, { l: 'Total incluindo em curso, sem material', v: R(juntoCurso.total - juntoCurso.mat), bold: true }))
        ),
        // ── Extra ──
        React.createElement(HxSection, { title: 'Extra · ' + ano },
          ex.n === 0 && React.createElement('div', { style: { fontSize: 14, color: HX.muted } }, 'Nenhum trabalho feito em ' + ano + '.'),
          ex.incl > 0 && React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginBottom: 8 } }, ex.incl + ' trabalho(s) feito(s) incluído(s) na Pauschale Hauswart — não contam aqui.'),
          ex.n > 0 && React.createElement('div', null,
            React.createElement(HxLinhaVal, { l: ex.n + ' trabalho(s) feito(s) — total', v: R(ex.total) }),
            React.createElement(HxLinhaVal, { l: 'Material (reembolso)', v: R(ex.mat), muted: true }),
            React.createElement(HxLinhaVal, { l: 'Sem material', v: R(ex.total - ex.mat), bold: true }),
            React.createElement('div', { style: { borderTop: '1px solid ' + HX.border, marginTop: 8, paddingTop: 6 } },
              React.createElement(HxLinhaVal, { l: 'Recebido (' + ex.rec.n + ')', v: R(ex.rec.total) + ' · sem mat. ' + R(ex.rec.total - ex.rec.mat) }),
              React.createElement(HxLinhaVal, { l: 'Por receber (' + ex.por.n + ')', v: R(ex.por.total) + ' · sem mat. ' + R(ex.por.total - ex.por.mat), bold: ex.por.n > 0 })),
            ex.porLista.length > 0 && React.createElement('div', { style: { marginTop: 8 } },
              React.createElement('div', { style: HXS.sec }, 'Por receber'),
              ex.porLista.map(function (t) {
                return React.createElement('button', {
                  key: t.id, type: 'button', 'aria-label': 'Abrir ' + t.numero, onClick: function () { props.onAbrirTrabalho(t); },
                  style: { display: 'flex', width: '100%', minHeight: 44, textAlign: 'left', justifyContent: 'space-between', gap: 8, alignItems: 'center', background: HX.surface2, border: '1px solid ' + HX.borderStrong, borderRadius: 8, padding: '8px 12px', marginBottom: 6, color: HX.text, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }
                },
                  React.createElement('span', { style: { minWidth: 0 } }, React.createElement('b', null, t.numero), ' · ' + hwxClienteTxt(t.cliente_snap) + ' · ' + hwxFmtDate(t.data)),
                  React.createElement('b', { style: { whiteSpace: 'nowrap' } }, R(hwxToRappen(Number(t.total) || 0))));
              })),
            React.createElement('div', { style: Object.assign({}, HXS.sec, { marginTop: 14 }) }, 'Por mês (sem material)'),
            ex.meses.map(function (m, i) {
              return React.createElement('div', { key: i, style: { display: 'grid', gridTemplateColumns: '38px 1fr auto', gap: 8, alignItems: 'center', minHeight: 28 } },
                React.createElement('span', { style: { fontSize: 13, color: HX.muted } }, HWX_MONTHS[i]),
                React.createElement(HxBarra, { pct: m.sem / maxMes * 100, h: 10 }),
                React.createElement('span', { style: { fontSize: 13, whiteSpace: 'nowrap', minWidth: 78, textAlign: 'right' } }, m.n ? R(m.sem) : '—'));
            }),
            React.createElement('div', { style: Object.assign({}, HXS.sec, { marginTop: 14 }) }, 'Por cliente (sem material)'),
            clientesOrd.map(function (k) { return React.createElement(HxLinhaVal, { key: k, l: k + ' (' + ex.clientes[k].n + ')', v: R(ex.clientes[k].sem) }); }),
            React.createElement('div', { style: Object.assign({}, HXS.sec, { marginTop: 14 }) }, 'Por categoria (linhas)'),
            catsOrd.map(function (k) { return React.createElement(HxLinhaVal, { key: k, l: k, v: R(ex.cats[k]) }); }),
            React.createElement('div', { style: Object.assign({}, HXS.sec, { marginTop: 14 }) }, 'Horas'),
            React.createElement(HxLinhaVal, { l: 'Horas reais do ano', v: hwxQty(ex.horas) + ' h' }),
            React.createElement(HxLinhaVal, { l: 'Preço real médio por hora', v: ex.horas > 0 ? R(Math.round(precoMedio)) + ' / h' : '—', bold: true }),
            React.createElement('div', { style: { fontSize: 13, color: HX.muted } }, 'Total sem material ÷ horas reais, só nos trabalhos com horas reais.'))
        ),
        // ── Hauswart ──
        React.createElement(HxSection, { title: 'Hauswart (só leitura) · ' + ano },
          hw.s === 'carregar' && React.createElement('div', { style: { fontSize: 14, color: HX.muted } }, 'A ler a Hauswart…'),
          hw.s === 'erro' && React.createElement('div', { style: { fontSize: 14, color: HX.warnText } }, 'Hauswart não pôde ser lida.'),
          hwOk && !hw.row && React.createElement('div', { style: { fontSize: 14, color: HX.muted } }, 'Sem dados da Hauswart.'),
          hwOk && hw.row && hx.itens.length === 0 && !curso && React.createElement('div', { style: { fontSize: 14, color: HX.muted } }, 'Nenhuma fatura arquivada em ' + ano + '.'),
          hwOk && hx.itens.length > 0 && React.createElement('div', null,
            React.createElement(HxLinhaVal, { l: 'Faturas arquivadas — total', v: R(hx.total) }),
            React.createElement(HxLinhaVal, { l: 'Material (reembolso)', v: R(hx.mat), muted: true }),
            React.createElement(HxLinhaVal, { l: 'Sem material', v: R(hx.total - hx.mat), bold: true }),
            trimOrd.concat(['']).map(function (q) {
              var its = hx.itens.filter(function (i) { return (trimOrd.indexOf(i.quarter) === -1 ? '' : i.quarter) === q; });
              if (!its.length) return null;
              return React.createElement('div', { key: q || 'q?', style: { borderTop: '1px solid ' + HX.border, marginTop: 8, paddingTop: 6 } },
                its.map(function (i, ix) {
                  return React.createElement('div', { key: ix, style: { marginBottom: 6 } },
                    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' } },
                      React.createElement('span', { style: { fontWeight: 800 } }, (i.quarter || 'Q?') + ' · ' + (i.num || '(sem número)')),
                      React.createElement('span', { style: { fontWeight: 800, whiteSpace: 'nowrap' } }, R(i.total))),
                    React.createElement('div', { style: { fontSize: 13, color: HX.muted } }, (i.data ? hwxFmtDate(i.data) : '') + (i.mat ? ' · material ' + R(i.mat) : '')),
                    React.createElement('div', null,
                      React.createElement(HxPill, { text: i.pago ? 'Pago' : 'Por receber', color: i.pago ? HX.ok : HX.warn }),
                      i.semData ? React.createElement(HxPill, { text: '⚠ sem data da fatura', color: HX.warn }) : null));
                }));
            })),
          curso && React.createElement('div', { style: { borderTop: '1px dashed ' + HX.borderStrong, marginTop: 10, paddingTop: 8 } },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' } },
              React.createElement('span', { style: { fontWeight: 800 } }, (curso.quarter || 'Q?') + ' · em curso'),
              React.createElement('span', { style: { fontWeight: 800 } }, R(curso.total))),
            React.createElement('div', null, React.createElement(HxPill, { text: 'em curso', color: HX.warn })),
            React.createElement('div', { style: { fontSize: 13, color: HX.muted } }, 'Pauschale + trabalhos + material da fatura ainda não arquivada' + (curso.mat ? ' · material ' + R(curso.mat) : '') + '. Não entra no total arquivado.'))
        ),
        // ── exportar ──
        React.createElement('div', { style: { marginBottom: 12 } },
          csvHref
            ? React.createElement('a', { href: csvHref, download: 'hwx-totais-' + ano + '.csv', style: { minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, textDecoration: 'none', background: HX.surface2, color: HX.text, border: '1px solid ' + HX.borderStrong, fontWeight: 700, fontSize: 16, boxSizing: 'border-box' } }, '⬇ CSV do ano ' + ano)
            : React.createElement('div', { style: { fontSize: 14, color: HX.warnText } }, 'Não consegui gerar o CSV neste aparelho.'))
      );
    }

    function HwxOfertas(props) {
      var notify = props.notify, ctx = React.useContext(HxCtx), zonas = props.zonas, meuNome = props.meuNome;
      var ofertas = hwxUseList('hwx_ofertas', 'data', notify);
      var clientes = hwxUseList('hwx_clientes', 'numero', notify);
      var locais = hwxUseList('hwx_locais', 'ordem', notify);
      var servicos = hwxUseList('hwx_servicos', 'ordem', notify);
      var trabalhos = hwxUseList('hwx_trabalhos', 'data', notify);
      var series = hwxUseList('hwx_series', 'inicio', notify);
      var F0 = { q: '', est: 'todos', cli: 'all', ano: 'all', open: false };
      var _fl = React.useState(function () { return Object.assign({}, F0, hwxStoreGet('hwx_f_ofertas', notify) || {}); });
      var flt = _fl[0], setFlt = _fl[1];
      var updF = function (k, v) { setFlt(function (p) { var n = Object.assign({}, p); n[k] = v; return n; }); };
      React.useEffect(function () { hwxStoreSet('hwx_f_ofertas', flt, notify); }, [flt]);
      var _v = React.useState(null); var form = _v[0], setForm = _v[1];
      var _p = React.useState({}); var pending = _p[0], setPending = _p[1];
      var _dd = React.useState(null); var delDlg = _dd[0], setDelDlg = _dd[1]; // diálogo de apagar
      var setPend = function (id, on) { setPending(function (p) { var n = Object.assign({}, p); if (on) n[id] = true; else delete n[id]; return n; }); };
      var rows = ofertas.rows || [];
      var replaceRow = function (row) {
        ofertas.setRows(function (prev) {
          var arr = prev || [], found = false;
          var out = arr.map(function (r) { if (r.id === row.id) { found = true; return row; } return r; });
          if (!found) out.push(row);
          return out;
        });
      };

      if (form) {
        return React.createElement(HwxOfertaForm, {
          editing: form.editing, clientes: clientes.rows || [], locais: locais.rows || [], servicos: servicos.rows || [], zonas: zonas, cats: props.cats,
          notify: notify, guard: ctx.guard, precoBase: props.precoBase, saveCfg: props.saveCfg,
          onSaved: function (row, inserted) { replaceRow(row); if (inserted) props.onReloadCfg(); },
          onDeleted: function (id) { ofertas.setRows(function (prev) { return (prev || []).filter(function (x) { return x.id !== id; }); }); },
          reloadLists: function () { clientes.load(); locais.load(); },
          onClienteCriado: function (row) {
            clientes.setRows(function (prev) { return (prev || []).filter(function (x) { return x.id !== row.id; }).concat([row]); });
            clientes.load();
            props.onReloadCfg();
          },
          onClose: function () { setForm(null); }
        });
      }

      var duplicar = function (o) {
        if (pending[o.id]) return;
        setPend(o.id, true);
        var hoje = hwxToday();
        var payload = {
          cliente_id: o.cliente_id, local_id: o.local_id, cliente_snap: o.cliente_snap, local_snap: o.local_snap, zona_snap: o.zona_snap,
          titulo: o.titulo, data: hoje, valida_ate: hwxAddDays(hoje, 30), estado: 'rascunho', lingua: o.lingua,
          linhas: o.linhas, desconto_tipo: o.desconto_tipo, desconto_valor: o.desconto_valor, total: o.total,
          notas_cliente: o.notas_cliente, notas_internas: o.notas_internas, enviada_em: null, respondida_em: null
        };
        hwxWrite('hwx_ofertas', null, payload, notify, function (row) { replaceRow(row); props.onReloadCfg(); setForm({ editing: row }); }, function () { setPend(o.id, false); });
      };
      var criarTrabalho = function (o) {
        if (Number(o.desconto_valor) > 0) notify('warn', 'A oferta tinha desconto; o trabalho não leva desconto — ajusta as linhas se quiseres.');
        props.onCriarTrabalho({ oferta_id: o.id, cliente_id: o.cliente_id, local_id: o.local_id, titulo: o.titulo, linhas: o.linhas, notas_cliente: o.notas_cliente, notas_internas: o.notas_internas });
      };
      var criarSerie = function (o) {
        if (Number(o.desconto_valor) > 0) notify('warn', 'A oferta tinha desconto; a série não leva desconto — ajusta as linhas se quiseres.');
        props.onCriarSerie({ oferta_id: o.id, cliente_id: o.cliente_id, local_id: o.local_id, descricao: o.titulo, linhas: o.linhas });
      };
      var removerOferta = function (o) {
        setDelDlg(function (d) { return d ? Object.assign({}, d, { busy: true }) : d; });
        hwxRemove('hwx_ofertas', o.id, notify, function () {
          ofertas.setRows(function (prev) { return (prev || []).filter(function (x) { return x.id !== o.id; }); });
          setDelDlg(null);
        }, function (ok) { setPend(o.id, false); if (!ok) setDelDlg(null); });
      };
      var apagar = function (o) {
        if (pending[o.id]) return;
        setPend(o.id, true);
        var nt = (trabalhos.rows || []).filter(function (t) { return t.oferta_id === o.id; }).length;
        var ns = (series.rows || []).filter(function (se) { return se.oferta_id === o.id; }).length;
        var forte = o.estado === 'enviada' || o.estado === 'aceite';
        setDelDlg({
          o: o, forte: forte, titulo: 'Apagar a oferta ' + o.numero + '?',
          aviso: forte ? 'ATENÇÃO: esta oferta já foi ' + (o.estado === 'aceite' ? 'ACEITE' : 'ENVIADA') + ' ao cliente. Apagá-la não se desfaz e o número ' + o.numero + ' deixa de existir.' : 'Isto não se desfaz.',
          linhas: ['Estado: ' + hwxLabel(HWX_OF_ESTADOS, o.estado) + ' · total ' + hwxChf(o.total),
            nt + ' trabalho(s) criado(s) desta oferta ficam sem ligação à oferta (os trabalhos não são apagados)',
            ns + ' série(s) criada(s) desta oferta ficam sem ligação à oferta (as séries não são apagadas)']
        });
      };

      var anos = {};
      rows.forEach(function (o) { anos[String(o.data).slice(0, 4)] = true; });
      var anoOpts = [{ v: 'all', l: 'Todos' }].concat(Object.keys(anos).sort().reverse().map(function (a) { return { v: a, l: a }; }));
      var cliSeen = {}, cliOpts = [{ v: 'all', l: 'Todos' }];
      rows.forEach(function (o) {
        if (o.cliente_snap && o.cliente_snap.numero != null && !cliSeen[o.cliente_snap.numero]) {
          cliSeen[o.cliente_snap.numero] = true;
          cliOpts.push({ v: String(o.cliente_snap.numero), l: '#' + o.cliente_snap.numero + ' ' + (o.cliente_snap.firma || o.cliente_snap.nome) });
        }
      });
      var nq = hwxNorm(flt.q).trim();
      var shown = rows.filter(function (o) {
        var cs = o.cliente_snap || {};
        if (flt.est !== 'todos' && o.estado !== flt.est) return false;
        if (flt.cli !== 'all' && String(cs.numero) !== flt.cli) return false;
        if (flt.ano !== 'all' && String(o.data).slice(0, 4) !== flt.ano) return false;
        if (nq && hwxNorm([o.numero, o.titulo, cs.nome, cs.firma].join(' ')).indexOf(nq) === -1) return false;
        return true;
      }).sort(function (a, b) { return (String(b.data) > String(a.data) ? 1 : String(b.data) < String(a.data) ? -1 : 0) || hwxCmpText(b.numero, a.numero); });
      var active = (flt.q.trim() ? 1 : 0) + (flt.est !== 'todos' ? 1 : 0) + (flt.cli !== 'all' ? 1 : 0) + (flt.ano !== 'all' ? 1 : 0);
      var hoje = hwxToday();

      return React.createElement('div', null,
        React.createElement(HxHead, { title: 'Ofertas' }),
        delDlg && React.createElement(HwxApagarDlg, { d: delDlg, onCancel: function () { setPend(delDlg.o.id, false); setDelDlg(null); }, onConfirm: function () { removerOferta(delDlg.o); } }),
        React.createElement('div', { style: { marginBottom: 12 } },
          React.createElement(HxBtn, { label: '+ Nova oferta', kind: 'primary', big: true, full: true, onClick: function () { setForm({ editing: null }); } })
        ),
        React.createElement(HxField, { label: 'Pesquisar (número, título, cliente)', value: flt.q, onChange: function (v) { updF('q', v); }, placeholder: 'ex.: O2026-0001' }),
        React.createElement(HxFilterBar, {
          active: active, open: flt.open, onToggle: function () { updF('open', !flt.open); },
          onClear: function () { setFlt(function (p) { return Object.assign({}, F0, { open: p.open }); }); }
        },
          React.createElement(HxRow, { cols: 3 },
            React.createElement(HxSelect, { label: 'Estado', value: flt.est, onChange: function (v) { updF('est', v); }, options: [{ v: 'todos', l: 'Todos' }].concat(HWX_OF_ESTADOS) }),
            React.createElement(HxSelect, { label: 'Cliente', value: flt.cli, onChange: function (v) { updF('cli', v); }, options: cliOpts }),
            React.createElement(HxSelect, { label: 'Ano', value: flt.ano, onChange: function (v) { updF('ano', v); }, options: anoOpts })
          )
        ),
        React.createElement(HxLoadState, { list: ofertas }),
        ofertas.rows !== null && React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginBottom: 8 } }, shown.length + ' de ' + rows.length + ' oferta(s)'),
        ofertas.rows !== null && rows.length === 0 && React.createElement(HxEmpty, { icon: '📄', text: 'Ainda não há ofertas', sub: 'Toca em "+ Nova oferta" para criar a primeira.' }),
        ofertas.rows !== null && rows.length > 0 && shown.length === 0 && React.createElement(HxEmpty, { icon: '🔎', text: 'Nenhuma oferta com estes filtros' }),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: ctx.wide ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)', gap: 12, alignItems: 'start' } },
          shown.map(function (o) {
            var wait = !!pending[o.id];
            var expirada = o.estado === 'enviada' && o.valida_ate && o.valida_ate < hoje;
            var wa = hwxOfertaWa(o, meuNome);
            var btns = [
              React.createElement(HxActBtn, { key: 'ab', icon: '✏️', label: 'Abrir', aria: 'Abrir ' + o.numero, disabled: wait, onClick: function () { setForm({ editing: o }); } }),
              React.createElement(HxActBtn, { key: 'dp', icon: '⧉', label: 'Duplicar', aria: 'Duplicar ' + o.numero, disabled: wait, onClick: function () { duplicar(o); } }),
              React.createElement(HxActBtn, { key: 'pr', icon: '🖨', label: 'Imprimir', aria: 'Imprimir ' + o.numero, disabled: wait, onClick: function () { props.onPrint(o); } })
            ];
            if (wa) btns.push(React.createElement(HxActBtn, { key: 'wa', icon: '💬', label: 'WhatsApp', aria: 'WhatsApp ' + o.numero, href: wa, blank: true }));
            if (o.estado === 'aceite') btns.push(React.createElement(HxActBtn, { key: 'tr', icon: '📅', label: 'Trabalho', aria: 'Criar trabalho ' + o.numero, disabled: wait, onClick: function () { criarTrabalho(o); } }));
            if (o.estado === 'aceite') btns.push(React.createElement(HxActBtn, { key: 'se', icon: '🔁', label: 'Série', aria: 'Criar série ' + o.numero, disabled: wait, onClick: function () { criarSerie(o); } }));
            btns.push(React.createElement(HxActBtn, { key: 'dl', icon: '🗑️', label: 'Apagar', kind: 'danger', aria: 'Apagar ' + o.numero, disabled: wait, onClick: function () { apagar(o); } }));
            var trs = (trabalhos.rows || []).filter(function (t) { return t.oferta_id === o.id; });
            var srs = (series.rows || []).filter(function (se) { return se.oferta_id === o.id; });
            return React.createElement('div', { key: o.id, style: Object.assign({}, HXS.card, { marginBottom: 0, opacity: o.estado === 'recusada' ? 0.7 : 1 }) },
              React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'flex-start' } },
                React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                  React.createElement('div', { style: { fontWeight: 800, fontSize: 18 } }, o.numero),
                  o.titulo && React.createElement('div', { style: { fontWeight: 700, fontSize: 15, wordBreak: 'break-word' } }, o.titulo)
                ),
                React.createElement(HxPill, { text: hwxLabel(HWX_OF_ESTADOS, o.estado), color: HWX_OF_COR[o.estado] })
              ),
              React.createElement('div', { style: { fontSize: 14, color: HX.muted, marginTop: 6, wordBreak: 'break-word' } }, hwxOfertaTituloCliente(o) || '(cliente apagado)'),
              React.createElement('div', { style: { fontSize: 14, color: HX.muted, marginTop: 2 } }, '📅 ' + hwxFmtDate(o.data) + (o.valida_ate ? ' · gültig bis ' + hwxFmtDate(o.valida_ate) : '')),
              expirada && React.createElement('div', null, React.createElement(HxPill, { text: 'Validade expirada em ' + hwxFmtDate(o.valida_ate) + ' — ainda sem resposta', color: HX.warn })),
              React.createElement('div', { style: { fontWeight: 800, fontSize: 26, marginTop: 8 } }, hwxChf(o.total)),
              trs.length > 0 && React.createElement('div', { style: { fontSize: 14, color: HX.okText, fontWeight: 700, marginTop: 2 } }, trs.map(function (t) { return '→ ' + t.numero; }).join(' · ')),
              srs.length > 0 && React.createElement('div', { style: { fontSize: 14, color: HX.okText, fontWeight: 700, marginTop: 2 } }, srs.map(function (se) { return '→ 🔁 ' + (se.descricao || 'série'); }).join(' · ')),
              React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(' + (btns.length <= 5 ? btns.length : btns.length === 6 ? 3 : 4) + ', minmax(0, 1fr))', gap: 8, marginTop: 12 } }, btns)
            );
          })
        )
      );
    }

    // Impressão da oferta (alemão, A4). NUNCA imprime notas internas, horas de referência nem o preço real por hora.
    function hwxMoneyDe(n) { return hwxChf(n).replace(/^CHF /, ''); }
    function HwxOfertaPrint(props) {
      var o = props.oferta, rem = (props.cfg.row && props.cfg.row.remetente) || {};
      var cs = o.cliente_snap || {}, ls = o.local_snap || {};
      var _s = React.useState(1); var scale = _s[0], setScale = _s[1];
      React.useEffect(function () {
        var upd = function () { var w = window.innerWidth; setScale(w < 820 ? (w - 16) / 794 : 1); };
        upd();
        window.addEventListener('resize', upd);
        return function () { window.removeEventListener('resize', upd); };
      }, []);
      var plzOrt = function (a) { return [a.plz, a.ort].filter(Boolean).join(' '); };
      var remPlzOrt = [rem.plz, rem.ort].filter(Boolean).join(' ') || rem.plz_ort || '';
      var ort = rem.ort || (rem.plz_ort ? String(rem.plz_ort).replace(/^\s*\d{4}\s*/, '') : '');
      var tot = hwxOfertaTotais(o.linhas, o.desconto_tipo, o.desconto_valor);
      // Arbeitsort: só se for diferente da morada de quem paga
      var temLocal = !!(ls.rua || ls.nome || ls.plz || ls.ort);
      var difere = temLocal && (String(ls.rua || '') !== String(cs.rua || '') || String(ls.plz || '') !== String(cs.plz || '') || String(ls.ort || '') !== String(cs.ort || ''));
      var linhasTr = (o.linhas || []).map(function (l, i) {
        var acr = Number(l.acrescimo_hora) || 0;
        var acrU = l.unidade === '30min' ? acr / 2 : acr;
        return React.createElement('tr', { key: i },
          React.createElement('td', null, React.createElement('div', { className: 'hwx-pos' }, l.descricao)),
          React.createElement('td', { className: 'num' }, hwxQty(l.qtd)),
          React.createElement('td', null, HWX_UNIT_DE[l.unidade] || l.unidade),
          React.createElement('td', { className: 'num' }, hwxMoneyDe(l.preco), acr > 0 ? ' + ' + hwxMoneyDe(acrU) + ' Anfahrt' : ''),
          React.createElement('td', { className: 'num' }, hwxMoneyDe(hwxFromRappen(hwxLinhaTotalR(l))))
        );
      });
      var css =
        '.hwx-sheet,.hwx-sheet *{box-sizing:border-box;}' +
        '.hwx-sheet{width:210mm;min-height:297mm;padding:18mm 18mm 14mm;background:#fff;color:#111;font-family:Helvetica,Arial,sans-serif;display:flex;flex-direction:column;box-shadow:0 8px 40px rgba(0,0,0,.4);}' +
        '.hwx-sheet .top{display:flex;justify-content:space-between;align-items:flex-start;}' +
        '.hwx-sheet .sender{font-size:9.5pt;line-height:1.5;}' +
        '.hwx-sheet .sender .name{font-weight:700;font-size:10.5pt;}' +
        '.hwx-sheet .sender .line{color:#555;}' +
        '.hwx-sheet .doctype{text-align:right;}' +
        '.hwx-sheet .doctype h1{margin:0;font-size:17pt;font-weight:600;letter-spacing:.22em;text-transform:uppercase;}' +
        '.hwx-sheet .doctype .nr{margin-top:4px;font-size:10pt;font-weight:600;}' +
        '.hwx-sheet .doctype .place{margin-top:2px;font-size:9pt;color:#555;}' +
        '.hwx-sheet .rule{height:1px;background:#111;margin-top:12px;}' +
        '.hwx-sheet .band{display:flex;gap:10mm;margin-top:18px;}' +
        '.hwx-sheet .eyebrow{font-size:7.5pt;letter-spacing:.14em;text-transform:uppercase;color:#555;margin-bottom:5px;}' +
        '.hwx-sheet .addr{font-size:10pt;line-height:1.5;}' +
        '.hwx-sheet .addr .org{font-weight:700;}' +
        '.hwx-sheet h2{margin:18px 0 0;font-size:12pt;font-weight:700;}' +
        '.hwx-sheet table{width:100%;border-collapse:collapse;margin-top:14px;font-size:9.5pt;}' +
        '.hwx-sheet thead th{font-size:7.5pt;letter-spacing:.12em;text-transform:uppercase;color:#555;font-weight:600;text-align:left;padding:0 6px 5px 0;border-bottom:1px solid #111;}' +
        '.hwx-sheet thead th.num{text-align:right;}' +
        '.hwx-sheet tbody td{padding:7px 6px 7px 0;border-bottom:1px solid #ddd;vertical-align:top;}' +
        '.hwx-sheet td.num{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;}' +
        '.hwx-sheet .hwx-pos{font-weight:600;}' +
        '.hwx-sheet tr{break-inside:avoid;page-break-inside:avoid;}' +
        '.hwx-sheet .totals{margin-top:14px;display:flex;justify-content:flex-end;}' +
        '.hwx-sheet .totals .box{width:80mm;}' +
        '.hwx-sheet .totals .row{display:flex;justify-content:space-between;padding:4px 0;font-size:9.5pt;color:#555;}' +
        '.hwx-sheet .totals .row span:last-child{color:#111;font-variant-numeric:tabular-nums;}' +
        '.hwx-sheet .totals .grand{display:flex;justify-content:space-between;align-items:baseline;margin-top:5px;padding-top:8px;border-top:2px solid #111;}' +
        '.hwx-sheet .totals .grand .lbl{font-size:9pt;font-weight:700;letter-spacing:.08em;text-transform:uppercase;}' +
        '.hwx-sheet .totals .grand .val{font-size:15pt;font-weight:700;font-variant-numeric:tabular-nums;}' +
        '.hwx-sheet .mwst{margin-top:6px;font-size:7.5pt;color:#666;text-align:right;}' +
        '.hwx-sheet .valid{margin-top:16px;font-size:10pt;font-weight:600;}' +
        '.hwx-sheet .notes{margin-top:10px;font-size:9.5pt;line-height:1.5;white-space:pre-wrap;color:#222;}' +
        '.hwx-sheet footer{margin-top:auto;padding-top:12px;border-top:1px solid #ddd;font-size:8pt;color:#555;display:flex;justify-content:space-between;}' +
        '@media print{' +
        '  @page{size:A4 portrait;margin:0;}' +
        '  .hwx-noprint{display:none!important;}' +
        '  #__err_toasts,#__cs_offline_banner{display:none!important;}' +
        '  body{margin:0!important;padding:0!important;background:#fff!important;}' +
        '  .hwx-print-outer{background:#fff!important;}' +
        '  .hwx-scale-outer{background:#fff!important;padding:0!important;overflow:visible!important;width:100%!important;}' +
        '  .hwx-scale-inner{transform:none!important;width:100%!important;height:auto!important;}' +
        '  .hwx-sheet{box-shadow:none!important;}' +
        '  *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}' +
        '}';
      return React.createElement('div', { className: 'hwx-print-outer', style: { background: '#737373', minHeight: '100vh' } },
        React.createElement('div', { className: 'hwx-noprint', style: { background: '#0a0a0a', borderBottom: '1px solid ' + HX.border, padding: '10px 16px', display: 'flex', gap: 10, position: 'sticky', top: 0, zIndex: 10 } },
          React.createElement(HxBtn, { label: '← Zurück', onClick: props.onBack }),
          React.createElement(HxBtn, { label: '🖨 Drucken / PDF', kind: 'primary', onClick: function () { window.print(); } })
        ),
        React.createElement('div', { className: 'hwx-scale-outer', style: { width: '100%', overflow: 'hidden', paddingBottom: 32 } },
          React.createElement('div', { className: 'hwx-scale-inner', style: { width: 794, transformOrigin: 'top left', transform: 'scale(' + scale + ')', height: scale < 1 ? (1123 * scale) + 'px' : 'auto' } },
            React.createElement('div', { className: 'hwx-sheet', id: 'hwx-print-page' },
              React.createElement('div', { className: 'top' },
                React.createElement('div', { className: 'sender' },
                  React.createElement('div', { className: 'name' }, rem.nome || ''),
                  rem.rua && React.createElement('div', { className: 'line' }, rem.rua),
                  remPlzOrt && React.createElement('div', { className: 'line' }, remPlzOrt),
                  rem.telefone && React.createElement('div', { className: 'line' }, rem.telefone),
                  rem.email && React.createElement('div', { className: 'line' }, rem.email)
                ),
                React.createElement('div', { className: 'doctype' },
                  React.createElement('h1', null, 'Offerte'),
                  React.createElement('div', { className: 'nr' }, o.numero),
                  React.createElement('div', { className: 'place' }, (ort ? ort + ', ' : '') + hwxFmtDate(o.data))
                )
              ),
              React.createElement('div', { className: 'rule' }),
              React.createElement('div', { className: 'band' },
                React.createElement('div', { style: { flex: 1 } },
                  React.createElement('div', { className: 'eyebrow' }, 'Offerte an'),
                  React.createElement('div', { className: 'addr' },
                    React.createElement('div', { className: 'org' }, cs.firma || cs.nome || ''),
                    cs.contacto_nome && React.createElement('div', null, 'z.H. ' + cs.contacto_nome),
                    cs.rua && React.createElement('div', null, cs.rua),
                    plzOrt(cs) && React.createElement('div', null, plzOrt(cs))
                  )
                ),
                difere && React.createElement('div', { style: { flex: 1 } },
                  React.createElement('div', { className: 'eyebrow' }, 'Arbeitsort'),
                  React.createElement('div', { className: 'addr' },
                    ls.nome && ls.nome !== ls.rua && React.createElement('div', { className: 'org' }, ls.nome),
                    ls.rua && React.createElement('div', null, ls.rua),
                    plzOrt(ls) && React.createElement('div', null, plzOrt(ls))
                  )
                )
              ),
              o.titulo && React.createElement('h2', null, o.titulo),
              React.createElement('table', null,
                React.createElement('thead', null, React.createElement('tr', null,
                  React.createElement('th', null, 'Position'), React.createElement('th', { className: 'num' }, 'Menge'), React.createElement('th', null, 'Einheit'),
                  React.createElement('th', { className: 'num' }, 'Ansatz'), React.createElement('th', { className: 'num' }, 'Betrag CHF'))),
                React.createElement('tbody', null, linhasTr)
              ),
              React.createElement('div', { className: 'totals' },
                React.createElement('div', { className: 'box' },
                  React.createElement('div', { className: 'row' }, React.createElement('span', null, 'Zwischensumme'), React.createElement('span', null, hwxMoneyDe(hwxFromRappen(tot.sub)))),
                  tot.desc > 0 && React.createElement('div', { className: 'row' }, React.createElement('span', null, o.desconto_tipo === 'pct' ? 'Rabatt ' + hwxQty(o.desconto_valor) + ' %' : 'Rabatt'), React.createElement('span', null, '− ' + hwxMoneyDe(hwxFromRappen(tot.desc)))),
                  React.createElement('div', { className: 'grand' }, React.createElement('span', { className: 'lbl' }, 'Total CHF'), React.createElement('span', { className: 'val' }, hwxMoneyDe(hwxFromRappen(tot.total)))),
                  rem.mwst_nota !== false && React.createElement('div', { className: 'mwst' }, 'Nicht MWST-pflichtig')
                )
              ),
              o.valida_ate && React.createElement('div', { className: 'valid' }, 'Gültig bis ' + hwxFmtDate(o.valida_ate)),
              o.notas_cliente && React.createElement('div', { className: 'notes' }, o.notas_cliente),
              React.createElement('footer', null,
                React.createElement('span', null, 'Vielen Dank für Ihre Anfrage.'),
                React.createElement('span', null, [rem.nome, remPlzOrt].filter(Boolean).join(' · '))
              )
            )
          )
        ),
        React.createElement('style', null, css)
      );
    }

    // ── APP ──
    function HwxApp(props) {
      var onBack = props.onBack;
      var wide = hwxUseWide();
      var _t = React.useState('agenda'); var tab = _t[0], setTab = _t[1];
      var _tp = React.useState(null); var trabPreset = _tp[0], setTrabPreset = _tp[1];
      var _sp = React.useState(null); var serPreset = _sp[0], setSerPreset = _sp[1];
      var _ta = React.useState(null); var trabAbrir = _ta[0], setTrabAbrir = _ta[1];
      var _po = React.useState(null); var printOf = _po[0], setPrintOf = _po[1];
      var _n = React.useState(null); var notice = _n[0], setNotice = _n[1];
      var _fo = React.useState(0); var formCount = _fo[0], setFormCount = _fo[1];
      var _dg = React.useState(null); var dlg = _dg[0], setDlg = _dg[1];
      var timerRef = React.useRef(null);
      var _c = React.useState({ loaded: false, failed: false, row: null });
      var cfg = _c[0], setCfg = _c[1];
      var alive = React.useRef(true);
      var cfgRowRef = React.useRef(null);
      var queueRef = React.useRef({ busy: false, pending: null });
      var slotsRef = React.useRef({});
      var escRef = React.useRef([]);
      var dlgRef = React.useRef(null);
      dlgRef.current = dlg;

      var notify = React.useCallback(function (kind, text) {
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
        if (!kind) { setNotice(null); return; }
        setNotice({ kind: kind, text: text });
        if (kind === 'ok') {
          timerRef.current = setTimeout(function () { setNotice(null); timerRef.current = null; }, 2000);
        }
      }, []);

      // proteção contra perder alterações: formulários registam-se aqui
      var guard = React.useMemo(function () {
        return {
          set: function (key, dirty, save) {
            if (dirty) slotsRef.current[key] = { save: save }; else delete slotsRef.current[key];
          },
          attempt: function (action, keys) {
            var ks = (keys || Object.keys(slotsRef.current)).filter(function (k) { return !!slotsRef.current[k]; });
            if (!ks.length) { action(); return; }
            setDlg({ action: action, keys: ks });
          },
          pushEsc: function (fn) {
            escRef.current.push(fn);
            return function () { var i = escRef.current.indexOf(fn); if (i >= 0) escRef.current.splice(i, 1); };
          }
        };
      }, []);
      var ui = React.useMemo(function () {
        return { formOpen: function (on) { setFormCount(function (n) { return Math.max(0, n + (on ? 1 : -1)); }); } };
      }, []);

      var dlgSave = function () {
        var d = dlgRef.current;
        if (!d) return;
        var keys = d.keys;
        var step = function (i) {
          if (i >= keys.length) { setDlg(null); d.action(); return; }
          var s = slotsRef.current[keys[i]];
          if (!s) { step(i + 1); return; }
          s.save(function () { step(i + 1); }, function () { setDlg(null); });
        };
        step(0);
      };
      var dlgDiscard = function () {
        var d = dlgRef.current;
        if (!d) return;
        d.keys.forEach(function (k) { delete slotsRef.current[k]; });
        setDlg(null);
        d.action();
      };

      // Esc: fecha o diálogo ("continuar a editar") ou o formulário aberto; recarregar/fechar a página com alterações pergunta
      React.useEffect(function () {
        var onKey = function (e) {
          if (e.key !== 'Escape') return;
          if (dlgRef.current) { setDlg(null); return; }
          var top = escRef.current[escRef.current.length - 1];
          if (top) top();
        };
        var onUnload = function (e) {
          if (Object.keys(slotsRef.current).length) { e.preventDefault(); e.returnValue = ''; return ''; }
        };
        window.addEventListener('keydown', onKey);
        window.addEventListener('beforeunload', onUnload);
        return function () {
          window.removeEventListener('keydown', onKey);
          window.removeEventListener('beforeunload', onUnload);
        };
      }, []);

      var loadCfg = function () {
        if (!window.supabaseClient) {
          setCfg({ loaded: true, failed: true, row: null });
          hwxFail(notify, 'carregar hwx_config', { message: 'Sem ligação à base de dados.' }, false);
          return;
        }
        window.supabaseClient.from('hwx_config').select('*').order('created_at', { ascending: true }).limit(1).maybeSingle().then(function (res) {
          if (!alive.current) return;
          if (res.error) {
            setCfg(function (p) { return { loaded: true, failed: true, row: p.row }; });
            hwxFail(notify, 'carregar hwx_config', res.error, false);
            return;
          }
          cfgRowRef.current = res.data || null;
          setCfg({ loaded: true, failed: false, row: res.data || null });
        }).catch(function (e) {
          if (!alive.current) return;
          setCfg(function (p) { return { loaded: true, failed: true, row: p.row }; });
          hwxFail(notify, 'carregar hwx_config', e, false);
        });
      };

      // Grava colunas de hwx_config (parcial). Fila: nunca duas gravações ao mesmo tempo (evita duas linhas).
      var saveCfg = React.useCallback(function (partial, onOk, onFail) {
        var q = queueRef.current;
        if (q.busy) {
          var prev = q.pending || { partial: {}, cbs: [] };
          q.pending = { partial: Object.assign({}, prev.partial, partial), cbs: prev.cbs.concat([{ ok: onOk, fail: onFail }]) };
          return;
        }
        var run = function (part, cbs) {
          q.busy = true;
          var finish = function (success) {
            q.busy = false;
            cbs.forEach(function (cb) { if (success) { if (cb.ok) cb.ok(); } else if (cb.fail) cb.fail(); });
            if (q.pending) { var p = q.pending; q.pending = null; run(p.partial, p.cbs); }
          };
          var write = function (row) {
            hwxWrite('hwx_config', row ? row.id : null, part, notify, function (saved) {
              cfgRowRef.current = saved;
              if (alive.current) setCfg({ loaded: true, failed: false, row: saved });
            }, finish);
          };
          if (cfgRowRef.current) { write(cfgRowRef.current); return; }
          // sem linha conhecida: ler primeiro (a base pode já a ter criado) antes de decidir entre inserir e atualizar
          if (!window.supabaseClient) { hwxFail(notify, 'carregar hwx_config', { message: 'Sem ligação à base de dados.' }, true); finish(false); return; }
          window.supabaseClient.from('hwx_config').select('*').order('created_at', { ascending: true }).limit(1).maybeSingle().then(function (res) {
            if (res.error) { hwxFail(notify, 'carregar hwx_config', res.error, true); finish(false); return; }
            cfgRowRef.current = res.data || null;
            write(res.data || null);
          }).catch(function (e) { hwxFail(notify, 'carregar hwx_config', e, true); finish(false); });
        };
        run(partial, [{ ok: onOk, fail: onFail }]);
      }, []);

      React.useEffect(function () {
        alive.current = true;
        loadCfg();
        var off = window.csAoVoltarRede(function () { loadCfg(); });
        return function () {
          alive.current = false;
          off();
          if (timerRef.current) clearTimeout(timerRef.current);
        };
      }, []);

      var TABS = [
        { id: 'agenda', icon: '📅', label: 'Agenda' },
        { id: 'ofertas', icon: '📄', label: 'Ofertas' },
        { id: 'clientes', icon: '👥', label: 'Clientes' },
        { id: 'precos', icon: '🏷️', label: 'Preços' },
        { id: 'totais', icon: '📊', label: 'Totais' },
        { id: 'ajustes', icon: '⚙️', label: 'Ajustes' }
      ];

      var zonas = (cfg.row && Array.isArray(cfg.row.zonas)) ? cfg.row.zonas : [];
      var cats = (cfg.row && Array.isArray(cfg.row.categorias) && cfg.row.categorias.length) ? cfg.row.categorias : HWX_DEFAULT_CATS;

      var goTab = function (id) { if (id !== tab) guard.attempt(function () { setTab(id); }); };

      var precoBase = cfg.row && cfg.row.preco_base_hora != null && isFinite(Number(cfg.row.preco_base_hora)) ? Number(cfg.row.preco_base_hora) : 35;
      var meuNome = (cfg.row && cfg.row.remetente && cfg.row.remetente.nome) || '';

      // vista de impressão da oferta: substitui o ecrã todo (como na impressão da Hauswart)
      if (printOf) {
        return React.createElement(HwxOfertaPrint, { oferta: printOf, cfg: cfg, onBack: function () { setPrintOf(null); } });
      }

      hwxSetRefA(cfg.row && cfg.row.remetente && cfg.row.remetente.semana_a_ref);
      var horasSexta = cfg.row && cfg.row.horas_sexta != null && Number(cfg.row.horas_sexta) > 0 ? Number(cfg.row.horas_sexta) : 8;
      var body;
      if (tab === 'agenda') body = cfg.loaded ? React.createElement(HwxAgenda, { notify: notify, cats: cats, zonas: zonas, meuNome: meuNome, precoBase: precoBase, saveCfg: saveCfg, horasSexta: horasSexta, onReloadCfg: loadCfg, preset: trabPreset, onPresetUsed: function () { setTrabPreset(null); }, seriePreset: serPreset, onSerieUsed: function () { setSerPreset(null); }, abrir: trabAbrir, onAbrirUsado: function () { setTrabAbrir(null); } }) : React.createElement(HxEmpty, { icon: '⏳', text: 'A carregar…' });
      else if (tab === 'ofertas') body = cfg.loaded ? React.createElement(HwxOfertas, { notify: notify, cats: cats, zonas: zonas, meuNome: meuNome, precoBase: precoBase, saveCfg: saveCfg, onPrint: setPrintOf, onReloadCfg: loadCfg, onCriarTrabalho: function (pr) { setTrabPreset(pr); setTab('agenda'); }, onCriarSerie: function (pr) { setSerPreset(pr); setTab('agenda'); } }) : React.createElement(HxEmpty, { icon: '⏳', text: 'A carregar…' });
      else if (tab === 'totais') body = cfg.loaded ? React.createElement(HwxTotais, { notify: notify, cats: cats, cfg: cfg, profile: props.profile, onAbrirTrabalho: function (t) { setTrabAbrir(t); setTab('agenda'); } }) : React.createElement(HxEmpty, { icon: '⏳', text: 'A carregar…' });
      else if (tab === 'precos') body = React.createElement(HwxPrecos, { notify: notify, cats: cats, precoBase: precoBase });
      else if (tab === 'clientes') body = React.createElement(HwxClientes, { notify: notify, cats: cats, zonas: zonas, saveCfg: saveCfg, precoBase: precoBase, contador: cfg.row ? cfg.row.ultimo_numero_cliente : 0, onReloadCfg: loadCfg });
      else if (!cfg.loaded) body = React.createElement(HxEmpty, { icon: '⏳', text: 'A carregar…' });
      else body = React.createElement(HwxAjustes, { notify: notify, cfg: cfg, cats: cats, zonas: zonas, saveCfg: saveCfg, onReload: loadCfg });

      var dlgKeys = dlg ? dlg.keys : [];

      return React.createElement(HxCtx.Provider, { value: { wide: wide, guard: guard, ui: ui } },
        React.createElement('div', { style: { fontFamily: 'system-ui,sans-serif', background: HX.bg, color: HX.text, minHeight: '100vh', display: 'flex', flexDirection: 'column', colorScheme: 'dark', accentColor: '#a3a3a3' } },
          React.createElement('div', { style: { background: '#0a0a0a', borderBottom: '1px solid ' + HX.border } },
            React.createElement('div', { style: { maxWidth: HWX_MAXW, margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 } },
              React.createElement(HxBtn, { label: '← Hauswart', onClick: function () { guard.attempt(onBack); } }),
              React.createElement('div', { style: { fontWeight: 800, fontSize: 18 } }, 'Hauswart Extra')
            )
          ),
          React.createElement('div', { style: { flex: 1, width: '100%', maxWidth: HWX_MAXW, margin: '0 auto', padding: 16, paddingBottom: 100, boxSizing: 'border-box' } },
            React.createElement(HxBanner, { notice: notice, onClose: function () { notify(null); } }),
            body
          ),
          formCount === 0 && React.createElement('nav', { style: { background: '#0a0a0a', borderTop: '1px solid ' + HX.border, position: 'fixed', bottom: 0, left: 0, right: 0, paddingBottom: 'env(safe-area-inset-bottom)', zIndex: 10 } },
            React.createElement('div', { style: { maxWidth: HWX_MAXW, margin: '0 auto', display: 'flex' } },
              TABS.map(function (t) {
                var active = tab === t.id;
                return React.createElement('button', {
                  key: t.id, type: 'button', onClick: function () { goTab(t.id); }, 'aria-current': active ? 'page' : undefined,
                  style: { flex: 1, minHeight: 56, background: active ? HX.surface2 : 'transparent', border: 'none', borderTop: '3px solid ' + (active ? HX.text : 'transparent'), color: active ? HX.text : HX.muted, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, fontFamily: 'inherit' }
                },
                  React.createElement('span', { style: { fontSize: 20 } }, t.icon),
                  React.createElement('span', { style: { fontSize: 12, fontWeight: 700 } }, t.label)
                );
              })
            )
          ),
          dlg && React.createElement(HxModal, { title: 'Tens alterações por guardar' },
            React.createElement('div', { style: { fontSize: 15, color: HX.muted, marginBottom: 14 } }, 'Se saíres agora, o que escreveste' + (dlgKeys.length > 1 ? ' (em ' + dlgKeys.length + ' formulários)' : '') + ' perde-se.'),
            React.createElement('div', { style: { display: 'grid', gap: 10 } },
              React.createElement(HxBtn, { label: '✓ Guardar', kind: 'primary', full: true, onClick: dlgSave }),
              React.createElement(HxBtn, { label: 'Descartar', kind: 'danger', full: true, onClick: dlgDiscard }),
              React.createElement(HxBtn, { label: 'Continuar a editar', full: true, onClick: function () { setDlg(null); } })
            )
          )
        )
      );
    }

    window.HwxApp = HwxApp;

  } catch (e) {
    console.error('[hwx] erro ao carregar', e);
  }
})();
