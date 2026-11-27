// Responsabilidad: ficha resumida de la mascota activa
// (capa PRESENTATION de pets).

import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

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
  const { width, fontScale } = useWindowDimensions();

  const useVerticalLayout = fontScale >= 1.3 || width < 340;

  return (
    <View style={styles.card}>
      <View style={[styles.header, useVerticalLayout && styles.headerVertical]}>
        <PetAvatar name={pet.name} photoUrl={pet.photoUrl} size={74} />

        <View style={[styles.identity, useVerticalLayout && styles.identityVertical]}>
          <View style={styles.nameRow}>
            <Text accessibilityRole="header" style={styles.name}>
              {pet.name}
            </Text>

            <Chip label={SPECIES_LABEL[pet.species]} />
          </View>

          <Text style={styles.detail}>Raza: {pet.breed}</Text>

          <Text style={styles.detail}>{formatSexAndSterilization(pet)}</Text>

          {pet.microchip && <Text style={styles.chipCode}>Microchip: {pet.microchip}</Text>}
        </View>
      </View>

      <StatRow
        items={[
          {
            label: 'Edad',
            value: formatCompactAge(pet.birthDate),
          },
          {
            label: 'Último peso',
            value: formatWeight(pet.weightKg),
          },
          {
            label: 'Próximo control',
            value: formatShortDate(pet.nextControlDate),
          },
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

  headerVertical: {
    flexDirection: 'column',
    alignItems: 'center',
  },

  identity: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },

  identityVertical: {
    flex: 0,
    width: '100%',
  },

  nameRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
