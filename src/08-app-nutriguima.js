function NutriguimaApp(_ref29) {
  var onBack = _ref29.onBack;
  var _useState121 = (0, _react.useState)({}),
    _useState122 = _slicedToArray(_useState121, 2),
    cart = _useState122[0],
    setCart = _useState122[1];
  var _useState123 = (0, _react.useState)(''),
    _useState124 = _slicedToArray(_useState123, 2),
    search = _useState124[0],
    setSearch = _useState124[1];
  var _useState125 = (0, _react.useState)('loja'),
    _useState126 = _slicedToArray(_useState125, 2),
    _rawTab = _useState126[0],
    _setTab = _useState126[1]; // loja | stock
  var tab = _rawTab;
  var setTab = function setTab(v) { sessionStorage.setItem('nutri_tab', v); _setTab(v); };
  var _useState127 = (0, _react.useState)({
      1: 5,
      2: 1,
      3: 0,
      4: 2,
      5: 8,
      6: 1
    }),
    _useState128 = _slicedToArray(_useState127, 2),
    stock = _useState128[0],
    setStock = _useState128[1];
  var _useState129 = (0, _react.useState)(null),
    _useState130 = _slicedToArray(_useState129, 2),
    editStock = _useState130[0],
    setEditStock = _useState130[1];
  var _useState131 = (0, _react.useState)(false),
    _useState132 = _slicedToArray(_useState131, 2),
    showAddProd = _useState132[0],
    setShowAddProd = _useState132[1];
  var _useStateAddErr = (0, _react.useState)(''),
    _useStateAddErr2 = _slicedToArray(_useStateAddErr, 2),
    addErr = _useStateAddErr2[0],
    setAddErr = _useStateAddErr2[1];
  var _useStateAddSaving = (0, _react.useState)(false),
    _useStateAddSaving2 = _slicedToArray(_useStateAddSaving, 2),
    addSaving = _useStateAddSaving2[0],
    setAddSaving = _useStateAddSaving2[1];
  var novoNomeRef = React.useRef(null);
  var novoPrecoRef = React.useRef(null);
  var _useState133 = (0, _react.useState)('💊'),
    _useState134 = _slicedToArray(_useState133, 2),
    novoEmoji = _useState134[0],
    setNovoEmoji = _useState134[1];
  var _useState135 = (0, _react.useState)('Proteína'),
    _useState136 = _slicedToArray(_useState135, 2),
    novoCat = _useState136[0],
    setNovoCat = _useState136[1];
  var novoQtdRef = React.useRef(null);
  var _useState137 = (0, _react.useState)([{
      id: 1,
      name: 'Whey Protein 1kg',
      price: 24.9,
      emoji: '🥛',
      cat: 'Proteína'
    }, {
      id: 2,
      name: 'Creatina 300g',
      price: 12.9,
      emoji: '⚡',
      cat: 'Força'
    }, {
      id: 3,
      name: 'Vitamina C 1000mg',
      price: 8.9,
      emoji: '🍊',
      cat: 'Vitaminas'
    }, {
      id: 4,
      name: 'Ómega 3',
      price: 14.9,
      emoji: '🐟',
      cat: 'Saúde'
    }, {
      id: 5,
      name: 'Pack Ganho Muscular',
      price: 49.9,
      emoji: '💪',
      cat: 'Packs'
    }, {
      id: 6,
      name: 'BCAA 300g',
      price: 18.9,
      emoji: '🔥',
      cat: 'Força'
    }]),
    _useState138 = _slicedToArray(_useState137, 2),
    products = _useState138[0],
    setProducts = _useState138[1];
  var loadNutriData = function loadNutriData() {
    if (!window.supabaseClient) return;
    window.supabaseClient.from('nutri_products').select('*').then(function (res) {
      if (res.error) return;
      if (res.data && res.data.length > 0) {
        setProducts(res.data.map(function (row) {
          return {
            id: row.id,
            name: row.name,
            price: Number(row.price),
            emoji: row.emoji,
            cat: row.cat
          };
        }));
        var st = {};
        res.data.forEach(function (row) {
          st[row.id] = row.stock || 0;
        });
        setStock(st);
      } else {
        products.forEach(function (p) {
          window.supabaseClient.from('nutri_products').insert({
            id: p.id,
            name: p.name,
            price: p.price,
            emoji: p.emoji,
            cat: p.cat,
            stock: stock[p.id] || 0
          }).then(function () { }).catch(function () {});
        });
      }
    }).catch(function () {});
  };
  (0, _react.useEffect)(function () {
    loadNutriData();
    var savedTab = sessionStorage.getItem('nutri_tab');
    if (savedTab) { _setTab(savedTab); }
    if (sessionStorage.getItem('nutri_nome') !== null && sessionStorage.getItem('nutri_nome') !== '') { setShowAddProd(true); }
  }, []);
  (0, _react.useEffect)(function () {
    if (showAddProd) {
      if (novoNomeRef.current) novoNomeRef.current.value = sessionStorage.getItem('nutri_nome') || '';
      if (novoPrecoRef.current) novoPrecoRef.current.value = sessionStorage.getItem('nutri_preco') || '';
      var savedEmoji = sessionStorage.getItem('nutri_emoji');
      if (savedEmoji) setNovoEmoji(savedEmoji);
      var savedCat = sessionStorage.getItem('nutri_cat');
      if (savedCat) setNovoCat(savedCat);
    }
  }, [showAddProd]);
  var addProduto = function addProduto() {
    var _novoNomeRef$current, _novoPrecoRef$current;
    var name = (((_novoNomeRef$current = novoNomeRef.current) === null || _novoNomeRef$current === void 0 ? void 0 : _novoNomeRef$current.value) || '').trim();
    var _rawPreco = ((_novoPrecoRef$current = novoPrecoRef.current) === null || _novoPrecoRef$current === void 0 ? void 0 : _novoPrecoRef$current.value) || '0'; var price = parseFloat(_rawPreco.replace(',', '.'));
    if (!name) { setAddErr('Preenche o nome do produto.'); return; }
    if (isNaN(price) || price <= 0) { setAddErr('Preenche um preço válido (ex: 12.90).'); return; }
    var qty = Math.max(0, parseInt((novoQtdRef.current && novoQtdRef.current.value) || '0') || 0);
    setAddErr('');
    setAddSaving(true);
    var id = Date.now();
    if (window.supabaseClient) {
      window.supabaseClient.from('nutri_products').insert({
        id: id,
        name: name,
        price: price,
        emoji: novoEmoji,
        cat: novoCat,
        stock: qty
      }).select().then(function (res) {
        setAddSaving(false);
        if (res.error) { setAddErr('Erro ao guardar: ' + (res.error.message || 'tenta novamente.')); return; }
        setProducts(function (p) { return [].concat(_toConsumableArray(p), [{ id: id, name: name, price: price, emoji: novoEmoji, cat: novoCat }]); });
        setStock(function (s) { return _objectSpread(_objectSpread({}, s), {}, _defineProperty({}, id, qty)); });
        setAddErr('');
        setNovoEmoji('💊');
        setNovoCat('Proteína');
        if (novoQtdRef.current) novoQtdRef.current.value = '0';
        sessionStorage.removeItem('nutri_nome');
        sessionStorage.removeItem('nutri_preco');
        sessionStorage.removeItem('nutri_emoji');
        sessionStorage.removeItem('nutri_cat');
        if (novoNomeRef.current) novoNomeRef.current.value = '';
        if (novoPrecoRef.current) novoPrecoRef.current.value = '';
        setShowAddProd(false);
      }).catch(function (err) { setAddSaving(false); setAddErr('Erro de ligação. Tenta novamente.'); });
    } else {
      setAddSaving(false);
      setProducts(function (p) { return [].concat(_toConsumableArray(p), [{ id: id, name: name, price: price, emoji: novoEmoji, cat: novoCat }]); });
      setStock(function (s) { return _objectSpread(_objectSpread({}, s), {}, _defineProperty({}, id, qty)); });
      setAddErr('');
      setNovoEmoji('💊');
      setNovoCat('Proteína');
      if (novoQtdRef.current) novoQtdRef.current.value = '0';
      if (novoNomeRef.current) novoNomeRef.current.value = '';
      if (novoPrecoRef.current) novoPrecoRef.current.value = '';
      setShowAddProd(false);
    }
  };
  var removeProduto = function removeProduto(id) {
    setProducts(function (p) {
      return p.filter(function (x) {
        return x.id !== id;
      });
    });
    setStock(function (s) {
      var c = _objectSpread({}, s);
      delete c[id];
      return c;
    });
    if (window.supabaseClient) {
      window.supabaseClient.from('nutri_products').delete().eq('id', id).then(function () { }).catch(function () {});
    }
  };
  var filtered = products.filter(function (p) {
    return p.name.toLowerCase().includes(search.toLowerCase());
  });
  var totalItems = Object.values(cart).reduce(function (s, v) {
    return s + v;
  }, 0);
  var totalPrice = products.reduce(function (s, p) {
    return s + (cart[p.id] || 0) * p.price;
  }, 0);
  var stockColor = function stockColor(qty) {
    return qty === 0 ? '#DC2626' : qty <= 2 ? '#F97316' : '#16A34A';
  };
  var stockLabel = function stockLabel(qty) {
    return qty === 0 ? 'Sem stock' : qty <= 2 ? 'Stock baixo' : 'Em stock';
  };
  var stockBg = function stockBg(qty) {
    return qty === 0 ? 'rgba(220,38,38,0.1)' : qty <= 2 ? 'rgba(249,115,22,0.1)' : 'rgba(22,163,74,0.1)';
  };
  var N = {
    bg: '#09090E',
    surface: '#131319',
    surface2: '#1C1C26',
    gold: '#C9A847',
    goldL: '#E8C96C',
    text: '#F0EEE8',
    muted: '#7A7A90',
    border: 'rgba(201,168,71,0.2)',
    green: '#16A34A',
    red: '#DC2626'
  };
  var NCard = React.useMemo(function () {
    var _N = N;
    return function NCard(_ref30) {
      var children = _ref30.children,
        _ref30$style = _ref30.style,
        style = _ref30$style === void 0 ? {} : _ref30$style;
      return /*#__PURE__*/React.createElement("div", {
        style: _objectSpread({
          background: _N.surface,
          borderRadius: 16,
          border: "1px solid ".concat(_N.border)
        }, style)
      }, children);
    };
  }, []); // NCard estável — evita unmount/remount dos inputs ao mudar estado
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      background: N.bg,
      fontFamily: "'Inter',system-ui,sans-serif",
      color: N.text,
      paddingBottom: 80
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: N.surface,
      borderBottom: "1px solid ".concat(N.border),
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 200
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      background: 'none',
      border: 'none',
      color: N.gold,
      fontSize: 30,
      cursor: 'pointer',
      padding: 0,
      lineHeight: 1,
      width: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, "\u2039"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 900,
      fontSize: 18
    }
  }, "\uD83D\uDC8A Nutriguima")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "http://zumu.be/eb762cd1",
    target: "_blank",
    rel: "noreferrer",
    style: {
      background: "linear-gradient(135deg,".concat(N.gold, ",").concat(N.goldL, ")"),
      borderRadius: 12,
      padding: '7px 12px',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      boxShadow: "0 4px 12px rgba(201,168,71,0.35)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13
    }
  }, "\uD83D\uDED2"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: N.bg,
      fontSize: 12,
      fontWeight: 800
    }
  }, "Zumub")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22,
      color: N.gold
    }
  }, "\uD83D\uDED2"), totalItems > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: -4,
      right: -4,
      width: 16,
      height: 16,
      background: N.red,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      color: '#fff',
      fontWeight: 800
    }
  }, totalItems))))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 160,
      overflow: 'hidden',
      borderBottom: "2px solid ".concat(N.gold, "44")
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 400 160",
    xmlns: "http://www.w3.org/2000/svg",
    style: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "sky",
    x1: "0%",
    y1: "0%",
    x2: "0%",
    y2: "100%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#0A0418"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#1A0A35"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "castleGrad",
    x1: "0%",
    y1: "0%",
    x2: "0%",
    y2: "100%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#2A1F10"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#1A1208"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "goldGlow",
    x1: "0%",
    y1: "0%",
    x2: "100%",
    y2: "0%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#C9A847",
    stopOpacity: "0"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "50%",
    stopColor: "#C9A847",
    stopOpacity: "0.15"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#C9A847",
    stopOpacity: "0"
  }))), /*#__PURE__*/React.createElement("rect", {
    width: "400",
    height: "160",
    fill: "url(#sky)"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "340",
    cy: "30",
    r: "20",
    fill: "#F5E090",
    opacity: "0.15"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "340",
    cy: "30",
    r: "14",
    fill: "#F5E090",
    opacity: "0.25"
  }), [[20, 15], [60, 8], [90, 22], [130, 10], [170, 18], [200, 7], [250, 14], [290, 9], [360, 25], [380, 12]].map(function (pos, i) {
    return /*#__PURE__*/React.createElement("circle", {
      key: i,
      cx: pos[0],
      cy: pos[1],
      r: "1",
      fill: "#fff",
      opacity: "0.5"
    });
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "200",
    cy: "170",
    rx: "280",
    ry: "60",
    fill: "#0F0A05"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "40",
    y: "70",
    width: "30",
    height: "70",
    fill: "url(#castleGrad)",
    stroke: "#C9A84730",
    strokeWidth: "0.5"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "38",
    y: "65",
    width: "8",
    height: "12",
    fill: "#1A1208"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "50",
    y: "65",
    width: "8",
    height: "12",
    fill: "#1A1208"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "62",
    y: "65",
    width: "8",
    height: "12",
    fill: "#1A1208"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "52",
    y: "95",
    width: "12",
    height: "16",
    fill: "#C9A84720"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "70",
    y: "95",
    width: "60",
    height: "45",
    fill: "url(#castleGrad)",
    stroke: "#C9A84730",
    strokeWidth: "0.5"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "70",
    y: "90",
    width: "8",
    height: "10",
    fill: "#1A1208"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "83",
    y: "90",
    width: "8",
    height: "10",
    fill: "#1A1208"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "96",
    y: "90",
    width: "8",
    height: "10",
    fill: "#1A1208"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "109",
    y: "90",
    width: "8",
    height: "10",
    fill: "#1A1208"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "148",
    y: "40",
    width: "45",
    height: "100",
    fill: "url(#castleGrad)",
    stroke: "#C9A84740",
    strokeWidth: "0.5"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "146",
    y: "34",
    width: "10",
    height: "14",
    fill: "#1A1208"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "160",
    y: "34",
    width: "10",
    height: "14",
    fill: "#1A1208"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "174",
    y: "34",
    width: "10",
    height: "14",
    fill: "#1A1208"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "183",
    y: "34",
    width: "10",
    height: "14",
    fill: "#1A1208"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "163",
    y: "70",
    width: "14",
    height: "18",
    fill: "#C9A84740",
    rx: "3"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "163",
    y: "70",
    width: "14",
    height: "18",
    fill: "#C9A847",
    opacity: "0.2",
    rx: "3"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "193",
    y: "88",
    width: "65",
    height: "52",
    fill: "url(#castleGrad)",
    stroke: "#C9A84730",
    strokeWidth: "0.5"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "193",
    y: "83",
    width: "8",
    height: "10",
    fill: "#1A1208"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "206",
    y: "83",
    width: "8",
    height: "10",
    fill: "#1A1208"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "219",
    y: "83",
    width: "8",
    height: "10",
    fill: "#1A1208"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "232",
    y: "83",
    width: "8",
    height: "10",
    fill: "#1A1208"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "245",
    y: "83",
    width: "8",
    height: "10",
    fill: "#1A1208"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "258",
    y: "65",
    width: "35",
    height: "75",
    fill: "url(#castleGrad)",
    stroke: "#C9A84730",
    strokeWidth: "0.5"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "256",
    y: "60",
    width: "8",
    height: "11",
    fill: "#1A1208"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "268",
    y: "60",
    width: "8",
    height: "11",
    fill: "#1A1208"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "280",
    y: "60",
    width: "8",
    height: "11",
    fill: "#1A1208"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "266",
    y: "88",
    width: "11",
    height: "14",
    fill: "#C9A84720"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "310",
    y: "85",
    width: "28",
    height: "55",
    fill: "url(#castleGrad)",
    stroke: "#C9A84730",
    strokeWidth: "0.5"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "309",
    y: "80",
    width: "7",
    height: "10",
    fill: "#1A1208"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "319",
    y: "80",
    width: "7",
    height: "10",
    fill: "#1A1208"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "329",
    y: "80",
    width: "7",
    height: "10",
    fill: "#1A1208"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "162",
    y: "110",
    width: "17",
    height: "30",
    fill: "#050204",
    rx: "2"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "140",
    width: "400",
    height: "20",
    fill: "url(#goldGlow)"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "100",
    width: "400",
    height: "60",
    fill: "url(#sky)",
    opacity: "0.6"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg,#FF6B00,#FFD700,#FF6B00)',
      padding: '2px',
      borderRadius: 18,
      boxShadow: '0 0 30px rgba(255,180,0,0.5)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(5,2,10,0.85)',
      borderRadius: 16,
      padding: '10px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 28
    }
  }, "\uD83D\uDE80"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 22,
      fontWeight: 900,
      background: 'linear-gradient(90deg,#FFD700,#FF8C00,#FFD700)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      letterSpacing: '1px',
      lineHeight: 1
    }
  }, "Nutriguima"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 10,
      color: 'rgba(255,180,0,0.7)',
      fontWeight: 600,
      letterSpacing: '2px',
      textTransform: 'uppercase'
    }
  }, "suplementos \xB7 guimar\xE3es")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 24
    }
  }, "\uD83D\uDCAA"))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 10,
      color: 'rgba(201,168,71,0.5)',
      marginTop: 6,
      letterSpacing: '1px'
    }
  }, "\uD83C\uDFF0 Guimar\xE3es \xB7 onde nasce a for\xE7a"))), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '12px 16px 0',
      background: N.surface,
      borderRadius: 14,
      padding: 4,
      border: "1px solid ".concat(N.border),
      display: 'flex'
    }
  }, [{
    v: 'loja',
    l: '🛒 Loja'
  }, {
    v: 'stock',
    l: '📦 Stock'
  }].map(function (t) {
    return /*#__PURE__*/React.createElement("button", {
      key: t.v,
      onClick: function onClick() {
        return setTab(t.v);
      },
      style: {
        flex: 1,
        background: tab === t.v ? "linear-gradient(135deg,".concat(N.gold, ",").concat(N.goldL, ")") : 'none',
        border: 'none',
        borderRadius: 11,
        padding: '9px',
        color: tab === t.v ? N.bg : N.muted,
        fontSize: 13,
        fontWeight: 800,
        cursor: 'pointer'
      }
    }, t.l);
  })), tab === 'loja' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: N.surface,
      border: "1px solid ".concat(N.border),
      borderRadius: 14,
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: N.muted,
      fontSize: 16
    }
  }, "\uD83D\uDD0D"), /*#__PURE__*/React.createElement("input", {
    value: search,
    onChange: function onChange(e) {
      return setSearch(e.target.value);
    },
    placeholder: "Pesquisar produtos...",
    style: {
      flex: 1,
      background: 'none',
      border: 'none',
      color: N.text,
      fontSize: 14,
      outline: 'none'
    }
  })), /*#__PURE__*/React.createElement(NCard, {
    style: {
      padding: '12px 14px',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 20
    }
  }, "\uD83C\uDF81"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: N.gold,
      fontWeight: 800,
      fontSize: 13
    }
  }, "10% desconto em tudo!"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: N.muted,
      fontSize: 11
    }
  }, "C\xF3digo: EB762CD1 \xB7 via Zumub.pt"))), /*#__PURE__*/React.createElement("a", {
    href: "http://zumu.be/eb762cd1",
    target: "_blank",
    rel: "noreferrer",
    style: {
      display: 'block',
      background: "linear-gradient(135deg,".concat(N.gold, ",").concat(N.goldL, ")"),
      border: 'none',
      borderRadius: 12,
      padding: '12px',
      color: N.bg,
      fontSize: 14,
      fontWeight: 800,
      textDecoration: 'none',
      textAlign: 'center',
      boxShadow: "0 4px 14px rgba(201,168,71,0.4)"
    }
  }, "\uD83D\uDED2 Ir para Zumub com desconto \u2192")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10
    }
  }, filtered.map(function (p) {
    var _stock$p$id;
    var qty = cart[p.id] || 0;
    var discounted = (p.price * 0.9).toFixed(2);
    var st = (_stock$p$id = stock[p.id]) !== null && _stock$p$id !== void 0 ? _stock$p$id : 5;
    return /*#__PURE__*/React.createElement(NCard, {
      key: p.id,
      style: {
        padding: '14px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 32
      }
    }, p.emoji)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
      style: {
        fontWeight: 700,
        fontSize: 13,
        color: N.text,
        lineHeight: 1.3
      }
    }, p.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: N.muted
      }
    }, p.cat)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        background: stockBg(st),
        borderRadius: 8,
        padding: '3px 8px',
        border: "1px solid ".concat(stockColor(st), "33")
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: stockColor(st),
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        color: stockColor(st)
      }
    }, stockLabel(st), " (", st, ")")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
      style: {
        color: N.green,
        fontWeight: 900,
        fontSize: 16
      }
    }, "\u20AC", discounted), /*#__PURE__*/React.createElement("p", {
      style: {
        color: N.muted,
        fontSize: 11,
        textDecoration: 'line-through'
      }
    }, "\u20AC", p.price.toFixed(2))), qty === 0 ? /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setCart(function (c) {
          return _objectSpread(_objectSpread({}, c), {}, _defineProperty({}, p.id, 1));
        });
      },
      style: {
        background: "linear-gradient(135deg,".concat(N.gold, ",").concat(N.goldL, ")"),
        border: 'none',
        borderRadius: 10,
        padding: '8px',
        color: N.bg,
        fontSize: 12,
        fontWeight: 800,
        cursor: 'pointer',
        opacity: st === 0 ? 0.4 : 1
      },
      disabled: st === 0
    }, st === 0 ? 'Sem stock' : 'Adicionar') : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: N.surface2,
        borderRadius: 10,
        padding: '4px 8px'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setCart(function (c) {
          return _objectSpread(_objectSpread({}, c), {}, _defineProperty({}, p.id, Math.max(0, qty - 1)));
        });
      },
      style: {
        background: 'none',
        border: 'none',
        color: N.gold,
        fontSize: 20,
        cursor: 'pointer',
        fontWeight: 700,
        padding: '0 4px'
      }
    }, "\u2212"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: N.gold,
        fontWeight: 800,
        fontSize: 14
      }
    }, qty), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setCart(function (c) {
          return _objectSpread(_objectSpread({}, c), {}, _defineProperty({}, p.id, qty + 1));
        });
      },
      style: {
        background: 'none',
        border: 'none',
        color: N.gold,
        fontSize: 20,
        cursor: 'pointer',
        fontWeight: 700,
        padding: '0 4px'
      }
    }, "\uFF0B")));
  })), totalItems > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 0'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "http://zumu.be/eb762cd1",
    target: "_blank",
    rel: "noreferrer",
    style: {
      display: 'block',
      background: "linear-gradient(135deg,".concat(N.gold, ",").concat(N.goldL, ")"),
      border: 'none',
      borderRadius: 14,
      padding: '15px',
      color: N.bg,
      fontSize: 15,
      fontWeight: 800,
      textDecoration: 'none',
      textAlign: 'center',
      boxShadow: "0 8px 24px rgba(201,168,71,0.4)"
    }
  }, "\uD83D\uDED2 Encomendar no Zumub \xB7 \u20AC", (totalPrice * 0.9).toFixed(2)))), tab === 'stock' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowAddProd(function (v) {
        return !v;
      });
    },
    style: {
      width: '100%',
      background: showAddProd ? "".concat(N.gold, "22") : "linear-gradient(135deg,".concat(N.gold, ",").concat(N.goldL, ")"),
      border: showAddProd ? "1px solid ".concat(N.gold) : 'none',
      borderRadius: 14,
      padding: '12px',
      color: showAddProd ? N.gold : N.bg,
      fontSize: 14,
      fontWeight: 800,
      cursor: 'pointer',
      marginBottom: 12
    }
  }, showAddProd ? '✕ Fechar' : '＋ Adicionar produto'), showAddProd && /*#__PURE__*/React.createElement(NCard, {
    style: {
      padding: '14px',
      marginBottom: 14,
      border: "1px solid ".concat(N.gold)
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: N.gold,
      fontWeight: 800,
      fontSize: 14,
      marginBottom: 12
    }
  }, "Novo produto"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: N.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 6
    }
  }, "\xCDcone"), /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap', maxHeight: 160, overflowY: 'auto', padding: '2px 0' }
  }, ['💊', '🧪', '💉', '🌿', '⚡', '🔥', '🥛', '🥩', '🥚', '🍫', '🥤', '🌱', '🍌', '🫐', '🍊', '🍋', '🥑', '🍎', '🏋️', '💪', '🏃', '🚴', '🧘', '🤸', '❤️', '🦴', '🧠', '🫁', '☀️', '🌙', '⚖️', '💤', '🏆', '🎯', '🐟', '💆'].map(function (e) {
    return /*#__PURE__*/React.createElement("button", {
      key: e,
      type: "button",
      onClick: function onClick() { setNovoEmoji(e); sessionStorage.setItem('nutri_emoji', e); },
      style: { background: novoEmoji === e ? "".concat(N.gold, "22") : N.surface2, border: "1px solid ".concat(novoEmoji === e ? N.gold : N.border), borderRadius: 10, padding: '7px', fontSize: 20, cursor: 'pointer', flexShrink: 0 }
    }, e);
  })), /*#__PURE__*/React.createElement("p", {
    style: { color: N.muted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }
  }, "Nome"), /*#__PURE__*/React.createElement("input", {
    ref: novoNomeRef,
    onChange: function onChange(e) { sessionStorage.setItem('nutri_nome', e.target.value); },
    autoComplete: "off",
    autoCorrect: "off",
    autoCapitalize: "words",
    spellCheck: "false",
    placeholder: "Ex: Magn\xE9sio 300mg",
    style: { width: '100%', background: N.surface2, border: "1px solid ".concat(N.border), borderRadius: 10, padding: '11px 12px', color: N.text, fontSize: 15, outline: 'none', marginBottom: 10, boxSizing: 'border-box' }
  }), /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', gap: 8, marginBottom: 8 }
  }, /*#__PURE__*/React.createElement("div", {
    style: { flex: 1 }
  }, /*#__PURE__*/React.createElement("p", {
    style: { color: N.muted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }
  }, "Pre\xE7o \u20AC"), /*#__PURE__*/React.createElement("input", {
    ref: novoPrecoRef,
    type: "text",
    inputMode: "decimal",
    onChange: function onChange(e) { sessionStorage.setItem('nutri_preco', e.target.value); },
    autoComplete: "off",
    autoCorrect: "off",
    spellCheck: "false",
    placeholder: "Ex: 15.90",
    style: { width: '100%', background: N.surface2, border: "1px solid ".concat(N.border), borderRadius: 10, padding: '11px 12px', color: N.text, fontSize: 15, outline: 'none', boxSizing: 'border-box' }
  })), /*#__PURE__*/React.createElement("div", {
    style: { width: 90 }
  }, /*#__PURE__*/React.createElement("p", {
    style: { color: N.muted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }
  }, "Qtd"), /*#__PURE__*/React.createElement("input", {
    ref: novoQtdRef,
    type: "text",
    inputMode: "numeric",
    defaultValue: "0",
    autoComplete: "off",
    style: { width: '100%', background: N.surface2, border: "1px solid ".concat(N.border), borderRadius: 10, padding: '11px 8px', color: N.text, fontSize: 15, outline: 'none', boxSizing: 'border-box', textAlign: 'center' }
  }))), /*#__PURE__*/React.createElement("div", {
    style: { marginBottom: 14 }
  }, /*#__PURE__*/React.createElement("p", {
    style: { color: N.muted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }
  }, "Categoria"), /*#__PURE__*/React.createElement("select", {
    value: novoCat,
    onChange: function onChange(e) { setNovoCat(e.target.value); sessionStorage.setItem('nutri_cat', e.target.value); },
    style: { width: '100%', background: N.surface2, border: "1px solid ".concat(N.border), borderRadius: 10, padding: '11px 12px', color: N.text, fontSize: 15, outline: 'none', boxSizing: 'border-box' }
  }, ['Proteína', 'Força', 'Vitaminas', 'Saúde', 'Packs', 'Outros'].map(function (c) {
    return /*#__PURE__*/React.createElement("option", {
      key: c
    }, c);
  }))), addErr && /*#__PURE__*/React.createElement("div", {
    style: { background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: 10, padding: '10px 12px', marginBottom: 10, color: '#f87171', fontSize: 13, fontWeight: 600 }
  }, "\u26A0\uFE0F ", addErr), /*#__PURE__*/React.createElement("button", {
    onClick: addProduto,
    disabled: addSaving,
    style: {
      width: '100%',
      background: addSaving ? N.surface2 : "linear-gradient(135deg,".concat(N.gold, ",").concat(N.goldL, ")"),
      border: addSaving ? "1px solid ".concat(N.border) : 'none',
      borderRadius: 12,
      padding: '12px',
      color: addSaving ? N.muted : N.bg,
      fontSize: 14,
      fontWeight: 800,
      cursor: addSaving ? 'not-allowed' : 'pointer',
      opacity: addSaving ? 0.7 : 1
    }
  }, addSaving ? '\u23F3 A guardar...' : "\u2713 Adicionar produto")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      marginBottom: 14,
      padding: '10px 14px',
      background: N.surface,
      borderRadius: 14,
      border: "1px solid ".concat(N.border)
    }
  }, [{
    c: '#DC2626',
    l: 'Sem stock (0)'
  }, {
    c: '#F97316',
    l: 'Baixo (1-2)'
  }, {
    c: '#16A34A',
    l: 'OK (3+)'
  }].map(function (s) {
    return /*#__PURE__*/React.createElement("div", {
      key: s.l,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: s.c,
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: N.muted,
        fontWeight: 600
      }
    }, s.l));
  })), products.map(function (p) {
    var _stock$p$id2;
    var st = (_stock$p$id2 = stock[p.id]) !== null && _stock$p$id2 !== void 0 ? _stock$p$id2 : 0;
    var isEdit = editStock === p.id;
    return /*#__PURE__*/React.createElement(NCard, {
      key: p.id,
      style: {
        padding: '14px 16px',
        marginBottom: 10,
        borderLeft: "4px solid ".concat(stockColor(st))
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 24
      }
    }, p.emoji), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontWeight: 700,
        fontSize: 14,
        color: N.text
      }
    }, p.name), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginTop: 3
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: stockColor(st)
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: stockColor(st)
      }
    }, stockLabel(st)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: N.muted
      }
    }, "\xB7 \u20AC", p.price.toFixed(2)))), isEdit ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setStock(function (s) {
          var next = Math.max(0, (s[p.id] || 0) - 1);
          if (window.supabaseClient) {
            window.supabaseClient.from('nutri_products').update({
              stock: next
            }).eq('id', p.id).then(function () { }).catch(function () {});
          }
          return _objectSpread(_objectSpread({}, s), {}, _defineProperty({}, p.id, next));
        });
      },
      style: {
        background: N.surface2,
        border: "1px solid ".concat(N.border),
        borderRadius: 8,
        width: 30,
        height: 30,
        color: N.gold,
        fontSize: 18,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700
      }
    }, "\u2212"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: N.gold,
        fontWeight: 900,
        fontSize: 20,
        minWidth: 24,
        textAlign: 'center'
      }
    }, st), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setStock(function (s) {
          var next = (s[p.id] || 0) + 1;
          if (window.supabaseClient) {
            window.supabaseClient.from('nutri_products').update({
              stock: next
            }).eq('id', p.id).then(function () { }).catch(function () {});
          }
          return _objectSpread(_objectSpread({}, s), {}, _defineProperty({}, p.id, next));
        });
      },
      style: {
        background: N.surface2,
        border: "1px solid ".concat(N.border),
        borderRadius: 8,
        width: 30,
        height: 30,
        color: N.gold,
        fontSize: 18,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700
      }
    }, "\uFF0B"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setEditStock(null);
      },
      style: {
        background: "".concat(N.gold, "22"),
        border: "1px solid ".concat(N.gold),
        borderRadius: 8,
        padding: '5px 10px',
        color: N.gold,
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, "\u2713"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return removeProduto(p.id);
      },
      style: {
        background: 'rgba(220,38,38,0.1)',
        border: '1px solid rgba(220,38,38,0.25)',
        borderRadius: 8,
        padding: '5px 9px',
        color: N.red,
        fontSize: 12,
        cursor: 'pointer'
      }
    }, "\uD83D\uDDD1")) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: stockColor(st),
        fontWeight: 900,
        fontSize: 24
      }
    }, st), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setEditStock(p.id);
      },
      style: {
        background: N.surface2,
        border: "1px solid ".concat(N.border),
        borderRadius: 8,
        padding: '6px 10px',
        color: N.muted,
        fontSize: 12,
        cursor: 'pointer'
      }
    }, "\u270F\uFE0F"))));
  })));
}
NutriguimaApp = React.memo(NutriguimaApp);

// ── AGENDA ESCOLAR ──────────────────────────────────────────────────
