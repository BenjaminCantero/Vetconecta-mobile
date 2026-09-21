// Responsabilidad: tarjeta de urgencias veterinarias (capa SHARED).
// Abre el marcador del teléfono con el número configurado. Vive en shared
// porque la usan home y appointments, que no pueden importarse entre sí.

import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ENV } from '../../core/config/env';
import { colors } from '../../core/theme/colors';
import { fonts } from '../../core/theme/typography';

interface EmergencyCardProps {
  // compact: una sola fila con el botón al costado, para listas.
  variant?: 'full' | 'compact';
}

export function EmergencyCard({ variant = 'full' }: EmergencyCardProps) {
  const handleCall = async () => {
    const url = `tel:${ENV.EMERGENCY_PHONE}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('No se pudo llamar', `Marca directamente el ${ENV.EMERGENCY_PHONE}.`);
    }
  };

  const compact = variant === 'compact';

  const callButton = (
    <Pressable
      onPress={handleCall}
      accessibilityRole="button"
      android_ripple={{ color: 'rgba(205,58,42,0.2)' }}
      style={[styles.button, compact && styles.buttonCompact]}
    >
      <Ionicons name="call" size={15} color={colors.cardRed} />
      <Text style={styles.buttonLabel}>{compact ? 'Llamar' : 'Llamar Ahora'}</Text>
    </Pressable>
  );

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.texts}>
        <Text style={[styles.title, compact && styles.titleCompact]}>
          {compact ? 'Urgencias 24/7' : 'Emergencia Médica'}
        </Text>
        <Text style={styles.subtitle}>
          {compact ? 'Llamada directa con la clínica' : 'Atención veterinaria inmediata, 24/7'}
        </Text>

        {!compact && callButton}
      </View>

      {compact ? (
        callButton
      ) : (
        <View style={styles.iconCircle}>
          <Ionicons name="medkit" size={26} color={colors.textLight} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 20,
    backgroundColor: colors.cardRed,
    shadowColor: '#7E2118',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  cardCompact: {
    padding: 16,
    gap: 12,
  },

  texts: {
    flex: 1,
  },

  title: {
    fontFamily: fonts.extrabold,
    fontSize: 18,
    color: colors.textLight,
  },

  titleCompact: {
    fontSize: 16,
  },

  subtitle: {
    marginTop: 4,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: colors.appSurface,
  },

  buttonCompact: {
    marginTop: 0,
    alignSelf: 'center',
  },

  buttonLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.cardRed,
  },

  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
