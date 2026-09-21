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
import { Loader } from '../../../../shared/components/Loader';
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
  const { pets, isLoading: petsLoading } = usePets(petsRepository);
  const { appointments, isLoading: appointmentsLoading } = useAppointments(appointmentsRepository);

  const [now] = useState(() => Date.now());

  const nextAppointment = useMemo(
    () =>
      [...appointments]
        .filter((appointment) => new Date(appointment.date).getTime() >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0],
    [appointments, now]
  );

  const nextAppointmentPet = pets.find((pet) => pet.id === nextAppointment?.petId);
  const reminder = medicationRemindersMock[0];
  const featuredPetId = pets[0]?.id;

  if (petsLoading || appointmentsLoading) return <Loader />;

  const openHealthCard = () => {
    if (featuredPetId) {
      navigation.navigate('HealthCard', { petId: featuredPetId });
      return;
    }

    navigation.navigate('MisMascotas');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        eyebrow="Bienvenida."
        title={displayName(user?.email)}
        hasUnread
        onBellPress={() => navigation.navigate('Notificaciones')}
      />

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
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
