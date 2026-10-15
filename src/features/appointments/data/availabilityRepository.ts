// Responsabilidad: acceso a disponibilidad (DATA).
// En mocks, excluye los horarios ya reservados para el mismo profesional.

import { httpClient } from '../../../core/api/httpClient';
import { ENDPOINTS } from '../../../core/api/endpoints';
import { toHttpError } from '../../../core/api/httpError';
import { ENV } from '../../../core/config/env';
import type { AvailabilityDto } from './availabilityDto';
import { availabilityMock } from './availabilityMock';
import { appointmentsMock } from './appointmentsMock';
import { bookingVeterinariansMock } from './bookingCatalogMock';

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
      const selectedVet = bookingVeterinariansMock.find(
        (vet) => vet.id === query.veterinarian,
      );
      const occupiedHours = new Set(
        appointmentsMock
          .filter((appointment) =>
            (appointment.veterinario === query.veterinarian ||
              appointment.veterinario === selectedVet?.name) &&
            appointment.fecha.slice(0, 10) === query.date &&
            appointment.estado !== 'cancelada'
          )
          .map((appointment) => appointment.fecha.slice(11, 16)),
      );
      return availabilityMock.horas.filter((hour) => !occupiedHours.has(hour));
    }

    try {
      const { data } = await httpClient.get<AvailabilityDto>(
        ENDPOINTS.APPOINTMENTS.AVAILABILITY,
        {
          params: {
            id_mascota: query.petId,
            especialidad: query.specialty,
            veterinario: query.veterinarian,
            fecha: query.date,
          },
        },
      );
      return Array.isArray(data?.horas) ? data.horas : [];
    } catch (error) {
      throw toHttpError(error, AVAILABILITY_ERROR_MESSAGES);
    }
  },
};
