// Responsabilidad: caso de uso de reserva y cancelación de horas (capa DOMAIN
// de appointments). Define el contrato BookingRepository (implementado en la
// capa data) y expone `reserve`/`cancel` con su estado de envío.
//
// Los errores de dominio (HoraNoDisponibleError, SinConexionError,
// ReservaInvalidaError) se relanzan tal cual para que la UI decida el flujo:
// ante HoraNoDisponibleError debe pedir otra hora y recargar disponibilidad.

import { useCallback, useRef, useState } from 'react';

import type { Appointment } from './Appointment';

export interface BookingRequest {
  petId: string;
  veterinarianId: string;
  specialtyId: string;
  date: string; // YYYY-MM-DD
  hour: string; // HH:mm
}

export interface BookingRepository {
  reserve: (request: BookingRequest) => Promise<Appointment>;
  cancel: (appointmentId: string) => Promise<Appointment>;
}

export function useBookAppointment(bookingRepository: BookingRepository) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  // Un ref (y no solo el estado) bloquea un segundo toque que llega antes de
  // que React vuelva a renderizar con isSubmitting = true.
  const inFlight = useRef(false);

  const run = useCallback(async <T>(operation: () => Promise<T>): Promise<T | null> => {
    if (inFlight.current) return null;

    inFlight.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      return await operation();
    } catch (err) {
      const domainError = err instanceof Error ? err : new Error('Error al procesar la reserva');
      setError(domainError);
      throw domainError;
    } finally {
      inFlight.current = false;
      setIsSubmitting(false);
    }
  }, []);

  const reserve = useCallback(
    (request: BookingRequest) => run(() => bookingRepository.reserve(request)),
    [bookingRepository, run],
  );

  const cancel = useCallback(
    (appointmentId: string) => run(() => bookingRepository.cancel(appointmentId)),
    [bookingRepository, run],
  );

  return { reserve, cancel, isSubmitting, error };
}
