// Responsabilidad: pantalla de carnet digital (capa PRESENTATION de pets).
// Consume el caso de uso usePets para el nombre de la mascota y el repositorio
// (vía useFetch) para sus eventos clínicos; no conoce Axios. Solo lectura:
// muestra un resumen, un filtro por tipo y los eventos como línea de tiempo
// agrupada por año.

import { Fragment, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivePetSwitcher } from '../../../../shared/components/ActivePetSwitcher';
import { QueryState } from '../../../../shared/components/QueryState';
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

  const {
    data: events,
    isLoading,
    error,
    refetch,
  } = useFetch(() => petsRepository.getHealthCard(petId), [petId]);

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
      ? { label: 'Próximo', date: next.date }
      : { label: 'Último registro', date: ordered[ordered.length - 1]?.date ?? null };
  }, [events, now]);

  // Solo se ofrecen los tipos que la mascota tiene registrados.
  const types = useMemo(
    () =>
      (Object.keys(CLINICAL_EVENT_STYLE) as ClinicalEventType[]).filter((type) =>
        (events ?? []).some((event) => event.type === type),
      ),
    [events],
  );

  // Al cambiar de mascota, un tipo que ya no existe vuelve a "Todo".
  const activeFilter = filter !== 'todos' && types.includes(filter) ? filter : 'todos';

  // Los más recientes (o los próximos) primero, agrupados por año.
  const timeline = buildTimeline(
    (events ?? []).filter((event) => activeFilter === 'todos' || event.type === activeFilter),
  );

  const stats = [
    { label: 'Vacunas', value: String(summary.vaccines) },
    { label: 'Atenciones', value: String(summary.visits) },
    { label: nextOrLast.label, value: formatShortDate(nextOrLast.date) },
  ];

  const filters: { value: ClinicalEventType | 'todos'; label: string }[] = [
    { value: 'todos', label: 'Todo' },
    ...types.map((type) => ({ value: type, label: CLINICAL_EVENT_STYLE[type].label })),
  ];

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
        </View>
      </View>

      {/* Cambiar de mascota aquí recarga el carnet sin volver atrás (F1). */}
      <ActivePetSwitcher
        style={styles.switcher}
        onChange={(id) => navigation.setParams({ petId: id })}
      />

      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={(events ?? []).length === 0}
        emptyMessage={`Todavía no hay vacunas, controles ni tratamientos registrados para ${pet?.name ?? 'tu mascota'}.`}
        onRetry={refetch}
      >
        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stats}>
            {stats.map((stat, index) => (
              <Fragment key={stat.label}>
                {index > 0 && <View style={styles.divider} />}
                <View style={styles.stat}>
                  <Text style={styles.statLabel} numberOfLines={1}>
                    {stat.label}
                  </Text>
                  <Text style={styles.statValue} numberOfLines={1}>
                    {stat.value}
                  </Text>
                </View>
              </Fragment>
            ))}
          </View>

          {types.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
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
                    accessibilityState={{ selected }}
                    android_ripple={{ color: colors.appDivider }}
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
    alignItems: 'center',
    justifyContent: 'center',
  },

  titles: {
    flex: 1,
  },

  title: {
    fontFamily: fonts.extrabold,
    fontSize: 24,
    color: colors.appHeading,
  },

  list: {
    paddingHorizontal: 20,
    gap: 20,
  },

  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: colors.appSurface,
  },

  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.appDivider,
  },

  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
  },

  statLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.appMuted,
  },

  statValue: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.appTitle,
  },

  filtersScroll: {
    flexGrow: 0,
    marginHorizontal: -20,
  },

  filters: {
    gap: 8,
    paddingHorizontal: 20,
  },

  filter: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.appDivider,
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
  },

  filterLabelSelected: {
    color: colors.textLight,
  },
});
