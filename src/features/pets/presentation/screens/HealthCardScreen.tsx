// Responsabilidad: pantalla de carnet de salud (capa PRESENTATION de pets).
// Solo consume petsRepository.getHealthCard a través de useFetch; no conoce
// Axios directamente.

import { FlatList, Text, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Loader } from '../../../../shared/components/Loader';
import { useFetch } from '../../../../shared/hooks/useFetch';
import { formatDate } from '../../../../shared/utils/formatDate';
import { colors } from '../../../../core/theme/colors';
import type { RootStackParamList } from '../../../../core/navigation/RootNavigator';
import { petsRepository } from '../../data/petsRepository';

type Props = NativeStackScreenProps<RootStackParamList, 'HealthCard'>;

export default function HealthCardScreen({ route }: Props) {
  const { petId } = route.params;
  const { data: events, isLoading, error } = useFetch(() => petsRepository.getHealthCard(petId), [petId]);

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>No se pudo cargar el carnet de salud.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.list}
      data={events ?? []}
      keyExtractor={(event) => event.id}
      renderItem={({ item }) => (
        <View style={styles.eventCard}>
          <Text style={styles.eventType}>{item.type}</Text>
          <Text style={styles.eventDesc}>{item.description}</Text>
          <Text style={styles.eventMeta}>{formatDate(item.date)} · {item.veterinarian}</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>Sin eventos clínicos registrados.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: colors.danger },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
  eventCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12 },
  eventType: { fontSize: 16, fontWeight: '700', color: colors.secondary, textTransform: 'capitalize' },
  eventDesc: { fontSize: 14, color: colors.text, marginTop: 4 },
  eventMeta: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
});
