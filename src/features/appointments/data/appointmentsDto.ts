// Responsabilidad: tipos response de la API de citas (capa DATA).

export interface AppointmentDto {
  id: string;
  id_mascota: string;
  fecha: string;
  motivo: string;
  estado: string;
  veterinario: string;
}
