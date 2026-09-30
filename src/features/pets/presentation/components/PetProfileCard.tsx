// Responsabilidad: ficha de la mascota activa en Mis Mascotas (capa PRESENTATION de pets).
// Foto grande, identidad y tres datos destacados (edad, peso, próximo control),
// cada uno en su propia tarjeta. Tocar la identidad abre el detalle.

import { Fragment } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
    { label: 'Último Peso', value: formatWeight(pet.weightKg) },
    { label: 'Próximo Control', value: formatShortDate(pet.nextControlDate) },
  ];

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={onPress ? `Ver ficha de ${pet.name}` : undefined}
        style={styles.header}
      >
        <PetAvatar name={pet.name} photoUrl={pet.photoUrl} size={140} />

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
      </Pressable>

      <View style={styles.stats}>
        {stats.map((stat, index) => (
          <Fragment key={stat.label}>
            {index > 0 && <View style={styles.divider} />}

            <View style={styles.stat}>
              <View style={styles.statLabelBox}>
                <Text style={styles.statLabel} numberOfLines={1}>
                  {stat.label}
                </Text>
              </View>

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
    gap: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  identity: {
    flex: 1,
    gap: 2,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 6,
  },

  name: {
    flexShrink: 1,
    fontFamily: fonts.extrabold,
    fontSize: 22,
    color: colors.appTitle,
  },

  detail: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.appMuted,
  },

  chipCode: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.appMuted,
  },

  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  divider: {
    width: 1,
    height: 28,
    backgroundColor: colors.appMuted,
    opacity: 0.4,
  },

  stat: {
    flexGrow: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.statValueSurface,
  },

  statLabelBox: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: colors.appSurface,
  },

  statLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.appTitle,
    textAlign: 'center',
  },

  statValue: {
    paddingVertical: 9,
    paddingHorizontal: 10,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.appMuted,
    textAlign: 'center',
  },
});
