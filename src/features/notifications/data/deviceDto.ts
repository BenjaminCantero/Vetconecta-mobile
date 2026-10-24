// Responsabilidad: tipos request de registro de dispositivo para push (capa DATA).
// Forma propuesta para POST /dispositivos; pendiente de confirmar con Web H1 en el OpenAPI.

export interface RegisterDeviceRequestDto {
  token: string;
  plataforma: 'android' | 'ios';
  // Con expo-notifications, Android entrega un token de FCM e iOS uno de APNs: el backend
  // necesita saberlo para elegir por dónde enviar.
  proveedor: 'fcm' | 'apns';
}
