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
| `EXPO_PUBLIC_API_BASE_URL` | `https://api.vetconecta.com` | URL base del backend |

Después de cambiar estas variables hay que reiniciar el servidor con `npx expo start --clear`.

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
| `npx tsc --noEmit` | Verifica tipos de TypeScript |

`npm run web` existe en `package.json`, pero la web no está configurada (faltan `react-dom` y `react-native-web`).

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

### Mejora identificada (próximo sprint)

Migrar de ramas personales a **ramas por tarea** (`feat/B5-...`) que entren a `develop` de forma aislada y revisable.
