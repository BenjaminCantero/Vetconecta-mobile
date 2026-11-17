// Responsabilidad: lectura "red primero, caché de respaldo" (capa CORE, G1).
// Con red pide los datos y guarda la respuesta. Sin red, o si la petición falla
// por la conexión, devuelve lo último guardado marcado como `fromCache`. Los
// errores HTTP (401, 403, 500...) no se ocultan con la caché.

import { isAxiosError } from 'axios';

import { buildCacheKey, getCacheGeneration, readCache, writeCache } from '../storage/offlineCache';
import { getCurrentAccountId } from '../storage/sessionStorage';
import { isOnline } from './connectivity';

export interface CachedResult<T> {
  data: T;
  fromCache: boolean;
  updatedAt: string | null;
}

export class OfflineDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OfflineDataError';
  }
}

interface CachedReadOptions<T> {
  resource: string;
  resourceId?: string;
  fetcher: () => Promise<T>;
  // Se muestra si no hay red y todavía no se guardó nada de este recurso.
  offlineMessage: string;
}

async function loadFromCache<T>(key: string): Promise<CachedResult<T> | null> {
  const entry = await readCache<T>(key);

  return entry ? { data: entry.data, fromCache: true, updatedAt: entry.updatedAt } : null;
}

export async function cachedRead<T>({
  resource,
  resourceId,
  fetcher,
  offlineMessage,
}: CachedReadOptions<T>): Promise<CachedResult<T>> {
  const accountId = await getCurrentAccountId();

  // Sin sesión no hay a quién asociar la caché.
  if (!accountId) {
    return { data: await fetcher(), fromCache: false, updatedAt: null };
  }

  const key = buildCacheKey(accountId, resource, resourceId);

  if (!(await isOnline())) {
    const cached = await loadFromCache<T>(key);

    if (cached) {
      return cached;
    }

    throw new OfflineDataError(offlineMessage);
  }

  const generation = getCacheGeneration();

  try {
    const data = await fetcher();
    const updatedAt = new Date().toISOString();

    // Si el usuario cerró sesión mientras se esperaba la respuesta, no se guarda.
    if (generation === getCacheGeneration()) {
      await writeCache(key, data, updatedAt);
    }

    return { data, fromCache: false, updatedAt };
  } catch (error) {
    if (isAxiosError(error) && !error.response) {
      const cached = await loadFromCache<T>(key);

      if (cached) {
        return cached;
      }
    }

    throw error;
  }
}
