// Responsabilidad: caso de uso "checklist de tratamiento" (capa DOMAIN, H2).
// Une la pauta de la mascota (H1) con el cumplimiento guardado en el
// dispositivo y expone `marcar` para registrar una toma como administrada.
// El estado de cada toma depende de la hora: se recalcula cada 30 s para que
// una toma pase de "pendiente" a "atrasada" sin recargar la pantalla.

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  construirChecklist,
  type DosisChecklist,
  type RegistroCumplimiento,
} from './checklistDosis';
import {
  marcarDosisAdministrada,
  type CumplimientoRepository,
  type RecordatoriosScheduler,
} from './recordatoriosMedicamentos';
import { usePautaTratamiento, type TratamientosRepository } from './usePautaTratamiento';

const INTERVALO_RELOJ_MS = 30 * 1000;

export function useChecklistTratamiento(
  tratamientos: TratamientosRepository,
  cumplimiento: CumplimientoRepository,
  scheduler: RecordatoriosScheduler,
  petId: string | null,
) {
  const { pauta, fromCache, updatedAt, isLoading, error, refetch } = usePautaTratamiento(
    tratamientos,
    petId,
  );
  const [accountId, setAccountId] = useState<string | null>(null);
  const [registro, setRegistro] = useState<RegistroCumplimiento>({});
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;

    const cargar = async () => {
      const cuenta = await cumplimiento.cuentaActual();
      const datos = cuenta ? await cumplimiento.obtenerRegistro(cuenta) : {};

      if (!cancelled) {
        setAccountId(cuenta);
        setRegistro(datos);
      }
    };

    cargar();
    const unsubscribe = cumplimiento.suscribir(cargar);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [cumplimiento]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), INTERVALO_RELOJ_MS);

    return () => clearInterval(timer);
  }, []);

  const checklist = useMemo(() => construirChecklist(pauta, registro, now), [pauta, registro, now]);

  const marcar = useCallback(
    async (dosis: DosisChecklist) => {
      if (!accountId || !dosis.puedeMarcar) return;

      await marcarDosisAdministrada(
        { accountId, tratamientoId: dosis.tratamientoId, at: dosis.at },
        cumplimiento,
        scheduler,
      );
    },
    [accountId, cumplimiento, scheduler],
  );

  return { checklist, marcar, fromCache, updatedAt, isLoading, error, refetch };
}
