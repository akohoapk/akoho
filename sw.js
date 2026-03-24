// AKOHO — Service Worker v1.0
// Cache tout pour fonctionner hors-ligne

const CACHE_NAME = 'akoho-v1';
const FICHIERS = [
  './',
  './index.html',
  './admin.html'
];

// Installation : on met tout en cache
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FICHIERS))
  );
  self.skipWaiting();
});

// Activation : on supprime les vieux caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch : cache d'abord, réseau si pas trouvé
self.addEventListener('fetch', e => {
  // Les appels GAS (internet) passent toujours par le réseau
  if (e.request.url.includes('script.google.com')) {
    e.respondWith(fetch(e.request).catch(() => new Response('{}', {headers:{'Content-Type':'application/json'}})));
    return;
  }
  // Tout le reste : cache en priorité
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
      const clone = resp.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
      return resp;
    }))
  );
});
