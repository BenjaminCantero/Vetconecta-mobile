// Responsabilidad: manejo unificado de los estados de una lectura GET.
// Centraliza los estados de carga, error y vacío.

import type { ReactNode } from 'react';
import { Text, View, StyleSheet } from 'react-native';

import { colors } from '../../core/theme/colors';
import { fonts } from '../../core/theme/typography';
import { Button } from './Button';
import { Loader } from './Loader';

interface QueryStateProps {
  isLoading: boolean;
  error: Error | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptySuggestion?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  onRetry?: () => void;
  children: ReactNode;
}

export function QueryState({
  isLoading,
  error,
  isEmpty = false,
  emptyMessage = 'No hay información disponible.',
  emptySuggestion,
  emptyActionLabel,
  onEmptyAction,
  onRetry,
  children,
}: QueryStateProps) {
  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error} accessibilityLiveRegion="polite" accessibilityRole="alert">
          {error.message || 'No pudimos cargar la información. Inténtalo nuevamente.'}
        </Text>

        {onRetry ? <Button label="Reintentar" onPress={onRetry} style={styles.action} /> : null}
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty} accessibilityLiveRegion="polite">
          {emptyMessage}
        </Text>

        {emptySuggestion ? <Text style={styles.suggestion}>{emptySuggestion}</Text> : null}

        {emptyActionLabel && onEmptyAction ? (
          <Button label={emptyActionLabel} onPress={onEmptyAction} style={styles.action} />
        ) : null}
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.appBackground,
  },
  error: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 21,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 16,
  },
  empty: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 21,
    color: colors.appTitle,
    textAlign: 'center',
  },
  suggestion: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.appMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  action: {
    marginTop: 16,
    minHeight: 48,
  },
});
