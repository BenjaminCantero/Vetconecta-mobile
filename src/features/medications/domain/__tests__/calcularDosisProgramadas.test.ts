// Pruebas del cálculo de dosis programadas de una pauta de tratamiento (H1).

import { calcularDosisProgramadas } from '../calcularDosisProgramadas';
import type { Tratamiento } from '../Tratamiento';

function tratamiento(overrides: Partial<Tratamiento> = {}): Tratamiento {
  return {
    id: 'tratamiento-1',
    petId: 'mascota-1',
    medication: 'Amoxicilina 250 mg',
    dose: '1 comprimido',
    frequencyHours: 8,
    startAt: '2026-11-16T08:00:00.000Z',
    durationDays: 5,
    instructions: 'Con comida',
    clinicalEventId: 'evento-1',
    ...overrides,
  };
}

it('cada 8 h durante 5 días programa 15 dosis', () => {
  const dosis = calcularDosisProgramadas(tratamiento());

  expect(dosis).toHaveLength(15);
  expect(dosis[0]).toBe('2026-11-16T08:00:00.000Z');
  expect(dosis[1]).toBe('2026-11-16T16:00:00.000Z');
  expect(dosis[14]).toBe('2026-11-21T00:00:00.000Z');
});

it('cada 12 h durante 7 días programa 14 dosis', () => {
  expect(
    calcularDosisProgramadas(tratamiento({ frequencyHours: 12, durationDays: 7 })),
  ).toHaveLength(14);
});

it('cada 24 h durante 3 días programa una dosis diaria a la misma hora', () => {
  expect(calcularDosisProgramadas(tratamiento({ frequencyHours: 24, durationDays: 3 }))).toEqual([
    '2026-11-16T08:00:00.000Z',
    '2026-11-17T08:00:00.000Z',
    '2026-11-18T08:00:00.000Z',
  ]);
});

it('si la frecuencia no divide la duración, solo cuenta las tomas dentro del periodo', () => {
  // 24 h cada 7 h: tomas a las 0, 7, 14 y 21 h; la de las 28 h queda fuera.
  expect(
    calcularDosisProgramadas(tratamiento({ frequencyHours: 7, durationDays: 1 })),
  ).toHaveLength(4);
});

it('acepta frecuencias en minutos sin errores de redondeo (pauta de prueba)', () => {
  // Cada 2 min durante 30 min = 15 tomas, exactas al minuto.
  const dosis = calcularDosisProgramadas(
    tratamiento({ frequencyHours: 2 / 60, durationDays: 30 / (24 * 60) }),
  );

  expect(dosis).toHaveLength(15);
  expect(dosis[1]).toBe('2026-11-16T08:02:00.000Z');
  expect(dosis[14]).toBe('2026-11-16T08:28:00.000Z');
});

it('respeta la zona horaria de la hora de inicio', () => {
  const dosis = calcularDosisProgramadas(
    tratamiento({ startAt: '2026-11-16T20:00:00-03:00', frequencyHours: 12, durationDays: 1 }),
  );

  expect(dosis).toEqual(['2026-11-16T23:00:00.000Z', '2026-11-17T11:00:00.000Z']);
});

it.each([
  ['frecuencia cero', { frequencyHours: 0 }],
  ['frecuencia negativa', { frequencyHours: -8 }],
  ['duración cero', { durationDays: 0 }],
  ['fecha de inicio inválida', { startAt: 'no-es-fecha' }],
])('con %s no programa dosis', (_caso, overrides) => {
  expect(calcularDosisProgramadas(tratamiento(overrides))).toEqual([]);
});
