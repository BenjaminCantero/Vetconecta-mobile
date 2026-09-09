// Responsabilidad: configuración de entorno (capa CORE).
// Centraliza baseURL y demás variables de entorno para no hardcodear
// valores en el resto de la app.

export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.vetconecta.com',
  API_TIMEOUT_MS: 10000,
};
