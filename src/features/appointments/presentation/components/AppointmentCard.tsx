// Responsabilidad: tarjeta de una cita.
// Capa PRESENTATION de appointments.
//
// Muestra fecha, estado, mascota, motivo, especialidad,
// veterinario y hora.
//
// Mantiene las acciones de reprogramación y cancelación.
// Permite mostrar y solicitar calificaciones post-consulta (H3).

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { DateLeaf } from '../../../../shared/components/DateLeaf';
import { dateLeafParts } from '../../../../shared/utils/formatDate';
import { useActivePet } from '../../../../shared/context/ActivePetContext';

import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';

import type { Appointment, AppointmentStatus } from '../../domain/Appointment';
import { canRateAppointment } from '../../data/appointmentsRepository';

const STATUS_STYLE: Record<
  AppointmentStatus,
  {
    color: string;
    tint: string;
    label: string;
  }
> = {
  reservada: {
    color: colors.statusPending,
    tint: colors.tintOrange,
    label: 'Reservada',
  },

  pendiente: {
    color: colors.statusPending,
    tint: colors.tintOrange,
    label: 'Por confirmar',
  },

  confirmada: {
    color: colors.statusConfirmed,
    tint: colors.tintGreen,
    label: 'Confirmada',
  },

  cancelada: {
    color: colors.statusCancelled,
    tint: colors.tintRed,
    label: 'Cancelada',
  },

  completada: {
    color: colors.statusDone,
    tint: colors.tintGray,
    label: 'Realizada',
  },

  realizada: {
    color: colors.statusDone,
    tint: colors.tintGray,
    label: 'Realizada',
  },
};

interface AppointmentCardProps {
  appointment: Appointment;
  // true cuando se llega a esta cita desde una notificación push.
  highlighted?: boolean;
  onReschedule?: () => void;
  onCancel?: () => void;

  // H3: abre el formulario de calificación.
  onRate?: () => void;
}

export function AppointmentCard({
  appointment,
  highlighted = false,
  onReschedule,
  onCancel,
  onRate,
}: AppointmentCardProps) {
  const { pets } = useActivePet();

  const { color, tint, label } = STATUS_STYLE[appointment.status];

  const { time } = dateLeafParts(appointment.date);

  const showActions = Boolean(onReschedule || onCancel);

  const muted = appointment.status === 'cancelada';

  // Busca la mascota de esta cita, no necesariamente
  // la mascota seleccionada actualmente.
  const appointmentPet = pets.find((pet) => pet.id === appointment.petId);

  const petName = appointmentPet?.name ?? 'Mascota';

  const specialty = appointment.specialty?.trim();

  const rating = appointment.calificacion;

  const showRatingInvitation = Boolean(onRate && canRateAppointment(appointment));

  return (
    <View style={[styles.card, highlighted && styles.cardHighlighted]}>
      <View style={styles.body}>
        <DateLeaf isoDate={appointment.date} accent={color} surface={tint} />

        <View style={styles.texts}>
          {/* Estado de la cita */}
          <View style={[styles.statusPill, { backgroundColor: tint }]}>
            <View style={[styles.statusDot, { backgroundColor: color }]} />

            <Text style={[styles.statusLabel, { color }]}>{label}</Text>
          </View>

          {/* Motivo de la consulta */}
          <Text style={[styles.reason, muted && styles.reasonMuted]}>{appointment.reason}</Text>

          {/* Mascota asociada */}
          <View style={styles.detailRow}>
            <Ionicons name="paw-outline" size={15} color={colors.appMuted} />

            <Text style={styles.detail}>{petName}</Text>
          </View>

          {/* Especialidad, cuando exista */}
          {specialty ? (
            <View style={styles.detailRow}>
              <Ionicons name="medkit-outline" size={15} color={colors.appMuted} />

              <Text style={styles.detail}>{specialty}</Text>
            </View>
          ) : null}

          {/* Veterinario */}
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={15} color={colors.appMuted} />

            <Text style={styles.detail}>{appointment.veterinarian}</Text>
          </View>

          {/* Hora de la cita */}
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={15} color={colors.appMuted} />

            <Text style={styles.detail}>{time} h</Text>
          </View>
        </View>
      </View>

      {/* H3: invitación para calificar una consulta realizada */}
      {showRatingInvitation && (
        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>¿Cómo fue la atención de {petName}?</Text>

          <Text style={styles.ratingDescription}>
            Comparte tu experiencia con la atención veterinaria.
          </Text>

          <Pressable
            onPress={onRate}
            accessibilityRole="button"
            accessibilityLabel={`Calificar atención de ${petName}`}
            style={styles.rateButton}
          >
            <Ionicons name="star-outline" size={18} color={colors.appHeading} />

            <Text style={styles.rateButtonLabel}>Calificar atención</Text>
          </Pressable>
        </View>
      )}

      {/* H3: calificación registrada de solo lectura */}
      {rating ? (
        <View style={styles.ratingSection}>
          <View style={styles.ratingHeader}>
            <Ionicons name="checkmark-circle" size={18} color={colors.statusConfirmed} />

            <Text style={styles.ratingTitle}>Tu calificación</Text>
          </View>

          <View
            style={styles.stars}
            accessible
            accessibilityLabel={`${rating.estrellas} de 5 estrellas`}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= rating.estrellas ? 'star' : 'star-outline'}
                size={23}
                color={star <= rating.estrellas ? '#B77900' : colors.appMuted}
              />
            ))}
          </View>

          {rating.comentario ? <Text style={styles.ratingComment}>{rating.comentario}</Text> : null}
        </View>
      ) : appointment.calificada ? (
        <View style={styles.ratingSection}>
          <View style={styles.ratingHeader}>
            <Ionicons name="checkmark-circle" size={18} color={colors.statusConfirmed} />

            <Text style={styles.ratingTitle}>Atención calificada</Text>
          </View>
        </View>
      ) : null}

      {/* Acciones disponibles */}
      {showActions && (
        <View style={styles.actions}>
          {onReschedule && (
            <Pressable
              onPress={onReschedule}
              accessibilityRole="button"
              accessibilityLabel={`Reprogramar cita de ${petName}`}
              android_ripple={{
                color: colors.tintPurple,
              }}
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
              accessibilityLabel={`Cancelar cita de ${petName}`}
              android_ripple={{
                color: colors.tintRed,
              }}
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

  cardHighlighted: {
    borderWidth: 2,
    borderColor: colors.appHeading,
  },

  body: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 14,
  },

  texts: {
    flex: 1,
    gap: 5,
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
    marginBottom: 5,
  },

  reasonMuted: {
    color: colors.appMuted,
    textDecorationLine: 'line-through',
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 20,
  },

  detail: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.appMuted,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
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

  ratingSection: {
    padding: 14,
    gap: 9,
    borderTopWidth: 1,
    borderTopColor: colors.appDivider,
  },

  ratingTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.appTitle,
  },

  ratingDescription: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.appMuted,
  },

  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tintPurple,
    borderRadius: 12,
    minHeight: 44,
    gap: 8,
  },

  rateButtonLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.appHeading,
  },

  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  ratingComment: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.appMuted,
  },
});
