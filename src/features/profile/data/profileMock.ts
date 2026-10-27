import type { OwnerProfileDto } from './profileDto';

// Mock transitorio del contrato Swagger. Será sustituido al conectar K3/I1.
export const ownerProfileMock: OwnerProfileDto = {
  nombres: 'Camila',
  apellidos: 'Rojas',
  rut: '12.345.678-9',
  email: 'camila.rojas@correo.cl',
  telefono: '+56 9 8765 4321',
};

export const MOCK_CURRENT_PASSWORD = 'Vetconecta123';
