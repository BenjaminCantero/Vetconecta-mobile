// Responsabilidad: pantalla de notificaciones (capa PRESENTATION de notifications).
// Placeholder: pendiente de endpoint de notificaciones en la API externa.

import { Text, View, StyleSheet } from 'react-native';

import { colors } from '../../../../core/theme/colors';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Próximamente: notificaciones.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  text: { color: colors.textMuted, fontSize: 16 },
});
