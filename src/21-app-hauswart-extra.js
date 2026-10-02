// ── HAUSWART EXTRA ────────────────────────────────────────────────────
// Parte nova e separada da Hauswart: trabalhos leves às sextas (casa leve,
// compras, ajuda com PC e telemóvel). Admin only (só é aberta a partir do
// botão "➕ Extra" do HauswartApp). Fase 1: Preços, Clientes, Ajustes.
// Tabelas hwx_clientes, hwx_servicos, hwx_config (sql/24_hwx_base.sql).
// Nunca lê nem escreve hauswart_data, nem usa localStorage.
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

    var HWX_CATS = [
      { v: 'casa', l: 'Casa' },
      { v: 'compras', l: 'Compras' },
      { v: 'pc_telemovel', l: 'PC e telemóvel' },
      { v: 'outro', l: 'Outro' }
    ];
    var HWX_UNITS = [
      { v: 'hora', l: 'por hora' },
      { v: '30min', l: 'por 30 min' },
      { v: 'fixo', l: 'fixo' },
      { v: 'peca', l: 'por peça' }
    ];
    var HWX_LANGS = [
      { v: 'de', l: 'DE' }, { v: 'fr', l: 'FR' }, { v: 'it', l: 'IT' }, { v: 'en', l: 'EN' }, { v: 'pt', l: 'PT' }
    ];

    // ── Números e texto ──
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
    function hwxLabel(list, v) {
      for (var i = 0; i < list.length; i++) if (list[i].v === v) return list[i].l;
      return v || '';
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
    function hwxPriceText(s) {
      var p = hwxChf(s.preco);
      var u = s.unidade;
      var base = u === 'hora' ? p + ' / h' : u === '30min' ? p + ' / 30 min' : u === 'peca' ? p + ' / peça' : p + ' fixo';
      if (s.minimo != null && Number(s.minimo) > 0) {
        var suf = u === 'hora' ? ' h' : u === '30min' ? ' × 30 min' : u === 'peca' ? ' peça(s)' : '';
        base += ' · mín. ' + hwxQty(s.minimo) + suf;
      }
      return base;
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
      if (code === 'PGRST205') {
        text = 'Tabelas hwx_ ainda não criadas — correr sql/24_hwx_base.sql';
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

    // Insere (id vazio) ou atualiza uma linha. onOk(linha) / onEnd(sucesso).
    function hwxWrite(table, id, payload, notify, onOk, onEnd) {
      if (!window.supabaseClient) {
        hwxFail(notify, 'gravar ' + table, { message: 'Sem ligação à base de dados.' }, true);
        onEnd(false); return;
      }
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        hwxFail(notify, 'gravar ' + table, { message: 'Failed to fetch' }, true);
        onEnd(false); return;
      }
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
      if (!window.supabaseClient) {
        hwxFail(notify, 'apagar ' + table, { message: 'Sem ligação à base de dados.' }, true);
        onEnd(false); return;
      }
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        hwxFail(notify, 'apagar ' + table, { message: 'Failed to fetch' }, true);
        onEnd(false); return;
      }
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

    // ── Componentes de interface ──
    var HXS = {
      card: { background: HX.surface, border: '1px solid ' + HX.border, borderRadius: 12, padding: 14, marginBottom: 10 },
      label: { display: 'block', fontSize: 13, color: HX.muted, marginBottom: 4, fontWeight: 600 },
      input: { width: '100%', minHeight: 44, background: HX.field, border: '1px solid ' + HX.borderStrong, borderRadius: 8, padding: '10px 12px', color: HX.text, fontSize: 16, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
      err: { fontSize: 13, color: HX.badText, marginTop: 4 },
      sec: { fontSize: 12, color: HX.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }
    };

    function HxBtn(props) {
      var kind = props.kind || 'ghost';
      var st = { minHeight: 44, minWidth: 44, borderRadius: 8, padding: '0 16px', fontSize: 15, fontWeight: 700, cursor: props.disabled ? 'not-allowed' : 'pointer', opacity: props.disabled ? 0.45 : 1, fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxSizing: 'border-box' };
      if (kind === 'primary') { st.background = HX.text; st.color = '#000'; st.border = '1px solid ' + HX.text; }
      else if (kind === 'danger') { st.background = 'transparent'; st.color = HX.badText; st.border = '1px solid ' + HX.bad; }
      else { st.background = HX.surface2; st.color = HX.text; st.border = '1px solid ' + HX.borderStrong; }
      if (props.full) st.width = '100%';
      return React.createElement('button', { type: 'button', onClick: props.disabled ? undefined : props.onClick, disabled: !!props.disabled, 'aria-label': props.aria, style: st }, props.label);
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
        el = React.createElement('input', inputProps);
      }
      return React.createElement('div', { style: { marginBottom: 12 } },
        React.createElement('label', { style: HXS.label }, props.label),
        el,
        props.error && React.createElement('div', { style: HXS.err }, props.error)
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
        }))
      );
    }

    function HxToggle(props) {
      var on = !!props.value;
      return React.createElement('button', {
        type: 'button', role: 'switch', 'aria-checked': on, 'aria-label': props.aria || 'ativo',
        disabled: !!props.disabled,
        onClick: function () { if (!props.disabled) props.onChange(!on); },
        style: { minWidth: 56, minHeight: 44, background: 'transparent', border: 'none', padding: 0, cursor: props.disabled ? 'not-allowed' : 'pointer', opacity: props.disabled ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }
      },
        React.createElement('span', { style: { width: 48, height: 28, borderRadius: 14, background: on ? HX.ok : '#525252', position: 'relative', display: 'block', border: '1px solid ' + (on ? HX.ok : HX.borderStrong) } },
          React.createElement('span', { style: { position: 'absolute', top: 2, left: on ? 22 : 2, width: 22, height: 22, borderRadius: 11, background: on ? '#000' : '#fff', display: 'block' } })
        )
      );
    }

    function HxFormToggle(props) {
      return React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 44, marginBottom: 12 } },
        React.createElement('span', { style: { fontSize: 15, fontWeight: 600 } }, props.label),
        React.createElement(HxToggle, { value: props.value, onChange: props.onChange, aria: props.label })
      );
    }

    function HxHead(props) {
      return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, minHeight: 44 } },
        props.back && React.createElement(HxBtn, { label: '←', onClick: props.back, aria: 'Voltar' }),
        React.createElement('div', { style: { flex: 1, fontWeight: 800, fontSize: 20 } }, props.title),
        props.btn && React.createElement(HxBtn, { label: props.btn.label, onClick: props.btn.fn, kind: 'primary' })
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
      var c = props.kind === 'ok' ? HX.ok : props.kind === 'warn' ? HX.warn : HX.borderStrong;
      var t = props.kind === 'ok' ? HX.okText : props.kind === 'warn' ? HX.warnText : HX.muted;
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
        style: { position: 'sticky', top: 0, zIndex: 5, background: bg, border: '1px solid ' + col, borderRadius: 10, padding: '10px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10, color: tx, fontSize: 14, fontWeight: 600 }
      },
        React.createElement('div', { style: { flex: 1, wordBreak: 'break-word' } }, (k === 'ok' ? '' : '⚠️ ') + n.text),
        React.createElement('button', { type: 'button', onClick: props.onClose, 'aria-label': 'Fechar aviso', style: { minWidth: 44, minHeight: 44, background: 'transparent', border: 'none', color: tx, fontSize: 18, cursor: 'pointer' } }, '✕')
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

    // ── PREÇOS (hwx_servicos) ──
    function HwxPrecos(props) {
      var notify = props.notify;
      var list = hwxUseList('hwx_servicos', 'ordem', notify);

      var _v = React.useState('list'); var view = _v[0], setView = _v[1];
      var _ed = React.useState(null); var editing = _ed[0], setEditing = _ed[1];
      var _f = React.useState({}); var f = _f[0], setF = _f[1];
      var _er = React.useState({}); var errs = _er[0], setErrs = _er[1];
      var _b = React.useState(false); var busy = _b[0], setBusy = _b[1];
      var busyRef = React.useRef(false);
      var _p = React.useState({}); var pending = _p[0], setPending = _p[1];
      var _fc = React.useState('all'); var fCat = _fc[0], setFCat = _fc[1];
      var _fu = React.useState('all'); var fUni = _fu[0], setFUni = _fu[1];
      var _fe = React.useState('ativos'); var fEst = _fe[0], setFEst = _fe[1];
      var _q = React.useState(''); var q = _q[0], setQ = _q[1];
      var _so = React.useState('ordem'); var sort = _so[0], setSort = _so[1];

      var upd = function (k, v) { setF(function (p) { var n = Object.assign({}, p); n[k] = v; return n; }); };
      var replaceRow = function (row) {
        list.setRows(function (prev) {
          var arr = prev || [], found = false;
          var out = arr.map(function (r) { if (r.id === row.id) { found = true; return row; } return r; });
          if (!found) out.push(row);
          return out;
        });
      };
      var setPend = function (id, on) {
        setPending(function (p) { var n = Object.assign({}, p); if (on) n[id] = true; else delete n[id]; return n; });
      };

      var openNew = function () {
        var max = 0;
        (list.rows || []).forEach(function (r) { if (r.ordem > max) max = r.ordem; });
        setF({ nome: '', categoria: 'casa', unidade: 'hora', preco: '', minimo: '', ordem: String(max + 1), nota: '', ativo: true });
        setErrs({}); setEditing(null); setView('form');
      };
      var openEdit = function (r) {
        setF({
          nome: r.nome || '', categoria: r.categoria || 'casa', unidade: r.unidade || 'hora',
          preco: String(r.preco), minimo: r.minimo == null ? '' : String(r.minimo),
          ordem: String(r.ordem == null ? 0 : r.ordem), nota: r.nota || '', ativo: r.ativo !== false
        });
        setErrs({}); setEditing(r); setView('form');
      };

      var onSave = function () {
        if (busyRef.current) return;
        var e = {};
        var nome = String(f.nome || '').trim();
        var preco = hwxNum(f.preco);
        var minTxt = String(f.minimo == null ? '' : f.minimo).trim();
        var minimo = minTxt === '' ? null : hwxNum(minTxt);
        var ordTxt = String(f.ordem == null ? '' : f.ordem).trim();
        var ordem = ordTxt === '' ? 0 : hwxNum(ordTxt);
        if (!nome) e.nome = 'Indica o nome do serviço.';
        if (preco === null || preco < 0 || preco > 99999999.99) e.preco = 'Indica um preço válido (ex.: 45 ou 45,50).';
        if (minTxt !== '' && (minimo === null || minimo <= 0 || minimo > 999.99)) e.minimo = 'Mínimo tem de ser maior que 0 (ex.: 1 ou 1,5), ou deixa vazio.';
        if (ordem === null || Math.abs(ordem) > 100000) e.ordem = 'Ordem tem de ser um número (ex.: 1).';
        setErrs(e);
        if (Object.keys(e).length) return;
        var payload = {
          nome: nome, categoria: f.categoria, unidade: f.unidade,
          preco: hwxFromRappen(hwxToRappen(preco)),
          minimo: minimo === null ? null : Math.round(minimo * 100) / 100,
          ordem: Math.round(ordem), nota: String(f.nota || '').trim(), ativo: !!f.ativo
        };
        busyRef.current = true; setBusy(true);
        hwxWrite('hwx_servicos', editing ? editing.id : null, payload, notify, function (row) {
          replaceRow(row); setView('list');
        }, function () { busyRef.current = false; setBusy(false); });
      };

      var onToggle = function (r) {
        if (pending[r.id]) return;
        setPend(r.id, true);
        hwxWrite('hwx_servicos', r.id, { ativo: !r.ativo }, notify, replaceRow, function () { setPend(r.id, false); });
      };
      var onDel = function (r) {
        if (pending[r.id]) return;
        if (!window.confirm('Apagar o serviço "' + r.nome + '"?')) return;
        setPend(r.id, true);
        hwxRemove('hwx_servicos', r.id, notify, function () {
          list.setRows(function (prev) { return (prev || []).filter(function (x) { return x.id !== r.id; }); });
        }, function () { setPend(r.id, false); });
      };

      if (view === 'form') {
        return React.createElement('div', null,
          React.createElement(HxHead, { title: editing ? 'Editar serviço' : 'Novo serviço', back: function () { if (!busy) setView('list'); } }),
          React.createElement(HxField, { label: 'Nome', value: f.nome, onChange: function (v) { upd('nome', v); }, error: errs.nome, placeholder: 'ex.: Ajuda com telemóvel' }),
          React.createElement(HxSelect, { label: 'Categoria', value: f.categoria, options: HWX_CATS, onChange: function (v) { upd('categoria', v); } }),
          React.createElement(HxSelect, { label: 'Unidade', value: f.unidade, options: HWX_UNITS, onChange: function (v) { upd('unidade', v); } }),
          React.createElement(HxField, { label: 'Preço (CHF)', value: f.preco, inputMode: 'decimal', onChange: function (v) { upd('preco', v); }, error: errs.preco, placeholder: '0.00' }),
          React.createElement(HxField, { label: 'Mínimo (opcional)', value: f.minimo, inputMode: 'decimal', onChange: function (v) { upd('minimo', v); }, error: errs.minimo, placeholder: 'quantidade mínima, ex.: 1' }),
          React.createElement(HxField, { label: 'Ordem', value: f.ordem, inputMode: 'numeric', onChange: function (v) { upd('ordem', v); }, error: errs.ordem }),
          React.createElement(HxField, { label: 'Nota', value: f.nota, multiline: true, onChange: function (v) { upd('nota', v); } }),
          React.createElement(HxFormToggle, { label: 'Ativo', value: f.ativo, onChange: function (v) { upd('ativo', v); } }),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } },
            React.createElement(HxBtn, { label: 'Cancelar', onClick: function () { setView('list'); }, disabled: busy }),
            React.createElement(HxBtn, { label: busy ? 'A gravar…' : '✓ Guardar', onClick: onSave, kind: 'primary', disabled: busy })
          )
        );
      }

      var rows = list.rows || [];
      var nq = hwxNorm(q).trim();
      var shown = rows.filter(function (r) {
        if (fCat !== 'all' && r.categoria !== fCat) return false;
        if (fUni !== 'all' && r.unidade !== fUni) return false;
        if (fEst === 'ativos' && r.ativo === false) return false;
        if (fEst === 'inativos' && r.ativo !== false) return false;
        if (nq && hwxNorm(r.nome).indexOf(nq) === -1) return false;
        return true;
      }).sort(function (a, b) {
        if (sort === 'nome') return String(a.nome).localeCompare(String(b.nome), 'de');
        if (sort === 'preco') return (Number(a.preco) - Number(b.preco)) || String(a.nome).localeCompare(String(b.nome), 'de');
        return ((a.ordem || 0) - (b.ordem || 0)) || String(a.nome).localeCompare(String(b.nome), 'de');
      });

      return React.createElement('div', null,
        React.createElement(HxHead, { title: 'Preços', btn: { label: '+ Novo', fn: openNew } }),
        React.createElement(HxField, { label: 'Pesquisar por nome', value: q, onChange: setQ, placeholder: 'nome do serviço' }),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 } },
          React.createElement(HxSelect, { label: 'Categoria', tight: true, value: fCat, onChange: setFCat, options: [{ v: 'all', l: 'Todas' }].concat(HWX_CATS) }),
          React.createElement(HxSelect, { label: 'Unidade', tight: true, value: fUni, onChange: setFUni, options: [{ v: 'all', l: 'Todas' }].concat(HWX_UNITS) }),
          React.createElement(HxSelect, { label: 'Estado', tight: true, value: fEst, onChange: setFEst, options: [{ v: 'ativos', l: 'Ativos' }, { v: 'inativos', l: 'Inativos' }, { v: 'todos', l: 'Todos' }] }),
          React.createElement(HxSelect, { label: 'Ordenar por', tight: true, value: sort, onChange: setSort, options: [{ v: 'ordem', l: 'Ordem' }, { v: 'nome', l: 'Nome' }, { v: 'preco', l: 'Preço' }] })
        ),
        React.createElement(HxLoadState, { list: list }),
        list.rows !== null && React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginBottom: 8 } }, shown.length + ' de ' + rows.length + ' serviço(s)'),
        list.rows !== null && rows.length === 0 && React.createElement(HxEmpty, { icon: '🏷️', text: 'Ainda não há serviços', sub: 'Toca em "+ Novo" para criar o primeiro.' }),
        list.rows !== null && rows.length > 0 && shown.length === 0 && React.createElement(HxEmpty, { icon: '🔎', text: 'Nenhum serviço com estes filtros' }),
        shown.map(function (r) {
          var wait = !!pending[r.id];
          return React.createElement('div', { key: r.id, style: Object.assign({}, HXS.card, { opacity: r.ativo === false ? 0.7 : 1 }) },
            React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'flex-start' } },
              React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                React.createElement('div', { style: { fontWeight: 700, fontSize: 16, wordBreak: 'break-word' } }, r.nome),
                React.createElement('div', { style: { fontWeight: 700, fontSize: 16, marginTop: 2 } }, hwxPriceText(r)),
                React.createElement('div', null,
                  React.createElement(HxPill, { text: hwxLabel(HWX_CATS, r.categoria) }),
                  React.createElement(HxPill, { text: r.ativo === false ? 'Inativo' : 'Ativo', kind: r.ativo === false ? 'warn' : 'ok' })
                ),
                r.nota && React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginTop: 6, wordBreak: 'break-word' } }, r.nota)
              ),
              React.createElement(HxToggle, { value: r.ativo !== false, disabled: wait, aria: 'Ativo: ' + r.nome, onChange: function () { onToggle(r); } })
            ),
            React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end' } },
              React.createElement(HxBtn, { label: '✏️ Editar', onClick: function () { openEdit(r); }, disabled: wait }),
              React.createElement(HxBtn, { label: '🗑️', kind: 'danger', aria: 'Apagar ' + r.nome, onClick: function () { onDel(r); }, disabled: wait })
            )
          );
        })
      );
    }

    // ── CLIENTES (hwx_clientes) ──
    function HxLink(props) {
      var st = { minHeight: 44, minWidth: 44, borderRadius: 8, padding: '0 16px', fontSize: 15, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', boxSizing: 'border-box', background: HX.surface2, color: HX.text, border: '1px solid ' + HX.borderStrong };
      if (!props.href) {
        st.opacity = 0.4; st.color = HX.muted;
        return React.createElement('span', { style: st, 'aria-disabled': 'true' }, props.label);
      }
      return React.createElement('a', { href: props.href, target: props.blank ? '_blank' : undefined, rel: props.blank ? 'noopener noreferrer' : undefined, style: st }, props.label);
    }

    function HwxClientes(props) {
      var notify = props.notify, zonas = props.zonas || [];
      var list = hwxUseList('hwx_clientes', 'nome', notify);

      var _v = React.useState('list'); var view = _v[0], setView = _v[1];
      var _ed = React.useState(null); var editing = _ed[0], setEditing = _ed[1];
      var _f = React.useState({}); var f = _f[0], setF = _f[1];
      var _er = React.useState({}); var errs = _er[0], setErrs = _er[1];
      var _b = React.useState(false); var busy = _b[0], setBusy = _b[1];
      var busyRef = React.useRef(false);
      var _p = React.useState({}); var pending = _p[0], setPending = _p[1];
      var _fe = React.useState('ativos'); var fEst = _fe[0], setFEst = _fe[1];
      var _q = React.useState(''); var q = _q[0], setQ = _q[1];

      var upd = function (k, v) { setF(function (p) { var n = Object.assign({}, p); n[k] = v; return n; }); };
      var replaceRow = function (row) {
        list.setRows(function (prev) {
          var arr = prev || [], found = false;
          var out = arr.map(function (r) { if (r.id === row.id) { found = true; return row; } return r; });
          if (!found) out.push(row);
          return out;
        });
      };

      var openNew = function () {
        setF({ nome: '', telefone: '', email: '', rua: '', plz_ort: '', zona: '', lingua: 'de', notas: '', ativo: true });
        setErrs({}); setEditing(null); setView('form');
      };
      var openEdit = function (r) {
        setF({
          nome: r.nome || '', telefone: r.telefone || '', email: r.email || '', rua: r.rua || '', plz_ort: r.plz_ort || '',
          zona: r.zona || '', lingua: r.lingua || 'de', notas: r.notas || '', ativo: r.ativo !== false
        });
        setErrs({}); setEditing(r); setView('form');
      };

      var onSave = function () {
        if (busyRef.current) return;
        var e = {};
        var nome = String(f.nome || '').trim();
        var email = String(f.email || '').trim();
        if (!nome) e.nome = 'Indica o nome do cliente.';
        if (email && !/^[^\s@]+@[^\s@]+$/.test(email)) e.email = 'E-mail inválido.';
        setErrs(e);
        if (Object.keys(e).length) return;
        var payload = {
          nome: nome, telefone: String(f.telefone || '').trim(), email: email,
          rua: String(f.rua || '').trim(), plz_ort: String(f.plz_ort || '').trim(),
          zona: f.zona || '', lingua: f.lingua, notas: String(f.notas || '').trim(), ativo: !!f.ativo
        };
        busyRef.current = true; setBusy(true);
        hwxWrite('hwx_clientes', editing ? editing.id : null, payload, notify, function (row) {
          replaceRow(row); setView('list');
        }, function () { busyRef.current = false; setBusy(false); });
      };

      var onDel = function (r) {
        if (pending[r.id]) return;
        if (!window.confirm('Apagar o cliente "' + r.nome + '"?')) return;
        setPending(function (p) { var n = Object.assign({}, p); n[r.id] = true; return n; });
        hwxRemove('hwx_clientes', r.id, notify, function () {
          list.setRows(function (prev) { return (prev || []).filter(function (x) { return x.id !== r.id; }); });
        }, function () {
          setPending(function (p) { var n = Object.assign({}, p); delete n[r.id]; return n; });
        });
      };

      if (view === 'form') {
        var zonaOpts = [{ v: '', l: '— sem zona —' }].concat(zonas.map(function (z) { return { v: z.nome, l: z.nome + ' (' + hwxChf(z.valor) + ')' }; }));
        if (f.zona && !zonas.some(function (z) { return z.nome === f.zona; })) {
          zonaOpts.push({ v: f.zona, l: f.zona + ' (já não existe nos Ajustes)' });
        }
        return React.createElement('div', null,
          React.createElement(HxHead, { title: editing ? 'Editar cliente' : 'Novo cliente', back: function () { if (!busy) setView('list'); } }),
          React.createElement(HxField, { label: 'Nome', value: f.nome, onChange: function (v) { upd('nome', v); }, error: errs.nome }),
          React.createElement(HxField, { label: 'Telefone', value: f.telefone, type: 'tel', inputMode: 'tel', onChange: function (v) { upd('telefone', v); }, placeholder: '079 123 45 67' }),
          React.createElement(HxField, { label: 'E-mail', value: f.email, type: 'email', inputMode: 'email', onChange: function (v) { upd('email', v); }, error: errs.email }),
          React.createElement(HxField, { label: 'Rua', value: f.rua, onChange: function (v) { upd('rua', v); } }),
          React.createElement(HxField, { label: 'PLZ / Localidade', value: f.plz_ort, onChange: function (v) { upd('plz_ort', v); }, placeholder: '2545 Selzach' }),
          React.createElement(HxSelect, { label: 'Zona de deslocação', value: f.zona, options: zonaOpts, onChange: function (v) { upd('zona', v); } }),
          zonas.length === 0 && React.createElement('div', { style: { fontSize: 13, color: HX.warnText, marginTop: -6, marginBottom: 12 } }, 'Ainda não há zonas — cria-as em Ajustes.'),
          React.createElement(HxSelect, { label: 'Língua', value: f.lingua, options: HWX_LANGS, onChange: function (v) { upd('lingua', v); } }),
          React.createElement(HxField, { label: 'Notas', value: f.notas, multiline: true, onChange: function (v) { upd('notas', v); } }),
          React.createElement(HxFormToggle, { label: 'Ativo', value: f.ativo, onChange: function (v) { upd('ativo', v); } }),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } },
            React.createElement(HxBtn, { label: 'Cancelar', onClick: function () { setView('list'); }, disabled: busy }),
            React.createElement(HxBtn, { label: busy ? 'A gravar…' : '✓ Guardar', onClick: onSave, kind: 'primary', disabled: busy })
          )
        );
      }

      var rows = list.rows || [];
      var nq = hwxNorm(q).trim();
      var qDigits = String(q).replace(/\D/g, '');
      var shown = rows.filter(function (r) {
        if (fEst === 'ativos' && r.ativo === false) return false;
        if (fEst === 'inativos' && r.ativo !== false) return false;
        if (!nq) return true;
        if (hwxNorm(r.nome).indexOf(nq) !== -1) return true;
        if (hwxNorm(r.plz_ort).indexOf(nq) !== -1) return true;
        if (hwxNorm(r.telefone).indexOf(nq) !== -1) return true;
        if (qDigits.length >= 3 && String(r.telefone || '').replace(/\D/g, '').indexOf(qDigits) !== -1) return true;
        return false;
      }).sort(function (a, b) { return String(a.nome).localeCompare(String(b.nome), 'de'); });

      return React.createElement('div', null,
        React.createElement(HxHead, { title: 'Clientes', btn: { label: '+ Novo', fn: openNew } }),
        React.createElement(HxField, { label: 'Pesquisar (nome, telefone, localidade)', value: q, onChange: setQ }),
        React.createElement(HxSelect, { label: 'Estado', value: fEst, onChange: setFEst, options: [{ v: 'ativos', l: 'Ativos' }, { v: 'inativos', l: 'Inativos' }, { v: 'todos', l: 'Todos' }] }),
        React.createElement(HxLoadState, { list: list }),
        list.rows !== null && React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginBottom: 8 } }, shown.length + ' de ' + rows.length + ' cliente(s)'),
        list.rows !== null && rows.length === 0 && React.createElement(HxEmpty, { icon: '👥', text: 'Ainda não há clientes', sub: 'Toca em "+ Novo" para criar o primeiro.' }),
        list.rows !== null && rows.length > 0 && shown.length === 0 && React.createElement(HxEmpty, { icon: '🔎', text: 'Nenhum cliente com estes filtros' }),
        shown.map(function (r) {
          var wait = !!pending[r.id];
          var d = hwxPhone(r.telefone);
          return React.createElement('div', { key: r.id, style: Object.assign({}, HXS.card, { opacity: r.ativo === false ? 0.7 : 1 }) },
            React.createElement('div', { style: { fontWeight: 700, fontSize: 16, wordBreak: 'break-word' } }, r.nome),
            (r.rua || r.plz_ort) && React.createElement('div', { style: { fontSize: 14, color: HX.muted, marginTop: 2 } }, [r.rua, r.plz_ort].filter(Boolean).join(', ')),
            r.telefone && React.createElement('div', { style: { fontSize: 14, color: HX.muted } }, r.telefone),
            r.email && React.createElement('div', { style: { fontSize: 14, color: HX.muted, wordBreak: 'break-all' } }, r.email),
            React.createElement('div', null,
              React.createElement(HxPill, { text: hwxLabel(HWX_LANGS, r.lingua) }),
              r.zona && React.createElement(HxPill, { text: r.zona }),
              React.createElement(HxPill, { text: r.ativo === false ? 'Inativo' : 'Ativo', kind: r.ativo === false ? 'warn' : 'ok' })
            ),
            r.notas && React.createElement('div', { style: { fontSize: 13, color: HX.muted, marginTop: 6, wordBreak: 'break-word' } }, r.notas),
            React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 } },
              React.createElement(HxLink, { label: '📞 Ligar', href: d ? 'tel:+' + d : '' }),
              React.createElement(HxLink, { label: '💬 WhatsApp', href: d ? 'https://wa.me/' + d : '', blank: true }),
              React.createElement('div', { style: { flex: 1 } }),
              React.createElement(HxBtn, { label: '✏️', aria: 'Editar ' + r.nome, onClick: function () { openEdit(r); }, disabled: wait }),
              React.createElement(HxBtn, { label: '🗑️', kind: 'danger', aria: 'Apagar ' + r.nome, onClick: function () { onDel(r); }, disabled: wait })
            )
          );
        })
      );
    }

    // ── AJUSTES (hwx_config, uma linha) ──
    function HwxAjustes(props) {
      var notify = props.notify, cfg = props.cfg;
      var row = cfg.row;
      var rem0 = (row && row.remetente) || {};
      var keyRef = React.useRef(0);
      var nextKey = function () { keyRef.current += 1; return keyRef.current; };

      var _lim = React.useState(row ? String(row.limite_anual) : '2500');
      var limite = _lim[0], setLimite = _lim[1];
      var _z = React.useState(function () {
        return ((row && row.zonas) || []).map(function (z) { return { k: nextKey(), nome: z.nome || '', valor: String(z.valor == null ? '' : z.valor) }; });
      });
      var zonas = _z[0], setZonas = _z[1];
      var _rm = React.useState({ nome: rem0.nome || '', rua: rem0.rua || '', plz_ort: rem0.plz_ort || '', telefone: rem0.telefone || '', email: rem0.email || '' });
      var rem = _rm[0], setRem = _rm[1];
      var _er = React.useState({}); var errs = _er[0], setErrs = _er[1];
      var _b = React.useState(false); var busy = _b[0], setBusy = _b[1];
      var busyRef = React.useRef(false);

      var updRem = function (k, v) { setRem(function (p) { var n = Object.assign({}, p); n[k] = v; return n; }); };
      var updZona = function (k, field, v) {
        setZonas(function (p) { return p.map(function (z) { if (z.k !== k) return z; var n = Object.assign({}, z); n[field] = v; return n; }); });
      };
      var addZona = function () { setZonas(function (p) { return p.concat([{ k: nextKey(), nome: '', valor: '' }]); }); };
      var delZona = function (k) { setZonas(function (p) { return p.filter(function (z) { return z.k !== k; }); }); };

      var onSave = function () {
        if (busyRef.current || cfg.failed) return;
        var e = { zonas: {} };
        var lim = hwxNum(limite);
        if (lim === null || lim < 0 || lim > 9999999999.99) e.limite = 'Indica um valor válido (ex.: 2500 ou 2500,00).';
        var seen = {}, outZ = [];
        zonas.forEach(function (z) {
          var nome = String(z.nome || '').trim();
          var val = hwxNum(z.valor);
          var ze = {};
          if (!nome) ze.nome = 'Indica o nome da zona.';
          else if (seen[hwxNorm(nome)]) ze.nome = 'Já existe uma zona com este nome.';
          if (val === null || val < 0) ze.valor = 'Valor inválido (ex.: 10 ou 7,50).';
          if (nome) seen[hwxNorm(nome)] = true;
          if (ze.nome || ze.valor) e.zonas[z.k] = ze;
          else outZ.push({ nome: nome, valor: hwxFromRappen(hwxToRappen(val)) });
        });
        if (rem.email && String(rem.email).trim() && !/^[^\s@]+@[^\s@]+$/.test(String(rem.email).trim())) e.email = 'E-mail inválido.';
        setErrs(e);
        if (e.limite || e.email || Object.keys(e.zonas).length) return;
        var payload = {
          limite_anual: hwxFromRappen(hwxToRappen(lim)),
          zonas: outZ,
          remetente: {
            nome: String(rem.nome || '').trim(), rua: String(rem.rua || '').trim(), plz_ort: String(rem.plz_ort || '').trim(),
            telefone: String(rem.telefone || '').trim(), email: String(rem.email || '').trim()
          }
        };
        busyRef.current = true; setBusy(true);
        hwxWrite('hwx_config', row ? row.id : null, payload, notify, function (saved) {
          props.onSaved(saved);
        }, function () { busyRef.current = false; setBusy(false); });
      };

      var zerr = errs.zonas || {};
      return React.createElement('div', null,
        React.createElement(HxHead, { title: 'Ajustes' }),
        !row && !cfg.failed && React.createElement('div', { style: { background: HX.warnBg, border: '1px solid ' + HX.warn, color: HX.warnText, borderRadius: 10, padding: '10px 12px', marginBottom: 12, fontSize: 14, fontWeight: 600 } },
          'Ainda não guardado — estes são os valores por defeito. A linha só é criada ao tocar em "Guardar".'),
        cfg.failed && React.createElement(HxEmpty, {
          icon: '⚠️', text: 'Não consegui ler os ajustes', sub: 'Por segurança não deixo guardar sem os ler primeiro.',
          action: React.createElement(HxBtn, { label: 'Tentar de novo', onClick: props.onReload })
        }),
        !cfg.failed && React.createElement('div', null,
          React.createElement('div', { style: HXS.card },
            React.createElement('div', { style: HXS.sec }, 'Limite anual'),
            React.createElement(HxField, { label: 'Limite anual (CHF)', value: limite, inputMode: 'decimal', onChange: setLimite, error: errs.limite })
          ),
          React.createElement('div', { style: HXS.card },
            React.createElement('div', { style: HXS.sec }, 'Zonas de deslocação'),
            zonas.length === 0 && React.createElement('div', { style: { fontSize: 14, color: HX.muted, marginBottom: 10 } }, 'Sem zonas. Toca em "+ Zona" para criar.'),
            zonas.map(function (z) {
              var ze = zerr[z.k] || {};
              return React.createElement('div', { key: z.k, style: { display: 'grid', gridTemplateColumns: '1fr 110px 44px', gap: 8, alignItems: 'start', marginBottom: 10 } },
                React.createElement(HxField, { label: 'Nome', value: z.nome, onChange: function (v) { updZona(z.k, 'nome', v); }, error: ze.nome, placeholder: 'ex.: Selzach' }),
                React.createElement(HxField, { label: 'CHF', value: z.valor, inputMode: 'decimal', onChange: function (v) { updZona(z.k, 'valor', v); }, error: ze.valor, placeholder: '0.00' }),
                React.createElement('div', { style: { paddingTop: 23 } },
                  React.createElement(HxBtn, { label: '🗑️', kind: 'danger', aria: 'Apagar zona', onClick: function () { delZona(z.k); } })
                )
              );
            }),
            React.createElement(HxBtn, { label: '+ Zona', onClick: addZona, full: true })
          ),
          React.createElement('div', { style: HXS.card },
            React.createElement('div', { style: HXS.sec }, 'Remetente'),
            React.createElement(HxField, { label: 'Nome', value: rem.nome, onChange: function (v) { updRem('nome', v); } }),
            React.createElement(HxField, { label: 'Rua', value: rem.rua, onChange: function (v) { updRem('rua', v); } }),
            React.createElement(HxField, { label: 'PLZ / Localidade', value: rem.plz_ort, onChange: function (v) { updRem('plz_ort', v); } }),
            React.createElement(HxField, { label: 'Telefone', value: rem.telefone, type: 'tel', inputMode: 'tel', onChange: function (v) { updRem('telefone', v); } }),
            React.createElement(HxField, { label: 'E-mail', value: rem.email, type: 'email', inputMode: 'email', onChange: function (v) { updRem('email', v); }, error: errs.email })
          ),
          React.createElement(HxBtn, { label: busy ? 'A gravar…' : '✓ Guardar', onClick: onSave, kind: 'primary', full: true, disabled: busy })
        )
      );
    }

    // ── APP ──
    function HwxApp(props) {
      var onBack = props.onBack;
      var _t = React.useState('precos'); var tab = _t[0], setTab = _t[1];
      var _n = React.useState(null); var notice = _n[0], setNotice = _n[1];
      var timerRef = React.useRef(null);
      var _c = React.useState({ loaded: false, failed: false, row: null });
      var cfg = _c[0], setCfg = _c[1];
      var alive = React.useRef(true);

      var notify = React.useCallback(function (kind, text) {
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
        if (!kind) { setNotice(null); return; }
        setNotice({ kind: kind, text: text });
        if (kind === 'ok') {
          timerRef.current = setTimeout(function () { setNotice(null); timerRef.current = null; }, 2000);
        }
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
          setCfg({ loaded: true, failed: false, row: res.data || null });
        }).catch(function (e) {
          if (!alive.current) return;
          setCfg(function (p) { return { loaded: true, failed: true, row: p.row }; });
          hwxFail(notify, 'carregar hwx_config', e, false);
        });
      };

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

      var zonas = (cfg.row && cfg.row.zonas) || [];

      var body;
      if (tab === 'precos') body = React.createElement(HwxPrecos, { notify: notify });
      else if (tab === 'clientes') body = React.createElement(HwxClientes, { notify: notify, zonas: zonas });
      else if (!cfg.loaded) body = React.createElement(HxEmpty, { icon: '⏳', text: 'A carregar…' });
      else body = React.createElement(HwxAjustes, {
        notify: notify, cfg: cfg,
        onSaved: function (row) { setCfg({ loaded: true, failed: false, row: row }); },
        onReload: loadCfg
      });

      return React.createElement('div', { style: { fontFamily: 'system-ui,sans-serif', background: HX.bg, color: HX.text, minHeight: '100vh', display: 'flex', flexDirection: 'column' } },
        React.createElement('div', { style: { background: '#0a0a0a', borderBottom: '1px solid ' + HX.border, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 } },
          React.createElement(HxBtn, { label: '← Hauswart', onClick: onBack }),
          React.createElement('div', { style: { fontWeight: 800, fontSize: 18 } }, 'Hauswart Extra')
        ),
        React.createElement('div', { style: { flex: 1, padding: 16, paddingBottom: 100 } },
          React.createElement(HxBanner, { notice: notice, onClose: function () { notify(null); } }),
          body
        ),
        React.createElement('nav', { style: { background: '#0a0a0a', borderTop: '1px solid ' + HX.border, display: 'flex', position: 'fixed', bottom: 0, left: 0, right: 0, paddingBottom: 'env(safe-area-inset-bottom)' } },
          TABS.map(function (t) {
            var active = tab === t.id;
            return React.createElement('button', {
              key: t.id, type: 'button', onClick: function () { setTab(t.id); }, 'aria-current': active ? 'page' : undefined,
              style: { flex: 1, minHeight: 56, background: active ? HX.surface2 : 'transparent', border: 'none', borderTop: '3px solid ' + (active ? HX.text : 'transparent'), color: active ? HX.text : HX.muted, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, fontFamily: 'inherit' }
            },
              React.createElement('span', { style: { fontSize: 20 } }, t.icon),
              React.createElement('span', { style: { fontSize: 12, fontWeight: 700 } }, t.label)
            );
          })
        )
      );
    }

    window.HwxApp = HwxApp;

  } catch (e) {
    console.error('[hwx] erro ao carregar', e);
  }
})();
