// Responsabilidad: caso de uso "activar recordatorios push" (capa DOMAIN de notifications).
// Define el contrato PushRepository (implementado en la capa data) y ordena los pasos:
//
//  1. Crear el canal "Recordatorios" (Android exige un canal antes de pedir el permiso).
//  2. Si falta el permiso y el sistema todavía deja pedirlo, explicar para qué sirve
//     (`explainPermission`) y solo si el dueño acepta, mostrar el aviso del sistema.
//  3. Con permiso, obtener el token del dispositivo y registrarlo en el backend.
//  4. Si el token cambia más adelante, registrarlo de nuevo.
//
// Se monta después del login: el permiso se pide con la sesión iniciada, no al abrir la app.

import { useEffect, useState } from 'react';

export interface DeviceToken {
  token: string;
  platform: 'android' | 'ios';
}

export interface PushPermission {
  granted: boolean;
  canAskAgain: boolean;
}

export interface PushRepository {
  prepareChannels: () => Promise<void>;
  getPermission: () => Promise<PushPermission>;
  requestPermission: () => Promise<PushPermission>;
  getDeviceToken: () => Promise<DeviceToken | null>;
  onDeviceTokenChange: (listener: (token: DeviceToken) => void) => () => void;
  registerDeviceToken: (token: DeviceToken) => Promise<void>;
}

// pending: revisando · enabled: token registrado · disabled: sin permiso · error: falló algún paso.
export type PushRegistrationStatus = 'pending' | 'enabled' | 'disabled' | 'error';

// Pasos 1 a 3, sin React: así se pueden probar con un repositorio falso.
// `isCancelled` corta el flujo si la pantalla se desmontó mientras esperaba (ej. cerró sesión).
export async function activatePushNotifications(
  pushRepository: PushRepository,
  explainPermission: () => Promise<boolean>,
  isCancelled: () => boolean = () => false,
): Promise<PushRegistrationStatus> {
  try {
    await pushRepository.prepareChannels();

    let permission = await pushRepository.getPermission();

    if (!permission.granted && permission.canAskAgain) {
      const accepted = await explainPermission();

      if (isCancelled()) return 'pending';

      if (accepted) {
        permission = await pushRepository.requestPermission();
      }
    }

    if (isCancelled()) return 'pending';

    if (!permission.granted) return 'disabled';

    const token = await pushRepository.getDeviceToken();

    if (!token || isCancelled()) return token ? 'pending' : 'error';

    await pushRepository.registerDeviceToken(token);

    return 'enabled';
  } catch {
    return 'error';
  }
}

export function usePushRegistration(
  pushRepository: PushRepository,
  // Muestra la explicación previa y resuelve true si el dueño quiere activar los recordatorios.
  explainPermission: () => Promise<boolean>,
) {
  const [status, setStatus] = useState<PushRegistrationStatus>('pending');

  useEffect(() => {
    let cancelled = false;

    activatePushNotifications(pushRepository, explainPermission, () => cancelled).then((result) => {
      if (!cancelled) setStatus(result);
    });

    // Paso 4: FCM/APNs pueden renovar el token en cualquier momento.
    const unsubscribe = pushRepository.onDeviceTokenChange((token) => {
      pushRepository.registerDeviceToken(token).catch(() => {
        // Se reintenta en el próximo inicio de sesión.
      });
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [pushRepository, explainPermission]);

  return { status };
}
