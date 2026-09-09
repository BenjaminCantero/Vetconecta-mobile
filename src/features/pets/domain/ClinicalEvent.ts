// Responsabilidad: entidad de negocio ClinicalEvent (capa DOMAIN de pets).
// Representa un evento del carnet de salud (vacuna, control, tratamiento).

export type ClinicalEventType = 'vacuna' | 'control' | 'tratamiento' | 'cirugia';

export interface ClinicalEvent {
  id: string;
  petId: string;
  type: ClinicalEventType;
  description: string;
  date: string; // ISO 8601
  veterinarian: string;
}
