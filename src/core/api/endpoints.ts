// Responsabilidad: constantes con las rutas de la API externa (capa CORE).
// Único lugar donde se escriben paths literales del backend.

export const ENDPOINTS = {
  AUTH: {
    // El api-gateway expone auth-service bajo el prefijo /v1.
    LOGIN: '/v1/auth/login',
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
  NOTIFICATIONS: {
    REGISTER_DEVICE: '/dispositivos', // pendiente de acordar con equipo web
  },
} as const;
