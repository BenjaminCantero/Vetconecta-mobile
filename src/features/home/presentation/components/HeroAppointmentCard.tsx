// Responsabilidad: tarjeta destacada de la próxima cita (feature home).
// Es el elemento principal del inicio: la fecha se dibuja como hoja de
// calendario para que se lea de un vistazo cuándo es la cita.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { DateLeaf } from '../../../../shared/components/DateLeaf';
import { dateLeafParts, formatDaysUntil } from '../../../../shared/utils/formatDate';
import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';

interface HeroAppointmentCardProps {
  date: string; // ISO 8601
  petName: string;
  reason: string;
  veterinarian: string;
  onPress: () => void;
}

export function HeroAppointmentCard({
  date,
  petName,
  reason,
  veterinarian,
  onPress,
}: HeroAppointmentCardProps) {
  const { time } = dateLeafParts(date);

  return (
    <LinearGradient
      colors={[colors.cardPinkStart, colors.cardPinkEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* Marca de agua: queda recortada por el borde de la tarjeta. */}
      <Ionicons
        name="paw"
        size={150}
        color="rgba(255,255,255,0.18)"
        style={styles.watermark}
        importantForAccessibility="no"
      />

      <Text style={styles.eyebrow}>Próxima cita de {petName}</Text>

      <View style={styles.body}>
        <DateLeaf isoDate={date} accent={colors.cardPinkEnd} size="large" />

        <View style={styles.texts}>
          <Text style={styles.reason} numberOfLines={2}>
            {reason}
          </Text>
          <Text style={styles.detail} numberOfLines={1}>
            {veterinarian}
          </Text>

          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={15} color={colors.textLight} />
            <Text style={styles.time}>
              {time} h, {formatDaysUntil(date)}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        android_ripple={{ color: 'rgba(238,135,174,0.2)' }}
        style={styles.button}
      >
        <Text style={styles.buttonLabel}>Ver cita</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#B04A76',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  watermark: {
    position: 'absolute',
    right: -28,
    bottom: -34,
    transform: [{ rotate: '-18deg' }],
  },

  eyebrow: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: 'rgba(255,255,255,0.92)',
  },

  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 14,
  },

  texts: {
    flex: 1,
    gap: 2,
  },

  reason: {
    fontFamily: fonts.extrabold,
    fontSize: 21,
    lineHeight: 26,
    color: colors.textLight,
  },

  detail: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.92)',
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },

  time: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.textLight,
  },

  button: {
    alignSelf: 'flex-start',
    marginTop: 18,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 22,
    borderRadius: 999,
    backgroundColor: colors.appSurface,
  },

  buttonLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.cardPinkEnd,
  },
});
