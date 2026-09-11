/* Bali Harian - service worker de retirada. Version: 20260911-mudanza
 *
 * El de antes guardaba la app entera para que abriera sin internet. Ahora la
 * app vive en otra direccion y esta copia solo ensena el aviso de la mudanza,
 * asi que lo que hacia falta es justo lo contrario: soltar lo guardado y darse
 * de baja. Si se quedara, el movil podria seguir sirviendo la app vieja desde
 * su memoria y nadie entenderia por que sigue ahi.
 *
 * Se deja el fichero en su sitio (en vez de borrarlo) para que los navegadores
 * que ya lo tienen registrado se encuentren esta version y se retiren. Un 404
 * tambien da de baja al worker en los navegadores modernos, pero no limpia lo
 * que ya estaba guardado.
 */

self.addEventListener('install', function () {
  self.skipWaiting();   // aqui no hay nada que se pueda estropear por ir deprisa
});

self.addEventListener('message', function (e) {
  if (e.data === 'actualiza') self.skipWaiting();   // la app vieja pide el relevo asi
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) {
        return Promise.all(ks.map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.registration.unregister(); })
      .then(function () { return self.clients.matchAll({ type: 'window' }); })
      .then(function (cs) {
        // Las pantallas abiertas se recargan solas y caen en el aviso.
        cs.forEach(function (c) { c.navigate(c.url); });
      })
      .catch(function () { /* si algo falla, la pagina insiste por su cuenta */ })
  );
});

/* Sin 'fetch': todo va a la red, como en cualquier pagina normal. */
