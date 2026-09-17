// Responsabilidad: pantalla de login (capa PRESENTATION de auth).
// Solo llama al caso de uso useAuth del dominio; no conoce Axios ni
// AsyncStorage directamente (eso vive en authRepository, capa data).

import { useState } from 'react';
import {
  Alert,
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
import { authRepository } from '../../data/authRepository';
import { useAuth } from '../../domain/useAuth';
import { AuthButton, AuthHeader, AuthInput } from '../components';

export default function LoginScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { login, isLoading } = useAuth(authRepository);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Datos incompletos', 'Ingresa tu correo electrónico y contraseña.');
      return;
    }

    try {
      await login({
        email: email.trim(),
        password,
      });
    } catch {
      Alert.alert('Error', 'No se pudo iniciar sesión.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <AuthHeader height={190} onBack={() => navigation.navigate('Welcome' as never)} />

        <View style={styles.card}>
          <Text style={styles.title}>Iniciar Sesión</Text>
          <Text style={styles.subtitle}>Rellena los campos para ingresar.</Text>

          <AuthInput
            label="RUT o Correo Electrónico"
            placeholder="ejemplo@correo.com o 12.345.678-k"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <AuthInput
            label="Contraseña"
            placeholder="••••••••••••"
            icon="key-outline"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <View style={styles.optionsRow}>
            <Pressable
              onPress={() => setRemember(!remember)}
              style={styles.rememberContainer}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: remember }}
            >
              <View style={[styles.checkbox, remember && styles.checkboxSelected]}>
                {remember && <Ionicons name="checkmark" size={16} color={colors.textLight} />}
              </View>

              <Text style={styles.rememberText}>Recordar</Text>
            </Pressable>

            <Pressable onPress={() => navigation.navigate('ForgotPassword' as never)}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </Pressable>
          </View>

          <AuthButton
            label="Ingresar"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
          />
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

  // La tarjeta sube sobre el encabezado para dejar ver el degradado detrás de
  // sus esquinas superiores redondeadas, como en el maqueteado.
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
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 28,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.authMuted,
    textAlign: 'center',
  },

  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
