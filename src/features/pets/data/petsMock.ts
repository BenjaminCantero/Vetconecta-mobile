// Responsabilidad: datos de ejemplo de mascotas y carnet (capa DATA).
// Reproducen la forma exacta de las respuestas esperadas de GET /mascotas y
// GET /mascotas/:id/carnet, para que el mapeo a entidades del dominio sea el
// mismo con mock y con backend. Los ids coinciden con el mock de citas.
// Se usan solo mientras ENV.USE_MOCKS está activo; cuando el otro equipo
// publique la API, este archivo se elimina junto con su rama en el repositorio.

import type { ClinicalEventDto, PetDto } from './petsDto';

export const petsMock: PetDto[] = [
  {
    id: 'mascota-001',
    nombre: 'Rocky',
    especie: 'perro',
    raza: 'Labrador retriever',
    fecha_nacimiento: '2021-03-12',
    id_dueno: 'mock-id',
  },
  {
    id: 'mascota-002',
    nombre: 'Luna',
    especie: 'gato',
    raza: 'Siamés',
    fecha_nacimiento: '2024-11-02',
    id_dueno: 'mock-id',
  },
];

export const clinicalEventsMock: ClinicalEventDto[] = [
  {
    id: 'evento-001',
    id_mascota: 'mascota-001',
    tipo: 'vacuna',
    descripcion: 'Vacuna antirrábica anual',
    fecha: '2025-09-20T10:00:00.000Z',
    veterinario: 'Dr. Manuel Soto',
  },
  {
    id: 'evento-002',
    id_mascota: 'mascota-001',
    tipo: 'control',
    descripcion: 'Control anual: peso 31 kg, sin observaciones',
    fecha: '2025-09-20T10:30:00.000Z',
    veterinario: 'Dr. Manuel Soto',
  },
  {
    id: 'evento-003',
    id_mascota: 'mascota-001',
    tipo: 'tratamiento',
    descripcion: 'Antiinflamatorio por 7 días tras torcedura',
    fecha: '2026-02-08T15:00:00.000Z',
    veterinario: 'Dr. Ignacio Pérez',
  },
  {
    id: 'evento-004',
    id_mascota: 'mascota-002',
    tipo: 'vacuna',
    descripcion: 'Vacuna triple felina, primera dosis',
    fecha: '2025-01-15T09:00:00.000Z',
    veterinario: 'Dra. Carla Rojas',
  },
  {
    id: 'evento-005',
    id_mascota: 'mascota-002',
    tipo: 'cirugia',
    descripcion: 'Esterilización sin complicaciones',
    fecha: '2025-06-03T08:00:00.000Z',
    veterinario: 'Dra. Carla Rojas',
  },
  {
    id: 'evento-006',
    id_mascota: 'mascota-002',
    tipo: 'control',
    descripcion: 'Control post operatorio, retiro de puntos',
    fecha: '2025-06-13T11:00:00.000Z',
    veterinario: 'Dra. Carla Rojas',
  },
];
