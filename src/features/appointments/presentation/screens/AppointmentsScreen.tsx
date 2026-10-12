// Responsabilidad: pantalla de citas (capa PRESENTATION de appointments).
// Solo llama al caso de uso useAppointments del dominio; no conoce Axios
// directamente (eso vive en appointmentsRepository, capa data).

import { useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivePetSwitcher } from '../../../../shared/components/ActivePetSwitcher';
import { EmergencyCard } from '../../../../shared/components/EmergencyCard';
import { QueryState } from '../../../../shared/components/QueryState';
import { ScreenHeader } from '../../../../shared/components/ScreenHeader';
import { SegmentedTabs } from '../../../../shared/components/SegmentedTabs';
import { formatMonthYear } from '../../../../shared/utils/formatDate';
import { useActivePet } from '../../../../shared/context/ActivePetContext';
import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import type { RootStackParamList } from '../../../../core/navigation/RootNavigator';
import type { TabParamList } from '../../../../core/navigation/TabNavigator';
import { appointmentsRepository } from '../../data/appointmentsRepository';
import { useAppointments } from '../../domain/useAppointments';
import { AppointmentCard } from '../components';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Citas'>,
  NativeStackScreenProps<RootStackParamList>
>;

type Section = 'upcoming' | 'past';

// Reprogramar y cancelar necesitan escritura (PUT/DELETE), que el backend aún
// no expone: por ahora la app solo lee. Se avisa en vez de simular la acción.
function notifyPendingBackend(action: string) {
  Alert.alert(
    'Todavía no disponible',
    `${action} estará habilitado cuando el backend publique los endpoints de escritura.`,
  );
}

export default function AppointmentsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const { appointments, isLoading, error, refetch } = useAppointments(appointmentsRepository);

  const { activePetId, activePet } = useActivePet();

  const [section, setSection] = useState<Section>('upcoming');
  const [now] = useState(() => Date.now());

  const { upcoming, past } = useMemo(() => {
    // Solo las citas de la mascota activa (F1); sin mascota activa, todas.
    const sorted = appointments
      .filter((appointment) => !activePetId || appointment.petId === activePetId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      upcoming: sorted.filter((appointment) => new Date(appointment.date).getTime() >= now),
      // El historial se lee de la más reciente hacia atrás.
      past: sorted.filter((appointment) => new Date(appointment.date).getTime() < now).reverse(),
    };
  }, [appointments, activePetId, now]);

  const visible = section === 'upcoming' ? upcoming : past;

  // Agrupadas por mes: la lista se recorre como un calendario.
  const groups = useMemo(() => {
    const byMonth = new Map<string, typeof visible>();

    visible.forEach((appointment) => {
      const month = formatMonthYear(appointment.date);
      byMonth.set(month, [...(byMonth.get(month) ?? []), appointment]);
    });

    return [...byMonth.entries()];
  }, [visible]);

  return (
    <View style={styles.screen}>
      <View style={[styles.headerArea, { paddingTop: insets.top + 12 }]}>
        <ScreenHeader
          title="Mis Citas"
          hasUnread
          onBellPress={() => navigation.navigate('Notificaciones')}
        />

        <ActivePetSwitcher />

        <SegmentedTabs
          options={[
            { value: 'upcoming', label: 'Próximas' },
            { value: 'past', label: 'Pasadas' },
          ]}
          value={section}
          onChange={setSection}
        />
      </View>

      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={appointments.length === 0}
        emptyMessage="Todavía no tienes citas. Cuando reserves una hora, aparecerá aquí con su veterinario y su estado."
        onRetry={refetch}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.appHeading} />
          }
        >
          {/* Vacío de la sección elegida: la lista completa sí tiene citas. */}
          {visible.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                {section === 'upcoming'
                  ? `${activePet?.name ?? 'Tu mascota'} no tiene citas agendadas`
                  : `${activePet?.name ?? 'Tu mascota'} no tiene citas anteriores`}
              </Text>
              <Text style={styles.emptyText}>
                {section === 'upcoming'
                  ? 'Cuando reserves una hora, aparecerá aquí con su veterinario y su estado.'
                  : 'Aquí quedará el registro de las citas que ya pasaron.'}
              </Text>
            </View>
          ) : (
            groups.map(([month, items]) => (
              <View key={month} style={styles.group}>
                <Text style={styles.groupTitle}>{month}</Text>

                {items.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onReschedule={
                      section === 'upcoming' ? () => notifyPendingBackend('Reprogramar') : undefined
                    }
                    onCancel={
                      section === 'upcoming' ? () => notifyPendingBackend('Cancelar') : undefined
                    }
                  />
                ))}
              </View>
            ))
          )}

          <EmergencyCard />
        </ScrollView>
      </QueryState>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },

  headerArea: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 16,
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    gap: 22,
  },

  group: {
    gap: 10,
  },

  groupTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.appTitle,
  },

  emptyCard: {
    borderRadius: 22,
    padding: 20,
    backgroundColor: colors.appSurface,
  },

  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.appTitle,
  },

  emptyText: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.appMuted,
  },
});
