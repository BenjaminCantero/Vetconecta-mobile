// Responsabilidad: selector horizontal de mascotas (capa PRESENTATION de pets).
//
// Permite cambiar la mascota activa: la seleccionada se agranda y lleva un aro.
// La opción "Agregar" solo se muestra cuando la pantalla proporciona una
// acción onAdd.

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
            accessibilityLabel={`Seleccionar a ${pet.name}`}
            accessibilityState={{
              selected,
            }}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <PetAvatar
              name={pet.name}
              photoUrl={pet.photoUrl}
              size={selected ? SELECTED_SIZE : AVATAR_SIZE}
              style={selected ? styles.ring : undefined}
            />

            <Text style={[styles.name, selected && styles.nameSelected]} numberOfLines={1}>
              {pet.name}
            </Text>
          </Pressable>
        );
      })}

      {onAdd && (
        <Pressable
          onPress={onAdd}
          accessibilityRole="button"
          accessibilityLabel="Agregar mascota"
          style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
        >
          <View style={styles.addCircle}>
            <Ionicons name="add" size={30} color={colors.appTitle} />
          </View>

          <Text style={styles.name}>Agregar</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const AVATAR_SIZE = 76;
const SELECTED_SIZE = 94;

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
    minWidth: AVATAR_SIZE,
  },

  ring: {
    borderWidth: 4,
    borderColor: colors.petSelectedRing,
  },

  itemPressed: {
    opacity: 0.7,
  },

  addCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.appMuted,
    backgroundColor: colors.addPetSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  name: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.appMuted,
  },

  nameSelected: {
    fontFamily: fonts.semibold,
    color: colors.appTitle,
  },
});
