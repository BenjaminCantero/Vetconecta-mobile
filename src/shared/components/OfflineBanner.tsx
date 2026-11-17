// Responsabilidad: avisar que los datos en pantalla vienen de la caché (capa
// SHARED, G1). "Sin conexión — datos actualizados el dd/mm hh:mm".

import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../core/theme/colors';
import { fonts } from '../../core/theme/typography';
import { formatDayMonthTime } from '../utils/formatDate';

interface OfflineBannerProps {
  updatedAt: string | null;
  style?: StyleProp<ViewStyle>;
}

export function OfflineBanner({ updatedAt, style }: OfflineBannerProps) {
  const message = updatedAt
    ? `Sin conexión — datos actualizados el ${formatDayMonthTime(updatedAt)}`
    : 'Sin conexión — mostrando los últimos datos guardados';

  return (
    <View style={[styles.banner, style]} accessibilityRole="alert">
      <Ionicons name="cloud-offline-outline" size={20} color={colors.statusPending} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: colors.tintOrange,
  },
  text: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.statusPending,
  },
});
