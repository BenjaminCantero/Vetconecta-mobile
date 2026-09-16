// Superficie publica del dominio appointments
export { useAppointments } from './domain/useAppointments';
export type { AppointmentsRepository } from './domain/useAppointments';
export type { Appointment, AppointmentStatus } from './domain/Appointment';
export { appointmentsRepository } from './data/appointmentsRepository';
export { default as AppointmentsScreen } from './presentation/screens/AppointmentsScreen';
