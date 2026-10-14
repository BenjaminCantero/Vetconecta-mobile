// Responsabilidad: entidad de negocio Appointment
// Capa DOMAIN de appointments.

export type AppointmentStatus =
  | 'reservada'
  | 'pendiente'
  | 'confirmada'
  | 'cancelada'
  | 'completada';

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
}