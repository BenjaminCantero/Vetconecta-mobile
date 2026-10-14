// Responsabilidad: caso de uso de lectura de citas.
// Capa DOMAIN de appointments.
//
// Expone citas, carga, errores, actualización y estado offline.
// No conoce Axios ni AsyncStorage.

import { useCallback, useEffect, useState } from 'react';

import type { Appointment } from './Appointment';

export interface AppointmentsSnapshot {
  appointments: Appointment[];
  isOffline: boolean;
}

export interface AppointmentsRepository {
  getAppointments: () => Promise<Appointment[]>;

  getAppointmentsSnapshot?: () => Promise<AppointmentsSnapshot>;
}

export function useAppointments(
  appointmentsRepository: AppointmentsRepository,
) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setError(null);

    const loadAppointments = async () => {
      try {
        const snapshot = appointmentsRepository.getAppointmentsSnapshot
          ? await appointmentsRepository.getAppointmentsSnapshot()
          : {
              appointments:
                await appointmentsRepository.getAppointments(),
              isOffline: false,
            };

        if (!cancelled) {
          setAppointments(snapshot.appointments);
          setIsOffline(snapshot.isOffline);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err
              : new Error('Error al cargar citas'),
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    void loadAppointments();

    return () => {
      cancelled = true;
    };
  }, [appointmentsRepository, reloadIndex]);

  const refetch = useCallback(() => {
    setIsRefreshing(true);
    setReloadIndex((index) => index + 1);
  }, []);

  return {
    appointments,
    isLoading,
    isRefreshing,
    isOffline,
    error,
    refetch,
  };
}