// Responsabilidad: mapear TratamientoDto a la entidad Tratamiento (capa DATA).
// El backend podría enviar números como texto; se convierten aquí para que el
// cálculo de dosis del dominio siempre reciba números. Un valor no numérico
// queda en 0 y el dominio no programa dosis para esa pauta.

import type { Tratamiento } from '../domain/Tratamiento';
import type { TratamientoDto } from './tratamientoDto';

function toNumber(value: unknown): number {
  const parsed = typeof value === 'string' ? Number(value) : value;

  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : 0;
}

export function toTratamiento(dto: TratamientoDto): Tratamiento {
  return {
    id: dto.id,
    petId: dto.id_mascota,
    medication: dto.medicamento,
    dose: dto.dosis,
    frequencyHours: toNumber(dto.frecuencia_horas),
    startAt: dto.fecha_inicio,
    durationDays: toNumber(dto.duracion_dias),
    instructions: dto.indicaciones ?? '',
    clinicalEventId: dto.id_evento_clinico ?? null,
  };
}
