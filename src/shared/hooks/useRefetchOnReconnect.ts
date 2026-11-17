// Responsabilidad: volver a pedir los datos al recuperar la red (capa SHARED, G1).

import { useEffect } from 'react';

import { subscribeToReconnect } from '../../core/network/connectivity';

export function useRefetchOnReconnect(refetch: () => void): void {
  useEffect(() => subscribeToReconnect(refetch), [refetch]);
}
