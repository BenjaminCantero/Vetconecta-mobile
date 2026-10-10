// Responsabilidad: acceso a datos de disponibilidad de horas (capa DATA).
// Llama a GET /disponibilidad (FR-3 / UC-03) filtrando por mascota,
// especialidad, veterinario y fecha, y devuelve las horas disponibles.
//
// Nota: el backend lo desarrolla otro equipo y aún no está disponible, así que
// mientras ENV.USE_MOCKS esté activo las horas salen de `availabilityMock`.

import { httpClient } from '../../../core/api/httpClient';
import { ENDPOINTS } from '../../../core/api/endpoints';
import { toHttpError } from '../../../core/api/httpError';
import { ENV } from '../../../core/config/env';
import type { AvailabilityDto } from './availabilityDto';
import { availabilityMock } from './availabilityMock';

export interface AvailabilityQuery {
  petId: string;
  specialty: string;
  veterinarian: string;
  date: string; // YYYY-MM-DD
}

const AVAILABILITY_ERROR_MESSAGES = {
  unauthorized: 'Tu sesión expiró. Vuelve a iniciar sesión para ver la disponibilidad.',
  fallback: 'No se pudo cargar la disponibilidad. Inténtalo más tarde.',
};

export const availabilityRepository = {
  async getAvailability(query: AvailabilityQuery): Promise<string[]> {
    if (ENV.USE_MOCKS) {
      return availabilityMock.horas;
    }

    try {
      const { data } = await httpClient.get<AvailabilityDto>(ENDPOINTS.APPOINTMENTS.AVAILABILITY, {
        params: {
          id_mascota: query.petId,
          especialidad: query.specialty,
          veterinario: query.veterinarian,
          fecha: query.date,
        },
      });
      // Defensa mínima: si la API devuelve algo que no es una lista, se trata
      // como "sin horas disponibles" en lugar de reventar al mapear.
      return Array.isArray(data?.horas) ? data.horas : [];
    } catch (error) {
      throw toHttpError(error, AVAILABILITY_ERROR_MESSAGES);
    }
  },
};
