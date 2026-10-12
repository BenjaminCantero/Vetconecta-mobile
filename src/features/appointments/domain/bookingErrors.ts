// Responsabilidad: errores de dominio de la reserva de horas (capa DOMAIN de
// appointments). La capa data los lanza a partir de la respuesta HTTP, y la UI
// los distingue con `instanceof` para decidir qué flujo de UC-03 mostrar.

// 409 Conflict: otra persona tomó la hora mientras el dueño la elegía (flujo A1).
export class HoraNoDisponibleError extends Error {
  constructor(message = 'Esa hora ya fue reservada, elige otra.') {
    super(message);
    this.name = 'HoraNoDisponibleError';
  }
}

// Sin red: la reserva requiere conexión y no se deja en cola (flujo A2).
export class SinConexionError extends Error {
  constructor(message = 'Sin conexión. Conéctate a internet para reservar tu hora.') {
    super(message);
    this.name = 'SinConexionError';
  }
}

// 400 Bad Request: los datos enviados no pasaron la validación del backend.
export class ReservaInvalidaError extends Error {
  constructor(message = 'Revisa los datos de la reserva e inténtalo de nuevo.') {
    super(message);
    this.name = 'ReservaInvalidaError';
  }
}
