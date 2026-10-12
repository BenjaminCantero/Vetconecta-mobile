// Responsabilidad: fecha dibujada como hoja de calendario (capa SHARED).
// Es el elemento que identifica una cita en toda la app: el mes arriba en el
// color del estado o de la tarjeta, el día grande debajo.

import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../core/theme/colors';
import { fonts } from '../../core/theme/typography';
import { dateLeafParts } from '../utils/formatDate';

interface DateLeafProps {
  isoDate: string;
  // Color del mes y del borde superior.
  accent: string;
  // Fondo de la hoja; por defecto blanco.
  surface?: string;
  size?: 'large' | 'small';
}

export function DateLeaf({
  isoDate,
  accent,
  surface = colors.appSurface,
  size = 'small',
}: DateLeafProps) {
  const { day, month, weekday } = dateLeafParts(isoDate);
  const large = size === 'large';

  return (
    <View
      style={[
        styles.leaf,
        large ? styles.leafLarge : styles.leafSmall,
        { backgroundColor: surface },
      ]}
      accessible
      accessibilityLabel={`${weekday} ${day} de ${month}`}
    >
      <View style={[styles.band, { backgroundColor: accent }]}>
        <Text style={[styles.month, large && styles.monthLarge]}>{month}</Text>
      </View>

      <Text style={[styles.day, large && styles.dayLarge]}>{day}</Text>
      <Text style={[styles.weekday, large && styles.weekdayLarge]}>{weekday}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  leaf: {
    alignItems: 'center',
    overflow: 'hidden',
  },

  leafSmall: {
    width: 58,
    paddingBottom: 6,
    borderRadius: 14,
  },

  leafLarge: {
    width: 84,
    paddingBottom: 10,
    borderRadius: 18,
  },

  band: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 3,
  },

  month: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.textLight,
  },

  monthLarge: {
    paddingVertical: 2,
    fontSize: 14,
  },

  day: {
    marginTop: 2,
    fontFamily: fonts.extrabold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.appTitle,
  },

  dayLarge: {
    fontSize: 38,
    lineHeight: 46,
  },

  weekday: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.appMuted,
  },

  weekdayLarge: {
    fontSize: 13,
  },
});
