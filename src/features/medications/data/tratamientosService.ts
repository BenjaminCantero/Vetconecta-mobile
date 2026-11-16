// Responsabilidad: acceso a la pauta de tratamiento de una mascota (capa DATA, H1).
// GET /mascotas/:id/tratamientos devuelve los tratamientos activos de la
// mascota (Web K1). La respuesta se guarda en la caché offline (G1) para
// consultarla sin conexión. Las dosis programadas no se calculan aquí sino en
// el dominio (`calcularDosisProgramadas`).
//
// Mientras ENV.USE_MOCKS esté activo los datos salen de `tratamientosMock`.

import { ENDPOINTS } from '../../../core/api/endpoints';
import { httpClient } from '../../../core/api/httpClient';
import { toHttpError } from '../../../core/api/httpError';
import { ENV } from '../../../core/config/env';
import { cachedRead, type CachedResult } from '../../../core/network/cachedRead';
import type { Tratamiento } from '../domain/Tratamiento';
import type { TratamientosRepository } from '../domain/usePautaTratamiento';
import type { TratamientoDto } from './tratamientoDto';
import { toTratamiento } from './tratamientoMapper';
import { tratamientosMock } from './tratamientosMock';

const PAUTA_ERROR_MESSAGES = {
  unauthorized: 'Tu sesión expiró. Vuelve a iniciar sesión para ver los tratamientos.',
  notFound: 'No se encontró la mascota de este tratamiento.',
  fallback: 'No se pudo cargar la pauta de tratamiento. Inténtalo más tarde.',
};

async function fetchPauta(mascotaId: string): Promise<Tratamiento[]> {
  if (ENV.USE_MOCKS) {
    return tratamientosMock.filter((dto) => dto.id_mascota === mascotaId).map(toTratamiento);
  }

  const { data } = await httpClient.get<TratamientoDto[]>(ENDPOINTS.PETS.TREATMENTS(mascotaId));
  // Sin tratamientos la API puede responder [] o un cuerpo vacío: ambos son
  // "lista vacía", no un error.
  return Array.isArray(data) ? data.map(toTratamiento) : [];
}

async function obtenerPautaSnapshot(mascotaId: string): Promise<CachedResult<Tratamiento[]>> {
  try {
    return await cachedRead({
      resource: 'tratamientos',
      resourceId: mascotaId,
      fetcher: () => fetchPauta(mascotaId),
      offlineMessage: 'Sin conexión. Esta pauta aún no está guardada en el dispositivo.',
    });
  } catch (error) {
    throw toHttpError(error, PAUTA_ERROR_MESSAGES);
  }
}

export const tratamientosService: TratamientosRepository & {
  obtenerPauta: (mascotaId: string) => Promise<Tratamiento[]>;
} = {
  obtenerPautaSnapshot,

  async obtenerPauta(mascotaId: string): Promise<Tratamiento[]> {
    return (await obtenerPautaSnapshot(mascotaId)).data;
  },
};
