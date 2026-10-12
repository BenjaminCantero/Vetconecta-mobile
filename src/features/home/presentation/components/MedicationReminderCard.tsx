// Responsabilidad: tarjeta de recordatorio de medicamentos (feature home).
// Dibuja los datos de ejemplo de `home/data`; no hay dominio de tratamientos.
// Superficie blanca con el verde de la maqueta como acento: es información de
// seguimiento, no una alerta, así que no compite con la próxima cita.

import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import type { MedicationReminder } from '../../data/medicationRemindersMock';

interface MedicationReminderCardProps {
  reminder: MedicationReminder;
}

export function MedicationReminderCard({ reminder }: MedicationReminderCardProps) {
  const progress = Math.min(
    100,
    Math.round((reminder.dosesTaken / Math.max(1, reminder.dosesTotal)) * 100),
  );

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.icon}>
          <Ionicons name="medical" size={18} color={colors.cardGreen} />
        </View>

        <View style={styles.texts}>
          <Text style={styles.medication}>{reminder.medication}</Text>
          <Text style={styles.detail}>
            {reminder.petName}, {reminder.dose}
          </Text>
        </View>

        {reminder.taken ? (
          <View style={styles.takenPill}>
            <Ionicons name="checkmark" size={13} color={colors.cardGreen} />
            <Text style={styles.takenLabel}>Tomada</Text>
          </View>
        ) : (
          <Text style={styles.time}>{reminder.timeLabel}</Text>
        )}
      </View>

      <View
        style={styles.progressTrack}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: reminder.dosesTotal, now: reminder.dosesTaken }}
      >
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Dosis {reminder.dosesTaken} de {reminder.dosesTotal}
        </Text>
        <Text style={styles.footerText}>{reminder.dayLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: colors.appSurface,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tintGreen,
  },

  texts: {
    flex: 1,
  },

  medication: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.appTitle,
  },

  detail: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.appMuted,
  },

  time: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.appTitle,
  },

  takenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.tintGreen,
  },

  takenLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.cardGreen,
  },

  progressTrack: {
    height: 6,
    marginTop: 14,
    borderRadius: 999,
    backgroundColor: colors.tintGreen,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.cardGreen,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  footerText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.appMuted,
  },
});
