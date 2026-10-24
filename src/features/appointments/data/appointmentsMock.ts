// Responsabilidad: datos simulados de citas (capa DATA).
// Mantiene la estructura esperada de GET /citas.
//
// Los datos pueden modificarse en memoria mientras la aplicación
// está ejecutándose, para simular reservas y cancelaciones.

import type { AppointmentDto } from './appointmentsDto';

export const appointmentsMock: AppointmentDto[] = [
  {
    id: 'cita-001',
    id_mascota: 'mascota-001',
    fecha: '2026-09-22T10:30:00.000Z',
    motivo: 'Control anual',
    estado: 'confirmada',
    veterinario: 'Dra. Carla Rojas',
  },
  {
    id: 'cita-002',
    id_mascota: 'mascota-001',
    fecha: '2026-10-05T16:00:00.000Z',
    motivo: 'Vacuna antirrábica',
    estado: 'pendiente',
    veterinario: 'Dr. Manuel Soto',
  },
  {
    id: 'cita-003',
    id_mascota: 'mascota-002',
    fecha: '2026-08-14T09:00:00.000Z',
    motivo: 'Limpieza dental',
    estado: 'completada',
    veterinario: 'Dra. Carla Rojas',
  },
  {
    id: 'cita-004',
    id_mascota: 'mascota-002',
    fecha: '2026-07-30T11:15:00.000Z',
    motivo: 'Revisión por cojera',
    estado: 'cancelada',
    veterinario: 'Dr. Ignacio Pérez',
  },
  {
    // Cita futura reservada para probar D4.
    id: 'cita-005',
    id_mascota: 'mascota-001',
    fecha: '2026-11-18T08:45:00.000Z',
    motivo: 'Desparasitación',
    estado: 'reservada',
    veterinario: 'Dr. Manuel Soto',
  },
];