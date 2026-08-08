function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
// ─────────────────────────────────────────────────────────────────
// 12-app-lucas.js  —  Escola do Lucas  —  Carvalho Suite
// ─────────────────────────────────────────────────────────────────

var _React = React,
  useState = _React.useState,
  useEffect = _React.useEffect;
var DAYS = [{
  key: 'seg',
  label: 'Segunda',
  short: 'SEG',
  sai: '11:50',
  tarde: true
}, {
  key: 'ter',
  label: 'Terça',
  short: 'TER',
  sai: '11:50',
  tarde: true
}, {
  key: 'qua',
  label: 'Quarta',
  short: 'QUA',
  sai: '11:50',
  tarde: false
}, {
  key: 'qui',
  label: 'Quinta',
  short: 'QUI',
  sai: '11:05',
  tarde: true
}, {
  key: 'sex',
  label: 'Sexta',
  short: 'SEX',
  sai: '11:40',
  tarde: false
}];
var ALL_SLOTS = ['leva_manha', 'busca_almoco', 'leva_tarde', 'busca_fim'];
var SLOT_LABELS = {
  leva_manha: '🚗 Leva manhã',
  busca_almoco: '🚗 Busca almoço',
  leva_tarde: '🚗 Leva tarde',
  busca_fim: '🚗 Busca fim dia'
};
var C = {
  primary: '#1a237e',
  blue: '#1565c0',
  orange: '#bf360c',
  green: '#2e7d32',
  greenL: '#e8f5e9',
  purple: '#7b1fa2',
  purpleL: '#f3e5f5',
  bg: '#eef2f7',
  card: '#fff',
  border: '#e8e8e8'
};

// ── Helpers ──────────────────────────────────────────────────────
function getMonday(d) {
  var dt = new Date(d),
    day = dt.getDay();
  dt.setDate(dt.getDate() - day + (day === 0 ? -6 : 1));
  dt.setHours(0, 0, 0, 0);
  return dt;
}
function toISO(d) {
  return d.toISOString().split('T')[0];
}
function dayDate(ws, i) {
  var d = new Date(ws);
  d.setDate(d.getDate() + i);
  return d.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit'
  });
}
function weekLabel(mon) {
  var fri = new Date(mon);
  fri.setDate(mon.getDate() + 4);
  var o = {
    day: '2-digit',
    month: '2-digit'
  };
  return "".concat(mon.toLocaleDateString('pt-PT', o), " \u2013 ").concat(fri.toLocaleDateString('pt-PT', o));
}

// ── Estilos comuns ───────────────────────────────────────────────
var s = {
  card: {
    background: C.card,
    borderRadius: 14,
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
  },
  sectionTitle: function sectionTitle(color) {
    return {
      fontSize: 10,
      fontWeight: 800,
      color: color,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      marginBottom: 4
    };
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 0',
    borderBottom: "1px solid ".concat(C.border)
  }
};

// ── Componente principal ─────────────────────────────────────────
function LucasApp(_ref) {
  var supabase = _ref.supabase,
    user = _ref.user,
    isAdmin = _ref.isAdmin;
  var _useState = useState('plano'),
    _useState2 = _slicedToArray(_useState, 2),
    view = _useState2[0],
    setView = _useState2[1];
  var _useState3 = useState('seg'),
    _useState4 = _slicedToArray(_useState3, 2),
    activeDay = _useState4[0],
    setActiveDay = _useState4[1];
  var _useState5 = useState(function () {
      return getMonday(new Date());
    }),
    _useState6 = _slicedToArray(_useState5, 2),
    weekStart = _useState6[0],
    setWeekStart = _useState6[1];
  var _useState7 = useState({}),
    _useState8 = _slicedToArray(_useState7, 2),
    schedule = _useState8[0],
    setSchedule = _useState8[1];
  var _useState9 = useState([]),
    _useState0 = _slicedToArray(_useState9, 2),
    drivers = _useState0[0],
    setDrivers = _useState0[1];
  var _useState1 = useState(true),
    _useState10 = _slicedToArray(_useState1, 2),
    loading = _useState10[0],
    setLoading = _useState10[1];
  var _useState11 = useState(false),
    _useState12 = _slicedToArray(_useState11, 2),
    saving = _useState12[0],
    setSaving = _useState12[1];
  var _useState13 = useState(null),
    _useState14 = _slicedToArray(_useState13, 2),
    toast = _useState14[0],
    setToast = _useState14[1];
  var _useState15 = useState([]),
    _useState16 = _slicedToArray(_useState15, 2),
    history = _useState16[0],
    setHistory = _useState16[1];
  // filtros histórico
  var _useState17 = useState(''),
    _useState18 = _slicedToArray(_useState17, 2),
    fDriver = _useState18[0],
    setFDriver = _useState18[1];
  var _useState19 = useState(''),
    _useState20 = _slicedToArray(_useState19, 2),
    fDay = _useState20[0],
    setFDay = _useState20[1];
  var _useState21 = useState(''),
    _useState22 = _slicedToArray(_useState21, 2),
    fPeriod = _useState22[0],
    setFPeriod = _useState22[1];
  var _useState23 = useState(''),
    _useState24 = _slicedToArray(_useState23, 2),
    fSlot = _useState24[0],
    setFSlot = _useState24[1];

  // ── Carregar dados ───────────────────────────────────────────
  useEffect(function () {
    loadDrivers();
  }, []);
  useEffect(function () {
    loadSchedule();
  }, [weekStart]);
  useEffect(function () {
    if (view === 'historico') loadHistory();
  }, [view, fDriver, fDay, fPeriod, fSlot]);
  function flash(msg) {
    var err = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    setToast({
      msg: msg,
      err: err
    });
    setTimeout(function () {
      return setToast(null);
    }, 2000);
  }
  function loadDrivers() {
    return _loadDrivers.apply(this, arguments);
  }
  function _loadDrivers() {
    _loadDrivers = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
      var _yield$supabase$from$, data;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            _context.n = 1;
            return supabase.from('lucas_condutores').select('*').order('nome');
          case 1:
            _yield$supabase$from$ = _context.v;
            data = _yield$supabase$from$.data;
            if (data) setDrivers(data);
            setLoading(false);
          case 2:
            return _context.a(2);
        }
      }, _callee);
    }));
    return _loadDrivers.apply(this, arguments);
  }
  function loadSchedule() {
    return _loadSchedule.apply(this, arguments);
  }
  function _loadSchedule() {
    _loadSchedule = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
      var _yield$supabase$from$2, data, map;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.n) {
          case 0:
            setLoading(true);
            _context2.n = 1;
            return supabase.from('lucas_semana').select('*').eq('week_start', toISO(weekStart));
          case 1:
            _yield$supabase$from$2 = _context2.v;
            data = _yield$supabase$from$2.data;
            map = {};
            (data || []).forEach(function (r) {
              map["".concat(r.dia, ":").concat(r.slot)] = {
                condutor: r.condutor,
                enea: r.enea
              };
            });
            setSchedule(map);
            setLoading(false);
          case 2:
            return _context2.a(2);
        }
      }, _callee2);
    }));
    return _loadSchedule.apply(this, arguments);
  }
  function loadHistory() {
    return _loadHistory.apply(this, arguments);
  }
  function _loadHistory() {
    _loadHistory = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
      var q, _yield$q, data, rows;
      return _regenerator().w(function (_context3) {
        while (1) switch (_context3.n) {
          case 0:
            q = supabase.from('lucas_semana').select('*').order('week_start', {
              ascending: false
            }).order('dia').limit(300);
            if (fDriver) q = q.eq('condutor', fDriver);
            if (fDay) q = q.eq('dia', fDay);
            if (fSlot) q = q.eq('slot', fSlot);
            _context3.n = 1;
            return q;
          case 1:
            _yield$q = _context3.v;
            data = _yield$q.data;
            rows = data || [];
            if (fPeriod) rows = rows.filter(function (r) {
              var m = ['leva_manha', 'busca_almoco'].includes(r.slot);
              return fPeriod === 'manha' ? m : !m;
            });
            setHistory(rows);
          case 2:
            return _context3.a(2);
        }
      }, _callee3);
    }));
    return _loadHistory.apply(this, arguments);
  }
  function setSlot(_x, _x2, _x3) {
    return _setSlot.apply(this, arguments);
  }
  function _setSlot() {
    _setSlot = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(dia, slot, condutor) {
      var _schedule$key2;
      var key, enea, _yield$supabase$from$3, error;
      return _regenerator().w(function (_context4) {
        while (1) switch (_context4.n) {
          case 0:
            setSaving(true);
            key = "".concat(dia, ":").concat(slot);
            enea = ((_schedule$key2 = schedule[key]) === null || _schedule$key2 === void 0 ? void 0 : _schedule$key2.enea) || false;
            _context4.n = 1;
            return supabase.from('lucas_semana').upsert({
              week_start: toISO(weekStart),
              dia: dia,
              slot: slot,
              condutor: condutor,
              enea: enea
            }, {
              onConflict: 'week_start,dia,slot'
            });
          case 1:
            _yield$supabase$from$3 = _context4.v;
            error = _yield$supabase$from$3.error;
            if (!error) {
              setSchedule(function (p) {
                return _objectSpread(_objectSpread({}, p), {}, _defineProperty({}, key, _objectSpread(_objectSpread({}, p[key]), {}, {
                  condutor: condutor
                })));
              });
              flash('✓ Guardado');
            }
            setSaving(false);
          case 2:
            return _context4.a(2);
        }
      }, _callee4);
    }));
    return _setSlot.apply(this, arguments);
  }
  function toggleEnea(_x4, _x5) {
    return _toggleEnea.apply(this, arguments);
  }
  function _toggleEnea() {
    _toggleEnea = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(dia, slot) {
      var key, cur, newEnea, _yield$supabase$from$4, error;
      return _regenerator().w(function (_context5) {
        while (1) switch (_context5.n) {
          case 0:
            key = "".concat(dia, ":").concat(slot);
            cur = schedule[key] || {};
            newEnea = !cur.enea;
            _context5.n = 1;
            return supabase.from('lucas_semana').upsert({
              week_start: toISO(weekStart),
              dia: dia,
              slot: slot,
              condutor: cur.condutor || null,
              enea: newEnea
            }, {
              onConflict: 'week_start,dia,slot'
            });
          case 1:
            _yield$supabase$from$4 = _context5.v;
            error = _yield$supabase$from$4.error;
            if (!error) setSchedule(function (p) {
              return _objectSpread(_objectSpread({}, p), {}, _defineProperty({}, key, _objectSpread(_objectSpread({}, p[key]), {}, {
                enea: newEnea
              })));
            });
          case 2:
            return _context5.a(2);
        }
      }, _callee5);
    }));
    return _toggleEnea.apply(this, arguments);
  }
  function toggleAutorizacao(_x6, _x7) {
    return _toggleAutorizacao.apply(this, arguments);
  }
  function _toggleAutorizacao() {
    _toggleAutorizacao = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(id, cur) {
      var _yield$supabase$from$5, error;
      return _regenerator().w(function (_context6) {
        while (1) switch (_context6.n) {
          case 0:
            _context6.n = 1;
            return supabase.from('lucas_condutores').update({
              autorizado: !cur
            }).eq('id', id);
          case 1:
            _yield$supabase$from$5 = _context6.v;
            error = _yield$supabase$from$5.error;
            if (!error) {
              setDrivers(function (p) {
                return p.map(function (d) {
                  return d.id === id ? _objectSpread(_objectSpread({}, d), {}, {
                    autorizado: !cur
                  }) : d;
                });
              });
              flash(!cur ? '✓ Autorizado' : '⛔ Removido');
            }
          case 2:
            return _context6.a(2);
        }
      }, _callee6);
    }));
    return _toggleAutorizacao.apply(this, arguments);
  }
  function prevWeek() {
    setWeekStart(function (p) {
      var d = new Date(p);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }
  function nextWeek() {
    setWeekStart(function (p) {
      var d = new Date(p);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }

  // ── Derivados ────────────────────────────────────────────────
  var authDrivers = drivers.filter(function (d) {
    return d.autorizado;
  });
  var driverColor = Object.fromEntries(drivers.map(function (d) {
    return [d.nome, d.cor || C.green];
  }));
  var day = DAYS.find(function (d) {
    return d.key === activeDay;
  });

  // ── Sub-componentes ──────────────────────────────────────────

  function DriverSelect(_ref2) {
    var _schedule$key;
    var dia = _ref2.dia,
      slot = _ref2.slot;
    var key = "".concat(dia, ":").concat(slot);
    var val = ((_schedule$key = schedule[key]) === null || _schedule$key === void 0 ? void 0 : _schedule$key.condutor) || '';
    var col = val ? driverColor[val] || C.green : '#aaa';
    return /*#__PURE__*/React.createElement("select", {
      value: val,
      onChange: function onChange(e) {
        return setSlot(dia, slot, e.target.value);
      },
      style: {
        border: "1.5px solid ".concat(val ? col : '#ddd'),
        borderRadius: 8,
        padding: '6px 8px',
        fontSize: 13,
        background: val ? col + '18' : '#f5f5f5',
        color: val ? col : '#aaa',
        fontWeight: val ? 700 : 400,
        flex: 1,
        outline: 'none',
        cursor: 'pointer',
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "\u2014 escolher \u2014"), authDrivers.map(function (d) {
      return /*#__PURE__*/React.createElement("option", {
        key: d.nome,
        value: d.nome
      }, d.nome);
    }));
  }
  function EneaBtn(_ref3) {
    var _schedule;
    var dia = _ref3.dia,
      slot = _ref3.slot;
    var on = !!((_schedule = schedule["".concat(dia, ":").concat(slot)]) !== null && _schedule !== void 0 && _schedule.enea);
    return /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return toggleEnea(dia, slot);
      },
      style: {
        border: "1.5px solid ".concat(on ? C.purple : '#ddd'),
        borderRadius: 20,
        padding: '6px 10px',
        fontSize: 12,
        background: on ? C.purpleL : '#f5f5f5',
        color: on ? C.purple : '#bbb',
        fontWeight: on ? 700 : 400,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0
      }
    }, "\uD83E\uDDD2 ", on ? 'Enea ✓' : 'Enea?');
  }
  function TimeRow(_ref4) {
    var icon = _ref4.icon,
      label = _ref4.label,
      time = _ref4.time;
    return /*#__PURE__*/React.createElement("div", {
      style: s.row
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15,
        width: 22
      }
    }, icon), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontSize: 13,
        color: '#555'
      }
    }, label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 16,
        fontWeight: 800,
        color: '#111'
      }
    }, time));
  }
  function DriveRow(_ref5) {
    var dia = _ref5.dia,
      slot = _ref5.slot,
      label = _ref5.label;
    return /*#__PURE__*/React.createElement("div", {
      style: s.row
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15,
        width: 22
      }
    }, "\uD83D\uDE97"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: '#555',
        width: 40,
        flexShrink: 0
      }
    }, label), /*#__PURE__*/React.createElement(DriverSelect, {
      dia: dia,
      slot: slot
    }), /*#__PURE__*/React.createElement(EneaBtn, {
      dia: dia,
      slot: slot
    }));
  }

  // ── VIEW: PLANO ──────────────────────────────────────────────
  function ViewPlano() {
    var isToday = toISO(getMonday(new Date())) === toISO(weekStart);
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: _objectSpread(_objectSpread({}, s.card), {}, {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        marginBottom: 12
      })
    }, /*#__PURE__*/React.createElement("button", {
      onClick: prevWeek,
      style: btnNav
    }, "\u2039"), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: '#aaa',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 1
      }
    }, isToday ? '🟢 Semana atual' : 'Semana'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 800,
        color: C.primary
      }
    }, weekLabel(weekStart))), /*#__PURE__*/React.createElement("button", {
      onClick: nextWeek,
      style: btnNav
    }, "\u203A")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 3,
        marginBottom: 12
      }
    }, DAYS.map(function (d, i) {
      var daySlots = ['leva_manha', 'busca_almoco'].concat(_toConsumableArray(d.tarde ? ['leva_tarde', 'busca_fim'] : []));
      var filled = daySlots.filter(function (sl) {
        var _schedule2;
        return (_schedule2 = schedule["".concat(d.key, ":").concat(sl)]) === null || _schedule2 === void 0 ? void 0 : _schedule2.condutor;
      }).length;
      var full = filled === daySlots.length;
      var isActive = activeDay === d.key;
      return /*#__PURE__*/React.createElement("button", {
        key: d.key,
        onClick: function onClick() {
          return setActiveDay(d.key);
        },
        style: {
          flex: 1,
          padding: '7px 2px',
          border: 'none',
          borderRadius: 10,
          background: isActive ? C.primary : C.card,
          color: isActive ? '#fff' : '#666',
          fontWeight: isActive ? 800 : 500,
          fontSize: 11,
          cursor: 'pointer',
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1
        }
      }, /*#__PURE__*/React.createElement("span", null, d.short), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 9,
          opacity: 0.7
        }
      }, dayDate(weekStart, i)), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 9,
          fontWeight: 700,
          color: isActive ? 'rgba(255,255,255,.8)' : full ? C.green : '#ccc'
        }
      }, filled, "/", daySlots.length));
    })), loading ? /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        padding: 30,
        color: '#bbb'
      }
    }, "A carregar...") : /*#__PURE__*/React.createElement("div", {
      style: _objectSpread(_objectSpread({}, s.card), {}, {
        padding: '4px 16px 16px'
      })
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0 6px',
        borderBottom: '2px solid #f0f0f0'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        fontWeight: 800,
        color: C.primary
      }
    }, day.label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: '#aaa'
      }
    }, "\uD83D\uDECF 6:15 \xB7 \uD83C\uDFEB 7:30")), /*#__PURE__*/React.createElement("div", {
      style: _objectSpread(_objectSpread({}, s.sectionTitle(C.blue)), {}, {
        marginTop: 14
      })
    }, "\uD83C\uDF05 Manh\xE3"), /*#__PURE__*/React.createElement(TimeRow, {
      icon: "\uD83C\uDFEB",
      label: "Entra na escola",
      time: "7:30"
    }), /*#__PURE__*/React.createElement(DriveRow, {
      dia: day.key,
      slot: "leva_manha",
      label: "Leva"
    }), /*#__PURE__*/React.createElement(TimeRow, {
      icon: "\uD83C\uDFE0",
      label: "Sai da escola",
      time: day.sai
    }), /*#__PURE__*/React.createElement(DriveRow, {
      dia: day.key,
      slot: "busca_almoco",
      label: "Busca"
    }), day.tarde ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 1,
        background: '#eee',
        margin: '14px 0 0'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: _objectSpread(_objectSpread({}, s.sectionTitle(C.orange)), {}, {
        marginTop: 14
      })
    }, "\uD83C\uDF24 Tarde"), /*#__PURE__*/React.createElement(TimeRow, {
      icon: "\uD83C\uDFEB",
      label: "Entra na escola",
      time: "13:30"
    }), /*#__PURE__*/React.createElement(DriveRow, {
      dia: day.key,
      slot: "leva_tarde",
      label: "Leva"
    }), /*#__PURE__*/React.createElement(TimeRow, {
      icon: "\uD83C\uDFE0",
      label: "Sai da escola",
      time: "16:55"
    }), /*#__PURE__*/React.createElement(DriveRow, {
      dia: day.key,
      slot: "busca_fim",
      label: "Busca"
    })) : /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        color: '#ccc',
        fontStyle: 'italic',
        margin: '18px 0 6px',
        fontSize: 13
      }
    }, "Sem tarde")));
  }

  // ── VIEW: AUTORIZAÇÕES ───────────────────────────────────────
  function ViewAutorizacoes() {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: '#999',
        marginBottom: 14,
        lineHeight: 1.6
      }
    }, "Ativa ou remove o acesso de cada condutor ao plano semanal.", /*#__PURE__*/React.createElement("br", null), "Quem n\xE3o estiver autorizado n\xE3o aparece nas op\xE7\xF5es."), drivers.map(function (d) {
      var col = d.cor || C.green;
      return /*#__PURE__*/React.createElement("div", {
        key: d.id,
        style: _objectSpread(_objectSpread({}, s.card), {}, {
          padding: '14px 16px',
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          border: "2px solid ".concat(d.autorizado ? col : C.border),
          opacity: d.autorizado ? 1 : 0.5
        })
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 48,
          height: 48,
          borderRadius: 24,
          background: d.autorizado ? col + '22' : '#f0f0f0',
          border: "2px solid ".concat(d.autorizado ? col : '#ddd'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22
        }
      }, "\uD83D\uDC64"), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 800,
          fontSize: 16,
          color: d.autorizado ? '#111' : '#aaa'
        }
      }, d.nome), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          fontWeight: 700,
          borderRadius: 10,
          padding: '2px 9px',
          background: d.autorizado ? col + '22' : '#f0f0f0',
          color: d.autorizado ? col : '#aaa'
        }
      }, d.autorizado ? '✓ Autorizado' : '⛔ Sem acesso')), isAdmin ? /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return toggleAutorizacao(d.id, d.autorizado);
        },
        style: {
          border: 'none',
          borderRadius: 20,
          padding: '8px 14px',
          cursor: 'pointer',
          background: d.autorizado ? '#ffebee' : C.greenL,
          color: d.autorizado ? '#c62828' : C.green,
          fontWeight: 700,
          fontSize: 12
        }
      }, d.autorizado ? 'Remover' : 'Autorizar') : /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 18
        }
      }, d.autorizado ? '✅' : '🔒'));
    }), /*#__PURE__*/React.createElement("div", {
      style: _objectSpread(_objectSpread({}, s.card), {}, {
        padding: '12px 16px',
        marginTop: 4
      })
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: '#999',
        marginBottom: 8,
        fontWeight: 700
      }
    }, "Resumo"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 900,
        color: C.green
      }
    }, drivers.filter(function (d) {
      return d.autorizado;
    }).length), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: '#aaa'
      }
    }, "Autorizados")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 900,
        color: '#e53935'
      }
    }, drivers.filter(function (d) {
      return !d.autorizado;
    }).length), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: '#aaa'
      }
    }, "Sem acesso")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 900,
        color: C.primary
      }
    }, drivers.length), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: '#aaa'
      }
    }, "Total")))));
  }

  // ── VIEW: HISTÓRICO ──────────────────────────────────────────
  function ViewHistorico() {
    // Agrupar por semana
    var byWeek = {};
    history.forEach(function (r) {
      if (!byWeek[r.week_start]) byWeek[r.week_start] = [];
      byWeek[r.week_start].push(r);
    });
    var hasFilter = fDriver || fDay || fPeriod || fSlot;
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: _objectSpread(_objectSpread({}, s.card), {}, {
        padding: '12px 14px',
        marginBottom: 14
      })
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        fontWeight: 800,
        color: '#bbb',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 10
      }
    }, "\uD83D\uDD0E Filtros"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(FiltroSelect, {
      label: "Condutor",
      value: fDriver,
      onChange: setFDriver,
      opts: drivers.map(function (d) {
        return {
          v: d.nome,
          l: d.nome
        };
      })
    }), /*#__PURE__*/React.createElement(FiltroSelect, {
      label: "Dia",
      value: fDay,
      onChange: setFDay,
      opts: DAYS.map(function (d) {
        return {
          v: d.key,
          l: d.label
        };
      })
    }), /*#__PURE__*/React.createElement(FiltroSelect, {
      label: "Per\xEDodo",
      value: fPeriod,
      onChange: setFPeriod,
      opts: [{
        v: 'manha',
        l: '🌅 Manhã'
      }, {
        v: 'tarde',
        l: '🌤 Tarde'
      }]
    }), /*#__PURE__*/React.createElement(FiltroSelect, {
      label: "Servi\xE7o",
      value: fSlot,
      onChange: setFSlot,
      opts: ALL_SLOTS.map(function (k) {
        return {
          v: k,
          l: SLOT_LABELS[k]
        };
      })
    })), hasFilter && /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setFDriver('');
        setFDay('');
        setFPeriod('');
        setFSlot('');
      },
      style: {
        marginTop: 10,
        fontSize: 11,
        color: '#e53935',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 700
      }
    }, "\u2715 Limpar filtros")), history.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        color: '#ccc',
        fontSize: 13,
        marginTop: 30,
        fontStyle: 'italic'
      }
    }, hasFilter ? 'Sem resultados para estes filtros' : 'Sem histórico disponível') : Object.entries(byWeek).map(function (_ref6) {
      var _ref7 = _slicedToArray(_ref6, 2),
        week = _ref7[0],
        rows = _ref7[1];
      var mon = new Date(week + 'T00:00:00');
      var fri = new Date(mon);
      fri.setDate(mon.getDate() + 4);
      var o = {
        day: '2-digit',
        month: '2-digit'
      };
      return /*#__PURE__*/React.createElement("div", {
        key: week,
        style: {
          marginBottom: 14
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11,
          fontWeight: 800,
          color: C.primary,
          marginBottom: 6,
          paddingLeft: 4
        }
      }, "\uD83D\uDCC5 ", mon.toLocaleDateString('pt-PT', o), " \u2013 ", fri.toLocaleDateString('pt-PT', o)), /*#__PURE__*/React.createElement("div", {
        style: _objectSpread(_objectSpread({}, s.card), {}, {
          overflow: 'hidden'
        })
      }, rows.map(function (r, i) {
        var _DAYS$find;
        var col = driverColor[r.condutor] || '#888';
        var dayLabel = ((_DAYS$find = DAYS.find(function (d) {
          return d.key === r.dia;
        })) === null || _DAYS$find === void 0 ? void 0 : _DAYS$find.label) || r.dia;
        return /*#__PURE__*/React.createElement("div", {
          key: "".concat(r.week_start).concat(r.dia).concat(r.slot),
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 14px',
            borderBottom: i < rows.length - 1 ? "1px solid ".concat(C.border) : 'none'
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 11,
            color: '#aaa',
            width: 40,
            flexShrink: 0
          }
        }, dayLabel.slice(0, 3)), /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 11,
            color: '#777',
            flex: 1
          }
        }, SLOT_LABELS[r.slot]), /*#__PURE__*/React.createElement("span", {
          style: {
            fontWeight: 700,
            color: col,
            fontSize: 12
          }
        }, r.condutor || '—'), r.enea && /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 10,
            color: C.purple,
            background: C.purpleL,
            borderRadius: 10,
            padding: '1px 7px'
          }
        }, "\uD83E\uDDD2"));
      })));
    }));
  }
  function FiltroSelect(_ref8) {
    var label = _ref8.label,
      value = _ref8.value,
      _onChange = _ref8.onChange,
      opts = _ref8.opts;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: '#888',
        width: 62,
        flexShrink: 0
      }
    }, label), /*#__PURE__*/React.createElement("select", {
      value: value,
      onChange: function onChange(e) {
        return _onChange(e.target.value);
      },
      style: {
        flex: 1,
        border: "1.5px solid ".concat(value ? C.primary : '#e0e0e0'),
        borderRadius: 8,
        padding: '5px 8px',
        fontSize: 12,
        background: value ? "".concat(C.primary, "0d") : '#f9f9f9',
        color: value ? C.primary : '#aaa',
        outline: 'none'
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "Todos"), opts.map(function (o) {
      return /*#__PURE__*/React.createElement("option", {
        key: o.v,
        value: o.v
      }, o.l);
    })));
  }

  // ── VIEW: IMPRIMIR ───────────────────────────────────────────
  function ViewImprimir() {
    function handlePrint() {
      var rows = DAYS.map(function (d, i) {
        function cell(slot) {
          var k = "".concat(d.key, ":").concat(slot);
          var sc = schedule[k] || {};
          var col = sc.condutor ? driverColor[sc.condutor] || '#333' : '#bbb';
          return "<td style=\"border:1px solid #ccc;padding:8px 10px;background:#fff;vertical-align:top\">\n            <div style=\"font-weight:800;font-size:13px;color:".concat(col, "\">").concat(sc.condutor || '—', "</div>\n            ").concat(sc.enea ? '<div style="font-size:10px;color:#7b1fa2;margin-top:3px">🧒 Enea</div>' : '', "\n          </td>");
        }
        return "<tr>\n          <td style=\"border:1px solid #ccc;padding:8px;background:#e8eaf6;text-align:center;vertical-align:middle\">\n            <div style=\"font-weight:900;font-size:13px;color:#1a237e\">".concat(d.label, "</div>\n            <div style=\"font-size:10px;color:#777;margin-top:2px\">").concat(dayDate(weekStart, i), "</div>\n            <div style=\"font-size:9px;color:#aaa;margin-top:2px\">Sai: ").concat(d.sai, "</div>\n          </td>\n          ").concat(cell('leva_manha')).concat(cell('busca_almoco'), "\n          ").concat(d.tarde ? cell('leva_tarde') + cell('busca_fim') : '<td colspan="2" style="border:1px solid #ccc;background:#f5f5f5;text-align:center;color:#ccc;font-style:italic;vertical-align:middle">—</td>', "\n        </tr>");
      }).join('');
      var html = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\">\n        <title>Semana do Lucas</title>\n        <style>\n          @page{size:A4 landscape;margin:12mm}\n          body{font-family:Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}\n          .page{display:flex;flex-direction:column;height:183mm}\n          table{width:100%;border-collapse:collapse;flex:1}\n          th{color:#fff;padding:8px 6px;font-size:9.5px;text-transform:uppercase;border:1px solid rgba(255,255,255,.3);font-weight:800}\n          #tbody tr{height:20%}\n        </style>\n      </head><body>\n      <div class=\"page\">\n        <div style=\"display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1a237e;padding-bottom:8px;margin-bottom:9px\">\n          <div>\n            <div style=\"font-size:20px;font-weight:900;color:#1a237e\">\uD83D\uDCC5 Semana do Lucas</div>\n            <div style=\"font-size:9px;color:#777;margin-top:2px\">\uD83C\uDFEB Grenchen Nord Schule \u2194 Selzach \xB7 \uD83D\uDECF Levanta 6:15 \xB7 Entra 7:30</div>\n          </div>\n          <div style=\"font-size:15px;font-weight:800;color:#1a237e\">".concat(weekLabel(weekStart), "</div>\n        </div>\n        <table>\n          <thead>\n            <tr>\n              <th rowspan=\"2\" style=\"background:#1a237e\">Dia / Data</th>\n              <th colspan=\"2\" style=\"background:#1565c0\">\uD83C\uDF05 MANH\xC3</th>\n              <th colspan=\"2\" style=\"background:#bf360c\">\uD83C\uDF24 TARDE</th>\n            </tr>\n            <tr>\n              <th style=\"background:#1976d2\">\uD83D\uDE97 Leva \u2014 7:30</th>\n              <th style=\"background:#1976d2\">\uD83D\uDE97 Busca</th>\n              <th style=\"background:#d84315\">\uD83D\uDE97 Leva \u2014 13:30</th>\n              <th style=\"background:#d84315\">\uD83D\uDE97 Busca \u2014 16:55</th>\n            </tr>\n          </thead>\n          <tbody id=\"tbody\">").concat(rows, "</tbody>\n        </table>\n        <div style=\"margin-top:7px;padding-top:6px;border-top:1px solid #ddd;font-size:9px;color:#777;display:flex;gap:14px\">\n          <strong style=\"color:#333\">Legenda:</strong>\n          <span>Condutor: nome de quem leva / busca</span>\n          <span style=\"color:#7b1fa2\">\uD83E\uDDD2 Enea vem junto</span>\n        </div>\n      </div>\n      </body></html>");
      var w = window.open('', '_blank');
      w.document.write(html);
      w.document.close();
      setTimeout(function () {
        return w.print();
      }, 600);
    }
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: _objectSpread(_objectSpread({}, s.card), {}, {
        padding: '14px 16px',
        marginBottom: 14,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      })
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 800,
        color: C.primary,
        fontSize: 15
      }
    }, "\uD83D\uDCC5 ", weekLabel(weekStart)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: '#aaa',
        marginTop: 2
      }
    }, "Pr\xE9-visualiza\xE7\xE3o da semana")), /*#__PURE__*/React.createElement("button", {
      onClick: handlePrint,
      style: {
        background: C.primary,
        color: '#fff',
        border: 'none',
        borderRadius: 10,
        padding: '10px 18px',
        fontWeight: 800,
        fontSize: 13,
        cursor: 'pointer'
      }
    }, "\uD83D\uDDA8\uFE0F Imprimir")), DAYS.map(function (d, i) {
      var slots = ['leva_manha', 'busca_almoco'].concat(_toConsumableArray(d.tarde ? ['leva_tarde', 'busca_fim'] : []));
      return /*#__PURE__*/React.createElement("div", {
        key: d.key,
        style: _objectSpread(_objectSpread({}, s.card), {}, {
          marginBottom: 8,
          overflow: 'hidden'
        })
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          background: C.primary,
          padding: '8px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          color: '#fff',
          fontWeight: 800,
          fontSize: 14
        }
      }, d.label), /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'rgba(255,255,255,.6)',
          fontSize: 11
        }
      }, dayDate(weekStart, i), " \xB7 Sai ", d.sai)), /*#__PURE__*/React.createElement("div", {
        style: {
          padding: '8px 14px'
        }
      }, slots.map(function (slot) {
        var key = "".concat(d.key, ":").concat(slot);
        var sc = schedule[key] || {};
        var col = sc.condutor ? driverColor[sc.condutor] || C.green : '#ccc';
        return /*#__PURE__*/React.createElement("div", {
          key: slot,
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 0',
            borderBottom: "1px solid ".concat(C.border)
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 12,
            color: '#999',
            flex: 1
          }
        }, SLOT_LABELS[slot]), /*#__PURE__*/React.createElement("span", {
          style: {
            fontWeight: 700,
            color: col,
            fontSize: 13
          }
        }, sc.condutor || '—'), sc.enea && /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 10,
            color: C.purple,
            background: C.purpleL,
            borderRadius: 10,
            padding: '1px 7px'
          }
        }, "\uD83E\uDDD2"));
      })));
    }));
  }

  // ── Botão de navegação semana ────────────────────────────────
  var btnNav = {
    background: 'none',
    border: "1.5px solid ".concat(C.border),
    borderRadius: 8,
    width: 36,
    height: 36,
    fontSize: 20,
    cursor: 'pointer',
    color: C.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  };

  // ── Nav inferior ─────────────────────────────────────────────
  var navItems = [{
    key: 'plano',
    icon: '📅',
    label: 'Plano'
  }, {
    key: 'autorizacoes',
    icon: '🔑',
    label: 'Acesso'
  }, {
    key: 'historico',
    icon: '📋',
    label: 'Histórico'
  }, {
    key: 'imprimir',
    icon: '🖨️',
    label: 'Imprimir'
  }];

  // ── RENDER ───────────────────────────────────────────────────
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      background: C.bg,
      minHeight: '100vh',
      maxWidth: 500,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.primary,
      padding: '14px 16px 10px',
      position: 'sticky',
      top: 0,
      zIndex: 20,
      boxShadow: '0 2px 10px rgba(0,0,0,0.18)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#fff',
      fontWeight: 800,
      fontSize: 17
    }
  }, "\uD83C\uDFEB Escola do Lucas"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'rgba(255,255,255,.55)',
      fontSize: 10,
      marginTop: 1
    }
  }, "Grenchen Nord Schule \xB7 Selzach")), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 60,
      textAlign: 'right'
    }
  }, saving && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(255,255,255,.5)',
      fontSize: 11
    }
  }, "A guardar..."), toast && /*#__PURE__*/React.createElement("span", {
    style: {
      color: toast.err ? '#ffcdd2' : '#a5d6a7',
      fontSize: 12,
      fontWeight: 700
    }
  }, toast.msg)))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 12px 80px'
    }
  }, view === 'plano' && /*#__PURE__*/React.createElement(ViewPlano, null), view === 'autorizacoes' && /*#__PURE__*/React.createElement(ViewAutorizacoes, null), view === 'historico' && /*#__PURE__*/React.createElement(ViewHistorico, null), view === 'imprimir' && /*#__PURE__*/React.createElement(ViewImprimir, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 500,
      background: C.card,
      borderTop: "1px solid ".concat(C.border),
      display: 'flex',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.08)',
      zIndex: 30
    }
  }, navItems.map(function (n) {
    return /*#__PURE__*/React.createElement("button", {
      key: n.key,
      onClick: function onClick() {
        return setView(n.key);
      },
      style: {
        flex: 1,
        padding: '10px 4px 12px',
        border: 'none',
        background: view === n.key ? C.primary + '12' : 'transparent',
        color: view === n.key ? C.primary : '#bbb',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 19
      }
    }, n.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9.5,
        fontWeight: view === n.key ? 800 : 500
      }
    }, n.label), view === n.key && /*#__PURE__*/React.createElement("div", {
      style: {
        width: 18,
        height: 2.5,
        background: C.primary,
        borderRadius: 2,
        marginTop: 1
      }
    }));
  })));
}
