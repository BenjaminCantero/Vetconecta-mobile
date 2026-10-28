// Responsabilidad: stack raíz de navegación.
// Decide entre autenticación y aplicación según la sesión activa.

import { useState } from 'react';
import type { NavigatorScreenParams } from '@react-navigation/native';
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
import { BookAppointmentScreen } from '../../features/appointments';
import { ProfileScreen } from '../../features/profile';

import { TabNavigator } from './TabNavigator';
import type { TabParamList } from './TabNavigator';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;

  AppTabs: NavigatorScreenParams<TabParamList> | undefined;

  PetDetail: {
    petId: string;
  };

  HealthCard: {
    petId: string;
  };

  BookAppointment: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuthSession();

  // Tras cerrar sesión se vuelve al login.
  const [hasSignedIn, setHasSignedIn] = useState(false);

  if (isAuthenticated && !hasSignedIn) {
    setHasSignedIn(true);
  }

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator
      key={isAuthenticated ? 'app' : 'auth'}
      initialRouteName={isAuthenticated ? 'AppTabs' : hasSignedIn ? 'Login' : 'Welcome'}
      screenOptions={{
        headerTintColor: colors.primary,
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="AppTabs" component={TabNavigator} options={{ headerShown: false }} />

          <Stack.Screen
            name="PetDetail"
            component={PetDetailScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="HealthCard"
            component={HealthCardScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="BookAppointment"
            component={BookAppointmentScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />

          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />

          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
