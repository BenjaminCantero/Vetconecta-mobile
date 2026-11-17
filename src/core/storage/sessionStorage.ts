// Responsabilidad: datos locales de la sesión (capa CORE).
// Identifica la cuenta dueña de la caché y borra todo lo que la sesión dejó en
// el dispositivo. Lo usan tanto el logout como la sesión expirada (401).

import AsyncStorage from '@react-native-async-storage/async-storage';

import { ENV } from '../config/env';
import { StorageKeys, asyncStorage } from './asyncStorage';
import { clearOfflineCache } from './offlineCache';
import { secureStorage } from './secureStorage';

interface StoredSessionUser {
  id: string;
  email?: string;
}

// Claves de versiones anteriores de la app: los tokens vivían en AsyncStorage y
// la caché usaba una clave fija por tipo de dato.
const LEGACY_KEYS = [
  '@vetconecta/auth_access_token',
  '@vetconecta/auth_refresh_token',
  '@vetconecta/appointments_cache',
  '@vetconecta/notifications_cache',
];

export async function getCurrentAccountId(): Promise<string | null> {
  const user = await asyncStorage.getItem<StoredSessionUser>(StorageKeys.AUTH_USER);

  if (!user) {
    return null;
  }

  const email = user.email?.trim().toLowerCase();

  // El login mock utiliza el mismo ID para distintas cuentas.
  // En ese caso, diferenciamos las cuentas mediante su correo.
  if (ENV.USE_MOCKS && user.id === 'mock-user-id' && email) {
    return `mock:${email}`;
  }

  return user.id || null;
}

export async function clearSessionData(): Promise<void> {
  await clearOfflineCache();
  await secureStorage.clearTokens();
  await asyncStorage.removeItem(StorageKeys.AUTH_USER);
  await asyncStorage.removeItem(StorageKeys.ACTIVE_PET_ID);
}

export async function removeLegacySessionData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(LEGACY_KEYS);
  } catch (error) {
    console.error('[sessionStorage] error eliminando datos antiguos:', error);
  }
}
