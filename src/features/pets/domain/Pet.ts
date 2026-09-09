// Responsabilidad: entidad de negocio Pet (capa DOMAIN de pets).

export type PetSpecies = 'perro' | 'gato' | 'otro';

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  birthDate: string; // ISO 8601
  ownerId: string;
}
