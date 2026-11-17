// Responsabilidad: acceso a datos de notificaciones.
// E3 / G1: persistencia de lecturas y caché offline por cuenta.

import type { Notification } from '../domain/Notification';
import { ENV } from '../../../core/config/env';
import { cachedRead, type CachedResult } from '../../../core/network/cachedRead';
import { asyncStorage, StorageKeys } from '../../../core/storage/asyncStorage';
import { buildCacheKey, readCache, writeCache } from '../../../core/storage/offlineCache';
import { getCurrentAccountId } from '../../../core/storage/sessionStorage';
import { notificationsMock } from './notificationsMock';

interface ReadState {
  userId: string;
  ids: string[];
}

interface ReadStateStore {
  accounts: ReadState[];
}

const NOTIFICATIONS_RESOURCE = 'notificaciones';

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

async function getNotificationsSnapshot(): Promise<CachedResult<Notification[]>> {
  const empty = { data: [], fromCache: false, updatedAt: null };

  if (!ENV.USE_MOCKS) {
    return empty;
  }

  const accountId = await getCurrentAccountId();

  if (!accountId) {
    return empty;
  }

  const result = await cachedRead({
    resource: NOTIFICATIONS_RESOURCE,
    fetcher: () => fetchNotifications(accountId),
    offlineMessage: 'Sin conexión. Aún no hay avisos guardados en este dispositivo.',
  });

  return { ...result, data: sortNotifications(result.data) };
}

export const notificationsRepository = {
  getNotificationsSnapshot,

  async getNotifications(): Promise<Notification[]> {
    return (await getNotificationsSnapshot()).data;
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
        const cacheKey = buildCacheKey(userId, NOTIFICATIONS_RESOURCE);
        const cached = await readCache<Notification[]>(cacheKey);

        if (cached !== null) {
          const readIds = new Set(validIds);

          await writeCache(
            cacheKey,
            cached.data.map((item) => ({
              ...item,
              read: item.read || readIds.has(item.id),
            })),
            cached.updatedAt,
          );
        }
      });

    pendingWrite = write;

    return write;
  },
};
