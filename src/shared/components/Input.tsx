// Responsabilidad: input de texto genérico reutilizable
// (capa SHARED / presentation).

import { TextInput, StyleSheet, type TextInputProps } from 'react-native';

import { colors } from '../../core/theme/colors';
import { fonts } from '../../core/theme/typography';

export function Input({ style, accessibilityLabel, placeholder, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      allowFontScaling
      {...props}
      placeholder={placeholder}
      accessibilityLabel={accessibilityLabel || placeholder}
      style={[styles.input, style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.text,
  },
});
