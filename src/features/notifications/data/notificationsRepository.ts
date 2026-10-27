// Responsabilidad: acceso a datos de notificaciones.
// E3 / G1: persistencia de lecturas y caché offline por cuenta.

import type { Notification } from '../domain/Notification';
import { ENV } from '../../../core/config/env';
import { isOnline } from '../../../core/network/connectivity';
import { asyncStorage, StorageKeys } from '../../../core/storage/asyncStorage';
import { notificationsMock } from './notificationsMock';

interface StoredSessionUser {
  id: string;
  email?: string;
}

interface NotificationsCache {
  userId: string;
  notifications: Notification[];
  savedAt: string;
}

interface ReadState {
  userId: string;
  ids: string[];
}

interface ReadStateStore {
  accounts: ReadState[];
}

function getAccountId(user: StoredSessionUser | null): string | null {
  if (!user) {
    return null;
  }

  const email = user.email?.trim().toLowerCase();

  // El login mock utiliza el mismo ID para distintas cuentas.
  // En ese caso, diferenciamos las cuentas mediante su correo.
  if (ENV.USE_MOCKS && user.id === 'mock-user-id' && email) {
    return `mock:${email}`;
  }

  return user.id || null;
}

async function getCurrentAccountId(): Promise<string | null> {
  const user = await asyncStorage.getItem<StoredSessionUser>(StorageKeys.AUTH_USER);

  return getAccountId(user);
}

async function saveCache(userId: string, notifications: Notification[]): Promise<void> {
  const cache: NotificationsCache = {
    userId,
    notifications,
    savedAt: new Date().toISOString(),
  };

  const saved = await asyncStorage.setItem(StorageKeys.NOTIFICATIONS_CACHE, cache);

  if (!saved) {
    throw new Error('No se pudo guardar el caché de notificaciones.');
  }
}

async function readCache(userId: string): Promise<Notification[] | null> {
  const cache = await asyncStorage.getItem<NotificationsCache>(StorageKeys.NOTIFICATIONS_CACHE);

  if (!cache || cache.userId !== userId || !Array.isArray(cache.notifications)) {
    return null;
  }

  return cache.notifications;
}

async function readStateStore(): Promise<ReadStateStore> {
  const stored = await asyncStorage.getItem<unknown>(StorageKeys.MOCK_NOTIFICATION_READ_IDS, true);

  if (stored === null) {
    return { accounts: [] };
  }

  // Compatibilidad con el formato anterior:
  // los IDs globales antiguos no se asignan automáticamente
  // a ninguna cuenta para evitar mezclar lecturas.
  if (Array.isArray(stored)) {
    if (!stored.every((id) => typeof id === 'string')) {
      throw new Error('No se pudo leer el estado de tus avisos. Intenta nuevamente.');
    }

    return { accounts: [] };
  }

  if (
    typeof stored !== 'object' ||
    !stored ||
    !('accounts' in stored) ||
    !Array.isArray(stored.accounts)
  ) {
    throw new Error('No se pudo leer el estado de tus avisos. Intenta nuevamente.');
  }

  const accounts = stored.accounts as unknown[];

  if (
    !accounts.every(
      (account): account is ReadState =>
        typeof account === 'object' &&
        account !== null &&
        'userId' in account &&
        typeof account.userId === 'string' &&
        'ids' in account &&
        Array.isArray(account.ids) &&
        account.ids.every((id: unknown) => typeof id === 'string'),
    )
  ) {
    throw new Error('No se pudo leer el estado de tus avisos. Intenta nuevamente.');
  }

  return { accounts };
}

async function readIds(userId: string): Promise<string[]> {
  const store = await readStateStore();

  return store.accounts.find((account) => account.userId === userId)?.ids ?? [];
}

function sortNotifications(notifications: Notification[]): Notification[] {
  return [...notifications].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

async function fetchNotifications(userId: string): Promise<Notification[]> {
  const ids = await readIds(userId);

  return sortNotifications(
    notificationsMock.map((item) => ({
      ...item,
      read: item.read || ids.includes(item.id),
    })),
  );
}

let pendingWrite: Promise<void> = Promise.resolve();

export const notificationsRepository = {
  async getNotifications(): Promise<Notification[]> {
    if (!ENV.USE_MOCKS) {
      return [];
    }

    const userId = await getCurrentAccountId();

    if (!userId) {
      return [];
    }

    const online = await isOnline();

    if (!online) {
      const cached = await readCache(userId);

      if (cached !== null) {
        return sortNotifications(cached);
      }

      return fetchNotifications(userId);
    }

    try {
      const notifications = await fetchNotifications(userId);

      await saveCache(userId, notifications);

      return notifications;
    } catch (error) {
      const cached = await readCache(userId);

      if (cached !== null) {
        return sortNotifications(cached);
      }

      throw error;
    }
  },

  markAsRead(ids: string[]): Promise<void> {
    const write = pendingWrite
      .catch(() => undefined)
      .then(async () => {
        if (!ENV.USE_MOCKS) {
          throw new Error('El centro de avisos aún no está disponible.');
        }

        const userId = await getCurrentAccountId();

        if (!userId) {
          throw new Error('Debes iniciar sesión para actualizar tus avisos.');
        }

        const store = await readStateStore();

        const previous = store.accounts.find((account) => account.userId === userId)?.ids ?? [];

        const validIds = ids.filter((id) => notificationsMock.some((item) => item.id === id));

        const updatedIds = [...new Set([...previous, ...validIds])];

        const updatedStore: ReadStateStore = {
          accounts: [
            ...store.accounts.filter((account) => account.userId !== userId),
            {
              userId,
              ids: updatedIds,
            },
          ],
        };

        const saved = await asyncStorage.setItem(
          StorageKeys.MOCK_NOTIFICATION_READ_IDS,
          updatedStore,
        );

        if (!saved) {
          throw new Error('No se pudo guardar la lectura. Intenta nuevamente.');
        }

        // Actualizar también el caché offline de esta cuenta.
        const cached = await readCache(userId);

        if (cached !== null) {
          const readIds = new Set(validIds);

          await saveCache(
            userId,
            cached.map((item) => ({
              ...item,
              read: item.read || readIds.has(item.id),
            })),
          );
        }
      });

    pendingWrite = write;

    return write;
  },
};
