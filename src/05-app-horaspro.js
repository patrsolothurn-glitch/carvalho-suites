var H = {
  bg: '#F2F0EB',
  surface: '#FFFFFF',
  surface2: '#EEECE6',
  gold: '#B8962E',
  goldL: '#D4AF50',
  text: '#1A1A14',
  muted: '#888878',
  border: '#E0DDD5',
  green: '#22A06B',
  red: '#DC2626',
  blue: '#2563EB',
  orange: '#D97706'
};

// ── FORM COMPONENT ISOLADO (evita re-render ao escrever) ────────────
var EntryFormModal = React.memo(function EntryFormModal(_ref8) {
  var _projList$;
  var onSave = _ref8.onSave,
    onClose = _ref8.onClose,
    tipos = _ref8.tipos,
    projList = _ref8.projList,
    calcHoras = _ref8.calcHoras,
    H = _ref8.H,
    _ref8$saveErr = _ref8.saveErr,
    saveErr = _ref8$saveErr === void 0 ? '' : _ref8$saveErr,
    _ref8$saving = _ref8.saving,
    saving = _ref8$saving === void 0 ? false : _ref8$saving,
    _ref8$editData = _ref8.editData,
    editData = _ref8$editData === void 0 ? null : _ref8$editData;
  var _React$useState = React.useState((editData === null || editData === void 0 ? void 0 : editData.tipo) || 'Spleisser'),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    tipo = _React$useState2[0],
    setTipo = _React$useState2[1];
  var _React$useState3 = React.useState((editData === null || editData === void 0 ? void 0 : editData.proj) || ((_projList$ = projList[0]) === null || _projList$ === void 0 ? void 0 : _projList$.name) || 'POP GREN04'),
    _React$useState4 = _slicedToArray(_React$useState3, 2),
    proj = _React$useState4[0],
    setProj = _React$useState4[1];
  var _React$useState5 = React.useState((editData === null || editData === void 0 ? void 0 : editData.hi) || '07:00'),
    _React$useState6 = _slicedToArray(_React$useState5, 2),
    hi = _React$useState6[0],
    setHi = _React$useState6[1];
  var _React$useState7 = React.useState((editData === null || editData === void 0 ? void 0 : editData.hf) || '12:00'),
    _React$useState8 = _slicedToArray(_React$useState7, 2),
    hf = _React$useState8[0],
    setHf = _React$useState8[1];
  var moradaRef = React.useRef(null);
  var horas = calcHoras(hi, hf);
  var projs = projList.map(function (p) {
    return p.name;
  });
  var isEdit = !!editData;
  var guardar = function guardar() {
    var _moradaRef$current;
    if (horas <= 0) return;
    var morada = (((_moradaRef$current = moradaRef.current) === null || _moradaRef$current === void 0 ? void 0 : _moradaRef$current.value) || '').trim();
    onSave({
      tipo: tipo,
      proj: proj,
      hi: hi,
      hf: hf,
      horas: horas,
      morada: morada
    });
  };
  var S = {
    input: {
      width: '100%',
      background: H.surface2,
      border: "1px solid ".concat(H.border),
      borderRadius: 12,
      padding: '12px 14px',
      color: H.text,
      fontSize: 15,
      outline: 'none',
      boxSizing: 'border-box',
      fontFamily: 'inherit'
    },
    label: {
      color: H.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.6px',
      marginBottom: 5,
      display: 'block'
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 500,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.55)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      background: H.surface,
      borderRadius: '24px 24px 0 0',
      border: "2px solid ".concat(H.gold),
      borderBottom: 'none',
      maxHeight: '92vh',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 -12px 40px rgba(0,0,0,0.25)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 5,
      background: H.border,
      borderRadius: 3,
      margin: '12px auto 0',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 20px 12px',
      flexShrink: 0,
      borderBottom: "1px solid ".concat(H.border)
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.gold,
      fontWeight: 900,
      fontSize: 18
    }
  }, isEdit ? 'Editar registo' : 'Novo registo'), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: H.surface2,
      border: "1px solid ".concat(H.border),
      borderRadius: 10,
      width: 34,
      height: 34,
      cursor: 'pointer',
      color: H.muted,
      fontSize: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowY: 'auto',
      padding: '16px 20px',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: S.label
  }, "Tipo"), /*#__PURE__*/React.createElement("select", {
    value: tipo,
    onChange: function onChange(e) {
      return setTipo(e.target.value);
    },
    style: _objectSpread(_objectSpread({}, S.input), {}, {
      padding: '11px 14px'
    })
  }, tipos.map(function (t) {
    return /*#__PURE__*/React.createElement("option", {
      key: t
    }, t);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: S.label
  }, "Projeto"), /*#__PURE__*/React.createElement("select", {
    value: proj,
    onChange: function onChange(e) {
      return setProj(e.target.value);
    },
    style: _objectSpread(_objectSpread({}, S.input), {}, {
      padding: '11px 14px'
    })
  }, projs.map(function (p) {
    return /*#__PURE__*/React.createElement("option", {
      key: p
    }, p);
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: S.label
  }, "Hor\xE1rio"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "time",
    value: hi,
    onChange: function onChange(e) {
      return setHi(e.target.value);
    },
    style: _objectSpread(_objectSpread({}, S.input), {}, {
      flex: 1,
      padding: '11px 12px'
    })
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: H.muted,
      fontSize: 14,
      fontWeight: 700,
      flexShrink: 0
    }
  }, "\u2192"), /*#__PURE__*/React.createElement("input", {
    type: "time",
    value: hf,
    onChange: function onChange(e) {
      return setHf(e.target.value);
    },
    style: _objectSpread(_objectSpread({}, S.input), {}, {
      flex: 1,
      padding: '11px 12px'
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: horas > 0 ? 'rgba(184,150,46,0.12)' : H.surface2,
      border: "1px solid ".concat(horas > 0 ? H.gold : H.border),
      borderRadius: 12,
      padding: '11px 10px',
      minWidth: 50,
      textAlign: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: horas > 0 ? H.gold : H.muted,
      fontWeight: 900,
      fontSize: 14
    }
  }, horas > 0 ? "".concat(horas, "h") : '—')))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: S.label
  }, "\uD83D\uDCCD Morada do trabalho"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("input", {
    ref: moradaRef,
    defaultValue: (editData === null || editData === void 0 ? void 0 : editData.morada) || '',
    autoComplete: "off",
    autoCorrect: "off",
    spellCheck: false,
    autoCapitalize: "words",
    inputMode: "text",
    type: "text",
    placeholder: "Ex: D\xE4derizstrasse 21, Grenchen",
    style: _objectSpread(_objectSpread({}, S.input), {}, {
      paddingRight: 44
    })
  }), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      if (moradaRef.current) {
        moradaRef.current.value = '';
        moradaRef.current.focus();
      }
    },
    style: {
      position: 'absolute',
      right: 10,
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'rgba(0,0,0,0.07)',
      border: 'none',
      borderRadius: '50%',
      width: 28,
      height: 28,
      cursor: 'pointer',
      color: H.muted,
      fontSize: 14,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, "\u2715")))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 20px 32px',
      flexShrink: 0,
      borderTop: "1px solid ".concat(H.border)
    }
  }, saveErr && /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#DC2626',
      fontSize: 12.5,
      lineHeight: 1.4,
      marginBottom: 10,
      padding: '8px 10px',
      background: 'rgba(220,38,38,0.08)',
      border: '1px solid rgba(220,38,38,0.25)',
      borderRadius: 10
    }
  }, "\u26A0\uFE0F ", saveErr), /*#__PURE__*/React.createElement("button", {
    onClick: guardar,
    disabled: horas <= 0 || saving,
    style: {
      width: '100%',
      background: saving ? '#ddd' : horas > 0 ? "linear-gradient(135deg,".concat(H.gold, ",").concat(H.goldL, ")") : '#ddd',
      border: 'none',
      borderRadius: 16,
      padding: '16px',
      color: horas > 0 && !saving ? '#fff' : '#aaa',
      fontSize: 16,
      fontWeight: 900,
      cursor: horas > 0 && !saving ? 'pointer' : 'default',
      boxShadow: horas > 0 && !saving ? "0 6px 20px rgba(184,150,46,0.35)" : 'none'
    }
  }, saving ? 'A guardar…' : (isEdit ? '✓ Guardar alterações' : '✓ Guardar registo') + (horas > 0 ? " \xB7 ".concat(horas, "h") : '')))));
});
function HorasProApp(_ref9) {
  var onBack = _ref9.onBack,
    _ref9$sharedDias = _ref9.sharedDias,
    sharedDias = _ref9$sharedDias === void 0 ? [] : _ref9$sharedDias,
    _ref9$addSharedDia = _ref9.addSharedDia,
    addSharedDia = _ref9$addSharedDia === void 0 ? function () {} : _ref9$addSharedDia,
    _ref9$removeSharedDia = _ref9.removeSharedDia,
    removeSharedDia = _ref9$removeSharedDia === void 0 ? function () {} : _ref9$removeSharedDia,
    profile = _ref9.profile,
    _ref9$onPhotoUpload = _ref9.onPhotoUpload,
    onPhotoUpload = _ref9$onPhotoUpload === void 0 ? function () {} : _ref9$onPhotoUpload,
    _ref9$onPhotoRemove = _ref9.onPhotoRemove,
    onPhotoRemove = _ref9$onPhotoRemove === void 0 ? function () {} : _ref9$onPhotoRemove;
  var today = new Date();
  var _useState = (0, _react.useState)(new Date()),
    _useState2 = _slicedToArray(_useState, 2),
    curDate = _useState2[0],
    setCurDate = _useState2[1];
  var _useState3 = (0, _react.useState)('Semana'),
    _useState4 = _slicedToArray(_useState3, 2),
    tab = _useState4[0],
    setTab = _useState4[1];
  var _useState5 = (0, _react.useState)('Registo'),
    _useState6 = _slicedToArray(_useState5, 2),
    subNav = _useState6[0],
    setSubNav = _useState6[1];
  var _useStateViewMode = (0, _react.useState)('pendentes'),
    _useStateViewMode2 = _slicedToArray(_useStateViewMode, 2),
    viewMode = _useStateViewMode2[0],
    setViewMode = _useStateViewMode2[1];
  var _useState7 = (0, _react.useState)(false),
    _useState8 = _slicedToArray(_useState7, 2),
    showMenu = _useState8[0],
    setShowMenu = _useState8[1];
  var _useState9 = (0, _react.useState)(new Date(2026, 5, 1)),
    _useState0 = _slicedToArray(_useState9, 2),
    menuMonth = _useState0[0],
    setMenuMonth = _useState0[1];
  var _useState1 = (0, _react.useState)(false),
    _useState10 = _slicedToArray(_useState1, 2),
    showAdd = _useState10[0],
    setShowAdd = _useState10[1];
  var _useState11 = (0, _react.useState)(null),
    _useState12 = _slicedToArray(_useState11, 2),
    editEntry = _useState12[0],
    setEditEntry = _useState12[1];
  var _useStateEntrySaveErr = (0, _react.useState)(''),
    _useStateEntrySaveErr2 = _slicedToArray(_useStateEntrySaveErr, 2),
    entrySaveErr = _useStateEntrySaveErr2[0],
    setEntrySaveErr = _useStateEntrySaveErr2[1];
  var _useStateEntrySaving = (0, _react.useState)(false),
    _useStateEntrySaving2 = _slicedToArray(_useStateEntrySaving, 2),
    entrySaving = _useStateEntrySaving2[0],
    setEntrySaving = _useStateEntrySaving2[1];
  var _useState15 = (0, _react.useState)(''),
    _useState16 = _slicedToArray(_useState15, 2),
    feriasDe = _useState16[0],
    setFeriasDe = _useState16[1];
  var _useStateSaldoEdit = (0, _react.useState)(false),
    _useStateSaldoEdit2 = _slicedToArray(_useStateSaldoEdit, 2),
    editandoSaldoJanAbr = _useStateSaldoEdit2[0],
    setEditandoSaldoJanAbr = _useStateSaldoEdit2[1];
  var _useStateSaldoInput = (0, _react.useState)(''),
    _useStateSaldoInput2 = _slicedToArray(_useStateSaldoInput, 2),
    saldoJanAbrInput = _useStateSaldoInput2[0],
    setSaldoJanAbrInput = _useStateSaldoInput2[1];
  var _useStateSaldoErr = (0, _react.useState)(''),
    _useStateSaldoErr2 = _slicedToArray(_useStateSaldoErr, 2),
    saldoJanAbrErr = _useStateSaldoErr2[0],
    setSaldoJanAbrErr = _useStateSaldoErr2[1];
  var _useStateSaldoSaving = (0, _react.useState)(false),
    _useStateSaldoSaving2 = _slicedToArray(_useStateSaldoSaving, 2),
    saldoJanAbrSaving = _useStateSaldoSaving2[0],
    setSaldoJanAbrSaving = _useStateSaldoSaving2[1];
  var _useStateSaldoMode = (0, _react.useState)('ajuste'),
    _useStateSaldoMode2 = _slicedToArray(_useStateSaldoMode, 2),
    saldoJanAbrModo = _useStateSaldoMode2[0],
    setSaldoJanAbrModo = _useStateSaldoMode2[1];
  var _useStateEditFerias = (0, _react.useState)(false),
    _useStateEditFerias2 = _slicedToArray(_useStateEditFerias, 2),
    editandoFeriasDisp = _useStateEditFerias2[0],
    setEditandoFeriasDisp = _useStateEditFerias2[1];
  var _useStateFeriasInput = (0, _react.useState)(''),
    _useStateFeriasInput2 = _slicedToArray(_useStateFeriasInput, 2),
    feriasDispInput = _useStateFeriasInput2[0],
    setFeriasDispInput = _useStateFeriasInput2[1];
  var _useStateEditKomp = (0, _react.useState)(false),
    _useStateEditKomp2 = _slicedToArray(_useStateEditKomp, 2),
    editandoKompDisp = _useStateEditKomp2[0],
    setEditandoKompDisp = _useStateEditKomp2[1];
  var _useStateKompInput = (0, _react.useState)(''),
    _useStateKompInput2 = _slicedToArray(_useStateKompInput, 2),
    kompDispInput = _useStateKompInput2[0],
    setKompDispInput = _useStateKompInput2[1];
  var _useStateFeriasUnidade = (0, _react.useState)('dias'),
    _useStateFeriasUnidade2 = _slicedToArray(_useStateFeriasUnidade, 2),
    feriasUnidade = _useStateFeriasUnidade2[0],
    setFeriasUnidade = _useStateFeriasUnidade2[1];
  var _useStateCalPopup = (0, _react.useState)(null),
    _useStateCalPopup2 = _slicedToArray(_useStateCalPopup, 2),
    calPopupDate = _useStateCalPopup2[0],
    setCalPopupDate = _useStateCalPopup2[1];
  var _useStateEditHFerias = (0, _react.useState)(false),
    _useStateEditHFerias2 = _slicedToArray(_useStateEditHFerias, 2),
    editandoHorasFeriasDisp = _useStateEditHFerias2[0],
    setEditandoHorasFeriasDisp = _useStateEditHFerias2[1];
  var _useStateHFeriasInput = (0, _react.useState)(''),
    _useStateHFeriasInput2 = _slicedToArray(_useStateHFeriasInput, 2),
    horasFeriasDispInput = _useStateHFeriasInput2[0],
    setHorasFeriasDispInput = _useStateHFeriasInput2[1];
  var _useState17 = (0, _react.useState)(''),
    _useState18 = _slicedToArray(_useState17, 2),
    feriasAte = _useState18[0],
    setFeriasAte = _useState18[1];

  // Gerar todos os dias entre duas datas
  var diasEntre = function diasEntre(de, ate) {
    var dias = [];
    var cur = new Date(de + 'T12:00:00');
    var fim = new Date(ate + 'T12:00:00');
    while (cur <= fim) {
      dias.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }
    return dias;
  };
  var marcarPeriodo = function marcarPeriodo(tipo) {
    if (!feriasDe || !feriasAte || feriasDe > feriasAte) return;
    diasEntre(feriasDe, feriasAte).forEach(function (date) {
      addSharedDia({
        date: date,
        tipo: tipo,
        src: 'horaspr'
      });
    });
  };
  var limparPeriodo = function limparPeriodo() {
    if (!feriasDe || !feriasAte || feriasDe > feriasAte) return;
    diasEntre(feriasDe, feriasAte).forEach(function (date) {
      removeSharedDia(date);
    });
  };
  var _useState19 = (0, _react.useState)('Spleisser'),
    _useState20 = _slicedToArray(_useState19, 2),
    newTipo = _useState20[0],
    setNewTipo = _useState20[1];
  var _useState21 = (0, _react.useState)('POP GREN04'),
    _useState22 = _slicedToArray(_useState21, 2),
    newProj = _useState22[0],
    setNewProj = _useState22[1];
  var _useState23 = (0, _react.useState)('07:00'),
    _useState24 = _slicedToArray(_useState23, 2),
    newHi = _useState24[0],
    setNewHi = _useState24[1];
  var _useState25 = (0, _react.useState)('12:00'),
    _useState26 = _slicedToArray(_useState25, 2),
    newHf = _useState26[0],
    setNewHf = _useState26[1];
  var newMoradaRef = React.useRef(null);
  var _useState27 = (0, _react.useState)([{
      id: 1,
      date: '2026-06-01',
      tipo: 'Spleisser',
      proj: 'POP GREN04',
      hi: '07:00',
      hf: '12:00',
      horas: 5.0
    }, {
      id: 2,
      date: '2026-06-01',
      tipo: 'Spleisser',
      proj: 'POP GREN04',
      hi: '12:45',
      hf: '16:35',
      horas: 3.8
    }, {
      id: 3,
      date: '2026-06-02',
      tipo: 'Instalação',
      proj: 'BUDI-2S',
      hi: '08:00',
      hf: '12:00',
      horas: 4.0
    }, {
      id: 4,
      date: '2026-06-03',
      tipo: 'Reparação',
      proj: 'POP GREN04',
      hi: '07:00',
      hf: '15:00',
      horas: 8.0
    }, {
      id: 5,
      date: '2026-06-10',
      tipo: 'Spleisser',
      proj: 'POP GREN04',
      hi: '08:00',
      hf: '12:00',
      horas: 4.0
    }, {
      id: 6,
      date: '2026-06-11',
      tipo: 'Manutenção',
      proj: 'BUDI-2S',
      hi: '08:00',
      hf: '13:00',
      horas: 5.0
    }, {
      id: 7,
      date: '2026-06-11',
      tipo: 'Spleisser',
      proj: 'POP GREN04',
      hi: '13:00',
      hf: '16:00',
      horas: 3.0
    }]),
    _useState28 = _slicedToArray(_useState27, 2),
    entries = _useState28[0],
    setEntries = _useState28[1];
  var _useStateEntriesLoaded = (0, _react.useState)(false),
    _useStateEntriesLoaded2 = _slicedToArray(_useStateEntriesLoaded, 2),
    entriesLoaded = _useStateEntriesLoaded2[0],
    setEntriesLoaded = _useStateEntriesLoaded2[1];
  var loadEntries = function loadEntries() {
    if (!window.supabaseClient) return;
    window.supabaseClient.from('horas_entries').select('*').then(function (res) {
      if (res.error || !res.data) return;
      setEntries(res.data.map(function (row) {
        return {
          id: row.id,
          date: row.data,
          tipo: row.tipo,
          proj: row.project,
          hi: row.start_time,
          hf: row.end_time,
          horas: Number(row.hours) || 0,
          morada: row.address || '',
          isAuto: !!row.is_auto,
          dlTipo: row.dl_tipo || undefined,
          validado: !!row.validated
        };
      }));
      setEntriesLoaded(true);
    }).catch(function () {});
  };
  // Dias de férias disponíveis (quota). Enquanto houver dias, marcar férias
  // não desconta horas — só consome a quota. Quando a quota chega a 0, os
  // dias seguintes passam a descontar metaFerias (5.7h) do saldo.
  var _useStateFeriasDisp = (0, _react.useState)(0),
    _useStateFeriasDisp2 = _slicedToArray(_useStateFeriasDisp, 2),
    feriasDisp = _useStateFeriasDisp2[0],
    setFeriasDisp = _useStateFeriasDisp2[1];
  var _useStateFeriasDispLoaded = (0, _react.useState)(false),
    _useStateFeriasDispLoaded2 = _slicedToArray(_useStateFeriasDispLoaded, 2),
    feriasDispLoaded = _useStateFeriasDispLoaded2[0],
    setFeriasDispLoaded = _useStateFeriasDispLoaded2[1];
  var loadFeriasDisp = function loadFeriasDisp() {
    if (!window.supabaseClient) return;
    window.supabaseClient.from('horaspro_settings').select('*').eq('id', 1).then(function (res) {
      if (res.error || !res.data || !res.data[0]) return;
      setFeriasDisp(Number(res.data[0].ferias_disponiveis) || 0);
      setKompDisp(Number(res.data[0].komp_disponivel) || 0);
      setHorasFeriasDisp(Number(res.data[0].horas_ferias_disponivel) || 0);
      setFeriasDispLoaded(true);
    }).catch(function () {});
  };
  var salvarFeriasDisp = function salvarFeriasDisp(novoValor) {
    setFeriasDisp(novoValor);
    if (!window.supabaseClient) return;
    window.supabaseClient.from('horaspro_settings').upsert({
      id: 1,
      ferias_disponiveis: novoValor,
      komp_disponivel: kompDisp,
      horas_ferias_disponivel: horasFeriasDisp
    }, {
      onConflict: 'id'
    }).then(function (res) {
      if (res.error) console.warn('[horaspro] Erro ao guardar dias de f\xE9rias dispon\xEDveis:', res.error.message);
    }).catch(function (e) {
      console.warn('[horaspro] Erro ao guardar dias de f\xE9rias dispon\xEDveis:', e);
    });
  };
  var _useStateKompDisp = (0, _react.useState)(0),
    _useStateKompDisp2 = _slicedToArray(_useStateKompDisp, 2),
    kompDisp = _useStateKompDisp2[0],
    setKompDisp = _useStateKompDisp2[1];
  var salvarKompDisp = function salvarKompDisp(novoValor) {
    setKompDisp(novoValor);
    if (!window.supabaseClient) return;
    window.supabaseClient.from('horaspro_settings').upsert({
      id: 1,
      ferias_disponiveis: feriasDisp,
      komp_disponivel: novoValor,
      horas_ferias_disponivel: horasFeriasDisp
    }, {
      onConflict: 'id'
    }).then(function (res) {
      if (res.error) console.warn('[horaspro] Erro ao guardar horas de Komp. dispon\xEDveis:', res.error.message);
    }).catch(function (e) {
      console.warn('[horaspro] Erro ao guardar horas de Komp. dispon\xEDveis:', e);
    });
  };
  var _useStateHorasFeriasDisp = (0, _react.useState)(0),
    _useStateHorasFeriasDisp2 = _slicedToArray(_useStateHorasFeriasDisp, 2),
    horasFeriasDisp = _useStateHorasFeriasDisp2[0],
    setHorasFeriasDisp = _useStateHorasFeriasDisp2[1];
  var salvarHorasFeriasDisp = function salvarHorasFeriasDisp(novoValor) {
    setHorasFeriasDisp(novoValor);
    if (!window.supabaseClient) return;
    window.supabaseClient.from('horaspro_settings').upsert({
      id: 1,
      ferias_disponiveis: feriasDisp,
      komp_disponivel: kompDisp,
      horas_ferias_disponivel: novoValor
    }, {
      onConflict: 'id'
    }).then(function (res) {
      if (res.error) console.warn('[horaspro] Erro ao guardar horas de f\xE9rias dispon\xEDveis:', res.error.message);
    }).catch(function (e) {
      console.warn('[horaspro] Erro ao guardar horas de f\xE9rias dispon\xEDveis:', e);
    });
  };
  (0, _react.useEffect)(function () {
    loadEntries();
    loadFeriasDisp();
    if (!window.supabaseClient) return;
    var channel = window.supabaseClient.channel('horas_entries_changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'horas_entries'
    }, function () {
      loadEntries();
    }).subscribe();
    return function () {
      try {
        window.supabaseClient.removeChannel(channel);
      } catch (e) {}
    };
  }, []);
  var pushEntryToSupabase = function pushEntryToSupabase(e) {
    if (!window.supabaseClient) return;
    window.supabaseClient.from('horas_entries').insert({
      data: e.date,
      tipo: e.tipo,
      project: e.proj,
      start_time: e.hi,
      end_time: e.hf,
      hours: e.horas,
      address: e.morada || null,
      is_auto: !!e.isAuto,
      dl_tipo: e.dlTipo || null,
      validated: !!e.validado
    }).then(function () {
      loadEntries();
      // Backup automático
      window.supabaseClient.from('horas_entries').select('*').then(function(r) {
        if (r.data) backupParaDrive('horas_entries', r.data);
      });
    }).catch(function () {});
  };
  var fmt = function fmt(d) {
    return d.toISOString().split('T')[0];
  };
  var todayStr = fmt(curDate);
  var metaDia = 5.9;
  var metaFerias = 5.7;
  var metaSem = Math.round(metaDia * 5 * 10) / 10;
  var metaMes = Math.round(metaSem * 52 / 12 * 10) / 10;
  // Meta diária "real": como a Sexta é livre (creditada automaticamente,
  // ver sextaLivre), a meta de 5.9h/dia × 5 dias não faz sentido para
  // mostrar Segunda-Quinta — esses 4 dias têm de somar a meta semanal
  // inteira (29.5h), logo a meta de cada um é 29.5/4 = 7.4h. A Sexta não
  // tem meta própria (0h) porque já está cumprida pelo crédito automático.
  var metaDiaSegQui = Math.round(metaSem / 4 * 10) / 10;
  var metaDiaPara = function metaDiaPara(d) {
    var dow = (typeof d === 'string' ? new Date(d + 'T12:00:00') : d).getDay();
    return dow === 5 ? 0 : metaDiaSegQui;
  };
  var getKW = function getKW(d) {
    var s = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - s) / 86400000 + s.getDay() + 1) / 7);
  };
  var kw = getKW(curDate);
  // Entradas automáticas (sexta/feriado/férias) só ficam pré-validadas
  // quando a SEMANA delas já é a atual ou uma semana passada — mesmo que o
  // dia exato dentro dessa semana ainda não tenha chegado. Sextas/feriados
  // de semanas futuras ficam em Pendentes até a própria semana chegar.
  var isOwnWeekDue = function isOwnWeekDue(dateStr) {
    var d = new Date(dateStr + 'T12:00:00');
    var today = new Date();
    var dKey = d.getFullYear() * 100 + getKW(d);
    var todayKey = today.getFullYear() * 100 + getKW(today);
    return dKey <= todayKey;
  };
  // Entradas automáticas (ex: Sexta-feira livre) só devem contar uma vez
  // por dia. Isto protege os totais mesmo que existam registos automáticos
  // duplicados (ex: de uma falha antiga a re-inserir o mesmo dia).
  var dedupedEntries = (0, _react.useMemo)(function () {
    var seen = {};
    return entries.filter(function (e) {
      if (!e.isAuto || !e.dlTipo) return true;
      var key = e.date + '|' + e.dlTipo;
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }, [entries]);
  var horasHoje = dedupedEntries.filter(function (e) {
    return e.date === todayStr;
  }).reduce(function (s, e) {
    return s + e.horas;
  }, 0);
  var hojeRealStr = fmt(new Date());
  var horasSem = dedupedEntries.filter(function (e) {
    // Entradas automáticas (sexta/feriado/férias) só entram na soma da
    // semana a partir do dia em que realmente acontecem — nunca antes,
    // mesmo que já existam pré-criadas para um dia futuro da mesma semana.
    if (e.isAuto && e.date > hojeRealStr) return false;
    var d = new Date(e.date);
    return getKW(d) === kw && d.getFullYear() === curDate.getFullYear();
  }).reduce(function (s, e) {
    return s + e.horas;
  }, 0);
  // No Mês (e no saldo), sexta/feriado/férias automáticos não contam como
  // horas trabalhadas — a meta desses dias simplesmente desaparece. Férias
  // têm, à parte, um débito fixo de metaFerias por dia (ver saldo abaixo).
  var contaNoMes = function contaNoMes(e) {
    return !e.isAuto;
  };
  var horasMes = dedupedEntries.filter(function (e) {
    return e.date.startsWith(curDate.toISOString().slice(0, 7)) && contaNoMes(e);
  }).reduce(function (s, e) {
    return s + e.horas;
  }, 0);
  // Horas acumuladas do dia 1 do mês até ao dia que estás a ver (não conta
  // dias do mês que ainda estão "no futuro" em relação a esse dia, mesmo que
  // já existam pré-criados na base de dados — ex: sextas/feriados futuros).
  var horasAteHoje = dedupedEntries.filter(function (e) {
    return e.date.startsWith(curDate.toISOString().slice(0, 7)) && e.date <= todayStr && contaNoMes(e);
  }).reduce(function (s, e) {
    return s + e.horas;
  }, 0);
  // Cada dia de férias SEM quota disponível (ferias_extra) desconta
  // metaFerias (5.7h) directamente do saldo. Dias cobertos pela quota
  // (dlTipo 'ferias') não tocam o saldo — só consomem a quota. O mesmo
  // padrão aplica-se a Komp. (komp_extra desconta metaDia por dia).
  var diasFeriasMes = dedupedEntries.filter(function (e) {
    return e.isAuto && e.dlTipo === 'ferias_extra' && e.date.startsWith(curDate.toISOString().slice(0, 7));
  }).length;
  var diasKompExtraMes = dedupedEntries.filter(function (e) {
    return e.isAuto && e.dlTipo === 'komp_extra' && e.date.startsWith(curDate.toISOString().slice(0, 7));
  }).length;
  // Meta acumulada até hoje: soma das metas de cada dia útil que já passou
  // este mês. Dias marcados como dia livre (férias, komp, feriado, sexta)
  // não contribuem — a sua meta já não é exigida.
  var diasLivresSet = new Set(dedupedEntries.filter(function (e) {
    return e.isAuto;
  }).map(function (e) {
    return e.date;
  }));
  var metaAteHojeCalc = (function () {
    var mesStr = curDate.toISOString().slice(0, 7);
    var total = 0;
    var d = new Date(mesStr + '-01T12:00:00');
    var limiteStr = todayStr;
    while (fmt(d) <= limiteStr && fmt(d).startsWith(mesStr)) {
      var dStr = fmt(d);
      var dow = d.getDay();
      // Apenas dias úteis (seg=1 a sex=5) que não estejam marcados como dia livre
      if (dow >= 1 && dow <= 5 && !diasLivresSet.has(dStr)) {
        total += metaDiaPara(dStr);
      }
      d.setDate(d.getDate() + 1);
    }
    return total;
  })();
  var saldo = horasMes - metaAteHojeCalc - diasFeriasMes * metaFerias - diasKompExtraMes * metaDia;
  // Reconciliação Jan-Abril com a Abaclick: Jan/Fev/Mar são 3 registos
  // "Total X" só de saldo (sem detalhe diário); Abril já tem dados reais
  // (sextas). Editar aqui só reparte Jan/Fev/Mar — nunca toca em Abril,
  // nem em maio ou meses seguintes.
  var horasJanFevMar = dedupedEntries.filter(function (e) {
    return e.date >= '2026-01-01' && e.date <= '2026-03-31';
  }).reduce(function (s, e) {
    return s + e.horas;
  }, 0);
  var horasAbril2026 = dedupedEntries.filter(function (e) {
    return e.date >= '2026-04-01' && e.date <= '2026-04-30';
  }).reduce(function (s, e) {
    return s + e.horas;
  }, 0);
  var totalJanAbrSaldo = Math.round((horasJanFevMar + horasAbril2026) * 100) / 100;
  var guardarSaldoJanAbr = function guardarSaldoJanAbr() {
    var parsed = parseFloat(saldoJanAbrInput.replace(',', '.'));
    if (isNaN(parsed)) {
      setSaldoJanAbrErr('Número inválido.');
      return;
    }
    var novoTotal;
    if (saldoJanAbrModo === 'ajuste') {
      novoTotal = Math.round((totalJanAbrSaldo + parsed) * 100) / 100;
    } else if (saldoJanAbrModo === 'saldototal') {
      // Saldo geral = saldo (mês corrente) + totalJanAbrSaldo.
      // Para o Saldo geral dar o valor pedido, reparte-se o Jan-Abril.
      novoTotal = Math.round((parsed - saldo) * 100) / 100;
    } else {
      novoTotal = parsed;
    }
    var novoJanMar = Math.round((novoTotal - horasAbril2026) * 100) / 100;
    if (novoJanMar < 0) {
      setSaldoJanAbrErr('Abril j\xE1 tem ' + horasAbril2026.toFixed(1) + 'h reais \u2014 o total tem de ser maior que isso.');
      return;
    }
    // Fecha já (otimista) — não espera pela resposta do servidor, tal como
    // os outros cartões de quota. A gravação continua em segundo plano.
    setSaldoJanAbrSaving(false);
    setSaldoJanAbrErr('');
    setEditandoSaldoJanAbr(false);
    if (!window.supabaseClient) return;
    window.supabaseClient.from('horas_entries').update({
      hours: novoJanMar
    }).eq('tipo', 'Saldo Jan-Mar (Abaclick)').gte('data', '2026-01-01').lte('data', '2026-03-31').then(function () {
      loadEntries();
    }).catch(function () {
      console.warn('[horaspro] Erro ao guardar Saldo Abaclick — tenta outra vez.');
    });
  };
  var horasTab = tab === 'Dia' ? horasHoje : tab === 'Semana' ? horasSem : horasMes;
  var metaTab = tab === 'Dia' ? metaDiaPara(curDate) : tab === 'Semana' ? metaSem : metaMes;
  var pct = Math.min(100, Math.round(horasTab / metaTab * 100));
  var prevDay = function prevDay() {
    var d = new Date(curDate);
    d.setDate(d.getDate() - 1);
    setCurDate(d);
  };
  var nextDay = function nextDay() {
    var d = new Date(curDate);
    d.setDate(d.getDate() + 1);
    setCurDate(d);
  };
  // Lista "Todos os registos" abaixo: mostra só a janela da aba escolhida
  // (Dia / Semana completa seg-dom / Mês), em vez de todo o histórico.
  var listEntries = (0, _react.useMemo)(function () {
    if (tab === 'Dia') {
      return dedupedEntries.filter(function (e) {
        return e.date === todayStr;
      });
    }
    if (tab === 'Semana') {
      var dow = curDate.getDay();
      var diff = dow === 0 ? -6 : 1 - dow;
      var ws = new Date(curDate);
      ws.setDate(ws.getDate() + diff);
      ws.setHours(0, 0, 0, 0);
      var we = new Date(ws);
      we.setDate(we.getDate() + 6);
      we.setHours(23, 59, 59, 999);
      return dedupedEntries.filter(function (e) {
        var ed = new Date(e.date + 'T12:00:00');
        return ed >= ws && ed <= we;
      });
    }
    var ym = curDate.toISOString().slice(0, 7);
    return dedupedEntries.filter(function (e) {
      return e.date.startsWith(ym);
    });
  }, [dedupedEntries, tab, curDate]);
  var grouped = listEntries.reduce(function (acc, e) {
    (acc[e.date] = acc[e.date] || []).push(e);
    return acc;
  }, {});
  var sortedDates = Object.keys(grouped).sort(function (a, b) {
    return b.localeCompare(a);
  });
  // Lista do ecrã "Registo": separada em Pendentes/Concluídos. Usa
  // listEntries (já filtrada por Dia/Semana/Mês) — não afeta os gráficos,
  // que continuam a usar `grouped`/`sortedDates` com tudo.
  var pendentesNaJanela = listEntries.filter(function (e) {
    return !e.validado;
  });
  var registoVisivel = listEntries.filter(function (e) {
    return viewMode === 'concluidos' ? !!e.validado : !e.validado;
  });
  var groupedRegisto = registoVisivel.reduce(function (acc, e) {
    (acc[e.date] = acc[e.date] || []).push(e);
    return acc;
  }, {});
  var sortedDatesRegisto = Object.keys(groupedRegisto).sort(function (a, b) {
    return a.localeCompare(b);
  });
  var toggleValidado = function toggleValidado(entry) {
    var novo = !entry.validado;
    setEntries(function (p) {
      return p.map(function (x) {
        return x.id === entry.id ? _objectSpread(_objectSpread({}, x), {}, {
          validado: novo
        }) : x;
      });
    });
    if (window.supabaseClient) {
      window.supabaseClient.from('horas_entries').update({
        validated: novo
      }).eq('id', entry.id).then(function () {}).catch(function () {});
    }
  };
  var validarTudoVisivel = function validarTudoVisivel() {
    var ids = pendentesNaJanela.map(function (e) {
      return e.id;
    });
    if (ids.length === 0) return;
    setEntries(function (p) {
      return p.map(function (x) {
        return ids.indexOf(x.id) !== -1 ? _objectSpread(_objectSpread({}, x), {}, {
          validado: true
        }) : x;
      });
    });
    if (window.supabaseClient) {
      window.supabaseClient.from('horas_entries').update({
        validated: true
      }).in('id', ids).then(function () {}).catch(function () {});
    }
  };
  var dayLabel = curDate.toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  var dayLabelCap = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1);
  var tipos = ['Spleisser', 'Instalação', 'Reparação', 'Inspeção', 'Manutenção'];
  var _useState29 = (0, _react.useState)([]),
    _useState30 = _slicedToArray(_useState29, 2),
    projList = _useState30[0],
    setProjList = _useState30[1];
  var loadProjects = function loadProjects() {
    if (!window.supabaseClient) return;
    window.supabaseClient.from('horaspro_projects').select('*').order('created_at', { ascending: true }).then(function (res) {
      if (res.error || !res.data) return;
      setProjList(res.data.map(function (row) {
        return {
          id: row.id,
          name: row.name,
          desc: row.description || '',
          color: row.color || H.blue
        };
      }));
    }).catch(function () {});
  };
  (0, _react.useEffect)(function () {
    loadProjects();
    if (!window.supabaseClient) return;
    var projChannel = window.supabaseClient.channel('horaspro_projects_changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'horaspro_projects'
    }, function () {
      loadProjects();
    }).subscribe();
    return function () {
      try {
        window.supabaseClient.removeChannel(projChannel);
      } catch (e) {}
    };
  }, []);
  var _useStateProjSaveErr = (0, _react.useState)(''),
    _useStateProjSaveErr2 = _slicedToArray(_useStateProjSaveErr, 2),
    projSaveErr = _useStateProjSaveErr2[0],
    setProjSaveErr = _useStateProjSaveErr2[1];
  var _useStateProjSaving = (0, _react.useState)(false),
    _useStateProjSaving2 = _slicedToArray(_useStateProjSaving, 2),
    projSaving = _useStateProjSaving2[0],
    setProjSaving = _useStateProjSaving2[1];
  var saveProject = function saveProject() {
    var _projNameRef$current, _projDescRef$current;
    var name = (((_projNameRef$current = projNameRef.current) === null || _projNameRef$current === void 0 ? void 0 : _projNameRef$current.value) || '').trim();
    var desc = (((_projDescRef$current = projDescRef.current) === null || _projDescRef$current === void 0 ? void 0 : _projDescRef$current.value) || '').trim();
    if (!name) {
      setProjSaveErr('Falta o nome do projeto.');
      return;
    }
    setProjSaveErr('');
    setProjSaving(true);
    if (!window.supabaseClient) {
      setProjSaving(false);
      setProjSaveErr('Sem ligação ao servidor — não foi guardado.');
      return;
    }
    if (editProj) {
      var prevProj = projList.find(function (x) {
        return x.id === editProj;
      });
      setProjList(function (p) {
        return p.map(function (x) {
          return x.id === editProj ? _objectSpread(_objectSpread({}, x), {}, {
            name: name,
            desc: desc,
            color: newProjColor
          }) : x;
        });
      });
      window.supabaseClient.from('horaspro_projects').update({
        name: name,
        description: desc,
        color: newProjColor
      }).eq('id', editProj).then(function (res) {
        setProjSaving(false);
        if (res.error) {
          setProjSaveErr('Erro ao guardar: ' + res.error.message);
          if (prevProj) {
            setProjList(function (p) {
              return p.map(function (x) {
                return x.id === editProj ? prevProj : x;
              });
            });
          }
          return;
        }
        loadProjects();
        setShowAddProj(false);
        setEditProj(null);
        setNewProjName('');
        setNewProjDesc('');
      }).catch(function (e) {
        setProjSaving(false);
        setProjSaveErr('Erro de ligação: ' + (e && e.message || String(e)));
        if (prevProj) {
          setProjList(function (p) {
            return p.map(function (x) {
              return x.id === editProj ? prevProj : x;
            });
          });
        }
      });
    } else {
      var tempId = 'temp-' + Date.now();
      setProjList(function (p) {
        return [].concat(_toConsumableArray(p), [{
          id: tempId,
          name: name,
          desc: desc,
          color: newProjColor
        }]);
      });
      window.supabaseClient.from('horaspro_projects').insert({
        name: name,
        description: desc,
        color: newProjColor
      }).select().then(function (res) {
        setProjSaving(false);
        if (res.error) {
          setProjSaveErr('Erro ao adicionar: ' + res.error.message);
          setProjList(function (p) {
            return p.filter(function (x) {
              return x.id !== tempId;
            });
          });
          return;
        }
        loadProjects();
        setShowAddProj(false);
        setEditProj(null);
        setNewProjName('');
        setNewProjDesc('');
      }).catch(function (e) {
        setProjSaving(false);
        setProjSaveErr('Erro de ligação: ' + (e && e.message || String(e)));
        setProjList(function (p) {
          return p.filter(function (x) {
            return x.id !== tempId;
          });
        });
      });
    }
  };
  var deleteProject = function deleteProject(projId) {
    var prevList = projList;
    setProjList(function (p) {
      return p.filter(function (x) {
        return x.id !== projId;
      });
    });
    if (!window.supabaseClient) return;
    window.supabaseClient.from('horaspro_projects').delete().eq('id', projId).then(function (res) {
      if (res.error) {
        setProjList(prevList);
        setProjSaveErr('Erro ao apagar: ' + res.error.message);
      }
    }).catch(function (e) {
      setProjList(prevList);
      setProjSaveErr('Erro de ligação ao apagar: ' + (e && e.message || String(e)));
    });
  };
  var _useState31 = (0, _react.useState)('Todos'),
    _useState32 = _slicedToArray(_useState31, 2),
    projFilter = _useState32[0],
    setProjFilter = _useState32[1];
  var _useState33 = (0, _react.useState)(false),
    _useState34 = _slicedToArray(_useState33, 2),
    showAddProj = _useState34[0],
    setShowAddProj = _useState34[1];
  var _useState35 = (0, _react.useState)(null),
    _useState36 = _slicedToArray(_useState35, 2),
    editProj = _useState36[0],
    setEditProj = _useState36[1];
  var _useState37 = (0, _react.useState)(''),
    _useState38 = _slicedToArray(_useState37, 2),
    newProjName = _useState38[0],
    setNewProjName = _useState38[1];
  var _useState39 = (0, _react.useState)(''),
    _useState40 = _slicedToArray(_useState39, 2),
    newProjDesc = _useState40[0],
    setNewProjDesc = _useState40[1];
  var _useState41 = (0, _react.useState)(H.blue),
    _useState42 = _slicedToArray(_useState41, 2),
    newProjColor = _useState42[0],
    setNewProjColor = _useState42[1];
  var projNameRef = React.useRef(null);
  var projDescRef = React.useRef(null);

  // Feriados Solothurn 2026
  var FERIADOS_SO = [{
    date: '2026-01-01',
    nome: 'Neujahr'
  }, {
    date: '2026-01-06',
    nome: 'Heilige Drei Könige'
  }, {
    date: '2026-03-19',
    nome: 'Josefstag'
  }, {
    date: '2026-04-03',
    nome: 'Karfreitag'
  }, {
    date: '2026-04-06',
    nome: 'Ostermontag'
  }, {
    date: '2026-05-01',
    nome: 'Tag der Arbeit'
  }, {
    date: '2026-05-14',
    nome: 'Auffahrt'
  }, {
    date: '2026-05-25',
    nome: 'Pfingstmontag'
  }, {
    date: '2026-06-04',
    nome: 'Fronleichnam'
  }, {
    date: '2026-06-29',
    nome: 'Peter und Paul'
  }, {
    date: '2026-08-01',
    nome: 'Bundesfeiertag'
  }, {
    date: '2026-08-15',
    nome: 'Mariä Himmelfahrt'
  }, {
    date: '2026-11-01',
    nome: 'Allerheiligen'
  }, {
    date: '2026-12-08',
    nome: 'Mariä Empfängnis'
  }, {
    date: '2026-12-25',
    nome: 'Weihnachten'
  }, {
    date: '2026-12-26',
    nome: 'Stephanstag'
  }];
  var _useState43 = (0, _react.useState)([]),
    _useState44 = _slicedToArray(_useState43, 2),
    diasLivres = _useState44[0],
    setDiasLivres = _useState44[1];
  var _useState45 = (0, _react.useState)(false),
    _useState46 = _slicedToArray(_useState45, 2),
    showDiaLivre = _useState46[0],
    setShowDiaLivre = _useState46[1];
  var _useState47 = (0, _react.useState)('dia'),
    _useState48 = _slicedToArray(_useState47, 2),
    dlTipo = _useState48[0],
    setDlTipo = _useState48[1];
  var _useState49 = (0, _react.useState)(''),
    _useState50 = _slicedToArray(_useState49, 2),
    dlDe = _useState50[0],
    setDlDe = _useState50[1];
  var _useState51 = (0, _react.useState)(''),
    _useState52 = _slicedToArray(_useState51, 2),
    dlAte = _useState52[0],
    setDlAte = _useState52[1];
  var _useState53 = (0, _react.useState)(false),
    _useState54 = _slicedToArray(_useState53, 2),
    showFeriados = _useState54[0],
    setShowFeriados = _useState54[1];
  var _useState55 = (0, _react.useState)(true),
    _useState56 = _slicedToArray(_useState55, 2),
    sextaLivre = _useState56[0],
    setSextaLivre = _useState56[1]; // Sextas automaticamente livres

  var sextaProcessedRef = (0, _react.useRef)({});

  // Auto-adicionar sextas como dia livre remunerado
  (0, _react.useEffect)(function () {
    if (!sextaLivre) return;
    if (!entriesLoaded) return;
    var yr = curDate.getFullYear();
    var mo = curDate.getMonth();
    var monthKey = yr + '-' + mo;
    // Só processa cada mês uma vez por sessão — evita o ciclo que estava
    // a recriar "Sexta-feira livre" repetidamente sempre que `entries`
    // mudava (cada reload disparava este efeito outra vez).
    if (sextaProcessedRef.current[monthKey]) return;
    sextaProcessedRef.current[monthKey] = true;
    var daysInMo = new Date(yr, mo + 1, 0).getDate();
    var newEntries = [];
    var newDias = [];
    var _loop = function _loop() {
      var dStr = "".concat(yr, "-").concat(String(mo + 1).padStart(2, '0'), "-").concat(String(d).padStart(2, '0'));
      var dow = new Date(dStr + 'T12:00:00').getDay();
      if (dow === 5) {
        // Sexta-feira
        var already = entries.some(function (e) {
          return e.date === dStr && e.dlTipo === 'sexta';
        });
        var alreadyDl = diasLivres.some(function (x) {
          return x.date === dStr && x.tipo === 'sexta';
        });
        if (!already) newEntries.push({
          id: 'sx-' + dStr,
          date: dStr,
          tipo: 'Sexta-feira livre',
          proj: 'Remunerado',
          hi: '00:00',
          hf: '00:00',
          horas: metaDia,
          isAuto: true,
          dlTipo: 'sexta',
          validado: isOwnWeekDue(dStr)
        });
        if (!alreadyDl) newDias.push({
          date: dStr,
          tipo: 'sexta'
        });
      }
    };
    for (var d = 1; d <= daysInMo; d++) {
      _loop();
    }
    if (newEntries.length > 0) {
      // Só acrescenta as novas — nunca remove o que já estava local,
      // para não haver flicker nem perda temporária de outros meses.
      setEntries(function (p) {
        return [].concat(_toConsumableArray(p), newEntries);
      });
      newEntries.forEach(function (e) {
        return pushEntryToSupabase(e);
      });
    }
    if (newDias.length > 0) setDiasLivres(function (p) {
      return [].concat(_toConsumableArray(p), newDias);
    });
  }, [sextaLivre, curDate.getFullYear(), curDate.getMonth(), entriesLoaded]);

  // Check if date is weekday
  var isWeekday = function isWeekday(d) {
    var dow = new Date(d + 'T12:00:00').getDay();
    return dow >= 1 && dow <= 5;
  };
  // Check if date is feriado
  var isFeriado = function isFeriado(d) {
    return FERIADOS_SO.some(function (f) {
      return f.date === d;
    });
  };
  var feriadoNome = function feriadoNome(d) {
    var _FERIADOS_SO$find;
    return ((_FERIADOS_SO$find = FERIADOS_SO.find(function (f) {
      return f.date === d;
    })) === null || _FERIADOS_SO$find === void 0 ? void 0 : _FERIADOS_SO$find.nome) || '';
  };
  // Check if date is dia livre
  var isDiaLivre = function isDiaLivre(d) {
    return diasLivres.some(function (x) {
      return x.date === d;
    });
  };
  var dlTipoFor = function dlTipoFor(d) {
    var _diasLivres$find;
    return ((_diasLivres$find = diasLivres.find(function (x) {
      return x.date === d;
    })) === null || _diasLivres$find === void 0 ? void 0 : _diasLivres$find.tipo) || null;
  };

  // Dias úteis recebem metaDia automaticamente (neutro). Férias creditam
  // metaFerias (5.7h) na entrada; Komp. credita metaDia (5.9h) — ver saldo
  // acima para o débito real de cada um.
  var addDiasLivresRange = function addDiasLivresRange(de, ate, tipo) {
    var nome = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
    var horasTipo = tipo === 'ferias' ? metaFerias : metaDia;
    var newDias = [];
    var cur = new Date(de + 'T12:00:00');
    var end = new Date(ate + 'T12:00:00');
    var _loop2 = function _loop2() {
      var dStr = fmt(cur);
      // Só impede se já existe entrada automática (dia livre, férias, komp,
      // feriado, sexta). Entradas de horas trabalhadas não bloqueiam.
      // Assim, férias e komp são sempre mutuamente exclusivos — o segundo
      // marcado no mesmo dia é simplesmente ignorado.
      var jaTemAuto = entries.some(function (e) {
        return e.date === dStr && e.isAuto;
      });
      if (isWeekday(dStr) && !isDiaLivre(dStr) && !jaTemAuto) {
        newDias.push({
          date: dStr,
          tipo: tipo
        });
      }
      cur.setDate(cur.getDate() + 1);
    };
    while (cur <= end) {
      _loop2();
    }
    setDiasLivres(function (p) {
      return [].concat(_toConsumableArray(p), newDias);
    });
    // Partilhar com TODAS as apps
    newDias.forEach(function (d) {
      return addSharedDia({
        date: d.date,
        tipo: tipo,
        nome: nome || (tipo === 'ferias' ? 'Férias' : tipo === 'komp' ? 'Komp.' : tipo === 'feriado' ? nome : 'Dia livre'),
        addedBy: 'patricio',
        horas: horasTipo
      });
    });
    // Auto-add entrada. Cada tipo consome primeiro a SUA PRÓPRIA quota —
    // férias consome dias de feriasDisp OU horas de horasFeriasDisp
    // (conforme feriasUnidade escolhida no popup); Komp. consome sempre
    // horas de kompDisp (metaDia por dia). Só quando a quota escolhida
    // chega a 0 é que os dias seguintes desse tipo passam a "_extra" e
    // descontam do saldo (ver cálculo do saldo mais acima). Um tipo nunca
    // consome a quota do outro.
    var feriasEmHoras = tipo === 'ferias' && feriasUnidade === 'horas';
    var quotaFeriasRestante = feriasEmHoras ? horasFeriasDisp : feriasDisp;
    var quotaKompRestante = kompDisp;
    var autoEntries = newDias.map(function (d) {
      var dlTipoFinal = d.tipo;
      if (d.tipo === 'ferias') {
        var custoFerias = feriasEmHoras ? metaFerias : 1;
        if (quotaFeriasRestante >= custoFerias) {
          dlTipoFinal = 'ferias';
          quotaFeriasRestante -= custoFerias;
        } else {
          dlTipoFinal = 'ferias_extra';
        }
      } else if (d.tipo === 'komp') {
        if (quotaKompRestante >= metaDia) {
          dlTipoFinal = 'komp';
          quotaKompRestante -= metaDia;
        } else {
          dlTipoFinal = 'komp_extra';
        }
      }
      return {
        id: Date.now() + Math.random(),
        date: d.date,
        tipo: dlTipoFinal === 'ferias_extra' ? 'Férias (sem dias)' : dlTipoFinal === 'komp_extra' ? 'Komp. (sem horas)' : tipo === 'ferias' ? 'Férias' : tipo === 'komp' ? 'Komp.' : tipo === 'feriado' ? 'Feriado' : 'Dia Livre',
        proj: nome || '—',
        hi: '00:00',
        hf: '00:00',
        horas: horasTipo,
        isAuto: true,
        dlTipo: dlTipoFinal,
        validado: isOwnWeekDue(d.date)
      };
    });
    if (tipo === 'ferias' && feriasEmHoras && quotaFeriasRestante !== horasFeriasDisp) {
      salvarHorasFeriasDisp(Math.max(0, Math.round(quotaFeriasRestante * 100) / 100));
    }
    if (tipo === 'ferias' && !feriasEmHoras && quotaFeriasRestante !== feriasDisp) {
      salvarFeriasDisp(Math.max(0, quotaFeriasRestante));
    }
    if (tipo === 'komp' && quotaKompRestante !== kompDisp) {
      salvarKompDisp(Math.max(0, Math.round(quotaKompRestante * 100) / 100));
    }
    setEntries(function (p) {
      return [].concat(_toConsumableArray(p), _toConsumableArray(autoEntries));
    });
    autoEntries.forEach(function (e) {
      return pushEntryToSupabase(e);
    });
  };
  var projs = ['POP GREN04', 'BUDI-2S', 'BUDI-1S', 'BUDI-S'];
  var calcHoras = function calcHoras(hi, hf) {
    var _hi$split$map = hi.split(':').map(Number),
      _hi$split$map2 = _slicedToArray(_hi$split$map, 2),
      hh = _hi$split$map2[0],
      hm = _hi$split$map2[1];
    var _hf$split$map = hf.split(':').map(Number),
      _hf$split$map2 = _slicedToArray(_hf$split$map, 2),
      fh = _hf$split$map2[0],
      fm = _hf$split$map2[1];
    return Math.round((fh * 60 + fm - (hh * 60 + hm)) / 60 * 10) / 10;
  };
  var projColor = function projColor(p) {
    return p.includes('POP') ? H.blue : p.includes('BUDI') ? H.orange : H.gold;
  };
  var LCard = function LCard(_ref0) {
    var children = _ref0.children,
      _ref0$style = _ref0.style,
      style = _ref0$style === void 0 ? {} : _ref0$style;
    return /*#__PURE__*/React.createElement("div", {
      style: _objectSpread({
        background: H.surface,
        borderRadius: 16,
        border: "1px solid ".concat(H.border),
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }, style)
    }, children);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      background: H.bg,
      fontFamily: "'Inter',system-ui,sans-serif",
      color: H.text,
      overflowX: 'hidden',
      paddingBottom: 80
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: H.surface,
      borderBottom: "1px solid ".concat(H.border),
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 200,
      boxShadow: '0 1px 8px rgba(0,0,0,0.08)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowMenu(function (v) {
        return !v;
      });
    },
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 20,
      height: 2,
      background: H.gold,
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 20,
      height: 2,
      background: H.gold,
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 20,
      height: 2,
      background: H.gold,
      borderRadius: 2
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 900,
      fontSize: 18,
      color: H.text
    }
  }, "Patricio"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 900,
      fontSize: 18,
      color: H.gold
    }
  }, "Time")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 10,
      marginTop: 1
    }
  }, "Created by Lucas Carvalho"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(135deg,".concat(H.gold, ",").concat(H.goldL, ")"),
      borderRadius: 8,
      padding: '3px 10px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      color: '#fff'
    }
  }, "GOLD")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      borderRadius: '50%',
      border: "2px solid ".concat(H.green),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: H.green
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      background: 'none',
      border: "1px solid ".concat(H.border),
      borderRadius: 10,
      padding: '5px 10px',
      color: H.muted,
      fontSize: 12,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "\u2039 Hub"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: prevDay,
    style: {
      background: H.surface,
      border: "1px solid ".concat(H.border),
      borderRadius: 10,
      width: 36,
      height: 36,
      color: H.gold,
      fontSize: 18,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
    }
  }, "\u2039"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: H.muted,
      fontSize: 13,
      fontWeight: 600
    }
  }, todayStr), /*#__PURE__*/React.createElement("button", {
    onClick: nextDay,
    style: {
      background: H.surface,
      border: "1px solid ".concat(H.border),
      borderRadius: 10,
      width: 36,
      height: 36,
      color: H.gold,
      fontSize: 18,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
    }
  }, "\u203A")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 19,
      fontWeight: 800,
      color: H.text,
      marginBottom: 8
    }
  }, dayLabelCap), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      flexWrap: 'wrap'
    }
  }, ["Sem. ".concat(kw), "Sem: ".concat(Math.round(horasSem / metaSem * 100), "%")].map(function (t) {
    return /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        background: "rgba(184,150,46,0.1)",
        border: "1px solid rgba(184,150,46,0.3)",
        borderRadius: 20,
        padding: '3px 12px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: H.gold
      }
    }, t));
  }), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowDiaLivre(function (v) {
        return !v;
      });
    },
    style: {
      background: showDiaLivre ? H.gold : H.surface2,
      border: "1px solid ".concat(showDiaLivre ? H.gold : H.border),
      borderRadius: 20,
      padding: '3px 12px',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: showDiaLivre ? '#fff' : H.muted
    }
  }, "+ Dia livre")))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 30,
      fontWeight: 900,
      color: horasHoje > 0 ? H.gold : H.muted,
      letterSpacing: '-1px'
    }
  }, horasHoje.toFixed(1), "h"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 11,
      color: H.muted
    }
  }, "meta ", metaDiaPara(curDate), "h"))), showDiaLivre && /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 16px 12px',
      background: H.surface,
      borderRadius: 16,
      border: "2px solid ".concat(H.gold),
      padding: '16px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.gold,
      fontWeight: 800,
      fontSize: 14,
      marginBottom: 12
    }
  }, "Dias livres & F\xE9rias"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      marginBottom: 14
    }
  }, [{
    v: 'dia',
    l: 'Dia livre'
  }, {
    v: 'ferias',
    l: 'Férias'
  }, {
    v: 'komp',
    l: 'Komp.'
  }, {
    v: 'feriados',
    l: 'Feriados SO'
  }].map(function (t) {
    return /*#__PURE__*/React.createElement("button", {
      key: t.v,
      onClick: function onClick() {
        setDlTipo(t.v);
        if (t.v === 'feriados') setShowFeriados(function (v) {
          return !v;
        });
      },
      style: {
        flex: 1,
        background: dlTipo === t.v ? H.gold : H.surface2,
        border: "1px solid ".concat(dlTipo === t.v ? H.gold : H.border),
        borderRadius: 10,
        padding: '8px 4px',
        color: dlTipo === t.v ? '#fff' : H.muted,
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, t.l);
  })), (dlTipo === 'dia' || dlTipo === 'ferias' || dlTipo === 'komp') && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 4
    }
  }, dlTipo === 'dia' ? 'Data' : 'De'), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: dlDe,
    onChange: function onChange(e) {
      return setDlDe(e.target.value);
    },
    defaultValue: todayStr,
    style: {
      width: '100%',
      background: H.surface2,
      border: "1px solid ".concat(H.border),
      borderRadius: 10,
      padding: '9px 12px',
      color: H.text,
      fontSize: 13,
      outline: 'none',
      boxSizing: 'border-box'
    }
  })), (dlTipo === 'ferias' || dlTipo === 'komp') && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 4
    }
  }, "At\xE9"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: dlAte,
    onChange: function onChange(e) {
      return setDlAte(e.target.value);
    },
    style: {
      width: '100%',
      background: H.surface2,
      border: "1px solid ".concat(H.border),
      borderRadius: 10,
      padding: '9px 12px',
      color: H.text,
      fontSize: 13,
      outline: 'none',
      boxSizing: 'border-box'
    }
  }))), dlTipo === 'ferias' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      marginBottom: 12
    }
  }, [{
    v: 'dias',
    l: 'Em dias'
  }, {
    v: 'horas',
    l: 'Em horas'
  }].map(function (u) {
    return /*#__PURE__*/React.createElement("button", {
      key: u.v,
      onClick: function onClick() {
        return setFeriasUnidade(u.v);
      },
      style: {
        flex: 1,
        background: feriasUnidade === u.v ? H.gold : H.surface2,
        border: "1px solid ".concat(feriasUnidade === u.v ? H.gold : H.border),
        borderRadius: 10,
        padding: '7px 4px',
        color: feriasUnidade === u.v ? '#fff' : H.muted,
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, u.l);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(184,150,46,0.08)',
      borderRadius: 10,
      padding: '8px 12px',
      marginBottom: 12,
      border: "1px solid rgba(184,150,46,0.2)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: H.gold
    }
  }, "\u2139\uFE0F Dias \xFAteis recebem automaticamente ", metaDia, "h"), dlTipo === 'ferias' && feriasUnidade === 'dias' && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: H.gold,
      marginTop: 4
    }
  }, "\uD83C\uDFD6 Tens ", feriasDisp, " dia", feriasDisp === 1 ? '' : 's', " de f\xE9rias dispon\xEDve", feriasDisp === 1 ? 'l' : 'is', ". ", feriasDisp === 0 ? 'Os próximos dias vão descontar ' + metaFerias + 'h do saldo.' : ''), dlTipo === 'ferias' && feriasUnidade === 'horas' && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: H.gold,
      marginTop: 4
    }
  }, "\uD83C\uDFD6 Tens ", horasFeriasDisp.toFixed(1), "h de f\xE9rias dispon\xEDveis. ", horasFeriasDisp < metaFerias ? 'Sem horas suficientes para um dia completo — os próximos vão descontar ' + metaFerias + 'h do saldo.' : ''), dlTipo === 'komp' && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: H.gold,
      marginTop: 4
    }
  }, "\uD83D\uDD01 Tens ", kompDisp.toFixed(1), "h de Komp. dispon\xEDveis. ", kompDisp < metaDia ? 'Sem horas suficientes para um dia completo — os próximos vão descontar ' + metaDia + 'h do saldo.' : '')), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      var de = dlDe || todayStr;
      var ate = dlTipo === 'dia' ? de : dlAte || de;
      if (de) addDiasLivresRange(de, ate, dlTipo);
      setShowDiaLivre(false);
      setDlDe('');
      setDlAte('');
    },
    style: {
      width: '100%',
      background: "linear-gradient(135deg,".concat(H.gold, ",").concat(H.goldL, ")"),
      border: 'none',
      borderRadius: 12,
      padding: '12px',
      color: '#fff',
      fontSize: 14,
      fontWeight: 800,
      cursor: 'pointer'
    }
  }, "\u2713 Adicionar ", dlTipo === 'dia' ? 'dia livre' : 'férias')), dlTipo === 'feriados' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.text,
      fontSize: 13,
      fontWeight: 700
    }
  }, "Feriados Solothurn 2026"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      FERIADOS_SO.filter(function (f) {
        return isWeekday(f.date) && !isDiaLivre(f.date);
      }).forEach(function (f) {
        setDiasLivres(function (p) {
          return [].concat(_toConsumableArray(p), [{
            date: f.date,
            tipo: 'feriado',
            nome: f.nome
          }]);
        });
        var feriadoEntry = {
          id: Date.now() + Math.random(),
          date: f.date,
          tipo: 'Feriado',
          proj: f.nome,
          hi: '00:00',
          hf: '00:00',
          horas: metaDia,
          isAuto: true,
          dlTipo: 'feriado',
          validado: isOwnWeekDue(f.date)
        };
        setEntries(function (p) {
          return [].concat(_toConsumableArray(p), [feriadoEntry]);
        });
        pushEntryToSupabase(feriadoEntry);
      });
      setShowDiaLivre(false);
    },
    style: {
      background: "linear-gradient(135deg,".concat(H.gold, ",").concat(H.goldL, ")"),
      border: 'none',
      borderRadius: 10,
      padding: '6px 12px',
      color: '#fff',
      fontSize: 12,
      fontWeight: 800,
      cursor: 'pointer'
    }
  }, "+ Todos")), /*#__PURE__*/React.createElement("div", {
    style: {
      maxHeight: 220,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, FERIADOS_SO.map(function (f) {
    var added = isDiaLivre(f.date);
    var wd = isWeekday(f.date);
    return /*#__PURE__*/React.createElement("div", {
      key: f.date,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 10px',
        background: added ? 'rgba(34,197,94,0.08)' : H.surface2,
        borderRadius: 10,
        border: "1px solid ".concat(added ? 'rgba(34,197,94,0.3)' : H.border)
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontWeight: 700,
        fontSize: 13,
        color: H.text
      }
    }, f.nome), /*#__PURE__*/React.createElement("p", {
      style: {
        color: H.muted,
        fontSize: 11
      }
    }, new Date(f.date + 'T12:00:00').toLocaleDateString('pt-PT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }), " ", !wd ? '(fim-de-semana)' : '')), added ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: H.green,
        fontSize: 12,
        fontWeight: 700
      }
    }, "\u2713 Adicionado") : wd ? /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setDiasLivres(function (p) {
          return [].concat(_toConsumableArray(p), [{
            date: f.date,
            tipo: 'feriado',
            nome: f.nome
          }]);
        });
        var feriadoEntry2 = {
          id: Date.now() + Math.random(),
          date: f.date,
          tipo: 'Feriado',
          proj: f.nome,
          hi: '00:00',
          hf: '00:00',
          horas: metaDia,
          isAuto: true,
          dlTipo: 'feriado',
          validado: isOwnWeekDue(f.date)
        };
        setEntries(function (p) {
          return [].concat(_toConsumableArray(p), [feriadoEntry2]);
        });
        pushEntryToSupabase(feriadoEntry2);
      },
      style: {
        background: H.gold,
        border: 'none',
        borderRadius: 8,
        padding: '4px 10px',
        color: '#fff',
        fontSize: 11,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, "+") : /*#__PURE__*/React.createElement("span", {
      style: {
        color: H.muted,
        fontSize: 11
      }
    }, "\u2014"));
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 16px 12px',
      background: H.surface2,
      borderRadius: 14,
      padding: 4,
      border: "1px solid ".concat(H.border),
      display: 'flex'
    }
  }, ['Dia', 'Semana', 'Mês'].map(function (t) {
    return /*#__PURE__*/React.createElement("button", {
      key: t,
      onClick: function onClick() {
        return setTab(t);
      },
      style: {
        flex: 1,
        background: tab === t ? H.gold : 'none',
        border: 'none',
        borderRadius: 11,
        padding: '9px',
        color: tab === t ? '#fff' : H.muted,
        fontSize: 13,
        fontWeight: 800,
        cursor: 'pointer'
      }
    }, t);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: H.muted,
      fontSize: 13
    }
  }, horasTab.toFixed(1), "h / ", metaTab, "h"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: horasTab >= metaTab ? H.green : pct >= 50 ? H.gold : H.red,
      fontSize: 20,
      fontWeight: 900
    }
  }, pct, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 10,
      background: '#1A1A14',
      borderRadius: 0,
      overflow: 'hidden',
      display: 'flex'
    }
  }, horasTab <= 0 ? null : horasTab <= metaTab ? /*#__PURE__*/React.createElement("div", {
    style: {
      width: "".concat(horasTab / metaTab * 100, "%"),
      background: '#EF4444',
      borderRadius: 8,
      transition: 'width 0.3s'
    }
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "".concat(metaTab / horasTab * 100, "%"),
      background: '#EF4444'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: '#22C55E',
      borderRadius: '0 8px 8px 0'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 10,
      height: 10,
      background: '#EF4444',
      borderRadius: 3
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: H.muted
    }
  }, "At\xE9 ", metaTab, "h (meta)")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 10,
      height: 10,
      background: '#22C55E',
      borderRadius: 3
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: H.muted
    }
  }, "Acima da meta"))), horasTab > metaTab && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      background: 'rgba(34,197,94,0.1)',
      border: '1px solid rgba(34,197,94,0.35)',
      borderRadius: 12,
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 20
    }
  }, "\u2705"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#22C55E',
      fontWeight: 800,
      fontSize: 13
    }
  }, "Meta ultrapassada!"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 12,
      marginTop: 1
    }
  }, "+", (horasTab - metaTab).toFixed(1), "h acima \xB7 Bom trabalho!"))), horasTab > 0 && horasTab < metaTab && tab === 'Dia' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      background: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.3)',
      borderRadius: 12,
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 20
    }
  }, "\u26A0\uFE0F"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.red,
      fontWeight: 800,
      fontSize: 13
    }
  }, "Meta n\xE3o atingida"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 12,
      marginTop: 1
    }
  }, "Faltam ", (metaTab - horasTab).toFixed(1), "h para atingir os ", metaTab, "h"))), saldo < -10 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      background: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.3)',
      borderRadius: 12,
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 20
    }
  }, "\uD83D\uDD34"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.red,
      fontWeight: 800,
      fontSize: 13
    }
  }, "Saldo mensal cr\xEDtico"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 12,
      marginTop: 1
    }
  }, "Tens ", Math.abs(saldo).toFixed(1), "h em falta este m\xEAs")))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 16px',
      display: 'flex',
      gap: 8,
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement(LCard, {
    style: {
      padding: '12px 14px',
      minWidth: 130,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 10,
      fontWeight: 600
    }
  }, "Hoje"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.gold,
      fontSize: 22,
      fontWeight: 900,
      marginTop: 3
    }
  }, horasHoje.toFixed(1), "h"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 10,
      marginTop: 2
    }
  }, "meta ", metaDiaPara(curDate), "h")), /*#__PURE__*/React.createElement(LCard, {
    style: {
      padding: '12px 14px',
      minWidth: 130,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 10,
      fontWeight: 600
    }
  }, "Semana"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.gold,
      fontSize: 22,
      fontWeight: 900,
      marginTop: 3
    }
  }, horasSem.toFixed(1), "h"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 10,
      marginTop: 2
    }
  }, "meta ", metaSem, "h")), /*#__PURE__*/React.createElement(LCard, {
    style: {
      padding: '12px 14px',
      minWidth: 140,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 10,
      fontWeight: 600
    }
  }, "M\xEAs"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.gold,
      fontSize: 22,
      fontWeight: 900,
      marginTop: 3
    }
  }, horasMes.toFixed(1), "h"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 10,
      marginTop: 1
    }
  }, "meta ", metaMes, "h"), saldo < 0 && /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.red,
      fontSize: 10,
      fontWeight: 700,
      marginTop: 1
    }
  }, "faltam ", Math.abs(saldo).toFixed(1), "h")), /*#__PURE__*/React.createElement(LCard, {
    style: {
      padding: '12px 14px',
      minWidth: 130,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 10,
      fontWeight: 600
    }
  }, "At\xE9 Hoje"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: saldo >= 0 ? H.green : H.red,
      fontSize: 22,
      fontWeight: 900,
      marginTop: 3
    }
  }, saldo >= 0 ? '+' : '', saldo.toFixed(1), "h"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 10,
      marginTop: 2
    }
  }, "horas a mais")), /*#__PURE__*/React.createElement(LCard, {
    style: {
      padding: '12px 14px',
      minWidth: 120,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 10,
      fontWeight: 600
    }
  }, "Saldo"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: saldo + totalJanAbrSaldo >= 0 ? H.green : H.red,
      fontSize: 22,
      fontWeight: 900,
      marginTop: 3
    }
  }, saldo + totalJanAbrSaldo >= 0 ? '+' : '', (saldo + totalJanAbrSaldo).toFixed(1), "h"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 10,
      marginTop: 2
    }
  }, "at\xE9 hoje + Abaclick"))), subNav === 'Registo' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 12
    }
  }, [['pendentes', 'Pendentes'], ['concluidos', 'Concluídos']].map(function (opt) {
    var key = opt[0],
      lbl = opt[1];
    return /*#__PURE__*/React.createElement("button", {
      key: key,
      onClick: function onClick() {
        return setViewMode(key);
      },
      style: {
        flex: 1,
        padding: '9px 0',
        borderRadius: 10,
        border: viewMode === key ? 'none' : "1.5px solid ".concat(H.border),
        background: viewMode === key ? H.gold : H.surface,
        color: viewMode === key ? '#09090E' : H.muted,
        fontWeight: 700,
        fontSize: 13,
        cursor: 'pointer'
      }
    }, lbl, key === 'pendentes' && pendentesNaJanela.length > 0 ? " (".concat(pendentesNaJanela.length, ")") : '');
  })), viewMode === 'pendentes' && pendentesNaJanela.length > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: validarTudoVisivel,
    style: {
      width: '100%',
      padding: '11px 0',
      borderRadius: 10,
      border: 'none',
      background: H.green,
      color: '#fff',
      fontWeight: 800,
      fontSize: 13,
      cursor: 'pointer',
      marginBottom: 14
    }
  }, "\u2713 Validar tudo (", tab.toLowerCase(), ") \u2014 ", pendentesNaJanela.length, " registo", pendentesNaJanela.length === 1 ? '' : 's'), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.gold,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '1.5px',
      textTransform: 'uppercase',
      marginBottom: 14
    }
  }, viewMode === 'concluidos' ? 'REGISTOS CONCLUÍDOS' : 'REGISTOS PENDENTES'), sortedDatesRegisto.length === 0 && /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 13,
      padding: '8px 0'
    }
  }, viewMode === 'concluidos' ? 'Ainda sem registos validados neste período.' : 'Sem registos pendentes neste período.'), sortedDatesRegisto.map(function (date) {
    return /*#__PURE__*/React.createElement("div", {
      key: date,
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: H.text,
        fontSize: 13,
        fontWeight: 800,
        marginBottom: 8
      }
    }, new Date(date + 'T12:00:00').toLocaleDateString('pt-PT', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).toUpperCase()), groupedRegisto[date].map(function (e) {
      return /*#__PURE__*/React.createElement(LCard, {
        key: e.id,
        style: {
          padding: '14px 16px',
          marginBottom: 8,
          borderLeft: "4px solid ".concat(H.blue),
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          marginBottom: 4
        }
      }, /*#__PURE__*/React.createElement("p", {
        style: {
          fontWeight: 800,
          fontSize: 15,
          color: H.text
        }
      }, e.tipo), e.isAuto && /*#__PURE__*/React.createElement("div", {
        style: {
          background: e.dlTipo === 'feriado' ? 'rgba(168,85,247,0.12)' : e.dlTipo === 'ferias' ? 'rgba(59,130,246,0.12)' : e.dlTipo === 'ferias_extra' ? 'rgba(239,68,68,0.12)' : e.dlTipo === 'komp' ? 'rgba(20,184,166,0.12)' : e.dlTipo === 'komp_extra' ? 'rgba(239,68,68,0.12)' : e.dlTipo === 'sexta' ? 'rgba(184,150,46,0.12)' : 'rgba(34,197,94,0.12)',
          border: "1px solid ".concat(e.dlTipo === 'feriado' ? 'rgba(168,85,247,0.3)' : e.dlTipo === 'ferias' ? 'rgba(59,130,246,0.3)' : e.dlTipo === 'ferias_extra' ? 'rgba(239,68,68,0.3)' : e.dlTipo === 'komp' ? 'rgba(20,184,166,0.3)' : e.dlTipo === 'komp_extra' ? 'rgba(239,68,68,0.3)' : e.dlTipo === 'sexta' ? 'rgba(184,150,46,0.3)' : 'rgba(34,197,94,0.3)'),
          borderRadius: 6,
          padding: '1px 7px'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10,
          fontWeight: 700,
          color: e.dlTipo === 'feriado' ? '#A855F7' : e.dlTipo === 'ferias' ? H.blue : e.dlTipo === 'ferias_extra' ? H.red : e.dlTipo === 'komp' ? '#14B8A6' : e.dlTipo === 'komp_extra' ? H.red : e.dlTipo === 'sexta' ? H.gold : H.green
        }
      }, e.dlTipo === 'feriado' ? '🎌 Feriado' : e.dlTipo === 'ferias' ? '🏖 Férias' : e.dlTipo === 'ferias_extra' ? '🏖 Férias (-5.7h)' : e.dlTipo === 'komp' ? '🔁 Komp.' : e.dlTipo === 'komp_extra' ? '🔁 Komp. (-5.9h)' : e.dlTipo === 'sexta' ? '🗓 Sexta livre' : '✅ Dia livre'))), !e.isAuto && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flexWrap: 'wrap'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          background: 'rgba(59,130,246,0.12)',
          border: '1px solid rgba(59,130,246,0.25)',
          borderRadius: 6,
          padding: '2px 8px'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          fontWeight: 700,
          color: H.blue
        }
      }, e.proj)), /*#__PURE__*/React.createElement("span", {
        style: {
          color: H.muted,
          fontSize: 12
        }
      }, e.hi, "\u2013", e.hf)), e.morada && /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          marginTop: 4
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11
        }
      }, "\uD83D\uDCCD"), /*#__PURE__*/React.createElement("span", {
        style: {
          color: H.muted,
          fontSize: 12
        }
      }, e.morada))), e.isAuto && e.proj !== '—' && /*#__PURE__*/React.createElement("p", {
        style: {
          color: H.muted,
          fontSize: 12,
          marginTop: 2
        }
      }, e.proj)), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 8,
          flexShrink: 0
        }
      }, /*#__PURE__*/React.createElement("p", {
        style: {
          color: e.isAuto ? H.green : H.gold,
          fontWeight: 900,
          fontSize: 22,
          lineHeight: 1
        }
      }, e.horas.toFixed(1), "h"), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: 4
        }
      }, /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return toggleValidado(e);
        },
        title: e.validado ? 'Concluído — toca para voltar a pendente' : 'Validar',
        style: {
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 28,
          height: 28,
          borderRadius: 8,
          border: "1.5px solid ".concat(e.validado ? H.green : H.gold),
          background: e.validado ? "".concat(H.green, "22") : "".concat(H.gold, "1A"),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 13
        }
      }, e.validado ? "\u2705" : "\u2713"))), !e.isAuto && /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return setEditEntry(e);
        },
        style: {
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 28,
          height: 28,
          borderRadius: 8,
          border: "1.5px solid ".concat(H.border),
          background: H.surface2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 13
        }
      }, "\u270F\uFE0F"))), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          setEntries(function (p) {
            return p.filter(function (x) {
              return x.id !== e.id;
            });
          });
          if (window.supabaseClient) {
            window.supabaseClient.from('horas_entries').delete().eq('id', e.id).then(function () {}).catch(function () {});
          }
          if (e.isAuto) setDiasLivres(function (p) {
            return p.filter(function (x) {
              return x.date !== e.date;
            });
          });
        },
        style: {
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          opacity: 0.5
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 18,
          height: 18,
          borderRadius: 4,
          border: "1.5px solid ".concat(H.muted),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10
        }
      }, "\uD83D\uDDD1"))))));
    }));
  })), subNav === 'Projetos' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.gold,
      fontSize: 11,
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '1.2px'
    }
  }, "Projetos"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setShowAddProj(true);
      setEditProj(null);
      setNewProjName('');
      setNewProjDesc('');
      setProjSaveErr('');
      setNewProjColor(H.blue);
    },
    style: {
      background: "linear-gradient(135deg,".concat(H.gold, ",").concat(H.goldL, ")"),
      border: 'none',
      borderRadius: 10,
      padding: '6px 14px',
      color: '#fff',
      fontSize: 12,
      fontWeight: 800,
      cursor: 'pointer'
    }
  }, "\uFF0B Projeto")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      marginBottom: 14,
      overflowX: 'auto',
      paddingBottom: 4
    }
  }, ['Todos', 'Com registos', 'Sem registos'].map(function (f) {
    return /*#__PURE__*/React.createElement("button", {
      key: f,
      onClick: function onClick() {
        return setProjFilter(f);
      },
      style: {
        background: projFilter === f ? H.gold : H.surface,
        border: "1px solid ".concat(projFilter === f ? H.gold : H.border),
        borderRadius: 20,
        padding: '5px 14px',
        color: projFilter === f ? '#fff' : H.muted,
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0
      }
    }, f);
  })), showAddProj && /*#__PURE__*/React.createElement(LCard, {
    style: {
      padding: '16px',
      marginBottom: 14,
      border: "2px solid ".concat(H.gold)
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.gold,
      fontWeight: 800,
      fontSize: 14,
      marginBottom: 12
    }
  }, editProj ? 'Editar projeto' : 'Novo projeto'), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 4
    }
  }, "Nome do projeto"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("input", {
    ref: projNameRef,
    defaultValue: newProjName,
    key: "name-".concat(editProj),
    placeholder: "Ex: POP GREN05",
    style: {
      width: '100%',
      background: H.surface2,
      border: "1px solid ".concat(H.border),
      borderRadius: 10,
      padding: '10px 40px 10px 12px',
      color: H.text,
      fontSize: 14,
      outline: 'none',
      boxSizing: 'border-box'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      if (projNameRef.current) projNameRef.current.value = '';
    },
    style: {
      position: 'absolute',
      right: 10,
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'rgba(0,0,0,0.1)',
      border: 'none',
      borderRadius: '50%',
      width: 22,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: H.muted,
      fontSize: 13,
      fontWeight: 700
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 4
    }
  }, "Descri\xE7\xE3o"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("input", {
    ref: projDescRef,
    defaultValue: newProjDesc,
    key: "desc-".concat(editProj),
    placeholder: "Ex: Grenchen - Zona 5",
    style: {
      width: '100%',
      background: H.surface2,
      border: "1px solid ".concat(H.border),
      borderRadius: 10,
      padding: '10px 40px 10px 12px',
      color: H.text,
      fontSize: 14,
      outline: 'none',
      boxSizing: 'border-box'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      if (projDescRef.current) projDescRef.current.value = '';
    },
    style: {
      position: 'absolute',
      right: 10,
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'rgba(0,0,0,0.1)',
      border: 'none',
      borderRadius: '50%',
      width: 22,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: H.muted,
      fontSize: 13,
      fontWeight: 700
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 8
    }
  }, "Cor"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 14
    }
  }, [H.blue, H.orange, H.green, H.gold, '#A855F7', '#EF4444', '#EC4899', '#06B6D4', '#6366F1', '#84CC16', '#14B8A6', '#F59E0B', '#78716C', '#64748B'].map(function (c) {
    return /*#__PURE__*/React.createElement("div", {
      key: c,
      onClick: function onClick() {
        return setNewProjColor(c);
      },
      style: {
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: c,
        cursor: 'pointer',
        border: newProjColor === c ? "3px solid ".concat(H.text) : '3px solid transparent'
      }
    });
  })), projSaveErr && /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#DC2626',
      fontSize: 12.5,
      lineHeight: 1.4,
      marginBottom: 10,
      padding: '8px 10px',
      background: 'rgba(220,38,38,0.08)',
      border: '1px solid rgba(220,38,38,0.25)',
      borderRadius: 10
    }
  }, "\u26A0\uFE0F ", projSaveErr), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowAddProj(false);
    },
    style: {
      flex: 1,
      background: H.surface2,
      border: "1px solid ".concat(H.border),
      borderRadius: 10,
      padding: '10px',
      color: H.muted,
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    onClick: saveProject,
    disabled: projSaving,
    style: {
      flex: 2,
      background: projSaving ? H.surface2 : "linear-gradient(135deg,".concat(H.gold, ",").concat(H.goldL, ")"),
      border: 'none',
      borderRadius: 10,
      padding: '10px',
      color: projSaving ? H.muted : '#fff',
      fontSize: 13,
      fontWeight: 800,
      cursor: projSaving ? 'default' : 'pointer'
    }
  }, projSaving ? 'A guardar…' : "\u2713 " + (editProj ? 'Guardar' : 'Adicionar')))), projList.filter(function (p) {
    var hasReg = entries.some(function (e) {
      return e.proj === p.name;
    });
    if (projFilter === 'Com registos') return hasReg;
    if (projFilter === 'Sem registos') return !hasReg;
    return true;
  }).map(function (proj) {
    var projEntries = entries.filter(function (e) {
      return e.proj === proj.name;
    });
    var projHoras = projEntries.reduce(function (s, e) {
      return s + e.horas;
    }, 0);
    var lastDate = projEntries.length ? projEntries.sort(function (a, b) {
      return b.date.localeCompare(a.date);
    })[0].date : '—';
    var tipos2 = _toConsumableArray(new Set(projEntries.map(function (e) {
      return e.tipo;
    })));
    var pctMes = horasMes > 0 ? Math.round(projHoras / horasMes * 100) : 0;
    return /*#__PURE__*/React.createElement(LCard, {
      key: proj.id,
      style: {
        padding: '16px',
        marginBottom: 12,
        borderLeft: "4px solid ".concat(proj.color)
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 5
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "".concat(proj.color, "18"),
        border: "1px solid ".concat(proj.color, "44"),
        borderRadius: 8,
        padding: '3px 12px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 800,
        color: proj.color
      }
    }, proj.name))), proj.desc && /*#__PURE__*/React.createElement("p", {
      style: {
        color: H.muted,
        fontSize: 11,
        marginBottom: 3
      }
    }, proj.desc), /*#__PURE__*/React.createElement("p", {
      style: {
        color: H.muted,
        fontSize: 12
      }
    }, projEntries.length, " registo", projEntries.length !== 1 ? 's' : '', " \xB7 \xDAltimo: ", lastDate)), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'right',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: H.gold,
        fontWeight: 900,
        fontSize: 24,
        lineHeight: 1
      }
    }, projHoras.toFixed(1), "h"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: H.green,
        fontSize: 13,
        fontWeight: 800,
        marginTop: 2
      }
    }, "CHF ", Math.round(projHoras * 60)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        marginTop: 8,
        justifyContent: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setEditProj(proj.id);
        setNewProjName(proj.name);
        setNewProjDesc(proj.desc || '');
        setNewProjColor(proj.color);
        setShowAddProj(true);
        setProjSaveErr('');
      },
      style: {
        background: H.surface2,
        border: "1px solid ".concat(H.border),
        borderRadius: 7,
        padding: '4px 8px',
        cursor: 'pointer',
        fontSize: 12,
        color: H.muted
      }
    }, "\u270F\uFE0F"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return deleteProject(proj.id);
      },
      style: {
        background: 'rgba(220,38,38,0.07)',
        border: '1px solid rgba(220,38,38,0.2)',
        borderRadius: 7,
        padding: '4px 8px',
        cursor: 'pointer',
        fontSize: 12,
        color: H.red
      }
    }, "\uD83D\uDDD1")))), tipos2.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        marginBottom: 10
      }
    }, tipos2.map(function (t) {
      return /*#__PURE__*/React.createElement("div", {
        key: t,
        style: {
          background: H.surface2,
          borderRadius: 8,
          padding: '3px 10px',
          border: "1px solid ".concat(H.border)
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          color: H.muted,
          fontWeight: 600
        }
      }, t));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 6,
        background: H.surface2,
        borderRadius: 6,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        width: "".concat(pctMes, "%"),
        background: proj.color,
        borderRadius: 6,
        transition: 'width 0.3s'
      }
    })), /*#__PURE__*/React.createElement("p", {
      style: {
        color: H.muted,
        fontSize: 10,
        marginTop: 4
      }
    }, pctMes, "% do total deste m\xEAs"));
  })), subNav === 'Gráficos' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 20px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.gold,
      fontSize: 11,
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '1.2px',
      marginBottom: 14
    }
  }, "Gr\xE1ficos"), /*#__PURE__*/React.createElement(LCard, {
    style: {
      padding: '16px',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.text,
      fontWeight: 800,
      fontSize: 14,
      marginBottom: 12
    }
  }, "\uD83D\uDCCA Horas por dia"), sortedDates.map(function (date) {
    var h = grouped[date].reduce(function (s, e) {
      return s + e.horas;
    }, 0);
    var metaDoDia = metaDiaPara(date);
    var over = h > metaDoDia;
    var redPct = metaDoDia > 0 ? Math.min(100, metaDoDia / h * 100) : 0;
    var pctBar = metaDoDia > 0 ? Math.min(100, h / metaDoDia * 100) : 100;
    return /*#__PURE__*/React.createElement("div", {
      key: date,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: H.muted,
        fontWeight: 600,
        width: 62,
        flexShrink: 0
      }
    }, new Date(date + 'T12:00:00').toLocaleDateString('pt-PT', {
      weekday: 'short',
      day: '2-digit'
    }).toUpperCase()), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 14,
        background: H.surface2,
        borderRadius: 7,
        overflow: 'hidden',
        border: "1px solid ".concat(H.border)
      }
    }, over ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        height: '100%'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: "".concat(redPct, "%"),
        background: '#EF4444',
        borderRadius: '7px 0 0 7px'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        background: '#22C55E'
      }
    })) : /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        width: "".concat(pctBar, "%"),
        background: H.blue,
        borderRadius: 7
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: over ? H.green : H.gold,
        fontWeight: 800,
        width: 36,
        textAlign: 'right'
      }
    }, h.toFixed(1), "h"));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      marginTop: 10,
      paddingTop: 10,
      borderTop: "1px solid ".concat(H.border)
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 12,
      height: 12,
      background: '#EF4444',
      borderRadius: 3
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: H.muted
    }
  }, "Meta")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 12,
      height: 12,
      background: '#22C55E',
      borderRadius: 3
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: H.muted
    }
  }, "Extra")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 12,
      height: 12,
      background: H.blue,
      borderRadius: 3
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: H.muted
    }
  }, "Abaixo")))), /*#__PURE__*/React.createElement(LCard, {
    style: {
      padding: '16px',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.text,
      fontWeight: 800,
      fontSize: 14,
      marginBottom: 12
    }
  }, "\uD83D\uDCC1 Por projeto"), projs.map(function (proj) {
    var h = entries.filter(function (e) {
      return e.proj === proj;
    }).reduce(function (s, e) {
      return s + e.horas;
    }, 0);
    if (!h) return null;
    var pctBar = Math.round(h / horasMes * 100);
    return /*#__PURE__*/React.createElement("div", {
      key: proj,
      style: {
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: projColor(proj)
      }
    }, proj), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 800,
        color: H.gold
      }
    }, h.toFixed(1), "h \xB7 ", pctBar, "%")), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 10,
        background: H.surface2,
        borderRadius: 6,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        width: "".concat(pctBar, "%"),
        background: projColor(proj),
        borderRadius: 6
      }
    })));
  })), /*#__PURE__*/React.createElement(LCard, {
    style: {
      padding: '16px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.text,
      fontWeight: 800,
      fontSize: 14,
      marginBottom: 12
    }
  }, "\uD83D\uDD27 Por tipo de trabalho"), _toConsumableArray(new Set(entries.map(function (e) {
    return e.tipo;
  }))).map(function (tipo) {
    var h = entries.filter(function (e) {
      return e.tipo === tipo;
    }).reduce(function (s, e) {
      return s + e.horas;
    }, 0);
    var pctBar = Math.round(h / horasMes * 100);
    return /*#__PURE__*/React.createElement("div", {
      key: tipo,
      style: {
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: H.text
      }
    }, tipo), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 800,
        color: H.gold
      }
    }, h.toFixed(1), "h")), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 10,
        background: H.surface2,
        borderRadius: 6,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        width: "".concat(pctBar, "%"),
        background: H.gold,
        borderRadius: 6
      }
    })));
  }))), subNav === 'Def.' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 20px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.gold,
      fontSize: 11,
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '1.2px',
      marginBottom: 14
    }
  }, "Defini\xE7\xF5es"), /*#__PURE__*/React.createElement(LCard, {
    style: {
      padding: '16px',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontWeight: 800,
      fontSize: 14,
      color: H.text,
      marginBottom: 12
    }
  }, "\uD83D\uDC64 Perfil"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 72,
      height: 72,
      borderRadius: '50%',
      background: "".concat(H.gold, "22"),
      border: "3px solid ".concat(H.gold, "55"),
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, (profile && profile.photo_url) ? /*#__PURE__*/React.createElement("img", {
    src: profile.photo_url,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    alt: "Perfil"
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 32
    }
  }, "\uD83D\uDC68\u200D\uD83D\uDCBC")), /*#__PURE__*/React.createElement("label", {
    title: "Adicionar foto",
    style: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 32,
      height: 32,
      borderRadius: '50%',
      background: H.gold,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16
    }
  }, "\uD83D\uDCF7"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    style: {
      display: 'none'
    },
    onChange: function onChange(e) {
      onPhotoUpload(e);
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontWeight: 800,
      fontSize: 16,
      color: H.text
    }
  }, "Patricio Carvalho"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 12
    }
  }, "Monteur \xB7 Selzach"), (profile && profile.photo_url) && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return onPhotoRemove();
    },
    style: {
      background: 'none',
      border: 'none',
      color: '#DC2626',
      fontSize: 11,
      cursor: 'pointer',
      padding: 0,
      marginTop: 4,
      fontWeight: 700
    }
  }, "\u2715 Remover foto")))), /*#__PURE__*/React.createElement(LCard, {
    style: {
      padding: '16px',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontWeight: 800,
      fontSize: 14,
      color: H.text,
      marginBottom: 12
    }
  }, "\u2708\uFE0F Marcar f\xE9rias por per\xEDodo"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 4
    }
  }, "De"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: feriasDe,
    onChange: function onChange(e) {
      return setFeriasDe(e.target.value);
    },
    style: {
      width: '100%',
      background: H.surface2,
      border: "1px solid ".concat(H.border),
      borderRadius: 10,
      padding: '10px 10px',
      color: H.text,
      fontSize: 13,
      outline: 'none',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 4
    }
  }, "At\xE9"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: feriasAte,
    onChange: function onChange(e) {
      return setFeriasAte(e.target.value);
    },
    style: {
      width: '100%',
      background: H.surface2,
      border: "1px solid ".concat(H.border),
      borderRadius: 10,
      padding: '10px 10px',
      color: H.text,
      fontSize: 13,
      outline: 'none',
      boxSizing: 'border-box'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return marcarPeriodo('ferias');
    },
    disabled: !feriasDe || !feriasAte,
    style: {
      flex: 1,
      background: feriasDe && feriasAte ? 'rgba(59,130,246,0.12)' : '#eee',
      border: "1px solid ".concat(feriasDe && feriasAte ? 'rgba(59,130,246,0.4)' : '#ddd'),
      borderRadius: 12,
      padding: '11px',
      color: feriasDe && feriasAte ? '#2563EB' : '#aaa',
      fontSize: 13,
      fontWeight: 800,
      cursor: feriasDe && feriasAte ? 'pointer' : 'default'
    }
  }, "\u2708\uFE0F F\xE9rias"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return marcarPeriodo('livre');
    },
    disabled: !feriasDe || !feriasAte,
    style: {
      flex: 1,
      background: feriasDe && feriasAte ? 'rgba(22,163,74,0.1)' : '#eee',
      border: "1px solid ".concat(feriasDe && feriasAte ? 'rgba(22,163,74,0.3)' : '#ddd'),
      borderRadius: 12,
      padding: '11px',
      color: feriasDe && feriasAte ? '#16A34A' : '#aaa',
      fontSize: 13,
      fontWeight: 800,
      cursor: feriasDe && feriasAte ? 'pointer' : 'default'
    }
  }, "\uD83C\uDF3F Dia livre")), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return limparPeriodo();
    },
    disabled: !feriasDe || !feriasAte,
    style: {
      width: '100%',
      background: 'rgba(220,38,38,0.06)',
      border: '1px solid rgba(220,38,38,0.2)',
      borderRadius: 12,
      padding: '10px',
      color: feriasDe && feriasAte ? '#DC2626' : '#bbb',
      fontSize: 13,
      fontWeight: 700,
      cursor: feriasDe && feriasAte ? 'pointer' : 'default'
    }
  }, "\u2715 Limpar per\xEDodo"), feriasDe && feriasAte && feriasDe <= feriasAte && /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 11,
      textAlign: 'center',
      marginTop: 8
    }
  }, Math.round((new Date(feriasAte) - new Date(feriasDe)) / 86400000) + 1, " dias selecionados")), /*#__PURE__*/React.createElement(LCard, {
    style: {
      padding: '14px 16px',
      marginBottom: 10,
      border: sextaLivre ? "1px solid ".concat(H.gold) : "1px solid ".concat(H.border)
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22
    }
  }, "\uD83D\uDDD3\uFE0F"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      color: H.text
    }
  }, "Sexta-feira livre"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 12,
      marginTop: 1
    }
  }, sextaLivre ? "+".concat(metaDia, "h autom\xE1tico \xE0s sextas") : 'Sextas contam como dia normal'), sextaLivre && /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.green,
      fontSize: 11,
      fontWeight: 700,
      marginTop: 3
    }
  }, "\u2713 Remunerado \u2014 conta para as horas")), /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      return setSextaLivre(function (v) {
        return !v;
      });
    },
    style: {
      width: 48,
      height: 26,
      borderRadius: 13,
      background: sextaLivre ? H.gold : '#D0CEC8',
      border: "1px solid ".concat(sextaLivre ? H.goldL : H.border),
      position: 'relative',
      cursor: 'pointer',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 3,
      left: sextaLivre ? 24 : 3,
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      transition: 'left 0.2s'
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: H.surface2,
      borderRadius: 14,
      padding: '12px 14px',
      border: "1px solid ".concat(H.border),
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.4px'
    }
  }, "Saldo Abaclick (Jan\u2013Abril)"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.gold,
      fontSize: 20,
      fontWeight: 900,
      marginTop: 4
    }
  }, totalJanAbrSaldo.toFixed(2), "h")), !editandoSaldoJanAbr && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setSaldoJanAbrModo('ajuste');
      setSaldoJanAbrInput('');
      setSaldoJanAbrErr('');
      setEditandoSaldoJanAbr(true);
    },
    style: {
      background: 'none',
      border: "1px solid ".concat(H.gold),
      borderRadius: 10,
      padding: '8px 12px',
      color: H.gold,
      fontSize: 12,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "\u270F\uFE0F Editar")), editandoSaldoJanAbr && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 8
    }
  }, [['ajuste', '\u2795\u2796 Ajustar'], ['saldototal', '\uD83C\uDFAF Saldo total'], ['absoluto', '123 Valor total']].map(function (opt) {
    var key = opt[0],
      lbl = opt[1];
    return /*#__PURE__*/React.createElement("button", {
      key: key,
      onClick: function onClick() {
        setSaldoJanAbrModo(key);
        setSaldoJanAbrInput('');
        setSaldoJanAbrErr('');
      },
      style: {
        flex: 1,
        background: saldoJanAbrModo === key ? H.gold : 'none',
        border: "1px solid ".concat(H.gold),
        borderRadius: 8,
        padding: '6px 8px',
        color: saldoJanAbrModo === key ? '#1a1410' : H.gold,
        fontSize: 11,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, lbl);
  })), /*#__PURE__*/React.createElement("input", {
    key: saldoJanAbrModo,
    type: "text",
    inputMode: "decimal",
    defaultValue: saldoJanAbrInput,
    onChange: function onChange(e) {
      return setSaldoJanAbrInput(e.target.value);
    },
    placeholder: saldoJanAbrModo === 'ajuste' ? 'ex: +5 ou -3' : saldoJanAbrModo === 'saldototal' ? 'ex: 63.67' : 'ex: 59.93',
    style: {
      width: '100%',
      background: H.surface,
      border: "1px solid ".concat(H.border),
      borderRadius: 10,
      padding: '10px 12px',
      color: H.text,
      fontSize: 16,
      marginBottom: 8
    }
  }), saldoJanAbrModo === 'ajuste' && saldoJanAbrInput.trim() !== '' && !isNaN(parseFloat(saldoJanAbrInput.replace(',', '.'))) && /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 12,
      marginBottom: 8
    }
  }, "Novo total Jan\u2013Abril: ", /*#__PURE__*/React.createElement("b", {
    style: { color: H.gold }
  }, (totalJanAbrSaldo + parseFloat(saldoJanAbrInput.replace(',', '.'))).toFixed(2), "h")), saldoJanAbrModo === 'saldototal' && saldoJanAbrInput.trim() !== '' && !isNaN(parseFloat(saldoJanAbrInput.replace(',', '.'))) && /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 12,
      marginBottom: 8
    }
  }, "Saldo geral vai passar a mostrar: ", /*#__PURE__*/React.createElement("b", {
    style: { color: H.gold }
  }, parseFloat(saldoJanAbrInput.replace(',', '.')) >= 0 ? '+' : '', parseFloat(saldoJanAbrInput.replace(',', '.')).toFixed(2), "h")), saldoJanAbrErr && /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.red,
      fontSize: 12,
      marginBottom: 8
    }
  }, saldoJanAbrErr), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 11,
      marginBottom: 8
    }
  }, "Fica tudo num \xFAnico registo em Jan\u2013Mar (Abril fica com as ", horasAbril2026.toFixed(1), "h reais que j\xE1 tem). Maio em diante nunca \xE9 tocado."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: guardarSaldoJanAbr,
    disabled: saldoJanAbrSaving,
    style: {
      flex: 1,
      background: "linear-gradient(135deg,".concat(H.gold, ",").concat(H.goldL, ")"),
      border: 'none',
      borderRadius: 10,
      padding: '11px',
      color: '#1a1410',
      fontSize: 13,
      fontWeight: 800,
      cursor: 'pointer',
      opacity: saldoJanAbrSaving ? 0.6 : 1
    }
  }, saldoJanAbrSaving ? 'A guardar...' : '\u2713 Guardar'), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setEditandoSaldoJanAbr(false);
      setSaldoJanAbrErr('');
    },
    disabled: saldoJanAbrSaving,
    style: {
      flex: 1,
      background: 'none',
      border: "1px solid ".concat(H.border),
      borderRadius: 10,
      padding: '11px',
      color: H.muted,
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "Cancelar")))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: H.surface2,
      borderRadius: 14,
      padding: '12px 14px',
      border: "1px solid ".concat(H.border),
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.4px'
    }
  }, "Dias de f\xE9rias dispon\xEDveis"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.gold,
      fontSize: 20,
      fontWeight: 900,
      marginTop: 4
    }
  }, feriasDisp)), !editandoFeriasDisp && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setFeriasDispInput(String(feriasDisp));
      setEditandoFeriasDisp(true);
    },
    style: {
      background: 'none',
      border: "1px solid ".concat(H.gold),
      borderRadius: 10,
      padding: '8px 12px',
      color: H.gold,
      fontSize: 12,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "\u270F\uFE0F Editar")), editandoFeriasDisp && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "1",
    min: "0",
    value: feriasDispInput,
    onChange: function onChange(e) {
      return setFeriasDispInput(e.target.value);
    },
    style: {
      width: '100%',
      background: H.surface,
      border: "1px solid ".concat(H.border),
      borderRadius: 10,
      padding: '9px 12px',
      color: H.text,
      fontSize: 14,
      outline: 'none',
      boxSizing: 'border-box',
      marginBottom: 8
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 11,
      marginBottom: 8
    }
  }, "Cada dia de f\xE9rias marcado consome 1 desta quota e n\xE3o toca no saldo. Quando chegar a 0, os dias seguintes passam a descontar ", metaFerias, "h do saldo."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      var parsed = parseInt(feriasDispInput, 10);
      if (isNaN(parsed) || parsed < 0) return;
      salvarFeriasDisp(parsed);
      setEditandoFeriasDisp(false);
    },
    style: {
      flex: 1,
      background: "linear-gradient(135deg,".concat(H.gold, ",").concat(H.goldL, ")"),
      border: 'none',
      borderRadius: 10,
      padding: '11px',
      color: '#1a1410',
      fontSize: 13,
      fontWeight: 800,
      cursor: 'pointer'
    }
  }, "\u2713 Guardar"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setEditandoFeriasDisp(false);
    },
    style: {
      flex: 1,
      background: 'none',
      border: "1px solid ".concat(H.border),
      borderRadius: 10,
      padding: '11px',
      color: H.muted,
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "Cancelar")))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: H.surface2,
      borderRadius: 14,
      padding: '12px 14px',
      border: "1px solid ".concat(H.border),
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.4px'
    }
  }, "Horas de f\xE9rias dispon\xEDveis"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.gold,
      fontSize: 20,
      fontWeight: 900,
      marginTop: 4
    }
  }, horasFeriasDisp.toFixed(1), "h")), !editandoHorasFeriasDisp && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setHorasFeriasDispInput(String(horasFeriasDisp));
      setEditandoHorasFeriasDisp(true);
    },
    style: {
      background: 'none',
      border: "1px solid ".concat(H.gold),
      borderRadius: 10,
      padding: '8px 12px',
      color: H.gold,
      fontSize: 12,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "\u270F\uFE0F Editar")), editandoHorasFeriasDisp && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "0.1",
    min: "0",
    value: horasFeriasDispInput,
    onChange: function onChange(e) {
      return setHorasFeriasDispInput(e.target.value);
    },
    style: {
      width: '100%',
      background: H.surface,
      border: "1px solid ".concat(H.border),
      borderRadius: 10,
      padding: '9px 12px',
      color: H.text,
      fontSize: 14,
      outline: 'none',
      boxSizing: 'border-box',
      marginBottom: 8
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 11,
      marginBottom: 8
    }
  }, "Usada quando escolhes \"Em horas\" no popup de F\xE9rias. Cada dia consome ", metaFerias, "h desta quota e n\xE3o toca no saldo. \xC9 independente da quota em dias."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      var parsed = parseFloat(horasFeriasDispInput.replace(',', '.'));
      if (isNaN(parsed) || parsed < 0) return;
      salvarHorasFeriasDisp(Math.round(parsed * 100) / 100);
      setEditandoHorasFeriasDisp(false);
    },
    style: {
      flex: 1,
      background: "linear-gradient(135deg,".concat(H.gold, ",").concat(H.goldL, ")"),
      border: 'none',
      borderRadius: 10,
      padding: '11px',
      color: '#1a1410',
      fontSize: 13,
      fontWeight: 800,
      cursor: 'pointer'
    }
  }, "\u2713 Guardar"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setEditandoHorasFeriasDisp(false);
    },
    style: {
      flex: 1,
      background: 'none',
      border: "1px solid ".concat(H.border),
      borderRadius: 10,
      padding: '11px',
      color: H.muted,
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "Cancelar")))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: H.surface2,
      borderRadius: 14,
      padding: '12px 14px',
      border: "1px solid ".concat(H.border),
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.4px'
    }
  }, "Horas de Komp. dispon\xEDveis"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.gold,
      fontSize: 20,
      fontWeight: 900,
      marginTop: 4
    }
  }, kompDisp.toFixed(1), "h")), !editandoKompDisp && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setKompDispInput(String(kompDisp));
      setEditandoKompDisp(true);
    },
    style: {
      background: 'none',
      border: "1px solid ".concat(H.gold),
      borderRadius: 10,
      padding: '8px 12px',
      color: H.gold,
      fontSize: 12,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "\u270F\uFE0F Editar")), editandoKompDisp && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "0.1",
    min: "0",
    value: kompDispInput,
    onChange: function onChange(e) {
      return setKompDispInput(e.target.value);
    },
    style: {
      width: '100%',
      background: H.surface,
      border: "1px solid ".concat(H.border),
      borderRadius: 10,
      padding: '9px 12px',
      color: H.text,
      fontSize: 14,
      outline: 'none',
      boxSizing: 'border-box',
      marginBottom: 8
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.muted,
      fontSize: 11,
      marginBottom: 8
    }
  }, "Cada dia marcado como Komp. consome ", metaDia, "h desta quota e n\xE3o toca no saldo. Quando n\xE3o houver horas suficientes para um dia completo, os dias seguintes passam a descontar ", metaDia, "h do saldo."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      var parsed = parseFloat(kompDispInput.replace(',', '.'));
      if (isNaN(parsed) || parsed < 0) return;
      salvarKompDisp(Math.round(parsed * 100) / 100);
      setEditandoKompDisp(false);
    },
    style: {
      flex: 1,
      background: "linear-gradient(135deg,".concat(H.gold, ",").concat(H.goldL, ")"),
      border: 'none',
      borderRadius: 10,
      padding: '11px',
      color: '#1a1410',
      fontSize: 13,
      fontWeight: 800,
      cursor: 'pointer'
    }
  }, "\u2713 Guardar"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setEditandoKompDisp(false);
    },
    style: {
      flex: 1,
      background: 'none',
      border: "1px solid ".concat(H.border),
      borderRadius: 10,
      padding: '11px',
      color: H.muted,
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "Cancelar")))), [{
    icon: '⏱️',
    label: 'Meta diária',
    value: "".concat(metaDiaSegQui, "h"),
    sub: 'horas por dia (seg–qui)'
  }, {
    icon: '📅',
    label: 'Meta semanal',
    value: "".concat(metaSem, "h"),
    sub: 'horas por semana'
  }, {
    icon: '📆',
    label: 'Meta mensal',
    value: "".concat(metaMes, "h"),
    sub: 'horas por mês'
  }, {
    icon: '💰',
    label: 'Taxa horária',
    value: 'CHF 60/h',
    sub: 'valor por hora'
  }, {
    icon: '🔔',
    label: 'Notificações',
    value: 'Ativas',
    sub: 'avisos diários'
  }, {
    icon: '📤',
    label: 'Exportar dados',
    value: 'PDF / Excel',
    sub: 'relatório mensal'
  }].map(function (s) {
    return /*#__PURE__*/React.createElement(LCard, {
      key: s.label,
      style: {
        padding: '14px 16px',
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 22
      }
    }, s.icon), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontWeight: 700,
        fontSize: 14,
        color: H.text
      }
    }, s.label), /*#__PURE__*/React.createElement("p", {
      style: {
        color: H.muted,
        fontSize: 12,
        marginTop: 1
      }
    }, s.sub)), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'right'
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: H.gold,
        fontWeight: 700,
        fontSize: 13
      }
    }, s.value), /*#__PURE__*/React.createElement("span", {
      style: {
        color: H.muted,
        fontSize: 16
      }
    }, "\u203A")));
  })), /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      return setShowAdd(function (v) {
        return !v;
      });
    },
    style: {
      position: 'fixed',
      bottom: 80,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: "linear-gradient(135deg,".concat(H.gold, ",").concat(H.goldL, ")"),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: "0 4px 20px rgba(184,150,46,0.45)",
      zIndex: 300
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 28,
      color: '#fff',
      lineHeight: 1,
      fontWeight: 300
    }
  }, showAdd ? '×' : '+')), showAdd && /*#__PURE__*/React.createElement(EntryFormModal, {
    onSave: function onSave(_ref1) {
      var tipo = _ref1.tipo,
        proj = _ref1.proj,
        hi = _ref1.hi,
        hf = _ref1.hf,
        horas = _ref1.horas,
        morada = _ref1.morada;
      var today = fmt(curDate);
      var tempId = Date.now();
      setEntries(function (p) {
        return [].concat(_toConsumableArray(p), [{
          id: tempId,
          date: today,
          tipo: tipo,
          proj: proj,
          hi: hi,
          hf: hf,
          horas: horas,
          morada: morada,
          validado: false
        }]);
      });
      if (!window.supabaseClient) {
        setEntrySaveErr('Sem ligação ao servidor — não foi guardado.');
        setEntries(function (p) {
          return p.filter(function (x) {
            return x.id !== tempId;
          });
        });
        return;
      }
      setEntrySaving(true);
      setEntrySaveErr('');
      window.supabaseClient.from('horas_entries').insert({
        data: today,
        tipo: tipo,
        project: proj,
        start_time: hi,
        end_time: hf,
        hours: horas,
        address: morada || null,
        validated: false
      }).then(function (res) {
        setEntrySaving(false);
        if (res.error) {
          setEntrySaveErr('Erro ao guardar: ' + res.error.message);
          setEntries(function (p) {
            return p.filter(function (x) {
              return x.id !== tempId;
            });
          });
          return;
        }
        loadEntries();
        setShowAdd(false);
      }).catch(function (e) {
        setEntrySaving(false);
        setEntrySaveErr('Erro de ligação: ' + (e && e.message || String(e)));
        setEntries(function (p) {
          return p.filter(function (x) {
            return x.id !== tempId;
          });
        });
      });
    },
    onClose: function onClose() {
      setShowAdd(false);
      setEntrySaveErr('');
    },
    saveErr: entrySaveErr,
    saving: entrySaving,
    tipos: tipos,
    projList: projList,
    calcHoras: calcHoras,
    H: H
  }), editEntry && /*#__PURE__*/React.createElement(EntryFormModal, {
    editData: editEntry,
    onSave: function onSave(_ref10) {
      var tipo = _ref10.tipo,
        proj = _ref10.proj,
        hi = _ref10.hi,
        hf = _ref10.hf,
        horas = _ref10.horas,
        morada = _ref10.morada;
      var prevEntry = entries.find(function (x) {
        return x.id === editEntry.id;
      });
      setEntries(function (p) {
        return p.map(function (x) {
          return x.id === editEntry.id ? _objectSpread(_objectSpread({}, x), {}, {
            tipo: tipo,
            proj: proj,
            hi: hi,
            hf: hf,
            horas: horas,
            morada: morada
          }) : x;
        });
      });
      if (!window.supabaseClient) {
        setEntrySaveErr('Sem ligação ao servidor — não foi guardado.');
        if (prevEntry) {
          setEntries(function (p) {
            return p.map(function (x) {
              return x.id === editEntry.id ? prevEntry : x;
            });
          });
        }
        return;
      }
      setEntrySaving(true);
      setEntrySaveErr('');
      window.supabaseClient.from('horas_entries').update({
        tipo: tipo,
        project: proj,
        start_time: hi,
        end_time: hf,
        hours: horas,
        address: morada || null
      }).eq('id', editEntry.id).then(function (res) {
        setEntrySaving(false);
        if (res.error) {
          setEntrySaveErr('Erro ao guardar: ' + res.error.message);
          if (prevEntry) {
            setEntries(function (p) {
              return p.map(function (x) {
                return x.id === editEntry.id ? prevEntry : x;
              });
            });
          }
          return;
        }
        loadEntries();
        setEditEntry(null);
      }).catch(function (e) {
        setEntrySaving(false);
        setEntrySaveErr('Erro de ligação: ' + (e && e.message || String(e)));
        if (prevEntry) {
          setEntries(function (p) {
            return p.map(function (x) {
              return x.id === editEntry.id ? prevEntry : x;
            });
          });
        }
      });
    },
    onClose: function onClose() {
      setEditEntry(null);
      setEntrySaveErr('');
    },
    saveErr: entrySaveErr,
    saving: entrySaving,
    tipos: tipos,
    projList: projList,
    calcHoras: calcHoras,
    H: H
  }), showMenu && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 400,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      return setShowMenu(false);
    },
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.4)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      background: H.surface,
      borderRadius: '24px 24px 0 0',
      border: "2px solid ".concat(H.gold),
      borderBottom: 'none',
      padding: '20px 16px 32px',
      maxHeight: '85vh',
      overflowY: 'auto',
      boxShadow: '0 -8px 40px rgba(0,0,0,0.2)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16
    }
  }, "\uD83D\uDCC5"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: H.gold,
      fontWeight: 800,
      fontSize: 12,
      letterSpacing: '1.5px',
      textTransform: 'uppercase'
    }
  }, "Calend\xE1rio & Stats")), (function () {
    var calYear = menuMonth.getFullYear();
    var calMonthIdx = menuMonth.getMonth();
    var MESES_CAL = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    var calMonthLabel = MESES_CAL[calMonthIdx] + ' ' + calYear;
    var calDaysInMonth = new Date(calYear, calMonthIdx + 1, 0).getDate();
    var calFirstDowMon = (new Date(calYear, calMonthIdx, 1).getDay() + 6) % 7;
    var calWeeks = [];
    var calDay = 1 - calFirstDowMon;
    while (calDay <= calDaysInMonth) {
      var week = [];
      for (var wi = 0; wi < 7; wi++) {
        week.push(calDay >= 1 && calDay <= calDaysInMonth ? calDay : null);
        calDay++;
      }
      calWeeks.push(week);
    }
    // Cores e ícones por tipo de dia livre
    var tipoCores = {
      ferias:      { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)', color: '#3B82F6', icon: '✈️' },
      ferias_extra:{ bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)', color: '#EF4444', icon: '✈️' },
      komp:        { bg: 'rgba(20,184,166,0.15)', border: 'rgba(20,184,166,0.4)', color: '#14B8A6', icon: '🔁' },
      komp_extra:  { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)', color: '#EF4444', icon: '🔁' },
      feriado:     { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.4)', color: '#A855F7', icon: '🎌' },
      livre:       { bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.4)',  color: '#22C55E', icon: '🌿' },
      sexta:       { bg: 'rgba(184,150,46,0.1)',  border: 'rgba(184,150,46,0.3)', color: H.gold,    icon: '🗓' }
    };
    return /*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }
      },
        /*#__PURE__*/React.createElement("button", {
          onClick: function () { setMenuMonth(function (m) { return new Date(m.getFullYear(), m.getMonth() - 1, 1); }); },
          style: { width: 32, height: 32, borderRadius: '50%', border: "1px solid ".concat(H.border), background: H.surface2, color: H.gold, fontSize: 16, fontWeight: 700, cursor: 'pointer' }
        }, "‹"),
        /*#__PURE__*/React.createElement("p", { style: { color: H.gold, fontWeight: 800, fontSize: 16 } }, calMonthLabel),
        /*#__PURE__*/React.createElement("button", {
          onClick: function () { setMenuMonth(function (m) { return new Date(m.getFullYear(), m.getMonth() + 1, 1); }); },
          style: { width: 32, height: 32, borderRadius: '50%', border: "1px solid ".concat(H.border), background: H.surface2, color: H.gold, fontSize: 16, fontWeight: 700, cursor: 'pointer' }
        }, "›")
      ),
      /*#__PURE__*/React.createElement("div", { style: { marginBottom: 16 } },
        /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '28px repeat(7,1fr)', gap: 2, marginBottom: 6 } },
          /*#__PURE__*/React.createElement("div", null),
          ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(function (d) {
            return /*#__PURE__*/React.createElement("div", { key: d, style: { textAlign: 'center', fontSize: 10, fontWeight: 700, color: H.gold } }, d);
          })
        ),
        calWeeks.map(function (week, wi) {
          var firstReal = week.find(function (d) { return d !== null; });
          var kwN = getKW(new Date(calYear, calMonthIdx, firstReal, 12));
          return /*#__PURE__*/React.createElement("div", { key: wi, style: { display: 'grid', gridTemplateColumns: '28px repeat(7,1fr)', gap: 2, marginBottom: 4 } },
            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              /*#__PURE__*/React.createElement("span", { style: { fontSize: 9, color: H.muted, fontWeight: 600 } }, kwN)
            ),
            week.map(function (d, di) {
              if (d === null) return /*#__PURE__*/React.createElement("div", { key: 'e'+di });
              var dStr = "".concat(calYear, "-").concat(String(calMonthIdx+1).padStart(2,'0'), "-").concat(String(d).padStart(2,'0'));
              var isToday = dStr === fmt(today);
              var autoEntry = dedupedEntries.find(function (e) { return e.date === dStr && e.isAuto; });
              var dlTipoDay = autoEntry ? autoEntry.dlTipo : null;
              var hasWork = dedupedEntries.some(function (e) { return e.date === dStr && !e.isAuto; });
              var tc = dlTipoDay ? tipoCores[dlTipoDay] : null;
              var isCalPopup = calPopupDate === dStr;
              return /*#__PURE__*/React.createElement("div", { key: d, style: { position: 'relative' } },
                /*#__PURE__*/React.createElement("div", {
                  onClick: function () {
                    if (isCalPopup) { setCalPopupDate(null); return; }
                    var dow = new Date(dStr+'T12:00:00').getDay();
                    if (dow === 0 || dow === 6) { setCurDate(new Date(dStr+'T12:00:00')); setShowMenu(false); return; }
                    setCalPopupDate(dStr);
                  },
                  style: {
                    textAlign: 'center', padding: '4px 1px', borderRadius: 7, cursor: 'pointer',
                    background: isToday ? H.gold : tc ? tc.bg : 'transparent',
                    border: isToday ? 'none' : tc ? "1px solid ".concat(tc.border) : hasWork ? "1px solid rgba(184,150,46,0.4)" : 'none'
                  }
                },
                  /*#__PURE__*/React.createElement("span", { style: { fontSize: 11, fontWeight: isToday || tc ? 800 : 400, color: isToday ? '#fff' : tc ? tc.color : H.text, display: 'block' } }, d),
                  tc && !isToday && /*#__PURE__*/React.createElement("span", { style: { fontSize: 8, display: 'block', lineHeight: 1 } }, tc.icon),
                  !tc && hasWork && !isToday && /*#__PURE__*/React.createElement("div", { style: { width: 4, height: 4, background: H.gold, borderRadius: '50%', margin: '1px auto 0' } })
                ),
                isCalPopup && /*#__PURE__*/React.createElement("div", {
                  style: { position: 'absolute', top: '110%', left: '50%', transform: 'translateX(-50%)', zIndex: 99, background: H.surface, border: "1px solid ".concat(H.border), borderRadius: 12, padding: 8, minWidth: 130, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }
                },
                  /*#__PURE__*/React.createElement("p", { style: { fontSize: 10, color: H.muted, fontWeight: 700, marginBottom: 6, textAlign: 'center' } }, dStr.slice(5).replace('-','/')),
                  autoEntry ? [
                    { tipo: '_remover', label: '🗑 Remover ' + (autoEntry.tipo || '') },
                    { tipo: '_ir',      label: '📅 Ver dia' }
                  ].map(function (opt) {
                    return /*#__PURE__*/React.createElement("button", {
                      key: opt.tipo,
                      onClick: function () {
                        setCalPopupDate(null);
                        if (opt.tipo === '_ir') { setCurDate(new Date(dStr+'T12:00:00')); setShowMenu(false); return; }
                        // Remover a entrada automática deste dia
                        setEntries(function (p) { return p.filter(function (e) { return !(e.date === dStr && e.isAuto); }); });
                        setDiasLivres(function (p) { return p.filter(function (dl) { return dl.date !== dStr; }); });
                        if (window.supabaseClient) {
                          window.supabaseClient.from('horas_entries').delete().eq('data', dStr).eq('is_auto', true).then(function () { loadEntries(); }).catch(function () {});
                        }
                      },
                      style: { display: 'block', width: '100%', background: 'none', border: 'none', color: opt.tipo === '_remover' ? H.red : H.text, fontSize: 12, padding: '5px 8px', textAlign: 'left', cursor: 'pointer', borderRadius: 7 }
                    }, opt.label);
                  }) : [
                    { tipo: 'ferias', label: '✈️ Férias' },
                    { tipo: 'komp',   label: '🔁 Komp.' },
                    { tipo: 'feriado',label: '🎌 Feriado' },
                    { tipo: 'livre',  label: '🌿 Dia livre' },
                    { tipo: '_ir',    label: '📅 Ver dia' }
                  ].map(function (opt) {
                    return /*#__PURE__*/React.createElement("button", {
                      key: opt.tipo,
                      onClick: function () {
                        setCalPopupDate(null);
                        if (opt.tipo === '_ir') { setCurDate(new Date(dStr+'T12:00:00')); setShowMenu(false); return; }
                        addDiasLivresRange(dStr, dStr, opt.tipo);
                      },
                      style: { display: 'block', width: '100%', background: 'none', border: 'none', color: H.text, fontSize: 12, padding: '5px 8px', textAlign: 'left', cursor: 'pointer', borderRadius: 7 }
                    }, opt.label);
                  })
                )
              );
            })
          );
        })
      )
    );
  })(), /*#__PURE__*/React.createElement("p", {
    style: {
      color: H.gold,
      fontWeight: 800,
      fontSize: 11,
      letterSpacing: '1px',
      textTransform: 'uppercase',
      marginBottom: 10
    }
  }, "Horas por dia"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, sortedDates.slice(0, 8).map(function (date) {
    var h = grouped[date].reduce(function (s, e) {
      return s + e.horas;
    }, 0);
    var metaDoDia = metaDiaPara(date);
    var over = h > metaDoDia;
    var redPct = metaDoDia > 0 ? Math.min(100, metaDoDia / h * 100) : 0;
    var pctBar = metaDoDia > 0 ? Math.min(100, h / metaDoDia * 100) : 100;
    return /*#__PURE__*/React.createElement("div", {
      key: date,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: H.muted,
        fontWeight: 600,
        width: 58,
        flexShrink: 0
      }
    }, new Date(date + 'T12:00:00').toLocaleDateString('pt-PT', {
      weekday: 'short',
      day: '2-digit'
    }).toUpperCase()), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 12,
        background: H.surface2,
        borderRadius: 6,
        overflow: 'hidden',
        border: "1px solid ".concat(H.border)
      }
    }, over ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        height: '100%'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: "".concat(redPct, "%"),
        background: '#EF4444'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        background: '#22C55E'
      }
    })) : /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        width: "".concat(pctBar, "%"),
        background: '#3B82F6',
        borderRadius: 6
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: over ? H.green : H.gold,
        fontWeight: 800,
        width: 34,
        textAlign: 'right'
      }
    }, h.toFixed(1), "h"));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 8,
      marginBottom: 16
    }
  }, [{
    l: 'Hoje',
    v: "".concat(horasHoje.toFixed(1), "h"),
    c: H.gold
  }, {
    l: 'Semana',
    v: "".concat(horasSem.toFixed(1), "h"),
    c: H.gold
  }, {
    l: 'Mês',
    v: "".concat(horasMes.toFixed(1), "h"),
    c: H.gold
  }, {
    l: 'Até Hoje',
    v: "".concat(horasAteHoje.toFixed(1), "h"),
    c: H.gold
  }, {
    l: 'Saldo',
    v: "".concat(saldo >= 0 ? '+' : '').concat(saldo.toFixed(1), "h"),
    c: saldo >= 0 ? H.green : H.red
  }, {
    l: 'Total',
    v: "".concat(saldo + totalJanAbrSaldo >= 0 ? '+' : '').concat((saldo + totalJanAbrSaldo).toFixed(1), "h"),
    c: saldo + totalJanAbrSaldo >= 0 ? H.green : H.red
  }].map(function (s) {
    return /*#__PURE__*/React.createElement("div", {
      key: s.l,
      style: {
        background: H.surface2,
        borderRadius: 14,
        padding: '10px 6px',
        border: "1px solid ".concat(H.border),
        textAlign: 'center',
        minWidth: 0,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: H.muted,
        fontSize: 9,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.2px',
        whiteSpace: 'nowrap'
      }
    }, s.l), /*#__PURE__*/React.createElement("p", {
      style: {
        color: s.c,
        fontSize: 18,
        fontWeight: 900,
        marginTop: 4,
        whiteSpace: 'nowrap'
      }
    }, s.v));
  })), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowMenu(false);
    },
    style: {
      width: '100%',
      background: 'none',
      border: "1px solid ".concat(H.border),
      borderRadius: 14,
      padding: '13px',
      color: H.gold,
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "\u2715 Fechar"))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: H.surface,
      borderTop: "1px solid ".concat(H.border),
      padding: '10px 0 18px',
      display: 'flex',
      justifyContent: 'space-around',
      zIndex: 200,
      boxShadow: '0 -2px 12px rgba(0,0,0,0.06)'
    }
  }, [{
    icon: '⏱️',
    label: 'Registo'
  }, {
    icon: '📁',
    label: 'Projetos'
  }, {
    icon: '📊',
    label: 'Gráficos'
  }, {
    icon: '⚙️',
    label: 'Def.'
  }].map(function (n) {
    return /*#__PURE__*/React.createElement("button", {
      key: n.label,
      onClick: function onClick() {
        return setSubNav(n.label);
      },
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        padding: '0 12px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 22,
        color: subNav === n.label ? H.gold : H.muted
      }
    }, n.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        color: subNav === n.label ? H.gold : H.muted
      }
    }, n.label));
  })));
}

// ── AGENDA PRO ──────────────────────────────────────────────────────
