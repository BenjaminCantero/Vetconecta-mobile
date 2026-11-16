// Responsabilidad: programar los recordatorios de dosis como notificaciones
// locales del dispositivo (capa DATA, H2). Adapta el contrato del dominio a
// core/notifications/localNotifications.

import {
  cancelLocalNotification,
  setNotificationActions,
  syncScheduledNotifications,
} from '../../../core/notifications/localNotifications';
import {
  ACCION_ADMINISTRADA,
  CATEGORIA_DOSIS,
  PREFIJO_RECORDATORIO,
} from '../domain/planificarRecordatorios';
import type { RecordatoriosScheduler } from '../domain/recordatoriosMedicamentos';

// iOS exige registrar la categoría antes de que se muestre la notificación;
// basta con hacerlo una vez por ejecución de la app.
let categoryReady: Promise<void> | null = null;

export function prepararAccionesRecordatorio(): Promise<void> {
  categoryReady ??= setNotificationActions(CATEGORIA_DOSIS, [
    { id: ACCION_ADMINISTRADA, title: 'Administrada' },
  ]).catch((error) => {
    categoryReady = null;
    throw error;
  });

  return categoryReady;
}

export const recordatoriosScheduler: RecordatoriosScheduler = {
  async programar(recordatorios) {
    await prepararAccionesRecordatorio();
    await syncScheduledNotifications(PREFIJO_RECORDATORIO, recordatorios);
  },

  cancelar: cancelLocalNotification,
};
