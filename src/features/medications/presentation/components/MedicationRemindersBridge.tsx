// Responsabilidad: mantener programados los recordatorios de dosis (capa PRESENTATION, H2).
// No dibuja nada. Se monta en TabNavigator, es decir, solo con la sesión
// iniciada, y vuelve a programar la ventana de recordatorios:
//  - al montarse (inicio de sesión o apertura de la app con sesión),
//  - cuando cambia la lista de mascotas,
//  - cuando la app vuelve a primer plano (avanza la ventana de 3 días),
//  - al recuperar la red (puede haber llegado una pauta nueva o modificada).
// Cancelar todo al cerrar sesión lo hace `clearSessionData` (core).
//
// Actúa como composition root: inyecta las implementaciones de data.

import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { useActivePet } from '../../../../shared/context/ActivePetContext';
import { useRefetchOnReconnect } from '../../../../shared/hooks/useRefetchOnReconnect';
import { cumplimientoRepository } from '../../data/cumplimientoRepository';
import { recordatoriosScheduler } from '../../data/recordatoriosScheduler';
import { tratamientosService } from '../../data/tratamientosService';
import { sincronizarRecordatorios } from '../../domain/recordatoriosMedicamentos';

export function MedicationRemindersBridge() {
  const { pets } = useActivePet();
  const mounted = useRef(true);
  // Evita dos sincronizaciones a la vez; si llega otra petición mientras una
  // está en curso, se repite al terminar con los datos más recientes.
  const running = useRef(false);
  const pending = useRef(false);
  const petsRef = useRef(pets);

  const sync = useCallback(async () => {
    // Mientras la lista de mascotas carga llega vacía: sincronizar con ella
    // cancelaría todos los recordatorios.
    if (petsRef.current.length === 0) return;

    if (running.current) {
      pending.current = true;
      return;
    }

    running.current = true;

    do {
      pending.current = false;
      await sincronizarRecordatorios({
        mascotas: petsRef.current.map((pet) => ({ id: pet.id, name: pet.name })),
        tratamientos: tratamientosService,
        cumplimiento: cumplimientoRepository,
        scheduler: recordatoriosScheduler,
        isCancelled: () => !mounted.current,
      });
    } while (pending.current && mounted.current);

    running.current = false;
  }, []);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    petsRef.current = pets;
    sync();
  }, [pets, sync]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });

    return () => subscription.remove();
  }, [sync]);

  useRefetchOnReconnect(sync);

  return null;
}
