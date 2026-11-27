// Responsabilidad: fila de datos destacados en columnas (capa SHARED).
// Adapta su distribución al tamaño de fuente del dispositivo.

import { Fragment } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

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
  const { width, fontScale } = useWindowDimensions();

  const useVerticalLayout = fontScale >= 1.3 || width < 340;

  return (
    <View style={[styles.row, useVerticalLayout && styles.rowVertical]}>
      {items.map((item, index) => (
        <Fragment key={item.label}>
          {index > 0 && (
            <View style={[styles.divider, useVerticalLayout && styles.dividerHorizontal]} />
          )}

          <View
            accessible
            accessibilityLabel={`${item.label}: ${item.value}`}
            style={[styles.item, useVerticalLayout && styles.itemVertical]}
          >
            <Text style={styles.label}>{item.label}</Text>

            <Text style={styles.value}>{item.value}</Text>
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

  rowVertical: {
    flexDirection: 'column',
    paddingHorizontal: 12,
    gap: 8,
  },

  item: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
  },

  itemVertical: {
    flex: 0,
    paddingVertical: 8,
  },

  divider: {
    width: 1,
    marginVertical: 4,
    backgroundColor: colors.appDivider,
  },

  dividerHorizontal: {
    width: '100%',
    height: 1,
    marginVertical: 0,
  },

  label: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.appMuted,
    textAlign: 'center',
  },

  value: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.appTitle,
    textAlign: 'center',
  },
});
