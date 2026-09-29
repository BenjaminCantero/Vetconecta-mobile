// Responsabilidad: tarjeta de un evento del carnet (capa PRESENTATION de pets).

import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Chip } from '../../../../shared/components/Chip';
import { formatDate } from '../../../../shared/utils/formatDate';
import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import type { ClinicalEvent, ClinicalEventType } from '../../domain/ClinicalEvent';

type IconName = keyof typeof Ionicons.glyphMap;

export const CLINICAL_EVENT_STYLE: Record<ClinicalEventType, { icon: IconName; color: string }> = {
  vacuna: { icon: 'medical-outline', color: colors.cardPurple },
  control: { icon: 'pulse-outline', color: colors.cardBlue },
  tratamiento: { icon: 'bandage-outline', color: colors.cardOrange },
  cirugia: { icon: 'cut-outline', color: colors.cardRed },
};

interface ClinicalEventCardProps {
  event: ClinicalEvent;
  // Los eventos futuros se muestran como programados; los pasados, cumplidos.
  isUpcoming: boolean;
}

export function ClinicalEventCard({ event, isUpcoming }: ClinicalEventCardProps) {
  const { icon, color } = CLINICAL_EVENT_STYLE[event.type];

  return (
    <View style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={19} color={color} />
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {event.description}
        </Text>

        <Text style={styles.meta} numberOfLines={1}>
          {formatDate(event.date)} · {event.veterinarian}
        </Text>
      </View>

      <Chip
        label={isUpcoming ? 'Programada' : 'Completa'}
        color={isUpcoming ? colors.cardPurple : colors.cardGreen}
        variant="soft"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.appSurface,
    shadowColor: '#4B2A6B',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },

  info: {
    flex: 1,
    gap: 3,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.appTitle,
  },

  meta: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.appMuted,
  },
});
