# Bali Harian

Asistente personal para el dia a dia: agenda, lista de la compra en Bali con los
nombres en indonesio, control de gastos en rupias y euros, y aviso de visado.

## Dos formas de correr, un solo codigo

La app mira al abrirse si tiene almacen compartido (`window.claude.use('db')`):

- **Como artifact** — los dos moviles van a una. Cada gasto, evento o cosa de la
  lista viaja por separado con la hora de su ultimo cambio, asi que dos personas
  pueden apuntar a la vez sin pisarse. Lo pendiente se queda en cola si no hay
  cobertura y sale solo al volver. **Las fotos no viajan** (pesan demasiado): se
  quedan en el movil donde se hicieron.
- **Desde un navegador normal** (GitHub Pages) — funciona sola contra el movil,
  igual que siempre, y se instala desde Compartir -> Anadir a pantalla de inicio.

## Como se construye la version compartida

```
node build-artifact.mjs      # index.html -> dist/artifact.html
```

El visor de artifacts pone su propio `<!doctype>`, `<head>` y `<body>`, asi que
el build quita los nuestros y cambia el registro del service worker por el sello
de version. Nada mas: el resto del codigo es identico.

Se publica con las capacidades `db` (el almacen compartido) y `downloads` (para
que funcionen la copia de seguridad y el Excel de gastos).

## Para verlo en local

```
node _serve.mjs              # http://localhost:4173
```

Ahi no hay almacen compartido, asi que sale en modo "Solo en este movil": util
para comprobar que la app tambien aguanta sin sincronizacion.
