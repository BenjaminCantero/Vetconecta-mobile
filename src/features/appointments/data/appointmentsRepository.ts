// Responsabilidad: acceso a datos de citas (capa DATA).
// Llama a la API externa vía httpClient (GET, solo lectura) y mapea los
// DTO recibidos a la entidad del dominio Appointment.
//
// Nota: el backend lo desarrolla otro equipo y aún no está disponible, así que
// mientras ENV.USE_MOCKS esté activo la lista sale de `appointmentsMock`. El
// mapeo y la validación son los mismos en ambos caminos.
//
// El filtrado "citas del dueño autenticado" es responsabilidad del backend:
// httpClient ya envía el JWT en cada request. Si la API terminara exigiendo un
// query param (por ejemplo ?id_dueno=), se agrega aquí y en `endpoints.ts`.

import { isAxiosError } from 'axios';

import { httpClient } from '../../../core/api/httpClient';
import { ENDPOINTS } from '../../../core/api/endpoints';
import { ENV } from '../../../core/config/env';
import type { Appointment, AppointmentStatus } from '../domain/Appointment';
import type { AppointmentDto } from './appointmentsDto';
import { appointmentsMock } from './appointmentsMock';

const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  'pendiente',
  'confirmada',
  'cancelada',
  'completada',
];

// El backend podría devolver un estado que el dominio no conoce (valor nuevo,
// error de tipeo). En vez de dejarlo entrar con un cast a ciegas, se degrada a
// 'pendiente', que es el estado más conservador para mostrar en la UI.
function toAppointmentStatus(estado: string): AppointmentStatus {
  const status = estado?.toLowerCase() as AppointmentStatus;
  return APPOINTMENT_STATUSES.includes(status) ? status : 'pendiente';
}

function toAppointment(dto: AppointmentDto): Appointment {
  return {
    id: dto.id,
    petId: dto.id_mascota,
    date: dto.fecha,
    reason: dto.motivo,
    status: toAppointmentStatus(dto.estado),
    veterinarian: dto.veterinario,
  };
}

// Traduce el error de Axios a un Error de dominio con un mensaje que la UI
// puede mostrar tal cual, sin que presentation tenga que conocer Axios.
function toAppointmentsError(error: unknown): Error {
  if (isAxiosError(error)) {
    if (!error.response) {
      return new Error('No hay conexión con el servidor. Revisa tu red e inténtalo de nuevo.');
    }

    if (error.response.status === 401 || error.response.status === 403) {
      return new Error('Tu sesión expiró. Vuelve a iniciar sesión para ver tus citas.');
    }

    return new Error('No se pudieron cargar tus citas. Inténtalo más tarde.');
  }

  return error instanceof Error ? error : new Error('No se pudieron cargar tus citas.');
}

export const appointmentsRepository = {
  async getAppointments(): Promise<Appointment[]> {
    if (ENV.USE_MOCKS) {
      return appointmentsMock.map(toAppointment);
    }

    try {
      const { data } = await httpClient.get<AppointmentDto[]>(ENDPOINTS.APPOINTMENTS.LIST);
      // Defensa mínima: si la API devuelve algo que no es una lista, se trata
      // como "sin citas" en lugar de reventar al mapear.
      return Array.isArray(data) ? data.map(toAppointment) : [];
    } catch (error) {
      throw toAppointmentsError(error);
    }
  },
};
