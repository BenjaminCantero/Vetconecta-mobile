// Responsabilidad: estado compartido "mascota activa" (selector multi-mascota, F1)
// NO es un dominio: es estado transversal que consumen pets, appointments,
// notifications y home. Vive en shared/ y NO importa nada de features/
// (shared no puede depender de dominios): por eso guarda un resumen mínimo de
// cada mascota (ActivePetOption) y no la entidad Pet.
//
// La lista de mascotas del dueño la publica el dominio pets con `setPets`
// (ver ActivePetSync, montado en TabNavigator). La última mascota elegida se
// guarda en AsyncStorage y se restaura al reabrir la app, siempre validada
// contra esa lista (BR-12).

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { StorageKeys, asyncStorage } from '../../core/storage/asyncStorage';
import { resolveActivePetId } from '../utils/resolveActivePetId';

export interface ActivePetOption {
  id: string;
  name: string;
  photoUrl: string | null;
}

interface ActivePetContextValue {
  pets: ActivePetOption[];
  activePetId: string | null;
  activePet: ActivePetOption | null;
  setActivePetId: (id: string) => void;
  setPets: (pets: ActivePetOption[]) => void;
}

const ActivePetContext = createContext<ActivePetContextValue | undefined>(undefined);

export function ActivePetProvider({ children }: { children: ReactNode }) {
  const [pets, setPets] = useState<ActivePetOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // undefined = todavía leyendo AsyncStorage; null = no había nada guardado.
  const [restoredId, setRestoredId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    asyncStorage.getItem<string>(StorageKeys.ACTIVE_PET_ID).then(setRestoredId);
  }, []);

  // Se espera a la lectura de AsyncStorage para no elegir la primera mascota y
  // pisar enseguida la que el dueño había dejado seleccionada.
  const activePetId =
    restoredId === undefined
      ? null
      : resolveActivePetId(
          pets.map((pet) => pet.id),
          selectedId,
          restoredId,
        );

  useEffect(() => {
    if (activePetId) asyncStorage.setItem(StorageKeys.ACTIVE_PET_ID, activePetId);
  }, [activePetId]);

  const setActivePetId = useCallback((id: string) => setSelectedId(id), []);

  const value = useMemo(
    () => ({
      pets,
      activePetId,
      activePet: pets.find((pet) => pet.id === activePetId) ?? null,
      setActivePetId,
      setPets,
    }),
    [pets, activePetId, setActivePetId],
  );

  return <ActivePetContext.Provider value={value}>{children}</ActivePetContext.Provider>;
}

export function useActivePet() {
  const ctx = useContext(ActivePetContext);
  if (!ctx) throw new Error('useActivePet debe usarse dentro de <ActivePetProvider>');
  return ctx;
}
