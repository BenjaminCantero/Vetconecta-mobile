// Responsabilidad: caso de uso de disponibilidad de horas (capa DOMAIN de
// appointments). Define el contrato AvailabilityRepository (implementado en
// la capa data) y expone las horas disponibles sin conocer Axios.
//
// El dueño recién tiene una query completa cuando eligió mascota, especialidad,
// veterinario y fecha (FR-3 / UC-03); hasta entonces no hay nada que consultar.

import { useMemo } from 'react';

import { useFetch } from '../../../shared/hooks/useFetch';
import type { AvailabilityQuery } from '../data/availabilityRepository';

export interface AvailabilityRepository {
  getAvailability: (query: AvailabilityQuery) => Promise<string[]>;
}

function isCompleteQuery(query: Partial<AvailabilityQuery>): query is AvailabilityQuery {
  return Boolean(query.petId && query.specialty && query.veterinarian && query.date);
}

export function useAvailability(
  availabilityRepository: AvailabilityRepository,
  query: Partial<AvailabilityQuery>,
) {
  const isQueryComplete = isCompleteQuery(query);

  const { data, isLoading, error, refetch } = useFetch<string[]>(
    () => (isQueryComplete ? availabilityRepository.getAvailability(query) : Promise.resolve([])),
    [isQueryComplete, query.petId, query.specialty, query.veterinarian, query.date],
  );

  const availableHours = useMemo(() => data ?? [], [data]);

  return { availableHours, isLoading: isQueryComplete && isLoading, error, refetch };
}
