// Responsabilidad: acceso a datos de autenticación.
// Capa DATA.
//
// Implementa el contrato AuthRepository definido en el dominio.
//
// Login real:
//
// POST /v1/auth/login
//
// auth-service identifica al usuario con `identifier` (correo o RUT) y
// responde con los datos del usuario en la raíz más `accessToken`.
//
// Registro y recuperación de contraseña siguen simulados: sus endpoints
// todavía no están implementados en el backend.

import { isAxiosError } from 'axios';

import { ENDPOINTS } from '../../../core/api/endpoints';
import { toHttpError } from '../../../core/api/httpError';
import { httpClient } from '../../../core/api/httpClient';
import { onSessionExpired } from '../../../core/api/sessionEvents';
import { ENV } from '../../../core/config/env';
import { StorageKeys, asyncStorage } from '../../../core/storage/asyncStorage';

import type {
  AuthRepository,
  Credentials,
  RegisterData,
  PasswordResetData,
} from '../domain/useAuth';

import type { User } from '../domain/User';

import type { LoginResponseDto, RegisterRequestDto, PasswordResetRequestDto } from './authDto';

// -----------------------------------------------------------------------------
// MAPPERS
// -----------------------------------------------------------------------------

const LOGIN_ERROR_MESSAGES = {
  network: 'No hay conexión con el servidor. Revisa tu red e inténtalo de nuevo.',
  fallback: 'No pudimos iniciar sesión. Inténtalo de nuevo más tarde.',
};

function toUser(dto: LoginResponseDto): User {
  return {
    id: dto.id,
    email: dto.email,
    role: dto.role,
    clientId: dto.clientId,
  };
}

function toLoginError(error: unknown): Error {
  if (isAxiosError(error) && error.response) {
    const { status } = error.response;

    if (status === 401) {
      return new Error('Correo o contraseña incorrectos.');
    }

    if (status === 400) {
      return new Error('Revisa el correo y la contraseña ingresados.');
    }

    if (status === 403) {
      return new Error('Tu cuenta no tiene permiso para ingresar.');
    }
  }

  return toHttpError(error, LOGIN_ERROR_MESSAGES);
}

// Guarda la sesión local a partir de la respuesta del backend.
// El backend aún no emite refresh token, así que se limpia cualquier valor
// previo (por ejemplo, el de una sesión mock anterior).
async function persistSession(dto: LoginResponseDto) {
  const user = toUser(dto);

  await asyncStorage.setItem(StorageKeys.AUTH_ACCESS_TOKEN, dto.accessToken);

  await asyncStorage.removeItem(StorageKeys.AUTH_REFRESH_TOKEN);

  await asyncStorage.setItem(StorageKeys.AUTH_USER, user);

  return {
    user,
    accessToken: dto.accessToken,
  };
}

// -----------------------------------------------------------------------------
// REPOSITORY
// -----------------------------------------------------------------------------

export const authRepository: AuthRepository = {
  // ---------------------------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------------------------

  async login(credentials: Credentials) {
    if (ENV.AUTH_USE_MOCKS) {
      const mockResponse: LoginResponseDto = {
        id: 'mock-user-id',

        email: credentials.email,

        role: 'owner',

        clientId: 'mock-client-id',

        accessToken: 'mock-access-token',
      };

      return persistSession(mockResponse);
    }

    try {
      const { data } = await httpClient.post<LoginResponseDto>(ENDPOINTS.AUTH.LOGIN, {
        identifier: credentials.email,

        password: credentials.password,
      });

      return await persistSession(data);
    } catch (error) {
      throw toLoginError(error);
    }
  },

  // ---------------------------------------------------------------------------
  // REGISTRO
  // ---------------------------------------------------------------------------
  //
  // Pendiente de backend: /v1/auth/register todavía responde con un ejemplo y
  // no crea la cuenta ni el perfil del cliente.

  async register(data: RegisterData) {
    const request: RegisterRequestDto = {
      nombres: data.nombres,

      apellidos: data.apellidos,

      rut: data.rut,

      email: data.email,

      telefono: data.telefono,

      password: data.password,
    };

    // MOCK TEMPORAL

    console.log('Registro simulado:', request);

    await new Promise<void>((resolve) => setTimeout(resolve, 800));
  },

  // ---------------------------------------------------------------------------
  // RECUPERACIÓN DE CONTRASEÑA
  // ---------------------------------------------------------------------------
  //
  // Pendiente de backend: /v1/auth/password-reset no existe todavía.

  async requestPasswordReset(data: PasswordResetData) {
    const request: PasswordResetRequestDto = {
      email: data.email,
    };

    // MOCK TEMPORAL

    console.log('Recuperación de contraseña simulada:', request);

    await new Promise<void>((resolve) => setTimeout(resolve, 800));
  },

  // ---------------------------------------------------------------------------
  // SESIÓN GUARDADA
  // ---------------------------------------------------------------------------

  async getStoredUser() {
    return asyncStorage.getItem<User>(StorageKeys.AUTH_USER);
  },

  // ---------------------------------------------------------------------------
  // CERRAR SESIÓN
  // ---------------------------------------------------------------------------

  async clearSession() {
    await asyncStorage.removeItem(StorageKeys.AUTH_ACCESS_TOKEN);

    await asyncStorage.removeItem(StorageKeys.AUTH_REFRESH_TOKEN);

    await asyncStorage.removeItem(StorageKeys.AUTH_USER);

    await asyncStorage.removeItem(StorageKeys.ACTIVE_PET_ID);
  },

  // ---------------------------------------------------------------------------
  // SESIÓN EXPIRADA
  // ---------------------------------------------------------------------------
  //
  // httpClient ya borró los tokens al recibir un 401; aquí solo se reenvía el
  // aviso para que el dominio cierre la sesión en memoria.

  onSessionExpired(listener: () => void) {
    return onSessionExpired(listener);
  },
};
