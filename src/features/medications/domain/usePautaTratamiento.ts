// Responsabilidad: caso de uso "pauta de tratamiento" (capa DOMAIN de medications, H1).
// Define el contrato TratamientosRepository (implementado por
// `tratamientosService` en data) y entrega cada tratamiento activo con sus
// dosis programadas ya calculadas. Lo consume H2.

import { useMemo } from 'react';

import type { CachedResult } from '../../../core/network/cachedRead';
import { useFetch } from '../../../shared/hooks/useFetch';
import { construirPauta } from './calcularDosisProgramadas';
import type { Tratamiento } from './Tratamiento';

export interface TratamientosRepository {
  obtenerPautaSnapshot: (mascotaId: string) => Promise<CachedResult<Tratamiento[]>>;
}

const SIN_MASCOTA: CachedResult<Tratamiento[]> = { data: [], fromCache: false, updatedAt: null };

export function usePautaTratamiento(repository: TratamientosRepository, petId: string | null) {
  const { data, isLoading, error, refetch } = useFetch(
    () => (petId ? repository.obtenerPautaSnapshot(petId) : Promise.resolve(SIN_MASCOTA)),
    [repository, petId],
  );

  const tratamientos = data?.data;
  const pauta = useMemo(() => construirPauta(tratamientos ?? []), [tratamientos]);

  return {
    pauta,
    fromCache: data?.fromCache ?? false,
    updatedAt: data?.updatedAt ?? null,
    isLoading,
    error,
    refetch,
  };
}
