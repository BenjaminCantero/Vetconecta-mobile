import { asyncStorage } from '../../../../core/storage/asyncStorage';
import { ENV } from '../../../../core/config/env';
import { notificationsRepository } from '../notificationsRepository';

jest.mock('../../../../core/storage/asyncStorage', () => ({
  StorageKeys: { MOCK_NOTIFICATION_READ_IDS: 'read-ids' },
  asyncStorage: { getItem: jest.fn(), setItem: jest.fn() },
}));
jest.mock('../../../../core/config/env', () => ({ ENV: { USE_MOCKS: true } }));

beforeEach(() => {
  jest.resetAllMocks();
  ENV.USE_MOCKS = true;
  let stored: string[] = [];
  (asyncStorage.getItem as jest.Mock).mockImplementation(async () => stored);
  (asyncStorage.setItem as jest.Mock).mockImplementation(async (_key, value) => {
    stored = value;
    return true;
  });
});

it('orders notices and persists individual and bulk reads across fetches', async () => {
  const initial = await notificationsRepository.getNotifications();
  expect(initial.map((item) => item.date)).toEqual(
    initial
      .map((item) => item.date)
      .sort()
      .reverse(),
  );
  await notificationsRepository.markAsRead([initial[0].id]);
  expect((await notificationsRepository.getNotifications())[0].read).toBe(true);
  await notificationsRepository.markAsRead(initial.map((item) => item.id));
  expect((await notificationsRepository.getNotifications()).every((item) => item.read)).toBe(true);
});

it('preserves concurrent read updates', async () => {
  const initial = await notificationsRepository.getNotifications();
  await Promise.all(initial.map((item) => notificationsRepository.markAsRead([item.id])));
  expect((await notificationsRepository.getNotifications()).every((item) => item.read)).toBe(true);
});

it('reports failed saves without marking the notice read', async () => {
  (asyncStorage.setItem as jest.Mock).mockResolvedValue(false);
  await expect(notificationsRepository.markAsRead(['demo-appointment-005'])).rejects.toThrow(
    'No se pudo guardar',
  );
  expect((await notificationsRepository.getNotifications())[0].read).toBe(false);
});

it('rejects invalid stored data and storage read failures', async () => {
  (asyncStorage.getItem as jest.Mock).mockResolvedValue({ bad: true });
  await expect(notificationsRepository.getNotifications()).rejects.toThrow();
  (asyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('storage unavailable'));
  await expect(notificationsRepository.getNotifications()).rejects.toThrow('storage unavailable');
});

it('never presents mock notices outside mock mode', async () => {
  ENV.USE_MOCKS = false;
  expect(await notificationsRepository.getNotifications()).toEqual([]);
  expect(asyncStorage.getItem).not.toHaveBeenCalled();
});
