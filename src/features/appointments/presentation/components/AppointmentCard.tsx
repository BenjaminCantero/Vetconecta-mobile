// Responsabilidad: tarjeta de una cita (capa PRESENTATION de appointments).
// El color de fondo comunica el estado, como en el maqueteado.

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import type { Appointment, AppointmentStatus } from '../../domain/Appointment';

const STATUS_STYLE: Record<AppointmentStatus, { color: string; label: string }> = {
  confirmada: { color: colors.statusConfirmed, label: 'Confirmada' },
  pendiente: { color: colors.statusPending, label: 'Por confirmar' },
  cancelada: { color: colors.statusCancelled, label: 'Cancelada' },
  completada: { color: colors.statusDone, label: 'Completada' },
};

function formatHeadline(isoDate: string) {
  const date = new Date(isoDate);

  const day = date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }).replace('.', '');

  const time = date.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return `${day} · ${time}`;
}

interface AppointmentCardProps {
  appointment: Appointment;
  onReschedule?: () => void;
  onCancel?: () => void;
}

export function AppointmentCard({ appointment, onReschedule, onCancel }: AppointmentCardProps) {
  const { color, label } = STATUS_STYLE[appointment.status];
  const showActions = Boolean(onReschedule || onCancel);

  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      <View style={styles.topRow}>
        <Text style={styles.headline}>{formatHeadline(appointment.date)}</Text>

        <View style={styles.statusPill}>
          <Text style={[styles.statusLabel, { color }]}>{label}</Text>
        </View>
      </View>

      <Text style={styles.detail} numberOfLines={2}>
        {appointment.reason} · {appointment.veterinarian}
      </Text>

      {showActions && (
        <View style={styles.actions}>
          <Pressable
            onPress={onReschedule}
            accessibilityRole="button"
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
            style={styles.actionButton}
          >
            <Text style={styles.actionLabel}>Reprogramar</Text>
          </Pressable>

          <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
            style={styles.actionButton}
          >
            <Text style={styles.actionLabel}>Cancelar</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 18,
    gap: 10,
    shadowColor: '#3B1E57',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  headline: {
    flexShrink: 1,
    fontFamily: fonts.extrabold,
    fontSize: 19,
    color: colors.textLight,
  },

  statusPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.appSurface,
  },

  statusLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },

  detail: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.94)',
  },

  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },

  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },

  actionLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textLight,
  },
});
