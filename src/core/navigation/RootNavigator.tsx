// Responsabilidad: stack raíz de navegación (capa CORE).
// Decide entre el flujo de auth (no autenticado) y el flujo de la app
// (tabs + pantallas de detalle) según la sesión activa.

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../theme/colors';

import {
  useAuthSession,
  WelcomeScreen,
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
} from '../../features/auth';

import { PetDetailScreen, HealthCardScreen } from '../../features/pets';

import { TabNavigator } from './TabNavigator';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
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
  const { isAuthenticated, isLoading } = useAuthSession();

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
              // El carnet dibuja su propio encabezado con el nombre de la mascota.
              headerShown: false,
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
            name="Register"
            component={RegisterScreen}
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
