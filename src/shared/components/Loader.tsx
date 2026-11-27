// Responsabilidad: indicador de carga genérico reutilizable
// (capa SHARED / presentation).

import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';

import { colors } from '../../core/theme/colors';
import { fonts } from '../../core/theme/typography';

interface LoaderProps {
  message?: string;
}

export function Loader({ message = 'Cargando información...' }: LoaderProps) {
  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={message}
      accessibilityState={{ busy: true }}
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator size="large" color={colors.primary} />

      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  message: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.appMuted,
    textAlign: 'center',
  },
});
