const CACHE = 'pokedex-v1';

const ARCHIVOS = [
  './',
  'index.html',
  'manifest.json',
  'css/styles.css',
  'js/vendor/html5-qrcode.min.js',
  'js/datos.js',
  'js/storage.js',
  'js/api.js',
  'js/scanner.js',
  'js/app.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'assets/fonts/inter-latin-400-normal.woff2',
  'assets/fonts/inter-latin-500-normal.woff2',
  'assets/fonts/inter-latin-600-normal.woff2',
  'assets/fonts/inter-latin-800-normal.woff2',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function responderConCache(req, respaldo) {
  const cache = await caches.open(CACHE);
  const guardado = await cache.match(req, { ignoreSearch: true });
  const red = fetch(req)
    .then((res) => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);
  if (guardado) return guardado;
  const res = await red;
  if (res) return res;
  return respaldo ? cache.match(respaldo) : Response.error();
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname === 'pokeapi.co') return;

  if (req.mode === 'navigate') {
    e.respondWith(responderConCache(req, 'index.html'));
  } else if (url.origin === self.location.origin || req.destination === 'image') {
    e.respondWith(responderConCache(req));
  }
});
