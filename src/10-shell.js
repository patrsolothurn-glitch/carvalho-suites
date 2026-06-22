function CarvalhoSuite() {
  useFont();
  var _useState177 = (0, _react.useState)('login'),
    _useState178 = _slicedToArray(_useState177, 2),
    screen = _useState178[0],
    setScreen = _useState178[1];
  var _useState179 = (0, _react.useState)(''),
    _useState180 = _slicedToArray(_useState179, 2),
    pass = _useState180[0],
    setPass = _useState180[1];
  var _useStateEmail = (0, _react.useState)(''),
    _useStateEmail2 = _slicedToArray(_useStateEmail, 2),
    email = _useStateEmail2[0],
    setEmail = _useStateEmail2[1];
  var _useStateAuthMode = (0, _react.useState)('login'),
    _useStateAuthMode2 = _slicedToArray(_useStateAuthMode, 2),
    authMode = _useStateAuthMode2[0],
    setAuthMode = _useStateAuthMode2[1];
  var _useStateAuthMember = (0, _react.useState)(''),
    _useStateAuthMember2 = _slicedToArray(_useStateAuthMember, 2),
    signupName = _useStateAuthMember2[0],
    setSignupName = _useStateAuthMember2[1];
  var _useStateAuthLoading = (0, _react.useState)(false),
    _useStateAuthLoading2 = _slicedToArray(_useStateAuthLoading, 2),
    authLoading = _useStateAuthLoading2[0],
    setAuthLoading = _useStateAuthLoading2[1];
  var _useStateSession = (0, _react.useState)(null),
    _useStateSession2 = _slicedToArray(_useStateSession, 2),
    session = _useStateSession2[0],
    setSession = _useStateSession2[1];
  var _useStateProfile = (0, _react.useState)(null),
    _useStateProfile2 = _slicedToArray(_useStateProfile, 2),
    profile = _useStateProfile2[0],
    setProfile = _useStateProfile2[1];
  var _useStateProfiles = (0, _react.useState)([]),
    _useStateProfiles2 = _slicedToArray(_useStateProfiles, 2),
    allProfiles = _useStateProfiles2[0],
    setAllProfiles = _useStateProfiles2[1];
  var _useStateInvites = (0, _react.useState)([]),
    _useStateInvites2 = _slicedToArray(_useStateInvites, 2),
    pendingInvites = _useStateInvites2[0],
    setPendingInvites = _useStateInvites2[1];
  var _useStateNewInviteEmail = (0, _react.useState)(''),
    _useStateNewInviteEmail2 = _slicedToArray(_useStateNewInviteEmail, 2),
    newInviteEmail = _useStateNewInviteEmail2[0],
    setNewInviteEmail = _useStateNewInviteEmail2[1];
  var _useStateProfileErr = (0, _react.useState)(''),
    _useStateProfileErr2 = _slicedToArray(_useStateProfileErr, 2),
    profileErr = _useStateProfileErr2[0],
    setProfileErr = _useStateProfileErr2[1];
  var _useStateCheckingAuth = (0, _react.useState)(true),
    _useStateCheckingAuth2 = _slicedToArray(_useStateCheckingAuth, 2),
    checkingAuth = _useStateCheckingAuth2[0],
    setCheckingAuth = _useStateCheckingAuth2[1];
  var _useState181 = (0, _react.useState)(''),
    _useState182 = _slicedToArray(_useState181, 2),
    passErr = _useState182[0],
    setPassErr = _useState182[1];
  var _useState183 = (0, _react.useState)(true),
    _useState184 = _slicedToArray(_useState183, 2),
    online = _useState184[0],
    setOnline = _useState184[1];
  var _useStateLinkCopied = (0, _react.useState)(false),
    _useStateLinkCopied2 = _slicedToArray(_useStateLinkCopied, 2),
    linkCopied = _useStateLinkCopied2[0],
    setLinkCopied = _useStateLinkCopied2[1];
  var copyAppLink = function copyAppLink() {
    var url = 'https://patrsolothurn-glitch.github.io/carvalho-suites/';
    var done = function done() {
      setLinkCopied(true);
      setTimeout(function () {
        return setLinkCopied(false);
      }, 2200);
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done).catch(function () {
          fallbackCopy(url, done);
        });
      } else {
        fallbackCopy(url, done);
      }
    } catch (e) {
      fallbackCopy(url, done);
    }
  };
  var fallbackCopy = function fallbackCopy(text, cb) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      cb();
    } catch (e) {}
  };
  var _useStateCacheVer = (0, _react.useState)(''),
    _useStateCacheVer2 = _slicedToArray(_useStateCacheVer, 2),
    cacheVer = _useStateCacheVer2[0],
    setCacheVer = _useStateCacheVer2[1];
  var _useStateUpdChecking = (0, _react.useState)(false),
    _useStateUpdChecking2 = _slicedToArray(_useStateUpdChecking, 2),
    updChecking = _useStateUpdChecking2[0],
    setUpdChecking = _useStateUpdChecking2[1];
  var _useStateUpdMsg = (0, _react.useState)(''),
    _useStateUpdMsg2 = _slicedToArray(_useStateUpdMsg, 2),
    updMsg = _useStateUpdMsg2[0],
    setUpdMsg = _useStateUpdMsg2[1];
  var _useStatePushTestMsg = (0, _react.useState)(''),
    _useStatePushTestMsg2 = _slicedToArray(_useStatePushTestMsg, 2),
    pushTestMsg = _useStatePushTestMsg2[0],
    setPushTestMsg = _useStatePushTestMsg2[1];
  var _useStatePushTestChecking = (0, _react.useState)(false),
    _useStatePushTestChecking2 = _slicedToArray(_useStatePushTestChecking, 2),
    pushTestChecking = _useStatePushTestChecking2[0],
    setPushTestChecking = _useStatePushTestChecking2[1];
  var _useStateAddMemberOpen = (0, _react.useState)(false),
    _useStateAddMemberOpen2 = _slicedToArray(_useStateAddMemberOpen, 2),
    addMemberOpen = _useStateAddMemberOpen2[0],
    setAddMemberOpen = _useStateAddMemberOpen2[1];
  var _useStateNewMemberName = (0, _react.useState)(''),
    _useStateNewMemberName2 = _slicedToArray(_useStateNewMemberName, 2),
    newMemberName = _useStateNewMemberName2[0],
    setNewMemberName = _useStateNewMemberName2[1];
  var _useStateNewMemberEmail = (0, _react.useState)(''),
    _useStateNewMemberEmail2 = _slicedToArray(_useStateNewMemberEmail, 2),
    newMemberEmail = _useStateNewMemberEmail2[0],
    setNewMemberEmail = _useStateNewMemberEmail2[1];
  var _useStateNewMemberPwd = (0, _react.useState)(''),
    _useStateNewMemberPwd2 = _slicedToArray(_useStateNewMemberPwd, 2),
    newMemberPwd = _useStateNewMemberPwd2[0],
    setNewMemberPwd = _useStateNewMemberPwd2[1];
  var _useStateNewMemberEmoji = (0, _react.useState)('👤'),
    _useStateNewMemberEmoji2 = _slicedToArray(_useStateNewMemberEmoji, 2),
    newMemberEmoji = _useStateNewMemberEmoji2[0],
    setNewMemberEmoji = _useStateNewMemberEmoji2[1];
  var _useStateNewMemberMemberId = (0, _react.useState)(''),
    _useStateNewMemberMemberId2 = _slicedToArray(_useStateNewMemberMemberId, 2),
    newMemberMemberId = _useStateNewMemberMemberId2[0],
    setNewMemberMemberId = _useStateNewMemberMemberId2[1];
  var _useStateNewMemberApps = (0, _react.useState)([]),
    _useStateNewMemberApps2 = _slicedToArray(_useStateNewMemberApps, 2),
    newMemberApps = _useStateNewMemberApps2[0],
    setNewMemberApps = _useStateNewMemberApps2[1];
  var _useStateEditingMember = (0, _react.useState)(null),
    _useStateEditingMember2 = _slicedToArray(_useStateEditingMember, 2),
    editingMember = _useStateEditingMember2[0],
    setEditingMember = _useStateEditingMember2[1];
  var _useStateMemberMsg = (0, _react.useState)(''),
    _useStateMemberMsg2 = _slicedToArray(_useStateMemberMsg, 2),
    memberMsg = _useStateMemberMsg2[0],
    setMemberMsg = _useStateMemberMsg2[1];
  var _useStateMemberBusy = (0, _react.useState)(false),
    _useStateMemberBusy2 = _slicedToArray(_useStateMemberBusy, 2),
    memberBusy = _useStateMemberBusy2[0],
    setMemberBusy = _useStateMemberBusy2[1];
  var _useState185 = (0, _react.useState)(USERS_DEF),
    _useState186 = _slicedToArray(_useState185, 2),
    users = _useState186[0],
    setUsers = _useState186[1];
  var _useState187 = (0, _react.useState)(PERMS_DEF),
    _useState188 = _slicedToArray(_useState187, 2),
    perms = _useState188[0],
    setPerms = _useState188[1];
  var _useState189 = (0, _react.useState)('patricio'),
    _useState190 = _slicedToArray(_useState189, 2),
    activeUser = _useState190[0],
    setUser = _useState190[1];
  var _useStateVoltarBannerShown = (0, _react.useState)(false),
    _useStateVoltarBannerShown2 = _slicedToArray(_useStateVoltarBannerShown, 2),
    voltarBannerShown = _useStateVoltarBannerShown2[0],
    setVoltarBannerShown = _useStateVoltarBannerShown2[1];
  (0, _react.useEffect)(function () {
    if (activeUser === 'patricio') return;
    setVoltarBannerShown(true);
    var t = setTimeout(function () {
      setVoltarBannerShown(false);
    }, 4000);
    return function () {
      clearTimeout(t);
    };
  }, [activeUser]);
  var _useState191 = (0, _react.useState)(null),
    _useState192 = _slicedToArray(_useState191, 2),
    activeApp = _useState192[0],
    setApp = _useState192[1];
  // Estado partilhado entre TODAS as apps
  var _useState193 = (0, _react.useState)([
      // Exemplo: {date:'2026-06-20', tipo:'ferias', nome:'Férias Verão', addedBy:'patricio'}
    ]),
    _useState194 = _slicedToArray(_useState193, 2),
    sharedDias = _useState194[0],
    setSharedDias = _useState194[1];
  var addSharedDia = function addSharedDia(dia) {
    return setSharedDias(function (p) {
      if (p.some(function (x) {
        return x.date === dia.date && x.tipo === dia.tipo;
      })) return p;
      return [].concat(_toConsumableArray(p), [dia]);
    });
  };
  var removeSharedDia = function removeSharedDia(date) {
    return setSharedDias(function (p) {
      return p.filter(function (x) {
        return x.date !== date;
      });
    });
  };
  var _useState195 = (0, _react.useState)(new Date()),
    _useState196 = _slicedToArray(_useState195, 2),
    time = _useState196[0],
    setTime = _useState196[1];
  var _useState197 = (0, _react.useState)(''),
    _useState198 = _slicedToArray(_useState197, 2),
    newName = _useState198[0],
    setNewName = _useState198[1];
  var _useState199 = (0, _react.useState)('Família'),
    _useState200 = _slicedToArray(_useState199, 2),
    newRole = _useState200[0],
    setNewRole = _useState200[1];
  var _useState201 = (0, _react.useState)('👤'),
    _useState202 = _slicedToArray(_useState201, 2),
    newEmoji = _useState202[0],
    setNewEmoji = _useState202[1];
  var _useState203 = (0, _react.useState)(''),
    _useState204 = _slicedToArray(_useState203, 2),
    newPwd = _useState204[0],
    setNewPwd = _useState204[1];
  var _useState205 = (0, _react.useState)(false),
    _useState206 = _slicedToArray(_useState205, 2),
    showAddUser = _useState206[0],
    setShowAddUser = _useState206[1];
  var _useState207 = (0, _react.useState)(null),
    _useState208 = _slicedToArray(_useState207, 2),
    expandedUser = _useState208[0],
    setExpandedUser = _useState208[1];
  var _useState209 = (0, _react.useState)(null),
    _useState210 = _slicedToArray(_useState209, 2),
    editUser = _useState210[0],
    setEditUser = _useState210[1]; // {id, name, role, emoji, pwd}
  var _useState211 = (0, _react.useState)({}),
    _useState212 = _slicedToArray(_useState211, 2),
    showPwd = _useState212[0],
    setShowPwd = _useState212[1];
  (0, _react.useEffect)(function () {
    var t = setInterval(function () {
      return setTime(new Date());
    }, 30000);
    var on = function on() {
      return setOnline(true);
    };
    var off = function off() {
      return setOnline(false);
    };
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return function () {
      clearInterval(t);
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  var h = time.getHours();
  var greeting = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  var dateStr = time.toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  var user = users.find(function (u) {
    return u.id === activeUser;
  }) || users[0];
  var myDisplayName = (profile && (profile.display_name || profile.email)) || user.name;
  var myEmoji = profile && profile.is_admin ? '👑' : '👤';
  var isAdmin = !!(profile && profile.is_admin);
  var myAvatarEmoji = {
    patricio: '👨‍💼',
    esposa: '👩',
    lucas: '👦',
    liam: '👦'
  }[profile && profile.member_id] || (isAdmin ? '👨‍💼' : '👤');
  var myAllowedApps = (profile && profile.allowed_apps) || [];
  var visApps = isAdmin ? APPS_DATA : APPS_DATA.filter(function (a) {
    return myAllowedApps.includes(a.id);
  });
  var myReadNotifs = (profile && profile.read_notifications) || [];
  var _useStateEscolarPendentes = (0, _react.useState)(0),
    _useStateEscolarPendentes2 = _slicedToArray(_useStateEscolarPendentes, 2),
    escolarPendentes = _useStateEscolarPendentes2[0],
    setEscolarPendentes = _useStateEscolarPendentes2[1];
  (0, _react.useEffect)(function () {
    if (!window.supabaseClient) return;
    var alunoKeys = isAdmin ? ['lucas', 'liam'] : profile && profile.member_id ? [profile.member_id] : [];
    if (alunoKeys.length === 0) {
      setEscolarPendentes(0);
      return;
    }
    window.supabaseClient.from('escolar_tpc').select('*').in('aluno', alunoKeys).then(function (res) {
      if (res.error || !res.data) return;
      var pendentes = res.data.filter(function (t) {
        return !t.feito;
      }).length;
      setEscolarPendentes(pendentes);
    }).catch(function () {});
  }, [isAdmin, profile && profile.member_id]);
  var _useStateNotifData = (0, _react.useState)([]),
    _useStateNotifData2 = _slicedToArray(_useStateNotifData, 2),
    notifItems = _useStateNotifData2[0],
    setNotifItems = _useStateNotifData2[1];
  var _useStateHojeItems = (0, _react.useState)([]),
    _useStateHojeItems2 = _slicedToArray(_useStateHojeItems, 2),
    hojeItems = _useStateHojeItems2[0],
    setHojeItems = _useStateHojeItems2[1];
  var _useStateHojeLoading = (0, _react.useState)(false),
    _useStateHojeLoading2 = _slicedToArray(_useStateHojeLoading, 2),
    hojeLoading = _useStateHojeLoading2[0],
    setHojeLoading = _useStateHojeLoading2[1];
  var dismissHojeItem = function dismissHojeItem(id) {
    if (!profile) return;
    var current = profile.dismissed_hoje || [];
    if (current.indexOf(id) !== -1) return;
    var next = current.concat([id]);
    setProfile(function (p) {
      return p ? _objectSpread(_objectSpread({}, p), {}, { dismissed_hoje: next }) : p;
    });
    if (window.supabaseClient && profile.id) {
      window.supabaseClient.from('profiles').update({ dismissed_hoje: next }).eq('id', profile.id).then(function () {}).catch(function () {});
    }
  };
  var loadHojeData = function loadHojeData() {
    if (!window.supabaseClient) return;
    setHojeLoading(true);
    var now = new Date();
    var todayStr = now.toISOString().slice(0, 10);
    var future = new Date(now);
    future.setDate(future.getDate() + 2);
    var futureStr = future.toISOString().slice(0, 10);
    var allowedApps = (profile && profile.allowed_apps) || [];
    var queries = [];
    if (allowedApps.indexOf('familia') !== -1) {
      queries.push(window.supabaseClient.from('family_events').select('*').gte('event_date', todayStr).lte('event_date', futureStr));
    } else {
      queries.push(Promise.resolve({ data: [] }));
    }
    if (allowedApps.indexOf('agenda') !== -1) {
      queries.push(window.supabaseClient.from('agenda_pro_jobs').select('*').gte('job_date', todayStr).lte('job_date', futureStr));
    } else {
      queries.push(Promise.resolve({ data: [] }));
    }
    if (allowedApps.indexOf('escolar') !== -1) {
      var alunos = isAdmin ? ['lucas', 'liam'] : profile && profile.member_id ? [profile.member_id] : [];
      if (alunos.length > 0) {
        queries.push(window.supabaseClient.from('escolar_tpc').select('*').eq('tipo', 'teste').eq('feito', false).gte('data', todayStr).lte('data', futureStr).in('aluno', alunos));
      } else {
        queries.push(Promise.resolve({ data: [] }));
      }
    } else {
      queries.push(Promise.resolve({ data: [] }));
    }
    Promise.all(queries).then(function (resArr) {
      var famRes = resArr[0],
        jobRes = resArr[1],
        escRes = resArr[2];
      var items = [];
      (famRes && famRes.data || []).forEach(function (row) {
        items.push({
          id: 'fam_' + row.id,
          app: 'Família',
          appId: 'familia',
          msg: row.title + (row.event_time ? ' · ' + row.event_time : ''),
          date: row.event_date,
          time: row.event_time || '',
          icon: row.emoji || '🏠',
          color: T.blue
        });
      });
      (jobRes && jobRes.data || []).forEach(function (row) {
        items.push({
          id: 'job_' + row.id,
          app: 'Patricio Work',
          appId: 'agenda',
          msg: (row.project || 'Marcação') + (row.start_time ? ' · ' + row.start_time : ''),
          date: row.job_date,
          time: row.start_time || '',
          icon: '📋',
          color: T.orange
        });
      });
      (escRes && escRes.data || []).forEach(function (row) {
        items.push({
          id: 'esc_' + row.id,
          app: 'Vida Escolar',
          appId: 'escolar',
          msg: '📌 ' + (row.titulo || 'Teste') + (row.aluno ? ' · ' + (row.aluno.charAt(0).toUpperCase() + row.aluno.slice(1)) : ''),
          date: row.data,
          time: '',
          icon: '📚',
          color: '#A855F7'
        });
      });
      items.sort(function (a, b) {
        return (a.date || '').localeCompare(b.date || '') || (a.time || '').localeCompare(b.time || '');
      });
      setHojeItems(items);
      setHojeLoading(false);
    }).catch(function () {
      setHojeLoading(false);
    });
  };
  var loadNotifData = function loadNotifData() {
    if (!window.supabaseClient) return;
    var now = new Date();
    var todayStr = now.toISOString().slice(0, 10);
    var future = new Date(now);
    future.setDate(future.getDate() + 3);
    var futureStr = future.toISOString().slice(0, 10);
    Promise.all([
      window.supabaseClient.from('family_events').select('*').gte('event_date', todayStr).lte('event_date', futureStr),
      window.supabaseClient.from('agenda_pro_jobs').select('*').gte('job_date', todayStr).lte('job_date', futureStr)
    ]).then(function (resArr) {
      var famRes = resArr[0],
        jobRes = resArr[1];
      var items = [];
      if (famRes && famRes.data) {
        famRes.data.forEach(function (row) {
          items.push({
            id: 'fam_' + row.id,
            app: 'Família',
            appId: 'familia',
            msg: row.title + (row.event_time ? ' · ' + row.event_time : ''),
            time: formatRelDatePt(row.event_date),
            sortDate: row.event_date,
            icon: row.emoji || '🏠',
            color: T.blue
          });
        });
      }
      if (jobRes && jobRes.data) {
        jobRes.data.forEach(function (row) {
          items.push({
            id: 'job_' + row.id,
            app: 'Patricio Work',
            appId: 'agenda',
            msg: (row.project || 'Marcação') + (row.start_time ? ' · ' + row.start_time : ''),
            time: formatRelDatePt(row.job_date),
            sortDate: row.job_date,
            icon: '📋',
            color: T.orange
          });
        });
      }
      var allowedApps = (profile && profile.allowed_apps) || [];
      items = items.filter(function (it) {
        return allowedApps.indexOf(it.appId) !== -1;
      });
      items.sort(function (a, b) {
        return (a.sortDate || '').localeCompare(b.sortDate || '');
      });
      setNotifItems(items);
      notifyNewItems(items);
    }).catch(function () {});
  };
  var notifyNewItems = function notifyNewItems(items) {
    try {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
      var seenRaw = localStorage.getItem('carvalho_seen_notif_ids');
      var seen = seenRaw ? JSON.parse(seenRaw) : [];
      var novos = items.filter(function (it) {
        return seen.indexOf(it.id) === -1;
      });
      novos.forEach(function (it) {
        try {
          if (navigator.serviceWorker && navigator.serviceWorker.ready) {
            navigator.serviceWorker.ready.then(function (reg) {
              reg.showNotification(it.app, {
                body: it.msg + (it.time ? ' · ' + it.time : ''),
                icon: './icon-192.png',
                tag: it.id
              });
            });
          } else {
            new Notification(it.app, {
              body: it.msg + (it.time ? ' · ' + it.time : '')
            });
          }
        } catch (e) {}
      });
      var allIds = items.map(function (it) {
        return it.id;
      });
      localStorage.setItem('carvalho_seen_notif_ids', JSON.stringify(allIds));
    } catch (e) {}
  };
  var unreadNotifs = notifItems.filter(function (n) {
    return myReadNotifs.indexOf(n.id) === -1;
  });
  var totalBadge = unreadNotifs.length;
  var dynamicBadgeFor = function dynamicBadgeFor(appId) {
    if (appId === 'escolar') return escolarPendentes > 0 ? String(escolarPendentes) : null;
    if (appId === 'agenda' || appId === 'familia') {
      var n = unreadNotifs.filter(function (it) {
        return it.appId === appId;
      }).length;
      return n > 0 ? String(n) : null;
    }
    return null;
  };
  var visAppsWithBadges = visApps.map(function (a) {
    return _objectSpread(_objectSpread({}, a), {}, {
      badge: dynamicBadgeFor(a.id)
    });
  });
  var _useStateNotifPerm = (0, _react.useState)(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'),
    _useStateNotifPerm2 = _slicedToArray(_useStateNotifPerm, 2),
    notifPerm = _useStateNotifPerm2[0],
    setNotifPerm = _useStateNotifPerm2[1];
  var _useStateNotifBannerDismissed = (0, _react.useState)(localStorage.getItem('carvalho_notif_banner_dismissed') === '1'),
    _useStateNotifBannerDismissed2 = _slicedToArray(_useStateNotifBannerDismissed, 2),
    notifBannerDismissed = _useStateNotifBannerDismissed2[0],
    setNotifBannerDismissed = _useStateNotifBannerDismissed2[1];
  var subscribeToPush = function subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    navigator.serviceWorker.ready.then(function (reg) {
      return reg.pushManager.getSubscription().then(function (existing) {
        if (existing) return existing;
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
      });
    }).then(function (sub) {
      if (!sub || !profile || !window.supabaseClient) return;
      var key = sub.toJSON();
      window.supabaseClient.from('push_subscriptions').upsert({
        profile_id: profile.id,
        endpoint: key.endpoint,
        p256dh: key.keys.p256dh,
        auth: key.keys.auth
      }, { onConflict: 'profile_id,endpoint' }).then(function () {}).catch(function () {});
    }).catch(function () {});
  };
  var requestNotifPermission = function requestNotifPermission() {
    if (typeof Notification === 'undefined') return;
    Notification.requestPermission().then(function (perm) {
      setNotifPerm(perm);
      if (perm === 'granted') {
        loadNotifData();
        subscribeToPush();
      }
    });
  };
  var dismissNotifBanner = function dismissNotifBanner() {
    localStorage.setItem('carvalho_notif_banner_dismissed', '1');
    setNotifBannerDismissed(true);
  };
  var markNotifRead = function markNotifRead(notif) {
    var alreadyRead = myReadNotifs.indexOf(notif.id) !== -1;
    if (!alreadyRead && profile) {
      var nextRead = myReadNotifs.concat([notif.id]);
      setProfile(function (p) {
        return _objectSpread(_objectSpread({}, p), {}, { read_notifications: nextRead });
      });
      if (window.supabaseClient && profile.id) {
        window.supabaseClient.from('profiles').update({
          read_notifications: nextRead
        }).eq('id', profile.id).then(function () {}).catch(function () {});
      }
    }
    setApp(notif.appId);
    setScreen('app');
  };
  var loadAllProfiles = function loadAllProfiles() {
    if (!window.supabaseClient) return;
    window.supabaseClient.from('profiles').select('*').then(function (res) {
      if (!res.error && res.data) setAllProfiles(res.data);
    }).catch(function () {});
    window.supabaseClient.from('pending_invites').select('*').then(function (res) {
      if (!res.error && res.data) setPendingInvites(res.data);
    }).catch(function () {});
  };
  var addInvite = function addInvite() {
    var email = newInviteEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) return;
    if (!window.supabaseClient) return;
    window.supabaseClient.from('pending_invites').insert({
      email: email,
      allowed_apps: []
    }).then(function () {
      setNewInviteEmail('');
      loadAllProfiles();
    }).catch(function () {});
  };
  var removeInvite = function removeInvite(email) {
    setPendingInvites(function (ps) {
      return ps.filter(function (p) {
        return p.email !== email;
      });
    });
    if (window.supabaseClient) {
      window.supabaseClient.from('pending_invites').delete().eq('email', email).then(function () {}).catch(function () {});
    }
  };
  var toggleInvitePerm = function toggleInvitePerm(email, aid) {
    var target = pendingInvites.find(function (p) {
      return p.email === email;
    });
    if (!target) return;
    var current = target.allowed_apps || [];
    var next = current.includes(aid) ? current.filter(function (x) {
      return x !== aid;
    }) : [].concat(_toConsumableArray(current), [aid]);
    setPendingInvites(function (ps) {
      return ps.map(function (p) {
        return p.email === email ? _objectSpread(_objectSpread({}, p), {}, {
          allowed_apps: next
        }) : p;
      });
    });
    if (window.supabaseClient) {
      window.supabaseClient.from('pending_invites').update({
        allowed_apps: next
      }).eq('email', email).then(function () {}).catch(function () {});
    }
  };
  var togglePerm = function togglePerm(uid, aid) {
    var target = allProfiles.find(function (p) {
      return p.id === uid;
    });
    if (!target) return;
    var current = target.allowed_apps || [];
    var next = current.includes(aid) ? current.filter(function (x) {
      return x !== aid;
    }) : [].concat(_toConsumableArray(current), [aid]);
    setAllProfiles(function (ps) {
      return ps.map(function (p) {
        return p.id === uid ? _objectSpread(_objectSpread({}, p), {}, {
          allowed_apps: next
        }) : p;
      });
    });
    if (window.supabaseClient) {
      window.supabaseClient.from('profiles').update({
        allowed_apps: next
      }).eq('id', uid).then(function () {}).catch(function () {});
    }
  };
  var fnErr = function fnErr(res) {
    if (res && res.error) return res.error.message || 'Erro desconhecido';
    if (res && res.data && res.data.error) return res.data.error;
    return null;
  };
  var toggleNewMemberApp = function toggleNewMemberApp(aid) {
    setNewMemberApps(function (p) {
      return p.includes(aid) ? p.filter(function (x) { return x !== aid; }) : [].concat(_toConsumableArray(p), [aid]);
    });
  };
  var createMember = function createMember() {
    var name = newMemberName.trim();
    var email = newMemberEmail.trim().toLowerCase();
    var pwd = newMemberPwd.trim();
    if (!name || !email || !pwd) { setMemberMsg('Preenche nome, email e password.'); return; }
    if (!window.supabaseClient) return;
    setMemberBusy(true);
    setMemberMsg('');
    window.supabaseClient.functions.invoke('manage-member', {
      body: { action: 'create', email: email, password: pwd, display_name: name, allowed_apps: newMemberApps, member_id: newMemberMemberId || null }
    }).then(function (res) {
      setMemberBusy(false);
      var err = fnErr(res);
      if (err) { setMemberMsg('Erro: ' + err); return; }
      setMemberMsg('✓ Conta criada para ' + name);
      setNewMemberName('');
      setNewMemberEmail('');
      setNewMemberPwd('');
      setNewMemberApps([]);
      setNewMemberEmoji('👤');
      setNewMemberMemberId('');
      setAddMemberOpen(false);
      loadAllProfiles();
    }).catch(function (e) {
      setMemberBusy(false);
      setMemberMsg('Erro: ' + (e && e.message || String(e)));
    });
  };
  var toggleDisabled = function toggleDisabled(uid, current) {
    setAllProfiles(function (ps) {
      return ps.map(function (p) { return p.id === uid ? _objectSpread(_objectSpread({}, p), {}, { disabled: !current }) : p; });
    });
    if (window.supabaseClient) {
      window.supabaseClient.from('profiles').update({ disabled: !current }).eq('id', uid).then(function () {}).catch(function () {});
    }
  };
  var handleMemberPhotoUpload = function handleMemberPhotoUpload(e) {
    var file = e.target.files && e.target.files[0];
    if (!file || !editingMember) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      resizeProfilePhoto(ev.target.result, 240).then(function (resized) {
        setEditingMember(function (p) { return p ? _objectSpread(_objectSpread({}, p), {}, { photo_url: resized }) : p; });
      });
    };
    reader.readAsDataURL(file);
  };
  var saveMemberEdit = function saveMemberEdit() {
    if (!editingMember || !window.supabaseClient) return;
    var uid = editingMember.id;
    var newName = (editingMember.display_name || '').trim();
    var newPhoto = editingMember.photo_url;
    var newMemberId = editingMember.member_id || null;
    setMemberBusy(true);
    window.supabaseClient.from('profiles').update({
      display_name: newName,
      photo_url: newPhoto,
      member_id: newMemberId
    }).eq('id', uid).then(function (res) {
      setMemberBusy(false);
      if (res.error) { setMemberMsg('Erro ao guardar: ' + res.error.message); return; }
      setAllProfiles(function (ps) {
        return ps.map(function (p) { return p.id === uid ? _objectSpread(_objectSpread({}, p), {}, { display_name: newName, photo_url: newPhoto, member_id: newMemberId }) : p; });
      });
      setEditingMember(null);
      setMemberMsg('✓ Guardado.');
    }).catch(function (e) {
      setMemberBusy(false);
      setMemberMsg('Erro: ' + (e && e.message || String(e)));
    });
  };
  var deleteMemberPermanent = function deleteMemberPermanent(u) {
    var ok = window.confirm ? window.confirm('Apagar definitivamente a conta de ' + (u.display_name || u.email) + '? Esta ação não pode ser desfeita.') : true;
    if (!ok) return;
    if (!window.supabaseClient) return;
    setMemberBusy(true);
    setMemberMsg('');
    window.supabaseClient.functions.invoke('manage-member', {
      body: { action: 'delete', id: u.id }
    }).then(function (res) {
      setMemberBusy(false);
      var err = fnErr(res);
      if (err) { setMemberMsg('Erro: ' + err); return; }
      setAllProfiles(function (ps) { return ps.filter(function (p) { return p.id !== u.id; }); });
      setExpandedUser(null);
      setMemberMsg('✓ Conta apagada.');
    }).catch(function (e) {
      setMemberBusy(false);
      setMemberMsg('Erro: ' + (e && e.message || String(e)));
    });
  };
  var updateNotifPrefs = function updateNotifPrefs(patch) {
    if (!profile || !window.supabaseClient) return;
    var current = profile.notification_prefs || {};
    var newPrefs = _objectSpread(_objectSpread({}, current), patch);
    setProfile(function (p) {
      return p ? _objectSpread(_objectSpread({}, p), {}, { notification_prefs: newPrefs }) : p;
    });
    window.supabaseClient.from('profiles').update({ notification_prefs: newPrefs }).eq('id', profile.id).then(function () {}).catch(function () {});
  };
  var toggleNotifApp = function toggleNotifApp(appId) {
    var disabledApps = (profile && profile.notification_prefs && profile.notification_prefs.disabledApps) || [];
    var next = disabledApps.indexOf(appId) === -1 ? disabledApps.concat([appId]) : disabledApps.filter(function (x) {
      return x !== appId;
    });
    updateNotifPrefs({ disabledApps: next });
  };
  var setTheme = function setTheme(themeName) {
    if (!profile || !window.supabaseClient) return;
    applyTheme(themeName);
    setProfile(function (p) {
      return p ? _objectSpread(_objectSpread({}, p), {}, { theme: themeName }) : p;
    });
    window.supabaseClient.from('profiles').update({ theme: themeName }).eq('id', profile.id).then(function () {}).catch(function () {});
  };
  var setDefaultApp = function setDefaultApp(appId) {
    if (!profile || !window.supabaseClient) return;
    setProfile(function (p) {
      return p ? _objectSpread(_objectSpread({}, p), {}, { default_app: appId }) : p;
    });
    window.supabaseClient.from('profiles').update({ default_app: appId }).eq('id', profile.id).then(function () {}).catch(function () {});
  };
  var fetchProfile = function fetchProfile(userId, isInitialEntry) {
    if (!window.supabaseClient) return;
    window.supabaseClient.from('profiles').select('*').eq('id', userId).limit(1).then(function (res) {
      var data = res.data && res.data[0];
      if (!res.error && data) {
        if (data.disabled) {
          window.supabaseClient.auth.signOut().catch(function () {});
          setSession(null);
          setProfile(null);
          setScreen('login');
          setProfileErr('O teu acesso foi suspenso pelo administrador.');
          return;
        }
        setProfile(data);
        setUser(data.member_id || 'patricio');
        setProfileErr('');
        applyTheme(data.theme || 'dark');
        if (isInitialEntry) {
          var allowed = data.allowed_apps || [];
          if (data.default_app && allowed.indexOf(data.default_app) !== -1) {
            setApp(data.default_app);
            setScreen('app');
          }
        }
      } else if (res.error) {
        setProfileErr('Erro ao carregar perfil: ' + (res.error.message || ''));
      }
    }).catch(function (e) {
      setProfileErr('Erro: ' + (e && e.message || String(e)));
    });
  };
  var resizeProfilePhoto = function resizeProfilePhoto(dataUrl, maxSize) {
    return new Promise(function (resolve) {
      try {
        var img = new Image();
        img.onload = function () {
          try {
            var size = maxSize || 240;
            var canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            var ctx = canvas.getContext('2d');
            var scale = Math.max(size / img.width, size / img.height);
            var w = img.width * scale, h = img.height * scale;
            var x = (size - w) / 2, y = (size - h) / 2;
            ctx.drawImage(img, x, y, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } catch (e) {
            resolve(dataUrl);
          }
        };
        img.onerror = function () { resolve(dataUrl); };
        img.src = dataUrl;
      } catch (e) {
        resolve(dataUrl);
      }
    });
  };
  var handleMyPhotoUpload = function handleMyPhotoUpload(e) {
    var file = e.target.files && e.target.files[0];
    if (!file || !profile) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      resizeProfilePhoto(ev.target.result, 240).then(function (resized) {
        setProfile(function (p) { return _objectSpread(_objectSpread({}, p), {}, { photo_url: resized }); });
        if (window.supabaseClient && profile.id) {
          window.supabaseClient.from('profiles').update({ photo_url: resized }).eq('id', profile.id).then(function () {}).catch(function () {});
        }
      });
    };
    reader.readAsDataURL(file);
  };
  var handleMyPhotoRemove = function handleMyPhotoRemove() {
    if (!profile) return;
    setProfile(function (p) { return _objectSpread(_objectSpread({}, p), {}, { photo_url: null }); });
    if (window.supabaseClient && profile.id) {
      window.supabaseClient.from('profiles').update({ photo_url: null }).eq('id', profile.id).then(function () {}).catch(function () {});
    }
  };
  (0, _react.useEffect)(function () {
    if (!window.supabaseClient) {
      setCheckingAuth(false);
      return;
    }
    window.supabaseClient.auth.getSession().then(function (res) {
      var s = res.data && res.data.session;
      setSession(s || null);
      if (s && s.user) {
        fetchProfile(s.user.id, true);
        setScreen('hub');
        loadNotifData();
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') subscribeToPush();
      }
      setCheckingAuth(false);
    });
    var _sub = window.supabaseClient.auth.onAuthStateChange(function (event, s) {
      setSession(s || null);
      if (event === 'PASSWORD_RECOVERY') {
        setScreen('nova_password');
        return;
      }
      if (s && s.user) {
        fetchProfile(s.user.id);
        loadNotifData();
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') subscribeToPush();
      } else {
        setProfile(null);
      }
    });
    return function () {
      try {
        _sub.data.subscription.unsubscribe();
      } catch (e) {}
    };
  }, []);
  var doLogin = function doLogin() {
    if (!window.supabaseClient) {
      setPassErr('Sem ligação ao servidor.');
      return;
    }
    if (!email || !pass) {
      setPassErr('Preenche o email e a palavra-passe.');
      return;
    }
    setAuthLoading(true);
    setPassErr('');
    window.supabaseClient.auth.signInWithPassword({
      email: email,
      password: pass
    }).then(function (res) {
      setAuthLoading(false);
      if (res.error) {
        setPassErr('Email ou palavra-passe incorretos.');
        return;
      }
      if (res.data && res.data.session && res.data.session.user) {
        fetchProfile(res.data.session.user.id, true);
      }
      setScreen('hub');
    }).catch(function () {
      setAuthLoading(false);
      setPassErr('Erro de ligação. Tenta novamente.');
    });
  };
  var doSignup = function doSignup() {
    if (!window.supabaseClient) {
      setPassErr('Sem ligação ao servidor.');
      return;
    }
    if (!signupName.trim()) {
      setPassErr('Escreve o teu nome.');
      return;
    }
    if (!email || !pass) {
      setPassErr('Preenche o email e a palavra-passe.');
      return;
    }
    if (pass.length < 6) {
      setPassErr('A palavra-passe precisa de pelo menos 6 caracteres.');
      return;
    }
    setAuthLoading(true);
    setPassErr('');
    window.supabaseClient.auth.signUp({
      email: email,
      password: pass,
      options: {
        data: {
          display_name: signupName.trim()
        }
      }
    }).then(function (res) {
      setAuthLoading(false);
      if (res.error) {
        var msg = res.error.message || res.error.msg || res.error.error_description || '';
        if (!msg || msg === '{}') {
          if (res.error.status === 429) msg = 'Muitas tentativas. Aguarda 1 minuto e tenta de novo.';
          else if (res.error.status === 422) msg = 'Email ou palavra-passe inválidos.';
          else if (res.error.status === 400) msg = 'Dados inválidos. Verifica o email e palavra-passe.';
          else msg = 'Não foi possível criar a conta. Tenta novamente.';
        }
        setPassErr(msg);
        return;
      }
      if (res.data && (res.data.session || res.data.user)) {
        var uid = res.data.session ? res.data.session.user.id : res.data.user.id;
        if (uid) fetchProfile(uid);
        setScreen('hub');
      } else {
        setPassErr('Conta criada! Podes entrar agora.');
        setAuthMode('login');
      }
    }).catch(function (e) {
      setAuthLoading(false);
      setPassErr('Erro de ligação. Verifica a internet e tenta novamente.');
    });
  };
  var _useStateResetMsg = (0, _react.useState)(''),
    _useStateResetMsg2 = _slicedToArray(_useStateResetMsg, 2),
    resetMsg = _useStateResetMsg2[0],
    setResetMsg = _useStateResetMsg2[1];
  var _useStateNewPass = (0, _react.useState)(''),
    _useStateNewPass2 = _slicedToArray(_useStateNewPass, 2),
    newPassValue = _useStateNewPass2[0],
    setNewPassValue = _useStateNewPass2[1];
  var doSetNewPassword = function doSetNewPassword() {
    if (!window.supabaseClient) return;
    if (!newPassValue || newPassValue.length < 6) {
      setPassErr('A palavra-passe precisa de pelo menos 6 caracteres.');
      return;
    }
    setAuthLoading(true);
    setPassErr('');
    window.supabaseClient.auth.updateUser({
      password: newPassValue
    }).then(function (res) {
      setAuthLoading(false);
      if (res.error) {
        setPassErr(res.error.message || 'Não foi possível guardar.');
        return;
      }
      setNewPassValue('');
      setScreen('hub');
    }).catch(function () {
      setAuthLoading(false);
      setPassErr('Erro de ligação. Tenta novamente.');
    });
  };
  var doResetPassword = function doResetPassword() {
    if (!window.supabaseClient) {
      setPassErr('Sem ligação ao servidor.');
      return;
    }
    if (!email) {
      setPassErr('Escreve o teu email primeiro.');
      return;
    }
    setAuthLoading(true);
    setPassErr('');
    setResetMsg('');
    window.supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://patrsolothurn-glitch.github.io/carvalho-suite/'
    }).then(function (res) {
      setAuthLoading(false);
      if (res.error) {
        setPassErr(res.error.message || 'Não foi possível enviar o email.');
      } else {
        setResetMsg('Enviámos um link para o teu email. Abre-o e define uma nova password.');
      }
    }).catch(function () {
      setAuthLoading(false);
      setPassErr('Erro de ligação. Tenta novamente.');
    });
  };
  var _useStateChangePwdOpen = (0, _react.useState)(false),
    _useStateChangePwdOpen2 = _slicedToArray(_useStateChangePwdOpen, 2),
    changePwdOpen = _useStateChangePwdOpen2[0],
    setChangePwdOpen = _useStateChangePwdOpen2[1];
  var _useStateNewPwdVal = (0, _react.useState)(''),
    _useStateNewPwdVal2 = _slicedToArray(_useStateNewPwdVal, 2),
    newPwdVal = _useStateNewPwdVal2[0],
    setNewPwdVal = _useStateNewPwdVal2[1];
  var _useStateChangePwdMsg = (0, _react.useState)(''),
    _useStateChangePwdMsg2 = _slicedToArray(_useStateChangePwdMsg, 2),
    changePwdMsg = _useStateChangePwdMsg2[0],
    setChangePwdMsg = _useStateChangePwdMsg2[1];
  var _useStateChangePwdBusy = (0, _react.useState)(false),
    _useStateChangePwdBusy2 = _slicedToArray(_useStateChangePwdBusy, 2),
    changePwdBusy = _useStateChangePwdBusy2[0],
    setChangePwdBusy = _useStateChangePwdBusy2[1];
  var doChangePassword = function doChangePassword() {
    if (!window.supabaseClient) return;
    if (!newPwdVal || newPwdVal.length < 6) {
      setChangePwdMsg('A password precisa de pelo menos 6 caracteres.');
      return;
    }
    setChangePwdBusy(true);
    setChangePwdMsg('');
    window.supabaseClient.auth.updateUser({ password: newPwdVal }).then(function (res) {
      setChangePwdBusy(false);
      if (res.error) {
        setChangePwdMsg('Erro: ' + (res.error.message || 'não foi possível guardar.'));
        return;
      }
      setNewPwdVal('');
      setChangePwdMsg('✓ Password alterada com sucesso.');
    }).catch(function () {
      setChangePwdBusy(false);
      setChangePwdMsg('Erro de ligação. Tenta novamente.');
    });
  };
  var doLogout = function doLogout() {
    if (window.supabaseClient) {
      window.supabaseClient.auth.signOut().catch(function () {});
    }
    setSession(null);
    setProfile(null);
    setEmail('');
    setPass('');
    setScreen('login');
    setUser('patricio');
  };
  (0, _react.useEffect)(function () {
    if (screen === 'definicoes' && isAdmin) loadAllProfiles();
    if (screen === 'notifs') loadNotifData();
    if (screen === 'hoje') loadHojeData();
    if (screen === 'definicoes' && 'caches' in window) {
      caches.keys().then(function (keys) {
        var c = keys.find(function (k) { return k.indexOf('carvalho-') === 0; });
        setCacheVer(c || 'desconhecida');
      }).catch(function () { setCacheVer('desconhecida'); });
    }
  }, [screen, isAdmin]);
  (0, _react.useEffect)(function () {
    if (screen !== 'notifs' || !profile) return;
    var unreadIds = notifItems.filter(function (n) {
      return myReadNotifs.indexOf(n.id) === -1;
    }).map(function (n) {
      return n.id;
    });
    if (!unreadIds.length) return;
    var nextRead = myReadNotifs.concat(unreadIds);
    setProfile(function (p) {
      return p ? _objectSpread(_objectSpread({}, p), {}, { read_notifications: nextRead }) : p;
    });
    if (window.supabaseClient && profile.id) {
      window.supabaseClient.from('profiles').update({ read_notifications: nextRead }).eq('id', profile.id).then(function () {}).catch(function () {});
    }
  }, [screen, notifItems]);
  var checkForUpdate = function checkForUpdate() {
    if (!('serviceWorker' in navigator)) {
      setUpdMsg('Service Worker não suportado neste navegador.');
      return;
    }
    setUpdChecking(true);
    setUpdMsg('');
    navigator.serviceWorker.getRegistration().then(function (reg) {
      if (!reg) {
        setUpdChecking(false);
        setUpdMsg('A app ainda não está registada como PWA neste dispositivo.');
        return;
      }
      var found = false;
      reg.onupdatefound = function () { found = true; };
      reg.update().then(function () {
        setTimeout(function () {
          setUpdChecking(false);
          setUpdMsg(found ? '✓ Nova versão encontrada — a aplicar e reiniciar...' : '✓ Já tens a versão mais recente.');
        }, 1200);
      }).catch(function (err) {
        setUpdChecking(false);
        setUpdMsg('Erro ao verificar: ' + (err && err.message ? err.message : err));
      });
    });
  };
  var hardReset = function hardReset() {
    if (!(window.confirm ? window.confirm('Isto vai limpar a cache local e reiniciar a app. Os teus dados continuam guardados no servidor. Continuar?') : true)) return;
    setUpdChecking(true);
    var proceedWithReset = function proceedWithReset() {
      setUpdMsg('A limpar cache...');
      var clearCaches = 'caches' in window ? caches.keys().then(function (keys) {
        return Promise.all(keys.map(function (k) { return caches.delete(k); }));
      }) : Promise.resolve();
      clearCaches.then(function () {
        if ('serviceWorker' in navigator) {
          return navigator.serviceWorker.getRegistration().then(function (reg) {
            return reg ? reg.unregister() : null;
          });
        }
      }).then(function () {
        window.location.reload();
      }).catch(function () {
        window.location.reload();
      });
    };
    if (typeof Notification === 'undefined') {
      proceedWithReset();
    } else if (Notification.permission === 'default') {
      setUpdMsg('A pedir permissão de notificações...');
      Notification.requestPermission().then(function (perm) {
        setNotifPerm(perm);
        if (perm === 'granted') {
          loadNotifData();
          subscribeToPush();
        }
        proceedWithReset();
      }).catch(function () {
        proceedWithReset();
      });
    } else if (Notification.permission === 'denied') {
      setUpdMsg('⚠️ Notificações bloqueadas no telemóvel/navegador — ativa manualmente nas definições de notificações antes de continuar. A reiniciar...');
      setTimeout(proceedWithReset, 2500);
    } else {
      subscribeToPush();
      proceedWithReset();
    }
  };
  var testPushNotif = function testPushNotif() {
    setPushTestChecking(true);
    setPushTestMsg('A verificar...');
    var lines = [];
    var subCheck = 'serviceWorker' in navigator ? navigator.serviceWorker.ready.then(function (reg) {
      return reg.pushManager.getSubscription();
    }).then(function (sub) {
      lines.push(sub ? '✓ Este aparelho tem subscrição push ativa (local).' : '✗ Este aparelho NÃO tem subscrição push local.');
    }).catch(function () {
      lines.push('✗ Erro ao verificar subscrição local.');
    }) : Promise.resolve().then(function () {
      lines.push('✗ Push não suportado neste navegador.');
    });
    subCheck.then(function () {
      if (!window.supabaseClient || !profile) {
        lines.push('✗ Sem ligação ao servidor ou perfil.');
        setPushTestMsg(lines.join('\n'));
        setPushTestChecking(false);
        return;
      }
      return window.supabaseClient.from('push_subscriptions').select('id', { count: 'exact', head: true }).eq('profile_id', profile.id).then(function (res) {
        lines.push((res.count || 0) + ' subscrição(ões) guardada(s) no servidor para o TEU perfil.');
      }).then(function () {
        return window.supabaseClient.from('push_subscriptions').select('profile_id');
      }).then(function (res2) {
        var rows = res2.data || [];
        lines.push(rows.length + ' subscrição(ões) no total (todos os perfis).');
        var counts = {};
        rows.forEach(function (r) {
          counts[r.profile_id] = (counts[r.profile_id] || 0) + 1;
        });
        var uEmoji = { patricio: '👨‍💼', esposa: '👩', lucas: '👦', liam: '👦' };
        var byMember = (allProfiles || []).map(function (u) {
          var name = u.display_name || (u.member_id ? u.member_id.charAt(0).toUpperCase() + u.member_id.slice(1) : u.email || 'Utilizador');
          var emoji = uEmoji[u.member_id] || '👤';
          return emoji + ' ' + name + ': ' + (counts[u.id] || 0) + ' subscrição(ões)';
        });
        if (byMember.length) {
          lines.push('— Por pessoa —');
          byMember.forEach(function (l) {
            lines.push(l);
          });
        }
      }).then(function () {
        return getEligibleProfileIds('familia', null);
      }).then(function (ids) {
        lines.push(ids.length + ' perfil(is) elegível(eis) para receber avisos de Família agora.');
        return window.supabaseClient.functions.invoke('send-push', {
          body: { title: 'Teste Carvalho', body: 'Notificação de teste — ' + new Date().toLocaleTimeString('pt-PT'), profileIds: ids }
        });
      }).then(function (res3) {
        if (res3 && res3.error) {
          lines.push('✗ Erro ao chamar send-push: ' + (res3.error.message || JSON.stringify(res3.error)));
        } else {
          lines.push('✓ send-push chamado sem erro. Resposta: ' + JSON.stringify(res3 && res3.data));
        }
      }).catch(function (e) {
        lines.push('✗ Excepção: ' + (e && e.message || String(e)));
      }).then(function () {
        setPushTestMsg(lines.join('\n'));
        setPushTestChecking(false);
      });
    });
  };
  var nav = function nav(label) {
    if (label === 'Início') setScreen('hub');else if (label === 'Hoje') setScreen('hoje');else if (label === 'Definições') {
      setScreen('definicoes');
      if (isAdmin) loadAllProfiles();
    } else if (label === 'Perfil') setScreen('perfil');
  };

  // ── APP SCREENS ──
  if (screen === 'app' && activeApp) {
    var goBack = function goBack() {
      return setScreen('hub');
    };
    var sharedProps = {
      sharedDias: sharedDias,
      addSharedDia: addSharedDia,
      removeSharedDia: removeSharedDia,
      currentMemberId: (profile && profile.member_id) || 'patricio',
      profile: profile,
      onPhotoUpload: handleMyPhotoUpload,
      onPhotoRemove: handleMyPhotoRemove
    };
    if (activeApp === 'horaspr') return /*#__PURE__*/React.createElement(HorasProApp, _extends({
      onBack: goBack
    }, sharedProps));
    if (activeApp === 'agenda') return /*#__PURE__*/React.createElement(AgendaProApp, _extends({
      onBack: goBack
    }, sharedProps));
    if (activeApp === 'familia') return /*#__PURE__*/React.createElement(FamiliaApp, _extends({
      onBack: goBack
    }, sharedProps));
    if (activeApp === 'nutri') return /*#__PURE__*/React.createElement(NutriguimaApp, {
      onBack: goBack
    });
    if (activeApp === 'escolar') return /*#__PURE__*/React.createElement(EscolarApp, _extends({
      onBack: goBack,
      activeUser: (profile && profile.member_id) || 'patricio'
    }, sharedProps));
  }

  // ── LOGIN ──
  if (checkingAuth) return /*#__PURE__*/React.createElement("div", {
    style: _objectSpread(_objectSpread({}, wrap), {}, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    })
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: T.gold,
      fontSize: 14,
      fontWeight: 700
    }
  }, "A carregar\u2026"));
  if (screen === 'nova_password') return /*#__PURE__*/React.createElement("div", {
    style: _objectSpread(_objectSpread({}, wrap), {}, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px'
    })
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: 360,
      background: T.surface,
      borderRadius: 24,
      padding: '26px 22px',
      border: "1px solid ".concat(T.goldBrd)
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 19,
      fontWeight: 800,
      color: T.text,
      marginBottom: 6
    }
  }, "Define a nova password"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.muted,
      fontSize: 13,
      marginBottom: 18
    }
  }, "Escolhe uma password nova para a tua conta."), /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: newPassValue,
    onChange: function onChange(e) {
      setNewPassValue(e.target.value);
      setPassErr('');
    },
    onKeyDown: function onKeyDown(e) {
      return e.key === 'Enter' && doSetNewPassword();
    },
    placeholder: "Nova password",
    style: {
      width: '100%',
      background: T.surface2,
      border: "1px solid ".concat(passErr ? T.red : T.goldBrd),
      borderRadius: 14,
      padding: '13px 16px',
      color: T.text,
      fontSize: 15,
      outline: 'none',
      marginBottom: passErr ? 8 : 18,
      boxSizing: 'border-box'
    }
  }), passErr && /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.red,
      fontSize: 12,
      fontWeight: 600,
      marginBottom: 14
    }
  }, "\u26A0 ", passErr), /*#__PURE__*/React.createElement(GoldBtn, {
    style: {
      width: '100%',
      padding: '15px',
      opacity: authLoading ? 0.6 : 1
    },
    onClick: function onClick() {
      if (authLoading) return;
      doSetNewPassword();
    }
  }, authLoading ? 'A guardar…' : 'Guardar password →')));
  if (screen === 'login') return /*#__PURE__*/React.createElement("div", {
    style: _objectSpread(_objectSpread({}, wrap), {}, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px'
    })
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 36
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 80,
      height: 80,
      borderRadius: 24,
      background: "linear-gradient(145deg,".concat(T.gold, ",").concat(T.goldL, ")"),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px',
      boxShadow: "0 0 48px rgba(201,168,71,0.35)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 36,
      fontWeight: 900,
      color: T.bg,
      lineHeight: 1
    }
  }, "C")), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 26,
      fontWeight: 900,
      letterSpacing: '-0.8px',
      color: T.text,
      marginBottom: 4
    }
  }, "Carvalho Suite"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.muted,
      fontSize: 13
    }
  }, "Acesso pessoal \xB7 Privado")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: 360,
      background: T.surface,
      borderRadius: 24,
      padding: '26px 22px',
      border: "1px solid ".concat(T.goldBrd)
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginBottom: 20,
      background: T.surface2,
      borderRadius: 12,
      padding: 4
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setAuthMode('login');
      setPassErr('');
    },
    style: {
      flex: 1,
      background: authMode === 'login' ? T.gold : 'transparent',
      border: 'none',
      borderRadius: 9,
      padding: '9px',
      color: authMode === 'login' ? T.bg : T.muted,
      fontSize: 13,
      fontWeight: 800,
      cursor: 'pointer'
    }
  }, "Entrar"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setAuthMode('signup');
      setPassErr('');
    },
    style: {
      flex: 1,
      background: authMode === 'signup' ? T.gold : 'transparent',
      border: 'none',
      borderRadius: 9,
      padding: '9px',
      color: authMode === 'signup' ? T.bg : T.muted,
      fontSize: 13,
      fontWeight: 800,
      cursor: 'pointer'
    }
  }, "Criar conta")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.muted,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.8px',
      textTransform: 'uppercase',
      marginBottom: 8
    }
  }, "Email"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: email,
    onChange: function onChange(e) {
      setEmail(e.target.value);
      setPassErr('');
    },
    placeholder: "o.teu@email.com",
    autoCapitalize: "none",
    style: {
      width: '100%',
      background: T.surface2,
      border: "1px solid ".concat(T.goldBrd),
      borderRadius: 14,
      padding: '13px 16px',
      marginBottom: 14,
      color: T.text,
      fontSize: 14,
      outline: 'none',
      boxSizing: 'border-box'
    }
  }), authMode === 'signup' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.muted,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.8px',
      textTransform: 'uppercase',
      marginBottom: 8
    }
  }, "O teu nome"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: signupName,
    onChange: function onChange(e) {
      setSignupName(e.target.value);
      setPassErr('');
    },
    placeholder: "Ex: Maria, Lucas...",
    style: {
      width: '100%',
      background: T.surface2,
      border: "1px solid ".concat(T.goldBrd),
      borderRadius: 14,
      padding: '13px 16px',
      color: T.text,
      fontSize: 14,
      outline: 'none',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.muted,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.8px',
      textTransform: 'uppercase',
      marginBottom: 8
    }
  }, "Palavra-passe"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: pass,
    onChange: function onChange(e) {
      setPass(e.target.value);
      setPassErr('');
    },
    onKeyDown: function onKeyDown(e) {
      if (e.key !== 'Enter') return;
      authMode === 'login' ? doLogin() : doSignup();
    },
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    style: {
      width: '100%',
      background: T.surface2,
      border: "1px solid ".concat(passErr ? T.red : T.goldBrd),
      borderRadius: 14,
      padding: '13px 16px',
      color: T.text,
      fontSize: 15,
      outline: 'none',
      marginBottom: passErr ? 8 : 20,
      boxSizing: 'border-box'
    }
  }), passErr && /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.red,
      fontSize: 12,
      fontWeight: 600,
      marginBottom: 14
    }
  }, "\u26A0 ", passErr), /*#__PURE__*/React.createElement(GoldBtn, {
    style: {
      width: '100%',
      padding: '15px',
      opacity: authLoading ? 0.6 : 1
    },
    onClick: function onClick() {
      if (authLoading) return;
      authMode === 'login' ? doLogin() : doSignup();
    }
  }, authLoading ? 'A processar…' : authMode === 'login' ? 'Entrar →' : 'Criar conta →'), authMode === 'login' && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return doResetPassword();
    },
    style: {
      width: '100%',
      background: 'none',
      border: 'none',
      color: T.gold,
      fontSize: 12,
      fontWeight: 700,
      cursor: 'pointer',
      marginTop: 12,
      padding: 4
    }
  }, "Esqueci-me da password"), resetMsg && /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#4ADE80',
      fontSize: 12,
      fontWeight: 600,
      marginTop: 10,
      textAlign: 'center'
    }
  }, "\u2713 ", resetMsg)), /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#2A2A3A',
      fontSize: 12,
      marginTop: 28,
      textAlign: 'center'
    }
  }, "v1.0 \xB7 Sistema privado Carvalho"));

  // ── NOTIFS ──
  if (screen === 'notifs') return /*#__PURE__*/React.createElement("div", {
    style: _objectSpread(_objectSpread({}, wrap), {}, {
      paddingBottom: 80
    })
  }, /*#__PURE__*/React.createElement(TopBar, {
    onBack: function onBack() {
      return setScreen('hub');
    },
    title: "Notifica\xE7\xF5es"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, notifItems.length === 0 ? /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.muted,
      fontSize: 13,
      textAlign: 'center',
      marginTop: 24
    }
  }, "Sem novidades nos pr\xF3ximos dias \u2728") : notifItems.map(function (n) {
    var isUnread = myReadNotifs.indexOf(n.id) === -1;
    return /*#__PURE__*/React.createElement(Card, {
      key: n.id,
      onClick: function onClick() {
        return markNotifRead(n);
      },
      style: {
        padding: '14px 16px',
        borderLeft: "3px solid ".concat(n.color),
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        cursor: 'pointer',
        opacity: isUnread ? 1 : 0.55
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20
      }
    }, n.icon), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', alignItems: 'center', gap: 6 }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontWeight: 700,
        fontSize: 14,
        color: T.text
      }
    }, n.app), isUnread && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: T.red,
        flexShrink: 0
      }
    })), /*#__PURE__*/React.createElement("p", {
      style: {
        color: T.muted,
        fontSize: 13,
        marginTop: 2
      }
    }, n.msg), /*#__PURE__*/React.createElement("p", {
      style: {
        color: '#4A4A5E',
        fontSize: 11,
        marginTop: 4,
        fontWeight: 600
      }
    }, n.time)));
  })), /*#__PURE__*/React.createElement(BottomNav, {
    active: "",
    onNav: nav
  }));

  // ── HOJE ──
  if (screen === 'hoje') {
    var dismissedHoje = (profile && profile.dismissed_hoje) || [];
    var visibleHojeItems = hojeItems.filter(function (it) {
      return dismissedHoje.indexOf(it.id) === -1;
    });
    var groups = [];
    visibleHojeItems.forEach(function (it) {
      var label = formatRelDatePt(it.date);
      var g = groups.find(function (gr) { return gr.label === label; });
      if (!g) { g = { label: label, items: [] }; groups.push(g); }
      g.items.push(it);
    });
    return /*#__PURE__*/React.createElement("div", {
      style: _objectSpread(_objectSpread({}, wrap), {}, {
        paddingBottom: 80
      })
    }, /*#__PURE__*/React.createElement(TopBar, {
      onBack: function onBack() {
        return setScreen('hub');
      },
      title: "Hoje"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, hojeLoading ? /*#__PURE__*/React.createElement("p", {
      style: { color: T.muted, fontSize: 13, textAlign: 'center', marginTop: 24 }
    }, "A carregar…") : groups.length === 0 ? /*#__PURE__*/React.createElement("p", {
      style: { color: T.muted, fontSize: 13, textAlign: 'center', marginTop: 24 }
    }, "Nada marcado nos próximos dias ✨") : groups.map(function (g) {
      return /*#__PURE__*/React.createElement("div", { key: g.label },
        /*#__PURE__*/React.createElement("p", {
          style: { color: T.gold, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }
        }, g.label),
        /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          g.items.map(function (it) {
            return /*#__PURE__*/React.createElement(SwipeCard, {
              key: it.id,
              onClick: function onClick() {
                setApp(it.appId);
                setScreen('app');
              },
              onDismiss: function onDismiss() {
                return dismissHojeItem(it.id);
              },
              style: {
                padding: '12px 14px',
                borderLeft: "3px solid ".concat(it.color),
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                cursor: 'pointer'
              }
            }, /*#__PURE__*/React.createElement("span", { style: { fontSize: 19 } }, it.icon),
              /*#__PURE__*/React.createElement("div", { style: { flex: 1 } },
                /*#__PURE__*/React.createElement("p", { style: { fontWeight: 700, fontSize: 13.5, color: T.text } }, it.msg),
                /*#__PURE__*/React.createElement("p", { style: { color: T.muted, fontSize: 11, marginTop: 2, fontWeight: 600 } }, it.app)
              )
            );
          })
        )
      );
    })), /*#__PURE__*/React.createElement(BottomNav, {
      active: "Hoje",
      onNav: nav
    }));
  }

  // ── DEFINIÇÕES ──
  if (screen === 'definicoes') return /*#__PURE__*/React.createElement("div", {
    style: _objectSpread(_objectSpread({}, wrap), {}, {
      paddingBottom: 80
    })
  }, /*#__PURE__*/React.createElement("div", {
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
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setScreen('hub');
    },
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
  }, "Defini\xE7\xF5es"))), React.createElement("div", {
    style: { padding: '14px 16px' }
  },
  React.createElement("p", {
    style: { color: T.gold, fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }
  }, "Diagnóstico & Manutenção"),
  React.createElement(Card, {
    style: { padding: '16px', marginBottom: 14 }
  },
    React.createElement("div", {
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }
    },
      React.createElement("span", { style: { color: T.muted, fontSize: 13 } }, "Versão instalada"),
      React.createElement("span", { style: { color: T.text, fontSize: 13, fontWeight: 700, fontFamily: 'monospace' } }, cacheVer || '...')
    ),
    React.createElement("div", {
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }
    },
      React.createElement("span", { style: { color: T.muted, fontSize: 13 } }, "Ligação"),
      React.createElement("span", { style: { color: online ? '#22C55E' : '#DC2626', fontSize: 13, fontWeight: 700 } }, online ? '● Online' : '● Offline')
    ),
    updMsg && React.createElement("p", {
      style: { color: T.gold, fontSize: 12.5, marginBottom: 10, lineHeight: 1.4 }
    }, updMsg),
    React.createElement("button", {
      onClick: checkForUpdate,
      disabled: updChecking,
      style: {
        width: '100%',
        background: updChecking ? T.surface2 : "linear-gradient(135deg,".concat(T.gold, ",").concat(T.goldL, ")"),
        border: 'none',
        borderRadius: 12,
        padding: '12px',
        color: updChecking ? T.muted : T.bg,
        fontSize: 14,
        fontWeight: 800,
        cursor: updChecking ? 'default' : 'pointer',
        marginBottom: 8
      }
    }, updChecking ? 'A verificar…' : '🔄 Verificar atualizações'),
    React.createElement("button", {
      onClick: hardReset,
      style: {
        width: '100%',
        background: 'rgba(220,38,38,0.08)',
        border: '1px solid rgba(220,38,38,0.25)',
        borderRadius: 12,
        padding: '12px',
        color: '#DC2626',
        fontSize: 14,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, "🧹 Limpar cache e reiniciar"),
    isAdmin && React.createElement("button", {
      onClick: testPushNotif,
      disabled: pushTestChecking,
      style: {
        width: '100%',
        marginTop: 8,
        background: pushTestChecking ? T.surface2 : 'rgba(34,197,94,0.08)',
        border: '1px solid rgba(34,197,94,0.3)',
        borderRadius: 12,
        padding: '12px',
        color: pushTestChecking ? T.muted : '#22C55E',
        fontSize: 14,
        fontWeight: 700,
        cursor: pushTestChecking ? 'default' : 'pointer'
      }
    }, pushTestChecking ? 'A testar…' : '🔔 Testar notificações push'),
    isAdmin && pushTestMsg && React.createElement("pre", {
      style: {
        whiteSpace: 'pre-wrap',
        color: T.text,
        fontSize: 11.5,
        lineHeight: 1.6,
        marginTop: 10,
        marginBottom: 0,
        fontFamily: 'inherit',
        background: T.surface2,
        borderRadius: 10,
        padding: '10px'
      }
    }, pushTestMsg)
  ),
  React.createElement("p", {
    style: { color: T.muted, fontSize: 12, lineHeight: 1.5, padding: '0 4px' }
  }, "Se a app parecer desatualizada (faltam funcionalidades novas), usa primeiro \"Verificar atualizações\". Se persistir, usa \"Limpar cache\" — os teus dados continuam guardados no servidor.")
), React.createElement("div", {
  style: { padding: '14px 16px' }
},
  React.createElement("p", {
    style: { color: T.gold, fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }
  }, "🔔 Notificações"),
  React.createElement(Card, {
    style: { padding: '16px' }
  },
    React.createElement("p", {
      style: { color: T.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }
    }, "Receber avisos de"),
    React.createElement("div", {
      style: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }
    }, [{ id: 'agendapr', permApp: 'agenda', emoji: '📅', name: 'Patricio Work', active: true }, { id: 'familia', permApp: 'familia', emoji: '👨\u200d👩\u200d👧', name: 'Família', active: true }, { id: 'horaspr', permApp: 'horaspr', emoji: '⏱️', name: 'Patricio Time', active: false }, { id: 'nutri', permApp: 'nutri', emoji: '💊', name: 'Nutriguima', active: false }, { id: 'escolar', permApp: 'escolar', emoji: '📚', name: 'Vida Escolar', active: false }].filter(function (app) {
      var allowed = (profile && profile.allowed_apps) || [];
      return allowed.indexOf(app.permApp) !== -1;
    }).map(function (app) {
      var disabledApps = (profile && profile.notification_prefs && profile.notification_prefs.disabledApps) || [];
      var on = disabledApps.indexOf(app.id) === -1;
      return React.createElement("div", {
        key: app.id,
        style: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: T.surface2, borderRadius: 10 }
      },
        React.createElement("span", { style: { fontSize: 16 } }, app.emoji),
        React.createElement("span", { style: { flex: 1, fontSize: 13, color: T.text } },
          app.name,
          !app.active && React.createElement("span", { style: { color: T.muted, fontSize: 11, fontWeight: 600, marginLeft: 6 } }, "(em breve)")
        ),
        React.createElement("div", {
          onClick: function () { toggleNotifApp(app.id); },
          style: { width: 42, height: 24, borderRadius: 12, background: on ? T.gold : '#333', border: '1px solid ' + (on ? T.goldL : '#444'), position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }
        },
          React.createElement("div", {
            style: { position: 'absolute', top: 2, left: on ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }
          })
        )
      );
    })), [{ id: 'agendapr', permApp: 'agenda' }, { id: 'familia', permApp: 'familia' }, { id: 'horaspr', permApp: 'horaspr' }, { id: 'nutri', permApp: 'nutri' }, { id: 'escolar', permApp: 'escolar' }].filter(function (app) {
      var allowed = (profile && profile.allowed_apps) || [];
      return allowed.indexOf(app.permApp) !== -1;
    }).length === 0 && React.createElement("p", {
      style: { color: T.muted, fontSize: 12.5, textAlign: 'center', padding: '8px 0', marginBottom: 16 }
    }, "Não tens nenhuma app com avisos disponível."),
    React.createElement("div", {
      style: { borderTop: '1px solid ' + T.border, paddingTop: 12 }
    },
      React.createElement("p", {
        style: { color: T.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }
      }, "Não perturbar"),
      React.createElement("div", {
        style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }
      },
        React.createElement("input", {
          type: 'time',
          value: (profile && profile.notification_prefs && profile.notification_prefs.quietStart) || '',
          onChange: function (e) { updateNotifPrefs({ quietStart: e.target.value }); },
          style: { flex: 1, background: T.surface2, border: '1px solid ' + T.goldBrd, borderRadius: 10, padding: '8px 10px', color: T.text, fontSize: 13, outline: 'none', colorScheme: 'dark' }
        }),
        React.createElement("span", { style: { color: T.muted, fontSize: 12 } }, "até"),
        React.createElement("input", {
          type: 'time',
          value: (profile && profile.notification_prefs && profile.notification_prefs.quietEnd) || '',
          onChange: function (e) { updateNotifPrefs({ quietEnd: e.target.value }); },
          style: { flex: 1, background: T.surface2, border: '1px solid ' + T.goldBrd, borderRadius: 10, padding: '8px 10px', color: T.text, fontSize: 13, outline: 'none', colorScheme: 'dark' }
        })
      ),
      (profile && profile.notification_prefs && (profile.notification_prefs.quietStart || profile.notification_prefs.quietEnd)) && React.createElement("button", {
        onClick: function () { updateNotifPrefs({ quietStart: '', quietEnd: '' }); },
        style: { background: 'none', border: 'none', color: T.muted, fontSize: 11, textDecoration: 'underline', cursor: 'pointer', padding: 0, marginBottom: 8 }
      }, "✕ limpar horário"),
      React.createElement("p", {
        style: { color: T.muted, fontSize: 11.5, lineHeight: 1.4 }
      }, "Nesse intervalo não recebes notificações push, seja de que app for.")
    )
  )
), React.createElement("div", {
  style: { padding: '14px 16px' }
},
  React.createElement("p", {
    style: { color: T.gold, fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }
  }, "🎨 Personalização"),
  React.createElement(Card, {
    style: { padding: '16px', marginBottom: 14 }
  },
    React.createElement("p", {
      style: { color: T.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }
    }, "Tema"),
    React.createElement("div", {
      style: { display: 'flex', gap: 8 }
    }, [{ id: 'dark', emoji: '🌙', name: 'Escuro' }, { id: 'light', emoji: '☀️', name: 'Claro' }].map(function (opt) {
      var isSel = (profile && profile.theme) === opt.id || (!(profile && profile.theme) && opt.id === 'dark');
      return React.createElement("button", {
        key: opt.id,
        onClick: function () { setTheme(opt.id); },
        style: {
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          background: isSel ? T.goldDim : T.surface2,
          border: '1px solid ' + (isSel ? T.gold : T.goldBrd),
          borderRadius: 10, padding: '10px', color: isSel ? T.gold : T.text,
          fontSize: 13, fontWeight: isSel ? 700 : 400, cursor: 'pointer'
        }
      }, opt.emoji, " ", opt.name);
    }))
  ),
  React.createElement(Card, {
    style: { padding: '16px' }
  },
    React.createElement("p", {
      style: { color: T.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }
    }, "Ecrã inicial"),
    React.createElement("div", {
      style: { display: 'flex', flexDirection: 'column', gap: 6 }
    }, [{ id: null, emoji: '🏠', name: 'Início (todas as apps)' }].concat(APPS_DATA.filter(function (app) {
      return !profile || !profile.allowed_apps || profile.allowed_apps.indexOf(app.id) !== -1;
    }).map(function (app) {
      return { id: app.id, emoji: app.emoji, name: app.name };
    })).map(function (opt, oi) {
      var isSel = (profile && profile.default_app) === opt.id || (!(profile && profile.default_app) && opt.id === null);
      return React.createElement("div", {
        key: opt.id || 'hub_' + oi,
        onClick: function () { setDefaultApp(opt.id); },
        style: {
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
          background: isSel ? T.goldDim : T.surface2,
          border: '1px solid ' + (isSel ? T.gold : T.goldBrd),
          borderRadius: 10, cursor: 'pointer'
        }
      },
        React.createElement("span", { style: { fontSize: 16 } }, opt.emoji),
        React.createElement("span", { style: { flex: 1, fontSize: 13, color: isSel ? T.gold : T.text, fontWeight: isSel ? 700 : 400 } }, opt.name),
        isSel && React.createElement("span", { style: { color: T.gold, fontSize: 14 } }, "✓")
      );
    })),
    React.createElement("p", {
      style: { color: T.muted, fontSize: 11.5, lineHeight: 1.4, marginTop: 10 }
    }, "É o que abre logo a seguir a entrares na app.")
  )
), /*#__PURE__*/React.createElement(BottomNav, {
    active: "Defini\xE7\xF5es",
    onNav: nav
  }));

  // ── PERFIL ──
  if (screen === 'perfil') return /*#__PURE__*/React.createElement("div", {
    style: _objectSpread(_objectSpread({}, wrap), {}, {
      paddingBottom: 80
    })
  }, /*#__PURE__*/React.createElement(TopBar, {
    onBack: function onBack() {
      return setScreen('hub');
    },
    title: "Perfil"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: 84,
      height: 84,
      margin: '0 auto 12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 84,
      height: 84,
      borderRadius: 26,
      background: (profile && profile.photo_url) ? '#000' : "linear-gradient(135deg,".concat(T.gold, ",").concat(T.goldL, ")"),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      boxShadow: "0 0 32px rgba(201,168,71,0.3)"
    }
  }, (profile && profile.photo_url) ? /*#__PURE__*/React.createElement("img", {
    src: profile.photo_url,
    alt: "Foto",
    style: { width: '100%', height: '100%', objectFit: 'cover' }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 40
    }
  }, myAvatarEmoji)), /*#__PURE__*/React.createElement("label", {
    title: "Adicionar foto",
    style: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 32,
      height: 32,
      borderRadius: '50%',
      background: T.gold,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: { fontSize: 15 }
  }, "\uD83D\uDCF7"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    style: { display: 'none' },
    onChange: handleMyPhotoUpload
  }))), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 22,
      fontWeight: 900,
      color: T.text
    }
  }, myDisplayName), isAdmin && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: T.goldDim,
      border: "1px solid ".concat(T.goldBrd),
      borderRadius: 20,
      padding: '4px 14px',
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      color: T.gold
    }
  }, "\uD83D\uDC51 Admin"))), [{
    icon: '📧',
    label: 'Email',
    value: (profile && profile.email) || (user && user.email) || '—'
  }, {
    icon: '🌍',
    label: 'País',
    value: 'Suíça 🇨🇭'
  }, {
    icon: '📱',
    label: 'Apps ativas',
    value: "".concat(myAllowedApps.length, " apps")
  }].concat(isAdmin ? [{
    icon: '👥',
    label: 'Utilizadores',
    value: "".concat(users.length, " pessoas")
  }] : []).concat([{
    icon: '⚡',
    label: 'Versão',
    value: 'Carvalho Suite v1.0 · Premium'
  }]).map(function (r) {
    return /*#__PURE__*/React.createElement(Card, {
      key: r.label,
      style: {
        padding: '13px 16px',
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20
      }
    }, r.icon), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: T.muted,
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.4px'
      }
    }, r.label), /*#__PURE__*/React.createElement("p", {
      style: {
        color: T.text,
        fontSize: 14,
        fontWeight: 600,
        marginTop: 2
      }
    }, r.value)));
  }), isAdmin && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.gold,
      fontSize: 11,
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      margin: '18px 0 10px',
      paddingLeft: 4
    }
  }, "\uD83D\uDC65 Utilizadores e acessos"), React.createElement(Card, {
    style: { marginBottom: 12, padding: '12px 14px', border: '1px solid ' + T.gold }
  },
    React.createElement("div", {
      onClick: function () { setAddMemberOpen(function (v) { return !v; }); },
      style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }
    },
      React.createElement("p", { style: { color: T.gold, fontWeight: 800, fontSize: 13 } }, "➕ Adicionar membro"),
      React.createElement("span", { style: { color: T.gold, fontSize: 16 } }, addMemberOpen ? '⌄' : '›')
    ),
    addMemberOpen && React.createElement("div", { style: { marginTop: 12 } },
      React.createElement("div", { style: { display: 'flex', gap: 6, marginBottom: 10 } },
        ['👤', '👨', '👩', '👦', '👧', '👴', '👵'].map(function (e) {
          return React.createElement("button", {
            key: e,
            onClick: function () { setNewMemberEmoji(e); },
            style: {
              flex: 1,
              background: newMemberEmoji === e ? T.goldDim : T.surface2,
              border: '1px solid ' + (newMemberEmoji === e ? T.gold : T.goldBrd),
              borderRadius: 10, padding: '7px 2px', fontSize: 16, cursor: 'pointer'
            }
          }, e);
        })
      ),
      React.createElement("input", {
        value: newMemberName,
        onChange: function (e) { setNewMemberName(e.target.value); },
        placeholder: 'Nome',
        style: { width: '100%', background: T.surface2, border: '1px solid ' + T.goldBrd, borderRadius: 10, padding: '9px 12px', color: T.text, fontSize: 13, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }
      }),
      React.createElement("input", {
        type: 'email',
        autoCapitalize: 'none',
        value: newMemberEmail,
        onChange: function (e) { setNewMemberEmail(e.target.value); },
        placeholder: 'email@exemplo.com',
        style: { width: '100%', background: T.surface2, border: '1px solid ' + T.goldBrd, borderRadius: 10, padding: '9px 12px', color: T.text, fontSize: 13, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }
      }),
      React.createElement("input", {
        value: newMemberPwd,
        onChange: function (e) { setNewMemberPwd(e.target.value); },
        placeholder: 'Password',
        style: { width: '100%', background: T.surface2, border: '1px solid ' + T.goldBrd, borderRadius: 10, padding: '9px 12px', color: T.text, fontSize: 13, outline: 'none', marginBottom: 10, boxSizing: 'border-box' }
      }),
      React.createElement("p", { style: { color: T.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 } }, "Quem é na Família (para \"Só eu\" funcionar certo)"),
      React.createElement("div", { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 } },
        [{ id: 'patricio', label: 'Pai' }, { id: 'esposa', label: 'Mãe' }, { id: 'lucas', label: 'Lucas' }, { id: 'liam', label: 'Liam' }].map(function (opt) {
          var on = newMemberMemberId === opt.id;
          return React.createElement("button", {
            key: opt.id,
            onClick: function () { setNewMemberMemberId(opt.id); },
            style: {
              background: on ? T.goldDim : T.surface2,
              border: '1px solid ' + (on ? T.gold : T.goldBrd),
              borderRadius: 10, padding: '6px 10px',
              color: on ? T.gold : T.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer'
            }
          }, opt.label);
        })
      ),
      React.createElement("p", { style: { color: T.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 } }, "Acesso às apps"),
      React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 } },
        APPS_DATA.map(function (app) {
          var on = newMemberApps.includes(app.id);
          return React.createElement("button", {
            key: app.id,
            onClick: function () { toggleNewMemberApp(app.id); },
            style: {
              background: on ? T.goldDim : T.surface2,
              border: '1px solid ' + (on ? T.gold : T.goldBrd),
              borderRadius: 10, padding: '6px 10px',
              color: on ? T.gold : T.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer'
            }
          }, app.emoji + ' ' + app.name);
        })
      ),
      memberMsg && React.createElement("p", { style: { color: T.gold, fontSize: 12, marginBottom: 8 } }, memberMsg),
      React.createElement("button", {
        onClick: createMember,
        disabled: memberBusy,
        style: {
          width: '100%',
          background: memberBusy ? T.surface2 : "linear-gradient(135deg,".concat(T.gold, ",").concat(T.goldL, ")"),
          border: 'none', borderRadius: 12, padding: '11px',
          color: memberBusy ? T.muted : T.bg, fontSize: 14, fontWeight: 800,
          cursor: memberBusy ? 'default' : 'pointer'
        }
      }, memberBusy ? 'A criar…' : '✓ Criar conta')
    )
  ), /*#__PURE__*/React.createElement(Card, {
    style: {
      marginBottom: 12,
      padding: '12px 14px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.muted,
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 8
    }
  }, "Convidar por email (antes de criarem conta)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: newInviteEmail,
    onChange: function onChange(e) {
      return setNewInviteEmail(e.target.value);
    },
    onKeyDown: function onKeyDown(e) {
      return e.key === 'Enter' && addInvite();
    },
    placeholder: "email@exemplo.com",
    autoCapitalize: "none",
    style: {
      flex: 1,
      background: T.surface2,
      border: "1px solid ".concat(T.goldBrd),
      borderRadius: 10,
      padding: '9px 12px',
      color: T.text,
      fontSize: 13,
      outline: 'none'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: addInvite,
    style: {
      background: T.gold,
      border: 'none',
      borderRadius: 10,
      padding: '0 16px',
      color: T.bg,
      fontSize: 13,
      fontWeight: 800,
      cursor: 'pointer'
    }
  }, "+"))), pendingInvites.map(function (inv) {
    var invPerms = inv.allowed_apps || [];
    var isExp = expandedUser === 'invite_' + inv.email;
    return /*#__PURE__*/React.createElement(Card, {
      key: inv.email,
      style: {
        marginBottom: 10,
        overflow: 'hidden',
        border: "1px dashed ".concat(T.goldBrd)
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: function onClick() {
        return setExpandedUser(isExp ? null : 'invite_' + inv.email);
      },
      style: {
        padding: '13px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 42,
        height: 42,
        borderRadius: 13,
        background: 'rgba(255,255,255,0.05)',
        border: "2px dashed ".concat(T.muted, "55"),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20
      }
    }, "\u2709\uFE0F")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontWeight: 800,
        fontSize: 15,
        color: T.text
      }
    }, inv.email), /*#__PURE__*/React.createElement("p", {
      style: {
        color: T.muted,
        fontSize: 12
      }
    }, "Convite pendente \xB7 ", invPerms.length, " app(s)")), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick(e) {
        e.stopPropagation();
        removeInvite(inv.email);
      },
      style: {
        background: 'none',
        border: 'none',
        color: T.red,
        fontSize: 18,
        cursor: 'pointer',
        padding: 4
      }
    }, "\u2715"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: T.muted,
        fontSize: 18
      }
    }, isExp ? '⌄' : '›')), isExp && /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "1px solid ".concat(T.border),
        padding: '12px 16px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, APPS_DATA.map(function (app) {
      var hasAccess = invPerms.includes(app.id);
      return /*#__PURE__*/React.createElement("div", {
        key: app.id,
        onClick: function onClick() {
          return toggleInvitePerm(inv.email, app.id);
        },
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 10px',
          background: T.surface2,
          borderRadius: 10,
          cursor: 'pointer'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 16
        }
      }, app.emoji), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1,
          fontSize: 13,
          color: T.text,
          fontWeight: 600
        }
      }, app.name), /*#__PURE__*/React.createElement("div", {
        style: {
          width: 38,
          height: 22,
          borderRadius: 11,
          background: hasAccess ? T.gold : T.border,
          position: 'relative',
          transition: 'background 0.2s'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          top: 2,
          left: hasAccess ? 18 : 2,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s'
        }
      })));
    }))));
  }), allProfiles.map(function (u) {
    var userPerms = u.allowed_apps || [];
    var isExp = expandedUser === u.id;
    var uEmoji = {
      patricio: '👨‍💼',
      esposa: '👩',
      lucas: '👦',
      liam: '👦'
    }[u.member_id] || '👤';
    var uName = u.display_name || (u.member_id ? u.member_id.charAt(0).toUpperCase() + u.member_id.slice(1) : u.email || 'Utilizador');
    return /*#__PURE__*/React.createElement(Card, {
      key: u.id,
      style: {
        marginBottom: 10,
        overflow: 'hidden',
        opacity: u.disabled ? 0.55 : 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: function onClick() {
        return setExpandedUser(isExp ? null : u.id);
      },
      style: {
        padding: '13px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 42,
        height: 42,
        borderRadius: 13,
        background: u.is_admin ? "".concat(T.gold, "22") : 'rgba(124,58,237,0.15)',
        border: "2px solid ".concat(u.is_admin ? T.gold : '#7C3AED', "55"),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }
    }, u.photo_url ? /*#__PURE__*/React.createElement("img", {
      src: u.photo_url,
      alt: uName,
      style: { width: '100%', height: '100%', objectFit: 'cover' }
    }) : /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 22
      }
    }, uEmoji)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontWeight: 800,
        fontSize: 15,
        color: T.text
      }
    }, uName), /*#__PURE__*/React.createElement("p", {
      style: {
        color: T.muted,
        fontSize: 12
      }
    }, u.email, " \xB7 ", userPerms.length, " app(s)", u.disabled ? " \xB7 \uD83D\uDEAB Suspenso" : "")), /*#__PURE__*/React.createElement("span", {
      style: {
        color: T.gold,
        fontSize: 16
      }
    }, isExp ? '⌄' : '›')), isExp && /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "1px solid ".concat(T.border),
        padding: '12px 16px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 16,
        marginBottom: 14,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
      style: { color: T.muted, fontSize: 9, fontWeight: 700, textTransform: 'uppercase' }
    }, "Email"), /*#__PURE__*/React.createElement("p", {
      style: { color: T.text, fontSize: 13, fontWeight: 600, marginTop: 2 }
    }, u.email || '—')), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
      style: { color: T.muted, fontSize: 9, fontWeight: 700, textTransform: 'uppercase' }
    }, "País"), /*#__PURE__*/React.createElement("p", {
      style: { color: T.text, fontSize: 13, fontWeight: 600, marginTop: 2 }
    }, "Su\xED\xE7a \uD83C\uDDE8\uD83C\uDDED"))), /*#__PURE__*/React.createElement("p", {
      style: {
        color: T.muted,
        fontSize: 9,
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 8
      }
    }, "Acesso \xE0s apps"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, APPS_DATA.map(function (app) {
      var hasAccess = userPerms.includes(app.id);
      return /*#__PURE__*/React.createElement("div", {
        key: app.id,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 10px',
          background: T.surface2,
          borderRadius: 10
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 16
        }
      }, app.emoji), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1,
          fontSize: 13,
          color: T.text
        }
      }, app.name), /*#__PURE__*/React.createElement("div", {
        onClick: function onClick() {
          return togglePerm(u.id, app.id);
        },
        style: {
          width: 42,
          height: 24,
          borderRadius: 12,
          background: hasAccess ? T.gold : '#333',
          border: "1px solid ".concat(hasAccess ? T.goldL : '#444'),
          position: 'relative',
          cursor: 'pointer',
          transition: 'background 0.2s'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          top: 2,
          left: hasAccess ? 20 : 2,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s'
        }
      })));
    })), React.createElement("div", {
      style: { borderTop: '1px solid ' + T.border, marginTop: 12, paddingTop: 12 }
    },
      (editingMember && editingMember.id === u.id) ? React.createElement("div", null,
        React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 } },
          React.createElement("div", {
            style: { width: 42, height: 42, borderRadius: 13, overflow: 'hidden', background: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
          }, editingMember.photo_url ? React.createElement("img", { src: editingMember.photo_url, style: { width: '100%', height: '100%', objectFit: 'cover' } }) : React.createElement("span", { style: { fontSize: 20 } }, uEmoji)),
          React.createElement("label", { style: { color: T.gold, fontSize: 12, fontWeight: 700, cursor: 'pointer' } },
            "📷 Mudar foto",
            React.createElement("input", { type: 'file', accept: 'image/*', onChange: handleMemberPhotoUpload, style: { display: 'none' } })
          )
        ),
        React.createElement("input", {
          value: editingMember.display_name || '',
          onChange: function (e) { var v = e.target.value; setEditingMember(function (p) { return p ? Object.assign({}, p, { display_name: v }) : p; }); },
          placeholder: 'Nome',
          style: { width: '100%', background: T.surface2, border: '1px solid ' + T.goldBrd, borderRadius: 10, padding: '9px 12px', color: T.text, fontSize: 13, outline: 'none', marginBottom: 10, boxSizing: 'border-box' }
        }),
        React.createElement("p", { style: { color: T.muted, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 } }, "Quem é na Família (para \"Só eu\" funcionar certo)"),
        React.createElement("div", { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 } },
          [{ id: 'patricio', label: 'Pai' }, { id: 'esposa', label: 'Mãe' }, { id: 'lucas', label: 'Lucas' }, { id: 'liam', label: 'Liam' }].map(function (opt) {
            var on = editingMember.member_id === opt.id;
            return React.createElement("button", {
              key: opt.id,
              onClick: function () { setEditingMember(function (p) { return p ? Object.assign({}, p, { member_id: opt.id }) : p; }); },
              style: {
                background: on ? T.goldDim : T.surface2,
                border: '1px solid ' + (on ? T.gold : T.goldBrd),
                borderRadius: 9, padding: '7px 12px',
                color: on ? T.gold : T.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer'
              }
            }, opt.label);
          })
        ),
        React.createElement("div", { style: { display: 'flex', gap: 8 } },
          React.createElement("button", {
            onClick: function () { setEditingMember(null); },
            style: { flex: 1, background: T.surface2, border: '1px solid ' + T.goldBrd, borderRadius: 10, padding: '9px', color: T.muted, fontSize: 13, fontWeight: 700, cursor: 'pointer' }
          }, "Cancelar"),
          React.createElement("button", {
            onClick: saveMemberEdit,
            disabled: memberBusy,
            style: { flex: 2, background: memberBusy ? T.surface2 : T.gold, border: 'none', borderRadius: 10, padding: '9px', color: memberBusy ? T.muted : T.bg, fontSize: 13, fontWeight: 800, cursor: memberBusy ? 'default' : 'pointer' }
          }, memberBusy ? 'A guardar…' : '✓ Guardar')
        )
      ) : React.createElement("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
        React.createElement("button", {
          onClick: function () { setEditingMember({ id: u.id, display_name: u.display_name || '', photo_url: u.photo_url || '', member_id: u.member_id || '' }); },
          style: { background: 'rgba(201,168,71,0.08)', border: '1px solid ' + T.goldBrd, borderRadius: 9, padding: '7px 12px', color: T.gold, fontSize: 12, fontWeight: 700, cursor: 'pointer' }
        }, "✏️ Editar"),
        React.createElement("button", {
          onClick: function () { toggleDisabled(u.id, u.disabled); },
          style: {
            background: u.disabled ? 'rgba(34,197,94,0.08)' : 'rgba(249,115,22,0.08)',
            border: '1px solid ' + (u.disabled ? 'rgba(34,197,94,0.3)' : 'rgba(249,115,22,0.3)'),
            borderRadius: 9, padding: '7px 12px',
            color: u.disabled ? '#22C55E' : '#F97316', fontSize: 12, fontWeight: 700, cursor: 'pointer'
          }
        }, u.disabled ? '✅ Reativar' : '🚫 Suspender'),
        React.createElement("button", {
          onClick: function () { deleteMemberPermanent(u); },
          style: { background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 9, padding: '7px 12px', color: '#DC2626', fontSize: 12, fontWeight: 700, cursor: 'pointer' }
        }, "🗑️ Apagar definitivamente")
      ),
      memberMsg && React.createElement("p", { style: { color: T.gold, fontSize: 11.5, marginTop: 8 } }, memberMsg)
    )));
  }), allProfiles.length === 0 && pendingInvites.length === 0 && /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.muted,
      fontSize: 12,
      textAlign: 'center',
      padding: '10px'
    }
  }, "Ainda ningu\xE9m da fam\xEDlia criou conta."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.muted,
      fontSize: 11,
      textAlign: 'center',
      marginTop: 4
    }
  }, "Cada pessoa cria a sua conta no ecr\xE3 de login \xB7 tu controlas o acesso aqui")), React.createElement(Card, {
    style: { padding: '14px 16px', marginBottom: 14 }
  },
    React.createElement("div", {
      onClick: function () { setChangePwdOpen(function (v) { return !v; }); },
      style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }
    },
      React.createElement("p", { style: { color: T.text, fontWeight: 700, fontSize: 13 } }, "\uD83D\uDD11 Mudar password"),
      React.createElement("span", { style: { color: T.muted, fontSize: 16 } }, changePwdOpen ? '\u2304' : '\u203A')
    ),
    changePwdOpen && React.createElement("div", { style: { marginTop: 12 } },
      React.createElement("input", {
        type: 'password',
        value: newPwdVal,
        onChange: function (e) { setNewPwdVal(e.target.value); },
        placeholder: 'Nova password (mín. 6 caracteres)',
        style: { width: '100%', background: T.surface2, border: '1px solid ' + T.goldBrd, borderRadius: 10, padding: '9px 12px', color: T.text, fontSize: 13, outline: 'none', marginBottom: 10, boxSizing: 'border-box' }
      }),
      changePwdMsg && React.createElement("p", {
        style: { color: changePwdMsg.indexOf('\u2713') === 0 ? T.green : '#EF4444', fontSize: 12, marginBottom: 8 }
      }, changePwdMsg),
      React.createElement("button", {
        onClick: doChangePassword,
        disabled: changePwdBusy,
        style: {
          width: '100%',
          background: changePwdBusy ? T.surface2 : "linear-gradient(135deg,".concat(T.gold, ",").concat(T.goldL, ")"),
          border: 'none', borderRadius: 12, padding: '11px',
          color: changePwdBusy ? T.muted : T.bg, fontSize: 14, fontWeight: 800,
          cursor: changePwdBusy ? 'default' : 'pointer'
        }
      }, changePwdBusy ? 'A guardar…' : '✓ Guardar nova password')
    )
  ), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return doLogout();
    },
    style: {
      width: '100%',
      background: 'rgba(239,68,68,0.1)',
      border: '1px solid rgba(239,68,68,0.3)',
      borderRadius: 14,
      padding: '15px',
      color: T.red,
      fontSize: 15,
      fontWeight: 800,
      cursor: 'pointer',
      marginTop: 8
    }
  }, "Terminar sess\xE3o")), /*#__PURE__*/React.createElement(BottomNav, {
    active: "Perfil",
    onNav: nav
  }));

  // ── HUB ──
  var voltarBanner = activeUser !== 'patricio' && voltarBannerShown ? /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(201,168,71,0.1)',
      borderBottom: "1px solid ".concat(T.goldBrd),
      padding: '9px 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: T.gold,
      fontSize: 13,
      fontWeight: 700
    }
  }, "\uD83D\uDC41\uFE0F A ver como: ", user.name), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setUser('patricio');
    },
    style: {
      background: T.goldDim,
      border: "1px solid ".concat(T.goldBrd),
      borderRadius: 10,
      padding: '5px 14px',
      color: T.gold,
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "\u2039 Voltar")) : null;
  return /*#__PURE__*/React.createElement("div", {
    style: _objectSpread(_objectSpread({}, wrap), {}, {
      paddingBottom: 90
    })
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.surface,
      borderBottom: "1px solid ".concat(T.goldBrd),
      padding: '12px 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 200
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      return setScreen('hub');
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      return setScreen('hub');
    },
    style: {
      width: 36,
      height: 36,
      borderRadius: 11,
      background: "linear-gradient(135deg,".concat(T.gold, ",").concat(T.goldL, ")"),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 900,
      color: T.bg,
      fontSize: 17
    }
  }, "C")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontWeight: 800,
      fontSize: 15,
      letterSpacing: '-0.3px',
      lineHeight: 1.1
    }
  }, "Carvalho Suite"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.muted,
      fontSize: 10,
      fontWeight: 600
    }
  }, "v1.0 \xB7 Premium"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: copyAppLink,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      background: T.surface2,
      borderRadius: 20,
      padding: '5px 10px',
      border: "1px solid ".concat(linkCopied ? T.goldL : online ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'),
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: linkCopied ? T.gold : online ? T.green : T.red,
      boxShadow: "0 0 8px ".concat(linkCopied ? T.gold : online ? T.green : T.red)
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: linkCopied ? T.gold : online ? T.green : T.red
    }
  }, linkCopied ? '🔗 Copiado!' : online ? 'Sync ✓' : 'Offline')), /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      return setScreen('notifs');
    },
    style: {
      position: 'relative',
      cursor: 'pointer',
      padding: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22,
      color: T.gold
    }
  }, "\uD83D\uDD14"), totalBadge > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 16,
      height: 16,
      background: T.red,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: "2px solid ".concat(T.bg)
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      color: '#fff',
      fontWeight: 800
    }
  }, totalBadge))))), voltarBanner, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(160deg,#14141F 0%,".concat(T.bg, " 80%)"),
      padding: '20px 20px 16px',
      borderBottom: "1px solid ".concat(T.goldBrd)
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.gold,
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 3
    }
  }, greeting, ", ", myDisplayName, " ", myEmoji), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 19,
      fontWeight: 800,
      letterSpacing: '-0.5px',
      color: T.text,
      textTransform: 'capitalize'
    }
  }, dateStr), !profile && !profileErr && /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.muted,
      fontSize: 11,
      marginTop: 8
    }
  }, "A carregar perfil\u2026"), profileErr && /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.red,
      fontSize: 11,
      fontWeight: 700,
      marginTop: 8,
      background: 'rgba(239,68,68,0.1)',
      padding: '8px 10px',
      borderRadius: 8
    }
  }, "\u26A0 ", profileErr), isAdmin && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 12
    }
  }, [{
    l: 'Apps',
    v: '5',
    c: T.gold
  }, {
    l: 'Alertas',
    v: String(totalBadge),
    c: T.red
  }, {
    l: 'Utilizadores',
    v: String(users.length),
    c: T.green
  }].map(function (s) {
    return /*#__PURE__*/React.createElement(Card, {
      key: s.l,
      style: {
        flex: 1,
        padding: '10px 12px'
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: T.muted,
        fontSize: 9,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.4px'
      }
    }, s.l), /*#__PURE__*/React.createElement("p", {
      style: {
        color: s.c,
        fontSize: 22,
        fontWeight: 900,
        marginTop: 2
      }
    }, s.v));
  }))), false && isAdmin && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px 0'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.7px',
      marginBottom: 10
    }
  }, "Ver como utilizador"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7
    }
  }, users.map(function (u) {
    var uApps = APPS_DATA.filter(function (a) {
      return (perms[u.id] || []).includes(a.id);
    });
    var uBadge = uApps.reduce(function (n, a) {
      return n + (a.badge ? parseInt(a.badge) : 0);
    }, 0);
    var isAct = activeUser === u.id;
    return /*#__PURE__*/React.createElement("button", {
      key: u.id,
      onClick: function onClick() {
        return setUser(u.id);
      },
      style: {
        flex: 1,
        background: isAct ? T.goldDim : T.surface,
        border: "1px solid ".concat(isAct ? T.gold : T.goldBrd),
        borderRadius: 13,
        padding: '10px 4px 8px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        position: 'relative'
      }
    }, uBadge > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 5,
        right: 5,
        background: T.red,
        borderRadius: '50%',
        width: 14,
        height: 14,
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
    }, uBadge)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18
      }
    }, u.emoji), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        color: isAct ? T.gold : T.text,
        marginTop: 1
      }
    }, u.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9,
        color: T.muted,
        fontWeight: 600
      }
    }, uApps.length, " apps"));
  }))), notifPerm === 'default' && !notifBannerDismissed && /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 16px 14px',
      background: 'linear-gradient(135deg, rgba(201,168,71,0.15), rgba(201,168,71,0.06))',
      border: "1px solid ".concat(T.goldBrd),
      borderRadius: 16,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: { fontSize: 24 }
  }, "\uD83D\uDD14"), /*#__PURE__*/React.createElement("div", {
    style: { flex: 1 }
  }, /*#__PURE__*/React.createElement("p", {
    style: { color: T.text, fontSize: 13, fontWeight: 700 }
  }, "Ativar notifica\xE7\xF5es"), /*#__PURE__*/React.createElement("p", {
    style: { color: T.muted, fontSize: 11, marginTop: 2 }
  }, "Recebe avisos de novos eventos e marca\xE7\xF5es")), /*#__PURE__*/React.createElement("button", {
    onClick: requestNotifPermission,
    style: {
      background: T.gold,
      color: '#09090E',
      border: 'none',
      borderRadius: 10,
      padding: '8px 14px',
      fontWeight: 800,
      fontSize: 12,
      cursor: 'pointer',
      flexShrink: 0
    }
  }, "Ativar"), /*#__PURE__*/React.createElement("button", {
    onClick: dismissNotifBanner,
    style: {
      background: 'none',
      border: 'none',
      color: T.muted,
      fontSize: 16,
      cursor: 'pointer',
      padding: 4,
      flexShrink: 0
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      marginBottom: 10
    }
  }, isAdmin ? 'Todas as apps' : "Apps de ".concat(myDisplayName)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 9
    }
  }, visAppsWithBadges.map(function (app) {
    return /*#__PURE__*/React.createElement("div", {
      key: app.id,
      onClick: function onClick() {
        setApp(app.id);
        setScreen('app');
      },
      style: {
        background: T.surface,
        borderRadius: 18,
        padding: '16px 18px',
        border: "1px solid ".concat(T.goldBrd),
        borderLeft: "3px solid ".concat(app.color),
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 48,
        height: 48,
        borderRadius: 14,
        background: T.surface2,
        border: "1px solid ".concat(T.goldBrd),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 22
      }
    }, app.emoji)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 800,
        fontSize: 15,
        color: T.text
      }
    }, app.name), app.badge && /*#__PURE__*/React.createElement("div", {
      style: {
        background: T.red,
        borderRadius: 8,
        padding: '1px 7px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 800,
        color: '#fff'
      }
    }, app.badge))), /*#__PURE__*/React.createElement("p", {
      style: {
        color: T.muted,
        fontSize: 12
      }
    }, app.desc)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 7,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: T.green,
        boxShadow: "0 0 8px ".concat(T.green)
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 26,
        color: T.gold,
        lineHeight: 1,
        fontWeight: 300
      }
    }, "\u203A")));
  }))), /*#__PURE__*/React.createElement(BottomNav, {
    active: "In\xEDcio",
    onNav: nav
  }));
}
