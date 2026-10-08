const CACHE = 'portland-map-v1';
// Vite generates hashed assets; inspect the built entry page once at install
// and pre-cache its scripts/styles before the worker can control a page.
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const response = await fetch('/index.html', {cache:'reload'});
    if (!response.ok) throw new Error('App shell could not load');
    const html = await response.clone().text();
    const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(match => match[1]);
    await cache.put('/index.html', response);
    await cache.addAll(['/', ...assets]);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('portland-map-') && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET') return;
  // Do not cache Google Maps scripts or tiles. Wikipedia responses are cached
  // separately so previously viewed details remain available offline.
  const wiki = url.origin === 'https://en.wikipedia.org' && url.pathname === '/w/api.php';
  if (url.origin !== self.location.origin && !wiki) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    if (!wiki && request.mode !== 'navigate' && cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && response.type !== 'opaque') await cache.put(request, response.clone());
      return response;
    } catch {
      if (cached) return cached;
      if (request.mode === 'navigate') return (await cache.match('/index.html')) || Response.error();
      return Response.error();
    }
  })());
});
