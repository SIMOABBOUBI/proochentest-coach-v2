/* Sproochentest A2 — Coach v4 · service worker
   ───────────────────────────────────────────────────────────────────────────
   L'app pèse ~2,7 Mo, dont 2,5 Mo de photos. On sépare donc deux régimes :

   · la coquille (HTML, JS, corpus, icônes) est servie depuis le cache et
     revalidée en arrière-plan — lancement instantané, et un bandeau propose
     de recharger quand une nouvelle version est publiée ;
   · les photos sont mises en cache au fil de l'usage plutôt qu'à
     l'installation : personne n'a besoin des 27 dès la première minute, et
     une première ouverture ne doit pas coûter 2,5 Mo en 4G.

   Après modification de ce fichier, incrémenter VERSION pour purger. */

const VERSION = 'v4.0.0';
const SHELL = 'spr-shell-' + VERSION;
const MEDIA = 'spr-media-' + VERSION;

const ASSETS = [
  './', './index.html', './corpus.js', './method.js', './listen.js', './app.js', './pwa.js',
  './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png',
  './icons/apple-touch-icon.png', './icons/favicon-64.png'
];

const docKey = () => new URL('index.html', self.registration.scope).href;
/* Marqueur persistant : un postMessage seul peut arriver avant que la page
   n'écoute, ou se perdre si le worker est arrêté entre-temps. */
const MARK = () => new URL('__update_ready__', self.registration.scope).href;

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(SHELL).then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting()).catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== SHELL && k !== MEDIA).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'skip-waiting') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate' || req.destination === 'document') e.respondWith(handleDoc(req, e));
  else if (/\/photos\//.test(url.pathname)) e.respondWith(cacheFirst(req, MEDIA));
  else e.respondWith(cacheFirst(req, SHELL));
});

/* Signature légère : comparer deux fichiers entiers pour détecter une mise à
   jour coûterait plus cher que la mise à jour elle-même. */
const stamp = res => res && (res.headers.get('etag')
  || res.headers.get('last-modified') || res.headers.get('content-length') || '');

async function handleDoc(req, evt) {
  const cache = await caches.open(SHELL);
  const key = docKey();
  const cached = await cache.match(key);

  // ce qu'on s'apprête à servir devient la référence : tout marqueur
  // antérieur est périmé, la page servie EST la dernière version connue
  if (cached) await cache.delete(MARK());

  // `cache: 'no-cache'` force la revalidation auprès du serveur. Sans ça le
  // cache HTTP du navigateur renverrait l'ancien ETag et aucune mise à jour
  // ne serait jamais détectée. Coût nul si rien n'a changé : un 304.
  const probe = new Request(key, { cache: 'no-cache', credentials: 'same-origin' });
  const network = fetch(cached ? probe : req).then(async res => {
    if (res && res.ok && res.type === 'basic') {
      const before = stamp(cached), after = stamp(res);
      await cache.put(key, res.clone());
      if (cached && before && after && before !== after) {
        await cache.put(MARK(), new Response(after));
        await notify();
      }
    }
    return res;
  }).catch(() => null);

  // sans waitUntil, le worker peut être arrêté avant la fin de la revalidation
  if (evt && evt.waitUntil) evt.waitUntil(network);
  if (cached) return cached;

  const fresh = await network;
  return fresh || new Response(
    '<!doctype html><meta charset="utf-8"><style>body{font-family:system-ui;padding:40px;text-align:center;color:#3A4757}</style>'
    + "<h1>Hors ligne</h1><p>Connecte-toi une fois pour installer l'application, elle fonctionnera ensuite sans réseau.</p>",
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

async function cacheFirst(req, box) {
  const cache = await caches.open(box);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
    return res;
  } catch (_) {
    return new Response('', { status: 504 });
  }
}

async function notify() {
  const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  cs.forEach(c => c.postMessage({ type: 'update-ready' }));
}
