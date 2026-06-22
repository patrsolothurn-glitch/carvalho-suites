function useFont() {
  (0, _react.useEffect)(function () {
    if (document.getElementById('cs-f')) return;
    var l = document.createElement('link');
    l.id = 'cs-f';
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap';
    document.head.appendChild(l);
  }, []);
}

// ── SHARED UI ───────────────────────────────────────────────────────
var GoldBtn = function GoldBtn(_ref) {
  var onClick = _ref.onClick,
    children = _ref.children,
    _ref$style = _ref.style,
    style = _ref$style === void 0 ? {} : _ref$style;
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: _objectSpread({
      background: "linear-gradient(135deg,".concat(T.gold, ",").concat(T.goldL, ")"),
      border: 'none',
      borderRadius: 14,
      padding: '14px 20px',
      color: T.bg,
      fontSize: 15,
      fontWeight: 800,
      cursor: 'pointer'
    }, style)
  }, children);
};
var Card = function Card(_ref2) {
  var children = _ref2.children,
    _ref2$style = _ref2.style,
    style = _ref2$style === void 0 ? {} : _ref2$style,
    onClick = _ref2.onClick;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: _objectSpread({
      background: T.surface,
      borderRadius: 18,
      border: "1px solid ".concat(T.goldBrd)
    }, style)
  }, children);
};
var SwipeCard = function SwipeCard(_ref2b) {
  var children = _ref2b.children,
    _ref2b$style = _ref2b.style,
    style = _ref2b$style === void 0 ? {} : _ref2b$style,
    onClick = _ref2b.onClick,
    onDismiss = _ref2b.onDismiss,
    onDelete = _ref2b.onDelete;
  var _useState = (0, _react.useState)(0),
    _useState2 = _slicedToArray(_useState, 2),
    dragX = _useState2[0],
    setDragX = _useState2[1];
  var startX = (0, _react.useRef)(null);
  var dragging = (0, _react.useRef)(false);
  var THRESHOLD_DONE = -70;
  var THRESHOLD_DELETE = 70;
  var onTouchStart = function onTouchStart(e) {
    startX.current = e.touches[0].clientX;
    dragging.current = true;
  };
  var onTouchMove = function onTouchMove(e) {
    if (!dragging.current || startX.current === null) return;
    var dx = e.touches[0].clientX - startX.current;
    setDragX(Math.max(-110, Math.min(110, dx)));
  };
  var onTouchEnd = function onTouchEnd() {
    dragging.current = false;
    if (dragX < THRESHOLD_DONE) {
      setDragX(-400);
      setTimeout(function () { if (onDismiss) onDismiss(); }, 180);
    } else if (dragX > THRESHOLD_DELETE) {
      setDragX(0);
      if (onDelete) onDelete();
    } else {
      setDragX(0);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: { position: 'relative', overflow: 'hidden', borderRadius: 18 }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute', top: 0, left: 0, bottom: 0, width: 110,
      background: 'rgba(220,38,38,0.18)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', color: '#EF4444', fontWeight: 800, fontSize: 13
    }
  }, "🗑️ Apagar"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute', top: 0, right: 0, bottom: 0, width: 110,
      background: 'rgba(34,197,94,0.18)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', color: '#22C55E', fontWeight: 800, fontSize: 13
    }
  }, "✓ Feito"), /*#__PURE__*/React.createElement(Card, {
    onClick: dragX === 0 ? onClick : undefined,
    style: _objectSpread({
      transform: "translateX(".concat(dragX, "px)"),
      transition: dragging.current ? 'none' : 'transform 0.18s ease',
      position: 'relative'
    }, style)
  }, /*#__PURE__*/React.createElement("div", {
    onTouchStart: onTouchStart,
    onTouchMove: onTouchMove,
    onTouchEnd: onTouchEnd,
    style: { display: 'flex', width: '100%', alignItems: 'center' }
  }, /*#__PURE__*/React.createElement("div", { style: { flex: 1 } }, children),
    onDelete && /*#__PURE__*/React.createElement("button", {
      onClick: function onClick(e) {
        e.stopPropagation();
        if (onDelete) onDelete();
      },
      style: {
        background: 'none', border: 'none', color: '#EF4444', fontSize: 16,
        padding: '0 4px', cursor: 'pointer', alignSelf: 'center'
      }
    }, "🗑️"),
    /*#__PURE__*/React.createElement("button", {
      onClick: function onClick(e) {
        e.stopPropagation();
        setDragX(-400);
        setTimeout(function () { if (onDismiss) onDismiss(); }, 180);
      },
      style: {
        background: 'none', border: 'none', color: T.muted, fontSize: 18,
        padding: '0 6px', cursor: 'pointer', alignSelf: 'center'
      }
    }, "✓"))));
};
var TopBar = function TopBar(_ref3) {
  var onBack = _ref3.onBack,
    title = _ref3.title,
    _ref3$right = _ref3.right,
    right = _ref3$right === void 0 ? null : _ref3$right;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.surface,
      borderBottom: "1px solid ".concat(T.goldBrd),
      padding: '13px 18px',
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
      gap: 12
    }
  }, onBack && /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      background: 'none',
      border: 'none',
      color: T.gold,
      fontSize: 26,
      cursor: 'pointer',
      lineHeight: 1,
      padding: 0
    }
  }, "\u2039"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 17
    }
  }, title)), right);
};
var BottomNav = function BottomNav(_ref4) {
  var active = _ref4.active,
    onNav = _ref4.onNav;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: T.surface,
      borderTop: "1px solid ".concat(T.goldBrd),
      padding: '10px 0 18px',
      display: 'flex',
      justifyContent: 'space-around',
      zIndex: 200
    }
  }, [['🏠', 'Início'], ['📅', 'Hoje'], ['⚙️', 'Definições'], ['👤', 'Perfil']].map(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2),
      icon = _ref6[0],
      label = _ref6[1];
    return /*#__PURE__*/React.createElement("button", {
      key: label,
      onClick: function onClick() {
        return onNav(label);
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
        color: active === label ? T.gold : T.muted
      }
    }, icon), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        color: active === label ? T.gold : T.muted
      }
    }, label));
  }));
};
var Pill = function Pill(_ref7) {
  var children = _ref7.children,
    _ref7$color = _ref7.color,
    color = _ref7$color === void 0 ? T.gold : _ref7$color;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      background: "rgba(201,168,71,0.12)",
      borderRadius: 20,
      padding: '3px 10px',
      border: "1px solid ".concat(T.goldBrd)
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: color
    }
  }, children));
};

// ══════════════════════════════════════════════════════════════════
// APP SCREENS
// ══════════════════════════════════════════════════════════════════

// ── HORASPRO ────────────────────────────────────────────────────────
