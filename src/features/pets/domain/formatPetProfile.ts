// Responsabilidad: reglas de presentación del perfil de una mascota
// (capa DOMAIN de pets). Son funciones puras: no conocen React ni la API.

import { calculateAge } from './calculateAge';
import type { Pet } from './Pet';

// Versión compacta de la edad para las fichas: "2 años 4 m", "8 meses".
export function formatCompactAge(birthDate: string, referenceDate: Date = new Date()): string {
  const detailed = calculateAge(birthDate, referenceDate);
  const [years, months] = detailed.match(/\d+/g)?.map(Number) ?? [0, 0];

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

  return new Date(isoDate).toLocaleDateString(locale, {
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
