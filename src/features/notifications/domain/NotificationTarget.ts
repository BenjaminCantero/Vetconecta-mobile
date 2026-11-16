// Responsabilidad: regla de navegación al tocar una notificación (capa DOMAIN de notifications).
// Función pura: recibe los datos personalizados del mensaje push y decide a qué pantalla ir.
//
// Contrato con el backend (Web H1) y con la consola de Firebase:
//  - citaId presente  → se abre esa cita en "Mis citas".
//  - tipo 'dosis'      → recordatorio local de medicamento (H2): se abre el
//                        tratamiento de esa mascota (petId).
//  - sin citaId       → se abre el centro de notificaciones.

export type NotificationTarget =
  | { screen: 'appointment'; appointmentId: string }
  | { screen: 'treatment'; petId: string }
  | { screen: 'center' };

export function resolveNotificationTarget(
  data: Record<string, unknown> | null | undefined,
): NotificationTarget {
  if (data?.tipo === 'dosis' && typeof data.petId === 'string' && data.petId) {
    return { screen: 'treatment', petId: data.petId };
  }

  const raw = data?.citaId;

  // FCM entrega los datos personalizados como texto, pero se acepta un número por si el backend
  // lo envía sin convertir.
  const appointmentId =
    typeof raw === 'string' ? raw.trim() : typeof raw === 'number' ? String(raw) : '';

  return appointmentId ? { screen: 'appointment', appointmentId } : { screen: 'center' };
}
