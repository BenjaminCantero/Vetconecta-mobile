// Responsabilidad: validadores de formularios reutilizables (capa SHARED).

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}
