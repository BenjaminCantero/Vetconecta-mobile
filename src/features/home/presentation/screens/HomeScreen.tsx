// Responsabilidad: pantalla de inicio (feature TRANSVERSAL home).
// home NO posee entidad propia: solo AGREGA datos de varios dominios,
// consumiéndolos por su superficie pública (los barrels), nunca por sus data/.
// Regla de oro (A2): home depende de los dominios; ningún dominio depende de home.

import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthSession } from '../../../auth';
import { usePets, petsRepository } from '../../../pets';
import { useAppointments, appointmentsRepository } from '../../../appointments';
import { ActionCard } from '../../../../shared/components/ActionCard';
import { EmergencyCard } from '../../../../shared/components/EmergencyCard';
import { QueryState } from '../../../../shared/components/QueryState';
import { ScreenHeader } from '../../../../shared/components/ScreenHeader';
import { formatRelativeDateTime } from '../../../../shared/utils/formatDate';
import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import type { RootStackParamList } from '../../../../core/navigation/RootNavigator';
import type { TabParamList } from '../../../../core/navigation/TabNavigator';
import { medicationRemindersMock } from '../../data/medicationRemindersMock';
import { HeroAppointmentCard, MedicationReminderCard } from '../components';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Inicio'>,
  NativeStackScreenProps<RootStackParamList>
>;

// El dominio auth solo guarda identidad (id, email, rol): el nombre de la
// persona pertenece al perfil, que aún no existe. Hasta entonces se saluda con
// la parte local del correo.
function displayName(email: string | undefined): string {
  if (!email) return 'de nuevo';

  const [localPart] = email.split('@');

  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const { user } = useAuthSession();
  const {
    pets,
    isLoading: petsLoading,
    error: petsError,
    refetch: refetchPets,
  } = usePets(petsRepository);

  const {
    appointments,
    isLoading: appointmentsLoading,
    error: appointmentsError,
    refetch: refetchAppointments,
  } = useAppointments(appointmentsRepository);

  const [now] = useState(() => Date.now());

  const nextAppointment = useMemo(
    () =>
      [...appointments]
        .filter((appointment) => new Date(appointment.date).getTime() >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0],
    [appointments, now],
  );

  const nextAppointmentPet = pets.find((pet) => pet.id === nextAppointment?.petId);
  const reminder = medicationRemindersMock[0];
  const featuredPetId = pets[0]?.id;

  // Estado combinado de las dos lecturas: carga si cualquiera carga, error el
  // primero que falle, y reintentar recarga ambas.
  const retry = () => {
    refetchPets();
    refetchAppointments();
  };

  const openHealthCard = () => {
    if (featuredPetId) {
      navigation.navigate('HealthCard', { petId: featuredPetId });
      return;
    }

    navigation.navigate('MisMascotas');
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.headerArea, { paddingTop: insets.top + 12 }]}>
        <ScreenHeader
          eyebrow="Bienvenida."
          title={displayName(user?.email)}
          hasUnread
          onBellPress={() => navigation.navigate('Notificaciones')}
        />
      </View>

      <QueryState
        isLoading={petsLoading || appointmentsLoading}
        error={petsError ?? appointmentsError}
        onRetry={retry}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            {nextAppointment ? (
              <HeroAppointmentCard
                message={`${nextAppointmentPet?.name ?? 'Tu mascota'} tiene una cita ${formatRelativeDateTime(nextAppointment.date)}.`}
                detail={`${nextAppointment.reason} · ${nextAppointment.veterinarian}`}
                actionLabel="Ver Cita"
                onPress={() => navigation.navigate('Citas')}
              />
            ) : (
              <View style={styles.emptyHero}>
                <Text style={styles.emptyTitle}>No tienes citas agendadas</Text>
                <Text style={styles.emptyText}>
                  Agenda una hora para el próximo control de tus mascotas.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.row}>
            <ActionCard
              title="Agendar Cita"
              subtitle="Consultas y controles"
              actionLabel="Agendar"
              color={colors.cardOrange}
              icon="calendar-outline"
              onPress={() => navigation.navigate('Citas')}
            />

            <ActionCard
              title="Carnet Digital"
              subtitle="Vacunas, peso y controles"
              actionLabel="Ver Carnet"
              color={colors.cardPurple}
              icon="document-text-outline"
              onPress={openHealthCard}
            />
          </View>

          <View style={styles.section}>
            <EmergencyCard />
          </View>

          {reminder && (
            <View style={styles.section}>
              <MedicationReminderCard reminder={reminder} />
            </View>
          )}
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
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    gap: 16,
  },

  section: {
    width: '100%',
  },

  row: {
    flexDirection: 'row',
    gap: 14,
  },

  emptyHero: {
    borderRadius: 24,
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
    color: colors.appMuted,
  },
});
