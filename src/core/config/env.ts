// Responsabilidad: configuración de entorno (capa CORE).
// Centraliza baseURL y demás variables de entorno para no hardcodear
// valores en el resto de la app.

export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.vetconecta.com',
  API_TIMEOUT_MS: 10000,
  // El backend lo desarrolla otro equipo y todavía no está disponible. Mientras
  // tanto los repositorios de lectura se sirven de datos mock. Cuando la API
  // esté publicada, basta con definir EXPO_PUBLIC_USE_MOCKS=false.
  USE_MOCKS: process.env.EXPO_PUBLIC_USE_MOCKS !== 'false',
  // Permite conectar solo el login y mantener el resto de los módulos con mocks.
  // Sin un valor explícito, conserva la configuración global anterior.
  AUTH_USE_MOCKS:
    (process.env.EXPO_PUBLIC_AUTH_USE_MOCKS ?? process.env.EXPO_PUBLIC_USE_MOCKS) !== 'false',
  // Teléfono de urgencias que abre la tarjeta de emergencia del inicio.
  EMERGENCY_PHONE: process.env.EXPO_PUBLIC_EMERGENCY_PHONE ?? '+56912345678',
};
