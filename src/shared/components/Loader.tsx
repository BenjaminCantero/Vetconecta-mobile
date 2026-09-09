// Responsabilidad: indicador de carga genérico reutilizable (capa SHARED / presentation).

import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { colors } from '../../core/theme/colors';

export function Loader() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
