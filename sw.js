const CACHE = 'proferamiro-v1';

const STATIC = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Instalar: guardar archivos locales en caché
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(STATIC))
  );
  self.skipWaiting();
});

// Activar: limpiar cachés viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network first, fallback a caché
self.addEventListener('fetch', e => {
  // Solo interceptar requests GET
  if (e.request.method !== 'GET') return;

  // Para los juegos externos (GitHub Pages), solo caché si están disponibles
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Guardar respuesta exitosa en caché
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
