// Responsabilidad: tipos request/response de la API de auth (capa DATA).
// Forma cruda de los datos tal cual los entrega el backend, antes de
// mapearlos a entidades del dominio.

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  user: {
    id: string;
    nombre: string;
    email: string;
  };
}
