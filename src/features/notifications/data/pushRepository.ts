// Responsabilidad: acceso a notificaciones push del dispositivo (capa DATA).
// Implementa el contrato PushRepository del dominio sobre core/notifications (expo-notifications)
// y registra el token en el backend vía httpClient.
//
// Mientras ENV.USE_MOCKS esté activo, el token NO se envía al backend (el endpoint aún no existe);
// en desarrollo se imprime en la consola de Metro para copiarlo en la consola de Firebase.

import { ENDPOINTS } from '../../../core/api/endpoints';
import { httpClient } from '../../../core/api/httpClient';
import { ENV } from '../../../core/config/env';
import {
  createRemindersChannel,
  getNativePushToken,
  getPushPermission,
  onNativePushTokenChange,
  requestPushPermission,
} from '../../../core/notifications/pushClient';

import type { DeviceToken, PushRepository } from '../domain/usePushRegistration';
import type { RegisterDeviceRequestDto } from './deviceDto';

function toRegisterDeviceRequestDto(device: DeviceToken): RegisterDeviceRequestDto {
  return {
    token: device.token,
    plataforma: device.platform,
    proveedor: device.platform === 'android' ? 'fcm' : 'apns',
  };
}

export const pushRepository: PushRepository = {
  prepareChannels: createRemindersChannel,

  getPermission: getPushPermission,

  requestPermission: requestPushPermission,

  async getDeviceToken() {
    try {
      return await getNativePushToken();
    } catch (error) {
      // Lo más común: la app se compiló sin google-services.json.
      if (__DEV__) {
        console.warn('[push] No se pudo obtener el token del dispositivo:', error);
      }
      return null;
    }
  },

  onDeviceTokenChange: onNativePushTokenChange,

  async registerDeviceToken(device) {
    if (__DEV__) {
      console.log(`[push] Token ${device.platform} del dispositivo:\n${device.token}`);
    }

    if (ENV.USE_MOCKS) return;

    await httpClient.post(
      ENDPOINTS.NOTIFICATIONS.REGISTER_DEVICE,
      toRegisterDeviceRequestDto(device),
    );
  },
};
