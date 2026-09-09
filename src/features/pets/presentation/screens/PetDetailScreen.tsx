// Responsabilidad: pantalla de detalle de una mascota (capa PRESENTATION de pets).

import { Text, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../../../../shared/components/Button';
import { colors } from '../../../../core/theme/colors';
import type { RootStackParamList } from '../../../../core/navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'PetDetail'>;

export default function PetDetailScreen({ route, navigation }: Props) {
  const { petId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mascota {petId}</Text>
      <Button label="Ver carnet de salud" onPress={() => navigation.navigate('HealthCard', { petId })} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16, backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
});
