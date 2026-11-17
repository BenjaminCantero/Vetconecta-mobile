// Responsabilidad: datos simulados de citas (capa DATA).
// Mantiene la estructura esperada de GET /citas.
//
// Los datos pueden modificarse en memoria mientras la aplicación
// está ejecutándose, para simular reservas, cancelaciones y calificaciones.

import type { AppointmentDto } from './appointmentsDto';

export const appointmentsMock: AppointmentDto[] = [
  {
    id: 'cita-001',
    id_mascota: 'mascota-001',
    fecha: '2026-09-22T10:30:00.000Z',
    motivo: 'Control anual',
    estado: 'confirmada',
    veterinario: 'Dra. Carla Rojas',
    calificada: false,
  },
  {
    id: 'cita-002',
    id_mascota: 'mascota-001',
    fecha: '2026-10-05T16:00:00.000Z',
    motivo: 'Vacuna antirrábica',
    estado: 'pendiente',
    veterinario: 'Dr. Manuel Soto',
    calificada: false,
  },
  {
    id: 'cita-003',
    id_mascota: 'mascota-002',
    fecha: '2026-08-14T09:00:00.000Z',
    motivo: 'Limpieza dental',
    estado: 'completada',
    veterinario: 'Dra. Carla Rojas',
    calificada: false,
  },
  {
    id: 'cita-004',
    id_mascota: 'mascota-002',
    fecha: '2026-07-30T11:15:00.000Z',
    motivo: 'Revisión por cojera',
    estado: 'cancelada',
    veterinario: 'Dr. Ignacio Pérez',
    calificada: false,
  },
  {
    // Cita futura reservada para probar D4.
    id: 'cita-005',
    id_mascota: 'mascota-001',
    fecha: '2026-11-18T08:45:00.000Z',
    motivo: 'Desparasitación',
    estado: 'reservada',
    veterinario: 'Dr. Manuel Soto',
    calificada: false,
  },
  {
    // Cita realizada pendiente de calificación (H3).
    id: 'cita-006',
    id_mascota: 'mascota-001',
    fecha: '2026-08-10T11:00:00.000Z',
    motivo: 'Control veterinario',
    estado: 'realizada',
    veterinario: 'Dra. Carla Rojas',
    calificada: false,
  },
  {
    // Cita realizada y calificada (H3).
    id: 'cita-007',
    id_mascota: 'mascota-001',
    fecha: '2026-07-15T10:00:00.000Z',
    motivo: 'Consulta general',
    estado: 'realizada',
    veterinario: 'Dr. Manuel Soto',
    calificada: true,
    calificacion: {
      estrellas: 5,
      comentario: 'Excelente atención veterinaria.',
    },
  },
];
