// Superficie pública del dominio pets. Regla 4 de A2.
export { petsRepository } from './data/petsRepository';
export type { Pet, PetSpecies } from './domain/Pet';
export type { ClinicalEvent, ClinicalEventType } from './domain/ClinicalEvent';
export { calculateAge } from './domain/calculateAge';
export { default as MyPetsScreen } from './presentation/screens/MyPetsScreen';
export { default as PetDetailScreen } from './presentation/screens/PetDetailScreen';
export { default as HealthCardScreen } from './presentation/screens/HealthCardScreen';
// Nota (costura A1): pets aún no tiene hook de dominio (usePets). Mientras tanto
// expone petsRepository como su entrada de datos pública. Al añadir usePets,
// los consumidores (incl. home) cambian a él con una sola línea.
