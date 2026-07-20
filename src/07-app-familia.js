var F = {
  bg: '#F4F5F7',
  surface: '#FFFFFF',
  surface2: '#ECEEF1',
  text: '#1A1A2E',
  muted: '#8A8FA8',
  border: '#DDE0E8',
  coral: '#E8773A',
  orange: '#F97316',
  gold: '#C9972A',
  green: '#2D8A4E',
  blue: '#2563EB',
  purple: '#7C3AED',
  red: '#DC2626',
  pink: '#DB2777'
};
var MEMBER_COLORS = {
  patricio: '#C9972A',
  esposa: '#2563EB',
  lucas: '#E8773A',
  liam: '#2D8A4E'
};
var CATEGORIAS = {
  trabalho: { label: 'Trabalho', emoji: '💼', color: '#F59458' },
  familia: { label: 'Família', emoji: '🏠', color: '#E8773A' },
  escola: { label: 'Escola', emoji: '📚', color: '#A855F7' },
  pessoal: { label: 'Pessoal', emoji: '✨', color: '#2D8A4E' }
};
function FamiliaApp(_ref19) {
  var onBack = _ref19.onBack,
    _ref19$sharedDias = _ref19.sharedDias,
    sharedDias = _ref19$sharedDias === void 0 ? [] : _ref19$sharedDias,
    _ref19$addSharedDia = _ref19.addSharedDia,
    addSharedDia = _ref19$addSharedDia === void 0 ? function () {} : _ref19$addSharedDia,
    _ref19$removeSharedDi = _ref19.removeSharedDia,
    removeSharedDia = _ref19$removeSharedDi === void 0 ? function () {} : _ref19$removeSharedDi,
    _ref19$currentMemberI = _ref19.currentMemberId,
    currentMemberId = _ref19$currentMemberI === void 0 ? 'patricio' : _ref19$currentMemberI;
  var _useState95 = (0, _react.useState)(function () {
      var d = new Date();
      d.setDate(1);
      return d;
    }),
    _useState96 = _slicedToArray(_useState95, 2),
    curMonth = _useState96[0],
    setCurMonth = _useState96[1];
  var _useState97 = (0, _react.useState)(function () {
      return new Date().getDate();
    }),
    _useState98 = _slicedToArray(_useState97, 2),
    selDay = _useState98[0],
    setSelDay = _useState98[1];
  var skipDayResetRef = (0, _react.useRef)(false);
  (0, _react.useEffect)(function () {
    if (skipDayResetRef.current) {
      skipDayResetRef.current = false;
      return;
    }
    var today = new Date();
    var isRealCurrentMonth = curMonth.getFullYear() === today.getFullYear() && curMonth.getMonth() === today.getMonth();
    setSelDay(isRealCurrentMonth ? today.getDate() : 1);
  }, [curMonth]);
  var _useState99 = (0, _react.useState)(false),
    _useState100 = _slicedToArray(_useState99, 2),
    showAdd = _useState100[0],
    setShowAdd = _useState100[1];
  var _useState101 = (0, _react.useState)('todos'),
    _useState102 = _slicedToArray(_useState101, 2),
    selMember = _useState102[0],
    setSelMember = _useState102[1];
  var _useState103 = (0, _react.useState)({}),
    _useState104 = _slicedToArray(_useState103, 2),
    events = _useState104[0],
    setEvents = _useState104[1];
  var _useStateArq = (0, _react.useState)({}),
    _useStateArq2 = _slicedToArray(_useStateArq, 2),
    eventsArquivados = _useStateArq2[0],
    setEventsArquivados = _useStateArq2[1];
  var _useStateVerArq = (0, _react.useState)(false),
    _useStateVerArq2 = _slicedToArray(_useStateVerArq, 2),
    verArquivados = _useStateVerArq2[0],
    setVerArquivados = _useStateVerArq2[1];
  var _useState105 = (0, _react.useState)({
      titulo: '',
      emoji: '📅',
      participantes: ['todos'],
      categoria: 'familia',
      dataDE: '',
      dataATE: '',
      hora: '',
      diaTodo: false,
      nota: '',
      lembrete: null
    }),
    _useState106 = _slicedToArray(_useState105, 2),
    form = _useState106[0],
    setForm = _useState106[1];
  var _useState107 = (0, _react.useState)(null),
    _useState108 = _slicedToArray(_useState107, 2),
    editEvKey = _useState108[0],
    setEditEvKey = _useState108[1];
  var _useStateEditEvErr = (0, _react.useState)(''),
    _useStateEditEvErr2 = _slicedToArray(_useStateEditEvErr, 2),
    editEvErr = _useStateEditEvErr2[0],
    setEditEvErr = _useStateEditEvErr2[1];
  var _useStateEditEvSaving = (0, _react.useState)(false),
    _useStateEditEvSaving2 = _slicedToArray(_useStateEditEvSaving, 2),
    editEvSaving = _useStateEditEvSaving2[0],
    setEditEvSaving = _useStateEditEvSaving2[1];
  var _useState109 = (0, _react.useState)({}),
    _useState110 = _slicedToArray(_useState109, 2),
    memberPhotos = _useState110[0],
    setMemberPhotos = _useState110[1];
  var _useStateJustDone = (0, _react.useState)(new Set()),
    _useStateJustDone2 = _slicedToArray(_useStateJustDone, 2),
    justDoneIds = _useStateJustDone2[0],
    setJustDoneIds = _useStateJustDone2[1];
  var famStorageGet = function famStorageGet(key) {
    try {
      if (typeof window !== 'undefined' && window.storage && window.storage.get) {
        return window.storage.get(key).then(function (r) {
          return r ? r.value : null;
        }).catch(function () {
          return null;
        });
      }
    } catch (e) {}
    try {
      return Promise.resolve(window.localStorage.getItem(key));
    } catch (e) {
      return Promise.resolve(null);
    }
  };
  var famStorageSet = function famStorageSet(key, value) {
    try {
      if (typeof window !== 'undefined' && window.storage && window.storage.set) {
        return window.storage.set(key, value).catch(function () {});
      }
    } catch (e) {}
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {}
    return Promise.resolve();
  };
  var resizeImage = function resizeImage(dataUrl, maxSize) {
    return new Promise(function (resolve) {
      try {
        var img = new Image();
        img.onload = function () {
          try {
            var size = maxSize || 220;
            var canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            var ctx = canvas.getContext('2d');
            var scale = Math.max(size / img.width, size / img.height);
            var w = img.width * scale,
              h = img.height * scale;
            var x = (size - w) / 2,
              y = (size - h) / 2;
            ctx.drawImage(img, x, y, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
          } catch (e) {
            resolve(dataUrl);
          }
        };
        img.onerror = function () {
          resolve(dataUrl);
        };
        img.src = dataUrl;
      } catch (e) {
        resolve(dataUrl);
      }
    });
  };
  // Carregar fotos guardadas ao abrir a app
  (0, _react.useEffect)(function () {
    famStorageGet('familia_member_photos').then(function (val) {
      if (val) {
        try {
          setMemberPhotos(JSON.parse(val));
        } catch (e) {}
      }
    });
  }, []);
  var handlePhotoUpload = function handlePhotoUpload(memberId, e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      resizeImage(ev.target.result, 220).then(function (resized) {
        setMemberPhotos(function (p) {
          var next = _objectSpread(_objectSpread({}, p), {}, _defineProperty({}, memberId, resized));
          famStorageSet('familia_member_photos', JSON.stringify(next));
          return next;
        });
        if (window.supabaseClient && memberId !== 'todos') {
          window.supabaseClient.from('members').update({
            photo_url: resized
          }).eq('id', memberId).then(function () {}).catch(function () {});
        }
      });
    };
    reader.readAsDataURL(file);
  };
  var _useState111 = (0, _react.useState)('Semana'),
    _useState112 = _slicedToArray(_useState111, 2),
    timeTab = _useState112[0],
    setTimeTab = _useState112[1];
  var _useState113 = (0, _react.useState)('semana'),
    _useState114 = _slicedToArray(_useState113, 2),
    mainView = _useState114[0],
    setMainView = _useState114[1]; // semana | mes
  var _useState115 = (0, _react.useState)(function () {
      var d = new Date();
      var dow = d.getDay(); // 0=Dom,1=Seg,...
      var diff = dow === 0 ? -6 : 1 - dow; // recuar até segunda-feira
      d.setDate(d.getDate() + diff);
      d.setHours(0, 0, 0, 0);
      return d;
    }),
    _useState116 = _slicedToArray(_useState115, 2),
    weekStart = _useState116[0],
    setWeekStart = _useState116[1];
  var _useState117 = (0, _react.useState)([{
      id: 'todos',
      name: 'Todos',
      emoji: '👨‍👩‍👧‍👦',
      color: F.coral
    }, {
      id: 'patricio',
      name: 'Patricio',
      emoji: '👨‍💼',
      color: F.gold
    }, {
      id: 'esposa',
      name: 'Esposa',
      emoji: '👩',
      color: F.blue
    }, {
      id: 'lucas',
      name: 'Lucas',
      emoji: '👦',
      color: F.orange
    }, {
      id: 'liam',
      name: 'Liam',
      emoji: '👦',
      color: F.green
    }]),
    _useState118 = _slicedToArray(_useState117, 2),
    members = _useState118[0],
    setMembers = _useState118[1];
  var _useState119 = (0, _react.useState)(null),
    _useState120 = _slicedToArray(_useState119, 2),
    editMemberId = _useState120[0],
    setEditMemberId = _useState120[1];
  // ── SINCRONIZAÇÃO COM SUPABASE ────────────────────────────────────
  var loadFamilyEvents = function loadFamilyEvents() {
    if (!window.supabaseClient) return;
    window.supabaseClient.from('family_events').select('*').then(function (res) {
      if (res.error || !res.data) return;
      var built = {};
      var builtArq = {};
      res.data.forEach(function (row) {
        var d = row.event_date;
        var evObj = {
          id: row.id,
          t: row.title,
          emoji: row.emoji || '📅',
          arquivado: !!row.arquivado,
          participantes: row.participant_ids && row.participant_ids.length > 0 ? row.participant_ids : [row.member_id || 'todos'],
          categoria: row.categoria || (row.source === 'agenda_pro' ? 'trabalho' : 'familia'),
          color: row.color || F.coral,
          hora: row.event_time || '',
          nota: row.description || ''
        };
        // Todos os eventos vão para built (para o calendário mostrar feitos)
        (built[d] || (built[d] = [])).push(evObj);
        // Arquivados também vão para builtArq (para o painel de arquivo)
        if (row.arquivado) {
          (builtArq[d] || (builtArq[d] = [])).push(evObj);
        }
      });
      setEvents(built);
      setEventsArquivados(builtArq);
    }).catch(function () {});
  };
  var loadMemberPhotos = function loadMemberPhotos() {
    if (!window.supabaseClient) return;
    window.supabaseClient.from('members').select('id,name,emoji,photo_url').then(function (res) {
      if (res.error || !res.data) return;
      var next = {};
      var nameEmoji = {};
      res.data.forEach(function (row) {
        if (row.photo_url) next[row.id] = row.photo_url;
        nameEmoji[row.id] = { name: row.name, emoji: row.emoji };
      });
      setMemberPhotos(function (p) {
        return _objectSpread(_objectSpread({}, p), next);
      });
      setMembers(function (p) {
        return p.map(function (m) {
          var saved = nameEmoji[m.id];
          if (!saved) return m;
          return _objectSpread(_objectSpread({}, m), {}, {
            name: saved.name || m.name,
            emoji: saved.emoji || m.emoji
          });
        });
      });
    }).catch(function () {});
  };
  (0, _react.useEffect)(function () {
    loadFamilyEvents();
    loadMemberPhotos();
    if (!window.supabaseClient) return;
    var channel = window.supabaseClient.channel('family_events_changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'family_events'
    }, function () {
      loadFamilyEvents();
    }).subscribe();
    var channelM = window.supabaseClient.channel('members_changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'members'
    }, function () {
      loadMemberPhotos();
    }).subscribe();
    return function () {
      try {
        window.supabaseClient.removeChannel(channel);
        window.supabaseClient.removeChannel(channelM);
      } catch (e) {}
    };
  }, []);
  var yr = curMonth.getFullYear(),
    mo = curMonth.getMonth();
  var daysInMo = new Date(yr, mo + 1, 0).getDate();
  var firstDow = (new Date(yr, mo, 1).getDay() + 6) % 7;
  var selDateStr = "".concat(yr, "-").concat(String(mo + 1).padStart(2, '0'), "-").concat(String(selDay).padStart(2, '0'));
  var _useStateFiltros = (0, _react.useState)(Object.keys(CATEGORIAS)),
    _useStateFiltros2 = _slicedToArray(_useStateFiltros, 2),
    filtrosAtivos = _useStateFiltros2[0],
    setFiltrosAtivos = _useStateFiltros2[1];
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
  var eventVisibleTo = function eventVisibleTo(e, memberId) {
    var p = e.participantes || ['todos'];
    var memberOk = memberId === 'todos' || p.indexOf('todos') !== -1 || p.indexOf(memberId) !== -1;
    var catOk = filtrosAtivos.indexOf(e.categoria || 'familia') !== -1;
    return memberOk && catOk;
  };
  var _useStateHorasMes = (0, _react.useState)([]),
    _useStateHorasMes2 = _slicedToArray(_useStateHorasMes, 2),
    horasMesData = _useStateHorasMes2[0],
    setHorasMesData = _useStateHorasMes2[1];
  var loadHorasMes = function loadHorasMes() {
    if (!window.supabaseClient) return;
    var y = curMonth.getFullYear();
    var mo2 = curMonth.getMonth();
    var ini = "".concat(y, "-").concat(String(mo2 + 1).padStart(2, '0'), "-01");
    var fim2 = "".concat(y, "-").concat(String(mo2 + 1).padStart(2, '0'), "-31");
    window.supabaseClient.from('horas_entries').select('entry_date,hours').gte('entry_date', ini).lte('entry_date', fim2).then(function (res) {
      setHorasMesData(res.data || []);
    }).catch(function () {});
  };
  (0, _react.useEffect)(function () {
    loadHorasMes();
  }, [curMonth]);
  var statsGraficos = (function () {
    var y = curMonth.getFullYear();
    var mo2 = curMonth.getMonth();
    var prefix = "".concat(y, "-").concat(String(mo2 + 1).padStart(2, '0'));
    var todosEventosMes = Object.keys(events).filter(function (d) {
      return d.indexOf(prefix) === 0;
    }).flatMap(function (d) {
      return events[d];
    });
    var porCategoria = {};
    Object.keys(CATEGORIAS).forEach(function (c) {
      porCategoria[c] = 0;
    });
    todosEventosMes.forEach(function (e) {
      var c = e.categoria || 'familia';
      porCategoria[c] = (porCategoria[c] || 0) + 1;
    });
    var semanas = [0, 0, 0, 0, 0];
    var semanasEscola = [0, 0, 0, 0, 0];
    horasMesData.forEach(function (row) {
      var dia = parseInt(row.entry_date.slice(8, 10));
      var w = Math.min(4, Math.floor((dia - 1) / 7));
      semanas[w] += Number(row.hours) || 0;
    });
    todosEventosMes.filter(function (e) {
      return (e.categoria || 'familia') === 'escola';
    }).forEach(function (e) {});
    Object.keys(events).filter(function (d) {
      return d.indexOf(prefix) === 0;
    }).forEach(function (d) {
      var dia = parseInt(d.slice(8, 10));
      var w = Math.min(4, Math.floor((dia - 1) / 7));
      (events[d] || []).forEach(function (e) {
        if ((e.categoria || 'familia') === 'escola') semanasEscola[w]++;
      });
    });
    return {
      porCategoria: porCategoria,
      horasPorSemana: semanas,
      escolaPorSemana: semanasEscola,
      totalEventos: todosEventosMes.length
    };
  })();
  var CATEGORIA_ORDEM = ['trabalho', 'escola', 'familia', 'pessoal'];
  var selEvents = (function() {
    var fonte = verArquivados ? eventsArquivados : events;
    var raw = (fonte[selDateStr] || []).filter(function (e) {
      return eventVisibleTo(e, selMember);
    }).sort(function (a, b) {
      return CATEGORIA_ORDEM.indexOf(a.categoria || 'familia') - CATEGORIA_ORDEM.indexOf(b.categoria || 'familia');
    });
    // Agrupar eventos com o mesmo nome (normalizado) no mesmo dia
    var grouped = [];
    var seen = {};
    raw.forEach(function(ev) {
      var key = (ev.t || '').toLowerCase().trim().replace(/\s+/g,' ');
      if (seen[key] !== undefined) {
        // Juntar participantes no evento já existente
        var existing = grouped[seen[key]];
        var pExist = existing.participantes || [];
        var pNew = ev.participantes || [];
        var merged = _toConsumableArray(new Set(_toConsumableArray(pExist).concat(_toConsumableArray(pNew))));
        grouped[seen[key]] = _objectSpread(_objectSpread({}, existing), {}, { participantes: merged, _merged: true });
      } else {
        seen[key] = grouped.length;
        grouped.push(ev);
      }
    });
    return grouped;
  })();
  var sharedForDay = sharedDias.filter(function (d) {
    return d.date === selDateStr;
  });
  var monthName = curMonth.toLocaleDateString('pt-PT', {
    month: 'long',
    year: 'numeric'
  }).replace(/^\w/, function (c) {
    return c.toUpperCase();
  });
  var getDayEvents = function getDayEvents(d) {
    var dStr = "".concat(yr, "-").concat(String(mo + 1).padStart(2, '0'), "-").concat(String(d).padStart(2, '0'));
    var ev = (events[dStr] || []).filter(function (e) {
      return eventVisibleTo(e, selMember);
    });
    var sh = sharedDias.filter(function (x) {
      return x.date === dStr;
    });
    return {
      ev: ev,
      sh: sh,
      hasAny: ev.length > 0 || sh.length > 0
    };
  };
  var getISOWeek = function getISOWeek(date) {
    var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };
  var addEvent = function addEvent() {
    if (!form.titulo || !form.dataDE) return;
    var participantes = form.participantes && form.participantes.length > 0 ? form.participantes : ['todos'];
    var firstSpecific = participantes.find(function (id) {
      return id !== 'todos';
    });
    var m = members.find(function (x) {
      return x.id === firstSpecific;
    });
    var ev = {
      t: form.titulo,
      emoji: form.emoji,
      participantes: participantes,
      categoria: form.categoria || 'familia',
      color: (CATEGORIAS[form.categoria] || CATEGORIAS.familia).color,
      hora: form.hora,
      nota: form.nota
    };
    var ate = form.dataATE && form.dataATE >= form.dataDE ? form.dataATE : form.dataDE;
    // Gerar todos os dias do intervalo
    var cur = new Date(form.dataDE + 'T12:00:00');
    var fim = new Date(ate + 'T12:00:00');
    var updates = {};
    while (cur <= fim) {
      var d = cur.toISOString().slice(0, 10);
      updates[d] = true;
      cur.setDate(cur.getDate() + 1);
    }
    setEvents(function (p) {
      var np = _objectSpread({}, p);
      Object.keys(updates).forEach(function (d) {
        np[d] = [].concat(_toConsumableArray(np[d] || []), [ev]);
      });
      return np;
    });
    if (window.supabaseClient) {
      var rows = Object.keys(updates).map(function (d) {
        return {
          member_id: participantes.indexOf('todos') !== -1 ? null : participantes[0],
          participant_ids: participantes,
          title: ev.t,
          description: ev.nota || null,
          event_date: d,
          event_time: ev.hora || null,
          emoji: ev.emoji,
          color: ev.color,
          categoria: ev.categoria,
          reminder_minutes: form.lembrete || null,
          created_by: currentMemberId
        };
      });
      window.supabaseClient.from('family_events').insert(rows).then(function () { loadFamilyEvents();
        try {
          getEligibleProfileIds('familia', null).then(function (ids) {
            if (!ids.length) return;
            window.supabaseClient.functions.invoke('send-push', {
              body: {
                title: 'Família Carvalho',
                body: ev.t + (ev.hora ? ' · ' + ev.hora : ''),
                profileIds: ids
              }
            }).catch(function () {});
          });
        } catch (e) {}
      }).catch(function () {});
    }
    setForm({
      titulo: '',
      emoji: '📅',
      participantes: ['todos'],
      categoria: 'familia',
      dataDE: '',
      dataATE: '',
      hora: '',
      diaTodo: false,
      nota: '',
      lembrete: null
    });
    setShowAdd(false);
  };
  var FCard = function FCard(_ref20) {
    var children = _ref20.children,
      _ref20$style = _ref20.style,
      style = _ref20$style === void 0 ? {} : _ref20$style;
    return /*#__PURE__*/React.createElement("div", {
      style: _objectSpread({
        background: F.surface,
        borderRadius: 18,
        border: "1px solid ".concat(F.border),
        boxShadow: '0 1px 6px rgba(184,120,60,0.06)'
      }, style)
    }, children);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      background: F.bg,
      fontFamily: "'Inter',system-ui,sans-serif",
      color: F.text,
      overflowX: 'hidden',
      paddingBottom: 80
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: F.surface,
      borderBottom: "1px solid ".concat(F.border),
      padding: '8px 12px 10px',
      position: 'sticky',
      top: 0,
      zIndex: 200,
      boxShadow: '0 1px 8px rgba(184,120,60,0.08)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      background: 'none',
      border: 'none',
      color: F.coral,
      fontSize: 28,
      cursor: 'pointer',
      padding: '0',
      lineHeight: 1,
      width: 28,
      height: 34,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, "\u2039"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      flexShrink: 0
    }
  }, "\uD83C\uDFE0"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 900,
      fontSize: 16,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, "Fam\xEDlia Carvalho")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      background: F.surface2,
      borderRadius: 10,
      border: "1px solid ".concat(F.border),
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setMainView('semana');
    },
    style: {
      background: mainView === 'semana' ? F.coral : 'transparent',
      border: 'none',
      padding: '7px 14px',
      color: mainView === 'semana' ? '#fff' : F.muted,
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "Sem."), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setMainView('mes');
    },
    style: {
      background: mainView === 'mes' ? F.coral : 'transparent',
      border: 'none',
      padding: '7px 14px',
      color: mainView === 'mes' ? '#fff' : F.muted,
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "M\xEAs"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setMainView('graficos');
    },
    style: {
      background: mainView === 'graficos' ? F.coral : 'transparent',
      border: 'none',
      padding: '7px 14px',
      color: mainView === 'graficos' ? '#fff' : F.muted,
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "\uD83D\uDCCA"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setMainView('arquivo');
    },
    style: {
      background: mainView === 'arquivo' ? F.coral : 'transparent',
      border: 'none',
      padding: '7px 14px',
      color: mainView === 'arquivo' ? '#fff' : F.muted,
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "\uD83D\uDCE6")), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowAdd(true);
    },
    style: {
      background: "linear-gradient(135deg,".concat(F.coral, ",#F59458)"),
      border: 'none',
      borderRadius: 11,
      width: 34,
      height: 34,
      color: '#fff',
      fontSize: 20,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: "0 4px 14px rgba(232,119,58,0.4)",
      flexShrink: 0
    }
  }, "+"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(135deg, ".concat(F.coral, " 0%, #F59458 60%, #FFF0E4 100%)"),
      padding: '16px 16px 14px',
      display: 'flex',
      gap: 10,
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 2px, transparent 2px, transparent 14px)',
      pointerEvents: 'none'
    }
  }), members.map(function (m) {
    return /*#__PURE__*/React.createElement("div", {
      key: m.id,
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        flex: 1,
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: function onClick() {
        return setSelMember(m.id);
      },
      style: {
        width: 50,
        height: 50,
        borderRadius: 16,
        background: selMember === m.id ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)',
        border: "2.5px solid ".concat(selMember === m.id ? '#fff' : 'rgba(255,255,255,0.45)'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s',
        cursor: 'pointer',
        overflow: 'hidden',
        boxShadow: selMember === m.id ? '0 0 0 3px rgba(255,255,255,0.35)' : 'none'
      }
    }, memberPhotos[m.id] ? /*#__PURE__*/React.createElement("img", {
      src: memberPhotos[m.id],
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      },
      alt: m.name
    }) : /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 24
      }
    }, m.emoji)), m.id !== 'todos' && /*#__PURE__*/React.createElement("button", {
      type: "button",
      title: "Adicionar foto",
      onClick: function onClick(ev) {
        ev.stopPropagation();
        var input = document.getElementById("photo-input-".concat(m.id));
        if (input) input.click();
      },
      style: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 26,
        height: 26,
        borderRadius: '50%',
        background: F.coral,
        border: "2px solid ".concat(F.surface),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
        zIndex: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: '#fff',
        pointerEvents: 'none'
      }
    }, "\uD83D\uDCF7"), /*#__PURE__*/React.createElement("input", {
      id: "photo-input-".concat(m.id),
      type: "file",
      accept: "image/*",
      style: {
        display: 'none'
      },
      onChange: function onChange(e) {
        return handlePhotoUpload(m.id, e);
      }
    }))), editMemberId === m.id ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      onClick: function onClick() {
        return setEditMemberId(null);
      },
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.35)',
        zIndex: 299
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        top: '35%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: F.surface,
        border: "1px solid ".concat(m.color),
        borderRadius: 12,
        padding: 10,
        zIndex: 300,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        minWidth: 230,
        maxWidth: '88vw'
      },
      onClick: function onClick(e) {
        return e.stopPropagation();
      }
    }, /*#__PURE__*/React.createElement("input", {
      id: "member-name-".concat(m.id),
      defaultValue: m.name,
      autoComplete: "off",
      style: {
        width: '100%',
        background: F.surface2,
        border: "1px solid ".concat(m.color),
        borderRadius: 8,
        padding: '7px 10px',
        color: F.text,
        fontSize: 14,
        outline: 'none',
        boxSizing: 'border-box',
        marginBottom: 8
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        marginBottom: 6,
        flexWrap: 'wrap',
        justifyContent: 'center'
      }
    }, ['👨‍💼', '👩', '👦', '👧', '👴', '👵', '🧑', '👶'].map(function (e) {
      return /*#__PURE__*/React.createElement("button", {
        key: e,
        onClick: function onClick() {
          setMembers(function (p) {
            return p.map(function (x) {
              return x.id === m.id ? _objectSpread(_objectSpread({}, x), {}, {
                emoji: e
              }) : x;
            });
          });
          if (window.supabaseClient && m.id !== 'todos') {
            window.supabaseClient.from('members').update({
              emoji: e
            }).eq('id', m.id).then(function () {}).catch(function () {});
          }
        },
        style: {
          background: m.emoji === e ? "".concat(m.color, "22") : 'transparent',
          border: 'none',
          borderRadius: 6,
          padding: '2px',
          fontSize: 14,
          cursor: 'pointer'
        }
      }, e);
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setEditMemberId(null);
      },
      style: {
        flex: 1,
        background: F.surface2,
        border: "1px solid ".concat(F.border),
        borderRadius: 7,
        padding: '5px',
        color: F.muted,
        fontSize: 10,
        cursor: 'pointer'
      }
    }, "\u2715"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        var _document$getElementB;
        var val = (((_document$getElementB = document.getElementById("member-name-".concat(m.id))) === null || _document$getElementB === void 0 ? void 0 : _document$getElementB.value) || '').trim();
        if (val) {
          setMembers(function (p) {
            return p.map(function (x) {
              return x.id === m.id ? _objectSpread(_objectSpread({}, x), {}, {
                name: val
              }) : x;
            });
          });
          if (window.supabaseClient && m.id !== 'todos') {
            window.supabaseClient.from('members').update({
              name: val
            }).eq('id', m.id).then(function () {}).catch(function () {});
          }
        }
        setEditMemberId(null);
      },
      style: {
        flex: 2,
        background: m.color,
        border: 'none',
        borderRadius: 7,
        padding: '5px',
        color: '#fff',
        fontSize: 10,
        fontWeight: 800,
        cursor: 'pointer'
      }
    }, "\u2713 OK")))) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        cursor: 'pointer'
      },
      onClick: function onClick() {
        return m.id !== 'todos' && setEditMemberId(m.id);
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        color: selMember === m.id ? '#fff' : 'rgba(255,255,255,0.75)'
      }
    }, m.name), m.id !== 'todos' && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 8,
        color: 'rgba(255,255,255,0.6)'
      }
    }, "\u270E")));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px 0',
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
        border: "1px solid ".concat(ativo ? cat.color : F.border),
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
        color: ativo ? cat.color : F.muted
      }
    }, cat.label));
  })), mainView === 'semana' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      var d = new Date(weekStart);
      d.setDate(d.getDate() - 7);
      setWeekStart(d);
    },
    style: {
      background: F.surface,
      border: "1px solid ".concat(F.border),
      borderRadius: 10,
      width: 34,
      height: 34,
      color: F.coral,
      fontSize: 18,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700
    }
  }, "\u2039"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 10,
      fontWeight: 800,
      color: F.coral,
      textTransform: 'uppercase',
      letterSpacing: '0.6px',
      marginBottom: 2
    }
  }, "Semana ", getISOWeek(weekStart)), /*#__PURE__*/React.createElement("p", {
    style: {
      fontWeight: 800,
      fontSize: 14,
      color: F.text
    }
  }, weekStart.toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'short'
  }), " \u2013 ", new Date(weekStart.getTime() + 6 * 86400000).toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      var d = new Date(weekStart);
      d.setDate(d.getDate() + 7);
      setWeekStart(d);
    },
    style: {
      background: F.surface,
      border: "1px solid ".concat(F.border),
      borderRadius: 10,
      width: 34,
      height: 34,
      color: F.coral,
      fontSize: 18,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700
    }
  }, "\u203A")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: F.surface,
      borderRadius: 18,
      border: "1px solid ".concat(F.border),
      overflow: 'hidden',
      boxShadow: '0 1px 6px rgba(184,120,60,0.06)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: "52px repeat(".concat(members.filter(function (m) {
        return m.id !== 'todos';
      }).length, ",1fr)"),
      borderBottom: "2px solid ".concat(F.border)
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: F.surface2
    }
  }), members.filter(function (m) {
    return m.id !== 'todos';
  }).map(function (m) {
    return /*#__PURE__*/React.createElement("div", {
      key: m.id,
      style: {
        padding: '8px 2px',
        textAlign: 'center',
        background: "".concat(m.color, "10"),
        borderLeft: "1px solid ".concat(F.border),
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 30,
        height: 30,
        borderRadius: 10,
        background: "".concat(m.color, "20"),
        border: "2px solid ".concat(m.color, "55"),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 3px',
        overflow: 'hidden',
        flexShrink: 0
      }
    }, memberPhotos[m.id] ? /*#__PURE__*/React.createElement("img", {
      src: memberPhotos[m.id],
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      },
      alt: m.name
    }) : /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15
      }
    }, m.emoji)), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 9,
        fontWeight: 800,
        color: m.color,
        textAlign: 'center'
      }
    }, m.name));
  })), (function () {
    var _spanMap = {};
    for (var _sdi = 0; _sdi < 7; _sdi++) {
      var _sd = new Date(weekStart.getTime() + _sdi * 86400000);
      var _sds = "".concat(_sd.getFullYear(), "-").concat(String(_sd.getMonth() + 1).padStart(2, '0'), "-").concat(String(_sd.getDate()).padStart(2, '0'));
      (events[_sds] || []).forEach(function (ev) {
        var k = (ev.t || '').toLowerCase().trim();
        if (!_spanMap[k]) _spanMap[k] = { ev: ev, days: [] };
        _spanMap[k].days.push(_sdi);
      });
    }
    var _spans = Object.values(_spanMap).filter(function (g) { return g.days.length >= 2; });
    if (_spans.length === 0) return null;
    return /*#__PURE__*/React.createElement("div", {
      style: { padding: '4px 4px 2px', borderBottom: "1px solid ".concat(F.border) }
    }, _spans.map(function (g, si) {
      var _sortedDays = g.days.slice().sort(function (a, b) { return a - b; });
      var _startDay = _sortedDays[0];
      var _endDay = _sortedDays[_sortedDays.length - 1];
      var _todayMidS = new Date(); _todayMidS.setHours(0, 0, 0, 0);
      var _endDateS = new Date(weekStart.getTime() + _endDay * 86400000);
      var _isDoneSpan = !!g.ev.arquivado && _endDateS < _todayMidS;
      return /*#__PURE__*/React.createElement("div", {
        key: si,
        style: { display: 'grid', gridTemplateColumns: '52px repeat(7, 1fr)', height: 22, marginBottom: si < _spans.length - 1 ? 2 : 0 }
      },
      /*#__PURE__*/React.createElement("div"),
      /*#__PURE__*/React.createElement("div", {
        style: {
          gridColumn: "".concat(_startDay + 2, " / ").concat(_endDay + 3),
          background: _isDoneSpan ? 'rgba(37,99,235,0.08)' : "".concat(g.ev.color, "18"),
          border: "1px solid ".concat(_isDoneSpan ? 'rgba(37,99,235,0.3)' : "".concat(g.ev.color, "44")),
          borderRadius: 6,
          fontSize: 10,
          fontWeight: 800,
          color: _isDoneSpan ? '#2563EB' : g.ev.color,
          padding: '0 6px',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textDecoration: _isDoneSpan ? 'line-through' : 'none'
        }
      }, _isDoneSpan ? '\u2713' : g.ev.emoji, " ", g.ev.t));
    }));
  })(), Array.from({
    length: 7
  }).map(function (_, di) {
    var date = new Date(weekStart.getTime() + di * 86400000);
    var dStr = "".concat(date.getFullYear(), "-").concat(String(date.getMonth() + 1).padStart(2, '0'), "-").concat(String(date.getDate()).padStart(2, '0'));
    var todayD = new Date();
    var todayStr = "".concat(todayD.getFullYear(), "-").concat(String(todayD.getMonth() + 1).padStart(2, '0'), "-").concat(String(todayD.getDate()).padStart(2, '0'));
    var isToday = dStr === todayStr;
    var dayName = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][di];
    var isWeekend = di >= 5;
    var _mdMap = {};
    for (var _mdi = 0; _mdi < 7; _mdi++) {
      var _mdd = new Date(weekStart.getTime() + _mdi * 86400000);
      var _mds = "".concat(_mdd.getFullYear(), "-").concat(String(_mdd.getMonth() + 1).padStart(2, '0'), "-").concat(String(_mdd.getDate()).padStart(2, '0'));
      (events[_mds] || []).forEach(function (ev) { var k = (ev.t || '').toLowerCase().trim(); _mdMap[k] = (_mdMap[k] || 0) + 1; });
    }
    var dayEvs = (events[dStr] || []).filter(function (ev) { return (_mdMap[(ev.t || '').toLowerCase().trim()] || 0) < 2; });
    var dayShared = sharedDias.filter(function (x) {
      return x.date === dStr;
    });
    return /*#__PURE__*/React.createElement("div", {
      key: di,
      style: {
        display: 'grid',
        gridTemplateColumns: "52px repeat(".concat(members.filter(function (m) {
          return m.id !== 'todos';
        }).length, ",1fr)"),
        borderBottom: di < 6 ? "1px solid ".concat(F.border) : 'none',
        background: isToday ? 'rgba(232,119,58,0.04)' : isWeekend ? 'rgba(0,0,0,0.01)' : 'transparent'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '8px 4px',
        textAlign: 'center',
        borderRight: "1px solid ".concat(F.border),
        background: isToday ? "".concat(F.coral, "10") : isWeekend ? F.surface2 : 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 10,
        fontWeight: 800,
        color: isWeekend ? F.coral : F.muted,
        letterSpacing: '0.5px'
      }
    }, dayName), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: isToday ? F.coral : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 3
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 17,
        fontWeight: isToday ? 900 : 700,
        color: isToday ? '#fff' : isWeekend ? F.coral : F.text
      }
    }, date.getDate()))), members.filter(function (m) {
      return m.id !== 'todos';
    }).map(function (m) {
      var mEvs = dayEvs.filter(function (e) {
        return eventVisibleTo(e, m.id);
      });
      var mShared = dayShared.length > 0 && m.id === 'patricio';
      var isEmptyCell = mEvs.length === 0 && !mShared;
      return /*#__PURE__*/React.createElement("div", {
        key: m.id,
        onClick: isEmptyCell ? function () {
          setForm(function (p) {
            return _objectSpread(_objectSpread({}, p), {}, {
              dataDE: dStr,
              dataATE: dStr,
              participantes: [m.id]
            });
          });
          setShowAdd(true);
        } : undefined,
        style: {
          padding: '3px 3px',
          borderLeft: "1px solid ".concat(F.border),
          minHeight: 44,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflow: 'hidden',
          boxSizing: 'border-box',
          cursor: isEmptyCell ? 'pointer' : 'default'
        }
      }, mShared && dayShared.map(function (s, si) {
        return /*#__PURE__*/React.createElement("div", {
          key: si,
          style: {
            background: "".concat(F.purple, "15"),
            borderRadius: 5,
            padding: '2px 4px',
            border: "1px solid ".concat(F.purple, "30"),
            overflow: 'hidden'
          }
        }, /*#__PURE__*/React.createElement("p", {
          style: {
            fontSize: 8,
            fontWeight: 700,
            color: F.purple,
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }
        }, s.tipo === 'ferias' ? '🏖' : s.tipo === 'feriado' ? '🎌' : '✅', " ", s.tipo === 'ferias' ? 'Férias' : s.tipo === 'feriado' ? 'Feriado' : 'Livre'));
      }), mEvs.map(function (ev, ei) {
        var _todayMid = new Date(); _todayMid.setHours(0,0,0,0);
        var isDone = !!ev.arquivado && date < _todayMid;
        return /*#__PURE__*/React.createElement("div", {
          key: ei,
          style: {
            background: isDone ? 'rgba(37,99,235,0.07)' : "".concat(ev.color, "18"),
            borderRadius: 5,
            padding: '3px 4px',
            border: isDone ? '1px solid rgba(37,99,235,0.25)' : "1px solid ".concat(ev.color, "40"),
            overflow: 'hidden',
            boxSizing: 'border-box',
            width: '100%',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 3
          }
        }, /*#__PURE__*/React.createElement("div", {
          onClick: function onClick() {
            skipDayResetRef.current = true;
            setCurMonth(new Date(date.getFullYear(), date.getMonth(), 1));
            setSelDay(date.getDate());
            setMainView('mes');
          },
          style: {
            flex: 1,
            minWidth: 0,
            cursor: 'pointer'
          }
        }, /*#__PURE__*/React.createElement("p", {
          style: {
            fontSize: 8,
            fontWeight: 700,
            color: isDone ? '#2563EB' : ev.color,
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            margin: 0,
            whiteSpace: 'nowrap',
            textDecoration: isDone ? 'line-through' : 'none',
            opacity: isDone ? 0.7 : 1
          }
        }, isDone ? '\u2713' : ev.emoji, " ", ev.t), ev.hora && /*#__PURE__*/React.createElement("p", {
          style: {
            fontSize: 8,
            fontWeight: 800,
            color: isDone ? '#2563EB' : ev.color,
            opacity: isDone ? 0.5 : 0.85,
            margin: 0,
            lineHeight: 1.1
          }
        }, "\uD83D\uDD50", ev.hora)));
      }));
    }));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      marginTop: 10,
      flexWrap: 'wrap',
      padding: '0 4px'
    }
  }, members.filter(function (m) {
    return m.id !== 'todos';
  }).map(function (m) {
    return /*#__PURE__*/React.createElement("div", {
      key: m.id,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 10,
        height: 10,
        borderRadius: 3,
        background: m.color
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: F.muted,
        fontWeight: 600
      }
    }, m.name));
  }))), mainView === 'mes' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px 0'
    }
  }, /*#__PURE__*/React.createElement(FCard, {
    style: {
      padding: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setCurMonth(function (m) {
        var d = new Date(m);
        d.setMonth(d.getMonth() - 1);
        return d;
      });
    },
    style: {
      background: F.surface2,
      border: "1px solid ".concat(F.border),
      borderRadius: 10,
      width: 34,
      height: 34,
      color: F.coral,
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
      fontSize: 17,
      color: F.text
    }
  }, monthName), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setCurMonth(function (m) {
        var d = new Date(m);
        d.setMonth(d.getMonth() + 1);
        return d;
      });
    },
    style: {
      background: F.surface2,
      border: "1px solid ".concat(F.border),
      borderRadius: 10,
      width: 34,
      height: 34,
      color: F.coral,
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
      gridTemplateColumns: 'repeat(7,1fr)',
      gap: 3,
      marginBottom: 6
    }
  }, ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(function (d, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: d,
      style: {
        textAlign: 'center',
        fontSize: 10,
        fontWeight: 700,
        color: i >= 5 ? F.coral : F.muted,
        padding: '2px 0'
      }
    }, d);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7,1fr)',
      gap: 3
    }
  }, Array.from({
    length: firstDow
  }).map(function (_, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: 'e' + i
    });
  }), Array.from({
    length: daysInMo
  }).map(function (_, i) {
    var _ev$;
    var d = i + 1;
    var dStr = "".concat(yr, "-").concat(String(mo + 1).padStart(2, '0'), "-").concat(String(d).padStart(2, '0'));
    var _getDayEvents = getDayEvents(d),
      ev = _getDayEvents.ev,
      sh = _getDayEvents.sh,
      hasAny = _getDayEvents.hasAny;
    var isSel = d === selDay;
    var isSun = (firstDow + i) % 7 === 6;
    var isSat = (firstDow + i) % 7 === 5;
    var allColors = [].concat(_toConsumableArray(ev.map(function (e) {
      var _dObj = new Date(dStr + 'T00:00:00');
      var _todayM = new Date(); _todayM.setHours(0,0,0,0);
      return (e.arquivado && _dObj < _todayM) ? '#2563EB' : e.color;
    })), _toConsumableArray(sh.map(function () {
      return F.purple;
    }))).slice(0, 3);
    return /*#__PURE__*/React.createElement("div", {
      key: d,
      onClick: function onClick() {
        return setSelDay(d);
      },
      style: {
        textAlign: 'center',
        padding: '5px 2px',
        borderRadius: 10,
        cursor: 'pointer',
        background: isSel ? F.coral : 'transparent',
        border: hasAny && !isSel ? "1px solid ".concat(((_ev$ = ev[0]) === null || _ev$ === void 0 ? void 0 : _ev$.color) || F.purple, "55") : '1px solid transparent',
        minHeight: 44,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: isSel || hasAny ? 800 : 400,
        color: isSel ? '#fff' : isSun ? F.red : isSat ? F.coral : F.text,
        lineHeight: 1.4
      }
    }, d), hasAny && !isSel && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 2,
        justifyContent: 'center'
      }
    }, allColors.map(function (c, ci) {
      return /*#__PURE__*/React.createElement("div", {
        key: ci,
        style: {
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: c
        }
      });
    })));
  })))), mainView === 'mes' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px 20px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setVerArquivados(function (p) { return !p; });
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      background: verArquivados ? "".concat(F.green, "18") : 'transparent',
      border: "1px solid ".concat(verArquivados ? F.green : F.border),
      borderRadius: 16,
      padding: '4px 10px',
      marginBottom: 10,
      cursor: 'pointer',
      color: verArquivados ? F.green : F.muted,
      fontSize: 11,
      fontWeight: 700
    }
  }, verArquivados ? "\u2705 A ver arquivo \u2014 tocar para voltar" : "\uD83D\uDCE6 Ver arquivo deste dia"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: F.muted,
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      marginBottom: 10
    }
  }, selDay, " ", curMonth.toLocaleDateString('pt-PT', {
    month: 'long'
  }), " \xB7 ", selEvents.length + (verArquivados ? 0 : sharedForDay.length), " evento(s)"), !verArquivados && sharedForDay.map(function (d, i) {
    return /*#__PURE__*/React.createElement(FCard, {
      key: 'sd' + i,
      style: {
        padding: '14px 16px',
        marginBottom: 10,
        borderLeft: "4px solid ".concat(F.purple),
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 24
      }
    }, d.tipo === 'feriado' ? '🎌' : d.tipo === 'ferias' ? '🏖' : '✅'), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontWeight: 800,
        fontSize: 14,
        color: F.text
      }
    }, d.tipo === 'feriado' ? 'Feriado' : d.tipo === 'ferias' ? 'Férias' : 'Dia livre'), d.nome && /*#__PURE__*/React.createElement("p", {
      style: {
        color: F.muted,
        fontSize: 12,
        marginTop: 1
      }
    }, d.nome)));
  }), selEvents.map(function (ev, i) {
    var firstSpecific = (ev.participantes || ['todos']).find(function (id) {
      return id !== 'todos';
    });
    var m = members.find(function (x) {
      return x.id === firstSpecific;
    });
    var multiplos = (ev.participantes || []).filter(function (id) {
      return id !== 'todos';
    }).length > 1;
    var isTodos = !firstSpecific;
    var whoLabel = isTodos ? 'Toda a família' : multiplos ? "".concat(m === null || m === void 0 ? void 0 : m.name, " +").concat((ev.participantes || []).filter(function (id) {
      return id !== 'todos';
    }).length - 1) : (m === null || m === void 0 ? void 0 : m.name) || '';
    var whoEmoji = isTodos ? '👥' : m === null || m === void 0 ? void 0 : m.emoji;
    var evKey = "".concat(selDateStr, "-").concat(i);
    var isEditing = editEvKey === evKey;
    var selDateObj = new Date(selDateStr + 'T00:00:00');
    var todayMidnightD = new Date(); todayMidnightD.setHours(0,0,0,0);
    var isDoneDay = !!ev.arquivado && selDateObj < todayMidnightD;
    return /*#__PURE__*/React.createElement(FCard, {
      key: i,
      style: {
        marginBottom: 10,
        borderLeft: isDoneDay ? "4px solid #2563EB" : "4px solid ".concat(ev.color),
        overflow: 'hidden',
        opacity: isDoneDay ? 0.75 : 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 44,
        height: 44,
        borderRadius: 14,
        background: isDoneDay ? 'rgba(37,99,235,0.1)' : "".concat(ev.color, "15"),
        border: isDoneDay ? "1px solid rgba(37,99,235,0.3)" : "1px solid ".concat(ev.color, "33"),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 22
      }
    }, isDoneDay ? '\u2713' : ev.emoji)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, isDoneDay && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 800,
        color: '#2563EB',
        background: 'rgba(37,99,235,0.1)',
        borderRadius: 4,
        padding: '1px 6px',
        marginBottom: 3,
        display: 'inline-block',
        letterSpacing: '0.3px'
      }
    }, "FEITO"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontWeight: 800,
        fontSize: 15,
        color: isDoneDay ? '#2563EB' : F.text,
        textDecoration: isDoneDay ? 'line-through' : 'none'
      }
    }, ev.t), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13
      }
    }, whoEmoji), /*#__PURE__*/React.createElement("span", {
      style: {
        color: isDoneDay ? '#2563EB' : ev.color,
        fontSize: 12,
        fontWeight: 700
      }
    }, whoLabel), ev.hora ? /*#__PURE__*/React.createElement("span", {
      style: {
        background: isDoneDay ? 'rgba(37,99,235,0.1)' : "".concat(ev.color, "18"),
        border: isDoneDay ? "1px solid rgba(37,99,235,0.3)" : "1px solid ".concat(ev.color, "33"),
        borderRadius: 6,
        padding: '1px 8px',
        fontSize: 11,
        fontWeight: 800,
        color: ev.color
      }
    }, "\uD83D\uDD50 ", ev.hora) : /*#__PURE__*/React.createElement("span", {
      style: {
        background: "".concat(F.muted, "18"),
        border: "1px solid ".concat(F.muted, "33"),
        borderRadius: 6,
        padding: '1px 8px',
        fontSize: 11,
        fontWeight: 800,
        color: F.muted
      }
    }, "\uD83D\uDCC5 Dia todo")), ev.nota && /*#__PURE__*/React.createElement("p", {
      style: {
        color: F.muted,
        fontSize: 11,
        marginTop: 3
      }
    }, "\uD83D\uDCDD ", ev.nota)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        if (!window.supabaseClient || !ev.id) return;
        var novoArquivado = !verArquivados;
        window.supabaseClient.from('family_events').update({ arquivado: novoArquivado }).eq('id', ev.id).then(function () {}).catch(function () {});
        setEvents(function (p) {
          var d = _objectSpread({}, p);
          d[selDateStr] = (d[selDateStr] || []).filter(function (item) {
            return item.id !== ev.id;
          });
          return d;
        });
        setEventsArquivados(function (p) {
          var d = _objectSpread({}, p);
          d[selDateStr] = (d[selDateStr] || []).filter(function (item) {
            return item.id !== ev.id;
          });
          return d;
        });
        var alvoState = novoArquivado ? setEventsArquivados : setEvents;
        alvoState(function (p) {
          var d = _objectSpread({}, p);
          d[selDateStr] = [].concat(_toConsumableArray(d[selDateStr] || []), [_objectSpread(_objectSpread({}, ev), {}, { arquivado: novoArquivado })]);
          return d;
        });
      },
      style: {
        background: "".concat(F.green, "12"),
        border: "1px solid ".concat(F.green, "33"),
        borderRadius: 8,
        padding: '6px 8px',
        cursor: 'pointer',
        color: F.green,
        fontSize: 13
      }
    }, verArquivados ? "\u21A9\uFE0F" : "\u2705"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setForm({
          titulo: ev.t,
          emoji: ev.emoji,
          participantes: ev.participantes || ['todos'],
          dataDE: selDateStr,
          dataATE: selDateStr,
          hora: ev.hora || '',
          nota: ev.nota || ''
        });
        setEditEvKey(null);
        setShowAdd(true);
      },
      style: {
        background: "".concat(F.orange, "12"),
        border: "1px solid ".concat(F.orange, "33"),
        borderRadius: 8,
        padding: '6px 8px',
        cursor: 'pointer',
        color: F.orange,
        fontSize: 13
      }
    }, "\uD83D\uDCCB"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setEditEvKey(isEditing ? null : evKey);
      },
      style: {
        background: "".concat(F.coral, "12"),
        border: "1px solid ".concat(F.coral, "33"),
        borderRadius: 8,
        padding: '6px 8px',
        cursor: 'pointer',
        color: F.coral,
        fontSize: 13
      }
    }, "\u270F\uFE0F"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        if (window.supabaseClient && ev.id) {
          window.supabaseClient.from('family_events').delete().eq('id', ev.id).then(function () { }).catch(function () {});
          try {
            getEligibleProfileIds('familia', null).then(function (ids) {
              if (!ids.length) return;
              window.supabaseClient.functions.invoke('send-push', {
                body: {
                  title: 'Fam\u00edlia Carvalho',
                  body: '\uD83D\uDDD1\uFE0F ' + ev.t + ' foi apagado',
                  profileIds: ids
                }
              }).catch(function () {});
            });
          } catch (e) {}
        }
        return (verArquivados ? setEventsArquivados : setEvents)(function (p) {
          var d = _objectSpread({}, p);
          d[selDateStr] = (d[selDateStr] || []).filter(function (item) {
            return item.id !== ev.id;
          });
          return d;
        });
      },
      style: {
        background: 'rgba(220,38,38,0.08)',
        border: '1px solid rgba(220,38,38,0.15)',
        borderRadius: 8,
        padding: '6px 8px',
        cursor: 'pointer',
        color: F.red,
        fontSize: 13
      }
    }, "\uD83D\uDDD1"))), isEditing && /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "1px solid ".concat(F.border),
        padding: '12px 14px',
        background: 'rgba(0,0,0,0.01)'
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: F.coral,
        fontSize: 11,
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: 10
      }
    }, "Editar evento"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: F.muted,
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 4
      }
    }, "T\xEDtulo"), /*#__PURE__*/React.createElement("input", {
      defaultValue: ev.t,
      id: "ev-t-".concat(evKey),
      autoComplete: "off",
      style: {
        width: '100%',
        background: F.surface2,
        border: "1px solid ".concat(F.border),
        borderRadius: 10,
        padding: '9px 12px',
        color: F.text,
        fontSize: 14,
        outline: 'none',
        marginBottom: 10,
        boxSizing: 'border-box'
      }
    }), /*#__PURE__*/React.createElement("p", {
      style: { color: F.muted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }
    }, "\uD83D\uDCC5 Data"), /*#__PURE__*/React.createElement("input", {
      type: "date",
      defaultValue: selDateStr,
      id: "ev-d-".concat(evKey),
      style: {
        width: '100%',
        background: F.surface2,
        border: "1px solid ".concat(F.border),
        borderRadius: 10,
        padding: '9px 12px',
        color: F.text,
        fontSize: 14,
        outline: 'none',
        marginBottom: 10,
        boxSizing: 'border-box'
      }
    }), /*#__PURE__*/React.createElement("label", {
      htmlFor: "ev-allday-".concat(evKey),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        marginBottom: 10,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      id: "ev-allday-".concat(evKey),
      defaultChecked: !ev.hora,
      style: {
        width: 16,
        height: 16,
        accentColor: F.coral
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: F.text,
        fontSize: 12,
        fontWeight: 700
      }
    }, "\uD83D\uDCC5 Dia todo (sem hora espec\xEDfica)")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: F.muted,
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 4
      }
    }, "\uD83D\uDD50 Hora"), /*#__PURE__*/React.createElement("input", {
      type: "time",
      defaultValue: ev.hora || '',
      id: "ev-h-".concat(evKey),
      style: {
        width: '100%',
        background: F.surface2,
        border: "1px solid ".concat(F.border),
        borderRadius: 10,
        padding: '9px 12px',
        color: F.text,
        fontSize: 14,
        outline: 'none',
        boxSizing: 'border-box'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: F.muted,
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 4
      }
    }, "Para quem"), /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', gap: 6, marginBottom: 8 }
    }, /*#__PURE__*/React.createElement("button", {
      type: 'button',
      onClick: function onClick() {
        members.forEach(function (mb) {
          if (mb.id === 'todos') return;
          var cb = document.getElementById("ev-w-".concat(evKey, "-").concat(mb.id));
          if (cb) cb.checked = mb.id === currentMemberId;
        });
      },
      style: {
        flex: 1, background: F.surface2, border: "1px solid ".concat(F.border),
        borderRadius: 8, padding: '6px', color: F.muted, fontSize: 11, fontWeight: 700, cursor: 'pointer'
      }
    }, "\uD83D\uDC64 S\xF3 eu"), /*#__PURE__*/React.createElement("button", {
      type: 'button',
      onClick: function onClick() {
        members.forEach(function (mb) {
          if (mb.id === 'todos') return;
          var cb = document.getElementById("ev-w-".concat(evKey, "-").concat(mb.id));
          if (cb) cb.checked = true;
        });
      },
      style: {
        flex: 1, background: F.surface2, border: "1px solid ".concat(F.border),
        borderRadius: 8, padding: '6px', color: F.muted, fontSize: 11, fontWeight: 700, cursor: 'pointer'
      }
    }, "\uD83D\uDC65 Todos")), /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', gap: 6, flexWrap: 'wrap' }
    }, members.filter(function (mb) {
      return mb.id !== 'todos';
    }).map(function (mb) {
      var defChecked = (ev.participantes || ['todos']).indexOf('todos') !== -1 || (ev.participantes || []).indexOf(mb.id) !== -1;
      return /*#__PURE__*/React.createElement("label", {
        key: mb.id,
        htmlFor: "ev-w-".concat(evKey, "-").concat(mb.id),
        style: {
          display: 'flex', alignItems: 'center', gap: 4,
          background: F.surface2, border: "1px solid ".concat(F.border),
          borderRadius: 16, padding: '5px 10px', cursor: 'pointer'
        }
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        id: "ev-w-".concat(evKey, "-").concat(mb.id),
        defaultChecked: defChecked,
        style: { width: 13, height: 13, accentColor: mb.color }
      }), /*#__PURE__*/React.createElement("span", {
        style: { fontSize: 12 }
      }, mb.emoji), /*#__PURE__*/React.createElement("span", {
        style: { fontSize: 11, fontWeight: 700, color: F.text }
      }, mb.name));
    })))), /*#__PURE__*/React.createElement("p", {
      style: {
        color: F.muted,
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 4
      }
    }, "Nota"), /*#__PURE__*/React.createElement("input", {
      defaultValue: ev.nota || '',
      id: "ev-n-".concat(evKey),
      autoComplete: "off",
      placeholder: "Opcional",
      style: {
        width: '100%',
        background: F.surface2,
        border: "1px solid ".concat(F.border),
        borderRadius: 10,
        padding: '9px 12px',
        color: F.text,
        fontSize: 14,
        outline: 'none',
        marginBottom: 12,
        boxSizing: 'border-box'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setEditEvKey(null);
      },
      style: {
        flex: 1,
        background: F.surface2,
        border: "1px solid ".concat(F.border),
        borderRadius: 10,
        padding: '10px',
        color: F.muted,
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
      disabled: editEvSaving,
      onClick: function onClick() {
        var _document$getElementB2, _document$getElementB3, _document$getElementB5;
        var titulo = ((_document$getElementB2 = document.getElementById("ev-t-".concat(evKey))) === null || _document$getElementB2 === void 0 ? void 0 : _document$getElementB2.value.trim()) || ev.t;
        var newDate = document.getElementById("ev-d-".concat(evKey)) ? document.getElementById("ev-d-".concat(evKey)).value || selDateStr : selDateStr;
        var dateChanged = newDate !== selDateStr;
        var isAllDay = document.getElementById("ev-allday-".concat(evKey)) ? document.getElementById("ev-allday-".concat(evKey)).checked : false;
        var hora = isAllDay ? '' : ((_document$getElementB3 = document.getElementById("ev-h-".concat(evKey))) === null || _document$getElementB3 === void 0 ? void 0 : _document$getElementB3.value) || ev.hora || '';
        var checkedMembers = members.filter(function (mb) {
          if (mb.id === 'todos') return false;
          var cb = document.getElementById("ev-w-".concat(evKey, "-").concat(mb.id));
          return cb && cb.checked;
        }).map(function (mb) {
          return mb.id;
        });
        var participantes = checkedMembers.length === 0 ? ['todos'] : checkedMembers.length === members.length - 1 ? ['todos'] : checkedMembers;
        var nota = ((_document$getElementB5 = document.getElementById("ev-n-".concat(evKey))) === null || _document$getElementB5 === void 0 ? void 0 : _document$getElementB5.value.trim()) || '';
        var firstSpecific = participantes.find(function (id) {
          return id !== 'todos';
        });
        var newColor = (function () {
          var found = members.find(function (x) {
            return x.id === firstSpecific;
          });
          return found ? found.color : ev.color;
        })();
        var prevEv = ev;
        var applyLocal = function applyLocal(novo) {
          (verArquivados ? setEventsArquivados : setEvents)(function (p) {
            var d = _objectSpread({}, p);
            var arr = _toConsumableArray(d[selDateStr] || []);
            var idx = arr.findIndex(function (item) { return item.id === ev.id; });
            if (idx === -1) idx = i;
            if (novo && dateChanged) {
              // Remover do dia antigo, adicionar no novo
              arr.splice(idx, 1);
              d[selDateStr] = arr;
              d[newDate] = [].concat(_toConsumableArray(d[newDate] || []), [_objectSpread(_objectSpread({}, ev), novo)]);
            } else {
              arr[idx] = novo ? _objectSpread(_objectSpread({}, arr[idx]), novo) : prevEv;
              d[selDateStr] = arr;
            }
            return d;
          });
          if (novo && dateChanged) setSelDay(parseInt(newDate.slice(8)));
        };
        if (!window.supabaseClient || !ev.id) {
          setEditEvErr('Sem ligação ao servidor — não foi guardado.');
          return;
        }
        setEditEvErr('');
        setEditEvSaving(true);
        applyLocal({
          t: titulo,
          hora: hora,
          participantes: participantes,
          nota: nota,
          color: newColor
        });
        window.supabaseClient.from('family_events').update({
          title: titulo,
          event_date: newDate,
          event_time: hora || null,
          member_id: participantes.indexOf('todos') !== -1 ? null : participantes[0],
          participant_ids: participantes,
          description: nota || null,
          color: newColor
        }).eq('id', ev.id).then(function (res) {
          setEditEvSaving(false);
          if (res.error) {
            setEditEvErr('Erro ao guardar: ' + res.error.message);
            applyLocal(null);
            return;
          }
          setEditEvErr('');
          setEditEvKey(null);
          try {
            getEligibleProfileIds('familia', null).then(function (ids) {
              if (!ids.length) return;
              window.supabaseClient.functions.invoke('send-push', {
                body: {
                  title: 'Fam\u00edlia Carvalho',
                  body: '\u270F\uFE0F ' + titulo + (hora ? ' \u00b7 ' + hora : ''),
                  profileIds: ids
                }
              }).catch(function () {});
            });
          } catch (e) {}
        }).catch(function (e) {
          setEditEvSaving(false);
          setEditEvErr('Erro de ligação: ' + (e && e.message || String(e)));
          applyLocal(null);
        });
      },
      style: {
        flex: 2,
        background: editEvSaving ? F.muted : "linear-gradient(135deg,".concat(F.coral, ",#F59458)"),
        border: 'none',
        borderRadius: 10,
        padding: '10px',
        color: '#fff',
        fontSize: 13,
        fontWeight: 800,
        cursor: editEvSaving ? 'default' : 'pointer'
      }
    }, editEvSaving ? 'A guardar…' : '✓ Guardar')), editEvErr && /*#__PURE__*/React.createElement("p", {
      style: {
        color: '#DC2626',
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center'
      }
    }, "\u26A0\uFE0F ", editEvErr)));
  }), selEvents.length === 0 && sharedForDay.length === 0 && /*#__PURE__*/React.createElement(FCard, {
    style: {
      padding: '24px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 32
    }
  }, "\uD83D\uDCC5"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: F.muted,
      fontSize: 13,
      marginTop: 8
    }
  }, "Nenhum evento neste dia"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setForm(function (p) {
        return _objectSpread(_objectSpread({}, p), {}, {
          dataDE: selDateStr,
          dataATE: selDateStr
        });
      });
      setShowAdd(true);
    },
    style: {
      background: "linear-gradient(135deg,".concat(F.coral, ",#F59458)"),
      border: 'none',
      borderRadius: 12,
      padding: '10px 20px',
      color: '#fff',
      fontSize: 13,
      fontWeight: 800,
      cursor: 'pointer',
      marginTop: 12
    }
  }, "+ Adicionar evento"))), mainView === 'graficos' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px 20px'
    }
  }, /*#__PURE__*/React.createElement(FCard, {
    style: {
      padding: '16px',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: F.text,
      fontWeight: 800,
      fontSize: 14,
      marginBottom: 4
    }
  }, "\uD83D\uDCCA Eventos por categoria"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: F.muted,
      fontSize: 11,
      marginBottom: 14
    }
  }, curMonth.toLocaleDateString('pt-PT', {
    month: 'long',
    year: 'numeric'
  }), " \xB7 ", statsGraficos.totalEventos, " no total"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 12,
      height: 100
    }
  }, Object.keys(CATEGORIAS).map(function (catKey) {
    var cat = CATEGORIAS[catKey];
    var val = statsGraficos.porCategoria[catKey] || 0;
    var maxVal = Math.max.apply(Math, Object.values(statsGraficos.porCategoria).concat([1]));
    var h = Math.max(4, val / maxVal * 80);
    return /*#__PURE__*/React.createElement("div", {
      key: catKey,
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: { fontSize: 12, fontWeight: 800, color: cat.color }
    }, val), /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        maxWidth: 36,
        height: h,
        background: cat.color,
        borderRadius: '6px 6px 0 0'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: { fontSize: 14 }
    }, cat.emoji));
  }))), /*#__PURE__*/React.createElement(FCard, {
    style: {
      padding: '16px',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: F.text,
      fontWeight: 800,
      fontSize: 14,
      marginBottom: 4
    }
  }, "\uD83D\uDCBC Horas de trabalho por semana"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: F.muted,
      fontSize: 11,
      marginBottom: 14
    }
  }, "Dados reais do Patricio Time"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 10,
      height: 90
    }
  }, statsGraficos.horasPorSemana.map(function (val, wi) {
    var maxVal = Math.max.apply(Math, statsGraficos.horasPorSemana.concat([1]));
    var h = Math.max(4, val / maxVal * 70);
    return /*#__PURE__*/React.createElement("div", {
      key: wi,
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: { fontSize: 11, fontWeight: 800, color: '#F59458' }
    }, val.toFixed(0), "h"), /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        maxWidth: 30,
        height: h,
        background: '#F59458',
        borderRadius: '6px 6px 0 0'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: { fontSize: 10, color: F.muted, fontWeight: 700 }
    }, "S", wi + 1));
  }))), /*#__PURE__*/React.createElement(FCard, {
    style: {
      padding: '16px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: F.text,
      fontWeight: 800,
      fontSize: 14,
      marginBottom: 4
    }
  }, "\uD83D\uDCDA Eventos escolares por semana"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: F.muted,
      fontSize: 11,
      marginBottom: 14
    }
  }, "Testes e eventos da Escola"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 10,
      height: 90
    }
  }, statsGraficos.escolaPorSemana.map(function (val, wi) {
    var maxVal = Math.max.apply(Math, statsGraficos.escolaPorSemana.concat([1]));
    var h = Math.max(4, val / maxVal * 70);
    return /*#__PURE__*/React.createElement("div", {
      key: wi,
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: { fontSize: 11, fontWeight: 800, color: CATEGORIAS.escola.color }
    }, val), /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        maxWidth: 30,
        height: h,
        background: CATEGORIAS.escola.color,
        borderRadius: '6px 6px 0 0'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: { fontSize: 10, color: F.muted, fontWeight: 700 }
    }, "S", wi + 1));
  })))), mainView !== 'arquivo' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 20px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: F.muted,
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      marginBottom: 10
    }
  }, "Pr\xF3ximas marca\xE7\xF5es"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginBottom: 14,
      background: F.surface2,
      borderRadius: 14,
      padding: 4,
      border: "1px solid ".concat(F.border)
    }
  }, ['Hoje', 'Semana', 'Mês'].map(function (t) {
    return /*#__PURE__*/React.createElement("button", {
      key: t,
      onClick: function onClick() {
        return setTimeTab(t);
      },
      style: {
        flex: 1,
        background: timeTab === t ? F.coral : 'transparent',
        border: 'none',
        borderRadius: 11,
        padding: '8px',
        color: timeTab === t ? '#fff' : F.muted,
        fontSize: 13,
        fontWeight: 800,
        cursor: 'pointer'
      }
    }, t);
  })), function () {
    var now = new Date();
    var todayStr2 = "".concat(now.getFullYear(), "-").concat(String(now.getMonth() + 1).padStart(2, '0'), "-").concat(String(now.getDate()).padStart(2, '0'));
    var weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    var monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Collect all events with dates
    var allEvs = Object.entries(events).flatMap(function (_ref21) {
      var _ref22 = _slicedToArray(_ref21, 2),
        date = _ref22[0],
        evs = _ref22[1];
      return evs.map(function (ev) {
        return _objectSpread(_objectSpread({}, ev), {}, {
          date: date
        });
      });
    }).concat(sharedDias.map(function (d) {
      return {
        t: d.tipo === 'ferias' ? 'Férias' : d.tipo === 'feriado' ? 'Feriado' : 'Dia livre',
        emoji: d.tipo === 'ferias' ? '🏖' : d.tipo === 'feriado' ? '🎌' : '✅',
        who: 'todos',
        color: F.purple,
        date: d.date,
        nota: d.nome || ''
      };
    })).filter(function (ev) {
      var d = new Date(ev.date + 'T12:00:00');
      var evIds = ev.participantes || (ev.who ? [ev.who] : ['todos']);
      if (ev.arquivado) return false;
      if (selMember !== 'todos' && evIds.indexOf('todos') === -1 && evIds.indexOf(selMember) === -1) return false;
      if (timeTab === 'Hoje') return ev.date === todayStr2;
      if (timeTab === 'Semana') return d >= now && d <= weekEnd;
      return d >= now && d <= monthEnd;
    }).sort(function (a, b) {
      return a.date.localeCompare(b.date);
    });
    if (allEvs.length === 0) return /*#__PURE__*/React.createElement(FCard, {
      style: {
        padding: '20px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 24
      }
    }, "\uD83D\uDDD3"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: F.muted,
        fontSize: 13,
        marginTop: 6
      }
    }, "Sem eventos para ", timeTab.toLowerCase()));

    // Group by date
    var grouped2 = allEvs.reduce(function (acc, ev) {
      (acc[ev.date] = acc[ev.date] || []).push(ev);
      return acc;
    }, {});
    return Object.entries(grouped2).sort(function (_ref23, _ref24) {
      var _ref25 = _slicedToArray(_ref23, 1),
        a = _ref25[0];
      var _ref26 = _slicedToArray(_ref24, 1),
        b = _ref26[0];
      return a.localeCompare(b);
    }).map(function (_ref27) {
      var _ref28 = _slicedToArray(_ref27, 2),
        date = _ref28[0],
        evs = _ref28[1];
      var d = new Date(date + 'T12:00:00');
      var isToday2 = date === todayStr2;
      var dayNum = d.getDate();
      var dayWeekName = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'][d.getDay()];
      return /*#__PURE__*/React.createElement("div", {
        key: date,
        style: { marginBottom: 10 }
      }, evs.map(function (ev, i) {
        var evIds2 = ev.participantes || (ev.who ? [ev.who] : ['todos']);
        var participantMs = evIds2[0] === 'todos' ? members.filter(function(m) { return m.id !== 'todos'; }) : evIds2.map(function(id) { return members.find(function(m) { return m.id === id; }); }).filter(Boolean);
        var isFirst = i === 0;
        var isLast = i === evs.length - 1;
        return /*#__PURE__*/React.createElement("div", {
          key: i,
          onClick: function onClick() { setSelDateStr(date); setMainView('mes'); },
          style: {
            display: 'flex',
            alignItems: 'stretch',
            background: '#FFFFFF',
            borderRadius: 16,
            border: "1px solid ".concat(F.border),
            boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
            marginBottom: isLast ? 0 : 8,
            overflow: 'hidden',
            cursor: 'pointer'
          }
        },
        /*#__PURE__*/React.createElement("div", {
          style: {
            width: 80,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 6px',
            background: isToday2 ? F.coral : F.surface2,
            borderRight: "1px solid ".concat(F.border)
          }
        }, isFirst ? [
          /*#__PURE__*/React.createElement("span", {
            key: 'n',
            style: {
              fontSize: 42,
              fontWeight: 900,
              color: isToday2 ? '#fff' : F.coral,
              lineHeight: 1,
              letterSpacing: '-2px'
            }
          }, dayNum),
          /*#__PURE__*/React.createElement("span", {
            key: 'w',
            style: {
              fontSize: 11,
              fontWeight: 800,
              color: isToday2 ? 'rgba(255,255,255,0.75)' : F.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginTop: 4
            }
          }, isToday2 ? 'HOJE' : dayWeekName)
        ] : /*#__PURE__*/React.createElement("div", {
          style: {
            width: 2,
            height: 20,
            borderRadius: 2,
            background: isToday2 ? 'rgba(255,255,255,0.4)' : F.border
          }
        })),
        /*#__PURE__*/React.createElement("div", {
          style: {
            flex: 1,
            padding: '14px 10px 14px 14px',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8
          }
        },
        /*#__PURE__*/React.createElement("div", {
          style: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }
        },
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', alignItems: 'center', gap: 7 }
        },
        /*#__PURE__*/React.createElement("span", { style: { fontSize: 16, flexShrink: 0 } }, ev.emoji),
        /*#__PURE__*/React.createElement("p", {
          style: {
            fontWeight: 800,
            fontSize: 15,
            color: F.text,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }
        }, ev.t)),
        ev.hora ? /*#__PURE__*/React.createElement("p", {
          style: {
            fontSize: 12,
            fontWeight: 600,
            color: F.muted,
            paddingLeft: 23
          }
        }, ev.hora) : /*#__PURE__*/React.createElement("p", {
          style: {
            fontSize: 11,
            fontWeight: 600,
            color: F.muted,
            paddingLeft: 23
          }
        }, "Dia todo"),
        ev.nota ? /*#__PURE__*/React.createElement("p", {
          style: {
            fontSize: 11,
            color: F.muted,
            paddingLeft: 23,
            fontStyle: 'italic'
          }
        }, ev.nota) : null,
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', gap: 4, paddingLeft: 23 }
        }, participantMs.length > 0 ? participantMs.map(function(pm) {
          return /*#__PURE__*/React.createElement("div", {
            key: pm.id,
            style: {
              width: 22, height: 22, borderRadius: '50%',
              background: "".concat(pm.color, "20"),
              border: "2px solid ".concat(pm.color),
              overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }
          }, memberPhotos[pm.id] ? /*#__PURE__*/React.createElement("img", {
            src: memberPhotos[pm.id],
            style: { width: '100%', height: '100%', objectFit: 'cover' },
            alt: pm.name
          }) : /*#__PURE__*/React.createElement("span", { style: { fontSize: 11 } }, pm.emoji));
        }) : /*#__PURE__*/React.createElement("span", { style: { fontSize: 11, color: F.muted } }, "Todos"))),
        /*#__PURE__*/React.createElement("button", {
          onClick: function onClick(e) {
            e.stopPropagation();
            if (!window.supabaseClient || !ev.id) return;
            var evId = ev.id;
            var evDate = date;
            // Feedback imediato: mostrar ✓ verde
            setJustDoneIds(function(prev) { var s = new Set(prev); s.add(evId); return s; });
            // Arquivar no Supabase
            window.supabaseClient.from('family_events').update({ arquivado: true }).eq('id', evId).then(function() {}).catch(function() {});
            // Após 900ms remover da lista (mantém no calendário)
            setTimeout(function() {
              setEvents(function(p) {
                var d = _objectSpread({}, p);
                d[evDate] = (d[evDate] || []).map(function(item) {
                  return item.id === evId ? _objectSpread(_objectSpread({}, item), {}, { arquivado: true }) : item;
                });
                return d;
              });
              setJustDoneIds(function(prev) { var s = new Set(prev); s.delete(evId); return s; });
            }, 900);
          },
          style: {
            flexShrink: 0,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: justDoneIds.has(ev.id) ? '#2D8A4E' : F.surface2,
            border: justDoneIds.has(ev.id) ? '1.5px solid #2D8A4E' : "1.5px solid ".concat(F.border),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: justDoneIds.has(ev.id) ? 'default' : 'pointer',
            fontSize: justDoneIds.has(ev.id) ? 18 : 20,
            lineHeight: 1,
            transition: 'all 0.2s',
            transform: justDoneIds.has(ev.id) ? 'scale(1.1)' : 'scale(1)'
          }
        }, justDoneIds.has(ev.id) ? "\u2713" : "\u2705")
        ));
      }));
    });
  }()), mainView === 'arquivo' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px 20px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: F.text,
      fontWeight: 900,
      fontSize: 16,
      marginBottom: 12
    }
  }, "\uD83D\uDCE6 Arquivo \u2014 todos os eventos feitos"), (function () {
    var allArqDates = Object.keys(eventsArquivados).filter(function (d) { return (eventsArquivados[d] || []).length > 0; });
    if (!allArqDates.length) {
      return /*#__PURE__*/React.createElement("p", { style: { color: F.muted, fontSize: 13, textAlign: 'center', padding: '30px 0' } }, "Ainda n\xE3o h\xE1 eventos arquivados.");
    }
    var weekGroups = {};
    allArqDates.forEach(function (d) {
      var dt = new Date(d + 'T00:00:00');
      var dow = dt.getDay();
      var monday = new Date(dt);
      monday.setDate(dt.getDate() - (dow === 0 ? 6 : dow - 1));
      var wk = monday.toISOString().slice(0, 10);
      if (!weekGroups[wk]) weekGroups[wk] = [];
      (eventsArquivados[d] || []).forEach(function (ev) { weekGroups[wk].push(_objectSpread(_objectSpread({}, ev), {}, { _date: d })); });
    });
    var weekKeys = Object.keys(weekGroups).sort().reverse();
    return weekKeys.map(function (wk) {
      var wkStart = new Date(wk + 'T00:00:00');
      var wkEnd = new Date(wkStart); wkEnd.setDate(wkEnd.getDate() + 6);
      var tmp = new Date(wkStart); tmp.setDate(tmp.getDate() + 4 - (tmp.getDay() || 7));
      var isoWeek = Math.ceil(((tmp - new Date(tmp.getFullYear(), 0, 1)) / 86400000 + 1) / 7);
      var wkLabel = "Semana ".concat(isoWeek, " \u00B7 ").concat(wkStart.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' }), " \u2013 ").concat(wkEnd.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' }));
      var byTitle = {};
      weekGroups[wk].forEach(function (ev) {
        var k = (ev.t || '').toLowerCase().trim();
        if (!byTitle[k]) byTitle[k] = { ev: ev, dates: [], ids: [] };
        if (byTitle[k].dates.indexOf(ev._date) === -1) byTitle[k].dates.push(ev._date);
        if (ev.id && byTitle[k].ids.indexOf(ev.id) === -1) byTitle[k].ids.push(ev.id);
      });
      var deduped = Object.values(byTitle).map(function (g) { g.dates.sort(); return g; });
      return /*#__PURE__*/React.createElement("div", { key: wk, style: { marginBottom: 22 } },
        /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 } },
          /*#__PURE__*/React.createElement("div", { style: { height: 1, flex: 1, background: F.border } }),
          /*#__PURE__*/React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: F.coral, whiteSpace: 'nowrap', padding: '0 6px' } }, wkLabel),
          /*#__PURE__*/React.createElement("div", { style: { height: 1, flex: 1, background: F.border } })),
        deduped.map(function (g, i) {
          var ev = g.ev;
          var nDays = g.dates.length;
          var firstSpecific = (ev.participantes || ['todos']).find(function (id) { return id !== 'todos'; });
          var m = members.find(function (x) { return x.id === firstSpecific; });
          var whoLabel = firstSpecific ? ((m === null || m === void 0 ? void 0 : m.name) || '') : 'Toda a fam\xEDlia';
          var dateLabel = nDays === 1
            ? new Date(g.dates[0] + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' })
            : "".concat(nDays, " dias \u00B7 ").concat(new Date(g.dates[0] + 'T00:00:00').toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' }), " \u2013 ").concat(new Date(g.dates[nDays - 1] + 'T00:00:00').toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' }));
          return /*#__PURE__*/React.createElement(FCard, { key: i, style: { padding: '10px 12px', marginBottom: 8, borderLeft: "3px solid ".concat(ev.color), display: 'flex', alignItems: 'center', gap: 10 } },
            /*#__PURE__*/React.createElement("span", { style: { fontSize: 18, flexShrink: 0 } }, ev.emoji),
            /*#__PURE__*/React.createElement("div", { style: { flex: 1, minWidth: 0 } },
              /*#__PURE__*/React.createElement("p", { style: { fontWeight: 800, fontSize: 13, color: F.text, textDecoration: 'line-through', opacity: 0.7 } }, ev.t),
              /*#__PURE__*/React.createElement("p", { style: { fontSize: 11, color: F.muted, marginTop: 1 } }, whoLabel, " \u00B7 ", dateLabel)),
            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: 6, flexShrink: 0 } },
              /*#__PURE__*/React.createElement("button", {
                onClick: function onClick() {
                  g.ids.forEach(function (id) { if (window.supabaseClient) window.supabaseClient.from('family_events').update({ arquivado: false }).eq('id', id).then(function () {}).catch(function () {}); });
                  g.dates.forEach(function (d) {
                    setEventsArquivados(function (p) { var nx = _objectSpread({}, p); nx[d] = (nx[d] || []).filter(function (it) { return g.ids.indexOf(it.id) === -1; }); return nx; });
                    setEvents(function (p) { var nx = _objectSpread({}, p); var toAdd = (eventsArquivados[d] || []).filter(function (it) { return g.ids.indexOf(it.id) !== -1; }).map(function (it) { return _objectSpread(_objectSpread({}, it), {}, { arquivado: false }); }); nx[d] = [].concat(_toConsumableArray(nx[d] || []), toAdd); return nx; });
                  });
                },
                title: 'Restaurar',
                style: { background: "".concat(F.green, "12"), border: "1px solid ".concat(F.green, "33"), borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: F.green, fontSize: 13 }
              }, "\u21A9\uFE0F"),
              /*#__PURE__*/React.createElement("button", {
                onClick: function onClick() {
                  g.ids.forEach(function (id) { if (window.supabaseClient) window.supabaseClient.from('family_events').delete().eq('id', id).then(function () {}).catch(function () {}); });
                  g.dates.forEach(function (d) {
                    setEventsArquivados(function (p) { var nx = _objectSpread({}, p); nx[d] = (nx[d] || []).filter(function (it) { return g.ids.indexOf(it.id) === -1; }); return nx; });
                    setEvents(function (p) { var nx = _objectSpread({}, p); nx[d] = (nx[d] || []).filter(function (it) { return g.ids.indexOf(it.id) === -1; }); return nx; });
                  });
                },
                title: 'Apagar definitivamente',
                style: { background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: F.red, fontSize: 13 }
              }, "\uD83D\uDDD1\uFE0F")));
        }));
    });
  })()), showAdd && /*#__PURE__*/React.createElement("div", {
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
      background: 'rgba(0,0,0,0.4)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      background: F.surface,
      borderRadius: '22px 22px 0 0',
      border: "2px solid ".concat(F.coral),
      borderBottom: 'none',
      padding: '20px 16px 32px',
      maxHeight: '85vh',
      overflowY: 'auto',
      boxShadow: '0 -8px 40px rgba(184,120,60,0.15)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: F.coral,
      fontWeight: 800,
      fontSize: 16,
      marginBottom: 14
    }
  }, "Novo evento familiar"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: F.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 6
    }
  }, "\xCDcone"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 12,
      flexWrap: 'wrap'
    }
  }, ['📅', '🏠', '🏥', '🦷', '🎂', '✈️', '🎓', '⚽', '🎉', '🛒', '📚', '💊'].map(function (e) {
    return /*#__PURE__*/React.createElement("button", {
      key: e,
      onClick: function onClick() {
        return setForm(function (p) {
          return _objectSpread(_objectSpread({}, p), {}, {
            emoji: e
          });
        });
      },
      style: {
        background: form.emoji === e ? "".concat(F.coral, "22") : F.surface2,
        border: "1px solid ".concat(form.emoji === e ? F.coral : F.border),
        borderRadius: 10,
        padding: '8px',
        fontSize: 20,
        cursor: 'pointer'
      }
    }, e);
  })), /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      return setForm(function (p) {
        return _objectSpread(_objectSpread({}, p), {}, {
          diaTodo: !p.diaTodo,
          hora: !p.diaTodo ? '' : p.hora
        });
      });
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 20,
      height: 20,
      borderRadius: 6,
      border: "2px solid ".concat(form.diaTodo ? F.coral : F.border),
      background: form.diaTodo ? F.coral : 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: 12,
      fontWeight: 900
    }
  }, form.diaTodo ? '✓' : ''), /*#__PURE__*/React.createElement("span", {
    style: {
      color: F.text,
      fontSize: 13,
      fontWeight: 700
    }
  }, "\uD83D\uDCC5 Dia todo (sem hora espec\xEDfica)")), [{
    l: 'Título',
    k: 'titulo',
    type: 'text',
    ph: 'Ex: Médico Lucas'
  }, !form.diaTodo && {
    l: 'Hora',
    k: 'hora',
    type: 'time',
    ph: ''
  }, {
    l: 'Nota',
    k: 'nota',
    type: 'text',
    ph: 'Informação adicional (opcional)'
  }].filter(Boolean).map(function (f) {
    return /*#__PURE__*/React.createElement("div", {
      key: f.k,
      style: {
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: F.muted,
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
      placeholder: f.ph,
      style: {
        width: '100%',
        background: F.surface2,
        border: "1px solid ".concat(F.border),
        borderRadius: 12,
        padding: '11px 14px',
        color: F.text,
        fontSize: 14,
        outline: 'none',
        boxSizing: 'border-box'
      }
    }));
  }), /*#__PURE__*/React.createElement("p", {
    style: { color: F.muted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }
  }, "\uD83D\uDD14 Lembrete"), /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }
  }, [
    { label: 'Nenhum', val: null },
    { label: '15 min', val: 15 },
    { label: '30 min', val: 30 },
    { label: '45 min', val: 45 },
    { label: '1 hora', val: 60 },
    { label: '2 horas', val: 120 },
    { label: '3 horas', val: 180 },
    { label: '1 dia', val: 1440 },
    { label: '2 dias', val: 2880 },
    { label: '3 dias', val: 4320 }
  ].map(function (opt) {
    var isSel = form.lembrete === opt.val;
    return /*#__PURE__*/React.createElement("button", {
      key: String(opt.val),
      onClick: function onClick() { return setForm(function (p) { return _objectSpread(_objectSpread({}, p), {}, { lembrete: opt.val }); }); },
      style: {
        padding: '6px 12px',
        borderRadius: 20,
        border: isSel ? "1.5px solid ".concat(F.coral) : "1.5px solid ".concat(F.border),
        background: isSel ? F.coral : F.surface2,
        color: isSel ? '#fff' : F.muted,
        fontSize: 12,
        fontWeight: isSel ? 800 : 600,
        cursor: 'pointer',
        transition: 'all 0.15s'
      }
    }, opt.label);
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      color: F.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 6
    }
  }, "Per\xEDodo"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: F.muted,
      fontSize: 9,
      fontWeight: 700,
      marginBottom: 3
    }
  }, "DE"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: form.dataDE,
    onChange: function onChange(e) {
      return setForm(function (p) {
        return _objectSpread(_objectSpread({}, p), {}, {
          dataDE: e.target.value,
          dataATE: p.dataATE < e.target.value ? e.target.value : p.dataATE
        });
      });
    },
    style: {
      width: '100%',
      background: F.surface2,
      border: "1px solid ".concat(form.dataDE ? F.coral : F.border),
      borderRadius: 12,
      padding: '11px 10px',
      color: F.text,
      fontSize: 13,
      outline: 'none',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      paddingBottom: 12,
      color: F.muted,
      fontSize: 18,
      fontWeight: 300
    }
  }, "\u2192"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: F.muted,
      fontSize: 9,
      fontWeight: 700,
      marginBottom: 3
    }
  }, "AT\xC9 (opcional)"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: form.dataATE,
    onChange: function onChange(e) {
      return setForm(function (p) {
        return _objectSpread(_objectSpread({}, p), {}, {
          dataATE: e.target.value
        });
      });
    },
    min: form.dataDE,
    style: {
      width: '100%',
      background: F.surface2,
      border: "1px solid ".concat(form.dataATE && form.dataATE !== form.dataDE ? F.coral : F.border),
      borderRadius: 12,
      padding: '11px 10px',
      color: F.text,
      fontSize: 13,
      outline: 'none',
      boxSizing: 'border-box'
    }
  }))), form.dataDE && form.dataATE && form.dataATE > form.dataDE && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "".concat(F.coral, "12"),
      border: "1px solid ".concat(F.coral, "33"),
      borderRadius: 10,
      padding: '8px 12px',
      marginBottom: 10,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: F.coral,
      fontSize: 12,
      fontWeight: 700
    }
  }, "\uD83D\uDCC5 ", Math.round((new Date(form.dataATE) - new Date(form.dataDE)) / 86400000) + 1, " dias marcados")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: F.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 8
    }
  }, "Categoria"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginBottom: 16,
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
        background: isSel ? "".concat(cat.color, "18") : F.surface2,
        border: "1px solid ".concat(isSel ? cat.color : F.border),
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
        color: isSel ? cat.color : F.muted
      }
    }, cat.label));
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      color: F.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 8
    }
  }, "Para quem"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      marginBottom: 9
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setForm(function (p) {
        return _objectSpread(_objectSpread({}, p), {}, {
          participantes: [currentMemberId]
        });
      });
    },
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      background: form.participantes.length === 1 && form.participantes[0] === currentMemberId ? "".concat(F.coral, "18") : F.surface2,
      border: "1px solid ".concat(form.participantes.length === 1 && form.participantes[0] === currentMemberId ? F.coral : F.border),
      borderRadius: 12,
      padding: '9px 10px',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: { fontSize: 13 }
  }, "\uD83D\uDC64"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: form.participantes.length === 1 && form.participantes[0] === currentMemberId ? F.coral : F.muted
    }
  }, "S\xF3 eu")), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setForm(function (p) {
        return _objectSpread(_objectSpread({}, p), {}, {
          participantes: ['todos']
        });
      });
    },
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      background: form.participantes.indexOf('todos') !== -1 ? "".concat(F.coral, "18") : F.surface2,
      border: "1px solid ".concat(form.participantes.indexOf('todos') !== -1 ? F.coral : F.border),
      borderRadius: 12,
      padding: '9px 10px',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: { fontSize: 13 }
  }, "\uD83D\uDC65"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: form.participantes.indexOf('todos') !== -1 ? F.coral : F.muted
    }
  }, "Toda a fam\xEDlia"))), /*#__PURE__*/React.createElement("p", {
    style: {
      color: F.muted,
      fontSize: 9,
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 7
    }
  }, "Ou escolhe pessoas espec\xEDficas"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      marginBottom: 16,
      flexWrap: 'wrap'
    }
  }, members.filter(function (m) {
    return m.id !== 'todos';
  }).map(function (m) {
    var isSelected = form.participantes.indexOf('todos') === -1 && form.participantes.indexOf(m.id) !== -1;
    return /*#__PURE__*/React.createElement("button", {
      key: m.id,
      onClick: function onClick() {
        return setForm(function (p) {
          var current = p.participantes.indexOf('todos') !== -1 ? [] : p.participantes.slice();
          var idx = current.indexOf(m.id);
          if (idx !== -1) current.splice(idx, 1);else current.push(m.id);
          if (current.length === 0) current = ['todos'];
          return _objectSpread(_objectSpread({}, p), {}, {
            participantes: current
          });
        });
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        background: isSelected ? "".concat(m.color, "18") : F.surface2,
        border: "1px solid ".concat(isSelected ? m.color : F.border),
        borderRadius: 20,
        padding: '6px 12px',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14
      }
    }, m.emoji), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: isSelected ? m.color : F.muted
      }
    }, m.name), isSelected && /*#__PURE__*/React.createElement("span", {
      style: { fontSize: 11, color: m.color, fontWeight: 900 }
    }, "\u2713"));
  })), /*#__PURE__*/React.createElement("div", {
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
      background: F.surface2,
      border: "1px solid ".concat(F.border),
      borderRadius: 14,
      padding: '13px',
      color: F.muted,
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    onClick: addEvent,
    style: {
      flex: 2,
      background: "linear-gradient(135deg,".concat(F.coral, ",#F59458)"),
      border: 'none',
      borderRadius: 14,
      padding: '13px',
      color: '#fff',
      fontSize: 14,
      fontWeight: 800,
      cursor: 'pointer',
      boxShadow: "0 4px 14px rgba(232,119,58,0.3)"
    }
  }, "\u2713 Adicionar")))));
}

// ── NUTRIGUIMA ──────────────────────────────────────────────────────

