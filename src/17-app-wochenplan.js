// ══════════════════════════════════════════════════════════════════
// APP WOCHENPLAN — Planeamento semanal de trabalho (admin only)
// Só lê/escreve nas tabelas wplan_*. Nunca mistura com rapport_*,
// agenda_pro_jobs, horas_entries, family_events, etc.
// Todo o estado em WochenplanApp (sem hooks em sub-componentes).
// ══════════════════════════════════════════════════════════════════

var WP_BUCKET = 'wplan';
var WP_PRIO = {
  1: { n: 'Dringend', c: '#BE2318', bg: '#FAE8E6' },
  2: { n: 'Geplant', c: '#A96700', bg: '#FAF0DA' },
  3: { n: 'Termin', c: '#0B7550', bg: '#E1F2EC' },
  4: { n: 'Unklar', c: '#787C82', bg: '#F7F7F4' },
  5: { n: 'Privat', c: '#5946B5', bg: '#ECEAFA' }
};
var WP_DAY = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
var WP_LONG = { Mo: 'Montag', Di: 'Dienstag', Mi: 'Mittwoch', Do: 'Donnerstag', Fr: 'Freitag', Sa: 'Samstag', So: 'Sonntag' };
var WP_DST = {
  frei: ['Frei', '#F7F7F4', '#585C62'],
  krank: ['Krank', '#FAE8E6', '#BE2318'],
  ferien: ['Ferien', '#FAF0DA', '#A96700'],
  schule: ['Schule', '#E1F2EC', '#0B7550']
};
var WP_H0 = 7, WP_H1 = 18, WP_PPM = 0.6;
var WP_MM = 3.7795;
var WP_WL_KEY = 'wplan_view_layout';
var WP_LUNCH_KEY = 'wplan_lunch';
var WP_ULTIMO_TRABALHO_KEY = 'wplan_ultimo_trabalho';

// ── Datas (tudo em UTC para não haver deslizes de fuso horário) ──
function wpMk(dateStr) {
  var a = (dateStr || '').split('-');
  return new Date(Date.UTC(+a[0], +a[1] - 1, +a[2]));
}
function wpIso(d) { return d.toISOString().slice(0, 10); }
function wpAddD(d, n) { var y = new Date(d.getTime()); y.setUTCDate(y.getUTCDate() + n); return y; }
function wpDi(d) { return (d.getUTCDay() + 6) % 7; }
function wpMon(d) { return wpAddD(d, -wpDi(d)); }
function wpFmt(d) { return d.getUTCDate() + '.' + (d.getUTCMonth() + 1) + '.'; }
function wpKw(d) {
  var x = new Date(d.getTime());
  x.setUTCDate(x.getUTCDate() + 4 - (wpDi(x) + 1) + 1);
  var y = new Date(Date.UTC(x.getUTCFullYear(), 0, 1));
  return Math.ceil(((x - y) / 86400000 + 1) / 7);
}
function wpTodayIso() {
  var n = new Date();
  return wpIso(new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate())));
}
// slice(3, 5) em vez de slice(3): mesmo que chegue "13:00:00" (com segundos,
// por não ter passado por wpNormalizarTarefa), fica só com os minutos "00" em
// vez de "00:00" (que dava NaN em +"00:00" e estragava Raster/KPIs).
function wpMn(hhmm) { return hhmm ? (+hhmm.slice(0, 2)) * 60 + (+hhmm.slice(3, 5)) : 0; }
function wpHh(m) { m = Math.round(m); return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0'); }
function wpDez(m) { return (m / 60).toFixed(1); }
function wpDezh(h) { return (Math.round((h || 0) * 10) / 10).toString(); }
function wpDur(a) { return (a.von && a.bis) ? wpMn(a.bis) - wpMn(a.von) : 0; }
function wpIsLunch(a, mVon, mBis) { return !!(a.von && a.bis && a.von < mBis && a.bis > mVon); }
// wplan_tasks.von/.bis são colunas `time` no Postgres — o Supabase devolve
// "07:00:00" mesmo tendo sido gravado "07:00", o que parte wpMn/wpDur
// (só sabem ler "HH:MM"). Normaliza sempre que uma linha vem da BD.
function wpNormalizarHora(v) { return v ? String(v).slice(0, 5) : v; }
function wpNormalizarTarefa(t) { return Object.assign({}, t, { von: wpNormalizarHora(t.von), bis: wpNormalizarHora(t.bis) }); }
function wpPerson(leute, nome) { return leute.find(function(p) { return p.name === nome; }); }
function wpSollTag(p, dataKey) { return (p && p.arbeitstage[wpDi(wpMk(dataKey))]) ? p.std_tag : 0; }
function wpSollWoche(p) { return p ? p.std_tag * p.arbeitstage.reduce(function(a, b) { return a + b; }, 0) : 0; }
function wpMine(a, who) { return who === 'alle' || a.wer === who; }
function wpByDay(tasks, datum, who, werFixo) {
  return tasks.filter(function(a) { return a.datum === datum && (werFixo !== undefined ? a.wer === werFixo : wpMine(a, who)); })
    .sort(function(x, y) { return x.von < y.von ? -1 : 1; });
}
function wpSpaet(tasks, hoje, who) {
  return tasks.filter(function(a) { return a.datum && a.datum < hoje && a.status !== 'erledigt' && wpMine(a, who); })
    .sort(function(x, y) { return x.datum < y.datum ? -1 : 1; });
}
function wpPoolL(tasks, who, urgente) {
  return tasks.filter(function(a) { return !a.datum && wpMine(a, who) && (urgente ? a.prio === 1 : a.prio !== 1); });
}
function wpStatOf(tagRows, leute, datum, who, werFixo) {
  var nm = werFixo === undefined ? (who === 'alle' ? null : who) : werFixo;
  var row = tagRows.find(function(r) { return r.datum === datum && (nm ? r.wer === nm : true) && r.tag_status; });
  if (row) return row.tag_status;
  if (nm) {
    var p = wpPerson(leute, nm);
    if (p && !p.arbeitstage[wpDi(wpMk(datum))]) return 'frei';
  }
  return null;
}
function wpWeekDays(cur) {
  var m = wpMon(wpMk(cur)), out = [];
  for (var i = 0; i < 7; i++) out.push(wpIso(wpAddD(m, i)));
  return out;
}
function wpNotasDoDia(tagRows, datum, who) {
  return tagRows.filter(function(r) { return r.datum === datum && r.notiz && (who === 'alle' || r.wer === who); });
}
function wpWeekTasks(tasks, cur, who) {
  var w = wpWeekDays(cur);
  return tasks.filter(function(a) { return a.datum && w.indexOf(a.datum) !== -1 && wpMine(a, who); });
}
function wpLoadLayout() {
  try { var v = localStorage.getItem(WP_WL_KEY); if (v === 'karten' || v === 'raster' || v === 'liste') return v; } catch (e) {}
  return 'karten';
}
function wpSaveLayout(v) { try { localStorage.setItem(WP_WL_KEY, v); } catch (e) {} }
function wpLoadLunch() {
  try {
    var raw = localStorage.getItem(WP_LUNCH_KEY);
    if (raw) { var o = JSON.parse(raw); if (o && o.von && o.bis) return o; }
  } catch (e) {}
  return { von: '12:00', bis: '13:00' };
}
function wpSaveLunch(von, bis) { try { localStorage.setItem(WP_LUNCH_KEY, JSON.stringify({ von: von, bis: bis })); } catch (e) {} }
function wpLoadUltimoTrabalho() {
  try {
    var raw = localStorage.getItem(WP_ULTIMO_TRABALHO_KEY);
    if (raw) { var o = JSON.parse(raw); if (o) return { arbeit: o.arbeit || '', kunde: o.kunde || '' }; }
  } catch (e) {}
  return { arbeit: '', kunde: '' };
}
function wpSaveUltimoTrabalho(arbeit, kunde) { try { localStorage.setItem(WP_ULTIMO_TRABALHO_KEY, JSON.stringify({ arbeit: arbeit || '', kunde: kunde || '' })); } catch (e) {} }

// ── CSS (isolada em .wp-app, nunca toca em :root nem em <body>) ──
var WP_CSS = '\
.wp-app{--ink:#16181B;--ink2:#585C62;--ink3:#8A8F96;--bg:#EDEEEA;--card:#FFF;--card2:#F7F7F4;--line:#DBDCD6;--line2:#B5B7B0;--or:#12B886;--ok:#0B7550;--run:#12609F;--warn:#A96700;--r:8px;background:var(--bg);color:var(--ink);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:14px;line-height:1.45;font-variant-numeric:tabular-nums;min-height:100vh;padding-bottom:44px}\
@media(prefers-color-scheme:dark){.wp-app{--ink:#F1F1EE;--ink2:#A6AAB0;--ink3:#73777D;--bg:#141517;--card:#1F2124;--card2:#191B1D;--line:#313438;--line2:#494D52}}\
.wp-app *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}\
.wp-app button,.wp-app input,.wp-app select,.wp-app textarea{font:inherit;color:inherit}\
.wp-app h1,.wp-app h2,.wp-app h3,.wp-app h4{margin:0;font-weight:600}\
.wp-wrap{max-width:1240px;margin:0 auto;padding:0 12px}\
.wp-top{background:#0E0F10;color:#fff;position:sticky;top:0;z-index:40;padding:9px 0 10px;border-bottom:3px solid var(--or)}\
.wp-topin{display:flex;align-items:center;gap:11px}\
.wp-mk{width:24px;height:24px;background:var(--or);flex:none;border-radius:2px}\
.wp-tt{font-size:16px;font-weight:600;letter-spacing:-.01em}\
.wp-ts{font-size:11.5px;color:#9DA1A7;margin-top:1px}\
.wp-navwrap{margin-left:auto;display:flex;gap:5px;align-items:center}\
.wp-nb{background:#232629;border:none;color:#fff;height:32px;min-width:32px;padding:0 11px;border-radius:6px;font-size:13px;cursor:pointer}\
.wp-nb.wp-on{background:var(--or);font-weight:600}\
.wp-bar{display:flex;gap:5px;align-items:center;flex-wrap:wrap;padding:9px 0 3px}\
.wp-chip{background:var(--card);border:1px solid var(--line);height:30px;padding:0 11px;border-radius:15px;font-size:12.5px;cursor:pointer;white-space:nowrap}\
.wp-chip.wp-on{background:var(--ink);color:var(--bg);border-color:var(--ink);font-weight:600}\
.wp-sep{width:1px;height:19px;background:var(--line2);margin:0 3px}\
.wp-roll{display:inline-flex;background:var(--card2);border:1px solid var(--line);border-radius:16px;padding:2px;gap:2px}\
.wp-roll .wp-chip{border:none;background:none;height:26px;padding:0 12px}\
.wp-roll .wp-chip.wp-on{background:var(--or);color:#fff;border-color:var(--or)}\
.wp-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(104px,1fr));gap:7px;margin:10px 0}\
.wp-kpi{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:8px 10px}\
.wp-kpi small{display:block;font-size:11px;color:var(--ink2)}\
.wp-kpi b{font-size:19px;font-weight:600;letter-spacing:-.02em}\
.wp-kpi u{text-decoration:none;font-size:11px;color:var(--ink3);margin-left:3px}\
.wp-alarm{background:#FAE8E6;border-left:5px solid #BE2318;padding:8px 11px;margin:9px 0}\
.wp-alarm h3{font-size:12.5px;color:#BE2318;margin-bottom:4px}\
.wp-alrow{display:flex;gap:8px;font-size:13px;padding:3px 0;cursor:pointer;align-items:baseline}\
.wp-alrow span:first-child{color:#BE2318}\
.wp-alrow span:last-child{margin-left:auto;color:#BE2318;font-size:11.5px;opacity:.9}\
.wp-cols{display:grid;grid-template-columns:1fr;gap:13px}\
@media(min-width:860px){.wp-cols{grid-template-columns:minmax(0,1.9fr) minmax(0,1fr)}}\
.wp-slot{display:flex;gap:9px;margin-bottom:6px}\
.wp-hrs{width:44px;flex:none;text-align:right;font-size:12px;color:var(--ink2);padding-top:9px}\
.wp-hrs b{display:block;font-weight:600;color:var(--ink)}\
.wp-job{flex:1;background:var(--card);border:1px solid var(--line);border-left:5px solid var(--line2);padding:8px 10px;border-radius:0 var(--r) var(--r) 0;cursor:pointer}\
.wp-job h3{font-size:14.5px;font-weight:600;display:flex;gap:8px;align-items:flex-start}\
.wp-job p{margin:2px 0 0;font-size:12.5px;color:var(--ink2)}\
.wp-job .wp-ref{font-size:11px;color:var(--ink3);margin-top:2px}\
.wp-job .wp-st{margin-left:auto;flex:none;font-size:16px;line-height:1.2}\
.wp-done h3{text-decoration:line-through;color:var(--ink3);font-weight:500}\
.wp-mittag{flex:1;border:1px dashed var(--line2);border-radius:var(--r);padding:7px 10px;display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--ink3)}\
.wp-mittag button{margin-left:auto}\
.wp-exc{flex:1;background:#FAF0DA;border-radius:var(--r);padding:6px 7px}\
.wp-exc>div:first-child{font-size:11.5px;color:#A96700;font-weight:600;margin-bottom:4px}\
.wp-mini{background:var(--card);border:1px solid var(--line);height:28px;padding:0 9px;border-radius:6px;font-size:12px;cursor:pointer}\
.wp-add{width:100%;height:38px;background:none;border:1px dashed var(--line2);border-radius:var(--r);color:var(--ink2);font-size:13.5px;cursor:pointer;margin-top:2px}\
.wp-frei{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:11px;text-align:center;font-size:13px;color:var(--ink2);margin-bottom:9px}\
.wp-pool{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:9px 11px;margin-bottom:9px}\
.wp-pool h3{font-size:12.5px;display:flex;align-items:center;gap:6px;margin-bottom:5px}\
.wp-pool h3 button{margin-left:auto}\
.wp-pitem{padding:5px 0;border-top:1px solid var(--line);font-size:12.5px;cursor:pointer;display:flex;gap:7px;align-items:flex-start}\
.wp-dot{width:8px;height:8px;border-radius:50%;flex:none;margin-top:6px}\
.wp-pitem small{display:block;color:var(--ink2);font-size:11.5px}\
.wp-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}\
.wp-wk{display:grid;grid-template-columns:repeat(7,minmax(112px,1fr));gap:5px}\
.wp-wd{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:6px 5px;min-height:116px;cursor:pointer}\
.wp-wd.wp-sel{border-color:var(--or);box-shadow:inset 0 0 0 1px var(--or)}\
.wp-wd h4{margin:0 0 4px;font-size:11.5px;display:flex;gap:4px;align-items:baseline}\
.wp-wd h4 em{font-style:normal;margin-left:auto;color:var(--ink3);font-weight:400}\
.wp-wc{border-left:4px solid var(--line2);background:var(--card2);padding:3px 5px;margin-bottom:3px;border-radius:0 4px 4px 0}\
.wp-wc b{display:block;font-size:10px;font-weight:500;color:var(--ink2)}\
.wp-wc span{font-size:11px;line-height:1.3;display:block}\
.wp-tg{border-radius:4px;padding:2px 5px;font-size:11px;text-align:center;margin-bottom:3px}\
.wp-grid{display:flex;gap:3px;min-width:680px}\
.wp-gh{width:36px;flex:none;position:relative}\
.wp-gh i{position:absolute;right:4px;font-size:10px;color:var(--ink3);font-style:normal}\
.wp-gc{flex:1;min-width:84px;cursor:pointer}\
.wp-gc>b{display:block;text-align:center;font-size:11px;font-weight:600;margin-bottom:3px}\
.wp-gbox{position:relative;background:var(--card);border:1px solid var(--line);border-radius:var(--r);overflow:hidden}\
.wp-gbox.wp-sel{border-color:var(--or)}\
.wp-gl{position:absolute;left:0;right:0;border-top:1px solid var(--line)}\
.wp-gm{position:absolute;left:0;right:0;background:var(--card2);border-top:1px dashed var(--line2);border-bottom:1px dashed var(--line2)}\
.wp-gj{position:absolute;left:2px;right:2px;border-left:4px solid var(--line2);background:var(--card2);padding:2px 4px;overflow:hidden;border-radius:0 4px 4px 0}\
.wp-gj b{display:block;font-size:9px;font-weight:500;color:var(--ink2)}\
.wp-gj span{font-size:10px;line-height:1.2}\
.wp-pt{width:100%;border-collapse:collapse;min-width:900px}\
.wp-pt th,.wp-pt td{border:1px solid var(--line);vertical-align:top;padding:4px}\
.wp-pt thead th{background:var(--card2);font-size:11.5px;font-weight:600;padding:6px 5px;position:sticky;top:0}\
.wp-who{width:118px;background:var(--card);font-size:13px;font-weight:600;vertical-align:middle}\
.wp-who small{display:block;font-weight:400;font-size:11px;color:var(--ink2);margin-top:2px}\
.wp-pt td{background:var(--card)}\
.wp-pt td.wp-off{background:var(--card2)}\
.wp-pc{border-left:4px solid var(--line2);background:var(--card2);padding:3px 5px;margin-bottom:3px;border-radius:0 4px 4px 0;cursor:pointer}\
.wp-pc b{display:block;font-size:10px;font-weight:500;color:var(--ink2)}\
.wp-pc span{font-size:11px;line-height:1.25;display:block}\
.wp-load{height:4px;background:var(--line);border-radius:2px;margin-top:4px;overflow:hidden}\
.wp-load i{display:block;height:100%;background:var(--ok)}\
.wp-load i.wp-mid{background:var(--warn)}\
.wp-load i.wp-hi{background:#BE2318}\
.wp-cellh{font-size:10px;color:var(--ink3);text-align:right}\
.wp-ld{border-top:1px solid var(--line);padding:7px 0;cursor:pointer}\
.wp-ld>div:first-child{display:flex;align-items:center;gap:8px;margin-bottom:3px}\
.wp-ld h4{margin:0;font-size:13.5px}\
.wp-lr{display:flex;gap:8px;align-items:baseline;font-size:12.5px;padding:3px 6px;border-left:4px solid var(--line2);margin-bottom:3px}\
.wp-lr .wp-t{width:80px;flex:none;font-size:11.5px;color:var(--ink2)}\
.wp-lr .wp-n{width:62px;flex:none;font-size:11.5px;color:var(--ink2);text-align:right}\
.wp-abs{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:11px;margin-top:13px}\
.wp-abs>h3{font-size:14.5px;margin-bottom:9px}\
.wp-nums{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:9px}\
.wp-num{background:var(--card2);border-radius:6px;padding:7px 8px}\
.wp-num small{display:block;font-size:11px;color:var(--ink2)}\
.wp-num b{font-size:19px;font-weight:600}\
.wp-rec{display:flex;align-items:center;gap:11px;padding-top:9px;border-top:1px solid var(--line)}\
.wp-mic{width:42px;height:42px;flex:none;border-radius:50%;border:2px solid var(--line2);background:none;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}\
.wp-mic i{width:24px;height:24px;border-radius:50%;background:#BE2318;display:block}\
.wp-mic.wp-recon{border-color:#BE2318}\
.wp-mic.wp-recon i{border-radius:5px;width:18px;height:18px}\
.wp-mic.wp-play i{background:none;width:0;height:0;border-left:14px solid var(--ink);border-top:9px solid transparent;border-bottom:9px solid transparent;margin-left:4px;border-radius:0}\
.wp-trans{margin-top:8px;padding-top:8px;border-top:1px solid var(--line);font-size:12.5px;color:var(--ink2)}\
.wp-ov{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;z-index:70}\
@media(min-width:620px){.wp-ov{align-items:center;padding:20px}}\
.wp-sheet{background:var(--bg);width:100%;max-width:540px;max-height:92vh;overflow:auto;border-radius:12px 12px 0 0;padding:15px}\
@media(min-width:620px){.wp-sheet{border-radius:12px}}\
.wp-sheet h2{font-size:16px;margin-bottom:10px}\
.wp-app label{display:block;font-size:11.5px;color:var(--ink2);margin:9px 0 3px}\
.wp-app input[type=text],.wp-app input[type=time],.wp-app input[type=date],.wp-app input[type=number],.wp-app select,.wp-app textarea{width:100%;background:var(--card);border:1px solid var(--line);border-radius:6px;padding:8px 9px;font-size:15px}\
.wp-app textarea{min-height:58px;resize:vertical}\
.wp-two{display:grid;grid-template-columns:1fr 1fr;gap:9px}\
.wp-prios{display:flex;gap:5px;flex-wrap:wrap}\
.wp-pb{flex:1;min-width:64px;border:2px solid var(--line);background:var(--card);border-radius:6px;padding:6px 3px;font-size:11.5px;cursor:pointer;text-align:center}\
.wp-pb b{display:block;font-size:11px;font-weight:600}\
.wp-acts{display:flex;gap:7px;margin-top:14px}\
.wp-acts button{flex:1;height:42px;border-radius:7px;border:1px solid var(--line2);background:var(--card);font-size:15px;cursor:pointer}\
.wp-acts .wp-go{background:var(--ink);color:var(--bg);border-color:var(--ink);font-weight:600}\
.wp-acts .wp-del{flex:none;width:50px;border-color:#BE2318;color:#BE2318}\
.wp-errmsg{color:#BE2318;font-size:12.5px;margin-top:7px}\
.wp-plist{background:var(--card);border:1px solid var(--line);border-radius:6px;padding:3px 9px}\
.wp-prow{display:flex;gap:7px;align-items:center;padding:7px 0;border-top:1px solid var(--line)}\
.wp-prow:first-child{border-top:none}\
.wp-prow span:first-child{flex:1}\
.wp-legend{display:flex;flex-wrap:wrap;gap:9px;font-size:11.5px;color:var(--ink2);padding:12px 0 0;margin-top:12px;border-top:1px solid var(--line)}\
.wp-legend i{width:9px;height:9px;border-radius:2px;display:inline-block;margin-right:4px}\
.wp-week{background:#FAF0DA;border-left:5px solid #A96700;padding:8px 11px;margin:9px 0;display:flex;align-items:center;gap:10px;font-size:13px;color:#A96700}\
#wp-printArea{display:none;background:#fff;color:#000;font-size:10pt}\
#wp-printInner{transform-origin:top left}\
.wp-pagina{display:flex;flex-direction:column}\
.wp-ph{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #000;padding-bottom:5px;margin-bottom:9px;flex:none}\
.wp-ph .wp-lg{width:14px;height:14px;background:#12B886;display:inline-block;vertical-align:-2px;margin-right:6px}\
.wp-pt2{width:100%;border-collapse:collapse;table-layout:fixed;flex:none}\
.wp-pt2 th,.wp-pt2 td{border:.5pt solid #999;padding:3px 4px;font-size:8pt;vertical-align:top;word-wrap:break-word}\
.wp-pt2 th{background:#eee;font-size:8pt}\
.wp-pt2 .wp-w{width:78px;font-weight:700}\
.wp-pt2 tr{break-inside:avoid;page-break-inside:avoid}\
.wp-pj{border-left:2.5pt solid #000;padding-left:4px;margin-bottom:3px;break-inside:avoid}\
.wp-pj b{display:block;font-size:7pt;font-weight:400}\
.wp-pd{font-size:9pt;font-weight:700;margin:8px 0 2px;break-after:avoid;page-break-after:avoid;flex:none}\
.wp-pl{display:flex;gap:7px;font-size:8.5pt;padding:2px 0;border-bottom:.5pt solid #ccc;break-inside:avoid;flex:none}\
.wp-pl .wp-b{width:12px;flex:none}.wp-pl .wp-t{width:80px;flex:none;white-space:nowrap}.wp-pl .wp-n{width:58px;flex:none;text-align:right}\
.wp-sum{display:flex;gap:16px;font-size:8.5pt;margin-top:6px;flex-wrap:wrap;flex:none}\
.wp-sig{display:flex;gap:26px;font-size:8pt;break-inside:avoid;background:#fff;margin-top:6px;flex:none}\
.wp-sig div{flex:1;border-top:.8pt solid #000;padding-top:3px}\
.wp-notiz{margin-top:10px;flex:1 1 auto;min-height:14mm;display:flex;flex-direction:column}\
.wp-notlines{flex:1 1 auto;min-height:0;background-image:repeating-linear-gradient(to bottom,transparent 0,transparent 9.7mm,#ccc 9.7mm,#ccc 10mm);background-position:top}\
.wp-pfoot{margin-top:6px;font-size:7pt;color:#666;text-align:right;flex:none}\
.wp-vorschau{position:fixed;inset:0;background:#fff;z-index:70;display:flex;flex-direction:column}\
.wp-vorschau-top{display:flex;align-items:center;justify-content:flex-end;gap:10px;padding:10px 14px;border-bottom:1px solid var(--line);background:var(--card);color:var(--ink);flex:none}\
.wp-vorschau-top .wp-mini:first-child{margin-right:auto}\
.wp-vorschau-tabs{display:flex;gap:6px;flex-wrap:wrap;padding:8px 14px;border-bottom:1px solid var(--line);background:var(--card);color:var(--ink);flex:none}\
.wp-vorschau-wrap{flex:0 1 auto;max-height:100%;overflow:auto;display:flex;justify-content:center;padding:16px;background:#e8e8e8;box-sizing:border-box}\
.wp-vorschau-inner{box-shadow:0 1px 6px rgba(0,0,0,.25);transform-origin:top center;flex:none;align-self:flex-start}\
.wp-vorschau-inner,.wp-vorschau-inner *{color:#000!important;background-color:#fff!important;font-size:10pt}\
.wp-vorschau-inner .wp-pt2 th,.wp-vorschau-inner .wp-pt2 td{font-size:8pt}\
.wp-vorschau-inner .wp-pd{font-size:9pt}\
.wp-vorschau-inner .wp-pl{font-size:8.5pt}\
.wp-vorschau-inner .wp-sig{font-size:8pt}\
@media print{\
  @page{margin:10mm}\
  html,body{width:auto;height:auto}\
  body{background:#fff;color:#000;padding:0;font-size:10pt;-webkit-print-color-adjust:exact;print-color-adjust:exact}\
  .wp-app{--bg:#fff;background:#fff;min-height:0;padding-bottom:0}\
  .wp-top,.wp-bar,.wp-kpis,.wp-cols,.wp-scroll,.wp-alarm,.wp-legend,.wp-abs,.wp-ov,.wp-week,.wp-noprint,.wp-vorschau{display:none!important}\
  #wp-printArea{display:block!important}\
  .wp-pbreak{break-before:page;page-break-before:always}\
}';

// ── Peças pequenas ao nível do módulo ─────────────────────────────
var WP_AMBAR = 'var(--warn)';
function wpStIcon(s) {
  var cor = s === 'erledigt' ? 'var(--ok)' : s === 'laeuft' ? 'var(--run)' : s === 'gebaut_nio' ? WP_AMBAR : 'var(--ink3)';
  var ic = s === 'erledigt' ? '✓' : s === 'laeuft' ? '◐' : s === 'gebaut_nio' ? '⚠' : '○';
  return React.createElement('span', { className: 'wp-st', style: { color: cor } }, ic);
}
function wpJobCard(a, onOpen) {
  var P = WP_PRIO[a.prio];
  return React.createElement('div', {
    key: a.id, className: 'wp-job' + (a.status === 'erledigt' ? ' wp-done' : ''),
    onClick: function() { onOpen(a.id); }, style: { borderLeftColor: P.c }
  },
    React.createElement('h3', null, a.titel, wpStIcon(a.status)),
    React.createElement('p', null, a.arbeit, a.wer && React.createElement('span', null, ' · ', React.createElement('b', { style: { fontWeight: 600, color: 'var(--ink)' } }, a.wer))),
    (a.auftrag_nr || a.kunde) && React.createElement('div', { className: 'wp-ref' }, [a.auftrag_nr, a.kunde].filter(Boolean).join(' · ')),
    a.bemerkungen && React.createElement('div', { style: { fontSize: 12, color: 'var(--ink3)', marginTop: 3, whiteSpace: 'pre-wrap' } }, a.bemerkungen)
  );
}
function wpPoolBox(titulo, arr, urgente, onOpen, onNew) {
  return React.createElement('div', { className: 'wp-pool' },
    React.createElement('h3', null,
      urgente && React.createElement('span', { className: 'wp-dot', style: { background: '#BE2318', margin: 0 } }),
      titulo,
      React.createElement('button', { className: 'wp-mini', onClick: onNew }, '+')
    ),
    arr.length === 0 && React.createElement('div', { style: { fontSize: 12.5, color: 'var(--ink3)', padding: '4px 0' } }, '–'),
    arr.map(function(a) {
      return React.createElement('div', { key: a.id, className: 'wp-pitem', onClick: function() { onOpen(a.id); } },
        React.createElement('span', { className: 'wp-dot', style: { background: WP_PRIO[a.prio].c } }),
        React.createElement('span', null, a.titel, React.createElement('small', null, a.arbeit, a.wer ? ' · ' + a.wer : '', a.auftrag_nr ? ' · ' + a.auftrag_nr : ''))
      );
    })
  );
}

// ── Cabeçalho, barra de navegação e filtros ───────────────────────
function WpTop(p) {
  var c = wpMk(p.cur);
  var titulo, sub;
  if (p.mode === 'tag') { titulo = WP_LONG[WP_DAY[wpDi(c)]] + ' ' + wpFmt(c); sub = 'KW ' + wpKw(c); }
  else { var m = wpMon(c); titulo = (p.mode === 'team' ? 'Plantafel KW ' : 'KW ') + wpKw(c); sub = wpFmt(m) + '–' + wpFmt(wpAddD(m, 6)) + c.getUTCFullYear(); }
  return React.createElement('div', { className: 'wp-top' },
    React.createElement('div', { className: 'wp-wrap wp-topin' },
      React.createElement('div', { className: 'wp-mk' }),
      React.createElement('div', null, React.createElement('div', { className: 'wp-tt' }, titulo), React.createElement('div', { className: 'wp-ts' }, sub)),
      React.createElement('div', { className: 'wp-navwrap' },
        React.createElement('button', { className: 'wp-nb', onClick: p.onPrev, 'aria-label': 'anterior' }, '‹'),
        React.createElement('button', { className: 'wp-nb' + (p.mode === 'tag' ? ' wp-on' : ''), onClick: function() { p.onMode('tag'); } }, 'Tag'),
        React.createElement('button', { className: 'wp-nb' + (p.mode === 'woche' ? ' wp-on' : ''), onClick: function() { p.onMode('woche'); } }, 'Woche'),
        p.rolle === 'bauleiter' && React.createElement('button', { className: 'wp-nb' + (p.mode === 'team' ? ' wp-on' : ''), onClick: function() { p.onMode('team'); } }, 'Team'),
        React.createElement('button', { className: 'wp-nb', onClick: p.onNext, 'aria-label': 'seguinte' }, '›')
      )
    )
  );
}
function WpBar(p) {
  var bl = p.rolle === 'bauleiter';
  return React.createElement('div', { className: 'wp-bar' },
    React.createElement('span', { className: 'wp-roll' },
      React.createElement('button', { className: 'wp-chip' + (!bl ? ' wp-on' : ''), onClick: function() { p.onRolle('monteur'); } }, 'Monteur'),
      React.createElement('button', { className: 'wp-chip' + (bl ? ' wp-on' : ''), onClick: function() { p.onRolle('bauleiter'); } }, 'Bauleiter')
    ),
    React.createElement('span', { className: 'wp-sep' }),
    bl && React.createElement('button', { className: 'wp-chip' + (p.who === 'alle' ? ' wp-on' : ''), onClick: function() { p.onWho('alle'); } }, 'Alle'),
    p.leute.map(function(pe) {
      return React.createElement('button', { key: pe.id, className: 'wp-chip' + (p.who === pe.name ? ' wp-on' : ''), onClick: function() { p.onWho(pe.name); } }, pe.name);
    }),
    React.createElement('button', { className: 'wp-chip', onClick: p.onTeam }, bl ? 'Team verwalten' : 'Namen'),
    p.mode === 'woche' && React.createElement(React.Fragment, null,
      React.createElement('span', { className: 'wp-sep' }),
      [['karten', 'Karten'], ['raster', 'Raster'], ['liste', 'Liste']].map(function(o) {
        return React.createElement('button', { key: o[0], className: 'wp-chip' + (p.wl === o[0] ? ' wp-on' : ''), onClick: function() { p.onWl(o[0]); } }, o[1]);
      })
    ),
    React.createElement('span', { className: 'wp-sep' }),
    bl ? React.createElement(React.Fragment, null,
      React.createElement('button', { className: 'wp-chip', onClick: p.onVorschau }, 'Vorschau'),
      React.createElement('button', { className: 'wp-chip', onClick: p.onCsv }, 'CSV')
    ) : React.createElement('button', { className: 'wp-chip', onClick: p.onVorschau }, 'Vorschau')
  );
}
function WpKpis(p) {
  if (p.mode === 'tag' || p.rolle !== 'bauleiter') return null;
  var W = wpWeekTasks(p.tasks, p.cur, p.who);
  var done = W.filter(function(a) { return a.status === 'erledigt'; });
  var nio = W.filter(function(a) { return a.status === 'gebaut_nio'; });
  var plan = 0, ist = 0;
  W.forEach(function(a) { plan += wpDur(a); if (a.status === 'erledigt') ist += wpDur(a); });
  var soll = (p.who === 'alle' ? p.leute.reduce(function(s, pe) { return s + wpSollWoche(pe); }, 0) : wpSollWoche(wpPerson(p.leute, p.who))) * 60;
  var aus = soll ? Math.round(plan / soll * 100) : 0;
  var sp = wpSpaet(p.tasks, wpTodayIso(), p.who).length;
  var cls = aus > 100 ? 'wp-hi' : aus > 85 ? 'wp-mid' : '';
  return React.createElement('div', { className: 'wp-kpis' },
    React.createElement('div', { className: 'wp-kpi' }, React.createElement('small', null, 'Aufträge'), React.createElement('b', null, W.length), React.createElement('u', null, wpPoolL(p.tasks, p.who, true).length, ' dringend')),
    React.createElement('div', { className: 'wp-kpi' }, React.createElement('small', null, 'Erledigt'), React.createElement('b', { style: { color: 'var(--ok)' } }, done.length), React.createElement('u', null, 'von ', W.length)),
    React.createElement('div', { className: 'wp-kpi' }, React.createElement('small', null, 'Gebaut n.i.o'), React.createElement('b', { style: { color: WP_AMBAR } }, nio.length), React.createElement('u', null, 'von ', W.length)),
    React.createElement('div', { className: 'wp-kpi' }, React.createElement('small', null, 'Geplant'), React.createElement('b', null, wpDez(plan)), React.createElement('u', null, 'Std')),
    React.createElement('div', { className: 'wp-kpi' }, React.createElement('small', null, 'Geleistet'), React.createElement('b', null, wpDez(ist)), React.createElement('u', null, 'Std')),
    React.createElement('div', { className: 'wp-kpi' }, React.createElement('small', null, 'Auslastung'), React.createElement('b', null, aus, '%'), React.createElement('div', { className: 'wp-load' }, React.createElement('i', { className: cls, style: { width: Math.min(aus, 100) + '%' } }))),
    React.createElement('div', { className: 'wp-kpi' }, React.createElement('small', null, 'Rückstand'), React.createElement('b', { style: { color: sp ? '#BE2318' : 'var(--ink)' } }, sp), React.createElement('u', null, 'Aufträge'))
  );
}
function WpAlarm(p) {
  var l = wpSpaet(p.tasks, wpTodayIso(), p.who);
  if (!l.length) return null;
  return React.createElement('div', { className: 'wp-alarm' },
    React.createElement('h3', null, 'Nicht erledigt · ', l.length),
    l.map(function(a) {
      var d = wpMk(a.datum);
      return React.createElement('div', { key: a.id, className: 'wp-alrow', onClick: function() { p.onOpen(a.id); } },
        React.createElement('span', null, a.titel, a.auftrag_nr && React.createElement('span', { style: { color: 'var(--ink3)', fontSize: 11.5 } }, ' ', a.auftrag_nr)),
        React.createElement('span', null, WP_DAY[wpDi(d)] + ' ' + wpFmt(d) + (a.wer ? ' · ' + a.wer : ''))
      );
    })
  );
}
function WpLegend() {
  return React.createElement('div', { className: 'wp-legend' },
    Object.keys(WP_PRIO).map(function(k) {
      return React.createElement('span', { key: k }, React.createElement('i', { style: { background: WP_PRIO[k].c } }), k + ' ' + WP_PRIO[k].n);
    }),
    React.createElement('span', { style: { marginLeft: 'auto' } }, '○ offen   ◐ läuft   ✓ erledigt   ', React.createElement('span', { style: { color: WP_AMBAR } }, '⚠ gebaut n.i.o'))
  );
}
function WpBalancoBanner(p) {
  return React.createElement('div', { className: 'wp-week' },
    React.createElement('span', null, '📅 Fim de semana — o balanço de ', p.quem, ' ainda não foi feito.'),
    React.createElement('button', { className: 'wp-mini', onClick: p.onAbrir }, 'Abrir Tagesabschluss')
  );
}

// ── Vista Tag ──────────────────────────────────────────────────
function WpTagAbschluss(p) {
  var all = p.tasksDoDia;
  var done = all.filter(function(a) { return a.status === 'erledigt'; });
  var off = all.filter(function(a) { return a.status !== 'erledigt'; });
  var ist = 0, plan = 0;
  all.forEach(function(a) { plan += wpDur(a); if (a.status === 'erledigt') ist += wpDur(a); });
  var n = p.nota;
  return React.createElement('div', { className: 'wp-abs' },
    React.createElement('h3', null, 'Tagesabschluss'),
    React.createElement('div', { className: 'wp-nums' },
      React.createElement('div', { className: 'wp-num' }, React.createElement('small', null, 'Erledigt'), React.createElement('b', { style: { color: 'var(--ok)' } }, done.length)),
      React.createElement('div', { className: 'wp-num' }, React.createElement('small', null, 'Offen'), React.createElement('b', null, off.length)),
      React.createElement('div', { className: 'wp-num' }, React.createElement('small', null, 'Geplant'), React.createElement('b', { style: { color: 'var(--ink2)' } }, wpHh(plan))),
      React.createElement('div', { className: 'wp-num' }, React.createElement('small', null, 'Geleistet'), React.createElement('b', null, wpHh(ist)))
    ),
    n
      ? React.createElement('div', { className: 'wp-rec' },
          React.createElement('button', { className: 'wp-mic wp-play', onClick: p.onPlay, 'aria-label': 'abspielen' }, React.createElement('i', null)),
          React.createElement('div', { style: { flex: 1 } }, React.createElement('div', { style: { fontSize: 13.5, fontWeight: 600 } }, 'Sprachnotiz · ' + (n.dauer || '—')), React.createElement('div', { style: { fontSize: 11.5, color: 'var(--ink2)' } }, n.zeit || '')),
          React.createElement('button', { className: 'wp-mini', onClick: p.onAbrirNota }, 'Ändern')
        )
      : React.createElement('div', { className: 'wp-rec' },
          React.createElement('button', { className: 'wp-mic', onClick: p.onAbrirNota, 'aria-label': 'aufnehmen' }, React.createElement('i', null)),
          React.createElement('div', { style: { flex: 1 } }, React.createElement('div', { style: { fontSize: 13.5, fontWeight: 600 } }, 'Tagesbilanz aufnehmen'), React.createElement('div', { style: { fontSize: 11.5, color: 'var(--ink2)' } }, 'fertig · offen · verschoben · Stunden'))
        ),
    n && n.notiz && React.createElement('div', { className: 'wp-trans' }, n.notiz)
  );
}
function WpTagView(p) {
  var d = p.cur;
  var all = wpByDay(p.tasks, d, p.who);
  var st = wpStatOf(p.tagRows, p.leute, d, p.who);
  var ex = all.filter(function(a) { return wpIsLunch(a, p.mVon, p.mBis); });
  var norm = all.filter(function(a) { return !wpIsLunch(a, p.mVon, p.mBis); });
  var mitH = function() {
    if (!ex.length) return React.createElement('div', { key: 'mit', className: 'wp-slot' },
      React.createElement('div', { className: 'wp-hrs', style: { paddingTop: 7 } }, p.mVon),
      React.createElement('div', { className: 'wp-mittag' }, 'Mittag ' + p.mVon + '–' + p.mBis, React.createElement('button', { className: 'wp-mini', onClick: function() { p.onNovo({ datum: d, von: p.mVon, bis: p.mBis, prio: 1 }); } }, 'Ausnahme'))
    );
    return React.createElement('div', { key: 'mit', className: 'wp-slot' },
      React.createElement('div', { className: 'wp-hrs', style: { paddingTop: 7 } }, p.mVon),
      React.createElement('div', { className: 'wp-exc' }, React.createElement('div', null, 'Mittag · Ausnahme'), ex.map(function(a) { return wpJobCard(a, p.onOpen); }))
    );
  };
  var slots = [];
  var put = false;
  norm.forEach(function(a) {
    if (!put && a.von >= p.mBis) { slots.push(mitH()); put = true; }
    slots.push(React.createElement('div', { key: 's' + a.id, className: 'wp-slot' }, React.createElement('div', { className: 'wp-hrs' }, React.createElement('b', null, a.von), a.bis), wpJobCard(a, p.onOpen)));
  });
  if (!put && !st) slots.push(mitH());
  return React.createElement('div', { className: 'wp-cols' },
    React.createElement('div', null,
      st && React.createElement('div', { className: 'wp-frei', style: { background: WP_DST[st][1], color: WP_DST[st][2] } }, WP_DST[st][0]),
      (!all.length && !st) && React.createElement('div', { className: 'wp-frei' }, 'Nichts geplant'),
      slots,
      React.createElement('button', { className: 'wp-add', onClick: function() { p.onNovo({ datum: d }); } }, '+ Auftrag'),
      p.who !== 'alle' && React.createElement(WpTagAbschluss, {
        tasksDoDia: all, nota: p.notaDoDia, onPlay: p.onPlayNota, onAbrirNota: p.onAbrirNota
      })
    ),
    React.createElement('div', null,
      wpPoolBox('Dringend · kein Datum', wpPoolL(p.tasks, p.who, true), true, p.onOpen, function() { p.onNovo({ datum: null, von: '', bis: '', prio: 1 }); }),
      wpPoolBox('Offen · kein Datum', wpPoolL(p.tasks, p.who, false), false, p.onOpen, function() { p.onNovo({ datum: null, von: '', bis: '', prio: 4 }); })
    )
  );
}

// ── Vista Woche ────────────────────────────────────────────────
function WpWocheKarten(p) {
  var m = wpMon(wpMk(p.cur));
  var dias = [];
  for (var i = 0; i < 7; i++) {
    var dd = wpAddD(m, i), k = wpIso(dd), L = wpByDay(p.tasks, k, p.who), st = wpStatOf(p.tagRows, p.leute, k, p.who);
    var soma = 0; L.forEach(function(a) { soma += wpDur(a); });
    dias.push(React.createElement('div', { key: k, className: 'wp-wd' + (k === p.cur ? ' wp-sel' : ''), onClick: function() { p.onDia(k); } },
      React.createElement('h4', k === wpTodayIso() ? { style: { color: 'var(--or)' } } : null, WP_DAY[i] + ' ' + wpFmt(dd), soma > 0 && React.createElement('em', null, wpDez(soma) + 'h')),
      st && React.createElement('div', { className: 'wp-tg', style: { background: WP_DST[st][1], color: WP_DST[st][2] } }, WP_DST[st][0]),
      L.map(function(a) {
        return React.createElement('div', { key: a.id, className: 'wp-wc', style: { borderLeftColor: WP_PRIO[a.prio].c, background: wpIsLunch(a, p.mVon, p.mBis) ? '#FAF0DA' : undefined } },
          React.createElement('b', null, wpStIcon(a.status), a.von + '–' + a.bis),
          React.createElement('span', { style: a.status === 'erledigt' ? { textDecoration: 'line-through', color: 'var(--ink3)' } : null }, a.titel),
          a.wer && React.createElement('b', null, a.wer)
        );
      })
    ));
  }
  return React.createElement('div', { className: 'wp-scroll' }, React.createElement('div', { className: 'wp-wk' }, dias));
}
function WpWocheRaster(p) {
  var m = wpMon(wpMk(p.cur));
  var tot = (WP_H1 - WP_H0) * 60 * WP_PPM;
  var horas = [];
  for (var q = WP_H0; q <= WP_H1; q++) horas.push(React.createElement('i', { key: q, style: { top: ((q - WP_H0) * 60 * WP_PPM + 12) + 'px' } }, String(q).padStart(2, '0')));
  var cols = [];
  for (var i = 0; i < 7; i++) {
    var dd = wpAddD(m, i), k = wpIso(dd), L = wpByDay(p.tasks, k, p.who), st = wpStatOf(p.tagRows, p.leute, k, p.who);
    var linhas = [];
    for (var qq = 1; qq < WP_H1 - WP_H0; qq++) linhas.push(React.createElement('div', { key: 'l' + qq, className: 'wp-gl', style: { top: (qq * 60 * WP_PPM) + 'px' } }));
    cols.push(React.createElement('div', { key: k, className: 'wp-gc', onClick: function() { p.onDia(k); } },
      React.createElement('b', k === wpTodayIso() ? { style: { color: 'var(--or)' } } : null, WP_DAY[i] + ' ' + wpFmt(dd)),
      React.createElement('div', { className: 'wp-gbox' + (k === p.cur ? ' wp-sel' : ''), style: { height: tot } },
        linhas,
        React.createElement('div', { className: 'wp-gm', style: { top: ((wpMn(p.mVon) - WP_H0 * 60) * WP_PPM) + 'px', height: ((wpMn(p.mBis) - wpMn(p.mVon)) * WP_PPM) + 'px' } }),
        st && React.createElement('div', { style: { position: 'absolute', inset: 0, background: WP_DST[st][1], color: WP_DST[st][2], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5 } }, WP_DST[st][0]),
        L.map(function(a) {
          var tp = (wpMn(a.von) - WP_H0 * 60) * WP_PPM, hg = Math.max(wpDur(a) * WP_PPM, 17);
          return React.createElement('div', { key: a.id, className: 'wp-gj', style: { top: tp, height: hg, borderLeftColor: WP_PRIO[a.prio].c, background: wpIsLunch(a, p.mVon, p.mBis) ? '#FAF0DA' : undefined } },
            React.createElement('b', null, wpStIcon(a.status), a.von + (a.wer ? ' · ' + a.wer : '')),
            React.createElement('span', { style: a.status === 'erledigt' ? { textDecoration: 'line-through', color: 'var(--ink3)' } : null }, a.titel)
          );
        })
      )
    ));
  }
  return React.createElement('div', { className: 'wp-scroll' }, React.createElement('div', { className: 'wp-grid' }, React.createElement('div', { className: 'wp-gh', style: { height: (tot + 18) } }, horas), cols));
}
function WpWocheListe(p) {
  var m = wpMon(wpMk(p.cur));
  var dias = [];
  for (var i = 0; i < 7; i++) {
    var dd = wpAddD(m, i), k = wpIso(dd), L = wpByDay(p.tasks, k, p.who), st = wpStatOf(p.tagRows, p.leute, k, p.who);
    var soma = 0; L.forEach(function(a) { soma += wpDur(a); });
    dias.push(React.createElement('div', { key: k, className: 'wp-ld', onClick: function() { p.onDia(k); } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
        React.createElement('h4', k === wpTodayIso() ? { style: { color: 'var(--or)' } } : null, WP_LONG[WP_DAY[i]] + ' ' + wpFmt(dd)),
        st && React.createElement('span', { className: 'wp-tg', style: { margin: 0, background: WP_DST[st][1], color: WP_DST[st][2] } }, WP_DST[st][0]),
        React.createElement('span', { style: { marginLeft: 'auto', fontSize: 11.5, color: 'var(--ink3)' } }, L.length + ' · ' + wpDez(soma) + 'h')
      ),
      (!L.length && !st) && React.createElement('div', { style: { fontSize: 12.5, color: 'var(--ink3)', paddingLeft: 6 } }, '–'),
      L.map(function(a) {
        return React.createElement('div', { key: a.id, className: 'wp-lr', style: { borderLeftColor: WP_PRIO[a.prio].c, background: wpIsLunch(a, p.mVon, p.mBis) ? '#FAF0DA' : undefined } },
          React.createElement('span', { className: 'wp-t' }, a.von + '–' + a.bis),
          React.createElement('span', { style: Object.assign({ flex: 1 }, a.status === 'erledigt' ? { textDecoration: 'line-through', color: 'var(--ink3)' } : {}) }, a.titel, React.createElement('span', { style: { color: 'var(--ink2)' } }, ' · ' + a.arbeit + (a.auftrag_nr ? ' · ' + a.auftrag_nr : ''))),
          React.createElement('span', { className: 'wp-n' }, a.wer || '–'),
          wpStIcon(a.status)
        );
      })
    ));
  }
  return React.createElement('div', null, dias);
}

// ── Vista Team (Plantafel) ─────────────────────────────────────
function WpTeamView(p) {
  var W = wpWeekDays(p.cur), m = wpMon(wpMk(p.cur));
  var linhas = p.leute.filter(function(pe) { return p.who === 'alle' || pe.name === p.who; }).map(function(pe) { return pe.name; });
  if (p.who === 'alle') linhas.push('');
  return React.createElement('div', { className: 'wp-scroll' },
    React.createElement('table', { className: 'wp-pt' },
      React.createElement('thead', null, React.createElement('tr', null,
        React.createElement('th', { className: 'wp-who' }, 'Mitarbeiter'),
        W.map(function(k, i) { return React.createElement('th', { key: k, style: k === wpTodayIso() ? { color: 'var(--or)' } : null }, WP_DAY[i] + ' ' + wpFmt(wpAddD(m, i))); }),
        React.createElement('th', { style: { width: 76 } }, 'Woche')
      )),
      React.createElement('tbody', null, linhas.map(function(nm) {
        var P = nm ? wpPerson(p.leute, nm) : null;
        var wk = 0;
        var cols = W.map(function(k) {
          var L = p.tasks.filter(function(a) { return a.datum === k && a.wer === nm; }).sort(function(x, y) { return x.von < y.von ? -1 : 1; });
          var st = nm ? wpStatOf(p.tagRows, p.leute, k, p.who, nm) : null;
          var soma = 0; L.forEach(function(a) { soma += wpDur(a); }); wk += soma;
          var sT = nm ? wpSollTag(P, k) * 60 : 0;
          return React.createElement('td', { key: k, className: st ? 'wp-off' : '' },
            st && React.createElement('div', { className: 'wp-tg', style: { background: WP_DST[st][1], color: WP_DST[st][2] } }, WP_DST[st][0]),
            L.map(function(a) {
              return React.createElement('div', { key: a.id, className: 'wp-pc', onClick: function() { p.onOpen(a.id); }, style: { borderLeftColor: WP_PRIO[a.prio].c, background: wpIsLunch(a, p.mVon, p.mBis) ? '#FAF0DA' : undefined } },
                React.createElement('b', null, wpStIcon(a.status), a.von + '–' + a.bis),
                React.createElement('span', { style: a.status === 'erledigt' ? { textDecoration: 'line-through', color: 'var(--ink3)' } : null }, a.titel)
              );
            }),
            (soma || sT) > 0 && React.createElement('div', { className: 'wp-cellh' }, wpDez(soma) + (sT ? ' / ' + wpDezh(sT / 60) : '') + 'h'),
            (soma && sT) ? React.createElement('div', { className: 'wp-load' }, React.createElement('i', { className: soma > sT * 1.02 ? 'wp-hi' : soma < sT * 0.8 ? 'wp-mid' : '', style: { width: Math.min(Math.round(soma / sT * 100), 100) + '%' } })) : null
          );
        });
        var soll = P ? wpSollWoche(P) * 60 : 0, pc = soll ? Math.round(wk / soll * 100) : 0;
        return React.createElement('tr', { key: nm || '_semnome' },
          React.createElement('td', { className: 'wp-who' }, nm ? React.createElement(React.Fragment, null, nm, React.createElement('small', null, 'Nr. ' + (P.pers_nr || '–') + ' · ' + P.std_tag + 'h/Tag · ' + wpDezh(wpSollWoche(P)) + 'h/Woche')) : React.createElement('span', { style: { color: 'var(--ink3)' } }, 'ohne Name')),
          cols,
          React.createElement('td', { style: { textAlign: 'right' } },
            React.createElement('b', { style: { fontSize: 13 } }, wpDez(wk) + 'h'),
            soll > 0 && React.createElement(React.Fragment, null,
              React.createElement('div', { className: 'wp-cellh' }, pc + '% von ' + wpDezh(soll / 60) + 'h'),
              React.createElement('div', { className: 'wp-load' }, React.createElement('i', { className: pc > 102 ? 'wp-hi' : pc < 80 ? 'wp-mid' : '', style: { width: Math.min(pc, 100) + '%' } }))
            )
          )
        );
      }))
    )
  );
}

// ── Modal: Auftrag ─────────────────────────────────────────────
function WpTaskModal(p) {
  var d = p.draft;
  var kein = !d.datum;
  return React.createElement('div', { className: 'wp-ov', onClick: function(e) { if (e.target === e.currentTarget) p.onFechar(); } },
    React.createElement('div', { className: 'wp-sheet', onClick: function(e) { e.stopPropagation(); } },
      React.createElement('h2', null, p.id ? 'Auftrag bearbeiten' : 'Neuer Auftrag'),
      React.createElement('label', { htmlFor: 'wpFT' }, 'Einsatzort'),
      React.createElement('input', { id: 'wpFT', type: 'text', autoComplete: 'off', value: d.titel || '', placeholder: 'Hauserstrasse 21', onChange: function(e) { p.onChange('titel', e.target.value); } }),
      React.createElement('label', { htmlFor: 'wpFA' }, 'Arbeit'),
      React.createElement('input', { id: 'wpFA', type: 'text', autoComplete: 'off', value: d.arbeit || '', placeholder: 'BEP montieren', onChange: function(e) { p.onChange('arbeit', e.target.value); } }),
      React.createElement('div', { className: 'wp-two' },
        React.createElement('div', null, React.createElement('label', { htmlFor: 'wpFNr' }, 'Auftrags-Nr.'), React.createElement('input', { id: 'wpFNr', type: 'text', autoComplete: 'off', value: d.auftrag_nr || '', placeholder: 'A-24135', onChange: function(e) { p.onChange('auftrag_nr', e.target.value); } })),
        React.createElement('div', null, React.createElement('label', { htmlFor: 'wpFK' }, 'Kunde'), React.createElement('input', { id: 'wpFK', type: 'text', autoComplete: 'off', value: d.kunde || '', placeholder: '', onChange: function(e) { p.onChange('kunde', e.target.value); } }))
      ),
      React.createElement('label', null, 'Priorität'),
      React.createElement('div', { className: 'wp-prios' }, Object.keys(WP_PRIO).map(function(k) {
        var sel = +k === +d.prio;
        return React.createElement('button', { key: k, className: 'wp-pb', onClick: function() { p.onChange('prio', +k); }, style: { borderColor: sel ? WP_PRIO[k].c : 'var(--line)', background: sel ? WP_PRIO[k].bg : 'var(--card)' } }, React.createElement('b', { style: { color: WP_PRIO[k].c } }, k), React.createElement('span', { style: { color: WP_PRIO[k].c } }, WP_PRIO[k].n));
      })),
      React.createElement('label', { htmlFor: 'wpFW' }, 'Mitarbeiter'),
      React.createElement('select', { id: 'wpFW', value: d.wer || '', onChange: function(e) { p.onChange('wer', e.target.value); } },
        React.createElement('option', { value: '' }, '– ohne Name –'),
        p.leute.map(function(pe) { return React.createElement('option', { key: pe.id, value: pe.name }, pe.name); })
      ),
      React.createElement('label', null, React.createElement('input', { type: 'checkbox', style: { width: 'auto', marginRight: 6 }, checked: kein, onChange: function(e) { p.onSemData(e.target.checked); } }), 'kein Datum (Liste)'),
      !kein && React.createElement('div', null,
        React.createElement('label', { htmlFor: 'wpFD' }, 'Datum'),
        React.createElement('input', { id: 'wpFD', type: 'date', value: d.datum || p.cur, onChange: function(e) { p.onChange('datum', e.target.value); } }),
        React.createElement('div', { className: 'wp-two' },
          React.createElement('div', null, React.createElement('label', { htmlFor: 'wpFV' }, 'Von'), React.createElement('input', { id: 'wpFV', type: 'time', value: d.von || '07:00', onChange: function(e) { p.onChange('von', e.target.value); } })),
          React.createElement('div', null, React.createElement('label', { htmlFor: 'wpFB' }, 'Bis'), React.createElement('input', { id: 'wpFB', type: 'time', value: d.bis || '12:00', onChange: function(e) { p.onChange('bis', e.target.value); } }))
        )
      ),
      React.createElement('label', { htmlFor: 'wpFBem' }, 'Bemerkungen'),
      React.createElement('textarea', { id: 'wpFBem', autoComplete: 'off', rows: 3, style: { width: '100%' }, value: d.bemerkungen || '', onChange: function(e) { p.onChange('bemerkungen', e.target.value); } }),
      p.id && React.createElement('div', null,
        React.createElement('label', null, 'Status'),
        React.createElement('div', { className: 'wp-prios' }, [['offen', 'offen'], ['laeuft', 'läuft'], ['erledigt', 'erledigt'], ['gebaut_nio', 'Gebaut n.i.o']].map(function(o) {
          var sel = d.status === o[0];
          var cor = o[0] === 'gebaut_nio' ? WP_AMBAR : 'var(--ink)';
          return React.createElement('button', { key: o[0], className: 'wp-pb', onClick: function() { p.onChange('status', o[0]); }, style: { borderColor: sel ? cor : 'var(--line)', color: sel ? cor : null } }, o[1]);
        }))
      ),
      p.erro && React.createElement('div', { className: 'wp-errmsg' }, p.erro),
      React.createElement('div', { className: 'wp-acts' },
        p.id && React.createElement('button', { className: 'wp-del', onClick: p.onApagar, 'aria-label': 'apagar' }, '🗑'),
        React.createElement('button', { onClick: p.onFechar }, 'Abbrechen'),
        React.createElement('button', { className: 'wp-go', onClick: p.onGuardar, disabled: p.guardando }, p.guardando ? 'A guardar…' : 'Speichern')
      )
    )
  );
}

// ── Modal: Team ────────────────────────────────────────────────
function WpTeamListModal(p) {
  return React.createElement('div', { className: 'wp-ov', onClick: function(e) { if (e.target === e.currentTarget) p.onFechar(); } },
    React.createElement('div', { className: 'wp-sheet', onClick: function(e) { e.stopPropagation(); } },
      React.createElement('h2', null, 'Team'),
      React.createElement('div', { className: 'wp-plist' },
        p.leute.length === 0 && React.createElement('div', { style: { padding: '8px 0', fontSize: 12.5, color: 'var(--ink3)' } }, 'Noch keine Mitarbeiter.'),
        p.leute.map(function(pe) {
          var c = p.tasks.filter(function(a) { return a.wer === pe.name; }).length;
          var tage = pe.arbeitstage.map(function(x, j) { return x ? WP_DAY[j] : null; }).filter(Boolean).join(' ');
          return React.createElement('div', { key: pe.id, className: 'wp-prow' },
            React.createElement('span', null, pe.name, React.createElement('small', { style: { display: 'block', fontSize: 11, color: 'var(--ink2)' } }, 'Nr. ' + (pe.pers_nr || '–') + ' · ' + pe.std_tag + ' h/Tag · ' + tage + ' = ' + wpDezh(wpSollWoche(pe)) + ' h · ' + c + ' Aufträge')),
            React.createElement('button', { className: 'wp-mini', onClick: function() { p.onEditar(pe); } }, 'Ändern'),
            React.createElement('button', { className: 'wp-mini', style: { color: '#BE2318', borderColor: '#BE2318' }, onClick: function() { p.onApagar(pe); } }, 'Löschen')
          );
        })
      ),
      React.createElement('div', { style: { textAlign: 'center', marginTop: 10 } }, React.createElement('button', { className: 'wp-mini', onClick: p.onNovo }, '+ Mitarbeiter')),
      React.createElement('div', { className: 'wp-acts' }, React.createElement('button', { className: 'wp-go', onClick: p.onFechar }, 'Fertig'))
    )
  );
}
function WpPersonModal(p) {
  var e = p.draft;
  return React.createElement('div', { className: 'wp-ov', onClick: function(ev) { if (ev.target === ev.currentTarget) p.onCancelar(); } },
    React.createElement('div', { className: 'wp-sheet', onClick: function(ev) { ev.stopPropagation(); } },
      React.createElement('h2', null, e.id ? 'Mitarbeiter ändern' : 'Neuer Mitarbeiter'),
      React.createElement('div', { className: 'wp-two' },
        React.createElement('div', null, React.createElement('label', { htmlFor: 'wpFN' }, 'Name'), React.createElement('input', { id: 'wpFN', type: 'text', autoComplete: 'off', value: e.name || '', placeholder: 'Sandro', onChange: function(ev) { p.onChange('name', ev.target.value); } })),
        React.createElement('div', null, React.createElement('label', { htmlFor: 'wpFNum' }, 'Pers.Nr.'), React.createElement('input', { id: 'wpFNum', type: 'text', autoComplete: 'off', value: e.pers_nr || '', placeholder: '742', onChange: function(ev) { p.onChange('pers_nr', ev.target.value); } }))
      ),
      React.createElement('label', { htmlFor: 'wpFTag' }, 'Stunden pro Arbeitstag'),
      React.createElement('input', { id: 'wpFTag', type: 'number', step: '0.1', value: e.std_tag != null ? e.std_tag : 8.6, onChange: function(ev) { p.onChange('std_tag', parseFloat(ev.target.value) || 0); } }),
      React.createElement('label', null, 'Arbeitstage'),
      React.createElement('div', { className: 'wp-prios' }, WP_DAY.map(function(dn, i) {
        var on = !!e.arbeitstage[i];
        return React.createElement('button', { key: i, className: 'wp-pb', onClick: function() { p.onToggleDia(i); }, style: { borderColor: on ? 'var(--ink)' : 'var(--line)', background: on ? 'var(--card2)' : 'var(--card)', color: on ? 'var(--ink)' : 'var(--ink3)' } }, dn);
      })),
      React.createElement('div', { style: { fontSize: 11.5, color: 'var(--ink2)', marginTop: 6 } }, 'Wochensoll: ', React.createElement('b', null, wpDezh(wpSollWoche({ std_tag: e.std_tag || 8.6, arbeitstage: e.arbeitstage })), ' h'), ' · freie Tage erscheinen automatisch als Frei'),
      p.erro && React.createElement('div', { className: 'wp-errmsg' }, p.erro),
      React.createElement('div', { className: 'wp-acts' },
        React.createElement('button', { onClick: p.onCancelar }, 'Abbrechen'),
        React.createElement('button', { className: 'wp-go', onClick: p.onGuardar, disabled: p.guardando }, p.guardando ? 'A guardar…' : 'Speichern')
      )
    )
  );
}

// ── Modal: Tagesbilanz (nota de fim de dia) ───────────────────
function WpNoteModal(p) {
  return React.createElement('div', { className: 'wp-ov', onClick: function(e) { if (e.target === e.currentTarget) p.onFechar(); } },
    React.createElement('div', { className: 'wp-sheet', onClick: function(e) { e.stopPropagation(); } },
      React.createElement('h2', null, 'Tagesbilanz ' + wpFmt(wpMk(p.datum))),
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 11, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 8, padding: 11 } },
        React.createElement('button', {
          className: 'wp-mic' + (p.gravando ? ' wp-recon' : p.recordedUrl ? ' wp-play' : ''),
          onClick: p.onToggleGravar, 'aria-label': 'aufnehmen'
        }, React.createElement('i', null)),
        React.createElement('div', { style: { flex: 1 } },
          React.createElement('div', { style: { fontSize: 13.5, fontWeight: 600 } }, p.gravando ? 'Läuft…' : p.recordedUrl ? 'Aufnahme ' + p.recordedDurStr : 'Aufnehmen'),
          React.createElement('div', { style: { fontSize: 11.5, color: 'var(--ink2)' } }, p.gravando ? 'nochmal tippen zum Stoppen' : p.recordedUrl ? 'tippen zum Abspielen' : 'fertig · offen · verschoben · Stunden')
        )
      ),
      React.createElement('label', { htmlFor: 'wpFN2' }, 'Notiz'),
      React.createElement('textarea', { id: 'wpFN2', autoComplete: 'off', placeholder: 'Hauserstrasse 21 nicht gemacht, Material fehlt…', value: p.texto, onChange: function(e) { p.onTexto(e.target.value); } }),
      p.erro && React.createElement('div', { className: 'wp-errmsg' }, p.erro),
      React.createElement('div', { className: 'wp-acts' },
        p.temNota && React.createElement('button', { className: 'wp-del', onClick: p.onApagar, 'aria-label': 'apagar' }, '🗑'),
        React.createElement('button', { onClick: p.onFechar }, 'Abbrechen'),
        React.createElement('button', { className: 'wp-go', onClick: p.onGuardar, disabled: p.guardando }, p.guardando ? 'A guardar…' : 'Speichern')
      )
    )
  );
}

// ── Impressão (JSX, nunca strings de HTML cru) ─────────────────
function wpKopfZeile(titulo, cur, seite2, who, leute, diaIso) {
  var c = wpMk(cur), m = wpMon(c);
  var pessoa = (who && who !== 'alle') ? (leute || []).filter(function(pe) { return pe.name === who; })[0] : null;
  var d = diaIso ? wpMk(diaIso) : null;
  var tituloLinha = d ? (titulo + ' ' + WP_LONG[WP_DAY[wpDi(d)]] + ' ' + wpFmt(d) + c.getUTCFullYear()) : (titulo + ' KW ' + wpKw(c));
  return React.createElement('div', { className: 'wp-ph' },
    React.createElement('div', null,
      React.createElement('span', { className: 'wp-lg' }), React.createElement('b', null, tituloLinha),
      !d && React.createElement(React.Fragment, null, React.createElement('br'),
        React.createElement('span', { style: { fontSize: '8.5pt' } }, wpFmt(m) + '–' + wpFmt(wpAddD(m, 6)) + c.getUTCFullYear()))
    ),
    React.createElement('div', { style: { textAlign: 'right', fontSize: '8.5pt' } },
      seite2 && React.createElement('div', null, seite2),
      React.createElement('div', null, 'Mitarbeiter: ', React.createElement('b', null, who && who !== 'alle' ? who : 'Alle')),
      React.createElement('div', null, 'Pers.Nr.: ', pessoa ? (pessoa.pers_nr || '–') : '–'),
      React.createElement('div', null, 'Projekt: ', React.createElement('span', { style: { display: 'inline-block', width: 90, borderBottom: '.5pt solid #000' } }))
    )
  );
}
function wpPrintNotizen() {
  return React.createElement('div', { className: 'wp-notiz' },
    React.createElement('div', { className: 'wp-pd' }, 'Notizen'),
    React.createElement('div', { className: 'wp-notlines' })
  );
}
function WpPrintPlan(p) {
  var W = wpWeekDays(p.cur), m = wpMon(wpMk(p.cur));
  var linhas = p.leute.filter(function(pe) { return p.who === 'alle' || pe.name === p.who; }).map(function(pe) { return pe.name; });
  if (p.who === 'alle') linhas.push('');
  var sp = wpSpaet(p.tasks, wpTodayIso(), p.who);
  var dr = wpPoolL(p.tasks, p.who, true);
  return React.createElement('div', { className: 'wp-pagina', style: { minHeight: ((p.orient === 'landscape' ? 210 : 297) - 20) + 'mm' } },
    wpKopfZeile('Wochenplan', p.cur, p.seite, p.who, p.leute),
    React.createElement('table', { className: 'wp-pt2' },
      React.createElement('thead', null, React.createElement('tr', null,
        React.createElement('th', { className: 'wp-w' }, 'Mitarbeiter'),
        W.map(function(k, i) { return React.createElement('th', { key: k }, WP_DAY[i] + ' ' + wpFmt(wpAddD(m, i))); }),
        React.createElement('th', { style: { width: 44 } }, 'Std')
      )),
      React.createElement('tbody', null, linhas.map(function(nm) {
        var wk = 0;
        var cols = W.map(function(k) {
          var L = p.tasks.filter(function(a) { return a.datum === k && a.wer === nm; }).sort(function(x, y) { return x.von < y.von ? -1 : 1; });
          var st = nm ? wpStatOf(p.tagRows, p.leute, k, p.who, nm) : null;
          var s = 0; L.forEach(function(a) { s += wpDur(a); }); wk += s;
          return React.createElement('td', { key: k },
            st && React.createElement('b', null, WP_DST[st][0]),
            L.map(function(a) {
              return React.createElement('div', { key: a.id, className: 'wp-pj' }, React.createElement('b', null, a.von + '–' + a.bis), (a.status === 'erledigt' ? '☒ ' : a.status === 'laeuft' ? '◐ ' : a.status === 'gebaut_nio' ? '⚠ ' : '☐ ') + a.titel + (a.auftrag_nr ? ' ' : ''), a.auftrag_nr && React.createElement('b', null, a.auftrag_nr));
            })
          );
        });
        return React.createElement('tr', { key: nm || '_' }, React.createElement('td', { className: 'wp-w' }, nm || 'ohne Name'), cols, React.createElement('td', { style: { textAlign: 'right' } }, React.createElement('b', null, wpDez(wk))));
      }))
    ),
    sp.length > 0 && React.createElement('div', { className: 'wp-pd' }, 'Nicht erledigt — Übertrag'),
    sp.map(function(a) {
      return React.createElement('div', { key: 'sp' + a.id, className: 'wp-pl' }, React.createElement('span', { className: 'wp-b' }, '☐'), React.createElement('span', { className: 'wp-t' }, WP_DAY[wpDi(wpMk(a.datum))] + ' ' + wpFmt(wpMk(a.datum))), React.createElement('span', { style: { flex: 1 } }, a.titel + ' · ' + a.arbeit + (a.auftrag_nr ? ' · ' + a.auftrag_nr : '')), React.createElement('span', { className: 'wp-n' }, a.wer || ''));
    }),
    dr.length > 0 && React.createElement('div', { className: 'wp-pd' }, 'Dringend · kein Datum'),
    dr.map(function(a) {
      return React.createElement('div', { key: 'dr' + a.id, className: 'wp-pl' }, React.createElement('span', { className: 'wp-b' }, '☐'), React.createElement('span', { className: 'wp-t' }), React.createElement('span', { style: { flex: 1 } }, a.titel + ' · ' + a.arbeit + (a.auftrag_nr ? ' · ' + a.auftrag_nr : '')), React.createElement('span', { className: 'wp-n' }, a.wer || ''));
    }),
    wpPrintNotizen(),
    React.createElement('div', { className: 'wp-sig' }, React.createElement('div', null, 'Erstellt / Datum'), React.createElement('div', null, 'Bauleiter'), React.createElement('div', null, 'Kenntnisnahme Monteur'))
  );
}
function WpPrintUebersicht(p) {
  var W = wpWeekTasks(p.tasks, p.cur, p.who), days = wpWeekDays(p.cur);
  var plan = 0, ist = 0;
  W.forEach(function(a) { plan += wpDur(a); if (a.status === 'erledigt') ist += wpDur(a); });
  return React.createElement('div', { className: 'wp-pagina', style: { minHeight: ((p.orient === 'landscape' ? 210 : 297) - 20) + 'mm' } },
    wpKopfZeile('Wochenübersicht', p.cur, p.seite, p.who, p.leute),
    React.createElement('div', { className: 'wp-sum' },
      React.createElement('span', null, React.createElement('b', null, 'Aufträge:'), ' ' + W.length),
      React.createElement('span', null, React.createElement('b', null, 'Erledigt:'), ' ' + W.filter(function(a) { return a.status === 'erledigt'; }).length),
      React.createElement('span', null, React.createElement('b', null, 'Geplant:'), ' ' + wpDez(plan) + ' h'),
      React.createElement('span', null, React.createElement('b', null, 'Geleistet:'), ' ' + wpDez(ist) + ' h'),
      React.createElement('span', null, React.createElement('b', null, 'Rückstand:'), ' ' + wpSpaet(p.tasks, wpTodayIso(), p.who).length)
    ),
    React.createElement('table', { className: 'wp-pt2', style: { marginTop: 8 } },
      React.createElement('thead', null, React.createElement('tr', null, React.createElement('th', { className: 'wp-w' }, 'Mitarbeiter'), React.createElement('th', null, 'Soll'), React.createElement('th', null, 'Geplant'), React.createElement('th', null, 'Geleistet'), React.createElement('th', null, 'Auslastung'), React.createElement('th', null, 'Offen'))),
      React.createElement('tbody', null, p.leute.filter(function(pe) { return p.who === 'alle' || pe.name === p.who; }).map(function(pe) {
        var L = W.filter(function(a) { return a.wer === pe.name; });
        var pl = 0, is = 0; L.forEach(function(a) { pl += wpDur(a); if (a.status === 'erledigt') is += wpDur(a); });
        var sw = wpSollWoche(pe);
        return React.createElement('tr', { key: pe.id }, React.createElement('td', { className: 'wp-w' }, pe.name), React.createElement('td', null, wpDezh(sw) + ' h'), React.createElement('td', null, wpDez(pl) + ' h'), React.createElement('td', null, wpDez(is) + ' h'), React.createElement('td', null, (sw ? Math.round(pl / (sw * 60) * 100) : 0) + '%'), React.createElement('td', null, L.filter(function(a) { return a.status !== 'erledigt'; }).length));
      }))
    ),
    days.map(function(k, i) {
      var L = wpByDay(p.tasks, k, p.who), st = wpStatOf(p.tagRows, p.leute, k, p.who), notas = wpNotasDoDia(p.tagRows, k, p.who);
      if (!L.length && !st && !notas.length) return null;
      var s = 0; L.forEach(function(a) { if (a.status === 'erledigt') s += wpDur(a); });
      return React.createElement('div', { key: k },
        React.createElement('div', { className: 'wp-pd' }, WP_LONG[WP_DAY[i]] + ' ' + wpFmt(wpMk(k)) + (st ? ' — ' + WP_DST[st][0] : '') + ' · ' + wpDez(s) + ' h geleistet'),
        L.map(function(a) {
          return React.createElement('div', { key: a.id, className: 'wp-pl' }, React.createElement('span', { className: 'wp-b' }, a.status === 'erledigt' ? '☒' : a.status === 'laeuft' ? '◐' : a.status === 'gebaut_nio' ? '⚠' : '☐'), React.createElement('span', { className: 'wp-t' }, a.von + '–' + a.bis), React.createElement('span', { style: { flex: 1 } }, a.titel + ' · ' + a.arbeit + (a.auftrag_nr ? ' · ' + a.auftrag_nr : '')), React.createElement('span', { className: 'wp-n' }, a.wer || ''));
        }),
        notas.map(function(r) {
          return React.createElement('div', { key: 'n' + r.wer, style: { fontSize: '8pt', padding: '3px 0 0 20px' } }, React.createElement('i', null, 'Notiz' + (p.who === 'alle' ? ' (' + r.wer + ')' : '') + ': ' + r.notiz));
        })
      );
    }),
    wpPrintNotizen(),
    React.createElement('div', { className: 'wp-sig' }, React.createElement('div', null, 'Datum / Unterschrift'), React.createElement('div', null, 'Bauleiter'))
  );
}
function WpPrintListe(p) {
  var nurTag = p.mode === 'tag';
  var tage = nurTag ? [p.cur] : wpWeekDays(p.cur);
  var sp = wpSpaet(p.tasks, wpTodayIso(), p.who);
  var dr = wpPoolL(p.tasks, p.who, true);
  return React.createElement('div', { className: 'wp-pagina', style: { minHeight: ((p.orient === 'landscape' ? 210 : 297) - 20) + 'mm' } },
    wpKopfZeile(nurTag ? 'Tagesplan' : 'Wochenliste', p.cur, null, p.who, p.leute, nurTag ? p.cur : null),
    tage.map(function(k) {
      var L = wpByDay(p.tasks, k, p.who), st = wpStatOf(p.tagRows, p.leute, k, p.who), notas = wpNotasDoDia(p.tagRows, k, p.who), d = wpMk(k);
      if (!L.length && !st && !notas.length) return null;
      var g = 0; L.forEach(function(a) { if (a.status === 'erledigt') g += wpDur(a); });
      return React.createElement('div', { key: k },
        React.createElement('div', { className: 'wp-pd' }, WP_LONG[WP_DAY[wpDi(d)]] + ' ' + wpFmt(d) + (st ? ' — ' + WP_DST[st][0] : '') + (g ? ' · ' + wpDez(g) + ' h' : '')),
        L.map(function(a) {
          return React.createElement('div', { key: a.id, className: 'wp-pl' }, React.createElement('span', { className: 'wp-b' }, a.status === 'erledigt' ? '☒' : a.status === 'laeuft' ? '◐' : a.status === 'gebaut_nio' ? '⚠' : '☐'), React.createElement('span', { className: 'wp-t' }, a.von + '–' + a.bis), React.createElement('span', { style: { flex: 1 } }, a.titel + ' · ' + a.arbeit + (a.auftrag_nr ? ' · ' + a.auftrag_nr : '')), React.createElement('span', { className: 'wp-n' }, a.wer || ''));
        }),
        notas.map(function(r) {
          return React.createElement('div', { key: 'n' + r.wer, style: { fontSize: '8pt', padding: '3px 0 0 20px' } }, (p.who === 'alle' ? r.wer + ': ' : '') + r.notiz);
        })
      );
    }),
    sp.length > 0 && React.createElement('div', { className: 'wp-pd' }, 'Nicht erledigt'),
    sp.map(function(a) {
      return React.createElement('div', { key: 'sp' + a.id, className: 'wp-pl' }, React.createElement('span', { className: 'wp-b' }, '☐'), React.createElement('span', { className: 'wp-t' }, WP_DAY[wpDi(wpMk(a.datum))] + ' ' + wpFmt(wpMk(a.datum))), React.createElement('span', { style: { flex: 1 } }, a.titel + ' · ' + a.arbeit), React.createElement('span', { className: 'wp-n' }, a.wer || ''));
    }),
    dr.length > 0 && React.createElement('div', { className: 'wp-pd' }, 'Dringend · kein Datum'),
    dr.map(function(a) {
      return React.createElement('div', { key: 'dr' + a.id, className: 'wp-pl' }, React.createElement('span', { className: 'wp-b' }, '☐'), React.createElement('span', { className: 'wp-t' }), React.createElement('span', { style: { flex: 1 } }, a.titel + ' · ' + a.arbeit), React.createElement('span', { className: 'wp-n' }, a.wer || ''));
    }),
    wpPrintNotizen(),
    React.createElement('div', { className: 'wp-sig' }, React.createElement('div', null, 'Datum / Unterschrift'))
  );
}
function WpPrintArea(p) {
  var tipo = p.printJob;
  var orient = (tipo === 'plan' || tipo === 'beide') ? 'landscape' : 'portrait';
  var pageCss = tipo ? ('@media print{@page{size:A4 ' + orient + ';margin:10mm}}') : '';
  return React.createElement(React.Fragment, null,
    React.createElement('style', null, pageCss),
    React.createElement('div', { id: 'wp-printArea', ref: p.areaRef },
      React.createElement('div', { id: 'wp-printInner', ref: p.innerRef },
        tipo === 'plan' && React.createElement(WpPrintPlan, { tasks: p.tasks, leute: p.leute, tagRows: p.tagRows, cur: p.cur, who: p.who, orient: orient }),
        tipo === 'bericht' && React.createElement(WpPrintUebersicht, { tasks: p.tasks, leute: p.leute, tagRows: p.tagRows, cur: p.cur, who: p.who, orient: orient }),
        (tipo === 'tag' || tipo === 'woche') && React.createElement(WpPrintListe, { tasks: p.tasks, leute: p.leute, tagRows: p.tagRows, cur: p.cur, who: p.who, mode: tipo, orient: orient }),
        tipo === 'beide' && React.createElement(React.Fragment, null,
          React.createElement(WpPrintPlan, { tasks: p.tasks, leute: p.leute, tagRows: p.tagRows, cur: p.cur, who: p.who, seite: '1 von 2', orient: orient }),
          React.createElement('div', { className: 'wp-pfoot' }, 'Rückseite: Wochenübersicht'),
          React.createElement('div', { className: 'wp-pbreak' }),
          React.createElement(WpPrintUebersicht, { tasks: p.tasks, leute: p.leute, tagRows: p.tagRows, cur: p.cur, who: p.who, seite: '2 von 2', orient: orient })
        )
      )
    )
  );
}
var WP_VORSCHAU_ABAS = {
  bauleiter: [['plan', 'Wochenplan A4'], ['bericht', 'Wochenübersicht A4'], ['beide', 'Beidseitig']],
  monteur: [['tag', 'Tagesplan'], ['woche', 'Wochenliste']]
};
function WpVorschau(p) {
  var tipo = p.tipo;
  if (!tipo) return null;
  var orient = (tipo === 'plan' || tipo === 'beide') ? 'landscape' : 'portrait';
  var abas = WP_VORSCHAU_ABAS[p.rolle === 'bauleiter' ? 'bauleiter' : 'monteur'];
  return React.createElement('div', { className: 'wp-vorschau' },
    React.createElement('div', { className: 'wp-vorschau-top wp-noprint' },
      React.createElement('button', { className: 'wp-mini', onClick: p.onZurueck }, '← Zurück'),
      React.createElement('button', { className: 'wp-mini wp-vorschau-drucken', onClick: p.onDrucken }, '🖨️ Drucken')
    ),
    React.createElement('div', { className: 'wp-vorschau-tabs wp-noprint' },
      abas.map(function(a) {
        return React.createElement('button', {
          key: a[0], className: 'wp-chip' + (tipo === a[0] ? ' wp-on' : ''),
          onClick: function() { p.onAba(a[0]); }
        }, a[1]);
      })
    ),
    React.createElement('div', { className: 'wp-vorschau-wrap', ref: p.wrapRef },
      React.createElement('div', {
        className: 'wp-vorschau-inner', ref: p.innerRef,
        style: { width: ((orient === 'landscape' ? 297 : 210) - 20) + 'mm' }
      },
        tipo === 'plan' && React.createElement(WpPrintPlan, { tasks: p.tasks, leute: p.leute, tagRows: p.tagRows, cur: p.cur, who: p.who, orient: orient }),
        tipo === 'bericht' && React.createElement(WpPrintUebersicht, { tasks: p.tasks, leute: p.leute, tagRows: p.tagRows, cur: p.cur, who: p.who, orient: orient }),
        (tipo === 'tag' || tipo === 'woche') && React.createElement(WpPrintListe, { tasks: p.tasks, leute: p.leute, tagRows: p.tagRows, cur: p.cur, who: p.who, mode: tipo, orient: orient }),
        tipo === 'beide' && React.createElement(React.Fragment, null,
          React.createElement(WpPrintPlan, { tasks: p.tasks, leute: p.leute, tagRows: p.tagRows, cur: p.cur, who: p.who, seite: '1 von 2', orient: orient }),
          React.createElement('div', { className: 'wp-pfoot' }, 'Rückseite: Wochenübersicht'),
          React.createElement('div', { className: 'wp-pbreak' }),
          React.createElement(WpPrintUebersicht, { tasks: p.tasks, leute: p.leute, tagRows: p.tagRows, cur: p.cur, who: p.who, seite: '2 von 2', orient: orient })
        )
      )
    )
  );
}
function wpFitA4(innerEl, areaEl, orient, paginas) {
  if (!innerEl || !areaEl) return;
  var wmm = (orient === 'landscape' ? 297 : 210) - 20;
  var hmm = (orient === 'landscape' ? 210 : 297) - 20;
  // #wp-printArea tem display:none fora do ecrã de impressão — sem isto o
  // scrollHeight medido a seguir seria sempre 0 e a escala nunca entraria em ação.
  areaEl.style.cssText = 'display:block;position:absolute;left:-10000px;top:0';
  innerEl.style.transform = 'none';
  innerEl.style.width = (wmm * WP_MM) + 'px';
  var nutz = hmm * WP_MM * (paginas || 1) - 6;
  var alto = innerEl.scrollHeight;
  var f = alto > nutz ? nutz / alto : 1;
  if (f < 0.62) f = 0.62;
  if (f > 1) f = 1;
  if (f < 1) { innerEl.style.width = (wmm * WP_MM / f) + 'px'; innerEl.style.transform = 'scale(' + f.toFixed(3) + ')'; }
  areaEl.style.cssText = '';
}
function wpCsvExport(tasks, cur, who) {
  var linhas = [['Datum', 'Von', 'Bis', 'Std', 'Einsatzort', 'Arbeit', 'AuftragsNr', 'Kunde', 'Prio', 'Mitarbeiter', 'Status']];
  wpWeekTasks(tasks, cur, who).sort(function(a, b) { return a.datum < b.datum ? -1 : a.datum > b.datum ? 1 : (a.von < b.von ? -1 : 1); }).forEach(function(a) {
    linhas.push([a.datum, a.von, a.bis, wpDez(wpDur(a)), a.titel, a.arbeit, a.auftrag_nr, a.kunde, a.prio + ' ' + WP_PRIO[a.prio].n, a.wer, a.status]);
  });
  var txt = '﻿' + linhas.map(function(r) { return r.map(function(x) { return '"' + String(x == null ? '' : x).replace(/"/g, '""') + '"'; }).join(';'); }).join('\n');
  var u = URL.createObjectURL(new Blob([txt], { type: 'text/csv' }));
  var a = document.createElement('a');
  a.href = u; a.download = 'Wochenplan_KW' + wpKw(wpMk(cur)) + '.csv'; a.click();
  setTimeout(function() { URL.revokeObjectURL(u); }, 2000);
}

// ── App principal (todo o estado aqui) ────────────────────────
function WochenplanApp(props) {
  var onBack = props.onBack;
  var db = window.supabaseClient;

  var _s1 = React.useState(true); var loading = _s1[0], setLoading = _s1[1];
  var _s2 = React.useState(null); var erro = _s2[0], setErro = _s2[1];
  var _s3 = React.useState([]); var leute = _s3[0], setLeute = _s3[1];
  var _s4 = React.useState([]); var tasks = _s4[0], setTasks = _s4[1];
  var _s5 = React.useState([]); var tagRows = _s5[0], setTagRows = _s5[1];

  var _s6 = React.useState('monteur'); var rolle = _s6[0], setRolleState = _s6[1];
  var _s7 = React.useState('tag'); var mode = _s7[0], setMode = _s7[1];
  var _s8 = React.useState(function() { return wpLoadLayout(); }); var wl = _s8[0], setWl = _s8[1];
  var _s9 = React.useState('alle'); var who = _s9[0], setWho = _s9[1];
  var _s10 = React.useState(function() { return wpTodayIso(); }); var cur = _s10[0], setCur = _s10[1];
  var _s11 = React.useState(function() { return wpLoadLunch(); }); var lunch = _s11[0], setLunch = _s11[1];
  var whoInicializado = React.useRef(false);

  var _s12 = React.useState(null); var editTaskId = _s12[0], setEditTaskId = _s12[1];
  var _s13 = React.useState(null); var editTaskDraft = _s13[0], setEditTaskDraft = _s13[1];
  var _s14 = React.useState(''); var editTaskErro = _s14[0], setEditTaskErro = _s14[1];
  var _s15 = React.useState(false); var guardandoTask = _s15[0], setGuardandoTask = _s15[1];

  var _s16 = React.useState(false); var teamModalAberto = _s16[0], setTeamModalAberto = _s16[1];
  var _s17 = React.useState(null); var editPerson = _s17[0], setEditPerson = _s17[1];
  var _s18 = React.useState(''); var editPersonErro = _s18[0], setEditPersonErro = _s18[1];
  var _s19 = React.useState(false); var guardandoPerson = _s19[0], setGuardandoPerson = _s19[1];

  var _s20 = React.useState(null); var notaAberta = _s20[0], setNotaAberta = _s20[1]; // { datum, wer }
  var _s21 = React.useState(''); var notaTexto = _s21[0], setNotaTexto = _s21[1];
  var _s22 = React.useState(false); var notaGravando = _s22[0], setNotaGravando = _s22[1];
  var _s23 = React.useState(''); var notaRecordedUrl = _s23[0], setNotaRecordedUrl = _s23[1];
  var _s24 = React.useState(''); var notaRecordedDurStr = _s24[0], setNotaRecordedDurStr = _s24[1];
  var _s25 = React.useState(false); var guardandoNota = _s25[0], setGuardandoNota = _s25[1];
  var notaMediaRef = React.useRef(null);
  var notaChunksRef = React.useRef([]);
  var notaStreamRef = React.useRef(null);
  var notaStartRef = React.useRef(0);
  var notaBlobRef = React.useRef(null);

  var _s26 = React.useState(null); var printJob = _s26[0], setPrintJob = _s26[1];
  var printInnerRef = React.useRef(null);
  var printAreaRef = React.useRef(null);
  var _s28 = React.useState(null); var previewJob = _s28[0], setPreviewJob = _s28[1];
  var vorschauWrapRef = React.useRef(null);
  var vorschauInnerRef = React.useRef(null);

  var _s27 = React.useState(0); var agoraTick = _s27[0], setAgoraTick = _s27[1];

  function carregar() {
    if (!db) { setLoading(false); setErro('Sem ligação à base de dados.'); return; }
    setLoading(true);
    Promise.all([
      db.from('wplan_leute').select('*').order('name', { ascending: true }),
      db.from('wplan_tasks').select('*'),
      db.from('wplan_tag').select('*')
    ]).then(function(res) {
      var lRes = res[0], tRes = res[1], gRes = res[2];
      if (lRes.error) { setErro('Falha ao carregar equipa: ' + lRes.error.message); setLoading(false); return; }
      if (tRes.error) { setErro('Falha ao carregar tarefas: ' + tRes.error.message); setLoading(false); return; }
      if (gRes.error) { setErro('Falha ao carregar estados do dia: ' + gRes.error.message); setLoading(false); return; }
      setLeute((lRes.data || []).filter(function(p) { return p.aktiv !== false; }));
      setTasks((tRes.data || []).map(wpNormalizarTarefa));
      setTagRows(gRes.data || []);
      setLoading(false);
    }).catch(function(e) {
      setErro('Falha ao carregar: ' + (e && e.message ? e.message : e));
      setLoading(false);
    });
  }
  React.useEffect(function() { carregar(); }, []);

  // Perfil "Monteur" arranca já com o próprio nome escolhido
  React.useEffect(function() {
    if (whoInicializado.current) return;
    if (!leute.length) return;
    whoInicializado.current = true;
    if (rolle === 'monteur') setWho(leute[0].name);
  }, [leute]);

  // Tick de minuto (banner de balanço semanal)
  React.useEffect(function() {
    var t = setInterval(function() { setAgoraTick(function(x) { return x + 1; }); }, 60000);
    return function() { clearInterval(t); };
  }, []);

  function setRolle(r) {
    setRolleState(r);
    setMode(r === 'bauleiter' ? 'team' : 'tag');
    if (r === 'monteur' && who === 'alle' && leute.length) setWho(leute[0].name);
  }

  // ── Tarefas ──
  function abrirNovaTarefa(pre) {
    var ultimo = wpLoadUltimoTrabalho();
    setEditTaskId(null);
    setEditTaskErro('');
    setEditTaskDraft(Object.assign({ datum: cur, von: '07:00', bis: '12:00', titel: '', arbeit: ultimo.arbeit, auftrag_nr: '', kunde: ultimo.kunde, prio: 2, wer: who === 'alle' ? '' : who, status: 'offen', bemerkungen: '' }, pre || {}));
  }
  function abrirTarefa(id) {
    var t = tasks.find(function(x) { return x.id === id; });
    if (!t) return;
    setEditTaskId(id);
    setEditTaskErro('');
    setEditTaskDraft(Object.assign({}, t, { bemerkungen: t.bemerkungen || '' }));
  }
  function mudarCampoTarefa(campo, valor) {
    setEditTaskDraft(function(prev) { return Object.assign({}, prev, (function() { var o = {}; o[campo] = valor; return o; })()); });
  }
  function mudarSemData(semData) {
    setEditTaskDraft(function(prev) {
      return semData ? Object.assign({}, prev, { datum: null, von: '', bis: '' }) : Object.assign({}, prev, { datum: cur, von: prev.von || '07:00', bis: prev.bis || '12:00' });
    });
  }
  function fecharTarefa() { setEditTaskId(null); setEditTaskDraft(null); setEditTaskErro(''); }
  function guardarTarefa() {
    var d = editTaskDraft;
    var titel = (d.titel || '').trim();
    if (!titel) { setEditTaskErro('Einsatzort fehlt.'); return; }
    if (d.datum && d.bis <= d.von) { setEditTaskErro('Bis muss nach Von liegen.'); return; }
    if (d.datum && d.wer) {
      var conflito = tasks.find(function(x) { return x.id !== editTaskId && x.datum === d.datum && x.wer === d.wer && x.von < d.bis && x.bis > d.von; });
      if (conflito && !confirm(d.wer + ' ist ' + conflito.von + '–' + conflito.bis + ' schon auf ' + conflito.titel + '. Trotzdem sichern?')) return;
    }
    var payload = { datum: d.datum || null, von: d.datum ? d.von : '', bis: d.datum ? d.bis : '', titel: titel, arbeit: (d.arbeit || '').trim(), auftrag_nr: (d.auftrag_nr || '').trim(), kunde: (d.kunde || '').trim(), prio: d.prio, wer: d.wer || null, status: d.status || 'offen', bemerkungen: (d.bemerkungen || '').trim() };
    setGuardandoTask(true);
    setEditTaskErro('');
    var chain = editTaskId
      ? db.from('wplan_tasks').update(Object.assign({}, payload, { updated_at: new Date().toISOString() })).eq('id', editTaskId).select()
      : db.from('wplan_tasks').insert(payload).select();
    chain.then(function(res) {
      if (res.error) throw res.error;
      var linha = wpNormalizarTarefa((res.data && res.data[0]) || Object.assign({ id: 'tmp-' + Date.now() }, payload));
      setTasks(function(prev) { return editTaskId ? prev.map(function(x) { return x.id === editTaskId ? linha : x; }) : prev.concat([linha]); });
      wpSaveUltimoTrabalho(payload.arbeit, payload.kunde);
      setGuardandoTask(false);
      fecharTarefa();
    }).catch(function(e) {
      setGuardandoTask(false);
      setEditTaskErro('Falha ao guardar: ' + (e && e.message ? e.message : e));
    });
  }
  function apagarTarefa() {
    if (!confirm('Auftrag löschen?')) return;
    var id = editTaskId;
    db.from('wplan_tasks').delete().eq('id', id).then(function(res) {
      if (res.error) throw res.error;
      setTasks(function(prev) { return prev.filter(function(x) { return x.id !== id; }); });
      fecharTarefa();
    }).catch(function(e) { setEditTaskErro('Falha ao apagar: ' + (e && e.message ? e.message : e)); });
  }

  // ── Equipa ──
  function abrirNovoPersonagem() { setEditPersonErro(''); setEditPerson({ id: null, name: '', pers_nr: '', std_tag: 8.6, arbeitstage: [1, 1, 1, 1, 0, 0, 0] }); }
  function abrirEditarPersonagem(pe) { setEditPersonErro(''); setEditPerson(Object.assign({}, pe)); }
  function mudarCampoPerson(campo, valor) { setEditPerson(function(prev) { var o = Object.assign({}, prev); o[campo] = valor; return o; }); }
  function alternarDiaPerson(i) { setEditPerson(function(prev) { var t = prev.arbeitstage.slice(); t[i] = t[i] ? 0 : 1; return Object.assign({}, prev, { arbeitstage: t }); }); }
  function cancelarPerson() { setEditPerson(null); setEditPersonErro(''); }
  function guardarPerson() {
    var e = editPerson;
    var nome = (e.name || '').trim();
    if (!nome) { setEditPersonErro('Name eingeben.'); return; }
    if (leute.some(function(p) { return p.name === nome && p.id !== e.id; })) { setEditPersonErro('Name gibt es schon.'); return; }
    if (!(e.std_tag > 0)) { setEditPersonErro('Stunden pro Tag eingeben.'); return; }
    if (!e.arbeitstage.some(function(x) { return x; })) { setEditPersonErro('Mindestens ein Arbeitstag.'); return; }
    setGuardandoPerson(true);
    setEditPersonErro('');
    var payload = { name: nome, pers_nr: (e.pers_nr || '').trim(), std_tag: e.std_tag, arbeitstage: e.arbeitstage, aktiv: true };
    var nomeAntigo = e.id ? (leute.find(function(p) { return p.id === e.id; }) || {}).name : null;
    var chain = e.id ? db.from('wplan_leute').update(payload).eq('id', e.id).select() : db.from('wplan_leute').insert(payload).select();
    chain.then(function(res) {
      if (res.error) throw res.error;
      var linha = (res.data && res.data[0]) || Object.assign({ id: 'tmp-' + Date.now() }, payload);
      setLeute(function(prev) {
        var novo = e.id ? prev.map(function(p) { return p.id === e.id ? linha : p; }) : prev.concat([linha]);
        return novo.slice().sort(function(a, b) { return a.name.localeCompare(b.name); });
      });
      if (nomeAntigo && nomeAntigo !== nome) {
        setTasks(function(prev) { return prev.map(function(t) { return t.wer === nomeAntigo ? Object.assign({}, t, { wer: nome }) : t; }); });
        setTagRows(function(prev) { return prev.map(function(r) { return r.wer === nomeAntigo ? Object.assign({}, r, { wer: nome }) : r; }); });
        db.from('wplan_tag').update({ wer: nome }).eq('wer', nomeAntigo).then(function(r2) {
          if (r2.error) setErro('Pessoa renomeada, mas falhou atualizar os estados de dia antigos: ' + r2.error.message);
        });
        if (who === nomeAntigo) setWho(nome);
      }
      setGuardandoPerson(false);
      setEditPerson(null);
    }).catch(function(e2) {
      setGuardandoPerson(false);
      setEditPersonErro('Falha ao guardar: ' + (e2 && e2.message ? e2.message : e2));
    });
  }
  function apagarPersonagem(pe) {
    var c = tasks.filter(function(t) { return t.wer === pe.name; }).length;
    if (c && !confirm(pe.name + ' hat ' + c + ' Aufträge. Sie bleiben ohne Name. Löschen?')) return;
    db.from('wplan_leute').delete().eq('id', pe.id).then(function(res) {
      if (res.error) throw res.error;
      setLeute(function(prev) { return prev.filter(function(p) { return p.id !== pe.id; }); });
      setTasks(function(prev) { return prev.map(function(t) { return t.wer === pe.name ? Object.assign({}, t, { wer: null }) : t; }); });
      if (who === pe.name) setWho('alle');
    }).catch(function(e) { setErro('Falha ao apagar mitarbeiter: ' + (e && e.message ? e.message : e)); });
  }

  // ── Estado do dia (Frei/Krank/Ferien/Schule) ──
  function definirEstadoDia(datum, wer, estado) {
    if (!wer) return;
    db.from('wplan_tag').upsert({ datum: datum, wer: wer, tag_status: estado }, { onConflict: 'datum,wer' }).select().then(function(res) {
      if (res.error) throw res.error;
      var linha = (res.data && res.data[0]) || { datum: datum, wer: wer, tag_status: estado };
      setTagRows(function(prev) {
        var idx = prev.findIndex(function(r) { return r.datum === datum && r.wer === wer; });
        if (idx === -1) return prev.concat([linha]);
        var novo = prev.slice(); novo[idx] = Object.assign({}, novo[idx], linha); return novo;
      });
    }).catch(function(e) { setErro('Falha ao definir estado do dia: ' + (e && e.message ? e.message : e)); });
  }

  // ── Nota de fim de dia (Tagesbilanz) ──
  function encontrarNota(datum, wer) {
    return tagRows.find(function(r) { return r.datum === datum && r.wer === wer && (r.notiz || r.audio_url); });
  }
  function abrirNota(datum) {
    if (!who || who === 'alle') return;
    var n = encontrarNota(datum, who);
    setNotaAberta({ datum: datum, wer: who });
    setNotaTexto((n && n.notiz) || '');
    setNotaRecordedUrl(''); setNotaRecordedDurStr(''); notaBlobRef.current = null;
  }
  function fecharNota() {
    if (notaMediaRef.current && notaMediaRef.current.state === 'recording') notaMediaRef.current.stop();
    if (notaStreamRef.current) { notaStreamRef.current.getTracks().forEach(function(t) { t.stop(); }); notaStreamRef.current = null; }
    setNotaAberta(null); setNotaGravando(false); setNotaRecordedUrl(''); setNotaRecordedDurStr('');
  }
  function alternarGravacaoNota() {
    if (notaGravando) { if (notaMediaRef.current) notaMediaRef.current.stop(); return; }
    if (notaRecordedUrl) { new Audio(notaRecordedUrl).play(); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { setErro('Este browser não suporta gravação de áudio.'); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
      notaStreamRef.current = stream;
      notaChunksRef.current = [];
      var mime = (window.MediaRecorder && MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) ? 'audio/webm;codecs=opus' : 'audio/webm';
      var rec;
      try { rec = new MediaRecorder(stream, { mimeType: mime }); } catch (e) { setErro('Falha ao iniciar o gravador: ' + (e && e.message ? e.message : e)); stream.getTracks().forEach(function(t) { t.stop(); }); return; }
      rec.ondataavailable = function(e) { if (e.data && e.data.size > 0) notaChunksRef.current.push(e.data); };
      rec.onstop = function() {
        var blob = new Blob(notaChunksRef.current, { type: mime });
        var s = Math.round((Date.now() - notaStartRef.current) / 1000);
        notaBlobRef.current = blob;
        setNotaRecordedUrl(URL.createObjectURL(blob));
        setNotaRecordedDurStr(Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'));
        setNotaGravando(false);
        if (notaStreamRef.current) { notaStreamRef.current.getTracks().forEach(function(t) { t.stop(); }); notaStreamRef.current = null; }
      };
      notaMediaRef.current = rec;
      notaStartRef.current = Date.now();
      rec.start();
      setNotaGravando(true);
    }).catch(function(e) { setErro('Permissão de microfone negada ou indisponível: ' + (e && e.message ? e.message : e)); });
  }
  function guardarNota() {
    var alvo = notaAberta;
    var texto = notaTexto.trim();
    if (!texto && !notaBlobRef.current) { fecharNota(); return; }
    setGuardandoNota(true);
    var upload = notaBlobRef.current
      ? db.storage.from(WP_BUCKET).upload(alvo.wer + '/' + alvo.datum + '-' + Date.now() + '.webm', notaBlobRef.current, { contentType: 'audio/webm', upsert: false }).then(function(res) {
          if (res.error) throw res.error;
          return res.data.path;
        })
      : Promise.resolve(undefined);
    upload.then(function(path) {
      var payload = { datum: alvo.datum, wer: alvo.wer, notiz: texto || null };
      if (path !== undefined) { payload.audio_url = path; payload.dauer = notaRecordedDurStr; }
      return db.from('wplan_tag').upsert(payload, { onConflict: 'datum,wer' }).select();
    }).then(function(res) {
      if (res.error) throw res.error;
      var linha = (res.data && res.data[0]) || Object.assign({ datum: alvo.datum, wer: alvo.wer }, {});
      setTagRows(function(prev) {
        var idx = prev.findIndex(function(r) { return r.datum === alvo.datum && r.wer === alvo.wer; });
        if (idx === -1) return prev.concat([linha]);
        var novo = prev.slice(); novo[idx] = Object.assign({}, novo[idx], linha); return novo;
      });
      setGuardandoNota(false);
      fecharNota();
    }).catch(function(e) {
      setGuardandoNota(false);
      setErro('Falha ao guardar a nota: ' + (e && e.message ? e.message : e));
    });
  }
  function apagarNota() {
    var alvo = notaAberta;
    db.from('wplan_tag').update({ notiz: null, audio_url: null, dauer: null }).eq('datum', alvo.datum).eq('wer', alvo.wer).then(function(res) {
      if (res.error) throw res.error;
      setTagRows(function(prev) { return prev.map(function(r) { return (r.datum === alvo.datum && r.wer === alvo.wer) ? Object.assign({}, r, { notiz: null, audio_url: null, dauer: null }) : r; }); });
      fecharNota();
    }).catch(function(e) { setErro('Falha ao apagar a nota: ' + (e && e.message ? e.message : e)); });
  }
  function tocarNota(datum, wer) {
    var n = encontrarNota(datum, wer);
    if (!n || !n.audio_url) { alert('Keine Audiodatei — nur Notiz.'); return; }
    db.storage.from(WP_BUCKET).createSignedUrl(n.audio_url, 3600).then(function(res) {
      if (res.error) throw res.error;
      new Audio(res.data.signedUrl).play();
    }).catch(function(e) { setErro('Falha ao reproduzir: ' + (e && e.message ? e.message : e)); });
  }

  // ── Impressão ──
  function acionarImpressao(tipo) { setPrintJob(tipo); }
  React.useEffect(function() {
    if (!printJob) return;
    var id = requestAnimationFrame(function() {
      var orient = (printJob === 'plan' || printJob === 'beide') ? 'landscape' : 'portrait';
      var paginas = printJob === 'beide' ? 2 : 1;
      wpFitA4(printInnerRef.current, printAreaRef.current, orient, paginas);
      window.print();
      setTimeout(function() {
        if (printInnerRef.current) { printInnerRef.current.style.transform = 'none'; printInnerRef.current.style.width = ''; }
        setPrintJob(null);
      }, 400);
    });
    return function() { cancelAnimationFrame(id); };
  }, [printJob]);

  // ── Vorschau (pré-visualização no ecrã, mesmos componentes de impressão) ──
  function acionarVorschau() {
    setPreviewJob(rolle === 'bauleiter' ? 'plan' : (mode === 'tag' ? 'tag' : 'woche'));
  }
  React.useEffect(function() {
    if (!previewJob) return;
    function ajustarEscala() {
      var wrap = vorschauWrapRef.current, inner = vorschauInnerRef.current;
      if (!wrap || !inner) return;
      var orient = (previewJob === 'plan' || previewJob === 'beide') ? 'landscape' : 'portrait';
      var wmm = (orient === 'landscape' ? 297 : 210) - 20;
      var hmm = (orient === 'landscape' ? 210 : 297) - 20;
      var pageWpx = wmm * WP_MM;
      var nutz = hmm * WP_MM - 6;
      // 1) conteúdo: mesma lógica do wpFitA4 — mede à largura real da página
      // e encolhe só se o conteúdo for mais alto do que uma folha A4. No
      // Beidseitig há duas .wp-pagina (uma por folha) — usa-se a que
      // precisar de encolher mais, para as duas caberem por igual.
      inner.style.transform = 'none';
      inner.style.width = pageWpx + 'px';
      var paginas = inner.querySelectorAll('.wp-pagina');
      var alturas = paginas.length ? Array.prototype.map.call(paginas, function(el) { return el.scrollHeight; }) : [inner.scrollHeight];
      var fConteudo = 1;
      alturas.forEach(function(alto) {
        var f = alto > nutz ? nutz / alto : 1;
        if (f < fConteudo) fConteudo = f;
      });
      if (fConteudo < 0.5) fConteudo = 0.5;
      // 2) ecrã: encolhe o resultado (já com as proporções certas) para caber
      // na largura disponível — nunca amplia.
      var wrapRect = wrap.getBoundingClientRect();
      var pad = 32;
      var fEcra = Math.min((wrapRect.width - pad) / pageWpx, 1);
      var fFinal = fConteudo * fEcra;
      inner.style.width = (pageWpx / fConteudo) + 'px';
      inner.style.transform = 'scale(' + fFinal.toFixed(4) + ')';
    }
    var id = requestAnimationFrame(ajustarEscala);
    window.addEventListener('resize', ajustarEscala);
    return function() { cancelAnimationFrame(id); window.removeEventListener('resize', ajustarEscala); };
  }, [previewJob]);

  React.useEffect(function() {
    return function() {
      if (notaStreamRef.current) notaStreamRef.current.getTracks().forEach(function(t) { t.stop(); });
      if (notaMediaRef.current && notaMediaRef.current.state === 'recording') { try { notaMediaRef.current.stop(); } catch (e) {} }
      if (notaRecordedUrl) URL.revokeObjectURL(notaRecordedUrl);
    };
  }, []);

  // ── Aviso de balanço semanal (só na quinta às 15h, para quem tem Qui como último dia útil) ──
  var quemParaBalanco = rolle === 'monteur' ? who : (who !== 'alle' ? who : null);
  var pessoaBalanco = quemParaBalanco ? wpPerson(leute, quemParaBalanco) : null;
  var mostrarBalanco = false;
  if (pessoaBalanco) {
    var ultimoDiaAtivo = -1;
    for (var di = 0; di < 7; di++) if (pessoaBalanco.arbeitstage[di]) ultimoDiaAtivo = di;
    var agora = new Date();
    var diaHoje = wpDi(new Date(Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate())));
    if (ultimoDiaAtivo >= 0 && diaHoje === ultimoDiaAtivo && agora.getHours() >= 15) {
      var hojeIso = wpTodayIso();
      mostrarBalanco = !encontrarNota(hojeIso, pessoaBalanco.name) && !tagRows.some(function(r) { return r.datum === hojeIso && r.wer === pessoaBalanco.name && r.tag_status; });
    }
  }

  if (loading) {
    return React.createElement('div', { className: 'wp-app' }, React.createElement('style', null, WP_CSS), React.createElement('div', { className: 'wp-wrap', style: { padding: 20, textAlign: 'center', color: 'var(--ink2)' } }, 'A carregar…'));
  }

  var diaAtualObj = { tasks: tasks, tagRows: tagRows, leute: leute, cur: cur, who: who, mVon: lunch.von, mBis: lunch.bis };
  var notaDoDia = who !== 'alle' ? encontrarNota(cur, who) : null;

  return React.createElement('div', { className: 'wp-app' },
    React.createElement('style', null, WP_CSS),
    React.createElement(WpTop, {
      cur: cur, mode: mode, rolle: rolle,
      onPrev: function() { setCur(wpIso(wpAddD(wpMk(cur), mode === 'tag' ? -1 : -7))); },
      onNext: function() { setCur(wpIso(wpAddD(wpMk(cur), mode === 'tag' ? 1 : 7))); },
      onMode: setMode
    }),
    React.createElement('div', { className: 'wp-wrap' },
      React.createElement('div', { className: 'wp-noprint', style: { padding: '8px 0 0' } }, React.createElement('button', { className: 'wp-mini', onClick: onBack }, '← Zurück')),
      erro && React.createElement('div', { className: 'wp-errmsg wp-noprint', style: { marginTop: 8 } }, '⚠ ' + erro),
      React.createElement(WpBar, {
        rolle: rolle, who: who, leute: leute, mode: mode, wl: wl,
        onRolle: setRolle, onWho: setWho, onTeam: function() { setTeamModalAberto(true); },
        onWl: function(v) { setWl(v); wpSaveLayout(v); },
        onCsv: function() { wpCsvExport(tasks, cur, who); },
        onVorschau: acionarVorschau
      }),
      React.createElement(WpKpis, { mode: mode, rolle: rolle, tasks: tasks, leute: leute, cur: cur, who: who }),
      React.createElement(WpAlarm, { tasks: tasks, who: who, onOpen: abrirTarefa }),
      mostrarBalanco && React.createElement(WpBalancoBanner, { quem: pessoaBalanco.name, onAbrir: function() { setMode('tag'); setCur(wpTodayIso()); abrirNota(wpTodayIso()); } }),
      React.createElement('div', null,
        mode === 'tag' && React.createElement(WpTagView, Object.assign({}, diaAtualObj, {
          onOpen: abrirTarefa, onNovo: abrirNovaTarefa,
          notaDoDia: notaDoDia, onPlayNota: function() { tocarNota(cur, who); }, onAbrirNota: function() { abrirNota(cur); }
        })),
        mode === 'woche' && (wl === 'raster' ? React.createElement(WpWocheRaster, Object.assign({}, diaAtualObj, { onDia: function(k) { setCur(k); setMode('tag'); } })) : wl === 'liste' ? React.createElement(WpWocheListe, Object.assign({}, diaAtualObj, { onDia: function(k) { setCur(k); setMode('tag'); } })) : React.createElement(WpWocheKarten, Object.assign({}, diaAtualObj, { onDia: function(k) { setCur(k); setMode('tag'); } }))),
        mode === 'team' && rolle === 'bauleiter' && React.createElement(WpTeamView, Object.assign({}, diaAtualObj, { onOpen: abrirTarefa }))
      ),
      React.createElement(WpLegend, null)
    ),
    React.createElement(WpPrintArea, { printJob: printJob, tasks: tasks, leute: leute, tagRows: tagRows, cur: cur, who: who, innerRef: printInnerRef, areaRef: printAreaRef }),

    previewJob && React.createElement(WpVorschau, {
      tipo: previewJob, rolle: rolle, tasks: tasks, leute: leute, tagRows: tagRows, cur: cur, who: who,
      wrapRef: vorschauWrapRef, innerRef: vorschauInnerRef,
      onZurueck: function() { setPreviewJob(null); },
      onAba: setPreviewJob,
      onDrucken: function() { acionarImpressao(previewJob); }
    }),

    editTaskDraft && React.createElement(WpTaskModal, {
      id: editTaskId, draft: editTaskDraft, leute: leute, cur: cur, erro: editTaskErro, guardando: guardandoTask,
      onChange: mudarCampoTarefa, onSemData: mudarSemData, onFechar: fecharTarefa, onGuardar: guardarTarefa, onApagar: apagarTarefa
    }),
    teamModalAberto && !editPerson && React.createElement(WpTeamListModal, {
      leute: leute, tasks: tasks, onFechar: function() { setTeamModalAberto(false); }, onNovo: abrirNovoPersonagem, onEditar: abrirEditarPersonagem, onApagar: apagarPersonagem
    }),
    editPerson && React.createElement(WpPersonModal, {
      draft: editPerson, erro: editPersonErro, guardando: guardandoPerson,
      onChange: mudarCampoPerson, onToggleDia: alternarDiaPerson, onCancelar: cancelarPerson, onGuardar: guardarPerson
    }),
    notaAberta && React.createElement(WpNoteModal, {
      datum: notaAberta.datum, texto: notaTexto, onTexto: setNotaTexto,
      gravando: notaGravando, recordedUrl: notaRecordedUrl, recordedDurStr: notaRecordedDurStr, onToggleGravar: alternarGravacaoNota,
      temNota: !!encontrarNota(notaAberta.datum, notaAberta.wer), guardando: guardandoNota, erro: erro,
      onFechar: fecharNota, onGuardar: guardarNota, onApagar: apagarNota
    })
  );
}
