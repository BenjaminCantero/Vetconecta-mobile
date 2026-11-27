// Responsabilidad: etiqueta compacta de estado o categoría (capa SHARED).

import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../core/theme/colors';
import { fonts } from '../../core/theme/typography';

interface ChipProps {
  label: string;
  color?: string;

  // Relleno sólido o suave.
  variant?: 'solid' | 'soft';
}

export function Chip({ label, color = colors.appHeading, variant = 'solid' }: ChipProps) {
  const isSolid = variant === 'solid';

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: isSolid ? color : `${color}22`,
        },
      ]}
    >
      <Text
        allowFontScaling
        style={[
          styles.label,
          {
            color: isSolid ? colors.textLight : colors.appTitle,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    flexShrink: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },

  label: {
    fontFamily: fonts.bold,
    fontSize: 12,
    textAlign: 'center',
  },
});
