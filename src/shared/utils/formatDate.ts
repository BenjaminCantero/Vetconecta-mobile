// Responsabilidad: utilidad de formateo de fechas (capa SHARED).

export function formatDate(isoDate: string, locale: string = 'es-CL'): string {
  return new Date(isoDate).toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
