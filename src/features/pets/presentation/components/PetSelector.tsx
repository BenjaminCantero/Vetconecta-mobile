// Responsabilidad: selector horizontal de mascotas (capa PRESENTATION de pets).

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { PetAvatar } from '../../../../shared/components/PetAvatar';
import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import type { Pet } from '../../domain/Pet';

interface PetSelectorProps {
  pets: Pet[];
  selectedPetId: string | null;
  onSelect: (petId: string) => void;
  onAdd?: () => void;
}

export function PetSelector({ pets, selectedPetId, onSelect, onAdd }: PetSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
    >
      {pets.map((pet) => {
        const selected = pet.id === selectedPetId;

        return (
          <Pressable
            key={pet.id}
            onPress={() => onSelect(pet.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={styles.item}
          >
            <PetAvatar
              name={pet.name}
              photoUrl={pet.photoUrl}
              size={selected ? 76 : 64}
              selected={selected}
            />

            <Text style={[styles.name, selected && styles.nameSelected]} numberOfLines={1}>
              {pet.name}
            </Text>
          </Pressable>
        );
      })}

      <Pressable onPress={onAdd} accessibilityRole="button" style={styles.item}>
        <View style={styles.addCircle}>
          <Ionicons name="add" size={26} color={colors.appMuted} />
        </View>

        <Text style={styles.name}>Agregar</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 18,
    paddingVertical: 4,
    paddingRight: 8,
    alignItems: 'center',
  },

  item: {
    alignItems: 'center',
    gap: 8,
    width: 80,
  },

  addCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.appMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },

  name: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.appMuted,
  },

  nameSelected: {
    fontFamily: fonts.bold,
    color: colors.appTitle,
  },
});
