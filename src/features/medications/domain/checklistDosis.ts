// Responsabilidad: reglas del checklist de dosis (capa DOMAIN de medications, H2).
// Cruza las dosis programadas (H1) con el cumplimiento registrado en el
// dispositivo para decidir el estado de cada toma.
//
// BR-10: el cumplimiento es solo un apoyo para el dueño. Vive en el teléfono,
// no se envía al backend y no modifica el registro clínico oficial.

import type { PautaTratamiento } from './Tratamiento';

export type EstadoDosis = 'pendiente' | 'administrada' | 'atrasada';

// Clave de una toma: tratamiento + hora programada.
export type ClaveDosis = string;

// Tomas marcadas como administradas: clave → fecha y hora en que se marcó (ISO).
export type RegistroCumplimiento = Record<ClaveDosis, string>;

// Una toma sigue "pendiente" hasta 30 min después de su hora; luego, "atrasada".
export const TOLERANCIA_ATRASO_MS = 30 * 60 * 1000;

// Se puede marcar una toma hasta 1 h antes de su hora (ej. si se adelantó).
export const ANTICIPACION_MARCADO_MS = 60 * 60 * 1000;

export interface DosisChecklist {
  key: ClaveDosis;
  tratamientoId: string;
  at: string;
  estado: EstadoDosis;
  administradaAt: string | null;
  puedeMarcar: boolean;
}

export interface TratamientoChecklist {
  tratamiento: PautaTratamiento;
  dosis: DosisChecklist[];
  administradas: number;
  total: number;
}

export function claveDosis(tratamientoId: string, at: string): ClaveDosis {
  return `${tratamientoId}@${at}`;
}

export function estadoDosis(at: string, administradaAt: string | null, now: number): EstadoDosis {
  if (administradaAt) return 'administrada';

  return now > new Date(at).getTime() + TOLERANCIA_ATRASO_MS ? 'atrasada' : 'pendiente';
}

export function construirChecklist(
  pauta: PautaTratamiento[],
  registro: RegistroCumplimiento,
  now: number,
): TratamientoChecklist[] {
  return pauta.map((tratamiento) => {
    const dosis = tratamiento.scheduledDoses.map((at): DosisChecklist => {
      const key = claveDosis(tratamiento.id, at);
      const administradaAt = registro[key] ?? null;

      return {
        key,
        tratamientoId: tratamiento.id,
        at,
        estado: estadoDosis(at, administradaAt, now),
        administradaAt,
        puedeMarcar: !administradaAt && new Date(at).getTime() - now <= ANTICIPACION_MARCADO_MS,
      };
    });

    return {
      tratamiento,
      dosis,
      administradas: dosis.filter((item) => item.estado === 'administrada').length,
      total: dosis.length,
    };
  });
}
