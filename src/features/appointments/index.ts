// Superficie pública del dominio appointments.

export { useAppointments } from './domain/useAppointments';
export type { AppointmentsRepository } from './domain/useAppointments';

export type { Appointment, AppointmentStatus, AppointmentRating } from './domain/Appointment';

export {
  appointmentsRepository,
  canRateAppointment,
  isCompletedAppointment,
  AppointmentAlreadyRatedError,
} from './data/appointmentsRepository';

export { default as AppointmentsScreen } from './presentation/screens/AppointmentsScreen';

export { default as BookAppointmentScreen } from './presentation/screens/BookAppointmentScreen';

export { useAvailability } from './domain/useAvailability';
export type { AvailabilityRepository } from './domain/useAvailability';

export { availabilityRepository } from './data/availabilityRepository';
export type { AvailabilityQuery } from './data/availabilityRepository';

export { useBookAppointment } from './domain/useBookAppointment';

export type { BookingRepository, BookingRequest } from './domain/useBookAppointment';

export {
  HoraNoDisponibleError,
  ReservaInvalidaError,
  SinConexionError,
} from './domain/bookingErrors';

export { bookingRepository } from './data/bookingRepository';

// H3: componentes públicos para la calificación post-consulta.
export { AppointmentCard } from './presentation/components/AppointmentCard';

export { AppointmentRatingModal } from './presentation/components/AppointmentRatingModal';
