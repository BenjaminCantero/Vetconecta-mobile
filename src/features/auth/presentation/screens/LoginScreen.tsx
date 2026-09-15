// Responsabilidad: pantalla de login (capa PRESENTATION de auth).
// Solo llama al caso de uso useAuth del dominio; no conoce Axios ni
// AsyncStorage directamente (eso vive en authRepository, capa data).

import { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../../../../core/theme/colors';
import { authRepository } from '../../data/authRepository';
import { useAuth } from '../../domain/useAuth';
import { AuthButton, AuthInput } from '../components';

export default function LoginScreen() {
  const navigation = useNavigation();

  const { login, isLoading } = useAuth(authRepository);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        'Datos incompletos',
        'Ingresa tu correo electrónico y contraseña.',
      );
      return;
    }

    try {
      await login({
        email: email.trim(),
        password,
      });
    } catch {
      Alert.alert(
        'Error',
        'No se pudo iniciar sesión.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.navigate('Welcome' as never)}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹ Volver</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Iniciar Sesión</Text>

          <Text style={styles.subtitle}>
            Ingresa tus datos para continuar
          </Text>

          <View style={styles.form}>
            <AuthInput
              label="RUT o Correo Electrónico"
              placeholder="Ingresa tu RUT o correo"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />

            <AuthInput
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <View style={styles.optionsRow}>
              <Pressable
                onPress={() => setRemember(!remember)}
                style={styles.rememberContainer}
              >
                <View
                  style={[
                    styles.checkbox,
                    remember && styles.checkboxSelected,
                  ]}
                >
                  {remember && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>

                <Text style={styles.rememberText}>
                  Recordar
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  navigation.navigate('ForgotPassword' as never)
                }
              >
                <Text style={styles.forgotText}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </Pressable>
            </View>

            <AuthButton
              label="Ingresar"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },

  header: {
    height: 40,
    justifyContent: 'center',
  },

  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },

  backText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
  },

  form: {
    width: '100%',
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
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  checkmark: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '700',
  },

  rememberText: {
    fontSize: 14,
    color: colors.text,
  },

  forgotText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});
