// Misija: bezsaistes darbība. Failu saraksts un versija ir assets.js.
importScripts('assets.js');
const CACHE = self.MISIJA_CACHE, FILES = self.MISIJA_ASSETS;

// Instalēšana: katru failu ielādē un saglabā atsevišķi (lapa rāda progresu)
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(FILES.map(async f => {
      if (await cache.match(f)) return;
      for (let i = 0; i < 3; i++) {
        try {
          const res = await fetch(new Request(f, { cache: 'reload' }));
          if (res.ok) { await cache.put(f, res); return; }
        } catch (err) {}
        await new Promise(r => setTimeout(r, 800 * (i + 1)));
      }
      throw new Error('Neizdevās ielādēt ' + f);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('misija-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const isPage = req.mode === 'navigate' || /\.html?$/.test(new URL(req.url).pathname) || new URL(req.url).pathname.endsWith('/');
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (isPage) {
      // Lapas: ja ir internets, jaunākā (max 3 s); citādi saglabātā
      try {
        const res = await Promise.race([fetch(req, { cache: 'no-cache' }), new Promise((_, rej) => setTimeout(() => rej(new Error('t')), 3000))]);
        if (res && res.ok) { cache.put(req, res.clone()); return res; }
      } catch (err) {}
      return (await cache.match(req, { ignoreSearch: true })) || (await cache.match('./index.html')) || Response.error();
    }
    // Pārējie faili: no kešatmiņas uzreiz (versija mainās ar katru atjauninājumu)
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try { const res = await fetch(req); if (res && res.ok) cache.put(req, res.clone()); return res; }
    catch (err) { return Response.error(); }
  })());
});
