# TRINiUM Frontend + Backend

Este frontend queda conectado a la API de InfinityFree:

`https://triniumdb.infinityfree.io/api`

## Qué está conectado

- `GET /products`: catálogo real desde MySQL.
- `POST /orders`: registra el pedido en MySQL antes de abrir WhatsApp.
- `POST /auth/login`: acceso real del administrador mediante Bearer token.
- `PUT /products/{id}`: edición y visibilidad desde el panel.
- `POST /products`: creación desde el panel.
- `DELETE /products/{id}`: eliminación desde el panel.
- Carrito y favoritos: `localStorage` para que sobrevivan a recargas.
- Moneda: COP / `es-CO`.

## Antes de publicar

1. Reemplaza `WA_NUMBER` en `src/App.tsx` por el WhatsApp real de TRINiUM.
2. El backend actualmente tiene un hash de administrador de ejemplo que no corresponde a la contraseña indicada en el comentario del seed. Para activar el login, ejecuta en phpMyAdmin una actualización del usuario admin.

Contraseña temporal recomendada:

`TRINiUM_Admin_2026!`

SQL:

```sql
UPDATE users
SET password = '$2y$12$MIZv.aMU.Nsm8sSlX3UAcu4lc/hx3vt9b4MgXm4tN3Vai6ZwxIGMu'
WHERE email = 'admin@trinium.local';
```

Después cambia esa contraseña por una propia.

## Publicar en Netlify

En el proyecto local:

```bash
npm install
npm run build
```

El proyecto sigue siendo Vite + React + TypeScript. No se necesita mover el backend de InfinityFree.

## Nota

La API debe seguir accesible por HTTPS y CORS debe permitir `https://trinium.netlify.app`.
