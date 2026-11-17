// Responsabilidad: entidad de negocio Appointment
// Capa DOMAIN de appointments.

export type AppointmentStatus =
  'reservada' | 'pendiente' | 'confirmada' | 'cancelada' | 'completada' | 'realizada';

// Calificación de una consulta veterinaria.
export interface AppointmentRating {
  estrellas: 1 | 2 | 3 | 4 | 5;
  comentario?: string;
}

export interface Appointment {
  id: string;

  // Identificador de la mascota asociada.
  petId: string;

  // Fecha y hora en formato ISO 8601.
  date: string;

  // Motivo de la consulta.
  reason: string;

  // Estado actual de la cita.
  status: AppointmentStatus;

  // Veterinario asignado.
  veterinarian: string;

  // Especialidad, cuando esté disponible en los datos.
  specialty?: string;

  // Indica si la cita ya fue calificada.
  calificada?: boolean;

  // Calificación registrada de la consulta.
  calificacion?: AppointmentRating;
}
