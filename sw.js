/* Bali Harian - service worker. Version: 20260824-181157
   Guarda la app entera para que abra sin conexion. */
var CACHE = 'bali-harian-20260824-181157';
var ESENCIALES = [
  './', './index.html', './manifest.webmanifest',
  './icon-180.png', './icon-192.png', './icon-512.png',
  './icon-maskable-512.png', './favicon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ESENCIALES); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  // La pagina: primero la red (para traer novedades), y si no hay, la copia guardada.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (r) {
        var copia = r.clone();
        caches.open(CACHE).then(function (c) { c.put('./index.html', copia); });
        return r;
      }).catch(function () {
        return caches.match('./index.html').then(function (h) {
          return h || caches.match('./');
        });
      })
    );
    return;
  }

  // Lo demas (iconos, tipografias): primero lo guardado, que es instantaneo.
  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (r) {
        if (r && (r.ok || r.type === 'opaque')) {
          var copia = r.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copia); });
        }
        return r;
      }).catch(function () { return hit; });
    })
  );
});
