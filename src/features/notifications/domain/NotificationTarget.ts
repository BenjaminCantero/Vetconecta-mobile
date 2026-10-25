// Responsabilidad: regla de navegación al tocar una notificación (capa DOMAIN de notifications).
// Función pura: recibe los datos personalizados del mensaje push y decide a qué pantalla ir.
//
// Contrato con el backend (Web H1) y con la consola de Firebase:
//  - citaId presente  → se abre esa cita en "Mis citas".
//  - sin citaId       → se abre el centro de notificaciones.

export type NotificationTarget =
  { screen: 'appointment'; appointmentId: string } | { screen: 'center' };

export function resolveNotificationTarget(
  data: Record<string, unknown> | null | undefined,
): NotificationTarget {
  const raw = data?.citaId;

  // FCM entrega los datos personalizados como texto, pero se acepta un número por si el backend
  // lo envía sin convertir.
  const appointmentId =
    typeof raw === 'string' ? raw.trim() : typeof raw === 'number' ? String(raw) : '';

  return appointmentId ? { screen: 'appointment', appointmentId } : { screen: 'center' };
}
