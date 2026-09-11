/* Saca de app.html la versión que se publica como artifact.
 *
 * Hay un solo código fuente. La app mira sola si tiene almacén compartido
 * (window.claude.use('db')): si lo tiene, los dos móviles van a una; si no,
 * funciona contra el móvil y ya está. Lo único que cambia aquí es el envoltorio:
 * el visor de artifacts pone su propio <!doctype>, <head> y <body>, así que hay
 * que quitar los nuestros.
 *
 *   node build-artifact.mjs
 *
 * Luego se publica dist/artifact.html SOBRE LA MISMA URL de siempre. Publicar
 * sin pasar la url crea un artifact nuevo y los dos móviles se quedarían
 * abriendo el viejo.
 */
import fs from 'fs';
import path from 'path';

const ORIGEN = 'app.html';
const DESTINO = path.join('dist', 'artifact.html');

let h = fs.readFileSync(ORIGEN, 'utf8').replace(/\r\n/g, '\n');
const original = h.length;

function quita(re, etiqueta) {
  const antes = h;
  h = h.replace(re, '');
  if (antes === h) {
    console.error('FALLO: no he encontrado ' + etiqueta);
    process.exit(1);
  }
  console.log('  - ' + etiqueta);
}

/* El envoltorio lo pone el visor */
quita(/^<!doctype html>\n<html lang="es">\n<head>\n/, 'doctype + <html> + <head>');
quita(/<\/head>\n<body>\n/, '</head><body>');
quita(/\n<\/body>\n<\/html>\n?$/, '</body></html>');
quita(/<meta charset="utf-8">\n/, 'meta charset (lo pone el visor)');
quita(/<meta name="viewport"[^>]*>\n/, 'meta viewport (lo pone el visor)');

/* Sello de fecha, que es lo que enseña Ajustes -> Versión */
const iso = new Date().toISOString().replace(/[-:T]/g, '');
const sello = iso.slice(0, 8) + '-' + iso.slice(8, 14);
const marcador = `window.VERSION_APP = 'desarrollo';`;
if (!h.includes(marcador)) { console.error('FALLO: no he encontrado el sello de versión'); process.exit(1); }
h = h.replace(marcador, 'window.VERSION_APP = ' + JSON.stringify(sello) + ';');
console.log('  - sello de versión ' + sello);

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync(DESTINO, h);

const sobra = h.match(/<!doctype|<html|<\/html>|<head>|<\/head>|<body|<\/body>/i);
if (sobra) { console.error('FALLO: ha quedado ' + sobra[0]); process.exit(1); }

console.log('\n' + DESTINO + ' · ' + h.split('\n').length + ' líneas · ' +
  Math.round(h.length / 1024) + ' KB (de ' + Math.round(original / 1024) + ' KB)');
