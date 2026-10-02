// ── HAUSWART EXTRA ────────────────────────────────────────────────────
// Parte nova e separada da Hauswart: trabalhos leves às sextas (casa leve,
// compras, ajuda com PC e telemóvel). Admin only (só é aberta a partir do
// botão "➕ Extra" do HauswartApp). Preços, Clientes (com locais) e Ajustes.
// Tabelas hwx_clientes, hwx_servicos, hwx_locais, hwx_config
// (sql/24_hwx_base.sql + sql/25_hwx_melhorias.sql).
// Nunca lê nem escreve hauswart_data. localStorage só para lembrar filtros (hwx_f_*).
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

    // Preço + período + mínimo / horas incluídas
    function hwxPriceText(s) {
      if (s.estado === 'consulta') return 'Preço sob consulta';
      var u = hwxUnit(s.unidade);
      var base = hwxChf(s.preco) + (u.v === 'fixo' ? ' fixo' : ' ' + u.s);
      if (HWX_UNITS_MIN.indexOf(s.unidade) !== -1) {
        if (s.minimo != null && Number(s.minimo) > 0) {
          var suf = s.unidade === 'hora' ? ' Std.' : s.unidade === '30min' ? ' × 30 Min.' : ' Stk.';
          base += ' · mín. ' + hwxQty(s.minimo) + suf;
        }
      } else if (s.horas_incluidas != null && Number(s.horas_incluidas) > 0) {
        base += ' · inkl. ' + hwxQty(s.horas_incluidas) + ' Std.';
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
      if (code === 'PGRST205' && /hwx_(clientes|servicos|config)\b/.test(msg)) {
        text = 'Tabelas hwx_ ainda não criadas — correr sql/24_hwx_base.sql';
      } else if (code === 'PGRST205' || code === 'PGRST204' || code === '42703' || code === '42P01') {
        text = 'Base de dados por atualizar — correr sql/25_hwx_melhorias.sql';
      } else if (code === '23505') {
        text = /numero/.test(msg + ' ' + (err.details || '')) && !/sub_numero/.test(msg + ' ' + (err.details || ''))
          ? 'Não gravado — esse número de cliente já está a ser usado por outro cliente.'
          : /sub_numero/.test(msg + ' ' + (err.details || ''))
            ? 'Não gravado — esse subnúmero já está a ser usado neste cliente.'
            : 'Não gravado — já existe um registo igual.';
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

    function HxField(props) {
      var inputProps = {
        value: props.value == null ? '' : props.value,
        onChange: function (e) { props.onChange(e.target.value); },
        placeholder: props.placeholder || '',
        autoComplete: 'off',
        style: HXS.input
      };
      var el;
      if (props.multiline) {
        inputProps.rows = props.rows || 3;
        inputProps.style = Object.assign({}, HXS.input, { resize: 'vertical' });
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
      return React.createElement('div', { style: { marginBottom: props.tight ? 0 : 12, minWidth: 0 } },
        props.label && React.createElement('label', { style: HXS.label }, props.label),
        el,
        props.hint && React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginTop: 4 } }, props.hint),
        props.warn && React.createElement('div', { style: HXS.warn }, '⚠️ ' + props.warn),
        props.error && React.createElement('div', { style: HXS.err }, props.error)
      );
    }

    function HxDate(props) {
      return React.createElement('div', { style: { marginBottom: 12, minWidth: 0 } },
        React.createElement('label', { style: HXS.label }, props.label),
        React.createElement('input', {
          type: 'date', value: props.value || '', autoComplete: 'off',
          onChange: function (e) { props.onChange(e.target.value); },
          style: HXS.input
        })
      );
    }

    function HxSelect(props) {
      return React.createElement('div', { style: { marginBottom: props.tight ? 0 : 12, minWidth: 0 } },
        props.label && React.createElement('label', { style: HXS.label }, props.label),
        React.createElement('select', {
          value: props.value, autoComplete: 'off',
          onChange: function (e) { props.onChange(e.target.value); },
          style: Object.assign({}, HXS.input, { padding: '10px 8px' })
        }, props.options.map(function (o) {
          return React.createElement('option', { key: o.v, value: o.v }, o.l);
        })),
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
        style: { position: 'sticky', top: 0, zIndex: 30, background: bg, border: '1px solid ' + col, borderRadius: 10, padding: '10px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10, color: tx, fontSize: 14, fontWeight: 600 }
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
        React.createElement('div', { style: { background: HX.surface, border: '1px solid ' + HX.borderStrong, borderRadius: 14, padding: 18, width: '100%', maxWidth: 440, color: HX.text } },
          React.createElement('div', { style: { fontWeight: 800, fontSize: 18, marginBottom: 8 } }, props.title),
          props.children
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
        var minTxt = String(usaMin ? f.minimo : f.horas_incluidas).trim();
        var qtd = minTxt === '' ? null : hwxNum(minTxt);
        if (!nome) e.nome = 'Indica o nome do serviço.';
        if (preco === null || preco < 0 || preco > 99999999.99) e.preco = 'Indica um preço válido (ex.: 45 ou 45,50).';
        if (minTxt !== '' && (qtd === null || qtd <= 0 || qtd > (usaMin ? 999.99 : 9999.99))) {
          e[usaMin ? 'minimo' : 'horas_incluidas'] = 'Tem de ser maior que 0 (ex.: 1 ou 1,5), ou deixa vazio.';
        }
        if (f.estado === 'sazonal' && !f.meses.length) e.meses = 'Escolhe pelo menos um mês.';
        setErrs(e);
        if (Object.keys(e).length) { if (fail) fail(); return; }
        var payload = {
          nome: nome, categoria: f.categoria, unidade: f.unidade,
          preco: hwxFromRappen(hwxToRappen(preco)),
          minimo: usaMin && qtd !== null ? Math.round(qtd * 100) / 100 : null,
          horas_incluidas: !usaMin && qtd !== null ? Math.round(qtd * 100) / 100 : null,
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
      var catOpts = cats.map(function (c) { return { v: c.id, l: c.nome }; });
      if (f.categoria && !cats.some(function (c) { return c.id === f.categoria; })) catOpts.push({ v: f.categoria, l: f.categoria + ' (já não existe)' });

      return React.createElement(HxFormShell, { title: editing ? 'Editar serviço' : 'Novo serviço', onCancel: tryClose, onSave: function () { doSave(); }, busy: busy },
        React.createElement(HxField, { label: 'Nome', value: f.nome, onChange: function (v) { upd('nome', v); }, error: errs.nome, placeholder: 'ex.: Ajuda com telemóvel', onEnter: function () { doSave(); } }),
        React.createElement(HxSelect, { label: 'Categoria', value: f.categoria, options: catOpts, onChange: function (v) { upd('categoria', v); } }),
        React.createElement(HxRow, { cols: 2 },
          React.createElement(HxField, { label: 'Preço (CHF)', value: f.preco, inputMode: 'decimal', onChange: function (v) { upd('preco', v); }, error: errs.preco, placeholder: '0.00', onEnter: function () { doSave(); } }),
          React.createElement(HxSelect, { label: 'Unidade', value: f.unidade, options: HWX_UNITS.map(function (u) { return { v: u.v, l: u.l }; }), onChange: function (v) { upd('unidade', v); } })
        ),
        usaMin
          ? React.createElement(HxField, { label: 'Mínimo (ex.: 1)', value: f.minimo, inputMode: 'decimal', onChange: function (v) { upd('minimo', v); }, error: errs.minimo, placeholder: 'quantidade mínima', onEnter: function () { doSave(); } })
          : React.createElement(HxField, { label: 'Horas incluídas', value: f.horas_incluidas, inputMode: 'decimal', onChange: function (v) { upd('horas_incluidas', v); }, error: errs.horas_incluidas, placeholder: 'ex.: 10', onEnter: function () { doSave(); } }),
        React.createElement(HxSelect, { label: 'Estado', value: f.estado, options: HWX_SERV_ESTADOS, onChange: function (v) { upd('estado', v); } }),
        f.estado === 'pausado' && React.createElement(HxDate, { label: 'Pausado até (opcional)', value: f.pausado_ate, onChange: function (v) { upd('pausado_ate', v); } }),
        f.estado === 'sazonal' && React.createElement('div', null,
          React.createElement('label', { style: HXS.label }, 'Meses em que se faz'),
          React.createElement(HxChips, { items: HWX_MONTHS.map(function (m, i) { return { v: i + 1, l: m }; }), value: f.meses, onToggle: toggleMes }),
          errs.meses && React.createElement('div', { style: Object.assign({}, HXS.err, { marginTop: -8, marginBottom: 12 }) }, errs.meses)
        ),
        f.estado === 'consulta' && React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginBottom: 12 } }, 'Na lista aparece "Preço sob consulta"; o preço pode ficar vazio.'),
        React.createElement(HxField, { label: 'Nota', value: f.nota, multiline: true, onChange: function (v) { upd('nota', v); } })
      );
    }

    function HwxPrecos(props) {
      var notify = props.notify, cats = props.cats, ctx = React.useContext(HxCtx);
      var list = hwxUseList('hwx_servicos', 'ordem', notify);
      var F0 = { q: '', cat: 'all', uni: 'all', est: 'visiveis', sort: 'ordem', open: false };

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
          editing: form.editing, preset: form.preset, cats: cats, notify: notify, guard: ctx.guard, ordemNova: maxOrdem + 1,
          onSaved: replaceRow, onClose: function () { setForm(null); }
        });
      }

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
        React.createElement(HxField, { label: 'Pesquisar por nome', value: flt.q, onChange: function (v) { updF('q', v); }, list: 'hwx-dl-servicos', placeholder: 'nome do serviço' }),
        React.createElement('datalist', { id: 'hwx-dl-servicos' }, rows.map(function (r) { return React.createElement('option', { key: r.id, value: r.nome }); })),
        React.createElement(HxFilterBar, {
          active: active, open: flt.open, onToggle: function () { updF('open', !flt.open); },
          onClear: function () { setFlt(function (p) { return Object.assign({}, F0, { sort: p.sort, open: p.open }); }); }
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
    function hwxZonaOpts(zonas, atual, vazio) {
      var opts = [{ v: '', l: vazio }].concat(zonas.map(function (z) { return { v: z.nome, l: z.nome + ' (' + hwxChf(z.valor) + ')' }; }));
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
        if (Object.keys(e).length) { if (fail) fail(); return; }
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
        React.createElement(HxField, { label: 'Rua', value: f.rua, onChange: function (v) { upd('rua', v); }, onEnter: function () { doSave(); } }),
        React.createElement(HxRow, { cols: 2 },
          React.createElement(HxField, { label: 'PLZ', value: f.plz, inputMode: 'numeric', onChange: function (v) { upd('plz', v); }, warn: hwxPlzWarn(f.plz), onEnter: function () { doSave(); } }),
          React.createElement(HxField, { label: 'Localidade', value: f.ort, onChange: function (v) { upd('ort', v); }, onEnter: function () { doSave(); } })
        ),
        React.createElement(HxSelect, { label: 'Zona', value: f.zona, options: hwxZonaOpts(zonas, f.zona, '— a do cliente —'), onChange: function (v) { upd('zona', v); } }),
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
        if (Object.keys(e).length) { if (fail) fail(); return; }
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
            React.createElement(HxSelect, { label: 'Zona por defeito', value: f.zona, options: zonaOpts, onChange: function (v) { upd('zona', v); } })
          ),
          zonas.length === 0 && React.createElement('div', { style: { fontSize: 13, color: HX.warnText, marginTop: -6 } }, 'Ainda não há zonas — cria-as em Ajustes.')
        ),
        React.createElement(HxSection, { title: '💰 QUEM PAGA' },
          React.createElement(HxField, { label: 'Firma (opcional)', value: f.firma, onChange: function (v) { upd('firma', v); }, onEnter: enter }),
          React.createElement(HxField, { label: 'Rua', value: f.rua, onChange: function (v) { upd('rua', v); }, onEnter: enter }),
          React.createElement(HxRow, { cols: 2 },
            React.createElement(HxField, { label: 'PLZ', value: f.plz, inputMode: 'numeric', onChange: function (v) { upd('plz', v); }, warn: hwxPlzWarn(f.plz), onEnter: enter }),
            React.createElement(HxField, { label: 'Localidade', value: f.ort, onChange: function (v) { upd('ort', v); }, onEnter: enter })
          )
        ),
        React.createElement(HxSection, { title: '👤 CONTACTO' },
          React.createElement(HxField, { label: 'Nome', value: f.c_nome, onChange: function (v) { upd('c_nome', v); }, onEnter: enter }),
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

      var delCliente = function (c) {
        if (pending[c.id]) return;
        var nl = locaisDe(c.id).length;
        if (!window.confirm('Apagar o cliente #' + c.numero + ' "' + (c.firma || c.nome) + '"?' + (nl ? '\nIsto apaga também os ' + nl + ' local(is) de trabalho.' : ''))) return;
        setPending(function (p) { var n = Object.assign({}, p); n[c.id] = true; return n; });
        hwxRemove('hwx_clientes', c.id, notify, function () {
          clientes.setRows(function (prev) { return (prev || []).filter(function (x) { return x.id !== c.id; }); });
          locais.setRows(function (prev) { return (prev || []).filter(function (x) { return x.cliente_id !== c.id; }); });
        }, function () {
          setPending(function (p) { var n = Object.assign({}, p); delete n[c.id]; return n; });
        });
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
                  React.createElement('div', { style: { fontWeight: 800, fontSize: 18, wordBreak: 'break-word', minWidth: 0 } }, c.nome)
                ),
                React.createElement(HxPill, { text: hwxLabel(HWX_CLI_ESTADOS, ef) + (ef === 'pausado' && c.pausado_ate ? ' até ' + hwxFmtDate(c.pausado_ate) : ''), color: HWX_ESTADO_COR[ef] })
              ),
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
              React.createElement(HxCardActions, { entries: hwxCallEntries(c), name: c.nome, disabled: wait, onEdit: function () { setView({ kind: 'cliente', editing: c }); }, onDel: function () { delCliente(c); } })
            );
          })
        )
      );
    }

    // ── AJUSTES (hwx_config, uma linha) ──
    var HWX_ZONA_PRESETS = ['Selzach', 'Outros'];

    function HwxZonaForm(props) {
      var notify = props.notify, editing = props.editing, zonas = props.zonas;
      var preset = function (nome) { return HWX_ZONA_PRESETS.indexOf(nome) !== -1 ? nome : '__outra'; };
      var f0 = function (z) { return z ? { sel: preset(z.nome), outra: HWX_ZONA_PRESETS.indexOf(z.nome) !== -1 ? '' : z.nome, valor: String(z.valor == null ? '' : z.valor) } : { sel: 'Selzach', outra: '', valor: '' }; };
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
        var val = hwxNum(f.valor);
        if (!nome) e.nome = 'Escreve o nome da zona.';
        else if (zonas.some(function (z) { return hwxNorm(z.nome) === hwxNorm(nome) && (!editing || z.nome !== editing.nome); })) e.nome = 'Já existe uma zona com este nome.';
        if (val === null || val < 0 || val > 99999999.99) e.valor = 'Valor inválido (ex.: 10 ou 7,50).';
        setErrs(e);
        if (Object.keys(e).length) { if (fail) fail(); return; }
        var nova = { nome: nome, valor: hwxFromRappen(hwxToRappen(val)) };
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
        f.sel !== '__outra' && errs.nome && React.createElement('div', { style: Object.assign({}, HXS.err, { marginTop: -8, marginBottom: 12 }) }, errs.nome),
        React.createElement(HxField, { label: 'Valor (CHF)', value: f.valor, inputMode: 'decimal', onChange: function (v) { upd('valor', v); }, error: errs.valor, placeholder: '0.00', hint: 'Taxa de deslocação (não é o preço por hora)', onEnter: function () { doSave(); } })
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
        if (e) { if (fail) fail(); return; }
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
        React.createElement(HxField, { label: 'Nome', value: nome, onChange: setNome, error: err, placeholder: 'ex.: Jardim', onEnter: function () { doSave(); }, hint: editing ? 'O identificador interno (' + editing.id + ') não muda.' : 'O identificador interno é gerado a partir do nome e não muda depois.' })
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
        if (hwxEmailBad(rem.email)) e.email = 'E-mail inválido.';
        if (aliveRef.current) setErrs(e);
        if (e.limite || e.email) { if (aliveRef.current) setStatus('invalid'); if (fail) fail(); return; }
        var t = function (k) { return String(rem[k] || '').trim(); };
        var payload = {
          limite_anual: hwxFromRappen(hwxToRappen(lim)),
          remetente: { nome: t('nome'), rua: t('rua'), plz: t('plz'), ort: t('ort'), plz_ort: [t('plz'), t('ort')].filter(Boolean).join(' '), telefone: t('telefone'), email: t('email') }
        };
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
      }, [limite, rem]);
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
        return React.createElement(HwxZonaForm, { editing: sub.editing, zonas: props.zonas, notify: notify, guard: ctx.guard, saveCfg: props.saveCfg, onClose: function () { setSub(null); } });
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
          React.createElement(HxSection, { title: 'Zonas de deslocação' },
            zonas.length === 0 && React.createElement('div', { style: { fontSize: 14, color: HX.muted, marginBottom: 10 } }, 'Sem zonas. Toca em "+ Nova zona" para criar.'),
            zonas.map(function (z) {
              return React.createElement('div', { key: z.nome, style: { display: 'flex', gap: 8, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid ' + HX.border } },
                React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                  React.createElement('div', { style: { fontWeight: 700, wordBreak: 'break-word' } }, z.nome),
                  React.createElement('div', { style: { fontSize: 13, color: HX.muted } }, hwxChf(z.valor) + ' · taxa de deslocação')
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
            React.createElement(HxField, { label: 'Nome', value: rem.nome, onChange: function (v) { updRem('nome', v); } }),
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

    // ── APP ──
    function HwxApp(props) {
      var onBack = props.onBack;
      var wide = hwxUseWide();
      var _t = React.useState('precos'); var tab = _t[0], setTab = _t[1];
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
        { id: 'precos', icon: '🏷️', label: 'Preços' },
        { id: 'clientes', icon: '👥', label: 'Clientes' },
        { id: 'ajustes', icon: '⚙️', label: 'Ajustes' }
      ];

      var zonas = (cfg.row && Array.isArray(cfg.row.zonas)) ? cfg.row.zonas : [];
      var cats = (cfg.row && Array.isArray(cfg.row.categorias) && cfg.row.categorias.length) ? cfg.row.categorias : HWX_DEFAULT_CATS;

      var goTab = function (id) { if (id !== tab) guard.attempt(function () { setTab(id); }); };

      var body;
      if (tab === 'precos') body = React.createElement(HwxPrecos, { notify: notify, cats: cats });
      else if (tab === 'clientes') body = React.createElement(HwxClientes, { notify: notify, zonas: zonas, contador: cfg.row ? cfg.row.ultimo_numero_cliente : 0, onReloadCfg: loadCfg });
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
