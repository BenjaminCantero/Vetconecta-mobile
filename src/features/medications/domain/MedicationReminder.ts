export interface MedicationReminder {
  id: string;
  petId: string;
  petName: string;
  medication: string;
  dose: string;
  timeLabel: string;
  dayLabel: string;
  taken: boolean;
  dosesTaken: number;
  dosesTotal: number;
}
