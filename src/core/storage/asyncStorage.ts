// Responsabilidad: wrapper tipado sobre AsyncStorage (capa CORE / infraestructura).
//
// Ningún módulo debe importar '@react-native-async-storage/async-storage'
// directamente. Todo el acceso al almacenamiento local pasa por este archivo
// para mantener la infraestructura aislada, reutilizable y testeable.

import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  // Token JWT de acceso.
  // Se utiliza para autenticar las peticiones hacia la API.
  AUTH_ACCESS_TOKEN: '@vetconecta/auth_access_token',

  // Token utilizado para renovar el access token cuando expire.
  AUTH_REFRESH_TOKEN: '@vetconecta/auth_refresh_token',

  // Información básica del usuario autenticado.
  AUTH_USER: '@vetconecta/auth_user',
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];

/**
 * Obtiene un valor desde AsyncStorage y lo deserializa.
 */
async function getItem<T>(key: StorageKey): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);

    return raw ? (JSON.parse(raw) as T) : null;
  } catch (error) {
    console.error(`[asyncStorage] error leyendo "${key}":`, error);

    return null;
  }
}

/**
 * Serializa y guarda un valor en AsyncStorage.
 */
async function setItem<T>(key: StorageKey, value: T): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));

    return true;
  } catch (error) {
    console.error(`[asyncStorage] error guardando "${key}":`, error);

    return false;
  }
}

/**
 * Elimina un valor específico de AsyncStorage.
 */
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
