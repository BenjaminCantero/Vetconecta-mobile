// Responsabilidad: acceso a datos de notificaciones

import type { Notification } from '../domain/Notification';

export const notificationsRepository = {
  async getNotifications(): Promise<Notification[]> {
    return []; // stub diferido hasta que el backend habilite el GET
  },
};
