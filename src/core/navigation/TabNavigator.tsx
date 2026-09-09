// Responsabilidad: tabs inferiores de la app autenticada (capa CORE).
// Agrupa la pantalla principal de cada feature. Las pantallas de detalle
// (PetDetail, HealthCard) se navegan como push sobre el stack raíz.

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { colors } from '../theme/colors';
import MyPetsScreen from '../../features/pets/presentation/screens/MyPetsScreen';
import AppointmentsScreen from '../../features/appointments/presentation/screens/AppointmentsScreen';
import NotificationsScreen from '../../features/notifications/presentation/screens/NotificationsScreen';

export type TabParamList = {
  MisMascotas: undefined;
  Citas: undefined;
  Notificaciones: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen name="MisMascotas" component={MyPetsScreen} options={{ title: 'Mis mascotas' }} />
      <Tab.Screen name="Citas" component={AppointmentsScreen} options={{ title: 'Citas' }} />
      <Tab.Screen name="Notificaciones" component={NotificationsScreen} options={{ title: 'Notificaciones' }} />
    </Tab.Navigator>
  );
}
