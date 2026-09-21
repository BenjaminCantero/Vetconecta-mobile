// Superficie pública del dominio auth.
// Ningún otro dominio debería importar directamente archivos
// internos de auth.

export { useAuth } from './domain/useAuth';

export type {
  AuthRepository,
  Credentials,
  RegisterData,
  PasswordResetData,
} from './domain/useAuth';

export type {
  User,
  UserRole,
} from './domain/User';

export { authRepository } from './data/authRepository';

export {
  AuthProvider,
  useAuthSession,
} from './presentation/context/AuthContext';

export { default as LoginScreen } from './presentation/screens/LoginScreen';

export { default as WelcomeScreen } from './presentation/screens/WelcomeScreen';

export { default as RegisterScreen } from './presentation/screens/RegisterScreen';

export { default as ForgotPasswordScreen } from './presentation/screens/ForgotPasswordScreen';

// Más adelante se puede dejar de exponer públicamente
// authRepository y useAuth cuando toda la autenticación
// se consuma exclusivamente mediante AuthProvider/useAuthSession.