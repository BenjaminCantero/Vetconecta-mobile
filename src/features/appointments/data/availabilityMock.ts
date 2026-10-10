// Responsabilidad: datos de ejemplo de disponibilidad (capa DATA).
// Reproducen la forma exacta de la respuesta esperada de GET /disponibilidad,
// para que el mapeo sea el mismo con mock y con backend. Se usan solo mientras
// ENV.USE_MOCKS está activo; cuando el otro equipo publique la API, este
// archivo se elimina junto con su rama en el repositorio.

import type { AvailabilityDto } from './availabilityDto';

export const availabilityMock: AvailabilityDto = {
  horas: ['09:00', '09:30', '10:30', '11:00', '15:00', '16:30'],
};
