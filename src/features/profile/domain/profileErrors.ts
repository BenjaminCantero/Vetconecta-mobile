export class EmailAlreadyInUseError extends Error {
  constructor() {
    super('Este correo ya está asociado a otra cuenta. Usa uno diferente.');
    this.name = 'EmailAlreadyInUseError';
  }
}

export class IncorrectCurrentPasswordError extends Error {
  constructor() {
    super('La contraseña actual no es correcta. Inténtalo nuevamente.');
    this.name = 'IncorrectCurrentPasswordError';
  }
}
