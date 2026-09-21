// Responsabilidad: tarjeta de acción de color con título, detalle y enlace (capa SHARED).

// Nota: el estilo de Pressable se pasa como arreglo, nunca como función. Con
// el jsxImportSource de NativeWind, un `style` en forma de función se pierde y
// el componente queda sin fondo. El realce al tocar usa android_ripple.

import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../core/theme/colors';
import { fonts } from '../../core/theme/typography';

interface ActionCardProps {
  title: string;
  subtitle: string;
  actionLabel: string;
  color: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ActionCard({
  title,
  subtitle,
  actionLabel,
  color,
  icon,
  onPress,
  style,
}: ActionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      android_ripple={{ color: 'rgba(255,255,255,0.18)' }}
      style={[styles.card, { backgroundColor: color }, style]}
    >
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={18} color={colors.textLight} />
      </View>

      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.action}>
        <Text style={styles.actionLabel}>{actionLabel}</Text>
        <Ionicons name="arrow-forward" size={14} color={colors.textLight} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 168,
    borderRadius: 22,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#3B1E57',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  texts: {
    marginTop: 12,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 17,
    lineHeight: 22,
    color: colors.textLight,
  },

  subtitle: {
    marginTop: 4,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.88)',
  },

  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },

  actionLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textLight,
  },
});
