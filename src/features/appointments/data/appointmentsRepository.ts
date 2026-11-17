// Responsabilidad: lectura, caché y calificación de citas (capa DATA).
// Permite consultar citas con conexión y recuperar datos
// guardados cuando no existe conectividad (G1).
// Permite registrar una calificación post-consulta (H3).

import { isAxiosError } from 'axios';

import { httpClient } from '../../../core/api/httpClient';
import { ENDPOINTS } from '../../../core/api/endpoints';
import { toHttpError } from '../../../core/api/httpError';
import { ENV } from '../../../core/config/env';
import { cachedRead } from '../../../core/network/cachedRead';
import { isOnline } from '../../../core/network/connectivity';
import {
  buildCacheKey,
  getCacheGeneration,
  readCache,
  writeCache,
} from '../../../core/storage/offlineCache';
import { getCurrentAccountId } from '../../../core/storage/sessionStorage';

import type { Appointment, AppointmentRating, AppointmentStatus } from '../domain/Appointment';

import type { AppointmentDto, AppointmentRatingDto, CreateRatingDto } from './appointmentsDto';
import { appointmentsMock } from './appointmentsMock';

const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  'reservada',
  'pendiente',
  'confirmada',
  'cancelada',
  'completada',
  'realizada',
];

export interface AppointmentsSnapshot {
  appointments: Appointment[];
  isOffline: boolean;
  updatedAt: string | null;
}

const APPOINTMENTS_ERROR_MESSAGES = {
  unauthorized: 'Tu sesión expiró. Vuelve a iniciar sesión para ver tus citas.',
  fallback: 'No se pudieron cargar tus citas. Inténtalo más tarde.',
};

const RATING_ERROR_MESSAGES = {
  unauthorized: 'Tu sesión expiró. Vuelve a iniciar sesión.',
  fallback: 'No se pudo enviar la calificación. Inténtalo más tarde.',
  network: 'No hay conexión para enviar la calificación.',
  conflict: 'Esta cita ya fue calificada.',
  unprocessableEntity: 'Solo puedes calificar citas realizadas.',
};

// Error específico para sincronizar la interfaz ante un conflicto.
export class AppointmentAlreadyRatedError extends Error {
  constructor() {
    super(RATING_ERROR_MESSAGES.conflict);
    this.name = 'AppointmentAlreadyRatedError';
  }
}

// Evita envíos simultáneos para una misma cita.
const pendingRatings = new Set<string>();

// H3: conserva las calificaciones confirmadas durante la sesión.
// Un valor undefined indica que la cita ya fue calificada,
// pero todavía no conocemos sus estrellas o comentario.
const confirmedRatings = new Map<string, AppointmentRating | undefined>();

let ratingsGeneration = -1;

// Limpia los registros cuando cambia la generación de la sesión.
function synchronizeRatingsSession(): number {
  const generation = getCacheGeneration();

  if (ratingsGeneration !== generation) {
    confirmedRatings.clear();
    ratingsGeneration = generation;
  }

  return generation;
}

function buildRatingKey(generation: number, accountId: string, appointmentId: string): string {
  return JSON.stringify([generation, accountId, appointmentId]);
}

function rememberRating(
  generation: number,
  accountId: string,
  appointmentId: string,
  rating?: AppointmentRating,
): void {
  if (generation !== synchronizeRatingsSession()) {
    return;
  }

  const key = buildRatingKey(generation, accountId, appointmentId);

  confirmedRatings.set(key, rating ?? confirmedRatings.get(key));
}

// Evita que una lectura desactualizada vuelva a mostrar
// una cita como pendiente de calificación.
function mergeConfirmedRatings(
  appointments: Appointment[],
  generation: number,
  accountId: string,
): Appointment[] {
  if (generation !== synchronizeRatingsSession()) {
    return appointments;
  }

  return appointments.map((appointment) => {
    const key = buildRatingKey(generation, accountId, appointment.id);
    const localRating = confirmedRatings.get(key);

    if (appointment.calificada || appointment.calificacion) {
      rememberRating(generation, accountId, appointment.id, appointment.calificacion);
    }

    if (!confirmedRatings.has(key)) {
      return appointment;
    }

    const rating = appointment.calificacion ?? localRating;

    return {
      ...appointment,
      calificada: true,
      ...(rating && { calificacion: rating }),
    };
  });
}

function toAppointmentStatus(estado: string): AppointmentStatus {
  const status = estado?.toLowerCase() as AppointmentStatus;

  return APPOINTMENT_STATUSES.includes(status) ? status : 'pendiente';
}

function isValidStars(value: number): value is AppointmentRating['estrellas'] {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

function toAppointmentRating(dto?: AppointmentRatingDto | null): AppointmentRating | undefined {
  if (!dto || !isValidStars(dto.estrellas)) {
    return undefined;
  }

  return {
    estrellas: dto.estrellas,
    comentario: dto.comentario ?? undefined,
  };
}

// Compatibilidad con el estado anterior y el definido en H3.
export function isCompletedAppointment(status: AppointmentStatus): boolean {
  return status === 'realizada' || status === 'completada';
}

export function canRateAppointment(appointment: Appointment): boolean {
  return (
    isCompletedAppointment(appointment.status) &&
    appointment.calificada === false &&
    !appointment.calificacion
  );
}

export function toAppointment(dto: AppointmentDto): Appointment {
  const calificacion = toAppointmentRating(dto.calificacion);

  return {
    id: dto.id,
    petId: dto.id_mascota,
    date: dto.fecha,
    reason: dto.motivo,
    status: toAppointmentStatus(dto.estado),
    veterinarian: dto.veterinario,
    ...(dto.calificada !== undefined && {
      calificada: dto.calificada,
    }),
    ...(calificacion && {
      calificada: true,
      calificacion,
    }),
  };
}

async function fetchAppointments(): Promise<Appointment[]> {
  if (ENV.USE_MOCKS) {
    return appointmentsMock.map(toAppointment);
  }

  const { data } = await httpClient.get<AppointmentDto[]>(ENDPOINTS.APPOINTMENTS.LIST);

  if (!Array.isArray(data)) {
    throw new Error('La respuesta de citas no tiene un formato válido.');
  }

  return data.map(toAppointment);
}

// Actualiza la cita guardada para evitar mostrar una invitación antigua
// cuando posteriormente no exista conexión.
async function updateRatingCache(
  accountId: string | null | undefined,
  generation: number,
  appointmentId: string,
  rating?: AppointmentRating,
): Promise<void> {
  if (!accountId || generation !== getCacheGeneration()) {
    return;
  }

  const key = buildCacheKey(accountId, 'citas');
  const cached = await readCache<Appointment[]>(key);

  if (!cached || generation !== getCacheGeneration()) {
    return;
  }

  const appointments = cached.data.map((appointment) =>
    appointment.id === appointmentId
      ? {
          ...appointment,
          calificada: true,
          ...(rating && { calificacion: rating }),
        }
      : appointment,
  );

  await writeCache(key, appointments, cached.updatedAt);
}

export const appointmentsRepository = {
  async getAppointmentsSnapshot(): Promise<AppointmentsSnapshot> {
    try {
      const generation = synchronizeRatingsSession();
      const accountId = await getCurrentAccountId();

      const { data, fromCache, updatedAt } = await cachedRead({
        resource: 'citas',
        fetcher: async () => {
          const appointments = await fetchAppointments();

          return accountId
            ? mergeConfirmedRatings(appointments, generation, accountId)
            : appointments;
        },
        offlineMessage: 'Sin conexión. No hay citas guardadas para mostrar.',
      });

      if (generation !== getCacheGeneration()) {
        throw new Error('La sesión ha cambiado.');
      }

      const appointments = accountId ? mergeConfirmedRatings(data, generation, accountId) : data;

      return {
        appointments,
        isOffline: fromCache,
        updatedAt,
      };
    } catch (error) {
      throw toHttpError(error, APPOINTMENTS_ERROR_MESSAGES);
    }
  },

  // Conserva el contrato anterior para HomeScreen y otros módulos.
  async getAppointments(): Promise<Appointment[]> {
    const snapshot = await this.getAppointmentsSnapshot();

    return snapshot.appointments;
  },

  // H3: registra una única calificación por consulta realizada.
  async createRating(appointment: Appointment, rating: AppointmentRating): Promise<Appointment> {
    if (appointment.calificada || appointment.calificacion) {
      throw new AppointmentAlreadyRatedError();
    }

    if (!canRateAppointment(appointment)) {
      throw new Error('Esta cita no está disponible para calificar.');
    }

    if (!isValidStars(rating.estrellas)) {
      throw new Error('Selecciona entre 1 y 5 estrellas.');
    }

    if ((rating.comentario?.length ?? 0) > 500) {
      throw new Error('El comentario no puede superar los 500 caracteres.');
    }

    const generation = synchronizeRatingsSession();
    const pendingKey = `${generation}:${appointment.id}`;

    if (pendingRatings.has(pendingKey)) {
      throw new Error('Ya se está enviando esta calificación.');
    }

    const comentario = rating.comentario?.trim();

    const normalizedRating: AppointmentRating = {
      estrellas: rating.estrellas,
      ...(comentario && { comentario }),
    };

    const payload: CreateRatingDto = {
      citaId: appointment.id,
      ...normalizedRating,
    };

    pendingRatings.add(pendingKey);

    let accountId: string | null | undefined;

    try {
      accountId = await getCurrentAccountId();

      if (!accountId) {
        throw new Error(RATING_ERROR_MESSAGES.unauthorized);
      }

      if (generation !== getCacheGeneration()) {
        throw new Error('La sesión ha cambiado.');
      }

      const ratingKey = buildRatingKey(generation, accountId, appointment.id);

      // BR-13: impide un segundo POST incluso si la cita
      // recibida contiene información desactualizada.
      if (confirmedRatings.has(ratingKey)) {
        throw new AppointmentAlreadyRatedError();
      }

      if (!(await isOnline())) {
        throw new Error(RATING_ERROR_MESSAGES.network);
      }

      if (generation !== getCacheGeneration()) {
        throw new Error('La sesión ha cambiado.');
      }

      if (confirmedRatings.has(ratingKey)) {
        throw new AppointmentAlreadyRatedError();
      }

      if (ENV.USE_MOCKS) {
        const mockAppointment = appointmentsMock.find((item) => item.id === appointment.id);

        if (!mockAppointment) {
          throw new Error('No se encontró la cita.');
        }

        if (mockAppointment.calificada || mockAppointment.calificacion) {
          throw new AppointmentAlreadyRatedError();
        }

        if (!canRateAppointment(toAppointment(mockAppointment))) {
          throw new Error(RATING_ERROR_MESSAGES.unprocessableEntity);
        }

        mockAppointment.calificada = true;
        mockAppointment.calificacion = normalizedRating;
      } else {
        await httpClient.post(ENDPOINTS.RATINGS.CREATE, payload);
      }

      if (generation !== getCacheGeneration()) {
        throw new Error('La sesión ha cambiado.');
      }

      // Registra inmediatamente la calificación confirmada.
      rememberRating(generation, accountId, appointment.id, normalizedRating);

      await updateRatingCache(accountId, generation, appointment.id, normalizedRating);

      return {
        ...appointment,
        calificada: true,
        calificacion: normalizedRating,
      };
    } catch (error) {
      if (
        error instanceof AppointmentAlreadyRatedError ||
        (isAxiosError(error) && error.response?.status === 409)
      ) {
        if (accountId && generation === getCacheGeneration()) {
          rememberRating(generation, accountId, appointment.id);

          const key = buildRatingKey(generation, accountId, appointment.id);

          await updateRatingCache(accountId, generation, appointment.id, confirmedRatings.get(key));
        }

        throw new AppointmentAlreadyRatedError();
      }

      throw toHttpError(error, RATING_ERROR_MESSAGES);
    } finally {
      pendingRatings.delete(pendingKey);
    }
  },
};
