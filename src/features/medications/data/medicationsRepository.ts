import { ENV } from '../../../core/config/env';
import type { MedicationsRepository } from '../domain/useMedicationReminders';
import { medicationRemindersMock } from './medicationRemindersMock';

export const medicationsRepository: MedicationsRepository = {
  async getReminders() {
    if (!ENV.USE_MOCKS) {
      throw new Error('La consulta de medicamentos aún no está disponible.');
    }

    return medicationRemindersMock;
  },
};
