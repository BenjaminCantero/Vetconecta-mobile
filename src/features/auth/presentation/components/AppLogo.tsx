// Responsabilidad: logo de VetConecta (corazón con silueta) del flujo de auth (capa PRESENTATION).

import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '../../../../core/theme/colors';

interface AppLogoProps {
  size?: number;
}

export function AppLogo({ size = 72 }: AppLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel="Logo de VetConecta">
      <Path
        d="M32 60 C 13 46, 2 34, 2 21 C 2 10, 10 3, 19.5 3 C 25.5 3, 29.5 6.5, 32 11 C 34.5 6.5, 38.5 3, 44.5 3 C 54 3, 62 10, 62 21 C 62 34, 51 46, 32 60 Z"
        fill={colors.brandHeart}
      />
      <Circle cx={32} cy={19} r={5.5} fill={colors.textLight} />
      <Path d="M26.5 17 C 27.5 12.5, 36.5 12.5, 37.5 17 Z" fill={colors.textLight} />
      <Path
        d="M21 40 C 21 31, 25.5 26.5, 32 26.5 C 38.5 26.5, 43 31, 43 40 Z"
        fill={colors.textLight}
      />
    </Svg>
  );
}
