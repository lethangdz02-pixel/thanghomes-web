// Network-First Service Worker cho App Khach Net Ocean Park
const CACHE_NAME = 'khach-net-v1';
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-store' }).catch(() => caches.match(e.request))
  );
});
