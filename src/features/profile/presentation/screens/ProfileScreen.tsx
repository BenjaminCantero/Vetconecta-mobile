import { useEffect, useState, type ComponentProps } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../../core/navigation/RootNavigator';
import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import { Button } from '../../../../shared/components/Button';
import { QueryState } from '../../../../shared/components/QueryState';
import {
  hasValidPasswordFormat,
  isValidChileanMobile,
  isValidEmail,
} from '../../../../shared/utils/validators';
import { useAuthSession } from '../../../auth';
import { profileRepository } from '../../data/profileRepository';
import { useOwnerProfile } from '../../domain/useOwnerProfile';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

type ContactErrors = { email?: string; phone?: string };
type PasswordErrors = { current?: string; password?: string; confirmation?: string };

function Field({
  label,
  error,
  editable = true,
  ...props
}: ComponentProps<typeof TextInput> & { label: string; error?: string; editable?: boolean }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = props.secureTextEntry === true;

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          {...props}
          editable={editable}
          secureTextEntry={isPassword && !passwordVisible}
          accessibilityLabel={label}
          placeholderTextColor={colors.appMuted}
          style={[
            styles.input,
            styles.flexInput,
            !editable && styles.readonlyInput,
            error && styles.inputError,
          ]}
        />
        {isPassword ? (
          <Pressable
            style={styles.visibilityButton}
            onPress={() => setPasswordVisible((visible) => !visible)}
            accessibilityRole="button"
            accessibilityLabel={`${passwordVisible ? 'Ocultar' : 'Mostrar'} ${label.toLowerCase()}`}
          >
            <Ionicons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.appHeading}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export default function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { logout } = useAuthSession();
  const { profile, isLoading, error, reload, updateContact, changePassword } =
    useOwnerProfile(profileRepository);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contactErrors, setContactErrors] = useState<ContactErrors>({});
  const [contactMessage, setContactMessage] = useState<string | null>(null);
  const [contactSaving, setContactSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza el formulario tras la carga remota
      setEmail(profile.email);
      setPhone(profile.phone);
    }
  }, [profile]);

  const saveContact = async () => {
    const nextErrors: ContactErrors = {};
    if (!isValidEmail(email.trim())) nextErrors.email = 'Ingresa un correo electrónico válido.';
    if (!isValidChileanMobile(phone)) nextErrors.phone = 'Usa el formato +56 9 XXXX XXXX.';
    setContactErrors(nextErrors);
    setContactMessage(null);
    if (Object.keys(nextErrors).length) return;

    setContactSaving(true);
    try {
      await updateContact({ email: email.trim(), phone: phone.trim() });
      setContactMessage('Tus datos de contacto se guardaron correctamente.');
    } catch (reason) {
      setContactMessage(
        reason instanceof Error
          ? reason.message
          : 'No pudimos guardar tus cambios. Inténtalo nuevamente.',
      );
    } finally {
      setContactSaving(false);
    }
  };

  const savePassword = async () => {
    const nextErrors: PasswordErrors = {};
    if (!currentPassword) nextErrors.current = 'Ingresa tu contraseña actual.';
    if (!hasValidPasswordFormat(newPassword)) {
      nextErrors.password = 'Usa al menos 8 caracteres, con letras y números.';
    }
    if (newPassword !== confirmation) nextErrors.confirmation = 'Las contraseñas no coinciden.';
    setPasswordErrors(nextErrors);
    setPasswordMessage(null);
    if (Object.keys(nextErrors).length) return;

    setPasswordSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      Alert.alert(
        'Contraseña actualizada',
        'Por seguridad, vuelve a iniciar sesión con tu nueva contraseña.',
        [{ text: 'Continuar', onPress: () => void logout() }],
      );
    } catch (reason) {
      setPasswordMessage(
        reason instanceof Error
          ? reason.message
          : 'No pudimos cambiar tu contraseña. Inténtalo nuevamente.',
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => {
          void logout()
            .then(() => {
              if (Platform.OS === 'android') {
                ToastAndroid.show('Sesión cerrada correctamente.', ToastAndroid.SHORT);
              }
            })
            .catch(() => {
              Alert.alert('No pudimos cerrar sesión', 'Inténtalo nuevamente.');
            });
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Ionicons name="chevron-back" size={24} color={colors.appHeading} />
        </Pressable>
        <Text style={styles.title}>Mi perfil</Text>
        <View style={styles.headerSpacer} />
      </View>

      <QueryState isLoading={isLoading} error={error} onRetry={reload}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
          keyboardDismissMode="none"
        >
          <View style={styles.identity}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={28} color={colors.appHeading} />
            </View>
            <View>
              <Text style={styles.name}>{profile?.fullName}</Text>
              <Text style={styles.helper}>Datos del dueño de las mascotas</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos personales</Text>
            <Field label="Nombre" value={profile?.fullName ?? ''} editable={false} />
            <Field label="RUT" value={profile?.rut ?? ''} editable={false} />
            <Text style={styles.readonlyNote}>El RUT no se puede editar desde la aplicación.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos de contacto</Text>
            <Field
              label="Correo electrónico"
              value={email}
              error={contactErrors.email}
              onChangeText={(value) => {
                setEmail(value);
                setContactErrors((current) => ({ ...current, email: undefined }));
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            <Field
              label="Teléfono"
              value={phone}
              error={contactErrors.phone}
              onChangeText={(value) => {
                setPhone(value);
                setContactErrors((current) => ({ ...current, phone: undefined }));
              }}
              keyboardType="phone-pad"
              placeholder="+56 9 XXXX XXXX"
              textContentType="telephoneNumber"
            />
            {contactMessage ? <Text style={styles.status}>{contactMessage}</Text> : null}
            <Button
              label={contactSaving ? 'Guardando…' : 'Guardar cambios'}
              onPress={() => void saveContact()}
              disabled={contactSaving}
            />
          </View>

          <View style={styles.section}>
            <Pressable
              onPress={() => setShowPasswordForm((visible) => !visible)}
              style={styles.passwordToggle}
              accessibilityRole="button"
              accessibilityState={{ expanded: showPasswordForm }}
            >
              <View>
                <Text style={styles.sectionTitle}>Contraseña</Text>
                <Text style={styles.helper}>Actualiza tu acceso cuando lo necesites.</Text>
              </View>
              <Ionicons
                name={showPasswordForm ? 'chevron-up' : 'chevron-down'}
                size={22}
                color={colors.appHeading}
              />
            </Pressable>

            {showPasswordForm ? (
              <View style={styles.passwordForm}>
                <Field
                  label="Contraseña actual"
                  value={currentPassword}
                  error={passwordErrors.current}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  textContentType="password"
                />
                <Field
                  label="Nueva contraseña"
                  value={newPassword}
                  error={passwordErrors.password}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  textContentType="newPassword"
                />
                <Field
                  label="Confirmar nueva contraseña"
                  value={confirmation}
                  error={passwordErrors.confirmation}
                  onChangeText={setConfirmation}
                  secureTextEntry
                  textContentType="newPassword"
                />
                <Text style={styles.passwordHint}>Mínimo 8 caracteres, con letras y números.</Text>
                {passwordMessage ? <Text style={styles.error}>{passwordMessage}</Text> : null}
                <Button
                  label={passwordSaving ? 'Cambiando…' : 'Cambiar contraseña'}
                  onPress={() => void savePassword()}
                  disabled={passwordSaving}
                />
              </View>
            ) : null}
          </View>
        </ScrollView>
      </QueryState>
      <View style={[styles.logoutContainer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          onPress={confirmLogout}
          style={styles.logoutButton}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
          disabled={contactSaving || passwordSaving}
          accessibilityState={{ disabled: contactSaving || passwordSaving }}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.danger} />
          <Text style={styles.logoutLabel}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBackground },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: colors.appBackground,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: colors.appSurface,
    borderWidth: 1,
    borderColor: colors.appDivider,
  },
  headerSpacer: { width: 44 },
  title: { fontFamily: fonts.extrabold, fontSize: 22, color: colors.appTitle },
  content: { paddingHorizontal: 20, gap: 20 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 8 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tintPurple,
  },
  name: { fontFamily: fonts.bold, fontSize: 18, color: colors.appTitle },
  helper: { marginTop: 3, fontFamily: fonts.regular, fontSize: 13, color: colors.appMuted },
  section: { gap: 12, padding: 18, borderRadius: 20, backgroundColor: colors.appSurface },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.appTitle },
  fieldGroup: { gap: 6 },
  scroll: { flex: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  flexInput: { flex: 1, minWidth: 0 },
  visibilityButton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: colors.appMuted },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.appDivider,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.appTitle,
    backgroundColor: colors.appSurface,
  },
  readonlyInput: { color: colors.appMuted, backgroundColor: colors.statSurface },
  inputError: { borderColor: colors.danger },
  error: { fontFamily: fonts.medium, fontSize: 12, color: colors.danger },
  readonlyNote: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.appMuted },
  status: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 19, color: colors.success },
  passwordToggle: {
    minHeight: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passwordForm: { gap: 12 },
  logoutContainer: { paddingHorizontal: 20, paddingTop: 12 },
  logoutButton: {
    minHeight: 48,
    minWidth: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.appSurface,
  },
  logoutLabel: { fontFamily: fonts.semibold, fontSize: 15, color: colors.danger },
  passwordHint: { fontFamily: fonts.regular, fontSize: 12, color: colors.appMuted },
});
