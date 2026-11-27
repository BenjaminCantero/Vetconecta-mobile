// Responsabilidad: tarjeta de un evento del carnet
// (capa PRESENTATION de pets).
// La fecha va como hoja de calendario teñida con el color
// del tipo de evento, igual que las citas.

import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
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
  vacuna: {
    icon: 'shield-checkmark',
    color: colors.cardPurple,
    label: 'Vacuna',
  },
  control: {
    icon: 'pulse',
    color: colors.cardBlue,
    label: 'Control',
  },
  tratamiento: {
    icon: 'bandage',
    color: colors.cardOrange,
    label: 'Tratamiento',
  },
  cirugia: {
    icon: 'cut',
    color: colors.cardRed,
    label: 'Cirugía',
  },
};

interface ClinicalEventCardProps {
  event: ClinicalEvent;
  isUpcoming: boolean;
}

export function ClinicalEventCard({ event, isUpcoming }: ClinicalEventCardProps) {
  const { width, fontScale } = useWindowDimensions();

  const useVerticalLayout = fontScale >= 1.3 || width < 340;

  const { icon, color, label } = CLINICAL_EVENT_STYLE[event.type];

  return (
    <View style={[styles.card, useVerticalLayout && styles.cardVertical]}>
      <DateLeaf isoDate={event.date} accent={color} surface={`${color}1A`} />

      <View style={[styles.info, useVerticalLayout && styles.infoVertical]}>
        <View style={styles.typeRow}>
          <View style={styles.category}>
            <Ionicons
              name={icon}
              size={14}
              color={color}
              accessible={false}
              importantForAccessibility="no"
            />

            <Text style={[styles.type, { color }]}>{label}</Text>
          </View>

          {isUpcoming && (
            <View style={styles.upcoming}>
              <Text style={styles.upcomingLabel}>Evento programado</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>{event.description}</Text>

        <Text style={styles.meta}>{event.veterinarian}</Text>
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

  cardVertical: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },

  info: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },

  infoVertical: {
    flex: 0,
    width: '100%',
  },

  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },

  category: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 5,
  },

  type: {
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: 12,
  },

  upcoming: {
    maxWidth: '100%',
    flexShrink: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.tintPurple,
  },

  upcomingLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.appHeading,
    textAlign: 'center',
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 22,
    color: colors.appTitle,
  },

  meta: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.appMuted,
  },
});
