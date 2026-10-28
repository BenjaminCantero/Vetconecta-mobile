import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  AUTH_ACCESS_TOKEN: '@vetconecta/auth_access_token',
  AUTH_REFRESH_TOKEN: '@vetconecta/auth_refresh_token',
  AUTH_USER: '@vetconecta/auth_user',
  ACTIVE_PET_ID: '@vetconecta/active_pet_id',
  MOCK_NOTIFICATION_READ_IDS: '@vetconecta/mock_notification_read_ids',
  APPOINTMENTS_CACHE: '@vetconecta/appointments_cache',

  // E3 / G1: último listado de notificaciones descargado.
  NOTIFICATIONS_CACHE: '@vetconecta/notifications_cache',
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];

async function getItem<T>(key: StorageKey, throwOnError = false): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (error) {
    console.error(`[asyncStorage] error leyendo "${key}":`, error);

    if (throwOnError) {
      throw error;
    }

    return null;
  }
}

async function setItem<T>(key: StorageKey, value: T): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[asyncStorage] error guardando "${key}":`, error);
    return false;
  }
}

async function removeItem(key: StorageKey): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[asyncStorage] error eliminando "${key}":`, error);
    return false;
  }
}

export const asyncStorage = {
  getItem,
  setItem,
  removeItem,
};
