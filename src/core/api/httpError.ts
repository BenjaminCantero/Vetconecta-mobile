// Responsabilidad: traducción de errores HTTP a errores de dominio (capa CORE).
// Los repositorios de cada feature lo usan para que presentation reciba un
// Error con un mensaje mostrable, sin tener que conocer Axios ni los códigos
// de estado. Vive en core porque los dominios no pueden importarse entre sí.

import { isAxiosError } from 'axios';

export interface HttpErrorMessages {
  // Mensaje para cualquier fallo no cubierto por los casos específicos.
  fallback: string;
  network?: string;
  unauthorized?: string;
  // Si se omite, un 404 se trata con `fallback`.
  notFound?: string;
}

const DEFAULT_NETWORK_MESSAGE = 'No hay conexión con el servidor. Revisa tu red e inténtalo de nuevo.';
const DEFAULT_UNAUTHORIZED_MESSAGE = 'Tu sesión expiró. Vuelve a iniciar sesión.';

export function toHttpError(error: unknown, messages: HttpErrorMessages): Error {
  if (isAxiosError(error)) {
    if (!error.response) {
      return new Error(messages.network ?? DEFAULT_NETWORK_MESSAGE);
    }

    const { status } = error.response;

    if (status === 401 || status === 403) {
      return new Error(messages.unauthorized ?? DEFAULT_UNAUTHORIZED_MESSAGE);
    }

    if (status === 404 && messages.notFound) {
      return new Error(messages.notFound);
    }

    return new Error(messages.fallback);
  }

  return error instanceof Error ? error : new Error(messages.fallback);
}
