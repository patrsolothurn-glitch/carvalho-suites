function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
// 12-app-lucas.js — Escola do Lucas — Carvalho Suite

var _React = React,
  useState = _React.useState,
  useEffect = _React.useEffect,
  useRef = _React.useRef;
var DAYS_BASE = [{
  key: 'seg',
  sai: '11:50',
  tarde: true
}, {
  key: 'ter',
  sai: '11:50',
  tarde: true
}, {
  key: 'qua',
  sai: '11:50',
  tarde: false
}, {
  key: 'qui',
  sai: '11:00',
  tarde: true
}, {
  key: 'sex',
  sai: '12:40',
  tarde: false
}];
var LANGS = {
  PT: {
    flag: '🇵🇹',
    name: 'PT',
    days: {
      seg: ['Segunda', 'SEG'],
      ter: ['Terça', 'TER'],
      qua: ['Quarta', 'QUA'],
      qui: ['Quinta', 'QUI'],
      sex: ['Sexta', 'SEX']
    },
    manha: '🌅 Manhã',
    tarde: '🌤 Tarde',
    sem_tarde: 'Sem tarde',
    partida_selzach: 'Partida Selzach',
    saida_grenchen: 'Saída Grenchen',
    entra_escola: 'Entra escola',
    sai_escola: 'Sai escola',
    levar: 'Levar',
    buscar: 'Buscar',
    semana_atual: '🟢 Semana atual',
    semana: 'Semana',
    escolher: '— escolher —',
    levar_manha: '🚗 Levar manhã',
    buscar_almoco: '🚗 Buscar almoço',
    levar_tarde: '🚗 Levar tarde',
    buscar_fim: '🚗 Buscar fim dia',
    plano: 'Plano',
    acesso: 'Acesso',
    historico: 'Histórico',
    imprimir: 'Imprimir',
    guardado: '✓ Guardado',
    autorizado: '✓ Autorizado',
    sem_acesso: '⛔ Sem acesso',
    remover: 'Remover',
    autorizar: 'Autorizar',
    apagar: '🗑 Apagar',
    adicionar_condutor: '＋ Adicionar condutor',
    novo_condutor: 'Novo condutor',
    cancelar: 'Cancelar',
    adicionar: '✓ Adicionar',
    cor: 'Cor',
    nome_placeholder: 'Nome (ex: Sabine, ÖV...)',
    link_acesso: '🔗 Link de acesso',
    copiar: '📋 Copiar link',
    copiado: '✓ Copiado!',
    condutores: '🔑 Condutores',
    filtros: '🔎 Filtros',
    condutor_lbl: 'Condutor',
    dia_lbl: 'Dia',
    periodo_lbl: 'Período',
    servico_lbl: 'Serviço',
    todos: 'Todos',
    manha_lbl: '🌅 Manhã',
    tarde_lbl: '🌤 Tarde',
    limpar_filtros: '✕ Limpar filtros',
    sem_resultados: 'Sem resultados',
    sem_historico: 'Sem histórico',
    viagens: 'viagens',
    previsualização: 'Pré-visualização',
    imprimir_btn: '🖨️ Imprimir',
    hint_editar: '✏️ Toca nos horários para definir excepções pontuais',
    sai_manha: 'Sai manhã',
    volta: 'Volta',
    sai_tarde: 'Sai tarde',
    sem_tarde_print: 'Sem tarde'
  },
  DE: {
    flag: '🇩🇪',
    name: 'DE',
    days: {
      seg: ['Montag', 'MO'],
      ter: ['Dienstag', 'DI'],
      qua: ['Mittwoch', 'MI'],
      qui: ['Donnerstag', 'DO'],
      sex: ['Freitag', 'FR']
    },
    manha: '🌅 Morgen',
    tarde: '🌤 Nachmittag',
    sem_tarde: 'Kein Nachmittag',
    partida_selzach: 'Abfahrt Selzach',
    saida_grenchen: 'Abfahrt Grenchen',
    entra_escola: 'Schulbeginn',
    sai_escola: 'Schulschluss',
    levar: 'Bringen',
    buscar: 'Abholen',
    semana_atual: '🟢 Aktuelle Woche',
    semana: 'Woche',
    escolher: '— wählen —',
    levar_manha: '🚗 Bringen (Mo)',
    buscar_almoco: '🚗 Abholen (Mi)',
    levar_tarde: '🚗 Bringen (Na)',
    buscar_fim: '🚗 Abholen (Ende)',
    plano: 'Plan',
    acesso: 'Zugang',
    historico: 'Verlauf',
    imprimir: 'Drucken',
    guardado: '✓ Gespeichert',
    autorizado: '✓ Berechtigt',
    sem_acesso: '⛔ Kein Zugang',
    remover: 'Entfernen',
    autorizar: 'Berechtigen',
    apagar: '🗑 Löschen',
    adicionar_condutor: '＋ Fahrer hinzufügen',
    novo_condutor: 'Neuer Fahrer',
    cancelar: 'Abbrechen',
    adicionar: '✓ Hinzufügen',
    cor: 'Farbe',
    nome_placeholder: 'Name (z.B. Sabine, ÖV...)',
    link_acesso: '🔗 Zugangslink',
    copiar: '📋 Link kopieren',
    copiado: '✓ Kopiert!',
    condutores: '🔑 Fahrer',
    filtros: '🔎 Filter',
    condutor_lbl: 'Fahrer',
    dia_lbl: 'Tag',
    periodo_lbl: 'Zeitraum',
    servico_lbl: 'Service',
    todos: 'Alle',
    manha_lbl: '🌅 Morgen',
    tarde_lbl: '🌤 Nachmittag',
    limpar_filtros: '✕ Filter löschen',
    sem_resultados: 'Keine Ergebnisse',
    sem_historico: 'Kein Verlauf',
    viagens: 'Fahrten',
    previsualização: 'Vorschau',
    imprimir_btn: '🖨️ Drucken',
    hint_editar: '✏️ Zeiten antippen um Ausnahmen festzulegen',
    sai_manha: 'Abfahrt Mo',
    volta: 'Rückkehr',
    sai_tarde: 'Abfahrt Na',
    sem_tarde_print: 'Kein Nachmittag'
  },
  FR: {
    flag: '🇫🇷',
    name: 'FR',
    days: {
      seg: ['Lundi', 'LU'],
      ter: ['Mardi', 'MA'],
      qua: ['Mercredi', 'ME'],
      qui: ['Jeudi', 'JE'],
      sex: ['Vendredi', 'VE']
    },
    manha: '🌅 Matin',
    tarde: '🌤 Après-midi',
    sem_tarde: "Pas d'après-midi",
    partida_selzach: 'Départ Selzach',
    saida_grenchen: 'Départ Grenchen',
    entra_escola: 'Début école',
    sai_escola: 'Fin école',
    levar: 'Déposer',
    buscar: 'Récupérer',
    semana_atual: "🟢 Semaine actuelle",
    semana: 'Semaine',
    escolher: '— choisir —',
    levar_manha: '🚗 Déposer (matin)',
    buscar_almoco: '🚗 Récupérer (midi)',
    levar_tarde: '🚗 Déposer (ap-m)',
    buscar_fim: '🚗 Récupérer (fin)',
    plano: 'Planning',
    acesso: 'Accès',
    historico: 'Historique',
    imprimir: 'Imprimer',
    guardado: '✓ Enregistré',
    autorizado: '✓ Autorisé',
    sem_acesso: '⛔ Sans accès',
    remover: 'Supprimer',
    autorizar: 'Autoriser',
    apagar: '🗑 Effacer',
    adicionar_condutor: '＋ Ajouter conducteur',
    novo_condutor: 'Nouveau conducteur',
    cancelar: 'Annuler',
    adicionar: '✓ Ajouter',
    cor: 'Couleur',
    nome_placeholder: 'Nom (ex: Sabine, TP...)',
    link_acesso: "🔗 Lien d'accès",
    copiar: '📋 Copier lien',
    copiado: '✓ Copié!',
    condutores: '🔑 Conducteurs',
    filtros: '🔎 Filtres',
    condutor_lbl: 'Conducteur',
    dia_lbl: 'Jour',
    periodo_lbl: 'Période',
    servico_lbl: 'Service',
    todos: 'Tous',
    manha_lbl: '🌅 Matin',
    tarde_lbl: "🌤 Après-midi",
    limpar_filtros: '✕ Effacer filtres',
    sem_resultados: 'Aucun résultat',
    sem_historico: 'Aucun historique',
    viagens: 'trajets',
    previsualização: 'Aperçu',
    imprimir_btn: '🖨️ Imprimer',
    hint_editar: "✏️ Touchez les horaires pour définir des exceptions",
    sai_manha: 'Départ mat.',
    volta: 'Retour',
    sai_tarde: 'Départ ap-m',
    sem_tarde_print: "Pas d'ap-m"
  },
  IT: {
    flag: '🇮🇹',
    name: 'IT',
    days: {
      seg: ['Lunedì', 'LU'],
      ter: ['Martedì', 'MA'],
      qua: ['Mercoledì', 'ME'],
      qui: ['Giovedì', 'GI'],
      sex: ['Venerdì', 'VE']
    },
    manha: '🌅 Mattina',
    tarde: '🌤 Pomeriggio',
    sem_tarde: "Nessun pomeriggio",
    partida_selzach: 'Partenza Selzach',
    saida_grenchen: 'Partenza Grenchen',
    entra_escola: 'Inizio scuola',
    sai_escola: 'Fine scuola',
    levar: 'Portare',
    buscar: 'Raccogliere',
    semana_atual: '🟢 Settimana corrente',
    semana: 'Settimana',
    escolher: '— scegliere —',
    levar_manha: '🚗 Portare (mattina)',
    buscar_almoco: '🚗 Raccogliere (pranzo)',
    levar_tarde: '🚗 Portare (pom.)',
    buscar_fim: '🚗 Raccogliere (fine)',
    plano: 'Piano',
    acesso: 'Accesso',
    historico: 'Storico',
    imprimir: 'Stampare',
    guardado: '✓ Salvato',
    autorizado: '✓ Autorizzato',
    sem_acesso: '⛔ Senza accesso',
    remover: 'Rimuovere',
    autorizar: 'Autorizzare',
    apagar: '🗑 Eliminare',
    adicionar_condutor: '＋ Aggiungi conducente',
    novo_condutor: 'Nuovo conducente',
    cancelar: 'Annulla',
    adicionar: '✓ Aggiungi',
    cor: 'Colore',
    nome_placeholder: 'Nome (es: Sabine, TP...)',
    link_acesso: '🔗 Link di accesso',
    copiar: '📋 Copia link',
    copiado: '✓ Copiato!',
    condutores: '🔑 Conducenti',
    filtros: '🔎 Filtri',
    condutor_lbl: 'Conducente',
    dia_lbl: 'Giorno',
    periodo_lbl: 'Periodo',
    servico_lbl: 'Servizio',
    todos: 'Tutti',
    manha_lbl: '🌅 Mattina',
    tarde_lbl: '🌤 Pomeriggio',
    limpar_filtros: '✕ Cancella filtri',
    sem_resultados: 'Nessun risultato',
    sem_historico: 'Nessuno storico',
    viagens: 'viaggi',
    previsualização: 'Anteprima',
    imprimir_btn: '🖨️ Stampare',
    hint_editar: '✏️ Tocca gli orari per impostare eccezioni',
    sai_manha: 'Partenza mat.',
    volta: 'Ritorno',
    sai_tarde: 'Partenza pom.',
    sem_tarde_print: 'Nessun pom.'
  },
  EN: {
    flag: '🇬🇧',
    name: 'EN',
    days: {
      seg: ['Monday', 'MON'],
      ter: ['Tuesday', 'TUE'],
      qua: ['Wednesday', 'WED'],
      qui: ['Thursday', 'THU'],
      sex: ['Friday', 'FRI']
    },
    manha: '🌅 Morning',
    tarde: '🌤 Afternoon',
    sem_tarde: 'No afternoon',
    partida_selzach: 'Depart Selzach',
    saida_grenchen: 'Depart Grenchen',
    entra_escola: 'School starts',
    sai_escola: 'School ends',
    levar: 'Drop off',
    buscar: 'Pick up',
    semana_atual: '🟢 Current week',
    semana: 'Week',
    escolher: '— choose —',
    levar_manha: '🚗 Drop off (am)',
    buscar_almoco: '🚗 Pick up (lunch)',
    levar_tarde: '🚗 Drop off (pm)',
    buscar_fim: '🚗 Pick up (end)',
    plano: 'Schedule',
    acesso: 'Access',
    historico: 'History',
    imprimir: 'Print',
    guardado: '✓ Saved',
    autorizado: '✓ Authorised',
    sem_acesso: '⛔ No access',
    remover: 'Remove',
    autorizar: 'Authorise',
    apagar: '🗑 Delete',
    adicionar_condutor: '＋ Add driver',
    novo_condutor: 'New driver',
    cancelar: 'Cancel',
    adicionar: '✓ Add',
    cor: 'Colour',
    nome_placeholder: 'Name (e.g. Sabine, Bus...)',
    link_acesso: '🔗 Access link',
    copiar: '📋 Copy link',
    copiado: '✓ Copied!',
    condutores: '🔑 Drivers',
    filtros: '🔎 Filters',
    condutor_lbl: 'Driver',
    dia_lbl: 'Day',
    periodo_lbl: 'Period',
    servico_lbl: 'Service',
    todos: 'All',
    manha_lbl: '🌅 Morning',
    tarde_lbl: '🌤 Afternoon',
    limpar_filtros: '✕ Clear filters',
    sem_resultados: 'No results',
    sem_historico: 'No history',
    viagens: 'trips',
    previsualização: 'Preview',
    imprimir_btn: '🖨️ Print',
    hint_editar: '✏️ Tap times to set one-off exceptions',
    sai_manha: 'Depart am',
    volta: 'Return',
    sai_tarde: 'Depart pm',
    sem_tarde_print: 'No afternoon'
  }
};
var ALL_SLOTS = ['leva_manha', 'busca_almoco', 'leva_tarde', 'busca_fim'];
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
  border: '#e8e8e8',
  exception: '#e65100'
};
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
function getWeekNumber(d) {
  var dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  var day = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - day);
  var yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  return Math.ceil(((dt - yearStart) / 86400000 + 1) / 7);
}
function addMin(hhmm, add) {
  var parts = hhmm.split(':');
  var h = parseInt(parts[0], 10),
    m = parseInt(parts[1], 10);
  var total = h * 60 + m + add;
  var nh = Math.floor(total / 60);
  var nm = total % 60;
  return nh + ':' + String(nm).padStart(2, '0');
}
// Envia o codigo de acesso por WhatsApp. Se a pessoa tiver telemovel
// guardado, abre a conversa dela diretamente; senao abre o WhatsApp para
// escolher o contacto. Numeros suicos (0xx...) sao convertidos para +41.
function normalizarTelemovel(tel) {
  if (!tel) return '';
  var d = String(tel).replace(/[^0-9]/g, '');
  if (!d) return '';
  if (d.indexOf('00') === 0) d = d.slice(2);
  if (d.indexOf('0') === 0) d = '41' + d.slice(1);
  return d;
}
function enviarCodigoWhatsApp(nome, codigo, telefone) {
  var link = 'https://patrsolothurn-glitch.github.io/escola-grenchen/';
  var msg = encodeURIComponent(
    '\uD83C\uDFEB Escola Grenchen Sek P \u2014 plano de transportes\n\n' +
    'Ol\u00e1 ' + (nome || '') + '! O teu c\u00f3digo de acesso \u00e9: ' + codigo + '\n\n' +
    link
  );
  var num = normalizarTelemovel(telefone);
  window.open('https://wa.me/' + num + '?text=' + msg, '_blank');
}

function LucasApp(_ref) {
  var supabase = _ref.supabase,
    user = _ref.user,
    isAdmin = _ref.isAdmin,
    isSuperAdmin = _ref.isSuperAdmin,
    onBack = _ref.onBack,
    initialView = _ref.initialView;
  var VALID_VIEWS = ['plano', 'autorizacoes', 'historico', 'imprimir'];
  var normalizedInitialView = initialView === 'acesso' ? 'autorizacoes' : initialView;
  var _useState = useState(VALID_VIEWS.indexOf(normalizedInitialView) !== -1 ? normalizedInitialView : 'plano'),
    _useState2 = _slicedToArray(_useState, 2),
    view = _useState2[0],
    setView = _useState2[1];
  var _useState3 = useState(function () {
      var dayMap = {
        1: 'seg',
        2: 'ter',
        3: 'qua',
        4: 'qui',
        5: 'sex'
      };
      return dayMap[new Date().getDay()] || 'seg'; // fim de semana → segunda
    }),
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
  var _useState1 = useState([]),
    _useState10 = _slicedToArray(_useState1, 2),
    visitantes = _useState10[0],
    setVisitantes = _useState10[1];
  var _useState11 = useState(true),
    _useState12 = _slicedToArray(_useState11, 2),
    loading = _useState12[0],
    setLoading = _useState12[1];
  var _useState13 = useState(false),
    _useState14 = _slicedToArray(_useState13, 2),
    saving = _useState14[0],
    setSaving = _useState14[1];
  var _useState15 = useState(null),
    _useState16 = _slicedToArray(_useState15, 2),
    toast = _useState16[0],
    setToast = _useState16[1];
  var _useState17 = useState(function () {
      return localStorage.getItem('lucas_lang') || 'PT';
    }),
    _useState18 = _slicedToArray(_useState17, 2),
    lang = _useState18[0],
    setLang = _useState18[1];
  var t = LANGS[lang] || LANGS.PT;
  var SLOT_LABELS = {
    leva_manha: t.levar_manha,
    busca_almoco: t.buscar_almoco,
    leva_tarde: t.levar_tarde,
    busca_fim: t.buscar_fim
  };
  var DAYS = DAYS_BASE.map(function (d) {
    return Object.assign({}, d, {
      label: t.days[d.key][0],
      short: t.days[d.key][1]
    });
  });
  var _useState19 = useState({
      escola_nome: 'Escola Grenchen Sek P 1p 26/27',
      escola_morada: 'Schulstrasse 25, 2540 Grenchen',
      escola_comeca: '07:30',
      escola_acaba: '16:55'
    }),
    _useState20 = _slicedToArray(_useState19, 2),
    config = _useState20[0],
    setConfig = _useState20[1];
  var _useState21 = useState(null),
    _useState22 = _slicedToArray(_useState21, 2),
    editField = _useState22[0],
    setEditField = _useState22[1];
  function changeLang(l) {
    localStorage.setItem('lucas_lang', l);
    setLang(l);
  }
  var _useState23 = useState(''),
    _useState24 = _slicedToArray(_useState23, 2),
    editVal = _useState24[0],
    setEditVal = _useState24[1];
  var _useState25 = useState([]),
    _useState26 = _slicedToArray(_useState25, 2),
    history = _useState26[0],
    setHistory = _useState26[1];
  var _useState27 = useState(''),
    _useState28 = _slicedToArray(_useState27, 2),
    fDriver = _useState28[0],
    setFDriver = _useState28[1];
  var _useState29 = useState(''),
    _useState30 = _slicedToArray(_useState29, 2),
    fDay = _useState30[0],
    setFDay = _useState30[1];
  var _useState31 = useState(''),
    _useState32 = _slicedToArray(_useState31, 2),
    fPeriod = _useState32[0],
    setFPeriod = _useState32[1];
  var _useState33 = useState(''),
    _useState34 = _slicedToArray(_useState33, 2),
    fSlot = _useState34[0],
    setFSlot = _useState34[1];
  useEffect(function () {
    loadDrivers();
    loadConfig();
    loadVisitantes();
  }, []);
  useEffect(function () {
    loadSchedule();
  }, [weekStart]);
  useEffect(function () {
    if (view === 'historico') loadHistory();
  }, [view, fDriver, fDay, fPeriod, fSlot]);
  function flash(msg, err) {
    setToast({
      msg: msg,
      err: !!err
    });
    setTimeout(function () {
      setToast(null);
    }, 2000);
  }
  function resizeImage(file, maxSize) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var img = new Image();
        img.onload = function () {
          var canvas = document.createElement('canvas');
          var w = img.width,
            h = img.height;
          if (w > h) {
            if (w > maxSize) {
              h = h * maxSize / w;
              w = maxSize;
            }
          } else {
            if (h > maxSize) {
              w = w * maxSize / h;
              h = maxSize;
            }
          }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  function uploadAvatar(_x, _x2) {
    return _uploadAvatar.apply(this, arguments);
  }
  function _uploadAvatar() {
    _uploadAvatar = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(driverId, file) {
      var b64, _yield$supabase$rpc, error, _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            if (file) {
              _context.n = 1;
              break;
            }
            return _context.a(2);
          case 1:
            _context.p = 1;
            _context.n = 2;
            return resizeImage(file, 200);
          case 2:
            b64 = _context.v;
            _context.n = 3;
            return supabase.rpc('update_lucas_avatar', {
              p_id: driverId,
              p_avatar: b64
            });
          case 3:
            _yield$supabase$rpc = _context.v;
            error = _yield$supabase$rpc.error;
            if (!error) {
              setDrivers(function (p) {
                return p.map(function (d) {
                  return d.id === driverId ? Object.assign({}, d, {
                    avatar_base64: b64
                  }) : d;
                });
              });
              flash('✓ Foto atualizada');
            } else {
              flash('Erro ao guardar foto', true);
            }
            _context.n = 5;
            break;
          case 4:
            _context.p = 4;
            _t = _context.v;
            flash('Erro ao processar imagem', true);
          case 5:
            return _context.a(2);
        }
      }, _callee, null, [[1, 4]]);
    }));
    return _uploadAvatar.apply(this, arguments);
  }
  function addCondutor(_x3, _x4) {
    return _addCondutor.apply(this, arguments);
  }
  function _addCondutor() {
    _addCondutor = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(nome, cor) {
      var _yield$supabase$from$, error;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.n) {
          case 0:
            if (nome.trim()) {
              _context2.n = 1;
              break;
            }
            return _context2.a(2);
          case 1:
            _context2.n = 2;
            return supabase.from('lucas_condutores').insert({
              nome: nome.trim(),
              autorizado: true,
              cor: cor
            });
          case 2:
            _yield$supabase$from$ = _context2.v;
            error = _yield$supabase$from$.error;
            if (!error) {
              flash('✓ ' + nome + ' adicionado');
              loadDrivers();
            } else {
              flash('Erro: nome já existe?', true);
            }
          case 3:
            return _context2.a(2);
        }
      }, _callee2);
    }));
    return _addCondutor.apply(this, arguments);
  }
  function deleteCondutor(_x5, _x6) {
    return _deleteCondutor.apply(this, arguments);
  }
  function _deleteCondutor() {
    _deleteCondutor = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(id, nome) {
      return _regenerator().w(function (_context3) {
        while (1) switch (_context3.n) {
          case 0:
            if (confirm('Remover ' + nome + ' definitivamente?')) {
              _context3.n = 1;
              break;
            }
            return _context3.a(2);
          case 1:
            _context3.n = 2;
            return supabase.from('lucas_condutores').delete().eq('id', id);
          case 2:
            flash('Removido');
            loadDrivers();
          case 3:
            return _context3.a(2);
        }
      }, _callee3);
    }));
    return _deleteCondutor.apply(this, arguments);
  }
  function setAccessCode(_x7, _x8) {
    return _setAccessCode.apply(this, arguments);
  }
  function _setAccessCode() {
    _setAccessCode = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(id, code) {
      var val;
      return _regenerator().w(function (_context4) {
        while (1) switch (_context4.n) {
          case 0:
            val = code.trim() || null;
            _context4.n = 1;
            return supabase.from('lucas_condutores').update({
              access_code: val
            }).eq('id', id);
          case 1:
            setDrivers(function (p) {
              return p.map(function (d) {
                return d.id === id ? Object.assign({}, d, {
                  access_code: val
                }) : d;
              });
            });
            flash(val ? '✓ Código definido' : '⛔ Acesso removido');
          case 2:
            return _context4.a(2);
        }
      }, _callee4);
    }));
    return _setAccessCode.apply(this, arguments);
  }
  function loadConfig() {
    return _loadConfig.apply(this, arguments);
  }
  function _loadConfig() {
    _loadConfig = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
      var _yield$supabase$from$2, data, map;
      return _regenerator().w(function (_context5) {
        while (1) switch (_context5.n) {
          case 0:
            _context5.n = 1;
            return supabase.from('lucas_config').select('*');
          case 1:
            _yield$supabase$from$2 = _context5.v;
            data = _yield$supabase$from$2.data;
            if (data && data.length) {
              map = {};
              data.forEach(function (r) {
                map[r.key] = r.value;
              });
              setConfig(function (prev) {
                return Object.assign({}, prev, map);
              });
            }
          case 2:
            return _context5.a(2);
        }
      }, _callee5);
    }));
    return _loadConfig.apply(this, arguments);
  }
  function saveConfig(_x9, _x0) {
    return _saveConfig.apply(this, arguments);
  }
  function _saveConfig() {
    _saveConfig = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(key, value) {
      return _regenerator().w(function (_context6) {
        while (1) switch (_context6.n) {
          case 0:
            _context6.n = 1;
            return supabase.from('lucas_config').upsert({
              key: key,
              value: value
            }, {
              onConflict: 'key'
            });
          case 1:
            setConfig(function (prev) {
              return Object.assign({}, prev, _defineProperty({}, key, value));
            });
            setEditField(null);
            flash(t.guardado);
          case 2:
            return _context6.a(2);
        }
      }, _callee6);
    }));
    return _saveConfig.apply(this, arguments);
  }
  function notificar(_x1, _x10) {
    return _notificar.apply(this, arguments);
  }
  function _notificar() {
    _notificar = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(titulo, corpo) {
      var _t2;
      return _regenerator().w(function (_context7) {
        while (1) switch (_context7.p = _context7.n) {
          case 0:
            if (!isSuperAdmin) {
              _context7.n = 1;
              break;
            }
            return _context7.a(2);
          case 1:
            _context7.p = 1;
            _context7.n = 2;
            return supabase.functions.invoke('send-push', {
              body: {
                title: titulo,
                body: corpo
              }
            });
          case 2:
            _context7.n = 4;
            break;
          case 3:
            _context7.p = 3;
            _t2 = _context7.v;
          case 4:
            return _context7.a(2);
        }
      }, _callee7, null, [[1, 3]]);
    }));
    return _notificar.apply(this, arguments);
  }
  function loadDrivers() {
    return _loadDrivers.apply(this, arguments);
  }
  function _loadDrivers() {
    _loadDrivers = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8() {
      var r;
      return _regenerator().w(function (_context8) {
        while (1) switch (_context8.n) {
          case 0:
            _context8.n = 1;
            return supabase.from('lucas_condutores').select('*').order('nome');
          case 1:
            r = _context8.v;
            if (r.data) setDrivers(r.data);
            setLoading(false);
          case 2:
            return _context8.a(2);
        }
      }, _callee8);
    }));
    return _loadDrivers.apply(this, arguments);
  }
  function loadVisitantes() {
    return _loadVisitantes.apply(this, arguments);
  }
  function _loadVisitantes() {
    _loadVisitantes = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9() {
      var r;
      return _regenerator().w(function (_context9) {
        while (1) switch (_context9.n) {
          case 0:
            _context9.n = 1;
            return supabase.from('lucas_visitantes').select('*').order('criado_em', {
              ascending: false
            });
          case 1:
            r = _context9.v;
            if (r.data) setVisitantes(r.data);
          case 2:
            return _context9.a(2);
        }
      }, _callee9);
    }));
    return _loadVisitantes.apply(this, arguments);
  }
  function setVisitanteCode(_x11, _x12) {
    return _setVisitanteCode.apply(this, arguments);
  }
  function _setVisitanteCode() {
    _setVisitanteCode = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0(id, code) {
      var val;
      return _regenerator().w(function (_context0) {
        while (1) switch (_context0.n) {
          case 0:
            val = code.trim() || null;
            _context0.n = 1;
            return supabase.from('lucas_visitantes').update({
              access_code: val
            }).eq('id', id);
          case 1:
            setVisitantes(function (p) {
              return p.map(function (v) {
                return v.id === id ? Object.assign({}, v, {
                  access_code: val
                }) : v;
              });
            });
            flash(val ? '✓ Código definido' : '⛔ Código removido');
          case 2:
            return _context0.a(2);
        }
      }, _callee0);
    }));
    return _setVisitanteCode.apply(this, arguments);
  }
  function toggleVisitante(_x13, _x14) {
    return _toggleVisitante.apply(this, arguments);
  }
  function authorizeVisitanteWithCode(id, code) {
    return _authorizeVisitanteWithCode.apply(this, arguments);
  }
  function _authorizeVisitanteWithCode() {
    _authorizeVisitanteWithCode = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1b(id, code) {
      return _regenerator().w(function (_context1b) {
        while (1) switch (_context1b.n) {
          case 0:
            _context1b.n = 1;
            return supabase.from('lucas_visitantes').update({ autorizado: true, access_code: code }).eq('id', id);
          case 1:
            setVisitantes(function (p) {
              return p.map(function (v) {
                return v.id === id ? Object.assign({}, v, { autorizado: true, access_code: code }) : v;
              });
            });
            flash('\u2713 Autorizado com código');
          case 2:
            return _context1b.a(2);
        }
      }, _callee1b);
    }));
    return _authorizeVisitanteWithCode.apply(this, arguments);
  }
  function _toggleVisitante() {
    _toggleVisitante = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1(id, cur) {
      return _regenerator().w(function (_context1) {
        while (1) switch (_context1.n) {
          case 0:
            _context1.n = 1;
            return supabase.from('lucas_visitantes').update({
              autorizado: !cur
            }).eq('id', id);
          case 1:
            setVisitantes(function (p) {
              return p.map(function (v) {
                return v.id === id ? Object.assign({}, v, {
                  autorizado: !cur
                }) : v;
              });
            });
            flash(!cur ? '✓ Autorizado' : '⛔ Removido');
          case 2:
            return _context1.a(2);
        }
      }, _callee1);
    }));
    return _toggleVisitante.apply(this, arguments);
  }
  function deleteVisitante(_x15) {
    return _deleteVisitante.apply(this, arguments);
  }
  function _deleteVisitante() {
    _deleteVisitante = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10(id) {
      return _regenerator().w(function (_context10) {
        while (1) switch (_context10.n) {
          case 0:
            _context10.n = 1;
            return supabase.from('lucas_visitantes').delete().eq('id', id);
          case 1:
            setVisitantes(function (p) {
              return p.filter(function (v) {
                return v.id !== id;
              });
            });
            flash('Removido');
          case 2:
            return _context10.a(2);
        }
      }, _callee10);
    }));
    return _deleteVisitante.apply(this, arguments);
  }
  function addVisitante(_x16, _x17) {
    return _addVisitante.apply(this, arguments);
  }
  function _addVisitante() {
    _addVisitante = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee11(nome, code) {
      var _yield$supabase$from$3, data, error;
      return _regenerator().w(function (_context11) {
        while (1) switch (_context11.n) {
          case 0:
            if (nome.trim()) {
              _context11.n = 1;
              break;
            }
            return _context11.a(2);
          case 1:
            _context11.n = 2;
            return supabase.from('lucas_visitantes').insert({
              nome: nome.trim(),
              autorizado: true,
              access_code: code || null
            }).select();
          case 2:
            _yield$supabase$from$3 = _context11.v;
            data = _yield$supabase$from$3.data;
            error = _yield$supabase$from$3.error;
            if (!error) {
              flash('✓ ' + nome + ' adicionado');
              loadVisitantes();
            } else {
              flash('Erro ao adicionar', true);
            }
          case 3:
            return _context11.a(2);
        }
      }, _callee11);
    }));
    return _addVisitante.apply(this, arguments);
  }
  function loadSchedule() {
    return _loadSchedule.apply(this, arguments);
  }
  function _loadSchedule() {
    _loadSchedule = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee12() {
      var r, map;
      return _regenerator().w(function (_context12) {
        while (1) switch (_context12.n) {
          case 0:
            setLoading(true);
            _context12.n = 1;
            return supabase.from('lucas_semana').select('*').eq('week_start', toISO(weekStart));
          case 1:
            r = _context12.v;
            map = {};
            (r.data || []).forEach(function (row) {
              map[row.dia + ':' + row.slot] = {
                condutor: row.condutor,
                enea: row.enea,
                hora_override: row.hora_override,
                lucas_vai: row.lucas_vai !== false
              };
            });
            setSchedule(map);
            setLoading(false);
          case 2:
            return _context12.a(2);
        }
      }, _callee12);
    }));
    return _loadSchedule.apply(this, arguments);
  }
  function loadHistory() {
    return _loadHistory.apply(this, arguments);
  }
  function _loadHistory() {
    _loadHistory = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee13() {
      var q, r, rows, dayIdx, slotIdx;
      return _regenerator().w(function (_context13) {
        while (1) switch (_context13.n) {
          case 0:
            q = supabase.from('lucas_semana').select('*').order('week_start', {
              ascending: false
            }).limit(300);
            if (fDriver) q = q.eq('condutor', fDriver);
            if (fDay) q = q.eq('dia', fDay);
            if (fSlot) q = q.eq('slot', fSlot);
            _context13.n = 1;
            return q;
          case 1:
            r = _context13.v;
            rows = r.data || [];
            if (fPeriod) rows = rows.filter(function (row) {
              var m = ['leva_manha', 'busca_almoco'].includes(row.slot);
              return fPeriod === 'manha' ? m : !m;
            });
            // Ordenar por dia correto (seg→ter→qua→qui→sex) e slot
            dayIdx = {
              seg: 0,
              ter: 1,
              qua: 2,
              qui: 3,
              sex: 4
            };
            slotIdx = {
              leva_manha: 0,
              busca_almoco: 1,
              leva_tarde: 2,
              busca_fim: 3
            };
            rows.sort(function (a, b) {
              if (a.week_start !== b.week_start) return b.week_start.localeCompare(a.week_start);
              if (a.dia !== b.dia) return (dayIdx[a.dia] || 0) - (dayIdx[b.dia] || 0);
              return (slotIdx[a.slot] || 0) - (slotIdx[b.slot] || 0);
            });
            setHistory(rows);
          case 2:
            return _context13.a(2);
        }
      }, _callee13);
    }));
    return _loadHistory.apply(this, arguments);
  }
  function setSlot(_x18, _x19, _x20) {
    return _setSlot.apply(this, arguments);
  }
  function _setSlot() {
    _setSlot = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee14(dia, slot, condutor) {
      var key, cur, dayLabel, slotNames, quem;
      return _regenerator().w(function (_context14) {
        while (1) switch (_context14.n) {
          case 0:
            setSaving(true);
            key = dia + ':' + slot;
            cur = schedule[key] || {};
            _context14.n = 1;
            return supabase.from('lucas_semana').upsert({
              week_start: toISO(weekStart),
              dia: dia,
              slot: slot,
              condutor: condutor,
              enea: cur.enea || false,
              hora_override: cur.hora_override || null,
              lucas_vai: cur.lucas_vai !== false
            }, {
              onConflict: 'week_start,dia,slot'
            });
          case 1:
            setSchedule(function (p) {
              return Object.assign({}, p, _defineProperty({}, key, Object.assign({}, p[key], {
                condutor: condutor
              })));
            });
            flash(t.guardado);
            if (condutor) {
              dayLabel = (DAYS.find(function (d) {
                return d.key === dia;
              }) || {}).label || dia;
              slotNames = {
                leva_manha: 'Leva manhã',
                busca_almoco: 'Busca almoço',
                leva_tarde: 'Leva tarde',
                busca_fim: 'Busca fim'
              };
              quem = user && (user.display_name || user.member_id) || 'Alguém';
              notificar('🏫 Escola Grenchen', quem + ' preencheu ' + dayLabel + ' — ' + (slotNames[slot] || slot) + ': ' + condutor);
            }
            setSaving(false);
          case 2:
            return _context14.a(2);
        }
      }, _callee14);
    }));
    return _setSlot.apply(this, arguments);
  }
  function toggleEnea(_x21, _x22) {
    return _toggleEnea.apply(this, arguments);
  }
  function _toggleEnea() {
    _toggleEnea = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee15(dia, slot) {
      var key, cur, newEnea;
      return _regenerator().w(function (_context15) {
        while (1) switch (_context15.n) {
          case 0:
            key = dia + ':' + slot;
            cur = schedule[key] || {};
            newEnea = !cur.enea;
            _context15.n = 1;
            return supabase.from('lucas_semana').upsert({
              week_start: toISO(weekStart),
              dia: dia,
              slot: slot,
              condutor: cur.condutor || null,
              enea: newEnea,
              hora_override: cur.hora_override || null,
              lucas_vai: cur.lucas_vai !== false
            }, {
              onConflict: 'week_start,dia,slot'
            });
          case 1:
            setSchedule(function (p) {
              return Object.assign({}, p, _defineProperty({}, key, Object.assign({}, p[key], {
                enea: newEnea
              })));
            });
          case 2:
            return _context15.a(2);
        }
      }, _callee15);
    }));
    return _toggleEnea.apply(this, arguments);
  }
  function toggleLucas(_x23, _x24) {
    return _toggleLucas.apply(this, arguments);
  }
  function _toggleLucas() {
    _toggleLucas = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee16(dia, slot) {
      var key, cur, newLucas;
      return _regenerator().w(function (_context16) {
        while (1) switch (_context16.n) {
          case 0:
            key = dia + ':' + slot;
            cur = schedule[key] || {};
            newLucas = !(cur.lucas_vai !== false);
            _context16.n = 1;
            return supabase.from('lucas_semana').upsert({
              week_start: toISO(weekStart),
              dia: dia,
              slot: slot,
              condutor: cur.condutor || null,
              enea: cur.enea || false,
              hora_override: cur.hora_override || null,
              lucas_vai: newLucas
            }, {
              onConflict: 'week_start,dia,slot'
            });
          case 1:
            setSchedule(function (p) {
              return Object.assign({}, p, _defineProperty({}, key, Object.assign({}, p[key], {
                lucas_vai: newLucas
              })));
            });
          case 2:
            return _context16.a(2);
        }
      }, _callee16);
    }));
    return _toggleLucas.apply(this, arguments);
  }
  function setHoraOverride(_x25, _x26, _x27) {
    return _setHoraOverride.apply(this, arguments);
  }
  function _setHoraOverride() {
    _setHoraOverride = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee17(dia, slot, hora) {
      var key, cur, horaVal;
      return _regenerator().w(function (_context17) {
        while (1) switch (_context17.n) {
          case 0:
            key = dia + ':' + slot;
            cur = schedule[key] || {};
            horaVal = hora || null;
            _context17.n = 1;
            return supabase.from('lucas_semana').upsert({
              week_start: toISO(weekStart),
              dia: dia,
              slot: slot,
              condutor: cur.condutor || null,
              enea: cur.enea || false,
              hora_override: horaVal,
              lucas_vai: cur.lucas_vai !== false
            }, {
              onConflict: 'week_start,dia,slot'
            });
          case 1:
            setSchedule(function (p) {
              return Object.assign({}, p, _defineProperty({}, key, Object.assign({}, p[key], {
                hora_override: horaVal
              })));
            });
            flash(hora ? '✓ Hora excepção guardada' : '✓ Hora reposta ao padrão');
          case 2:
            return _context17.a(2);
        }
      }, _callee17);
    }));
    return _setHoraOverride.apply(this, arguments);
  }
  function toggleDriver(_x28, _x29) {
    return _toggleDriver.apply(this, arguments);
  }
  function _toggleDriver() {
    _toggleDriver = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee18(id, cur) {
      var r;
      return _regenerator().w(function (_context18) {
        while (1) switch (_context18.n) {
          case 0:
            _context18.n = 1;
            return supabase.from('lucas_condutores').update({
              autorizado: !cur
            }).eq('id', id);
          case 1:
            r = _context18.v;
            if (!r.error) {
              setDrivers(function (p) {
                return p.map(function (d) {
                  return d.id === id ? Object.assign({}, d, {
                    autorizado: !cur
                  }) : d;
                });
              });
              flash(!cur ? t.autorizado : '⛔ Removido');
            }
          case 2:
            return _context18.a(2);
        }
      }, _callee18);
    }));
    return _toggleDriver.apply(this, arguments);
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
  var authDrivers = drivers.filter(function (d) {
    return d.autorizado;
  });
  var driverColor = {};
  drivers.forEach(function (d) {
    driverColor[d.nome] = d.cor || C.green;
  });
  var day = DAYS.find(function (d) {
    return d.key === activeDay;
  });
  var isToday = toISO(getMonday(new Date())) === toISO(weekStart);
  var myDriver = drivers.find(function (d) {
    var uname = (typeof user === 'string' ? user : (user && (user.member_id || user.display_name)) || '').toLowerCase();
    return d.nome.toLowerCase() === uname;
  });
  var myDriverName = myDriver ? myDriver.nome : null;

  // ── Componentes ──

  function DriverSelect(_ref2) {
    var dia = _ref2.dia,
      slot = _ref2.slot;
    var key = dia + ':' + slot;
    var val = (schedule[key] || {}).condutor || '';
    var col = val ? driverColor[val] || C.green : '#aaa';
    var isOV = val === 'ÖV';
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        minWidth: 0
      }
    }, isOV && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 22,
        flexShrink: 0
      },
      title: "Transportes p\xFAblicos"
    }, "\uD83D\uDE8C"), /*#__PURE__*/React.createElement("select", {
      value: val,
      onChange: function onChange(e) {
        setSlot(dia, slot, e.target.value);
      },
      style: {
        border: '1.5px solid ' + (val ? col : '#ddd'),
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
    })));
  }
  function KidsBtns(_ref3) {
    var dia = _ref3.dia,
      slot = _ref3.slot;
    var key = dia + ':' + slot;
    var sc = schedule[key] || {};
    var lucasOn = sc.lucas_vai !== false;
    var eneaOn = !!sc.enea;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        toggleLucas(dia, slot);
      },
      style: {
        border: '1.5px solid ' + (lucasOn ? C.blue : '#ddd'),
        borderRadius: 14,
        padding: '3px 9px',
        fontSize: 11,
        background: lucasOn ? '#e3f2fd' : '#f5f5f5',
        color: lucasOn ? C.blue : '#bbb',
        fontWeight: lucasOn ? 700 : 400,
        cursor: 'pointer',
        whiteSpace: 'nowrap'
      }
    }, "\uD83D\uDC66 Lucas", lucasOn ? ' ✓' : ''), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        toggleEnea(dia, slot);
      },
      style: {
        border: '1.5px solid ' + (eneaOn ? C.purple : '#ddd'),
        borderRadius: 14,
        padding: '3px 9px',
        fontSize: 11,
        background: eneaOn ? C.purpleL : '#f5f5f5',
        color: eneaOn ? C.purple : '#bbb',
        fontWeight: eneaOn ? 700 : 400,
        cursor: 'pointer',
        whiteSpace: 'nowrap'
      }
    }, "\uD83D\uDC66 Enea", eneaOn ? ' ✓' : ''));
  }

  // Linha de hora — editável para admin
  function SchoolTimeField(_ref4) {
    var label = _ref4.label,
      cfgKey = _ref4.cfgKey;
    var _useState35 = useState(false),
      _useState36 = _slicedToArray(_useState35, 2),
      editing = _useState36[0],
      setEditing = _useState36[1];
    var _useState37 = useState(''),
      _useState38 = _slicedToArray(_useState37, 2),
      val = _useState38[0],
      setVal = _useState38[1];
    function start() {
      setVal(config[cfgKey] || '');
      setEditing(true);
    }
    function save() {
      setEditing(false);
      if (val && val !== config[cfgKey]) saveConfig(cfgKey, val);
    }
    if (editing) return /*#__PURE__*/React.createElement("input", {
      autoFocus: true,
      type: "time",
      value: val,
      onChange: function onChange(e) {
        setVal(e.target.value);
      },
      onBlur: save,
      onKeyDown: function onKeyDown(e) {
        if (e.key === 'Enter') save();
        if (e.key === 'Escape') setEditing(false);
      },
      style: {
        background: 'rgba(255,255,255,.15)',
        border: '1px solid rgba(255,255,255,.4)',
        borderRadius: 6,
        color: '#fff',
        fontSize: 10,
        padding: '1px 4px',
        width: 68,
        outline: 'none'
      }
    });
    return /*#__PURE__*/React.createElement("div", {
      onClick: function onClick() {
        if (isSuperAdmin) start();
      },
      style: {
        color: 'rgba(255,255,255,.6)',
        fontSize: 10,
        cursor: isSuperAdmin ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        gap: 3
      }
    }, label, " ", config[cfgKey], isSuperAdmin && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 8,
        opacity: 0.5
      }
    }, "\u270F\uFE0F"));
  }
  function TimeRow(_ref5) {
    var dia = _ref5.dia,
      slot = _ref5.slot,
      label = _ref5.label,
      icon = _ref5.icon,
      defaultTime = _ref5.defaultTime,
      subLabel = _ref5.subLabel,
      subTime = _ref5.subTime;
    var key = dia + ':' + slot;
    var override = (schedule[key] || {}).hora_override;
    var displayTime = override || defaultTime;
    var _useState39 = useState(false),
      _useState40 = _slicedToArray(_useState39, 2),
      editing = _useState40[0],
      setEditing = _useState40[1];
    var _useState41 = useState(''),
      _useState42 = _slicedToArray(_useState41, 2),
      val = _useState42[0],
      setVal = _useState42[1];
    var inputRef = useRef(null);
    function startEdit() {
      setVal(override || defaultTime || '');
      setEditing(true);
      setTimeout(function () {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }
    function saveEdit() {
      setEditing(false);
      if (val && val !== defaultTime) setHoraOverride(dia, slot, val);else if (!val) setHoraOverride(dia, slot, null);else if (val === defaultTime) setHoraOverride(dia, slot, null);
    }
    function clearOverride(e) {
      e.stopPropagation();
      setHoraOverride(dia, slot, null);
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '9px 0',
        borderBottom: '1px solid ' + C.border
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
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
    }, label), editing ? /*#__PURE__*/React.createElement("input", {
      ref: inputRef,
      type: "time",
      value: val,
      onChange: function onChange(e) {
        setVal(e.target.value);
      },
      onBlur: saveEdit,
      onKeyDown: function onKeyDown(e) {
        if (e.key === 'Enter') saveEdit();
        if (e.key === 'Escape') {
          setEditing(false);
        }
      },
      style: {
        fontSize: 15,
        fontWeight: 800,
        border: '1.5px solid ' + C.primary,
        borderRadius: 6,
        padding: '2px 6px',
        width: 90,
        outline: 'none'
      }
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 16,
        fontWeight: 800,
        color: '#111'
      }
    }, displayTime), isAdmin && /*#__PURE__*/React.createElement("button", {
      onClick: startEdit,
      title: "Alterar hora",
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: 11,
        color: override ? C.exception : '#ccc',
        padding: '2px 3px',
        lineHeight: 1
      }
    }, "\u270F\uFE0F"), override && isSuperAdmin && /*#__PURE__*/React.createElement("button", {
      onClick: clearOverride,
      title: "Repor hora padr\xE3o",
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: 10,
        color: '#e53935',
        padding: '2px',
        lineHeight: 1
      }
    }, "\u2715"))), subLabel && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: '#aaa',
        marginTop: 3,
        paddingLeft: 30
      }
    }, subLabel, " ", /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        color: '#999'
      }
    }, subTime)));
  }
  function DriveRow(_ref6) {
    var dia = _ref6.dia,
      slot = _ref6.slot,
      label = _ref6.label;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '9px 0',
        borderBottom: '1px solid ' + C.border
      }
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
    }), /*#__PURE__*/React.createElement(KidsBtns, {
      dia: dia,
      slot: slot
    }));
  }
  function SectionTitle(_ref7) {
    var label = _ref7.label,
      color = _ref7.color;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        fontWeight: 800,
        color: color,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginTop: 14,
        marginBottom: 4
      }
    }, label);
  }

  // ── VIEW: PLANO ──
  function ViewPlano() {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        background: C.card,
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        marginBottom: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: prevWeek,
      style: {
        background: 'none',
        border: '1.5px solid #e0e0e0',
        borderRadius: 8,
        width: 36,
        height: 36,
        fontSize: 20,
        cursor: 'pointer',
        color: C.primary
      }
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
    }, isToday ? t.semana_atual : 'Semana'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 800,
        color: C.primary
      }
    }, "KW ", getWeekNumber(weekStart), " \xB7 ", weekLabel(weekStart))), /*#__PURE__*/React.createElement("button", {
      onClick: nextWeek,
      style: {
        background: 'none',
        border: '1.5px solid #e0e0e0',
        borderRadius: 8,
        width: 36,
        height: 36,
        fontSize: 20,
        cursor: 'pointer',
        color: C.primary
      }
    }, "\u203A")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 3,
        marginBottom: 12
      }
    }, DAYS.map(function (d, i) {
      var daySlots = ['leva_manha', 'busca_almoco'].concat(d.tarde ? ['leva_tarde', 'busca_fim'] : []);
      var filled = daySlots.filter(function (sl) {
        return (schedule[d.key + ':' + sl] || {}).condutor;
      }).length;
      var isActive = activeDay === d.key;
      var hasException = daySlots.some(function (sl) {
        return (schedule[d.key + ':' + sl] || {}).hora_override;
      });
      var hasMyDay = myDriverName && daySlots.some(function (sl) {
        return (schedule[d.key + ':' + sl] || {}).condutor === myDriverName;
      });
      return /*#__PURE__*/React.createElement("button", {
        key: d.key,
        onClick: function onClick() {
          setActiveDay(d.key);
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
          gap: 1,
          outline: hasMyDay ? '3px solid #e53935' : hasException ? '2px solid #e53935' : 'none',
          outlineOffset: hasMyDay ? '2px' : '0'
        }
      }, /*#__PURE__*/React.createElement("span", null, d.short, hasMyDay ? ' 🔴' : ''), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 9,
          opacity: 0.7
        }
      }, dayDate(weekStart, i)), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 9,
          fontWeight: 700,
          color: isActive ? 'rgba(255,255,255,.8)' : filled === daySlots.length ? C.green : '#ccc'
        }
      }, filled, "/", daySlots.length));
    })), loading ? /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        padding: 30,
        color: '#bbb'
      }
    }, "A carregar...") : /*#__PURE__*/React.createElement("div", {
      style: {
        background: C.card,
        borderRadius: 16,
        padding: '4px 16px 16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
      }
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
    }, "\uD83D\uDECF 6:15 \xB7 \uD83C\uDFEB 7:05")), /*#__PURE__*/React.createElement(SectionTitle, {
      label: t.manha,
      color: C.blue
    }), /*#__PURE__*/React.createElement(TimeRow, {
      dia: day.key,
      slot: "leva_manha",
      icon: "\uD83C\uDFEB",
      label: t.partida_selzach,
      defaultTime: "7:05",
      subLabel: t.entra_escola,
      subTime: config.escola_comeca
    }), /*#__PURE__*/React.createElement(DriveRow, {
      dia: day.key,
      slot: "leva_manha",
      label: t.levar
    }), /*#__PURE__*/React.createElement(TimeRow, {
      dia: day.key,
      slot: "busca_almoco",
      icon: "\uD83C\uDFE0",
      label: t.saida_grenchen,
      defaultTime: addMin(day.sai, 5),
      subLabel: t.sai_escola,
      subTime: day.sai
    }), /*#__PURE__*/React.createElement(DriveRow, {
      dia: day.key,
      slot: "busca_almoco",
      label: t.buscar
    }), day.tarde ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 1,
        background: '#eee',
        margin: '14px 0 0'
      }
    }), /*#__PURE__*/React.createElement(SectionTitle, {
      label: t.tarde,
      color: C.orange
    }), /*#__PURE__*/React.createElement(TimeRow, {
      dia: day.key,
      slot: "leva_tarde",
      icon: "\uD83C\uDFEB",
      label: t.partida_selzach,
      defaultTime: "13:05",
      subLabel: t.entra_escola,
      subTime: "13:30"
    }), /*#__PURE__*/React.createElement(DriveRow, {
      dia: day.key,
      slot: "leva_tarde",
      label: t.levar
    }), /*#__PURE__*/React.createElement(TimeRow, {
      dia: day.key,
      slot: "busca_fim",
      icon: "\uD83C\uDFE0",
      label: t.saida_grenchen,
      defaultTime: addMin(config.escola_acaba, 5),
      subLabel: t.sai_escola,
      subTime: config.escola_acaba
    }), /*#__PURE__*/React.createElement(DriveRow, {
      dia: day.key,
      slot: "busca_fim",
      label: t.buscar
    })) : /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        color: '#ccc',
        fontStyle: 'italic',
        margin: '18px 0 6px',
        fontSize: 13
      }
    }, "Sem tarde"), isAdmin && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        padding: '8px 10px',
        background: '#f8f9ff',
        borderRadius: 8,
        fontSize: 11,
        color: '#999'
      }
    }, t.hint_editar)));
  }

  // ── VIEW: AUTORIZAÇÕES (só admin) ──
  function ViewAutorizacoes() {
    var _useState43 = useState(false),
      _useState44 = _slicedToArray(_useState43, 2),
      open = _useState44[0],
      setOpen = _useState44[1];
    var _useState45 = useState(false),
      _useState46 = _slicedToArray(_useState45, 2),
      copied = _useState46[0],
      setCopied = _useState46[1];
    var link = 'https://patrsolothurn-glitch.github.io/escola-grenchen/';
    function copyLink() {
      navigator.clipboard.writeText(link).then(function () {
        setCopied(true);
        setTimeout(function () {
          setCopied(false);
        }, 2000);
      });
    }
    function shareWhatsApp() {
      var msg = encodeURIComponent('🏫 Plano de transportes da Escola Grenchen Sek P\n' + link);
      window.open('https://wa.me/?text=' + msg, '_blank');
    }
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        background: C.card,
        borderRadius: 12,
        padding: '14px 16px',
        marginBottom: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        fontWeight: 800,
        color: '#bbb',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 10
      }
    }, "\uD83D\uDD17 Link de acesso"), /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#f5f7ff',
        border: '1.5px solid #e0e4ff',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 11,
        color: '#555',
        wordBreak: 'break-all',
        marginBottom: 10,
        fontFamily: 'monospace'
      }
    }, link), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: copyLink,
      style: {
        flex: 1,
        padding: '10px',
        border: 'none',
        borderRadius: 10,
        cursor: 'pointer',
        background: copied ? C.greenL : C.primary,
        color: copied ? C.green : '#fff',
        fontWeight: 800,
        fontSize: 13
      }
    }, copied ? '✓ Copiado!' : '📋 Copiar link'), /*#__PURE__*/React.createElement("button", {
      onClick: shareWhatsApp,
      style: {
        flex: 1,
        padding: '10px',
        border: 'none',
        borderRadius: 10,
        cursor: 'pointer',
        background: '#25D366',
        color: '#fff',
        fontWeight: 800,
        fontSize: 13
      }
    }, "\uD83D\uDCAC WhatsApp"))), /*#__PURE__*/React.createElement(AddCondutor, null), /*#__PURE__*/React.createElement("div", {
      onClick: function onClick() {
        setOpen(function (v) {
          return !v;
        });
      },
      style: {
        background: open ? C.primary : C.card,
        borderRadius: open ? '12px 12px 0 0' : 12,
        padding: '12px 16px',
        marginBottom: 0,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 800,
        fontSize: 14,
        color: open ? '#fff' : C.primary
      }
    }, "\uD83D\uDD11 Condutores"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: open ? 'rgba(255,255,255,.6)' : '#aaa',
        marginTop: 2
      }
    }, drivers.filter(function (d) {
      return d.autorizado;
    }).length, " autorizados \xB7 ", drivers.filter(function (d) {
      return !d.autorizado;
    }).length, " sem acesso")), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        color: open ? 'rgba(255,255,255,.7)' : '#bbb'
      }
    }, open ? '⌄' : '›')), open && /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#f8f9ff',
        borderRadius: '0 0 12px 12px',
        padding: '12px 14px',
        marginBottom: 14,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }
    }, drivers.map(function (d) {
      var col = d.cor || C.green;
      return /*#__PURE__*/React.createElement("div", {
        key: d.id,
        style: {
          background: C.card,
          borderRadius: 14,
          padding: '14px 16px',
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          border: '2px solid ' + (d.autorizado ? col : C.border),
          opacity: d.autorizado ? 1 : 0.5,
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'relative',
          flexShrink: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 48,
          height: 48,
          borderRadius: 24,
          overflow: 'hidden',
          background: d.autorizado ? col + '22' : '#f0f0f0',
          border: '2px solid ' + (d.autorizado ? col : '#ddd'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22
        }
      }, d.avatar_base64 ? /*#__PURE__*/React.createElement("img", {
        src: d.avatar_base64,
        style: {
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }
      }) : d.nome === 'ÖV' ? '🚌' : '👤'), isSuperAdmin && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("label", {
        htmlFor: 'avatar-' + d.id,
        style: {
          position: 'absolute',
          bottom: -2,
          right: -2,
          width: 20,
          height: 20,
          borderRadius: 10,
          background: C.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          cursor: 'pointer',
          border: '2px solid #fff'
        }
      }, "\uD83D\uDCF7"), /*#__PURE__*/React.createElement("input", {
        id: 'avatar-' + d.id,
        type: "file",
        accept: "image/*",
        style: {
          display: 'none'
        },
        onChange: function onChange(e) {
          uploadAvatar(d.id, e.target.files[0]);
          e.target.value = '';
        }
      }))), /*#__PURE__*/React.createElement("div", {
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
      }, d.autorizado ? t.autorizado : t.sem_acesso), isSuperAdmin && /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10,
          color: '#bbb'
        }
      }, "\uD83D\uDD11 C\xF3digo:"), /*#__PURE__*/React.createElement(CodeField, {
        driver: d,
        onSave: setAccessCode
      }), /*#__PURE__*/React.createElement(CodeShareBtn, {
        nome: d.nome,
        codigo: d.access_code,
        telefone: d.telefone
      }))), /*#__PURE__*/React.createElement(DriverActions, {
        driver: d
      }));
    })), /*#__PURE__*/React.createElement(VisitantesSection, null));
  }
  function VisitantesSection() {
    var _useState47 = useState(false),
      _useState48 = _slicedToArray(_useState47, 2),
      open = _useState48[0],
      setOpen = _useState48[1];
    var pendentes = visitantes.filter(function (v) {
      return !v.autorizado;
    }).length;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: function onClick() {
        setOpen(function (v) {
          return !v;
        });
      },
      style: {
        background: open ? '#7b1fa2' : C.card,
        borderRadius: open ? '12px 12px 0 0' : 12,
        padding: '12px 16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 800,
        fontSize: 14,
        color: open ? '#fff' : '#7b1fa2'
      }
    }, "\uD83D\uDC4B Visitantes"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: open ? 'rgba(255,255,255,.6)' : '#aaa',
        marginTop: 2
      }
    }, visitantes.length, " registados", pendentes > 0 && ' · ' + pendentes + ' por autorizar')), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, pendentes > 0 && !open && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 800,
        background: '#e53935',
        color: '#fff',
        borderRadius: 10,
        padding: '2px 8px'
      }
    }, pendentes), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        color: open ? 'rgba(255,255,255,.7)' : '#bbb'
      }
    }, open ? '⌄' : '›'))), open && /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#faf5ff',
        borderRadius: '0 0 12px 12px',
        padding: '12px 14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }
    }, /*#__PURE__*/React.createElement(AddVisitante, null), visitantes.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        color: '#ccc',
        fontSize: 12,
        fontStyle: 'italic',
        padding: '12px 0'
      }
    }, "Ainda ningu\xE9m se registou") : /*#__PURE__*/React.createElement(React.Fragment, null, visitantes.filter(function (v) {
      return !v.autorizado;
    }).length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        fontWeight: 800,
        color: '#e65100',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 8,
        paddingLeft: 2
      }
    }, "\u23F3 Por autorizar (", visitantes.filter(function (v) {
      return !v.autorizado;
    }).length, ")"), visitantes.filter(function (v) {
      return !v.autorizado;
    }).map(function (v) {
      return /*#__PURE__*/React.createElement(VisitanteCard, {
        key: v.id,
        v: v
      });
    })), visitantes.filter(function (v) {
      return v.autorizado;
    }).length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        fontWeight: 800,
        color: '#2e7d32',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 8,
        paddingLeft: 2
      }
    }, "\u2713 Autorizados (", visitantes.filter(function (v) {
      return v.autorizado;
    }).length, ")"), visitantes.filter(function (v) {
      return v.autorizado;
    }).map(function (v) {
      return /*#__PURE__*/React.createElement(VisitanteCard, {
        key: v.id,
        v: v
      });
    })))));
  }
  function VisitanteCard(_ref8) {
    var v = _ref8.v;
    var dt = new Date(v.criado_em);
    var dtStr = dt.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit'
    }) + ' ' + dt.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#fff',
        borderRadius: 12,
        padding: '12px 14px',
        marginBottom: 8,
        border: '2px solid ' + (v.autorizado ? '#7b1fa2' : '#eee'),
        opacity: v.autorizado ? 1 : 0.85
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 38,
        height: 38,
        borderRadius: 19,
        flexShrink: 0,
        overflow: 'hidden',
        background: v.autorizado ? '#f3e5f5' : '#f5f5f5',
        border: '2px solid ' + (v.autorizado ? '#7b1fa2' : '#ddd'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16
      }
    }, v.avatar_base64 ? /*#__PURE__*/React.createElement("img", {
      src: v.avatar_base64,
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }) : '👋'), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 800,
        fontSize: 14,
        color: '#333'
      }
    }, v.nome), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: '#aaa'
      }
    }, "Pediu acesso: ", dtStr), (v.email || v.telefone || v.turma) && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: '#999',
        marginTop: 3,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8
      }
    }, v.turma && /*#__PURE__*/React.createElement("span", null, "\uD83C\uDF93 ", v.turma), v.telefone && /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCDE ", v.telefone), v.email && /*#__PURE__*/React.createElement("span", null, "\u2709\uFE0F ", v.email))), /*#__PURE__*/React.createElement(VisitanteActions, {
      visitante: v
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        paddingLeft: 48
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: '#bbb'
      }
    }, "\uD83D\uDD11 C\xF3digo:"), /*#__PURE__*/React.createElement(VisitanteCodeField, {
      visitante: v
    }), /*#__PURE__*/React.createElement(CodeShareBtn, {
      nome: v.nome,
      codigo: v.access_code,
      telefone: v.telefone
    })));
  }
  function AddVisitante() {
    var _useState49 = useState(false),
      _useState50 = _slicedToArray(_useState49, 2),
      show = _useState50[0],
      setShow = _useState50[1];
    var _useState51 = useState(''),
      _useState52 = _slicedToArray(_useState51, 2),
      nome = _useState52[0],
      setNome = _useState52[1];
    var _useState53 = useState(''),
      _useState54 = _slicedToArray(_useState53, 2),
      code = _useState54[0],
      setCode = _useState54[1];
    function submit() {
      if (!nome.trim()) return;
      addVisitante(nome, code);
      setNome('');
      setCode('');
      setShow(false);
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 10
      }
    }, !show ? /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setShow(true);
      },
      style: {
        width: '100%',
        padding: '10px',
        border: '2px dashed #d4a5e8',
        borderRadius: 12,
        background: 'transparent',
        color: '#7b1fa2',
        fontWeight: 700,
        fontSize: 13,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6
      }
    }, "\uFF0B Adicionar visitante") : /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#fff',
        borderRadius: 12,
        padding: '14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 800,
        color: '#7b1fa2',
        marginBottom: 10
      }
    }, "Novo visitante"), /*#__PURE__*/React.createElement("input", {
      value: nome,
      onChange: function onChange(e) {
        setNome(e.target.value);
      },
      placeholder: "Nome do visitante",
      autoFocus: true,
      style: {
        width: '100%',
        border: '1.5px solid #e0e0e0',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 14,
        outline: 'none',
        marginBottom: 8
      }
    }), /*#__PURE__*/React.createElement("input", {
      value: code,
      onChange: function onChange(e) {
        setCode(e.target.value);
      },
      placeholder: "C\xF3digo de acesso (opcional)",
      onKeyDown: function onKeyDown(e) {
        if (e.key === 'Enter') submit();
      },
      style: {
        width: '100%',
        border: '1.5px solid #e0e0e0',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 14,
        outline: 'none',
        marginBottom: 12
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setShow(false);
        setNome('');
        setCode('');
      },
      style: {
        flex: 1,
        padding: '9px',
        border: '1.5px solid #e0e0e0',
        borderRadius: 10,
        background: '#f5f5f5',
        color: '#888',
        fontWeight: 700,
        fontSize: 13,
        cursor: 'pointer'
      }
    }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
      onClick: submit,
      style: {
        flex: 2,
        padding: '9px',
        border: 'none',
        borderRadius: 10,
        background: '#7b1fa2',
        color: '#fff',
        fontWeight: 800,
        fontSize: 13,
        cursor: 'pointer'
      }
    }, "\u2713 Adicionar"))));
  }
  function VisitanteCodeField(_ref9) {
    var visitante = _ref9.visitante;
    var _useState55 = useState(false),
      _useState56 = _slicedToArray(_useState55, 2),
      editing = _useState56[0],
      setEditing = _useState56[1];
    var _useState57 = useState(''),
      _useState58 = _slicedToArray(_useState57, 2),
      val = _useState58[0],
      setVal = _useState58[1];
    var hasCode = !!visitante.access_code;
    function start() {
      setVal(visitante.access_code || '');
      setEditing(true);
    }
    function save() {
      setEditing(false);
      if (val !== (visitante.access_code || '')) setVisitanteCode(visitante.id, val);
    }
    if (editing) return /*#__PURE__*/React.createElement("input", {
      autoFocus: true,
      value: val,
      onChange: function onChange(e) {
        setVal(e.target.value);
      },
      onBlur: save,
      onKeyDown: function onKeyDown(e) {
        if (e.key === 'Enter') save();
        if (e.key === 'Escape') setEditing(false);
      },
      placeholder: "Definir c\xF3digo...",
      style: {
        fontSize: 11,
        border: '1px solid #ddd',
        borderRadius: 6,
        padding: '2px 6px',
        width: 110,
        outline: 'none'
      }
    });
    return /*#__PURE__*/React.createElement("span", {
      onClick: start,
      style: {
        fontSize: 11,
        cursor: 'pointer',
        fontWeight: 700,
        borderRadius: 10,
        padding: '2px 8px',
        background: hasCode ? '#f3e5f5' : '#fff3e0',
        color: hasCode ? '#7b1fa2' : '#e65100',
        border: '1px solid ' + (hasCode ? '#ce93d8' : '#ffcc80')
      }
    }, hasCode ? '●●●● ✏️' : '+ Definir');
  }
  function VisitanteActions(_ref0) {
    var visitante = _ref0.visitante;
    var _useState59 = useState(null),
      _useState60 = _slicedToArray(_useState59, 2),
      confirm = _useState60[0],
      setConfirm = _useState60[1];
    var _stAuthCode = useState(visitante.access_code || ''),
      _stAuthCode2 = _slicedToArray(_stAuthCode, 2),
      authCode = _stAuthCode2[0],
      setAuthCode = _stAuthCode2[1];
    var _stShowCode = useState(false),
      _stShowCode2 = _slicedToArray(_stShowCode, 2),
      showCode = _stShowCode2[0],
      setShowCode = _stShowCode2[1];
    function doAction() {
      if (confirm === 'toggle') toggleVisitante(visitante.id, visitante.autorizado);else if (confirm === 'delete') deleteVisitante(visitante.id);
      setConfirm(null);
    }
    function doAuthorize() {
      if (!authCode.trim()) return;
      authorizeVisitanteWithCode(visitante.id, authCode.trim());
      setShowCode(false);
    }
    if (showCode) return /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }
    }, /*#__PURE__*/React.createElement("input", {
      value: authCode,
      autoFocus: true,
      placeholder: "Código de acesso",
      onChange: function onChange(e) { setAuthCode(e.target.value); },
      onKeyDown: function onKeyDown(e) { if (e.key === 'Enter') doAuthorize(); },
      style: { border: '1.5px solid #7b1fa2', borderRadius: 8, padding: '6px 10px', fontSize: 12, width: 130, outline: 'none' }
    }), /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', gap: 5 }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() { setShowCode(false); },
      style: { border: '1.5px solid #ddd', borderRadius: 16, padding: '5px 9px', background: '#f5f5f5', color: '#888', fontWeight: 700, fontSize: 10, cursor: 'pointer' }
    }, "\u2715"), /*#__PURE__*/React.createElement("button", {
      onClick: doAuthorize,
      style: { border: 'none', borderRadius: 16, padding: '5px 9px', background: authCode.trim() ? '#7b1fa2' : '#ccc', color: '#fff', fontWeight: 800, fontSize: 10, cursor: authCode.trim() ? 'pointer' : 'default' }
    }, "\u2713 Autorizar")));
    if (confirm) return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setConfirm(null);
      },
      style: {
        border: '1.5px solid #ddd',
        borderRadius: 16,
        padding: '5px 9px',
        background: '#f5f5f5',
        color: '#888',
        fontWeight: 700,
        fontSize: 10,
        cursor: 'pointer'
      }
    }, "\u2715"), /*#__PURE__*/React.createElement("button", {
      onClick: doAction,
      style: {
        border: 'none',
        borderRadius: 16,
        padding: '5px 9px',
        background: confirm === 'delete' ? '#c62828' : '#7b1fa2',
        color: '#fff',
        fontWeight: 800,
        fontSize: 10,
        cursor: 'pointer'
      }
    }, "\u2713"));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        if (visitante.autorizado) { setConfirm('toggle'); } else { setShowCode(true); }
      },
      style: {
        border: 'none',
        borderRadius: 16,
        padding: '5px 10px',
        cursor: 'pointer',
        fontSize: 11,
        fontWeight: 700,
        background: visitante.autorizado ? '#ffebee' : '#f3e5f5',
        color: visitante.autorizado ? '#c62828' : '#7b1fa2'
      }
    }, visitante.autorizado ? 'Remover' : 'Autorizar'), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setConfirm('delete');
      },
      style: {
        border: 'none',
        borderRadius: 16,
        padding: '5px 8px',
        cursor: 'pointer',
        background: '#fafafa',
        color: '#ccc',
        fontSize: 10
      }
    }, "\uD83D\uDDD1"));
  }

  // ── VIEW: HISTÓRICO ──
  function FiltroSelect(_ref1) {
    var label = _ref1.label,
      value = _ref1.value,
      _onChange = _ref1.onChange,
      opts = _ref1.opts;
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
        _onChange(e.target.value);
      },
      style: {
        flex: 1,
        border: '1.5px solid ' + (value ? C.primary : '#e0e0e0'),
        borderRadius: 8,
        padding: '5px 8px',
        fontSize: 12,
        background: value ? C.primary + '0d' : '#f9f9f9',
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
  function DriverActions(_ref10) {
    var driver = _ref10.driver;
    var _useState61 = useState(null),
      _useState62 = _slicedToArray(_useState61, 2),
      confirm = _useState62[0],
      setConfirm = _useState62[1]; // null | 'toggle' | 'delete'

    function doAction() {
      if (confirm === 'toggle') {
        toggleDriver(driver.id, driver.autorizado);
      } else if (confirm === 'delete') {
        supabase.from('lucas_condutores').delete().eq('id', driver.id).then(function () {
          flash('Removido');
          loadDrivers();
        });
      }
      setConfirm(null);
    }
    if (confirm) return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        alignItems: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: '#555',
        fontWeight: 700,
        textAlign: 'right'
      }
    }, confirm === 'toggle' ? driver.autorizado ? 'Remover acesso?' : 'Dar acesso?' : 'Apagar ' + driver.nome + '?'), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setConfirm(null);
      },
      style: {
        border: '1.5px solid #ddd',
        borderRadius: 20,
        padding: '6px 12px',
        background: '#f5f5f5',
        color: '#888',
        fontWeight: 700,
        fontSize: 12,
        cursor: 'pointer'
      }
    }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
      onClick: doAction,
      style: {
        border: 'none',
        borderRadius: 20,
        padding: '6px 14px',
        cursor: 'pointer',
        background: confirm === 'delete' ? '#c62828' : driver.autorizado ? '#c62828' : C.green,
        color: '#fff',
        fontWeight: 800,
        fontSize: 12
      }
    }, "\u2713 Confirmar")));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        alignItems: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setConfirm('toggle');
      },
      style: {
        border: 'none',
        borderRadius: 20,
        padding: '7px 14px',
        cursor: 'pointer',
        background: driver.autorizado ? '#ffebee' : C.greenL,
        color: driver.autorizado ? '#c62828' : C.green,
        fontWeight: 700,
        fontSize: 12
      }
    }, driver.autorizado ? 'Sem acesso' : 'Autorizar'), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setConfirm('delete');
      },
      style: {
        border: 'none',
        borderRadius: 20,
        padding: '4px 10px',
        cursor: 'pointer',
        background: '#fafafa',
        color: '#ccc',
        fontWeight: 600,
        fontSize: 10
      }
    }, "\uD83D\uDDD1 Apagar"));
  }
  function CodeField(_ref11) {
    var driver = _ref11.driver,
      onSave = _ref11.onSave;
    var _useState63 = useState(false),
      _useState64 = _slicedToArray(_useState63, 2),
      editing = _useState64[0],
      setEditing = _useState64[1];
    var _useState65 = useState(''),
      _useState66 = _slicedToArray(_useState65, 2),
      val = _useState66[0],
      setVal = _useState66[1];
    var hasCode = !!driver.access_code;
    function start() {
      setVal(driver.access_code || '');
      setEditing(true);
    }
    function save() {
      setEditing(false);
      if (val !== (driver.access_code || '')) onSave(driver.id, val);
    }
    if (editing) return /*#__PURE__*/React.createElement("input", {
      autoFocus: true,
      value: val,
      onChange: function onChange(e) {
        setVal(e.target.value);
      },
      onBlur: save,
      onKeyDown: function onKeyDown(e) {
        if (e.key === 'Enter') save();
        if (e.key === 'Escape') setEditing(false);
      },
      placeholder: "Definir c\xF3digo...",
      style: {
        fontSize: 11,
        border: '1px solid #ddd',
        borderRadius: 6,
        padding: '2px 6px',
        width: 100,
        outline: 'none'
      }
    });
    return /*#__PURE__*/React.createElement("span", {
      onClick: start,
      style: {
        fontSize: 11,
        cursor: 'pointer',
        fontWeight: 700,
        borderRadius: 10,
        padding: '2px 8px',
        background: hasCode ? '#e8f5e9' : '#fff3e0',
        color: hasCode ? '#2e7d32' : '#e65100',
        border: '1px solid ' + (hasCode ? '#a5d6a7' : '#ffcc80')
      }
    }, hasCode ? '●●●● ✏️' : '+ Definir');
  }
  function CodeShareBtn(_ref11b) {
    var nome = _ref11b.nome,
      codigo = _ref11b.codigo,
      telefone = _ref11b.telefone;
    if (!codigo) return null;
    return /*#__PURE__*/React.createElement("button", {
      onClick: function onClick(e) {
        e.stopPropagation();
        enviarCodigoWhatsApp(nome, codigo, telefone);
      },
      title: "Enviar c\u00f3digo por WhatsApp",
      style: {
        marginLeft: 6,
        border: '1px solid #a5d6a7',
        background: '#e8f5e9',
        color: '#2e7d32',
        borderRadius: 10,
        padding: '2px 8px',
        fontSize: 11,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, "\uD83D\uDCAC");
  }
  function AddCondutor() {
    var _useState67 = useState(false),
      _useState68 = _slicedToArray(_useState67, 2),
      show = _useState68[0],
      setShow = _useState68[1];
    var _useState69 = useState(''),
      _useState70 = _slicedToArray(_useState69, 2),
      nome = _useState70[0],
      setNome = _useState70[1];
    var _useState71 = useState('#27ae60'),
      _useState72 = _slicedToArray(_useState71, 2),
      cor = _useState72[0],
      setCor = _useState72[1];
    var CORES = ['#1a237e', '#c2185b', '#2e7d32', '#e65100', '#7b1fa2', '#0288d1', '#f57f17', '#00838f'];
    function submit() {
      if (!nome.trim()) return;
      addCondutor(nome, cor);
      setNome('');
      setShow(false);
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 10
      }
    }, !show ? /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setShow(true);
      },
      style: {
        width: '100%',
        padding: '11px',
        border: '2px dashed #d0d4e8',
        borderRadius: 12,
        background: 'transparent',
        color: C.primary,
        fontWeight: 700,
        fontSize: 13,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6
      }
    }, "\uFF0B Adicionar condutor") : /*#__PURE__*/React.createElement("div", {
      style: {
        background: C.card,
        borderRadius: 12,
        padding: '14px 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 800,
        color: C.primary,
        marginBottom: 10
      }
    }, "Novo condutor"), /*#__PURE__*/React.createElement("input", {
      value: nome,
      onChange: function onChange(e) {
        setNome(e.target.value);
      },
      placeholder: "Nome (ex: Sabine, \xD6V...)",
      onKeyDown: function onKeyDown(e) {
        if (e.key === 'Enter') submit();
      },
      autoFocus: true,
      style: {
        width: '100%',
        border: '1.5px solid #e0e0e0',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 14,
        outline: 'none',
        marginBottom: 12
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: '#999',
        marginBottom: 6,
        fontWeight: 600
      }
    }, "Cor"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        marginBottom: 14,
        flexWrap: 'wrap'
      }
    }, CORES.map(function (c) {
      return /*#__PURE__*/React.createElement("div", {
        key: c,
        onClick: function onClick() {
          setCor(c);
        },
        style: {
          width: 28,
          height: 28,
          borderRadius: 14,
          background: c,
          cursor: 'pointer',
          border: cor === c ? '3px solid #111' : '3px solid transparent',
          transition: 'border .1s'
        }
      });
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setShow(false);
        setNome('');
      },
      style: {
        flex: 1,
        padding: '9px',
        border: '1.5px solid #e0e0e0',
        borderRadius: 10,
        background: '#f5f5f5',
        color: '#888',
        fontWeight: 700,
        fontSize: 13,
        cursor: 'pointer'
      }
    }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
      onClick: submit,
      style: {
        flex: 2,
        padding: '9px',
        border: 'none',
        borderRadius: 10,
        background: cor,
        color: '#fff',
        fontWeight: 800,
        fontSize: 13,
        cursor: 'pointer'
      }
    }, "\u2713 Adicionar"))));
  }
  function WeekBlock(_ref12) {
    var week = _ref12.week,
      rows = _ref12.rows,
      defaultOpen = _ref12.defaultOpen;
    var _useState73 = useState(defaultOpen),
      _useState74 = _slicedToArray(_useState73, 2),
      open = _useState74[0],
      setOpen = _useState74[1];
    var mon = new Date(week + 'T00:00:00');
    var fri = new Date(mon);
    fri.setDate(mon.getDate() + 4);
    var o = {
      day: '2-digit',
      month: '2-digit'
    };
    var condutores = _toConsumableArray(new Set(rows.map(function (r) {
      return r.condutor;
    }).filter(Boolean)));
    var isCurrent = toISO(getMonday(new Date())) === week;
    var dayLabels = {};
    DAYS.forEach(function (d) {
      dayLabels[d.key] = d.label;
    });
    return /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: function onClick() {
        setOpen(function (v) {
          return !v;
        });
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        cursor: 'pointer',
        background: open ? C.primary : C.card,
        borderRadius: open ? '12px 12px 0 0' : 12,
        boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
        transition: 'background .15s'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 800,
        color: open ? '#fff' : C.primary,
        flex: 1
      }
    }, "\uD83D\uDCC5 ", mon.toLocaleDateString('pt-PT', o), " \u2013 ", fri.toLocaleDateString('pt-PT', o)), isCurrent && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9,
        fontWeight: 800,
        background: open ? 'rgba(255,255,255,.2)' : '#e8eaf6',
        color: open ? '#fff' : C.primary,
        borderRadius: 10,
        padding: '2px 7px'
      }
    }, "ATUAL"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: open ? 'rgba(255,255,255,.6)' : '#bbb'
      }
    }, rows.length, " viagens"), !open && condutores.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 4
      }
    }, condutores.slice(0, 3).map(function (nome) {
      var col = driverColor[nome] || '#888';
      return /*#__PURE__*/React.createElement("span", {
        key: nome,
        style: {
          fontSize: 10,
          fontWeight: 700,
          color: col,
          background: col + '18',
          borderRadius: 10,
          padding: '2px 6px'
        }
      }, nome);
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        color: open ? 'rgba(255,255,255,.7)' : '#bbb',
        fontSize: 16,
        lineHeight: 1
      }
    }, open ? '⌄' : '›')), open && /*#__PURE__*/React.createElement("div", {
      style: {
        background: C.card,
        borderRadius: '0 0 12px 12px',
        overflow: 'hidden',
        boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
      }
    }, rows.map(function (r, i) {
      var col = driverColor[r.condutor] || '#888';
      return /*#__PURE__*/React.createElement("div", {
        key: r.dia + r.slot,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '9px 14px',
          borderBottom: i < rows.length - 1 ? '1px solid ' + C.border : 'none'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          color: '#aaa',
          width: 35,
          flexShrink: 0
        }
      }, (dayLabels[r.dia] || r.dia).slice(0, 3)), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          color: '#777',
          flex: 1
        }
      }, SLOT_LABELS[r.slot]), r.hora_override && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10,
          color: C.exception,
          fontWeight: 700
        }
      }, "\u23F0", r.hora_override), r.condutor === 'ÖV' && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 16
        }
      }, "\uD83D\uDE8C"), /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 700,
          color: col,
          fontSize: 12
        }
      }, r.condutor || '—'), r.lucas_vai !== false && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10,
          color: C.blue,
          background: '#e3f2fd',
          borderRadius: 10,
          padding: '1px 7px'
        }
      }, "\uD83D\uDC66L"), r.enea && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10,
          color: C.purple,
          background: C.purpleL,
          borderRadius: 10,
          padding: '1px 7px'
        }
      }, "\uD83D\uDC66E"));
    })));
  }
  function ViewHistorico() {
    var _useState75 = useState(false),
      _useState76 = _slicedToArray(_useState75, 2),
      filtersOpen = _useState76[0],
      setFiltersOpen = _useState76[1];
    var byWeek = {};
    history.forEach(function (r) {
      if (!byWeek[r.week_start]) byWeek[r.week_start] = [];
      byWeek[r.week_start].push(r);
    });
    var hasFilter = fDriver || fDay || fPeriod || fSlot;
    var currentWeekKey = toISO(getMonday(new Date()));
    var weeks = Object.keys(byWeek).sort(function (a, b) {
      return b.localeCompare(a);
    });
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        background: filtersOpen ? C.card : C.card,
        borderRadius: 12,
        marginBottom: 14,
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: function onClick() {
        setFiltersOpen(function (v) {
          return !v;
        });
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 800,
        color: '#bbb',
        letterSpacing: 1.2,
        textTransform: 'uppercase'
      }
    }, "\uD83D\uDD0E Filtros"), hasFilter && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 800,
        background: C.primary,
        color: '#fff',
        borderRadius: 10,
        padding: '2px 7px'
      }
    }, [fDriver, fDay, fPeriod, fSlot].filter(Boolean).length)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 16,
        color: '#bbb'
      }
    }, filtersOpen ? '⌄' : '›')), filtersOpen && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 14px 14px'
      }
    }, /*#__PURE__*/React.createElement("div", {
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
        l: t.manha
      }, {
        v: 'tarde',
        l: t.tarde
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
    }, "\u2715 Limpar filtros"))), history.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        color: '#ccc',
        fontSize: 13,
        marginTop: 30,
        fontStyle: 'italic'
      }
    }, hasFilter ? 'Sem resultados' : 'Sem histórico') : weeks.map(function (week) {
      return /*#__PURE__*/React.createElement(WeekBlock, {
        key: week,
        week: week,
        rows: byWeek[week],
        defaultOpen: week === currentWeekKey
      });
    }));
  }

  // ── VIEW: IMPRIMIR ──
  function ViewImprimir() {
    function handlePrint() {
      var rows = DAYS.map(function (d, i) {
        function cell(slot, defaultTime) {
          var k = d.key + ':' + slot;
          var sc = schedule[k] || {};
          var col = sc.condutor ? driverColor[sc.condutor] || '#333' : '#bbb';
          var hora = sc.hora_override || defaultTime;
          var isOVprint = sc.condutor === 'ÖV';
          return '<td style="border:1px solid #ccc;padding:8px 10px;background:#fff;vertical-align:top">' + '<div style="font-weight:800;font-size:13px;color:' + col + '">' + (isOVprint ? '🚌 ' : '') + (sc.condutor || '—') + '</div>' + (hora ? '<div style="font-size:10px;color:' + (sc.hora_override ? '#e65100' : '#888') + ';margin-top:2px">' + (sc.hora_override ? '⏰ ' : '🕐 ') + hora + '</div>' : '') + (sc.enea ? '<div style="font-size:10px;color:#7b1fa2;margin-top:3px">👦 Enea</div>' : '') + '</td>';
        }
        return '<tr><td style="border:1px solid #ccc;padding:8px;background:#e8eaf6;text-align:center;vertical-align:middle">' + '<div style="font-weight:900;font-size:13px;color:#1a237e">' + d.label + '</div>' + '<div style="font-size:10px;color:#777;margin-top:2px">' + dayDate(weekStart, i) + '</div>' + '<div style="font-size:9px;color:#aaa;margin-top:2px">Sai: ' + d.sai + '</div></td>' + cell('leva_manha') + cell('busca_almoco', addMin(d.sai, 5)) + (d.tarde ? cell('leva_tarde') + cell('busca_fim') : '<td colspan="2" style="border:1px solid #ccc;background:#f5f5f5;text-align:center;color:#ccc;vertical-align:middle">—</td>') + '</tr>';
      }).join('');
      var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Semana do Lucas</title>' + '<style>@page{size:A4 landscape;margin:10mm}*{box-sizing:border-box;margin:0;padding:0}' + 'body{font-family:Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;font-size:12px}' + '.page{display:flex;flex-direction:column}table{width:100%;border-collapse:collapse;table-layout:fixed}' + 'col.c-day{width:11%}col.c-tr{width:22.25%}' + 'th{color:#fff;padding:8px 6px;font-size:10px;text-transform:uppercase;border:1px solid rgba(255,255,255,.3);font-weight:800}' + 'td{border:1px solid #ccc;padding:8px 10px;vertical-align:middle}' + '.no-print{position:fixed;top:10px;right:10px;z-index:99}' + '.no-print button{background:#1a237e;color:#fff;border:none;border-radius:10px;padding:10px 18px;font-size:13px;font-weight:800;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.2)}' + '@media print{.no-print{display:none}}' + '</style></head><body>' + '<div class="no-print"><button onclick="window.close()">✕ Fechar</button></div>' + '<div class="page"><div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1a237e;padding-bottom:8px;margin-bottom:9px">' + '<div><div style="font-size:20px;font-weight:900;color:#1a237e">📅 Semana do Lucas</div>' + '<div style="font-size:9px;color:#777;margin-top:2px">🏫 Grenchen Nord Schule ↔ Selzach · 🛏 6:15 · Entra 7:30</div></div>' + '<div style="font-size:15px;font-weight:800;color:#1a237e">KW ' + getWeekNumber(weekStart) + ' · ' + weekLabel(weekStart) + '</div></div>' + '<table><thead><tr>' + '<th rowspan="2" style="background:#1a237e">Dia / Data</th>' + '<th colspan="2" style="background:#1565c0">🌅 MANHÃ</th>' + '<th colspan="2" style="background:#bf360c">🌤 TARDE</th></tr><tr>' + '<th style="background:#1976d2">🚗 Leva — 7:05</th><th style="background:#1976d2">🚗 Busca</th>' + '<th style="background:#d84315">🚗 Leva — 13:05</th><th style="background:#d84315">🚗 Busca — 16:55</th>' + '</tr></thead><tbody id="tbody">' + rows + '</tbody></table>' + '<div style="margin-top:7px;padding-top:6px;border-top:1px solid #ddd;font-size:9px;color:#777;display:flex;gap:14px">' + '<strong style="color:#333">Legenda:</strong><span>Condutor: quem leva / busca</span>' + '<span style="color:#7b1fa2">👦 Enea vem junto</span>' + '<span style="color:#e65100">⏰ Hora excepção</span></div></div></body></html>';
      var w = window.open('', '_blank');
      w.document.write(html);
      w.document.close();
      setTimeout(function () {
        w.print();
      }, 600);
    }
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        background: C.card,
        borderRadius: 12,
        padding: '14px 16px',
        marginBottom: 14,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 800,
        color: C.primary,
        fontSize: 15
      }
    }, "\uD83D\uDCC5 KW ", getWeekNumber(weekStart), " \xB7 ", weekLabel(weekStart)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: '#aaa',
        marginTop: 2
      }
    }, "Pr\xE9-visualiza\xE7\xE3o")), /*#__PURE__*/React.createElement("button", {
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
      var slots = ['leva_manha', 'busca_almoco'].concat(d.tarde ? ['leva_tarde', 'busca_fim'] : []);
      return /*#__PURE__*/React.createElement("div", {
        key: d.key,
        style: {
          background: C.card,
          borderRadius: 12,
          marginBottom: 8,
          overflow: 'hidden',
          boxShadow: '0 1px 5px rgba(0,0,0,0.07)'
        }
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
        var key = d.key + ':' + slot;
        var sc = schedule[key] || {};
        var col = sc.condutor ? driverColor[sc.condutor] || C.green : '#ccc';
        return /*#__PURE__*/React.createElement("div", {
          key: slot,
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 0',
            borderBottom: '1px solid ' + C.border
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 12,
            color: '#999',
            flex: 1
          }
        }, SLOT_LABELS[slot]), sc.hora_override && /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 10,
            color: C.exception,
            fontWeight: 700
          }
        }, "\u23F0", sc.hora_override), /*#__PURE__*/React.createElement("span", {
          style: {
            fontWeight: 700,
            color: col,
            fontSize: 13
          }
        }, sc.condutor || '—'), sc.lucas_vai !== false && /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 10,
            color: C.blue,
            background: '#e3f2fd',
            borderRadius: 10,
            padding: '1px 7px'
          }
        }, "\uD83D\uDC66L"), sc.enea && /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 10,
            color: C.purple,
            background: C.purpleL,
            borderRadius: 10,
            padding: '1px 7px'
          }
        }, "\uD83D\uDC66E"));
      })));
    }));
  }

  // ── Nav (Acesso só para admin) ──
  var navItems = [{
    key: 'plano',
    icon: '📅',
    label: t.plano
  }, {
    key: 'autorizacoes',
    icon: '🔑',
    label: t.acesso,
    adminOnly: true
  }, {
    key: 'historico',
    icon: '📋',
    label: t.historico
  }, {
    key: 'imprimir',
    icon: '🖨️',
    label: t.imprimir
  }].filter(function (n) {
    return !n.adminOnly || isAdmin;
  });
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
      gap: 10
    }
  }, onBack && /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      background: 'rgba(255,255,255,0.15)',
      border: 'none',
      borderRadius: 10,
      width: 34,
      height: 34,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#fff',
      fontSize: 20,
      flexShrink: 0,
      lineHeight: 1
    }
  }, "\u2039"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, isSuperAdmin && editField === 'nome' ? /*#__PURE__*/React.createElement("input", {
    autoFocus: true,
    value: editVal,
    onChange: function onChange(e) {
      setEditVal(e.target.value);
    },
    onBlur: function onBlur() {
      saveConfig('escola_nome', editVal);
    },
    onKeyDown: function onKeyDown(e) {
      if (e.key === 'Enter') saveConfig('escola_nome', editVal);
      if (e.key === 'Escape') setEditField(null);
    },
    style: {
      background: 'rgba(255,255,255,.15)',
      border: '1px solid rgba(255,255,255,.4)',
      borderRadius: 6,
      color: '#fff',
      fontWeight: 800,
      fontSize: 16,
      padding: '2px 6px',
      width: '100%',
      outline: 'none'
    }
  }) : /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      if (isSuperAdmin) {
        setEditField('nome');
        setEditVal(config.escola_nome);
      }
    },
    style: {
      color: '#fff',
      fontWeight: 800,
      fontSize: 16,
      cursor: isAdmin ? 'pointer' : 'default',
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, "\uD83C\uDFEB ", config.escola_nome, isSuperAdmin && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      opacity: 0.5
    }
  }, "\u270F\uFE0F")), isSuperAdmin && editField === 'morada' ? /*#__PURE__*/React.createElement("input", {
    autoFocus: true,
    value: editVal,
    onChange: function onChange(e) {
      setEditVal(e.target.value);
    },
    onBlur: function onBlur() {
      saveConfig('escola_morada', editVal);
    },
    onKeyDown: function onKeyDown(e) {
      if (e.key === 'Enter') saveConfig('escola_morada', editVal);
      if (e.key === 'Escape') setEditField(null);
    },
    style: {
      background: 'rgba(255,255,255,.1)',
      border: '1px solid rgba(255,255,255,.3)',
      borderRadius: 6,
      color: 'rgba(255,255,255,.9)',
      fontSize: 10,
      padding: '1px 6px',
      width: '100%',
      outline: 'none',
      marginTop: 2
    }
  }) : /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      if (isSuperAdmin) {
        setEditField('morada');
        setEditVal(config.escola_morada);
      }
    },
    style: {
      color: 'rgba(255,255,255,.6)',
      fontSize: 10,
      marginTop: 2,
      cursor: isAdmin ? 'pointer' : 'default',
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, config.escola_morada, isAdmin && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      opacity: 0.5
    }
  }, "\u270F\uFE0F")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      marginTop: 5
    }
  }, /*#__PURE__*/React.createElement(SchoolTimeField, {
    label: "\uD83C\uDFEB",
    cfgKey: "escola_comeca"
  }), /*#__PURE__*/React.createElement(SchoolTimeField, {
    label: "\uD83C\uDFC1",
    cfgKey: "escola_acaba"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      flexShrink: 0
    }
  }, saving && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(255,255,255,.5)',
      fontSize: 11
    }
  }, "..."), toast && /*#__PURE__*/React.createElement("span", {
    style: {
      color: toast.err ? '#ffcdd2' : '#a5d6a7',
      fontSize: 12,
      fontWeight: 700
    }
  }, toast.msg), !saving && !toast && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 2
    }
  }, Object.keys(LANGS).map(function (l) {
    return /*#__PURE__*/React.createElement("button", {
      key: l,
      onClick: function onClick() {
        changeLang(l);
      },
      style: {
        background: lang === l ? 'rgba(255,255,255,0.25)' : 'transparent',
        border: 'none',
        borderRadius: 6,
        padding: '2px 4px',
        cursor: 'pointer',
        fontSize: 16,
        opacity: lang === l ? 1 : 0.45,
        transition: 'all .15s'
      }
    }, LANGS[l].flag);
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 12px 80px'
    }
  }, view === 'plano' && /*#__PURE__*/React.createElement(ViewPlano, null), view === 'autorizacoes' && isAdmin && /*#__PURE__*/React.createElement(ViewAutorizacoes, null), view === 'historico' && /*#__PURE__*/React.createElement(ViewHistorico, null), view === 'imprimir' && /*#__PURE__*/React.createElement(ViewImprimir, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 500,
      background: C.card,
      borderTop: '1px solid ' + C.border,
      display: 'flex',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.08)',
      zIndex: 30
    }
  }, navItems.map(function (n) {
    return /*#__PURE__*/React.createElement("button", {
      key: n.key,
      onClick: function onClick() {
        setView(n.key);
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
