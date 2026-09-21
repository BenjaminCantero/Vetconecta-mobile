// Responsabilidad: tabs inferiores de la app autenticada (capa CORE).
// Agrupa la pantalla principal de cada feature. Las pantallas de detalle
// (PetDetail, HealthCard) se navegan como push sobre el stack raíz.
//
// Cada pantalla dibuja su propio encabezado, así que la barra superior de
// navegación queda oculta.

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { HomeScreen } from '../../features/home';
import { MyPetsScreen } from '../../features/pets';
import { AppointmentsScreen } from '../../features/appointments';
import { NotificationsScreen } from '../../features/notifications';

export type TabParamList = {
  Inicio: undefined;
  MisMascotas: undefined;
  Citas: undefined;
  Notificaciones: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

type IconName = keyof typeof Ionicons.glyphMap;

// Relleno cuando la pestaña está activa, contorno cuando no lo está.
const TAB_ICONS: Record<keyof TabParamList, { active: IconName; inactive: IconName }> = {
  Inicio: { active: 'home', inactive: 'home-outline' },
  MisMascotas: { active: 'paw', inactive: 'paw-outline' },
  Citas: { active: 'calendar', inactive: 'calendar-outline' },
  Notificaciones: { active: 'notifications', inactive: 'notifications-outline' },
};

export function TabNavigator() {
  // En Android con barra de gestos, el sistema dibuja sus botones sobre la
  // parte baja de la pantalla: la barra de tabs crece esa altura para no
  // quedar tapada por ellos.
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.appHeading,
        tabBarInactiveTintColor: colors.appMuted,
        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom + 10,
          borderTopWidth: 1,
          borderTopColor: colors.appDivider,
          backgroundColor: colors.appSurface,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.semibold,
          fontSize: 11,
        },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? TAB_ICONS[route.name].active : TAB_ICONS[route.name].inactive}
            size={size ?? 22}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="MisMascotas" component={MyPetsScreen} options={{ title: 'Mascotas' }} />
      <Tab.Screen name="Citas" component={AppointmentsScreen} options={{ title: 'Citas' }} />
      <Tab.Screen
        name="Notificaciones"
        component={NotificationsScreen}
        options={{ title: 'Avisos' }}
      />
    </Tab.Navigator>
  );
}
