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
    tag: data.tag || 'khach-ocp-lead',
    renotify: true,
    requireInteraction: false,
    data: { url: data.url || '/khachocp/' }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/khachocp/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/khachocp') && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
