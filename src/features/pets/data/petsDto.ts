// Responsabilidad: tipos response de la API de pets (capa DATA).
// Forma cruda tal cual la entrega el backend, antes de mapear a entidades.

export interface PetDto {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  fecha_nacimiento: string;
  id_dueno: string;
  // Campos de la ficha clínica. Pendientes de confirmar con el equipo de
  // backend: se declaran opcionales para que la app no falle si no llegan.
  sexo?: string;
  esterilizado?: boolean;
  microchip?: string | null;
  peso_kg?: number | null;
  proximo_control?: string | null;
  foto_url?: string | null;
}

export interface ClinicalEventDto {
  id: string;
  id_mascota: string;
  tipo: string;
  descripcion: string;
  fecha: string;
  veterinario: string;
}
