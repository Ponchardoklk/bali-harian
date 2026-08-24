/* Bali Harian - service worker. Version: 20260824-185349
   Guarda la app entera para que abra sin conexion. */
var CACHE = 'bali-harian-20260824-185349';
var ESENCIALES = [
  './', './index.html', './manifest.webmanifest',
  './icon-180.png', './icon-192.png', './icon-512.png',
  './icon-maskable-512.png', './favicon.png'
];

/* Las tipografias vienen de Google. Si esperamos a que se pidan solas, la
   primera visita las deja fuera y sin cobertura se veria con otra letra.
   Asi que en la instalacion se leen del CSS y se guardan tambien. */
function guardarTipografias(cache) {
  var css = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=IBM+Plex+Mono:wght@400;500;600&family=Instrument+Sans:wght@400;500;600;700&display=swap';
  return fetch(css).then(function (r) {
    if (!r.ok) return;
    return cache.put(css, r.clone()).then(function () {
      return r.text();
    }).then(function (txt) {
      var urls = txt.match(/https:\/\/fonts\.gstatic\.com\/[^)]+/g) || [];
      var unicas = urls.filter(function (u, i) { return urls.indexOf(u) === i; });
      return Promise.all(unicas.map(function (u) {
        return fetch(u).then(function (f) { if (f.ok) return cache.put(u, f); }).catch(function () {});
      }));
    });
  }).catch(function () { /* sin conexion se guardaran mas adelante */ });
}

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(ESENCIALES).then(function () { return guardarTipografias(c); });
    }).then(function () { return self.skipWaiting(); })
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
