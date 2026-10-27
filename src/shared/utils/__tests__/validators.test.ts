import { hasValidPasswordFormat, isValidChileanMobile, isValidEmail } from '../validators';

describe('profile validators', () => {
  it('accepts valid email and Chilean mobile contact formats', () => {
    expect(isValidEmail('dueno@correo.cl')).toBe(true);
    expect(isValidChileanMobile('+56 9 8765 4321')).toBe(true);
  });

  it('rejects malformed contact details', () => {
    expect(isValidEmail('dueno@correo')).toBe(false);
    expect(isValidChileanMobile('987654321')).toBe(false);
    expect(isValidChileanMobile('+56 9 87654 321')).toBe(false);
  });

  it('requires letters, numbers and eight characters in passwords', () => {
    expect(hasValidPasswordFormat('Clave123')).toBe(true);
    expect(hasValidPasswordFormat('sololetras')).toBe(false);
    expect(hasValidPasswordFormat('12345678')).toBe(false);
    expect(hasValidPasswordFormat('A1corta')).toBe(false);
  });
});
