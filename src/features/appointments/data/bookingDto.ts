// Responsabilidad: tipos request/response de la API de reservas (capa DATA).
// La respuesta de POST /citas y PATCH /citas/:id/cancelar es una cita
// (`AppointmentDto`).

export interface BookingRequestDto {
  id_mascota: string;
  id_veterinario: string;
  id_especialidad: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
}

// Forma esperada del cuerpo de error 400; el backend puede omitirlo.
export interface BookingErrorDto {
  mensaje?: string;
}
