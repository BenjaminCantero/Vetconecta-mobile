// Responsabilidad: selector compacto de mascota activa para encabezados
// (capa SHARED). Lee y cambia la mascota de ActivePetContext; al cambiarla,
// las pantallas que dependen de ella se recargan solas.
// Con una sola mascota (o ninguna) no se muestra: no hay nada que elegir.

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors } from '../../core/theme/colors';
import { fonts } from '../../core/theme/typography';
import { useActivePet } from '../context/ActivePetContext';
import { PetAvatar } from './PetAvatar';

interface ActivePetSwitcherProps {
  // Para pantallas que además deben reaccionar al cambio (ej. actualizar params).
  onChange?: (petId: string) => void;
  style?: StyleProp<ViewStyle>;
}

export function ActivePetSwitcher({ onChange, style }: ActivePetSwitcherProps) {
  const { pets, activePetId, setActivePetId } = useActivePet();

  if (pets.length <= 1) return null;

  return (
    <ScrollView
      horizontal
      style={style}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      accessibilityRole="tablist"
    >
      {pets.map((pet) => {
        const selected = pet.id === activePetId;

        return (
          <Pressable
            key={pet.id}
            onPress={() => {
              setActivePetId(pet.id);
              onChange?.(pet.id);
            }}
            accessibilityRole="tab"
            accessibilityLabel={`Ver a ${pet.name}`}
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.chip,
              selected && styles.chipSelected,
              pressed && styles.chipPressed,
            ]}
          >
            <PetAvatar name={pet.name} photoUrl={pet.photoUrl} size={30} />
            <Text style={[styles.name, selected && styles.nameSelected]} numberOfLines={1}>
              {pet.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
    paddingVertical: 2,
  },

  // Alto mínimo de 44 px para que sea fácil de tocar.
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    paddingLeft: 7,
    paddingRight: 14,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.appDivider,
    backgroundColor: colors.appSurface,
  },

  chipSelected: {
    borderColor: colors.appHeading,
  },

  chipPressed: {
    opacity: 0.7,
  },

  name: {
    maxWidth: 110,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.appMuted,
  },

  nameSelected: {
    fontFamily: fonts.semibold,
    color: colors.appHeading,
  },
});
