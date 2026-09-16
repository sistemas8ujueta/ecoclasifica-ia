# EcoClasifica IA

Aplicación web para la clasificación de residuos mediante IA, dirigida a la comunidad universitaria. Permite escanear un residuo, identificar en qué caneca (blanca, verde o negra) debe depositarse, y llevar un historial y estadísticas de impacto ambiental.

## Arquitectura

- **Frontend**: React + TypeScript + Vite (`src/`), enrutado con React Router.
- **Backend**: API en Node.js/Express (`server/`), con base de datos SQLite real (`../database/app.db`, vía el módulo nativo `node:sqlite`).
- **Autenticación**: contraseñas con hash PBKDF2-HMAC-SHA256 (`server/hash.js`), calculado en el servidor para no depender de APIs restringidas a contextos seguros (HTTPS/localhost).

## Ejecutar en desarrollo

```bash
npm install
npm run dev:all
```

Esto levanta a la vez el servidor web (Vite, puerto 5173) y la API (Express, puerto 4000). La app queda disponible en `http://localhost:5173` y también en la IP de red local (útil para abrirla desde un celular en la misma red Wi-Fi).

Scripts individuales:
- `npm run dev` — solo el frontend.
- `npm run server` — solo la API.
- `npm run build` — build de producción del frontend.

## Estructura

```
src/
  components/   Componentes de UI reutilizables (botones, tarjetas, toasts, navegación)
  context/      Estado de sesión (AppContext)
  data/         Reglas de clasificación de residuos por caneca
  screens/      Una pantalla por ruta
  services/     Cliente API, autenticación, almacenamiento
server/
  index.js      Rutas de la API (auth, usuarios, clasificaciones, estadísticas)
  db.js         Esquema y conexión SQLite
  hash.js       Hash de contraseñas
```

## Autores

Martínez Regino Yetit Vanesa
Rodríguez Sierra Daniel Andrés

Corporación Universitaria Reformada de Barranquilla — 2026
