import { useCallback, useEffect, useState } from 'react';

import type { OwnerProfile } from './OwnerProfile';

export interface ContactUpdate {
  email: string;
  phone: string;
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
}

export interface OwnerProfileRepository {
  getMyProfile: () => Promise<OwnerProfile>;
  updateContact: (contact: ContactUpdate) => Promise<OwnerProfile>;
  changePassword: (change: PasswordChange) => Promise<void>;
}

export function useOwnerProfile(repository: OwnerProfileRepository) {
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setProfile(await repository.getMyProfile());
    } catch (reason) {
      setError(reason instanceof Error ? reason : new Error('No pudimos cargar tu perfil.'));
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial asíncrona del perfil
    void load();
  }, [load]);

  const updateContact = useCallback(
    async (contact: ContactUpdate) => {
      const updated = await repository.updateContact(contact);
      setProfile(updated);
      return updated;
    },
    [repository],
  );

  return {
    profile,
    isLoading,
    error,
    reload: load,
    updateContact,
    changePassword: repository.changePassword,
  };
}
