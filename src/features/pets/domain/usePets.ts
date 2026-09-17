// Responsabilidad: caso de uso "mis mascotas" (capa DOMAIN de pets).
// Define el contrato PetsRepository (implementado en la capa data) y expone
// la lista de mascotas del dueño sin conocer Axios.
//
// Depende de B2 (GET /mascotas). Las tareas encadenadas lo consumen desde el
// barrel del dominio: el carnet (UC-02) parte de esta lista para llegar a
// GET /mascotas/:id/carnet, y home muestra el total de mascotas.

import { useFetch } from '../../../shared/hooks/useFetch';
import type { Pet } from './Pet';

export interface PetsRepository {
  getMyPets: () => Promise<Pet[]>;
}

export function usePets(petsRepository: PetsRepository) {
  const { data, isLoading, error, refetch } = useFetch(
    () => petsRepository.getMyPets(),
    [petsRepository]
  );

  // La UI siempre recibe una lista: mientras carga o si falla, es vacía.
  return { pets: data ?? [], isLoading, error, refetch };
}
