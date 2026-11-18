// Responsabilidad: pedir un access token nuevo (capa CORE). Usa su propia
// instancia de Axios, sin los interceptores de httpClient, para que un 401 de la
// renovación no dispare otra renovación.
// Contrato pendiente con el equipo Web: POST { refreshToken } → { accessToken, refreshToken? }

import { create, isAxiosError } from 'axios';

import { ENV } from '../config/env';
import { ENDPOINTS } from './endpoints';
import type { RenewedTokens } from './sessionRenewal';

interface RefreshResponseDto {
  accessToken?: unknown;
  refreshToken?: unknown;
}

export class InvalidRefreshResponseError extends Error {
  constructor() {
    super('La renovación de sesión no devolvió un token válido.');
    this.name = 'InvalidRefreshResponseError';
  }
}

const refreshClient = create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT_MS,
});

export async function requestTokenRefresh(refreshToken: string): Promise<RenewedTokens> {
  const { data } = await refreshClient.post<RefreshResponseDto>(ENDPOINTS.SESSION.REFRESH, {
    refreshToken,
  });

  if (typeof data?.accessToken !== 'string' || !data.accessToken) {
    throw new InvalidRefreshResponseError();
  }

  return {
    accessToken: data.accessToken,
    refreshToken:
      typeof data.refreshToken === 'string' && data.refreshToken ? data.refreshToken : undefined,
  };
}

// 4xx o respuesta sin token: el refresh token ya no sirve.
export function isRefreshRejected(error: unknown): boolean {
  if (error instanceof InvalidRefreshResponseError) {
    return true;
  }

  const status = isAxiosError(error) ? error.response?.status : undefined;

  return status !== undefined && status >= 400 && status < 500;
}
