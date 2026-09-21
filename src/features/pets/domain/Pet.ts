// Responsabilidad: entidad de negocio Pet (capa DOMAIN de pets).

export type PetSpecies = 'perro' | 'gato' | 'otro';

export type PetSex = 'macho' | 'hembra' | 'desconocido';

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  birthDate: string; // ISO 8601
  ownerId: string;
  // Campos de la ficha clínica. El backend aún no está publicado: los nombres
  // de estos campos quedan por confirmar con el equipo que lo desarrolla, así
  // que son opcionales y la UI tolera que falten.
  sex: PetSex;
  sterilized: boolean;
  microchip: string | null;
  weightKg: number | null;
  nextControlDate: string | null; // ISO 8601
  photoUrl: string | null;
}
