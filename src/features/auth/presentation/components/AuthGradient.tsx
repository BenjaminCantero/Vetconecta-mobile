// Responsabilidad: fondo degradado con líneas onduladas del flujo de auth (capa PRESENTATION).

import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import { colors } from '../../../../core/theme/colors';

// Cada onda es una curva cúbica suave que cruza el ancho del viewBox; se
// desplazan en vertical para formar el patrón de líneas del maqueteado.
const WAVE_OFFSETS = [18, 38, 58, 78, 98, 118];

function wavePath(y: number) {
  return `M0 ${y} C 90 ${y - 26}, 170 ${y + 22}, 260 ${y - 4} S 360 ${y - 24}, 400 ${y - 14}`;
}

interface AuthGradientProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  wavesTop?: number;
}

export function AuthGradient({ children, style, wavesTop = 0 }: AuthGradientProps) {
  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={style}
    >
      <View pointerEvents="none" style={[styles.waves, { top: wavesTop }]}>
        <Svg width="100%" height="100%" viewBox="0 0 400 140" preserveAspectRatio="none">
          {WAVE_OFFSETS.map((y) => (
            <Path
              key={y}
              d={wavePath(y)}
              stroke="rgba(255,255,255,0.45)"
              strokeWidth={1}
              fill="none"
            />
          ))}
        </Svg>
      </View>

      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  waves: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 140,
  },
});
