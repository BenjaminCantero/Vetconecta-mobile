// Responsabilidad: acceso a urgencias veterinarias (capa SHARED).
// Abre el marcador del teléfono con el número configurado. Vive en shared
// porque la usan home y appointments, que no pueden importarse entre sí.
// Una sola fila: tiene que estar siempre a mano, pero sin ocupar la pantalla
// cuando no hay una urgencia.

import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ENV } from '../../core/config/env';
import { colors } from '../../core/theme/colors';
import { fonts } from '../../core/theme/typography';

export function EmergencyCard() {
  const handleCall = async () => {
    const url = `tel:${ENV.EMERGENCY_PHONE}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('No se pudo llamar', `Marca directamente el ${ENV.EMERGENCY_PHONE}.`);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Ionicons name="medkit" size={20} color={colors.textLight} />
      </View>

      <View style={styles.texts}>
        <Text style={styles.title}>¿Es una urgencia?</Text>
        <Text style={styles.subtitle}>La clínica atiende las 24 horas</Text>
      </View>

      <Pressable
        onPress={handleCall}
        accessibilityRole="button"
        accessibilityLabel="Llamar a urgencias de la clínica"
        android_ripple={{ color: 'rgba(205,58,42,0.2)' }}
        style={styles.button}
      >
        <Ionicons name="call" size={15} color={colors.cardRed} />
        <Text style={styles.buttonLabel}>Llamar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 22,
    padding: 14,
    backgroundColor: colors.cardRed,
  },

  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  texts: {
    flex: 1,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.textLight,
  },

  subtitle: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.appSurface,
  },

  buttonLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.cardRed,
  },
});
