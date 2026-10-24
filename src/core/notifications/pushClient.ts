// Responsabilidad: envoltorio de expo-notifications.
// unico archivo de la app que importa expo-notifications
// Como llega una notificacion push segun el estado de la app:
//  - Abierta (primer plano): FCM se la entrega a la app y se muestra como banner del sistema
//    según `configureForegroundPresentation`.
//  - En segundo plano o cerrada: la muestra el sistema operativo; la app no hace nada hasta que
//    el usuario la toca.
//  - Al tocarla (en cualquiera de los 3 estados): `useLastNotificationTap` entrega el toque, también
//    cuando el toque fue lo que abrió la app desde cerrada.

import { useMemo } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Debe coincidir con 'defaultChannel' del plugin expo-notifications en app.json.
export const REMINDERS_CHANNEL_ID = 'recordatorios';

export interface PushPermissionState {
  granted: boolean;
  // false cuando el sistema ya no permite volver a mostrar el aviso de permiso
  // (iOS tras rechazarlo, Android 13+ tras rechazarlo dos veces).
  canAskAgain: boolean;
}

export interface NativePushToken {
  // Android: token de FCM ; iOS: token de APNs
  token: string;
  platform: 'android' | 'ios';
}

export interface NotificationTap {
  // Identificador de la notificación, para no atender dos veces el mismo toque.
  id: string;
  // Datos personalizados del mensaje (en Firebase: "Datos personalizados", ej. citaId).
  data: Record<string, unknown>;
}

// Notificación recibida con la app abierta: se muestra como banner, igual que en segundo plano.
// Se llama una sola vez, al cargar App.tsx.
export function configureForegroundPresentation(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// Android 8+: toda notificación pertenece a un canal, y el usuario puede silenciar cada canal desde
// los ajustes del teléfono. Android 13+ además exige que exista un canal antes de pedir el permiso.
// Crear un canal que ya existe no hace nada, así que se puede llamar en cada inicio de sesión.
export async function createRemindersChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(REMINDERS_CHANNEL_ID, {
    name: 'Recordatorios',
    description: 'Avisos de citas y controles de tus mascotas',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#7A22E0',
  });
}

function toPermissionState(
  response: Notifications.NotificationPermissionsStatus,
): PushPermissionState {
  // En iOS el permiso "provisional" (avisos silenciosos) tambien permite recibir notificaciones.
  const provisional = response.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

  return {
    granted: response.granted || provisional,
    canAskAgain: response.canAskAgain,
  };
}

export async function getPushPermission(): Promise<PushPermissionState> {
  return toPermissionState(await Notifications.getPermissionsAsync());
}

// Muestra el aviso del sistema (Android 13+: POST_NOTIFICATIONS; iOS: autorización de avisos).
export async function requestPushPermission(): Promise<PushPermissionState> {
  return toPermissionState(await Notifications.requestPermissionsAsync());
}

function toNativePushToken(data: unknown): NativePushToken | null {
  const platform = Platform.OS;

  if (typeof data !== 'string' || (platform !== 'android' && platform !== 'ios')) {
    return null;
  }

  return { token: data, platform };
}

// Lanza un error si la app se compiló sin google-services.json (Firebase no inicializado).
export async function getNativePushToken(): Promise<NativePushToken | null> {
  const { data } = await Notifications.getDevicePushTokenAsync();

  return toNativePushToken(data);
}

// FCM/APNs pueden renovar el token; hay que volver a registrarlo en el backend cuando cambia.
export function onNativePushTokenChange(listener: (token: NativePushToken) => void): () => void {
  const subscription = Notifications.addPushTokenListener(({ data }) => {
    const token = toNativePushToken(data);

    if (token) listener(token);
  });

  return () => subscription.remove();
}

function extractData(request: Notifications.NotificationRequest): Record<string, unknown> {
  const contentData = request.content.data;

  if (contentData && Object.keys(contentData).length > 0) {
    return contentData;
  }

  // Android: en algunos mensajes de FCM los datos personalizados llegan solo en el disparador
  const trigger = request.trigger as unknown as {
    remoteMessage?: { data?: Record<string, string> };
  } | null;

  return trigger?.remoteMessage?.data ?? {};
}

// ultimo toque del usuario sobre una notificacion (null si no hay)
// Cubre los tres estados: si el toque abrió la app desde cerrada, también llega por aquí.
export function useLastNotificationTap(): NotificationTap | null {
  const response = Notifications.useLastNotificationResponse();

  return useMemo(() => {
    // Solo el toque normal (manejo aparte para implementacion futura de botonos de accion )
    if (!response || response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) {
      return null;
    }

    const { request } = response.notification;

    return { id: request.identifier, data: extractData(request) };
  }, [response]);
}
