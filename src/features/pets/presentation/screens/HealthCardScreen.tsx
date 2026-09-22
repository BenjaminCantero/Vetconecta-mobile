// Responsabilidad: pantalla de carnet de salud (capa PRESENTATION de pets).
// Consume el caso de uso usePets para el nombre de la mascota y el repositorio
// (vía useFetch) para sus eventos clínicos; no conoce Axios.

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QueryState } from '../../../../shared/components/QueryState';
import { useFetch } from '../../../../shared/hooks/useFetch';
import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import type { RootStackParamList } from '../../../../core/navigation/RootNavigator';
import { petsRepository } from '../../data/petsRepository';
import { summarizeHealthCard } from '../../domain/summarizeHealthCard';
import { usePets } from '../../domain/usePets';
import { ClinicalEventCard } from '../components/ClinicalEventCard';

type Props = NativeStackScreenProps<RootStackParamList, 'HealthCard'>;

export default function HealthCardScreen({ route, navigation }: Props) {
  const { petId } = route.params;
  const insets = useSafeAreaInsets();

  const { pets } = usePets(petsRepository);
  const pet = pets.find((item) => item.id === petId);

  const {
    data: events,
    isLoading,
    error,
    refetch,
  } = useFetch(() => petsRepository.getHealthCard(petId), [petId]);

  const [now] = useState(() => Date.now());

  const summary = summarizeHealthCard(events ?? []);

  // Los más recientes (o los próximos) primero.
  const ordered = [...(events ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          android_ripple={{ color: colors.appDivider, borderless: true }}
          style={styles.back}
        >
          <Ionicons name="chevron-back" size={24} color={colors.appHeading} />
        </Pressable>

        <View style={styles.titles}>
          <Text style={styles.title} numberOfLines={1}>
            Carnet de {pet?.name ?? 'tu mascota'}
          </Text>
          <Text style={styles.subtitle}>
            {summary.vaccines} vacunas · {summary.visits} atenciones
          </Text>
        </View>
      </View>

      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={ordered.length === 0}
        emptyMessage={`Todavía no hay vacunas, controles ni tratamientos registrados para ${pet?.name ?? 'tu mascota'}.`}
        onRetry={refetch}
      >
        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {ordered.map((event) => (
            <ClinicalEventCard
              key={event.id}
              event={event}
              isUpcoming={new Date(event.date).getTime() >= now}
            />
          ))}
        </ScrollView>
      </QueryState>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  back: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titles: {
    flex: 1,
  },

  title: {
    fontFamily: fonts.extrabold,
    fontSize: 22,
    color: colors.appHeading,
  },

  subtitle: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.appMuted,
  },

  list: {
    paddingHorizontal: 20,
    gap: 12,
  },
});
