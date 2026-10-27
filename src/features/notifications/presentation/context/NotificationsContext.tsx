import { createContext, useContext, type ReactNode } from 'react';

import { notificationsRepository } from '../../data/notificationsRepository';
import { useNotifications } from '../../domain/useNotifications';

type NotificationsContextValue = ReturnType<typeof useNotifications>;

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

interface NotificationsProviderProps {
  children: ReactNode;
}

export function NotificationsProvider({ children }: NotificationsProviderProps) {
  const notifications = useNotifications(notificationsRepository);

  return (
    <NotificationsContext.Provider value={notifications}>{children}</NotificationsContext.Provider>
  );
}

export function useNotificationsSession() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error('useNotificationsSession debe utilizarse dentro de NotificationsProvider');
  }

  return context;
}
