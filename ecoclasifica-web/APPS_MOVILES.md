# EcoClasifica en el celular (Android y iPhone)

La app usa **Capacitor**: el mismo código React se empaqueta como app nativa.
Carpetas: `android/` (Android Studio) e `ios/` (Xcode).

## 1. Configurar la URL del servidor

Las apps no tienen el proxy de Vite, así que necesitan saber dónde está la API.
Edita `.env` (copia de `.env.example`):

```
VITE_API_URL=http://192.168.1.68:4000
```

- Red local: pon la IP de tu PC (comando `ipconfig`) y arranca la API con `npm run server`. El celular debe estar en la misma Wi-Fi.
- Servidor publicado: pon la URL `https://...` del backend desplegado.

Cada vez que cambies el código o el `.env`: `npm run cap:sync`.

## 2. Android — generar el APK (Windows)

Requisitos: Node 18+, Android Studio (incluye el SDK y Java).

```
npm install
npm run android:apk
```

El APK queda en `android/app/build/outputs/apk/debug/app-debug.apk`.
Pásalo al celular y ábrelo (activa "Instalar apps de origen desconocido").

Alternativa gráfica: `npm run android:open` → en Android Studio *Build → Build App Bundle(s)/APK(s) → Build APK(s)*.

Si Gradle no encuentra el SDK, crea `android/local.properties` con:
`sdk.dir=C\:\\Users\\User\\AppData\\Local\\Android\\Sdk`

## 3. iPhone (iOS)

Apple solo permite compilar apps iOS en una **Mac con Xcode**.

```
npm install
npm run ios:open
```

En Xcode: selecciona el target *App → Signing & Capabilities*, elige tu Apple ID (Team),
conecta el iPhone y pulsa ▶ Run. Para distribuir (TestFlight / App Store) se necesita
la cuenta Apple Developer (USD 99/año).

Ya están configurados los permisos de cámara/fotos y el acceso HTTP a la red local (`ios/App/App/Info.plist`).

## 4. Compilar automáticamente en GitHub (sin instalar nada)

El archivo `.github/workflows/apps-moviles.yml` compila el APK de Android y una
versión de iOS para simulador cada vez que se hace push a `main`.
Descarga el APK desde GitHub → *Actions* → la última ejecución → *Artifacts*.
Para cambiar la URL de la API ahí: *Settings → Secrets and variables → Actions → Variables* → `VITE_API_URL`.
