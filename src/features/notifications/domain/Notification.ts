// Entidad de negocio Notification (DOMAIN).
// petId vincula cada aviso a la mascota del dueño (F1).
export interface Notification {
  id: string;
  title: string;
  body: string;
  date: string; // ISO 8601
  read: boolean;
  petId?: string | null;
  target?:
    | { screen: 'appointment'; appointmentId: string }
    | { screen: 'health'; petId: string };
}
