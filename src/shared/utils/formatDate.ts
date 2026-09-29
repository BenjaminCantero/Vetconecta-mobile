// Responsabilidad: utilidad de formateo de fechas (capa SHARED).

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

// `new Date('2021-03-12')` interpreta la fecha como medianoche UTC, que en
// Chile (UTC-3/-4) cae el día anterior. Las fechas sin hora (nacimiento,
// próximo control) se construyen en hora local para no correrse un día.
export function parseDate(isoDate: string): Date {
  const match = DATE_ONLY.exec(isoDate);

  if (match) {
    const [, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  return new Date(isoDate);
}

export function formatDate(isoDate: string, locale: string = 'es-CL'): string {
  return parseDate(isoDate).toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// "hoy a las 09:30", "mañana a las 09:30" o "el 22 de sep. a las 09:30".
export function formatRelativeDateTime(
  isoDate: string,
  now: Date = new Date(),
  locale: string = 'es-CL',
): string {
  const date = new Date(isoDate);

  const time = date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const startOfDay = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();

  const daysApart = Math.round((startOfDay(date) - startOfDay(now)) / 86_400_000);

  if (daysApart === 0) return `hoy a las ${time}`;
  if (daysApart === 1) return `mañana a las ${time}`;

  const day = date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });

  return `el ${day} a las ${time}`;
}
