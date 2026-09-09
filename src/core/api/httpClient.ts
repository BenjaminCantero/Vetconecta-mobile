// Responsabilidad: cliente Axios base (capa CORE / infraestructura).
// Único punto de la app que crea una instancia de Axios. Los repositorios
// de cada feature (capa data) importan `httpClient`, nunca Axios directo.

import axios from 'axios';

import { ENV } from '../config/env';
import { StorageKeys, asyncStorage } from '../storage/asyncStorage';

export const httpClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT_MS,
});

httpClient.interceptors.request.use(async (config) => {
  const token = await asyncStorage.getItem<string>(StorageKeys.AUTH_TOKEN);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
