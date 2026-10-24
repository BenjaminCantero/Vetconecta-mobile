// Responsabilidad: encabezado de pantalla con título y campana (capa SHARED).
// Admite una acción extra a la izquierda de la campana (ej. cerrar sesión).

import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../core/theme/colors';
import { fonts } from '../../core/theme/typography';

interface ScreenHeaderProps {
  title: string;
  eyebrow?: string;
  onBellPress?: () => void;
  hasUnread?: boolean;
  extraAction?: {
    icon: ComponentProps<typeof Ionicons>['name'];
    label: string;
    onPress: () => void;
  };
}

export function ScreenHeader({
  title,
  eyebrow,
  onBellPress,
  hasUnread = false,
  extraAction,
}: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titles}>
        <Text style={styles.title}>{eyebrow ? `${eyebrow} ${title}` : title}</Text>
      </View>

      {extraAction && (
        <Pressable
          onPress={extraAction.onPress}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={extraAction.label}
          android_ripple={{ color: colors.appDivider, borderless: true }}
          style={styles.bell}
        >
          <Ionicons name={extraAction.icon} size={20} color={colors.appHeading} />
        </Pressable>
      )}

      {onBellPress && (
        <Pressable
          onPress={onBellPress}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Notificaciones"
          android_ripple={{ color: colors.appDivider, borderless: true }}
          style={styles.bell}
        >
          <Ionicons name="notifications-outline" size={20} color={colors.appHeading} />
          {hasUnread && <View style={styles.dot} />}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  titles: {
    flex: 1,
  },

  eyebrow: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.appMuted,
    marginBottom: 2,
  },

  title: {
    fontFamily: fonts.extrabold,
    fontSize: 26,
    color: colors.appTitle,
    lineHeight: 34,
  },

  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.appSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.appDivider,
  },

  dot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.appSurface,
  },
});
