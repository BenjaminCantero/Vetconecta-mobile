// Responsabilidad: lógica de negocio pura (capa DOMAIN de pets).
// Calcula la edad exacta de una mascota a partir de su fecha de nacimiento.

import { parseDate } from '../../../shared/utils/formatDate';

export interface Age {
  years: number;
  months: number;
  days: number;
}

const UNKNOWN_AGE = 'Sin dato';

// Devuelve null si la fecha no es válida o es posterior a la de referencia:
// la UI muestra "Sin dato" en lugar de "NaN años" o una edad negativa.
export function calculateAgeParts(birthDate: string, referenceDate: Date = new Date()): Age | null {
  const birth = parseDate(birthDate);

  if (Number.isNaN(birth.getTime()) || birth.getTime() > referenceDate.getTime()) {
    return null;
  }

  let years = referenceDate.getFullYear() - birth.getFullYear();
  let months = referenceDate.getMonth() - birth.getMonth();
  let days = referenceDate.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const daysInPrevMonth = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      0,
    ).getDate();
    days += daysInPrevMonth;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

function plural(value: number, singular: string, pluralForm: string): string {
  return `${value} ${value === 1 ? singular : pluralForm}`;
}

// "3 años, 6 meses y 17 días".
export function calculateAge(birthDate: string, referenceDate: Date = new Date()): string {
  const age = calculateAgeParts(birthDate, referenceDate);

  if (!age) return UNKNOWN_AGE;

  return `${plural(age.years, 'año', 'años')}, ${plural(age.months, 'mes', 'meses')} y ${plural(age.days, 'día', 'días')}`;
}
