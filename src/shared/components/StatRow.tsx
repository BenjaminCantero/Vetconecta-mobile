// Responsabilidad: fila de datos destacados en columnas (capa SHARED).

import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../core/theme/colors';
import { fonts } from '../../core/theme/typography';

export interface StatItem {
  label: string;
  value: string;
}

interface StatRowProps {
  items: StatItem[];
}

export function StatRow({ items }: StatRowProps) {
  return (
    <View style={styles.row}>
      {items.map((item, index) => (
        <Fragment key={item.label}>
          {index > 0 && <View style={styles.divider} />}

          <View style={styles.item}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value} numberOfLines={1}>
              {item.value}
            </Text>
          </View>
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 18,
    backgroundColor: colors.statSurface,
    paddingVertical: 12,
  },

  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
  },

  divider: {
    width: 1,
    marginVertical: 4,
    backgroundColor: colors.appDivider,
  },

  label: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.appMuted,
  },

  value: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.appTitle,
  },
});
