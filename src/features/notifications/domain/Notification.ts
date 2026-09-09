// Responsabilidad: entidad de negocio Notification (capa DOMAIN de notifications).
// Sin lógica todavía: la API externa aún no expone un endpoint de notificaciones.

export interface Notification {
  id: string;
  title: string;
  body: string;
  date: string; // ISO 8601
  read: boolean;
}
