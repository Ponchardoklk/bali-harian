# Bali Harian

Asistente personal para el dia a dia: agenda, lista de la compra en Bali con los
nombres en indonesio, control de gastos en rupias y euros, y aviso de visado.
La usan dos personas a la vez.

## Donde vive cada cosa

| Archivo | Que es |
|---|---|
| `app.html` | El codigo de la app. Fuente unico. |
| `index.html` | El aviso de que esto se mudo. Es lo que sirve GitHub Pages. |
| `sw.js` | Service worker de retirada: borra lo guardado y se da de baja. |

La app **ya no se usa desde GitHub Pages**: vive como artifact, que es lo que le
da el almacen compartido entre los dos moviles. La direccion antigua se queda
ensenando el aviso y ofreciendo copiar al portapapeles lo que hubiera apuntado
ahi, porque los datos de cada direccion son suyos y no viajan solos.

## Como sincroniza

Cada gasto, evento y cosa de la lista viaja **por separado**, con la hora de su
ultimo cambio, en vez de mandar el bloque entero. Si uno apunta un gasto
mientras el otro tacha la leche, entran los dos. Mandar el objeto completo
habria borrado los cambios del otro cada vez que coincidieran.

- Los borrados dejan marca en vez de quitar el documento: si desapareciera sin
  mas, el otro movil lo volveria a subir creyendolo nuevo y reapareceria solo.
- Los dias marcados de un habito se suman en vez de sustituirse.
- Lo pendiente espera en cola en el movil y sale al recuperar cobertura.
- **Las fotos no viajan**: la imagen vive en IndexedDB del propio telefono y
  pesa demasiado. Mandar solo la ficha dejaria entradas sin foto.

`app.html` mira solo si tiene almacen compartido (`claude.use('db')`). Si no lo
tiene — un navegador normal — funciona contra el movil y ya esta.

## Publicar una version nueva

```
node build-artifact.mjs      # app.html -> dist/artifact.html
```

Y se publica **sobre la misma URL del artifact**. Publicar sin pasar la url crea
uno nuevo y los dos moviles se quedarian abriendo el viejo. Capacidades: `db`
(el almacen compartido) y `downloads` (la copia de seguridad y el Excel de
gastos); al pasar `capabilities` hay que nombrar las dos.

## Para verlo en local

```
node _serve.mjs              # http://localhost:4173
```

`/` es el aviso de la mudanza y `/app.html` es la app. Ahi no hay almacen
compartido, asi que sale en modo "Solo en este movil": util para comprobar que
tambien aguanta sin sincronizacion.
