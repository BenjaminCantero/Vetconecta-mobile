// Responsabilidad: tarjeta de acción con ícono, título y detalle (capa SHARED).
//
// Tres tonos:
//  - solid: fondo con el color de la maqueta.
//  - soft:  fondo teñido con el color y el ícono en sólido (panel de Mis
//           Mascotas): conserva el color de cada sección sin saturar.
//  - quiet: superficie blanca con el color solo en el ícono, para accesos que
//           no deben competir con el elemento principal de la pantalla.
// `value` muestra un dato grande (ej. cantidad de vacunas) sobre el título.
// La acción se anuncia como hint de accesibilidad; visualmente la tarjeta
// entera es el botón y el chevron indica que navega.

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
  // Qué pasa al tocar, para lectores de pantalla (ej. "Abre el carnet").
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

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={actionLabel}
      android_ripple={{ color: solid ? 'rgba(255,255,255,0.18)' : `${color}33` }}
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

// El texto sobre fondos claros va en tinta: los colores de la maqueta no
// alcanzan contraste suficiente para texto chico sobre su propio tinte.
const TONES: Record<NonNullable<ActionCardProps['tone']>, (color: string) => TonePalette> = {
  solid: (color) => ({
    background: color,
    iconBackground: 'rgba(255,255,255,0.24)',
    icon: colors.textLight,
    primary: colors.textLight,
    secondary: 'rgba(255,255,255,0.9)',
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
