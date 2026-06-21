var DISC_CORES = ['#7C3AED', '#2563EB', '#DC2626', '#D97706', '#16A34A', '#DB2777', '#0891B2', '#65A30D', '#9333EA', '#EA580C'];

// Horários Suíços - Lektionen Grenchen
// Slots Grenchen — 45 min por lição
var SWISS_SLOTS_LUCAS = [{
  id: 1,
  hi: '07:40',
  hf: '08:25'
}, {
  id: 2,
  hi: '08:30',
  hf: '09:15'
}, {
  id: 3,
  hi: '09:20',
  hf: '10:05'
}, {
  id: 4,
  hi: '10:10',
  hf: '10:55'
}, {
  id: 5,
  hi: '11:00',
  hf: '11:45'
}, {
  id: 'a',
  hi: '11:45',
  hf: '13:45',
  almoco: true
},
// almoço — pode ter aulas
{
  id: 6,
  hi: '13:45',
  hf: '14:30',
  tarde: true
}, {
  id: 7,
  hi: '14:35',
  hf: '15:20',
  tarde: true
}, {
  id: 8,
  hi: '15:25',
  hf: '16:10',
  tarde: true
}];
var SWISS_SLOTS_LIAM = [{
  id: 1,
  hi: '08:10',
  hf: '08:55'
}, {
  id: 2,
  hi: '09:00',
  hf: '09:45'
}, {
  id: 3,
  hi: '09:50',
  hf: '10:35'
}, {
  id: 4,
  hi: '10:40',
  hf: '11:25'
}, {
  id: 5,
  hi: '11:25',
  hf: '11:45'
},
// última manhã
{
  id: 'a',
  hi: '11:45',
  hf: '13:45',
  almoco: true
}, {
  id: 6,
  hi: '13:45',
  hf: '14:30',
  tarde: true
}, {
  id: 7,
  hi: '14:35',
  hf: '15:20',
  tarde: true
}, {
  id: 8,
  hi: '15:25',
  hf: '16:10',
  tarde: true
}];
var SWISS_SLOTS = SWISS_SLOTS_LUCAS; // default

var ALUNOS_DEF = {
  lucas: {
    nome: 'Lucas',
    emoji: '👦',
    cor: '#F97316',
    klasse: 'SEK P',
    cidade: 'Grenchen',
    disciplinas: [{
      id: 1,
      abr: 'D',
      nome: 'Deutsch',
      prof: 'Herr Müller',
      tel: '',
      emoji: '📝',
      cor: '#2563EB'
    }, {
      id: 2,
      abr: 'F',
      nome: 'Français',
      prof: 'Mme. Dupont',
      tel: '',
      emoji: '🗼',
      cor: '#9333EA'
    }, {
      id: 3,
      abr: 'E',
      nome: 'Englisch',
      prof: 'Frau Koch',
      tel: '',
      emoji: '🌍',
      cor: '#7C3AED'
    }, {
      id: 4,
      abr: 'M',
      nome: 'Mathematik',
      prof: 'Frau Schmidt',
      tel: '',
      emoji: '📐',
      cor: '#DC2626'
    }, {
      id: 5,
      abr: 'Bio',
      nome: 'Biologie',
      prof: 'Frau Huber',
      tel: '',
      emoji: '🌿',
      cor: '#16A34A'
    }, {
      id: 6,
      abr: 'Ch',
      nome: 'Chemie',
      prof: 'Herr Bauer',
      tel: '',
      emoji: '⚗️',
      cor: '#0891B2'
    }, {
      id: 7,
      abr: 'Gs',
      nome: 'Geschichte',
      prof: 'Herr Weber',
      tel: '',
      emoji: '🏛',
      cor: '#92400E'
    }, {
      id: 8,
      abr: 'Gg',
      nome: 'Geographie',
      prof: 'Frau Schwarz',
      tel: '',
      emoji: '🗺',
      cor: '#65A30D'
    }, {
      id: 9,
      abr: 'TG',
      nome: 'Techn. Gestalten',
      prof: 'Herr Klein',
      tel: '',
      emoji: '🔧',
      cor: '#D97706'
    }, {
      id: 10,
      abr: 'BG',
      nome: 'Bild. Gestalten',
      prof: 'Herr Braun',
      tel: '',
      emoji: '🎨',
      cor: '#EA580C'
    }, {
      id: 11,
      abr: 'Mu',
      nome: 'Musik',
      prof: 'Frau Wolf',
      tel: '',
      emoji: '🎵',
      cor: '#DB2777'
    }, {
      id: 12,
      abr: 'T',
      nome: 'Sport',
      prof: 'Herr Fischer',
      tel: '',
      emoji: '⚽',
      cor: '#16A34A'
    }, {
      id: 13,
      abr: 'Inf',
      nome: 'Informatik',
      prof: 'Herr Schneider',
      tel: '',
      emoji: '💻',
      cor: '#0891B2'
    }, {
      id: 14,
      abr: 'Lat',
      nome: 'Latein',
      prof: 'Frau Meyer',
      tel: '',
      emoji: '🏺',
      cor: '#7C3AED'
    }],
    slots: SWISS_SLOTS_LUCAS,
    horario: {
      0: [{
        discId: 1,
        hi: '07:40',
        hf: '08:30',
        sala: '213',
        livre: false
      }, {
        discId: 2,
        hi: '08:35',
        hf: '09:25',
        sala: '114',
        livre: false
      }, {
        discId: 12,
        hi: '09:35',
        hf: '11:20',
        sala: 'Gym',
        livre: false
      }, {
        discId: 3,
        hi: '11:20',
        hf: '11:45',
        sala: '211',
        livre: false
      }, {
        discId: 7,
        hi: '13:45',
        hf: '14:35',
        sala: '205',
        livre: false
      }],
      1: [{
        discId: 5,
        hi: '07:40',
        hf: '08:30',
        sala: '301',
        livre: false
      }, {
        discId: 6,
        hi: '08:35',
        hf: '09:25',
        sala: '205',
        livre: false
      }, {
        discId: 2,
        hi: '09:35',
        hf: '10:25',
        sala: '114',
        livre: false
      }, {
        discId: 8,
        hi: '11:20',
        hf: '11:45',
        sala: 'Computer',
        livre: false
      }, {
        discId: 14,
        hi: '13:45',
        hf: '14:35',
        sala: '210',
        livre: false
      }, {
        discId: 14,
        hi: '14:40',
        hf: '15:30',
        sala: '210',
        livre: false
      }],
      2: [{
        discId: 9,
        hi: '07:40',
        hf: '08:30',
        sala: '210',
        livre: false
      }, {
        discId: 1,
        hi: '08:35',
        hf: '09:25',
        sala: '213',
        livre: false
      }, {
        discId: 4,
        hi: '09:35',
        hf: '10:25',
        sala: '114',
        livre: false
      }, {
        discId: 11,
        hi: '13:45',
        hf: '14:35',
        sala: 'Musik',
        livre: false
      }],
      3: [{
        discId: 2,
        hi: '07:40',
        hf: '08:30',
        sala: '114',
        livre: false
      }, {
        discId: 4,
        hi: '08:35',
        hf: '09:25',
        sala: '211',
        livre: false
      }, {
        discId: 13,
        hi: '09:35',
        hf: '11:20',
        sala: 'Computer',
        livre: false
      }, {
        discId: 10,
        hi: '13:45',
        hf: '14:35',
        sala: 'Atelier',
        livre: false
      }, {
        discId: 10,
        hi: '14:40',
        hf: '15:30',
        sala: 'Atelier',
        livre: false
      }, {
        discId: 7,
        hi: '15:35',
        hf: '16:20',
        sala: '205',
        livre: false
      }],
      4: [{
        discId: 10,
        hi: '07:40',
        hf: '08:30',
        sala: 'Atelier',
        livre: false
      }, {
        discId: 11,
        hi: '08:35',
        hf: '09:25',
        sala: 'Musik',
        livre: false
      }, {
        discId: 7,
        hi: '09:35',
        hf: '10:25',
        sala: '205',
        livre: false
      }, {
        discId: 14,
        hi: '13:45',
        hf: '14:35',
        sala: '210',
        livre: false
      }]
    },
    notas: {
      1: {
        1: [5.5, 4.0, 5.0],
        2: [4.5, 5.0]
      },
      2: {
        1: [4.0, 4.5, 3.5],
        2: [5.0, 4.0]
      },
      3: {
        1: [5.0, 5.5],
        2: [4.5]
      },
      4: {
        1: [4.5, 4.0, 5.0],
        2: [3.5, 4.5]
      },
      5: {
        1: [5.0, 4.5],
        2: [5.5, 5.0]
      },
      9: {
        1: [3.5, 4.0],
        2: [4.0]
      },
      12: {
        1: [5.5, 5.0],
        2: [5.0]
      }
    },
    tpc: [{
      id: 1,
      discId: 1,
      titulo: 'Aufsatz schreiben',
      data: '2026-06-18',
      feito: false
    }, {
      id: 2,
      discId: 2,
      titulo: 'Seite 42-44',
      data: '2026-06-17',
      feito: true
    }, {
      id: 3,
      discId: 4,
      titulo: 'Vocabulary Unit 5',
      data: '2026-06-19',
      feito: false
    }]
  },
  liam: {
    nome: 'Liam',
    emoji: '👦',
    cor: '#22C55E',
    klasse: 'SEK B',
    cidade: 'Selzach',
    disciplinas: [{
      id: 1,
      abr: 'D',
      nome: 'Deutsch',
      prof: 'Frau Meyer',
      tel: '',
      emoji: '📝',
      cor: '#2563EB'
    }, {
      id: 2,
      abr: 'M',
      nome: 'Mathematik',
      prof: 'Herr Vogel',
      tel: '',
      emoji: '📐',
      cor: '#DC2626'
    }, {
      id: 3,
      abr: 'T',
      nome: 'Sport',
      prof: 'Herr Weber',
      tel: '',
      emoji: '⚽',
      cor: '#D97706'
    }, {
      id: 4,
      abr: 'E',
      nome: 'Englisch',
      prof: 'Frau Koch',
      tel: '',
      emoji: '🌍',
      cor: '#7C3AED'
    }, {
      id: 5,
      abr: 'Bio',
      nome: 'Biologie',
      prof: 'Frau Huber',
      tel: '',
      emoji: '🌿',
      cor: '#16A34A'
    }, {
      id: 6,
      abr: 'Z',
      nome: 'Zeichnen',
      prof: 'Herr Braun',
      tel: '',
      emoji: '✏️',
      cor: '#EA580C'
    }, {
      id: 7,
      abr: 'Inf',
      nome: 'Informatik',
      prof: 'Herr Klein',
      tel: '',
      emoji: '💻',
      cor: '#0891B2'
    }],
    slots: SWISS_SLOTS_LIAM,
    horario: {
      0: [{
        discId: 1,
        hi: '08:10',
        hf: '09:00',
        sala: '108',
        livre: false
      }, {
        discId: 2,
        hi: '09:05',
        hf: '09:55',
        sala: '102',
        livre: false
      }, {
        discId: 3,
        hi: '10:05',
        hf: '11:45',
        sala: 'Gym',
        livre: false
      }, {
        discId: 7,
        hi: '13:45',
        hf: '14:35',
        sala: 'Computer',
        livre: false
      }],
      1: [{
        discId: 4,
        hi: '08:10',
        hf: '09:00',
        sala: '110',
        livre: false
      }, {
        discId: 5,
        hi: '09:05',
        hf: '09:55',
        sala: '201',
        livre: false
      }, {
        discId: 7,
        hi: '10:05',
        hf: '10:55',
        sala: 'Computer',
        livre: false
      }, {
        discId: 1,
        hi: '13:45',
        hf: '14:35',
        sala: '108',
        livre: false
      }, {
        discId: 2,
        hi: '14:40',
        hf: '15:30',
        sala: '102',
        livre: false
      }],
      2: [{
        discId: 1,
        hi: '08:10',
        hf: '09:00',
        sala: '108',
        livre: false
      }, {
        discId: 2,
        hi: '09:05',
        hf: '09:55',
        sala: '102',
        livre: false
      }, {
        discId: 4,
        hi: '10:05',
        hf: '10:55',
        sala: '110',
        livre: false
      }],
      3: [{
        discId: 2,
        hi: '08:10',
        hf: '09:00',
        sala: '102',
        livre: false
      }, {
        discId: 6,
        hi: '09:05',
        hf: '11:45',
        sala: 'Atelier',
        livre: false
      }, {
        discId: 5,
        hi: '13:45',
        hf: '14:35',
        sala: '201',
        livre: false
      }, {
        discId: 4,
        hi: '14:40',
        hf: '15:30',
        sala: '110',
        livre: false
      }, {
        discId: 7,
        hi: '15:35',
        hf: '16:20',
        sala: 'Computer',
        livre: false
      }],
      4: [{
        discId: 4,
        hi: '08:10',
        hf: '09:00',
        sala: '110',
        livre: false
      }, {
        discId: 3,
        hi: '09:05',
        hf: '11:45',
        sala: 'Gym',
        livre: false
      }, {
        discId: 1,
        hi: '13:45',
        hf: '14:35',
        sala: '108',
        livre: false
      }]
    },
    notas: {
      1: {
        1: [4.5, 5.0],
        2: [4.0]
      },
      2: {
        1: [3.5, 4.0],
        2: [4.5]
      },
      3: {
        1: [5.0],
        2: [5.5]
      },
      4: {
        1: [4.0, 4.5],
        2: [3.5]
      }
    },
    tpc: [{
      id: 1,
      discId: 1,
      titulo: 'Text lesen S.30',
      data: '2026-06-17',
      feito: false
    }, {
      id: 2,
      discId: 2,
      titulo: 'Aufgaben 5-8',
      data: '2026-06-18',
      feito: false
    }]
  }
};
function EscolarApp(_ref31) {
  var onBack = _ref31.onBack,
    _ref31$sharedDias = _ref31.sharedDias,
    sharedDias = _ref31$sharedDias === void 0 ? [] : _ref31$sharedDias,
    _ref31$addSharedDia = _ref31.addSharedDia,
    addSharedDia = _ref31$addSharedDia === void 0 ? function () {} : _ref31$addSharedDia,
    _ref31$activeUser = _ref31.activeUser,
    activeUser = _ref31$activeUser === void 0 ? 'patricio' : _ref31$activeUser;
  var isAdmin = activeUser === 'patricio';
  var defaultAluno = activeUser === 'liam' ? 'liam' : 'lucas';
  var _useState139 = (0, _react.useState)(defaultAluno),
    _useState140 = _slicedToArray(_useState139, 2),
    alunoKey = _useState140[0],
    setAlunoKey = _useState140[1];
  var _useState141 = (0, _react.useState)('horario'),
    _useState142 = _slicedToArray(_useState141, 2),
    tab = _useState142[0],
    setTab = _useState142[1];
  var _useState143 = (0, _react.useState)('semana'),
    _useState144 = _slicedToArray(_useState143, 2),
    horView = _useState144[0],
    setHorView = _useState144[1]; // 'semana' | 'dia'
  var _useState145 = (0, _react.useState)(function () {
      var d = new Date().getDay();
      return d === 0 ? 4 : d - 1 > 4 ? 0 : d - 1;
    }),
    _useState146 = _slicedToArray(_useState145, 2),
    dayIdx = _useState146[0],
    setDayIdx = _useState146[1];
  var _useState147 = (0, _react.useState)(1),
    _useState148 = _slicedToArray(_useState147, 2),
    semestre = _useState148[0],
    setSemestre = _useState148[1];
  var _useState149 = (0, _react.useState)(false),
    _useState150 = _slicedToArray(_useState149, 2),
    showAddDisc = _useState150[0],
    setShowAddDisc = _useState150[1];
  var _useState151 = (0, _react.useState)(null),
    _useState152 = _slicedToArray(_useState151, 2),
    editDiscId = _useState152[0],
    setEditDiscId = _useState152[1]; // id da disciplina a editar
  var _useState153 = (0, _react.useState)(null),
    _useState154 = _slicedToArray(_useState153, 2),
    showAddNota = _useState154[0],
    setShowAddNota = _useState154[1];
  var _useState155 = (0, _react.useState)(false),
    _useState156 = _slicedToArray(_useState155, 2),
    showAddTPC = _useState156[0],
    setShowAddTPC = _useState156[1];
  var _useState157 = (0, _react.useState)(null),
    _useState158 = _slicedToArray(_useState157, 2),
    editAula = _useState158[0],
    setEditAula = _useState158[1];
  var _useState159 = (0, _react.useState)(false),
    _useState160 = _slicedToArray(_useState159, 2),
    editKlasse = _useState160[0],
    setEditKlasse = _useState160[1];
  var _useState161 = (0, _react.useState)(null),
    _useState162 = _slicedToArray(_useState161, 2),
    editKlasseKey = _useState162[0],
    setEditKlasseKey = _useState162[1];
  var _useState163 = (0, _react.useState)(new Date(2026, 5, 1)),
    _useState164 = _slicedToArray(_useState163, 2),
    calMonth = _useState164[0],
    setCalMonth = _useState164[1];
  var _useState165 = (0, _react.useState)(null),
    _useState166 = _slicedToArray(_useState165, 2),
    selDay = _useState166[0],
    setSelDay = _useState166[1];
  var _useState167 = (0, _react.useState)(''),
    _useState168 = _slicedToArray(_useState167, 2),
    novaNotaVal = _useState168[0],
    setNovaNotaVal = _useState168[1];
  var _useState169 = (0, _react.useState)({
      nome: '',
      prof: '',
      tel: '',
      emoji: '📚',
      cor: '#7C3AED'
    }),
    _useState170 = _slicedToArray(_useState169, 2),
    novaDisc = _useState170[0],
    setNovaDisc = _useState170[1];
  var _useState171 = (0, _react.useState)({
      discId: 1,
      titulo: '',
      data: '',
      feito: false,
      tipo: 'tpc'
    }),
    _useState172 = _slicedToArray(_useState171, 2),
    novaTPC = _useState172[0],
    setNovaTPC = _useState172[1];
  var _useState173 = (0, _react.useState)([]),
    _useState174 = _slicedToArray(_useState173, 2),
    escolarToasts = _useState174[0],
    setEscolarToasts = _useState174[1];
  var _useStateAddAula = (0, _react.useState)(false),
    _useStateAddAula2 = _slicedToArray(_useStateAddAula, 2),
    showAddAula = _useStateAddAula2[0],
    setShowAddAula = _useStateAddAula2[1];
  var _useStateNovaAula = (0, _react.useState)({
      discId: 1,
      hi: '',
      hf: '',
      sala: '',
      livre: false
    }),
    _useStateNovaAula2 = _slicedToArray(_useStateNovaAula, 2),
    novaAula = _useStateNovaAula2[0],
    setNovaAula = _useStateNovaAula2[1];
  var _useStateEditTpc = (0, _react.useState)(null),
    _useStateEditTpc2 = _slicedToArray(_useStateEditTpc, 2),
    editTpcId = _useStateEditTpc2[0],
    setEditTpcId = _useStateEditTpc2[1];
  var _useStateEditNota = (0, _react.useState)(null),
    _useStateEditNota2 = _slicedToArray(_useStateEditNota, 2),
    editNotaKey = _useStateEditNota2[0],
    setEditNotaKey = _useStateEditNota2[1];
  var _useStateEditNotaVal = (0, _react.useState)(''),
    _useStateEditNotaVal2 = _slicedToArray(_useStateEditNotaVal, 2),
    editNotaVal = _useStateEditNotaVal2[0],
    setEditNotaVal = _useStateEditNotaVal2[1];
  var addEscolarToast = function addEscolarToast(msg) {
    var sub = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var id = Date.now() + Math.random();
    setEscolarToasts(function (p) {
      return [].concat(_toConsumableArray(p), [{
        id: id,
        msg: msg,
        sub: sub
      }]);
    });
    setTimeout(function () {
      return setEscolarToasts(function (p) {
        return p.filter(function (t) {
          return t.id !== id;
        });
      });
    }, 4000);
  };
  // Check TPC on load
  (0, _react.useEffect)(function () {
    var today = '2026-06-15';
    var tomorrow = '2026-06-16';
    var urgentes = aluno.tpc.filter(function (t) {
      return !t.feito && (t.data === today || t.data === tomorrow);
    });
    urgentes.forEach(function (t) {
      var d = getDisc(t.discId);
      addEscolarToast(t.data === today ? "\u26A0\uFE0F TPC para hoje! ".concat(d.nome) : "\uD83D\uDD14 TPC amanh\xE3! ".concat(d.nome), t.titulo);
    });
  }, [alunoKey]);

  // Per-student state
  var _useState175 = (0, _react.useState)(ALUNOS_DEF),
    _useState176 = _slicedToArray(_useState175, 2),
    alunosData = _useState176[0],
    setAlunosData = _useState176[1];
  var aluno = alunosData[alunoKey];
  var saveAlunoSnapshot = function saveAlunoSnapshot(key, data) {
    if (!window.supabaseClient) return;
    var sb = window.supabaseClient;
    sb.from('escolar_disciplinas').delete().eq('aluno', key).then(function () {
      var rows = (data.disciplinas || []).map(function (d) {
        return {
          id: d.id,
          aluno: key,
          abr: d.abr || '',
          nome: d.nome || '',
          prof: d.prof || '',
          tel: d.tel || '',
          emoji: d.emoji || '',
          cor: d.cor || ''
        };
      });
      if (rows.length > 0) sb.from('escolar_disciplinas').insert(rows).then(function () {}).catch(function () {});
    }).catch(function () {});
    sb.from('escolar_horario').delete().eq('aluno', key).then(function () {
      var rows = [];
      Object.keys(data.horario || {}).forEach(function (dia) {
        (data.horario[dia] || []).forEach(function (slot) {
          rows.push({
            aluno: key,
            dia: Number(dia),
            disc_id: slot.discId,
            hi: slot.hi || '',
            hf: slot.hf || '',
            sala: slot.sala || '',
            livre: !!slot.livre
          });
        });
      });
      if (rows.length > 0) sb.from('escolar_horario').insert(rows).then(function () {}).catch(function () {});
    }).catch(function () {});
    sb.from('escolar_notas').delete().eq('aluno', key).then(function () {
      var rows = [];
      Object.keys(data.notas || {}).forEach(function (discId) {
        Object.keys(data.notas[discId] || {}).forEach(function (sem) {
          (data.notas[discId][sem] || []).forEach(function (valor) {
            rows.push({
              aluno: key,
              disc_id: Number(discId),
              semestre: Number(sem),
              valor: valor
            });
          });
        });
      });
      if (rows.length > 0) sb.from('escolar_notas').insert(rows).then(function () {}).catch(function () {});
    }).catch(function () {});
    sb.from('escolar_tpc').delete().eq('aluno', key).then(function () {
      var rows = (data.tpc || []).map(function (t) {
        return {
          id: t.id,
          aluno: key,
          disc_id: t.discId,
          titulo: t.titulo || '',
          data: t.data || '',
          feito: !!t.feito,
          tipo: t.tipo || 'tpc'
        };
      });
      if (rows.length > 0) sb.from('escolar_tpc').insert(rows).then(function () {}).catch(function () {});
    }).catch(function () {});
  };
  var setAluno = function setAluno(fn) {
    return setAlunosData(function (p) {
      var newData = fn(p[alunoKey]);
      saveAlunoSnapshot(alunoKey, newData);
      return _objectSpread(_objectSpread({}, p), {}, _defineProperty({}, alunoKey, newData));
    });
  };
  var loadEscolarData = function loadEscolarData() {
    if (!window.supabaseClient) return;
    var sb = window.supabaseClient;
    Promise.all([sb.from('escolar_disciplinas').select('*'), sb.from('escolar_horario').select('*'), sb.from('escolar_notas').select('*'), sb.from('escolar_tpc').select('*')]).then(function (resArr) {
      var discRes = resArr[0],
        horRes = resArr[1],
        notasRes = resArr[2],
        tpcRes = resArr[3];
      var anyData = discRes.data && discRes.data.length > 0 || horRes.data && horRes.data.length > 0 || tpcRes.data && tpcRes.data.length > 0;
      if (!anyData) {
        Object.keys(ALUNOS_DEF).forEach(function (key) {
          saveAlunoSnapshot(key, ALUNOS_DEF[key]);
        });
        return;
      }
      setAlunosData(function (prev) {
        var next = _objectSpread({}, prev);
        Object.keys(next).forEach(function (key) {
          var discRows = (discRes.data || []).filter(function (r) {
            return r.aluno === key;
          });
          var horRows = (horRes.data || []).filter(function (r) {
            return r.aluno === key;
          });
          var notasRows = (notasRes.data || []).filter(function (r) {
            return r.aluno === key;
          });
          var tpcRows = (tpcRes.data || []).filter(function (r) {
            return r.aluno === key;
          });
          var updated = _objectSpread({}, next[key]);
          if (discRows.length > 0) {
            updated.disciplinas = discRows.map(function (r) {
              return {
                id: r.id,
                abr: r.abr || '',
                nome: r.nome || '',
                prof: r.prof || '',
                tel: r.tel || '',
                emoji: r.emoji || '',
                cor: r.cor || ''
              };
            });
          }
          if (horRows.length > 0) {
            var horario = {};
            horRows.forEach(function (r) {
              if (!horario[r.dia]) horario[r.dia] = [];
              horario[r.dia].push({
                discId: r.disc_id,
                hi: r.hi || '',
                hf: r.hf || '',
                sala: r.sala || '',
                livre: !!r.livre
              });
            });
            updated.horario = horario;
          }
          if (notasRows.length > 0) {
            var notas = {};
            notasRows.forEach(function (r) {
              if (!notas[r.disc_id]) notas[r.disc_id] = {};
              if (!notas[r.disc_id][r.semestre]) notas[r.disc_id][r.semestre] = [];
              notas[r.disc_id][r.semestre].push(Number(r.valor));
            });
            updated.notas = notas;
          }
          if (tpcRows.length > 0) {
            updated.tpc = tpcRows.map(function (r) {
              return {
                id: r.id,
                discId: r.disc_id,
                titulo: r.titulo || '',
                data: r.data || '',
                feito: !!r.feito,
                tipo: r.tipo || 'tpc'
              };
            });
          }
          next[key] = updated;
        });
        return next;
      });
    }).catch(function () {});
  };
  (0, _react.useEffect)(function () {
    loadEscolarData();
  }, []);
  var dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
  var getDia = function getDia(i) {
    var d = new Date(2026, 5, 15);
    d.setDate(d.getDate() + i);
    return d.getDate();
  };
  var getDisc = function getDisc(id) {
    return aluno.disciplinas.find(function (d) {
      return d.id === id;
    }) || {
      nome: 'Livre',
      emoji: '⏸',
      cor: '#444',
      prof: '',
      tel: ''
    };
  };
  var media = function media(discId, sem) {
    var ns = (aluno.notas[discId] || {})[sem] || [];
    if (!ns.length) return null;
    return (ns.reduce(function (s, n) {
      return s + n;
    }, 0) / ns.length).toFixed(1);
  };
  var calcMediaGeral = function calcMediaGeral(sem) {
    var todas = aluno.disciplinas.map(function (d) {
      return {
        nome: d.nome,
        abr: d.abr || '',
        cor: d.cor,
        m: parseFloat(media(d.id, sem))
      };
    }).filter(function (d) {
      return !isNaN(d.m);
    });
    if (!todas.length) return null;
    // Durchschnitt = média de todas
    var durchschnitt = todas.reduce(function (s, d) {
      return s + d.m;
    }, 0) / todas.length;
    // 5 tiefste Noten = soma das 5 mais baixas (mínimo 19 pontos)
    var cincoMaisBaixas = _toConsumableArray(todas).sort(function (a, b) {
      return a.m - b.m;
    }).slice(0, 5);
    var somaCinco = cincoMaisBaixas.reduce(function (s, d) {
      return s + d.m;
    }, 0);
    var passaDurchschnitt = durchschnitt >= 4.0;
    var passaCinco = somaCinco >= 19;
    return {
      durchschnitt: durchschnitt.toFixed(2),
      somaCinco: somaCinco.toFixed(1),
      cincoMaisBaixas: cincoMaisBaixas,
      passaDurchschnitt: passaDurchschnitt,
      passaCinco: passaCinco,
      passa: passaDurchschnitt && passaCinco,
      todas: todas
    };
  };
  var notaColor = function notaColor(n) {
    if (!n) return '#666';
    var v = parseFloat(n);
    return v >= 5 ? '#16A34A' : v >= 4 ? '#D97706' : '#DC2626';
  };
  var tpcPendentes = aluno.tpc.filter(function (t) {
    return !t.feito;
  }).length;
  var testesPendentes = aluno.tpc.filter(function (t) {
    return t.tipo === 'teste' && !t.feito;
  }).length;
  var E = {
    bg: '#09090E',
    surface: '#131319',
    surface2: '#1C1C26',
    purple: '#7C3AED',
    purpleL: '#9F67FF',
    text: '#F0EEE8',
    muted: '#7A7A90',
    border: 'rgba(124,58,237,0.2)',
    green: '#16A34A',
    red: '#DC2626',
    gold: '#C9A847',
    orange: '#F97316'
  };
  var ECard = function ECard(_ref32) {
    var children = _ref32.children,
      _ref32$style = _ref32.style,
      style = _ref32$style === void 0 ? {} : _ref32$style;
    return /*#__PURE__*/React.createElement("div", {
      style: _objectSpread({
        background: E.surface,
        borderRadius: 16,
        border: "1px solid ".concat(E.border)
      }, style)
    }, children);
  };

  // Calendar helpers
  var yr = calMonth.getFullYear(),
    mo = calMonth.getMonth();
  var daysInMo = new Date(yr, mo + 1, 0).getDate();
  var firstDow = (new Date(yr, mo, 1).getDay() + 6) % 7;
  var getDayTPC = function getDayTPC(d) {
    var dStr = "".concat(yr, "-").concat(String(mo + 1).padStart(2, '0'), "-").concat(String(d).padStart(2, '0'));
    return aluno.tpc.filter(function (t) {
      return t.data === dStr;
    });
  };
  var getDayShared = function getDayShared(d) {
    var dStr = "".concat(yr, "-").concat(String(mo + 1).padStart(2, '0'), "-").concat(String(d).padStart(2, '0'));
    return sharedDias.filter(function (s) {
      return s.date === dStr;
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      background: E.bg,
      fontFamily: "'Inter',system-ui,sans-serif",
      color: E.text,
      overflowX: 'hidden',
      paddingBottom: 90
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: E.surface,
      borderBottom: "1px solid ".concat(E.border),
      padding: '10px 14px',
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
      gap: 6,
      minWidth: 0,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      background: 'none',
      border: 'none',
      color: E.purple,
      fontSize: 30,
      cursor: 'pointer',
      padding: 0,
      lineHeight: 1,
      width: 40,
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, "\u2039"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 900,
      fontSize: 16,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, "\uD83D\uDCDA Carvalho Schule")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "".concat(E.gold, "22"),
      border: "1px solid ".concat(E.gold, "44"),
      borderRadius: 8,
      padding: '4px 10px',
      cursor: 'pointer',
      position: 'relative',
      flexShrink: 0
    },
    onClick: function onClick() {
      return setEditKlasse(function (v) {
        return !v;
      });
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      color: E.gold
    }
  }, aluno.klasse || 'SEK P', " \u270E"), editKlasse && /*#__PURE__*/React.createElement("div", {
    onClick: function onClick(e) {
      return e.stopPropagation();
    },
    style: {
      position: 'absolute',
      top: '110%',
      right: 0,
      background: E.surface,
      border: "1px solid ".concat(E.purple),
      borderRadius: 12,
      padding: 10,
      zIndex: 300,
      minWidth: 200,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: E.muted,
      fontSize: 9,
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 6
    }
  }, "Nome da turma"), /*#__PURE__*/React.createElement("input", {
    defaultValue: aluno.klasse || 'SEK P',
    id: "klasse-input",
    autoComplete: "off",
    placeholder: "Ex: SEK B, Pri 5, 3b...",
    style: {
      width: '100%',
      background: E.surface2,
      border: "1px solid ".concat(E.purple),
      borderRadius: 8,
      padding: '8px 10px',
      color: E.text,
      fontSize: 14,
      outline: 'none',
      boxSizing: 'border-box',
      marginBottom: 8
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 5,
      flexWrap: 'wrap',
      marginBottom: 8
    }
  }, ['SEK P', 'SEK A', 'SEK B', 'SEK C', 'Pri 5', 'Pri 6', 'Real'].map(function (k) {
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      onClick: function onClick() {
        var inp = document.getElementById('klasse-input');
        if (inp) inp.value = k;
      },
      style: {
        background: E.surface2,
        border: "1px solid ".concat(E.border),
        borderRadius: 6,
        padding: '4px 8px',
        color: E.muted,
        fontSize: 11,
        cursor: 'pointer'
      }
    }, k);
  })), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      var _document$getElementB6;
      var val = (((_document$getElementB6 = document.getElementById('klasse-input')) === null || _document$getElementB6 === void 0 ? void 0 : _document$getElementB6.value) || '').trim();
      if (val) setAluno(function (al) {
        return _objectSpread(_objectSpread({}, al), {}, {
          klasse: val
        });
      });
      setEditKlasse(false);
    },
    style: {
      width: '100%',
      background: "linear-gradient(135deg,".concat(E.purple, ",").concat(E.purpleL, ")"),
      border: 'none',
      borderRadius: 8,
      padding: '8px',
      color: '#fff',
      fontSize: 13,
      fontWeight: 800,
      cursor: 'pointer'
    }
  }, "\u2713 Guardar")))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 14px',
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      overflow: 'visible'
    }
  }, (isAdmin ? ['lucas', 'liam'] : [alunoKey]).map(function (k) {
    var al = alunosData[k];
    var isSel = alunoKey === k;
    return /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        background: isSel ? "".concat(al.cor, "20") : E.surface,
        border: "2px solid ".concat(isSel ? al.cor : E.border),
        borderRadius: 14,
        flex: 1,
        minWidth: 0,
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: function onClick() {
        return setAlunoKey(k);
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flex: 1,
        minWidth: 0,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 32,
        height: 32,
        borderRadius: 10,
        background: "".concat(al.cor, "30"),
        border: "2px solid ".concat(al.cor, "55"),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18
      }
    }, al.emoji)), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'left',
        flex: 1,
        minWidth: 64
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontWeight: 800,
        fontSize: 13,
        color: isSel ? al.cor : E.text,
        whiteSpace: 'normal',
        overflowWrap: 'break-word',
        lineHeight: 1.15
      }
    }, al.nome), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        minWidth: 0,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 10,
        color: E.muted,
        whiteSpace: 'normal',
        overflowWrap: 'break-word',
        lineHeight: 1.2
      }
    }, al.klasse || 'SEK P', " \xB7 ", al.cidade || 'Grenchen'), isAdmin && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9,
        color: "".concat(E.purple, "88"),
        flexShrink: 0
      }
    }, "\u270E"))), isSel && /*#__PURE__*/React.createElement("div", {
      style: {
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: E.green,
        flexShrink: 0
      }
    })), isAdmin && editKlasseKey === k && /*#__PURE__*/React.createElement("div", {
      onClick: function onClick(e) {
        return e.stopPropagation();
      },
      style: {
        position: 'absolute',
        top: '105%',
        left: 0,
        right: 0,
        background: E.surface,
        border: "1px solid ".concat(E.purple),
        borderRadius: 12,
        padding: 10,
        zIndex: 400,
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: E.muted,
        fontSize: 9,
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 6
      }
    }, "Escola \xB7 ", al.nome), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: E.muted,
        fontSize: 8,
        fontWeight: 700,
        marginBottom: 3
      }
    }, "TURMA"), /*#__PURE__*/React.createElement("input", {
      id: "klasse-inp-".concat(k),
      defaultValue: al.klasse || 'SEK P',
      autoComplete: "off",
      placeholder: "Ex: SEK B",
      style: {
        width: '100%',
        background: E.surface2,
        border: "1px solid ".concat(E.purple),
        borderRadius: 8,
        padding: '7px 9px',
        color: E.text,
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
        color: E.muted,
        fontSize: 8,
        fontWeight: 700,
        marginBottom: 3
      }
    }, "CIDADE"), /*#__PURE__*/React.createElement("input", {
      id: "cidade-inp-".concat(k),
      defaultValue: al.cidade || 'Grenchen',
      autoComplete: "off",
      placeholder: "Ex: Selzach",
      style: {
        width: '100%',
        background: E.surface2,
        border: "1px solid ".concat(E.purple),
        borderRadius: 8,
        padding: '7px 9px',
        color: E.text,
        fontSize: 13,
        outline: 'none',
        boxSizing: 'border-box'
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 3,
        flexWrap: 'wrap',
        marginBottom: 4
      }
    }, ['SEK P', 'SEK A', 'SEK B', 'SEK C', 'Pri 5', 'Pri 6'].map(function (p) {
      return /*#__PURE__*/React.createElement("button", {
        key: p,
        onClick: function onClick() {
          var i = document.getElementById("klasse-inp-".concat(k));
          if (i) i.value = p;
        },
        style: {
          background: E.surface2,
          border: "1px solid ".concat(E.border),
          borderRadius: 6,
          padding: '2px 6px',
          color: E.muted,
          fontSize: 9,
          cursor: 'pointer'
        }
      }, p);
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 3,
        flexWrap: 'wrap',
        marginBottom: 8
      }
    }, ['Grenchen', 'Selzach', 'Bettlach', 'Solothurn', 'Biel'].map(function (c) {
      return /*#__PURE__*/React.createElement("button", {
        key: c,
        onClick: function onClick() {
          var i = document.getElementById("cidade-inp-".concat(k));
          if (i) i.value = c;
        },
        style: {
          background: E.surface2,
          border: "1px solid ".concat(E.border),
          borderRadius: 6,
          padding: '2px 6px',
          color: E.muted,
          fontSize: 9,
          cursor: 'pointer'
        }
      }, c);
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setEditKlasseKey(null);
      },
      style: {
        flex: 1,
        background: E.surface2,
        border: "1px solid ".concat(E.border),
        borderRadius: 8,
        padding: '8px',
        color: E.muted,
        fontSize: 12,
        cursor: 'pointer'
      }
    }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        var _document$getElementB7, _document$getElementB8;
        var klasse = (((_document$getElementB7 = document.getElementById("klasse-inp-".concat(k))) === null || _document$getElementB7 === void 0 ? void 0 : _document$getElementB7.value) || '').trim();
        var cidade = (((_document$getElementB8 = document.getElementById("cidade-inp-".concat(k))) === null || _document$getElementB8 === void 0 ? void 0 : _document$getElementB8.value) || '').trim();
        setAlunosData(function (p) {
          return _objectSpread(_objectSpread({}, p), {}, _defineProperty({}, k, _objectSpread(_objectSpread({}, p[k]), {}, {
            klasse: klasse || p[k].klasse,
            cidade: cidade || p[k].cidade
          })));
        });
        setEditKlasseKey(null);
      },
      style: {
        flex: 2,
        background: "linear-gradient(135deg,".concat(E.purple, ",").concat(E.purpleL, ")"),
        border: 'none',
        borderRadius: 8,
        padding: '8px',
        color: '#fff',
        fontSize: 12,
        fontWeight: 800,
        cursor: 'pointer'
      }
    }, "\u2713 Guardar"))), isAdmin && /*#__PURE__*/React.createElement("button", {
      onClick: function onClick(e) {
        e.stopPropagation();
        setEditKlasseKey(editKlasseKey === k ? null : k);
        setAlunoKey(k);
      },
      style: {
        background: "".concat(E.purple, "15"),
        border: "1px solid ".concat(E.purple, "33"),
        borderRadius: 8,
        padding: '4px 6px',
        color: E.purple,
        fontSize: 10,
        cursor: 'pointer',
        flexShrink: 0
      }
    }, "\u270E"));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      background: 'rgba(22,163,74,0.1)',
      border: '1px solid rgba(22,163,74,0.3)',
      borderRadius: 10,
      padding: '5px 10px',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 6,
      height: 6,
      background: E.green,
      borderRadius: '50%'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: E.green,
      fontWeight: 700
    }
  }, "Online"))), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 14px 12px',
      background: E.surface,
      borderRadius: 14,
      padding: 3,
      border: "1px solid ".concat(E.border),
      display: 'flex'
    }
  }, [{
    v: 'horario',
    l: '📅'
  }, {
    v: 'cal',
    l: '🗓'
  }, {
    v: 'tpc',
    l: "\uD83D\uDCCB".concat(tpcPendentes > 0 ? " ".concat(tpcPendentes) : '')
  }, {
    v: 'importante',
    l: "\uD83D\uDCCC".concat(testesPendentes > 0 ? " ".concat(testesPendentes) : '')
  }, {
    v: 'notas',
    l: '📊'
  }, {
    v: 'graficos',
    l: '📈'
  }].map(function (t) {
    return /*#__PURE__*/React.createElement("button", {
      key: t.v,
      onClick: function onClick() {
        return setTab(t.v);
      },
      style: {
        flex: 1,
        background: tab === t.v ? "linear-gradient(135deg,".concat(E.purple, ",").concat(E.purpleL, ")") : 'none',
        border: 'none',
        borderRadius: 11,
        padding: '8px 4px',
        color: tab === t.v ? '#fff' : E.muted,
        fontSize: 16,
        fontWeight: 800,
        cursor: 'pointer',
        position: 'relative'
      }
    }, t.l);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 130,
      left: 14,
      right: 14,
      zIndex: 999,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      pointerEvents: 'none'
    }
  }, escolarToasts.map(function (t) {
    return /*#__PURE__*/React.createElement("div", {
      key: t.id,
      style: {
        background: '#1A0A2E',
        border: "2px solid ".concat(E.purple),
        borderRadius: 14,
        padding: '10px 14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        pointerEvents: 'auto'
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontWeight: 800,
        fontSize: 13,
        color: '#fff'
      }
    }, t.msg), t.sub && /*#__PURE__*/React.createElement("p", {
      style: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
        marginTop: 2
      }
    }, t.sub));
  })), tab === 'horario' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginBottom: 12
    }
  }, [{
    v: 'semana',
    l: '📅 Semana'
  }, {
    v: 'dia',
    l: '🗓 Dia a dia'
  }].map(function (t) {
    return /*#__PURE__*/React.createElement("button", {
      key: t.v,
      onClick: function onClick() {
        return setHorView(t.v);
      },
      style: {
        flex: 1,
        background: horView === t.v ? "linear-gradient(135deg,".concat(E.purple, ",").concat(E.purpleL, ")") : "".concat(E.surface),
        border: "1px solid ".concat(horView === t.v ? E.purple : E.border),
        borderRadius: 12,
        padding: '9px',
        color: horView === t.v ? '#fff' : E.muted,
        fontSize: 13,
        fontWeight: 800,
        cursor: 'pointer'
      }
    }, t.l);
  })), horView === 'semana' && function () {
    var dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
    var baseSlots = aluno.slots || SWISS_SLOTS;
    var overlaps = function overlaps(a, b) {
      return a.hi < b.hf && a.hf > b.hi;
    };
    var hasAnyBand = function hasAnyBand(band) {
      return [0, 1, 2, 3, 4].some(function (di) {
        return (aluno.horario[di] || []).some(function (a) {
          return overlaps(a, band);
        });
      });
    };
    var rowHeights = baseSlots.map(function (band) {
      var any = hasAnyBand(band);
      if (band.almoco) return any ? 54 : 24;
      return any ? 54 : 28;
    });
    var getCell = function getCell(di, bandIdx) {
      var band = baseSlots[bandIdx];
      var arrDia = aluno.horario[di] || [];
      var lesson = arrDia.find(function (a) {
        return overlaps(a, band);
      });
      if (!lesson) return null;
      var startedEarlier = baseSlots.slice(0, bandIdx).some(function (b) {
        return overlaps(lesson, b);
      });
      if (startedEarlier) return {
        continuation: true
      };
      var span = 0;
      for (var k = bandIdx; k < baseSlots.length; k++) {
        if (overlaps(lesson, baseSlots[k])) span++;else break;
      }
      return {
        continuation: false,
        lesson: lesson,
        span: Math.max(1, span),
        aulaIdx: arrDia.indexOf(lesson)
      };
    };
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        background: E.surface,
        borderRadius: 16,
        border: "1px solid ".concat(E.border),
        overflow: 'hidden',
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '46px repeat(5,1fr)',
        background: E.surface2,
        borderBottom: "1px solid ".concat(E.border)
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '8px 4px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 9,
        color: E.muted,
        fontWeight: 700
      }
    }, "Hora")), dias.map(function (d, i) {
      return /*#__PURE__*/React.createElement("button", {
        key: d,
        onClick: function onClick() {
          setHorView('dia');
          setDayIdx(i);
        },
        style: {
          padding: '8px 2px',
          textAlign: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          borderLeft: "1px solid ".concat(E.border)
        }
      }, /*#__PURE__*/React.createElement("p", {
        style: {
          fontSize: 10,
          fontWeight: 800,
          color: E.purple
        }
      }, d));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '46px repeat(5,1fr)',
        gridTemplateRows: rowHeights.map(function (h) {
          return h + 'px';
        }).join(' ')
      }
    }, baseSlots.map(function (band, bandIdx) {
      var isTardeStart = !!band.tarde && bandIdx > 0 && !baseSlots[bandIdx - 1].tarde;
      var rowNum = bandIdx + 1;
      var rh = rowHeights[bandIdx];
      var timeCell = /*#__PURE__*/React.createElement("div", {
        key: 'time-' + bandIdx,
        style: {
          gridRow: rowNum,
          gridColumn: 1,
          padding: '2px',
          background: band.almoco ? 'rgba(100,100,100,0.06)' : E.surface2,
          borderRight: "1px solid ".concat(E.border),
          borderTop: isTardeStart ? "2px dashed ".concat(E.purple, "55") : "1px solid ".concat(E.border),
          display: 'flex',
          flexDirection: rh < 36 ? 'row' : 'column',
          gap: rh < 36 ? 3 : 0,
          justifyContent: 'center',
          alignItems: 'center'
        }
      }, /*#__PURE__*/React.createElement("p", {
        style: {
          fontSize: 8,
          fontWeight: 800,
          color: band.almoco ? E.muted : E.purple,
          lineHeight: 1.2
        }
      }, band.almoco ? '🍽' : band.hi), rh >= 36 && !band.almoco && /*#__PURE__*/React.createElement("p", {
        style: {
          fontSize: 7,
          color: E.muted
        }
      }, "\u2192", band.hf));
      var dayCells = [0, 1, 2, 3, 4].map(function (di) {
        var info = getCell(di, bandIdx);
        if (info && info.continuation) return null;
        var onClick = function onClick() {
          setHorView('dia');
          setDayIdx(di);
          if (info && info.lesson) {
            setShowAddAula(false);
            setEditAula("".concat(alunoKey, "-").concat(di, "-").concat(info.aulaIdx));
          } else {
            var _aluno$disciplinas$2;
            setEditAula(null);
            setNovaAula({
              discId: ((_aluno$disciplinas$2 = aluno.disciplinas[0]) === null || _aluno$disciplinas$2 === void 0 ? void 0 : _aluno$disciplinas$2.id) || 1,
              hi: band.hi,
              hf: band.hf,
              sala: '',
              livre: false
            });
            setShowAddAula(true);
          }
        };
        var cellStyle = {
          gridRow: info ? "".concat(rowNum, " / span ").concat(info.span) : rowNum,
          gridColumn: di + 2,
          borderLeft: "1px solid ".concat(E.border),
          borderTop: isTardeStart ? "2px dashed ".concat(E.purple, "33") : 'none',
          padding: 2,
          cursor: 'pointer',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: band.almoco && !info ? 'rgba(80,80,80,0.04)' : 'transparent'
        };
        if (!info) {
          return /*#__PURE__*/React.createElement("div", {
            key: di,
            onClick: onClick,
            style: cellStyle
          }, band.almoco ? /*#__PURE__*/React.createElement("p", {
            style: {
              fontSize: 7,
              color: 'rgba(150,150,150,0.5)',
              fontWeight: 600,
              textAlign: 'center'
            }
          }, "Almo\xE7o") : /*#__PURE__*/React.createElement("p", {
            style: {
              fontSize: 10,
              textAlign: 'center',
              color: 'rgba(150,150,150,0.25)'
            }
          }, "\uFF0B"));
        }
        var disc = getDisc(info.lesson.discId);
        return /*#__PURE__*/React.createElement("div", {
          key: di,
          onClick: onClick,
          style: cellStyle
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            borderRadius: 6,
            background: disc.cor,
            boxShadow: "0 2px 8px ".concat(disc.cor, "66"),
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '4px 6px',
            height: '100%',
            boxSizing: 'border-box'
          }
        }, /*#__PURE__*/React.createElement("p", {
          style: {
            fontSize: 11,
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1.2,
            textShadow: '0 1px 3px rgba(0,0,0,0.5)'
          }
        }, disc.abr || disc.nome.slice(0, 3)), /*#__PURE__*/React.createElement("p", {
          style: {
            fontSize: 8,
            color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.1,
            marginTop: 1
          }
        }, "S.", info.lesson.sala)));
      }).filter(Boolean);
      return /*#__PURE__*/React.createElement(React.Fragment, {
        key: 'band-' + bandIdx
      }, timeCell, dayCells);
    }))), /*#__PURE__*/React.createElement("p", {
      style: {
        color: E.muted,
        fontSize: 10,
        textAlign: 'center',
        marginBottom: 10
      }
    }, "Toca numa aula para editar \xB7 toca num espa\xE7o vazio para adicionar"));
  }(), horView === 'dia' &&
 /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 5,
      marginBottom: 12
    }
  }, ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'].map(function (d, i) {
    var isSel = i === dayIdx;
    var nAulas = (aluno.horario[i] || []).length;
    return /*#__PURE__*/React.createElement("button", {
      key: d,
      onClick: function onClick() {
        return setDayIdx(i);
      },
      style: {
        flex: 1,
        background: isSel ? "linear-gradient(135deg,".concat(E.purple, ",").concat(E.purpleL, ")") : E.surface,
        border: "1px solid ".concat(isSel ? E.purple : E.border),
        borderRadius: 13,
        padding: '8px 3px',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 9,
        fontWeight: 700,
        color: isSel ? '#fff' : E.muted
      }
    }, d), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 15,
        fontWeight: 900,
        color: isSel ? '#fff' : E.text,
        marginTop: 1
      }
    }, new Date(2026, 5, 15 + i).getDate()), nAulas > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        width: 5,
        height: 5,
        background: isSel ? 'rgba(255,255,255,0.6)' : E.purple,
        borderRadius: '50%',
        margin: '2px auto 0'
      }
    }));
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      color: E.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      marginBottom: 10
    }
  }, (aluno.horario[dayIdx] || []).length, " aulas"), (aluno.horario[dayIdx] || []).map(function (aula, i) {
    var disc = getDisc(aula.discId);
    var isEdit = editAula === "".concat(alunoKey, "-").concat(dayIdx, "-").concat(i);
    return /*#__PURE__*/React.createElement(ECard, {
      key: i,
      style: {
        marginBottom: 9,
        borderLeft: "4px solid ".concat(aula.livre ? '#444' : disc.cor),
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: function onClick() {
        return setEditAula(isEdit ? null : "".concat(alunoKey, "-").concat(dayIdx, "-").concat(i));
      },
      style: {
        padding: '12px 14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 44,
        height: 44,
        borderRadius: 13,
        background: "".concat(aula.livre ? '#333' : disc.cor, "22"),
        border: "1px solid ".concat(aula.livre ? '#444' : disc.cor, "44"),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 22
      }
    }, aula.livre ? '⏸' : disc.emoji)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontWeight: 800,
        fontSize: 14,
        color: aula.livre ? E.muted : E.text
      }
    }, aula.livre ? 'Hora livre' : disc.nome), /*#__PURE__*/React.createElement("p", {
      style: {
        color: E.muted,
        fontSize: 11,
        marginTop: 2
      }
    }, "\uD83D\uDD50 ", aula.hi, "\u2013", aula.hf, " \xB7 \uD83C\uDFEB Sala ", aula.sala), !aula.livre && disc.prof && /*#__PURE__*/React.createElement("p", {
      style: {
        color: E.muted,
        fontSize: 10,
        marginTop: 1
      }
    }, "\uD83D\uDC64 ", disc.prof, disc.tel ? " \xB7 ".concat(disc.tel.includes('@') ? '📧' : '📞', " ").concat(disc.tel) : '')), /*#__PURE__*/React.createElement("span", {
      style: {
        color: E.purple,
        fontSize: 16
      }
    }, isEdit ? '⌄' : '›')), isEdit && /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "1px solid ".concat(E.border),
        padding: '10px 14px'
      }
    }, !aula.livre && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: E.muted,
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 3
      }
    }, "In\xEDcio"), /*#__PURE__*/React.createElement("input", {
      type: "time",
      value: aula.hi,
      onChange: function onChange(e) {
        return setAluno(function (al) {
          var h = _objectSpread({}, al.horario);
          var d = _toConsumableArray(h[dayIdx]);
          d[i] = _objectSpread(_objectSpread({}, d[i]), {}, {
            hi: e.target.value
          });
          return _objectSpread(_objectSpread({}, al), {}, {
            horario: _objectSpread(_objectSpread({}, h), {}, _defineProperty({}, dayIdx, d))
          });
        });
      },
      style: {
        width: '100%',
        background: E.surface2,
        border: "1px solid ".concat(E.border),
        borderRadius: 9,
        padding: '7px 8px',
        color: E.text,
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
        color: E.muted,
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 3
      }
    }, "Fim"), /*#__PURE__*/React.createElement("input", {
      type: "time",
      value: aula.hf,
      onChange: function onChange(e) {
        return setAluno(function (al) {
          var h = _objectSpread({}, al.horario);
          var d = _toConsumableArray(h[dayIdx]);
          d[i] = _objectSpread(_objectSpread({}, d[i]), {}, {
            hf: e.target.value
          });
          return _objectSpread(_objectSpread({}, al), {}, {
            horario: _objectSpread(_objectSpread({}, h), {}, _defineProperty({}, dayIdx, d))
          });
        });
      },
      style: {
        width: '100%',
        background: E.surface2,
        border: "1px solid ".concat(E.border),
        borderRadius: 9,
        padding: '7px 8px',
        color: E.text,
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
        color: E.muted,
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 3
      }
    }, "Sala"), /*#__PURE__*/React.createElement("input", {
      value: aula.sala,
      onChange: function onChange(e) {
        return setAluno(function (al) {
          var h = _objectSpread({}, al.horario);
          var d = _toConsumableArray(h[dayIdx]);
          d[i] = _objectSpread(_objectSpread({}, d[i]), {}, {
            sala: e.target.value
          });
          return _objectSpread(_objectSpread({}, al), {}, {
            horario: _objectSpread(_objectSpread({}, h), {}, _defineProperty({}, dayIdx, d))
          });
        });
      },
      style: {
        width: '100%',
        background: E.surface2,
        border: "1px solid ".concat(E.border),
        borderRadius: 9,
        padding: '7px 8px',
        color: E.text,
        fontSize: 13,
        outline: 'none',
        boxSizing: 'border-box'
      }
    }))), !aula.livre && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: E.muted,
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 4
      }
    }, "Disciplina"), /*#__PURE__*/React.createElement("select", {
      value: aula.discId,
      onChange: function onChange(e) {
        return setAluno(function (al) {
          var h = _objectSpread({}, al.horario);
          var d = _toConsumableArray(h[dayIdx]);
          d[i] = _objectSpread(_objectSpread({}, d[i]), {}, {
            discId: parseInt(e.target.value)
          });
          return _objectSpread(_objectSpread({}, al), {}, {
            horario: _objectSpread(_objectSpread({}, h), {}, _defineProperty({}, dayIdx, d))
          });
        });
      },
      style: {
        width: '100%',
        background: E.surface2,
        border: "1px solid ".concat(E.border),
        borderRadius: 9,
        padding: '8px 10px',
        color: E.text,
        fontSize: 13,
        outline: 'none'
      }
    }, aluno.disciplinas.map(function (d) {
      return /*#__PURE__*/React.createElement("option", {
        key: d.id,
        value: d.id
      }, d.emoji, " ", d.nome);
    }))), !aula.livre && /*#__PURE__*/React.createElement("div", {
      style: {
        background: E.surface2,
        borderRadius: 10,
        padding: '10px',
        marginBottom: 8,
        border: "1px solid ".concat(disc.cor, "33")
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: disc.cor,
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 6
      }
    }, "\uD83D\uDC64 ", disc.nome, " \u2014 Contacto"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: E.muted,
        fontSize: 9,
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 2
      }
    }, "Professor"), /*#__PURE__*/React.createElement("input", {
      defaultValue: disc.prof || '',
      id: "prof-".concat(alunoKey, "-").concat(dayIdx, "-").concat(i),
      autoComplete: "off",
      placeholder: "Herr/Frau...",
      style: {
        width: '100%',
        background: E.surface,
        border: "1px solid ".concat(E.border),
        borderRadius: 8,
        padding: '6px 9px',
        color: E.text,
        fontSize: 12,
        outline: 'none',
        boxSizing: 'border-box'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: E.muted,
        fontSize: 9,
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 2
      }
    }, "Tel / Email"), /*#__PURE__*/React.createElement("input", {
      defaultValue: disc.tel || '',
      id: "tel-".concat(alunoKey, "-").concat(dayIdx, "-").concat(i),
      autoComplete: "off",
      placeholder: "032... ou @...",
      style: {
        width: '100%',
        background: E.surface,
        border: "1px solid ".concat(E.border),
        borderRadius: 8,
        padding: '6px 9px',
        color: E.text,
        fontSize: 12,
        outline: 'none',
        boxSizing: 'border-box'
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        var _document$getElementB9, _document$getElementB0;
        var prof = ((_document$getElementB9 = document.getElementById("prof-".concat(alunoKey, "-").concat(dayIdx, "-").concat(i))) === null || _document$getElementB9 === void 0 ? void 0 : _document$getElementB9.value) || '';
        var tel = ((_document$getElementB0 = document.getElementById("tel-".concat(alunoKey, "-").concat(dayIdx, "-").concat(i))) === null || _document$getElementB0 === void 0 ? void 0 : _document$getElementB0.value) || '';
        setAluno(function (al) {
          return _objectSpread(_objectSpread({}, al), {}, {
            disciplinas: al.disciplinas.map(function (d) {
              return d.id === aula.discId ? _objectSpread(_objectSpread({}, d), {}, {
                prof: prof,
                tel: tel
              }) : d;
            })
          });
        });
      },
      style: {
        width: '100%',
        background: "".concat(disc.cor, "22"),
        border: "1px solid ".concat(disc.cor, "44"),
        borderRadius: 8,
        padding: '6px',
        color: disc.cor,
        fontSize: 11,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, "\u2713 Guardar professor")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setAluno(function (al) {
          var h = _objectSpread({}, al.horario);
          var d = _toConsumableArray(h[dayIdx]);
          d[i] = _objectSpread(_objectSpread({}, d[i]), {}, {
            livre: !d[i].livre
          });
          return _objectSpread(_objectSpread({}, al), {}, {
            horario: _objectSpread(_objectSpread({}, h), {}, _defineProperty({}, dayIdx, d))
          });
        });
      },
      style: {
        flex: 1,
        background: aula.livre ? "".concat(E.purple, "22") : 'rgba(68,68,68,0.15)',
        border: "1px solid ".concat(aula.livre ? E.purple : '#444'),
        borderRadius: 10,
        padding: '8px',
        color: aula.livre ? E.purple : E.muted,
        fontSize: 11,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, aula.livre ? '🔔 Pôr aula' : '⏸ Livre'), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setAluno(function (al) {
          var h = _objectSpread({}, al.horario);
          var d = _toConsumableArray(h[dayIdx]);
          d.splice(i, 1);
          return _objectSpread(_objectSpread({}, al), {}, {
            horario: _objectSpread(_objectSpread({}, h), {}, _defineProperty({}, dayIdx, d))
          });
        });
      },
      style: {
        background: 'rgba(220,38,38,0.1)',
        border: '1px solid rgba(220,38,38,0.2)',
        borderRadius: 10,
        padding: '8px 10px',
        color: '#DC2626',
        fontSize: 12,
        cursor: 'pointer',
        fontWeight: 700
      }
    }, "\uD83D\uDDD1"))));
  }), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowAddAula(function (v) {
        return !v;
      });
    },
    style: {
      width: '100%',
      background: 'none',
      border: "1px dashed ".concat(E.purple, "55"),
      borderRadius: 13,
      padding: '11px',
      color: E.purple,
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer',
      marginTop: 4,
      marginBottom: 10
    }
  }, showAddAula ? '✕ Fechar' : '＋ Adicionar aula'), showAddAula && /*#__PURE__*/React.createElement(ECard, {
    style: {
      padding: '14px',
      marginBottom: 10,
      border: "1px solid ".concat(E.purple)
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: E.purple,
      fontWeight: 800,
      fontSize: 13,
      marginBottom: 10
    }
  }, "Nova aula \u2014 ", dias[dayIdx]), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: E.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 3
    }
  }, "In\xEDcio"), /*#__PURE__*/React.createElement("input", {
    type: "time",
    value: novaAula.hi,
    onChange: function onChange(e) {
      return setNovaAula(function (p) {
        return _objectSpread(_objectSpread({}, p), {}, {
          hi: e.target.value
        });
      });
    },
    style: {
      width: '100%',
      background: E.surface2,
      border: "1px solid ".concat(E.border),
      borderRadius: 9,
      padding: '7px 8px',
      color: E.text,
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
      color: E.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 3
    }
  }, "Fim"), /*#__PURE__*/React.createElement("input", {
    type: "time",
    value: novaAula.hf,
    onChange: function onChange(e) {
      return setNovaAula(function (p) {
        return _objectSpread(_objectSpread({}, p), {}, {
          hf: e.target.value
        });
      });
    },
    style: {
      width: '100%',
      background: E.surface2,
      border: "1px solid ".concat(E.border),
      borderRadius: 9,
      padding: '7px 8px',
      color: E.text,
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
      color: E.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 3
    }
  }, "Sala"), /*#__PURE__*/React.createElement("input", {
    value: novaAula.sala,
    onChange: function onChange(e) {
      return setNovaAula(function (p) {
        return _objectSpread(_objectSpread({}, p), {}, {
          sala: e.target.value
        });
      });
    },
    placeholder: "Ex: 213",
    style: {
      width: '100%',
      background: E.surface2,
      border: "1px solid ".concat(E.border),
      borderRadius: 9,
      padding: '7px 8px',
      color: E.text,
      fontSize: 13,
      outline: 'none',
      boxSizing: 'border-box'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: E.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 4
    }
  }, "Disciplina"), /*#__PURE__*/React.createElement("select", {
    value: novaAula.livre ? 'livre' : novaAula.discId,
    onChange: function onChange(e) {
      var v = e.target.value;
      return setNovaAula(function (p) {
        return v === 'livre' ? _objectSpread(_objectSpread({}, p), {}, {
          livre: true
        }) : _objectSpread(_objectSpread({}, p), {}, {
          livre: false,
          discId: parseInt(v)
        });
      });
    },
    style: {
      width: '100%',
      background: E.surface2,
      border: "1px solid ".concat(E.border),
      borderRadius: 9,
      padding: '8px 10px',
      color: E.text,
      fontSize: 13,
      outline: 'none'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "livre"
  }, "\u23F8 Hora livre"), aluno.disciplinas.map(function (d) {
    return /*#__PURE__*/React.createElement("option", {
      key: d.id,
      value: d.id
    }, d.emoji, " ", d.nome);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setShowAddAula(false);
    },
    style: {
      flex: 1,
      background: E.surface2,
      border: "1px solid ".concat(E.border),
      borderRadius: 10,
      padding: '10px',
      color: E.muted,
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      if (!novaAula.hi || !novaAula.hf) return;
      setAluno(function (al) {
        var h = _objectSpread({}, al.horario);
        var d = _toConsumableArray(h[dayIdx] || []);
        d.push(_objectSpread({}, novaAula));
        d.sort(function (a, b) {
          return a.hi.localeCompare(b.hi);
        });
        return _objectSpread(_objectSpread({}, al), {}, {
          horario: _objectSpread(_objectSpread({}, h), {}, _defineProperty({}, dayIdx, d))
        });
      });
      setNovaAula({
        discId: aluno.disciplinas[0] && aluno.disciplinas[0].id || 1,
        hi: '',
        hf: '',
        sala: '',
        livre: false
      });
      setShowAddAula(false);
    },
    style: {
      flex: 2,
      background: "linear-gradient(135deg,".concat(E.purple, ",").concat(E.purpleL, ")"),
      border: 'none',
      borderRadius: 10,
      padding: '10px',
      color: '#fff',
      fontSize: 13,
      fontWeight: 800,
      cursor: 'pointer'
    }
  }, "\u2713 Guardar"))), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowAddDisc(function (v) {
        return !v;
      });
    },
    style: {
      width: '100%',
      background: 'none',
      border: "1px dashed ".concat(E.purple, "55"),
      borderRadius: 13,
      padding: '11px',
      color: E.purple,
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer',
      marginTop: 4
    }
  }, showAddDisc ? '✕ Fechar' : '＋ Gerir disciplinas'), showAddDisc && /*#__PURE__*/React.createElement(ECard, {
    style: {
      marginTop: 10,
      padding: '14px',
      border: "1px solid ".concat(E.purple)
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: E.purple,
      fontWeight: 800,
      fontSize: 12,
      marginBottom: 8
    }
  }, "Disciplinas existentes"), aluno.disciplinas.map(function (d) {
    var isEd = editDiscId === d.id;
    return /*#__PURE__*/React.createElement("div", {
      key: d.id,
      style: {
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 10px',
        background: E.surface2,
        borderRadius: 10,
        border: isEd ? "1px solid ".concat(d.cor) : "1px solid transparent"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: d.cor,
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14
      }
    }, d.emoji), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontSize: 12,
        fontWeight: 700,
        color: E.text
      }
    }, d.nome), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: E.muted
      }
    }, d.abr), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setEditDiscId(isEd ? null : d.id);
      },
      style: {
        background: isEd ? "".concat(d.cor, "22") : 'none',
        border: "1px solid ".concat(isEd ? d.cor : E.border),
        borderRadius: 7,
        padding: '4px 8px',
        color: isEd ? d.cor : E.muted,
        fontSize: 11,
        cursor: 'pointer'
      }
    }, isEd ? '✕' : '✏️')), isEd && /*#__PURE__*/React.createElement("div", {
      style: {
        background: E.surface,
        border: "1px solid ".concat(d.cor, "44"),
        borderRadius: 10,
        padding: '10px',
        marginTop: 4
      }
    }, [{
      l: 'Nome',
      k: 'nome',
      ph: 'Ex: Physik'
    }, {
      l: 'Abrev.',
      k: 'abr',
      ph: 'Ex: Ph'
    }, {
      l: 'Professor',
      k: 'prof',
      ph: 'Herr Müller'
    }, {
      l: 'Tel/Email',
      k: 'tel',
      ph: '032...'
    }].map(function (f) {
      return /*#__PURE__*/React.createElement("div", {
        key: f.k,
        style: {
          marginBottom: 6
        }
      }, /*#__PURE__*/React.createElement("p", {
        style: {
          color: E.muted,
          fontSize: 9,
          fontWeight: 700,
          textTransform: 'uppercase',
          marginBottom: 2
        }
      }, f.l), /*#__PURE__*/React.createElement("input", {
        defaultValue: d[f.k] || '',
        id: "disc-".concat(d.id, "-").concat(f.k),
        autoComplete: "off",
        placeholder: f.ph,
        style: {
          width: '100%',
          background: E.surface2,
          border: "1px solid ".concat(E.border),
          borderRadius: 8,
          padding: '6px 9px',
          color: E.text,
          fontSize: 12,
          outline: 'none',
          boxSizing: 'border-box'
        }
      }));
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        marginBottom: 8,
        flexWrap: 'wrap'
      }
    }, ['📝', '📐', '⚽', '🌍', '🌿', '⚗️', '🏛', '🗺', '🔧', '🎨', '🎵', '💻', '🏺', '📚', '🔬', '🎭', '✏️', '🧪'].map(function (e) {
      return /*#__PURE__*/React.createElement("button", {
        key: e,
        onClick: function onClick() {
          return setAluno(function (al) {
            return _objectSpread(_objectSpread({}, al), {}, {
              disciplinas: al.disciplinas.map(function (x) {
                return x.id === d.id ? _objectSpread(_objectSpread({}, x), {}, {
                  emoji: e
                }) : x;
              })
            });
          });
        },
        style: {
          background: d.emoji === e ? "".concat(d.cor, "22") : 'transparent',
          border: "1px solid ".concat(d.emoji === e ? d.cor : 'transparent'),
          borderRadius: 6,
          padding: '3px',
          fontSize: 16,
          cursor: 'pointer'
        }
      }, e);
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        marginBottom: 8,
        flexWrap: 'wrap'
      }
    }, DISC_CORES.map(function (c) {
      return /*#__PURE__*/React.createElement("div", {
        key: c,
        onClick: function onClick() {
          return setAluno(function (al) {
            return _objectSpread(_objectSpread({}, al), {}, {
              disciplinas: al.disciplinas.map(function (x) {
                return x.id === d.id ? _objectSpread(_objectSpread({}, x), {}, {
                  cor: c
                }) : x;
              })
            });
          });
        },
        style: {
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: c,
          cursor: 'pointer',
          border: d.cor === c ? '3px solid #fff' : '3px solid transparent'
        }
      });
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        var get = function get(k) {
          var _document$getElementB1;
          return ((_document$getElementB1 = document.getElementById("disc-".concat(d.id, "-").concat(k))) === null || _document$getElementB1 === void 0 ? void 0 : _document$getElementB1.value) || '';
        };
        setAluno(function (al) {
          return _objectSpread(_objectSpread({}, al), {}, {
            disciplinas: al.disciplinas.map(function (x) {
              return x.id === d.id ? _objectSpread(_objectSpread({}, x), {}, {
                nome: get('nome') || x.nome,
                abr: get('abr') || x.abr,
                prof: get('prof'),
                tel: get('tel')
              }) : x;
            })
          });
        });
        setEditDiscId(null);
      },
      style: {
        flex: 2,
        background: "linear-gradient(135deg,".concat(d.cor, ",").concat(d.cor, "cc)"),
        border: 'none',
        borderRadius: 9,
        padding: '8px',
        color: '#fff',
        fontSize: 12,
        fontWeight: 800,
        cursor: 'pointer'
      }
    }, "\u2713 Guardar"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setAluno(function (al) {
          return _objectSpread(_objectSpread({}, al), {}, {
            disciplinas: al.disciplinas.filter(function (x) {
              return x.id !== d.id;
            })
          });
        });
        setEditDiscId(null);
      },
      style: {
        background: 'rgba(220,38,38,0.1)',
        border: '1px solid rgba(220,38,38,0.2)',
        borderRadius: 9,
        padding: '8px 10px',
        color: '#DC2626',
        fontSize: 12,
        cursor: 'pointer'
      }
    }, "\uD83D\uDDD1"))));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: E.border,
      margin: '10px 0'
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      color: E.purple,
      fontWeight: 800,
      fontSize: 12,
      marginBottom: 8
    }
  }, "Adicionar nova"), [{
    l: 'Nome',
    k: 'nome',
    ph: 'Ex: Physik'
  }, {
    l: 'Professor',
    k: 'prof',
    ph: 'Ex: Herr Müller'
  }, {
    l: 'Tel. / Email',
    k: 'tel',
    ph: '032... ou prof@schule.ch'
  }].map(function (f) {
    return /*#__PURE__*/React.createElement("div", {
      key: f.k,
      style: {
        marginBottom: 7
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: E.muted,
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 3
      }
    }, f.l), /*#__PURE__*/React.createElement("input", {
      value: novaDisc[f.k],
      onChange: function onChange(e) {
        return setNovaDisc(function (p) {
          return _objectSpread(_objectSpread({}, p), {}, _defineProperty({}, f.k, e.target.value));
        });
      },
      placeholder: f.ph,
      style: {
        width: '100%',
        background: E.surface2,
        border: "1px solid ".concat(E.border),
        borderRadius: 9,
        padding: '8px 11px',
        color: E.text,
        fontSize: 13,
        outline: 'none',
        boxSizing: 'border-box'
      }
    }));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 5,
      marginBottom: 10,
      flexWrap: 'wrap'
    }
  }, DISC_CORES.map(function (c) {
    return /*#__PURE__*/React.createElement("div", {
      key: c,
      onClick: function onClick() {
        return setNovaDisc(function (p) {
          return _objectSpread(_objectSpread({}, p), {}, {
            cor: c
          });
        });
      },
      style: {
        width: 26,
        height: 26,
        borderRadius: '50%',
        background: c,
        cursor: 'pointer',
        border: novaDisc.cor === c ? '3px solid #fff' : '3px solid transparent'
      }
    });
  })), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      if (!novaDisc.nome.trim()) return;
      var id = Date.now();
      setAluno(function (al) {
        return _objectSpread(_objectSpread({}, al), {}, {
          disciplinas: [].concat(_toConsumableArray(al.disciplinas), [_objectSpread(_objectSpread({
            id: id
          }, novaDisc), {}, {
            abr: novaDisc.nome.slice(0, 3)
          })])
        });
      });
      setNovaDisc({
        nome: '',
        prof: '',
        tel: '',
        emoji: '📚',
        cor: '#7C3AED'
      });
    },
    style: {
      width: '100%',
      background: "linear-gradient(135deg,".concat(E.purple, ",").concat(E.purpleL, ")"),
      border: 'none',
      borderRadius: 11,
      padding: '10px',
      color: '#fff',
      fontSize: 13,
      fontWeight: 800,
      cursor: 'pointer'
    }
  }, "\u2713 Adicionar disciplina")))), tab === 'cal' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 14px'
    }
  }, /*#__PURE__*/React.createElement(ECard, {
    style: {
      padding: '14px',
      marginBottom: 12
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
      return setCalMonth(function (m) {
        var d = new Date(m);
        d.setMonth(d.getMonth() - 1);
        return d;
      });
    },
    style: {
      background: E.surface2,
      border: "1px solid ".concat(E.border),
      borderRadius: 9,
      width: 32,
      height: 32,
      color: E.purple,
      fontSize: 18,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, "\u2039"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontWeight: 800,
      fontSize: 15,
      color: E.text
    }
  }, calMonth.toLocaleDateString('pt-PT', {
    month: 'long',
    year: 'numeric'
  }).replace(/^\w/, function (c) {
    return c.toUpperCase();
  })), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setCalMonth(function (m) {
        var d = new Date(m);
        d.setMonth(d.getMonth() + 1);
        return d;
      });
    },
    style: {
      background: E.surface2,
      border: "1px solid ".concat(E.border),
      borderRadius: 9,
      width: 32,
      height: 32,
      color: E.purple,
      fontSize: 18,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, "\u203A")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7,1fr)',
      gap: 2,
      marginBottom: 5
    }
  }, ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map(function (d, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        textAlign: 'center',
        fontSize: 10,
        fontWeight: 700,
        color: E.muted,
        padding: '2px 0'
      }
    }, d);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7,1fr)',
      gap: 2
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
    var d = i + 1;
    var tpcs = getDayTPC(d);
    var shared = getDayShared(d);
    var isToday = "".concat(yr, "-").concat(String(mo + 1).padStart(2, '0'), "-").concat(String(d).padStart(2, '0')) === '2026-06-15';
    var isSel = selDay === d;
    var hasTPC = tpcs.length > 0;
    var hasShared = shared.length > 0;
    return /*#__PURE__*/React.createElement("div", {
      key: d,
      onClick: function onClick() {
        return setSelDay(isSel ? null : d);
      },
      style: {
        textAlign: 'center',
        padding: '4px 1px',
        borderRadius: 8,
        cursor: 'pointer',
        background: isSel ? E.purple : isToday ? "".concat(E.purple, "30") : 'transparent',
        border: hasTPC ? "1px solid ".concat(E.orange, "44") : hasShared ? "1px solid ".concat(E.gold, "33") : '1px solid transparent',
        minHeight: 36,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: isSel || isToday ? 800 : 400,
        color: isSel ? '#fff' : isToday ? E.purple : E.text
      }
    }, d), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 1
      }
    }, hasTPC && /*#__PURE__*/React.createElement("div", {
      style: {
        width: 4,
        height: 4,
        borderRadius: '50%',
        background: isSel ? '#fff' : E.orange
      }
    }), hasShared && /*#__PURE__*/React.createElement("div", {
      style: {
        width: 4,
        height: 4,
        borderRadius: '50%',
        background: isSel ? '#fff' : E.gold
      }
    })));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      marginBottom: 10,
      padding: '8px 12px',
      background: E.surface,
      borderRadius: 10,
      border: "1px solid ".concat(E.border)
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: E.orange
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: E.muted
    }
  }, "TPC")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: E.gold
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: E.muted
    }
  }, "Dia livre"))), selDay && function () {
    var tpcs = getDayTPC(selDay);
    var shared = getDayShared(selDay);
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
      style: {
        color: E.muted,
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        marginBottom: 8
      }
    }, selDay, " ", calMonth.toLocaleDateString('pt-PT', {
      month: 'long'
    })), tpcs.map(function (t, i) {
      var d = getDisc(t.discId);
      return /*#__PURE__*/React.createElement(ECard, {
        key: i,
        style: {
          padding: '12px 14px',
          marginBottom: 8,
          borderLeft: "3px solid ".concat(d.cor),
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 18
        }
      }, d.emoji), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1
        }
      }, /*#__PURE__*/React.createElement("p", {
        style: {
          fontWeight: 700,
          fontSize: 13,
          color: E.text
        }
      }, t.titulo), /*#__PURE__*/React.createElement("p", {
        style: {
          color: E.muted,
          fontSize: 11,
          marginTop: 1
        }
      }, d.nome)), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return setAluno(function (al) {
            return _objectSpread(_objectSpread({}, al), {}, {
              tpc: al.tpc.map(function (x) {
                return x.id === t.id ? _objectSpread(_objectSpread({}, x), {}, {
                  feito: !x.feito
                }) : x;
              })
            });
          });
        },
        style: {
          background: t.feito ? 'rgba(22,163,74,0.15)' : 'transparent',
          border: "1px solid ".concat(t.feito ? E.green : E.border),
          borderRadius: 8,
          padding: '5px 8px',
          color: t.feito ? E.green : E.muted,
          fontSize: 12,
          cursor: 'pointer',
          fontWeight: 700
        }
      }, t.feito ? '✓ Feito' : 'Fazer'));
    }), shared.map(function (s, i) {
      return /*#__PURE__*/React.createElement(ECard, {
        key: 's' + i,
        style: {
          padding: '10px 14px',
          marginBottom: 8,
          borderLeft: "3px solid ".concat(E.gold),
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 18
        }
      }, s.tipo === 'feriado' ? '🎌' : s.tipo === 'ferias' ? '🏖' : '✅'), /*#__PURE__*/React.createElement("p", {
        style: {
          fontWeight: 700,
          fontSize: 13,
          color: E.text
        }
      }, s.tipo === 'feriado' ? 'Feriado' : s.tipo === 'ferias' ? 'Férias' : 'Dia livre'));
    }), tpcs.length === 0 && shared.length === 0 && /*#__PURE__*/React.createElement("p", {
      style: {
        color: E.muted,
        fontSize: 13,
        textAlign: 'center',
        padding: '16px'
      }
    }, "Sem eventos neste dia"));
  }()), tab === 'tpc' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 14px'
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
      color: E.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.6px'
    }
  }, tpcPendentes, " pendente(s) \xB7 ", aluno.tpc.filter(function (t) {
    return t.feito;
  }).length, " feito(s)"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowAddTPC(function (v) {
        return !v;
      });
    },
    style: {
      background: "linear-gradient(135deg,".concat(E.purple, ",").concat(E.purpleL, ")"),
      border: 'none',
      borderRadius: 10,
      padding: '6px 14px',
      color: '#fff',
      fontSize: 12,
      fontWeight: 800,
      cursor: 'pointer'
    }
  }, "\uFF0B TPC")), showAddTPC && /*#__PURE__*/React.createElement(ECard, {
    style: {
      padding: '14px',
      marginBottom: 12,
      border: "1px solid ".concat(E.purple)
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: E.purple,
      fontWeight: 800,
      fontSize: 13,
      marginBottom: 10
    }
  }, "Novo trabalho de casa"), /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', gap: 6, marginBottom: 10 }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setNovaTPC(function (p) {
        return _objectSpread(_objectSpread({}, p), {}, { tipo: 'tpc' });
      });
    },
    style: {
      flex: 1,
      background: novaTPC.tipo === 'tpc' ? "".concat(E.purple, "18") : E.surface2,
      border: "1px solid ".concat(novaTPC.tipo === 'tpc' ? E.purple : E.border),
      borderRadius: 10,
      padding: '8px',
      color: novaTPC.tipo === 'tpc' ? E.purple : E.muted,
      fontSize: 12,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "\uD83D\uDCDD TPC"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setNovaTPC(function (p) {
        return _objectSpread(_objectSpread({}, p), {}, { tipo: 'teste' });
      });
    },
    style: {
      flex: 1,
      background: novaTPC.tipo === 'teste' ? "".concat(E.purple, "18") : E.surface2,
      border: "1px solid ".concat(novaTPC.tipo === 'teste' ? E.purple : E.border),
      borderRadius: 10,
      padding: '8px',
      color: novaTPC.tipo === 'teste' ? E.purple : E.muted,
      fontSize: 12,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "\uD83D\uDCDA Teste/Exame")), novaTPC.tipo === 'teste' && /*#__PURE__*/React.createElement("p", {
    style: { fontSize: 10, color: E.muted, marginBottom: 10 }
  }, "Vai aparecer automaticamente na Carvalho Work"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: E.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 4
    }
  }, "Disciplina"), /*#__PURE__*/React.createElement("select", {
    value: novaTPC.discId,
    onChange: function onChange(e) {
      return setNovaTPC(function (p) {
        return _objectSpread(_objectSpread({}, p), {}, {
          discId: parseInt(e.target.value)
        });
      });
    },
    style: {
      width: '100%',
      background: E.surface2,
      border: "1px solid ".concat(E.border),
      borderRadius: 9,
      padding: '9px 11px',
      color: E.text,
      fontSize: 13,
      outline: 'none',
      marginBottom: 8
    }
  }, aluno.disciplinas.map(function (d) {
    return /*#__PURE__*/React.createElement("option", {
      key: d.id,
      value: d.id
    }, d.emoji, " ", d.nome);
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      color: E.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 4
    }
  }, "Descri\xE7\xE3o"), /*#__PURE__*/React.createElement("input", {
    value: novaTPC.titulo,
    onChange: function onChange(e) {
      return setNovaTPC(function (p) {
        return _objectSpread(_objectSpread({}, p), {}, {
          titulo: e.target.value
        });
      });
    },
    placeholder: "Ex: Seite 42-44",
    style: {
      width: '100%',
      background: E.surface2,
      border: "1px solid ".concat(E.border),
      borderRadius: 9,
      padding: '9px 11px',
      color: E.text,
      fontSize: 13,
      outline: 'none',
      marginBottom: 8,
      boxSizing: 'border-box'
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      color: E.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 4
    }
  }, "Para quando"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: novaTPC.data,
    onChange: function onChange(e) {
      return setNovaTPC(function (p) {
        return _objectSpread(_objectSpread({}, p), {}, {
          data: e.target.value
        });
      });
    },
    style: {
      width: '100%',
      background: E.surface2,
      border: "1px solid ".concat(E.border),
      borderRadius: 9,
      padding: '9px 11px',
      color: E.text,
      fontSize: 13,
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
      return setShowAddTPC(false);
    },
    style: {
      flex: 1,
      background: E.surface2,
      border: "1px solid ".concat(E.border),
      borderRadius: 10,
      padding: '10px',
      color: E.muted,
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      var _aluno$disciplinas$;
      if (!novaTPC.titulo.trim() || !novaTPC.data) return;
      var novoId = Date.now();
      setAluno(function (al) {
        return _objectSpread(_objectSpread({}, al), {}, {
          tpc: [].concat(_toConsumableArray(al.tpc), [_objectSpread({
            id: novoId
          }, novaTPC)])
        });
      });
      if (novaTPC.tipo === 'teste' && window.supabaseClient) {
        var disc = aluno.disciplinas.find(function (d) {
          return d.id === novaTPC.discId;
        });
        var tituloTeste = '📚 Teste: ' + ((disc === null || disc === void 0 ? void 0 : disc.nome) || 'Escola') + (novaTPC.titulo ? ' — ' + novaTPC.titulo : '');
        window.supabaseClient.from('agenda_pro_jobs').insert({
          job_date: novaTPC.data,
          start_time: null,
          end_time: null,
          project: tituloTeste,
          address: null,
          monteur: aluno.nome,
          chf: 0,
          status: 'aberto',
          note: 'Criado automaticamente pela Carvalho Schule',
          source: 'escolar',
          source_id: novoId,
          categoria: 'escola'
        }).then(function () {}).catch(function () {});
        window.supabaseClient.from('family_events').insert({
          title: tituloTeste,
          emoji: '📚',
          event_date: novaTPC.data,
          event_time: null,
          description: aluno.nome + ' tem teste',
          color: '#A855F7',
          categoria: 'escola',
          participant_ids: ['todos'],
          member_id: null,
          source: 'escolar',
          source_id: novoId,
          created_by: aluno.nome
        }).then(function () {}).catch(function () {});
      }
      setNovaTPC({
        discId: ((_aluno$disciplinas$ = aluno.disciplinas[0]) === null || _aluno$disciplinas$ === void 0 ? void 0 : _aluno$disciplinas$.id) || 1,
        titulo: '',
        data: '',
        feito: false,
        tipo: 'tpc'
      });
      setShowAddTPC(false);
    },
    style: {
      flex: 2,
      background: "linear-gradient(135deg,".concat(E.purple, ",").concat(E.purpleL, ")"),
      border: 'none',
      borderRadius: 10,
      padding: '10px',
      color: '#fff',
      fontSize: 13,
      fontWeight: 800,
      cursor: 'pointer'
    }
  }, "\u2713 Guardar"))), aluno.tpc.filter(function (t) {
    return !t.feito;
  }).map(function (t) {
    var d = getDisc(t.discId);
    var overdue = t.data && t.data < '2026-06-15';
    var isEdTpc = editTpcId === t.id;
    return /*#__PURE__*/React.createElement(ECard, {
      key: t.id,
      style: {
        marginBottom: 8,
        borderLeft: "3px solid ".concat(overdue ? E.red : d.cor)
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20
      }
    }, d.emoji), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontWeight: 700,
        fontSize: 14,
        color: E.text
      }
    }, t.titulo), /*#__PURE__*/React.createElement("p", {
      style: {
        color: E.muted,
        fontSize: 11,
        marginTop: 1
      }
    }, d.nome, t.data ? " \xB7 \uD83D\uDCC5 ".concat(t.data) : ''), overdue && /*#__PURE__*/React.createElement("p", {
      style: {
        color: E.red,
        fontSize: 10,
        fontWeight: 700,
        marginTop: 2
      }
    }, "\u26A0 Em atraso!")), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setAluno(function (al) {
          return _objectSpread(_objectSpread({}, al), {}, {
            tpc: al.tpc.map(function (x) {
              return x.id === t.id ? _objectSpread(_objectSpread({}, x), {}, {
                feito: true
              }) : x;
            })
          });
        });
      },
      style: {
        background: "".concat(E.purple, "22"),
        border: "1px solid ".concat(E.purple, "44"),
        borderRadius: 10,
        padding: '7px 12px',
        color: E.purple,
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, "Feito \u2713"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setEditTpcId(isEdTpc ? null : t.id);
      },
      style: {
        background: isEdTpc ? "".concat(E.purple, "22") : 'none',
        border: "1px solid ".concat(isEdTpc ? E.purple : E.border),
        borderRadius: 8,
        padding: '6px 8px',
        color: isEdTpc ? E.purple : E.muted,
        fontSize: 12,
        cursor: 'pointer'
      }
    }, isEdTpc ? '✕' : '✏️'), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setAluno(function (al) {
          return _objectSpread(_objectSpread({}, al), {}, {
            tpc: al.tpc.filter(function (x) {
              return x.id !== t.id;
            })
          });
        });
        setEditTpcId(null);
      },
      style: {
        background: 'rgba(220,38,38,0.1)',
        border: '1px solid rgba(220,38,38,0.2)',
        borderRadius: 8,
        padding: '6px 9px',
        color: '#DC2626',
        fontSize: 12,
        cursor: 'pointer'
      }
    }, "\uD83D\uDDD1")), isEdTpc && /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "1px solid ".concat(E.border),
        padding: '10px 14px'
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: E.muted,
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 4
      }
    }, "Disciplina"), /*#__PURE__*/React.createElement("select", {
      defaultValue: t.discId,
      id: "tpc-disc-".concat(t.id),
      style: {
        width: '100%',
        background: E.surface2,
        border: "1px solid ".concat(E.border),
        borderRadius: 9,
        padding: '8px 10px',
        color: E.text,
        fontSize: 13,
        outline: 'none',
        marginBottom: 8
      }
    }, aluno.disciplinas.map(function (dd) {
      return /*#__PURE__*/React.createElement("option", {
        key: dd.id,
        value: dd.id
      }, dd.emoji, " ", dd.nome);
    })), /*#__PURE__*/React.createElement("p", {
      style: {
        color: E.muted,
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 4
      }
    }, "Descri\xE7\xE3o"), /*#__PURE__*/React.createElement("input", {
      defaultValue: t.titulo,
      id: "tpc-titulo-".concat(t.id),
      autoComplete: "off",
      style: {
        width: '100%',
        background: E.surface2,
        border: "1px solid ".concat(E.border),
        borderRadius: 9,
        padding: '8px 11px',
        color: E.text,
        fontSize: 13,
        outline: 'none',
        marginBottom: 8,
        boxSizing: 'border-box'
      }
    }), /*#__PURE__*/React.createElement("p", {
      style: {
        color: E.muted,
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 4
      }
    }, "Para quando"), /*#__PURE__*/React.createElement("input", {
      type: "date",
      defaultValue: t.data,
      id: "tpc-data-".concat(t.id),
      style: {
        width: '100%',
        background: E.surface2,
        border: "1px solid ".concat(E.border),
        borderRadius: 9,
        padding: '8px 11px',
        color: E.text,
        fontSize: 13,
        outline: 'none',
        marginBottom: 10,
        boxSizing: 'border-box'
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        var _document$getElementBT, _document$getElementBT2, _document$getElementBT3;
        var discId = parseInt(((_document$getElementBT = document.getElementById("tpc-disc-".concat(t.id))) === null || _document$getElementBT === void 0 ? void 0 : _document$getElementBT.value) || t.discId);
        var titulo = ((_document$getElementBT2 = document.getElementById("tpc-titulo-".concat(t.id))) === null || _document$getElementBT2 === void 0 ? void 0 : _document$getElementBT2.value) || t.titulo;
        var data = ((_document$getElementBT3 = document.getElementById("tpc-data-".concat(t.id))) === null || _document$getElementBT3 === void 0 ? void 0 : _document$getElementBT3.value) || t.data;
        setAluno(function (al) {
          return _objectSpread(_objectSpread({}, al), {}, {
            tpc: al.tpc.map(function (x) {
              return x.id === t.id ? _objectSpread(_objectSpread({}, x), {}, {
                discId: discId,
                titulo: titulo,
                data: data
              }) : x;
            })
          });
        });
        setEditTpcId(null);
      },
      style: {
        width: '100%',
        background: "linear-gradient(135deg,".concat(E.purple, ",").concat(E.purpleL, ")"),
        border: 'none',
        borderRadius: 9,
        padding: '9px',
        color: '#fff',
        fontSize: 12,
        fontWeight: 800,
        cursor: 'pointer'
      }
    }, "\u2713 Guardar altera\xE7\xF5es")));
  }), aluno.tpc.some(function (t) {

    return t.feito;
  }) && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: E.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.6px',
      marginBottom: 8
    }
  }, "\u2705 Conclu\xEDdos"), aluno.tpc.filter(function (t) {
    return t.feito;
  }).map(function (t) {
    var d = getDisc(t.discId);
    return /*#__PURE__*/React.createElement(ECard, {
      key: t.id,
      style: {
        marginBottom: 7,
        opacity: 0.6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18
      }
    }, d.emoji), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontWeight: 700,
        fontSize: 13,
        color: E.muted,
        textDecoration: 'line-through'
      }
    }, t.titulo), /*#__PURE__*/React.createElement("p", {
      style: {
        color: E.muted,
        fontSize: 11
      }
    }, d.nome)), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setAluno(function (al) {
          return _objectSpread(_objectSpread({}, al), {}, {
            tpc: al.tpc.filter(function (x) {
              return x.id !== t.id;
            })
          });
        });
      },
      style: {
        background: 'none',
        border: 'none',
        color: E.muted,
        fontSize: 16,
        cursor: 'pointer'
      }
    }, "\uD83D\uDDD1")));
  }))), tab === 'importante' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 14px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: E.muted,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.6px',
      marginBottom: 12
    }
  }, "\uD83D\uDCCC Testes e coisas importantes"), aluno.tpc.filter(function (t) {
    return t.tipo === 'teste';
  }).length === 0 && /*#__PURE__*/React.createElement(ECard, {
    style: { padding: '24px', textAlign: 'center' }
  }, /*#__PURE__*/React.createElement("span", {
    style: { fontSize: 32 }
  }, "\uD83D\uDCCC"), /*#__PURE__*/React.createElement("p", {
    style: { color: E.muted, fontSize: 13, marginTop: 8 }
  }, "Nada importante marcado"), /*#__PURE__*/React.createElement("p", {
    style: { color: E.muted, fontSize: 11, marginTop: 4 }
  }, "Cria um \"Teste/Exame\" no separador TPC e aparece aqui")), aluno.tpc.filter(function (t) {
    return t.tipo === 'teste';
  }).sort(function (a, b) {
    return (a.data || '').localeCompare(b.data || '');
  }).map(function (t) {
    var d = getDisc(t.discId);
    var overdue = t.data && t.data < '2026-06-15' && !t.feito;
    return /*#__PURE__*/React.createElement(ECard, {
      key: t.id,
      style: {
        marginBottom: 8,
        borderLeft: "3px solid ".concat(overdue ? E.red : E.purple),
        opacity: t.feito ? 0.5 : 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: { fontSize: 22 }
    }, "\uD83D\uDCDA"), /*#__PURE__*/React.createElement("div", {
      style: { flex: 1 }
    }, /*#__PURE__*/React.createElement("p", {
      style: { fontWeight: 700, fontSize: 14, color: E.text }
    }, t.titulo || 'Teste'), /*#__PURE__*/React.createElement("p", {
      style: { color: E.muted, fontSize: 11, marginTop: 1 }
    }, d.emoji, " ", d.nome, t.data ? " \xB7 \uD83D\uDCC5 ".concat(t.data) : ''), overdue && /*#__PURE__*/React.createElement("p", {
      style: { color: E.red, fontSize: 10, fontWeight: 700, marginTop: 2 }
    }, "\u26A0 J\xE1 passou")), !t.feito && /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setAluno(function (al) {
          return _objectSpread(_objectSpread({}, al), {}, {
            tpc: al.tpc.map(function (x) {
              return x.id === t.id ? _objectSpread(_objectSpread({}, x), {}, {
                feito: true
              }) : x;
            })
          });
        });
      },
      style: {
        background: "".concat(E.purple, "22"),
        border: "1px solid ".concat(E.purple, "44"),
        borderRadius: 10,
        padding: '7px 12px',
        color: E.purple,
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, "Feito \u2713")));
  })), tab === 'notas' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 12
    }
  }, [1, 2].map(function (s) {
    return /*#__PURE__*/React.createElement("button", {
      key: s,
      onClick: function onClick() {
        return setSemestre(s);
      },
      style: {
        flex: 1,
        background: semestre === s ? "linear-gradient(135deg,".concat(E.purple, ",").concat(E.purpleL, ")") : E.surface,
        border: "1px solid ".concat(semestre === s ? E.purple : E.border),
        borderRadius: 12,
        padding: '9px',
        color: semestre === s ? '#fff' : E.muted,
        fontSize: 13,
        fontWeight: 800,
        cursor: 'pointer'
      }
    }, s, "\xBA Semestre");
  })), function () {
    var mg = calcMediaGeral(semestre);
    if (!mg) return null;
    return /*#__PURE__*/React.createElement(ECard, {
      style: {
        padding: '14px',
        marginBottom: 12,
        border: "2px solid ".concat(E.purple)
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: E.purple,
        fontWeight: 800,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: 8
      }
    }, "\u2B50 M\xE9dia SEK P \u2014 5 mais baixas"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 38,
        fontWeight: 900,
        color: notaColor(mg.durchschnitt)
      }
    }, mg.durchschnitt), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, mg.cincoMaisBaixas.map(function (d, i) {
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 3
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 5
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: d.cor || E.purple
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          color: E.muted
        }
      }, d.nome)), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 12,
          fontWeight: 800,
          color: notaColor(d.m)
        }
      }, d.m.toFixed(1)));
    }))));
  }(), aluno.disciplinas.map(function (disc) {
    var ns = (aluno.notas[disc.id] || {})[semestre] || [];
    var med = media(disc.id, semestre);
    var isAddNota = showAddNota === "".concat(alunoKey, "-").concat(disc.id);
    return /*#__PURE__*/React.createElement(ECard, {
      key: disc.id,
      style: {
        marginBottom: 9,
        borderLeft: "4px solid ".concat(disc.cor)
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 14px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: ns.length || isAddNota ? 10 : 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18
      }
    }, disc.emoji), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontWeight: 800,
        fontSize: 14,
        color: E.text
      }
    }, disc.nome), /*#__PURE__*/React.createElement("p", {
      style: {
        color: E.muted,
        fontSize: 10
      }
    }, disc.prof)), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'right'
      }
    }, med ? /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 22,
        fontWeight: 900,
        color: notaColor(med)
      }
    }, med) : /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 11,
        color: E.muted
      }
    }, "\u2014"))), ns.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        marginBottom: 8
      }
    }, ns.map(function (n, i) {
      var notaKey = "".concat(disc.id, "-").concat(semestre, "-").concat(i);
      var isEditingThis = editNotaKey === notaKey;
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          background: "".concat(notaColor(n), "15"),
          border: "1px solid ".concat(notaColor(n), "44"),
          borderRadius: 9,
          padding: '4px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 5
        }
      }, isEditingThis ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("input", {
        type: "number",
        step: "0.5",
        min: "1",
        max: "6",
        autoFocus: true,
        value: editNotaVal,
        onChange: function onChange(e) {
          return setEditNotaVal(e.target.value);
        },
        style: {
          width: 46,
          background: E.surface,
          border: "1px solid ".concat(notaColor(n)),
          borderRadius: 6,
          padding: '2px 4px',
          color: E.text,
          fontSize: 12,
          outline: 'none'
        }
      }), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          var v = parseFloat(editNotaVal);
          if (isNaN(v) || v < 1 || v > 6) return;
          setAluno(function (al) {
            var _al$notas$disc$id3;
            var copy = _objectSpread(_objectSpread({}, al), {}, {
              notas: _objectSpread(_objectSpread({}, al.notas), {}, _defineProperty({}, disc.id, _objectSpread(_objectSpread({}, al.notas[disc.id] || {}), {}, _defineProperty({}, semestre, _toConsumableArray(((_al$notas$disc$id3 = al.notas[disc.id]) === null || _al$notas$disc$id3 === void 0 ? void 0 : _al$notas$disc$id3[semestre]) || [])))))
            });
            copy.notas[disc.id][semestre][i] = v;
            return copy;
          });
          setEditNotaKey(null);
        },
        style: {
          background: 'none',
          border: 'none',
          color: E.green,
          fontSize: 14,
          fontWeight: 900,
          cursor: 'pointer',
          padding: 0
        }
      }, "\u2713"), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return setEditNotaKey(null);
        },
        style: {
          background: 'none',
          border: 'none',
          color: E.muted,
          fontSize: 11,
          cursor: 'pointer',
          padding: 0
        }
      }, "\u2715")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
        onClick: function onClick() {
          setEditNotaKey(notaKey);
          setEditNotaVal(String(n));
        },
        style: {
          fontSize: 13,
          fontWeight: 900,
          color: notaColor(n),
          cursor: 'pointer'
        }
      }, n.toFixed(1)), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return setAluno(function (al) {
            var _al$notas$disc$id;
            var copy = _objectSpread(_objectSpread({}, al), {}, {
              notas: _objectSpread(_objectSpread({}, al.notas), {}, _defineProperty({}, disc.id, _objectSpread(_objectSpread({}, al.notas[disc.id] || {}), {}, _defineProperty({}, semestre, _toConsumableArray(((_al$notas$disc$id = al.notas[disc.id]) === null || _al$notas$disc$id === void 0 ? void 0 : _al$notas$disc$id[semestre]) || [])))))
            });
            copy.notas[disc.id][semestre].splice(i, 1);
            return copy;
          });
        },
        style: {
          background: 'none',
          border: 'none',
          color: E.muted,
          fontSize: 10,
          cursor: 'pointer',
          padding: 0
        }
      }, "\u2715")));
    })), isAddNota ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 7,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "0.5",
      min: "1",
      max: "6",
      value: novaNotaVal,
      onChange: function onChange(e) {
        return setNovaNotaVal(e.target.value);
      },
      placeholder: "1.0\u20136.0",
      style: {
        flex: 1,
        background: E.surface2,
        border: "1px solid ".concat(E.border),
        borderRadius: 9,
        padding: '8px 11px',
        color: E.text,
        fontSize: 14,
        outline: 'none'
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        var v = parseFloat(novaNotaVal);
        if (isNaN(v) || v < 1 || v > 6) return;
        setAluno(function (al) {
          var _al$notas$disc$id2;
          return _objectSpread(_objectSpread({}, al), {}, {
            notas: _objectSpread(_objectSpread({}, al.notas), {}, _defineProperty({}, disc.id, _objectSpread(_objectSpread({}, al.notas[disc.id] || {}), {}, _defineProperty({}, semestre, [].concat(_toConsumableArray(((_al$notas$disc$id2 = al.notas[disc.id]) === null || _al$notas$disc$id2 === void 0 ? void 0 : _al$notas$disc$id2[semestre]) || []), [v])))))
          });
        });
        setNovaNotaVal('');
        setShowAddNota(null);
      },
      style: {
        background: "linear-gradient(135deg,".concat(E.purple, ",").concat(E.purpleL, ")"),
        border: 'none',
        borderRadius: 9,
        padding: '8px 14px',
        color: '#fff',
        fontSize: 13,
        fontWeight: 800,
        cursor: 'pointer'
      }
    }, "\u2713"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setShowAddNota(null);
      },
      style: {
        background: E.surface2,
        border: "1px solid ".concat(E.border),
        borderRadius: 9,
        padding: '8px 11px',
        color: E.muted,
        fontSize: 12,
        cursor: 'pointer'
      }
    }, "\u2715")) : /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setShowAddNota("".concat(alunoKey, "-").concat(disc.id));
        setNovaNotaVal('');
      },
      style: {
        background: "".concat(disc.cor, "15"),
        border: "1px solid ".concat(disc.cor, "33"),
        borderRadius: 9,
        padding: '5px 12px',
        color: disc.cor,
        fontSize: 11,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, "\uFF0B Nota")));
  })), tab === 'graficos' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 12
    }
  }, [1, 2].map(function (s) {
    return /*#__PURE__*/React.createElement("button", {
      key: s,
      onClick: function onClick() {
        return setSemestre(s);
      },
      style: {
        flex: 1,
        background: semestre === s ? "linear-gradient(135deg,".concat(E.purple, ",").concat(E.purpleL, ")") : E.surface,
        border: "1px solid ".concat(semestre === s ? E.purple : E.border),
        borderRadius: 12,
        padding: '9px',
        color: semestre === s ? '#fff' : E.muted,
        fontSize: 13,
        fontWeight: 800,
        cursor: 'pointer'
      }
    }, s, "\xBA Semestre");
  })), function () {
    var mg = calcMediaGeral(semestre);
    if (!mg) return null;
    return /*#__PURE__*/React.createElement(ECard, {
      style: {
        padding: '14px',
        marginBottom: 12,
        border: "2px solid ".concat(mg.passa ? E.green : E.red)
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: E.purple,
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: 10
      }
    }, "\uD83D\uDCCB Resultados SEK P \xB7 ", semestre, "\xBA Semestre"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        textAlign: 'center',
        padding: '10px',
        background: mg.passaDurchschnitt ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
        borderRadius: 12,
        border: "1px solid ".concat(mg.passaDurchschnitt ? E.green : E.red, "44")
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 9,
        color: E.muted,
        fontWeight: 700,
        textTransform: 'uppercase'
      }
    }, "Durchschnitt"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 28,
        fontWeight: 900,
        color: mg.passaDurchschnitt ? E.green : E.red,
        margin: '3px 0'
      }
    }, mg.durchschnitt), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 9,
        color: mg.passaDurchschnitt ? E.green : E.red,
        fontWeight: 700
      }
    }, "min. 4.0")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        textAlign: 'center',
        padding: '10px',
        background: mg.passaCinco ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
        borderRadius: 12,
        border: "1px solid ".concat(mg.passaCinco ? E.green : E.red, "44")
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 9,
        color: E.muted,
        fontWeight: 700,
        textTransform: 'uppercase'
      }
    }, "5 tiefste Noten"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 28,
        fontWeight: 900,
        color: mg.passaCinco ? E.green : E.red,
        margin: '3px 0'
      }
    }, mg.somaCinco), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 9,
        color: mg.passaCinco ? E.green : E.red,
        fontWeight: 700
      }
    }, "min. 19P"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: 10
      }
    }, mg.cincoMaisBaixas.map(function (d, i) {
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          background: "".concat(notaColor(d.m), "15"),
          border: "1px solid ".concat(notaColor(d.m), "44"),
          borderRadius: 8,
          padding: '3px 10px',
          textAlign: 'center'
        }
      }, /*#__PURE__*/React.createElement("p", {
        style: {
          fontSize: 9,
          color: E.muted,
          fontWeight: 700
        }
      }, d.abr || d.nome.slice(0, 3)), /*#__PURE__*/React.createElement("p", {
        style: {
          fontSize: 14,
          fontWeight: 900,
          color: notaColor(d.m)
        }
      }, d.m.toFixed(1)));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        padding: '8px',
        background: mg.passa ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.12)',
        borderRadius: 10,
        border: "1px solid ".concat(mg.passa ? E.green : E.red)
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 15,
        fontWeight: 900,
        color: mg.passa ? E.green : E.red
      }
    }, mg.passa ? '✅ APROVADO' : '❌ NÃO APROVADO')));
  }(), /*#__PURE__*/React.createElement(ECard, {
    style: {
      padding: '14px',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: E.text,
      fontWeight: 800,
      fontSize: 13,
      marginBottom: 12
    }
  }, "\uD83D\uDCCA Notas por disciplina"), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto',
      paddingBottom: 4
    }
  }, function () {
    var w = Math.max(300, aluno.disciplinas.length * 46);
    return /*#__PURE__*/React.createElement("svg", {
      width: w,
      height: "170",
      style: {
        display: 'block'
      }
    }, [2, 3, 4, 5, 6].map(function (g) {
      var y = 140 - (g - 1) / 5 * 120;
      return /*#__PURE__*/React.createElement("g", {
        key: g
      }, /*#__PURE__*/React.createElement("line", {
        x1: "28",
        y1: y,
        x2: w,
        y2: y,
        stroke: "#2A2A3A",
        strokeWidth: "1"
      }), /*#__PURE__*/React.createElement("text", {
        x: "24",
        y: y + 4,
        textAnchor: "end",
        fontSize: "9",
        fill: "#666"
      }, g));
    }), aluno.disciplinas.map(function (disc, i) {
      var med = parseFloat(media(disc.id, semestre)) || 0;
      var h = med > 0 ? (med - 1) / 5 * 120 : 0;
      var x = 28 + i * 46 + 6;
      return /*#__PURE__*/React.createElement("g", {
        key: disc.id
      }, /*#__PURE__*/React.createElement("rect", {
        x: x,
        y: med > 0 ? 140 - h : 132,
        width: "32",
        height: med > 0 ? h : 8,
        rx: "5",
        fill: med > 0 ? disc.cor : '#333',
        opacity: med > 0 ? 0.85 : 0.4
      }), med > 0 && /*#__PURE__*/React.createElement("text", {
        x: x + 16,
        y: 140 - h - 5,
        textAnchor: "middle",
        fontSize: "10",
        fontWeight: "800",
        fill: notaColor(med)
      }, med.toFixed(1)), /*#__PURE__*/React.createElement("text", {
        x: x + 16,
        y: 158,
        textAnchor: "middle",
        fontSize: "8",
        fill: "#555"
      }, disc.nome.slice(0, 5)));
    }), /*#__PURE__*/React.createElement("line", {
      x1: "28",
      y1: 140 - (4 - 1) / 5 * 120,
      x2: w,
      y2: 140 - (4 - 1) / 5 * 120,
      stroke: "#F97316",
      strokeWidth: "1.5",
      strokeDasharray: "5,3"
    }));
  }()), /*#__PURE__*/React.createElement("p", {
    style: {
      color: E.muted,
      fontSize: 10,
      marginTop: 4
    }
  }, "\uD83D\uDFE0 Linha laranja = m\xEDnimo (4.0)")), /*#__PURE__*/React.createElement(ECard, {
    style: {
      padding: '14px',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: E.text,
      fontWeight: 800,
      fontSize: 13,
      marginBottom: 12
    }
  }, "\uD83D\uDCC8 Evolu\xE7\xE3o S1 \u2192 S2"), aluno.disciplinas.filter(function (d) {
    return parseFloat(media(d.id, 1)) && parseFloat(media(d.id, 2));
  }).map(function (disc) {
    var m1 = parseFloat(media(disc.id, 1));
    var m2 = parseFloat(media(disc.id, 2));
    var diff = m2 - m1;
    return /*#__PURE__*/React.createElement("div", {
      key: disc.id,
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
    }, disc.emoji), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: E.text
      }
    }, disc.nome)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: notaColor(m1),
        fontWeight: 700
      }
    }, m1.toFixed(1)), /*#__PURE__*/React.createElement("span", {
      style: {
        color: E.muted,
        fontSize: 11
      }
    }, "\u2192"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: notaColor(m2),
        fontWeight: 700
      }
    }, m2.toFixed(1)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 900,
        color: diff > 0 ? E.green : diff < 0 ? E.red : E.muted,
        minWidth: 32,
        textAlign: 'right'
      }
    }, diff > 0 ? "\u2191".concat(diff.toFixed(1)) : diff < 0 ? "\u2193".concat(Math.abs(diff).toFixed(1)) : '='))), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 7,
        background: E.surface2,
        borderRadius: 6,
        overflow: 'hidden',
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: "".concat((m1 - 1) / 5 * 100, "%"),
        background: notaColor(m1),
        borderRadius: '6px 0 0 6px',
        opacity: 0.5
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: "".concat((m2 - 1) / 5 * 100, "%"),
        background: notaColor(m2),
        borderRadius: 6,
        opacity: 0.7
      }
    })));
  }), !aluno.disciplinas.some(function (d) {
    return parseFloat(media(d.id, 1)) && parseFloat(media(d.id, 2));
  }) && /*#__PURE__*/React.createElement("p", {
    style: {
      color: E.muted,
      fontSize: 12,
      textAlign: 'center',
      padding: '10px'
    }
  }, "Precisa de notas nos 2 semestres para comparar")), /*#__PURE__*/React.createElement(ECard, {
    style: {
      padding: '14px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: E.text,
      fontWeight: 800,
      fontSize: 13,
      marginBottom: 12
    }
  }, "\uD83D\uDD14 Notifica\xE7\xF5es activas"), [{
    emoji: '📋',
    txt: 'TPC para hoje',
    c: E.red
  }, {
    emoji: '⏰',
    txt: 'TPC amanhã',
    c: E.orange
  }, {
    emoji: '📊',
    txt: 'Nota adicionada',
    c: E.purple
  }, {
    emoji: '📅',
    txt: 'Dias livres partilhados',
    c: E.gold
  }].map(function (n, i, arr) {
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 0',
        borderBottom: i < arr.length - 1 ? "1px solid ".concat(E.border) : 'none'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18
      }
    }, n.emoji), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontSize: 13,
        color: E.text
      }
    }, n.txt), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 40,
        height: 22,
        borderRadius: 11,
        background: n.c,
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 3,
        right: 3,
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: '#fff'
      }
    })));
  }), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return addEscolarToast("\uD83D\uDD14 ".concat(aluno.nome, " \u2014 TPC amanh\xE3!"), 'Vocabulary Unit 5 · Englisch');
    },
    style: {
      width: '100%',
      marginTop: 12,
      background: "".concat(E.purple, "22"),
      border: "1px solid ".concat(E.purple, "44"),
      borderRadius: 10,
      padding: '10px',
      color: E.purple,
      fontSize: 12,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "\uD83D\uDD14 Testar aviso agora"))));
}

// ══════════════════════════════════════════════════════════════════
// MAIN HUB
// ══════════════════════════════════════════════════════════════════
