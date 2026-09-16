// Superficie publica del dominio notifications
export { notificationsRepository } from './data/notificationsRepository';
export type { Notification } from './domain/Notification';
export { useNotifications } from './domain/useNotifications';
export { default as NotificationsScreen } from './presentation/screens/NotificationsScreen';
