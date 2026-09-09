// Responsabilidad: caso de uso de citas (capa DOMAIN de appointments).
// Define el contrato AppointmentsRepository (implementado en la capa data)
// y expone la lista de citas sin conocer Axios.

import { useCallback, useEffect, useState } from 'react';

import type { Appointment } from './Appointment';

export interface AppointmentsRepository {
  getAppointments: () => Promise<Appointment[]>;
}

export function useAppointments(appointmentsRepository: AppointmentsRepository) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset de estado al iniciar cada fetch
    setIsLoading(true);
    setError(null);

    appointmentsRepository
      .getAppointments()
      .then((data) => {
        if (!cancelled) setAppointments(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error('Error al cargar citas'));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [appointmentsRepository, reloadIndex]);

  const refetch = useCallback(() => setReloadIndex((index) => index + 1), []);

  return { appointments, isLoading, error, refetch };
}
