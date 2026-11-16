// Responsabilidad: datos de ejemplo de GET /mascotas/:id/tratamientos (capa DATA).
// Misma forma que la respuesta esperada de Web K1, para que el mapeo sea igual
// con mock y con backend. Los ids de mascota coinciden con `petsMock`; Rocky
// (mascota-001) no tiene tratamientos, para probar la lista vacía.
// Se usa solo mientras ENV.USE_MOCKS está activo.

import { ENV } from '../../../core/config/env';
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

// Pauta de prueba de H2 (EXPO_PUBLIC_DEMO_PAUTA_RAPIDA=true): cada 2 min durante
// 30 min, empezando en el minuto siguiente a abrir la app. Se calcula una sola
// vez al cargar el módulo para que no se mueva en cada recarga.
const MINUTE_MS = 60 * 1000;
const demoStart = new Date(Math.ceil((Date.now() + MINUTE_MS) / MINUTE_MS) * MINUTE_MS);

const demoTratamiento: TratamientoDto = {
  id: 'tratamiento-demo',
  id_mascota: 'mascota-002',
  medicamento: 'Pauta de prueba',
  dosis: '1 gota',
  frecuencia_horas: 2 / 60,
  fecha_inicio: demoStart.toISOString(),
  duracion_dias: 30 / (24 * 60),
  indicaciones: 'Solo para probar los recordatorios. No es una indicación real.',
  id_evento_clinico: null,
};

export function getTratamientosMock(): TratamientoDto[] {
  return ENV.DEMO_FAST_TREATMENT ? [...tratamientosMock, demoTratamiento] : tratamientosMock;
}
