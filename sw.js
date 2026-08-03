/* sw.js — cache-first pour l'app shell, réseau pour le reste */
const CACHE = 'sprooch-v1';
const SHELL = [
  './', './index.html', './corpus.js', './method.js', './listen.js', './app.js',
  './manifest.webmanifest',
  './icons/favicon-64.png', './icons/apple-touch-icon.png',
  './icons/icon-192.png', './icons/icon-512.png',
  './photos/a.jpg', './photos/b.jpg', './photos/c.jpg', './photos/d.jpg', './photos/e.jpg',
  './photos/f.jpg', './photos/g.jpg', './photos/h.jpg', './photos/i.jpg', './photos/j.jpg',
  './photos/k.jpg', './photos/l.jpg', './photos/m.jpg', './photos/n.jpg', './photos/o.jpg',
  './photos/p.jpg', './photos/q.jpg', './photos/r.jpg', './photos/s.jpg', './photos/t.jpg',
  './photos/u.jpg', './photos/v.jpg', './photos/w.jpg', './photos/x.jpg', './photos/y.jpg',
  './photos/z.jpg', './photos/aa.jpg',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
      return res;
    }).catch(() => cached))
  );
});
