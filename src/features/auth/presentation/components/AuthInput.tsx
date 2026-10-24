// Responsabilidad: campo de texto del flujo de auth (capa PRESENTATION).
// Marca el foco con el color del botón principal, muestra el error debajo del
// campo (no en un Alert) y, si es una contraseña, permite verla u ocultarla.

import { useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';

interface AuthInputProps extends TextInputProps {
  label: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
  error?: string | null;
}

export function AuthInput({
  label,
  icon,
  error,
  secureTextEntry,
  onFocus,
  onBlur,
  ...textInputProps
}: AuthInputProps) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const isPassword = Boolean(secureTextEntry);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.field, focused && styles.fieldFocused, error && styles.fieldError]}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={error ? colors.danger : focused ? colors.authButton : colors.authMuted}
          />
        )}

        <TextInput
          {...textInputProps}
          accessibilityLabel={label}
          secureTextEntry={isPassword && !revealed}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={styles.input}
          placeholderTextColor={colors.authMuted}
        />

        {isPassword && (
          <Pressable
            onPress={() => setRevealed((value) => !value)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <Ionicons
              name={revealed ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.authMuted}
            />
          </Pressable>
        )}
      </View>

      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 18,
  },

  label: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.authLabel,
    marginBottom: 8,
  },

  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.appDivider,
    backgroundColor: colors.authInput,
    paddingHorizontal: 16,
  },

  fieldFocused: {
    borderColor: colors.authButton,
    backgroundColor: colors.appSurface,
  },

  fieldError: {
    borderColor: colors.danger,
  },

  input: {
    flex: 1,
    minHeight: 54,
    paddingVertical: 12,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.authTitle,
  },

  error: {
    marginTop: 6,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.danger,
  },
});
