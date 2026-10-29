// Pruebas unitarias de authRepository.login contra el contrato real de
// auth-service: request con `identifier`, respuesta plana con `accessToken`,
// persistencia de sesión y traducción de errores HTTP.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError, type AxiosResponse } from 'axios';

import { httpClient } from '../../../../core/api/httpClient';
import { StorageKeys } from '../../../../core/storage/asyncStorage';
import type { LoginResponseDto } from '../authDto';
import { authRepository } from '../authRepository';

jest.mock('../../../../core/config/env', () => ({
  ENV: {
    API_BASE_URL: 'http://test',
    API_TIMEOUT_MS: 1000,
    USE_MOCKS: true,
    AUTH_USE_MOCKS: false,
  },
}));

jest.mock('../../../../core/api/httpClient', () => ({
  httpClient: { post: jest.fn() },
}));

const post = httpClient.post as jest.Mock;

const loginResponse: LoginResponseDto = {
  id: 'user-1',
  email: 'dueno@vetconecta.cl',
  role: 'owner',
  accessToken: 'jwt-real',
};

function httpError(status: number): AxiosError {
  return new AxiosError('error', String(status), undefined, undefined, {
    status,
    data: {},
  } as AxiosResponse);
}

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

describe('authRepository.login', () => {
  it('envía identifier y password al endpoint /v1/auth/login', async () => {
    post.mockResolvedValue({ status: 201, data: loginResponse });

    await authRepository.login({
      email: 'dueno@vetconecta.cl',
      password: 'contrasena123',
    });

    expect(post).toHaveBeenCalledWith('/v1/auth/login', {
      identifier: 'dueno@vetconecta.cl',
      password: 'contrasena123',
    });
  });

  it('mapea la respuesta plana del backend al usuario del dominio', async () => {
    post.mockResolvedValue({ status: 201, data: loginResponse });

    const session = await authRepository.login({
      email: 'dueno@vetconecta.cl',
      password: 'contrasena123',
    });

    expect(session).toEqual({
      user: {
        id: 'user-1',
        email: 'dueno@vetconecta.cl',
        role: 'owner',
        clientId: undefined,
      },
      accessToken: 'jwt-real',
    });
  });

  it('guarda el token y el usuario, y descarta un refresh token previo', async () => {
    await AsyncStorage.setItem(
      StorageKeys.AUTH_REFRESH_TOKEN,
      JSON.stringify('mock-refresh-token'),
    );
    post.mockResolvedValue({ status: 201, data: loginResponse });

    await authRepository.login({
      email: 'dueno@vetconecta.cl',
      password: 'contrasena123',
    });

    expect(JSON.parse((await AsyncStorage.getItem(StorageKeys.AUTH_ACCESS_TOKEN))!)).toBe(
      'jwt-real',
    );
    expect(await AsyncStorage.getItem(StorageKeys.AUTH_REFRESH_TOKEN)).toBeNull();
    expect(JSON.parse((await AsyncStorage.getItem(StorageKeys.AUTH_USER))!)).toMatchObject({
      id: 'user-1',
      email: 'dueno@vetconecta.cl',
    });
  });

  it('401: informa credenciales incorrectas', async () => {
    post.mockRejectedValue(httpError(401));

    await expect(
      authRepository.login({ email: 'dueno@vetconecta.cl', password: 'mala' }),
    ).rejects.toThrow('Correo o contraseña incorrectos.');
  });

  it('400: informa que los datos no son válidos', async () => {
    post.mockRejectedValue(httpError(400));

    await expect(
      authRepository.login({ email: 'dueno@vetconecta.cl', password: '123' }),
    ).rejects.toThrow('Revisa el correo y la contraseña ingresados.');
  });

  it('sin red: informa el problema de conexión', async () => {
    post.mockRejectedValue(new AxiosError('Network Error', 'ERR_NETWORK'));

    await expect(
      authRepository.login({ email: 'dueno@vetconecta.cl', password: 'contrasena123' }),
    ).rejects.toThrow('No hay conexión con el servidor. Revisa tu red e inténtalo de nuevo.');
  });
});
