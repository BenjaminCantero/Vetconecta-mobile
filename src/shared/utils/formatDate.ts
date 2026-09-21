// Responsabilidad: utilidad de formateo de fechas (capa SHARED).

export function formatDate(isoDate: string, locale: string = 'es-CL'): string {
  return new Date(isoDate).toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// "hoy a las 09:30", "mañana a las 09:30" o "el 22 de sep. a las 09:30".
export function formatRelativeDateTime(
  isoDate: string,
  now: Date = new Date(),
  locale: string = 'es-CL'
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
