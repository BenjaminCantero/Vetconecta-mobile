// Responsabilidad: acceso a datos de autenticación.
// Capa DATA.
//
// Implementa el contrato AuthRepository definido en el dominio.
//
// Actualmente usa respuestas mock porque los endpoints reales
// todavía no están disponibles.
//
// Cuando el backend esté operativo, los mocks serán reemplazados por:
//
// POST /v1/auth/login
// POST /v1/auth/register
// POST /v1/auth/password-reset
// POST /v1/auth/logout
// POST /v1/auth/refresh

import {
  StorageKeys,
  asyncStorage,
} from '../../../core/storage/asyncStorage';

import type {
  AuthRepository,
  Credentials,
  RegisterData,
  PasswordResetData,
} from '../domain/useAuth';

import type {
  User,
} from '../domain/User';

import type {
  LoginResponseDto,
  RegisterRequestDto,
  PasswordResetRequestDto,
} from './authDto';

// -----------------------------------------------------------------------------
// MAPPERS
// -----------------------------------------------------------------------------

function toUser(
  dto: LoginResponseDto['user']
): User {
  return {
    id: dto.id,
    email: dto.email,
    role: dto.role,
    clientId: dto.clientId,
  };
}

// -----------------------------------------------------------------------------
// REPOSITORY
// -----------------------------------------------------------------------------

export const authRepository: AuthRepository = {
  // ---------------------------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------------------------

  async login(
    credentials: Credentials
  ) {
    // MOCK TEMPORAL
    //
    // En producción:
    //
    // POST /v1/auth/login
    //
    // {
    //   email,
    //   password
    // }

    const mockResponse:
      LoginResponseDto = {
      accessToken:
        'mock-access-token',

      refreshToken:
        'mock-refresh-token',

      user: {
        id: 'mock-user-id',

        email:
          credentials.email,

        role: 'owner',

        clientId:
          'mock-client-id',
      },
    };

    const user = toUser(
      mockResponse.user
    );

    await asyncStorage.setItem(
      StorageKeys.AUTH_ACCESS_TOKEN,
      mockResponse.accessToken
    );

    await asyncStorage.setItem(
      StorageKeys.AUTH_REFRESH_TOKEN,
      mockResponse.refreshToken
    );

    await asyncStorage.setItem(
      StorageKeys.AUTH_USER,
      user
    );

    return {
      user,

      accessToken:
        mockResponse.accessToken,

      refreshToken:
        mockResponse.refreshToken,
    };
  },

  // ---------------------------------------------------------------------------
  // REGISTRO
  // ---------------------------------------------------------------------------

  async register(
    data: RegisterData
  ) {
    const request:
      RegisterRequestDto = {
      nombres: data.nombres,

      apellidos:
        data.apellidos,

      rut: data.rut,

      email: data.email,

      telefono:
        data.telefono,

      password:
        data.password,
    };

    // MOCK TEMPORAL
    //
    // En producción:
    //
    // POST /v1/auth/register
    //
    // auth-service creará la identidad del usuario
    // y coordinará internamente la creación del
    // perfil con clients-pets-service.

    console.log(
      'Registro simulado:',
      request
    );

    await new Promise<void>(
      (resolve) =>
        setTimeout(
          resolve,
          800
        )
    );
  },

  // ---------------------------------------------------------------------------
  // RECUPERACIÓN DE CONTRASEÑA
  // ---------------------------------------------------------------------------

  async requestPasswordReset(
    data: PasswordResetData
  ) {
    const request:
      PasswordResetRequestDto = {
      email: data.email,
    };

    // MOCK TEMPORAL
    //
    // En producción:
    //
    // POST /v1/auth/password-reset
    //
    // auth-service recibe el correo y coordina
    // internamente el proceso de recuperación.
    //
    // notifications-service será responsable
    // del envío del correo.

    console.log(
      'Recuperación de contraseña simulada:',
      request
    );

    await new Promise<void>(
      (resolve) =>
        setTimeout(
          resolve,
          800
        )
    );
  },

  // ---------------------------------------------------------------------------
  // SESIÓN GUARDADA
  // ---------------------------------------------------------------------------

  async getStoredUser() {
    return asyncStorage.getItem<User>(
      StorageKeys.AUTH_USER
    );
  },

  // ---------------------------------------------------------------------------
  // CERRAR SESIÓN
  // ---------------------------------------------------------------------------

  async clearSession() {
    await asyncStorage.removeItem(
      StorageKeys.AUTH_ACCESS_TOKEN
    );

    await asyncStorage.removeItem(
      StorageKeys.AUTH_REFRESH_TOKEN
    );

    await asyncStorage.removeItem(
      StorageKeys.AUTH_USER
    );
  },
};