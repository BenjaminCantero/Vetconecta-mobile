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
  // Para pantallas que además deben reaccionar al cambio.
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
      showsHorizontalScrollIndicator
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
            accessibilityHint="Cambia la mascota activa"
            accessibilityState={{ selected }}
            android_ripple={{
              color: colors.appDivider,
            }}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <PetAvatar name={pet.name} photoUrl={pet.photoUrl} size={30} />

            <Text allowFontScaling style={[styles.name, selected && styles.nameSelected]}>
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
    paddingVertical: 6,
    alignItems: 'center',
  },

  // Área táctil mínima de 48 dp.
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    minWidth: 48,
    paddingLeft: 7,
    paddingRight: 14,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.appMuted,
    backgroundColor: colors.appSurface,
    overflow: 'hidden',
  },

  chipSelected: {
    borderColor: colors.appHeading,
    backgroundColor: colors.tintPurple,
  },

  name: {
    maxWidth: 160,
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.appMuted,
  },

  nameSelected: {
    fontFamily: fonts.semibold,
    color: colors.appHeading,
  },
});
