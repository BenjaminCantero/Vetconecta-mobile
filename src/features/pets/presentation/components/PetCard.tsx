// Responsabilidad: tarjeta de mascota reutilizable (capa PRESENTATION de pets).

import { Text, StyleSheet, Pressable } from 'react-native';

import { colors } from '../../../../core/theme/colors';
import { calculateAge } from '../../domain/calculateAge';
import type { Pet } from '../../domain/Pet';

interface PetCardProps {
  pet: Pet;
  onPress?: () => void;
}

export function PetCard({ pet, onPress }: PetCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.name}>{pet.name}</Text>
      <Text style={styles.detail}>{pet.breed}</Text>
      <Text style={styles.detail}>{calculateAge(pet.birthDate)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  name: { fontSize: 18, fontWeight: '700', color: colors.text },
  detail: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
});
