// Keeps the whole app available offline. The build stamps a version into CACHE, so each release gets a fresh cache.
const CACHE = 'gongse-b4df93d84d13';
const FONTS = 'gongse-fonts';
const FILES = ['./', 'index.html', 'dict.json', 'manifest.webmanifest', 'vendor/to-jyutping.js', 'vendor/pinyin-pro.js', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== FONTS).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    e.respondWith(caches.match(req.mode === 'navigate' ? 'index.html' : req, { ignoreSearch: true }).then(hit => hit || fetch(req)));
  } else if (/^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    // Web fonts are kept once seen. Offline, the page falls back to the iPhone's own Chinese fonts.
    e.respondWith(caches.open(FONTS).then(c => c.match(req).then(hit => hit || fetch(req).then(res => { c.put(req, res.clone()); return res; }))));
  }
});
