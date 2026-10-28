// Datos personales que pertenecen al perfil del cliente, no a la identidad
// de autenticación. RUT y datos clínicos no se exponen para edición aquí.
export interface OwnerProfile {
  fullName: string;
  rut: string;
  email: string;
  phone: string;
}
