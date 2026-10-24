// Responsabilidad: botón genérico reutilizable (capa SHARED / presentation).

import { Pressable, Text, StyleSheet, type PressableProps } from 'react-native';

import { colors } from '../../core/theme/colors';
import { fonts } from '../../core/theme/typography';

interface ButtonProps extends PressableProps {
  label: string;
}

export function Button({ label, style, disabled, ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      android_ripple={{ color: '#FFFFFF26' }}
      style={[styles.button, disabled && styles.disabled, style as object]}
      {...props}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  label: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  disabled: { opacity: 0.5 },
});
