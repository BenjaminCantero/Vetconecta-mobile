// Responsabilidad: línea de tiempo del carnet digital (capa PRESENTATION de pets).
// Solo lectura: dibuja las secciones por año que arma `buildTimeline`, con un
// riel vertical que une los eventos de cada año.

import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import type { TimelineSection } from '../../domain/buildTimeline';
import { CLINICAL_EVENT_STYLE, ClinicalEventCard } from './ClinicalEventCard';

interface ClinicalTimelineProps {
  sections: TimelineSection[];
  // Momento de referencia para marcar eventos como programados o cumplidos.
  now: number;
}

export function ClinicalTimeline({ sections, now }: ClinicalTimelineProps) {
  return (
    <View style={styles.timeline}>
      {sections.map((section) => (
        <View key={section.year}>
          <Text style={styles.year} accessibilityRole="header">
            {section.year}
          </Text>

          {section.events.map((event, index) => {
            const isFirst = index === 0;
            const isLast = index === section.events.length - 1;

            return (
              <View key={event.id} style={styles.row}>
                <View style={styles.rail}>
                  <View style={[styles.lineTop, isFirst && styles.lineHidden]} />
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: CLINICAL_EVENT_STYLE[event.type].color },
                    ]}
                  />
                  <View style={[styles.lineBottom, isLast && styles.lineHidden]} />
                </View>

                <View style={[styles.item, isLast && styles.itemLast]}>
                  <ClinicalEventCard
                    event={event}
                    isUpcoming={new Date(event.date).getTime() >= now}
                  />
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const DOT_SIZE = 10;
// Alinea el punto con la franja del mes de la hoja de calendario
// (padding 14 + mitad de la franja, ~11).
const DOT_OFFSET = 25 - DOT_SIZE / 2;

const styles = StyleSheet.create({
  timeline: {
    gap: 18,
  },

  year: {
    marginBottom: 10,
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.appTitle,
  },

  row: {
    flexDirection: 'row',
  },

  rail: {
    width: 14,
    alignItems: 'center',
  },

  lineTop: {
    width: 2,
    height: DOT_OFFSET,
    backgroundColor: colors.appDivider,
  },

  lineBottom: {
    flex: 1,
    width: 2,
    backgroundColor: colors.appDivider,
  },

  lineHidden: {
    backgroundColor: 'transparent',
  },

  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },

  item: {
    flex: 1,
    paddingLeft: 8,
    paddingBottom: 10,
  },

  itemLast: {
    paddingBottom: 0,
  },
});
