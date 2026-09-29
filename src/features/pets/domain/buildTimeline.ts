// Responsabilidad: línea de tiempo del carnet (capa DOMAIN de pets).
// Ordena los eventos clínicos del más reciente al más antiguo y los agrupa por
// año, que es como el carnet digital los muestra.

import type { ClinicalEvent } from './ClinicalEvent';

export interface TimelineSection {
  year: number;
  events: ClinicalEvent[];
}

export function buildTimeline(events: ClinicalEvent[]): TimelineSection[] {
  const ordered = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const sections: TimelineSection[] = [];

  for (const event of ordered) {
    const year = new Date(event.date).getFullYear();
    const current = sections[sections.length - 1];

    if (current?.year === year) {
      current.events.push(event);
    } else {
      sections.push({ year, events: [event] });
    }
  }

  return sections;
}
