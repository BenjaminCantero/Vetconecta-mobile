// Pruebas unitarias de la regla de navegación al tocar una notificación push.

import { resolveNotificationTarget } from '../NotificationTarget';

describe('resolveNotificationTarget', () => {
  it('con citaId abre esa cita', () => {
    expect(resolveNotificationTarget({ citaId: 'cita-005' })).toEqual({
      screen: 'appointment',
      appointmentId: 'cita-005',
    });
  });

  it('acepta un citaId numérico', () => {
    expect(resolveNotificationTarget({ citaId: 42 })).toEqual({
      screen: 'appointment',
      appointmentId: '42',
    });
  });

  it('ignora espacios alrededor del citaId', () => {
    expect(resolveNotificationTarget({ citaId: '  cita-001 ' })).toEqual({
      screen: 'appointment',
      appointmentId: 'cita-001',
    });
  });

  it('sin citaId abre el centro de notificaciones', () => {
    expect(resolveNotificationTarget({ tipo: 'control' })).toEqual({ screen: 'center' });
  });

  it('con citaId vacío o inválido abre el centro de notificaciones', () => {
    expect(resolveNotificationTarget({ citaId: '   ' })).toEqual({ screen: 'center' });
    expect(resolveNotificationTarget({ citaId: { id: 'x' } })).toEqual({ screen: 'center' });
  });

  it('sin datos abre el centro de notificaciones', () => {
    expect(resolveNotificationTarget(undefined)).toEqual({ screen: 'center' });
    expect(resolveNotificationTarget(null)).toEqual({ screen: 'center' });
  });
});
