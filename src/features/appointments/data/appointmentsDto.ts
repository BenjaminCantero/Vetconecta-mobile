// Responsabilidad: tipos response de la API de citas (capa DATA).

export interface AppointmentRatingDto {
  estrellas: number;
  comentario?: string | null;
}

export interface AppointmentDto {
  id: string;
  id_mascota: string;
  fecha: string;
  motivo: string;
  estado: string;
  veterinario: string;

  // Indica si la cita ya fue calificada.
  calificada?: boolean;

  // Información de la calificación registrada.
  calificacion?: AppointmentRatingDto | null;
}

// Datos enviados al crear una calificación.
export interface CreateRatingDto {
  citaId: string;
  estrellas: 1 | 2 | 3 | 4 | 5;
  comentario?: string;
}
