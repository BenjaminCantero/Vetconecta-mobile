// Responsabilidad: paleta de colores de la app (capa CORE).

export const colors = {
  // Colores principales de VetConecta
  primary: '#6936B8',
  secondary: '#C3BEF7',

  // Fondos
  background: '#FFFFFF',
  surface: '#EFFFFA',
  surfaceSecondary: '#E5ECF4',

  // Textos
  text: '#1A1A1A',
  textMuted: '#625D70',
  textLight: '#FFFFFF',

  // Elementos de interfaz
  border: '#81778F',

  // Estados
  danger: '#B91C1C',
  success: '#166534',

  // Paleta auxiliar
  lavender: '#C3BEF7',
  aliceBlue: '#E5ECF4',
  mintCream: '#EFFFFA',

  // Flujo de autenticación
  gradientStart: '#8150AF',
  gradientEnd: '#51317F',
  authBackground: '#F8F7FB',
  authInput: '#FFFFFF',
  authButton: '#6936B8',
  authTitle: '#1E1A2E',
  authMuted: '#625D70',
  authLabel: '#6E6880',
  authLink: '#226A9C',
  authCheckboxBorder: '#81778F',
  brandHeart: '#FF2B2B',
  infoBackground: '#E3F4E9',
  infoIcon: '#1E9E57',
  infoText: '#2E5A43',

  // App autenticada
  appBackground: '#F8F7FB',
  appSurface: '#FFFFFF',
  appHeading: '#6936B8',
  appTitle: '#1E1A2E',
  appMuted: '#625D70',
  appDivider: '#E5DFED',
  statSurface: '#EFECF5',

  // Tarjetas de acción
  cardPinkStart: '#943A67',
  cardPinkEnd: '#793557',
  cardOrange: '#995018',
  cardPurple: '#8543BD',
  cardRed: '#C02F24',
  cardGreen: '#24764C',
  cardBlue: '#246D9F',

  // Mis mascotas
  petSelectedRing: '#B64A91',
  addPetSurface: '#F0EEF2',
  sheetSurface: '#FFFFFF',
  sheetHandle: '#6F7775',
  statValueSurface: '#E4E4E6',
  cardSky: '#24749A',
  cardViolet: '#8543BD',
  cardLeaf: '#24764C',
  cardCoral: '#AC542D',

  // Tintes suaves de los colores de la maqueta
  tintPink: '#FCE4EE',
  tintOrange: '#FBEBDD',
  tintPurple: '#EFE3FB',
  tintGreen: '#E1F3E9',
  tintRed: '#FBE4E1',
  tintGray: '#EEEEF1',

  // Estados de cita
  statusPending: '#995018',
  statusConfirmed: '#24764C',
  statusCancelled: '#C02F24',
  statusDone: '#555D6B',
} as const;
