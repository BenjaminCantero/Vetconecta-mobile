// Responsabilidad: cliente Axios base (capa CORE / infraestructura).
// Único punto de la app que crea la instancia de Axios para la API. Los repositorios
// de cada feature (capa data) importan `httpClient`, nunca Axios directo.
//
// Interceptores JWT (B1, I3):
//  - request:  adjunta el access token en cada llamada saliente.
//  - response: ante un 401 intenta renovar el token y repetir la petición; si no se
//              puede, limpia la sesión y avisa vía sessionEvents (ver sessionRenewal).

import { create, isAxiosError, type InternalAxiosRequestConfig } from 'axios';

import { ENV } from '../config/env';
import { secureStorage } from '../storage/secureStorage';
import { clearSessionData } from '../storage/sessionStorage';
import { ENDPOINTS } from './endpoints';
import { notifySessionExpired } from './sessionEvents';
import { createSessionRenewal } from './sessionRenewal';
import { isRefreshRejected, requestTokenRefresh } from './tokenRefresh';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retriedAfterRefresh?: boolean;
  }
}

const BEARER_PREFIX = 'Bearer ';

export const httpClient = create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT_MS,
});

const sessionRenewal = createSessionRenewal({
  getAccessToken: secureStorage.getAccessToken,
  getRefreshToken: secureStorage.getRefreshToken,
  requestNewTokens: requestTokenRefresh,
  saveTokens: secureStorage.saveTokens,
  isRefreshRejected,
  endSession: async () => {
    await clearSessionData();
    notifySessionExpired();
  },
});

function getSentToken(config: InternalAxiosRequestConfig): string | null {
  const header = config.headers?.Authorization;

  if (typeof header !== 'string' || !header.startsWith(BEARER_PREFIX)) {
    return null;
  }

  return header.slice(BEARER_PREFIX.length);
}

// Request: adjunta el token JWT en cada petición saliente
httpClient.interceptors.request.use(async (config) => {
  const token = await secureStorage.getAccessToken();

  if (token) {
    config.headers.Authorization = `${BEARER_PREFIX}${token}`;
  }

  return config;
});

// Response: reacciona a un token invalido/expirado
httpClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!isAxiosError(error) || error.response?.status !== 401 || !error.config) {
      return Promise.reject(error);
    }

    const { config } = error;

    // El contrato de cambio de contraseña usa 401 también cuando la contraseña
    // actual no coincide. En ese caso el repositorio debe mostrar el error de
    // campo y conservar la sesión del dueño.
    if (config.url === ENDPOINTS.CLIENTS.PASSWORD) {
      return Promise.reject(error);
    }

    // Sin token (p. ej. login con contraseña incorrecta) no hay sesión que renovar.
    const sentToken = getSentToken(config);

    if (!sentToken) {
      return Promise.reject(error);
    }

    const decision = await sessionRenewal.handleUnauthorized(
      sentToken,
      Boolean(config._retriedAfterRefresh),
    );

    if (decision.action === 'retry') {
      config._retriedAfterRefresh = true;
      config.headers.Authorization = `${BEARER_PREFIX}${decision.accessToken}`;

      return httpClient.request(config);
    }

    return Promise.reject(error);
  },
);
