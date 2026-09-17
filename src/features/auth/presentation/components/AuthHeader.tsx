// Responsabilidad: encabezado degradado con botón "Volver" del flujo de auth (capa PRESENTATION).

import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import { AuthGradient } from './AuthGradient';

interface AuthHeaderProps {
  onBack: () => void;
  height: number;
  // Recuperar acceso redondea el borde inferior del encabezado; en Iniciar
  // sesión es la tarjeta de contenido la que se superpone con sus esquinas.
  roundedBottom?: boolean;
}

export function AuthHeader({ onBack, height, roundedBottom = false }: AuthHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <AuthGradient
      wavesTop={insets.top}
      style={[
        styles.header,
        { height: height + insets.top, paddingTop: insets.top + 8 },
        roundedBottom && styles.roundedBottom,
      ]}
    >
      <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" style={styles.backButton}>
        <Ionicons name="chevron-back" size={18} color={colors.textLight} />
        <Text style={styles.backText}>Volver</Text>
      </Pressable>
    </AuthGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    overflow: 'hidden',
  },

  roundedBottom: {
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingVertical: 8,
  },

  backText: {
    color: colors.textLight,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
});
