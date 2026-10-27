
import { asyncStorage, StorageKeys } from '../../../../core/storage/asyncStorage';
import { ENV } from '../../../../core/config/env';
import { isOnline } from '../../../../core/network/connectivity';
import { notificationsRepository } from '../notificationsRepository';

jest.mock('../../../../core/storage/asyncStorage', () => ({
  StorageKeys: {
    AUTH_USER: 'auth-user',
    MOCK_NOTIFICATION_READ_IDS: 'read-ids',
    NOTIFICATIONS_CACHE: 'notifications-cache',
  },
  asyncStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

jest.mock('../../../../core/config/env', () => ({
  ENV: { USE_MOCKS: true },
}));

jest.mock('../../../../core/network/connectivity', () => ({
  isOnline: jest.fn(),
}));

type StoredValues = Record<string, unknown>;

let stored: StoredValues;

function setUser(id: string, email?: string): void {
  stored[StorageKeys.AUTH_USER] = { id, email };
}

beforeEach(() => {
  jest.resetAllMocks();
  ENV.USE_MOCKS = true;

  stored = {};
  setUser('user-001', 'usuario1@example.com');

  (isOnline as jest.Mock).mockResolvedValue(true);

  (asyncStorage.getItem as jest.Mock).mockImplementation(
    async (key: string) => stored[key] ?? null,
  );

  (asyncStorage.setItem as jest.Mock).mockImplementation(
    async (key: string, value: unknown) => {
      stored[key] = value;
      return true;
    },
  );
});

it('orders notices and persists individual and bulk reads across fetches', async () => {
  const initial = await notificationsRepository.getNotifications();

  expect(initial.map((item) => item.date)).toEqual(
    initial.map((item) => item.date).sort().reverse(),
  );

  await notificationsRepository.markAsRead([initial[0].id]);

  const updated = await notificationsRepository.getNotifications();

  expect(updated[0].read).toBe(true);

  await notificationsRepository.markAsRead(
    initial.map((item) => item.id),
  );

  const allRead = await notificationsRepository.getNotifications();

  expect(allRead.every((item) => item.read)).toBe(true);
});

it('preserves concurrent read updates', async () => {
  const initial = await notificationsRepository.getNotifications();

  await Promise.all(
    initial.map((item) =>
      notificationsRepository.markAsRead([item.id]),
    ),
  );

  const updated = await notificationsRepository.getNotifications();

  expect(updated.every((item) => item.read)).toBe(true);
});

it('reports failed read-state saves without marking the notice read', async () => {
  const initial = await notificationsRepository.getNotifications();
  const notificationId = initial.find((item) => !item.read)?.id;

  expect(notificationId).toBeDefined();

  (asyncStorage.setItem as jest.Mock).mockImplementation(
    async (key: string, value: unknown) => {
      if (key === StorageKeys.MOCK_NOTIFICATION_READ_IDS) {
        return false;
      }

      stored[key] = value;
      return true;
    },
  );

  await expect(
    notificationsRepository.markAsRead([notificationId!]),
  ).rejects.toThrow('No se pudo guardar la lectura');

  const updated = await notificationsRepository.getNotifications();

  expect(
    updated.find((item) => item.id === notificationId)?.read,
  ).toBe(false);
});

it('rejects invalid stored data and storage read failures', async () => {
  stored[StorageKeys.MOCK_NOTIFICATION_READ_IDS] = { bad: true };

  await expect(
    notificationsRepository.getNotifications(),
  ).rejects.toThrow();

  (asyncStorage.getItem as jest.Mock).mockRejectedValue(
    new Error('storage unavailable'),
  );

  await expect(
    notificationsRepository.getNotifications(),
  ).rejects.toThrow('storage unavailable');
});

it('never presents mock notices outside mock mode', async () => {
  ENV.USE_MOCKS = false;

  expect(
    await notificationsRepository.getNotifications(),
  ).toEqual([]);

  expect(asyncStorage.getItem).not.toHaveBeenCalled();
});

it('saves the latest notification list in the cache', async () => {
  const notifications = await notificationsRepository.getNotifications();

  const cache = stored[StorageKeys.NOTIFICATIONS_CACHE] as {
    userId: string;
    notifications: typeof notifications;
    savedAt: string;
  };

  expect(cache).toBeDefined();
  expect(cache.userId).toBe('user-001');
  expect(cache.notifications).toEqual(notifications);
  expect(cache.savedAt).toEqual(expect.any(String));
});

it('loads cached notifications when the device is offline', async () => {
  const onlineNotifications =
    await notificationsRepository.getNotifications();

  (isOnline as jest.Mock).mockResolvedValue(false);

  const offlineNotifications =
    await notificationsRepository.getNotifications();

  expect(offlineNotifications).toEqual(onlineNotifications);
});

it('does not expose cached notifications to another user', async () => {
  await notificationsRepository.getNotifications();

  const firstUserCache = stored[StorageKeys.NOTIFICATIONS_CACHE];

  setUser('user-002', 'usuario2@example.com');
  (isOnline as jest.Mock).mockResolvedValue(false);

  const notifications =
    await notificationsRepository.getNotifications();

  expect(notifications.length).toBeGreaterThan(0);
  expect(stored[StorageKeys.NOTIFICATIONS_CACHE]).toBe(
    firstUserCache,
  );
});

it('keeps read notifications marked as read in the offline cache', async () => {
  const initial = await notificationsRepository.getNotifications();
  const notificationId = initial[0].id;

  await notificationsRepository.markAsRead([notificationId]);

  (isOnline as jest.Mock).mockResolvedValue(false);

  const offlineNotifications =
    await notificationsRepository.getNotifications();

  expect(
    offlineNotifications.find(
      (item) => item.id === notificationId,
    )?.read,
  ).toBe(true);
});

it('does not show notifications without a saved user', async () => {
  delete stored[StorageKeys.AUTH_USER];

  const notifications =
    await notificationsRepository.getNotifications();

  expect(notifications).toEqual([]);
  expect(stored[StorageKeys.NOTIFICATIONS_CACHE]).toBeUndefined();
});

it('keeps read states separated between different users', async () => {
  const firstUserNotifications =
    await notificationsRepository.getNotifications();

  const notificationId = firstUserNotifications[0].id;

  await notificationsRepository.markAsRead([notificationId]);

  setUser('user-002', 'usuario2@example.com');

  const secondUserNotifications =
    await notificationsRepository.getNotifications();

  expect(
    secondUserNotifications.find(
      (item) => item.id === notificationId,
    )?.read,
  ).toBe(false);

  setUser('user-001', 'usuario1@example.com');

  const firstUserAgain =
    await notificationsRepository.getNotifications();

  expect(
    firstUserAgain.find(
      (item) => item.id === notificationId,
    )?.read,
  ).toBe(true);
});

it('separates demo accounts even when their user IDs are identical', async () => {
  setUser('mock-user-id', 'PRIMERO@example.com');

  const initial = await notificationsRepository.getNotifications();
  const notificationId = initial[0].id;

  await notificationsRepository.markAsRead([notificationId]);

  setUser('mock-user-id', 'segundo@example.com');

  const secondAccount =
    await notificationsRepository.getNotifications();

  expect(
    secondAccount.find(
      (item) => item.id === notificationId,
    )?.read,
  ).toBe(false);

  setUser('mock-user-id', 'primero@EXAMPLE.com');

  const firstAccountAgain =
    await notificationsRepository.getNotifications();

  expect(
    firstAccountAgain.find(
      (item) => item.id === notificationId,
    )?.read,
  ).toBe(true);
});

it('rejects malformed per-account read states', async () => {
  stored[StorageKeys.MOCK_NOTIFICATION_READ_IDS] = {
    accounts: [
      {
        userId: 'user-001',
        ids: [123],
      },
    ],
  };

  await expect(
    notificationsRepository.getNotifications(),
  ).rejects.toThrow(
    'No se pudo leer el estado de tus avisos',
  );
});

it('handles legacy read IDs without assigning them to another account', async () => {
  stored[StorageKeys.MOCK_NOTIFICATION_READ_IDS] = [
    'demo-appointment-005',
  ];

  const notifications =
    await notificationsRepository.getNotifications();

  expect(
    notifications.find(
      (item) => item.id === 'demo-appointment-005',
    )?.read,
  ).toBe(false);
});

it('reports cache write failures', async () => {
  (asyncStorage.setItem as jest.Mock).mockResolvedValue(false);

  await expect(
    notificationsRepository.getNotifications(),
  ).rejects.toThrow(
    'No se pudo guardar el caché de notificaciones',
  );
});
