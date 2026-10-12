// Pruebas unitarias de bookingRepository (D2) con respuestas HTTP simuladas:
// 201, 409, 400, 401 y sin red, más el bloqueo de envíos duplicados y la
// cancelación con PATCH.

import { AxiosError, type AxiosResponse } from 'axios';

import { httpClient } from '../../../../core/api/httpClient';
import { isOnline } from '../../../../core/network/connectivity';
import {
  HoraNoDisponibleError,
  ReservaInvalidaError,
  SinConexionError,
} from '../../domain/bookingErrors';
import type { BookingRequest } from '../../domain/useBookAppointment';
import type { AppointmentDto } from '../appointmentsDto';
import { bookingRepository } from '../bookingRepository';

jest.mock('../../../../core/config/env', () => ({
  ENV: { API_BASE_URL: 'http://test', API_TIMEOUT_MS: 1000, USE_MOCKS: false },
}));

jest.mock('../../../../core/api/httpClient', () => ({
  httpClient: { post: jest.fn(), patch: jest.fn() },
}));

jest.mock('../../../../core/network/connectivity', () => ({
  isOnline: jest.fn(),
}));

const post = httpClient.post as jest.Mock;
const patch = httpClient.patch as jest.Mock;
const online = isOnline as jest.Mock;

const request: BookingRequest = {
  petId: 'pet-1',
  veterinarianId: 'vet-1',
  specialtyId: 'esp-1',
  date: '2026-10-20',
  hour: '10:30',
};

const reservedDto: AppointmentDto = {
  id: 'cita-1',
  id_mascota: 'pet-1',
  fecha: '2026-10-20T10:30:00',
  motivo: 'Consulta',
  estado: 'reservada',
  veterinario: 'Dra. Rojas',
};

function httpError(status: number, data?: unknown): AxiosError {
  return new AxiosError('error', String(status), undefined, undefined, {
    status,
    data,
  } as AxiosResponse);
}

beforeEach(() => {
  jest.clearAllMocks();
  online.mockResolvedValue(true);
});

describe('bookingRepository.reserve', () => {
  it('201: devuelve la cita creada en estado reservada', async () => {
    post.mockResolvedValue({ status: 201, data: reservedDto });

    const appointment = await bookingRepository.reserve(request);

    expect(post).toHaveBeenCalledWith('/citas', {
      id_mascota: 'pet-1',
      id_veterinario: 'vet-1',
      id_especialidad: 'esp-1',
      fecha: '2026-10-20',
      hora: '10:30',
    });
    expect(appointment).toMatchObject({ id: 'cita-1', status: 'reservada' });
  });

  it('409: lanza HoraNoDisponibleError', async () => {
    post.mockRejectedValue(httpError(409));

    await expect(bookingRepository.reserve(request)).rejects.toBeInstanceOf(HoraNoDisponibleError);
  });

  it('400: lanza ReservaInvalidaError con el mensaje del backend', async () => {
    post.mockRejectedValue(httpError(400, { mensaje: 'La fecha ya pasó.' }));

    const promise = bookingRepository.reserve(request);

    await expect(promise).rejects.toBeInstanceOf(ReservaInvalidaError);
    await expect(promise).rejects.toThrow('La fecha ya pasó.');
  });

  it('400 sin cuerpo: usa el mensaje por defecto', async () => {
    post.mockRejectedValue(httpError(400));

    await expect(bookingRepository.reserve(request)).rejects.toThrow(
      'Revisa los datos de la reserva e inténtalo de nuevo.',
    );
  });

  it('401: devuelve un mensaje de sesión expirada', async () => {
    post.mockRejectedValue(httpError(401));

    await expect(bookingRepository.reserve(request)).rejects.toThrow(
      'Tu sesión expiró. Vuelve a iniciar sesión para reservar tu hora.',
    );
  });

  it('sin red: lanza SinConexionError y no envía nada', async () => {
    online.mockResolvedValue(false);

    await expect(bookingRepository.reserve(request)).rejects.toBeInstanceOf(SinConexionError);
    expect(post).not.toHaveBeenCalled();
  });

  it('bloquea un segundo envío mientras el primero está en curso', async () => {
    let resolvePost: (value: unknown) => void = () => {};
    post.mockReturnValue(new Promise((resolve) => (resolvePost = resolve)));

    const first = bookingRepository.reserve(request);
    const second = bookingRepository.reserve(request);
    resolvePost({ status: 201, data: reservedDto });

    await expect(first).resolves.toMatchObject({ id: 'cita-1' });
    await expect(second).resolves.toMatchObject({ id: 'cita-1' });
    expect(post).toHaveBeenCalledTimes(1);
  });

  it('permite reservar de nuevo cuando el envío anterior terminó', async () => {
    post.mockRejectedValueOnce(httpError(409));
    post.mockResolvedValueOnce({ status: 201, data: reservedDto });

    await expect(bookingRepository.reserve(request)).rejects.toBeInstanceOf(HoraNoDisponibleError);
    await expect(bookingRepository.reserve(request)).resolves.toMatchObject({ id: 'cita-1' });
    expect(post).toHaveBeenCalledTimes(2);
  });
});

describe('bookingRepository.cancel', () => {
  it('llama a PATCH /citas/:id/cancelar y devuelve la cita cancelada', async () => {
    patch.mockResolvedValue({ status: 200, data: { ...reservedDto, estado: 'cancelada' } });

    const appointment = await bookingRepository.cancel('cita-1');

    expect(patch).toHaveBeenCalledWith('/citas/cita-1/cancelar');
    expect(appointment.status).toBe('cancelada');
  });

  it('sin red: lanza SinConexionError y no envía nada', async () => {
    online.mockResolvedValue(false);

    await expect(bookingRepository.cancel('cita-1')).rejects.toBeInstanceOf(SinConexionError);
    expect(patch).not.toHaveBeenCalled();
  });
});
