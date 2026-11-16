// Responsabilidad: casos de uso del recordatorio de medicamentos (capa DOMAIN, H2).
// Define los contratos que implementa la capa data/core y ordena los pasos:
//  - sincronizar: descargar (o leer de caché) la pauta de cada mascota y dejar
//    programados los recordatorios de la próxima ventana.
//  - marcar: guardar una toma como administrada y quitar su recordatorio.
//  - acción rápida: el botón "Administrada" de la notificación marca la toma.
//
// Ninguno de estos pasos llama al backend para escribir (BR-10).

import type { ClaveDosis, RegistroCumplimiento } from './checklistDosis';
import { claveDosis } from './checklistDosis';
import {
  ACCION_ADMINISTRADA,
  idRecordatorio,
  leerDatosRecordatorio,
  planificarRecordatorios,
  type PautaMascota,
  type Recordatorio,
} from './planificarRecordatorios';
import { construirPauta } from './calcularDosisProgramadas';
import type { TratamientosRepository } from './usePautaTratamiento';

export interface CumplimientoRepository {
  // Cuenta con sesión iniciada; null si no hay sesión.
  cuentaActual: () => Promise<string | null>;
  obtenerRegistro: (accountId: string) => Promise<RegistroCumplimiento>;
  marcarAdministrada: (
    accountId: string,
    clave: ClaveDosis,
    administradaAt: string,
  ) => Promise<void>;
  // Avisa cuando cambia el registro (ej. se marcó una toma desde la notificación).
  suscribir: (listener: () => void) => () => void;
}

export interface RecordatoriosScheduler {
  // Deja programados exactamente estos recordatorios de dosis (cancela el resto).
  programar: (recordatorios: Recordatorio[]) => Promise<void>;
  cancelar: (id: string) => Promise<void>;
}

export interface MascotaRecordatorio {
  id: string;
  name: string;
}

interface SincronizarParams {
  mascotas: MascotaRecordatorio[];
  tratamientos: TratamientosRepository;
  cumplimiento: CumplimientoRepository;
  scheduler: RecordatoriosScheduler;
  now?: () => number;
  // Corta antes de programar si la sesión terminó mientras se esperaba.
  isCancelled?: () => boolean;
}

export type ResultadoSincronizacion = 'programado' | 'sin-sesion' | 'cancelado' | 'error';

export async function sincronizarRecordatorios({
  mascotas,
  tratamientos,
  cumplimiento,
  scheduler,
  now = Date.now,
  isCancelled = () => false,
}: SincronizarParams): Promise<ResultadoSincronizacion> {
  try {
    const accountId = await cumplimiento.cuentaActual();

    if (!accountId) return 'sin-sesion';

    // Si falla la pauta de alguna mascota (ej. sin red y sin caché) no se toca
    // lo ya programado: es preferible un recordatorio viejo a ninguno.
    const pautas: PautaMascota[] = await Promise.all(
      mascotas.map(async (mascota) => ({
        petId: mascota.id,
        petName: mascota.name,
        pauta: construirPauta((await tratamientos.obtenerPautaSnapshot(mascota.id)).data),
      })),
    );
    const registro = await cumplimiento.obtenerRegistro(accountId);

    if (isCancelled()) return 'cancelado';

    await scheduler.programar(planificarRecordatorios(accountId, pautas, registro, now()));

    return 'programado';
  } catch (error) {
    console.error('[recordatorios] no se pudieron programar:', error);
    return 'error';
  }
}

export async function marcarDosisAdministrada(
  { accountId, tratamientoId, at }: { accountId: string; tratamientoId: string; at: string },
  cumplimiento: CumplimientoRepository,
  scheduler: RecordatoriosScheduler,
  now: () => number = Date.now,
): Promise<void> {
  await cumplimiento.marcarAdministrada(
    accountId,
    claveDosis(tratamientoId, at),
    new Date(now()).toISOString(),
  );
  // Si se marcó antes de la hora, el recordatorio ya no debe sonar; si ya sonó,
  // se quita de la bandeja.
  await scheduler.cancelar(idRecordatorio(tratamientoId, at));
}

// Botón "Administrada" de la notificación. Usa la cuenta guardada en la propia
// notificación: puede ejecutarse con la app cerrada, sin pantalla ni sesión cargada.
export async function manejarAccionRecordatorio(
  event: { actionId: string; data: Record<string, unknown> },
  cumplimiento: CumplimientoRepository,
  scheduler: RecordatoriosScheduler,
  now: () => number = Date.now,
): Promise<boolean> {
  if (event.actionId !== ACCION_ADMINISTRADA) return false;

  const datos = leerDatosRecordatorio(event.data);

  if (!datos) return false;

  await marcarDosisAdministrada(datos, cumplimiento, scheduler, now);

  return true;
}
