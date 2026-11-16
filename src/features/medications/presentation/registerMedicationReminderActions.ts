// Responsabilidad: conectar el botón "Administrada" de los recordatorios con el
// registro de cumplimiento (capa PRESENTATION de medications, H2).
// Se llama una sola vez desde index.ts, en el ámbito del módulo: con la app
// cerrada, Android carga el bundle en segundo plano solo para ejecutar la
// acción, sin montar ninguna pantalla.
//
// Actúa como composition root: inyecta las implementaciones de data.

import { registerNotificationActionHandler } from '../../../core/notifications/localNotifications';
import { cumplimientoRepository } from '../data/cumplimientoRepository';
import {
  prepararAccionesRecordatorio,
  recordatoriosScheduler,
} from '../data/recordatoriosScheduler';
import { manejarAccionRecordatorio } from '../domain/recordatoriosMedicamentos';

export function registerMedicationReminderActions(): void {
  registerNotificationActionHandler(async (event) => {
    await manejarAccionRecordatorio(event, cumplimientoRepository, recordatoriosScheduler);
  });

  // iOS solo muestra el botón si la categoría ya está registrada.
  prepararAccionesRecordatorio().catch((error) => {
    console.error('[recordatorios] no se pudo registrar la acción "Administrada":', error);
  });
}
