// Responsabilidad: pantalla de inicio (feature TRANSVERSAL home).
// home NO posee entidad propia: solo AGREGA datos de varios dominios,
// consumiéndolos por su superficie pública (los barrels), nunca por sus data/.
// Regla de oro (A2): home depende de los dominios; ningún dominio depende de home.

import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthSession } from '../../../auth';
import { usePets, petsRepository } from '../../../pets';
import { useAppointments, appointmentsRepository } from '../../../appointments';
import { ActionCard } from '../../../../shared/components/ActionCard';
import { ActivePetSwitcher } from '../../../../shared/components/ActivePetSwitcher';
import { EmergencyCard } from '../../../../shared/components/EmergencyCard';
import { QueryState } from '../../../../shared/components/QueryState';
import { ScreenHeader } from '../../../../shared/components/ScreenHeader';
import { useActivePet } from '../../../../shared/context/ActivePetContext';
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

  const { activePetId, activePet } = useActivePet();

  const [now] = useState(() => Date.now());

  // La próxima cita es la de la mascota activa (F1); sin mascota activa, la
  // de cualquiera.
  const nextAppointment = useMemo(
    () =>
      [...appointments]
        .filter((appointment) => !activePetId || appointment.petId === activePetId)
        .filter((appointment) => new Date(appointment.date).getTime() >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0],
    [appointments, activePetId, now],
  );

  const nextAppointmentPet = pets.find((pet) => pet.id === nextAppointment?.petId);
  // Solo el recordatorio de la mascota activa; el mock aún se relaciona por
  // nombre porque los tratamientos no tienen dominio propio.
  const reminder = medicationRemindersMock.find(
    (item) => !activePet || item.petName === activePet.name,
  );
  const featuredPetId = activePetId ?? pets[0]?.id;

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
          eyebrow="Hola,"
          title={displayName(user?.email)}
          hasUnread
          onBellPress={() => navigation.navigate('Notificaciones')}
        />

        <ActivePetSwitcher />
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
          {nextAppointment ? (
            <HeroAppointmentCard
              date={nextAppointment.date}
              petName={nextAppointmentPet?.name ?? 'tu mascota'}
              reason={nextAppointment.reason}
              veterinarian={nextAppointment.veterinarian}
              onPress={() => navigation.navigate('Citas')}
            />
          ) : (
            <View style={styles.emptyHero}>
              <Text style={styles.emptyTitle}>
                {activePet
                  ? `${activePet.name} no tiene horas agendadas`
                  : 'No tienes horas agendadas'}
              </Text>
              <Text style={styles.emptyText}>
                Reserva una hora para su próximo control o vacuna.
              </Text>
              <Pressable
                onPress={() => navigation.navigate('Citas')}
                accessibilityRole="button"
                android_ripple={{ color: colors.tintPurple }}
                style={styles.emptyButton}
              >
                <Text style={styles.emptyButtonLabel}>Agendar hora</Text>
              </Pressable>
            </View>
          )}

          {reminder && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Para hoy</Text>
              <MedicationReminderCard reminder={reminder} />
            </View>
          )}

          <View style={styles.row}>
            <ActionCard
              title="Agendar hora"
              subtitle="Consultas y controles"
              actionLabel="Abre tus citas para reservar una hora"
              color={colors.cardOrange}
              icon="calendar-outline"
              tone="quiet"
              onPress={() => navigation.navigate('Citas')}
            />

            <ActionCard
              title="Carnet digital"
              subtitle="Vacunas y controles"
              actionLabel="Abre el carnet de la mascota activa"
              color={colors.cardPurple}
              icon="document-text-outline"
              tone="quiet"
              onPress={openHealthCard}
            />
          </View>

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
    gap: 14,
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    gap: 22,
  },

  section: {
    gap: 10,
  },

  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.appTitle,
  },

  row: {
    flexDirection: 'row',
    gap: 14,
  },

  emptyHero: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.cardPinkEnd,
    backgroundColor: colors.appSurface,
  },

  emptyButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 22,
    borderRadius: 999,
    backgroundColor: colors.appHeading,
  },

  emptyButtonLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.textLight,
  },

  emptyTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 19,
    color: colors.appTitle,
  },

  emptyText: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.appMuted,
  },
});
