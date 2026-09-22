// Responsabilidad: pantalla "Mis mascotas" (capa PRESENTATION de pets).
// Llama al caso de uso usePets del dominio y, para los conteos del carnet, al
// repositorio a través de useFetch. No conoce Axios: eso vive en la capa data.
// Actúa como composition root: inyecta la implementación concreta.

import { ScrollView, StyleSheet, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionCard } from '../../../../shared/components/ActionCard';
import { QueryState } from '../../../../shared/components/QueryState';
import { ScreenHeader } from '../../../../shared/components/ScreenHeader';
import { useActivePet } from '../../../../shared/context/ActivePetContext';
import { useFetch } from '../../../../shared/hooks/useFetch';
import { colors } from '../../../../core/theme/colors';
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

  const { pets, isLoading, error, refetch } = usePets(petsRepository);
  const { activePetId, setActivePetId } = useActivePet();

  // Si todavía no hay mascota elegida (o la elegida ya no está en la lista),
  // se muestra la primera sin tener que escribir en el contexto.
  const selectedPet = pets.find((pet) => pet.id === activePetId) ?? pets[0];

  const { data: events } = useFetch(
    () => (selectedPet ? petsRepository.getHealthCard(selectedPet.id) : Promise.resolve([])),
    [selectedPet?.id],
  );

  const summary = summarizeHealthCard(events ?? []);

  return (
    <View style={styles.screen}>
      <View style={[styles.headerArea, { paddingTop: insets.top + 12 }]}>
        <ScreenHeader
          title="Mis Mascotas"
          hasUnread
          onBellPress={() => navigation.navigate('Notificaciones')}
        />
      </View>

      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={pets.length === 0}
        emptyMessage="Todavía no tienes mascotas registradas. Cuando registres una, aquí verás su ficha, su carnet y sus controles."
        onRetry={refetch}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
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
    paddingBottom: 18,
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    gap: 18,
  },

  row: {
    flexDirection: 'row',
    gap: 14,
  },
});
