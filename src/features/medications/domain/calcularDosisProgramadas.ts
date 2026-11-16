// Responsabilidad: regla de negocio "dosis programadas" (capa DOMAIN de medications).
// Una pauta cubre el periodo [inicio, inicio + duración). Se toma una dosis al
// inicio y otra cada `frequencyHours` mientras siga dentro del periodo.
// Ej.: cada 8 h durante 5 días = 120 h / 8 h = 15 dosis.
//
// Las horas se suman en tiempo absoluto: un cambio de horario de verano no
// acorta ni alarga el intervalo entre tomas.

import type { PautaTratamiento, Tratamiento } from './Tratamiento';

const MS_PER_HOUR = 60 * 60 * 1000;

export function calcularDosisProgramadas(
  tratamiento: Pick<Tratamiento, 'startAt' | 'frequencyHours' | 'durationDays'>,
): string[] {
  const { startAt, frequencyHours, durationDays } = tratamiento;
  const start = new Date(startAt).getTime();

  if (Number.isNaN(start) || !(frequencyHours > 0) || !(durationDays > 0)) {
    return [];
  }

  // Se trabaja en milisegundos enteros: con frecuencias en fracciones de hora
  // (ej. cada 2 min = 0,0333 h) la división en horas arrastra decimales y
  // contaría una toma de más.
  const stepMs = Math.round(frequencyHours * MS_PER_HOUR);
  const totalMs = Math.round(durationDays * 24 * MS_PER_HOUR);

  if (stepMs <= 0) {
    return [];
  }

  const count = Math.ceil(totalMs / stepMs);

  return Array.from({ length: count }, (_, index) =>
    new Date(start + index * stepMs).toISOString(),
  );
}

export function construirPauta(tratamientos: Tratamiento[]): PautaTratamiento[] {
  return tratamientos.map((tratamiento) => ({
    ...tratamiento,
    scheduledDoses: calcularDosisProgramadas(tratamiento),
  }));
}
