// Responsabilidad: entidad de negocio del usuario autenticado.
//
// Capa DOMAIN de auth.
//
// Representa únicamente la identidad necesaria para autenticación
// y autorización.
//
// Los datos personales como nombre, RUT, teléfono y dirección
// pertenecen al dominio de clientes/perfil (clients-pets),
// no al dominio de autenticación.

export type UserRole = 'owner' | 'vet' | 'reception' | 'admin';

export interface User {
  id: string;

  email: string;

  role: UserRole;

  // Solo existe para usuarios con rol "owner".
  // Corresponde al identificador del cliente asociado
  // en clients-pets-service.
  clientId?: string;
}
