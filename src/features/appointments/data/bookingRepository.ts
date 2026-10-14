// Responsabilidad: escritura de citas (capa DATA).
// Reserva con POST /citas y cancela con PATCH /citas/:id/cancelar.
//
// Maneja errores de dominio y verifica conectividad antes de enviar
// solicitudes de reserva o cancelación.

import { isAxiosError } from 'axios';

import { httpClient } from '../../../core/api/httpClient';
import { ENDPOINTS } from '../../../core/api/endpoints';
import { toHttpError } from '../../../core/api/httpError';
import { ENV } from '../../../core/config/env';
import { isOnline } from '../../../core/network/connectivity';

import type { Appointment } from '../domain/Appointment';

import {
  HoraNoDisponibleError,
  ReservaInvalidaError,
  SinConexionError,
} from '../domain/bookingErrors';

import type { BookingRequest } from '../domain/useBookAppointment';
import type { AppointmentDto } from './appointmentsDto';

import { appointmentsMock } from './appointmentsMock';
import { toAppointment } from './appointmentsRepository';

import type {
  BookingErrorDto,
  BookingRequestDto,
} from './bookingDto';

// Mensajes de error al reservar.
const RESERVE_ERROR_MESSAGES = {
  unauthorized:
    'Tu sesión expiró. Vuelve a iniciar sesión para reservar tu hora.',
  fallback:
    'No se pudo reservar la hora. Inténtalo más tarde.',
};

// Mensajes de error al cancelar.
const CANCEL_ERROR_MESSAGES = {
  unauthorized:
    'Tu sesión expiró. Vuelve a iniciar sesión para cancelar tu cita.',
  notFound:
    'La cita ya no existe.',
  fallback:
    'No se pudo cancelar la cita. Inténtalo más tarde.',
};

// Convierte la solicitud del dominio al DTO esperado por la API.
function toBookingRequestDto(
  request: BookingRequest,
): BookingRequestDto {
  return {
    id_mascota: request.petId,
    id_veterinario: request.veterinarianId,
    id_especialidad: request.specialtyId,
    fecha: request.date,
    hora: request.hour,
  };
}

// Traduce errores HTTP a errores del dominio.
function toReserveError(error: unknown): Error {
  if (isAxiosError<BookingErrorDto>(error)) {
    const status = error.response?.status;

    if (status === 409) {
      return new HoraNoDisponibleError();
    }

    if (status === 400) {
      const message = error.response?.data?.mensaje;

      return typeof message === 'string' && message
        ? new ReservaInvalidaError(message)
        : new ReservaInvalidaError();
    }
  }

  return toHttpError(error, RESERVE_ERROR_MESSAGES);
}

// Comprueba que exista conexión antes de escribir.
async function ensureOnline(): Promise<void> {
  if (!(await isOnline())) {
    throw new SinConexionError();
  }
}

// Genera una cita simulada mientras no exista backend.
function mockReservation(
  request: BookingRequest,
): AppointmentDto {
  return {
    id: `mock-${Date.now()}`,
    id_mascota: request.petId,
    fecha: `${request.date}T${request.hour}:00`,
    motivo: 'Consulta',
    estado: 'reservada',
    veterinario: request.veterinarianId,
  };
}

// Realiza la reserva.
async function sendReservation(
  request: BookingRequest,
): Promise<Appointment> {
  await ensureOnline();

  if (ENV.USE_MOCKS) {
    const appointment = mockReservation(request);

    // Guarda la nueva reserva para que aparezca al consultar Mis citas.
    appointmentsMock.push(appointment);

    return toAppointment(appointment);
  }

  try {
    const { data } = await httpClient.post<AppointmentDto>(
      ENDPOINTS.APPOINTMENTS.BOOK,
      toBookingRequestDto(request),
    );

    return toAppointment(data);
  } catch (error) {
    throw toReserveError(error);
  }
}

// Evita reservas duplicadas por múltiples pulsaciones.
let pendingReservation: Promise<Appointment> | null = null;

export const bookingRepository = {
  reserve(request: BookingRequest): Promise<Appointment> {
    if (!pendingReservation) {
      pendingReservation = sendReservation(request).finally(() => {
        pendingReservation = null;
      });
    }

    return pendingReservation;
  },

  // Cancela una cita existente.
  async cancel(appointmentId: string): Promise<Appointment> {
    await ensureOnline();

    if (ENV.USE_MOCKS) {
      const appointment = appointmentsMock.find(
        (dto) => dto.id === appointmentId,
      );

      if (!appointment) {
        throw new Error(CANCEL_ERROR_MESSAGES.notFound);
      }

      // Solo se pueden cancelar citas futuras y reservadas.
      const isFuture =
        new Date(appointment.fecha).getTime() > Date.now();

      if (appointment.estado !== 'reservada' || !isFuture) {
        throw new ReservaInvalidaError(
          'Esta cita ya no se puede cancelar.',
        );
      }

      // Modifica el objeto original del mock.
      // Así, getAppointments() devolverá el nuevo estado.
      appointment.estado = 'cancelada';

      return toAppointment(appointment);
    }

    try {
      const { data } = await httpClient.patch<AppointmentDto>(
        ENDPOINTS.APPOINTMENTS.CANCEL(appointmentId),
      );

      return toAppointment(data);
    } catch (error) {
      throw toHttpError(error, CANCEL_ERROR_MESSAGES);
    }
  },
};