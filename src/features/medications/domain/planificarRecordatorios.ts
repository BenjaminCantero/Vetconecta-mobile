// Responsabilidad: decidir qué recordatorios locales programar (capa DOMAIN, H2).
// Función pura: recibe las pautas de todas las mascotas y devuelve las
// notificaciones a dejar programadas.
//
// iOS admite como máximo 64 notificaciones programadas por app. Una pauta
// cada 8 h durante 30 días ya son 90 tomas, así que se programa por ventanas:
// solo las tomas de los próximos `ventanaHoras`, con un tope total. Cada vez
// que la app vuelve a primer plano la ventana avanza y se programan las
// siguientes.

import { claveDosis, type RegistroCumplimiento } from './checklistDosis';
import type { PautaTratamiento } from './Tratamiento';

export const PREFIJO_RECORDATORIO = 'dosis:';
export const CATEGORIA_DOSIS = 'dosis';
export const ACCION_ADMINISTRADA = 'administrada';

export const VENTANA_HORAS = 72;
// Margen bajo el límite de 64 de iOS.
export const MAXIMO_RECORDATORIOS = 60;

export interface PautaMascota {
  petId: string;
  petName: string;
  pauta: PautaTratamiento[];
}

// Datos que viajan en la notificación. Bastan para marcar la dosis desde el
// botón "Administrada" sin abrir la app (ni consultar la sesión).
export interface DatosRecordatorio {
  tipo: 'dosis';
  accountId: string;
  petId: string;
  tratamientoId: string;
  at: string;
  [key: string]: string;
}

export interface Recordatorio {
  id: string;
  at: string;
  title: string;
  body: string;
  data: DatosRecordatorio;
  categoryId: string;
}

interface Opciones {
  ventanaHoras?: number;
  maximo?: number;
}

export function idRecordatorio(tratamientoId: string, at: string): string {
  return `${PREFIJO_RECORDATORIO}${claveDosis(tratamientoId, at)}`;
}

export function textoRecordatorio(medicamento: string, dosis: string, mascota: string): string {
  return `Hora de dar ${medicamento} ${dosis} a ${mascota}`;
}

export function planificarRecordatorios(
  accountId: string,
  mascotas: PautaMascota[],
  registro: RegistroCumplimiento,
  now: number,
  { ventanaHoras = VENTANA_HORAS, maximo = MAXIMO_RECORDATORIOS }: Opciones = {},
): Recordatorio[] {
  const limite = now + ventanaHoras * 60 * 60 * 1000;
  const recordatorios: Recordatorio[] = [];

  for (const { petId, petName, pauta } of mascotas) {
    for (const tratamiento of pauta) {
      for (const at of tratamiento.scheduledDoses) {
        const time = new Date(at).getTime();

        if (time <= now || time > limite || registro[claveDosis(tratamiento.id, at)]) {
          continue;
        }

        recordatorios.push({
          id: idRecordatorio(tratamiento.id, at),
          at,
          title: 'Recordatorio de medicamento',
          body: textoRecordatorio(tratamiento.medication, tratamiento.dose, petName),
          data: { tipo: 'dosis', accountId, petId, tratamientoId: tratamiento.id, at },
          categoryId: CATEGORIA_DOSIS,
        });
      }
    }
  }

  // Si hay más tomas que cupos, se priorizan las más cercanas.
  return recordatorios
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
    .slice(0, maximo);
}

// Lee los datos de una notificación recibida. null si no es un recordatorio de dosis.
export function leerDatosRecordatorio(data: Record<string, unknown>): DatosRecordatorio | null {
  const { tipo, accountId, petId, tratamientoId, at } = data;

  if (
    tipo !== 'dosis' ||
    typeof accountId !== 'string' ||
    typeof petId !== 'string' ||
    typeof tratamientoId !== 'string' ||
    typeof at !== 'string'
  ) {
    return null;
  }

  return { tipo, accountId, petId, tratamientoId, at };
}
