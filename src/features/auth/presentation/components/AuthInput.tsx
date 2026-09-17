import type { ComponentProps } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';

interface AuthInputProps extends TextInputProps {
  label: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
}

export function AuthInput({ label, icon, ...textInputProps }: AuthInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.field}>
        {icon && <Ionicons name={icon} size={18} color={colors.authMuted} />}

        <TextInput
          {...textInputProps}
          style={styles.input}
          placeholderTextColor={colors.authMuted}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },

  label: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.authLabel,
    marginBottom: 10,
  },

  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.authInput,
    paddingHorizontal: 16,
  },

  input: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.authTitle,
  },
});
