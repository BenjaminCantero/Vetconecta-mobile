// Pruebas de la lectura "red primero, caché de respaldo" y del borrado al cerrar sesión (G1).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError, type AxiosResponse } from 'axios';

import { asyncStorage, StorageKeys } from '../../storage/asyncStorage';
import { clearSessionData } from '../../storage/sessionStorage';
import { cachedRead } from '../cachedRead';
import { isOnline } from '../connectivity';

jest.mock('../connectivity', () => ({
  isOnline: jest.fn(),
}));

const online = isOnline as jest.Mock;

const KEY = 'cache:user-1:carnet:pet-1';
const OFFLINE_MESSAGE = 'Sin conexión y sin datos guardados.';

function readCarnet(fetcher: () => Promise<string[]>) {
  return cachedRead({
    resource: 'carnet',
    resourceId: 'pet-1',
    fetcher,
    offlineMessage: OFFLINE_MESSAGE,
  });
}

beforeEach(async () => {
  await AsyncStorage.clear();
  await asyncStorage.setItem(StorageKeys.AUTH_USER, { id: 'user-1' });
  online.mockResolvedValue(true);
});

it('con red devuelve la respuesta y la guarda por usuario y mascota', async () => {
  const result = await readCarnet(async () => ['vacuna']);

  expect(result.data).toEqual(['vacuna']);
  expect(result.fromCache).toBe(false);
  expect(JSON.parse((await AsyncStorage.getItem(KEY))!).data).toEqual(['vacuna']);
});

it('sin red devuelve lo guardado marcado como desde caché', async () => {
  await readCarnet(async () => ['vacuna']);
  online.mockResolvedValue(false);
  const fetcher = jest.fn();

  const result = await readCarnet(fetcher);

  expect(result.data).toEqual(['vacuna']);
  expect(result.fromCache).toBe(true);
  expect(result.updatedAt).toEqual(expect.any(String));
  expect(fetcher).not.toHaveBeenCalled();
});

it('sin red y sin datos guardados informa el problema', async () => {
  online.mockResolvedValue(false);

  await expect(readCarnet(jest.fn())).rejects.toThrow(OFFLINE_MESSAGE);
});

it('usa la caché si la petición falla por la conexión', async () => {
  await readCarnet(async () => ['vacuna']);

  const result = await readCarnet(() =>
    Promise.reject(new AxiosError('Network Error', 'ERR_NETWORK')),
  );

  expect(result.fromCache).toBe(true);
});

it('no oculta un error HTTP con la caché', async () => {
  await readCarnet(async () => ['vacuna']);
  const serverError = new AxiosError('error', '500', undefined, undefined, {
    status: 500,
  } as AxiosResponse);

  await expect(readCarnet(() => Promise.reject(serverError))).rejects.toBe(serverError);
});

it('no entrega la caché de otro usuario', async () => {
  await readCarnet(async () => ['vacuna']);
  await asyncStorage.setItem(StorageKeys.AUTH_USER, { id: 'user-2' });
  online.mockResolvedValue(false);

  await expect(readCarnet(jest.fn())).rejects.toThrow(OFFLINE_MESSAGE);
});

it('al cerrar sesión no queda caché ni usuario en el dispositivo', async () => {
  await readCarnet(async () => ['vacuna']);

  await clearSessionData();

  expect(await AsyncStorage.getAllKeys()).toEqual([]);
});

it('descarta una respuesta que llega después de cerrar sesión', async () => {
  let resolveFetch: (value: string[]) => void = () => undefined;
  const pending = readCarnet(
    () =>
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
  );
  await new Promise((resolve) => setTimeout(resolve));

  await clearSessionData();
  resolveFetch(['vacuna']);
  await pending;

  expect(await AsyncStorage.getAllKeys()).toEqual([]);
});
