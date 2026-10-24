// Responsabilidad: pantalla Mis Citas (capa PRESENTATION).
// Lista citas, filtra por mascota activa y permite cancelar reservas.
// Soporta consulta de datos guardados sin conexión (G1).
// D3: permite navegar al flujo de agendamiento.

import { useEffect, useMemo, useState } from 'react';

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
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
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

// Cuánto tiempo queda destacada la cita abierta desde una notificación push.
const FOCUS_HIGHLIGHT_MS = 4000;

export default function AppointmentsScreen({
  navigation,
  route,
}: Props) {
  const insets = useSafeAreaInsets();

  const {
    appointments,
    isLoading,
    isRefreshing,
    isOffline,
    error,
    refetch,
  } = useAppointments(appointmentsRepository);

  const { activePetId, activePet, setActivePetId } =
    useActivePet();

  const { cancel, isSubmitting } =
    useBookAppointment(bookingRepository);

  // Sección elegida por el dueño con las pestañas Próximas / Pasadas.
  const [chosenSection, setChosenSection] =
    useState<Section>('upcoming');

  const [cancellingId, setCancellingId] =
    useState<string | null>(null);

  // Recarga las citas al regresar desde el flujo de reserva.
  // Así, una nueva cita puede aparecer en Mis citas.
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const now = Date.now();

  // Llegada desde una notificación push (deep link con citaId): se muestra esa cita
  // en su mascota y en su sección, destacada unos segundos. Si la cita aún no está en
  // la lista (recién creada), se espera a que la recarga de arriba la traiga.
  const focusedAppointmentId = route.params?.citaId;

  const focusedAppointment = useMemo(
    () =>
      focusedAppointmentId
        ? (appointments.find(
            (appointment) => appointment.id === focusedAppointmentId,
          ) ?? null)
        : null,
    [appointments, focusedAppointmentId],
  );

  // La lista se filtra por la mascota activa: se cambia a la mascota de la cita.
  useEffect(() => {
    if (focusedAppointment) {
      setActivePetId(focusedAppointment.petId);
    }
  }, [focusedAppointment, setActivePetId]);

  // Pasado el destacado, se limpia el parámetro y la pantalla vuelve a la normalidad.
  useEffect(() => {
    if (!focusedAppointment) return;

    const timer = setTimeout(
      () => navigation.setParams({ citaId: undefined }),
      FOCUS_HIGHLIGHT_MS,
    );

    return () => clearTimeout(timer);
  }, [focusedAppointment, navigation]);

  // Mientras hay una cita destacada, la sección la decide su fecha;
  // si no, la que eligió el dueño.
  const section: Section = focusedAppointment
    ? new Date(focusedAppointment.date).getTime() >= now
      ? 'upcoming'
      : 'past'
    : chosenSection;

  const handleSectionChange = (next: Section) => {
    setChosenSection(next);

    if (focusedAppointmentId) {
      navigation.setParams({ citaId: undefined });
    }
  };

  // Separa citas próximas y pasadas.
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

  // Agrupa las citas por mes.
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

  // D3: abre la nueva pantalla de reserva.
  const handleSchedule = () => {
    if (isOffline) {
      Alert.alert(
        'Sin conexión',
        'Necesitas conexión a internet para reservar una hora.',
      );
      return;
    }

    navigation.navigate('BookAppointment');
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
          onChange={handleSectionChange}
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
                    highlighted={
                      appointment.id === focusedAppointment?.id
                    }
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

          {/* D3: permite agendar aunque ya existan citas. */}
          {visible.length > 0 &&
            section === 'upcoming' &&
            !isOffline && (
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
                  Agendar nueva hora
                </Text>
              </Pressable>
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
