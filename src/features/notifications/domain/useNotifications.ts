// Responsabilidad: caso de uso de notificaciones (capa DOMAIN).

import { useRef, useState } from 'react';
import type { CachedResult } from '../../../core/network/cachedRead';
import { useFetch } from '../../../shared/hooks/useFetch';

import type { Notification } from './Notification';

export interface NotificationsRepository {
  getNotificationsSnapshot: () => Promise<CachedResult<Notification[]>>;
  markAsRead: (ids: string[]) => Promise<void>;
}

export function useNotifications(notificationsRepository: NotificationsRepository) {
  const { data, isLoading, error, refetch } = useFetch(
    notificationsRepository.getNotificationsSnapshot,
    [notificationsRepository],
  );
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
  return {
    notifications: data?.data ?? [],
    fromCache: data?.fromCache ?? false,
    updatedAt: data?.updatedAt ?? null,
    isLoading,
    error,
    refetch,
    isSaving,
    saveError,
    markAsRead,
  };
}
