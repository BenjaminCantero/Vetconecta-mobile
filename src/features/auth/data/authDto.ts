// Responsabilidad: tipos request/response de la API de auth (capa DATA).
//
// Forma cruda de los datos tal cual los entrega el backend,
// antes de mapearlos a entidades del dominio.

// -----------------------------------------------------------------------------
// LOGIN
// -----------------------------------------------------------------------------
//
// Endpoint público:
//
// POST /v1/auth/login
//
// auth-service identifica al usuario con `identifier`, que puede ser
// correo electrónico o RUT. Mobile envía el correo en ese campo.
//
// La respuesta trae los datos del usuario en la raíz (no dentro de `user`) y
// todavía no incluye refresh token ni clientId.

export interface LoginRequestDto {
  identifier: string;
  password: string;
}

export interface LoginResponseDto {
  id: string;
  email: string;
  role: 'owner' | 'vet' | 'reception' | 'admin';
  accessToken: string;

  // Opcional: auth-service aún no resuelve el cliente asociado.
  clientId?: string;
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
//
// Pendiente: el backend todavía acepta solo email/password y responde con un
// ejemplo, sin crear la cuenta ni el perfil del cliente.

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
//
// Pendiente: el endpoint aún no está implementado en el backend.

export interface PasswordResetRequestDto {
  email: string;
}

export interface PasswordResetResponseDto {
  message: string;
}
