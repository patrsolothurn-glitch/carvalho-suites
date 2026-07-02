var VAPID_PUBLIC_KEY = 'BIObF5nOKVp99VgqSgGJRUrWEWgP3jXmn8P1Bu3dsBOFzn3W_JCJCy7Kjy7RpDBa0EOV2yLKuoFN3TKSnv5B448';
var urlBase64ToUint8Array = function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);
  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};
var DIAS_SEMANA_PT = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
var formatRelDatePt = function formatRelDatePt(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr + 'T00:00:00');
  var now = new Date();
  var hoje = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var diffDays = Math.round((d - hoje) / 86400000);
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Amanhã';
  if (diffDays > 1 && diffDays < 7) return DIAS_SEMANA_PT[d.getDay()];
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
};
var USERS_DEF = [{
  id: 'patricio',
  name: 'Patricio',
  role: 'Admin',
  emoji: '👨‍💼',
  pwd: 'Pc12345'
}, {
  id: 'esposa',
  name: 'Esposa',
  role: 'Família',
  emoji: '👩',
  pwd: 'Esposa123'
}, {
  id: 'lucas',
  name: 'Lucas',
  role: 'Filho',
  emoji: '👦',
  pwd: 'Lucas123'
}, {
  id: 'liam',
  name: 'Liam',
  role: 'Filho',
  emoji: '👦',
  pwd: 'Liam123'
}];
var PERMS_DEF = {
  patricio: ['horaspr', 'agenda', 'familia', 'nutri', 'escolar', 'subby'],
  esposa: ['familia'],
  lucas: ['familia', 'escolar'],
  liam: ['familia']
};

// ── FONT ────────────────────────────────────────────────────────────

// ── BACKUP AUTOMÁTICO GOOGLE DRIVE ───────────────────────────────────
var BACKUP_URL = 'https://script.google.com/macros/s/AKfycbwAgEEVy6CoJRh97PGnUET6jrAffzl0ObKbs20K6oUWBK6hXi4i7YviBKm6_8Iq_m39/exec';

function backupParaDrive(tabela, dados) {
  try {
    // URLSearchParams + no-cors: request simples sem preflight CORS,
    // o servidor recebe e guarda — o browser nao le a resposta (opaca), que e OK
    var params = new URLSearchParams();
    params.append('payload', JSON.stringify({
      tabela: tabela,
      dados: dados,
      data: new Date().toISOString(),
      projeto: 'carvalho-suites'
    }));
    fetch(BACKUP_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: params
    }).catch(function() {});
  } catch(e) {}
}
