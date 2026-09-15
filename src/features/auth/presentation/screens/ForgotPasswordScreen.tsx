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
import {
  AuthButton,
  AuthInput,
} from '../components';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();

  const handleSend = () => {
    Alert.alert(
      'Código enviado',
      'Si el correo está registrado, recibirás un código para recuperar tu acceso.',
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={() =>
            navigation.navigate('Login' as never)
          }
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ‹ Volver
          </Text>
        </Pressable>

        <View style={styles.content}>
          <Text style={styles.title}>
            Recuperar Acceso
          </Text>

          <Text style={styles.description}>
            Te enviaremos un código para que puedas
            recuperar el acceso a tu cuenta.
          </Text>

          <AuthInput
            label="Correo Electrónico"
            placeholder="Ingresa tu correo"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <AuthButton
            label="Enviar"
            onPress={handleSend}
          />

          <Text style={styles.helpText}>
            ¿No llegó el código tras 5 minutos?
          </Text>

          <Pressable>
            <Text style={styles.contactText}>
              Reenvíalo o contáctanos
            </Text>
          </Pressable>
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
    marginBottom: 12,
  },

  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
  },

  helpText: {
    marginTop: 28,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },

  contactText: {
    marginTop: 6,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});