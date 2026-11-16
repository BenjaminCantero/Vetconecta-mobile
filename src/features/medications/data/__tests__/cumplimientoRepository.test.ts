// Pruebas del registro de cumplimiento guardado solo en el dispositivo (H2, BR-10).

import AsyncStorage from '@react-native-async-storage/async-storage';

import { httpClient } from '../../../../core/api/httpClient';
import { clearSessionData } from '../../../../core/storage/sessionStorage';
import { cumplimientoRepository } from '../cumplimientoRepository';

jest.mock('../../../../core/api/httpClient', () => ({
  httpClient: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn() },
}));

beforeEach(async () => {
  await AsyncStorage.clear();
});

it('guarda la toma por cuenta y avisa a los suscriptores', async () => {
  const listener = jest.fn();
  const unsubscribe = cumplimientoRepository.suscribir(listener);

  await cumplimientoRepository.marcarAdministrada('cuenta-1', 'trat@08:00', '08:05');

  expect(await cumplimientoRepository.obtenerRegistro('cuenta-1')).toEqual({
    'trat@08:00': '08:05',
  });
  expect(await cumplimientoRepository.obtenerRegistro('cuenta-2')).toEqual({});
  expect(listener).toHaveBeenCalledTimes(1);
  unsubscribe();
});

it('no pierde tomas marcadas a la vez y conserva la primera hora', async () => {
  await Promise.all([
    cumplimientoRepository.marcarAdministrada('cuenta-1', 'a', '1'),
    cumplimientoRepository.marcarAdministrada('cuenta-1', 'b', '2'),
    cumplimientoRepository.marcarAdministrada('cuenta-1', 'a', '3'),
  ]);

  expect(await cumplimientoRepository.obtenerRegistro('cuenta-1')).toEqual({ a: '1', b: '2' });
});

it('no envía nada al backend (BR-10)', async () => {
  await cumplimientoRepository.marcarAdministrada('cuenta-1', 'a', '1');

  for (const method of Object.values(httpClient)) {
    expect(method).not.toHaveBeenCalled();
  }
});

it('el cierre de sesión no borra el cumplimiento, que no se puede volver a descargar', async () => {
  await cumplimientoRepository.marcarAdministrada('cuenta-1', 'a', '1');

  await clearSessionData();

  expect(await cumplimientoRepository.obtenerRegistro('cuenta-1')).toEqual({ a: '1' });
});
