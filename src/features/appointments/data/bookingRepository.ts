// Responsabilidad: escritura de citas (DATA).
// Reserva con POST /citas y cancela con PATCH /citas/:id/cancelar.

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
import { availabilityMock } from './availabilityMock';
import { toAppointment } from './appointmentsRepository';
import type { BookingErrorDto, BookingRequestDto } from './bookingDto';
import { bookingSpecialtiesMock, bookingVeterinariansMock } from './bookingCatalogMock';

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
    if (status === 409) return new HoraNoDisponibleError();
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
  if (!(await isOnline())) throw new SinConexionError();
}

function mockReservation(request: BookingRequest): AppointmentDto {
  const specialty = bookingSpecialtiesMock.find((item) => item.id === request.specialtyId);
  const veterinarian = bookingVeterinariansMock.find((item) => item.id === request.veterinarianId);
  return {
    id: `mock-${Date.now()}`,
    id_mascota: request.petId,
    fecha: `${request.date}T${request.hour}:00`,
    motivo: specialty?.name ?? 'Consulta',
    estado: 'reservada',
    veterinario: veterinarian?.name ?? request.veterinarianId,
  };
}

async function sendReservation(request: BookingRequest): Promise<Appointment> {
  await ensureOnline();

  if (ENV.USE_MOCKS) {
    const dateTime = new Date(`${request.date}T${request.hour}:00`);
    if (
      !request.petId ||
      !request.veterinarianId ||
      !request.specialtyId ||
      !/^\d{4}-\d{2}-\d{2}$/.test(request.date) ||
      !/^\d{2}:\d{2}$/.test(request.hour) ||
      !Number.isFinite(dateTime.getTime()) ||
      dateTime.getTime() <= Date.now()
    ) {
      throw new ReservaInvalidaError(
        'Selecciona una mascota, especialidad, veterinario y una fecha futura válida.',
      );
    }

    const veterinarian = bookingVeterinariansMock.find(
      (item) => item.id === request.veterinarianId,
    );
    if (!veterinarian || !veterinarian.specialtyIds.includes(request.specialtyId)) {
      throw new ReservaInvalidaError('El veterinario no atiende la especialidad seleccionada.');
    }

    if (!availabilityMock.horas.includes(request.hour)) throw new HoraNoDisponibleError();

    const occupied = appointmentsMock.some(
      (appointment) =>
        appointment.estado !== 'cancelada' &&
        (appointment.veterinario === request.veterinarianId ||
          appointment.veterinario === veterinarian.name) &&
        appointment.fecha.slice(0, 10) === request.date &&
        appointment.fecha.slice(11, 16) === request.hour,
    );
    if (occupied) throw new HoraNoDisponibleError();

    const appointment = mockReservation(request);
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
      const isFuture = new Date(appointment.fecha).getTime() > Date.now();
      if (appointment.estado !== 'reservada' || !isFuture) {
        throw new ReservaInvalidaError('Esta cita ya no se puede cancelar.');
      }
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
