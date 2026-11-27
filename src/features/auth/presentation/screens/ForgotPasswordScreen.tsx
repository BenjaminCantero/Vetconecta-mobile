// Responsabilidad: pantalla de recuperación de contraseña.
// Capa PRESENTATION de auth.

import { useState } from 'react';

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import { isValidEmail } from '../../../../shared/utils/validators';

import { useAuthSession } from '../context/AuthContext';
import { AuthButton, AuthHeader, AuthInput, InfoNotice } from '../components';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { requestPasswordReset, isLoading } = useAuthSession();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSend = async () => {
    setEmailError(null);
    setRequestError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setEmailError('Ingresa tu correo electrónico.');
      return;
    }

    if (!isValidEmail(email.trim())) {
      setEmailError('Revisa el formato de tu correo electrónico.');
      return;
    }

    try {
      await requestPasswordReset({
        email: email.trim(),
      });

      const message =
        'Si el correo está registrado, recibirás instrucciones para recuperar tu acceso.';

      setSuccessMessage(message);

      if (Platform.OS === 'android') {
        ToastAndroid.show('Solicitud enviada correctamente.', ToastAndroid.LONG);
      } else {
        Alert.alert('Solicitud enviada', message);
      }
    } catch {
      setRequestError('No se pudo procesar la solicitud de recuperación. Inténtalo nuevamente.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom: insets.bottom + 32,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator
        bounces={false}
      >
        <AuthHeader
          height={210}
          roundedBottom
          onBack={() => navigation.navigate('Login' as never)}
        />

        <View style={styles.content}>
          <Text style={styles.title}>Recuperar acceso</Text>

          <Text style={styles.description}>
            Te enviaremos las instrucciones de recuperación a tu correo electrónico.
          </Text>

          <AuthInput
            label="Correo electrónico"
            placeholder="ejemplo@correo.com"
            icon="mail-outline"
            value={email}
            error={emailError}
            onChangeText={(value) => {
              setEmail(value);
              setEmailError(null);
              setRequestError(null);
              setSuccessMessage(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
          />

          {requestError && (
            <View style={styles.errorBox} accessibilityLiveRegion="polite">
              <Text style={styles.errorText}>{requestError}</Text>
            </View>
          )}

          {successMessage && (
            <View style={styles.successBox} accessibilityLiveRegion="polite">
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          <AuthButton
            label={requestError ? 'Reintentar' : 'Enviar'}
            onPress={handleSend}
            loading={isLoading}
            disabled={isLoading}
          />

          <View style={styles.notice}>
            <InfoNotice message="¿No llegó el correo tras 5 min? Inténtalo nuevamente o contáctanos." />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.authBackground,
  },

  scrollView: {
    flex: 1,
  },

  scroll: {
    flexGrow: 1,
  },

  content: {
    paddingTop: 20,
    paddingHorizontal: 26,
  },

  title: {
    fontFamily: fonts.extrabold,
    fontSize: 28,
    color: colors.authTitle,
    textAlign: 'center',
  },

  description: {
    marginTop: 10,
    marginBottom: 28,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.authMuted,
    textAlign: 'center',
  },

  errorBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.tintRed,
    marginBottom: 16,
  },

  errorText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19,
    color: colors.danger,
  },

  successBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.appSurface,
    marginBottom: 16,
  },

  successText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19,
    color: colors.success,
  },

  notice: {
    marginTop: 20,
  },
});
