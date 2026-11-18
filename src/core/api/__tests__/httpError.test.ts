import {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { HttpError, type HttpErrorMessages, toHttpError } from '../httpError';

const MESSAGES: HttpErrorMessages = { fallback: 'No se pudieron cargar los datos.' };

function requestConfig(): InternalAxiosRequestConfig {
  return { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
}

function responseError(status: number): AxiosError {
  const config = requestConfig();
  const response = { status, statusText: '', headers: {}, config, data: null } as AxiosResponse;

  return new AxiosError(
    `Request failed with status code ${status}`,
    'ERR_BAD_RESPONSE',
    config,
    {},
    response,
  );
}

function withoutResponse(code: string): AxiosError {
  return new AxiosError('sin respuesta', code, requestConfig(), {});
}

function translate(error: unknown, messages: HttpErrorMessages = MESSAGES): HttpError {
  const result = toHttpError(error, messages);

  expect(result).toBeInstanceOf(HttpError);

  return result as HttpError;
}

describe('toHttpError', () => {
  it('distingue un corte de red de un timeout, y ambos se pueden reintentar', () => {
    const network = translate(withoutResponse(AxiosError.ERR_NETWORK));
    const timeout = translate(withoutResponse(AxiosError.ECONNABORTED));

    expect(network.kind).toBe('network');
    expect(network.message).toMatch('No hay conexión');
    expect(network.isRetryable).toBe(true);

    expect(timeout.kind).toBe('timeout');
    expect(timeout.message).toMatch('tardó demasiado');
    expect(timeout.status).toBeNull();
    expect(timeout.isRetryable).toBe(true);
  });

  it('un 403 no se presenta como sesión expirada', () => {
    const error = translate(responseError(403), {
      ...MESSAGES,
      unauthorized: 'Tu sesión expiró. Vuelve a iniciar sesión.',
    });

    expect(error.kind).toBe('forbidden');
    expect(error.message).not.toMatch('sesión expiró');
    expect(error.isRetryable).toBe(false);
  });

  it('un 401 se presenta como sesión expirada', () => {
    const error = translate(responseError(401));

    expect(error.kind).toBe('unauthorized');
    expect(error.status).toBe(401);
    expect(error.message).toMatch('sesión expiró');
  });

  it('un 5xx usa el mensaje del repositorio y se puede reintentar', () => {
    const error = translate(responseError(503));

    expect(error.kind).toBe('server');
    expect(error.message).toBe(MESSAGES.fallback);
    expect(error.isRetryable).toBe(true);
  });

  it('usa los mensajes específicos del repositorio cuando existen', () => {
    const messages = {
      ...MESSAGES,
      notFound: 'La cita ya no existe.',
      conflict: 'Esta cita ya fue calificada.',
      server: 'El servicio de citas no está disponible.',
    };

    expect(translate(responseError(404), messages).message).toBe(messages.notFound);
    expect(translate(responseError(409), messages).message).toBe(messages.conflict);
    expect(translate(responseError(500), messages).message).toBe(messages.server);
  });

  it('sin mensaje específico, 404/409/422 usan el fallback pero conservan su tipo', () => {
    expect(translate(responseError(404))).toMatchObject({
      kind: 'notFound',
      message: MESSAGES.fallback,
    });
    expect(translate(responseError(409))).toMatchObject({
      kind: 'conflict',
      message: MESSAGES.fallback,
    });
    expect(translate(responseError(422))).toMatchObject({
      kind: 'unprocessableEntity',
      message: MESSAGES.fallback,
    });
  });

  it('deja pasar los errores que no vienen de Axios', () => {
    const domainError = new Error('Sin conexión y sin datos guardados.');

    expect(toHttpError(domainError, MESSAGES)).toBe(domainError);
  });
});
