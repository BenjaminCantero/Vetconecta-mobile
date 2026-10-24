// Responsabilidad: caso de uso de notificaciones (capa DOMAIN).

import { useRef, useState } from 'react';
import { useFetch } from '../../../shared/hooks/useFetch';

import type { Notification } from './Notification';

export interface NotificationsRepository {
  getNotifications: () => Promise<Notification[]>;
  markAsRead: (ids: string[]) => Promise<void>;
}

export function useNotifications(notificationsRepository: NotificationsRepository) {
  const { data, isLoading, error, refetch } = useFetch(notificationsRepository.getNotifications, [
    notificationsRepository,
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const busy = useRef(false);
  async function markAsRead(ids: string[]) {
    if (busy.current) return false;
    busy.current = true;
    setIsSaving(true);
    setSaveError(null);
    try {
      await notificationsRepository.markAsRead(ids);
      refetch();
      return true;
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : 'No se pudo guardar la lectura.');
      return false;
    } finally {
      busy.current = false;
      setIsSaving(false);
    }
  }
  return { notifications: data ?? [], isLoading, error, refetch, isSaving, saveError, markAsRead };
}
