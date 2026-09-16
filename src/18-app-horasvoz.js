// ══════════════════════════════════════════════════════════════════
// APP HORAS POR VOZ — Registo de horas por voz (admin only, só Patricio)
// Só lê/escreve em horas_voz e horas_voz_config. Nunca mistura com
// horaspro_*, agenda_pro_jobs, ou qualquer outra tabela de outra app.
// Todo o estado em HorasVozApp (sem hooks em sub-componentes).
// ══════════════════════════════════════════════════════════════════

var HV_TIPOS = [
  { key: 'trabalho', label: 'Trabalho', emoji: '💼' },
  { key: 'ferias', label: 'Férias', emoji: '🏖' },
  { key: 'doente', label: 'Doente', emoji: '🤒' },
  { key: 'feriado', label: 'Feriado', emoji: '🎉' },
  { key: 'fecho', label: 'Fecho Dez.', emoji: '🔒' }
];
function hvTipoInfo(key) {
  for (var i = 0; i < HV_TIPOS.length; i++) { if (HV_TIPOS[i].key === key) return HV_TIPOS[i]; }
  return null;
}

var HV_CONFIG_DEFAULT = {
  valido_desde: '2025-08-01', percentagem: 70, horas_dia_100: 8.6, horas_ausencia_100: 8.4,
  dias_trabalho: [1, 2, 3, 4], feriado_base: 'ausencia', pausa_min: 15,
  manha_inicio: '07:00', manha_fim: '12:00', tarde_inicio: '12:45', tarde_fim: '16:15'
};

// ── Datas (tudo em UTC para não haver deslizes de fuso horário) ──
function hvMk(dateStr) { var a = (dateStr || '').split('-'); return new Date(Date.UTC(+a[0], +a[1] - 1, +a[2])); }
function hvIso(d) { return d.toISOString().slice(0, 10); }
function hvAddD(d, n) { var y = new Date(d.getTime()); y.setUTCDate(y.getUTCDate() + n); return y; }
function hvDi(d) { return (d.getUTCDay() + 6) % 7; } // 0=segunda..6=domingo
function hvMon(d) { return hvAddD(d, -hvDi(d)); }
function hvFmt(d) { return String(d.getUTCDate()).padStart(2, '0') + '.' + String(d.getUTCMonth() + 1).padStart(2, '0') + '.'; }
function hvKw(d) {
  var x = new Date(d.getTime());
  x.setUTCDate(x.getUTCDate() + 4 - (hvDi(x) + 1) + 1);
  var y = new Date(Date.UTC(x.getUTCFullYear(), 0, 1));
  return Math.ceil(((x - y) / 86400000 + 1) / 7);
}
function hvTodayIso() { var n = new Date(); return hvIso(new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()))); }
function hvWeekDays(mondayStr) { var m = hvMk(mondayStr); var out = []; for (var i = 0; i < 7; i++) out.push(hvIso(hvAddD(m, i))); return out; }
var HV_DIA_CURTO = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
var HV_DIA_LONGO = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
var HV_MESES_LABEL = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
function hvMonthKey(y, m) { return y + '-' + String(m + 1).padStart(2, '0'); }
function hvFmtDataLonga(dateStr) {
  var p = dateStr.split('-');
  return p[2] + '/' + p[1] + '/' + p[0];
}
function hvDaysInMonth(y, m) { return new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); }

// ── Horas ──────────────────────────────────────────────────────────
function hvTimeToMin(hhmm) {
  if (!hhmm) return null;
  var p = String(hhmm).slice(0, 5).split(':');
  return (+p[0]) * 60 + (+p[1] || 0);
}
// +1e-9 antes do Math.round: os cálculos nunca arredondam por dentro (só à
// apresentação), mas isso significa que uma fronteira EXATA de meio-minuto
// (ex.: 7.525h = 451.5 min) às vezes chega aqui como 451.49999999999994 por
// erro de vírgula flutuante — sem o epsilon isso arredondava para baixo em
// vez de para cima, de forma imprevisível consoante a conta.
function hvMinToHM(min) {
  if (min == null) return '—';
  var neg = min < 0;
  min = Math.round(Math.abs(min) + 1e-9);
  var h = Math.floor(min / 60), m = min % 60;
  return (neg ? '-' : '') + h + ':' + String(m).padStart(2, '0');
}
function hvDez(h) { return Math.round((h || 0) * 100 + 1e-9) / 100; }
// Formato de relógio HH:MM (sempre 2 dígitos nas horas) — para <input type="time">
// e para os campos manha_inicio/fim/tarde_inicio/fim que o parser de voz produz.
// Não confundir com hvMinToHM, que é só para MOSTRAR totais/metas/saldos (sem zero à esquerda).
function hvClockStr(min) {
  min = Math.round(min + 1e-9);
  var h = Math.floor(min / 60), m = min % 60;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}
function hvAddMin(hhmm, delta) {
  var m = hvTimeToMin(hhmm) || 0;
  m = Math.max(0, Math.min(23 * 60 + 59, m + delta));
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
}

// ── Motor de cálculo ─────────────────────────────────────────────
function hvBlocoMin(inicio, fim) {
  if (!inicio || !fim) return 0;
  var a = hvTimeToMin(inicio), b = hvTimeToMin(fim);
  return Math.max(0, b - a);
}
function hvTrabalhadoMin(row, pausaDefault) {
  if (!row) return 0;
  var raw = hvBlocoMin(row.manha_inicio, row.manha_fim) + hvBlocoMin(row.tarde_inicio, row.tarde_fim);
  if (raw <= 0) return 0;
  var pausa = (row.pausa_min != null ? row.pausa_min : pausaDefault) || 0;
  return Math.max(0, raw - pausa);
}
function hvDerivados(cfg) {
  var base_dia = cfg.horas_dia_100 * cfg.percentagem / 100;
  var meta_semana = base_dia * 5;
  var credito_ausencia = cfg.horas_ausencia_100 * cfg.percentagem / 100;
  return { base_dia: base_dia, meta_semana: meta_semana, credito_ausencia: credito_ausencia };
}
function hvCredito(row, cfg, der) {
  if (!row) return 0;
  if (row.tipo === 'ferias' || row.tipo === 'doente') return (row.fracao === 0.5 ? 0.5 : 1) * der.credito_ausencia;
  if (row.tipo === 'fecho') return der.base_dia;
  if (row.tipo === 'feriado') return cfg.feriado_base === 'dia' ? der.base_dia : der.credito_ausencia;
  return 0; // trabalho
}
function hvTotalDia(row, cfg, der) {
  return hvTrabalhadoMin(row, cfg.pausa_min) / 60 + hvCredito(row, cfg, der);
}
function hvPesoDia(row, emDiasTrab) {
  if (!row) return emDiasTrab ? 1 : 0;
  if (row.tipo === 'trabalho') return 1;
  if (row.tipo === 'ferias' || row.tipo === 'doente') return row.fracao === 0.5 ? 0.5 : 0;
  return 0; // feriado, fecho
}
// weekDays: array de 7 { date, row } (index 0..6 = Seg..Dom)
function hvComputeWeek(cfg, weekDays) {
  var der = hvDerivados(cfg);
  var diasTrabalho = cfg.dias_trabalho || [];
  var uteis = weekDays.slice(0, 5).map(function (d, idx) {
    var isoDow = idx + 1;
    var emDiasTrab = diasTrabalho.indexOf(isoDow) !== -1;
    var livre = !emDiasTrab && !d.row;
    return { date: d.date, row: d.row, isoDow: isoDow, emDiasTrab: emDiasTrab, livre: livre };
  });
  var bolo = 0;
  uteis.forEach(function (d) { if (d.livre) bolo += der.base_dia; });
  uteis.forEach(function (d) { d.peso = d.livre ? 0 : hvPesoDia(d.row, d.emDiasTrab); });
  var somaPesos = uteis.reduce(function (s, d) { return s + (d.livre ? 0 : d.peso); }, 0);
  var aviso = null;
  var metas = uteis.map(function (d) {
    if (d.livre) return 0;
    if (somaPesos > 0) return der.base_dia + d.peso * (bolo / somaPesos);
    return der.base_dia;
  });
  if (somaPesos === 0 && bolo > 0) {
    var livreIdx = [];
    uteis.forEach(function (d, i) { if (d.livre) livreIdx.push(i); });
    if (livreIdx.length) {
      var cada = bolo / livreIdx.length;
      livreIdx.forEach(function (i) { metas[i] = cada; });
      aviso = 'Sem dias de trabalho para compensar a sexta — marca a sexta também?';
    }
  }
  var metasCompletas = metas.concat([0, 0]);
  var totais = weekDays.map(function (d, i) { return i < 5 ? hvTotalDia(d.row, cfg, der) : 0; });
  return { der: der, dias: uteis, metas: metasCompletas, totais: totais, bolo: bolo, somaPesos: somaPesos, aviso: aviso, meta_semana: der.meta_semana };
}

// ── Configuração (histórico por valido_desde) ─────────────────────
function hvConfigParaData(configs, dataStr) {
  if (!configs || !configs.length) return HV_CONFIG_DEFAULT;
  var candidatos = configs.filter(function (c) { return c.valido_desde <= dataStr; });
  var lista = candidatos.length ? candidatos : configs.slice();
  lista = lista.slice().sort(function (a, b) { return a.valido_desde < b.valido_desde ? 1 : -1; });
  return lista[0];
}
function hvConfigParaSemana(configs, segundaStr) { return hvConfigParaData(configs, segundaStr); }

// ── Validação ──────────────────────────────────────────────────────
function hvValidar(payload) {
  var erros = [];
  var temManha = !!(payload.manha_inicio && payload.manha_fim);
  var temTarde = !!(payload.tarde_inicio && payload.tarde_fim);
  if (payload.tipo === 'trabalho' && !temManha && !temTarde) {
    erros.push('Indica pelo menos um período trabalhado (manhã ou tarde).');
  }
  if ((payload.tipo === 'feriado' || payload.tipo === 'fecho') && (temManha || temTarde)) {
    erros.push('Feriado e Fecho de Dezembro não têm horas.');
  }
  if ((payload.tipo === 'ferias' || payload.tipo === 'doente') && payload.fracao !== 0.5 && (temManha || temTarde)) {
    erros.push('Dia inteiro de ausência não tem horas — escolhe "Meio dia" se trabalhaste uma parte.');
  }
  if (temManha && hvTimeToMin(payload.manha_fim) <= hvTimeToMin(payload.manha_inicio)) {
    erros.push('A hora de fim da manhã tem de ser depois do início.');
  }
  if (temTarde && hvTimeToMin(payload.tarde_fim) <= hvTimeToMin(payload.tarde_inicio)) {
    erros.push('A hora de fim da tarde tem de ser depois do início.');
  }
  if (temManha && temTarde && hvTimeToMin(payload.tarde_inicio) < hvTimeToMin(payload.manha_fim)) {
    erros.push('A tarde tem de começar depois (ou ao mesmo tempo) do fim da manhã.');
  }
  return erros;
}

// ── Parser de voz (português) ─────────────────────────────────────
function hvNormalizar(s) { return (s || '').toLowerCase().trim().replace(/\s+/g, ' '); }
var HV_MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
var HV_DIA_ALIASES = {
  'domingo': 0, 'segunda': 1, 'segunda-feira': 1, 'terça': 2, 'terca': 2, 'terça-feira': 2, 'terca-feira': 2,
  'quarta': 3, 'quarta-feira': 3, 'quinta': 4, 'quinta-feira': 4, 'sexta': 5, 'sexta-feira': 5,
  'sábado': 6, 'sabado': 6
};
var HV_MES_ALIASES = { 'marco': 2 };
function hvIsoDate(y, m, d) { return new Date(Date.UTC(y, m, d)).toISOString().slice(0, 10); }
function hvAddDias(dateStr, n) {
  var p = dateStr.split('-');
  var dt = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}
function hvIsoDow(dateStr) {
  var p = dateStr.split('-');
  return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).getUTCDay(); // 0=domingo..6=sábado
}
function hvUltimoDiaSemana(hojeStr, dow) {
  var d = hojeStr;
  for (var i = 0; i < 7; i++) { if (hvIsoDow(d) === dow) return d; d = hvAddDias(d, -1); }
  return hojeStr;
}
function hvParseData(textoNorm, hojeStr) {
  if (/\bhoje\b/.test(textoNorm)) return hojeStr;
  if (/\banteontem\b/.test(textoNorm)) return hvAddDias(hojeStr, -2);
  if (/\bontem\b/.test(textoNorm)) return hvAddDias(hojeStr, -1);
  for (var nome in HV_DIA_ALIASES) {
    if (new RegExp('\\b' + nome + '\\b').test(textoNorm)) return hvUltimoDiaSemana(hojeStr, HV_DIA_ALIASES[nome]);
  }
  var mNomeada = textoNorm.match(/\b(\d{1,2})\s+de\s+([a-zçã]+)(?:\s+de\s+(\d{4}))?\b/);
  if (mNomeada) {
    var mesIdx = HV_MESES.indexOf(mNomeada[2]);
    if (mesIdx === -1 && HV_MES_ALIASES[mNomeada[2]] != null) mesIdx = HV_MES_ALIASES[mNomeada[2]];
    if (mesIdx !== -1) return hvIsoDate(mNomeada[3] ? +mNomeada[3] : +hojeStr.slice(0, 4), mesIdx, +mNomeada[1]);
  }
  var mDia = textoNorm.match(/\bdia\s+(\d{1,2})\b/);
  if (mDia) { var hp = hojeStr.split('-'); return hvIsoDate(+hp[0], +hp[1] - 1, +mDia[1]); }
  return hojeStr;
}
function hvParseTimePhrase(s) {
  s = hvNormalizar(s);
  if (/^meio[\s-]?dia/.test(s)) return 12 * 60;
  if (/^meia[\s-]?noite/.test(s)) return 0;
  var ehTarde = /tarde|noite/.test(s);
  var m;
  m = s.match(/^(\d{1,2})\s+e\s+um\s+quarto/) || s.match(/^(\d{1,2})\s+e\s+quarto/);
  if (m) { var h = +m[1]; if (ehTarde && h < 12) h += 12; return h * 60 + 15; }
  m = s.match(/^(\d{1,2})\s+e\s+meia/);
  if (m) { var h = +m[1]; if (ehTarde && h < 12) h += 12; return h * 60 + 30; }
  m = s.match(/^(\d{1,2})\s+e\s+(\d{1,2})\b/);
  if (m) { var h = +m[1], mm = +m[2]; if (ehTarde && h < 12) h += 12; return h * 60 + mm; }
  m = s.match(/^(\d{1,2})\s*h\s*(\d{1,2})?/);
  if (m) { var h = +m[1], mm = m[2] ? +m[2] : 0; if (ehTarde && h < 12) h += 12; return h * 60 + mm; }
  m = s.match(/^(\d{1,2}):(\d{2})/);
  if (m) { var h = +m[1], mm = +m[2]; if (ehTarde && h < 12) h += 12; return h * 60 + mm; }
  m = s.match(/^(\d{1,2})\s*horas?\b/);
  if (m) { var h = +m[1]; if (ehTarde && h < 12) h += 12; return h * 60; }
  m = s.match(/^(\d{1,2})$/);
  if (m) { var h = +m[1]; if (ehTarde && h < 12) h += 12; return h * 60; }
  return null;
}
function hvExtractBlocos(textoNorm) {
  var blocos = [];
  var re = /\b(?:das|de)\b/gi;
  var m;
  while ((m = re.exec(textoNorm))) {
    var start = m.index + m[0].length;
    var rest = textoNorm.slice(start, start + 60);
    var connRe = /(?:^|\s)(até\s+às|até\s+as|às|as|a)(?=\s|$)/i;
    var cm = connRe.exec(rest);
    if (!cm) continue;
    var time1Str = rest.slice(0, cm.index).trim();
    var afterConn = rest.slice(cm.index + cm[0].length);
    var stopRe = /\b(e\s+das|e\s+de)\b|[,.]|$/i;
    var sm = stopRe.exec(afterConn);
    var time2End = sm ? sm.index : afterConn.length;
    var time2Str = afterConn.slice(0, time2End).trim();
    var t1 = hvParseTimePhrase(time1Str);
    var t2 = hvParseTimePhrase(time2Str);
    if (t1 != null && t2 != null) {
      blocos.push({ inicioMin: t1, fimMin: t2 });
      re.lastIndex = start + cm.index + cm[0].length + time2End;
    }
  }
  return blocos;
}
function hvParseTipo(textoNorm) {
  var meioDia = /\bmeio[\s-]?dia\b/.test(textoNorm);
  if (/\bferias\b|\bférias\b/.test(textoNorm)) return { tipo: 'ferias', fracao: meioDia ? 0.5 : 1 };
  if (/\bdoente\b|\bbaixa\b/.test(textoNorm)) return { tipo: 'doente', fracao: meioDia ? 0.5 : 1 };
  if (/\bferiado\b/.test(textoNorm)) return { tipo: 'feriado', fracao: 1 };
  if (/\bfecho\b/.test(textoNorm)) return { tipo: 'fecho', fracao: 1 };
  return { tipo: 'trabalho', fracao: 1 };
}
function hvParsePeriodo(textoNorm, hojeStr) {
  var tipoInfo = hvParseTipo(textoNorm);
  if (tipoInfo.tipo === 'trabalho') return null;
  var mDatas = textoNorm.match(/\bde\s+(\d{1,2})\s+a\s+(\d{1,2})\s+de\s+([a-zçã]+)\b/);
  if (mDatas) {
    var mesIdx = HV_MESES.indexOf(mDatas[3]);
    if (mesIdx === -1 && HV_MES_ALIASES[mDatas[3]] != null) mesIdx = HV_MES_ALIASES[mDatas[3]];
    if (mesIdx !== -1) {
      var ano = +hojeStr.slice(0, 4);
      return { tipo: tipoInfo.tipo, inicio: hvIsoDate(ano, mesIdx, +mDatas[1]), fim: hvIsoDate(ano, mesIdx, +mDatas[2]) };
    }
  }
  var mDiasSemana = textoNorm.match(/\bde\s+(segunda|ter[çc]a|quarta|quinta|sexta|s[áa]bado|domingo)(?:-feira)?\s+a\s+(segunda|ter[çc]a|quarta|quinta|sexta|s[áa]bado|domingo)(?:-feira)?\b/);
  if (mDiasSemana) {
    var d1 = HV_DIA_ALIASES[mDiasSemana[1]], d2 = HV_DIA_ALIASES[mDiasSemana[2]];
    var inicio = hvUltimoDiaSemana(hojeStr, d1);
    var fim = inicio;
    for (var i = 0; i < 7; i++) { if (hvIsoDow(fim) === d2) break; fim = hvAddDias(fim, 1); }
    return { tipo: tipoInfo.tipo, inicio: inicio, fim: fim };
  }
  var mDesde = textoNorm.match(/\bdesde\s+(segunda|ter[çc]a|quarta|quinta|sexta|s[áa]bado|domingo)(?:-feira)?\b/);
  if (mDesde) {
    var inicio2 = hvUltimoDiaSemana(hojeStr, HV_DIA_ALIASES[mDesde[1]]);
    return { tipo: tipoInfo.tipo, inicio: inicio2, fim: hojeStr };
  }
  return null;
}
function hvParseVoz(texto, hojeStr) {
  var textoNorm = hvNormalizar(texto);
  var periodo = hvParsePeriodo(textoNorm, hojeStr);
  if (periodo) return { ok: true, ePeriodo: true, periodo: periodo, textoOriginal: texto };
  var tipoInfo = hvParseTipo(textoNorm);
  var data = hvParseData(textoNorm, hojeStr);
  var blocos = hvExtractBlocos(textoNorm);
  if (blocos.length > 2) return { ok: false, erro: 'Percebi mais de dois períodos de horas — diz só a manhã e a tarde.', textoOriginal: texto };
  var manha = null, tarde = null;
  if (blocos.length === 2) { manha = blocos[0]; tarde = blocos[1]; }
  else if (blocos.length === 1) { if (blocos[0].inicioMin < 12 * 60) manha = blocos[0]; else tarde = blocos[0]; }
  return {
    ok: true, ePeriodo: false, data: data, tipo: tipoInfo.tipo, fracao: tipoInfo.fracao,
    manha_inicio: manha ? hvClockStr(manha.inicioMin) : null, manha_fim: manha ? hvClockStr(manha.fimMin) : null,
    tarde_inicio: tarde ? hvClockStr(tarde.inicioMin) : null, tarde_fim: tarde ? hvClockStr(tarde.fimMin) : null,
    textoOriginal: texto
  };
}
// Sextas "em falta": seg-qui de uma semana ISO dentro de [inicio,fim] mas a sexta não
function hvSextasEmFalta(inicio, fim) {
  var out = [], vistas = {}, d = inicio;
  while (d <= fim) {
    var seg = hvIso(hvMon(hvMk(d)));
    if (!vistas[seg]) {
      vistas[seg] = true;
      var wk = hvWeekDays(seg);
      var segQuiDentro = [0, 1, 2, 3].every(function (i) { return wk[i] >= inicio && wk[i] <= fim; });
      if (segQuiDentro && !(wk[4] >= inicio && wk[4] <= fim)) out.push(wk[4]);
    }
    d = hvAddDias(d, 1);
  }
  return out;
}
function hvDiasUteisPeriodo(inicio, fim) {
  var out = [], d = inicio;
  while (d <= fim) { if (hvDi(hvMk(d)) <= 4) out.push(d); d = hvAddDias(d, 1); }
  return out;
}

// ══════════════════════════════════════════════════════════════════
// PARSER DE VOZ EM ALEMÃO — espelha hvParseVoz/hvExtractBlocos/
// hvParseData/hvParseTipo em vocabulário e forma (mesmas formas de
// retorno), sem tocar em nenhuma função do parser PT. Só a variante
// não-período (sem "de X a Y") é suportada, como no PT sem período.
// ══════════════════════════════════════════════════════════════════
var HV_MESES_DE = ['januar', 'februar', 'märz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember'];
var HV_MES_ALIASES_DE = { 'marz': 2 };
var HV_DIA_ALIASES_DE = {
  'sonntag': 0, 'montag': 1, 'dienstag': 2, 'mittwoch': 3, 'donnerstag': 4, 'freitag': 5, 'samstag': 6, 'sonnabend': 6
};
var HV_NUM_DE = {
  'ein': 1, 'eins': 1, 'zwei': 2, 'drei': 3, 'vier': 4, 'fünf': 5, 'funf': 5, 'sechs': 6, 'sieben': 7,
  'acht': 8, 'neun': 9, 'zehn': 10, 'elf': 11, 'zwölf': 12, 'zwolf': 12
};
function hvParseDataDe(textoNorm, hojeStr) {
  if (/\bheute\b/.test(textoNorm)) return hojeStr;
  if (/\bvorgestern\b/.test(textoNorm)) return hvAddDias(hojeStr, -2);
  if (/\bgestern\b/.test(textoNorm)) return hvAddDias(hojeStr, -1);
  for (var nome in HV_DIA_ALIASES_DE) {
    if (new RegExp('\\b' + nome + '\\b').test(textoNorm)) return hvUltimoDiaSemana(hojeStr, HV_DIA_ALIASES_DE[nome]);
  }
  var mNomeada = textoNorm.match(/\b(\d{1,2})\.?\s+([a-zäöü]+)(?:\s+(\d{4}))?\b/);
  if (mNomeada) {
    var mesIdx = HV_MESES_DE.indexOf(mNomeada[2]);
    if (mesIdx === -1 && HV_MES_ALIASES_DE[mNomeada[2]] != null) mesIdx = HV_MES_ALIASES_DE[mNomeada[2]];
    if (mesIdx !== -1) return hvIsoDate(mNomeada[3] ? +mNomeada[3] : +hojeStr.slice(0, 4), mesIdx, +mNomeada[1]);
  }
  return hojeStr;
}
function hvNumeroDe(tok) { return HV_NUM_DE[tok] != null ? HV_NUM_DE[tok] : (/^\d{1,2}$/.test(tok) ? +tok : null); }
function hvParseHoraDe(s) {
  s = hvNormalizar(s);
  var ehTarde = /nachmittag|abend/.test(s);
  var m;
  m = s.match(/^halb\s+([a-zäöü]+|\d{1,2})/);
  if (m) { var h1 = hvNumeroDe(m[1]); if (h1 != null) { var hh1 = h1 - 1; if (ehTarde && hh1 < 12) hh1 += 12; return hh1 * 60 + 30; } }
  m = s.match(/^viertel\s+nach\s+([a-zäöü]+|\d{1,2})/);
  if (m) { var h2 = hvNumeroDe(m[1]); if (h2 != null) { var hh2 = h2; if (ehTarde && hh2 < 12) hh2 += 12; return hh2 * 60 + 15; } }
  m = s.match(/^viertel\s+vor\s+([a-zäöü]+|\d{1,2})/);
  if (m) { var h3 = hvNumeroDe(m[1]); if (h3 != null) { var hh3 = h3 - 1; if (ehTarde && hh3 < 12) hh3 += 12; return hh3 * 60 + 45; } }
  m = s.match(/^(\d{1,2})\s*uhr\s*(\d{1,2})?/);
  if (m) { var h4 = +m[1], mm4 = m[2] ? +m[2] : 0; if (ehTarde && h4 < 12) h4 += 12; return h4 * 60 + mm4; }
  m = s.match(/^(\d{1,2}):(\d{2})/);
  if (m) { var h5 = +m[1], mm5 = +m[2]; if (ehTarde && h5 < 12) h5 += 12; return h5 * 60 + mm5; }
  m = s.match(/^(\d{1,2})$/);
  if (m) { var h6 = +m[1]; if (ehTarde && h6 < 12) h6 += 12; return h6 * 60; }
  m = s.match(/^([a-zäöü]+)$/);
  if (m) { var h7 = hvNumeroDe(m[1]); if (h7 != null) { if (ehTarde && h7 < 12) h7 += 12; return h7 * 60; } }
  return null;
}
function hvExtractBlocosDe(textoNorm) {
  var blocos = [];
  var re = /\bvon\b/gi;
  var m;
  while ((m = re.exec(textoNorm))) {
    var start = m.index + m[0].length;
    var rest = textoNorm.slice(start, start + 60);
    var connRe = /(?:^|\s)(bis)(?=\s|$)/i;
    var cm = connRe.exec(rest);
    if (!cm) continue;
    var time1Str = rest.slice(0, cm.index).trim();
    var afterConn = rest.slice(cm.index + cm[0].length);
    var stopRe = /\b(und\s+von)\b|[,.]|$/i;
    var sm = stopRe.exec(afterConn);
    var time2End = sm ? sm.index : afterConn.length;
    var time2Str = afterConn.slice(0, time2End).trim();
    var t1 = hvParseHoraDe(time1Str);
    var t2 = hvParseHoraDe(time2Str);
    if (t1 != null && t2 != null) {
      blocos.push({ inicioMin: t1, fimMin: t2 });
      re.lastIndex = start + cm.index + cm[0].length + time2End;
    }
  }
  return blocos;
}
function hvParseTipoDe(textoNorm) {
  var meioDia = /\bhalbtag\b/.test(textoNorm);
  if (/\bferien\b|\burlaub\b/.test(textoNorm)) return { tipo: 'ferias', fracao: meioDia ? 0.5 : 1 };
  if (/\bkrank\b/.test(textoNorm)) return { tipo: 'doente', fracao: meioDia ? 0.5 : 1 };
  if (/\bbetriebsferien\b/.test(textoNorm)) return { tipo: 'fecho', fracao: 1 };
  if (/\bfeiertag\b/.test(textoNorm)) return { tipo: 'feriado', fracao: 1 };
  return { tipo: 'trabalho', fracao: 1 };
}
// Bloco da tarde: se a hora reconhecida ficou < 12h (ex.: "vier" = 4),
// assume-se tarde por ser o segundo bloco ("von...bis...und von...bis...").
function hvAjustarTardeDe(bloco) {
  var ini = bloco.inicioMin, fim = bloco.fimMin;
  if (ini < 12 * 60) ini += 12 * 60;
  if (fim < 12 * 60) fim += 12 * 60;
  return { inicioMin: ini, fimMin: fim };
}
function hvParseVozDe(texto, hojeStr) {
  var textoNorm = hvNormalizar(texto);
  var tipoInfo = hvParseTipoDe(textoNorm);
  var data = hvParseDataDe(textoNorm, hojeStr);
  var blocos = hvExtractBlocosDe(textoNorm);
  if (blocos.length > 2) return { ok: false, erro: 'Zu viele Zeiten erkannt — nur Vormittag und Nachmittag angeben.', textoOriginal: texto };
  var manha = null, tarde = null;
  if (blocos.length === 2) { manha = blocos[0]; tarde = hvAjustarTardeDe(blocos[1]); }
  else if (blocos.length === 1) { if (blocos[0].inicioMin < 12 * 60) manha = blocos[0]; else tarde = blocos[0]; }
  return {
    ok: true, ePeriodo: false, data: data, tipo: tipoInfo.tipo, fracao: tipoInfo.fracao,
    manha_inicio: manha ? hvClockStr(manha.inicioMin) : null, manha_fim: manha ? hvClockStr(manha.fimMin) : null,
    tarde_inicio: tarde ? hvClockStr(tarde.inicioMin) : null, tarde_fim: tarde ? hvClockStr(tarde.fimMin) : null,
    textoOriginal: texto
  };
}

// ══════════════════════════════════════════════════════════════════
// DESIGN — leve, um único sítio com cores/estilos (HV_COR_TIPO / HV_ESTILO),
// reaproveitados em toda a app. As cores claro/escuro em si vivem em CSS
// (custom properties --hv-*, só dentro de .hv-app) para que trocar de tema
// seja uma simples troca de classe + transition, sem recriar objetos JS.
// Light/dark segue o mesmo T (T_DARK/T_LIGHT) que o resto da suite usa —
// só troca os VALORES no --hv-*, nunca os tokens partilhados em si.
// ══════════════════════════════════════════════════════════════════
function hvTemaEscuro() { return T.bg === T_DARK.bg; }

var HV_CSS = '' +
  '.hv-app{--hv-fundo:#F8FAFC;--hv-cartao:#FFFFFF;--hv-borda:#E2E8F0;--hv-texto:#0F172A;--hv-texto2:#475569;' +
  '--hv-principal:#0F766E;--hv-principal-texto:#FFFFFF;--hv-positivo:#15803D;--hv-negativo:#B91C1C;--hv-aviso:#B45309;--hv-aviso-bg:#FEF3C7;' +
  '--hv-tipo-trabalho-bg:#DBEAFE;--hv-tipo-trabalho-fg:#1D4ED8;' +
  '--hv-tipo-ferias-bg:#FEF3C7;--hv-tipo-ferias-fg:#B45309;' +
  '--hv-tipo-doente-bg:#FFE4E6;--hv-tipo-doente-fg:#BE123C;' +
  '--hv-tipo-feriado-bg:#EDE9FE;--hv-tipo-feriado-fg:#6D28D9;' +
  '--hv-tipo-fecho-bg:#E0E7FF;--hv-tipo-fecho-fg:#3730A3;' +
  '--hv-tipo-livre-bg:#F1F5F9;--hv-tipo-livre-fg:#5B6B80;' +
  'background:var(--hv-fundo);color:var(--hv-texto);min-height:100vh;padding-bottom:40px;' +
  'font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-variant-numeric:tabular-nums}' +
  '.hv-app.hv-dark{--hv-fundo:#0B1220;--hv-cartao:#111A2E;--hv-borda:#1E293B;--hv-texto:#E2E8F0;--hv-texto2:#94A3B8;' +
  '--hv-principal:#2DD4BF;--hv-principal-texto:#04201D;--hv-positivo:#4ADE80;--hv-negativo:#F87171;--hv-aviso:#FDE68A;--hv-aviso-bg:#78350F;' +
  '--hv-tipo-trabalho-bg:#1E3A8A;--hv-tipo-trabalho-fg:#BFDBFE;' +
  '--hv-tipo-ferias-bg:#78350F;--hv-tipo-ferias-fg:#FDE68A;' +
  '--hv-tipo-doente-bg:#881337;--hv-tipo-doente-fg:#FECDD3;' +
  '--hv-tipo-feriado-bg:#4C1D95;--hv-tipo-feriado-fg:#DDD6FE;' +
  '--hv-tipo-fecho-bg:#312E81;--hv-tipo-fecho-fg:#C7D2FE;' +
  '--hv-tipo-livre-bg:#1E293B;--hv-tipo-livre-fg:#94A3B8}' +
  '.hv-app *{box-sizing:border-box}' +
  '.hv-app button,.hv-app input,.hv-app select{font-family:inherit;font-variant-numeric:tabular-nums}' +
  '.hv-app button,.hv-app input,.hv-app select,.hv-app .hv-linha{transition:background-color 150ms,border-color 150ms,color 150ms}' +
  '.hv-card{background:var(--hv-cartao);border:1px solid var(--hv-borda);border-radius:14px;padding:16px;box-shadow:0 1px 2px rgba(0,0,0,.05)}' +
  '.hv-linha{border-left:4px solid transparent;border-top:1px solid var(--hv-borda);cursor:pointer}' +
  '.hv-linha:first-child{border-top:none}' +
  '.hv-linha.hv-hoje{border-radius:8px;box-shadow:inset 0 0 0 1.5px var(--hv-principal)}' +
  '.hv-time-btn{width:44px;height:44px;flex:none;border:1px solid var(--hv-borda);background:var(--hv-cartao);color:var(--hv-texto);border-radius:10px;font-size:18px;cursor:pointer}' +
  '.hv-time-input{flex:1;min-width:calc(5.5ch + 20px);background:var(--hv-cartao);border:1px solid var(--hv-borda);color:var(--hv-texto);border-radius:10px;padding:8px 4px;font-size:22px;font-weight:700;text-align:center}' +
  '.hv-time-input::-webkit-calendar-picker-indicator{margin-left:2px;padding:0;width:14px;height:14px;opacity:.7}' +
  '.hv-time-input:disabled,.hv-time-btn:disabled{opacity:.4;cursor:not-allowed}' +
  '.hv-faixa{display:flex;gap:4px;justify-content:space-between}' +
  '.hv-bolinha{display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;background:none;border:none;padding:6px 0;cursor:pointer;min-height:44px;border-radius:10px}' +
  '.hv-bolinha-letra{font-size:10px;font-weight:700;color:var(--hv-texto2);text-transform:uppercase}' +
  '.hv-bolinha-num{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800}' +
  '.hv-bolinha-sel .hv-bolinha-num{box-shadow:0 0 0 2px var(--hv-principal)}' +
  '.hv-badge{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:800;padding:4px 9px;border-radius:20px;white-space:nowrap}' +
  '.hv-interruptor{position:relative;display:inline-block;width:40px;height:24px;flex:none}' +
  '.hv-interruptor input{opacity:0;width:0;height:0}' +
  '.hv-interruptor-trilho{position:absolute;inset:0;background:var(--hv-borda);border-radius:12px;cursor:pointer;transition:background 150ms}' +
  '.hv-interruptor-trilho:before{content:"";position:absolute;width:18px;height:18px;left:3px;top:3px;background:#fff;border-radius:50%;transition:transform 150ms}' +
  '.hv-interruptor input:checked + .hv-interruptor-trilho{background:var(--hv-principal)}' +
  '.hv-interruptor input:checked + .hv-interruptor-trilho:before{transform:translateX(16px)}' +
  '.hv-tipos-scroll{display:flex;gap:8px;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch}' +
  '.hv-tipos-scroll::-webkit-scrollbar{display:none}' +
  '.hv-tipo-chip{flex:none;min-height:44px;padding:0 16px;border-radius:12px;border:1px solid var(--hv-borda);background:var(--hv-cartao);color:var(--hv-texto);font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;white-space:nowrap}' +
  '.hv-editor-footer{position:sticky;bottom:0;display:flex;gap:8px;padding:12px 0 4px;margin-top:4px;background:linear-gradient(to top,var(--hv-fundo) 70%,transparent);z-index:30}' +
  '.hv-toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);background:var(--hv-principal);color:var(--hv-principal-texto);font-size:13px;font-weight:800;padding:10px 18px;border-radius:30px;box-shadow:0 4px 16px rgba(0,0,0,.25);z-index:300;pointer-events:none}' +
  '.hv-legenda{display:flex;justify-content:flex-end;gap:14px;padding:0 8px 4px;font-size:10px;color:var(--hv-texto2);text-transform:uppercase;font-weight:700;letter-spacing:.02em}' +
  '.hv-mais-item{display:flex;align-items:center;gap:10px;width:100%;min-height:48px;padding:0 14px;background:var(--hv-cartao);border:1px solid var(--hv-borda);border-radius:12px;color:var(--hv-texto);font-size:14px;font-weight:700;cursor:pointer;text-align:left}' +
  '.hv-cal-toggle{display:flex;gap:8px}' +
  '.hv-cal-toggle button{flex:1;min-height:44px;border-radius:10px;border:1px solid var(--hv-borda);background:var(--hv-cartao);color:var(--hv-texto);font-size:13px;font-weight:800;cursor:pointer}' +
  '.hv-cal-toggle button.hv-cal-toggle-ativo{background:var(--hv-principal);border-color:var(--hv-principal);color:var(--hv-principal-texto)}' +
  '.hv-cal-cabecalho{display:grid;grid-template-columns:36px repeat(7,minmax(0,1fr));column-gap:4px;width:100%;box-sizing:border-box}' +
  '.hv-cal-cabecalho span{font-size:11px;font-weight:800;color:var(--hv-texto2);text-align:center;text-transform:uppercase}' +
  '.hv-cal-grid{display:grid;grid-template-columns:36px repeat(7,minmax(0,1fr));column-gap:4px;row-gap:4px;grid-auto-rows:minmax(88px,auto);width:100%;box-sizing:border-box}' +
  '.hv-cal-kw{display:flex;flex-direction:column;align-items:center;min-width:0;font-size:11px;color:var(--hv-texto2);cursor:pointer;padding-top:4px;align-self:start}' +
  '.hv-cal-vazia{min-height:88px;min-width:0}' +
  '.hv-cal-celula{min-height:88px;min-width:0;box-sizing:border-box;border-radius:10px;background:var(--hv-cartao);border:1px solid var(--hv-borda);padding:1px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:2px;cursor:pointer;overflow:hidden}' +
  '.hv-cal-celula.hv-cal-antes{opacity:.5}' +
  '.hv-cal-celula.hv-cal-falta{border-color:var(--hv-aviso)}' +
  '.hv-cal-celula.hv-cal-hoje{border-color:var(--hv-principal)}' +
  '.hv-cal-celula.hv-cal-sel{border-width:2px;border-color:var(--hv-principal)}' +
  '.hv-cal-numero{font-size:clamp(14px,4.2vw,18px);font-weight:800;color:var(--hv-texto);line-height:1}' +
  '.hv-cal-numero-dom{color:var(--hv-negativo)}' +
  '.hv-cal-numero-hoje{width:26px;height:26px;border-radius:50%;background:var(--hv-principal);color:var(--hv-principal-texto);display:flex;align-items:center;justify-content:center;font-size:clamp(12px,3.5vw,14px)}' +
  '.hv-cal-etiqueta{width:100%;box-sizing:border-box;border-radius:6px;padding:0px 1px;color:#fff;text-align:center;white-space:nowrap;overflow:hidden;font-variant-numeric:tabular-nums;font-weight:800;font-size:clamp(10px,calc(var(--hv-cel-w,44px) * 0.23),13px);letter-spacing:-0.2px}' +
  '.hv-cal-etiqueta-extra{width:100%;box-sizing:border-box;border-radius:6px;padding:0px 1px;text-align:center;white-space:nowrap;overflow:hidden;font-variant-numeric:tabular-nums;font-weight:800;font-size:clamp(10px,calc(var(--hv-cel-w,44px) * 0.23),13px);letter-spacing:-0.2px}' +
  '.hv-cal-livre-bloco{width:100%;box-sizing:border-box;border-radius:8px;background:var(--hv-tipo-livre-bg);color:var(--hv-tipo-livre-fg);font-size:11px;text-align:center;padding:5px 2px;flex:1;display:flex;align-items:center;justify-content:center}' +
  '.hv-cal-registar{width:100%;flex:1;box-sizing:border-box;border:1.5px dashed var(--hv-principal);border-radius:6px;color:var(--hv-principal);font-size:18px;font-weight:800;display:flex;align-items:center;justify-content:center}' +
  '.hv-cal-meta-futuro{font-size:11px;color:var(--hv-texto2);text-align:center}' +
  '.hv-cal-fab{position:fixed;right:18px;bottom:22px;width:56px;height:56px;border-radius:28px;background:var(--hv-principal);color:var(--hv-principal-texto);border:none;font-size:26px;font-weight:800;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.35);z-index:60;display:flex;align-items:center;justify-content:center}' +
  '.hv-cal-semana-linha{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-top:1px solid var(--hv-borda);cursor:pointer;font-size:13px;color:var(--hv-texto)}' +
  '.hv-cal-semana-linha:first-child{border-top:none}';

var HV_COR_TIPO = {
  trabalho: { bg: 'var(--hv-tipo-trabalho-bg)', fg: 'var(--hv-tipo-trabalho-fg)' },
  ferias: { bg: 'var(--hv-tipo-ferias-bg)', fg: 'var(--hv-tipo-ferias-fg)' },
  doente: { bg: 'var(--hv-tipo-doente-bg)', fg: 'var(--hv-tipo-doente-fg)' },
  feriado: { bg: 'var(--hv-tipo-feriado-bg)', fg: 'var(--hv-tipo-feriado-fg)' },
  fecho: { bg: 'var(--hv-tipo-fecho-bg)', fg: 'var(--hv-tipo-fecho-fg)' },
  livre: { bg: 'var(--hv-tipo-livre-bg)', fg: 'var(--hv-tipo-livre-fg)' }
};
function hvCorTipo(tipo) { return HV_COR_TIPO[tipo] || HV_COR_TIPO.livre; }
// Cores sólidas (mesmas em claro/escuro, como um chip de calendário) só
// para as etiquetas fortes da vista Calendário do Mês — a paleta suave
// de HV_COR_TIPO acima é para os outros sítios, não muda.
var HV_COR_TIPO_FORTE = {
  trabalho: '#2563EB', ferias: '#D97706', doente: '#DC2626', feriado: '#7C3AED', fecho: '#4338CA', falta: '#C2410C'
};
function hvCorTipoForte(tipo) { return HV_COR_TIPO_FORTE[tipo] || '#64748B'; }
function hvEstiloExtra(v) {
  if (v > 0) return { background: 'rgba(21,128,61,.16)', color: 'var(--hv-positivo)' };
  if (v < 0) return { background: 'rgba(185,28,28,.16)', color: 'var(--hv-negativo)' };
  return { background: 'var(--hv-borda)', color: 'var(--hv-texto2)' };
}
// Texto do extra numa célula do calendário. Negativo mostra sempre o
// "-" (hvMinToHM já o inclui); o "+" do positivo só se esconde quando a
// célula é demasiado estreita para caber — a cor verde/vermelha já diz
// o sinal, não é cortar o número, só a marca de mais.
function hvTextoExtraCel(v, muitoCompacta) {
  return v >= 0 ? (muitoCompacta ? '' : '+') + hvMinToHM(v) : hvMinToHM(v);
}

// Único objeto de estilos ao nível do módulo — as peças abaixo e a app
// principal reaproveitam sempre os mesmos objetos, nunca criam a sua
// própria cópia dentro de um loop.
var HV_ESTILO = {
  pagina: { padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  cartao: {},
  textoMuted: { color: 'var(--hv-texto2)' },
  linhaTopo: { display: 'flex', alignItems: 'center', gap: 8 },
  navBtn: { background: 'var(--hv-cartao)', border: '1px solid var(--hv-borda)', color: 'var(--hv-texto)', borderRadius: 10, width: 44, height: 44, fontSize: 18, cursor: 'pointer', flex: 'none' },
  label: { fontSize: 11, color: 'var(--hv-texto2)', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.02em' },
  microfone: { width: 64, height: 64, borderRadius: 16, background: 'var(--hv-principal)', color: 'var(--hv-principal-texto)', border: 'none', fontSize: 26, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%' },
  microfoneOuvindo: { width: '100%', height: 64, borderRadius: 16, background: 'var(--hv-negativo)', color: '#fff', border: 'none', fontSize: 18, fontWeight: 800, cursor: 'pointer' },
  botaoRapido: { height: 48, borderRadius: 12, border: '1px solid var(--hv-borda)', background: 'var(--hv-cartao)', color: 'var(--hv-texto)', fontSize: 14, fontWeight: 700, cursor: 'pointer', flex: 1 },
  botaoPrincipal: { height: 48, borderRadius: 12, border: 'none', background: 'var(--hv-principal)', color: 'var(--hv-principal-texto)', fontSize: 15, fontWeight: 800, cursor: 'pointer', flex: 1 },
  botaoNeutro: { height: 48, borderRadius: 12, border: '1px solid var(--hv-borda)', background: 'var(--hv-cartao)', color: 'var(--hv-texto)', fontSize: 14, fontWeight: 700, cursor: 'pointer', flex: 1 },
  botaoPerigo: { height: 48, borderRadius: 12, border: '1px solid var(--hv-negativo)', background: 'var(--hv-cartao)', color: 'var(--hv-negativo)', fontSize: 18, fontWeight: 700, cursor: 'pointer', flex: 'none', width: 48 },
  totalNumero: { fontSize: 28, fontWeight: 800, color: 'var(--hv-texto)' },
  saldoNumero: { fontSize: 28, fontWeight: 800 },
  metaNumero: { fontSize: 15, color: 'var(--hv-texto2)', fontWeight: 600 },
  etiquetaSm: { fontSize: 11, color: 'var(--hv-texto2)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '.02em' },
  erroTexto: { color: 'var(--hv-negativo)', fontSize: 13 },
  avisoCartao: { background: 'var(--hv-aviso-bg)', border: 'none' },
  avisoTexto: { color: 'var(--hv-aviso)', fontSize: 13, fontWeight: 600 }
};

// Mostra a legenda "Feito · Meta · Saldo" só da primeira vez que a vista
// Semana é aberta nesta sessão (não é dado da app, não vai para a BD).
var HV_LEGENDA_SEMANA_VISTA = false;

// ── Apresentação por dia (SÓ VISUAL: que rótulo/cor mostrar e se mostra
// meta/saldo. Os números em si — total, meta, saldo — vêm sempre de
// hvTotalDia/weekCalc.metas, nunca são recalculados aqui.) ────────────
// p: { dateStr, hojeStr, temRegisto, livre, fimDeSemana, desdeStr }
// desdeStr é opcional: dias antes dele não são cobrados de "falta" (o
// registo nunca existiu antes de se começar a usar a app a sério).
function hvClassificarDia(p) {
  if (p.desdeStr && p.dateStr < p.desdeStr && !p.temRegisto) return { estado: 'antes-de-contar', rotulo: '', compacta: true, mostrarMeta: false, mostrarSaldo: false };
  if (p.temRegisto) return { estado: 'gravado', compacta: false, mostrarMeta: true, mostrarSaldo: true };
  if (p.fimDeSemana) return { estado: 'fds', rotulo: 'Fim de semana', compacta: true, mostrarMeta: false, mostrarSaldo: false };
  if (p.livre) return { estado: 'livre', rotulo: 'Livre', compacta: true, mostrarMeta: false, mostrarSaldo: false };
  if (p.dateStr > p.hojeStr) return { estado: 'futuro', rotulo: 'Por vir', compacta: false, mostrarMeta: true, mostrarSaldo: 'traco' };
  if (p.dateStr === p.hojeStr) return { estado: 'hoje-por-registar', rotulo: 'Por registar', compacta: false, mostrarMeta: true, mostrarSaldo: 'traco' };
  return { estado: 'falta', rotulo: '⚠ falta registar', compacta: false, mostrarMeta: true, mostrarSaldo: true };
}
// Primeiro dia com registo em toda a conta — "contar a partir de" para
// não acusar de falta dias anteriores a começar a usar a app.
function hvPrimeiraDataRegistada(registos, hojeStr) {
  var datas = Object.keys(registos);
  return datas.length ? datas.sort()[0] : hojeStr;
}
// Soma total/meta/extra só dos dias desde "desde" até hoje inclusive;
// hoje só entra se estiver gravado. Função única reutilizada por Dia
// (faixa), Semana, Mês e Ano — nunca substitui os totais/metas por dia
// vindos do motor de cálculo, só os agrega para os resumos.
function hvResumoAte(dias, hojeStr, desdeStr) {
  var total = 0, meta = 0;
  dias.forEach(function (d) {
    if (d.dateStr > hojeStr) return;
    if (desdeStr && d.dateStr < desdeStr) return;
    if (d.dateStr === hojeStr && !d.temRegisto) return;
    total += d.total; meta += d.meta;
  });
  return { total: total, meta: meta, extra: total - meta };
}
// Arredondamento com compensação (método do maior resto): garante que a
// soma dos extras arredondados de vários dias bate sempre com o total
// arredondado do grupo. Cada item perde a parte decimal (para baixo);
// o(s) minuto(s) que falta(m) até ao alvo vão para quem tem maior resto
// — em empate, para a data mais antiga. Só arredonda para APRESENTAR
// vários dias juntos; o alvo em si continua a vir de hvResumoAte, nunca
// é recalculado aqui, e os totais/metas por dia não mudam.
// itens: [{ dateStr, valor }] com valor em minutos exatos (pode ser
// fracionário e negativo). Devolve { dateStr: minutosInteiros }.
function hvCompensarExtras(itens) {
  var somaExata = itens.reduce(function (s, it) { return s + it.valor; }, 0);
  var alvo = Math.round(somaExata + (somaExata >= 0 ? 1e-9 : -1e-9));
  var partes = itens.map(function (it) {
    var f = Math.floor(it.valor);
    return { dateStr: it.dateStr, floor: f, resto: it.valor - f };
  });
  var somaFloors = partes.reduce(function (s, it) { return s + it.floor; }, 0);
  var falta = alvo - somaFloors;
  var ordem = partes.slice().sort(function (a, b) {
    if (b.resto !== a.resto) return b.resto - a.resto;
    return a.dateStr < b.dateStr ? -1 : 1;
  });
  var resultado = {};
  partes.forEach(function (it) { resultado[it.dateStr] = it.floor; });
  for (var i = 0; i < falta; i++) { resultado[ordem[i].dateStr] += 1; }
  return resultado;
}
// Monta os itens a compensar (só dias gravados ou em falta — os únicos
// que mostram um extra) a partir de um grupo de dias (semana ou mês) e
// devolve o mapa dateStr->minutos já compensado por hvCompensarExtras.
// Aceita tanto o formato de hvDiasSemanaCompleta (.temRegisto) como o
// de mesData.dias (.tipo).
function hvCompensarExtrasGrupo(diasArr, hojeStr, desdeStr) {
  var itens = [];
  diasArr.forEach(function (d) {
    var temRegisto = !!(d.tipo || d.temRegisto);
    var est = hvClassificarDia({ dateStr: d.dateStr, hojeStr: hojeStr, temRegisto: temRegisto, livre: d.livre, fimDeSemana: d.fimDeSemana, desdeStr: desdeStr });
    if (est.estado === 'gravado') itens.push({ dateStr: d.dateStr, valor: (d.total - d.meta) * 60 });
    else if (est.estado === 'falta') itens.push({ dateStr: d.dateStr, valor: (0 - d.meta) * 60 });
  });
  return hvCompensarExtras(itens);
}
// Semanas (Seg–Dom) da grelha de um mês em calendário: cada uma com o
// número da KW, a segunda-feira dessa semana e os 7 números de dia (ou
// null para células vazias de outro mês). Só matemática de datas — as
// mesmas hvIsoDate/hvDi/hvMon/hvKw/hvAddD já usadas no motor, sem as
// alterar nem duplicar a lógica delas.
function hvConstruirGrelhaMes(y, m) {
  var primeiroDia = hvIsoDate(y, m, 1);
  var offset = hvDi(hvMk(primeiroDia)); // 0=Seg..6=Dom
  var nDias = hvDaysInMonth(y, m);
  var semanas = [];
  var dataCursor = hvIso(hvMon(hvMk(primeiroDia)));
  var diaAtual = 1 - offset;
  while (diaAtual <= nDias) {
    var celulas = [];
    for (var i = 0; i < 7; i++) {
      var dNum = diaAtual + i;
      celulas.push(dNum < 1 || dNum > nDias ? null : dNum);
    }
    semanas.push({ kw: hvKw(hvMk(dataCursor)), segunda: dataCursor, celulas: celulas });
    dataCursor = hvIso(hvAddD(hvMk(dataCursor), 7));
    diaAtual += 7;
  }
  return semanas;
}

// ── Comparação "E se fosse outra percentagem?" ────────────────────
// Fórmula própria e independente da distribuição real da semana (a de
// hvComputeWeek, que redistribui a compensação de dias livres pelos
// dias com registo) — nunca mexe nela nem em hvDerivados. A 100%
// assume SEMPRE uma semana de 5 dias úteis (seg-sex), nunca o
// dias_trabalho do cfg (que pode ter só 4 dias); abaixo dos 100%, a
// meta semanal reparte-se pelos dias de trabalho configurados.
function hvMetaSemanaMinPct(cfg, pct) {
  return Math.round(cfg.horas_dia_100 * 5 * pct / 100 * 60 + 1e-9);
}
function hvMetaDiaMinPct(cfg, pct) {
  var numDias = pct >= 100 ? 5 : ((cfg.dias_trabalho && cfg.dias_trabalho.length) || 5);
  return Math.round(hvMetaSemanaMinPct(cfg, pct) / numDias);
}
// Meta acumulada de segunda até "hojeStr" (inclusive), à percentagem
// pct — só conta dias de trabalho (seg-sex a 100%, dias_trabalho do
// cfg abaixo disso) até hoje.
function hvMetaAteHojeMinPct(cfg, pct, segundaStr, hojeStr) {
  var diasTrab = pct >= 100 ? [1, 2, 3, 4, 5] : (cfg.dias_trabalho || [1, 2, 3, 4, 5]);
  var metaDiaMin = hvMetaDiaMinPct(cfg, pct);
  var n = 0;
  for (var i = 0; i < 5; i++) {
    var ds = hvIso(hvAddD(hvMk(segundaStr), i));
    if (ds > hojeStr) break;
    if (diasTrab.indexOf(i + 1) !== -1) n++;
  }
  return metaDiaMin * n;
}
// Feito até hoje (inclusive) à percentagem pct — só o crédito de
// ausência (férias/doente/feriado/fecho) depende de pct; trabalho
// nunca. dias: formato de hvDiasSemanaCompleta()/hvDiasDeSemana().
function hvFeitoAteHojeMinPct(cfg, dias, pct, hojeStr) {
  var der = hvDerivados(Object.assign({}, cfg, { percentagem: pct }));
  var totalMin = 0;
  dias.forEach(function (d) {
    if (d.fimDeSemana) return;
    if (d.dateStr > hojeStr) return;
    if (d.dateStr === hojeStr && !d.temRegisto) return;
    totalMin += hvTotalDia(d.row, cfg, der) * 60;
  });
  return Math.round(totalMin + 1e-9);
}

// ── Peças pequenas ao nível do módulo ─────────────────────────────
function HvBtn(p) {
  var base = p.tipoCor
    ? { background: hvCorTipo(p.tipoCor).bg, color: hvCorTipo(p.tipoCor).fg, border: 'none' }
    : (p.ativo
      ? { background: p.perigo ? 'var(--hv-negativo)' : 'var(--hv-principal)', color: p.perigo ? '#fff' : 'var(--hv-principal-texto)', border: 'none' }
      : {});
  var estiloBase = p.grande ? HV_ESTILO.botaoRapido : HV_ESTILO.botaoNeutro;
  return React.createElement('button', {
    onClick: p.onClick, disabled: p.disabled,
    style: Object.assign({}, estiloBase, base, p.flex ? { flex: 1 } : {}, { opacity: p.disabled ? .5 : 1, cursor: p.disabled ? 'not-allowed' : 'pointer' }, p.style || {})
  }, p.children);
}
function HvCard(p) {
  return React.createElement('div', { className: 'hv-card', style: p.style || HV_ESTILO.cartao }, p.children);
}
function HvTipoEtiqueta(p) {
  var c = hvCorTipo(p.tipo);
  return React.createElement('span', {
    style: { background: c.bg, color: c.fg, borderRadius: 8, padding: '3px 8px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }
  }, p.children);
}
function HvCampoHora(p) {
  return React.createElement('div', { style: { flex: 1, minWidth: 110 } },
    React.createElement('div', { style: HV_ESTILO.label }, p.label),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
      React.createElement('button', { className: 'hv-time-btn', onClick: function () { p.onChange(hvAddMin(p.value || '00:00', -15)); }, disabled: p.disabled }, '−'),
      React.createElement('input', {
        className: 'hv-time-input', type: 'time', value: p.value || '', disabled: p.disabled, autoComplete: 'off',
        onChange: function (e) { p.onChange(e.target.value); }
      }),
      React.createElement('button', { className: 'hv-time-btn', onClick: function () { p.onChange(hvAddMin(p.value || '00:00', 15)); }, disabled: p.disabled }, '+')
    )
  );
}
function HvSaldoTexto(p) {
  var v = p.valor;
  return React.createElement('span', { style: { color: v >= 0 ? 'var(--hv-positivo)' : 'var(--hv-negativo)', fontWeight: 800 } }, (v >= 0 ? '+' : '') + hvMinToHM(v * 60));
}
function HvInterruptor(p) {
  return React.createElement('label', { className: 'hv-interruptor' },
    React.createElement('input', { type: 'checkbox', checked: p.checked, onChange: function (e) { p.onChange(e.target.checked); } }),
    React.createElement('span', { className: 'hv-interruptor-trilho' })
  );
}
function HvBolinhaDia(p) {
  var cor = p.estado === 'gravado' ? { bg: p.corTipoFg, fg: '#fff' }
    : p.estado === 'aviso' ? { bg: 'var(--hv-aviso)', fg: '#1a1200' }
    : { bg: 'var(--hv-borda)', fg: 'var(--hv-texto2)' };
  var icone = p.estado === 'gravado' ? '✓' : p.estado === 'aviso' ? '⚠' : '−';
  return React.createElement('button', {
    className: 'hv-bolinha' + (p.selecionado ? ' hv-bolinha-sel' : ''), onClick: p.onClick
  },
    React.createElement('span', { className: 'hv-bolinha-letra' }, p.letra),
    React.createElement('span', { className: 'hv-bolinha-num', style: { background: cor.bg, color: cor.fg } }, icone)
  );
}
function HvBadgeEstado(p) {
  var cores = {
    gravado: { bg: 'var(--hv-tipo-trabalho-bg)', fg: 'var(--hv-positivo)' },
    porregistar: { bg: 'var(--hv-aviso-bg)', fg: 'var(--hv-aviso)' },
    livre: { bg: 'var(--hv-tipo-livre-bg)', fg: 'var(--hv-tipo-livre-fg)' },
    alterado: { bg: 'var(--hv-aviso-bg)', fg: 'var(--hv-aviso)' }
  };
  var c = cores[p.tipo] || cores.livre;
  return React.createElement('span', { className: 'hv-badge', style: { background: c.bg, color: c.fg } }, p.children);
}
function HvConfirm(p) {
  if (!p.aberto) return null;
  return React.createElement('div', {
    style: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 },
    onClick: function (e) { if (e.target === e.currentTarget) p.onCancelar(); }
  },
    React.createElement('div', { className: 'hv-card', style: { maxWidth: 340, width: '100%' } },
      React.createElement('p', { style: { color: 'var(--hv-texto)', fontSize: 15, fontWeight: 700, marginBottom: 16 } }, p.mensagem),
      React.createElement('div', { style: { display: 'flex', gap: 10 } },
        React.createElement(HvBtn, { onClick: p.onCancelar, flex: true }, 'Cancelar'),
        React.createElement(HvBtn, { onClick: p.onConfirmar, ativo: true, perigo: !p.corConfirmarPrincipal, flex: true }, p.textoConfirmar || 'Confirmar')
      )
    )
  );
}

// Linhas memoizadas (Semana / Mês / Ano) — só props primitivas, para o
// React.memo evitar re-render quando nada daquela linha específica mudou.
function hvLinhaPropsIguais(a, b) {
  return a.dataStr === b.dataStr && a.total === b.total && a.meta === b.meta && a.tipo === b.tipo &&
    a.livre === b.livre && a.hoje === b.hoje && a.fimDeSemana === b.fimDeSemana && a.rotulo === b.rotulo &&
    a.desde === b.desde && a.extraMin === b.extraMin;
}
// Mesmo estilo do HvSaldoTexto, mas a partir de minutos inteiros já
// arredondados com compensação (hvCompensarExtras) — para vários dias
// mostrados juntos somarem sempre certo, sem re-arredondar aqui.
function HvSaldoTextoMin(p) {
  var v = p.valorMin;
  return React.createElement('span', { style: { color: v >= 0 ? 'var(--hv-positivo)' : 'var(--hv-negativo)', fontWeight: 800 } }, (v >= 0 ? '+' : '') + hvMinToHM(v));
}
function hvSaldoCelula(mostrarSaldo, total, meta, extraMin) {
  if (mostrarSaldo === 'traco') return React.createElement('span', { style: { color: 'var(--hv-texto2)', fontWeight: 800 } }, '—');
  if (!mostrarSaldo) return null;
  if (extraMin != null) return React.createElement(HvSaldoTextoMin, { valorMin: extraMin });
  return React.createElement(HvSaldoTexto, { valor: total - meta });
}
var HvLinhaSemana = React.memo(function HvLinhaSemana(p) {
  var hojeStr = hvTodayIso();
  var est = hvClassificarDia({ dateStr: p.dataStr, hojeStr: hojeStr, temRegisto: !!p.tipo, livre: p.livre, fimDeSemana: p.fimDeSemana, desdeStr: p.desde });
  var cor = hvCorTipo(est.estado === 'gravado' ? p.tipo : 'livre');
  var info = p.tipo ? hvTipoInfo(p.tipo) : null;
  var corRotulo = est.estado === 'falta' || est.estado === 'hoje-por-registar' ? 'var(--hv-aviso)' : (p.hoje ? 'var(--hv-principal)' : (p.fimDeSemana ? 'var(--hv-texto2)' : 'var(--hv-texto)'));
  if (est.compacta) {
    return React.createElement('div', {
      className: 'hv-linha' + (p.hoje ? ' hv-hoje' : ''), onClick: p.onClick,
      style: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', opacity: est.estado === 'antes-de-contar' ? .5 : .65 }
    },
      React.createElement('span', { style: { fontSize: 15, width: 24, textAlign: 'center', flex: 'none' } }, est.estado === 'antes-de-contar' ? '—' : '🕊️'),
      React.createElement('div', { style: { flex: 1, fontSize: 12, color: 'var(--hv-texto2)' } }, est.rotulo ? p.rotulo + ' · ' + est.rotulo : p.rotulo)
    );
  }
  return React.createElement('div', {
    className: 'hv-linha' + (p.hoje ? ' hv-hoje' : ''), onClick: p.onClick,
    style: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', borderLeftColor: cor.fg }
  },
    React.createElement('span', { style: { fontSize: 19, width: 24, textAlign: 'center', flex: 'none' } }, info ? info.emoji : (est.estado === 'falta' || est.estado === 'hoje-por-registar' ? '⚠' : '—')),
    React.createElement('div', { style: { flex: 1, minWidth: 0 } },
      React.createElement('div', { style: { fontWeight: 700, fontSize: 13, color: corRotulo } }, p.rotulo),
      React.createElement('div', { style: { fontSize: 11, color: 'var(--hv-texto2)' } }, info ? info.label : est.rotulo)
    ),
    React.createElement('div', { style: { textAlign: 'right', fontSize: 12, color: 'var(--hv-texto2)', minWidth: 52 } }, hvMinToHM(p.total * 60)),
    est.mostrarMeta && React.createElement('div', { style: { textAlign: 'right', fontSize: 12, color: 'var(--hv-texto2)', minWidth: 52 } }, hvMinToHM(p.meta * 60)),
    React.createElement('div', { style: { textAlign: 'right', minWidth: 60 } }, hvSaldoCelula(est.mostrarSaldo, p.total, p.meta, p.extraMin))
  );
}, hvLinhaPropsIguais);
var HvLinhaMes = React.memo(function HvLinhaMes(p) {
  var hojeStr = hvTodayIso();
  var est = hvClassificarDia({ dateStr: p.dataStr, hojeStr: hojeStr, temRegisto: !!p.tipo, livre: p.livre, fimDeSemana: p.fimDeSemana, desdeStr: p.desde });
  var cor = hvCorTipo(est.estado === 'gravado' ? p.tipo : 'livre');
  var info = p.tipo ? hvTipoInfo(p.tipo) : null;
  var corRotulo = est.estado === 'falta' || est.estado === 'hoje-por-registar' ? 'var(--hv-aviso)' : (p.hoje ? 'var(--hv-principal)' : 'var(--hv-texto)');
  var iconeCompacto = est.estado === 'antes-de-contar' ? '—' : '🕊️';
  return React.createElement('div', {
    className: 'hv-linha' + (p.hoje ? ' hv-hoje' : ''), onClick: p.onClick,
    style: { display: 'flex', alignItems: 'center', gap: 10, padding: est.compacta ? '6px 8px' : '8px', borderLeftColor: est.compacta ? 'transparent' : cor.fg, opacity: est.compacta ? (est.estado === 'antes-de-contar' ? .5 : .65) : 1 }
  },
    React.createElement('span', { style: { fontSize: 16, width: 20, textAlign: 'center', flex: 'none' } }, info ? info.emoji : (est.compacta ? iconeCompacto : (est.estado === 'falta' || est.estado === 'hoje-por-registar' ? '⚠' : '—'))),
    React.createElement('div', { style: { flex: 1, fontSize: 13, color: corRotulo, fontWeight: p.hoje ? 700 : 400 } }, p.rotulo + (est.compacta && est.rotulo ? ' · ' + est.rotulo : '')),
    !est.compacta && React.createElement('div', { style: { fontSize: 12, color: 'var(--hv-texto2)', minWidth: 48, textAlign: 'right' } }, hvMinToHM(p.total * 60)),
    !est.compacta && React.createElement('div', { style: { textAlign: 'right', minWidth: 58 } }, hvSaldoCelula(est.mostrarSaldo, p.total, p.meta, p.extraMin))
  );
}, hvLinhaPropsIguais);
var HvLinhaAno = React.memo(function HvLinhaAno(p) {
  return React.createElement('div', {
    className: 'hv-linha', onClick: p.onClick,
    style: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 8px', opacity: p.futuro ? .6 : 1 }
  },
    React.createElement('div', { style: { flex: 1, fontSize: 13, color: p.futuro ? 'var(--hv-texto2)' : 'var(--hv-texto)', fontWeight: 700 } }, p.rotulo),
    React.createElement('div', { style: { fontSize: 12, color: 'var(--hv-texto2)', minWidth: 58, textAlign: 'right' } }, hvMinToHM(p.total * 60)),
    React.createElement('div', { style: { fontSize: 12, color: 'var(--hv-texto2)', minWidth: 58, textAlign: 'right' } }, hvMinToHM(p.meta * 60)),
    React.createElement('div', { style: { textAlign: 'right', minWidth: 60 } }, p.futuro ? React.createElement('span', { style: { color: 'var(--hv-texto2)', fontWeight: 800 } }, '—') : React.createElement(HvSaldoTexto, { valor: p.total - p.meta }))
  );
}, function (a, b) { return a.rotulo === b.rotulo && a.total === b.total && a.meta === b.meta && a.futuro === b.futuro; });

// Célula da vista Calendário do Mês — reaproveita hvClassificarDia (a
// mesma função da Lista/Semana) para o estado, só muda a apresentação.
// Memoizada: só props primitivas + a referência do registo (estável
// entre renders enquanto esse dia não muda), para não recalcular a
// grelha inteira a cada tecla.
var HvCelulaCalendario = React.memo(function HvCelulaCalendario(p) {
  var hojeStr = hvTodayIso();
  var temRegisto = !!p.row;
  var est = hvClassificarDia({ dateStr: p.dateStr, hojeStr: hojeStr, temRegisto: temRegisto, livre: p.livre, fimDeSemana: p.fimDeSemana, desdeStr: p.desde });
  var isoDow = hvDi(hvMk(p.dateStr)); // 0=Seg..6=Dom
  var numeroNode = p.hoje
    ? React.createElement('span', { className: 'hv-cal-numero-hoje' }, p.dia)
    : React.createElement('span', { className: 'hv-cal-numero' + (isoDow === 6 ? ' hv-cal-numero-dom' : '') }, p.dia);

  var conteudo = null;
  if (est.estado === 'gravado') {
    var info = hvTipoInfo(p.row.tipo);
    var meioDia = (p.row.tipo === 'ferias' || p.row.tipo === 'doente') && p.row.fracao === 0.5;
    var textoTotal = (meioDia ? '½' : '') + hvMinToHM(p.total * 60);
    var mostrarIcone = info && !p.compacta;
    var extraMinGravado = p.extraMin != null ? p.extraMin : Math.round((p.total - p.meta) * 60);
    var textoExtra = hvTextoExtraCel(extraMinGravado, p.muitoCompacta);
    conteudo = React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 3, width: '100%' } },
      React.createElement('div', { className: 'hv-cal-etiqueta', style: { background: hvCorTipoForte(p.row.tipo) } },
        (mostrarIcone ? info.emoji + ' ' : '') + textoTotal),
      React.createElement('div', { className: 'hv-cal-etiqueta-extra', style: hvEstiloExtra(extraMinGravado) }, textoExtra)
    );
  } else if (est.estado === 'livre') {
    conteudo = React.createElement('div', { className: 'hv-cal-livre-bloco' }, 'livre');
  } else if (est.estado === 'futuro') {
    conteudo = React.createElement('div', { className: 'hv-cal-meta-futuro' }, hvMinToHM(p.meta * 60));
  } else if (est.estado === 'hoje-por-registar') {
    conteudo = React.createElement('div', { className: 'hv-cal-registar', 'aria-label': 'Registar hoje' }, '＋');
  } else if (est.estado === 'falta') {
    var extraMinFalta = p.extraMin != null ? p.extraMin : Math.round((0 - p.meta) * 60);
    var textoExtraFalta = hvTextoExtraCel(extraMinFalta, p.muitoCompacta);
    conteudo = React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 3, width: '100%' } },
      React.createElement('div', { className: 'hv-cal-etiqueta', style: { background: hvCorTipoForte('falta') } }, p.compacta ? '⚠' : '⚠ falta'),
      React.createElement('div', { className: 'hv-cal-etiqueta-extra', style: hvEstiloExtra(extraMinFalta) }, textoExtraFalta)
    );
  }
  // fds / antes-de-contar: só o número (conteudo fica null)

  var classeCelula = 'hv-cal-celula' +
    (est.estado === 'antes-de-contar' ? ' hv-cal-antes' : '') +
    (est.estado === 'falta' ? ' hv-cal-falta' : '') +
    (p.hoje ? ' hv-cal-hoje' : '') +
    (p.selecionado ? ' hv-cal-sel' : '');
  return React.createElement('div', { className: classeCelula, 'data-date': p.dateStr }, numeroNode, conteudo);
}, function (a, b) {
  return a.dateStr === b.dateStr && a.total === b.total && a.meta === b.meta && a.row === b.row &&
    a.livre === b.livre && a.fimDeSemana === b.fimDeSemana && a.hoje === b.hoje && a.selecionado === b.selecionado &&
    a.desde === b.desde && a.extraMin === b.extraMin && a.compacta === b.compacta && a.muitoCompacta === b.muitoCompacta;
});

// ── Componente principal ───────────────────────────────────────────
function HorasVozApp(props) {
  var onBack = props.onBack, profile = props.profile;
  var db = window.supabaseClient;

  var _s1 = React.useState(true); var loading = _s1[0], setLoading = _s1[1];
  var _s2 = React.useState(null); var erro = _s2[0], setErro = _s2[1];
  var _s3 = React.useState({}); var registos = _s3[0], setRegistos = _s3[1]; // { 'YYYY-MM-DD': row }
  var _s4 = React.useState([]); var configs = _s4[0], setConfigs = _s4[1];

  var _s5 = React.useState('dia'); var view = _s5[0], setView = _s5[1]; // dia|semana|mes|ano
  var _s6 = React.useState(hvTodayIso()); var curDate = _s6[0], setCurDate = _s6[1];
  var _s7 = React.useState(function () { var n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; });
  var curMonthObj = _s7[0], setCurMonthObj = _s7[1];
  var _s8 = React.useState(function () { return new Date().getFullYear(); }); var curYear = _s8[0], setCurYear = _s8[1];

  // Formulário do dia atual
  var _s9 = React.useState('trabalho'); var fTipo = _s9[0], setFTipo = _s9[1];
  var _s10 = React.useState(1); var fFracao = _s10[0], setFFracao = _s10[1];
  var _s11 = React.useState(''); var fManhaI = _s11[0], setFManhaI = _s11[1];
  var _s12 = React.useState(''); var fManhaF = _s12[0], setFManhaF = _s12[1];
  var _s13 = React.useState(''); var fTardeI = _s13[0], setFTardeI = _s13[1];
  var _s14 = React.useState(''); var fTardeF = _s14[0], setFTardeF = _s14[1];
  var _s15 = React.useState(false); var fSemManha = _s15[0], setFSemManha = _s15[1];
  var _s16 = React.useState(false); var fSemTarde = _s16[0], setFSemTarde = _s16[1];
  var _s17 = React.useState(''); var fNota = _s17[0], setFNota = _s17[1];
  var _s18 = React.useState(''); var fTextoOriginal = _s18[0], setFTextoOriginal = _s18[1];
  var _s19 = React.useState(false); var saving = _s19[0], setSaving = _s19[1];
  var _s20 = React.useState(null); var erroForm = _s20[0], setErroForm = _s20[1];
  var _s21 = React.useState(null); var confirmSubstituir = _s21[0], setConfirmSubstituir = _s21[1];
  var _s22 = React.useState(false); var confirmApagar = _s22[0], setConfirmApagar = _s22[1];
  var pendingLoadRef = React.useRef(null); // guarda o payload a aplicar depois de confirmar substituição

  // Voz
  var _s23 = React.useState(false); var listening = _s23[0], setListening = _s23[1];
  var _s24 = React.useState(''); var vozInterim = _s24[0], setVozInterim = _s24[1];
  var _s25 = React.useState(false); var vozIndisponivel = _s25[0], setVozIndisponivel = _s25[1];
  var _s26 = React.useState(''); var vozTextoManual = _s26[0], setVozTextoManual = _s26[1];
  var _s27 = React.useState(null); var vozErro = _s27[0], setVozErro = _s27[1];
  var _s27b = React.useState('pt'); var vozIdioma = _s27b[0], setVozIdioma = _s27b[1]; // 'pt'|'de' — idioma da última escuta
  var recognitionRef = React.useRef(null);
  var manualStopRef = React.useRef(false);
  var silenceTimerRef = React.useRef(null);
  var accumRef = React.useRef('');
  var deFallbackRef = React.useRef(false);

  // Marcar período
  var _s28 = React.useState(false); var periodoAberto = _s28[0], setPeriodoAberto = _s28[1];
  var _s29 = React.useState(hvTodayIso()); var perIni = _s29[0], setPerIni = _s29[1];
  var _s30 = React.useState(hvTodayIso()); var perFim = _s30[0], setPerFim = _s30[1];
  var _s31 = React.useState('ferias'); var perTipo = _s31[0], setPerTipo = _s31[1];
  var _s32 = React.useState(true); var perIncluirSextas = _s32[0], setPerIncluirSextas = _s32[1];
  var _s33 = React.useState({}); var perAcoes = _s33[0], setPerAcoes = _s33[1]; // { data: 'substituir'|'saltar' }
  var _s34 = React.useState(false); var perGravando = _s34[0], setPerGravando = _s34[1];

  // Definições
  var _s35 = React.useState(false); var defAberto = _s35[0], setDefAberto = _s35[1];
  var _s36 = React.useState(null); var defEditando = _s36[0], setDefEditando = _s36[1]; // config em edição (ou {} para novo)
  var _s37 = React.useState(null); var defApagar = _s37[0], setDefApagar = _s37[1];

  // Ecrã Dia redesenhado: MODO A (sem registo) / MODO B (com registo) / MODO C (editor)
  var _s38 = React.useState(false); var editorAberto = _s38[0], setEditorAberto = _s38[1];
  var _s39 = React.useState(false); var maisAberto = _s39[0], setMaisAberto = _s39[1];
  var _s40 = React.useState(''); var toast = _s40[0], setToast = _s40[1];
  var _s41 = React.useState(false); var confirmDiaLivreAberto = _s41[0], setConfirmDiaLivreAberto = _s41[1];
  var _s42 = React.useState(null); var confirmDescartar = _s42[0], setConfirmDescartar = _s42[1]; // data pendente
  var _s43 = React.useState(100); var pctComparar = _s43[0], setPctComparar = _s43[1]; // percentagem extra a comparar (Dia/Semana/Mês)
  var _s43b = React.useState(function () {
    try { return localStorage.getItem('horasvoz_comparar_aberto') === '1'; } catch (e) { return false; }
  });
  var compararAberto = _s43b[0], setCompararAbertoState = _s43b[1];
  function setCompararAberto(v) {
    setCompararAbertoState(v);
    try { localStorage.setItem('horasvoz_comparar_aberto', v ? '1' : '0'); } catch (e) {}
  }
  var _s44 = React.useState(function () {
    try { return localStorage.getItem('horasvoz_mes_vista') || 'calendario'; } catch (e) { return 'calendario'; }
  });
  var mesVista = _s44[0], setMesVistaState = _s44[1];
  function setMesVista(v) {
    setMesVistaState(v);
    try { localStorage.setItem('horasvoz_mes_vista', v); } catch (e) {}
  }
  // Largura de cada coluna de dia da grelha do Mês (calculada a partir da
  // largura do contentor, medida por ResizeObserver) — decide quando
  // esconder o ícone do tipo e o "+" dos extras, para nunca cortar
  // números. compacta/muitoCompacta ficam false se o browser não tiver
  // ResizeObserver (célula continua legível, só não encolhe o conteúdo).
  var _s45 = React.useState(0); var celColWidth = _s45[0], setCelColWidth = _s45[1];
  var celGridRoRef = React.useRef(null);
  var celGridRefCb = React.useRef(function (node) {
    if (celGridRoRef.current) { celGridRoRef.current.disconnect(); celGridRoRef.current = null; }
    if (node && typeof ResizeObserver !== 'undefined') {
      celGridRoRef.current = new ResizeObserver(function (entries) {
        var w = entries[0].contentRect.width;
        setCelColWidth((w - 36 - 4 * 7) / 7);
      });
      celGridRoRef.current.observe(node);
    }
  }).current;
  var celulaCompacta = celColWidth > 0 && celColWidth < 52;
  var celulaMuitoCompacta = celColWidth > 0 && celColWidth < 32;
  var editorSnapshotRef = React.useRef(null);
  var pendingDiaLivreRef = React.useRef(null);
  var vozPendenteRef = React.useRef(null);
  var toastTimerRef = React.useRef(null);

  function carregar() {
    if (!db) { setLoading(false); setErro('Sem ligação à base de dados.'); return; }
    setLoading(true);
    Promise.all([
      db.from('horas_voz').select('*'),
      db.from('horas_voz_config').select('*').order('valido_desde', { ascending: true })
    ]).then(function (res) {
      var rRes = res[0], cRes = res[1];
      if (rRes.error) { setErro('Falha ao carregar registos: ' + rRes.error.message); setLoading(false); window.mostrarErro('Horas por Voz', rRes.error); return; }
      if (cRes.error) { setErro('Falha ao carregar configuração: ' + cRes.error.message); setLoading(false); window.mostrarErro('Horas por Voz', cRes.error); return; }
      var map = {};
      (rRes.data || []).forEach(function (r) { map[r.data] = r; });
      setRegistos(map);
      setConfigs((cRes.data && cRes.data.length) ? cRes.data : [HV_CONFIG_DEFAULT]);
      setErro(null);
      setLoading(false);
    }).catch(function (e) {
      console.error('[horasvoz] carregar:', e);
      setErro('Falha ao carregar: ' + (e && e.message ? e.message : e));
      setLoading(false);
      window.mostrarErro('Horas por Voz', e);
    });
  }
  React.useEffect(function () { carregar(); }, []);
  React.useEffect(function () { return window.csAoVoltarRede(function () { carregar(); }); }, []);

  var cfgHoje = hvConfigParaData(configs.length ? configs : [HV_CONFIG_DEFAULT], curDate);
  var der = hvDerivados(cfgHoje);
  var mondayCur = hvIso(hvMon(hvMk(curDate)));
  var cfgSemana = hvConfigParaSemana(configs.length ? configs : [HV_CONFIG_DEFAULT], mondayCur);
  var contarDesde = hvPrimeiraDataRegistada(registos, hvTodayIso());

  // useMemo nos cálculos pesados (semana / mês / ano) — só recalculam
  // quando os registos, a configuração ou a data/mês/ano em causa mudam,
  // não em cada render (ex.: escrever numa nota não deve reprocessar o ano).
  var weekCalc = React.useMemo(function () {
    var weekDaysArr = hvWeekDays(mondayCur).map(function (d) { return { date: d, row: registos[d] || null }; });
    return hvComputeWeek(cfgSemana, weekDaysArr);
  }, [mondayCur, cfgSemana, registos]);

  var mesData = React.useMemo(function () {
    var y = curMonthObj.y, m = curMonthObj.m;
    var nDias = hvDaysInMonth(y, m);
    var dias = [];
    var totalMes = 0, metaMes = 0, feriasN = 0, doenteN = 0;
    for (var dia = 1; dia <= nDias; dia++) {
      var dateStr = hvIsoDate(y, m, dia);
      var idx = hvDi(hvMk(dateStr));
      var row = registos[dateStr];
      var seg = hvIso(hvMon(hvMk(dateStr)));
      var cfgS = hvConfigParaSemana(configs.length ? configs : [HV_CONFIG_DEFAULT], seg);
      var wk = hvComputeWeek(cfgS, hvWeekDays(seg).map(function (d) { return { date: d, row: registos[d] || null }; }));
      var meta = idx <= 6 ? wk.metas[idx] : 0;
      var total = hvTotalDia(row, cfgS, wk.der);
      var livre = idx <= 4 && wk.dias[idx] ? wk.dias[idx].livre : false;
      if (idx < 5) { totalMes += total; metaMes += meta; }
      if (row && row.tipo === 'ferias') feriasN += row.fracao;
      if (row && row.tipo === 'doente') doenteN += row.fracao;
      dias.push({ dateStr: dateStr, dia: dia, idx: idx, total: total, meta: meta, tipo: row ? row.tipo : null, livre: livre, fimDeSemana: idx >= 5 });
    }
    return { dias: dias, totalMes: totalMes, metaMes: metaMes, feriasN: feriasN, doenteN: doenteN };
  }, [curMonthObj.y, curMonthObj.m, registos, configs]);

  // Mesma soma que mesData, mas com a percentagem trocada — para a
  // comparação "a 100% / a X%". Não é useMemo (só corre ao ver o Mês,
  // custo desprezável) e não mexe em mesData nem no motor de cálculo.
  function hvTotalMetaMesAPercentagem(y, m, pct) {
    var nDias = hvDaysInMonth(y, m);
    var totalMes = 0, metaMes = 0;
    for (var dia = 1; dia <= nDias; dia++) {
      var dateStr = hvIsoDate(y, m, dia);
      var idx = hvDi(hvMk(dateStr));
      if (idx >= 5) continue;
      var row = registos[dateStr];
      var seg = hvIso(hvMon(hvMk(dateStr)));
      var cfgSPct = Object.assign({}, hvConfigParaSemana(configs.length ? configs : [HV_CONFIG_DEFAULT], seg), { percentagem: pct });
      var wk = hvComputeWeek(cfgSPct, hvWeekDays(seg).map(function (d) { return { date: d, row: registos[d] || null }; }));
      totalMes += hvTotalDia(row, cfgSPct, wk.der);
      metaMes += wk.metas[idx];
    }
    return { totalMes: totalMes, metaMes: metaMes };
  }

  var anoData = React.useMemo(function () {
    var hoje = hvTodayIso();
    var meses = [];
    var diasAno = [];
    var feriasAno = 0, doenteAno = 0, feriadoAno = 0, fechoAno = 0;
    for (var m = 0; m < 12; m++) {
      var nDias = hvDaysInMonth(curYear, m);
      var totalMes = 0, metaMes = 0;
      for (var dia = 1; dia <= nDias; dia++) {
        var ds = hvIsoDate(curYear, m, dia);
        var idx = hvDi(hvMk(ds));
        if (idx > 6) continue;
        var row = registos[ds];
        var seg = hvIso(hvMon(hvMk(ds)));
        var cfgS = hvConfigParaSemana(configs.length ? configs : [HV_CONFIG_DEFAULT], seg);
        var wk = hvComputeWeek(cfgS, hvWeekDays(seg).map(function (d) { return { date: d, row: registos[d] || null }; }));
        var total = hvTotalDia(row, cfgS, wk.der);
        var meta = idx <= 6 ? wk.metas[idx] : 0;
        totalMes += total; metaMes += meta;
        diasAno.push({ dateStr: ds, total: total, meta: meta, temRegisto: !!row });
        if (row && row.tipo === 'ferias') feriasAno += row.fracao;
        if (row && row.tipo === 'doente') doenteAno += row.fracao;
        if (row && row.tipo === 'feriado') feriadoAno += row.fracao;
        if (row && row.tipo === 'fecho') fechoAno += row.fracao;
      }
      meses.push({ m: m, total: totalMes, meta: metaMes });
    }
    // Mesma função hvResumoAte usada em Dia/Semana/Mês, agora com o ano
    // inteiro já reunido num só array de dias — nada de acumulação à parte.
    var saldoAcumulado = hvResumoAte(diasAno, hoje, contarDesde).extra;
    return { meses: meses, saldoAcumulado: saldoAcumulado, feriasAno: feriasAno, doenteAno: doenteAno, feriadoAno: feriadoAno, fechoAno: fechoAno };
  }, [curYear, registos, configs, contarDesde]);

  var curIsoDow = hvDi(hvMk(curDate)); // 0..6 seg..dom
  var metaHoje = curIsoDow <= 6 ? weekCalc.metas[curIsoDow] : 0;
  var diaInfoHoje = curIsoDow <= 4 ? weekCalc.dias[curIsoDow] : null;
  var isLivreHoje = diaInfoHoje ? diaInfoHoje.livre : false;

  // Preenche o formulário a partir do registo gravado (ou dos valores
  // habituais da configuração, se não houver registo para essa data).
  function sincronizarFormComRegisto(dataAlvo) {
    var row = registos[dataAlvo];
    if (row) {
      setFTipo(row.tipo); setFFracao(row.fracao === 0.5 ? 0.5 : 1);
      setFManhaI(row.manha_inicio ? row.manha_inicio.slice(0, 5) : '');
      setFManhaF(row.manha_fim ? row.manha_fim.slice(0, 5) : '');
      setFTardeI(row.tarde_inicio ? row.tarde_inicio.slice(0, 5) : '');
      setFTardeF(row.tarde_fim ? row.tarde_fim.slice(0, 5) : '');
      setFSemManha(!row.manha_inicio); setFSemTarde(!row.tarde_inicio);
      setFNota(row.nota || ''); setFTextoOriginal(row.texto_original || '');
    } else {
      setFTipo('trabalho'); setFFracao(1);
      var cfgD = hvConfigParaData(configs.length ? configs : [HV_CONFIG_DEFAULT], dataAlvo);
      setFManhaI(cfgD.manha_inicio); setFManhaF(cfgD.manha_fim);
      setFTardeI(cfgD.tarde_inicio); setFTardeF(cfgD.tarde_fim);
      setFSemManha(false); setFSemTarde(false);
      setFNota(''); setFTextoOriginal('');
    }
    setErroForm(null);
  }
  function snapshotPayload(vals) {
    return JSON.stringify({
      tipo: vals.tipo, fracao: (vals.tipo === 'ferias' || vals.tipo === 'doente') ? (vals.fracao === 0.5 ? 0.5 : 1) : 1,
      manha_inicio: vals.manha_inicio || null, manha_fim: vals.manha_fim || null,
      tarde_inicio: vals.tarde_inicio || null, tarde_fim: vals.tarde_fim || null
    });
  }
  function aplicarValoresNoForm(vals) {
    setFTipo(vals.tipo); setFFracao(vals.fracao === 0.5 ? 0.5 : 1);
    setFManhaI(vals.manha_inicio || ''); setFManhaF(vals.manha_fim || '');
    setFTardeI(vals.tarde_inicio || ''); setFTardeF(vals.tarde_fim || '');
    setFSemManha(!vals.manha_inicio); setFSemTarde(!vals.tarde_inicio);
    setFTextoOriginal(vals.textoOriginal || vals.texto_original || '');
  }

  // Preenche o formulário quando muda o dia selecionado. Se houver um
  // resultado de voz pendente para essa mesma data (guardado em
  // vozPendenteRef por aplicarResultadoVoz), aplica-o DEPOIS de
  // sincronizar com o registo gravado, para não ser sobreposto por ele.
  React.useEffect(function () {
    sincronizarFormComRegisto(curDate);
    if (vozPendenteRef.current && vozPendenteRef.current.data === curDate) {
      var vp = vozPendenteRef.current; vozPendenteRef.current = null;
      aplicarValoresNoForm(vp);
      editorSnapshotRef.current = snapshotPayload(vp);
      setEditorAberto(true);
    }
    // eslint-disable-next-line
  }, [curDate, registos, configs.length]);

  function montarPayload() {
    return {
      tipo: fTipo, fracao: (fTipo === 'ferias' || fTipo === 'doente') ? fFracao : 1,
      manha_inicio: fSemManha ? null : (fManhaI || null),
      manha_fim: fSemManha ? null : (fManhaF || null),
      tarde_inicio: fSemTarde ? null : (fTardeI || null),
      tarde_fim: fSemTarde ? null : (fTardeF || null),
      pausa_min: cfgHoje.pausa_min, nota: fNota || null, texto_original: fTextoOriginal || null
    };
  }

  function guardarAgora(aoSucesso) {
    var payload = montarPayload();
    var erros = hvValidar(payload);
    if (erros.length) { setErroForm(erros[0]); return; }
    setSaving(true);
    var linha = Object.assign({ user_id: profile.id, data: curDate }, payload);
    db.from('horas_voz').upsert(linha, { onConflict: 'user_id,data' }).select().then(function (res) {
      setSaving(false);
      if (res.error) { setErroForm('Erro ao guardar: ' + res.error.message); window.mostrarErro('Horas por Voz', res.error); return; }
      var novo = (res.data && res.data[0]) || linha;
      setRegistos(function (p) { var n = Object.assign({}, p); n[curDate] = novo; return n; });
      setErroForm(null);
      if (aoSucesso) aoSucesso();
    }).catch(function (e) {
      setSaving(false);
      setErroForm('Erro de ligação: ' + (e && e.message ? e.message : e));
      window.mostrarErro('Horas por Voz', e);
    });
  }
  function mostrarToast(msg) {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(function () { setToast(''); }, 1800);
  }
  // Grava diretamente uma linha (sem passar pelo formulário) — usada
  // pelos botões rápidos do MODO A (Dia normal / Férias / Doente), cujos
  // valores são sempre bem formados por construção (não precisam de
  // hvValidar). Mesma tabela, mesmo upsert, mesmo tratamento de erro
  // que guardarAgora — só muda a origem dos dados.
  function gravarRapido(linhaParcial, aoSucesso) {
    var linha = Object.assign({ user_id: profile.id, data: curDate, pausa_min: cfgHoje.pausa_min, nota: null, texto_original: null }, linhaParcial);
    setSaving(true);
    db.from('horas_voz').upsert(linha, { onConflict: 'user_id,data' }).select().then(function (res) {
      setSaving(false);
      if (res.error) { window.mostrarErro('Horas por Voz', res.error); return; }
      var novo = (res.data && res.data[0]) || linha;
      setRegistos(function (p) { var n = Object.assign({}, p); n[curDate] = novo; return n; });
      if (aoSucesso) aoSucesso();
    }).catch(function (e) { setSaving(false); window.mostrarErro('Horas por Voz', e); });
  }
  function gravarDiaNormalRapido() {
    var linha = { tipo: 'trabalho', fracao: 1, manha_inicio: cfgHoje.manha_inicio, manha_fim: cfgHoje.manha_fim, tarde_inicio: cfgHoje.tarde_inicio, tarde_fim: cfgHoje.tarde_fim };
    var executar = function () { gravarRapido(linha, function () { mostrarToast('✓ Gravado'); }); };
    if (registos[curDate]) { pendingLoadRef.current = executar; setConfirmSubstituir({}); return; }
    if (isLivreHoje || curIsoDow >= 5) { pendingDiaLivreRef.current = executar; setConfirmDiaLivreAberto(true); return; }
    executar();
  }
  function gravarAusenciaRapido(tipo) {
    var linha = { tipo: tipo, fracao: 1, manha_inicio: null, manha_fim: null, tarde_inicio: null, tarde_fim: null };
    var executar = function () { gravarRapido(linha, function () { mostrarToast('✓ Gravado'); }); };
    if (registos[curDate]) { pendingLoadRef.current = executar; setConfirmSubstituir({}); return; }
    executar();
  }
  function abrirEditorComValores(vals) {
    aplicarValoresNoForm(vals);
    editorSnapshotRef.current = snapshotPayload(vals);
    setEditorAberto(true);
  }
  function abrirEditorOutroHorario() {
    abrirEditorComValores({
      tipo: 'trabalho', fracao: 1,
      manha_inicio: cfgHoje.manha_inicio.slice(0, 5), manha_fim: cfgHoje.manha_fim.slice(0, 5),
      tarde_inicio: cfgHoje.tarde_inicio.slice(0, 5), tarde_fim: cfgHoje.tarde_fim.slice(0, 5),
      texto_original: ''
    });
  }
  function abrirEditorParaEditar() {
    var row = registos[curDate];
    editorSnapshotRef.current = row ? snapshotPayload({
      tipo: row.tipo, fracao: row.fracao,
      manha_inicio: row.manha_inicio ? row.manha_inicio.slice(0, 5) : null, manha_fim: row.manha_fim ? row.manha_fim.slice(0, 5) : null,
      tarde_inicio: row.tarde_inicio ? row.tarde_inicio.slice(0, 5) : null, tarde_fim: row.tarde_fim ? row.tarde_fim.slice(0, 5) : null
    }) : null;
    setEditorAberto(true);
  }
  function cancelarEditor() {
    sincronizarFormComRegisto(curDate);
    editorSnapshotRef.current = null;
    setEditorAberto(false);
  }
  function guardarEditor() {
    guardarAgora(function () { setEditorAberto(false); editorSnapshotRef.current = null; mostrarToast('✓ Gravado'); });
  }
  // true só enquanto o editor está aberto e o formulário já não bate
  // certo com o instantâneo tirado ao abri-lo (usado só para o selo
  // "Alterado — por guardar" na barra da data).
  var editorAlterado = editorAberto && editorSnapshotRef.current !== null &&
    editorSnapshotRef.current !== snapshotPayload({ tipo: fTipo, fracao: fFracao, manha_inicio: fSemManha ? null : fManhaI, manha_fim: fSemManha ? null : fManhaF, tarde_inicio: fSemTarde ? null : fTardeI, tarde_fim: fSemTarde ? null : fTardeF });
  function mudarDia(novaData) {
    if (editorAberto && editorAlterado) { setConfirmDescartar(novaData); return; }
    setEditorAberto(false); editorSnapshotRef.current = null;
    setCurDate(novaData);
  }
  function confirmarDescarte() {
    var d = confirmDescartar;
    setConfirmDescartar(null); setEditorAberto(false); editorSnapshotRef.current = null;
    if (d) setCurDate(d);
  }
  function acaoIgualOntem() {
    var datas = Object.keys(registos).filter(function (d) { return d < curDate && registos[d].tipo === 'trabalho'; }).sort();
    setMaisAberto(false);
    if (!datas.length) { setErroForm('Não há nenhum dia de trabalho registado antes deste.'); return; }
    var ultimo = registos[datas[datas.length - 1]];
    abrirEditorComValores({
      tipo: 'trabalho', fracao: 1,
      manha_inicio: ultimo.manha_inicio ? ultimo.manha_inicio.slice(0, 5) : null, manha_fim: ultimo.manha_fim ? ultimo.manha_fim.slice(0, 5) : null,
      tarde_inicio: ultimo.tarde_inicio ? ultimo.tarde_inicio.slice(0, 5) : null, tarde_fim: ultimo.tarde_fim ? ultimo.tarde_fim.slice(0, 5) : null,
      texto_original: ''
    });
  }
  function apagarDiaAgora() {
    setSaving(true);
    db.from('horas_voz').delete().eq('user_id', profile.id).eq('data', curDate).then(function (res) {
      setSaving(false);
      if (res.error) { window.mostrarErro('Horas por Voz', res.error); return; }
      setRegistos(function (p) { var n = Object.assign({}, p); delete n[curDate]; return n; });
      setConfirmApagar(false);
    }).catch(function (e) { setSaving(false); window.mostrarErro('Horas por Voz', e); });
  }

  function confirmarSubstituicao() {
    if (pendingLoadRef.current) { pendingLoadRef.current(); pendingLoadRef.current = null; }
    setConfirmSubstituir(null);
  }

  // ── Voz ────────────────────────────────────────────────────────
  // Depois de falar, abre sempre o MODO C (editor) já preenchido com o
  // que foi percebido — nunca grava sozinho. Se a data falada for
  // diferente da atual, o preenchimento só pode acontecer depois do
  // efeito que sincroniza o formulário com o registo dessa data (senão
  // esse efeito sobrepunha-se ao resultado da voz) — por isso guarda-se
  // em vozPendenteRef e é o efeito de [curDate,...] que o aplica.
  function aplicarResultadoVoz(r) {
    if (!r.ok) { setVozErro(r.erro); return; }
    setVozErro(null);
    if (r.ePeriodo) {
      setPerIni(r.periodo.inicio); setPerFim(r.periodo.fim); setPerTipo(r.periodo.tipo);
      setPeriodoAberto(true);
      return;
    }
    var vals = { data: r.data, tipo: r.tipo, fracao: r.fracao, manha_inicio: r.manha_inicio, manha_fim: r.manha_fim, tarde_inicio: r.tarde_inicio, tarde_fim: r.tarde_fim, textoOriginal: r.textoOriginal };
    var aplicar = function () {
      vozPendenteRef.current = vals;
      if (r.data === curDate) {
        vozPendenteRef.current = null;
        abrirEditorComValores(vals);
      } else {
        setCurDate(r.data);
      }
    };
    if (registos[r.data]) { pendingLoadRef.current = aplicar; setConfirmSubstituir({}); return; }
    aplicar();
  }
  function clearSilenceTimer() { if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; } }
  function resetSilenceTimer() {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(function () { pararEscuta(); }, 2500);
  }
  function pararEscuta() {
    manualStopRef.current = true;
    clearSilenceTimer();
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) {} }
    setListening(false);
    if (accumRef.current.trim()) {
      var parser = vozIdioma === 'de' ? hvParseVozDe : hvParseVoz;
      aplicarResultadoVoz(parser(accumRef.current.trim(), hvTodayIso()));
    }
  }
  // idioma: 'pt' (padrão) ou 'de' — em alemão tenta primeiro de-CH
  // (suíço-alemão) e, se o browser não o reconhecer, cai para de-DE.
  function iniciarEscuta(idioma) {
    idioma = idioma === 'de' ? 'de' : 'pt';
    setVozIdioma(idioma);
    setVozErro(null);
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setVozIndisponivel(true); return; }
    accumRef.current = ''; setVozInterim(''); manualStopRef.current = false;
    deFallbackRef.current = false;
    function criarReconhecimento(lang) {
      var rec = new SR();
      rec.continuous = true; rec.interimResults = true; rec.lang = lang;
      rec.onresult = function (e) {
        resetSilenceTimer();
        var interim = '';
        for (var i = e.resultIndex; i < e.results.length; i++) {
          var result = e.results[i];
          if (result.isFinal) accumRef.current = (accumRef.current ? accumRef.current + ' ' : '') + result[0].transcript.trim();
          else interim += result[0].transcript;
        }
        setVozInterim(interim);
      };
      rec.onerror = function (e) {
        if (idioma === 'de' && lang === 'de-CH' && !deFallbackRef.current) {
          deFallbackRef.current = true;
          manualStopRef.current = true;
          try { rec.stop(); } catch (e2) {}
          manualStopRef.current = false;
          var rec2 = criarReconhecimento('de-DE');
          recognitionRef.current = rec2;
          try { rec2.start(); } catch (e3) { setVozIndisponivel(true); setListening(false); }
          return;
        }
        console.error('[horasvoz] reconhecimento de voz:', e && e.error);
        setVozErro('Falha no reconhecimento de voz: ' + (e && e.error ? e.error : 'desconhecida'));
        setListening(false); clearSilenceTimer();
      };
      rec.onend = function () { if (!manualStopRef.current) { try { rec.start(); } catch (e) { setListening(false); } } };
      return rec;
    }
    var rec = criarReconhecimento(idioma === 'de' ? 'de-CH' : 'pt-PT');
    recognitionRef.current = rec;
    setListening(true);
    resetSilenceTimer();
    try { rec.start(); } catch (e) { setVozIndisponivel(true); setListening(false); }
  }
  function enviarTextoManual() {
    if (!vozTextoManual.trim()) return;
    aplicarResultadoVoz(hvParseVoz(vozTextoManual.trim(), hvTodayIso()));
    setVozTextoManual('');
  }

  // ── Marcar período ────────────────────────────────────────────
  var perDiasBase = perFim >= perIni ? hvDiasUteisPeriodo(perIni, perFim) : [];
  var perSextasFalta = perFim >= perIni ? hvSextasEmFalta(perIni, perFim) : [];
  var perDias = perDiasBase.concat(perIncluirSextas ? perSextasFalta.filter(function (d) { return perDiasBase.indexOf(d) === -1; }) : []).sort();
  function acaoPara(d) {
    if (perAcoes[d]) return perAcoes[d];
    return registos[d] ? 'saltar' : 'substituir';
  }
  function gravarPeriodo() {
    var aplicar = perDias.filter(function (d) { return acaoPara(d) === 'substituir'; });
    if (!aplicar.length) { setPeriodoAberto(false); return; }
    setPerGravando(true);
    var linhas = aplicar.map(function (d) {
      return { user_id: profile.id, data: d, tipo: perTipo, fracao: 1, manha_inicio: null, manha_fim: null, tarde_inicio: null, tarde_fim: null, pausa_min: cfgHoje.pausa_min, texto_original: null };
    });
    db.from('horas_voz').upsert(linhas, { onConflict: 'user_id,data' }).select().then(function (res) {
      setPerGravando(false);
      if (res.error) { window.mostrarErro('Horas por Voz', res.error); return; }
      var novos = res.data || linhas;
      setRegistos(function (p) {
        var n = Object.assign({}, p);
        novos.forEach(function (r) { n[r.data] = r; });
        return n;
      });
      setPeriodoAberto(false); setPerAcoes({});
    }).catch(function (e) { setPerGravando(false); window.mostrarErro('Horas por Voz', e); });
  }

  // ── Definições — CRUD de períodos de configuração ─────────────
  function guardarConfigPeriodo(cfg) {
    var linha = Object.assign({ user_id: profile.id }, cfg);
    db.from('horas_voz_config').upsert(linha, { onConflict: 'user_id,valido_desde' }).select().then(function (res) {
      if (res.error) { window.mostrarErro('Horas por Voz', res.error); return; }
      setDefEditando(null);
      carregar();
    }).catch(function (e) { window.mostrarErro('Horas por Voz', e); });
  }
  function apagarConfigPeriodo(valido_desde) {
    if (configs.length <= 1) { setDefApagar(null); return; }
    db.from('horas_voz_config').delete().eq('user_id', profile.id).eq('valido_desde', valido_desde).then(function (res) {
      if (res.error) { window.mostrarErro('Horas por Voz', res.error); return; }
      setDefApagar(null);
      carregar();
    }).catch(function (e) { window.mostrarErro('Horas por Voz', e); });
  }

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  var appClass = 'hv-app' + (hvTemaEscuro() ? ' hv-dark' : '');

  if (loading) {
    return React.createElement('div', { className: appClass },
      React.createElement('style', null, HV_CSS),
      React.createElement('div', { style: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--hv-texto2)' } }, 'A carregar…')
    );
  }

  var payloadAtual = montarPayload();
  var trabalhadoMinAtual = hvTrabalhadoMin(Object.assign({ pausa_min: cfgHoje.pausa_min }, payloadAtual), cfgHoje.pausa_min);
  var creditoAtual = hvCredito(payloadAtual, cfgHoje, der);
  var totalAtual = trabalhadoMinAtual / 60 + creditoAtual;
  var saldoAtual = totalAtual - metaHoje;
  var pausaAplicada = trabalhadoMinAtual > 0 ? (payloadAtual.pausa_min || 0) : 0;
  var curDateObj = hvMk(curDate);

  var header = React.createElement('div', { style: { background: 'var(--hv-cartao)', padding: '12px 16px', borderBottom: '1px solid var(--hv-borda)', display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, zIndex: 20 } },
    React.createElement('button', { onClick: onBack, style: { background: 'var(--hv-fundo)', border: '1px solid var(--hv-borda)', color: 'var(--hv-texto2)', borderRadius: 10, width: 40, height: 40, cursor: 'pointer', fontSize: 16, flex: 'none' } }, '←'),
    React.createElement('div', { style: { flex: 1, minWidth: 0 } },
      React.createElement('div', { style: { fontWeight: 800, fontSize: 16, color: 'var(--hv-texto)' } }, 'Horas por Voz'),
      React.createElement('div', { style: { fontSize: 11, color: 'var(--hv-texto2)', marginTop: 1 } }, 'KW ' + hvKw(curDateObj) + ' · ' + HV_MESES_LABEL[curDateObj.getUTCMonth()])
    ),
    React.createElement('button', { onClick: function () { setDefAberto(true); }, style: { background: 'none', border: 'none', color: 'var(--hv-texto2)', fontSize: 20, cursor: 'pointer', flex: 'none' } }, '⚙️')
  );

  var tabs = React.createElement('div', { style: { display: 'flex', gap: 6, padding: '10px 16px 0' } },
    [['dia', 'Dia'], ['semana', 'Semana'], ['mes', 'Mês'], ['ano', 'Ano']].map(function (t) {
      var ativo = view === t[0];
      return React.createElement('button', {
        key: t[0], onClick: function () { setView(t[0]); },
        style: { flex: 1, background: ativo ? 'var(--hv-principal)' : 'var(--hv-cartao)', color: ativo ? 'var(--hv-principal-texto)' : 'var(--hv-texto)', border: '1px solid ' + (ativo ? 'var(--hv-principal)' : 'var(--hv-borda)'), borderRadius: 10, padding: '9px 0', fontWeight: 800, fontSize: 13, cursor: 'pointer' }
      }, t[1]);
    })
  );

  var corpo;
  if (view === 'dia') corpo = renderDia();
  else if (view === 'semana') corpo = renderSemana();
  else if (view === 'mes') corpo = renderMes();
  else corpo = renderAno();

  // 7 dias da semana atual com total/meta/estado já prontos para
  // apresentação (faixa do Dia e vista Semana partilham esta base — os
  // totais continuam a vir de weekCalc.totais/hvTotalDia, nunca daqui).
  function hvDiasDeSemana(segundaStr) {
    var cfgS = segundaStr === mondayCur ? cfgSemana : hvConfigParaSemana(configs.length ? configs : [HV_CONFIG_DEFAULT], segundaStr);
    var wk = segundaStr === mondayCur ? weekCalc : hvComputeWeek(cfgS, hvWeekDays(segundaStr).map(function (d) { return { date: d, row: registos[d] || null }; }));
    var hoje = hvTodayIso();
    return hvWeekDays(segundaStr).map(function (dateStr, i) {
      var row = registos[dateStr] || null;
      var util = i < 5 ? wk.dias[i] : null;
      var livre = util ? util.livre : false;
      var meta = wk.metas[i];
      var total = i < 5 ? wk.totais[i] : hvTotalDia(row, cfgS, wk.der);
      return { dateStr: dateStr, row: row, isoDow: i + 1, livre: livre, meta: meta, total: total, temRegisto: !!row, fimDeSemana: i >= 5, hoje: dateStr === hoje };
    });
  }
  function hvDiasSemanaCompleta() { return hvDiasDeSemana(mondayCur); }
  // Extra de um dia — SEMPRE a partir da compensação da sua semana ISO
  // completa (Seg-Dom), nunca do estado bruto local; único sítio usado
  // por Dia, Mês (cartão + calendário + lista) e Semana, para o mesmo
  // dia mostrar sempre o mesmo valor em qualquer ecrã.
  function extraDiaMostrado(dataStr) {
    var segunda = hvIso(hvMon(hvMk(dataStr)));
    var dias = hvDiasDeSemana(segunda);
    var comp = hvCompensarExtrasGrupo(dias, hvTodayIso(), contarDesde);
    return comp[dataStr] != null ? comp[dataStr] : null;
  }

  // Comparação "E se fosse outra percentagem?" — painel recolhível
  // (estado persistido em localStorage), sempre com as mesmas funções
  // puras hvMetaSemanaMinPct/hvMetaDiaMinPct/hvMetaAteHojeMinPct/
  // hvFeitoAteHojeMinPct acima; nunca mexe em hvComputeWeek/hvDerivados
  // nem nos totais/metas reais mostrados no resto do ecrã.
  var HV_TABELA_TH = { textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--hv-texto2)', padding: '0 6px 6px 0', borderBottom: '1px solid var(--hv-borda)' };
  var HV_TABELA_TD = { textAlign: 'left', fontSize: 13, color: 'var(--hv-texto)', padding: '6px 6px 6px 0' };
  function renderStepperPct() {
    return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 } },
      React.createElement('span', { style: { fontSize: 12, color: 'var(--hv-texto2)' } }, 'Comparar a:'),
      React.createElement('button', { className: 'hv-time-btn', style: { width: 32, height: 32, fontSize: 15 }, onClick: function () { setPctComparar(Math.max(10, pctComparar - 10)); } }, '−'),
      React.createElement('span', { style: { fontSize: 14, fontWeight: 800, color: 'var(--hv-texto)', minWidth: 42, textAlign: 'center' } }, pctComparar + '%'),
      React.createElement('button', { className: 'hv-time-btn', style: { width: 32, height: 32, fontSize: 15 }, onClick: function () { setPctComparar(Math.min(100, pctComparar + 10)); } }, '+')
    );
  }
  function renderComparacaoWrapper(conteudo) {
    return React.createElement(HvCard, { style: { background: 'var(--hv-fundo)' } },
      React.createElement('button', {
        onClick: function () { setCompararAberto(!compararAberto); },
        style: { display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--hv-texto)', fontSize: 13, fontWeight: 700 }
      },
        React.createElement('span', null, '📊 E se fosse outra percentagem?'),
        React.createElement('span', null, compararAberto ? '▾' : '▸')
      ),
      compararAberto && React.createElement('div', { style: { marginTop: 10 } }, conteudo)
    );
  }
  function renderComparacaoDia() {
    var semMeta = isLivreHoje || curIsoDow >= 5;
    if (semMeta) return renderComparacaoWrapper(React.createElement('p', { style: { fontSize: 13, color: 'var(--hv-texto2)', margin: 0 } }, 'Dia sem meta.'));
    var naoGravado = !registos[curDate];
    var linhas = [{ pct: cfgHoje.percentagem, atual: true }, { pct: pctComparar, atual: false }];
    var metaSemana100 = hvMetaSemanaMinPct(cfgHoje, 100);
    var metaDia100 = hvMetaDiaMinPct(cfgHoje, 100);
    var conteudo = React.createElement('div', null,
      React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: 'var(--hv-texto)', marginBottom: 8 } },
        'Hoje: ' + hvMinToHM(totalAtual * 60) + (naoGravado ? ' (dia normal, por gravar)' : '')
      ),
      React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse' } },
        React.createElement('thead', null, React.createElement('tr', null,
          React.createElement('th', { style: HV_TABELA_TH }, 'Percentagem'),
          React.createElement('th', { style: HV_TABELA_TH }, 'Meta do dia'),
          React.createElement('th', { style: HV_TABELA_TH }, 'Extra')
        )),
        React.createElement('tbody', null, linhas.map(function (l, i) {
          var derL = hvDerivados(Object.assign({}, cfgHoje, { percentagem: l.pct }));
          var totalMin = Math.round((trabalhadoMinAtual / 60 + hvCredito(payloadAtual, cfgHoje, derL)) * 60 + 1e-9);
          var metaDiaMin = hvMetaDiaMinPct(cfgHoje, l.pct);
          return React.createElement('tr', { key: i },
            React.createElement('td', { style: HV_TABELA_TD }, l.pct + '%' + (l.atual ? ' (atual)' : '')),
            React.createElement('td', { style: HV_TABELA_TD }, hvMinToHM(metaDiaMin)),
            React.createElement('td', { style: HV_TABELA_TD }, React.createElement(HvSaldoTextoMin, { valorMin: totalMin - metaDiaMin }))
          );
        }))
      ),
      renderStepperPct(),
      React.createElement('p', { style: { fontSize: 12, color: 'var(--hv-texto2)', marginTop: 8, marginBottom: 0 } },
        'A 100% trabalharias seg–sex: ' + hvMinToHM(metaSemana100) + ' por semana = ' + hvMinToHM(metaDia100) + ' por dia.'
      )
    );
    return renderComparacaoWrapper(conteudo);
  }
  function renderComparacaoSemana() {
    var hoje = hvTodayIso();
    var dias = hvDiasSemanaCompleta();
    var linhas = [{ pct: cfgSemana.percentagem, atual: true }, { pct: pctComparar, atual: false }];
    var conteudo = React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse' } },
      React.createElement('thead', null, React.createElement('tr', null,
        React.createElement('th', { style: HV_TABELA_TH }, 'Percentagem'),
        React.createElement('th', { style: HV_TABELA_TH }, 'Meta da semana'),
        React.createElement('th', { style: HV_TABELA_TH }, 'Feito'),
        React.createElement('th', { style: HV_TABELA_TH }, 'Extra até hoje')
      )),
      React.createElement('tbody', null, linhas.map(function (l, i) {
        var metaSemanaMin = hvMetaSemanaMinPct(cfgSemana, l.pct);
        var feitoMin = hvFeitoAteHojeMinPct(cfgSemana, dias, l.pct, hoje);
        var metaAteHojeMin = hvMetaAteHojeMinPct(cfgSemana, l.pct, mondayCur, hoje);
        return React.createElement('tr', { key: i },
          React.createElement('td', { style: HV_TABELA_TD }, l.pct + '%' + (l.atual ? ' (atual)' : '')),
          React.createElement('td', { style: HV_TABELA_TD }, hvMinToHM(metaSemanaMin)),
          React.createElement('td', { style: HV_TABELA_TD }, hvMinToHM(feitoMin)),
          React.createElement('td', { style: HV_TABELA_TD }, React.createElement(HvSaldoTextoMin, { valorMin: feitoMin - metaAteHojeMin }))
        );
      }))
    );
    return renderComparacaoWrapper(conteudo);
  }
  function renderComparacaoMes(y, m) {
    var mesAtualPct = hvTotalMetaMesAPercentagem(y, m, cfgHoje.percentagem);
    var pares = [{ label: cfgHoje.percentagem + '% (atual)', total: mesAtualPct.totalMes, meta: mesAtualPct.metaMes }];
    var mesPct = hvTotalMetaMesAPercentagem(y, m, pctComparar);
    pares.push({ label: pctComparar + '%', total: mesPct.totalMes, meta: mesPct.metaMes });
    var conteudo = React.createElement('div', null,
      pares.map(function (p, i) {
        return React.createElement('div', { key: i, style: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--hv-texto)', marginBottom: i < pares.length - 1 ? 4 : 0 } },
          React.createElement('span', null, p.label),
          React.createElement('span', null, hvMinToHM(p.total * 60) + ' de ' + hvMinToHM(p.meta * 60))
        );
      }),
      renderStepperPct()
    );
    return renderComparacaoWrapper(conteudo);
  }

  function renderFaixaSemana() {
    var dias = hvDiasSemanaCompleta();
    var hoje = hvTodayIso();
    var bolinhas = dias.map(function (d) {
      var est = hvClassificarDia({ dateStr: d.dateStr, hojeStr: hoje, temRegisto: d.temRegisto, livre: d.livre, fimDeSemana: d.fimDeSemana, desdeStr: contarDesde });
      var estadoBolinha = est.estado === 'gravado' ? 'gravado' : ((est.estado === 'falta' || est.estado === 'hoje-por-registar') ? 'aviso' : 'neutro');
      var corTipoFg = d.row ? hvCorTipo(d.row.tipo).fg : 'var(--hv-principal)';
      return React.createElement(HvBolinhaDia, {
        key: d.dateStr, letra: HV_DIA_CURTO[d.isoDow - 1].charAt(0), estado: estadoBolinha, corTipoFg: corTipoFg,
        selecionado: d.dateStr === curDate, onClick: function (ds) { return function () { mudarDia(ds); }; }(d.dateStr)
      });
    });
    var totalSemana = dias.reduce(function (s, d) { return s + d.total; }, 0);
    var saldoAteHoje = hvResumoAte(dias, hoje, contarDesde).extra;
    return React.createElement('div', null,
      React.createElement('div', { className: 'hv-faixa' }, bolinhas),
      React.createElement('div', { style: { fontSize: 12, color: 'var(--hv-texto2)', textAlign: 'center', marginTop: 6 } },
        'Semana: ' + hvMinToHM(totalSemana * 60) + ' de ' + hvMinToHM(weekCalc.meta_semana * 60) + ' · extra até hoje ',
        React.createElement(HvSaldoTexto, { valor: saldoAteHoje })
      )
    );
  }

  function renderBarraData() {
    var row = registos[curDate];
    var hoje = hvTodayIso();
    var est = hvClassificarDia({ dateStr: curDate, hojeStr: hoje, temRegisto: !!row, livre: isLivreHoje, fimDeSemana: curIsoDow >= 5 });
    var badge;
    if (editorAberto && editorAlterado) badge = React.createElement(HvBadgeEstado, { tipo: 'alterado' }, 'Alterado — por guardar');
    else if (est.estado === 'gravado') badge = React.createElement(HvBadgeEstado, { tipo: 'gravado' }, '✓ Gravado');
    else if (est.estado === 'fds' || est.estado === 'livre') badge = React.createElement(HvBadgeEstado, { tipo: 'livre' }, est.rotulo);
    else if (est.estado === 'futuro') badge = React.createElement(HvBadgeEstado, { tipo: 'livre' }, 'Por vir');
    else if (est.estado === 'hoje-por-registar') badge = React.createElement(HvBadgeEstado, { tipo: 'porregistar' }, 'Por registar');
    else badge = React.createElement(HvBadgeEstado, { tipo: 'porregistar' }, '⚠ Por registar');
    return React.createElement('div', { style: HV_ESTILO.linhaTopo },
      React.createElement('button', { style: HV_ESTILO.navBtn, onClick: function () { mudarDia(hvIso(hvAddD(hvMk(curDate), -1))); } }, '‹'),
      React.createElement('div', { style: { flex: 1, textAlign: 'center' } },
        React.createElement('div', { style: { fontWeight: 800, color: 'var(--hv-texto)', fontSize: 15 } }, HV_DIA_LONGO[curIsoDow > 6 ? 0 : curIsoDow] + ' ' + hvFmt(hvMk(curDate))),
        React.createElement('div', { style: { marginTop: 4, display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center', flexWrap: 'wrap' } },
          badge,
          React.createElement('span', { style: { fontSize: 11, color: 'var(--hv-texto2)' } }, isLivreHoje ? 'meta 0' : 'meta ' + hvMinToHM(metaHoje * 60))
        )
      ),
      React.createElement('button', { style: HV_ESTILO.navBtn, onClick: function () { mudarDia(hvIso(hvAddD(hvMk(curDate), 1))); } }, '›'),
      curDate !== hoje && React.createElement('button', { onClick: function () { mudarDia(hoje); }, style: { background: 'var(--hv-principal)', border: 'none', color: 'var(--hv-principal-texto)', borderRadius: 10, padding: '0 12px', height: 44, fontSize: 12, fontWeight: 800, cursor: 'pointer', flex: 'none' } }, 'Hoje')
    );
  }

  function renderModoA() {
    var previewMin = hvBlocoMin(cfgHoje.manha_inicio, cfgHoje.manha_fim) + hvBlocoMin(cfgHoje.tarde_inicio, cfgHoje.tarde_fim) - (cfgHoje.pausa_min || 0);
    return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
      React.createElement(HvBtn, {
        grande: true, ativo: true, disabled: saving, onClick: gravarDiaNormalRapido,
        style: { height: 64, display: 'flex', flexDirection: 'column', gap: 2 }
      },
        React.createElement('span', null, saving ? 'A gravar…' : '✓ Dia normal'),
        React.createElement('span', { style: { fontSize: 11, fontWeight: 600, opacity: .85 } },
          cfgHoje.manha_inicio.slice(0, 5) + '–' + cfgHoje.manha_fim.slice(0, 5) + ' · ' + cfgHoje.tarde_inicio.slice(0, 5) + '–' + cfgHoje.tarde_fim.slice(0, 5) + ' = ' + hvMinToHM(previewMin))
      ),
      vozIndisponivel
        ? React.createElement('div', { style: { display: 'flex', gap: 8 } },
            React.createElement('input', { type: 'text', value: vozTextoManual, autoComplete: 'off', onChange: function (e) { setVozTextoManual(e.target.value); }, placeholder: 'ex.: trabalhei das 7 às 12 e das 12h45 às 16h15', style: { flex: 1, background: 'var(--hv-cartao)', border: '1px solid var(--hv-borda)', color: 'var(--hv-texto)', borderRadius: 10, padding: '10px 12px', fontSize: 14 } }),
            React.createElement(HvBtn, { onClick: enviarTextoManual, ativo: true, style: { flex: 'none', width: 56 } }, 'OK')
          )
        : (listening
            ? React.createElement('button', {
                onClick: pararEscuta,
                style: Object.assign({}, HV_ESTILO.microfoneOuvindo, { height: 56 })
              }, vozInterim || 'A ouvir…')
            : React.createElement('div', { style: { display: 'flex', gap: 8 } },
                React.createElement('button', { onClick: function () { iniciarEscuta('pt'); }, style: Object.assign({}, HV_ESTILO.microfone, { height: 56, flex: 1 }) }, '🎤 PT'),
                React.createElement('button', { onClick: function () { iniciarEscuta('de'); }, style: Object.assign({}, HV_ESTILO.microfone, { height: 56, flex: 1 }) }, '🎤 DE')
              )
          ),
      vozErro && React.createElement('p', { style: Object.assign({}, HV_ESTILO.erroTexto, { fontSize: 12 }) }, '⚠️ ' + vozErro),
      React.createElement(HvBtn, { grande: true, onClick: abrirEditorOutroHorario, flex: true }, '✏️ Outro horário'),
      React.createElement('div', { style: { display: 'flex', gap: 8 } },
        React.createElement(HvBtn, { grande: true, tipoCor: 'ferias', disabled: saving, onClick: function () { gravarAusenciaRapido('ferias'); }, flex: true }, '🏖 Férias'),
        React.createElement(HvBtn, { grande: true, tipoCor: 'doente', disabled: saving, onClick: function () { gravarAusenciaRapido('doente'); }, flex: true }, '🤒 Doente'),
        React.createElement(HvBtn, { grande: true, onClick: function () { setMaisAberto(true); }, style: { flex: 'none', width: 56 } }, '⋯')
      ),
      erroForm && React.createElement('p', { style: Object.assign({}, HV_ESTILO.erroTexto, { textAlign: 'center' }) }, '⚠️ ' + erroForm)
    );
  }

  function renderModoB() {
    var row = registos[curDate];
    var info = hvTipoInfo(row.tipo);
    var horarioTexto;
    if (row.tipo === 'trabalho') {
      var partes = [];
      if (row.manha_inicio && row.manha_fim) partes.push(row.manha_inicio.slice(0, 5) + '–' + row.manha_fim.slice(0, 5));
      if (row.tarde_inicio && row.tarde_fim) partes.push(row.tarde_inicio.slice(0, 5) + '–' + row.tarde_fim.slice(0, 5));
      horarioTexto = partes.length ? partes.join(' · ') : '—';
    } else {
      horarioTexto = row.fracao === 0.5 ? 'Meio dia' : 'Dia inteiro';
    }
    return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
      React.createElement(HvCard, null,
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 } },
          React.createElement('span', { style: { fontSize: 24 } }, info.emoji),
          React.createElement('div', null,
            React.createElement('div', { style: { fontWeight: 800, fontSize: 15, color: 'var(--hv-texto)' } }, info.label),
            React.createElement('div', { style: { fontSize: 12, color: 'var(--hv-texto2)' } }, horarioTexto)
          )
        ),
        React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px 14px', fontSize: 13, color: 'var(--hv-texto2)', paddingTop: 10, borderTop: '1px solid var(--hv-borda)' } },
          React.createElement('span', null, 'Trabalhado ', React.createElement('b', { style: { color: 'var(--hv-texto)' } }, hvMinToHM(trabalhadoMinAtual))),
          pausaAplicada > 0 && React.createElement('span', null, 'Pausa ', React.createElement('b', { style: { color: 'var(--hv-texto)' } }, hvMinToHM(-pausaAplicada))),
          creditoAtual > 0 && React.createElement('span', null, 'Crédito ', React.createElement('b', { style: { color: 'var(--hv-texto)' } }, hvMinToHM(creditoAtual * 60)))
        ),
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--hv-borda)' } },
          React.createElement('div', null, React.createElement('div', { style: HV_ESTILO.etiquetaSm }, 'Total'), React.createElement('div', { style: HV_ESTILO.totalNumero }, hvMinToHM(totalAtual * 60))),
          React.createElement('div', { style: { textAlign: 'center' } }, React.createElement('div', { style: HV_ESTILO.etiquetaSm }, 'Meta'), React.createElement('div', { style: HV_ESTILO.metaNumero }, hvMinToHM(metaHoje * 60))),
          React.createElement('div', { style: { textAlign: 'right' } }, React.createElement('div', { style: HV_ESTILO.etiquetaSm }, 'Extra'), React.createElement('div', { style: HV_ESTILO.saldoNumero }, React.createElement(HvSaldoTextoMin, { valorMin: extraDiaMostrado(curDate) != null ? extraDiaMostrado(curDate) : Math.round(saldoAtual * 60) })))
        )
      ),
      weekCalc.aviso && React.createElement(HvCard, { style: HV_ESTILO.avisoCartao }, React.createElement('p', { style: HV_ESTILO.avisoTexto }, '⚠️ ' + weekCalc.aviso)),
      React.createElement('div', { style: { display: 'flex', gap: 8 } },
        React.createElement(HvBtn, { grande: true, onClick: abrirEditorParaEditar, flex: true }, '✏️ Editar'),
        React.createElement('button', { onClick: function () { setConfirmApagar(true); }, style: HV_ESTILO.botaoPerigo }, '🗑')
      ),
      !vozIndisponivel && React.createElement('button', {
        onClick: function () { listening ? pararEscuta() : iniciarEscuta(); },
        style: { height: 44, borderRadius: 10, border: '1px solid var(--hv-borda)', background: listening ? 'var(--hv-negativo)' : 'var(--hv-cartao)', color: listening ? '#fff' : 'var(--hv-texto)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }
      }, listening ? (vozInterim || 'A ouvir…') : '🎤 Corrigir por voz'),
      vozErro && React.createElement('p', { style: Object.assign({}, HV_ESTILO.erroTexto, { fontSize: 12, textAlign: 'center' }) }, '⚠️ ' + vozErro)
    );
  }

  function renderModoC() {
    return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
      fTextoOriginal && React.createElement('p', { style: { fontSize: 11, color: 'var(--hv-texto2)', fontStyle: 'italic', margin: 0 } }, '🎤 "' + fTextoOriginal + '"'),
      React.createElement('div', { className: 'hv-tipos-scroll' },
        HV_TIPOS.map(function (t) {
          var ativo = fTipo === t.key;
          var c = hvCorTipo(t.key);
          return React.createElement('button', {
            key: t.key, className: 'hv-tipo-chip',
            style: ativo ? { background: c.bg, color: c.fg, border: 'none' } : {},
            onClick: function () { setFTipo(t.key); if (t.key !== 'ferias' && t.key !== 'doente') setFFracao(1); }
          }, t.emoji + ' ' + t.label);
        })
      ),
      (fTipo === 'ferias' || fTipo === 'doente') && React.createElement('div', { style: { display: 'flex', gap: 8 } },
        React.createElement(HvBtn, { ativo: fFracao === 1, onClick: function () { setFFracao(1); setFSemManha(true); setFSemTarde(true); }, flex: true }, 'Dia inteiro'),
        React.createElement(HvBtn, { ativo: fFracao === 0.5, onClick: function () { setFFracao(0.5); setFSemManha(false); setFSemTarde(false); }, flex: true }, 'Meio dia')
      ),
      (fTipo === 'trabalho' || ((fTipo === 'ferias' || fTipo === 'doente') && fFracao === 0.5)) && renderCamposHoras(),
      React.createElement(HvCard, { style: { background: 'var(--hv-fundo)' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, fontSize: 13, color: 'var(--hv-texto)', fontWeight: 700 } },
          React.createElement('span', null, 'Total ' + hvMinToHM(totalAtual * 60)),
          React.createElement('span', null, 'Meta ' + hvMinToHM(metaHoje * 60)),
          React.createElement(HvSaldoTexto, { valor: saldoAtual })
        )
      ),
      erroForm && React.createElement('p', { style: Object.assign({}, HV_ESTILO.erroTexto, { textAlign: 'center' }) }, '⚠️ ' + erroForm),
      React.createElement('div', { className: 'hv-editor-footer' },
        React.createElement(HvBtn, { grande: true, onClick: cancelarEditor, flex: true }, 'Cancelar'),
        React.createElement(HvBtn, { grande: true, ativo: true, disabled: saving, onClick: guardarEditor, flex: true, style: { height: 56 } }, saving ? 'A guardar…' : 'Guardar')
      )
    );
  }

  function renderDia() {
    var temRegisto = !!registos[curDate];
    return React.createElement('div', { style: HV_ESTILO.pagina },
      erro && React.createElement(HvCard, null, React.createElement('p', { style: HV_ESTILO.erroTexto }, '⚠️ ' + erro)),
      renderFaixaSemana(),
      renderBarraData(),
      editorAberto ? renderModoC() : (temRegisto ? renderModoB() : renderModoA()),
      renderComparacaoDia()
    );
  }

  function renderCamposHoras() {
    return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
      React.createElement('div', null,
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 } },
          React.createElement('span', { style: { fontSize: 12, fontWeight: 800, color: 'var(--hv-texto)', textTransform: 'uppercase' } }, 'Manhã'),
          React.createElement(HvInterruptor, { checked: !fSemManha, onChange: function (v) { setFSemManha(!v); } })
        ),
        !fSemManha && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          React.createElement(HvCampoHora, { label: 'Início', value: fManhaI, onChange: setFManhaI }),
          React.createElement(HvCampoHora, { label: 'Fim', value: fManhaF, onChange: setFManhaF })
        )
      ),
      React.createElement('div', null,
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 } },
          React.createElement('span', { style: { fontSize: 12, fontWeight: 800, color: 'var(--hv-texto)', textTransform: 'uppercase' } }, 'Tarde'),
          React.createElement(HvInterruptor, { checked: !fSemTarde, onChange: function (v) { setFSemTarde(!v); } })
        ),
        !fSemTarde && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          React.createElement(HvCampoHora, { label: 'Início', value: fTardeI, onChange: setFTardeI }),
          React.createElement(HvCampoHora, { label: 'Fim', value: fTardeF, onChange: setFTardeF })
        )
      )
    );
  }

  var modalMais = maisAberto && React.createElement('div', {
    style: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 150 },
    onClick: function (e) { if (e.target === e.currentTarget) setMaisAberto(false); }
  },
    React.createElement('div', { style: { background: 'var(--hv-fundo)', width: '100%', maxWidth: 520, borderRadius: '16px 16px 0 0', padding: 18, display: 'flex', flexDirection: 'column', gap: 8 } },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 } },
        React.createElement('h2', { style: { color: 'var(--hv-texto)', fontSize: 16, fontWeight: 800 } }, '⋯ Mais'),
        React.createElement('button', { onClick: function () { setMaisAberto(false); }, style: { background: 'none', border: 'none', color: 'var(--hv-texto2)', fontSize: 18, cursor: 'pointer' } }, '✕')
      ),
      React.createElement('button', { className: 'hv-mais-item', onClick: function () { setMaisAberto(false); abrirEditorComValores({ tipo: 'ferias', fracao: 0.5, manha_inicio: cfgHoje.manha_inicio.slice(0, 5), manha_fim: cfgHoje.manha_fim.slice(0, 5), tarde_inicio: null, tarde_fim: null, texto_original: '' }); } }, '🏖 Meio dia férias'),
      React.createElement('button', { className: 'hv-mais-item', onClick: function () { setMaisAberto(false); abrirEditorComValores({ tipo: 'doente', fracao: 0.5, manha_inicio: cfgHoje.manha_inicio.slice(0, 5), manha_fim: cfgHoje.manha_fim.slice(0, 5), tarde_inicio: null, tarde_fim: null, texto_original: '' }); } }, '🤒 Meio dia doente'),
      React.createElement('button', { className: 'hv-mais-item', onClick: function () { setMaisAberto(false); abrirEditorComValores({ tipo: 'feriado', fracao: 1, manha_inicio: null, manha_fim: null, tarde_inicio: null, tarde_fim: null, texto_original: '' }); } }, '🎉 Feriado'),
      React.createElement('button', { className: 'hv-mais-item', onClick: function () { setMaisAberto(false); abrirEditorComValores({ tipo: 'fecho', fracao: 1, manha_inicio: null, manha_fim: null, tarde_inicio: null, tarde_fim: null, texto_original: '' }); } }, '🔒 Fecho Dez.'),
      React.createElement('button', { className: 'hv-mais-item', onClick: acaoIgualOntem }, '📋 Igual a ontem'),
      React.createElement('button', { className: 'hv-mais-item', onClick: function () { setMaisAberto(false); setPeriodoAberto(true); } }, '📅 Marcar período')
    )
  );

  function renderSemana() {
    var hoje = hvTodayIso();
    var dias = hvDiasSemanaCompleta();
    var linhas = dias.map(function (d, i) {
      return React.createElement(HvLinhaSemana, {
        key: d.dateStr, dataStr: d.dateStr, total: d.total, meta: d.meta,
        tipo: d.row ? d.row.tipo : null, livre: d.livre,
        hoje: d.hoje, fimDeSemana: d.fimDeSemana, desde: contarDesde, extraMin: extraDiaMostrado(d.dateStr),
        rotulo: HV_DIA_CURTO[i] + ' ' + hvFmt(hvMk(d.dateStr)),
        onClick: function () { setView('dia'); mudarDia(d.dateStr); }
      });
    });
    var totalSemana = dias.reduce(function (s, d) { return s + d.total; }, 0);
    var saldoAteHoje = hvResumoAte(dias, hoje, contarDesde).extra;
    var falta = Math.max(0, weekCalc.meta_semana - totalSemana);
    var diasFaltamTrabalho = dias.filter(function (d) { return d.dateStr >= hoje && !d.fimDeSemana && !d.livre && !d.temRegisto; });
    var metaMediaFalta = diasFaltamTrabalho.length ? (falta / diasFaltamTrabalho.length) : 0;
    var mostrarLegenda = !HV_LEGENDA_SEMANA_VISTA;
    if (!HV_LEGENDA_SEMANA_VISTA) HV_LEGENDA_SEMANA_VISTA = true;
    return React.createElement('div', { style: HV_ESTILO.pagina },
      React.createElement('div', { style: HV_ESTILO.linhaTopo },
        React.createElement('button', { style: HV_ESTILO.navBtn, onClick: function () { setCurDate(hvIso(hvAddD(hvMk(mondayCur), -7))); } }, '‹'),
        React.createElement('div', { style: { flex: 1, textAlign: 'center', fontWeight: 800, color: 'var(--hv-texto)' } }, 'KW ' + hvKw(hvMk(mondayCur)) + ' · ' + hvFmt(hvMk(mondayCur)) + '–' + hvFmt(hvAddD(hvMk(mondayCur), 6))),
        React.createElement('button', { style: HV_ESTILO.navBtn, onClick: function () { setCurDate(hvIso(hvAddD(hvMk(mondayCur), 7))); } }, '›')
      ),
      React.createElement(HvCard, { style: { background: 'var(--hv-fundo)' } },
        React.createElement('div', { style: { fontSize: 15, fontWeight: 800, color: 'var(--hv-texto)' } }, 'Feito ' + hvMinToHM(totalSemana * 60) + ' de ' + hvMinToHM(weekCalc.meta_semana * 60)),
        React.createElement('div', { style: { fontSize: 13, marginTop: 4, color: 'var(--hv-texto2)' } }, 'Extra até hoje ', React.createElement(HvSaldoTexto, { valor: saldoAteHoje })),
        falta > 0 && diasFaltamTrabalho.length > 0 && React.createElement('div', { style: { fontSize: 12, marginTop: 4, color: 'var(--hv-texto2)' } },
          'Falta ' + hvMinToHM(falta * 60) + ' → ' + diasFaltamTrabalho.map(function (d) { return HV_DIA_CURTO[d.isoDow - 1]; }).join('–') + ' ' + hvMinToHM(metaMediaFalta * 60) + ' por dia'
        )
      ),
      renderComparacaoSemana(),
      mostrarLegenda && React.createElement('div', { className: 'hv-legenda' }, React.createElement('span', null, 'Feito · Meta · Extra')),
      React.createElement(HvCard, { style: { padding: 0 } }, React.createElement('div', { style: { padding: '0 16px' } }, linhas))
    );
  }

  function renderMesNav(y, m) {
    return React.createElement('div', { style: HV_ESTILO.linhaTopo },
      React.createElement('button', { style: HV_ESTILO.navBtn, onClick: function () { var d = new Date(Date.UTC(y, m - 1, 1)); setCurMonthObj({ y: d.getUTCFullYear(), m: d.getUTCMonth() }); } }, '‹'),
      React.createElement('div', { style: { flex: 1, textAlign: 'center', fontWeight: 800, color: 'var(--hv-texto)' } }, HV_MESES_LABEL[m] + ' ' + y),
      React.createElement('button', { style: HV_ESTILO.navBtn, onClick: function () { var d = new Date(Date.UTC(y, m + 1, 1)); setCurMonthObj({ y: d.getUTCFullYear(), m: d.getUTCMonth() }); } }, '›')
    );
  }

  function renderMesLista(y, m) {
    var hoje = hvTodayIso();
    var diasUteis = mesData.dias.filter(function (d) { return !d.fimDeSemana; });
    var linhas = diasUteis.map(function (d) {
      return React.createElement(HvLinhaMes, {
        key: d.dateStr, dataStr: d.dateStr, total: d.total, meta: d.meta, tipo: d.tipo, livre: d.livre,
        hoje: d.dateStr === hoje, fimDeSemana: false, desde: contarDesde, extraMin: extraDiaMostrado(d.dateStr),
        rotulo: HV_DIA_CURTO[d.idx] + ' ' + String(d.dia).padStart(2, '0') + '.' + String(m + 1).padStart(2, '0') + '.',
        onClick: function (ds) { return function () { setView('dia'); mudarDia(ds); }; }(d.dateStr)
      });
    });
    // Saldo até hoje: mesma função hvResumoAte usada em Semana/Ano, sem
    // tocar nos totais/metas por dia.
    var saldoAteHoje = hvResumoAte(diasUteis.map(function (d) { return { dateStr: d.dateStr, total: d.total, meta: d.meta, temRegisto: !!d.tipo }; }), hoje, contarDesde).extra;
    return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
      React.createElement(HvCard, { style: { background: 'var(--hv-fundo)' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--hv-texto)', fontWeight: 700, marginBottom: 4 } },
          React.createElement('span', null, 'Total ' + hvMinToHM(mesData.totalMes * 60)),
          React.createElement('span', { style: { fontWeight: 400, color: 'var(--hv-texto2)' } }, 'extra até hoje '),
          React.createElement(HvSaldoTexto, { valor: saldoAteHoje })
        ),
        React.createElement('div', { style: HV_ESTILO.textoMuted }, '🏖 ' + hvDez(mesData.feriasN) + ' dias de férias · 🤒 ' + hvDez(mesData.doenteN) + ' dias doente')
      ),
      renderComparacaoMes(y, m),
      React.createElement(HvCard, { style: { padding: 0 } }, React.createElement('div', { style: { padding: '0 8px' } }, linhas))
    );
  }

  // ── Ações do cartão do dia selecionado (Calendário) — mesmas funções
  // de gravação já usadas no ecrã Dia; abrir editor navega para lá
  // ("mesmo comportamento do ecrã Dia"), gravar rápido fica na grelha.
  function aoClicarOutroHorarioCal() { abrirEditorOutroHorario(); setView('dia'); }
  function aoClicarEditarCal() { abrirEditorParaEditar(); setView('dia'); }

  function renderCartaoDiaGravadoCal(row) {
    var info = hvTipoInfo(row.tipo);
    var horarioTexto;
    if (row.tipo === 'trabalho') {
      var partes = [];
      if (row.manha_inicio && row.manha_fim) partes.push(row.manha_inicio.slice(0, 5) + '–' + row.manha_fim.slice(0, 5));
      if (row.tarde_inicio && row.tarde_fim) partes.push(row.tarde_inicio.slice(0, 5) + '–' + row.tarde_fim.slice(0, 5));
      horarioTexto = partes.length ? partes.join(' · ') : '—';
    } else {
      horarioTexto = row.fracao === 0.5 ? 'Meio dia' : 'Dia inteiro';
    }
    return React.createElement('div', null,
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 } },
        React.createElement('span', { style: { fontSize: 22 } }, info.emoji),
        React.createElement('div', null,
          React.createElement('div', { style: { fontWeight: 800, fontSize: 14, color: 'var(--hv-texto)' } }, info.label),
          React.createElement('div', { style: { fontSize: 12, color: 'var(--hv-texto2)' } }, horarioTexto)
        )
      ),
      React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px 14px', fontSize: 13, color: 'var(--hv-texto2)', paddingTop: 10, borderTop: '1px solid var(--hv-borda)' } },
        React.createElement('span', null, 'Trabalhado ', React.createElement('b', { style: { color: 'var(--hv-texto)' } }, hvMinToHM(trabalhadoMinAtual))),
        pausaAplicada > 0 && React.createElement('span', null, 'Pausa ', React.createElement('b', { style: { color: 'var(--hv-texto)' } }, hvMinToHM(-pausaAplicada))),
        creditoAtual > 0 && React.createElement('span', null, 'Crédito ', React.createElement('b', { style: { color: 'var(--hv-texto)' } }, hvMinToHM(creditoAtual * 60)))
      ),
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--hv-borda)' } },
        React.createElement('div', null, React.createElement('div', { style: HV_ESTILO.etiquetaSm }, 'Total'), React.createElement('div', { style: HV_ESTILO.totalNumero }, hvMinToHM(totalAtual * 60))),
        React.createElement('div', { style: { textAlign: 'center' } }, React.createElement('div', { style: HV_ESTILO.etiquetaSm }, 'Meta'), React.createElement('div', { style: HV_ESTILO.metaNumero }, hvMinToHM(metaHoje * 60))),
        React.createElement('div', { style: { textAlign: 'right' } }, React.createElement('div', { style: HV_ESTILO.etiquetaSm }, 'Extra'), React.createElement('div', { style: HV_ESTILO.saldoNumero }, React.createElement(HvSaldoTextoMin, { valorMin: extraDiaMostrado(curDate) != null ? extraDiaMostrado(curDate) : Math.round(saldoAtual * 60) })))
      ),
      React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 12 } },
        React.createElement(HvBtn, { grande: true, onClick: aoClicarEditarCal, flex: true }, '✏️ Editar'),
        React.createElement('button', { onClick: function () { setConfirmApagar(true); }, style: HV_ESTILO.botaoPerigo }, '🗑')
      )
    );
  }
  function renderCartaoDiaSemRegistoCal() {
    return React.createElement('div', null,
      React.createElement('div', { style: { fontSize: 13, color: 'var(--hv-texto2)', marginBottom: 10 } }, 'Por registar · meta ' + hvMinToHM(metaHoje * 60)),
      React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } },
        React.createElement(HvBtn, { grande: true, ativo: true, disabled: saving, onClick: gravarDiaNormalRapido, flex: true }, '✓ Dia normal'),
        React.createElement(HvBtn, { grande: true, tipoCor: 'ferias', disabled: saving, onClick: function () { gravarAusenciaRapido('ferias'); }, flex: true }, '🏖 Férias'),
        React.createElement(HvBtn, { grande: true, tipoCor: 'doente', disabled: saving, onClick: function () { gravarAusenciaRapido('doente'); }, flex: true }, '🤒 Doente'),
        React.createElement(HvBtn, { grande: true, onClick: aoClicarOutroHorarioCal, flex: true }, '✏️ Outro horário')
      )
    );
  }
  function renderCartaoDiaCal() {
    var row = registos[curDate];
    return React.createElement(HvCard, null,
      React.createElement('div', { style: { fontWeight: 800, fontSize: 14, color: 'var(--hv-texto)', marginBottom: 8 } },
        HV_DIA_LONGO[curIsoDow > 6 ? 0 : curIsoDow] + ' ' + hvFmt(hvMk(curDate))
      ),
      row ? renderCartaoDiaGravadoCal(row) : renderCartaoDiaSemRegistoCal()
    );
  }

  function renderSubtotaisSemanaMes(y, m) {
    var grupos = {}, ordem = [];
    mesData.dias.forEach(function (d) {
      var seg = hvIso(hvMon(hvMk(d.dateStr)));
      if (!grupos[seg]) { grupos[seg] = []; ordem.push(seg); }
      grupos[seg].push(d);
    });
    var hoje = hvTodayIso();
    return React.createElement(HvCard, { style: { padding: 0 } },
      ordem.map(function (seg) {
        var diasGrupo = grupos[seg];
        var completa = diasGrupo.length === 7;
        var domingo = hvIso(hvAddD(hvMk(seg), 6));
        // Semana inteiramente antes de "contar a partir de" (sem dados
        // relevantes) ou inteiramente no futuro (ainda por chegar) não
        // mostram Total/Extra — só semanas parciais/atuais/passadas com
        // dados mantêm a linha completa, como antes.
        if (contarDesde && domingo < contarDesde) {
          return React.createElement('div', {
            key: seg, className: 'hv-cal-semana-linha', style: { color: 'var(--hv-texto2)' },
            onClick: function () { setCurDate(seg); setView('semana'); }
          }, React.createElement('span', null, 'KW ' + hvKw(hvMk(seg)) + ' · —'));
        }
        if (seg > hoje) {
          return React.createElement('div', {
            key: seg, className: 'hv-cal-semana-linha', style: { color: 'var(--hv-texto2)' },
            onClick: function () { setCurDate(seg); setView('semana'); }
          }, React.createElement('span', null, 'KW ' + hvKw(hvMk(seg)) + ' · por vir'));
        }
        var totalBruto = diasGrupo.reduce(function (s, d) { return s + d.total; }, 0);
        // Soma os mesmos minutos já compensados das células desta semana
        // (não re-arredonda), para "Extra" bater sempre com a grelha.
        var extraMinSemana = diasGrupo.reduce(function (s, d) { return s + (extraDiaMostrado(d.dateStr) || 0); }, 0);
        return React.createElement('div', {
          key: seg, className: 'hv-cal-semana-linha',
          onClick: function () { setCurDate(seg); setView('semana'); }
        },
          React.createElement('span', null,
            'KW ' + hvKw(hvMk(seg)) + ' · Total ' + hvMinToHM(totalBruto * 60) + ' · Extra ' + (extraMinSemana >= 0 ? '+' : '') + hvMinToHM(extraMinSemana) +
            (completa ? '' : ' (parte de ' + HV_MESES_LABEL[m].slice(0, 3).toLowerCase() + '.)')
          )
        );
      })
    );
  }

  function aoClicarGrelhaCalendario(e) {
    var kwEl = e.target.closest('[data-kw-monday]');
    if (kwEl) { setCurDate(kwEl.getAttribute('data-kw-monday')); setView('semana'); return; }
    var el = e.target.closest('[data-date]');
    if (!el) return;
    mudarDia(el.getAttribute('data-date'));
  }
  function aoDuploCliqueGrelhaCalendario(e) {
    var el = e.target.closest('[data-date]');
    if (!el) return;
    mudarDia(el.getAttribute('data-date'));
    setView('dia');
  }
  function aoClicarFabCalendario() {
    var hoje = hvTodayIso();
    mudarDia(registos[hoje] ? curDate : hoje);
    setView('dia');
  }

  function renderMesCalendario(y, m) {
    var hoje = hvTodayIso();
    var diasUteis = mesData.dias.filter(function (d) { return !d.fimDeSemana; });
    var resumo = hvResumoAte(diasUteis.map(function (d) { return { dateStr: d.dateStr, total: d.total, meta: d.meta, temRegisto: !!d.tipo }; }), hoje, contarDesde);
    var trabalhoN = 0, feriadoN = 0, fechoN = 0;
    mesData.dias.forEach(function (d) { if (d.tipo === 'trabalho') trabalhoN++; if (d.tipo === 'feriado') feriadoN++; if (d.tipo === 'fecho') fechoN++; });

    var mesDiaPorData = {};
    mesData.dias.forEach(function (d) { mesDiaPorData[d.dateStr] = d; });
    var grelha = hvConstruirGrelhaMes(y, m);
    var celulasGrid = [];
    grelha.forEach(function (semana) {
      celulasGrid.push(React.createElement('div', { key: 'kw' + semana.segunda, className: 'hv-cal-kw', 'data-kw-monday': semana.segunda },
        React.createElement('div', null, 'KW'),
        React.createElement('div', null, semana.kw)
      ));
      semana.celulas.forEach(function (dNum, i) {
        if (dNum == null) { celulasGrid.push(React.createElement('div', { key: semana.segunda + '-v' + i, className: 'hv-cal-vazia' })); return; }
        var dateStr = hvIsoDate(y, m, dNum);
        var dm = mesDiaPorData[dateStr];
        celulasGrid.push(React.createElement(HvCelulaCalendario, {
          key: dateStr, dateStr: dateStr, dia: dNum, total: dm.total, meta: dm.meta,
          row: registos[dateStr] || null, livre: dm.livre, fimDeSemana: dm.fimDeSemana,
          hoje: dateStr === hoje, selecionado: dateStr === curDate, desde: contarDesde, extraMin: extraDiaMostrado(dateStr),
          compacta: celulaCompacta, muitoCompacta: celulaMuitoCompacta
        }));
      });
    });

    return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', paddingBottom: 88 } },
      React.createElement(HvCard, { style: { background: 'var(--hv-fundo)' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' } },
          React.createElement('div', null,
            React.createElement('div', { style: HV_ESTILO.etiquetaSm }, 'Total até agora'),
            React.createElement('div', { style: { fontSize: 19, fontWeight: 800, color: 'var(--hv-texto)' } }, hvMinToHM(resumo.total * 60))
          ),
          React.createElement('div', { style: { textAlign: 'center' } },
            React.createElement('div', { style: HV_ESTILO.etiquetaSm }, 'Meta até agora'),
            React.createElement('div', { style: HV_ESTILO.metaNumero }, hvMinToHM(resumo.meta * 60))
          ),
          React.createElement('div', { style: { textAlign: 'right' } },
            React.createElement('div', { style: HV_ESTILO.etiquetaSm }, 'Horas extra'),
            React.createElement('div', { style: { fontSize: 22, fontWeight: 800 } }, React.createElement(HvSaldoTexto, { valor: resumo.extra }))
          )
        ),
        React.createElement('div', { style: Object.assign({}, HV_ESTILO.textoMuted, { marginTop: 8, fontSize: 12 }) },
          'Dias: trabalho ' + trabalhoN + ' · férias ' + hvDez(mesData.feriasN) + ' · doente ' + hvDez(mesData.doenteN) + ' · feriado ' + feriadoN + ' · fecho ' + fechoN
        )
      ),
      React.createElement('div', { className: 'hv-cal-cabecalho' },
        React.createElement('span', null, ''),
        HV_DIA_CURTO.map(function (n, i) { return React.createElement('span', { key: i }, n.toUpperCase()); })
      ),
      React.createElement('div', {
        className: 'hv-cal-grid', ref: celGridRefCb,
        style: celColWidth > 0 ? { '--hv-cel-w': celColWidth + 'px' } : undefined,
        onClick: aoClicarGrelhaCalendario, onDoubleClick: aoDuploCliqueGrelhaCalendario
      }, celulasGrid),
      renderCartaoDiaCal(),
      renderSubtotaisSemanaMes(y, m),
      React.createElement('button', { className: 'hv-cal-fab', onClick: aoClicarFabCalendario }, '+')
    );
  }

  function renderMes() {
    var y = curMonthObj.y, m = curMonthObj.m;
    return React.createElement('div', { style: HV_ESTILO.pagina },
      React.createElement('div', { className: 'hv-cal-toggle' },
        React.createElement('button', { className: mesVista === 'calendario' ? 'hv-cal-toggle-ativo' : '', onClick: function () { setMesVista('calendario'); } }, '📅 Calendário'),
        React.createElement('button', { className: mesVista === 'lista' ? 'hv-cal-toggle-ativo' : '', onClick: function () { setMesVista('lista'); } }, '☰ Lista')
      ),
      renderMesNav(y, m),
      mesVista === 'calendario' ? renderMesCalendario(y, m) : renderMesLista(y, m)
    );
  }

  function renderAno() {
    var hoje = hvTodayIso();
    var hojeM = hvMk(hoje);
    var mesAtualAbs = hojeM.getUTCFullYear() * 12 + hojeM.getUTCMonth();
    return React.createElement('div', { style: HV_ESTILO.pagina },
      React.createElement('div', { style: HV_ESTILO.linhaTopo },
        React.createElement('button', { style: HV_ESTILO.navBtn, onClick: function () { setCurYear(curYear - 1); } }, '‹'),
        React.createElement('div', { style: { flex: 1, textAlign: 'center', fontWeight: 800, color: 'var(--hv-texto)' } }, String(curYear)),
        React.createElement('button', { style: HV_ESTILO.navBtn, onClick: function () { setCurYear(curYear + 1); } }, '›')
      ),
      React.createElement(HvCard, { style: { background: 'var(--hv-fundo)' } },
        React.createElement('div', { style: Object.assign({}, HV_ESTILO.etiquetaSm, { marginBottom: 4 }) }, 'Saldo acumulado até hoje'),
        React.createElement('div', { style: HV_ESTILO.saldoNumero }, React.createElement(HvSaldoTexto, { valor: anoData.saldoAcumulado })),
        React.createElement('div', { style: Object.assign({}, HV_ESTILO.textoMuted, { fontSize: 12, marginTop: 8 }) }, '🏖 ' + hvDez(anoData.feriasAno) + ' férias · 🤒 ' + hvDez(anoData.doenteAno) + ' doente · 🎉 ' + hvDez(anoData.feriadoAno) + ' feriado · 🔒 ' + hvDez(anoData.fechoAno) + ' fecho')
      ),
      React.createElement(HvCard, { style: { padding: 0 } }, React.createElement('div', { style: { padding: '0 8px' } },
        anoData.meses.map(function (mo) {
          var futuro = (curYear * 12 + mo.m) > mesAtualAbs;
          return React.createElement(HvLinhaAno, {
            key: mo.m, total: mo.total, meta: mo.meta, rotulo: HV_MESES_LABEL[mo.m], futuro: futuro,
            onClick: function (mm) { return function () { setCurMonthObj({ y: curYear, m: mm }); setView('mes'); }; }(mo.m)
          });
        })
      ))
    );
  }

  // ── Modal: Marcar período ─────────────────────────────────────
  var modalPeriodo = periodoAberto && React.createElement('div', {
    style: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 150 },
    onClick: function (e) { if (e.target === e.currentTarget) setPeriodoAberto(false); }
  },
    React.createElement('div', { style: { background: 'var(--hv-fundo)', width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto', borderRadius: '16px 16px 0 0', padding: 18 } },
      React.createElement('h2', { style: { color: 'var(--hv-texto)', fontSize: 17, fontWeight: 800, marginBottom: 12 } }, '📅 Marcar período'),
      React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 10 } },
        React.createElement('div', { style: { flex: 1 } },
          React.createElement('div', { style: HV_ESTILO.label }, 'Início'),
          React.createElement('input', { type: 'date', value: perIni, autoComplete: 'off', onChange: function (e) { setPerIni(e.target.value); }, style: { width: '100%', background: 'var(--hv-cartao)', border: '1px solid var(--hv-borda)', color: 'var(--hv-texto)', borderRadius: 8, padding: '8px 10px' } })
        ),
        React.createElement('div', { style: { flex: 1 } },
          React.createElement('div', { style: HV_ESTILO.label }, 'Fim'),
          React.createElement('input', { type: 'date', value: perFim, autoComplete: 'off', onChange: function (e) { setPerFim(e.target.value); }, style: { width: '100%', background: 'var(--hv-cartao)', border: '1px solid var(--hv-borda)', color: 'var(--hv-texto)', borderRadius: 8, padding: '8px 10px' } })
        )
      ),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 10 } },
        [['ferias', 'Férias'], ['doente', 'Doente'], ['feriado', 'Feriado'], ['fecho', 'Fecho']].map(function (t) {
          return React.createElement(HvBtn, { key: t[0], tipoCor: perTipo === t[0] ? t[0] : null, onClick: function () { setPerTipo(t[0]); } }, t[1]);
        })
      ),
      perSextasFalta.length > 0 && React.createElement('div', { style: Object.assign({}, HV_ESTILO.avisoCartao, { borderRadius: 10, padding: 10, marginBottom: 10 }) },
        React.createElement('p', { style: Object.assign({}, HV_ESTILO.avisoTexto, { marginBottom: 6 }) }, '⚠️ A firma conta a sexta — incluir ' + (perSextasFalta.length > 1 ? 'as sextas' : 'a sexta') + '?'),
        React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--hv-texto)' } },
          React.createElement('input', { type: 'checkbox', checked: perIncluirSextas, onChange: function (e) { setPerIncluirSextas(e.target.checked); } }), 'Incluir')
      ),
      React.createElement('div', { style: Object.assign({}, HV_ESTILO.etiquetaSm, { marginBottom: 6 }) }, perDias.length + ' dia(s):'),
      React.createElement('div', { style: { maxHeight: 240, overflow: 'auto', marginBottom: 12 } },
        perDias.map(function (d) {
          var jaTem = !!registos[d];
          var acao = acaoPara(d);
          return React.createElement('div', { key: d, style: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--hv-borda)' } },
            React.createElement('span', { style: { flex: 1, fontSize: 13, color: 'var(--hv-texto)' } }, HV_DIA_CURTO[hvDi(hvMk(d))] + ' ' + hvFmt(hvMk(d)) + (jaTem ? ' · já registado' : '')),
            jaTem
              ? React.createElement('div', { style: { display: 'flex', gap: 4 } },
                  React.createElement('button', { onClick: function () { setPerAcoes(function (p) { var n = Object.assign({}, p); n[d] = 'substituir'; return n; }); }, style: { fontSize: 11, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--hv-borda)', background: acao === 'substituir' ? 'var(--hv-negativo)' : 'var(--hv-cartao)', color: acao === 'substituir' ? '#fff' : 'var(--hv-texto)', cursor: 'pointer' } }, 'Substituir'),
                  React.createElement('button', { onClick: function () { setPerAcoes(function (p) { var n = Object.assign({}, p); n[d] = 'saltar'; return n; }); }, style: { fontSize: 11, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--hv-borda)', background: acao === 'saltar' ? 'var(--hv-principal)' : 'var(--hv-cartao)', color: acao === 'saltar' ? 'var(--hv-principal-texto)' : 'var(--hv-texto)', cursor: 'pointer' } }, 'Saltar')
                )
              : React.createElement('span', { style: { fontSize: 11, color: 'var(--hv-positivo)' } }, 'novo')
          );
        })
      ),
      React.createElement('div', { style: { display: 'flex', gap: 8 } },
        React.createElement(HvBtn, { grande: true, onClick: function () { setPeriodoAberto(false); setPerAcoes({}); }, flex: true }, 'Cancelar'),
        React.createElement(HvBtn, { grande: true, ativo: true, onClick: gravarPeriodo, disabled: perGravando || !perDias.length, flex: true }, perGravando ? 'A gravar…' : 'Gravar período')
      )
    )
  );

  // ── Modal: Definições ──────────────────────────────────────────
  var modalDef = defAberto && React.createElement('div', {
    style: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 150 },
    onClick: function (e) { if (e.target === e.currentTarget) { setDefAberto(false); setDefEditando(null); } }
  },
    React.createElement('div', { style: { background: 'var(--hv-fundo)', width: '100%', maxWidth: 520, maxHeight: '92vh', overflow: 'auto', borderRadius: '16px 16px 0 0', padding: 18 } },
      !defEditando ? renderListaConfigs() : renderEditorConfig()
    )
  );

  function renderListaConfigs() {
    var derAtual = hvDerivados(cfgHoje);
    return React.createElement('div', null,
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 } },
        React.createElement('h2', { style: { color: 'var(--hv-texto)', fontSize: 17, fontWeight: 800 } }, '⚙️ Definições'),
        React.createElement('button', { onClick: function () { setDefAberto(false); }, style: { background: 'none', border: 'none', color: 'var(--hv-texto2)', fontSize: 18, cursor: 'pointer' } }, '✕')
      ),
      React.createElement(HvCard, { style: { marginBottom: 14, background: 'var(--hv-cartao)' } },
        React.createElement('div', { style: Object.assign({}, HV_ESTILO.etiquetaSm, { marginBottom: 6 }) }, 'Valores calculados (config atual)'),
        React.createElement('div', { style: { fontSize: 12.5, color: 'var(--hv-texto)', lineHeight: 1.7 } },
          'base_dia = ' + hvDez(derAtual.base_dia) + 'h', React.createElement('br', null),
          'meta_semana = ' + hvDez(derAtual.meta_semana) + 'h', React.createElement('br', null),
          'crédito de férias/doente = ' + hvDez(derAtual.credito_ausencia) + 'h (meio dia ' + hvDez(derAtual.credito_ausencia / 2) + 'h)'
        )
      ),
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } },
        React.createElement('span', { style: { fontSize: 13, fontWeight: 800, color: 'var(--hv-texto)' } }, 'Períodos'),
        React.createElement('button', { onClick: function () { setDefEditando(Object.assign({}, HV_CONFIG_DEFAULT, { valido_desde: '' })); }, style: { background: 'var(--hv-principal)', border: 'none', color: 'var(--hv-principal-texto)', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 800, cursor: 'pointer' } }, '+ Novo')
      ),
      configs.slice().sort(function (a, b) { return a.valido_desde < b.valido_desde ? 1 : -1; }).map(function (c) {
        return React.createElement(HvCard, { key: c.valido_desde, style: { marginBottom: 8 } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
            React.createElement('div', null,
              React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: 'var(--hv-texto)' } }, 'Válido desde ' + hvFmtDataLonga(c.valido_desde)),
              React.createElement('div', { style: Object.assign({}, HV_ESTILO.textoMuted, { fontSize: 11, marginTop: 2 }) }, c.percentagem + '% · ' + c.horas_dia_100 + 'h/dia (100%) · dias: ' + (c.dias_trabalho || []).map(function (i) { return HV_DIA_CURTO[i - 1]; }).join(','))
            ),
            React.createElement('div', { style: { display: 'flex', gap: 6 } },
              React.createElement('button', { onClick: function () { setDefEditando(c); }, style: { background: 'var(--hv-fundo)', border: '1px solid var(--hv-borda)', color: 'var(--hv-texto)', borderRadius: 8, padding: '6px 10px', fontSize: 12, cursor: 'pointer' } }, 'Editar'),
              configs.length > 1 && React.createElement('button', { onClick: function () { setDefApagar(c.valido_desde); }, style: { background: 'var(--hv-fundo)', border: '1px solid var(--hv-negativo)', color: 'var(--hv-negativo)', borderRadius: 8, padding: '6px 10px', fontSize: 12, cursor: 'pointer' } }, '🗑')
            )
          )
        );
      }),
      React.createElement(HvConfirm, {
        aberto: !!defApagar, mensagem: 'Apagar este período de configuração?',
        onCancelar: function () { setDefApagar(null); }, onConfirmar: function () { apagarConfigPeriodo(defApagar); }
      })
    );
  }
  function renderEditorConfig() {
    var c = defEditando;
    function set(campo, v) { setDefEditando(Object.assign({}, c, campo)); }
    return React.createElement('div', null,
      React.createElement('h2', { style: { color: 'var(--hv-texto)', fontSize: 16, fontWeight: 800, marginBottom: 12 } }, c.valido_desde ? 'Editar período' : 'Novo período'),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
        React.createElement('label', { style: HV_ESTILO.label }, 'Válido desde',
          React.createElement('input', { type: 'date', value: c.valido_desde || '', autoComplete: 'off', onChange: function (e) { set({ valido_desde: e.target.value }); }, style: { width: '100%', marginTop: 3, background: 'var(--hv-cartao)', border: '1px solid var(--hv-borda)', color: 'var(--hv-texto)', borderRadius: 8, padding: '8px 10px' } })),
        React.createElement('label', { style: HV_ESTILO.label }, 'Percentagem (%)',
          React.createElement('input', { type: 'number', value: c.percentagem, autoComplete: 'off', onChange: function (e) { set({ percentagem: +e.target.value }); }, style: { width: '100%', marginTop: 3, background: 'var(--hv-cartao)', border: '1px solid var(--hv-borda)', color: 'var(--hv-texto)', borderRadius: 8, padding: '8px 10px' } })),
        React.createElement('label', { style: HV_ESTILO.label }, 'Horas dia (100%)',
          React.createElement('input', { type: 'number', step: '0.1', value: c.horas_dia_100, autoComplete: 'off', onChange: function (e) { set({ horas_dia_100: +e.target.value }); }, style: { width: '100%', marginTop: 3, background: 'var(--hv-cartao)', border: '1px solid var(--hv-borda)', color: 'var(--hv-texto)', borderRadius: 8, padding: '8px 10px' } })),
        React.createElement('label', { style: HV_ESTILO.label }, 'Horas ausência (100%)',
          React.createElement('input', { type: 'number', step: '0.1', value: c.horas_ausencia_100, autoComplete: 'off', onChange: function (e) { set({ horas_ausencia_100: +e.target.value }); }, style: { width: '100%', marginTop: 3, background: 'var(--hv-cartao)', border: '1px solid var(--hv-borda)', color: 'var(--hv-texto)', borderRadius: 8, padding: '8px 10px' } })),
        React.createElement('div', null,
          React.createElement('div', { style: Object.assign({}, HV_ESTILO.label, { marginBottom: 4 }) }, 'Dias de trabalho'),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 } },
            HV_DIA_CURTO.map(function (nome, i) {
              var iso = i + 1;
              var ativo = (c.dias_trabalho || []).indexOf(iso) !== -1;
              return React.createElement('button', {
                key: iso, onClick: function () {
                  var lst = (c.dias_trabalho || []).slice();
                  var idx = lst.indexOf(iso);
                  if (idx === -1) lst.push(iso); else lst.splice(idx, 1);
                  set({ dias_trabalho: lst });
                },
                style: { background: ativo ? 'var(--hv-principal)' : 'var(--hv-cartao)', color: ativo ? 'var(--hv-principal-texto)' : 'var(--hv-texto)', border: '1px solid var(--hv-borda)', borderRadius: 6, padding: '6px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer' }
              }, nome);
            })
          )
        ),
        React.createElement('label', { style: HV_ESTILO.label }, 'Base do feriado',
          React.createElement('select', { value: c.feriado_base, onChange: function (e) { set({ feriado_base: e.target.value }); }, style: { width: '100%', marginTop: 3, background: 'var(--hv-cartao)', border: '1px solid var(--hv-borda)', color: 'var(--hv-texto)', borderRadius: 8, padding: '8px 10px' } },
            React.createElement('option', { value: 'ausencia' }, 'Crédito de ausência'),
            React.createElement('option', { value: 'dia' }, 'Dia completo (base_dia)')
          )),
        React.createElement('label', { style: HV_ESTILO.label }, 'Pausa (min)',
          React.createElement('input', { type: 'number', value: c.pausa_min, autoComplete: 'off', onChange: function (e) { set({ pausa_min: +e.target.value }); }, style: { width: '100%', marginTop: 3, background: 'var(--hv-cartao)', border: '1px solid var(--hv-borda)', color: 'var(--hv-texto)', borderRadius: 8, padding: '8px 10px' } })),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          React.createElement(HvCampoHora, { label: 'Manhã início', value: c.manha_inicio, onChange: function (v) { set({ manha_inicio: v }); } }),
          React.createElement(HvCampoHora, { label: 'Manhã fim', value: c.manha_fim, onChange: function (v) { set({ manha_fim: v }); } })
        ),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          React.createElement(HvCampoHora, { label: 'Tarde início', value: c.tarde_inicio, onChange: function (v) { set({ tarde_inicio: v }); } }),
          React.createElement(HvCampoHora, { label: 'Tarde fim', value: c.tarde_fim, onChange: function (v) { set({ tarde_fim: v }); } })
        )
      ),
      React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 16 } },
        React.createElement(HvBtn, { grande: true, onClick: function () { setDefEditando(null); }, flex: true }, 'Cancelar'),
        React.createElement(HvBtn, { grande: true, ativo: true, onClick: function () { guardarConfigPeriodo(c); }, disabled: !c.valido_desde, flex: true }, 'Guardar')
      )
    );
  }

  return React.createElement('div', { className: appClass },
    React.createElement('style', null, HV_CSS),
    header, tabs, corpo,
    modalPeriodo, modalDef, modalMais,
    toast && React.createElement('div', { className: 'hv-toast' }, toast),
    React.createElement(HvConfirm, {
      aberto: !!confirmSubstituir, mensagem: 'Este dia já tem registo. Queres substituir?',
      onCancelar: function () { setConfirmSubstituir(null); pendingLoadRef.current = null; }, onConfirmar: confirmarSubstituicao
    }),
    React.createElement(HvConfirm, {
      aberto: confirmApagar, mensagem: 'Apagar o registo deste dia?',
      onCancelar: function () { setConfirmApagar(false); }, onConfirmar: apagarDiaAgora
    }),
    React.createElement(HvConfirm, {
      aberto: confirmDiaLivreAberto, mensagem: 'Este dia não costuma ser de trabalho. Registar mesmo assim como dia normal?',
      onCancelar: function () { setConfirmDiaLivreAberto(false); pendingDiaLivreRef.current = null; },
      onConfirmar: function () { setConfirmDiaLivreAberto(false); if (pendingDiaLivreRef.current) { pendingDiaLivreRef.current(); pendingDiaLivreRef.current = null; } }
    }),
    React.createElement(HvConfirm, {
      aberto: !!confirmDescartar, mensagem: 'Descartar alterações?',
      onCancelar: function () { setConfirmDescartar(null); }, onConfirmar: confirmarDescarte
    })
  );
}
