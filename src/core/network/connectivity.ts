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
