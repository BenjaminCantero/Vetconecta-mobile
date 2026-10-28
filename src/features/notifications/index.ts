// Superficie pública del dominio notifications
export { notificationsRepository } from './data/notificationsRepository';
export type { Notification } from './domain/Notification';
export { useNotifications } from './domain/useNotifications';

export { default as NotificationsScreen } from './presentation/screens/NotificationsScreen';

// Estado compartido de notificaciones (E3).
export {
  NotificationsProvider,
  useNotificationsSession,
} from './presentation/context/NotificationsContext';

// Notificaciones push (FCM/APNs).
export { PushNotificationsBridge } from './presentation/components/PushNotificationsBridge';
export { resolveNotificationTarget } from './domain/NotificationTarget';
export type { NotificationTarget } from './domain/NotificationTarget';
export { activatePushNotifications, usePushRegistration } from './domain/usePushRegistration';
export type {
  DeviceToken,
  PushPermission,
  PushRegistrationStatus,
  PushRepository,
} from './domain/usePushRegistration';
export { pushRepository } from './data/pushRepository';
