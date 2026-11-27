// Responsabilidad: pantalla de carnet digital (capa PRESENTATION de pets).
// Consume el caso de uso usePets para el nombre de la mascota y el repositorio
// (vía useFetch) para sus eventos clínicos; no conoce Axios. Solo lectura:
// muestra un resumen, un filtro por tipo y los eventos como línea de tiempo
// agrupada por año.

import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivePetSwitcher } from '../../../../shared/components/ActivePetSwitcher';
import { OfflineBanner } from '../../../../shared/components/OfflineBanner';
import { QueryState } from '../../../../shared/components/QueryState';
import { StatRow } from '../../../../shared/components/StatRow';
import { useFetch } from '../../../../shared/hooks/useFetch';
import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import type { RootStackParamList } from '../../../../core/navigation/RootNavigator';
import { petsRepository } from '../../data/petsRepository';
import { buildTimeline } from '../../domain/buildTimeline';
import type { ClinicalEventType } from '../../domain/ClinicalEvent';
import { formatShortDate } from '../../domain/formatPetProfile';
import { summarizeHealthCard } from '../../domain/summarizeHealthCard';
import { usePets } from '../../domain/usePets';
import { CLINICAL_EVENT_STYLE } from '../components/ClinicalEventCard';
import { ClinicalTimeline } from '../components/ClinicalTimeline';

type Props = NativeStackScreenProps<RootStackParamList, 'HealthCard'>;

export default function HealthCardScreen({ route, navigation }: Props) {
  const { petId } = route.params;
  const insets = useSafeAreaInsets();

  const { pets } = usePets(petsRepository);
  const pet = pets.find((item) => item.id === petId);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          accessibilityHint="Regresa a la pantalla anterior"
          android_ripple={{
            color: colors.appDivider,
            borderless: true,
          }}
          style={styles.back}
        >
          <Ionicons name="chevron-back" size={24} color={colors.appHeading} />
        </Pressable>

        <View style={styles.titles}>
          <Text accessibilityRole="header" style={styles.title}>
            Carnet de {pet?.name ?? 'tu mascota'}
          </Text>
        </View>
      </View>

      {/* Cambiar de mascota recarga el carnet sin volver atrás. */}
      <ActivePetSwitcher
        style={styles.switcher}
        onChange={(id) => navigation.setParams({ petId: id })}
      />

      <HealthCardContent
        key={petId}
        petId={petId}
        petName={pet?.name ?? 'tu mascota'}
        bottomInset={insets.bottom}
      />
    </View>
  );
}

interface HealthCardContentProps {
  petId: string;
  petName: string;
  bottomInset: number;
}

function HealthCardContent({ petId, petName, bottomInset }: HealthCardContentProps) {
  const {
    data: snapshot,
    isLoading,
    error,
    refetch,
  } = useFetch(() => petsRepository.getHealthCardSnapshot(petId), [petId]);

  const events = snapshot?.data;

  const [now] = useState(() => Date.now());

  const [filter, setFilter] = useState<ClinicalEventType | 'todos'>('todos');

  const summary = summarizeHealthCard(events ?? []);

  // Próximo evento programado; si no hay, el último registrado.
  const nextOrLast = useMemo(() => {
    const ordered = [...(events ?? [])].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const next = ordered.find((event) => new Date(event.date).getTime() >= now);

    return next
      ? {
          label: 'Próximo evento',
          date: next.date,
        }
      : {
          label: 'Último registro',
          date: ordered[ordered.length - 1]?.date ?? null,
        };
  }, [events, now]);

  // Solo se ofrecen los tipos que la mascota tiene registrados.
  const types = useMemo(
    () =>
      (Object.keys(CLINICAL_EVENT_STYLE) as ClinicalEventType[]).filter((type) =>
        (events ?? []).some((event) => event.type === type),
      ),
    [events],
  );

  const activeFilter = filter !== 'todos' && types.includes(filter) ? filter : 'todos';

  // Eventos agrupados por año.
  const timeline = buildTimeline(
    (events ?? []).filter((event) => activeFilter === 'todos' || event.type === activeFilter),
  );

  const stats = [
    {
      label: 'Vacunas',
      value: String(summary.vaccines),
    },
    {
      label: 'Atenciones',
      value: String(summary.visits),
    },
    {
      label: nextOrLast.label,
      value: formatShortDate(nextOrLast.date),
    },
  ];

  const filters: {
    value: ClinicalEventType | 'todos';
    label: string;
  }[] = [
    { value: 'todos', label: 'Todos' },
    ...types.map((type) => ({
      value: type,
      label: CLINICAL_EVENT_STYLE[type].label,
    })),
  ];

  return (
    <View style={styles.body}>
      {snapshot?.fromCache && !isLoading && (
        <OfflineBanner updatedAt={snapshot.updatedAt} style={styles.offlineBanner} />
      )}

      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={(events ?? []).length === 0}
        emptyMessage={`Todavía no hay vacunas, controles ni tratamientos registrados para ${petName}.`}
        emptySuggestion="Si tu mascota recibió una atención recientemente, consulta con tu clínica veterinaria o actualiza el carnet."
        emptyActionLabel="Actualizar carnet"
        onEmptyAction={refetch}
        onRetry={refetch}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.list, { paddingBottom: bottomInset + 24 }]}
          showsVerticalScrollIndicator
        >
          <StatRow items={stats} />

          {types.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator
              contentContainerStyle={styles.filters}
              style={styles.filtersScroll}
            >
              {filters.map((option) => {
                const selected = option.value === activeFilter;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setFilter(option.value)}
                    accessibilityRole="button"
                    accessibilityLabel={`Filtrar por ${option.label.toLowerCase()}`}
                    accessibilityState={{ selected }}
                    android_ripple={{
                      color: colors.appDivider,
                    }}
                    style={[styles.filter, selected && styles.filterSelected]}
                  >
                    <Text style={[styles.filterLabel, selected && styles.filterLabelSelected]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          <ClinicalTimeline sections={timeline} now={now} />
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

  body: {
    flex: 1,
  },

  offlineBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  switcher: {
    flexGrow: 0,
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  back: {
    width: 48,
    height: 48,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titles: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontFamily: fonts.extrabold,
    fontSize: 24,
    color: colors.appHeading,
  },

  scroll: {
    flex: 1,
  },

  list: {
    paddingHorizontal: 20,
    gap: 20,
  },

  filtersScroll: {
    flexGrow: 0,
    marginHorizontal: -20,
  },

  filters: {
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 6,
    alignItems: 'center',
  },

  filter: {
    minHeight: 48,
    minWidth: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.appMuted,
    backgroundColor: colors.appSurface,
    overflow: 'hidden',
  },

  filterSelected: {
    borderColor: colors.appTitle,
    backgroundColor: colors.appTitle,
  },

  filterLabel: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.appMuted,
    textAlign: 'center',
  },

  filterLabelSelected: {
    color: colors.textLight,
  },
});
