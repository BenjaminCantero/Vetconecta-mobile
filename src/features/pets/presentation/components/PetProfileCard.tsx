// Responsabilidad: ficha de la mascota activa en Mis Mascotas (capa PRESENTATION de pets).
// Foto, identidad y tres datos destacados (edad, peso, próximo control) en
// una sola franja. Tocar la identidad abre el detalle.

import { Fragment } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
  const stats = [
    { label: 'Edad', value: formatDecimalAge(pet.birthDate) },
    { label: 'Peso', value: formatWeight(pet.weightKg) },
    { label: 'Próximo control', value: formatShortDate(pet.nextControlDate) },
  ];

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={onPress ? `Ver ficha de ${pet.name}` : undefined}
        android_ripple={onPress ? { color: colors.tintPurple } : undefined}
        style={styles.header}
      >
        <PetAvatar name={pet.name} photoUrl={pet.photoUrl} size={104} />

        <View style={styles.identity}>
          <Text style={styles.name} numberOfLines={1}>
            {pet.name}
          </Text>

          <View style={styles.tags}>
            <Chip label={SPECIES_LABEL[pet.species]} variant="soft" />
            <Text style={styles.breed} numberOfLines={1}>
              {pet.breed}
            </Text>
          </View>

          <Text style={styles.detail}>{formatSexAndSterilization(pet)}</Text>

          {pet.microchip && (
            <View style={styles.microchip}>
              <Ionicons name="barcode-outline" size={14} color={colors.appMuted} />
              <Text style={styles.detail}>{pet.microchip}</Text>
            </View>
          )}
        </View>

        {onPress && <Ionicons name="chevron-forward" size={20} color={colors.appMuted} />}
      </Pressable>

      <View style={styles.stats}>
        {stats.map((stat, index) => (
          <Fragment key={stat.label}>
            {index > 0 && <View style={styles.divider} />}

            <View style={styles.stat}>
              <Text style={styles.statLabel} numberOfLines={1}>
                {stat.label}
              </Text>
              <Text style={styles.statValue} numberOfLines={1}>
                {stat.value}
              </Text>
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
  },

  identity: {
    flex: 1,
    gap: 4,
  },

  name: {
    fontFamily: fonts.extrabold,
    fontSize: 26,
    color: colors.appTitle,
  },

  tags: {
    flexDirection: 'row',
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

  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: colors.appSurface,
  },

  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.appDivider,
  },

  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
  },

  statLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.appMuted,
  },

  statValue: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.appTitle,
  },
});
