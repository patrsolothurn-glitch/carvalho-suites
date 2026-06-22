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
