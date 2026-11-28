// Misija — bezsaistes darbība. Mainot failus, palielini versiju.
const CACHE = 'misija-v9';
const FILES = [
  './', './index.html', './vaditajs.html', './common.js', './ops.js', './game.js', './map.js', './fonts/fonts.css',
  './fonts/saira-stencil-one-latin-400-normal.woff2', './fonts/saira-stencil-one-latin-ext-400-normal.woff2',
  './fonts/saira-condensed-latin-600-normal.woff2', './fonts/saira-condensed-latin-ext-600-normal.woff2',
  './fonts/saira-condensed-latin-700-normal.woff2', './fonts/saira-condensed-latin-ext-700-normal.woff2',
  './fonts/jetbrains-mono-latin-400-normal.woff2', './fonts/jetbrains-mono-latin-ext-400-normal.woff2',
  './fonts/jetbrains-mono-latin-700-normal.woff2', './fonts/jetbrains-mono-latin-ext-700-normal.woff2', './lof-map.jpg', './jsqr.js', './qrcode.js',
  './site.webmanifest', './CADET_LV_LOGO.png', './favicon-32.png', './icon-192.png', './icon-512.png', './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('misija-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Ja ir internets — jaunākā versija no tīkla (max 4 s); bez interneta — no kešatmiņas
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await Promise.race([
        fetch(req, { cache: 'no-cache' }),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000))
      ]);
      if (res && res.ok) { cache.put(req, res.clone()); return res; }
      throw new Error('bad');
    } catch (err) {
      const cached = await cache.match(req, { ignoreSearch: true });
      if (cached) return cached;
      if (req.mode === 'navigate') return (await cache.match('./index.html')) || Response.error();
      return Response.error();
    }
  })());
});
