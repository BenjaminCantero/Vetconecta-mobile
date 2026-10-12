// Responsabilidad: tarjeta de un evento del carnet (capa PRESENTATION de pets).
// La fecha va como hoja de calendario teñida con el color del tipo de evento,
// igual que las citas, para que el carnet se lea como un historial de fechas.

import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { DateLeaf } from '../../../../shared/components/DateLeaf';
import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import type { ClinicalEvent, ClinicalEventType } from '../../domain/ClinicalEvent';

type IconName = keyof typeof Ionicons.glyphMap;

export const CLINICAL_EVENT_STYLE: Record<
  ClinicalEventType,
  { icon: IconName; color: string; label: string }
> = {
  vacuna: { icon: 'shield-checkmark', color: colors.cardPurple, label: 'Vacuna' },
  control: { icon: 'pulse', color: colors.cardBlue, label: 'Control' },
  tratamiento: { icon: 'bandage', color: colors.cardOrange, label: 'Tratamiento' },
  cirugia: { icon: 'cut', color: colors.cardRed, label: 'Cirugía' },
};

interface ClinicalEventCardProps {
  event: ClinicalEvent;
  // Los eventos futuros se marcan como programados; los pasados no llevan
  // etiqueta, porque cumplido es el caso normal del carnet.
  isUpcoming: boolean;
}

export function ClinicalEventCard({ event, isUpcoming }: ClinicalEventCardProps) {
  const { icon, color, label } = CLINICAL_EVENT_STYLE[event.type];

  return (
    <View style={styles.card}>
      <DateLeaf isoDate={event.date} accent={color} surface={`${color}1A`} />

      <View style={styles.info}>
        <View style={styles.typeRow}>
          <Ionicons name={icon} size={14} color={color} />
          <Text style={[styles.type, { color }]}>{label}</Text>

          {isUpcoming && (
            <View style={styles.upcoming}>
              <Text style={styles.upcomingLabel}>Programada</Text>
            </View>
          )}
        </View>

        <Text style={styles.title} numberOfLines={3}>
          {event.description}
        </Text>

        <Text style={styles.meta} numberOfLines={1}>
          {event.veterinarian}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 14,
    borderRadius: 20,
    backgroundColor: colors.appSurface,
  },

  info: {
    flex: 1,
    gap: 3,
  },

  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },

  type: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },

  upcoming: {
    marginLeft: 'auto',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.tintPurple,
  },

  upcomingLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.appHeading,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.appTitle,
  },

  meta: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.appMuted,
  },
});
