// Responsabilidad: caso de uso de notificaciones (capa DOMAIN).

import { useEffect, useState } from 'react';

import type { Notification } from './Notification';

export interface NotificationsRepository {
  getNotifications: () => Promise<Notification[]>;
}

export function useNotifications(notificationsRepository: NotificationsRepository) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    notificationsRepository
      .getNotifications()
      .then((data) => {
        if (!cancelled) setNotifications(data);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [notificationsRepository]);

  return { notifications, isLoading };
}
