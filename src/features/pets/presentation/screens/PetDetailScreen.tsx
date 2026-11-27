// Responsabilidad: pantalla de detalle de una mascota (capa PRESENTATION de pets).
// Consume el caso de uso usePets y busca la mascota por id; la edad exacta se
// calcula en el dominio con calculateAge a partir de la fecha de nacimiento.
// No conoce Axios.

import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../../../shared/components/Button';
import { QueryState } from '../../../../shared/components/QueryState';
import { formatDate } from '../../../../shared/utils/formatDate';
import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import type { RootStackParamList } from '../../../../core/navigation/RootNavigator';
import { petsRepository } from '../../data/petsRepository';
import { calculateAge } from '../../domain/calculateAge';
import {
  formatSexAndSterilization,
  formatShortDate,
  formatWeight,
} from '../../domain/formatPetProfile';
import type { Pet } from '../../domain/Pet';
import { usePets } from '../../domain/usePets';
import { PetSummaryCard } from '../components/PetSummaryCard';

type Props = NativeStackScreenProps<RootStackParamList, 'PetDetail'>;

const SPECIES_LABEL: Record<Pet['species'], string> = {
  perro: 'Perro',
  gato: 'Gato',
  otro: 'Otra especie',
};

export default function PetDetailScreen({ route, navigation }: Props) {
  const { petId } = route.params;
  const insets = useSafeAreaInsets();

  const { pets, isLoading, error, refetch } = usePets(petsRepository);

  const pet = pets.find((item) => item.id === petId);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          accessibilityHint="Regresa a la pantalla anterior"
          android_ripple={{
            color: colors.appDivider,
            borderless: true,
          }}
          style={styles.back}
        >
          <Ionicons name="chevron-back" size={24} color={colors.appHeading} />
        </Pressable>

        <Text accessibilityRole="header" style={styles.title}>
          {pet ? `Ficha de ${pet.name}` : 'Ficha de mascota'}
        </Text>
      </View>

      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!pet}
        emptyMessage="No encontramos esta mascota. Puede que ya no esté asociada a tu cuenta."
        emptySuggestion="Regresa a la pantalla anterior para consultar tus mascotas registradas."
        emptyActionLabel="Volver"
        onEmptyAction={() => navigation.goBack()}
        onRetry={refetch}
      >
        {pet && (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
            showsVerticalScrollIndicator
          >
            <PetSummaryCard pet={pet} />

            <View style={styles.card}>
              <Text accessibilityRole="header" style={styles.sectionLabel}>
                Edad
              </Text>

              <Text style={styles.age}>{calculateAge(pet.birthDate)}</Text>

              <Text style={styles.muted}>Nació el {formatDate(pet.birthDate)}</Text>
            </View>

            <View style={styles.card}>
              <Text accessibilityRole="header" style={styles.sectionLabel}>
                Datos generales
              </Text>

              <DetailRow label="Especie" value={SPECIES_LABEL[pet.species]} />

              <DetailRow label="Raza" value={pet.breed} />

              <DetailRow label="Sexo" value={formatSexAndSterilization(pet)} />

              <DetailRow label="Microchip" value={pet.microchip ?? 'Sin registrar'} />

              <DetailRow label="Último peso" value={formatWeight(pet.weightKg)} />

              <DetailRow
                label="Próximo control"
                value={formatShortDate(pet.nextControlDate)}
                isLast
              />
            </View>

            <Button
              label="Ver carnet digital"
              onPress={() =>
                navigation.navigate('HealthCard', {
                  petId: pet.id,
                })
              }
            />
          </ScrollView>
        )}
      </QueryState>
    </View>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

function DetailRow({ label, value, isLast = false }: DetailRowProps) {
  const { width, fontScale } = useWindowDimensions();

  const useVerticalLayout = fontScale >= 1.3 || width < 340;

  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={[styles.row, useVerticalLayout && styles.rowVertical, !isLast && styles.rowDivider]}
    >
      <Text style={[styles.muted, styles.rowLabel]}>{label}</Text>

      <Text style={[styles.value, useVerticalLayout && styles.valueVertical]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  back: {
    width: 48,
    height: 48,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    flex: 1,
    minWidth: 0,
    fontFamily: fonts.extrabold,
    fontSize: 22,
    color: colors.appHeading,
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    gap: 16,
  },

  card: {
    borderRadius: 20,
    padding: 18,
    gap: 4,
    backgroundColor: colors.appSurface,
  },

  sectionLabel: {
    marginBottom: 4,
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.appHeading,
  },

  age: {
    fontFamily: fonts.extrabold,
    fontSize: 18,
    color: colors.appTitle,
  },

  muted: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.appMuted,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },

  rowVertical: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 4,
  },

  rowLabel: {
    flexShrink: 1,
  },

  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.appDivider,
  },

  value: {
    flexShrink: 1,
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.appTitle,
    textAlign: 'right',
  },

  valueVertical: {
    textAlign: 'left',
  },
});
