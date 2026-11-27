// Responsabilidad: tarjeta de acción con ícono, título y detalle (capa SHARED).
//
// Tres tonos:
// - solid: fondo con el color de la maqueta.
// - soft: fondo teñido con el color e ícono en sólido.
// - quiet: superficie blanca con el color en el ícono.
//
// La tarjeta completa funciona como botón.
// El realce al tocar utiliza android_ripple.

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
  tone?: 'solid' | 'soft' | 'quiet';
  value?: string;
  style?: StyleProp<ViewStyle>;
}

export function ActionCard({
  title,
  subtitle,
  actionLabel,
  color,
  icon,
  onPress,
  tone = 'solid',
  value,
  style,
}: ActionCardProps) {
  const solid = tone === 'solid';
  const palette = TONES[tone](color);

  const accessibleLabel = [title, value, subtitle].filter(Boolean).join('. ');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibleLabel}
      accessibilityHint={actionLabel}
      android_ripple={{
        color: solid ? 'rgba(255,255,255,0.18)' : `${color}33`,
      }}
      style={[
        styles.card,
        { backgroundColor: palette.background },
        solid && styles.cardSolid,
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconCircle, { backgroundColor: palette.iconBackground }]}>
          <Ionicons name={icon} size={19} color={palette.icon} />
        </View>

        <Ionicons name="chevron-forward" size={18} color={palette.secondary} />
      </View>

      <View>
        {value !== undefined && (
          <Text style={[styles.value, { color: palette.primary }]}>{value}</Text>
        )}

        <Text style={[styles.title, { color: palette.primary }]}>{title}</Text>

        <Text style={[styles.subtitle, { color: palette.secondary }]}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

interface TonePalette {
  background: string;
  iconBackground: string;
  icon: string;
  primary: string;
  secondary: string;
}

const TONES: Record<NonNullable<ActionCardProps['tone']>, (color: string) => TonePalette> = {
  solid: (color) => ({
    background: color,
    iconBackground: 'rgba(255,255,255,0.24)',
    icon: colors.textLight,
    primary: colors.textLight,
    secondary: colors.textLight,
  }),

  soft: (color) => ({
    background: `${color}24`,
    iconBackground: color,
    icon: colors.textLight,
    primary: colors.appTitle,
    secondary: colors.appMuted,
  }),

  quiet: (color) => ({
    background: colors.appSurface,
    iconBackground: `${color}1F`,
    icon: color,
    primary: colors.appTitle,
    secondary: colors.appMuted,
  }),
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 48,
    minHeight: 128,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.appDivider,
    padding: 16,
    gap: 14,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

  cardSolid: {
    shadowColor: '#3B1E57',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },

  value: {
    marginBottom: 2,
    fontFamily: fonts.extrabold,
    fontSize: 30,
    lineHeight: 36,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 20,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19,
  },
});
