# VetConecta — Arquitectura

Clean Architecture organizada por features. Tres capas por feature, dependencias siempre hacia adentro:

```
presentation → domain ← data
```

- **presentation** (UI) solo llama casos de uso de `domain`. No importa Axios ni AsyncStorage.
- **domain** (negocio) es el centro: entidades y casos de uso. No depende de nadie, ni de `presentation` ni de `data`.
- **data** (infraestructura) implementa el acceso a datos (API REST, AsyncStorage). Depende de `domain` (importa sus entidades y contratos), nunca al revés.

Para que `domain` pueda invocar operaciones de `data` sin depender de ella, cada caso de uso define una interfaz de repositorio (ej. `AuthRepository` en `features/auth/domain/useAuth.ts`, `AppointmentsRepository` en `features/appointments/domain/useAppointments.ts`). La capa `data` implementa esa interfaz. `presentation` actúa como composition root: importa la implementación concreta de `data` y se la inyecta al caso de uso de `domain`.

## Dónde va cada tipo de código

| Carpeta | Contenido |
|---|---|
| `core/api` | Cliente HTTP (Axios) y constantes de endpoints |
| `core/storage` | Wrapper tipado sobre AsyncStorage |
| `core/config` | Variables de entorno (baseURL, timeouts) |
| `core/navigation` | Stack raíz y tabs, compartidos por toda la app |
| `core/theme` | Colores y tipografía |
| `features/<feature>/data` | Repositorios (llaman `core/api/httpClient`) y DTOs |
| `features/<feature>/domain` | Entidades y casos de uso (hooks `useX`) |
| `features/<feature>/presentation` | Pantallas y componentes de esa feature |
| `shared/components` | Componentes de UI genéricos, sin lógica de negocio |
| `shared/hooks` | Hooks reutilizables no atados a un feature (ej. `useFetch`) |
| `shared/utils` | Funciones puras reutilizables (formateo, validación) |

## Etapa actual

La API externa solo expone lectura (GET). Por eso:

- `petsRepository` y `appointmentsRepository` solo tienen métodos GET.
- `authRepository.login` resuelve la sesión localmente (mock) hasta que el backend habilite `POST /auth/login`.
- `features/notifications` está scaffoldeado pero sin repositorio real: pendiente de endpoint.

## Ejemplo de flujo: "ver mis mascotas"

1. **presentation** — `features/pets/presentation/screens/MyPetsScreen.tsx` monta y llama `useFetch(() => petsRepository.getMyPets())`.
2. **data** — `petsRepository.getMyPets()` usa `core/api/httpClient` (Axios con interceptor JWT) para hacer `GET /mascotas` (`core/api/endpoints.ts`), y mapea cada `PetDto` a la entidad `Pet` del dominio.
3. **domain** — `Pet` (entidad) y `calculateAge` (regla de negocio) se usan en la UI (`PetCard`) sin que esta conozca cómo se obtuvieron los datos.
4. **presentation** — `MyPetsScreen` renderiza la lista con `PetCard`, y al tocar una tarjeta navega a `PetDetailScreen` → `HealthCardScreen`, que repite el mismo flujo con `petsRepository.getHealthCard(petId)`.

En ningún punto `MyPetsScreen` importa Axios o AsyncStorage: solo conoce `petsRepository` (una función) y las entidades del dominio.

# Arquitectura por dominios (A2 - Nicolas)

> Fusionar esta sección dentro de `src/README.md`.

La app se divide primero por dominio (auth, pets, appointments, notifications) y,
dentro de cada dominio, por capa (presentation / domain / data).

## Estructura

```
src/
  features/
    auth/          { data, domain, presentation }   entidad User
    pets/          { data, domain, presentation }   entidad Pet
    appointments/  { data, domain, presentation }   entidad Appointment
    notifications/ { data, domain, presentation }   entidad Notification
    home/          transversal: solo LEE de otros dominios (no posee entidad)
  core/            api (httpClient -> gateway), navigation, storage, theme, config
  shared/          components, hooks, utils, context (mascota activa)
```

## Reglas de frontera

1. Ningun dominio importa de otro dominio.
2. Solo `home` puede leer de varios dominios, y solo por su superficie pública
   (el barrel / hook), nunca por su carpeta `data/`. Dirección única: home -> dominios.
3. El estado compartido (mascota activa) vive en `shared/context`, fuera de los dominios.
4. Cada dominio expone su superficie pública en `features/<dominio>/index.ts`
   (barrel). Todo lo no exportado ahí es interno.

Estas reglas están blindadas con `eslint-plugin-boundaries` (ver `eslint.config.js`):
violar una frontera es un error de lint, no un acuerdo verbal.

## Decisiones de alcance

- `clinical` (carnet + historial): se mantiene dentro de `pets` por ahora; costura
  documentada para extraerlo a dominio propio si crece.
- `feedback`: fuera del MVP (es POST; la API aún no lo expone).
- checklist de tratamientos: plegado en `notifications` (notificaciones locales).

## Definición de terminado

- [ ] Ningún import cruza de un feature a otro (verificable con grep / lint).
- [ ] Ninguna pantalla ni home importa desde `data/` de otro dominio.
- [ ] Los 4 dominios nombrados existen, están aislados y exponen su barril.
- [ ] home y la mascota activa están fuera de los dominios.
- [ ] Las reglas de frontera están activas en ESLint.
