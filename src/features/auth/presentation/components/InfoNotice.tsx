// Responsabilidad: aviso informativo destacado del flujo de auth (capa PRESENTATION).

import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';

interface InfoNoticeProps {
  message: string;
}

export function InfoNotice({ message }: InfoNoticeProps) {
  return (
    <View style={styles.container} accessibilityRole="text">
      <View style={styles.icon}>
        <Text style={styles.iconText}>!</Text>
      </View>

      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.infoBackground,
  },

  icon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.infoIcon,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconText: {
    color: colors.textLight,
    fontFamily: fonts.extrabold,
    fontSize: 15,
  },

  message: {
    flex: 1,
    color: colors.infoText,
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 18,
  },
});
