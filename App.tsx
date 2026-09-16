import './global.css';

import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/core/navigation/RootNavigator';
import { ActivePetProvider } from './src/shared/context/ActivePetContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <ActivePetProvider>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </ActivePetProvider>
    </SafeAreaProvider>
  );
}