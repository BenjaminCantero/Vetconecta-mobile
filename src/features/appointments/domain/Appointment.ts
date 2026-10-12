// Responsabilidad: entidad de negocio Appointment (capa DOMAIN de appointments).

export type AppointmentStatus =
  'reservada' | 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

export interface Appointment {
  id: string;
  petId: string;
  date: string; // ISO 8601
  reason: string;
  status: AppointmentStatus;
  veterinarian: string;
}
