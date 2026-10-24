import './global.css';

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';

import { StatusBar } from 'expo-status-bar';

import { NavigationContainer } from '@react-navigation/native';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/core/navigation/RootNavigator';

import { ActivePetProvider } from './src/shared/context/ActivePetContext';

import { AuthProvider } from './src/features/auth';

import { configureForegroundPresentation } from './src/core/notifications/pushClient';

// Notificaciones push recibidas con la app abierta: se muestran como banner.
// Va fuera del componente para que quede configurado antes de que llegue cualquier aviso.
configureForegroundPresentation();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  // Si la fuente falla, se sigue adelante con
  // la fuente del sistema en lugar de bloquear la app.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ActivePetProvider>
          <NavigationContainer>
            <RootNavigator />

            <StatusBar style="auto" />
          </NavigationContainer>
        </ActivePetProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
