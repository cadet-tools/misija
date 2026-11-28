// Bezsaistes failu saraksts: to izmanto gan service worker (sw.js), gan ielādes josla lapā.
// Mainot jebkuru failu, palielini versiju, lai telefoni ielādētu jauno.
self.MISIJA_CACHE = 'misija-v20';
self.MISIJA_ASSETS = [
  './', './index.html', './vaditajs.html', './assets.js',
  './common.js', './ops.js', './tasks.js', './game.js', './map.js', './sfx.js', './jsqr.js', './qrcode.js',
  './site.webmanifest', './lof-map.jpg', './CADET_LV_LOGO.png',
  './favicon-32.png', './icon-192.png', './icon-512.png', './apple-touch-icon.png',
  './fonts/fonts.css',
  './fonts/saira-stencil-one-latin-400-normal.woff2', './fonts/saira-stencil-one-latin-ext-400-normal.woff2',
  './fonts/saira-condensed-latin-600-normal.woff2', './fonts/saira-condensed-latin-ext-600-normal.woff2',
  './fonts/saira-condensed-latin-700-normal.woff2', './fonts/saira-condensed-latin-ext-700-normal.woff2',
  './fonts/jetbrains-mono-latin-400-normal.woff2', './fonts/jetbrains-mono-latin-ext-400-normal.woff2',
  './fonts/jetbrains-mono-latin-700-normal.woff2', './fonts/jetbrains-mono-latin-ext-700-normal.woff2'
];
