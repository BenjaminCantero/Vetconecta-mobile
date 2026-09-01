import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Details'>;

export default function DetailsScreen({ route }: Props) {
  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="text-lg text-slate-900">Details id: {route.params.id}</Text>
    </View>
  );
}
