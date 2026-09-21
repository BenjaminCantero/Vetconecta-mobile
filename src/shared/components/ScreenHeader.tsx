// Responsabilidad: encabezado de pantalla con título y campana (capa SHARED).

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../core/theme/colors';
import { fonts } from '../../core/theme/typography';

interface ScreenHeaderProps {
  title: string;
  eyebrow?: string;
  onBellPress?: () => void;
  hasUnread?: boolean;
}

export function ScreenHeader({
  title,
  eyebrow,
  onBellPress,
  hasUnread = false,
}: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titles}>
        {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
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
    color: colors.appHeading,
  },

  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.appSurface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4B2A6B',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
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
