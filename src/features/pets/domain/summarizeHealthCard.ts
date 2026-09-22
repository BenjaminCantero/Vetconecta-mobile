// Responsabilidad: resumen del carnet de una mascota (capa DOMAIN de pets).
// Los conteos de la ficha ("3 atenciones previas", "4 vacunas registradas") se
// derivan de los eventos clínicos que ya entrega el carnet; no son un dato
// aparte del backend.

import type { ClinicalEvent } from './ClinicalEvent';

export interface HealthCardSummary {
  // Atenciones: todo lo que no es una vacuna (controles, tratamientos, cirugías).
  visits: number;
  vaccines: number;
  lastEvent: ClinicalEvent | null;
}

export function summarizeHealthCard(events: ClinicalEvent[]): HealthCardSummary {
  const vaccines = events.filter((event) => event.type === 'vacuna').length;

  const lastEvent = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )[0];

  return {
    visits: events.length - vaccines,
    vaccines,
    lastEvent: lastEvent ?? null,
  };
}
