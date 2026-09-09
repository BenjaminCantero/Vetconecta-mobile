// Responsabilidad: input de texto genérico reutilizable (capa SHARED / presentation).

import { TextInput, StyleSheet, type TextInputProps } from 'react-native';

import { colors } from '../../core/theme/colors';

export function Input(props: TextInputProps) {
  return (
    <TextInput
      style={styles.input}
      placeholderTextColor={colors.textMuted}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.text,
  },
});
