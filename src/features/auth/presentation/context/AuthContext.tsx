// Responsabilidad: mantener una única instancia global del estado
// de autenticación para toda la aplicación.
//
// El Provider conecta la implementación concreta authRepository
// con los casos de uso expuestos por useAuth.
//
// Las pantallas consumen useAuthSession() y no necesitan conocer
// directamente el repositorio.

import {
  createContext,
  ReactNode,
  useContext,
} from 'react';

import { authRepository } from '../../data/authRepository';
import { useAuth } from '../../domain/useAuth';

type AuthContextValue = ReturnType<typeof useAuth>;

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined
  );

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  // IMPORTANTE:
  // useAuth se ejecuta una sola vez aquí.
  //
  // LoginScreen, RegisterScreen y RootNavigator
  // compartirán exactamente el mismo estado.
  const auth = useAuth(authRepository);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthSession() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuthSession debe utilizarse dentro de AuthProvider'
    );
  }

  return context;
}