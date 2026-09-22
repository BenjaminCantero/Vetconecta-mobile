// Responsabilidad: pantalla de citas (capa PRESENTATION de appointments).
// Solo llama al caso de uso useAppointments del dominio; no conoce Axios
// directamente (eso vive en appointmentsRepository, capa data).

import { FlatList, Text, View, StyleSheet } from 'react-native';

import { QueryState } from '../../../../shared/components/QueryState';
import { formatDate } from '../../../../shared/utils/formatDate';
import { colors } from '../../../../core/theme/colors';
import { appointmentsRepository } from '../../data/appointmentsRepository';
import { useAppointments } from '../../domain/useAppointments';

export default function AppointmentsScreen() {
  const { appointments, isLoading, error, refetch } = useAppointments(appointmentsRepository);

  return (
    <QueryState
      isLoading={isLoading}
      error={error}
      isEmpty={appointments.length === 0}
      emptyMessage="No tienes citas agendadas."
      onRetry={refetch}
    >
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.list}
        data={appointments}
        keyExtractor={(appointment) => appointment.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.reason}>{item.reason}</Text>
            <Text style={styles.meta}>{formatDate(item.date)} · {item.veterinarian}</Text>
            <Text style={styles.status}>{item.status}</Text>
          </View>
        )}
      />
    </QueryState>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12 },
  reason: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  status: { fontSize: 12, color: colors.primary, marginTop: 6, textTransform: 'uppercase' },
});

