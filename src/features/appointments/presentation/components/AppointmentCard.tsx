// Responsabilidad: tarjeta de una cita (capa PRESENTATION de appointments).
// La fecha va como hoja de calendario teñida con el color del estado, para
// que la lista se recorra por día y por estado sin leer cada tarjeta.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { DateLeaf } from '../../../../shared/components/DateLeaf';
import { dateLeafParts } from '../../../../shared/utils/formatDate';
import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import type { Appointment, AppointmentStatus } from '../../domain/Appointment';

const STATUS_STYLE: Record<AppointmentStatus, { color: string; tint: string; label: string }> = {
  reservada: { color: colors.statusPending, tint: colors.tintOrange, label: 'Reservada' },
  pendiente: { color: colors.statusPending, tint: colors.tintOrange, label: 'Por confirmar' },
  confirmada: { color: colors.statusConfirmed, tint: colors.tintGreen, label: 'Confirmada' },
  cancelada: { color: colors.statusCancelled, tint: colors.tintRed, label: 'Cancelada' },
  completada: { color: colors.statusDone, tint: colors.tintGray, label: 'Realizada' },
};

interface AppointmentCardProps {
  appointment: Appointment;
  onReschedule?: () => void;
  onCancel?: () => void;
}

export function AppointmentCard({ appointment, onReschedule, onCancel }: AppointmentCardProps) {
  const { color, tint, label } = STATUS_STYLE[appointment.status];
  const { time } = dateLeafParts(appointment.date);
  const showActions = Boolean(onReschedule || onCancel);
  const muted = appointment.status === 'cancelada';

  return (
    <View style={styles.card}>
      <View style={styles.body}>
        <DateLeaf isoDate={appointment.date} accent={color} surface={tint} />

        <View style={styles.texts}>
          <View style={[styles.statusPill, { backgroundColor: tint }]}>
            <View style={[styles.statusDot, { backgroundColor: color }]} />
            <Text style={[styles.statusLabel, { color }]}>{label}</Text>
          </View>

          <Text style={[styles.reason, muted && styles.reasonMuted]} numberOfLines={2}>
            {appointment.reason}
          </Text>
          <Text style={styles.detail} numberOfLines={1}>
            {appointment.veterinarian}
          </Text>

          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={14} color={colors.appMuted} />
            <Text style={styles.detail}>{time} h</Text>
          </View>
        </View>
      </View>

      {showActions && (
        <View style={styles.actions}>
          {onReschedule && (
            <Pressable
              onPress={onReschedule}
              accessibilityRole="button"
              android_ripple={{ color: colors.tintPurple }}
              style={styles.actionButton}
            >
              <Text style={[styles.actionLabel, { color: colors.appHeading }]}>Reprogramar</Text>
            </Pressable>
          )}

          {onReschedule && onCancel && <View style={styles.actionDivider} />}

          {onCancel && (
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              android_ripple={{ color: colors.tintRed }}
              style={styles.actionButton}
            >
              <Text style={[styles.actionLabel, { color: colors.statusCancelled }]}>Cancelar</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    backgroundColor: colors.appSurface,
    overflow: 'hidden',
  },

  body: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 14,
  },

  texts: {
    flex: 1,
    gap: 2,
  },

  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  statusLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },

  reason: {
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 21,
    color: colors.appTitle,
  },

  reasonMuted: {
    color: colors.appMuted,
    textDecorationLine: 'line-through',
  },

  detail: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.appMuted,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.appDivider,
  },

  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },

  actionDivider: {
    width: 1,
    height: 22,
    backgroundColor: colors.appDivider,
  },

  actionLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
});
