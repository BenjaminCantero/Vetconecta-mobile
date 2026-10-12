// Responsabilidad: pantalla "Mis mascotas" (capa PRESENTATION de pets).
//
// Llama al caso de uso usePets del dominio y, para los conteos del carnet, al
// repositorio a través de useFetch. No conoce Axios: eso vive en la capa data.
//
// Actúa como composition root: inyecta la implementación concreta.
//
// La mascota seleccionada se comparte mediante ActivePetContext para que otras
// partes de la aplicación puedan conocer qué mascota está activa.
//
// Las tarjetas de medicamentos y citas son solo accesos: sus datos viven en
// otros dominios, que pets no puede importar (regla de A2).

import { Alert, ScrollView, StyleSheet, View } from 'react-native';
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
import { PetProfileCard } from '../components/PetProfileCard';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'MisMascotas'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function MyPetsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  // ---------------------------------------------------------------------------
  // MASCOTAS
  // ---------------------------------------------------------------------------

  const { pets, isLoading, error, refetch } = usePets(petsRepository);

  // ---------------------------------------------------------------------------
  // MASCOTA ACTIVA
  // ---------------------------------------------------------------------------

  // ActivePetContext decide cuál queda activa (restaurada o la primera) y la
  // valida contra las mascotas del dueño.
  const { activePetId, setActivePetId } = useActivePet();

  // Mientras el contexto termina de restaurar la selección, se muestra la
  // primera mascota para evitar un render vacío innecesario.
  const selectedPet = pets.find((pet) => pet.id === activePetId) ?? pets[0];

  // ---------------------------------------------------------------------------
  // CARNET / EVENTOS DE LA MASCOTA SELECCIONADA
  // ---------------------------------------------------------------------------

  const { data: events } = useFetch(
    () => (selectedPet ? petsRepository.getHealthCard(selectedPet.id) : Promise.resolve([])),
    [selectedPet?.id],
  );

  const summary = summarizeHealthCard(events ?? []);

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  const openHealthCard = () => {
    if (selectedPet) navigation.navigate('HealthCard', { petId: selectedPet.id });
  };

  // La API solo expone lectura: registrar mascotas queda para otro sprint.
  const handleAddPet = () => {
    Alert.alert('Próximamente', 'Pronto podrás registrar una nueva mascota desde la app.');
  };

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
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.selector}>
            <PetSelector
              pets={pets}
              selectedPetId={selectedPet?.id ?? null}
              onSelect={setActivePetId}
              onAdd={handleAddPet}
            />
          </View>

          {/* Hoja inferior con la ficha de la mascota seleccionada */}
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.handle} />

            {selectedPet && (
              <>
                <PetProfileCard
                  pet={selectedPet}
                  onPress={() => navigation.navigate('PetDetail', { petId: selectedPet.id })}
                />

                <View style={styles.grid}>
                  <View style={styles.row}>
                    <ActionCard
                      title="Consultas"
                      value={String(summary.visits)}
                      subtitle={summary.visits === 1 ? 'atención previa' : 'atenciones previas'}
                      actionLabel="Abre el historial clínico"
                      color={colors.cardSky}
                      icon="medkit-outline"
                      onPress={openHealthCard}
                      tone="soft"
                    />

                    <ActionCard
                      title="Vacunas"
                      value={String(summary.vaccines)}
                      subtitle={summary.vaccines === 1 ? 'registrada' : 'registradas'}
                      actionLabel="Abre el carnet de vacunas"
                      color={colors.cardViolet}
                      icon="shield-checkmark-outline"
                      onPress={openHealthCard}
                      tone="soft"
                    />
                  </View>

                  <View style={styles.row}>
                    <ActionCard
                      title="Medicamentos"
                      subtitle="Pauta y dosis del día"
                      actionLabel="Abre la pauta en el inicio"
                      color={colors.cardLeaf}
                      icon="medical-outline"
                      onPress={() => navigation.navigate('Inicio')}
                      tone="soft"
                    />

                    <ActionCard
                      title="Citas"
                      subtitle="Horas agendadas"
                      actionLabel="Abre tus citas"
                      color={colors.cardCoral}
                      icon="calendar-outline"
                      onPress={() => navigation.navigate('Citas')}
                      tone="soft"
                    />
                  </View>
                </View>
              </>
            )}
          </View>
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
    flexGrow: 1,
  },

  selector: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },

  sheet: {
    flexGrow: 1,
    gap: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: colors.sheetSurface,
    shadowColor: '#4B2A6B',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 6,
  },

  handle: {
    alignSelf: 'center',
    width: 40,
    height: 8,
    borderRadius: 4,
    marginBottom: 20,
    backgroundColor: colors.sheetHandle,
  },

  grid: {
    gap: 10,
  },

  row: {
    flexDirection: 'row',
    gap: 10,
  },
});
