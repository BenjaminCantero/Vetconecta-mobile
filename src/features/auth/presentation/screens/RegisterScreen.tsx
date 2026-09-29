// Responsabilidad: pantalla de registro (capa PRESENTATION de auth).
// Consume la sesión global mediante useAuthSession.
// No conoce Axios ni AsyncStorage directamente.

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

import { useAuthSession } from '../context/AuthContext';

import { AuthButton, AuthHeader, AuthInput } from '../components';

export default function RegisterScreen() {
  const navigation = useNavigation();

  const insets = useSafeAreaInsets();

  const { register, isLoading } = useAuthSession();

  const [nombres, setNombres] = useState('');

  const [apellidos, setApellidos] = useState('');

  const [rut, setRut] = useState('');

  const [email, setEmail] = useState('');

  const [telefono, setTelefono] = useState('');

  const [password, setPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleRegister = async () => {
    if (
      !nombres.trim() ||
      !apellidos.trim() ||
      !rut.trim() ||
      !email.trim() ||
      !telefono.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert('Datos incompletos', 'Completa todos los campos para crear tu cuenta.');

      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Contraseñas diferentes', 'Las contraseñas ingresadas no coinciden.');

      return;
    }

    if (password.length < 6) {
      Alert.alert('Contraseña no válida', 'La contraseña debe tener al menos 6 caracteres.');

      return;
    }

    if (!acceptTerms) {
      Alert.alert(
        'Términos y condiciones',
        'Debes aceptar los términos y condiciones para continuar.',
      );

      return;
    }

    try {
      await register({
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        rut: rut.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        password,
      });

      Alert.alert('Cuenta creada', 'Tu cuenta fue creada correctamente.', [
        {
          text: 'Continuar',

          onPress: () => navigation.navigate('Login' as never),
        },
      ]);
    } catch {
      Alert.alert('Error', 'No se pudo crear la cuenta.');
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
        <AuthHeader height={190} onBack={() => navigation.navigate('Welcome' as never)} />

        <View style={styles.card}>
          <Text style={styles.title}>Crear Cuenta</Text>

          <Text style={styles.subtitle}>Completa tus datos para registrarte en VetConecta.</Text>

          <AuthInput
            label="Nombres"
            placeholder="Ej: Juan Carlos "
            icon="person-outline"
            value={nombres}
            onChangeText={setNombres}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <AuthInput
            label="Apellidos"
            placeholder="Ej: Rodriguez Zabala"
            icon="person-outline"
            value={apellidos}
            onChangeText={setApellidos}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <AuthInput
            label="RUT"
            placeholder="Ej: 12.345.678-9"
            icon="card-outline"
            value={rut}
            onChangeText={setRut}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <AuthInput
            label="Correo Electrónico"
            placeholder="ejemplo@correo.com"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <AuthInput
            label="Teléfono"
            placeholder="+56 9 1234 5678"
            icon="call-outline"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
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

          <AuthInput
            label="Confirmar Contraseña"
            placeholder="••••••••••••"
            icon="lock-closed-outline"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <Pressable
            style={styles.termsRow}
            onPress={() => setAcceptTerms(!acceptTerms)}
            accessibilityRole="checkbox"
            accessibilityState={{
              checked: acceptTerms,
            }}
          >
            <View style={[styles.checkbox, acceptTerms && styles.checkboxSelected]}>
              {acceptTerms && <Ionicons name="checkmark" size={16} color={colors.textLight} />}
            </View>

            <Text style={styles.termsText}>
              Acepto los <Text style={styles.termsLink}>términos y condiciones</Text>
            </Text>
          </Pressable>

          <AuthButton
            label="Crear Cuenta"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>

            <Pressable onPress={() => navigation.navigate('Login' as never)}>
              <Text style={styles.loginLink}>Iniciar Sesión</Text>
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
    paddingBottom: 32,

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
    lineHeight: 21,

    color: colors.authMuted,

    textAlign: 'center',
  },

  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 24,
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

  termsText: {
    flex: 1,

    fontFamily: fonts.regular,

    fontSize: 13,

    color: colors.authMuted,
  },

  termsLink: {
    fontFamily: fonts.bold,

    color: colors.authLink,
  },

  loginRow: {
    flexDirection: 'row',

    justifyContent: 'center',

    alignItems: 'center',

    marginTop: 22,
  },

  loginText: {
    fontFamily: fonts.regular,

    fontSize: 14,

    color: colors.authMuted,
  },

  loginLink: {
    fontFamily: fonts.bold,

    fontSize: 14,

    color: colors.authLink,
  },
});
