// Responsabilidad: traducción de errores HTTP a errores de dominio (capa CORE).
// Los repositorios de cada feature lo usan para que presentation reciba un
// Error con un mensaje mostrable, sin tener que conocer Axios ni los códigos
// de estado. Vive en core porque los dominios no pueden importarse entre sí.

import { AxiosError, isAxiosError } from 'axios';

export type HttpErrorKind =
  | 'network'
  | 'timeout'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'conflict'
  | 'unprocessableEntity'
  | 'server'
  | 'unknown';

export class HttpError extends Error {
  readonly kind: HttpErrorKind;
  // null si no hubo respuesta (red o timeout).
  readonly status: number | null;

  constructor(message: string, kind: HttpErrorKind, status: number | null = null) {
    super(message);
    this.name = 'HttpError';
    this.kind = kind;
    this.status = status;
  }

  // Fallos temporales: la pantalla puede ofrecer "Reintentar".
  get isRetryable(): boolean {
    return this.kind === 'network' || this.kind === 'timeout' || this.kind === 'server';
  }
}

export interface HttpErrorMessages {
  // Mensaje para cualquier fallo no cubierto por los casos específicos.
  fallback: string;
  network?: string;
  timeout?: string;
  unauthorized?: string;
  forbidden?: string;

  // Si se omiten, estos errores se tratan con fallback.
  notFound?: string;
  conflict?: string;
  unprocessableEntity?: string;
  server?: string;
}

const DEFAULT_NETWORK_MESSAGE =
  'No hay conexión con el servidor. Revisa tu red e inténtalo de nuevo.';
const DEFAULT_TIMEOUT_MESSAGE = 'El servidor tardó demasiado en responder. Inténtalo de nuevo.';
const DEFAULT_UNAUTHORIZED_MESSAGE = 'Tu sesión expiró. Vuelve a iniciar sesión.';
const DEFAULT_FORBIDDEN_MESSAGE = 'Tu cuenta no tiene permiso para realizar esta acción.';

function isTimeout(error: AxiosError): boolean {
  return error.code === AxiosError.ECONNABORTED || error.code === AxiosError.ETIMEDOUT;
}

function fromStatus(status: number, messages: HttpErrorMessages): HttpError {
  if (status === 401) {
    return new HttpError(
      messages.unauthorized ?? DEFAULT_UNAUTHORIZED_MESSAGE,
      'unauthorized',
      status,
    );
  }

  // 403: la sesión es válida, pero sin permiso. No se pide volver a iniciar sesión.
  if (status === 403) {
    return new HttpError(messages.forbidden ?? DEFAULT_FORBIDDEN_MESSAGE, 'forbidden', status);
  }

  if (status === 404) {
    return new HttpError(messages.notFound ?? messages.fallback, 'notFound', status);
  }

  if (status === 409) {
    return new HttpError(messages.conflict ?? messages.fallback, 'conflict', status);
  }

  if (status === 422) {
    return new HttpError(
      messages.unprocessableEntity ?? messages.fallback,
      'unprocessableEntity',
      status,
    );
  }

  if (status >= 500) {
    return new HttpError(messages.server ?? messages.fallback, 'server', status);
  }

  return new HttpError(messages.fallback, 'unknown', status);
}

export function toHttpError(error: unknown, messages: HttpErrorMessages): Error {
  if (isAxiosError(error)) {
    if (error.response) {
      return fromStatus(error.response.status, messages);
    }

    if (isTimeout(error)) {
      return new HttpError(messages.timeout ?? DEFAULT_TIMEOUT_MESSAGE, 'timeout');
    }

    return new HttpError(messages.network ?? DEFAULT_NETWORK_MESSAGE, 'network');
  }

  // Errores que no vienen de Axios (p. ej. OfflineDataError) ya traen su mensaje.
  return error instanceof Error ? error : new HttpError(messages.fallback, 'unknown');
}
