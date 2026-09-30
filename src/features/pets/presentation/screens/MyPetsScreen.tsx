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

import { useEffect } from 'react';
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

  const { activePetId, setActivePetId } = useActivePet();

  /*
   * Cuando termina la carga:
   *
   * 1. Si el usuario no tiene mascotas, limpiamos la selección.
   * 2. Si todavía no existe una mascota activa, seleccionamos la primera.
   * 3. Si la mascota seleccionada dejó de existir, seleccionamos la primera.
   *
   * De esta forma la selección visual y ActivePetContext siempre permanecen
   * sincronizados.
   */
  useEffect(() => {
    if (pets.length === 0) {
      if (activePetId !== null) {
        setActivePetId(null);
      }

      return;
    }

    const activePetExists = pets.some((pet) => pet.id === activePetId);

    if (!activePetExists) {
      setActivePetId(pets[0].id);
    }
  }, [pets, activePetId, setActivePetId]);

  /*
   * Mientras el useEffect sincroniza el contexto, usamos la primera mascota
   * como fallback para evitar un render vacío innecesario.
   */
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
                      title="Historial de Consultas"
                      subtitle={
                        summary.visits === 1
                          ? '1 atención previa'
                          : `${summary.visits} atenciones previas`
                      }
                      actionLabel="Ver Atenciones"
                      color={colors.cardSky}
                      onPress={openHealthCard}
                      compact
                    />

                    <ActionCard
                      title="Carnet de Vacunación"
                      subtitle={
                        summary.vaccines === 1
                          ? '1 vacuna registrada'
                          : `${summary.vaccines} vacunas registradas`
                      }
                      actionLabel="Ver Carnet"
                      color={colors.cardViolet}
                      onPress={openHealthCard}
                      compact
                    />
                  </View>

                  <View style={styles.row}>
                    <ActionCard
                      title="Pauta de Medicamentos"
                      subtitle="Tratamientos y dosis del día"
                      actionLabel="Ver Pauta"
                      color={colors.cardLeaf}
                      onPress={() => navigation.navigate('Inicio')}
                      compact
                    />

                    <ActionCard
                      title="Próximas Citas"
                      subtitle="Revisa tus horas agendadas"
                      actionLabel="Ver Citas"
                      color={colors.cardCoral}
                      onPress={() => navigation.navigate('Citas')}
                      compact
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
    gap: 28,
    paddingTop: 12,
    paddingHorizontal: 12,
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
