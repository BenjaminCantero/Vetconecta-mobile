// Responsabilidad: forma cruda de GET /mascotas/:id/tratamientos (capa DATA).
// Contrato acordado con Web K1 (pauta de tratamiento). Los campos opcionales
// están pendientes de confirmar: si no llegan, el mapper usa un valor neutro.

export interface TratamientoDto {
  id: string;
  id_mascota: string;
  medicamento: string;
  dosis: string;
  // Cada cuántas horas se administra.
  frecuencia_horas: number;
  // Fecha y hora de la primera toma, ISO 8601 (ej. 2026-11-16T08:00:00-03:00).
  fecha_inicio: string;
  duracion_dias: number;
  indicaciones?: string | null;
  id_evento_clinico?: string | null;
}
