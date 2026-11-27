// Responsabilidad: ficha de la mascota activa en Mis mascotas
// (capa PRESENTATION de pets).
// Foto, identidad y datos destacados.
// Tocar la identidad abre el detalle.

import { Fragment } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Chip } from '../../../../shared/components/Chip';
import { PetAvatar } from '../../../../shared/components/PetAvatar';
import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import {
  formatDecimalAge,
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

interface PetProfileCardProps {
  pet: Pet;
  onPress?: () => void;
}

export function PetProfileCard({ pet, onPress }: PetProfileCardProps) {
  const { width, fontScale } = useWindowDimensions();

  const useVerticalLayout = fontScale >= 1.3 || width < 340;

  const stats = [
    {
      label: 'Edad',
      value: formatDecimalAge(pet.birthDate),
    },
    {
      label: 'Peso',
      value: formatWeight(pet.weightKg),
    },
    {
      label: 'Próximo control',
      value: formatShortDate(pet.nextControlDate),
    },
  ];

  const identityLabel = [
    pet.name,
    SPECIES_LABEL[pet.species],
    pet.breed,
    formatSexAndSterilization(pet),
    pet.microchip ? `Microchip: ${pet.microchip}` : '',
  ]
    .filter(Boolean)
    .join('. ');

  const identity = (
    <>
      <PetAvatar name={pet.name} photoUrl={pet.photoUrl} size={104} />

      <View style={[styles.identity, useVerticalLayout && styles.identityVertical]}>
        <Text style={styles.name}>{pet.name}</Text>

        <View style={styles.tags}>
          <Chip label={SPECIES_LABEL[pet.species]} variant="soft" />

          <Text style={styles.breed}>{pet.breed}</Text>
        </View>

        <Text style={styles.detail}>{formatSexAndSterilization(pet)}</Text>

        {pet.microchip && (
          <View style={styles.microchip}>
            <Ionicons name="barcode-outline" size={14} color={colors.appMuted} />

            <Text style={[styles.detail, styles.microchipText]}>{pet.microchip}</Text>
          </View>
        )}
      </View>

      {onPress && <Ionicons name="chevron-forward" size={20} color={colors.appMuted} />}
    </>
  );

  return (
    <View style={styles.container}>
      {onPress ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={identityLabel}
          accessibilityHint={`Abre la ficha de ${pet.name}`}
          android_ripple={{
            color: colors.tintPurple,
          }}
          style={[styles.header, useVerticalLayout && styles.headerVertical]}
        >
          {identity}
        </Pressable>
      ) : (
        <View style={[styles.header, useVerticalLayout && styles.headerVertical]}>{identity}</View>
      )}

      <View style={[styles.stats, useVerticalLayout && styles.statsVertical]}>
        {stats.map((stat, index) => (
          <Fragment key={stat.label}>
            {index > 0 && (
              <View style={[styles.divider, useVerticalLayout && styles.dividerHorizontal]} />
            )}

            <View
              accessible
              accessibilityLabel={`${stat.label}: ${stat.value}`}
              style={[styles.stat, useVerticalLayout && styles.statVertical]}
            >
              <Text style={styles.statLabel}>{stat.label}</Text>

              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          </Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minHeight: 48,
  },

  headerVertical: {
    flexDirection: 'column',
    alignItems: 'center',
  },

  identity: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },

  identityVertical: {
    flex: 0,
    width: '100%',
  },

  name: {
    fontFamily: fonts.extrabold,
    fontSize: 26,
    color: colors.appTitle,
  },

  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },

  breed: {
    flexShrink: 1,
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.appTitle,
  },

  detail: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.appMuted,
  },

  microchip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  microchipText: {
    flexShrink: 1,
  },

  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: colors.appSurface,
  },

  statsVertical: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 12,
  },

  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.appDivider,
  },

  dividerHorizontal: {
    width: '100%',
    height: 1,
  },

  stat: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
  },

  statVertical: {
    flex: 0,
    paddingVertical: 8,
  },

  statLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.appMuted,
    textAlign: 'center',
  },

  statValue: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.appTitle,
    textAlign: 'center',
  },
});
