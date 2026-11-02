// Responsabilidad: hook genérico de fetching reutilizable (capa SHARED).
// No pertenece a ningún feature: envuelve una función asíncrona cualquiera
// (por ejemplo, un método de un repositorio) con estados de loading/error.

import { useCallback, useEffect, useState } from 'react';

import { useRefetchOnReconnect } from './useRefetchOnReconnect';

export function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset de estado al iniciar cada fetch
    setIsLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error('Error desconocido'));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadIndex]);

  const refetch = useCallback(() => setReloadIndex((index) => index + 1), []);
  // G1: al recuperar la red, los datos en pantalla se actualizan solos.
  useRefetchOnReconnect(refetch);

  return { data, isLoading, error, refetch };
}
