// Responsabilidad: caché local de lecturas para uso sin conexión (capa CORE, G1).
// Cada entrada guarda los datos y la fecha en que se descargaron. La clave
// incluye la cuenta, y la mascota cuando corresponde, para no mezclar datos:
//   cache:{cuenta}:mascotas
//   cache:{cuenta}:carnet:{mascotaId}

import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'cache:';

export interface CacheEntry<T> {
  data: T;
  updatedAt: string;
}

// Aumenta cada vez que se borra la caché. Permite descartar una respuesta que
// llegó después del logout, para que no vuelva a guardar datos del usuario.
let generation = 0;

export function getCacheGeneration(): number {
  return generation;
}

export function buildCacheKey(accountId: string, resource: string, resourceId?: string): string {
  const key = `${CACHE_PREFIX}${accountId}:${resource}`;

  return resourceId ? `${key}:${resourceId}` : key;
}

export async function readCache<T>(key: string): Promise<CacheEntry<T> | null> {
  try {
    const raw = await AsyncStorage.getItem(key);

    return raw ? (JSON.parse(raw) as CacheEntry<T>) : null;
  } catch (error) {
    console.error(`[offlineCache] error leyendo "${key}":`, error);
    return null;
  }
}

// Si falla, solo se registra: no guardar la caché no debe ocultar datos recién
// descargados de la API.
export async function writeCache<T>(key: string, data: T, updatedAt: string): Promise<void> {
  try {
    const entry: CacheEntry<T> = { data, updatedAt };

    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.error(`[offlineCache] error guardando "${key}":`, error);
  }
}

export async function clearOfflineCache(): Promise<void> {
  generation += 1;

  try {
    const keys = await AsyncStorage.getAllKeys();

    await AsyncStorage.multiRemove(keys.filter((key) => key.startsWith(CACHE_PREFIX)));
  } catch (error) {
    console.error('[offlineCache] error borrando la caché:', error);
  }
}
