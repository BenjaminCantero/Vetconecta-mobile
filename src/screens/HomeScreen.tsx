import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-white p-6">
      <Text className="text-2xl font-bold text-slate-900">Vetconecta Mobile</Text>
      <Text className="text-center text-slate-500">
        Expo + TypeScript + React Navigation + NativeWind listo.
      </Text>
      <Pressable
        className="rounded-xl bg-emerald-600 px-5 py-3 active:opacity-80"
        onPress={() => navigation.navigate('Details', { id: '42' })}
      >
        <Text className="font-semibold text-white">Ir a Details</Text>
      </Pressable>
    </View>
  );
}
