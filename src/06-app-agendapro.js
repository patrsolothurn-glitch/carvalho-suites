var A = {
  bg: '#F4F2ED',
  surface: '#FFFFFF',
  surface2: '#EDEAE2',
  orange: '#D97706',
  gold: '#B8962E',
  goldL: '#D4AF50',
  text: '#1A1A14',
  muted: '#888878',
  border: '#DDD9CF',
  green: '#16A34A',
  red: '#DC2626',
  blue: '#2563EB',
  purple: '#7C3AED'
};
var STATUS = {
  aberto: {
    label: 'Aberto',
    color: '#D97706',
    bg: 'rgba(217,119,6,0.12)',
    icon: '🔵'
  },
  emcurso: {
    label: 'Em curso',
    color: '#2563EB',
    bg: 'rgba(37,99,235,0.12)',
    icon: '⚡'
  },
  concluido: {
    label: 'Concluído',
    color: '#16A34A',
    bg: 'rgba(22,163,74,0.12)',
    icon: '✅'
  },
  problema: {
    label: 'Problema',
    color: '#DC2626',
    bg: 'rgba(220,38,38,0.12)',
    icon: '⚠️'
  }
};
function AgendaProApp(_ref13) {
  var onBack = _ref13.onBack,
    _ref13$sharedDias = _ref13.sharedDias,
    sharedDias = _ref13$sharedDias === void 0 ? [] : _ref13$sharedDias,
    _ref13$addSharedDia = _ref13.addSharedDia,
    addSharedDia = _ref13$addSharedDia === void 0 ? function () {} : _ref13$addSharedDia,
    _ref13$removeSharedDi = _ref13.removeSharedDia,
    removeSharedDia = _ref13$removeSharedDi === void 0 ? function () {} : _ref13$removeSharedDi;
  var _useState57 = (0, _react.useState)([{
      id: 1,
      date: '2026-06-15',
      hi: '08:00',
      hf: '10:00',
      proj: 'BUDI-2S',
      morada: 'Däderizstrasse 21',
      monteur: 'Patricio',
      chf: 599,
      status: 'aberto',
      nota: 'Bei Firma Madec klingeln'
    }, {
      id: 2,
      date: '2026-06-15',
      hi: '13:15',
      hf: '15:45',
      proj: 'BUDI-2S',
      morada: 'Rosenstrasse 6',
      monteur: 'Patricio',
      chf: 420,
      status: 'aberto',
      nota: ''
    }, {
      id: 3,
      date: '2026-06-16',
      hi: '08:00',
      hf: '12:00',
      proj: 'BUDI-2S',
      morada: 'Veilchenstrasse 8',
      monteur: 'Patricio',
      chf: 580,
      status: 'aberto',
      nota: 'Chantal Kuhn Contin'
    }, {
      id: 4,
      date: '2026-06-16',
      hi: '13:15',
      hf: '16:00',
      proj: 'POP GREN04',
      morada: 'Dählenstrasse 72',
      monteur: 'Patricio',
      chf: 390,
      status: 'emcurso',
      nota: 'Marcel Giger'
    }, {
      id: 5,
      date: '2026-06-10',
      hi: '08:00',
      hf: '12:00',
      proj: 'POP GREN04',
      morada: 'Allerheiligenstrasse 12',
      monteur: 'Patricio',
      chf: 480,
      status: 'concluido',
      nota: ''
    }, {
      id: 6,
      date: '2026-06-11',
      hi: '07:00',
      hf: '09:00',
      proj: 'BUDI-2S',
      morada: 'Gartenstrasse 5',
      monteur: 'Patricio',
      chf: 280,
      status: 'concluido',
      nota: ''
    }, {
      id: 7,
      date: '2026-06-12',
      hi: '10:00',
      hf: '11:00',
      proj: 'POP GREN04',
      morada: 'Bergstrasse 3',
      monteur: 'Patricio',
      chf: 150,
      status: 'problema',
      nota: 'Acesso bloqueado'
    }]),
    _useState58 = _slicedToArray(_useState57, 2),
    appts = _useState58[0],
    setAppts = _useState58[1];
  var _useState59 = (0, _react.useState)('Todos'),
    _useState60 = _slicedToArray(_useState59, 2),
    filter = _useState60[0],
    setFilter = _useState60[1];
  var _useState61 = (0, _react.useState)(''),
    _useState62 = _slicedToArray(_useState61, 2),
    search = _useState62[0],
    setSearch = _useState62[1];
  var _useState63 = (0, _react.useState)(new Date()),
    _useState64 = _slicedToArray(_useState63, 2),
    curDate = _useState64[0],
    setCurDate = _useState64[1];
  var _useState65 = (0, _react.useState)('lista'),
    _useState66 = _slicedToArray(_useState65, 2),
    calView = _useState66[0],
    setCalView = _useState66[1]; // lista | cal
  var _useState67 = (0, _react.useState)(false),
    _useState68 = _slicedToArray(_useState67, 2),
    showAdd = _useState68[0],
    setShowAdd = _useState68[1];
  var _useStateSaveErr = (0, _react.useState)(''),
    _useStateSaveErr2 = _slicedToArray(_useStateSaveErr, 2),
    saveErr = _useStateSaveErr2[0],
    setSaveErr = _useStateSaveErr2[1];
  var _useStateSaving = (0, _react.useState)(false),
    _useStateSaving2 = _slicedToArray(_useStateSaving, 2),
    saving = _useStateSaving2[0],
    setSaving = _useStateSaving2[1];
  var _useState69 = (0, _react.useState)(null),
    _useState70 = _slicedToArray(_useState69, 2),
    editId = _useState70[0],
    setEditId = _useState70[1];
  var _useState71 = (0, _react.useState)(null),
    _useState72 = _slicedToArray(_useState71, 2),
    openId = _useState72[0],
    setOpenId = _useState72[1];
  var _useState73 = (0, _react.useState)({
      date: '',
      hi: '08:00',
      hf: '10:00',
      proj: 'BUDI-2S',
      morada: '',
      monteur: 'Patricio',
      chf: '',
      nota: '',
      status: 'aberto',
      partilhado: false,
      partilhadoCom: 'todos',
      categoria: 'trabalho'
    }),
    _useState74 = _slicedToArray(_useState73, 2),
    form = _useState74[0],
    setForm = _useState74[1];
  var _useState75 = (0, _react.useState)([]),
    _useState76 = _slicedToArray(_useState75, 2),
    monteurs = _useState76[0],
    setMonteurs = _useState76[1];
  var loadMonteurs = function loadMonteurs() {
    if (!window.supabaseClient) return;
    window.supabaseClient.from('agenda_monteurs').select('*').order('created_at', { ascending: true }).then(function (res) {
      if (res.error || !res.data) return;
      setMonteurs(res.data.map(function (row) {
        return {
          id: row.id,
          name: row.name,
          emoji: row.emoji || '👷',
          tel: row.tel || '',
          notif: row.notif !== false,
          cor: row.cor || A.blue
        };
      }));
    }).catch(function () {});
  };
  (0, _react.useEffect)(function () {
    loadMonteurs();
    if (!window.supabaseClient) return;
    var monteurChannel = window.supabaseClient.channel('agenda_monteurs_changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'agenda_monteurs'
    }, function () {
      loadMonteurs();
    }).subscribe();
    return function () {
      try {
        window.supabaseClient.removeChannel(monteurChannel);
      } catch (e) {}
    };
  }, []);
  var _useStateMonteurSaveErr = (0, _react.useState)(''),
    _useStateMonteurSaveErr2 = _slicedToArray(_useStateMonteurSaveErr, 2),
    monteurSaveErr = _useStateMonteurSaveErr2[0],
    setMonteurSaveErr = _useStateMonteurSaveErr2[1];
  var _useStateMonteurSaving = (0, _react.useState)(false),
    _useStateMonteurSaving2 = _slicedToArray(_useStateMonteurSaving, 2),
    monteurSaving = _useStateMonteurSaving2[0],
    setMonteurSaving = _useStateMonteurSaving2[1];
  var saveMonteur = function saveMonteur() {
    var name = (mForm.name || '').trim();
    if (!name) {
      setMonteurSaveErr('Falta o nome do monteur.');
      return;
    }
    if (!window.supabaseClient) {
      setMonteurSaveErr('Sem ligação ao servidor.');
      return;
    }
    setMonteurSaveErr('');
    setMonteurSaving(true);
    if (editMonteur === 'new') {
      window.supabaseClient.from('agenda_monteurs').insert({
        name: name,
        emoji: mForm.emoji,
        tel: mForm.tel,
        notif: mForm.notif,
        cor: mForm.cor
      }).then(function (res) {
        setMonteurSaving(false);
        if (res.error) {
          setMonteurSaveErr('Erro: ' + res.error.message);
          return;
        }
        loadMonteurs();
        setEditMonteur(null);
      }).catch(function (e) {
        setMonteurSaving(false);
        setMonteurSaveErr('Erro de ligação: ' + (e && e.message || String(e)));
      });
    } else {
      var prevMonteur = monteurs.find(function (m) {
        return m.id === editMonteur;
      });
      setMonteurs(function (p) {
        return p.map(function (m) {
          return m.id === editMonteur ? _objectSpread(_objectSpread(_objectSpread({}, m), mForm), {}, {
            name: name
          }) : m;
        });
      });
      window.supabaseClient.from('agenda_monteurs').update({
        name: name,
        emoji: mForm.emoji,
        tel: mForm.tel,
        notif: mForm.notif,
        cor: mForm.cor
      }).eq('id', editMonteur).then(function (res) {
        setMonteurSaving(false);
        if (res.error) {
          setMonteurSaveErr('Erro: ' + res.error.message);
          if (prevMonteur) {
            setMonteurs(function (p) {
              return p.map(function (m) {
                return m.id === editMonteur ? prevMonteur : m;
              });
            });
          }
          return;
        }
        loadMonteurs();
        setEditMonteur(null);
      }).catch(function (e) {
        setMonteurSaving(false);
        setMonteurSaveErr('Erro de ligação: ' + (e && e.message || String(e)));
        if (prevMonteur) {
          setMonteurs(function (p) {
            return p.map(function (m) {
              return m.id === editMonteur ? prevMonteur : m;
            });
          });
        }
      });
    }
  };
  var deleteMonteurDb = function deleteMonteurDb(monteurId, monteurName) {
    if (!window.confirm('Apagar o monteur "' + monteurName + '"? Marcações já criadas não são afetadas.')) return;
    if (!window.supabaseClient) return;
    var prevList = monteurs;
    setMonteurs(function (p) {
      return p.filter(function (x) {
        return x.id !== monteurId;
      });
    });
    window.supabaseClient.from('agenda_monteurs').delete().eq('id', monteurId).then(function (res) {
      if (res.error) {
        setMonteurs(prevList);
        setMonteurSaveErr('Erro ao apagar: ' + res.error.message);
      }
    }).catch(function (e) {
      setMonteurs(prevList);
      setMonteurSaveErr('Erro de ligação ao apagar: ' + (e && e.message || String(e)));
    });
  };
  var _useState77 = (0, _react.useState)(false),
    _useState78 = _slicedToArray(_useState77, 2),
    showMonteurs = _useState78[0],
    setShowMonteurs = _useState78[1];
  var _useState79 = (0, _react.useState)(null),
    _useState80 = _slicedToArray(_useState79, 2),
    editMonteur = _useState80[0],
    setEditMonteur = _useState80[1];
  var _useState81 = (0, _react.useState)({
      name: '',
      emoji: '👷',
      tel: '',
      notif: true,
      cor: A.blue
    }),
    _useState82 = _slicedToArray(_useState81, 2),
    mForm = _useState82[0],
    setMForm = _useState82[1];
  var _useState83 = (0, _react.useState)(true),
    _useState84 = _slicedToArray(_useState83, 2),
    avisosAtivos = _useState84[0],
    setAvisosAtivos = _useState84[1];
  var _useState85 = (0, _react.useState)(30),
    _useState86 = _slicedToArray(_useState85, 2),
    avisoMin = _useState86[0],
    setAvisoMin = _useState86[1];
  var _useState87 = (0, _react.useState)({}),
    _useState88 = _slicedToArray(_useState87, 2),
    ultimoAviso = _useState88[0],
    setUltimoAviso = _useState88[1];
  var _useState89 = (0, _react.useState)([]),
    _useState90 = _slicedToArray(_useState89, 2),
    inAppNotifs = _useState90[0],
    setInAppNotifs = _useState90[1];
  var _useState91 = (0, _react.useState)(false),
    _useState92 = _slicedToArray(_useState91, 2),
    showNotifPanel = _useState92[0],
    setShowNotifPanel = _useState92[1];
  var _useState93 = (0, _react.useState)([]),
    _useState94 = _slicedToArray(_useState93, 2),
    toasts = _useState94[0],
    setToasts = _useState94[1];
  var addToast = function addToast(msg) {
    var sub = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var tipo = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'info';
    var id = Date.now();
    setInAppNotifs(function (p) {
      return [{
        id: id,
        msg: msg,
        sub: sub,
        tipo: tipo,
        time: new Date().toLocaleTimeString('pt-PT', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        lida: false
      }].concat(_toConsumableArray(p));
    });
    setToasts(function (p) {
      return [].concat(_toConsumableArray(p), [{
        id: id,
        msg: msg,
        sub: sub,
        tipo: tipo
      }]);
    });
    setTimeout(function () {
      return setToasts(function (p) {
        return p.filter(function (t) {
          return t.id !== id;
        });
      });
    }, 4000);
  };

  // Verificar compromissos próximos
  (0, _react.useEffect)(function () {
    if (!avisosAtivos) return;
    var check = function check() {
      var now = new Date();
      appts.filter(function (a) {
        return a.status === 'aberto' || a.status === 'emcurso';
      }).forEach(function (a) {
        var apptTime = new Date("".concat(a.date, "T").concat(a.hi, ":00"));
        var diffMin = (apptTime - now) / 60000;
        if (diffMin > 0 && diffMin <= avisoMin && !ultimoAviso[a.id]) {
          setUltimoAviso(function (p) {
            return _objectSpread(_objectSpread({}, p), {}, _defineProperty({}, a.id, true));
          });
          addToast("\u23F0 ".concat(a.monteur, " \u2014 compromisso em ").concat(Math.round(diffMin), " min"), "".concat(a.morada, " \xB7 ").concat(a.hi, "\u2013").concat(a.hf), 'aviso');
        }
      });
    };
    check();
    var t = setInterval(check, 60000);
    return function () {
      return clearInterval(t);
    };
  }, [appts, avisosAtivos, avisoMin, ultimoAviso]);
  var fmt = function fmt(d) {
    return d.toISOString().split('T')[0];
  };
  var todayStr = fmt(curDate);
  var _useStateProjList = (0, _react.useState)([]),
    _useStateProjList2 = _slicedToArray(_useStateProjList, 2),
    projList = _useStateProjList2[0],
    setProjList = _useStateProjList2[1];
  var loadProjects = function loadProjects() {
    if (!window.supabaseClient) return;
    window.supabaseClient.from('horas_projects').select('*').order('created_at', { ascending: true }).then(function (res) {
      if (res.error || !res.data) return;
      setProjList(res.data.map(function (row) {
        return {
          id: row.id,
          name: row.name
        };
      }));
    }).catch(function () {});
  };
  (0, _react.useEffect)(function () {
    loadProjects();
    if (!window.supabaseClient) return;
    var projChannel = window.supabaseClient.channel('horas_projects_changes_agenda').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'horas_projects'
    }, function () {
      loadProjects();
    }).subscribe();
    return function () {
      try {
        window.supabaseClient.removeChannel(projChannel);
      } catch (e) {}
    };
  }, []);
  var _useStateShowAddProjInline = (0, _react.useState)(false),
    _useStateShowAddProjInline2 = _slicedToArray(_useStateShowAddProjInline, 2),
    showAddProjInline = _useStateShowAddProjInline2[0],
    setShowAddProjInline = _useStateShowAddProjInline2[1];
  var _useStateNewProjNameInline = (0, _react.useState)(''),
    _useStateNewProjNameInline2 = _slicedToArray(_useStateNewProjNameInline, 2),
    newProjNameInline = _useStateNewProjNameInline2[0],
    setNewProjNameInline = _useStateNewProjNameInline2[1];
  var _useStateProjAddErr = (0, _react.useState)(''),
    _useStateProjAddErr2 = _slicedToArray(_useStateProjAddErr, 2),
    projAddErr = _useStateProjAddErr2[0],
    setProjAddErr = _useStateProjAddErr2[1];
  var _useStateProjAddBusy = (0, _react.useState)(false),
    _useStateProjAddBusy2 = _slicedToArray(_useStateProjAddBusy, 2),
    projAddBusy = _useStateProjAddBusy2[0],
    setProjAddBusy = _useStateProjAddBusy2[1];
  var addProjectInline = function addProjectInline() {
    var name = (newProjNameInline || '').trim();
    if (!name) {
      setProjAddErr('Escreve o nome do projeto.');
      return;
    }
    if (!window.supabaseClient) {
      setProjAddErr('Sem ligação ao servidor.');
      return;
    }
    setProjAddBusy(true);
    setProjAddErr('');
    window.supabaseClient.from('horas_projects').insert({
      name: name
    }).select().then(function (res) {
      setProjAddBusy(false);
      if (res.error) {
        setProjAddErr('Erro: ' + res.error.message);
        return;
      }
      loadProjects();
      setForm(function (p) {
        return _objectSpread(_objectSpread({}, p), {}, {
          proj: name
        });
      });
      setNewProjNameInline('');
      setShowAddProjInline(false);
    }).catch(function (e) {
      setProjAddBusy(false);
      setProjAddErr('Erro de ligação: ' + (e && e.message || String(e)));
    });
  };
  var _useStateShowManageProj = (0, _react.useState)(false),
    _useStateShowManageProj2 = _slicedToArray(_useStateShowManageProj, 2),
    showManageProj = _useStateShowManageProj2[0],
    setShowManageProj = _useStateShowManageProj2[1];
  var _useStateEditProjId = (0, _react.useState)(null),
    _useStateEditProjId2 = _slicedToArray(_useStateEditProjId, 2),
    editProjId = _useStateEditProjId2[0],
    setEditProjId = _useStateEditProjId2[1];
  var _useStatePFormName = (0, _react.useState)(''),
    _useStatePFormName2 = _slicedToArray(_useStatePFormName, 2),
    pFormName = _useStatePFormName2[0],
    setPFormName = _useStatePFormName2[1];
  var _useStateProjManageErr = (0, _react.useState)(''),
    _useStateProjManageErr2 = _slicedToArray(_useStateProjManageErr, 2),
    projManageErr = _useStateProjManageErr2[0],
    setProjManageErr = _useStateProjManageErr2[1];
  var _useStateProjManageBusy = (0, _react.useState)(false),
    _useStateProjManageBusy2 = _slicedToArray(_useStateProjManageBusy, 2),
    projManageBusy = _useStateProjManageBusy2[0],
    setProjManageBusy = _useStateProjManageBusy2[1];
  var saveProjectManage = function saveProjectManage() {
    var name = (pFormName || '').trim();
    if (!name) {
      setProjManageErr('Falta o nome do projeto.');
      return;
    }
    if (!window.supabaseClient) {
      setProjManageErr('Sem ligação ao servidor.');
      return;
    }
    setProjManageBusy(true);
    setProjManageErr('');
    if (editProjId === 'new') {
      window.supabaseClient.from('horas_projects').insert({
        name: name
      }).then(function (res) {
        setProjManageBusy(false);
        if (res.error) {
          setProjManageErr('Erro: ' + res.error.message);
          return;
        }
        loadProjects();
        setEditProjId(null);
      }).catch(function (e) {
        setProjManageBusy(false);
        setProjManageErr('Erro de ligação: ' + (e && e.message || String(e)));
      });
    } else {
      window.supabaseClient.from('horas_projects').update({
        name: name
      }).eq('id', editProjId).then(function (res) {
        setProjManageBusy(false);
        if (res.error) {
          setProjManageErr('Erro: ' + res.error.message);
          return;
        }
        loadProjects();
        setEditProjId(null);
      }).catch(function (e) {
        setProjManageBusy(false);
        setProjManageErr('Erro de ligação: ' + (e && e.message || String(e)));
      });
    }
  };
  var deleteProjectManage = function deleteProjectManage(projId, projName) {
    if (!window.confirm('Apagar o projeto "' + projName + '"? Marcações já criadas com este projeto não são afetadas.')) return;
    if (!window.supabaseClient) return;
    var prevList = projList;
    setProjList(function (p) {
      return p.filter(function (x) {
        return x.id !== projId;
      });
    });
    window.supabaseClient.from('horas_projects').delete().eq('id', projId).then(function (res) {
      if (res.error) {
        setProjList(prevList);
        setProjManageErr('Erro ao apagar: ' + res.error.message);
      }
    }).catch(function (e) {
      setProjList(prevList);
      setProjManageErr('Erro de ligação ao apagar: ' + (e && e.message || String(e)));
    });
  };
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
  var calcHoras = function calcHoras(hi, hf) {
    var _hi$split$map3 = hi.split(':').map(Number),
      _hi$split$map4 = _slicedToArray(_hi$split$map3, 2),
      hh = _hi$split$map4[0],
      hm = _hi$split$map4[1];
    var _hf$split$map3 = hf.split(':').map(Number),
      _hf$split$map4 = _slicedToArray(_hf$split$map3, 2),
      fh = _hf$split$map4[0],
      fm = _hf$split$map4[1];
    return (fh * 60 + fm - (hh * 60 + hm)) / 60;
  };
  var projColor = function projColor(p) {
    return p.includes('POP') ? A.blue : p.includes('BUDI') ? A.orange : A.gold;
  };

  // Filtered list
  var _useStateFiltrosAP = (0, _react.useState)(Object.keys(CATEGORIAS)),
    _useStateFiltrosAP2 = _slicedToArray(_useStateFiltrosAP, 2),
    filtrosAtivos = _useStateFiltrosAP2[0],
    setFiltrosAtivos = _useStateFiltrosAP2[1];
  var toggleFiltro = function toggleFiltro(catKey) {
    setFiltrosAtivos(function (p) {
      if (p.indexOf(catKey) !== -1) {
        return p.filter(function (c) {
          return c !== catKey;
        });
      }
      return [].concat(_toConsumableArray(p), [catKey]);
    });
  };
  var filtered = appts.filter(function (a) {
    var matchSearch = !search || a.morada.toLowerCase().includes(search.toLowerCase()) || a.proj.toLowerCase().includes(search.toLowerCase()) || a.monteur.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    var catMatch = filtrosAtivos.indexOf(a.categoria || 'trabalho') !== -1;
    var familiaMatch = a.partilhado && filtrosAtivos.indexOf('familia') !== -1;
    if (!catMatch && !familiaMatch) return false;
    if (filter === 'Hoje') return a.date === todayStr;
    if (filter === 'Semana') {
      var d = new Date(a.date + 'T12:00:00');
      var s = new Date(curDate);
      s.setDate(s.getDate() - s.getDay() + 1);
      var e = new Date(s);
      e.setDate(e.getDate() + 6);
      return d >= s && d <= e;
    }
    if (filter === 'Aberto') return a.status === 'aberto';
    if (filter === 'Em curso') return a.status === 'emcurso';
    if (filter === 'Concluído') return a.status === 'concluido';
    if (filter === 'Problema') return a.status === 'problema';
    return true;
  }).sort(function (a, b) {
    return a.date.localeCompare(b.date) || a.hi.localeCompare(b.hi);
  });

  // Stats
  var totalAbertos = appts.filter(function (a) {
    return a.status === 'aberto';
  }).length;
  var totalEmCurso = appts.filter(function (a) {
    return a.status === 'emcurso';
  }).length;
  var totalConcluidos = appts.filter(function (a) {
    return a.status === 'concluido';
  }).length;
  var chfSem = appts.filter(function (a) {
    var d = new Date(a.date + 'T12:00:00');
    var s = new Date(curDate);
    s.setDate(s.getDate() - s.getDay() + 1);
    var e = new Date(s);
    e.setDate(e.getDate() + 6);
    return d >= s && d <= e && a.status === 'concluido';
  }).reduce(function (s, a) {
    return s + a.chf;
  }, 0);
  var grouped = filtered.reduce(function (acc, a) {
    (acc[a.date] = acc[a.date] || []).push(a);
    return acc;
  }, {});
  var sortedDates = Object.keys(grouped).sort();
  var weeklyChart = function () {
    var weeks = {};
    appts.filter(function (a) {
      return a.status === 'concluido';
    }).forEach(function (a) {
      var d = new Date(a.date + 'T12:00:00');
      var monday = new Date(d);
      monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
      var key = monday.toISOString().slice(0, 10);
      weeks[key] = (weeks[key] || 0) + a.chf;
    });
    var keys = Object.keys(weeks).sort().slice(-8);
    return keys.map(function (k) {
      return {
        week: k,
        chf: weeks[k]
      };
    });
  }();
  var nextAppt = appts.filter(function (a) {
    return a.date >= todayStr && a.status !== 'concluido';
  }).sort(function (a, b) {
    return a.date.localeCompare(b.date) || a.hi.localeCompare(b.hi);
  })[0] || null;
  var loadJobs = function loadJobs() {
    if (!window.supabaseClient) return;
    window.supabaseClient.from('agenda_pro_jobs').select('*').then(function (res) {
      if (res.error || !res.data) return;
      setAppts(res.data.map(function (row) {
        return {
          id: row.id,
          date: row.job_date,
          hi: row.start_time || '',
          hf: row.end_time || '',
          proj: row.project || '',
          morada: row.address || '',
          monteur: row.monteur || 'Patricio',
          chf: Number(row.chf) || 0,
          status: row.status || 'aberto',
          nota: row.note || '',
          categoria: row.categoria || (row.source === 'escolar' ? 'escola' : 'trabalho'),
          partilhado: !!row.partilhado,
          partilhadoCom: row.partilhado_com || 'todos'
        };
      }));
    }).catch(function () {});
  };
  (0, _react.useEffect)(function () {
    loadJobs();
    if (!window.supabaseClient) return;
    var channel = window.supabaseClient.channel('agenda_pro_jobs_changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'agenda_pro_jobs'
    }, function () {
      loadJobs();
    }).subscribe();
    return function () {
      try {
        window.supabaseClient.removeChannel(channel);
      } catch (e) {}
    };
  }, []);
  var openForm = function openForm() {
    var appt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    if (appt) {
      setEditId(appt.id);
      setForm(_objectSpread(_objectSpread({}, appt), {}, {
        partilhado: !!appt.partilhado,
        partilhadoCom: appt.partilhadoCom || 'todos'
      }));
    } else {
      setEditId(null);
      setForm({
        date: todayStr,
        hi: '08:00',
        hf: '10:00',
        proj: 'BUDI-2S',
        morada: '',
        monteur: 'Patricio',
        chf: '',
        nota: '',
        status: 'aberto',
        partilhado: false,
        partilhadoCom: 'todos',
        categoria: 'trabalho'
      });
    }
    setShowAdd(true);
    setSaveErr('');
  };
  var sendNotifTo = function sendNotifTo(monteurName, msg, body) {
    addToast(msg, body, 'notif');
  };
  var sendPushTargeted = function sendPushTargeted(title, body, partilhado, partilhadoCom) {
    if (!window.supabaseClient) return;
    var onlyMember = partilhado && partilhadoCom && partilhadoCom !== 'todos' ? partilhadoCom : null;
    getEligibleProfileIds('agendapr', onlyMember).then(function (ids) {
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
  var syncToFamilia = function syncToFamilia(jobId, partilhado, jobData) {
    if (!window.supabaseClient) return;
    if (partilhado) {
      var alvo = jobData.partilhadoCom && jobData.partilhadoCom !== 'todos' ? [jobData.partilhadoCom] : ['todos'];
      window.supabaseClient.from('family_events').select('id').eq('source', 'agenda_pro').eq('source_id', jobId).then(function (res) {
        var existing = res.data && res.data[0];
        var payload = {
          title: '💼 ' + (jobData.proj || 'Trabalho'),
          emoji: '💼',
          event_date: jobData.date,
          event_time: jobData.hi || null,
          description: jobData.morada || null,
          color: '#F59458',
          categoria: 'trabalho',
          participant_ids: alvo,
          member_id: null,
          source: 'agenda_pro',
          source_id: jobId,
          created_by: jobData.monteur || 'patricio'
        };
        if (existing) {
          window.supabaseClient.from('family_events').update(payload).eq('id', existing.id).then(function () {}).catch(function () {});
        } else {
          window.supabaseClient.from('family_events').insert(payload).then(function () {}).catch(function () {});
        }
      }).catch(function () {});
    } else {
      window.supabaseClient.from('family_events').delete().eq('source', 'agenda_pro').eq('source_id', jobId).then(function () {}).catch(function () {});
    }
  };
  var saveForm = function saveForm() {
    if (!form.morada || !form.morada.trim()) {
      setSaveErr('Falta a morada.');
      return;
    }
    setSaveErr('');
    setSaving(true);
    if (editId) {
      var prevAppt = appts.find(function (a) {
        return a.id === editId;
      });
      setAppts(function (p) {
        return p.map(function (a) {
          return a.id === editId ? _objectSpread(_objectSpread(_objectSpread({}, a), form), {}, {
            chf: Number(form.chf)
          }) : a;
        });
      });
      if (!window.supabaseClient) {
        setSaving(false);
        setSaveErr('Sem ligação ao servidor — não foi guardado.');
        return;
      }
      window.supabaseClient.from('agenda_pro_jobs').update({
        job_date: form.date,
        start_time: form.hi,
        end_time: form.hf,
        project: form.proj,
        address: form.morada,
        monteur: form.monteur,
        chf: Number(form.chf),
        status: form.status,
        note: form.nota,
        categoria: form.categoria,
        partilhado: !!form.partilhado,
        partilhado_com: form.partilhadoCom || 'todos'
      }).eq('id', editId).then(function (res) {
        setSaving(false);
        if (res.error) {
          setSaveErr('Erro ao guardar: ' + res.error.message);
          if (prevAppt) {
            setAppts(function (p) {
              return p.map(function (a) {
                return a.id === editId ? prevAppt : a;
              });
            });
          }
          return;
        }
        loadJobs();
        syncToFamilia(editId, form.partilhado, form);
        sendNotifTo(form.monteur, "\u270F\uFE0F Marca\xE7\xE3o alterada \u2014 ".concat(form.monteur), "".concat(form.morada, " \xB7 ").concat(form.date, " \xE0s ").concat(form.hi, "\u2013").concat(form.hf));
        setShowAdd(false);
        setEditId(null);
      }).catch(function (e) {
        setSaving(false);
        setSaveErr('Erro de ligação: ' + (e && e.message || String(e)));
        if (prevAppt) {
          setAppts(function (p) {
            return p.map(function (a) {
              return a.id === editId ? prevAppt : a;
            });
          });
        }
      });
    } else {
      var tempId = Date.now();
      setAppts(function (p) {
        return [].concat(_toConsumableArray(p), [_objectSpread(_objectSpread({}, form), {}, {
          id: tempId,
          chf: Number(form.chf)
        })]);
      });
      if (!window.supabaseClient) {
        setSaving(false);
        setSaveErr('Sem ligação ao servidor — não foi guardado.');
        setAppts(function (p) {
          return p.filter(function (a) {
            return a.id !== tempId;
          });
        });
        return;
      }
      window.supabaseClient.from('agenda_pro_jobs').insert({
        job_date: form.date,
        start_time: form.hi,
        end_time: form.hf,
        project: form.proj,
        address: form.morada,
        monteur: form.monteur,
        chf: Number(form.chf),
        status: form.status,
        note: form.nota,
        categoria: form.categoria,
        partilhado: !!form.partilhado,
        partilhado_com: form.partilhadoCom || 'todos'
      }).select().then(function (res) {
        setSaving(false);
        if (res.error) {
          setSaveErr('Erro ao adicionar: ' + res.error.message);
          setAppts(function (p) {
            return p.filter(function (a) {
              return a.id !== tempId;
            });
          });
          return;
        }
        loadJobs();
        var newJob = res.data && res.data[0];
        if (form.partilhado && newJob) {
          syncToFamilia(newJob.id, true, form);
        }
        try {
          sendPushTargeted('Agenda Pro', (form.proj || 'Marcação') + ' · ' + form.date + ' às ' + form.hi, form.partilhado, form.partilhadoCom);
        } catch (e) {}
        sendNotifTo(form.monteur, "\uD83D\uDCCB Nova marca\xE7\xE3o \u2014 ".concat(form.monteur), "".concat(form.morada, " \xB7 ").concat(form.date, " \xE0s ").concat(form.hi, "\u2013").concat(form.hf));
        setShowAdd(false);
        setEditId(null);
      }).catch(function (e) {
        setSaving(false);
        setSaveErr('Erro de ligação: ' + (e && e.message || String(e)));
        setAppts(function (p) {
          return p.filter(function (a) {
            return a.id !== tempId;
          });
        });
      });
    }
  };
  var deleteApptWithNotif = function deleteApptWithNotif(a) {
    deleteAppt(a.id);
    sendNotifTo(a.monteur, "\u274C Marca\xE7\xE3o cancelada \u2014 ".concat(a.monteur), "".concat(a.morada, " \xB7 ").concat(a.date, " \xE0s ").concat(a.hi, " foi cancelada"));
  };
  var changeStatusWithNotif = function changeStatusWithNotif(id, status) {
    var a = appts.find(function (x) {
      return x.id === id;
    });
    changeStatus(id, status);
    if (a && STATUS[status]) {
      sendNotifTo(a.monteur, "".concat(STATUS[status].icon, " Estado alterado \u2014 ").concat(a.monteur), "".concat(a.morada, ": ").concat(STATUS[status].label));
    }
  };
  var changeStatus = function changeStatus(id, status) {
    setAppts(function (p) {
      return p.map(function (a) {
        return a.id === id ? _objectSpread(_objectSpread({}, a), {}, {
          status: status
        }) : a;
      });
    });
    if (window.supabaseClient) {
      window.supabaseClient.from('agenda_pro_jobs').update({
        status: status
      }).eq('id', id).then(function () {}).catch(function () {});
    }
  };
  var deleteAppt = function deleteAppt(id) {
    setAppts(function (p) {
      return p.filter(function (a) {
        return a.id !== id;
      });
    });
    if (window.supabaseClient) {
      window.supabaseClient.from('agenda_pro_jobs').delete().eq('id', id).then(function () {}).catch(function () {});
      window.supabaseClient.from('family_events').delete().eq('source', 'agenda_pro').eq('source_id', id).then(function () {}).catch(function () {});
    }
  };
  var ACard = function ACard(_ref14) {
    var children = _ref14.children,
      _ref14$style = _ref14.style,
      style = _ref14$style === void 0 ? {} : _ref14$style;
    return /*#__PURE__*/React.createElement("div", {
      style: _objectSpread({
        background: A.surface,
        borderRadius: 18,
        border: "1px solid ".concat(A.border),
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }, style)
    }, children);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      background: A.bg,
      fontFamily: "'Inter',system-ui,sans-serif",
      color: A.text,
      overflowX: 'hidden',
      paddingBottom: 80
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: A.surface,
      borderBottom: "1px solid ".concat(A.border),
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 200,
      boxShadow: '0 1px 8px rgba(0,0,0,0.07)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      background: 'none',
      border: 'none',
      color: A.orange,
      fontSize: 24,
      cursor: 'pointer',
      padding: 0,
      lineHeight: 1
    }
  }, "\u2039"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 900,
      fontSize: 18
    }
  }, "\uD83D\uDCCB Agenda Pro"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: avisosAtivos ? A.green : A.muted
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: avisosAtivos ? A.green : A.muted,
      fontWeight: 600
    }
  }, avisosAtivos ? "Avisos ".concat(avisoMin, "min antes") : 'Avisos desligados')))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setCalView(function (v) {
        return v === 'lista' ? 'cal' : 'lista';
      });
    },
    style: {
      background: A.surface2,
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10,
      padding: '7px 12px',
      color: A.muted,
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, calView === 'lista' ? '📅' : '📋'), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setCalView(function (v) {
        return v === 'graficos' ? 'lista' : 'graficos';
      });
    },
    style: {
      background: calView === 'graficos' ? A.orange : A.surface2,
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10,
      padding: '7px 12px',
      color: calView === 'graficos' ? '#fff' : A.muted,
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "\uD83D\uDCCA"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setShowManageProj(true);
      setEditProjId(null);
    },
    style: {
      background: A.surface2,
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10,
      width: 38,
      height: 38,
      color: A.muted,
      fontSize: 16,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, "\uD83D\uDCC1"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: A.surface,
      border: "1px solid ".concat(A.border),
      borderRadius: 14,
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: A.muted,
      fontSize: 16
    }
  }, "\uD83D\uDD0D"), /*#__PURE__*/React.createElement("input", {
    value: search,
    onChange: function onChange(e) {
      return setSearch(e.target.value);
    },
    placeholder: "Pesquisar morada, projeto, monteur...",
    style: {
      flex: 1,
      background: 'none',
      border: 'none',
      color: A.text,
      fontSize: 14,
      outline: 'none',
      caretColor: A.orange
    }
  }), search && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setSearch('');
    },
    style: {
      background: 'none',
      border: 'none',
      color: A.muted,
      cursor: 'pointer',
      fontSize: 16
    }
  }, "\u2715"))), nextAppt && /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      return openForm(nextAppt);
    },
    style: {
      margin: '0 16px 14px',
      background: "linear-gradient(135deg, ".concat(A.gold, ", ").concat(A.orange, ")"),
      borderRadius: 20,
      padding: '18px 18px',
      cursor: 'pointer',
      boxShadow: '0 8px 24px rgba(184,150,46,0.35)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 11,
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.8px'
    }
  }, "\u23F1\uFE0F Pr\xF3xima marca\xE7\xE3o"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(255,255,255,0.25)',
      borderRadius: 10,
      padding: '3px 10px',
      color: '#fff',
      fontSize: 11,
      fontWeight: 800
    }
  }, nextAppt.proj)), /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#fff',
      fontSize: 24,
      fontWeight: 900,
      letterSpacing: '-0.5px',
      marginBottom: 4
    }
  }, nextAppt.morada), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'rgba(255,255,255,0.95)',
      fontSize: 15,
      fontWeight: 700,
      marginBottom: 14
    }
  }, (nextAppt.date === todayStr ? 'Hoje' : new Date(nextAppt.date + 'T12:00:00').toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  })), " \xB7 ", nextAppt.hi, "\u2013", nextAppt.hf), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14
    }
  }, STATUS[nextAppt.status] ? STATUS[nextAppt.status].icon : ''), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#fff',
      fontSize: 13,
      fontWeight: 700
    }
  }, STATUS[nextAppt.status] ? STATUS[nextAppt.status].label : nextAppt.status)), /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#fff',
      fontSize: 28,
      fontWeight: 900
    }
  }, "CHF ", nextAppt.chf)), nextAppt.nota && /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 12,
      marginTop: 10,
      fontStyle: 'italic'
    }
  }, "\uD83D\uDCDD ", nextAppt.nota)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 16px',
      display: 'flex',
      gap: 7,
      overflowX: 'auto'
    }
  }, ['Todos', 'Hoje', 'Semana', 'Aberto', 'Em curso', 'Concluído', 'Problema'].map(function (f) {
    return /*#__PURE__*/React.createElement("button", {
      key: f,
      onClick: function onClick() {
        return setFilter(f);
      },
      style: {
        background: filter === f ? A.orange : A.surface,
        border: "1px solid ".concat(filter === f ? A.orange : A.border),
        borderRadius: 20,
        padding: '6px 14px',
        color: filter === f ? '#fff' : A.muted,
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0
      }
    }, f);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 10px',
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, Object.keys(CATEGORIAS).map(function (catKey) {
    var cat = CATEGORIAS[catKey];
    var ativo = filtrosAtivos.indexOf(catKey) !== -1;
    return /*#__PURE__*/React.createElement("button", {
      key: catKey,
      onClick: function onClick() {
        return toggleFiltro(catKey);
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        background: ativo ? "".concat(cat.color, "18") : 'transparent',
        border: "1px solid ".concat(ativo ? cat.color : A.border),
        borderRadius: 16,
        padding: '4px 10px',
        cursor: 'pointer',
        opacity: ativo ? 1 : 0.5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: { fontSize: 11 }
    }, cat.emoji), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: ativo ? cat.color : A.muted
      }
    }, cat.label));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 70,
      left: 16,
      right: 16,
      zIndex: 999,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      pointerEvents: 'none'
    }
  }, toasts.map(function (t) {
    return /*#__PURE__*/React.createElement("div", {
      key: t.id,
      style: {
        background: t.tipo === 'aviso' ? '#1A1A0A' : t.tipo === 'notif' ? '#0A0A1A' : '#0A1A0A',
        border: "2px solid ".concat(t.tipo === 'aviso' ? A.orange : t.tipo === 'notif' ? A.blue : A.green),
        borderRadius: 16,
        padding: '12px 16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        pointerEvents: 'auto'
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontWeight: 800,
        fontSize: 14,
        color: '#fff'
      }
    }, t.msg), t.sub && /*#__PURE__*/React.createElement("p", {
      style: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        marginTop: 2
      }
    }, t.sub));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 16px 10px',
      background: avisosAtivos ? 'rgba(22,163,74,0.07)' : 'rgba(0,0,0,0.04)',
      border: "1px solid ".concat(avisosAtivos ? 'rgba(22,163,74,0.25)' : A.border),
      borderRadius: 14,
      padding: '9px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: avisosAtivos ? A.green : A.muted,
      boxShadow: avisosAtivos ? "0 0 6px ".concat(A.green) : 'none'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: avisosAtivos ? A.green : A.muted,
      fontSize: 12,
      fontWeight: 700,
      flex: 1
    }
  }, avisosAtivos ? "Avisos ativos \u2014 ".concat(avisoMin, " min antes") : 'Avisos desligados'), /*#__PURE__*/React.createElement("select", {
    value: avisoMin,
    onChange: function onChange(e) {
      setAvisoMin(Number(e.target.value));
    },
    style: {
      background: 'transparent',
      border: 'none',
      color: avisosAtivos ? A.green : A.muted,
      fontSize: 11,
      outline: 'none',
      cursor: 'pointer',
      display: avisosAtivos ? 'block' : 'none'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: 15
  }, "15 min"), /*#__PURE__*/React.createElement("option", {
    value: 30
  }, "30 min"), /*#__PURE__*/React.createElement("option", {
    value: 60
  }, "1 hora"), /*#__PURE__*/React.createElement("option", {
    value: 120
  }, "2 horas")), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setAvisosAtivos(function (v) {
        return !v;
      });
    },
    style: {
      background: 'none',
      border: "1px solid ".concat(avisosAtivos ? 'rgba(22,163,74,0.3)' : A.border),
      borderRadius: 8,
      padding: '3px 10px',
      color: avisosAtivos ? A.green : A.orange,
      fontSize: 11,
      cursor: 'pointer',
      fontWeight: 700
    }
  }, avisosAtivos ? 'Desligar' : 'Ligar'), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowNotifPanel(function (v) {
        return !v;
      });
    },
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      position: 'relative',
      padding: '2px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18
    }
  }, "\uD83D\uDD14"), inAppNotifs.filter(function (n) {
    return !n.lida;
  }).length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 14,
      height: 14,
      background: A.red,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 8,
      color: '#fff',
      fontWeight: 800
    }
  }, inAppNotifs.filter(function (n) {
    return !n.lida;
  }).length)))), showNotifPanel && /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 16px 10px',
      background: A.surface,
      border: "1px solid ".concat(A.border),
      borderRadius: 16,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px',
      borderBottom: "1px solid ".concat(A.border),
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontWeight: 800,
      fontSize: 14,
      color: A.text
    }
  }, "\uD83D\uDD14 Hist\xF3rico de avisos"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setInAppNotifs(function (p) {
        return p.map(function (n) {
          return _objectSpread(_objectSpread({}, n), {}, {
            lida: true
          });
        });
      });
    },
    style: {
      background: 'none',
      border: 'none',
      color: A.muted,
      fontSize: 11,
      cursor: 'pointer'
    }
  }, "Ler todos"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setInAppNotifs([]);
    },
    style: {
      background: 'none',
      border: 'none',
      color: A.red,
      fontSize: 11,
      cursor: 'pointer'
    }
  }, "Limpar"))), inAppNotifs.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 24
    }
  }, "\uD83D\uDD15"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: A.muted,
      fontSize: 13,
      marginTop: 6
    }
  }, "Sem avisos por enquanto")), inAppNotifs.slice(0, 5).map(function (n) {
    return /*#__PURE__*/React.createElement("div", {
      key: n.id,
      onClick: function onClick() {
        return setInAppNotifs(function (p) {
          return p.map(function (x) {
            return x.id === n.id ? _objectSpread(_objectSpread({}, x), {}, {
              lida: true
            }) : x;
          });
        });
      },
      style: {
        padding: '10px 14px',
        borderBottom: "1px solid ".concat(A.border),
        background: n.lida ? 'transparent' : 'rgba(217,119,6,0.04)',
        cursor: 'pointer',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start'
      }
    }, !n.lida && /*#__PURE__*/React.createElement("div", {
      style: {
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: A.orange,
        marginTop: 4,
        flexShrink: 0
      }
    }), n.lida && /*#__PURE__*/React.createElement("div", {
      style: {
        width: 7,
        height: 7,
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontWeight: n.lida ? 600 : 800,
        fontSize: 13,
        color: A.text
      }
    }, n.msg), n.sub && /*#__PURE__*/React.createElement("p", {
      style: {
        color: A.muted,
        fontSize: 11,
        marginTop: 1
      }
    }, n.sub), /*#__PURE__*/React.createElement("p", {
      style: {
        color: A.muted,
        fontSize: 10,
        marginTop: 3
      }
    }, n.time)));
  }), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      addToast('🔔 Teste de aviso!', 'Assim aparecem os avisos na app', 'aviso');
    },
    style: {
      width: '100%',
      background: 'none',
      border: 'none',
      borderTop: "1px solid ".concat(A.border),
      padding: '10px',
      color: A.orange,
      fontSize: 12,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "\uD83D\uDD14 Testar aviso agora")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 12px',
      display: 'flex',
      gap: 8
    }
  }, [{
    l: 'Abertos',
    v: totalAbertos,
    c: A.orange
  }, {
    l: 'Em curso',
    v: totalEmCurso,
    c: A.blue
  }, {
    l: 'Concluídos',
    v: totalConcluidos,
    c: A.green
  }, {
    l: 'CHF Semana',
    v: chfSem.toLocaleString('pt-PT'),
    c: A.gold
  }].map(function (s) {
    return /*#__PURE__*/React.createElement(ACard, {
      key: s.l,
      style: {
        flex: 1,
        padding: '10px 8px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: A.muted,
        fontSize: 8,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.4px'
      }
    }, s.l), /*#__PURE__*/React.createElement("p", {
      style: {
        color: s.c,
        fontSize: s.l === 'CHF Semana' ? 13 : 20,
        fontWeight: 900,
        marginTop: 3
      }
    }, s.v));
  })), weeklyChart.length > 0 && /*#__PURE__*/React.createElement(ACard, {
    style: {
      padding: '14px 12px',
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: A.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: 10
    }
  }, "\uD83D\uDCC8 Ganhos por semana (CHF)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 6,
      height: 90
    }
  }, function () {
    var maxChf = Math.max.apply(Math, weeklyChart.map(function (w) {
      return w.chf;
    }).concat([1]));
    return weeklyChart.map(function (w) {
      var d = new Date(w.week + 'T12:00:00');
      var label = "".concat(d.getDate(), "/").concat(d.getMonth() + 1);
      var h = Math.max(4, w.chf / maxChf * 70);
      return /*#__PURE__*/React.createElement("div", {
        key: w.week,
        style: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4
        }
      }, /*#__PURE__*/React.createElement("p", {
        style: {
          color: A.gold,
          fontSize: 9,
          fontWeight: 800
        }
      }, w.chf), /*#__PURE__*/React.createElement("div", {
        style: {
          width: '100%',
          maxWidth: 26,
          height: h,
          borderRadius: 5,
          background: "linear-gradient(180deg, ".concat(A.gold, ", ").concat(A.orange, ")")
        }
      }), /*#__PURE__*/React.createElement("p", {
        style: {
          color: A.muted,
          fontSize: 8,
          fontWeight: 600
        }
      }, label));
    });
  }())), sharedDias.filter(function (d) {
    return d.date.startsWith('2026-06');
  }).length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 16px 10px',
      background: 'rgba(59,130,246,0.08)',
      border: '1px solid rgba(59,130,246,0.2)',
      borderRadius: 14,
      padding: '10px 14px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: A.blue,
      fontWeight: 800,
      fontSize: 11,
      marginBottom: 6
    }
  }, "\uD83D\uDCC5 Dias indispon\xEDveis"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 5
    }
  }, sharedDias.filter(function (d) {
    return d.date.startsWith('2026-06');
  }).map(function (d, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        background: 'rgba(59,130,246,0.12)',
        border: '1px solid rgba(59,130,246,0.25)',
        borderRadius: 8,
        padding: '2px 8px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        color: A.blue
      }
    }, new Date(d.date + 'T12:00:00').toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'short'
    }), " ", d.tipo === 'feriado' ? '🎌' : d.tipo === 'ferias' ? '🏖' : '✅'));
  }))), calView === 'cal' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 12px'
    }
  }, function () {
    var calMo = new Date(curDate.getFullYear(), curDate.getMonth(), 1);
    var daysInMo = new Date(calMo.getFullYear(), calMo.getMonth() + 1, 0).getDate();
    var firstDow = (new Date(calMo).getDay() + 6) % 7; // 0=Seg
    var getWeekNum = function getWeekNum(d) {
      var date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      var dayNum = date.getUTCDay() || 7;
      date.setUTCDate(date.getUTCDate() + 4 - dayNum);
      var yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
      return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
    };
    var prevMo = function prevMo() {
      return setCurDate(function (d) {
        var n = new Date(d);
        n.setMonth(n.getMonth() - 1);
        n.setDate(1);
        return n;
      });
    };
    var nextMo = function nextMo() {
      return setCurDate(function (d) {
        var n = new Date(d);
        n.setMonth(n.getMonth() + 1);
        n.setDate(1);
        return n;
      });
    };
    var moName = curDate.toLocaleDateString('pt-PT', {
      month: 'long',
      year: 'numeric'
    }).replace(/^\w/, function (c) {
      return c.toUpperCase();
    });

    // Build weeks
    var cells = [];
    for (var i = 0; i < firstDow; i++) cells.push(null);
    for (var d = 1; d <= daysInMo; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    var weeks = [];
    for (var _i = 0; _i < cells.length; _i += 7) weeks.push(cells.slice(_i, _i + 7));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: A.surface,
        borderRadius: 18,
        border: "1px solid ".concat(A.border),
        overflow: 'hidden',
        marginBottom: 12,
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: "1px solid ".concat(A.border)
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: prevMo,
      style: {
        background: A.surface2,
        border: "1px solid ".concat(A.border),
        borderRadius: 9,
        width: 34,
        height: 34,
        color: A.orange,
        fontSize: 18,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700
      }
    }, "\u2039"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontWeight: 800,
        fontSize: 15,
        color: A.text
      }
    }, moName), /*#__PURE__*/React.createElement("button", {
      onClick: nextMo,
      style: {
        background: A.surface2,
        border: "1px solid ".concat(A.border),
        borderRadius: 9,
        width: 34,
        height: 34,
        color: A.orange,
        fontSize: 18,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700
      }
    }, "\u203A")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '32px repeat(7,1fr)',
        padding: '6px 8px 4px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        fontSize: 9,
        color: A.muted,
        fontWeight: 700
      }
    }, "Sem"), ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(function (d) {
      return /*#__PURE__*/React.createElement("div", {
        key: d,
        style: {
          textAlign: 'center',
          fontSize: 9,
          color: A.muted,
          fontWeight: 700,
          padding: '2px 0'
        }
      }, d);
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 8px 10px'
      }
    }, weeks.map(function (week, wi) {
      var firstReal = week.find(function (d) {
        return d;
      });
      var weekDate = firstReal ? new Date(curDate.getFullYear(), curDate.getMonth(), firstReal) : null;
      var weekNum = weekDate ? getWeekNum(weekDate) : '';
      return /*#__PURE__*/React.createElement("div", {
        key: wi,
        style: {
          display: 'grid',
          gridTemplateColumns: '32px repeat(7,1fr)',
          marginBottom: 3
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 9,
          fontWeight: 800,
          color: A.muted,
          background: A.surface2,
          borderRadius: 5,
          padding: '2px 4px'
        }
      }, weekNum)), week.map(function (day, di) {
        if (!day) return /*#__PURE__*/React.createElement("div", {
          key: di
        });
        var dStr = "".concat(curDate.getFullYear(), "-").concat(String(curDate.getMonth() + 1).padStart(2, '0'), "-").concat(String(day).padStart(2, '0'));
        var dayAppts = appts.filter(function (a) {
          return a.date === dStr && (filter === 'Todos' || a.status === filter.toLowerCase());
        });
        var hasAppt = appts.some(function (a) {
          return a.date === dStr;
        });
        var isSel = dStr === todayStr;
        var isWeekend = di >= 5;
        var statusColors = _toConsumableArray(new Set(appts.filter(function (a) {
          return a.date === dStr;
        }).map(function (a) {
          var _STATUS$a$status;
          return (_STATUS$a$status = STATUS[a.status]) === null || _STATUS$a$status === void 0 ? void 0 : _STATUS$a$status.color;
        }))).slice(0, 3);
        return /*#__PURE__*/React.createElement("div", {
          key: di,
          onClick: function onClick() {
            return setCurDate(new Date(dStr + 'T12:00:00'));
          },
          style: {
            textAlign: 'center',
            padding: '4px 1px',
            borderRadius: 9,
            cursor: 'pointer',
            background: isSel ? A.orange : 'transparent',
            border: hasAppt && !isSel ? "1px solid rgba(217,119,6,0.25)" : '1px solid transparent',
            minHeight: 38,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 12,
            fontWeight: isSel || hasAppt ? 800 : 400,
            color: isSel ? '#fff' : isWeekend ? A.orange : A.text,
            lineHeight: 1.4
          }
        }, day), hasAppt && !isSel && /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            gap: 2,
            justifyContent: 'center'
          }
        }, statusColors.map(function (c, ci) {
          return /*#__PURE__*/React.createElement("div", {
            key: ci,
            style: {
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: c
            }
          });
        })), hasAppt && isSel && /*#__PURE__*/React.createElement("div", {
          style: {
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.7)'
          }
        }));
      }));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '8px 14px 12px',
        borderTop: "1px solid ".concat(A.border),
        background: A.surface2
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontWeight: 800,
        fontSize: 13,
        color: A.text
      }
    }, curDate.toLocaleDateString('pt-PT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).replace(/^\w/, function (c) {
      return c.toUpperCase();
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: A.muted,
        fontWeight: 400,
        fontSize: 12
      }
    }, " \xB7 ", appts.filter(function (a) {
      return a.date === todayStr;
    }).length, " marca\xE7\xE3o(\xF5es)"))));
  }()), showMonteurs && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 500,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      setShowMonteurs(false);
      setEditMonteur(null);
    },
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      background: A.surface,
      borderRadius: '22px 22px 0 0',
      border: "2px solid ".concat(A.orange),
      borderBottom: 'none',
      padding: '20px 16px 32px',
      maxHeight: '85vh',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: A.orange,
      fontWeight: 800,
      fontSize: 16
    }
  }, "\uD83D\uDC77 Monteurs"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setEditMonteur('new');
      setMForm({
        name: '',
        emoji: '👷',
        tel: '',
        notif: true,
        cor: A.blue
      });
      setMonteurSaveErr('');
    },
    style: {
      background: "linear-gradient(135deg,".concat(A.orange, ",#FB923C)"),
      border: 'none',
      borderRadius: 10,
      padding: '7px 14px',
      color: '#fff',
      fontSize: 13,
      fontWeight: 800,
      cursor: 'pointer'
    }
  }, "\uFF0B Novo")), editMonteur && /*#__PURE__*/React.createElement("div", {
    style: {
      background: A.surface2,
      borderRadius: 16,
      padding: '14px',
      marginBottom: 14,
      border: "1px solid ".concat(A.border)
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: A.orange,
      fontWeight: 700,
      fontSize: 13,
      marginBottom: 12
    }
  }, editMonteur === 'new' ? 'Novo monteur' : 'Editar monteur'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginBottom: 10
    }
  }, ['👷', '👨‍🔧', '🧑‍🔧', '👩‍🔧', '🧑‍💼', '👨', '👩'].map(function (e) {
    return /*#__PURE__*/React.createElement("button", {
      key: e,
      onClick: function onClick() {
        return setMForm(function (p) {
          return _objectSpread(_objectSpread({}, p), {}, {
            emoji: e
          });
        });
      },
      style: {
        flex: 1,
        background: mForm.emoji === e ? "".concat(A.orange, "22") : A.surface,
        border: "1px solid ".concat(mForm.emoji === e ? A.orange : A.border),
        borderRadius: 8,
        padding: '6px 2px',
        fontSize: 16,
        cursor: 'pointer'
      }
    }, e);
  })), /*#__PURE__*/React.createElement("input", {
    value: mForm.name,
    onChange: function onChange(e) {
      return setMForm(function (p) {
        return _objectSpread(_objectSpread({}, p), {}, {
          name: e.target.value
        });
      });
    },
    placeholder: "Nome do monteur",
    style: {
      width: '100%',
      background: A.surface,
      border: "1px solid ".concat(A.border),
      borderRadius: 10,
      padding: '10px 12px',
      color: A.text,
      fontSize: 14,
      outline: 'none',
      marginBottom: 8,
      boxSizing: 'border-box'
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: mForm.tel,
    onChange: function onChange(e) {
      return setMForm(function (p) {
        return _objectSpread(_objectSpread({}, p), {}, {
          tel: e.target.value
        });
      });
    },
    placeholder: "Telefone (opcional)",
    style: {
      width: '100%',
      background: A.surface,
      border: "1px solid ".concat(A.border),
      borderRadius: 10,
      padding: '10px 12px',
      color: A.text,
      fontSize: 14,
      outline: 'none',
      marginBottom: 10,
      boxSizing: 'border-box'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      padding: '8px 12px',
      background: A.surface,
      borderRadius: 10,
      border: "1px solid ".concat(A.border)
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontWeight: 700,
      fontSize: 13,
      color: A.text
    }
  }, "\uD83D\uDD14 Notifica\xE7\xF5es"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: A.muted,
      fontSize: 11
    }
  }, "Recebe avisos de marca\xE7\xF5es")), /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      return setMForm(function (p) {
        return _objectSpread(_objectSpread({}, p), {}, {
          notif: !p.notif
        });
      });
    },
    style: {
      width: 44,
      height: 24,
      borderRadius: 12,
      background: mForm.notif ? A.green : '#D0CEC8',
      border: "1px solid ".concat(mForm.notif ? A.green : A.border),
      position: 'relative',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 3,
      left: mForm.notif ? 22 : 3,
      width: 16,
      height: 16,
      borderRadius: '50%',
      background: '#fff',
      transition: 'left 0.2s'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginBottom: 12
    }
  }, [A.orange, A.blue, A.green, '#A855F7', '#EF4444', A.gold].map(function (c) {
    return /*#__PURE__*/React.createElement("div", {
      key: c,
      onClick: function onClick() {
        return setMForm(function (p) {
          return _objectSpread(_objectSpread({}, p), {}, {
            cor: c
          });
        });
      },
      style: {
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: c,
        cursor: 'pointer',
        border: mForm.cor === c ? "3px solid ".concat(A.text) : '3px solid transparent'
      }
    });
  })), monteurSaveErr && /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#DC2626',
      fontSize: 12,
      marginBottom: 8
    }
  }, monteurSaveErr), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setEditMonteur(null);
    },
    style: {
      flex: 1,
      background: A.surface,
      border: "1px solid ".concat(A.border),
      borderRadius: 10,
      padding: '10px',
      color: A.muted,
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    onClick: saveMonteur,
    disabled: monteurSaving,
    style: {
      flex: 2,
      background: monteurSaving ? A.surface2 : "linear-gradient(135deg,".concat(A.orange, ",#FB923C)"),
      border: 'none',
      borderRadius: 10,
      padding: '10px',
      color: monteurSaving ? A.muted : '#fff',
      fontSize: 13,
      fontWeight: 800,
      cursor: monteurSaving ? 'default' : 'pointer'
    }
  }, monteurSaving ? 'A guardar…' : "\u2713 Guardar"))), monteurs.map(function (m) {
    return /*#__PURE__*/React.createElement("div", {
      key: m.id,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        background: A.surface2,
        borderRadius: 14,
        marginBottom: 8,
        border: "1px solid ".concat(A.border),
        borderLeft: "4px solid ".concat(m.cor)
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 24
      }
    }, m.emoji), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontWeight: 800,
        fontSize: 15,
        color: A.text
      }
    }, m.name), m.tel && /*#__PURE__*/React.createElement("p", {
      style: {
        color: A.muted,
        fontSize: 12,
        marginTop: 1
      }
    }, "\uD83D\uDCDE ", m.tel), /*#__PURE__*/React.createElement("p", {
      style: {
        color: m.notif ? A.green : A.muted,
        fontSize: 11,
        marginTop: 2,
        fontWeight: 600
      }
    }, m.notif ? '🔔 Notificações ativas' : '🔕 Sem notificações')), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setEditMonteur(m.id);
        setMForm(_objectSpread({}, m));
        setMonteurSaveErr('');
      },
      style: {
        background: A.surface,
        border: "1px solid ".concat(A.border),
        borderRadius: 8,
        padding: '6px 10px',
        cursor: 'pointer',
        color: A.muted,
        fontSize: 13
      }
    }, "\u270F\uFE0F"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return deleteMonteurDb(m.id, m.name);
      },
      style: {
        background: 'rgba(220,38,38,0.08)',
        border: '1px solid rgba(220,38,38,0.2)',
        borderRadius: 8,
        padding: '6px 10px',
        cursor: 'pointer',
        color: A.red,
        fontSize: 13
      }
    }, "\uD83D\uDDD1")));
  }), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setShowMonteurs(false);
      setEditMonteur(null);
    },
    style: {
      width: '100%',
      background: 'none',
      border: "1px solid ".concat(A.border),
      borderRadius: 14,
      padding: '13px',
      color: A.orange,
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
      marginTop: 8
    }
  }, "\u2713 Fechar")))  , showManageProj && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 500,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      setShowManageProj(false);
      setEditProjId(null);
    },
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      background: A.surface,
      borderRadius: '22px 22px 0 0',
      border: "2px solid ".concat(A.orange),
      borderBottom: 'none',
      padding: '20px 16px 32px',
      maxHeight: '85vh',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: A.orange,
      fontWeight: 800,
      fontSize: 16
    }
  }, "\uD83D\uDCC1 Projetos"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setEditProjId('new');
      setPFormName('');
      setProjManageErr('');
    },
    style: {
      background: "linear-gradient(135deg,".concat(A.orange, ",#FB923C)"),
      border: 'none',
      borderRadius: 10,
      padding: '7px 14px',
      color: '#fff',
      fontSize: 13,
      fontWeight: 800,
      cursor: 'pointer'
    }
  }, "\uFF0B Novo")), editProjId && /*#__PURE__*/React.createElement("div", {
    style: {
      background: A.surface2,
      borderRadius: 16,
      padding: '14px',
      marginBottom: 14,
      border: "1px solid ".concat(A.border)
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: A.orange,
      fontWeight: 700,
      fontSize: 13,
      marginBottom: 12
    }
  }, editProjId === 'new' ? 'Novo projeto' : 'Editar projeto'), /*#__PURE__*/React.createElement("input", {
    value: pFormName,
    onChange: function onChange(e) {
      return setPFormName(e.target.value);
    },
    placeholder: "Nome do projeto",
    style: {
      width: '100%',
      background: A.surface,
      border: "1px solid ".concat(A.border),
      borderRadius: 10,
      padding: '10px 12px',
      color: A.text,
      fontSize: 14,
      outline: 'none',
      marginBottom: 10,
      boxSizing: 'border-box'
    }
  }), projManageErr && /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#DC2626',
      fontSize: 12,
      marginBottom: 8
    }
  }, projManageErr), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setEditProjId(null);
    },
    style: {
      flex: 1,
      background: A.surface,
      border: "1px solid ".concat(A.border),
      borderRadius: 10,
      padding: '10px',
      color: A.muted,
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    onClick: saveProjectManage,
    disabled: projManageBusy,
    style: {
      flex: 2,
      background: projManageBusy ? A.surface2 : "linear-gradient(135deg,".concat(A.orange, ",#FB923C)"),
      border: 'none',
      borderRadius: 10,
      padding: '10px',
      color: projManageBusy ? A.muted : '#fff',
      fontSize: 13,
      fontWeight: 800,
      cursor: projManageBusy ? 'default' : 'pointer'
    }
  }, projManageBusy ? 'A guardar…' : "\u2713 Guardar"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, projList.length === 0 && /*#__PURE__*/React.createElement("p", {
    style: {
      color: A.muted,
      fontSize: 13,
      textAlign: 'center',
      padding: '20px 0'
    }
  }, "Sem projetos ainda."), projList.map(function (p) {
    return /*#__PURE__*/React.createElement("div", {
      key: p.id,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 14px',
        background: A.surface2,
        borderRadius: 14,
        border: "1px solid ".concat(A.border)
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        flex: 1,
        fontWeight: 700,
        fontSize: 14,
        color: A.text
      }
    }, p.name), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setEditProjId(p.id);
        setPFormName(p.name);
        setProjManageErr('');
      },
      style: {
        background: A.surface,
        border: "1px solid ".concat(A.border),
        borderRadius: 8,
        padding: '6px 10px',
        fontSize: 13,
        color: A.muted,
        cursor: 'pointer'
      }
    }, "\u270F\uFE0F"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return deleteProjectManage(p.id, p.name);
      },
      style: {
        background: 'rgba(220,38,38,0.08)',
        border: '1px solid rgba(220,38,38,0.25)',
        borderRadius: 8,
        padding: '6px 10px',
        fontSize: 13,
        color: '#DC2626',
        cursor: 'pointer'
      }
    }, "\uD83D\uDDD1\uFE0F"));
  })), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setShowManageProj(false);
      setEditProjId(null);
    },
    style: {
      width: '100%',
      marginTop: 16,
      background: 'none',
      border: "1px solid ".concat(A.border),
      borderRadius: 12,
      padding: '12px',
      color: A.muted,
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "Fechar")))
, showAdd && /*#__PURE__*/React.createElement("div", {
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
      return setShowAdd(false);
    },
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      background: A.surface,
      borderRadius: '22px 22px 0 0',
      border: "2px solid ".concat(A.orange),
      borderBottom: 'none',
      boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
      padding: '20px 16px 32px',
      maxHeight: '90vh',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: A.orange,
      fontWeight: 800,
      fontSize: 16,
      marginBottom: 16
    }
  }, editId ? 'Editar compromisso' : 'Novo compromisso'), /*#__PURE__*/React.createElement("label", {
    htmlFor: "partilhado-toggle",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: form.partilhado ? "".concat(A.orange, "12") : A.surface2,
      border: "1px solid ".concat(form.partilhado ? A.orange : A.border),
      borderRadius: 12,
      padding: '10px 12px',
      marginBottom: 14,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    id: "partilhado-toggle",
    checked: !!form.partilhado,
    onChange: function onChange(e) {
      return setForm(function (p) {
        return _objectSpread(_objectSpread({}, p), {}, {
          partilhado: e.target.checked
        });
      });
    },
    style: {
      width: 17,
      height: 17,
      accentColor: A.orange
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: { fontSize: 16 }
  }, "\uD83C\uDFE0"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: A.text
    }
  }, "Partilhar com a fam\xEDlia"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 11,
      color: A.muted,
      marginTop: 1
    }
  }, "Aparece tamb\xE9m na app Fam\xEDlia"))), form.partilhado && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginBottom: 14,
      flexWrap: 'wrap'
    }
  }, [{
    id: 'todos',
    nome: 'Toda a família',
    emoji: '👥'
  }, {
    id: 'patricio',
    nome: 'Patricio',
    emoji: '👨‍💼'
  }, {
    id: 'esposa',
    nome: 'Cristina',
    emoji: '👩'
  }, {
    id: 'lucas',
    nome: 'Lucas',
    emoji: '👦'
  }, {
    id: 'liam',
    nome: 'Liam',
    emoji: '👦'
  }].map(function (p) {
    var isSel = (form.partilhadoCom || 'todos') === p.id;
    return /*#__PURE__*/React.createElement("button", {
      key: p.id,
      onClick: function onClick() {
        return setForm(function (prev) {
          return _objectSpread(_objectSpread({}, prev), {}, {
            partilhadoCom: p.id
          });
        });
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        background: isSel ? "".concat(A.orange, "18") : A.surface2,
        border: "1px solid ".concat(isSel ? A.orange : A.border),
        borderRadius: 18,
        padding: '6px 11px',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: { fontSize: 13 }
    }, p.emoji), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: isSel ? A.orange : A.muted
      }
    }, p.nome));
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      color: A.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 8
    }
  }, "Categoria"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginBottom: 14,
      flexWrap: 'wrap'
    }
  }, Object.keys(CATEGORIAS).map(function (catKey) {
    var cat = CATEGORIAS[catKey];
    var isSel = form.categoria === catKey;
    return /*#__PURE__*/React.createElement("button", {
      key: catKey,
      onClick: function onClick() {
        return setForm(function (p) {
          return _objectSpread(_objectSpread({}, p), {}, {
            categoria: catKey
          });
        });
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        background: isSel ? "".concat(cat.color, "18") : A.surface2,
        border: "1px solid ".concat(isSel ? cat.color : A.border),
        borderRadius: 20,
        padding: '6px 12px',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: { fontSize: 13 }
    }, cat.emoji), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: isSel ? cat.color : A.muted
      }
    }, cat.label));
  })), [{
    l: 'Data',
    k: 'date',
    type: 'date'
  }, {
    l: 'Início',
    k: 'hi',
    type: 'time'
  }, {
    l: 'Fim',
    k: 'hf',
    type: 'time'
  }, {
    l: 'Morada',
    k: 'morada',
    type: 'text',
    ph: 'Ex: Däderizstrasse 21'
  }, {
    l: 'CHF',
    k: 'chf',
    type: 'number',
    ph: 'Ex: 599'
  }, {
    l: 'Nota',
    k: 'nota',
    type: 'text',
    ph: 'Informação adicional'
  }].map(function (f) {
    return /*#__PURE__*/React.createElement("div", {
      key: f.k,
      style: {
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: A.muted,
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 4
      }
    }, f.l), /*#__PURE__*/React.createElement("input", {
      type: f.type,
      value: form[f.k],
      onChange: function onChange(e) {
        return setForm(function (p) {
          return _objectSpread(_objectSpread({}, p), {}, _defineProperty({}, f.k, e.target.value));
        });
      },
      placeholder: f.ph || '',
      style: {
        width: '100%',
        background: A.surface2,
        border: "1px solid ".concat(A.border),
        borderRadius: 12,
        padding: '11px 14px',
        color: A.text,
        fontSize: 14,
        outline: 'none',
        boxSizing: 'border-box'
      }
    }));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: A.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase'
    }
  }, "Projeto"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setShowAddProjInline(function (v) {
        return !v;
      });
      setProjAddErr('');
      setNewProjNameInline('');
    },
    style: {
      background: 'none',
      border: 'none',
      color: A.orange,
      fontSize: 11,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, showAddProjInline ? 'Cancelar' : '+ Novo')), showAddProjInline && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: newProjNameInline,
    onChange: function onChange(e) {
      return setNewProjNameInline(e.target.value);
    },
    placeholder: 'Nome do novo projeto',
    style: {
      flex: 1,
      background: A.surface2,
      border: "1px solid ".concat(A.border),
      borderRadius: 10,
      padding: '9px 12px',
      color: A.text,
      fontSize: 13,
      outline: 'none',
      boxSizing: 'border-box'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: addProjectInline,
    disabled: projAddBusy,
    style: {
      background: projAddBusy ? A.surface2 : A.orange,
      border: 'none',
      borderRadius: 10,
      padding: '9px 14px',
      color: '#fff',
      fontSize: 13,
      fontWeight: 800,
      cursor: projAddBusy ? 'default' : 'pointer'
    }
  }, projAddBusy ? '…' : '✓')), projAddErr && /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#DC2626',
      fontSize: 11.5,
      marginBottom: 6
    }
  }, projAddErr), /*#__PURE__*/React.createElement("select", {
    value: form.proj,
    onChange: function onChange(e) {
      return setForm(function (p) {
        return _objectSpread(_objectSpread({}, p), {}, {
          proj: e.target.value
        });
      });
    },
    style: {
      width: '100%',
      background: A.surface2,
      border: "1px solid ".concat(A.border),
      borderRadius: 12,
      padding: '11px 14px',
      color: A.text,
      fontSize: 14,
      outline: 'none'
    }
  }, projList.map(function (p) {
    return /*#__PURE__*/React.createElement("option", {
      key: p.id
    }, p.name);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: A.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase'
    }
  }, "Monteur"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowMonteurs(true);
    },
    style: {
      background: 'none',
      border: 'none',
      color: A.orange,
      fontSize: 11,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "+ Gerir")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, monteurs.map(function (m) {
    return /*#__PURE__*/React.createElement("div", {
      key: m.id,
      onClick: function onClick() {
        return setForm(function (p) {
          return _objectSpread(_objectSpread({}, p), {}, {
            monteur: m.name
          });
        });
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        background: form.monteur === m.name ? "".concat(m.cor, "18") : A.surface2,
        border: "1px solid ".concat(form.monteur === m.name ? m.cor : A.border),
        borderRadius: 12,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18
      }
    }, m.emoji), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontWeight: 700,
        fontSize: 14,
        color: A.text
      }
    }, m.name), m.tel && /*#__PURE__*/React.createElement("p", {
      style: {
        color: A.muted,
        fontSize: 11
      }
    }, m.tel)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5
      }
    }, m.notif && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: A.green
      }
    }, "\uD83D\uDD14"), form.monteur === m.name && /*#__PURE__*/React.createElement("span", {
      style: {
        color: m.cor,
        fontSize: 16,
        fontWeight: 800
      }
    }, "\u2713")));
  }))), /*#__PURE__*/React.createElement("p", {
    style: {
      color: A.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 8
    }
  }, "Estado"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      marginBottom: 16
    }
  }, Object.entries(STATUS).map(function (_ref15) {
    var _ref16 = _slicedToArray(_ref15, 2),
      k = _ref16[0],
      s = _ref16[1];
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      onClick: function onClick() {
        return setForm(function (p) {
          return _objectSpread(_objectSpread({}, p), {}, {
            status: k
          });
        });
      },
      style: {
        flex: 1,
        background: form.status === k ? s.bg : A.surface2,
        border: "1px solid ".concat(form.status === k ? s.color : A.border),
        borderRadius: 10,
        padding: '8px 4px',
        color: form.status === k ? s.color : A.muted,
        fontSize: 10,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, s.icon, /*#__PURE__*/React.createElement("br", null), s.label);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(22,163,74,0.08)',
      border: '1px solid rgba(22,163,74,0.2)',
      borderRadius: 12,
      padding: '10px 14px',
      marginBottom: 14,
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16
    }
  }, "\uD83D\uDD14"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: A.green,
      fontSize: 12,
      fontWeight: 700
    }
  }, "Aviso ", avisoMin, " min antes (configur\xE1vel no painel)")), saveErr && /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#EF4444',
      fontSize: 12.5,
      lineHeight: 1.4,
      marginBottom: 10,
      padding: '8px 10px',
      background: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.25)',
      borderRadius: 10
    }
  }, "\u26A0\uFE0F ", saveErr), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowAdd(false);
    },
    style: {
      flex: 1,
      background: A.surface2,
      border: "1px solid ".concat(A.border),
      borderRadius: 14,
      padding: '13px',
      color: A.muted,
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    onClick: saveForm,
    disabled: saving,
    style: {
      flex: 2,
      background: saving ? A.surface2 : "linear-gradient(135deg,".concat(A.orange, ",#FB923C)"),
      border: 'none',
      borderRadius: 14,
      padding: '13px',
      color: saving ? A.muted : '#fff',
      fontSize: 14,
      fontWeight: 800,
      cursor: saving ? 'default' : 'pointer',
      boxShadow: saving ? 'none' : '0 4px 14px rgba(249,115,22,0.3)'
    }
  }, saving ? 'A guardar…' : "\u2713 " + (editId ? 'Guardar' : 'Adicionar'))))), calView === 'graficos' && (function () {
    var y = curDate.getFullYear();
    var mo2 = curDate.getMonth();
    var prefix = "".concat(y, "-").concat(String(mo2 + 1).padStart(2, '0'));
    var doMes = appts.filter(function (a) {
      return a.date && a.date.indexOf(prefix) === 0;
    });
    var porCategoria = {};
    Object.keys(CATEGORIAS).forEach(function (c) {
      porCategoria[c] = 0;
    });
    doMes.forEach(function (a) {
      var c = a.categoria || 'trabalho';
      porCategoria[c] = (porCategoria[c] || 0) + 1;
    });
    var horasSemana = [0, 0, 0, 0, 0];
    var escolaSemana = [0, 0, 0, 0, 0];
    doMes.forEach(function (a) {
      var dia = parseInt(a.date.slice(8, 10));
      var w = Math.min(4, Math.floor((dia - 1) / 7));
      if ((a.categoria || 'trabalho') === 'trabalho' && a.hi && a.hf) {
        try {
          horasSemana[w] += calcHoras(a.hi, a.hf);
        } catch (e) {}
      }
      if ((a.categoria || 'trabalho') === 'escola') escolaSemana[w]++;
    });
    var maxCat = Math.max.apply(Math, Object.values(porCategoria).concat([1]));
    var maxHoras = Math.max.apply(Math, horasSemana.concat([1]));
    var maxEscola = Math.max.apply(Math, escolaSemana.concat([1]));
    return /*#__PURE__*/React.createElement("div", {
      style: { padding: '0 16px 20px' }
    }, /*#__PURE__*/React.createElement(ACard, {
      style: { padding: '16px', marginBottom: 12 }
    }, /*#__PURE__*/React.createElement("p", {
      style: { color: A.text, fontWeight: 800, fontSize: 14, marginBottom: 4 }
    }, "\uD83D\uDCCA Marca\xE7\xF5es por categoria"), /*#__PURE__*/React.createElement("p", {
      style: { color: A.muted, fontSize: 11, marginBottom: 14 }
    }, curDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' }), " \xB7 ", doMes.length, " no total"), /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', alignItems: 'flex-end', gap: 12, height: 100 }
    }, Object.keys(CATEGORIAS).map(function (catKey) {
      var cat = CATEGORIAS[catKey];
      var val = porCategoria[catKey] || 0;
      var h = Math.max(4, val / maxCat * 80);
      return /*#__PURE__*/React.createElement("div", {
        key: catKey,
        style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }
      }, /*#__PURE__*/React.createElement("p", {
        style: { fontSize: 12, fontWeight: 800, color: cat.color }
      }, val), /*#__PURE__*/React.createElement("div", {
        style: { width: '100%', maxWidth: 36, height: h, background: cat.color, borderRadius: '6px 6px 0 0' }
      }), /*#__PURE__*/React.createElement("span", {
        style: { fontSize: 14 }
      }, cat.emoji));
    }))), /*#__PURE__*/React.createElement(ACard, {
      style: { padding: '16px', marginBottom: 12 }
    }, /*#__PURE__*/React.createElement("p", {
      style: { color: A.text, fontWeight: 800, fontSize: 14, marginBottom: 4 }
    }, "\uD83D\uDCBC Horas de trabalho por semana"), /*#__PURE__*/React.createElement("p", {
      style: { color: A.muted, fontSize: 11, marginBottom: 14 }
    }, "Calculado a partir das marca\xE7\xF5es de trabalho"), /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', alignItems: 'flex-end', gap: 10, height: 90 }
    }, horasSemana.map(function (val, wi) {
      var h = Math.max(4, val / maxHoras * 70);
      return /*#__PURE__*/React.createElement("div", {
        key: wi,
        style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }
      }, /*#__PURE__*/React.createElement("p", {
        style: { fontSize: 11, fontWeight: 800, color: CATEGORIAS.trabalho.color }
      }, val.toFixed(1), "h"), /*#__PURE__*/React.createElement("div", {
        style: { width: '100%', maxWidth: 30, height: h, background: CATEGORIAS.trabalho.color, borderRadius: '6px 6px 0 0' }
      }), /*#__PURE__*/React.createElement("span", {
        style: { fontSize: 10, color: A.muted, fontWeight: 700 }
      }, "S", wi + 1));
    }))), /*#__PURE__*/React.createElement(ACard, {
      style: { padding: '16px' }
    }, /*#__PURE__*/React.createElement("p", {
      style: { color: A.text, fontWeight: 800, fontSize: 14, marginBottom: 4 }
    }, "\uD83D\uDCDA Eventos escolares por semana"), /*#__PURE__*/React.createElement("p", {
      style: { color: A.muted, fontSize: 11, marginBottom: 14 }
    }, "Testes enviados pela Agenda Escolar"), /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', alignItems: 'flex-end', gap: 10, height: 90 }
    }, escolaSemana.map(function (val, wi) {
      var h = Math.max(4, val / maxEscola * 70);
      return /*#__PURE__*/React.createElement("div", {
        key: wi,
        style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }
      }, /*#__PURE__*/React.createElement("p", {
        style: { fontSize: 11, fontWeight: 800, color: CATEGORIAS.escola.color }
      }, val), /*#__PURE__*/React.createElement("div", {
        style: { width: '100%', maxWidth: 30, height: h, background: CATEGORIAS.escola.color, borderRadius: '6px 6px 0 0' }
      }), /*#__PURE__*/React.createElement("span", {
        style: { fontSize: 10, color: A.muted, fontWeight: 700 }
      }, "S", wi + 1));
    }))));
  })(), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 20px'
    }
  }, filtered.length === 0 && /*#__PURE__*/React.createElement(ACard, {
    style: {
      padding: '32px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 32
    }
  }, "\uD83D\uDCCB"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: A.muted,
      fontSize: 14,
      marginTop: 8
    }
  }, "Nenhum compromisso encontrado")), sortedDates.map(function (date) {
    return /*#__PURE__*/React.createElement("div", {
      key: date,
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: A.text,
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        marginBottom: 8,
        paddingLeft: 2
      }
    }, new Date(date + 'T12:00:00').toLocaleDateString('pt-PT', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    }).replace(/^\w/, function (c) {
      return c.toUpperCase();
    })), grouped[date].map(function (a) {
      var st = STATUS[a.status];
      var isOpen = openId === a.id;
      return /*#__PURE__*/React.createElement(ACard, {
        key: a.id,
        style: {
          marginBottom: 10,
          borderLeft: "4px solid ".concat(st.color),
          overflow: 'hidden'
        }
      }, /*#__PURE__*/React.createElement("div", {
        onClick: function onClick() {
          return setOpenId(isOpen ? null : a.id);
        },
        style: {
          padding: '14px 16px',
          cursor: 'pointer'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 8
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flexWrap: 'wrap'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 12,
          color: A.muted
        }
      }, "\uD83D\uDD50 ", a.hi, "\u2013", a.hf), /*#__PURE__*/React.createElement("div", {
        style: {
          background: "".concat(projColor(a.proj), "22"),
          border: "1px solid ".concat(projColor(a.proj), "44"),
          borderRadius: 7,
          padding: '2px 9px'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          fontWeight: 800,
          color: projColor(a.proj)
        }
      }, a.proj)), /*#__PURE__*/React.createElement("div", {
        style: {
          background: st.bg,
          border: "1px solid ".concat(st.color, "44"),
          borderRadius: 7,
          padding: '2px 9px'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          fontWeight: 700,
          color: st.color
        }
      }, st.icon, " ", st.label))), /*#__PURE__*/React.createElement("p", {
        style: {
          color: A.green,
          fontWeight: 900,
          fontSize: 16,
          flexShrink: 0
        }
      }, "CHF ", a.chf)), /*#__PURE__*/React.createElement("p", {
        style: {
          fontWeight: 800,
          fontSize: 16,
          color: A.text,
          marginBottom: 4
        }
      }, a.morada), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }
      }, function () {
        var m = monteurs.find(function (x) {
          return x.name === a.monteur;
        });
        return m ? /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 14
          }
        }, m.emoji) : /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 14
          }
        }, "\uD83D\uDC64");
      }(), /*#__PURE__*/React.createElement("span", {
        style: {
          color: A.muted,
          fontSize: 12
        }
      }, a.monteur, a.nota ? " \xB7 ".concat(a.nota) : ''), function () {
        var m = monteurs.find(function (x) {
          return x.name === a.monteur;
        });
        return m !== null && m !== void 0 && m.notif ? /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 11,
            color: A.green
          }
        }, "\uD83D\uDD14") : null;
      }()), /*#__PURE__*/React.createElement("p", {
        style: {
          color: A.muted,
          fontSize: 11,
          marginTop: 4
        }
      }, "\u23F1 ", calcHoras(a.hi, a.hf).toFixed(1), "h")), isOpen && /*#__PURE__*/React.createElement("div", {
        style: {
          borderTop: "1px solid ".concat(A.border),
          padding: '12px 16px'
        }
      }, /*#__PURE__*/React.createElement("p", {
        style: {
          color: A.muted,
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          marginBottom: 8
        }
      }, "Alterar estado"), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 6,
          marginBottom: 12
        }
      }, Object.entries(STATUS).map(function (_ref17) {
        var _ref18 = _slicedToArray(_ref17, 2),
          k = _ref18[0],
          s = _ref18[1];
        return /*#__PURE__*/React.createElement("button", {
          key: k,
          onClick: function onClick() {
            return changeStatusWithNotif(a.id, k);
          },
          style: {
            flex: 1,
            background: a.status === k ? s.bg : A.surface2,
            border: "1px solid ".concat(a.status === k ? s.color : A.border),
            borderRadius: 10,
            padding: '7px 3px',
            color: a.status === k ? s.color : A.muted,
            fontSize: 9,
            fontWeight: 700,
            cursor: 'pointer'
          }
        }, s.icon, /*#__PURE__*/React.createElement("br", null), s.label);
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 8
        }
      }, /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          var dest = encodeURIComponent(a.morada + ', Grenchen, Schweiz');
          var openMaps = function openMaps() {
            var origin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
            var url = origin ? "https://www.google.com/maps/dir/?api=1&origin=".concat(origin, "&destination=").concat(dest, "&travelmode=driving") : "https://www.google.com/maps/dir/?api=1&destination=".concat(dest, "&travelmode=driving");
            window.open(url, '_blank');
          };
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (pos) {
              return openMaps("".concat(pos.coords.latitude, ",").concat(pos.coords.longitude));
            }, function () {
              return openMaps();
            });
          } else {
            openMaps();
          }
        },
        style: {
          flex: 1,
          background: 'rgba(59,130,246,0.15)',
          border: '1px solid rgba(59,130,246,0.3)',
          borderRadius: 12,
          padding: '10px',
          color: '#3B82F6',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6
        }
      }, "\uD83D\uDDFA Navegar"), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          openForm(a);
          setOpenId(null);
        },
        style: {
          flex: 1,
          background: A.surface2,
          border: "1px solid ".concat(A.border),
          borderRadius: 12,
          padding: '10px',
          color: A.gold,
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer'
        }
      }, "\u270F\uFE0F Editar"), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return deleteApptWithNotif(a);
        },
        style: {
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 12,
          padding: '10px 12px',
          color: A.red,
          fontSize: 13,
          cursor: 'pointer'
        }
      }, "\uD83D\uDDD1"))));
    }));
  })), /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      return openForm();
    },
    style: {
      position: 'fixed',
      bottom: 20,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: "linear-gradient(135deg,".concat(A.orange, ",#FB923C)"),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 4px 20px rgba(249,115,22,0.5)',
      zIndex: 300
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 28,
      color: '#fff',
      lineHeight: 1,
      fontWeight: 300
    }
  }, "+")));
}

// ── FAMÍLIA CARVALHO ────────────────────────────────────────────────
