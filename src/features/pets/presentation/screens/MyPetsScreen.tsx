// Responsabilidad: pantalla "Mis mascotas" (capa PRESENTATION de pets).
// Solo llama al caso de uso usePets del dominio; no conoce Axios
// directamente (eso vive en petsRepository, capa data). Actúa como
// composition root: inyecta la implementación concreta del repositorio.

import { FlatList, Text, View, StyleSheet } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Loader } from '../../../../shared/components/Loader';
import { colors } from '../../../../core/theme/colors';
import type { RootStackParamList } from '../../../../core/navigation/RootNavigator';
import type { TabParamList } from '../../../../core/navigation/TabNavigator';
import { petsRepository } from '../../data/petsRepository';
import { usePets } from '../../domain/usePets';
import { PetCard } from '../components/PetCard';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'MisMascotas'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function MyPetsScreen({ navigation }: Props) {
  const { pets, isLoading, error } = usePets(petsRepository);

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error.message}</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={pets}
      keyExtractor={(pet) => pet.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <PetCard pet={item} onPress={() => navigation.navigate('PetDetail', { petId: item.id })} />
      )}
      ListEmptyComponent={<Text style={styles.empty}>Todavía no tienes mascotas registradas.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: colors.danger },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
});
