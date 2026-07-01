function SubbyApp(_ref) {
  var onBack = _ref.onBack;
  var S = {
    bg: '#0F0F14',
    surface: '#16161F',
    surface2: '#1C1C26',
    accent: '#6C5CE7',
    accentL: '#9C8FF0',
    text: '#F0EEE8',
    muted: '#7A7A90',
    border: 'rgba(108,92,231,0.25)',
    green: '#16A34A',
    red: '#DC2626'
  };
  var flagFromPais = function flagFromPais(codigo) {
    if (!codigo || codigo.length !== 2) return '';
    var c = codigo.toUpperCase();
    var codePoints = [c.charCodeAt(0) + 127397, c.charCodeAt(1) + 127397];
    return String.fromCodePoint.apply(String, codePoints);
  };
  var useState = React.useState;
  var useEffect = React.useEffect;
  var _useState = useState([]),
    subs = _useState[0],
    setSubs = _useState[1];
  var _useState2 = useState(true),
    loading = _useState2[0],
    setLoading = _useState2[1];
  var _useState3 = useState(false),
    showForm = _useState3[0],
    setShowForm = _useState3[1];
  var _useState4 = useState(null),
    editing = _useState4[0],
    setEditing = _useState4[1];
  var emptyForm = {
    icone: '🔔',
    nome: '',
    valor: '',
    moeda: 'CHF',
    ciclo: 'mensal',
    ciclo_dias: '',
    categoria: '',
    proxima_cobranca: '',
    lembrete_dias: 3,
    ativa: true,
    metodo_pagamento: 'debito',
    banco: '',
    cartao_ultimos4: '',
    pais: ''
  };
  var _useState5 = useState(emptyForm),
    form = _useState5[0],
    setForm = _useState5[1];
  var sendPush = function sendPush(title, body) {
    if (!window.supabaseClient) return;
    getEligibleProfileIds('subby', null).then(function (ids) {
      if (!ids.length) return;
      window.supabaseClient.functions.invoke('send-push', {
        body: {
          title: title,
          body: body,
          profileIds: ids
        }
      }).catch(function () {});
    });
  };
  var loadSubs = function loadSubs() {
    if (!window.supabaseClient) {
      setLoading(false);
      return;
    }
    window.supabaseClient.from('subscriptions').select('*').order('proxima_cobranca', {
      ascending: true
    }).then(function (res) {
      setLoading(false);
      if (res.error) {
        console.error('[Subby] erro ao carregar:', res.error);
        return;
      }
      setSubs(res.data || []);
    });
  };
  useEffect(function () {
    loadSubs();
  }, []);
  var calcMensal = function calcMensal(sub) {
    var v = Number(sub.valor) || 0;
    if (sub.ciclo === 'mensal') return v;
    if (sub.ciclo === 'anual') return v / 12;
    if (sub.ciclo === 'semanal') return v * 4.345;
    if (sub.ciclo === 'custom' && sub.ciclo_dias) return v / sub.ciclo_dias * 30;
    return 0;
  };
  var diasAte = function diasAte(dataStr) {
    var hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    var alvo = new Date(dataStr);
    return Math.ceil((alvo - hoje) / 86400000);
  };
  var fmtMoeda = function fmtMoeda(valor, moeda) {
    return Number(valor).toFixed(2) + ' ' + moeda;
  };
  var ativas = subs.filter(function (s) {
    return s.ativa;
  });
  var totalMensal = ativas.reduce(function (acc, s) {
    return acc + calcMensal(s);
  }, 0);
  var totalAnual = totalMensal * 12;
  var moedaRef = ativas[0] && ativas[0].moeda || 'CHF';
  var openNew = function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };
  var openEdit = function openEdit(sub) {
    setEditing(sub);
    setForm({
      icone: sub.icone || '🔔',
      nome: sub.nome || '',
      valor: sub.valor || '',
      moeda: sub.moeda || 'CHF',
      ciclo: sub.ciclo || 'mensal',
      ciclo_dias: sub.ciclo_dias || '',
      categoria: sub.categoria || '',
      proxima_cobranca: sub.proxima_cobranca || '',
      lembrete_dias: sub.lembrete_dias != null ? sub.lembrete_dias : 3,
      ativa: sub.ativa !== false,
      metodo_pagamento: sub.metodo_pagamento || 'debito',
      banco: sub.banco || '',
      cartao_ultimos4: sub.cartao_ultimos4 || '',
      pais: sub.pais || ''
    });
    setShowForm(true);
  };
  var closeForm = function closeForm() {
    setShowForm(false);
    setEditing(null);
  };
  var salvar = function salvar() {
    if (!form.nome.trim() || !form.proxima_cobranca) {
      window.alert('Preenche pelo menos Nome e Próxima cobrança.');
      return;
    }
    if (form.cartao_ultimos4 && !/^\d{4}$/.test(form.cartao_ultimos4.trim())) {
      window.alert('Os últimos dígitos do cartão devem ter exatamente 4 números.');
      return;
    }
    if (!window.supabaseClient) return;
    var payload = {
      icone: form.icone.trim() || '🔔',
      nome: form.nome.trim(),
      valor: parseFloat(form.valor) || 0,
      moeda: form.moeda.trim() || 'CHF',
      ciclo: form.ciclo,
      ciclo_dias: form.ciclo_dias ? parseInt(form.ciclo_dias, 10) : null,
      categoria: form.categoria.trim(),
      proxima_cobranca: form.proxima_cobranca,
      lembrete_dias: parseInt(form.lembrete_dias, 10) || 3,
      ativa: !!form.ativa,
      metodo_pagamento: form.metodo_pagamento,
      banco: form.banco.trim(),
      cartao_ultimos4: form.cartao_ultimos4.trim(),
      pais: form.pais.trim().toUpperCase()
    };
    if (editing) {
      payload.updated_at = new Date().toISOString();
      window.supabaseClient.from('subscriptions').update(payload).eq('id', editing.id).then(function (res) {
        if (res.error) {
          window.alert('Erro ao editar subscrição.');
          console.error(res.error);
          return;
        }
        sendPush('💳 Abo Kontrolle', payload.nome + ' foi atualizada');
        closeForm();
        loadSubs();
      });
    } else {
      window.supabaseClient.auth.getUser().then(function (authRes) {
        var uid = authRes && authRes.data && authRes.data.user && authRes.data.user.id;
        payload.user_id = uid;
        payload.data_inicio = form.proxima_cobranca;
        window.supabaseClient.from('subscriptions').insert(payload).then(function (res) {
          if (res.error) {
            window.alert('Erro ao criar subscrição.');
            console.error(res.error);
            return;
          }
          sendPush('💳 Abo Kontrolle', payload.nome + ' adicionada — próx. cobrança ' + payload.proxima_cobranca);
          closeForm();
          loadSubs();
        });
      });
    }
  };
  var marcarVisto = function marcarVisto(sub) {
    if (!window.supabaseClient) return;
    window.supabaseClient.from('subscriptions').update({
      visto_ate_data: sub.proxima_cobranca
    }).eq('id', sub.id).then(function (res) {
      if (res.error) {
        console.error(res.error);
        return;
      }
      loadSubs();
    });
  };
  var apagar = function apagar(sub) {
    if (!window.confirm('Apagar "' + sub.nome + '"?')) return;
    window.supabaseClient.from('subscriptions').delete().eq('id', sub.id).then(function (res) {
      if (res.error) {
        window.alert('Erro ao apagar subscrição.');
        console.error(res.error);
        return;
      }
      sendPush('💳 Abo Kontrolle', sub.nome + ' foi removida');
      loadSubs();
    });
  };
  var ordered = subs.slice().sort(function (a, b) {
    return (a.proxima_cobranca || '').localeCompare(b.proxima_cobranca || '');
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      background: S.bg,
      fontFamily: "'Inter',system-ui,sans-serif",
      color: S.text,
      paddingBottom: 80
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: S.surface,
      borderBottom: '1px solid ' + S.border,
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      position: 'sticky',
      top: 0,
      zIndex: 200
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      background: 'none',
      border: 'none',
      color: S.accentL,
      fontSize: 30,
      cursor: 'pointer',
      padding: 0,
      lineHeight: 1,
      width: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, "‹"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 900,
      fontSize: 18
    }
  }, "💳 Abo Kontrolle")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: S.surface,
      border: '1px solid ' + S.border,
      borderRadius: 14,
      padding: 12,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: S.muted
    }
  }, "Por mês"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 800,
      color: S.accentL
    }
  }, fmtMoeda(totalMensal, moedaRef))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: S.surface,
      border: '1px solid ' + S.border,
      borderRadius: 14,
      padding: 12,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: S.muted
    }
  }, "Por ano"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 800,
      color: S.accentL
    }
  }, fmtMoeda(totalAnual, moedaRef)))), /*#__PURE__*/React.createElement("button", {
    onClick: openNew,
    style: {
      width: '100%',
      padding: 13,
      fontSize: 15,
      border: 'none',
      borderRadius: 12,
      background: S.accent,
      color: '#fff',
      fontWeight: 700,
      marginBottom: 16
    }
  }, "+ Nova Subscrição"), showForm && /*#__PURE__*/React.createElement("div", {
    style: {
      background: S.surface,
      border: '1px solid ' + S.border,
      borderRadius: 14,
      padding: 14,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: form.icone,
    onChange: function (e) {
      setForm(Object.assign({}, form, {
        icone: e.target.value
      }));
    },
    placeholder: "🔔",
    style: {
      width: 54,
      textAlign: 'center',
      fontSize: 16,
      padding: 11,
      borderRadius: 10,
      border: '1px solid ' + S.border,
      background: S.surface2,
      color: S.text
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: form.nome,
    onChange: function (e) {
      setForm(Object.assign({}, form, {
        nome: e.target.value
      }));
    },
    placeholder: "Nome (Netflix...)",
    style: {
      flex: 1,
      fontSize: 16,
      padding: 11,
      borderRadius: 10,
      border: '1px solid ' + S.border,
      background: S.surface2,
      color: S.text
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: form.pais,
    onChange: function (e) {
      setForm(Object.assign({}, form, {
        pais: e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase()
      }));
    },
    placeholder: "PT",
    maxLength: 2,
    style: {
      width: 54,
      textAlign: 'center',
      fontSize: 16,
      padding: 11,
      borderRadius: 10,
      border: '1px solid ' + S.border,
      background: S.surface2,
      color: S.text,
      textTransform: 'uppercase'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "0.01",
    value: form.valor,
    onChange: function (e) {
      setForm(Object.assign({}, form, {
        valor: e.target.value
      }));
    },
    placeholder: "Valor",
    style: {
      flex: 1,
      fontSize: 16,
      padding: 11,
      borderRadius: 10,
      border: '1px solid ' + S.border,
      background: S.surface2,
      color: S.text
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: form.moeda,
    onChange: function (e) {
      setForm(Object.assign({}, form, {
        moeda: e.target.value
      }));
    },
    placeholder: "CHF",
    style: {
      width: 72,
      fontSize: 16,
      padding: 11,
      borderRadius: 10,
      border: '1px solid ' + S.border,
      background: S.surface2,
      color: S.text
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: form.ciclo,
    onChange: function (e) {
      setForm(Object.assign({}, form, {
        ciclo: e.target.value
      }));
    },
    style: {
      flex: 1,
      fontSize: 16,
      padding: 11,
      borderRadius: 10,
      border: '1px solid ' + S.border,
      background: S.surface2,
      color: S.text
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "mensal"
  }, "Mensal"), /*#__PURE__*/React.createElement("option", {
    value: "anual"
  }, "Anual"), /*#__PURE__*/React.createElement("option", {
    value: "semanal"
  }, "Semanal"), /*#__PURE__*/React.createElement("option", {
    value: "custom"
  }, "Custom (dias)")), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: form.ciclo_dias,
    onChange: function (e) {
      setForm(Object.assign({}, form, {
        ciclo_dias: e.target.value
      }));
    },
    placeholder: "dias",
    style: {
      width: 72,
      fontSize: 16,
      padding: 11,
      borderRadius: 10,
      border: '1px solid ' + S.border,
      background: S.surface2,
      color: S.text
    }
  })), /*#__PURE__*/React.createElement("input", {
    value: form.categoria,
    onChange: function (e) {
      setForm(Object.assign({}, form, {
        categoria: e.target.value
      }));
    },
    placeholder: "Categoria (streaming, ginásio...)",
    style: {
      width: '100%',
      fontSize: 16,
      padding: 11,
      borderRadius: 10,
      border: '1px solid ' + S.border,
      background: S.surface2,
      color: S.text,
      marginBottom: 10,
      boxSizing: 'border-box'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: form.metodo_pagamento,
    onChange: function (e) {
      setForm(Object.assign({}, form, {
        metodo_pagamento: e.target.value
      }));
    },
    style: {
      flex: 1,
      fontSize: 16,
      padding: 11,
      borderRadius: 10,
      border: '1px solid ' + S.border,
      background: S.surface2,
      color: S.text
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "twint"
  }, "Twint"), /*#__PURE__*/React.createElement("option", {
    value: "debito"
  }, "Débito"), /*#__PURE__*/React.createElement("option", {
    value: "debito_direto"
  }, "Débito direto"), /*#__PURE__*/React.createElement("option", {
    value: "credito"
  }, "Crédito"), /*#__PURE__*/React.createElement("option", {
    value: "google_pay"
  }, "Google Pay"), /*#__PURE__*/React.createElement("option", {
    value: "apple_pay"
  }, "Apple Pay"), /*#__PURE__*/React.createElement("option", {
    value: "cash"
  }, "Cash")), /*#__PURE__*/React.createElement("input", {
    value: form.banco,
    onChange: function (e) {
      setForm(Object.assign({}, form, {
        banco: e.target.value
      }));
    },
    placeholder: "Banco",
    style: {
      flex: 1,
      fontSize: 16,
      padding: 11,
      borderRadius: 10,
      border: '1px solid ' + S.border,
      background: S.surface2,
      color: S.text
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: form.cartao_ultimos4,
    onChange: function (e) {
      setForm(Object.assign({}, form, {
        cartao_ultimos4: e.target.value.replace(/\D/g, '').slice(0, 4)
      }));
    },
    placeholder: "0000",
    inputMode: "numeric",
    maxLength: 4,
    style: {
      width: 72,
      fontSize: 16,
      padding: 11,
      borderRadius: 10,
      border: '1px solid ' + S.border,
      background: S.surface2,
      color: S.text,
      textAlign: 'center'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: S.muted,
      marginBottom: 3
    }
  }, "Próxima cobrança"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: form.proxima_cobranca,
    onChange: function (e) {
      setForm(Object.assign({}, form, {
        proxima_cobranca: e.target.value
      }));
    },
    style: {
      width: '100%',
      fontSize: 16,
      padding: 11,
      borderRadius: 10,
      border: '1px solid ' + S.border,
      background: S.surface2,
      color: S.text,
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 92
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: S.muted,
      marginBottom: 3
    }
  }, "Avisar (dias)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: form.lembrete_dias,
    onChange: function (e) {
      setForm(Object.assign({}, form, {
        lembrete_dias: e.target.value
      }));
    },
    style: {
      width: '100%',
      fontSize: 16,
      padding: 11,
      borderRadius: 10,
      border: '1px solid ' + S.border,
      background: S.surface2,
      color: S.text,
      boxSizing: 'border-box'
    }
  }))), /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 14,
      marginBottom: 14,
      color: S.text
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: form.ativa,
    onChange: function (e) {
      setForm(Object.assign({}, form, {
        ativa: e.target.checked
      }));
    }
  }), "Ativa"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: salvar,
    style: {
      flex: 1,
      padding: 13,
      border: 'none',
      borderRadius: 10,
      background: S.accent,
      color: '#fff',
      fontWeight: 700,
      fontSize: 15
    }
  }, "Guardar"), /*#__PURE__*/React.createElement("button", {
    onClick: closeForm,
    style: {
      padding: 13,
      border: 'none',
      borderRadius: 10,
      background: S.surface2,
      color: S.text,
      fontSize: 15
    }
  }, "Cancelar"))), loading && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      color: S.muted,
      marginTop: 24
    }
  }, "A carregar..."), !loading && ordered.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      color: S.muted,
      marginTop: 24,
      fontSize: 14
    }
  }, "Sem subscrições ainda."), !loading && ordered.map(function (sub) {
    var dias = diasAte(sub.proxima_cobranca);
    var diasTxt = dias < 0 ? 'atrasada' : dias === 0 ? 'hoje' : 'em ' + dias + 'd';
    var devida = dias <= (sub.lembrete_dias || 3);
    var jaVisto = sub.visto_ate_data === sub.proxima_cobranca;
    var cor = devida && !jaVisto ? S.red : S.muted;
    return /*#__PURE__*/React.createElement("div", {
      key: sub.id,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: S.surface,
        border: '1px solid ' + S.border,
        borderRadius: 14,
        padding: 12,
        marginBottom: 10,
        opacity: sub.ativa ? 1 : 0.5
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 9,
        height: 9,
        borderRadius: '50%',
        background: sub.ativa ? '#22C55E' : '#EF4444',
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 24,
        width: 32,
        textAlign: 'center'
      }
    }, sub.icone || '🔔'), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 15
      }
    }, sub.nome, " ", flagFromPais(sub.pais)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: S.muted,
        marginTop: 2
      }
    }, sub.categoria || '', " · ", sub.ciclo), (sub.metodo_pagamento || sub.cartao_ultimos4) && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: S.muted,
        marginTop: 2
      }
    }, {
      twint: 'Twint',
      debito: 'Débito',
      debito_direto: 'Débito direto',
      credito: 'Crédito',
      google_pay: 'Google Pay',
      apple_pay: 'Apple Pay',
      cash: 'Cash'
    }[sub.metodo_pagamento] || '', sub.banco ? ' · ' + sub.banco : '', sub.cartao_ultimos4 ? ' •••• ' + sub.cartao_ultimos4 : ''), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: cor,
        marginTop: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", null, "Próx: ", sub.proxima_cobranca, " (", diasTxt, ")"), devida && !jaVisto && /*#__PURE__*/React.createElement("button", {
      onClick: function () {
        marcarVisto(sub);
      },
      style: {
        border: 'none',
        borderRadius: 6,
        padding: '2px 7px',
        background: 'rgba(34,197,94,0.15)',
        color: '#22C55E',
        fontSize: 11,
        fontWeight: 700
      }
    }, "✓ Vi"))), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'right'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 800,
        fontSize: 15
      }
    }, fmtMoeda(sub.valor, sub.moeda)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        marginTop: 6,
        justifyContent: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function () {
        openEdit(sub);
      },
      style: {
        border: 'none',
        borderRadius: 8,
        padding: '5px 9px',
        background: S.surface2,
        color: S.text,
        fontSize: 13
      }
    }, "✎"), /*#__PURE__*/React.createElement("button", {
      onClick: function () {
        apagar(sub);
      },
      style: {
        border: 'none',
        borderRadius: 8,
        padding: '5px 9px',
        background: 'rgba(220,38,38,0.15)',
        color: S.red,
        fontSize: 13
      }
    }, "🗑"))));
  })));
}