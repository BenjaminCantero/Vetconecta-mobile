// Responsabilidad: conectar las notificaciones push con la app (capa PRESENTATION de notifications).
// No dibuja nada. Se monta en TabNavigator, es decir, solo con la sesión iniciada, y:
//  1. Activa los recordatorios: explica el permiso, lo pide y registra el token (usePushRegistration).
//  2. Al tocar una notificación, navega a la cita (citaId) o al centro de notificaciones.
//
// Actúa como composition root: inyecta pushRepository y el diálogo de explicación.

import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../core/navigation/RootNavigator';
import { useLastNotificationTap } from '../../../../core/notifications/pushClient';
import { pushRepository } from '../../data/pushRepository';
import { resolveNotificationTarget } from '../../domain/NotificationTarget';
import { usePushRegistration } from '../../domain/usePushRegistration';

// Toques ya atendidos durante esta ejecución de la app. Evita volver a navegar a la misma cita si
// el puente se monta de nuevo (por ejemplo, al cerrar sesión y volver a entrar).
const handledTaps = new Set<string>();

// Explicación previa al aviso del sistema: el dueño sabe para qué se usa antes de decidir.
// Si responde "Ahora no", el sistema no gasta su única oportunidad de preguntar (iOS) y se vuelve
// a ofrecer en el próximo inicio de sesión.
function explainPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      'Activa los recordatorios',
      'VetConecta te avisará 24 horas antes de cada cita y cuando se acerque un control o una ' +
        'vacuna de tu mascota.',
      [
        { text: 'Ahora no', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Activar', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

export function PushNotificationsBridge() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tap = useLastNotificationTap();

  usePushRegistration(pushRepository, explainPermission);

  useEffect(() => {
    if (!tap || handledTaps.has(tap.id)) return;

    handledTaps.add(tap.id);

    const target = resolveNotificationTarget(tap.data);

    if (target.screen === 'appointment') {
      navigation.navigate('AppTabs', {
        screen: 'Citas',
        params: { citaId: target.appointmentId },
      });
      return;
    }

    navigation.navigate('AppTabs', { screen: 'Notificaciones' });
  }, [tap, navigation]);

  return null;
}
