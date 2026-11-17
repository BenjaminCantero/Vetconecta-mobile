// Responsabilidad: caso de uso de lectura de citas.
// Capa DOMAIN de appointments.
//
// Expone citas, carga, errores, actualización y estado offline.
// No conoce Axios ni AsyncStorage.
// H3: permite actualizar una cita después de calificarla.

import { useCallback, useEffect, useState } from 'react';

import { useRefetchOnReconnect } from '../../../shared/hooks/useRefetchOnReconnect';
import type { Appointment } from './Appointment';

export interface AppointmentsSnapshot {
  appointments: Appointment[];
  isOffline: boolean;
  updatedAt: string | null;
}

export interface AppointmentsRepository {
  getAppointments: () => Promise<Appointment[]>;

  getAppointmentsSnapshot?: () => Promise<AppointmentsSnapshot>;
}

export function useAppointments(appointmentsRepository: AppointmentsRepository) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadAppointments = async () => {
      try {
        const snapshot = appointmentsRepository.getAppointmentsSnapshot
          ? await appointmentsRepository.getAppointmentsSnapshot()
          : {
              appointments: await appointmentsRepository.getAppointments(),
              isOffline: false,
              updatedAt: null,
            };

        if (!cancelled) {
          setAppointments(snapshot.appointments);
          setIsOffline(snapshot.isOffline);
          setUpdatedAt(snapshot.updatedAt);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Error al cargar citas'));
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
    setError(null);
    setIsRefreshing(true);
    setReloadIndex((index) => index + 1);
  }, []);

  // H3: actualiza únicamente la cita que fue calificada.
  const updateAppointment = useCallback((updatedAppointment: Appointment) => {
    setAppointments((currentAppointments) =>
      currentAppointments.map((appointment) =>
        appointment.id === updatedAppointment.id ? updatedAppointment : appointment,
      ),
    );
  }, []);

  useRefetchOnReconnect(refetch);

  return {
    appointments,
    isLoading,
    isRefreshing,
    isOffline,
    updatedAt,
    error,
    refetch,
    updateAppointment,
  };
}
