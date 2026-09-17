// Superficie pública del dominio pets. Regla 4 de A2.
export { usePets } from './domain/usePets';
export type { PetsRepository } from './domain/usePets';
export { petsRepository } from './data/petsRepository';
export type { Pet, PetSpecies } from './domain/Pet';
export type { ClinicalEvent, ClinicalEventType } from './domain/ClinicalEvent';
export { calculateAge } from './domain/calculateAge';
export { default as MyPetsScreen } from './presentation/screens/MyPetsScreen';
export { default as PetDetailScreen } from './presentation/screens/PetDetailScreen';
export { default as HealthCardScreen } from './presentation/screens/HealthCardScreen';
