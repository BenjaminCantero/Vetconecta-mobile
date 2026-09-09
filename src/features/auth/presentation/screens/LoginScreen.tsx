// Responsabilidad: pantalla de login (capa PRESENTATION de auth).
// Solo llama al caso de uso useAuth del dominio; no conoce Axios ni
// AsyncStorage directamente (eso vive en authRepository, capa data).

import { useState } from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';

import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';
import { colors } from '../../../../core/theme/colors';
import { authRepository } from '../../data/authRepository';
import { useAuth } from '../../domain/useAuth';

export default function LoginScreen() {
  const { login, isLoading } = useAuth(authRepository);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login({ email, password });
    } catch {
      Alert.alert('Error', 'No se pudo iniciar sesión.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>VetConecta</Text>
      <Input placeholder="Correo electrónico" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Input placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
      <Button label={isLoading ? 'Cargando...' : 'Ingresar'} onPress={handleLogin} disabled={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 12, backgroundColor: colors.background },
  title: { fontSize: 28, fontWeight: '700', color: colors.primary, marginBottom: 24, textAlign: 'center' },
});
