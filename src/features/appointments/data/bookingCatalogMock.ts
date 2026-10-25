// Responsabilidad: catálogo temporal para el flujo de reserva (DATA).
// Se reemplazará por los repositorios de especialidades y veterinarios
// cuando el backend publique sus endpoints.

export interface BookingSpecialty {
  id: string;
  name: string;
}

export interface BookingVeterinarian {
  id: string;
  name: string;
  specialtyIds: string[];
}

export const bookingSpecialtiesMock: BookingSpecialty[] = [
  { id: 'mock-general', name: 'Medicina general' },
  { id: 'mock-vaccination', name: 'Vacunación' },
  { id: 'mock-dermatology', name: 'Dermatología' },
];

export const bookingVeterinariansMock: BookingVeterinarian[] = [
  {
    id: 'mock-vet-carla',
    name: 'Dra. Carla Rojas',
    specialtyIds: ['mock-general', 'mock-vaccination'],
  },
  {
    id: 'mock-vet-manuel',
    name: 'Dr. Manuel Soto',
    specialtyIds: ['mock-general', 'mock-vaccination'],
  },
  {
    id: 'mock-vet-ignacio',
    name: 'Dr. Ignacio Pérez',
    specialtyIds: ['mock-dermatology'],
  },
];
