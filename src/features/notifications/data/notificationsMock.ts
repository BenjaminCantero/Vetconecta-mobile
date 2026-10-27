import type { Notification } from '../domain/Notification';

const originalNotifications: Notification[] = [
  {
    id: 'demo-appointment-005',
    title: 'Reserva de Rocky',
    body: 'Revisa los detalles de su hora de desparasitación con el Dr. Manuel Soto.',
    date: '2026-10-24T12:00:00.000Z',
    read: false,
    petId: 'mascota-001',
    target: { screen: 'appointment', appointmentId: 'cita-005' },
  },
  {
    id: 'demo-health-001',
    title: 'Carnet de Rocky',
    body: 'Consulta sus vacunas y controles registrados antes de su próxima visita.',
    date: '2026-10-23T15:00:00.000Z',
    read: false,
    petId: 'mascota-001',
    target: { screen: 'health', petId: 'mascota-001' },
  },
  {
    id: 'demo-health-002',
    title: 'Cuidados de Luna',
    body: 'El historial de Luna reúne sus atenciones y tratamientos registrados.',
    date: '2026-10-22T10:00:00.000Z',
    read: true,
    petId: 'mascota-002',
    target: { screen: 'health', petId: 'mascota-002' },
  },
];

// Avisos adicionales para comprobar la paginación local de E3.
// Todos pertenecen a Rocky, de modo que el filtro por mascota
// permita probar la carga de una segunda página.
const paginationTestNotifications: Notification[] = Array.from({ length: 15 }, (_, index) => ({
  id: `demo-pagination-${String(index + 1).padStart(3, '0')}`,
  title: `Recordatorio de Rocky ${index + 1}`,
  body: `Aviso de demostración ${index + 1} para comprobar la paginación del centro de notificaciones.`,
  date: new Date(Date.UTC(2026, 9, 21, 12, 0, 0) - index * 60 * 60 * 1000).toISOString(),
  read: index % 3 === 0,
  petId: 'mascota-001',
}));

export const notificationsMock: Notification[] = [
  ...originalNotifications,
  ...paginationTestNotifications,
];
