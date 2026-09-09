// Responsabilidad: acceso a datos de autenticación (capa DATA).
// Implementa el contrato AuthRepository del dominio. Guarda/lee la sesión
// en AsyncStorage y mapea los DTO de la API a entidades del dominio.
//
// Nota: en esta etapa la API externa solo expone lectura (GET), por lo que
// el login se resuelve localmente (mock) hasta que el backend habilite el
// endpoint de escritura POST /auth/login definido en `endpoints.ts`.

import { StorageKeys, asyncStorage } from '../../../core/storage/asyncStorage';
import type { AuthRepository, Credentials } from '../domain/useAuth';
import type { User } from '../domain/User';
import type { LoginResponseDto } from './authDto';

function toUser(dto: LoginResponseDto['user']): User {
  return {
    id: dto.id,
    name: dto.nombre,
    email: dto.email,
  };
}

export const authRepository: AuthRepository = {
  async login(credentials: Credentials) {
    const mockResponse: LoginResponseDto = {
      token: 'mock-token',
      user: { id: 'mock-id', nombre: 'Usuario Demo', email: credentials.email },
    };

    const user = toUser(mockResponse.user);
    await asyncStorage.setItem(StorageKeys.AUTH_TOKEN, mockResponse.token);
    await asyncStorage.setItem(StorageKeys.AUTH_USER, user);

    return { user, token: mockResponse.token };
  },

  async getStoredUser() {
    return asyncStorage.getItem<User>(StorageKeys.AUTH_USER);
  },

  async clearSession() {
    await asyncStorage.removeItem(StorageKeys.AUTH_TOKEN);
    await asyncStorage.removeItem(StorageKeys.AUTH_USER);
  },
};
