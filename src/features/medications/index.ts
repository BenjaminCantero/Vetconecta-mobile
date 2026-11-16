export { default as MedicationsScreen } from './presentation/screens/MedicationsScreen';
export { MedicationReminderCard } from './presentation/components/MedicationReminderCard';
export { medicationsRepository } from './data/medicationsRepository';
export { useMedicationReminders } from './domain/useMedicationReminders';
// H1: pauta de tratamiento (GET /mascotas/:id/tratamientos) y dosis programadas.
export { tratamientosService } from './data/tratamientosService';
export { usePautaTratamiento } from './domain/usePautaTratamiento';
export type { TratamientosRepository } from './domain/usePautaTratamiento';
export { calcularDosisProgramadas, construirPauta } from './domain/calcularDosisProgramadas';
export type { PautaTratamiento, Tratamiento } from './domain/Tratamiento';
// H2: recordatorios locales de dosis y checklist de cumplimiento (solo en el dispositivo).
export { MedicationRemindersBridge } from './presentation/components/MedicationRemindersBridge';
export { registerMedicationReminderActions } from './presentation/registerMedicationReminderActions';
