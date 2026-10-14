// Responsabilidad: pantalla Mis Citas (capa PRESENTATION).
// Lista citas, filtra por mascota activa y permite cancelar reservas.
// Soporta consulta de datos guardados sin conexión (G1).

import { useMemo, useState } from 'react';

import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
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
import { bookingRepository } from '../../data/bookingRepository';

import { useAppointments } from '../../domain/useAppointments';
import { useBookAppointment } from '../../domain/useBookAppointment';
import { SinConexionError } from '../../domain/bookingErrors';
import type { Appointment } from '../../domain/Appointment';

import { AppointmentCard } from '../components';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Citas'>,
  NativeStackScreenProps<RootStackParamList>
>;

type Section = 'upcoming' | 'past';

export default function AppointmentsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const {
    appointments,
    isLoading,
    isRefreshing,
    isOffline,
    error,
    refetch,
  } = useAppointments(appointmentsRepository);

  const { activePetId, activePet } = useActivePet();

  const { cancel, isSubmitting } =
    useBookAppointment(bookingRepository);

  const [section, setSection] = useState<Section>('upcoming');

  const [cancellingId, setCancellingId] =
    useState<string | null>(null);

  // Se actualiza al renderizar la pantalla.
  const now = Date.now();

  const { upcoming, past } = useMemo(() => {
    const sorted = appointments
      .filter(
        (appointment) =>
          !activePetId || appointment.petId === activePetId,
      )
      .sort(
        (a, b) =>
          new Date(a.date).getTime() -
          new Date(b.date).getTime(),
      );

    return {
      upcoming: sorted.filter(
        (appointment) =>
          new Date(appointment.date).getTime() >= now,
      ),
      past: sorted
        .filter(
          (appointment) =>
            new Date(appointment.date).getTime() < now,
        )
        .reverse(),
    };
  }, [appointments, activePetId, now]);

  const visible =
    section === 'upcoming' ? upcoming : past;

  const groups = useMemo(() => {
    const byMonth = new Map<string, Appointment[]>();

    visible.forEach((appointment) => {
      const month = formatMonthYear(appointment.date);

      byMonth.set(month, [
        ...(byMonth.get(month) ?? []),
        appointment,
      ]);
    });

    return [...byMonth.entries()];
  }, [visible]);

  const canCancelAppointment = (
    appointment: Appointment,
  ): boolean => {
    return (
      appointment.status === 'reservada' &&
      new Date(appointment.date).getTime() > Date.now() &&
      !isSubmitting &&
      cancellingId === null &&
      !isOffline
    );
  };

  const handleCancel = (appointmentId: string) => {
    if (isSubmitting || cancellingId !== null || isOffline) {
      return;
    }

    Alert.alert(
      'Cancelar cita',
      '¿Estás seguro de que deseas cancelar esta reserva?',
      [
        {
          text: 'Volver',
          style: 'cancel',
        },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            if (isSubmitting || cancellingId !== null) {
              return;
            }

            setCancellingId(appointmentId);

            try {
              const result = await cancel(appointmentId);

              if (result) {
                refetch();

                Alert.alert(
                  'Cita cancelada',
                  'Tu reserva fue cancelada correctamente.',
                );
              }
            } catch (cancelError) {
              Alert.alert(
                cancelError instanceof SinConexionError
                  ? 'Sin conexión'
                  : 'No se pudo cancelar',
                cancelError instanceof Error
                  ? cancelError.message
                  : 'Ocurrió un error inesperado.',
              );
            } finally {
              setCancellingId(null);
            }
          },
        },
      ],
    );
  };

  // D3 todavía no tiene una pantalla registrada en RootNavigator.
  // Se informa al usuario sin navegar a una ruta inexistente.
  const handleSchedule = () => {
    Alert.alert(
      'Agendar hora',
      'Estamos preparando el flujo para agendar una nueva cita.',
    );
  };

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.headerArea,
          { paddingTop: insets.top + 12 },
        ]}
      >
        <ScreenHeader
          title="Mis Citas"
          hasUnread
          onBellPress={() =>
            navigation.navigate('Notificaciones')
          }
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
        isEmpty={false}
        onRetry={refetch}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refetch}
              tintColor={colors.appHeading}
            />
          }
        >
          {isOffline && (
            <View style={styles.offlineBanner}>
              <Ionicons
                name="cloud-offline-outline"
                size={21}
                color={colors.statusPending}
              />

              <View style={styles.offlineTexts}>
                <Text style={styles.offlineTitle}>
                  Datos sin conexión
                </Text>

                <Text style={styles.offlineDescription}>
                  Estás viendo las últimas citas guardadas.
                  Desliza hacia abajo cuando recuperes la conexión.
                </Text>
              </View>
            </View>
          )}

          {visible.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={28}
                  color={colors.appHeading}
                />
              </View>

              <Text style={styles.emptyTitle}>
                {section === 'upcoming'
                  ? 'No tienes citas próximas'
                  : 'No tienes citas pasadas'}
              </Text>

              <Text style={styles.emptyText}>
                {section === 'upcoming'
                  ? activePet
                    ? `${activePet.name} no tiene reservas próximas.`
                    : 'Todavía no tienes reservas próximas.'
                  : activePet
                    ? `${activePet.name} no tiene citas anteriores.`
                    : 'Aquí aparecerá el historial de tus citas.'}
              </Text>

              {section === 'upcoming' && !isOffline && (
                <Pressable
                  style={styles.scheduleButton}
                  onPress={handleSchedule}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color={colors.textLight}
                  />

                  <Text style={styles.scheduleButtonText}>
                    Agendar hora
                  </Text>
                </Pressable>
              )}
            </View>
          ) : (
            groups.map(([month, items]) => (
              <View key={month} style={styles.group}>
                <Text style={styles.groupTitle}>
                  {month}
                </Text>

                {items.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onCancel={
                      canCancelAppointment(appointment)
                        ? () => handleCancel(appointment.id)
                        : undefined
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

  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 16,
    padding: 15,
    backgroundColor: colors.tintOrange,
  },

  offlineTexts: {
    flex: 1,
    gap: 4,
  },

  offlineTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.statusPending,
  },

  offlineDescription: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.appTitle,
  },

  emptyCard: {
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    backgroundColor: colors.appSurface,
  },

  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    backgroundColor: colors.tintPurple,
  },

  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.appTitle,
    textAlign: 'center',
  },

  emptyText: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.appMuted,
    textAlign: 'center',
  },

  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 22,
    marginTop: 20,
    backgroundColor: colors.appHeading,
  },

  scheduleButtonText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.textLight,
  },
});