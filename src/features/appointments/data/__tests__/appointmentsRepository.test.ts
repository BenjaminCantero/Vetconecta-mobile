import { AxiosError, type AxiosResponse } from 'axios';

import { httpClient } from '../../../../core/api/httpClient';
import { isOnline } from '../../../../core/network/connectivity';
import type { Appointment, AppointmentRating } from '../../domain/Appointment';
import {
  appointmentsRepository,
  AppointmentAlreadyRatedError,
  canRateAppointment,
  toAppointment,
} from '../appointmentsRepository';

jest.mock('../../../../core/config/env', () => ({
  ENV: {
    API_BASE_URL: 'http://test',
    API_TIMEOUT_MS: 1000,
    USE_MOCKS: false,
  },
}));

jest.mock('../../../../core/api/httpClient', () => ({
  httpClient: { get: jest.fn(), post: jest.fn() },
}));

jest.mock('../../../../core/network/connectivity', () => ({
  isOnline: jest.fn(),
}));

jest.mock('../../../../core/network/cachedRead', () => ({
  cachedRead: jest.fn(),
}));

jest.mock('../../../../core/storage/sessionStorage', () => ({
  getCurrentAccountId: jest.fn().mockResolvedValue('account-1'),
}));

jest.mock('../../../../core/storage/offlineCache', () => ({
  buildCacheKey: jest.fn().mockReturnValue('cache:account-1:citas'),
  getCacheGeneration: jest.fn().mockReturnValue(0),
  readCache: jest.fn().mockResolvedValue(null),
  writeCache: jest.fn().mockResolvedValue(undefined),
}));

const post = httpClient.post as jest.Mock;
const online = isOnline as jest.Mock;

let appointment: Appointment;
let appointmentCounter = 0;

const rating: AppointmentRating = {
  estrellas: 5,
  comentario: 'Excelente atención.',
};

function httpError(status: number): AxiosError {
  return new AxiosError('error', String(status), undefined, undefined, {
    status,
  } as AxiosResponse);
}

beforeEach(() => {
  jest.clearAllMocks();

  online.mockResolvedValue(true);
  post.mockResolvedValue({ status: 201 });

  appointmentCounter += 1;

  appointment = {
    id: `cita-${appointmentCounter}`,
    petId: 'pet-1',
    date: '2026-10-20T10:30:00',
    reason: 'Consulta veterinaria',
    status: 'realizada',
    veterinarian: 'Dra. Rojas',
    calificada: false,
  };
});

describe('H3: elegibilidad de citas', () => {
  it('permite calificar una cita realizada sin calificación', () => {
    expect(canRateAppointment(appointment)).toBe(true);
  });

  it('no permite calificar una cita previamente calificada', () => {
    expect(canRateAppointment({ ...appointment, calificada: true })).toBe(false);
  });

  it('no permite calificar una cita pendiente', () => {
    expect(canRateAppointment({ ...appointment, status: 'pendiente' })).toBe(false);
  });

  it('no permite calificar una cita cancelada', () => {
    expect(canRateAppointment({ ...appointment, status: 'cancelada' })).toBe(false);
  });

  it('no permite calificar si el estado de calificación es desconocido', () => {
    expect(canRateAppointment({ ...appointment, calificada: undefined })).toBe(false);
  });

  it('transforma una calificación recibida desde el backend', () => {
    const result = toAppointment({
      id: 'cita-backend',
      id_mascota: 'pet-1',
      fecha: '2026-10-20T10:30:00',
      motivo: 'Consulta',
      estado: 'realizada',
      veterinario: 'Dra. Rojas',
      calificada: true,
      calificacion: {
        estrellas: 4,
        comentario: 'Buena atención.',
      },
    });

    expect(result.calificada).toBe(true);
    expect(result.calificacion).toEqual({
      estrellas: 4,
      comentario: 'Buena atención.',
    });
  });
});

describe('H3: appointmentsRepository.createRating', () => {
  it('envía la calificación mediante POST /calificaciones', async () => {
    const result = await appointmentsRepository.createRating(appointment, rating);

    expect(post).toHaveBeenCalledWith('/calificaciones', {
      citaId: appointment.id,
      estrellas: 5,
      comentario: 'Excelente atención.',
    });

    expect(result.calificada).toBe(true);
    expect(result.calificacion).toEqual(rating);
  });

  it('permite enviar estrellas sin comentario', async () => {
    await appointmentsRepository.createRating(appointment, {
      estrellas: 3,
    });

    expect(post).toHaveBeenCalledWith('/calificaciones', {
      citaId: appointment.id,
      estrellas: 3,
    });
  });

  it.each([0, 6, 2.5])('rechaza una cantidad inválida de estrellas: %s', async (stars) => {
    await expect(
      appointmentsRepository.createRating(appointment, {
        estrellas: stars as AppointmentRating['estrellas'],
      }),
    ).rejects.toThrow('Selecciona entre 1 y 5 estrellas.');

    expect(post).not.toHaveBeenCalled();
  });

  it('permite un comentario de exactamente 500 caracteres', async () => {
    const comentario = 'a'.repeat(500);

    await appointmentsRepository.createRating(appointment, {
      estrellas: 5,
      comentario,
    });

    expect(post).toHaveBeenCalledWith('/calificaciones', {
      citaId: appointment.id,
      estrellas: 5,
      comentario,
    });
  });

  it('rechaza un comentario de 501 caracteres', async () => {
    await expect(
      appointmentsRepository.createRating(appointment, {
        estrellas: 5,
        comentario: 'a'.repeat(501),
      }),
    ).rejects.toThrow('El comentario no puede superar los 500 caracteres.');

    expect(post).not.toHaveBeenCalled();
  });

  it('409: informa que la cita ya fue calificada', async () => {
    post.mockRejectedValue(httpError(409));

    await expect(appointmentsRepository.createRating(appointment, rating)).rejects.toBeInstanceOf(
      AppointmentAlreadyRatedError,
    );
  });

  it('422: informa que la cita no está realizada', async () => {
    post.mockRejectedValue(httpError(422));

    await expect(appointmentsRepository.createRating(appointment, rating)).rejects.toThrow(
      'Solo puedes calificar citas realizadas.',
    );
  });

  it('sin conexión: no realiza el POST', async () => {
    online.mockResolvedValue(false);

    await expect(appointmentsRepository.createRating(appointment, rating)).rejects.toThrow(
      'No hay conexión para enviar la calificación.',
    );

    expect(post).not.toHaveBeenCalled();
  });

  it('bloquea dos envíos simultáneos para una misma cita', async () => {
    let resolvePost: (value: unknown) => void = () => {};

    post.mockReturnValue(
      new Promise((resolve) => {
        resolvePost = resolve;
      }),
    );

    const first = appointmentsRepository.createRating(appointment, rating);

    const second = appointmentsRepository.createRating(appointment, rating);

    await expect(second).rejects.toThrow('Ya se está enviando esta calificación.');

    resolvePost({ status: 201 });

    await expect(first).resolves.toMatchObject({
      calificada: true,
    });

    expect(post).toHaveBeenCalledTimes(1);
  });

  it('impide calificar nuevamente una cita actualizada', async () => {
    const updatedAppointment = await appointmentsRepository.createRating(appointment, rating);

    await expect(
      appointmentsRepository.createRating(updatedAppointment, rating),
    ).rejects.toBeInstanceOf(AppointmentAlreadyRatedError);

    expect(post).toHaveBeenCalledTimes(1);
  });

  it('impide repetir el POST utilizando una cita desactualizada', async () => {
    await appointmentsRepository.createRating(appointment, rating);

    await expect(appointmentsRepository.createRating(appointment, rating)).rejects.toBeInstanceOf(
      AppointmentAlreadyRatedError,
    );

    expect(post).toHaveBeenCalledTimes(1);
  });
});
