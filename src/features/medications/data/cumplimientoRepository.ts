// Responsabilidad: guardar el cumplimiento de las tomas SOLO en el dispositivo (capa DATA, H2).
// BR-10: este registro es una ayuda para el dueño. No se envía al backend ni
// modifica el registro clínico oficial que ve la clínica en el panel.
//
// Clave: @vetconecta/cumplimiento:{cuenta} → { "tratamiento@hora": "marcada a las..." }.
// Va separado por cuenta para no mezclar dueños en un mismo teléfono. No usa
// el prefijo `cache:`, así que no se borra al cerrar sesión: es lo único que
// queda del cumplimiento y no se puede volver a descargar.

import AsyncStorage from '@react-native-async-storage/async-storage';

import { getCurrentAccountId } from '../../../core/storage/sessionStorage';
import type { ClaveDosis, RegistroCumplimiento } from '../domain/checklistDosis';
import type { CumplimientoRepository } from '../domain/recordatoriosMedicamentos';

const KEY_PREFIX = '@vetconecta/cumplimiento:';

const listeners = new Set<() => void>();

// Las escrituras se encadenan: la pantalla y el botón de la notificación pueden
// marcar a la vez, y leer-modificar-escribir en paralelo perdería una de las dos.
let queue: Promise<unknown> = Promise.resolve();

function storageKey(accountId: string): string {
  return `${KEY_PREFIX}${accountId}`;
}

async function obtenerRegistro(accountId: string): Promise<RegistroCumplimiento> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(accountId));
    const parsed: unknown = raw ? JSON.parse(raw) : null;

    return parsed && typeof parsed === 'object' ? (parsed as RegistroCumplimiento) : {};
  } catch (error) {
    console.error('[cumplimiento] error leyendo el registro:', error);
    return {};
  }
}

function marcarAdministrada(
  accountId: string,
  clave: ClaveDosis,
  administradaAt: string,
): Promise<void> {
  const write = queue.then(async () => {
    const registro = await obtenerRegistro(accountId);

    // Marcar dos veces conserva la primera hora registrada.
    if (registro[clave]) return;

    await AsyncStorage.setItem(
      storageKey(accountId),
      JSON.stringify({ ...registro, [clave]: administradaAt }),
    );
    listeners.forEach((listener) => listener());
  });

  queue = write.catch(() => undefined);

  return write;
}

export const cumplimientoRepository: CumplimientoRepository = {
  cuentaActual: getCurrentAccountId,
  obtenerRegistro,
  marcarAdministrada,

  suscribir(listener) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  },
};
