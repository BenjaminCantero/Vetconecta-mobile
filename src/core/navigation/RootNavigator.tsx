// Responsabilidad: stack raíz de navegación (capa CORE).
// Decide entre el flujo de auth (no autenticado) y el flujo de la app
// (tabs + pantallas de detalle) según la sesión activa.

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../theme/colors';
import { authRepository } from '../../features/auth/data/authRepository';
import { useAuth } from '../../features/auth/domain/useAuth';

import WelcomeScreen from '../../features/auth/presentation/screens/WelcomeScreen';
import LoginScreen from '../../features/auth/presentation/screens/LoginScreen';
import ForgotPasswordScreen from '../../features/auth/presentation/screens/ForgotPasswordScreen';

import { TabNavigator } from './TabNavigator';

import PetDetailScreen from '../../features/pets/presentation/screens/PetDetailScreen';
import HealthCardScreen from '../../features/pets/presentation/screens/HealthCardScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  ForgotPassword: undefined;

  AppTabs: undefined;

  PetDetail: {
    petId: string;
  };

  HealthCard: {
    petId: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth(authRepository);

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen
            name="AppTabs"
            component={TabNavigator}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="PetDetail"
            component={PetDetailScreen}
            options={{
              title: 'Detalle de mascota',
            }}
          />

          <Stack.Screen
            name="HealthCard"
            component={HealthCardScreen}
            options={{
              title: 'Carnet de salud',
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{
              headerShown: false,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}