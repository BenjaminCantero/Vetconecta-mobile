// Responsabilidad: lectura y caché de citas (capa DATA).
// Permite consultar citas con conexión y recuperar datos
// guardados cuando no existe conectividad (G1).

import { isAxiosError } from 'axios';

import { httpClient } from '../../../core/api/httpClient';
import { ENDPOINTS } from '../../../core/api/endpoints';
import { toHttpError } from '../../../core/api/httpError';
import { ENV } from '../../../core/config/env';
import { isOnline } from '../../../core/network/connectivity';

import {
  StorageKeys,
  asyncStorage,
} from '../../../core/storage/asyncStorage';

import type { User } from '../../auth/domain/User';
import type {
  Appointment,
  AppointmentStatus,
} from '../domain/Appointment';

import { SinConexionError } from '../domain/bookingErrors';
import type { AppointmentDto } from './appointmentsDto';
import { appointmentsMock } from './appointmentsMock';

const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  'reservada',
  'pendiente',
  'confirmada',
  'cancelada',
  'completada',
];

interface AppointmentsCache {
  userId: string;
  appointments: Appointment[];
  savedAt: string;
}

export interface AppointmentsSnapshot {
  appointments: Appointment[];
  isOffline: boolean;
}

const APPOINTMENTS_ERROR_MESSAGES = {
  unauthorized:
    'Tu sesión expiró. Vuelve a iniciar sesión para ver tus citas.',
  fallback:
    'No se pudieron cargar tus citas. Inténtalo más tarde.',
};

function toAppointmentStatus(estado: string): AppointmentStatus {
  const status = estado?.toLowerCase() as AppointmentStatus;

  return APPOINTMENT_STATUSES.includes(status)
    ? status
    : 'pendiente';
}

export function toAppointment(dto: AppointmentDto): Appointment {
  return {
    id: dto.id,
    petId: dto.id_mascota,
    date: dto.fecha,
    reason: dto.motivo,
    status: toAppointmentStatus(dto.estado),
    veterinarian: dto.veterinario,
  };
}

async function getCurrentUserId(): Promise<string | null> {
  const user = await asyncStorage.getItem<User>(
    StorageKeys.AUTH_USER,
  );

  return user?.id ?? null;
}

async function saveCache(
  userId: string,
  appointments: Appointment[],
): Promise<void> {
  const cache: AppointmentsCache = {
    userId,
    appointments,
    savedAt: new Date().toISOString(),
  };

  await asyncStorage.setItem(
    StorageKeys.APPOINTMENTS_CACHE,
    cache,
  );
}

async function readCache(
  userId: string,
): Promise<Appointment[] | null> {
  const cache = await asyncStorage.getItem<AppointmentsCache>(
    StorageKeys.APPOINTMENTS_CACHE,
  );

  // Nunca se muestran citas guardadas de otro usuario.
  if (
    !cache ||
    cache.userId !== userId ||
    !Array.isArray(cache.appointments)
  ) {
    return null;
  }

  return cache.appointments;
}

async function fetchAppointments(): Promise<Appointment[]> {
  if (ENV.USE_MOCKS) {
    return appointmentsMock.map(toAppointment);
  }

  const { data } = await httpClient.get<AppointmentDto[]>(
    ENDPOINTS.APPOINTMENTS.LIST,
  );

  if (!Array.isArray(data)) {
    throw new Error('La respuesta de citas no tiene un formato válido.');
  }

  return data.map(toAppointment);
}

export const appointmentsRepository = {
  async getAppointmentsSnapshot(): Promise<AppointmentsSnapshot> {
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error(
        'No se encontró una sesión activa para consultar tus citas.',
      );
    }

    const online = await isOnline();

    if (!online) {
      const cached = await readCache(userId);

      if (cached !== null) {
        return {
          appointments: cached,
          isOffline: true,
        };
      }

      throw new SinConexionError(
        'Sin conexión. No hay citas guardadas para mostrar.',
      );
    }

    try {
      const appointments = await fetchAppointments();

      await saveCache(userId, appointments);

      return {
        appointments,
        isOffline: false,
      };
    } catch (error) {
      // Solo se usa caché como respaldo ante fallos de red.
      // No se ocultan errores HTTP como 401, 403 o 500.
      const networkFailure =
        isAxiosError(error) && !error.response;

      if (networkFailure) {
        const cached = await readCache(userId);

        if (cached !== null) {
          return {
            appointments: cached,
            isOffline: true,
          };
        }
      }

      throw toHttpError(error, APPOINTMENTS_ERROR_MESSAGES);
    }
  },

  // Conserva el contrato anterior para HomeScreen y otros módulos.
  async getAppointments(): Promise<Appointment[]> {
    const snapshot = await this.getAppointmentsSnapshot();

    return snapshot.appointments;
  },
};