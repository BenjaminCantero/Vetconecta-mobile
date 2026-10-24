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
  border: '#E5ECF4',

  // Estados
  danger: '#DC2626',
  success: '#16A34A',

  // Paleta auxiliar
  lavender: '#C3BEF7',
  aliceBlue: '#E5ECF4',
  mintCream: '#EFFFFA',

  // Flujo de autenticación (maqueta Bienvenida / Iniciar sesión / Recuperar acceso)
  gradientStart: '#8150AF',
  gradientEnd: '#51317F',
  authBackground: '#F8F7FB',
  authInput: '#FFFFFF',
  authButton: '#6936B8',
  authTitle: '#1E1A2E',
  authMuted: '#625D70',
  authLabel: '#6E6880',
  authLink: '#226A9C',
  authCheckboxBorder: '#CFC3E3',
  brandHeart: '#FF2B2B', // rojo del logo (assets/images/logo.png)
  infoBackground: '#E3F4E9',
  infoIcon: '#1E9E57',
  infoText: '#2E5A43',

  // App autenticada (maqueta Inicio / Mis mascotas / Citas)
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
  cardPurple: '#9B51E0',
  cardRed: '#CD3A2A',
  cardGreen: '#24764C',
  cardBlue: '#2C7FB8',

  // Mis mascotas (maqueta con hoja inferior y grilla de tarjetas)
  petSelectedRing: '#F59AD6',
  addPetSurface: '#F0EEF2',
  sheetSurface: '#FFFFFF',
  sheetHandle: '#6F7775',
  statValueSurface: '#E4E4E6',
  cardSky: '#5AAFD6',
  cardViolet: '#A864E8',
  cardLeaf: '#1DB95B',
  cardCoral: '#EB8A57',

  // Tintes suaves de los colores de la maqueta: fondos de íconos, bloques de
  // fecha y etiquetas sobre superficies blancas.
  tintPink: '#FCE4EE',
  tintOrange: '#FBEBDD',
  tintPurple: '#EFE3FB',
  tintGreen: '#E1F3E9',
  tintRed: '#FBE4E1',
  tintGray: '#EEEEF1',

  // Estados de cita
  statusPending: '#995018',
  statusConfirmed: '#24764C',
  statusCancelled: '#CD3A2A',
  statusDone: '#6B7280',
} as const;
