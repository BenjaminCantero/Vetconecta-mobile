// Responsabilidad: estado compartido "mascota activa" (selector multi-mascota)
// NO es un dominio: es estado transversal que consumen pets, clinical(view),
// appointments y home. Vive en shared/ y NO importa nada de features/
// (shared no puede depender de dominios). Guarda solo el id, no la entidad Pet.

import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

interface ActivePetContextValue {
  activePetId: string | null;
  setActivePetId: (id: string | null) => void;
}

const ActivePetContext = createContext<ActivePetContextValue | undefined>(undefined);

export function ActivePetProvider({ children }: { children: ReactNode }) {
  const [activePetId, setActivePetId] = useState<string | null>(null);
  const value = useMemo(() => ({ activePetId, setActivePetId }), [activePetId]);
  return <ActivePetContext.Provider value={value}>{children}</ActivePetContext.Provider>;
}

export function useActivePet() {
  const ctx = useContext(ActivePetContext);
  if (!ctx) throw new Error('useActivePet debe usarse dentro de <ActivePetProvider>');
  return ctx;
}
