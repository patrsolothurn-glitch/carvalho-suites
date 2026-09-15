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
  '.hv-time-input{flex:1;min-width:0;background:var(--hv-cartao);border:1px solid var(--hv-borda);color:var(--hv-texto);border-radius:10px;padding:8px 4px;font-size:22px;font-weight:700;text-align:center}' +
  '.hv-time-input:disabled,.hv-time-btn:disabled{opacity:.4;cursor:not-allowed}';

var HV_COR_TIPO = {
  trabalho: { bg: 'var(--hv-tipo-trabalho-bg)', fg: 'var(--hv-tipo-trabalho-fg)' },
  ferias: { bg: 'var(--hv-tipo-ferias-bg)', fg: 'var(--hv-tipo-ferias-fg)' },
  doente: { bg: 'var(--hv-tipo-doente-bg)', fg: 'var(--hv-tipo-doente-fg)' },
  feriado: { bg: 'var(--hv-tipo-feriado-bg)', fg: 'var(--hv-tipo-feriado-fg)' },
  fecho: { bg: 'var(--hv-tipo-fecho-bg)', fg: 'var(--hv-tipo-fecho-fg)' },
  livre: { bg: 'var(--hv-tipo-livre-bg)', fg: 'var(--hv-tipo-livre-fg)' }
};
function hvCorTipo(tipo) { return HV_COR_TIPO[tipo] || HV_COR_TIPO.livre; }

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
    a.livre === b.livre && a.hoje === b.hoje && a.fimDeSemana === b.fimDeSemana && a.rotulo === b.rotulo;
}
var HvLinhaSemana = React.memo(function HvLinhaSemana(p) {
  var cor = hvCorTipo(p.livre ? 'livre' : (p.tipo || 'livre'));
  var info = p.tipo ? hvTipoInfo(p.tipo) : null;
  return React.createElement('div', {
    className: 'hv-linha' + (p.hoje ? ' hv-hoje' : ''), onClick: p.onClick,
    style: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', borderLeftColor: cor.fg }
  },
    React.createElement('span', { style: { fontSize: 19, width: 24, textAlign: 'center', flex: 'none' } }, info ? info.emoji : (p.livre ? '🕊️' : '—')),
    React.createElement('div', { style: { flex: 1, minWidth: 0 } },
      React.createElement('div', { style: { fontWeight: 700, fontSize: 13, color: p.hoje ? 'var(--hv-principal)' : (p.fimDeSemana ? 'var(--hv-texto2)' : 'var(--hv-texto)') } }, p.rotulo),
      React.createElement('div', { style: { fontSize: 11, color: 'var(--hv-texto2)' } }, p.livre ? 'Livre' : (info ? info.label : 'Por registar'))
    ),
    React.createElement('div', { style: { textAlign: 'right', fontSize: 12, color: 'var(--hv-texto2)', minWidth: 52 } }, hvMinToHM(p.total * 60)),
    React.createElement('div', { style: { textAlign: 'right', fontSize: 12, color: 'var(--hv-texto2)', minWidth: 52 } }, hvMinToHM(p.meta * 60)),
    React.createElement('div', { style: { textAlign: 'right', minWidth: 60 } }, React.createElement(HvSaldoTexto, { valor: p.total - p.meta }))
  );
}, hvLinhaPropsIguais);
var HvLinhaMes = React.memo(function HvLinhaMes(p) {
  var cor = hvCorTipo(p.livre ? 'livre' : (p.tipo || 'livre'));
  var info = p.tipo ? hvTipoInfo(p.tipo) : null;
  return React.createElement('div', {
    className: 'hv-linha' + (p.hoje ? ' hv-hoje' : ''), onClick: p.onClick,
    style: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px', borderLeftColor: cor.fg }
  },
    React.createElement('span', { style: { fontSize: 16, width: 20, textAlign: 'center', flex: 'none' } }, info ? info.emoji : (p.livre ? '🕊️' : '—')),
    React.createElement('div', { style: { flex: 1, fontSize: 13, color: p.hoje ? 'var(--hv-principal)' : 'var(--hv-texto)', fontWeight: p.hoje ? 700 : 400 } }, p.rotulo),
    React.createElement('div', { style: { fontSize: 12, color: 'var(--hv-texto2)', minWidth: 48, textAlign: 'right' } }, hvMinToHM(p.total * 60)),
    React.createElement('div', { style: { textAlign: 'right', minWidth: 58 } }, React.createElement(HvSaldoTexto, { valor: p.total - p.meta }))
  );
}, hvLinhaPropsIguais);
var HvLinhaAno = React.memo(function HvLinhaAno(p) {
  return React.createElement('div', {
    className: 'hv-linha', onClick: p.onClick,
    style: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 8px' }
  },
    React.createElement('div', { style: { flex: 1, fontSize: 13, color: 'var(--hv-texto)', fontWeight: 700 } }, p.rotulo),
    React.createElement('div', { style: { fontSize: 12, color: 'var(--hv-texto2)', minWidth: 58, textAlign: 'right' } }, hvMinToHM(p.total * 60)),
    React.createElement('div', { style: { fontSize: 12, color: 'var(--hv-texto2)', minWidth: 58, textAlign: 'right' } }, hvMinToHM(p.meta * 60)),
    React.createElement('div', { style: { textAlign: 'right', minWidth: 60 } }, React.createElement(HvSaldoTexto, { valor: p.total - p.meta }))
  );
}, function (a, b) { return a.rotulo === b.rotulo && a.total === b.total && a.meta === b.meta; });

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
  var recognitionRef = React.useRef(null);
  var manualStopRef = React.useRef(false);
  var silenceTimerRef = React.useRef(null);
  var accumRef = React.useRef('');

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

  var anoData = React.useMemo(function () {
    var hoje = hvTodayIso();
    var meses = [];
    var saldoAcumulado = 0;
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
        totalMes += total;
        if (idx <= 6) metaMes += wk.metas[idx];
        if (ds <= hoje) saldoAcumulado += (total - (idx <= 6 ? wk.metas[idx] : 0));
        if (row && row.tipo === 'ferias') feriasAno += row.fracao;
        if (row && row.tipo === 'doente') doenteAno += row.fracao;
        if (row && row.tipo === 'feriado') feriadoAno += row.fracao;
        if (row && row.tipo === 'fecho') fechoAno += row.fracao;
      }
      meses.push({ m: m, total: totalMes, meta: metaMes });
    }
    return { meses: meses, saldoAcumulado: saldoAcumulado, feriasAno: feriasAno, doenteAno: doenteAno, feriadoAno: feriadoAno, fechoAno: fechoAno };
  }, [curYear, registos, configs]);

  var curIsoDow = hvDi(hvMk(curDate)); // 0..6 seg..dom
  var metaHoje = curIsoDow <= 6 ? weekCalc.metas[curIsoDow] : 0;
  var diaInfoHoje = curIsoDow <= 4 ? weekCalc.dias[curIsoDow] : null;
  var isLivreHoje = diaInfoHoje ? diaInfoHoje.livre : false;

  // Preenche o formulário quando muda o dia selecionado
  React.useEffect(function () {
    var row = registos[curDate];
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
      var cfgD = hvConfigParaData(configs.length ? configs : [HV_CONFIG_DEFAULT], curDate);
      setFManhaI(cfgD.manha_inicio); setFManhaF(cfgD.manha_fim);
      setFTardeI(cfgD.tarde_inicio); setFTardeF(cfgD.tarde_fim);
      setFSemManha(false); setFSemTarde(false);
      setFNota(''); setFTextoOriginal('');
    }
    setErroForm(null);
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

  function guardarAgora() {
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
    }).catch(function (e) {
      setSaving(false);
      setErroForm('Erro de ligação: ' + (e && e.message ? e.message : e));
      window.mostrarErro('Horas por Voz', e);
    });
  }
  function onGuardar() {
    if (registos[curDate]) { setConfirmSubstituir({ acao: 'guardar' }); return; }
    guardarAgora();
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

  function aplicarDiaNormal() {
    var aplicar = function () {
      setFTipo('trabalho'); setFFracao(1);
      setFManhaI(cfgHoje.manha_inicio); setFManhaF(cfgHoje.manha_fim);
      setFTardeI(cfgHoje.tarde_inicio); setFTardeF(cfgHoje.tarde_fim);
      setFSemManha(false); setFSemTarde(false); setFTextoOriginal('');
    };
    if (registos[curDate]) { pendingLoadRef.current = aplicar; setConfirmSubstituir({ acao: 'carregar' }); return; }
    aplicar();
  }
  function aplicarAusenciaDiaInteiro(tipo) {
    var aplicar = function () {
      setFTipo(tipo); setFFracao(1);
      setFManhaI(''); setFManhaF(''); setFTardeI(''); setFTardeF('');
      setFSemManha(true); setFSemTarde(true); setFTextoOriginal('');
    };
    if (registos[curDate]) { pendingLoadRef.current = aplicar; setConfirmSubstituir({ acao: 'carregar' }); return; }
    aplicar();
  }
  function aplicarIgualOntem() {
    var datas = Object.keys(registos).filter(function (d) { return d < curDate && registos[d].tipo === 'trabalho'; }).sort();
    if (!datas.length) { setErroForm('Não há nenhum dia de trabalho registado antes deste.'); return; }
    var ultimo = registos[datas[datas.length - 1]];
    var aplicar = function () {
      setFTipo('trabalho'); setFFracao(1);
      setFManhaI(ultimo.manha_inicio ? ultimo.manha_inicio.slice(0, 5) : '');
      setFManhaF(ultimo.manha_fim ? ultimo.manha_fim.slice(0, 5) : '');
      setFTardeI(ultimo.tarde_inicio ? ultimo.tarde_inicio.slice(0, 5) : '');
      setFTardeF(ultimo.tarde_fim ? ultimo.tarde_fim.slice(0, 5) : '');
      setFSemManha(!ultimo.manha_inicio); setFSemTarde(!ultimo.tarde_inicio); setFTextoOriginal('');
    };
    if (registos[curDate]) { pendingLoadRef.current = aplicar; setConfirmSubstituir({ acao: 'carregar' }); return; }
    aplicar();
  }
  function confirmarSubstituicao() {
    if (confirmSubstituir && confirmSubstituir.acao === 'guardar') { guardarAgora(); }
    else if (pendingLoadRef.current) { pendingLoadRef.current(); pendingLoadRef.current = null; }
    setConfirmSubstituir(null);
  }

  // ── Voz ────────────────────────────────────────────────────────
  function aplicarResultadoVoz(r) {
    if (!r.ok) { setVozErro(r.erro); return; }
    setVozErro(null);
    if (r.ePeriodo) {
      setPerIni(r.periodo.inicio); setPerFim(r.periodo.fim); setPerTipo(r.periodo.tipo);
      setPeriodoAberto(true);
      return;
    }
    var aplicar = function () {
      setCurDate(r.data);
      setFTipo(r.tipo); setFFracao(r.fracao);
      setFManhaI(r.manha_inicio || ''); setFManhaF(r.manha_fim || '');
      setFTardeI(r.tarde_inicio || ''); setFTardeF(r.tarde_fim || '');
      setFSemManha(!r.manha_inicio); setFSemTarde(!r.tarde_inicio);
      setFTextoOriginal(r.textoOriginal || '');
    };
    if (registos[r.data]) { pendingLoadRef.current = aplicar; setConfirmSubstituir({ acao: 'carregar' }); return; }
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
    if (accumRef.current.trim()) aplicarResultadoVoz(hvParseVoz(accumRef.current.trim(), hvTodayIso()));
  }
  function iniciarEscuta() {
    setVozErro(null);
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setVozIndisponivel(true); return; }
    accumRef.current = ''; setVozInterim(''); manualStopRef.current = false;
    var rec = new SR();
    rec.continuous = true; rec.interimResults = true; rec.lang = 'pt-PT';
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
      console.error('[horasvoz] reconhecimento de voz:', e && e.error);
      setVozErro('Falha no reconhecimento de voz: ' + (e && e.error ? e.error : 'desconhecida'));
      setListening(false); clearSilenceTimer();
    };
    rec.onend = function () { if (!manualStopRef.current) { try { rec.start(); } catch (e) { setListening(false); } } };
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

  function renderDia() {
    return React.createElement('div', { style: HV_ESTILO.pagina },
      erro && React.createElement(HvCard, null, React.createElement('p', { style: HV_ESTILO.erroTexto }, '⚠️ ' + erro)),

      // 1) Botão falar
      React.createElement(HvCard, { style: Object.assign({}, HV_ESTILO.cartao, { textAlign: 'center' }) },
        vozIndisponivel
          ? React.createElement('div', null,
              React.createElement('p', { style: Object.assign({}, HV_ESTILO.textoMuted, { fontSize: 12, marginBottom: 8 }) }, 'Este browser não suporta voz — escreve o que fizeste:'),
              React.createElement('div', { style: { display: 'flex', gap: 8 } },
                React.createElement('input', { type: 'text', value: vozTextoManual, autoComplete: 'off', onChange: function (e) { setVozTextoManual(e.target.value); }, placeholder: 'ex.: trabalhei das 7 às 12 e das 12h45 às 16h15', style: { flex: 1, background: 'var(--hv-fundo)', border: '1px solid var(--hv-borda)', color: 'var(--hv-texto)', borderRadius: 10, padding: '10px 12px', fontSize: 14 } }),
                React.createElement(HvBtn, { onClick: enviarTextoManual, ativo: true }, 'OK')
              )
            )
          : React.createElement('button', {
              onClick: function () { listening ? pararEscuta() : iniciarEscuta(); },
              style: listening ? HV_ESTILO.microfoneOuvindo : HV_ESTILO.microfone
            }, listening ? (vozInterim || 'A ouvir…') : '🎤 Falar'),
        vozErro && React.createElement('p', { style: Object.assign({}, HV_ESTILO.erroTexto, { fontSize: 12, marginTop: 8 }) }, '⚠️ ' + vozErro)
      ),

      // 2) Data
      React.createElement('div', { style: HV_ESTILO.linhaTopo },
        React.createElement('button', { style: HV_ESTILO.navBtn, onClick: function () { setCurDate(hvIso(hvAddD(hvMk(curDate), -1))); } }, '‹'),
        React.createElement('div', { style: { flex: 1, textAlign: 'center' } },
          React.createElement('div', { style: { fontWeight: 800, color: 'var(--hv-texto)', fontSize: 15 } }, HV_DIA_LONGO[curIsoDow > 6 ? 0 : curIsoDow] + ' ' + hvFmt(hvMk(curDate))),
          React.createElement('div', { style: { fontSize: 12, color: 'var(--hv-texto2)', marginTop: 2 } }, isLivreHoje ? 'Sexta livre — meta 0' : 'Meta ' + hvMinToHM(metaHoje * 60))
        ),
        React.createElement('button', { style: HV_ESTILO.navBtn, onClick: function () { setCurDate(hvIso(hvAddD(hvMk(curDate), 1))); } }, '›'),
        curDate !== hvTodayIso() && React.createElement('button', { onClick: function () { setCurDate(hvTodayIso()); }, style: { background: 'var(--hv-principal)', border: 'none', color: 'var(--hv-principal-texto)', borderRadius: 10, padding: '0 12px', height: 44, fontSize: 12, fontWeight: 800, cursor: 'pointer', flex: 'none' } }, 'Hoje')
      ),

      // 3) Tipo
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 } },
        HV_TIPOS.map(function (t) {
          return React.createElement(HvBtn, { key: t.key, grande: true, tipoCor: fTipo === t.key ? t.key : null, onClick: function () { setFTipo(t.key); if (t.key !== 'ferias' && t.key !== 'doente') setFFracao(1); } }, t.emoji + ' ' + t.label);
        })
      ),

      // 4) Trabalho: campos de horas
      fTipo === 'trabalho' && renderCamposHoras(),
      // 5) Ferias/Doente: dia inteiro ou meio dia
      (fTipo === 'ferias' || fTipo === 'doente') && React.createElement('div', null,
        React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: fFracao === 0.5 ? 10 : 0 } },
          React.createElement(HvBtn, { ativo: fFracao === 1, onClick: function () { setFFracao(1); setFSemManha(true); setFSemTarde(true); }, flex: true }, 'Dia inteiro'),
          React.createElement(HvBtn, { ativo: fFracao === 0.5, onClick: function () { setFFracao(0.5); setFSemManha(false); setFSemTarde(false); }, flex: true }, 'Meio dia')
        ),
        fFracao === 0.5 && renderCamposHoras()
      ),
      // 6) Feriado/Fecho: sem campos

      // 7) Resumo
      React.createElement(HvCard, null,
        React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px 14px', fontSize: 13, color: 'var(--hv-texto2)' } },
          React.createElement('span', null, 'Trabalhado ', React.createElement('b', { style: { color: 'var(--hv-texto)' } }, hvMinToHM(trabalhadoMinAtual))),
          pausaAplicada > 0 && React.createElement('span', null, 'Pausa ', React.createElement('b', { style: { color: 'var(--hv-texto)' } }, hvMinToHM(-pausaAplicada))),
          creditoAtual > 0 && React.createElement('span', null, 'Crédito ', React.createElement('b', { style: { color: 'var(--hv-texto)' } }, hvMinToHM(creditoAtual * 60)))
        ),
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--hv-borda)' } },
          React.createElement('div', null,
            React.createElement('div', { style: HV_ESTILO.etiquetaSm }, 'Total'),
            React.createElement('div', { style: HV_ESTILO.totalNumero }, hvMinToHM(totalAtual * 60))
          ),
          React.createElement('div', { style: { textAlign: 'center' } },
            React.createElement('div', { style: HV_ESTILO.etiquetaSm }, 'Meta'),
            React.createElement('div', { style: HV_ESTILO.metaNumero }, hvMinToHM(metaHoje * 60))
          ),
          React.createElement('div', { style: { textAlign: 'right' } },
            React.createElement('div', { style: HV_ESTILO.etiquetaSm }, 'Saldo'),
            React.createElement('div', { style: HV_ESTILO.saldoNumero }, React.createElement(HvSaldoTexto, { valor: saldoAtual }))
          )
        )
      ),
      weekCalc.aviso && React.createElement(HvCard, { style: HV_ESTILO.avisoCartao }, React.createElement('p', { style: HV_ESTILO.avisoTexto }, '⚠️ ' + weekCalc.aviso)),

      // 8) Mini-resumo da semana
      renderMiniSemana(),

      // 9) Botões rápidos
      React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } },
        React.createElement(HvBtn, { grande: true, onClick: aplicarDiaNormal, flex: true }, '✓ Dia normal'),
        React.createElement(HvBtn, { grande: true, tipoCor: 'ferias', onClick: function () { aplicarAusenciaDiaInteiro('ferias'); }, flex: true }, '🏖 Férias'),
        React.createElement(HvBtn, { grande: true, tipoCor: 'doente', onClick: function () { aplicarAusenciaDiaInteiro('doente'); }, flex: true }, '🤒 Doente'),
        React.createElement(HvBtn, { grande: true, onClick: aplicarIgualOntem, flex: true }, 'Igual a ontem')
      ),
      React.createElement('div', { style: { display: 'flex', gap: 8 } },
        React.createElement(HvBtn, { grande: true, onClick: function () { setPeriodoAberto(true); }, flex: true }, '📅 Marcar período'),
        React.createElement(HvBtn, { grande: true, ativo: true, onClick: onGuardar, disabled: saving, flex: true }, saving ? 'A guardar…' : 'Guardar'),
        registos[curDate] && React.createElement('button', { onClick: function () { setConfirmApagar(true); }, style: HV_ESTILO.botaoPerigo }, '🗑')
      ),
      erroForm && React.createElement('p', { style: Object.assign({}, HV_ESTILO.erroTexto, { textAlign: 'center' }) }, '⚠️ ' + erroForm)
    );
  }

  function renderCamposHoras() {
    return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
      React.createElement('div', null,
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 } },
          React.createElement('span', { style: { fontSize: 12, fontWeight: 800, color: 'var(--hv-texto)', textTransform: 'uppercase' } }, 'Manhã'),
          React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--hv-texto2)' } },
            React.createElement('input', { type: 'checkbox', checked: fSemManha, onChange: function (e) { setFSemManha(e.target.checked); } }), 'Sem manhã')
        ),
        !fSemManha && React.createElement('div', { style: { display: 'flex', gap: 8 } },
          React.createElement(HvCampoHora, { label: 'Início', value: fManhaI, onChange: setFManhaI }),
          React.createElement(HvCampoHora, { label: 'Fim', value: fManhaF, onChange: setFManhaF })
        )
      ),
      React.createElement('div', null,
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 } },
          React.createElement('span', { style: { fontSize: 12, fontWeight: 800, color: 'var(--hv-texto)', textTransform: 'uppercase' } }, 'Tarde'),
          React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--hv-texto2)' } },
            React.createElement('input', { type: 'checkbox', checked: fSemTarde, onChange: function (e) { setFSemTarde(e.target.checked); } }), 'Sem tarde')
        ),
        !fSemTarde && React.createElement('div', { style: { display: 'flex', gap: 8 } },
          React.createElement(HvCampoHora, { label: 'Início', value: fTardeI, onChange: setFTardeI }),
          React.createElement(HvCampoHora, { label: 'Fim', value: fTardeF, onChange: setFTardeF })
        )
      )
    );
  }

  function renderMiniSemana() {
    var totalAteAgora = 0;
    weekCalc.dias.forEach(function (d) { totalAteAgora += (d.date === curDate ? totalAtual : hvTotalDia(d.row, cfgSemana, weekCalc.der)); });
    var falta = weekCalc.meta_semana - totalAteAgora;
    var porRegistar = weekCalc.dias.filter(function (d) { return !d.row && !d.livre && d.date !== curDate; });
    var metaMedia = porRegistar.length ? (porRegistar.reduce(function (s, d) { return s + weekCalc.metas[weekCalc.dias.indexOf(d)]; }, 0) / porRegistar.length) : 0;
    return React.createElement(HvCard, { style: { background: 'var(--hv-fundo)' } },
      React.createElement('div', { style: Object.assign({}, HV_ESTILO.etiquetaSm, { marginBottom: 4 }) }, 'Semana KW ' + hvKw(hvMk(mondayCur))),
      React.createElement('div', { style: { fontSize: 13, color: 'var(--hv-texto)' } }, hvMinToHM(totalAteAgora * 60) + ' / ' + hvMinToHM(weekCalc.meta_semana * 60), React.createElement('span', { style: HV_ESTILO.textoMuted }, '  ·  falta ' + hvMinToHM(Math.max(0, falta) * 60))),
      porRegistar.length > 0 && React.createElement('div', { style: Object.assign({}, HV_ESTILO.textoMuted, { fontSize: 12, marginTop: 4 }) },
        porRegistar.map(function (d) { return HV_DIA_CURTO[d.isoDow - 1]; }).join('–') + ': ' + hvMinToHM(metaMedia * 60) + ' por dia'
      )
    );
  }

  function renderSemana() {
    var hoje = hvTodayIso();
    var linhas = hvWeekDays(mondayCur).map(function (dateStr, i) {
      var util = i < 5 ? weekCalc.dias[i] : null;
      var total = util ? hvTotalDia(util.row, cfgSemana, weekCalc.der) : 0;
      var meta = weekCalc.metas[i];
      return React.createElement(HvLinhaSemana, {
        key: dateStr, dataStr: dateStr, total: total, meta: meta,
        tipo: util && util.row ? util.row.tipo : null, livre: util ? util.livre : false,
        hoje: dateStr === hoje, fimDeSemana: i >= 5,
        rotulo: HV_DIA_CURTO[i] + ' ' + hvFmt(hvMk(dateStr)),
        onClick: function () { setCurDate(dateStr); setView('dia'); }
      });
    });
    var totalSemana = weekCalc.dias.reduce(function (s, d) { return s + hvTotalDia(d.row, cfgSemana, weekCalc.der); }, 0);
    var saldoSemana = totalSemana - weekCalc.meta_semana;
    return React.createElement('div', { style: HV_ESTILO.pagina },
      React.createElement('div', { style: HV_ESTILO.linhaTopo },
        React.createElement('button', { style: HV_ESTILO.navBtn, onClick: function () { setCurDate(hvIso(hvAddD(hvMk(mondayCur), -7))); } }, '‹'),
        React.createElement('div', { style: { flex: 1, textAlign: 'center', fontWeight: 800, color: 'var(--hv-texto)' } }, 'KW ' + hvKw(hvMk(mondayCur)) + ' · ' + hvFmt(hvMk(mondayCur)) + '–' + hvFmt(hvAddD(hvMk(mondayCur), 6))),
        React.createElement('button', { style: HV_ESTILO.navBtn, onClick: function () { setCurDate(hvIso(hvAddD(hvMk(mondayCur), 7))); } }, '›')
      ),
      React.createElement(HvCard, { style: { padding: 0 } }, React.createElement('div', { style: { padding: '0 16px' } }, linhas)),
      React.createElement(HvCard, { style: { background: 'var(--hv-fundo)' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--hv-texto)', fontWeight: 700 } },
          React.createElement('span', null, 'Total ' + hvMinToHM(totalSemana * 60)),
          React.createElement('span', null, 'Meta ' + hvMinToHM(weekCalc.meta_semana * 60)),
          React.createElement(HvSaldoTexto, { valor: saldoSemana })
        )
      )
    );
  }

  function renderMes() {
    var y = curMonthObj.y, m = curMonthObj.m;
    var hoje = hvTodayIso();
    var linhas = mesData.dias.filter(function (d) { return !d.fimDeSemana; }).map(function (d) {
      return React.createElement(HvLinhaMes, {
        key: d.dateStr, dataStr: d.dateStr, total: d.total, meta: d.meta, tipo: d.tipo, livre: d.livre,
        hoje: d.dateStr === hoje, fimDeSemana: false,
        rotulo: HV_DIA_CURTO[d.idx] + ' ' + String(d.dia).padStart(2, '0') + '.' + String(m + 1).padStart(2, '0') + '.',
        onClick: function (ds) { return function () { setCurDate(ds); setView('dia'); }; }(d.dateStr)
      });
    });
    return React.createElement('div', { style: HV_ESTILO.pagina },
      React.createElement('div', { style: HV_ESTILO.linhaTopo },
        React.createElement('button', { style: HV_ESTILO.navBtn, onClick: function () { var d = new Date(Date.UTC(y, m - 1, 1)); setCurMonthObj({ y: d.getUTCFullYear(), m: d.getUTCMonth() }); } }, '‹'),
        React.createElement('div', { style: { flex: 1, textAlign: 'center', fontWeight: 800, color: 'var(--hv-texto)' } }, HV_MESES_LABEL[m] + ' ' + y),
        React.createElement('button', { style: HV_ESTILO.navBtn, onClick: function () { var d = new Date(Date.UTC(y, m + 1, 1)); setCurMonthObj({ y: d.getUTCFullYear(), m: d.getUTCMonth() }); } }, '›')
      ),
      React.createElement(HvCard, { style: { padding: 0 } }, React.createElement('div', { style: { padding: '0 8px' } }, linhas)),
      React.createElement(HvCard, { style: { background: 'var(--hv-fundo)' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--hv-texto)', fontWeight: 700, marginBottom: 4 } },
          React.createElement('span', null, 'Total ' + hvMinToHM(mesData.totalMes * 60)),
          React.createElement(HvSaldoTexto, { valor: mesData.totalMes - mesData.metaMes })
        ),
        React.createElement('div', { style: HV_ESTILO.textoMuted }, '🏖 ' + hvDez(mesData.feriasN) + ' dias de férias · 🤒 ' + hvDez(mesData.doenteN) + ' dias doente')
      )
    );
  }

  function renderAno() {
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
          return React.createElement(HvLinhaAno, {
            key: mo.m, total: mo.total, meta: mo.meta, rotulo: HV_MESES_LABEL[mo.m],
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
        React.createElement('div', { style: { display: 'flex', gap: 8 } },
          React.createElement(HvCampoHora, { label: 'Manhã início', value: c.manha_inicio, onChange: function (v) { set({ manha_inicio: v }); } }),
          React.createElement(HvCampoHora, { label: 'Manhã fim', value: c.manha_fim, onChange: function (v) { set({ manha_fim: v }); } })
        ),
        React.createElement('div', { style: { display: 'flex', gap: 8 } },
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
    modalPeriodo, modalDef,
    React.createElement(HvConfirm, {
      aberto: !!confirmSubstituir, mensagem: 'Este dia já tem registo. Queres substituir?',
      onCancelar: function () { setConfirmSubstituir(null); pendingLoadRef.current = null; }, onConfirmar: confirmarSubstituicao
    }),
    React.createElement(HvConfirm, {
      aberto: confirmApagar, mensagem: 'Apagar o registo deste dia?',
      onCancelar: function () { setConfirmApagar(false); }, onConfirmar: apagarDiaAgora
    })
  );
}
