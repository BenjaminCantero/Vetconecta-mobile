// Responsabilidad: encabezado degradado con botón "Volver" del flujo de auth (capa PRESENTATION).

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import { AppLogo } from './AppLogo';
import { AuthGradient } from './AuthGradient';

interface AuthHeaderProps {
  onBack: () => void;
  height: number;
  // Recuperar acceso redondea el borde inferior del encabezado; en Iniciar
  // sesión es la tarjeta de contenido la que se superpone con sus esquinas.
  roundedBottom?: boolean;
  // Muestra el logo y el nombre de la app en el degradado.
  showBrand?: boolean;
}

export function AuthHeader({
  onBack,
  height,
  roundedBottom = false,
  showBrand = false,
}: AuthHeaderProps) {
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

      {showBrand && (
        <View style={styles.brand}>
          <View style={styles.logoDisc}>
            <AppLogo size={46} />
          </View>
          <Text style={styles.brandName}>VetConecta</Text>
        </View>
      )}
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

  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
  },

  logoDisc: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.appSurface,
  },

  brandName: {
    fontFamily: fonts.extrabold,
    fontSize: 24,
    color: colors.textLight,
  },

  backText: {
    color: colors.textLight,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
});
