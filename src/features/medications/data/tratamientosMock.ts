// Responsabilidad: datos de ejemplo de GET /mascotas/:id/tratamientos (capa DATA).
// Misma forma que la respuesta esperada de Web K1, para que el mapeo sea igual
// con mock y con backend. Los ids de mascota coinciden con `petsMock`; Rocky
// (mascota-001) no tiene tratamientos, para probar la lista vacía.
// Se usa solo mientras ENV.USE_MOCKS está activo.

import type { TratamientoDto } from './tratamientoDto';

export const tratamientosMock: TratamientoDto[] = [
  {
    id: 'tratamiento-001',
    id_mascota: 'mascota-002',
    medicamento: 'Amoxicilina 250 mg',
    dosis: '1 comprimido',
    frecuencia_horas: 12,
    fecha_inicio: '2026-11-15T08:00:00-03:00',
    duracion_dias: 5,
    indicaciones: 'Administrar con comida. No suspender antes de terminar.',
    id_evento_clinico: 'evento-004',
  },
  {
    id: 'tratamiento-002',
    id_mascota: 'mascota-002',
    medicamento: 'Meloxicam 0,5 mg/ml',
    dosis: '0,6 ml',
    frecuencia_horas: 24,
    fecha_inicio: '2026-11-15T09:00:00-03:00',
    duracion_dias: 3,
    indicaciones: 'Vía oral, sobre el alimento.',
    id_evento_clinico: 'evento-004',
  },
];
