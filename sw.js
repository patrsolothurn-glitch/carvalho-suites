// ── Carvalho Suite Service Worker ──────────────────────────────────
// Versão sem cache — carrega sempre da rede para evitar versões antigas
const CACHE = 'carvalho-v7be5c048';

self.addEventListener('install', e => {
  self.skipWaiting(); // Ativa imediatamente
});

self.addEventListener('activate', e => {
  // Apaga TODOS os caches antigos sem exceção
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// Sem cache — tudo vai para a rede
self.addEventListener('fetch', e => {
  if (e.request.url.includes('supabase.co')) return;
  // Deixa o browser tratar normalmente (rede)
});

// ── Push notifications ──────────────────────────────────────────────
self.addEventListener('push', e => {
  let data = { title: 'Carvalho Suite', body: '' };
  try { if (e.data) data = e.data.json(); } catch (err) { if (e.data) data.body = e.data.text(); }
  e.waitUntil(
    self.registration.showNotification(data.title || 'Carvalho Suite', {
      body: data.body || '', icon: './icon-192.png', badge: './icon-192.png', tag: data.tag || 'carvalho-push'
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(list => {
      for (const c of list) {
        if (c.url.includes('carvalho-suites') && 'focus' in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});
