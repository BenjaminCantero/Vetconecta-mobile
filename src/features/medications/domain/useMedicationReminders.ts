import { useFetch } from '../../../shared/hooks/useFetch';
import type { MedicationReminder } from './MedicationReminder';

export interface MedicationsRepository {
  getReminders: () => Promise<MedicationReminder[]>;
}

export function useMedicationReminders(repository: MedicationsRepository, petId: string | null) {
  const { data, isLoading, error, refetch } = useFetch(
    () => repository.getReminders(),
    [repository],
  );

  return {
    reminders: (data ?? []).filter((reminder) => reminder.petId === petId),
    isLoading,
    error,
    refetch,
  };
}
