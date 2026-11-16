// Responsabilidad: entidad de negocio Tratamiento (capa DOMAIN de medications).
// Pauta activa de un medicamento indicada en un evento clínico de la mascota
// (FR-9). Las tomas no vienen del backend: se calculan en el dominio con
// `calcularDosisProgramadas` a partir de inicio + frecuencia + duración.

export interface Tratamiento {
  id: string;
  petId: string;
  medication: string;
  dose: string;
  // Cada cuántas horas se administra (ej. 8 = cada 8 h).
  frequencyHours: number;
  // Fecha y hora de la primera toma, ISO 8601.
  startAt: string;
  durationDays: number;
  instructions: string;
  // Evento clínico (consulta, cirugía...) que originó la pauta.
  clinicalEventId: string | null;
}

// Tratamiento con su lista de tomas ya calculada, lista para la UI (H2).
export interface PautaTratamiento extends Tratamiento {
  // Fecha y hora de cada toma, ISO 8601 en UTC, en orden cronológico.
  scheduledDoses: string[];
}
