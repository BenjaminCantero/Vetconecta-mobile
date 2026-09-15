import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../../../../core/theme/colors';

export default function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.logo}>
            VetConecta
          </Text>

          <Text style={styles.title}>
            Cuidado y bienestar{'\n'}para tus mascotas.
          </Text>

          <View style={styles.illustration}>
            <Text style={styles.illustrationText}>
              🐶 🐱
            </Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => {}}
          >
            <Text style={styles.primaryButtonText}>
              Crear Cuenta
            </Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              navigation.navigate('Login' as never)
            }
          >
            <Text style={styles.secondaryButtonText}>
              Iniciar Sesión
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 12,
  },

  title: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },

  illustration: {
    width: '100%',
    height: 260,
    marginTop: 32,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  illustrationText: {
    fontSize: 70,
  },

  buttons: {
    width: '100%',
    gap: 12,
  },

  primaryButton: {
    height: 52,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '700',
  },

  secondaryButton: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});