// Responsabilidad: tipos request/response de la API de auth (capa DATA).
//
// Forma cruda de los datos tal cual los entrega el backend,
// antes de mapearlos a entidades del dominio.

// -----------------------------------------------------------------------------
// LOGIN
// -----------------------------------------------------------------------------

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;

  user: {
    id: string;
    email: string;
    role: 'owner' | 'vet' | 'reception' | 'admin';
    clientId?: string;
  };
}

// -----------------------------------------------------------------------------
// REGISTRO DE DUEÑO
// -----------------------------------------------------------------------------
//
// Endpoint público:
//
// POST /v1/auth/register
//
// RUT, nombres, apellidos y teléfono pertenecen finalmente al dominio
// clients-pets-service.
//
// Mobile no llama directamente a ambos microservicios.
// auth-service coordina internamente la creación del perfil.

export interface RegisterRequestDto {
  nombres: string;
  apellidos: string;
  rut: string;
  email: string;
  telefono: string;
  password: string;
}

export interface RegisterResponseDto {
  id: string;
  email: string;
  message?: string;
}

// -----------------------------------------------------------------------------
// RECUPERACIÓN DE CONTRASEÑA
// -----------------------------------------------------------------------------
//
// Endpoint público:
//
// POST /v1/auth/password-reset
//
// Mobile solicita la recuperación únicamente a auth-service.
// El envío del correo se coordina internamente con notifications-service.

export interface PasswordResetRequestDto {
  email: string;
}

export interface PasswordResetResponseDto {
  message: string;
}
