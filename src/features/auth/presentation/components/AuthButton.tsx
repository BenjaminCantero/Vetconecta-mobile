import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';

type AuthButtonVariant = 'primary' | 'light' | 'outline';

interface AuthButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  // primary: formularios; light y outline: sobre el degradado de Bienvenida.
  variant?: AuthButtonVariant;
}

export function AuthButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
}: AuthButtonProps) {
  const textColor = variant === 'light' ? colors.primary : colors.textLight;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && styles.buttonPressed,
        (disabled || loading) && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primary: {
    backgroundColor: colors.authButton,
  },

  light: {
    backgroundColor: colors.background,
  },

  outline: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
  },

  buttonPressed: {
    opacity: 0.85,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  label: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
});
