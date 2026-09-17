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
import { AuthButton, AuthHeader, AuthInput, InfoNotice } from '../components';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleSend = () => {
    Alert.alert(
      'Código enviado',
      'Si el correo está registrado, recibirás un código para recuperar tu acceso.'
    );
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
        <AuthHeader
          height={210}
          roundedBottom
          onBack={() => navigation.navigate('Login' as never)}
        />

        <View style={styles.content}>
          <Text style={styles.title}>Recuperar Acceso</Text>
          <Text style={styles.description}>
            Te enviaremos el código de acceso a tu correo electrónico.
          </Text>

          <AuthInput
            label="Correo Electrónico"
            placeholder="ejemplo@correo.com"
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <AuthButton label="Enviar" onPress={handleSend} />

          <View style={styles.notice}>
            <InfoNotice message="¿No llegó el código tras 5 min? Reenvíalo o contáctanos" />
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
