// Responsabilidad: escritura de citas (capa DATA). Reserva con POST /citas y
// cancela con PATCH /citas/:id/cancelar (FR-3 / UC-03, BR-5), y traduce cada
// respuesta HTTP a una cita o a un error de dominio:
//  - 201 → cita creada (estado 'reservada').
//  - 409 → HoraNoDisponibleError (flujo A1: la UI pide otra hora).
//  - 400 → ReservaInvalidaError con el mensaje del backend si viene.
//  - 401 → httpClient ya limpió la sesión y avisó a auth (no hay refresh token
//          todavía, ver httpClient); aquí solo se devuelve un mensaje mostrable.
//
// Antes de enviar se verifica la conectividad: sin red se lanza
// SinConexionError y no se envía nada (flujo A2, la reserva no se encola).
//
// Una segunda llamada mientras la primera sigue en curso no dispara otro
// request: recibe la misma promesa pendiente, así un doble toque no crea dos
// citas aunque la UI no alcance a deshabilitar el botón.
//
// Nota: mientras ENV.USE_MOCKS esté activo, la respuesta se simula localmente
// (la verificación de conectividad sí se hace igual).

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
import type { BookingErrorDto, BookingRequestDto } from './bookingDto';

const RESERVE_ERROR_MESSAGES = {
  unauthorized: 'Tu sesión expiró. Vuelve a iniciar sesión para reservar tu hora.',
  fallback: 'No se pudo reservar la hora. Inténtalo más tarde.',
};

const CANCEL_ERROR_MESSAGES = {
  unauthorized: 'Tu sesión expiró. Vuelve a iniciar sesión para cancelar tu cita.',
  notFound: 'La cita ya no existe.',
  fallback: 'No se pudo cancelar la cita. Inténtalo más tarde.',
};

function toBookingRequestDto(request: BookingRequest): BookingRequestDto {
  return {
    id_mascota: request.petId,
    id_veterinario: request.veterinarianId,
    id_especialidad: request.specialtyId,
    fecha: request.date,
    hora: request.hour,
  };
}

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

async function ensureOnline(): Promise<void> {
  if (!(await isOnline())) {
    throw new SinConexionError();
  }
}

function mockReservation(request: BookingRequest): AppointmentDto {
  return {
    id: `mock-${Date.now()}`,
    id_mascota: request.petId,
    fecha: `${request.date}T${request.hour}:00`,
    motivo: 'Consulta',
    estado: 'reservada',
    veterinario: request.veterinarianId,
  };
}

async function sendReservation(request: BookingRequest): Promise<Appointment> {
  await ensureOnline();

  if (ENV.USE_MOCKS) {
    return toAppointment(mockReservation(request));
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

  async cancel(appointmentId: string): Promise<Appointment> {
    await ensureOnline();

    if (ENV.USE_MOCKS) {
      const appointment = appointmentsMock.find((dto) => dto.id === appointmentId);
      if (!appointment) throw new Error(CANCEL_ERROR_MESSAGES.notFound);
      return { ...toAppointment(appointment), status: 'cancelada' };
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
