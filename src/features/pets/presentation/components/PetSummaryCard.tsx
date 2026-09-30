// Responsabilidad: ficha resumida de la mascota activa (capa PRESENTATION de pets).

import { StyleSheet, Text, View } from 'react-native';

import { Chip } from '../../../../shared/components/Chip';
import { PetAvatar } from '../../../../shared/components/PetAvatar';
import { StatRow } from '../../../../shared/components/StatRow';
import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import {
  formatCompactAge,
  formatSexAndSterilization,
  formatShortDate,
  formatWeight,
} from '../../domain/formatPetProfile';
import type { Pet } from '../../domain/Pet';

const SPECIES_LABEL: Record<Pet['species'], string> = {
  perro: 'Canino',
  gato: 'Felino',
  otro: 'Otra especie',
};

interface PetSummaryCardProps {
  pet: Pet;
}

export function PetSummaryCard({ pet }: PetSummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <PetAvatar name={pet.name} photoUrl={pet.photoUrl} size={74} />

        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {pet.name.toUpperCase()}
            </Text>

            <Chip label={SPECIES_LABEL[pet.species]} />
          </View>

          <Text style={styles.detail}>Raza {pet.breed}</Text>
          <Text style={styles.detail}>{formatSexAndSterilization(pet)}</Text>

          {pet.microchip && <Text style={styles.chipCode}>Chip: {pet.microchip}</Text>}
        </View>
      </View>

      <StatRow
        items={[
          { label: 'Edad', value: formatCompactAge(pet.birthDate) },
          { label: 'Último Peso', value: formatWeight(pet.weightKg) },
          { label: 'Próx. Control', value: formatShortDate(pet.nextControlDate) },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 18,
    gap: 18,
    backgroundColor: colors.appSurface,
    shadowColor: '#4B2A6B',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  identity: {
    flex: 1,
    gap: 3,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 2,
  },

  name: {
    flexShrink: 1,
    fontFamily: fonts.extrabold,
    fontSize: 22,
    color: colors.appTitle,
  },

  detail: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.appMuted,
  },

  chipCode: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.appMuted,
  },
});
