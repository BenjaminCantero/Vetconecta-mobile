# Vetconecta-mobile

App móvil de VetConecta para dueños de mascotas: mascotas, carnet veterinario, historial clínico y citas. Construida con Expo (SDK 57), React Native y TypeScript.

La arquitectura (capas, dominios y reglas de frontera) está documentada en [src/README.md](src/README.md).

## Requisitos

- **Node.js** `20.19.4+`, `22.13+` o `24.3+` (lo exige React Native 0.86).
- **npm** (viene con Node).
- Para correr en Android: **Android Studio** con un emulador configurado o un dispositivo físico con depuración USB, y **JDK 17**.
- Para correr en iOS: macOS con **Xcode**.

## Instalación

```bash
git clone <url-del-repositorio>
cd Vetconecta-mobile
npm install
```

## Variables de entorno

El backend lo desarrolla otro equipo. Mientras no esté disponible, la app funciona con **datos mock** y no necesita configuración.

Para conectarse a la API real, crear un archivo `.env.local` en la raíz (ya está ignorado por git):

```bash
EXPO_PUBLIC_USE_MOCKS=false
EXPO_PUBLIC_API_BASE_URL=https://url-del-backend
```

| Variable | Por defecto | Uso |
|---|---|---|
| `EXPO_PUBLIC_USE_MOCKS` | activo | `false` para usar la API real en vez de los mocks |
| `EXPO_PUBLIC_AUTH_USE_MOCKS` | hereda `EXPO_PUBLIC_USE_MOCKS` | `false` para conectar el login independientemente de los demás módulos |
| `EXPO_PUBLIC_API_BASE_URL` | `https://api.vetconecta.com` | URL base del backend |

Después de cambiar estas variables hay que reiniciar el servidor con `npx expo start --clear`.

### Conectar el login con el backend local

Actualmente **solo el login** está adaptado al backend. Registro y recuperación de contraseña siguen simulados porque sus endpoints todavía no están implementados en el backend. Para probar el login real manteniendo mascotas, citas y perfil con datos simulados, configura los interruptores por separado:

La URL base debe apuntar al **api-gateway** (puerto `3000`), no directamente a auth-service. El prefijo `/v1` ya está incluido en `ENDPOINTS.AUTH.LOGIN`.

```bash
# .env.local
EXPO_PUBLIC_USE_MOCKS=true
EXPO_PUBLIC_AUTH_USE_MOCKS=false
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000
```

| Dónde corre la app | URL base |
|---|---|
| Emulador Android | `http://10.0.2.2:3000` |
| Simulador iOS | `http://localhost:3000` |
| Dispositivo físico | `http://IP-LAN-DE-TU-PC:3000` |

Antes de probar, levanta en el backend el `api-gateway` y `auth-service`, y usa un usuario que ya exista en la base de datos. Ambos servicios deben compartir el mismo `JWT_SECRET`. El login envía `{ identifier, password }` y espera `{ id, email, role, accessToken }`.

## Iniciar el proyecto

El proyecto usa `expo-dev-client`, así que se ejecuta como **development build** (una app propia instalada en el emulador o dispositivo), no dentro de Expo Go.

### Primera vez: compilar e instalar la app

Con el emulador abierto o el dispositivo conectado:

```bash
npm run android   # compila e instala la app en Android
npm run ios       # solo en macOS
```

Este paso genera la carpeta nativa (`android/` o `ios/`), tarda varios minutos y deja el servidor de desarrollo corriendo. Solo hay que repetirlo si se agrega una dependencia con código nativo.

### Día a día

Con la app ya instalada, basta con levantar el servidor y abrirla:

```bash
npm start
```

En la terminal: `a` abre en Android, `r` recarga, `m` abre el menú de desarrollo.

### Alternativa con Expo Go

```bash
npx expo start --go
```

Solo funciona si la versión de Expo Go instalada en el teléfono soporta el SDK 57. Si muestra "Project is incompatible with this version of Expo Go", usar la development build.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm start` | Servidor de desarrollo (Metro) |
| `npm run android` | Compila e instala la app en Android |
| `npm run ios` | Compila e instala la app en iOS (macOS) |
| `npm run lint` | ESLint, incluidas las reglas de frontera entre dominios |
| `npm run format` | Formatea el código con Prettier |
| `npm run format:check` | Comprueba el formato sin modificar archivos |
| `npm run typecheck` | Verifica tipos de TypeScript |
| `npm test -- --ci --runInBand` | Ejecuta los tests como lo hace CI |

`npm run web` existe en `package.json`, pero la web no está configurada (faltan `react-dom` y `react-native-web`).

## CI/CD

GitHub Actions automatiza las comprobaciones y los builds de Expo:

- **CI** (`.github/workflows/ci.yml`) se ejecuta en cada pull request y en cada push a `Develop` o `main`. Instala dependencias de forma reproducible y valida lint, formato, tipos y tests.
- **CD** (`.github/workflows/eas-build.yml`) crea un build EAS de **preview Android** al integrar en `Develop`, y uno de **producción Android** al integrar en `main`. También puede ejecutarse manualmente desde la pestaña **Actions**, escogiendo plataforma y perfil.

### Configuración única de CD

1. Crear una cuenta/proyecto en [Expo](https://expo.dev/) con acceso al proyecto `vetconecta-mobile`.
2. Generar un token personal de Expo y guardarlo en GitHub: **Settings → Secrets and variables → Actions → New repository secret**, con el nombre `EXPO_TOKEN`.
3. Si se usan notificaciones Android, subir `google-services.json` como variable de entorno de tipo **file** en EAS con el nombre `GOOGLE_SERVICES_JSON`. No se sube al repositorio.
4. En GitHub, proteger `Develop` y `main`: exigir el check **Lint, tipos y tests** antes del merge y bloquear pushes directos a `main`.

Los builds terminados y sus enlaces de instalación se consultan en el dashboard de Expo. La subida a Google Play o App Store queda separada y debe hacerse tras aprobar un build de producción, usando `eas submit`; así no se publica una versión por cada merge.

## Problemas comunes

- **`Cannot find module 'babel-preset-expo'`** o módulos faltantes tras `npm install`: algunas versiones de npm no instalan todas las dependencias transitivas. Borrar `node_modules` y `package-lock.json` y volver a correr `npm install`, o instalar el paquete faltante con `npx expo install <paquete>`.
- **`npm run lint` falla con `Cannot find module 'eslint-plugin-boundaries'`**: faltan dependencias de desarrollo. Correr `npm install`.
- **Cambios que no se reflejan** (variables de entorno, configuración de Babel o NativeWind): `npx expo start --clear`.

## Convención Git

### Evolución del flujo

**Modalidad inicial:** cada integrante trabajaba en su propia rama personal y se traían los cambios entre ramas directamente (rama ↔ rama), sin una rama de integración común.

**Modalidad vigente:** se incorpora una rama `develop` como punto único de integración. `main` queda reservado para el producto final.

### Ramas

- **main** — Producto final. Intocable durante el desarrollo. Solo recibe código estable al cierre del sprint. Nunca se trabaja directo sobre ella.
- **develop** — Rama de integración. Punto de encuentro del trabajo de todos; es la fuente de verdad del estado actual del equipo.
- **Ramas personales** (`NicoArriagada`, `BenjaCantero`, `RicardoGarces`) — Cada integrante trabaja en la suya y resuelve ahí sus tareas asignadas.

### Ciclo de trabajo

**Antes de empezar / retomar** — traer lo último integrado a tu rama:

    git fetch origin
    git merge origin/develop

**Al terminar una tarea** — commitearla (un commit por tarea) y llevarla a `develop`:

    git add <archivos de la tarea>     # selectivo: solo lo de esa tarea
    git commit -m "feat(B5): ..."
    git checkout develop
    git pull
    git merge <tu-rama-personal>
    git push origin develop
    git checkout <tu-rama-personal>

Luego **avisar al equipo** que `develop` se actualizó, para que los demás la integren a sus ramas.

**Regla de oro:** sincronizar seguido. Mientras más tiempo pasa sin subir a `develop` ni bajar de ella, más grande y difícil es el merge posterior.

### Convención de commits

**Un commit por tarea específica.** Aunque una sesión abarque varias tareas, cada una se commitea por separado usando `git add` selectivo. Así el historial deja claro qué commit resolvió qué.

Formato (Conventional Commits):

    <tipo>(<código-tarea>): <descripción breve, en minúscula, sin punto final>

Tipos: `feat` (funcionalidad), `fix` (corrección), `docs` (documentación), `refactor`, `chore`, `test`.

Ejemplos:

    feat(B2): agregar caso de uso usePets sobre el servicio GET de mascotas
    feat(B3): agregar servicio de lectura del carnet y eventos clínicos
    feat(B5): manejo de estados de carga, error y respuesta vacía en GET
    fix(C1): ajustar pantallas de bienvenida, login y recuperar acceso
    docs(A3): documentar flujo de ramas y convenciones del equipo

### Cierre de sprint

Al final del sprint, `develop` se fusiona a `main`, que queda con el producto integrado y estable, listo para entregar.

## Notificaciones push (FCM / APNs)

La app recibe recordatorios de citas y controles con [`expo-notifications`](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/). El backend (Web H1) los envía por **Firebase Cloud Messaging** usando el **mismo proyecto de Firebase** que la app.

> **No subir credenciales al repositorio.** `google-services.json`, `GoogleService-Info.plist`, las claves `.p8` y las cuentas de servicio de Firebase están en `.gitignore`. Se comparten por el canal privado del equipo.

### Configuración (una vez por integrante)

1. Pedir a Web H1 acceso como miembro del proyecto de Firebase.
2. **Android:** en Firebase → *Configuración del proyecto* → *Tus apps*, la app Android debe estar registrada con el package `com.anonymous.vetconectamobile` (el de `app.json`). Descargar `google-services.json` y dejarlo en la **raíz del repo**.
3. Instalar la librería (solo la primera vez que se integra esta rama):

   ```bash
   npx expo install expo-notifications
   ```

4. Compilar la development build (las push **no funcionan en Expo Go** en Android):

   ```bash
   npm run android
   ```

   Si falta `google-services.json`, la app compila igual pero sin push (lo avisa `app.config.js`).

### iOS (solo si el equipo tiene cuenta de Apple Developer pagada)

- En Apple Developer → *Keys*, crear una clave con **Apple Push Notifications service (APNs)** y descargar el `.p8` (se descarga una sola vez). Anotar el *Key ID* y el *Team ID*.
- Registrar la app iOS en Firebase con el bundle `com.anonymous.vetconectamobile` y cargar la clave `.p8` en *Cloud Messaging → Configuración de apps de Apple*.
- **Limitación conocida:** con `expo-notifications`, iOS entrega un token de **APNs**, no de FCM. La consola de Firebase solo envía a tokens de FCM, así que en iOS el envío de prueba debe hacerse con APNs directo. La app informa al backend el tipo de token (`proveedor: 'fcm' | 'apns'`).

### Probar desde la consola de Firebase

1. Abrir la app, iniciar sesión y aceptar el permiso. En la consola de Metro aparece:

   ```
   [push] Token android del dispositivo:
   <token>
   ```

2. En Firebase → *Messaging* → nueva campaña de *Notificaciones*: escribir título y texto.
3. En *Opciones adicionales*: canal de Android `recordatorios` y, en *Datos personalizados*, la clave `citaId` con el id de una cita (con los mocks: `cita-005`).
4. Volver al primer paso → *Enviar mensaje de prueba* → pegar el token.

| Estado de la app | Qué debe pasar |
|---|---|
| Abierta | Aparece el banner del sistema |
| En segundo plano | Aparece en la bandeja; al tocarla abre *Mis citas* con la cita destacada |
| Cerrada (deslizada fuera de recientes) | Igual que en segundo plano; si no hay sesión, primero pide login |

Sin `citaId`, al tocar se abre la pestaña *Avisos* (centro de notificaciones). No usar *Forzar detención* para probar "cerrada": Android no entrega notificaciones a una app detenida a la fuerza hasta que se abra de nuevo.
