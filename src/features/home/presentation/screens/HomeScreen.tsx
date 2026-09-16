// Responsabilidad: pantalla de inicio (feature TRANSVERSAL home).
// home NO posee entidad propia: solo AGREGA datos de varios dominios,
// consumiéndolos por su superficie pública (los barrels), nunca por sus data/.
// Regla de oro (A2): home depende de los dominios; ningún dominio depende de home.

import { ScrollView, Text, View, StyleSheet } from 'react-native';

import { useMemo, useState } from 'react';
import { useAuth, authRepository } from '../../../auth';
import { petsRepository } from '../../../pets';
import { useAppointments, appointmentsRepository } from '../../../appointments';
import { useFetch } from '../../../../shared/hooks/useFetch';
import { formatDate } from '../../../../shared/utils/formatDate';
import { Loader } from '../../../../shared/components/Loader';
import { colors } from '../../../../core/theme/colors';

export default function HomeScreen() {
  const { user } = useAuth(authRepository);
  const { data: pets, isLoading: petsLoading } = useFetch(() => petsRepository.getMyPets(), []);
  const { appointments, isLoading: apptsLoading } = useAppointments(appointmentsRepository);


  const [now] = useState(() => Date.now());

  const nextAppointment = useMemo(() => {
    return [...appointments]
      .filter((a) => new Date(a.date).getTime() >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }, [appointments, now]);

  if (petsLoading || apptsLoading) return <Loader />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Hola{user ? `, ${user.name}` : ''}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mis mascotas</Text>
        <Text style={styles.cardValue}>{pets?.length ?? 0}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Próxima cita</Text>
        {nextAppointment ? (
          <>
            <Text style={styles.cardValue}>{formatDate(nextAppointment.date)}</Text>
            <Text style={styles.cardMeta}>
              {nextAppointment.reason} · {nextAppointment.veterinarian}
            </Text>
          </>
        ) : (
          <Text style={styles.cardMeta}>No tienes citas agendadas.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 16 },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 13, color: colors.textMuted, textTransform: 'uppercase' },
  cardValue: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 4 },
  cardMeta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
});
