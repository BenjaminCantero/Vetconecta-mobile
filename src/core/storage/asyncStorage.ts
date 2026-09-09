// Responsabilidad: wrapper tipado sobre AsyncStorage (capa CORE / infraestructura).
// Ningún módulo debe importar '@react-native-async-storage/async-storage'
// directamente: siempre pasan por acá para mantener el acceso a
// almacenamiento local aislado y testeable.

import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  AUTH_TOKEN: '@vetconecta/auth_token',
  AUTH_USER: '@vetconecta/auth_user',
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];

async function getItem<T>(key: StorageKey): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (error) {
    console.error(`[asyncStorage] error leyendo "${key}":`, error);
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
