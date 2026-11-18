// Responsabilidad: constantes con las rutas de la API externa (capa CORE).
// Único lugar donde se escriben paths literales del backend.

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
  },
  CLIENTS: {
    ME: '/clientes/me',
    PASSWORD: '/clientes/me/password',
  },
  PETS: {
    LIST: '/mascotas',
    HEALTH_CARD: (petId: string) => `/mascotas/${petId}/carnet`,
  },
  APPOINTMENTS: {
    LIST: '/citas',
    AVAILABILITY: '/disponibilidad',
    BOOK: '/citas',
    CANCEL: (appointmentId: string) => `/citas/${appointmentId}/cancelar`,
  },
  RATINGS: {
    CREATE: '/calificaciones',
  },
  NOTIFICATIONS: {
    REGISTER_DEVICE: '/dispositivos', // pendiente de acordar con equipo web
  },
  // El api-gateway expone auth-service bajo /v1.
  SESSION: {
    REFRESH: '/v1/auth/refresh', // pendiente de acordar con equipo web
  },
} as const;
