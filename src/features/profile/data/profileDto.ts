export interface OwnerProfileDto {
  nombres: string;
  apellidos: string;
  rut: string;
  email: string;
  telefono: string;
}

export interface UpdateContactDto {
  email: string;
  telefono: string;
}

export interface ChangePasswordDto {
  password_actual: string;
  password_nueva: string;
}
