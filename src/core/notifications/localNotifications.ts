// Responsabilidad: notificaciones LOCALES programadas en el dispositivo (capa CORE).
// A diferencia de pushClient, no pasan por FCM/APNs: el sistema operativo las
// guarda y las dispara a la hora indicada aunque no haya internet ni la app
// esté abierta. Las usa el recordatorio de medicamentos (H2).
//
// Límites del sistema operativo:
//  - iOS guarda como máximo 64 notificaciones programadas por app; las demás se
//    descartan sin avisar. Por eso quien programa debe hacerlo por ventanas.
//  - Android solo dispara a la hora exacta si la app puede usar alarmas exactas
//    (SCHEDULE_EXACT_ALARM). Sin ese permiso el sistema puede retrasarlas unos
//    minutos para ahorrar batería.
//
// Botones de acción (ej. "Administrada") sin abrir la app:
//  - Android: con la app en segundo plano o cerrada, la pulsación llega a la tarea
//    de expo-task-manager registrada en `registerNotificationActionHandler`.
//  - iOS: el sistema despierta la app en segundo plano y la respuesta llega al
//    listener de respuestas (o como "última respuesta" si la app estaba cerrada).
// El manejador puede recibir la misma pulsación por más de una vía: debe ser
// idempotente. Aquí además se descartan repeticiones dentro de la misma ejecución.

import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

import { REMINDERS_CHANNEL_ID } from './pushClient';

const ACTION_TASK_NAME = 'vetconecta-notification-actions';

export interface LocalNotificationRequest {
  // Identificador estable: programar otra vez el mismo id reemplaza la anterior.
  id: string;
  // Fecha y hora de disparo, ISO 8601.
  at: string;
  title: string;
  body: string;
  data: Record<string, string>;
  // Categoría con botones de acción (ver `setNotificationActions`).
  categoryId?: string;
}

export interface NotificationActionEvent {
  notificationId: string;
  actionId: string;
  data: Record<string, unknown>;
}

export interface NotificationActionButton {
  id: string;
  title: string;
}

// Registra los botones de una categoría. No abren la app al pulsarse.
// Registrar la misma categoría otra vez la sobrescribe, así que se puede llamar
// en cada inicio.
export async function setNotificationActions(
  categoryId: string,
  actions: NotificationActionButton[],
): Promise<void> {
  await Notifications.setNotificationCategoryAsync(
    categoryId,
    actions.map((action) => ({
      identifier: action.id,
      buttonTitle: action.title,
      options: { opensAppToForeground: false },
    })),
  );
}

async function scheduledIdsWithPrefix(prefix: string): Promise<string[]> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  return scheduled.map((request) => request.identifier).filter((id) => id.startsWith(prefix));
}

// Deja programadas exactamente `requests` entre las notificaciones cuyo id
// empieza por `prefix`: cancela las que sobran y programa (o reemplaza) el resto.
export async function syncScheduledNotifications(
  prefix: string,
  requests: LocalNotificationRequest[],
): Promise<void> {
  const wanted = new Set(requests.map((request) => request.id));
  const current = await scheduledIdsWithPrefix(prefix);

  await Promise.all(
    current
      .filter((id) => !wanted.has(id))
      .map((id) => Notifications.cancelScheduledNotificationAsync(id)),
  );

  for (const request of requests) {
    await Notifications.scheduleNotificationAsync({
      identifier: request.id,
      content: {
        title: request.title,
        body: request.body,
        data: request.data,
        categoryIdentifier: request.categoryId,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(request.at),
        channelId: REMINDERS_CHANNEL_ID,
      },
    });
  }
}

// Cancela una notificación programada y la quita de la bandeja si ya se mostró.
export async function cancelLocalNotification(id: string): Promise<void> {
  await Promise.all([
    Notifications.cancelScheduledNotificationAsync(id),
    Notifications.dismissNotificationAsync(id),
  ]);
}

// Cierre de sesión: no debe quedar ningún recordatorio del usuario anterior,
// ni programado ni visible en la bandeja.
export async function cancelAllLocalNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    console.error('[localNotifications] error cancelando notificaciones:', error);
  }
}

const handledActions = new Set<string>();

function toActionEvent(response: Notifications.NotificationResponse): NotificationActionEvent {
  const { request } = response.notification;

  return {
    notificationId: request.identifier,
    actionId: response.actionIdentifier,
    data: request.content.data ?? {},
  };
}

// Debe llamarse en el ámbito del módulo de un archivo que se carga al inicio
// (index.ts): Android ejecuta la tarea cargando el bundle en segundo plano.
// Solo entrega pulsaciones de botones; el toque normal lo atiende pushClient.
export function registerNotificationActionHandler(
  handler: (event: NotificationActionEvent) => Promise<void>,
): void {
  const handle = async (response: Notifications.NotificationResponse): Promise<void> => {
    if (response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) return;

    const event = toActionEvent(response);
    const key = `${event.notificationId}|${event.actionId}`;

    if (handledActions.has(key)) return;

    handledActions.add(key);

    try {
      await handler(event);
    } catch (error) {
      handledActions.delete(key);
      console.error('[localNotifications] error atendiendo la acción:', error);
    }
  };

  // Se espera al manejador: con la app cerrada, Android mantiene vivo el JS solo
  // mientras dura la tarea.
  TaskManager.defineTask<Notifications.NotificationTaskPayload>(
    ACTION_TASK_NAME,
    async ({ data }) => {
      if (data && 'actionIdentifier' in data) {
        await handle(data);
      }
    },
  );

  Notifications.registerTaskAsync(ACTION_TASK_NAME).catch((error) => {
    console.error('[localNotifications] no se pudo registrar la tarea de acciones:', error);
  });

  Notifications.addNotificationResponseReceivedListener(handle);

  try {
    // iOS con la app cerrada: la pulsación que la despertó queda como última respuesta.
    const last = Notifications.getLastNotificationResponse();

    if (last) handle(last);
  } catch {
    // Plataforma sin soporte (web): no hay botones de acción.
  }
}
