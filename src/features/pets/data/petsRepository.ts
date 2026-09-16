// Responsabilidad: acceso a datos de mascotas (capa DATA).
// Llama a la API externa vía httpClient (GET, solo lectura) y mapea los
// DTO recibidos a entidades del dominio (Pet, ClinicalEvent).
//
// Nota: el backend lo desarrolla otro equipo y aún no está disponible, así que
// mientras ENV.USE_MOCKS esté activo los datos salen de `petsMock`. El mapeo y
// la validación son los mismos en ambos caminos.
//
// El carnet (UC-02) y el historial clínico (UC-08) se sirven del mismo
// endpoint: la lista de eventos clínicos de la mascota. La edad no viene en el
// carnet; se calcula en el dominio con `calculateAge` a partir de `Pet.birthDate`.

import { httpClient } from '../../../core/api/httpClient';
import { ENDPOINTS } from '../../../core/api/endpoints';
import { toHttpError } from '../../../core/api/httpError';
import { ENV } from '../../../core/config/env';
import type { Pet, PetSpecies } from '../domain/Pet';
import type { ClinicalEvent, ClinicalEventType } from '../domain/ClinicalEvent';
import type { ClinicalEventDto, PetDto } from './petsDto';
import { clinicalEventsMock, petsMock } from './petsMock';

const PET_SPECIES: PetSpecies[] = ['perro', 'gato', 'otro'];

const CLINICAL_EVENT_TYPES: ClinicalEventType[] = ['vacuna', 'control', 'tratamiento', 'cirugia'];

const PETS_ERROR_MESSAGES = {
  unauthorized: 'Tu sesión expiró. Vuelve a iniciar sesión para ver tus mascotas.',
  fallback: 'No se pudieron cargar tus mascotas. Inténtalo más tarde.',
};

const HEALTH_CARD_ERROR_MESSAGES = {
  unauthorized: 'Tu sesión expiró. Vuelve a iniciar sesión para ver el carnet.',
  notFound: 'No se encontró el carnet de esta mascota.',
  fallback: 'No se pudo cargar el carnet de salud. Inténtalo más tarde.',
};

// El backend podría devolver valores que el dominio no conoce. En vez de
// dejarlos entrar con un cast a ciegas, se degradan a la opción más genérica.
function toPetSpecies(especie: string): PetSpecies {
  const species = especie?.toLowerCase() as PetSpecies;
  return PET_SPECIES.includes(species) ? species : 'otro';
}

function toClinicalEventType(tipo: string): ClinicalEventType {
  const type = tipo?.toLowerCase() as ClinicalEventType;
  return CLINICAL_EVENT_TYPES.includes(type) ? type : 'control';
}

function toPet(dto: PetDto): Pet {
  return {
    id: dto.id,
    name: dto.nombre,
    species: toPetSpecies(dto.especie),
    breed: dto.raza,
    birthDate: dto.fecha_nacimiento,
    ownerId: dto.id_dueno,
  };
}

function toClinicalEvent(dto: ClinicalEventDto): ClinicalEvent {
  return {
    id: dto.id,
    petId: dto.id_mascota,
    type: toClinicalEventType(dto.tipo),
    description: dto.descripcion,
    date: dto.fecha,
    veterinarian: dto.veterinario,
  };
}

export const petsRepository = {
  async getMyPets(): Promise<Pet[]> {
    if (ENV.USE_MOCKS) {
      return petsMock.map(toPet);
    }

    try {
      const { data } = await httpClient.get<PetDto[]>(ENDPOINTS.PETS.LIST);
      // Defensa mínima: si la API devuelve algo que no es una lista, se trata
      // como "sin mascotas" en lugar de reventar al mapear.
      return Array.isArray(data) ? data.map(toPet) : [];
    } catch (error) {
      throw toHttpError(error, PETS_ERROR_MESSAGES);
    }
  },

  async getHealthCard(petId: string): Promise<ClinicalEvent[]> {
    if (ENV.USE_MOCKS) {
      return clinicalEventsMock.filter((event) => event.id_mascota === petId).map(toClinicalEvent);
    }

    try {
      const { data } = await httpClient.get<ClinicalEventDto[]>(ENDPOINTS.PETS.HEALTH_CARD(petId));
      return Array.isArray(data) ? data.map(toClinicalEvent) : [];
    } catch (error) {
      throw toHttpError(error, HEALTH_CARD_ERROR_MESSAGES);
    }
  },
};
