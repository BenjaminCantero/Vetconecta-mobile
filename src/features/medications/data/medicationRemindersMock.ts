// Datos de ejemplo hasta que esté disponible la API de medicamentos.
import type { MedicationReminder } from '../domain/MedicationReminder';

export const medicationRemindersMock: MedicationReminder[] = [
  {
    id: 'tratamiento-001',
    petId: 'mascota-002',
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
