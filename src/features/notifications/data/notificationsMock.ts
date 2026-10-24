import type { Notification } from '../domain/Notification';

export const notificationsMock: Notification[] = [
  {
    id: 'demo-appointment-005',
    title: 'Reserva de Rocky',
    body: 'Revisa los detalles de su hora de desparasitación con el Dr. Manuel Soto.',
    date: '2026-10-24T12:00:00.000Z',
    read: false,
    target: { screen: 'appointment', appointmentId: 'cita-005' },
  },
  {
    id: 'demo-health-001',
    title: 'Carnet de Rocky',
    body: 'Consulta sus vacunas y controles registrados antes de su próxima visita.',
    date: '2026-10-23T15:00:00.000Z',
    read: false,
    target: { screen: 'health', petId: 'mascota-001' },
  },
  {
    id: 'demo-health-002',
    title: 'Cuidados de Luna',
    body: 'El historial de Luna reúne sus atenciones y tratamientos registrados.',
    date: '2026-10-22T10:00:00.000Z',
    read: true,
    target: { screen: 'health', petId: 'mascota-002' },
  },
];
