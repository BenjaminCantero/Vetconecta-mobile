import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../../core/navigation/RootNavigator';
import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import { ENV } from '../../../../core/config/env';
import { ActivePetSwitcher } from '../../../../shared/components/ActivePetSwitcher';
import { QueryState } from '../../../../shared/components/QueryState';
import { useActivePet } from '../../../../shared/context/ActivePetContext';
import { medicationsRepository } from '../../data/medicationsRepository';
import { useMedicationReminders } from '../../domain/useMedicationReminders';
import { MedicationReminderCard } from '../components/MedicationReminderCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Medications'>;

export default function MedicationsScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { pets } = useActivePet();
  const pet = pets.find((item) => item.id === route.params.petId);
  const { reminders, isLoading, error, refetch } = useMedicationReminders(
    medicationsRepository,
    pet?.id ?? null,
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          android_ripple={{ color: colors.appDivider, borderless: true }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.appHeading} />
        </Pressable>
        <View style={styles.heading}>
          <Text style={styles.title}>Medicamentos</Text>
          <Text style={styles.subtitle}>
            {pet ? `Pauta y dosis de ${pet.name}` : 'Selecciona una mascota para ver su pauta'}
          </Text>
        </View>
      </View>

      <ActivePetSwitcher
        style={styles.switcher}
        onChange={(petId) => navigation.setParams({ petId })}
      />

      {ENV.USE_MOCKS && <Text style={styles.sampleNotice}>Datos de ejemplo</Text>}

      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={reminders.length === 0}
        emptyMessage={
          pet
            ? `No hay medicamentos registrados para ${pet.name}.`
            : 'Selecciona una mascota para consultar sus medicamentos.'
        }
        onRetry={refetch}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {reminders.map((reminder) => (
            <View key={reminder.id} style={styles.treatment}>
              <MedicationReminderCard reminder={reminder} />
              <View style={styles.schedule}>
                <Ionicons name="time-outline" size={18} color={colors.appMuted} />
                <Text style={styles.scheduleText}>Horario de la dosis: {reminder.timeLabel}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </QueryState>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBackground },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 6,
  },
  back: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  heading: { flex: 1 },
  title: { fontFamily: fonts.extrabold, fontSize: 24, color: colors.appHeading },
  subtitle: { marginTop: 4, fontFamily: fonts.regular, fontSize: 14, color: colors.appMuted },
  switcher: { flexGrow: 0, paddingHorizontal: 20, marginBottom: 12 },
  sampleNotice: {
    paddingHorizontal: 20,
    marginBottom: 16,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.appMuted,
  },
  content: { paddingHorizontal: 20, gap: 24 },
  treatment: { gap: 10 },
  schedule: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16 },
  scheduleText: { flex: 1, fontFamily: fonts.medium, fontSize: 13, color: colors.appMuted },
});
