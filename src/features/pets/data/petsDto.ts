// Responsabilidad: tipos response de la API de pets (capa DATA).
// Forma cruda tal cual la entrega el backend, antes de mapear a entidades.

export interface PetDto {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  fecha_nacimiento: string;
  id_dueno: string;
}

export interface ClinicalEventDto {
  id: string;
  id_mascota: string;
  tipo: string;
  descripcion: string;
  fecha: string;
  veterinario: string;
}
