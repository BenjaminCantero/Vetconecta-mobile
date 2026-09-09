// Responsabilidad: acceso a datos de mascotas (capa DATA).
// Llama a la API externa vía httpClient (GET, solo lectura) y mapea los
// DTO recibidos a entidades del dominio (Pet, ClinicalEvent).

import { httpClient } from '../../../core/api/httpClient';
import { ENDPOINTS } from '../../../core/api/endpoints';
import type { Pet, PetSpecies } from '../domain/Pet';
import type { ClinicalEvent, ClinicalEventType } from '../domain/ClinicalEvent';
import type { ClinicalEventDto, PetDto } from './petsDto';

function toPet(dto: PetDto): Pet {
  return {
    id: dto.id,
    name: dto.nombre,
    species: dto.especie as PetSpecies,
    breed: dto.raza,
    birthDate: dto.fecha_nacimiento,
    ownerId: dto.id_dueno,
  };
}

function toClinicalEvent(dto: ClinicalEventDto): ClinicalEvent {
  return {
    id: dto.id,
    petId: dto.id_mascota,
    type: dto.tipo as ClinicalEventType,
    description: dto.descripcion,
    date: dto.fecha,
    veterinarian: dto.veterinario,
  };
}

export const petsRepository = {
  async getMyPets(): Promise<Pet[]> {
    const { data } = await httpClient.get<PetDto[]>(ENDPOINTS.PETS.LIST);
    return data.map(toPet);
  },

  async getHealthCard(petId: string): Promise<ClinicalEvent[]> {
    const { data } = await httpClient.get<ClinicalEventDto[]>(ENDPOINTS.PETS.HEALTH_CARD(petId));
    return data.map(toClinicalEvent);
  },
};
