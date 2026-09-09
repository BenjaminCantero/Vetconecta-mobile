// Responsabilidad: lógica de negocio pura (capa DOMAIN de pets).
// Calcula la edad exacta de una mascota a partir de su fecha de nacimiento.

export function calculateAge(birthDate: string, referenceDate: Date = new Date()): string {
  const birth = new Date(birthDate);

  let years = referenceDate.getFullYear() - birth.getFullYear();
  let months = referenceDate.getMonth() - birth.getMonth();
  let days = referenceDate.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const daysInPrevMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 0).getDate();
    days += daysInPrevMonth;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return `${years} años, ${months} meses y ${days} días`;
}
