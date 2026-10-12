// Responsabilidad: pantalla de login (capa PRESENTATION de auth).
// Consume la sesión global mediante useAuthSession.
// No conoce Axios ni AsyncStorage directamente.
// Los errores se muestran junto al campo (o sobre el botón si falla el
// ingreso), no en un Alert, para que el dueño corrija sin perder el contexto.

import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import { isValidEmail } from '../../../../shared/utils/validators';

import { useAuthSession } from '../context/AuthContext';

import { AuthButton, AuthHeader, AuthInput } from '../components';

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { login, isLoading } = useAuthSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async () => {
    const nextErrors: FieldErrors = {};

    if (!email.trim()) nextErrors.email = 'Ingresa tu correo electrónico.';
    else if (!isValidEmail(email.trim())) nextErrors.email = 'Revisa el formato del correo.';
    if (!password) nextErrors.password = 'Ingresa tu contraseña.';

    setErrors(nextErrors);
    setLoginError(null);

    if (nextErrors.email || nextErrors.password) return;

    try {
      await login({
        email: email.trim(),
        password,
      });

      // No navegamos manualmente.
      // RootNavigator detectará isAuthenticated = true
      // y mostrará automáticamente AppTabs.
    } catch (error) {
      setLoginError(
        error instanceof Error && error.message
          ? error.message
          : 'No pudimos iniciar sesión. Revisa tus datos e inténtalo de nuevo.',
      );
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
        bounces={false}
      >
        <AuthHeader height={190} showBrand onBack={() => navigation.navigate('Welcome' as never)} />

        <View style={styles.card}>
          <Text style={styles.title}>Iniciar sesión</Text>

          <Text style={styles.subtitle}>
            Entra con el correo que registraste en tu clínica veterinaria.
          </Text>

          <AuthInput
            label="Correo electrónico"
            placeholder="nombre@correo.com"
            icon="mail-outline"
            value={email}
            error={errors.email}
            onChangeText={(value) => {
              setEmail(value);
              if (errors.email) setErrors((current) => ({ ...current, email: undefined }));
            }}
            textContentType="emailAddress"
            autoComplete="email"
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <AuthInput
            label="Contraseña"
            placeholder="Tu contraseña"
            icon="lock-closed-outline"
            value={password}
            error={errors.password}
            onChangeText={(value) => {
              setPassword(value);
              if (errors.password) setErrors((current) => ({ ...current, password: undefined }));
            }}
            textContentType="password"
            autoComplete="password"
            secureTextEntry
            autoCapitalize="none"
          />

          <View style={styles.optionsRow}>
            <Pressable
              onPress={() => setRemember(!remember)}
              style={styles.rememberContainer}
              accessibilityRole="checkbox"
              accessibilityState={{
                checked: remember,
              }}
            >
              <View style={[styles.checkbox, remember && styles.checkboxSelected]}>
                {remember && <Ionicons name="checkmark" size={16} color={colors.textLight} />}
              </View>

              <Text style={styles.rememberText}>Recordarme</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate('ForgotPassword' as never)}
              hitSlop={10}
              accessibilityRole="link"
            >
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </Pressable>
          </View>

          {loginError && (
            <View style={styles.loginError} accessibilityLiveRegion="polite">
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={styles.loginErrorText}>{loginError}</Text>
            </View>
          )}

          <AuthButton
            label="Ingresar"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Aún no tienes cuenta?</Text>
            <Pressable
              onPress={() => navigation.navigate('Register' as never)}
              hitSlop={10}
              accessibilityRole="link"
            >
              <Text style={styles.footerLink}>Crear cuenta</Text>
            </Pressable>
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

  card: {
    flex: 1,
    marginTop: -44,
    paddingTop: 36,
    paddingHorizontal: 26,

    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,

    backgroundColor: colors.authBackground,
  },

  title: {
    fontFamily: fonts.extrabold,
    fontSize: 28,
    color: colors.authTitle,
  },

  subtitle: {
    marginTop: 6,
    marginBottom: 26,

    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 21,

    color: colors.authMuted,
  },

  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 20,
  },

  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },

  checkbox: {
    width: 24,
    height: 24,

    borderWidth: 1.5,
    borderColor: colors.authCheckboxBorder,

    borderRadius: 6,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  checkboxSelected: {
    backgroundColor: colors.authButton,

    borderColor: colors.authButton,
  },

  rememberText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.authTitle,
  },

  forgotText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.authLink,
  },

  loginError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.tintRed,
  },

  loginErrorText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.danger,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },

  footerText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.authMuted,
  },

  footerLink: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.authLink,
  },
});
