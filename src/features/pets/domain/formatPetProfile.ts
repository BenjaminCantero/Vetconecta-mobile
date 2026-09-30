// Responsabilidad: reglas de presentación del perfil de una mascota
// (capa DOMAIN de pets). Son funciones puras: no conocen React ni la API.

import { parseDate } from '../../../shared/utils/formatDate';
import { calculateAgeParts } from './calculateAge';
import type { Pet } from './Pet';

// Versión compacta de la edad para las fichas: "2 años 4 m", "8 meses", "12 días".
export function formatCompactAge(birthDate: string, referenceDate: Date = new Date()): string {
  const age = calculateAgeParts(birthDate, referenceDate);

  if (!age) return 'Sin dato';

  const { years, months, days } = age;

  if (years === 0 && months === 0) {
    return days === 1 ? '1 día' : `${days} días`;
  }

  if (years === 0) {
    return months === 1 ? '1 mes' : `${months} meses`;
  }

  const yearsLabel = years === 1 ? '1 año' : `${years} años`;

  return months === 0 ? yearsLabel : `${yearsLabel} ${months} m`;
}

// Edad en años con un decimal para la ficha de Mis Mascotas: "2.4 años".
// Bajo el año cae a la versión compacta ("8 meses", "12 días").
export function formatDecimalAge(birthDate: string, referenceDate: Date = new Date()): string {
  const age = calculateAgeParts(birthDate, referenceDate);

  if (!age) return 'Sin dato';

  if (age.years === 0) return formatCompactAge(birthDate, referenceDate);

  const years = Math.floor((age.years + age.months / 12) * 10) / 10;
  const label = Number.isInteger(years) ? String(years) : years.toFixed(1);

  return years === 1 ? '1 año' : `${label} años`;
}

export function formatWeight(weightKg: number | null): string {
  return weightKg === null ? 'Sin dato' : `${weightKg} kg`;
}

const SHORT_MONTHS = [
  'ene.',
  'feb.',
  'mar.',
  'abr.',
  'may.',
  'jun.',
  'jul.',
  'ago.',
  'sep.',
  'oct.',
  'nov.',
  'dic.',
];

// "15 sep." en la ficha: día y mes abreviado, sin año. Se arma a mano porque
// Intl en Android (Hermes) devuelve "15-sept" en lugar del formato de la maqueta.
export function formatShortDate(isoDate: string | null): string {
  if (!isoDate) return 'Sin agendar';

  const date = parseDate(isoDate);

  if (Number.isNaN(date.getTime())) return 'Sin dato';

  return `${date.getDate()} ${SHORT_MONTHS[date.getMonth()]}`;
}

// "Hembra esterilizada", "Macho", "Sexo sin registrar".
export function formatSexAndSterilization(pet: Pet): string {
  if (pet.sex === 'desconocido') {
    return pet.sterilized ? 'Esterilizada/o' : 'Sexo sin registrar';
  }

  const sex = pet.sex === 'hembra' ? 'Hembra' : 'Macho';

  if (!pet.sterilized) return sex;

  return pet.sex === 'hembra' ? `${sex} esterilizada` : `${sex} esterilizado`;
}
