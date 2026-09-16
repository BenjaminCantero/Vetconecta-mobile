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
};
