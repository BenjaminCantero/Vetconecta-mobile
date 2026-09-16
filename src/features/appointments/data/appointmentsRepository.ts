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

import { httpClient } from '../../../core/api/httpClient';
import { ENDPOINTS } from '../../../core/api/endpoints';
import { toHttpError } from '../../../core/api/httpError';
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

const APPOINTMENTS_ERROR_MESSAGES = {
  unauthorized: 'Tu sesión expiró. Vuelve a iniciar sesión para ver tus citas.',
  fallback: 'No se pudieron cargar tus citas. Inténtalo más tarde.',
};

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
      throw toHttpError(error, APPOINTMENTS_ERROR_MESSAGES);
    }
  },
};
