# EcoClasifica IA — Documentación del proyecto

## 1. Información general

| | |
|---|---|
| **Nombre del proyecto** | EcoClasifica IA |
| **Tipo** | Aplicación web de clasificación inteligente de residuos |
| **Institución** | Corporación Universitaria Reformada de Barranquilla |
| **Autores** | Martínez Regino Yetit Vanesa · Rodríguez Sierra Daniel Andrés |
| **Año** | 2026 |

## 2. Descripción del proyecto

EcoClasifica IA es una plataforma web orientada a la comunidad universitaria (con proyección a empresas e instituciones educativas) que permite escanear un residuo sólido, identificar mediante un modelo de clasificación en qué caneca debe depositarse según el código de colores colombiano (blanca, verde, negra), y llevar un registro histórico de las clasificaciones realizadas junto con estadísticas de impacto ambiental.

El proyecto reemplaza una primera versión desarrollada en Python/Kivy por una aplicación web completa (frontend + backend + base de datos), con el fin de que sea accesible desde cualquier navegador —incluido el de un teléfono móvil— sin necesidad de instalar nada.

## 3. Objetivos

**Objetivo general**
Desarrollar una herramienta tecnológica que facilite y eduque sobre la correcta separación de residuos sólidos mediante inteligencia artificial.

**Objetivos específicos**
- Permitir a un usuario registrarse, iniciar sesión y gestionar su cuenta de forma segura.
- Clasificar un residuo a partir de una fotografía (cámara o galería) e indicar la caneca correspondiente.
- Registrar el historial de clasificaciones de cada usuario y permitir consultarlo y filtrarlo.
- Calcular estadísticas de uso e impacto ambiental estimado.
- Proveer un panel de administración con los usuarios registrados y un panel institucional con métricas agregadas de toda la plataforma.
- Ofrecer contenido educativo sobre qué residuos van en cada caneca.

## 4. Arquitectura del sistema

La aplicación sigue una arquitectura cliente-servidor de tres capas:

```
┌─────────────────────┐      HTTP (fetch)      ┌──────────────────────┐      SQL      ┌───────────────────┐
│   Frontend (React)   │ ─────────────────────► │  Backend (Express)   │ ────────────► │  Base de datos     │
│   Vite · TypeScript   │ ◄───────────────────── │  server/index.js     │ ◄──────────── │  SQLite (app.db)   │
└─────────────────────┘      JSON               └──────────────────────┘               └───────────────────┘
```

- **Frontend**: aplicación de una sola página (SPA) construida con React y TypeScript, servida por Vite. Contiene toda la interfaz, la navegación y la lógica de presentación.
- **Backend**: API REST en Node.js con Express, responsable de la autenticación, las reglas de negocio y el acceso a datos.
- **Base de datos**: SQLite (un único archivo `database/app.db` en la raíz del repositorio), accedida mediante el módulo nativo `node:sqlite` de Node.js (no requiere compilación nativa ni dependencias binarias).

En desarrollo, ambos servidores corren en la misma máquina (`localhost:5173` el frontend, `localhost:4000` la API) y Vite redirige las peticiones `/api/*` hacia el backend, por lo que el navegador solo necesita conocer un origen. Esto también permite abrir la aplicación desde un celular en la misma red Wi-Fi usando la IP local de la máquina (p. ej. `http://192.168.1.16:5173`).

## 5. Tecnologías utilizadas

| Capa | Tecnología |
|---|---|
| Interfaz | React 19 + TypeScript, React Router 7 |
| Empaquetador / servidor de desarrollo | Vite |
| Backend | Node.js + Express 5 |
| Base de datos | SQLite vía `node:sqlite` (módulo nativo de Node, sin dependencias externas) |
| Autenticación | Hash de contraseñas con PBKDF2-HMAC-SHA256 (módulo `crypto` de Node) |
| Estilos | CSS plano con variables (sin frameworks de UI), diseño mobile-first |
| Pruebas manuales / verificación visual | Playwright (uso interno de desarrollo, no forma parte del producto) |

No se utiliza ningún ORM: las consultas SQL se escriben directamente con la API de `node:sqlite` (`db.prepare(...).run()/.get()/.all()`).

## 6. Estructura del proyecto

```
clasificador_residuos_app/
├── database/
│   └── app.db                 Base de datos SQLite (usuarios y clasificaciones)
└── ecoclasifica-web/
    ├── server/                 Backend (Node/Express)
    │   ├── index.js             Rutas de la API
    │   ├── db.js                Conexión y esquema de la base de datos
    │   └── hash.js               Hash y verificación de contraseñas
    └── src/                    Frontend (React)
        ├── components/          Componentes de UI reutilizables (botones, tarjetas, toasts, navegación)
        ├── context/             Estado global de sesión (AppContext)
        ├── data/                Catálogo de canecas y reglas de clasificación
        ├── hooks/               Hooks reutilizables (p. ej. animación de conteo)
        ├── screens/             Una pantalla por ruta
        ├── services/            Cliente HTTP, autenticación, almacenamiento, detector
        ├── types.ts             Tipos compartidos (Usuario, Clasificación, Rol, etc.)
        └── App.tsx              Definición de rutas
```

## 7. Modelo de datos

La base de datos tiene dos tablas:

**`usuarios`**

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | INTEGER (PK, autoincremental) | Identificador único |
| `nombre` | TEXT | Nombre completo |
| `correo` | TEXT (único) | Correo, usado para iniciar sesión |
| `password_hash` | TEXT | Contraseña con hash (nunca en texto plano) |
| `rol` | TEXT | `Estudiante` o `Personal de aseo` |
| `fecha_registro` | TEXT (ISO 8601) | Fecha de creación de la cuenta |

**`clasificaciones`**

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | INTEGER (PK, autoincremental) | Identificador único |
| `usuario_id` | INTEGER (FK → usuarios.id, ON DELETE CASCADE) | Usuario que realizó la clasificación |
| `residuo` | TEXT | Clave del residuo identificado (p. ej. `botella_plastica`) |
| `confianza` | REAL | Confianza del modelo, entre 0 y 1 |
| `caneca` | TEXT | `blanca`, `verde` o `negra` |
| `fecha` | TEXT (ISO 8601) | Fecha y hora de la clasificación |
| `imagen` | TEXT (nullable) | Reservado para una futura referencia a la imagen; actualmente no se almacena |

## 8. Seguridad y autenticación

- Las contraseñas **nunca se guardan ni viajan en texto plano** más allá de la petición de login/registro sobre la red local de desarrollo.
- El hash se calcula en el servidor con **PBKDF2-HMAC-SHA256**, 200 000 iteraciones y una sal aleatoria de 16 bytes por usuario (`server/hash.js`). El resultado se guarda como `sal$hash` en la columna `password_hash`.
- El cálculo se hace deliberadamente en el backend con el módulo nativo `crypto` de Node, y no con la Web Crypto API del navegador (`crypto.subtle`), porque esta última solo funciona en "contextos seguros" (HTTPS o `localhost`) y la aplicación necesita poder usarse desde el navegador de un celular vía HTTP en la red local.
- No existe todavía un mecanismo de tokens de sesión (JWT, cookies firmadas, etc.): la sesión se identifica por los datos del usuario devueltos tras el login y se conserva en el `localStorage` del navegador. Es un esquema adecuado para el alcance académico actual, pero **no** sustituye un sistema de autenticación de nivel productivo.
- La recuperación de contraseña genera un código de verificación local (no se envía correo real); es un punto de extensión señalado explícitamente en el código.

## 9. API REST

Todas las rutas están bajo el prefijo `/api` y devuelven JSON.

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/registrar` | Crea una cuenta nueva |
| POST | `/api/auth/login` | Inicia sesión |
| POST | `/api/auth/recuperar` | Genera un código de recuperación para un correo existente |
| POST | `/api/auth/restablecer` | Cambia la contraseña usando el `usuarioId` |
| GET | `/api/usuarios` | Lista todos los usuarios registrados, con su total de clasificaciones |
| PUT | `/api/usuarios/:id/perfil` | Actualiza nombre y rol de un usuario |
| POST | `/api/usuarios/:id/password` | Cambia la contraseña validando la actual |
| POST | `/api/clasificaciones` | Guarda una nueva clasificación |
| GET | `/api/clasificaciones` | Lista el historial de un usuario (filtros: `caneca`, `texto`) |
| DELETE | `/api/clasificaciones/:id` | Elimina un registro del historial |
| POST | `/api/clasificaciones/vaciar` | Vacía todo el historial de un usuario |
| GET | `/api/estadisticas` | Estadísticas de un usuario (`usuarioId`, `periodo`: `semana`\|`mes`\|`todo`) |
| GET | `/api/panel` | Estadísticas agregadas de toda la plataforma (panel institucional) |
| GET | `/api/salud` | Verificación de estado del servidor y ruta de la base de datos |

## 10. Roles de usuario

La plataforma contempla dos roles:

- **Estudiante**
- **Personal de aseo**

El rol se elige al registrarse y puede modificarse después desde el perfil. Se valida tanto en el frontend (lista cerrada de opciones) como en el backend (`ROLES_VALIDOS`), de modo que no es posible registrar un rol distinto a estos dos por fuera de la interfaz.

## 11. Módulos y pantallas

| Pantalla | Ruta | Descripción |
|---|---|---|
| Splash | `/` | Pantalla de bienvenida con animación de marca |
| Inicio de sesión | `/login` | Autenticación de usuarios |
| Registro | `/registro` | Creación de cuenta |
| Recuperar contraseña | `/recuperar` | Flujo de recuperación con código local |
| Inicio | `/inicio` | Resumen personal: acceso rápido al escáner, impacto y accesos directos |
| Escáner IA | `/escanear` | Captura de foto (cámara o galería) y análisis |
| Resultado | `/resultado` | Resultado de la clasificación, confianza y caneca recomendada |
| Historial | `/historial` | Listado filtrable de clasificaciones guardadas |
| Estadísticas | `/estadisticas` | Métricas personales e impacto ambiental estimado |
| Aprende | `/aprende` | Guía educativa por tipo de caneca |
| Perfil | `/perfil` | Datos de cuenta, contribución personal y accesos a otras secciones |
| Usuarios registrados | `/usuarios` | Listado de todas las cuentas de la plataforma (accesible desde Perfil) |
| Panel institucional | `/panel` | Métricas agregadas de toda la plataforma (accesible desde Perfil) |
| Acerca de | `/acerca-de` | Información del proyecto y autores |

## 12. Sistema de clasificación de residuos

La correspondencia entre residuo y caneca vive en `src/data/canecas.ts` y es la misma para todo el proyecto (pantallas de escaneo, resultado, historial, estadísticas y contenido educativo la consultan desde un único lugar):

- **Caneca blanca** — aprovechables: plástico, vidrio, latas, papel y cartón limpios y secos.
- **Caneca verde** — orgánicos aprovechables: restos de comida, cáscaras, residuos vegetales.
- **Caneca negra** — no aprovechables: servilletas usadas, papel higiénico, empaques contaminados, residuos sanitarios.

**Estado actual del detector de IA**: el módulo `src/services/detector.ts` funciona en **modo simulado**: genera una predicción aleatoria (entre un catálogo fijo de residuos) con un nivel de confianza aleatorio, reproduciendo los tiempos y el flujo de una inferencia real. Esto permite construir y probar toda la aplicación sin depender de un modelo entrenado. El código deja explícito el punto de extensión: el día que exista un modelo real (por ejemplo, exportado a TensorFlow.js u ONNX Runtime Web), solo es necesario reemplazar el cuerpo de la función `predecir`, sin tocar ninguna pantalla.

Del mismo modo, las equivalencias de impacto ambiental que se muestran en Estadísticas (árboles, agua, CO₂) son **estimaciones de referencia**, y se presentan siempre marcadas como tales — no provienen de una medición científica directa.

## 13. Diseño visual

- **Paleta institucional** (variables CSS en `src/theme.css`): verde esmeralda `#0B6B4F`, verde tecnológico `#10B981`, azul petróleo `#123B4A`, turquesa `#14B8A6` y lima `#A3E635` como acento puntual. Fondo `#F6F8F7`, texto principal `#15231D`.
- Los colores de caneca (blanca / verde / negra) son información funcional y se mantienen independientes de la paleta de marca.
- **Tipografía**: Poppins para títulos, Inter para el resto de la interfaz.
- **Diseño mobile-first**: la interfaz está optimizada para uso desde el teléfono, con navegación inferior fija y un botón de escaneo destacado.

## 14. Instalación y ejecución

Requisitos: Node.js 22 o superior (usa el módulo `node:sqlite`, sin dependencias nativas que compilar).

```bash
cd ecoclasifica-web
npm install
npm run dev:all
```

Esto levanta a la vez el frontend (`http://localhost:5173`) y la API (`http://localhost:4000`). La aplicación también queda disponible en la IP de red local de la máquina, para abrirla desde un celular conectado a la misma red Wi-Fi.

Scripts disponibles:
- `npm run dev` — solo el frontend.
- `npm run server` — solo la API.
- `npm run build` — build de producción del frontend.

## 15. Limitaciones y trabajo futuro

- El detector de residuos opera en modo simulado (ver sección 12); integrar un modelo real de visión por computador es el siguiente paso natural.
- No hay tokens de sesión ni expiración: la autenticación es adecuada para un entorno académico/demostrativo, no para producción.
- La recuperación de contraseña no envía correos reales.
- El panel institucional muestra métricas reales de usuarios y clasificaciones, pero no contempla aún el concepto de "sedes" o campus múltiples.
