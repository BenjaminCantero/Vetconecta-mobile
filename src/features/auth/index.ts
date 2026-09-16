// Superficie publica del dominio auth y ningun otro dominio (ni home) puede importarlo

export { useAuth } from './domain/useAuth';
export type { AuthRepository, Credentials } from './domain/useAuth';
export type { User } from './domain/User';
export { authRepository } from './data/authRepository';
export { default as LoginScreen } from './presentation/screens/LoginScreen';
export { default as WelcomeScreen } from './presentation/screens/WelcomeScreen';
export { default as ForgotPasswordScreen } from './presentation/screens/ForgotPasswordScreen';
// Nota: cuando exista un hook pre-cableado que inyecte authRepository internamente, dejar de exportar authRepository y exponer solo el hook.
