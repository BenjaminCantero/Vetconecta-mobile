// Responsabilidad: paleta de colores de la app (capa CORE).

export const colors = {
  // Colores principales de VetConecta
  primary: '#8A4FFF',
  secondary: '#C3BEF7',

  // Fondos
  background: '#FFFFFF',
  surface: '#EFFFFA',
  surfaceSecondary: '#E5ECF4',

  // Textos
  text: '#1A1A1A',
  textMuted: '#6B7280',
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
  gradientStart: '#E596BC',
  gradientEnd: '#A45BDA',
  authBackground: '#F2E9FA',
  authInput: '#E8E0F2',
  authButton: '#A580EC',
  authTitle: '#1E1A2E',
  authMuted: '#7A7488',
  authLabel: '#6E6880',
  authLink: '#3A96D2',
  authCheckboxBorder: '#CFC3E3',
  brandHeart: '#E53935',
  infoBackground: '#E3F4E9',
  infoIcon: '#1E9E57',
  infoText: '#2E5A43',
} as const;
