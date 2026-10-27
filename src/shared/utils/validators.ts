// Responsabilidad: validadores de formularios reutilizables (capa SHARED).

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

// Formato de contacto acordado para dueños en Chile: +56 9 XXXX XXXX.
export function isValidChileanMobile(phone: string): boolean {
  return /^\+56 9 \d{4} \d{4}$/.test(phone.trim());
}

export function hasValidPasswordFormat(password: string): boolean {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}
