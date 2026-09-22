// Responsabilidad: manejo unificado de los estados de una lectura GET
// (capa SHARED / presentation). Centraliza los tres estados que toda pantalla
// que consume datos debe cubrir: cargando, error y vacío. Si hay datos, muestra
// su contenido (children). Así ninguna pantalla reimplementa estos estados a
// mano y todas muestran el MISMO mensaje de error (el que arma core/api/httpError).

import type { ReactNode } from 'react';
import { Text, View, StyleSheet } from 'react-native';

import { colors } from '../../core/theme/colors';
import { fonts } from '../../core/theme/typography';
import { Button } from './Button';
import { Loader } from './Loader';

interface QueryStateProps {
  isLoading: boolean;
  error: Error | null;
  // La pantalla decide qué significa "vacío" (lista sin elementos, dato nulo…).
  isEmpty?: boolean;
  emptyMessage?: string;
  // Si se pasa, el estado de error muestra un botón "Reintentar".
  onRetry?: () => void;
  children: ReactNode;
}

export function QueryState({
  isLoading,
  error,
  isEmpty = false,
  emptyMessage = 'No hay nada que mostrar.',
  onRetry,
  children,
}: QueryStateProps) {
  // Orden de prioridad: primero cargando, luego error, luego vacío, luego datos.
  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error.message}</Text>
        {onRetry ? <Button label="Reintentar" onPress={onRetry} style={styles.retry} /> : null}
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>{emptyMessage}</Text>
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
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 21,
    color: colors.appMuted,
    textAlign: 'center',
  },
  retry: { marginTop: 8 },
});
