// Responsabilidad: botón genérico reutilizable (capa SHARED / presentation).

import { Pressable, Text, StyleSheet, type PressableProps } from 'react-native';

import { colors } from '../../core/theme/colors';

interface ButtonProps extends PressableProps {
  label: string;
}

export function Button({ label, style, ...props }: ButtonProps) {
  return (
    <Pressable style={[styles.button, style as object]} {...props}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
