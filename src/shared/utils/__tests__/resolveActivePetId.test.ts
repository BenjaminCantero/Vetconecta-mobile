// Pruebas unitarias de la regla de mascota activa (F1).

import { resolveActivePetId } from '../resolveActivePetId';

describe('resolveActivePetId', () => {
  it('sin mascotas no hay mascota activa', () => {
    expect(resolveActivePetId([], 'pet-1', 'pet-2')).toBeNull();
  });

  it('mantiene la mascota actual si sigue en la lista', () => {
    expect(resolveActivePetId(['pet-1', 'pet-2'], 'pet-2', 'pet-1')).toBe('pet-2');
  });

  it('restaura la última mascota guardada al abrir la app', () => {
    expect(resolveActivePetId(['pet-1', 'pet-2'], null, 'pet-2')).toBe('pet-2');
  });

  it('ignora un id guardado que no pertenece al dueño (BR-12)', () => {
    expect(resolveActivePetId(['pet-1', 'pet-2'], null, 'ajena')).toBe('pet-1');
  });

  it('si la mascota actual ya no existe, usa la guardada o la primera', () => {
    expect(resolveActivePetId(['pet-1', 'pet-2'], 'borrada', null)).toBe('pet-1');
    expect(resolveActivePetId(['pet-1', 'pet-2'], 'borrada', 'pet-2')).toBe('pet-2');
  });
});
