// Responsabilidad: aviso de sesión expirada (capa CORE).
// httpClient emite el evento cuando la API responde 401; el dominio auth se
// suscribe (a través de su repositorio) para cerrar la sesión en memoria.
// Vive en core porque core no puede importar features.

type SessionExpiredListener = () => void;

const listeners = new Set<SessionExpiredListener>();

export function onSessionExpired(listener: SessionExpiredListener): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function notifySessionExpired(): void {
  listeners.forEach((listener) => listener());
}
