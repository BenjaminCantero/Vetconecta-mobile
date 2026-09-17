import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import { AppLogo, AuthButton, AuthGradient } from '../components';

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <AuthGradient
      wavesTop={insets.top + 24}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 32 }]}
    >
      <View style={styles.content}>
        <AppLogo size={76} />

        <Text style={styles.title}>VetConecta</Text>
        <Text style={styles.subtitle}>Cuidado y bienestar para tus mascotas.</Text>

        {/* Espacio reservado para la ilustración 3D: reemplazar por <Image> cuando llegue el asset. */}
        <View style={styles.illustration}>
          <Ionicons name="image-outline" size={28} color="rgba(60,30,90,0.55)" />
          <Text style={styles.illustrationText}>Ilustración 3D de bienvenida</Text>
        </View>
      </View>

      <View style={styles.buttons}>
        <AuthButton label="Crear Cuenta" variant="light" onPress={() => {}} />
        <AuthButton
          label="Iniciar Sesión"
          variant="outline"
          onPress={() => navigation.navigate('Login' as never)}
        />
      </View>
    </AuthGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 26,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    marginTop: 18,
    fontFamily: fonts.extrabold,
    fontSize: 28,
    color: colors.textLight,
  },

  subtitle: {
    marginTop: 4,
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
  },

  illustration: {
    width: 190,
    height: 250,
    marginTop: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(80,40,110,0.45)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },

  illustrationText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: 'rgba(40,20,60,0.7)',
    textAlign: 'center',
  },

  buttons: {
    width: '100%',
    gap: 14,
  },
});
