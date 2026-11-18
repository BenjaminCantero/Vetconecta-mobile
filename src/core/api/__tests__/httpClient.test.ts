import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { StorageKeys } from '../../storage/asyncStorage';
import { secureStorage } from '../../storage/secureStorage';
import { ENDPOINTS } from '../endpoints';
import { httpClient } from '../httpClient';
import { onSessionExpired } from '../sessionEvents';
import { requestTokenRefresh } from '../tokenRefresh';

jest.mock('../tokenRefresh', () => ({
  ...jest.requireActual('../tokenRefresh'),
  requestTokenRefresh: jest.fn(),
}));

const refresh = requestTokenRefresh as jest.MockedFunction<typeof requestTokenRefresh>;

type FakeReply = { status: number; data?: unknown };

function fakeServer(reply: (config: InternalAxiosRequestConfig) => FakeReply) {
  const adapter = jest.fn(async (config: InternalAxiosRequestConfig) => {
    const { status, data = null } = reply(config);
    const response: AxiosResponse = {
      status,
      statusText: String(status),
      headers: {},
      config,
      data,
    };

    if (status >= 200 && status < 300) {
      return response;
    }

    throw new AxiosError(
      `Request failed with status code ${status}`,
      AxiosError.ERR_BAD_REQUEST,
      config,
      {},
      response,
    );
  });

  httpClient.defaults.adapter = adapter as unknown as AxiosAdapter;

  return adapter;
}

function serverAccepting(token: string) {
  return fakeServer((config) =>
    config.headers.Authorization === `Bearer ${token}`
      ? { status: 200, data: { ok: true } }
      : { status: 401 },
  );
}

describe('httpClient: sesión y renovación del token (I3)', () => {
  let sessionExpired: jest.Mock;
  let unsubscribe: () => void;

  beforeEach(async () => {
    await secureStorage.clearTokens();
    await AsyncStorage.clear();
    refresh.mockReset();
    sessionExpired = jest.fn();
    unsubscribe = onSessionExpired(sessionExpired);
  });

  afterEach(() => {
    unsubscribe();
  });

  it('un 401 sin token (login fallido) no se trata como sesión vencida', async () => {
    fakeServer(() => ({ status: 401 }));

    await expect(
      httpClient.post(ENDPOINTS.AUTH.LOGIN, { email: 'dueno@correo.cl', password: 'mala' }),
    ).rejects.toMatchObject({ response: { status: 401 } });

    expect(refresh).not.toHaveBeenCalled();
    expect(sessionExpired).not.toHaveBeenCalled();
  });

  it('renueva el token y repite la petición', async () => {
    await secureStorage.saveTokens('viejo', 'refresh-1');
    const adapter = serverAccepting('nuevo');
    refresh.mockResolvedValue({ accessToken: 'nuevo' });

    const { data } = await httpClient.get(ENDPOINTS.PETS.LIST);

    expect(data).toEqual({ ok: true });
    expect(refresh).toHaveBeenCalledWith('refresh-1');
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(await secureStorage.getAccessToken()).toBe('nuevo');
    expect(sessionExpired).not.toHaveBeenCalled();
  });

  it('varias peticiones con el token vencido comparten una sola renovación', async () => {
    await secureStorage.saveTokens('viejo', 'refresh-1');
    serverAccepting('nuevo');
    refresh.mockResolvedValue({ accessToken: 'nuevo' });

    const responses = await Promise.all([
      httpClient.get(ENDPOINTS.PETS.LIST),
      httpClient.get(ENDPOINTS.APPOINTMENTS.LIST),
      httpClient.get(ENDPOINTS.CLIENTS.ME),
    ]);

    expect(responses.map((response) => response.status)).toEqual([200, 200, 200]);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('sin refresh token cierra la sesión y avisa una vez', async () => {
    await secureStorage.saveTokens('viejo');
    await AsyncStorage.setItem(StorageKeys.AUTH_USER, JSON.stringify({ id: 'u1' }));
    fakeServer(() => ({ status: 401 }));

    await expect(httpClient.get(ENDPOINTS.PETS.LIST)).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(sessionExpired).toHaveBeenCalledTimes(1);
    expect(await secureStorage.getAccessToken()).toBeNull();
    expect(await AsyncStorage.getItem(StorageKeys.AUTH_USER)).toBeNull();
  });

  it('si el token renovado también es rechazado, cierra la sesión sin repetir más', async () => {
    await secureStorage.saveTokens('viejo', 'refresh-1');
    const adapter = fakeServer(() => ({ status: 401 }));
    refresh.mockResolvedValue({ accessToken: 'nuevo' });

    await expect(httpClient.get(ENDPOINTS.PETS.LIST)).rejects.toBeInstanceOf(AxiosError);

    expect(adapter).toHaveBeenCalledTimes(2);
    expect(sessionExpired).toHaveBeenCalledTimes(1);
  });

  it('si no hay red para renovar, conserva la sesión', async () => {
    await secureStorage.saveTokens('viejo', 'refresh-1');
    fakeServer(() => ({ status: 401 }));
    refresh.mockRejectedValue(new AxiosError('Network Error', AxiosError.ERR_NETWORK));

    await expect(httpClient.get(ENDPOINTS.PETS.LIST)).rejects.toBeInstanceOf(AxiosError);

    expect(sessionExpired).not.toHaveBeenCalled();
    expect(await secureStorage.getAccessToken()).toBe('viejo');
  });

  it('el 401 del cambio de contraseña no renueva ni cierra la sesión', async () => {
    await secureStorage.saveTokens('viejo', 'refresh-1');
    fakeServer(() => ({ status: 401 }));

    await expect(httpClient.put(ENDPOINTS.CLIENTS.PASSWORD, {})).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(refresh).not.toHaveBeenCalled();
    expect(sessionExpired).not.toHaveBeenCalled();
  });

  it('un 403 no toca la sesión', async () => {
    await secureStorage.saveTokens('viejo', 'refresh-1');
    fakeServer(() => ({ status: 403 }));

    await expect(httpClient.get(ENDPOINTS.CLIENTS.ME)).rejects.toMatchObject({
      response: { status: 403 },
    });

    expect(refresh).not.toHaveBeenCalled();
    expect(sessionExpired).not.toHaveBeenCalled();
    expect(await secureStorage.getAccessToken()).toBe('viejo');
  });
});
