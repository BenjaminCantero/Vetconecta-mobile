// Pruebas del checklist de dosis y de la planificación de recordatorios locales (H2).

import { construirPauta } from '../calcularDosisProgramadas';
import { claveDosis, construirChecklist, estadoDosis } from '../checklistDosis';
import {
  ACCION_ADMINISTRADA,
  MAXIMO_RECORDATORIOS,
  planificarRecordatorios,
  textoRecordatorio,
} from '../planificarRecordatorios';
import {
  manejarAccionRecordatorio,
  sincronizarRecordatorios,
  type CumplimientoRepository,
  type RecordatoriosScheduler,
} from '../recordatoriosMedicamentos';
import type { Tratamiento } from '../Tratamiento';

const START = '2026-11-16T08:00:00.000Z';
const HOUR = 60 * 60 * 1000;
const t0 = new Date(START).getTime();

function tratamiento(overrides: Partial<Tratamiento> = {}): Tratamiento {
  return {
    id: 'trat-1',
    petId: 'mascota-1',
    medication: 'Amoxicilina 250 mg',
    dose: '1 comprimido',
    frequencyHours: 8,
    startAt: START,
    durationDays: 5,
    instructions: '',
    clinicalEventId: null,
    ...overrides,
  };
}

function fakeCumplimiento(registro: Record<string, string> = {}): CumplimientoRepository {
  return {
    cuentaActual: jest.fn().mockResolvedValue('cuenta-1'),
    obtenerRegistro: jest.fn().mockResolvedValue(registro),
    marcarAdministrada: jest.fn(async (_cuenta, clave, at) => {
      registro[clave] = at;
    }),
    suscribir: jest.fn(() => () => {}),
  };
}

function fakeScheduler(): RecordatoriosScheduler & {
  programar: jest.Mock;
  cancelar: jest.Mock;
} {
  return { programar: jest.fn().mockResolvedValue(undefined), cancelar: jest.fn() };
}

describe('estado de cada dosis', () => {
  it('es pendiente antes de la hora y durante la tolerancia', () => {
    expect(estadoDosis(START, null, t0 - HOUR)).toBe('pendiente');
    expect(estadoDosis(START, null, t0 + 29 * 60 * 1000)).toBe('pendiente');
  });

  it('pasa a atrasada después de 30 min sin marcar', () => {
    expect(estadoDosis(START, null, t0 + 31 * 60 * 1000)).toBe('atrasada');
  });

  it('marcada es administrada aunque se haya marcado tarde', () => {
    expect(estadoDosis(START, '2026-11-16T12:00:00.000Z', t0 + 10 * HOUR)).toBe('administrada');
  });
});

describe('checklist', () => {
  it('cruza la pauta con el cumplimiento y cuenta las administradas', () => {
    const pauta = construirPauta([tratamiento()]);
    const registro = { [claveDosis('trat-1', START)]: '2026-11-16T08:05:00.000Z' };

    // 17:00: la toma de las 8:00 está marcada, la de las 16:00 sin marcar (> 30 min).
    const [item] = construirChecklist(pauta, registro, t0 + 9 * HOUR);

    expect(item.total).toBe(15);
    expect(item.administradas).toBe(1);
    expect(item.dosis[0]).toMatchObject({ estado: 'administrada', puedeMarcar: false });
    expect(item.dosis[1]).toMatchObject({ estado: 'atrasada', puedeMarcar: true });
    // 00:00 del día siguiente: a 7 h, aún no se puede marcar.
    expect(item.dosis[2]).toMatchObject({ estado: 'pendiente', puedeMarcar: false });
  });

  it('permite marcar una toma hasta 1 h antes de su hora', () => {
    const [item] = construirChecklist(construirPauta([tratamiento()]), {}, t0 - 59 * 60 * 1000);

    expect(item.dosis[0].puedeMarcar).toBe(true);
  });
});

describe('planificar recordatorios', () => {
  it('arma el texto del recordatorio', () => {
    expect(textoRecordatorio('Amoxicilina 250 mg', '1 comprimido', 'Luna')).toBe(
      'Hora de dar Amoxicilina 250 mg 1 comprimido a Luna',
    );
  });

  it('programa solo las tomas futuras de los próximos 3 días que no estén marcadas', () => {
    const pauta = construirPauta([tratamiento()]);
    const marcada = '2026-11-16T16:00:00.000Z';
    const registro = { [claveDosis('trat-1', marcada)]: '2026-11-16T15:50:00.000Z' };

    // 09:00 del día 1: quedan 14 tomas; dentro de 72 h hay 9, una ya marcada.
    const recordatorios = planificarRecordatorios(
      'cuenta-1',
      [{ petId: 'mascota-1', petName: 'Luna', pauta }],
      registro,
      t0 + HOUR,
    );

    expect(recordatorios).toHaveLength(8);
    expect(recordatorios.map((item) => item.at)).not.toContain(START);
    expect(recordatorios.map((item) => item.at)).not.toContain(marcada);
    expect(recordatorios[0]).toMatchObject({
      id: 'dosis:trat-1@2026-11-17T00:00:00.000Z',
      body: 'Hora de dar Amoxicilina 250 mg 1 comprimido a Luna',
      categoryId: 'dosis',
      data: {
        tipo: 'dosis',
        accountId: 'cuenta-1',
        petId: 'mascota-1',
        tratamientoId: 'trat-1',
        at: '2026-11-17T00:00:00.000Z',
      },
    });
  });

  it('respeta el límite de iOS priorizando las tomas más cercanas', () => {
    // Cada 1 h durante 3 días en dos mascotas = 144 tomas en la ventana.
    const pauta = (id: string) =>
      construirPauta([tratamiento({ id, frequencyHours: 1, durationDays: 3 })]);
    const recordatorios = planificarRecordatorios(
      'cuenta-1',
      [
        { petId: 'a', petName: 'Rocky', pauta: pauta('trat-a') },
        { petId: 'b', petName: 'Luna', pauta: pauta('trat-b') },
      ],
      {},
      t0 - 1,
    );

    expect(recordatorios).toHaveLength(MAXIMO_RECORDATORIOS);
    expect(recordatorios.length).toBeLessThanOrEqual(64);
    const times = recordatorios.map((item) => new Date(item.at).getTime());
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  it('un tratamiento terminado no programa nada', () => {
    const pauta = construirPauta([tratamiento()]);

    expect(
      planificarRecordatorios(
        'cuenta-1',
        [{ petId: 'm', petName: 'Luna', pauta }],
        {},
        t0 + 6 * 24 * HOUR,
      ),
    ).toEqual([]);
  });
});

describe('sincronizar recordatorios', () => {
  const tratamientos = {
    obtenerPautaSnapshot: jest.fn(async (petId: string) => ({
      data: petId === 'mascota-1' ? [tratamiento()] : [],
      fromCache: false,
      updatedAt: null,
    })),
  };

  it('programa los recordatorios de todas las mascotas', async () => {
    const scheduler = fakeScheduler();

    const result = await sincronizarRecordatorios({
      mascotas: [
        { id: 'mascota-1', name: 'Luna' },
        { id: 'mascota-2', name: 'Rocky' },
      ],
      tratamientos,
      cumplimiento: fakeCumplimiento(),
      scheduler,
      now: () => t0 - 1,
    });

    expect(result).toBe('programado');
    expect(scheduler.programar).toHaveBeenCalledTimes(1);
    expect(scheduler.programar.mock.calls[0][0]).toHaveLength(9);
  });

  it('si falla una pauta no toca lo ya programado', async () => {
    const scheduler = fakeScheduler();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await sincronizarRecordatorios({
      mascotas: [{ id: 'mascota-1', name: 'Luna' }],
      tratamientos: {
        obtenerPautaSnapshot: jest.fn().mockRejectedValue(new Error('Sin conexión')),
      },
      cumplimiento: fakeCumplimiento(),
      scheduler,
    });

    expect(result).toBe('error');
    expect(scheduler.programar).not.toHaveBeenCalled();
  });

  it('no programa si la sesión terminó mientras esperaba', async () => {
    const scheduler = fakeScheduler();

    const result = await sincronizarRecordatorios({
      mascotas: [{ id: 'mascota-1', name: 'Luna' }],
      tratamientos,
      cumplimiento: fakeCumplimiento(),
      scheduler,
      isCancelled: () => true,
    });

    expect(result).toBe('cancelado');
    expect(scheduler.programar).not.toHaveBeenCalled();
  });
});

describe('acción rápida "Administrada"', () => {
  const data = {
    tipo: 'dosis',
    accountId: 'cuenta-9',
    petId: 'mascota-1',
    tratamientoId: 'trat-1',
    at: START,
  };

  it('marca la dosis en la cuenta de la notificación y quita el recordatorio', async () => {
    const cumplimiento = fakeCumplimiento();
    const scheduler = fakeScheduler();

    const handled = await manejarAccionRecordatorio(
      { actionId: ACCION_ADMINISTRADA, data },
      cumplimiento,
      scheduler,
      () => t0 + 60 * 1000,
    );

    expect(handled).toBe(true);
    expect(cumplimiento.marcarAdministrada).toHaveBeenCalledWith(
      'cuenta-9',
      claveDosis('trat-1', START),
      '2026-11-16T08:01:00.000Z',
    );
    expect(scheduler.cancelar).toHaveBeenCalledWith(`dosis:trat-1@${START}`);
  });

  it('ignora otras acciones y notificaciones que no son de dosis', async () => {
    const cumplimiento = fakeCumplimiento();
    const scheduler = fakeScheduler();

    expect(
      await manejarAccionRecordatorio({ actionId: 'otra', data }, cumplimiento, scheduler),
    ).toBe(false);
    expect(
      await manejarAccionRecordatorio(
        { actionId: ACCION_ADMINISTRADA, data: { citaId: 'cita-1' } },
        cumplimiento,
        scheduler,
      ),
    ).toBe(false);
    expect(cumplimiento.marcarAdministrada).not.toHaveBeenCalled();
  });
});
