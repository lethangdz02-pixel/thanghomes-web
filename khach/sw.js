self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {
    title: '🔥 KHÁCH MỚI OCEAN PARK',
    body: 'Vừa có khách mới đăng bài tìm nhà! Bấm vào xem ngay.',
    url: '/khachocp/',
    tag: 'khach-ocp-lead'
  };
  try {
    if (event.data) {
      const parsed = event.data.json();
      data = Object.assign(data, parsed);
    }
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: '/khach/icon-192.png',
    badge: '/khach/icon-192.png',
    vibrate: [220, 100, 220],
    silent: false,
    tag: data.tag || ('khach-ocp-' + Date.now()),
    renotify: true,
    requireInteraction: false,
    data: { url: data.url || '/khachocp/' }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Tự động gia hạn token khi iOS Safari / Android Chrome xoay Push Subscription ngầm
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil((async () => {
    try {
      const appServerKey = event.oldSubscription && event.oldSubscription.options
        ? event.oldSubscription.options.applicationServerKey
        : null;
      if (!appServerKey) return;
      const newSub = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey
      });
      const tunRes = await fetch('/khachocp/tunnel.json?t=' + Date.now(), { cache: 'no-store' });
      const tunJson = tunRes.ok ? await tunRes.json() : {};
      const apiBase = (tunJson && tunJson.tunnel) ? tunJson.tunnel.replace(/\/+$/, '') : '';
      if (apiBase && newSub) {
        await fetch(apiBase + '/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: newSub.toJSON(), user_name: '', user_phone: '' })
        });
      }
    } catch (e) {}
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/khachocp/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ((client.url.includes('/khachocp') || client.url.includes('/khach') || client.url.includes('/sankhach')) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
