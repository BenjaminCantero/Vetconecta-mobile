// Responsabilidad: datos de ejemplo del recordatorio de medicamentos (feature home).
//
// Pendiente: los tratamientos no tienen dominio ni endpoint todavía. Cuando el
// otro equipo publique la API, esto debe salir de home y convertirse en un
// dominio propio (features/treatments) con su repositorio y su caso de uso;
// home volvería a limitarse a leer la superficie pública de ese dominio.

export interface MedicationReminder {
  id: string;
  petName: string;
  medication: string;
  dose: string;
  timeLabel: string;
  dayLabel: string;
  taken: boolean;
  dosesTaken: number;
  dosesTotal: number;
}

export const medicationRemindersMock: MedicationReminder[] = [
  {
    id: 'tratamiento-001',
    petName: 'Luna',
    medication: 'Amoxicilina 250 mg',
    dose: '1 comprimido (c/12 hrs)',
    timeLabel: 'Hoy, 18:00 hrs.',
    dayLabel: 'Día 2 de 5',
    taken: true,
    dosesTaken: 4,
    dosesTotal: 10,
  },
];
