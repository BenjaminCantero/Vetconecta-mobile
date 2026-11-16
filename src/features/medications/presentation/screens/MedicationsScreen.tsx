// Responsabilidad: pantalla "Tratamiento" (capa PRESENTATION de medications, H2).
// Muestra la pauta activa de la mascota (H1) como checklist de dosis con
// estados pendiente / administrada / atrasada, y permite marcar cada toma.
//
// BR-10: marcar una dosis solo se guarda en el dispositivo. No se envía al
// backend ni cambia el historial clínico que ve la clínica.
//
// Actúa como composition root: inyecta las implementaciones de data.

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../../core/navigation/RootNavigator';
import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import { ENV } from '../../../../core/config/env';
import { ActivePetSwitcher } from '../../../../shared/components/ActivePetSwitcher';
import { OfflineBanner } from '../../../../shared/components/OfflineBanner';
import { QueryState } from '../../../../shared/components/QueryState';
import { useActivePet } from '../../../../shared/context/ActivePetContext';
import { cumplimientoRepository } from '../../data/cumplimientoRepository';
import { recordatoriosScheduler } from '../../data/recordatoriosScheduler';
import { tratamientosService } from '../../data/tratamientosService';
import { useChecklistTratamiento } from '../../domain/useChecklistTratamiento';
import { TreatmentChecklistCard } from '../components/TreatmentChecklistCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Medications'>;

export default function MedicationsScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { pets } = useActivePet();
  const pet = pets.find((item) => item.id === route.params.petId);
  const { checklist, marcar, fromCache, updatedAt, isLoading, error, refetch } =
    useChecklistTratamiento(
      tratamientosService,
      cumplimientoRepository,
      recordatoriosScheduler,
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
          <Text style={styles.title} accessibilityRole="header">
            Tratamiento
          </Text>
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
        isEmpty={checklist.length === 0}
        emptyMessage={
          pet
            ? `${pet.name} no tiene tratamientos activos.`
            : 'Selecciona una mascota para consultar sus tratamientos.'
        }
        onRetry={refetch}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {fromCache && <OfflineBanner updatedAt={updatedAt} />}

          <View style={styles.notice}>
            <Ionicons name="phone-portrait-outline" size={18} color={colors.infoIcon} />
            <Text style={styles.noticeText}>
              Lo que marques se guarda solo en este teléfono como ayuda para ti. No cambia la ficha
              clínica de tu mascota.
            </Text>
          </View>

          {checklist.map((item) => (
            <TreatmentChecklistCard key={item.tratamiento.id} item={item} onMarcar={marcar} />
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
  content: { paddingHorizontal: 20, gap: 16 },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: colors.infoBackground,
  },
  noticeText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.infoText,
  },
});
