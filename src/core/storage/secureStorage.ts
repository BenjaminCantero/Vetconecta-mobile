// Responsabilidad: guardar los tokens JWT en el almacén cifrado del sistema
// (capa CORE). Usa Keychain en iOS y Keystore en Android. AsyncStorage no cifra
// sus datos, por eso los tokens no se guardan ahí (NFR-4).

import * as SecureStore from 'expo-secure-store';

// SecureStore solo acepta letras, números, ".", "-" y "_" en sus claves.
const ACCESS_TOKEN_KEY = 'vetconecta.auth_access_token';
const REFRESH_TOKEN_KEY = 'vetconecta.auth_refresh_token';

async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('[secureStorage] error leyendo el token:', error);
    return null;
  }
}

// El error no se captura: si el token no se pudo guardar, el login debe fallar.
async function saveTokens(accessToken: string, refreshToken?: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);

  if (refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }
}

async function clearTokens(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('[secureStorage] error eliminando los tokens:', error);
  }
}

export const secureStorage = {
  getAccessToken,
  saveTokens,
  clearTokens,
};
