// Responsabilidad: logo de VetConecta (corazón con gato y perro) del flujo de auth (capa PRESENTATION).

import { Image } from 'react-native';

const LOGO = require('../../../../../assets/images/logo.png');

// Proporción del archivo recortado (1024 × 944): el ancho manda y el alto se ajusta.
const ASPECT_RATIO = 1024 / 944;

interface AppLogoProps {
  size?: number;
}

export function AppLogo({ size = 72 }: AppLogoProps) {
  return (
    <Image
      source={LOGO}
      style={{ width: size, height: size / ASPECT_RATIO }}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="Logo de VetConecta"
    />
  );
}
