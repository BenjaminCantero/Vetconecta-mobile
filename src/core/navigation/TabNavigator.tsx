import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

import { HomeScreen } from '../../features/home';
import { ActivePetSync, MyPetsScreen } from '../../features/pets';
import { AppointmentsScreen } from '../../features/appointments';
import {
  NotificationsProvider,
  NotificationsScreen,
  PushNotificationsBridge,
  useNotificationsSession,
} from '../../features/notifications';

import { useActivePet } from '../../shared/context/ActivePetContext';

export type TabParamList = {
  Inicio: undefined;
  MisMascotas: undefined;
  Citas: { citaId?: string } | undefined;
  Notificaciones: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<keyof TabParamList, { active: IconName; inactive: IconName }> = {
  Inicio: {
    active: 'home',
    inactive: 'home-outline',
  },
  MisMascotas: {
    active: 'paw',
    inactive: 'paw-outline',
  },
  Citas: {
    active: 'calendar',
    inactive: 'calendar-outline',
  },
  Notificaciones: {
    active: 'notifications',
    inactive: 'notifications-outline',
  },
};

function TabsContent() {
  const insets = useSafeAreaInsets();
  const { activePetId } = useActivePet();
  const { notifications } = useNotificationsSession();

  // Contar únicamente los avisos sin leer de la mascota activa.
  // Los avisos generales, sin mascota asociada, también se incluyen.
  const unreadCount = notifications.filter((item) => {
    if (item.read) {
      return false;
    }

    const petId = item.petId ?? (item.target?.screen === 'health' ? item.target.petId : null);

    return !petId || (activePetId !== null && petId === activePetId);
  }).length;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
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
          fontSize: 12,
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
        options={{
          title: 'Avisos',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
    </Tab.Navigator>
  );
}

export function TabNavigator() {
  return (
    <NotificationsProvider>
      <ActivePetSync />
      <TabsContent />
      <PushNotificationsBridge />
    </NotificationsProvider>
  );
}
