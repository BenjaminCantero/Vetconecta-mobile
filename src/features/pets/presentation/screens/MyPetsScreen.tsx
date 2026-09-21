// Responsabilidad: pantalla "Mis mascotas" (capa PRESENTATION de pets).
// Llama al caso de uso usePets del dominio y, para los conteos del carnet, al
// repositorio a través de useFetch. No conoce Axios: eso vive en la capa data.
// Actúa como composition root: inyecta la implementación concreta.

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionCard } from '../../../../shared/components/ActionCard';
import { Loader } from '../../../../shared/components/Loader';
import { ScreenHeader } from '../../../../shared/components/ScreenHeader';
import { useActivePet } from '../../../../shared/context/ActivePetContext';
import { useFetch } from '../../../../shared/hooks/useFetch';
import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import type { RootStackParamList } from '../../../../core/navigation/RootNavigator';
import type { TabParamList } from '../../../../core/navigation/TabNavigator';
import { petsRepository } from '../../data/petsRepository';
import { summarizeHealthCard } from '../../domain/summarizeHealthCard';
import { usePets } from '../../domain/usePets';
import { PetSelector } from '../components/PetSelector';
import { PetSummaryCard } from '../components/PetSummaryCard';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'MisMascotas'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function MyPetsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const { pets, isLoading, error } = usePets(petsRepository);
  const { activePetId, setActivePetId } = useActivePet();

  // Si todavía no hay mascota elegida (o la elegida ya no está en la lista),
  // se muestra la primera sin tener que escribir en el contexto.
  const selectedPet = pets.find((pet) => pet.id === activePetId) ?? pets[0];

  const { data: events } = useFetch(
    () => (selectedPet ? petsRepository.getHealthCard(selectedPet.id) : Promise.resolve([])),
    [selectedPet?.id]
  );

  const summary = summarizeHealthCard(events ?? []);

  if (isLoading) return <Loader />;

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
        title="Mis Mascotas"
        hasUnread
        onBellPress={() => navigation.navigate('Notificaciones')}
      />

      {error && <Text style={styles.error}>{error.message}</Text>}

      {pets.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Todavía no tienes mascotas registradas</Text>
          <Text style={styles.emptyText}>
            Cuando registres una, aquí verás su ficha, su carnet y sus controles.
          </Text>
        </View>
      ) : (
        <>
          <PetSelector
            pets={pets}
            selectedPetId={selectedPet?.id ?? null}
            onSelect={setActivePetId}
          />

          {selectedPet && (
            <>
              <PetSummaryCard pet={selectedPet} />

              <View style={styles.row}>
                <ActionCard
                  title="Historial de Consultas"
                  subtitle={`${summary.visits} atenciones previas`}
                  actionLabel="Ver Atenciones"
                  color={colors.cardBlue}
                  icon="pulse-outline"
                  onPress={() => navigation.navigate('HealthCard', { petId: selectedPet.id })}
                />

                <ActionCard
                  title="Carnet de Vacunación"
                  subtitle={`${summary.vaccines} vacunas registradas`}
                  actionLabel="Ver Carnet"
                  color={colors.cardPurple}
                  icon="shield-checkmark-outline"
                  onPress={() => navigation.navigate('HealthCard', { petId: selectedPet.id })}
                />
              </View>
            </>
          )}
        </>
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
    gap: 18,
  },

  row: {
    flexDirection: 'row',
    gap: 14,
  },

  error: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.danger,
  },

  emptyCard: {
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
    lineHeight: 19,
    color: colors.appMuted,
  },
});
