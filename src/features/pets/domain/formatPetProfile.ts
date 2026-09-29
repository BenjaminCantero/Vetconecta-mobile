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

export function formatWeight(weightKg: number | null): string {
  return weightKg === null ? 'Sin dato' : `${weightKg} kg`;
}

// "15 sep." en la ficha: día y mes abreviado, sin año.
export function formatShortDate(isoDate: string | null, locale: string = 'es-CL'): string {
  if (!isoDate) return 'Sin agendar';

  return parseDate(isoDate).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
  });
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
