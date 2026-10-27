// Responsabilidad: cliente Axios base (capa CORE / infraestructura).
// Único punto de la app que crea una instancia de Axios. Los repositorios
// de cada feature (capa data) importan `httpClient`, nunca Axios directo.
//
// Interceptores JWT (B1):
//  - request:  adjunta el access token en cada llamada saliente.
//  - response: ante un 401 (token inválido o expirado) limpia la sesión local,
//              para que la app no siga mandando un token muerto, y avisa vía
//              sessionEvents para que auth vuelva al flujo de login.
//
// Diferido (bloqueado por backend): la renovación silenciosa con refresh token
// requiere POST /auth/refresh (aun no se expone)

import { create } from 'axios';

import { ENV } from '../config/env';
import { StorageKeys, asyncStorage } from '../storage/asyncStorage';
import { ENDPOINTS } from './endpoints';
import { notifySessionExpired } from './sessionEvents';

export const httpClient = create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT_MS,
});

// Request: adjunta el token JWT en cada petición saliente
httpClient.interceptors.request.use(async (config) => {
  const token = await asyncStorage.getItem<string>(StorageKeys.AUTH_ACCESS_TOKEN);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response: reacciona a un token invalido/expirado
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 401 = Token invalido o expirado, sesion cerrada
    // 403 = autenticado pero sin permiso
    // El contrato de cambio de contraseña usa 401 también cuando la contraseña
    // actual no coincide. En ese caso el repositorio debe mostrar el error de
    // campo y conservar la sesión del dueño.
    const isPasswordValidation = error.config?.url === ENDPOINTS.CLIENTS.PASSWORD;
    if (error.response?.status === 401 && !isPasswordValidation) {
      await asyncStorage.removeItem(StorageKeys.AUTH_ACCESS_TOKEN);
      await asyncStorage.removeItem(StorageKeys.AUTH_REFRESH_TOKEN);
      await asyncStorage.removeItem(StorageKeys.AUTH_USER);
      notifySessionExpired();
    }

    return Promise.reject(error);
  },
);
