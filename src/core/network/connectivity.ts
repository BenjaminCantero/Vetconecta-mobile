// Responsabilidad: consulta del estado de conectividad (capa CORE).
// Único punto de la app que importa NetInfo. Los repositorios lo usan antes de
// enviar operaciones de escritura, que no se encolan si no hay red.

import NetInfo from '@react-native-community/netinfo';

export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  // `isInternetReachable` es null mientras NetInfo aún no lo determina; en ese
  // caso se confía en `isConnected` para no bloquear al usuario sin motivo.
  return Boolean(state.isConnected) && state.isInternetReachable !== false;
}

// Avisa cada vez que el dispositivo recupera la red. Devuelve la función para
// desuscribirse. A diferencia de isOnline, espera a que `isInternetReachable`
// sea true: al reconectar pasa unos instantes en null y pedir datos en ese
// momento podría fallar.
export function subscribeToReconnect(listener: () => void): () => void {
  let wasOffline = false;

  return NetInfo.addEventListener((state) => {
    if (!state.isConnected || state.isInternetReachable === false) {
      wasOffline = true;
    } else if (wasOffline && state.isInternetReachable === true) {
      wasOffline = false;
      listener();
    }
  });
}
