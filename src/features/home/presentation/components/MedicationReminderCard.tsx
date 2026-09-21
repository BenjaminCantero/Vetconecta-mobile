// Responsabilidad: tarjeta de recordatorio de medicamentos (feature home).
// Dibuja los datos de ejemplo de `home/data`; no hay dominio de tratamientos.

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
    Math.round((reminder.dosesTaken / Math.max(1, reminder.dosesTotal)) * 100)
  );

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.timePill}>
          <Text style={styles.timeLabel}>{reminder.timeLabel}</Text>
        </View>

        {reminder.taken && (
          <View style={styles.takenPill}>
            <Ionicons name="checkmark" size={13} color={colors.cardGreen} />
            <Text style={styles.takenLabel}>Tomada</Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>Recordatorio de Medicamentos</Text>
      <Text style={styles.medication}>{reminder.medication}</Text>
      <Text style={styles.detail}>
        {reminder.petName} · {reminder.dose} · {reminder.dayLabel}
      </Text>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <Text style={styles.progressLabel}>
        Dosis {reminder.dosesTaken} de {reminder.dosesTotal} · {progress}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: colors.cardGreen,
    shadowColor: '#1B6B43',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  timePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.appSurface,
  },

  timeLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.appTitle,
  },

  takenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.appSurface,
  },

  takenLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.cardGreen,
  },

  title: {
    fontFamily: fonts.extrabold,
    fontSize: 18,
    color: colors.textLight,
  },

  medication: {
    marginTop: 6,
    fontFamily: fonts.bold,
    fontSize: 14,
    letterSpacing: 0.4,
    color: colors.textLight,
    textTransform: 'uppercase',
  },

  detail: {
    marginTop: 4,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },

  progressTrack: {
    height: 8,
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.28)',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.appSurface,
  },

  progressLabel: {
    marginTop: 8,
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.92)',
  },
});
