// Responsabilidad: casos de uso de autenticación (capa DOMAIN de auth).
//
// Define el contrato AuthRepository, implementado en la capa data.
//
// Expone:
// - sesión activa
// - login
// - registro
// - recuperación de contraseña
// - logout
//
// No conoce Axios, fetch, endpoints ni AsyncStorage.

import { useCallback, useEffect, useState } from 'react';

import type { User } from './User';

// -----------------------------------------------------------------------------
// LOGIN
// -----------------------------------------------------------------------------

export interface Credentials {
  email: string;
  password: string;
}

// -----------------------------------------------------------------------------
// REGISTRO
// -----------------------------------------------------------------------------

export interface RegisterData {
  nombres: string;
  apellidos: string;
  rut: string;
  email: string;
  telefono: string;
  password: string;
}

// -----------------------------------------------------------------------------
// RECUPERACIÓN DE CONTRASEÑA
// -----------------------------------------------------------------------------

export interface PasswordResetData {
  email: string;
}

// -----------------------------------------------------------------------------
// CONTRATO DEL REPOSITORIO
// -----------------------------------------------------------------------------

export interface AuthRepository {
  login: (credentials: Credentials) => Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }>;

  register: (data: RegisterData) => Promise<void>;

  requestPasswordReset: (data: PasswordResetData) => Promise<void>;

  getStoredUser: () => Promise<User | null>;

  clearSession: () => Promise<void>;
}

// -----------------------------------------------------------------------------
// CASOS DE USO
// -----------------------------------------------------------------------------

export function useAuth(authRepository: AuthRepository) {
  const [user, setUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // ---------------------------------------------------------------------------
  // RECUPERAR SESIÓN GUARDADA
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    authRepository
      .getStoredUser()
      .then((storedUser) => {
        if (!cancelled) {
          setUser(storedUser);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authRepository]);

  // ---------------------------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------------------------

  const login = useCallback(
    async (credentials: Credentials) => {
      setIsLoading(true);

      try {
        const { user: loggedUser } = await authRepository.login(credentials);

        setUser(loggedUser);

        return loggedUser;
      } finally {
        setIsLoading(false);
      }
    },
    [authRepository],
  );

  // ---------------------------------------------------------------------------
  // REGISTRO
  // ---------------------------------------------------------------------------

  const register = useCallback(
    async (data: RegisterData) => {
      setIsLoading(true);

      try {
        await authRepository.register(data);
      } finally {
        setIsLoading(false);
      }
    },
    [authRepository],
  );

  // ---------------------------------------------------------------------------
  // RECUPERAR CONTRASEÑA
  // ---------------------------------------------------------------------------

  const requestPasswordReset = useCallback(
    async (data: PasswordResetData) => {
      setIsLoading(true);

      try {
        await authRepository.requestPasswordReset(data);
      } finally {
        setIsLoading(false);
      }
    },
    [authRepository],
  );

  // ---------------------------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------------------------

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await authRepository.clearSession();

      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [authRepository]);

  return {
    user,

    isLoading,

    isAuthenticated: !!user,

    login,

    register,

    requestPasswordReset,

    logout,
  };
}
