// Responsabilidad: tarjeta destacada de la próxima cita (feature home).

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';

interface HeroAppointmentCardProps {
  message: string;
  detail?: string;
  actionLabel: string;
  onPress: () => void;
}

export function HeroAppointmentCard({
  message,
  detail,
  actionLabel,
  onPress,
}: HeroAppointmentCardProps) {
  return (
    <LinearGradient
      colors={[colors.cardPinkStart, colors.cardPinkEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.texts}>
        <Text style={styles.message}>{message}</Text>
        {detail && <Text style={styles.detail}>{detail}</Text>}

        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          android_ripple={{ color: 'rgba(238,135,174,0.2)' }}
          style={styles.button}
        >
          <Text style={styles.buttonLabel}>{actionLabel}</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.cardPinkEnd} />
        </Pressable>
      </View>

      <View style={styles.decoration}>
        <Ionicons name="paw" size={64} color="rgba(255,255,255,0.45)" />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#B04A76',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  texts: {
    flex: 1,
  },

  message: {
    fontFamily: fonts.extrabold,
    fontSize: 19,
    lineHeight: 25,
    color: colors.textLight,
  },

  detail: {
    marginTop: 6,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.92)',
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.appSurface,
  },

  buttonLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.cardPinkEnd,
  },

  decoration: {
    marginLeft: 8,
  },
});
