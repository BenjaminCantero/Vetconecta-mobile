// Responsabilidad: acceso a datos de notificaciones

import type { Notification } from '../domain/Notification';
import { ENV } from '../../../core/config/env';
import { asyncStorage, StorageKeys } from '../../../core/storage/asyncStorage';
import { notificationsMock } from './notificationsMock';

async function readIds(): Promise<string[]> {
  const stored = await asyncStorage.getItem<unknown>(StorageKeys.MOCK_NOTIFICATION_READ_IDS, true);
  if (stored === null) return [];
  if (!Array.isArray(stored) || !stored.every((id) => typeof id === 'string')) {
    throw new Error('No se pudo leer el estado de tus avisos. Intenta nuevamente.');
  }
  return stored;
}

let pendingWrite: Promise<void> = Promise.resolve();

export const notificationsRepository = {
  async getNotifications(): Promise<Notification[]> {
    if (!ENV.USE_MOCKS) return [];
    const ids = await readIds();
    return notificationsMock
      .map((item) => ({ ...item, read: item.read || ids.includes(item.id) }))
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  },
  markAsRead(ids: string[]): Promise<void> {
    const write = pendingWrite
      .catch(() => undefined)
      .then(async () => {
        if (!ENV.USE_MOCKS) throw new Error('El centro de avisos aún no está disponible.');
        const previous = await readIds();
        const validIds = ids.filter((id) => notificationsMock.some((item) => item.id === id));
        const saved = await asyncStorage.setItem(StorageKeys.MOCK_NOTIFICATION_READ_IDS, [
          ...new Set([...previous, ...validIds]),
        ]);
        if (!saved) throw new Error('No se pudo guardar la lectura. Intenta nuevamente.');
      });
    pendingWrite = write;
    return write;
  },
};
