// Pruebas de GET /mascotas/:id/tratamientos: mapeo, lista vacía y caché offline (H1).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError, type AxiosResponse } from 'axios';

import { httpClient } from '../../../../core/api/httpClient';
import { asyncStorage, StorageKeys } from '../../../../core/storage/asyncStorage';
import { isOnline } from '../../../../core/network/connectivity';
import { construirPauta } from '../../domain/calcularDosisProgramadas';
import type { TratamientoDto } from '../tratamientoDto';
import { toTratamiento } from '../tratamientoMapper';
import { tratamientosService } from '../tratamientosService';

jest.mock('../../../../core/config/env', () => ({
  ENV: { API_BASE_URL: 'http://test', API_TIMEOUT_MS: 1000, USE_MOCKS: false },
}));

jest.mock('../../../../core/network/connectivity', () => ({
  isOnline: jest.fn(),
}));

jest.mock('../../../../core/api/httpClient', () => ({
  httpClient: { get: jest.fn() },
}));

const online = isOnline as jest.Mock;
const get = httpClient.get as jest.Mock;

const dto: TratamientoDto = {
  id: 'tratamiento-1',
  id_mascota: 'mascota-1',
  medicamento: 'Amoxicilina 250 mg',
  dosis: '1 comprimido',
  frecuencia_horas: 8,
  fecha_inicio: '2026-11-16T08:00:00.000Z',
  duracion_dias: 5,
  indicaciones: 'Con comida',
  id_evento_clinico: 'evento-1',
};

beforeEach(async () => {
  await AsyncStorage.clear();
  await asyncStorage.setItem(StorageKeys.AUTH_USER, { id: 'user-1' });
  online.mockResolvedValue(true);
  get.mockReset();
});

it('pide la pauta de la mascota y la mapea a Tratamiento', async () => {
  get.mockResolvedValue({ data: [dto] });

  const pauta = await tratamientosService.obtenerPauta('mascota-1');

  expect(get).toHaveBeenCalledWith('/mascotas/mascota-1/tratamientos');
  expect(pauta).toEqual([
    {
      id: 'tratamiento-1',
      petId: 'mascota-1',
      medication: 'Amoxicilina 250 mg',
      dose: '1 comprimido',
      frequencyHours: 8,
      startAt: '2026-11-16T08:00:00.000Z',
      durationDays: 5,
      instructions: 'Con comida',
      clinicalEventId: 'evento-1',
    },
  ]);
  expect(construirPauta(pauta)[0].scheduledDoses).toHaveLength(15);
});

it.each([[[]], [null], ['']])(
  'sin tratamientos (%p) devuelve lista vacía sin error',
  async (body) => {
    get.mockResolvedValue({ data: body });

    await expect(tratamientosService.obtenerPauta('mascota-1')).resolves.toEqual([]);
  },
);

it('sin conexión devuelve la última pauta guardada', async () => {
  get.mockResolvedValue({ data: [dto] });
  await tratamientosService.obtenerPauta('mascota-1');
  online.mockResolvedValue(false);
  get.mockClear();

  const snapshot = await tratamientosService.obtenerPautaSnapshot('mascota-1');

  expect(get).not.toHaveBeenCalled();
  expect(snapshot.fromCache).toBe(true);
  expect(snapshot.data).toHaveLength(1);
});

it('sin conexión y sin pauta guardada informa el problema', async () => {
  online.mockResolvedValue(false);

  await expect(tratamientosService.obtenerPauta('mascota-1')).rejects.toThrow(
    'Esta pauta aún no está guardada',
  );
});

it('no mezcla la pauta guardada de otra mascota', async () => {
  get.mockResolvedValue({ data: [dto] });
  await tratamientosService.obtenerPauta('mascota-1');
  online.mockResolvedValue(false);

  await expect(tratamientosService.obtenerPauta('mascota-2')).rejects.toThrow('Sin conexión');
});

it('traduce un error del servidor a un mensaje mostrable', async () => {
  get.mockRejectedValue(
    new AxiosError('error', '500', undefined, undefined, { status: 500 } as AxiosResponse),
  );

  await expect(tratamientosService.obtenerPauta('mascota-1')).rejects.toThrow(
    'No se pudo cargar la pauta de tratamiento',
  );
});

it('el mapper acepta números como texto y completa campos opcionales', () => {
  const tratamiento = toTratamiento({
    ...dto,
    frecuencia_horas: '12' as unknown as number,
    duracion_dias: '7' as unknown as number,
    indicaciones: undefined,
    id_evento_clinico: undefined,
  });

  expect(tratamiento.frequencyHours).toBe(12);
  expect(tratamiento.durationDays).toBe(7);
  expect(tratamiento.instructions).toBe('');
  expect(tratamiento.clinicalEventId).toBeNull();
});
