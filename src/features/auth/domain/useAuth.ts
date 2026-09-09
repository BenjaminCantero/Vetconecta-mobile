// Responsabilidad: casos de uso de autenticación (capa DOMAIN de auth).
// Define el contrato AuthRepository (implementado en la capa data) y
// expone login/logout/sesión activa sin conocer Axios ni AsyncStorage.
// La capa presentation inyecta la implementación concreta del repositorio.

import { useCallback, useEffect, useState } from 'react';

import type { User } from './User';

export interface Credentials {
  email: string;
  password: string;
}

export interface AuthRepository {
  login: (credentials: Credentials) => Promise<{ user: User; token: string }>;
  getStoredUser: () => Promise<User | null>;
  clearSession: () => Promise<void>;
}

export function useAuth(authRepository: AuthRepository) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    authRepository
      .getStoredUser()
      .then((storedUser) => {
        if (!cancelled) setUser(storedUser);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authRepository]);

  const login = useCallback(
    async (credentials: Credentials) => {
      const { user: loggedUser } = await authRepository.login(credentials);
      setUser(loggedUser);
      return loggedUser;
    },
    [authRepository]
  );

  const logout = useCallback(async () => {
    await authRepository.clearSession();
    setUser(null);
  }, [authRepository]);

  return { user, isLoading, isAuthenticated: !!user, login, logout };
}
