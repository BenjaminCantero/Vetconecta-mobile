// Responsabilidad: publicar las mascotas del dueño en ActivePetContext
// (capa PRESENTATION de pets). No dibuja nada: carga la lista con usePets y la
// entrega al contexto compartido, para que el selector de mascota activa esté
// disponible en todas las pestañas sin que otros dominios importen pets.

import { useEffect } from 'react';

import { useActivePet } from '../../../../shared/context/ActivePetContext';
import { petsRepository } from '../../data/petsRepository';
import { usePets } from '../../domain/usePets';

export function ActivePetSync() {
  const { pets } = usePets(petsRepository);
  const { setPets } = useActivePet();

  useEffect(() => {
    setPets(pets.map((pet) => ({ id: pet.id, name: pet.name, photoUrl: pet.photoUrl })));
  }, [pets, setPets]);

  return null;
}
