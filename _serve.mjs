import http from 'http';
import fs from 'fs';
import path from 'path';
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };
http.createServer((req, res) => {
  let f = decodeURIComponent(req.url.split('?')[0]);
  if (f === '/') f = '/index.html';
  const p = path.join(process.cwd(), f);
  fs.readFile(p, (e, d) => {
    if (e) { res.writeHead(404); res.end('no está'); return; }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(p)] || 'text/plain' });
    res.end(d);
  });
}).listen(4173, () => console.log('http://localhost:4173'));
