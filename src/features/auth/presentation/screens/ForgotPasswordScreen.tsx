// Responsabilidad: pantalla de recuperación de contraseña.
// Capa PRESENTATION de auth.
//
// Consume la sesión/casos de uso mediante useAuthSession.
// No conoce Axios, endpoints, microservicios ni AsyncStorage.

import { useState } from 'react';

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../../../core/theme/colors';

import { fonts } from '../../../../core/theme/typography';

import { useAuthSession } from '../context/AuthContext';

import { AuthButton, AuthHeader, AuthInput, InfoNotice } from '../components';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();

  const insets = useSafeAreaInsets();

  const { requestPasswordReset, isLoading } = useAuthSession();

  const [email, setEmail] = useState('');

  const handleSend = async () => {
    if (!email.trim()) {
      Alert.alert('Correo requerido', 'Ingresa tu correo electrónico.');

      return;
    }

    try {
      await requestPasswordReset({
        email: email.trim(),
      });

      Alert.alert(
        'Solicitud enviada',
        'Si el correo está registrado, recibirás instrucciones para recuperar tu acceso.',
      );
    } catch {
      Alert.alert('Error', 'No se pudo procesar la solicitud de recuperación.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom: insets.bottom + 32,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <AuthHeader
          height={210}
          roundedBottom
          onBack={() => navigation.navigate('Login' as never)}
        />

        <View style={styles.content}>
          <Text style={styles.title}>Recuperar Acceso</Text>

          <Text style={styles.description}>
            Te enviaremos las instrucciones de recuperación a tu correo electrónico.
          </Text>

          <AuthInput
            label="Correo Electrónico"
            placeholder="ejemplo@correo.com"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <AuthButton
            label="Enviar"
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

  notice: {
    marginTop: 20,
  },
});
