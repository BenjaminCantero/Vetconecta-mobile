// Responsabilidad: flujo de agendamiento (PRESENTATION).
// D3 / FR-3 / UC-03. Etapa 3: selección, disponibilidad y confirmación de reserva.

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../../core/navigation/RootNavigator';
import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import { useActivePet } from '../../../../shared/context/ActivePetContext';
import {
  bookingSpecialtiesMock,
  bookingVeterinariansMock,
} from '../../data/bookingCatalogMock';
import { availabilityRepository } from '../../data/availabilityRepository';
import { useAvailability } from '../../domain/useAvailability';
import { bookingRepository } from '../../data/bookingRepository';
import { useBookAppointment } from '../../domain/useBookAppointment';
import { HoraNoDisponibleError, SinConexionError } from '../../domain/bookingErrors';

type Props = NativeStackScreenProps<RootStackParamList, 'BookAppointment'>;
type Step = 1 | 2 | 3 | 4 | 5;

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromLocalDateKey(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function monthTitle(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export default function BookAppointmentScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { pets, activePetId, setActivePetId } = useActivePet();
  const { reserve, isSubmitting } = useBookAppointment(bookingRepository);
  const submittingRef = useRef(false);

  const [step, setStep] = useState<Step>(1);
  const [petId, setPetId] = useState<string | null>(null);
  const [specialtyId, setSpecialtyId] = useState<string | null>(null);
  const [veterinarianId, setVeterinarianId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [hour, setHour] = useState<string | null>(null);
  const [displayedMonth, setDisplayedMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  useEffect(() => {
    if (!petId && activePetId && pets.some((pet) => pet.id === activePetId)) {
      setPetId(activePetId);
    } else if (!petId && pets.length === 1) {
      setPetId(pets[0].id);
    }
  }, [activePetId, pets, petId]);

  useEffect(() => {
    if (pets.length === 1 && step === 1) setStep(2);
  }, [pets.length, step]);

  const veterinarians = useMemo(
    () => bookingVeterinariansMock.filter(
      (vet) => specialtyId !== null && vet.specialtyIds.includes(specialtyId),
    ),
    [specialtyId],
  );

  const selectedPet = pets.find((pet) => pet.id === petId);
  const selectedSpecialty = bookingSpecialtiesMock.find((item) => item.id === specialtyId);
  const selectedVeterinarian = bookingVeterinariansMock.find((item) => item.id === veterinarianId);

  const availabilityQuery = useMemo(() => ({
    petId: petId ?? '',
    specialty: specialtyId ?? '',
    veterinarian: veterinarianId ?? '',
    date: step >= 4 ? date ?? '' : '',
  }), [petId, specialtyId, veterinarianId, date, step]);

  const { availableHours, isLoading, error, refetch } = useAvailability(
    availabilityRepository,
    availabilityQuery,
  );

  const todayKey = toLocalDateKey(new Date());
  const todayMonth = new Date();
  const firstCurrentMonth = new Date(todayMonth.getFullYear(), todayMonth.getMonth(), 1);
  const canGoPreviousMonth = displayedMonth.getTime() > firstCurrentMonth.getTime();

  const calendarDays = useMemo(() => {
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    const numberOfDays = new Date(year, month + 1, 0).getDate();
    const offset = (new Date(year, month, 1).getDay() + 6) % 7;
    const result: (string | null)[] = Array(offset).fill(null);
    for (let day = 1; day <= numberOfDays; day += 1) {
      result.push(toLocalDateKey(new Date(year, month, day)));
    }
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [displayedMonth]);

  const validHours = useMemo(() => {
    if (!date || isLoading || error) return [];
    const now = new Date();
    return availableHours.filter((slot) => {
      if (!/^\d{2}:\d{2}$/.test(slot)) return false;
      if (date > todayKey) return true;
      if (date < todayKey) return false;
      const [hours, minutes] = slot.split(':').map(Number);
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes).getTime() > now.getTime();
    });
  }, [availableHours, date, error, isLoading, todayKey]);

  const hourIsAvailable = hour !== null && validHours.includes(hour);
  const canContinue =
    (step === 1 && petId !== null) ||
    (step === 2 && specialtyId !== null) ||
    (step === 3 && veterinarianId !== null) ||
    (step === 4 && !!date && hourIsAvailable && !isLoading && !error);

  const titleByStep: Record<Step, string> = {
    1: 'Selecciona tu mascota',
    2: 'Selecciona una especialidad',
    3: 'Selecciona un veterinario',
    4: 'Selecciona fecha y hora',
    5: 'Revisa tu reserva',
  };

  const handleBack = () => {
    if (submittingRef.current || isSubmitting) return;
    if (step === 1 || (step === 2 && pets.length === 1)) {
      navigation.goBack();
      return;
    }
    setStep((current) => (current - 1) as Step);
  };

  const handleContinue = () => {
    if (!canContinue || step >= 5) return;
    setStep((current) => (current + 1) as Step);
  };

  const handleConfirm = async () => {
    // La protección con ref impide pulsaciones dobles antes del siguiente render.
    if (submittingRef.current || isSubmitting || step !== 5) return;
    if (!petId || !specialtyId || !veterinarianId || !date || !hour) {
      Alert.alert('Datos incompletos', 'Revisa todos los datos de tu reserva.');
      return;
    }

    const selectedDateTime = new Date(`${date}T${hour}:00`);
    if (!Number.isFinite(selectedDateTime.getTime()) || selectedDateTime.getTime() <= Date.now()) {
      setStep(4);
      setHour(null);
      Alert.alert('Horario no válido', 'Selecciona una fecha y hora futuras.');
      return;
    }

    submittingRef.current = true;
    try {
      const appointment = await reserve({
        petId,
        specialtyId,
        veterinarianId,
        date,
        hour,
      });

      if (appointment) {
        // Mis citas filtra por la mascota activa: hacemos visible la recién reservada.
        if (activePetId !== petId) setActivePetId(petId);
        Alert.alert(
          'Cita confirmada',
          'Tu reserva se registró correctamente. Puedes verla en Mis citas.',
          [{ text: 'Ver mis citas', onPress: () => navigation.goBack() }],
          { cancelable: false },
        );
      }
    } catch (bookingError) {
      if (bookingError instanceof HoraNoDisponibleError) {
        setStep(4);
        setHour(null);
        try {
          await refetch();
        } catch {
          // La consulta mostrará su error en el paso 4.
        }
        Alert.alert(
          'Hora no disponible',
          'El horario seleccionado acaba de ocuparse. Elige otra hora disponible.',
        );
      } else if (bookingError instanceof SinConexionError) {
        Alert.alert(
          'Sin conexión',
          'Necesitas conexión a internet para confirmar la cita. No se registró ninguna reserva.',
        );
      } else {
        Alert.alert(
          'No se pudo reservar',
          bookingError instanceof Error ? bookingError.message : 'Ocurrió un error inesperado.',
        );
      }
    } finally {
      submittingRef.current = false;
    }
  };

  const handleSelectSpecialty = (id: string) => {
    if (specialtyId === id) return;
    setSpecialtyId(id);
    setVeterinarianId(null);
    setDate(null);
    setHour(null);
  };

  const handleSelectVeterinarian = (id: string) => {
    if (veterinarianId === id) return;
    setVeterinarianId(id);
    setDate(null);
    setHour(null);
  };

  const handleSelectDate = (key: string) => {
    if (key < todayKey) return;
    if (date !== key) {
      setDate(key);
      setHour(null);
    }
  };

  const changeMonth = (offset: number) => {
    if (offset < 0 && !canGoPreviousMonth) return;
    setDisplayedMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const renderOption = (
    id: string,
    title: string,
    subtitle: string,
    selected: boolean,
    onPress: () => void,
  ) => (
    <Pressable
      key={id}
      style={[styles.option, selected && styles.selectedOption]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
    >
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons
        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
        size={25}
        color={selected ? colors.appHeading : colors.appMuted}
      />
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable
          onPress={handleBack}
          disabled={isSubmitting}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Ionicons name="arrow-back" size={24} color={colors.appHeading} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Agendar hora</Text>
          <Text style={styles.headerSubtitle}>Paso {step} de 5</Text>
        </View>
      </View>

      <View style={styles.progress}>
        {[1, 2, 3, 4, 5].map((number) => (
          <View
            key={number}
            style={[styles.progressSegment, number <= step && styles.progressActive]}
          />
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{titleByStep[step]}</Text>

        {step === 1 && (
          <>
            <Text style={styles.description}>Elige la mascota que necesita atención.</Text>
            {pets.map((pet) => renderOption(
              pet.id, pet.name, 'Mascota registrada', petId === pet.id,
              () => {
                if (petId !== pet.id) {
                  setPetId(pet.id);
                  setDate(null);
                  setHour(null);
                }
              },
            ))}
            {pets.length === 0 && (
              <Text style={styles.description}>No hay mascotas disponibles. Revisa tus registros en Mis mascotas.</Text>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.description}>
              ¿Qué tipo de atención necesita {selectedPet?.name ?? 'tu mascota'}?
            </Text>
            {bookingSpecialtiesMock.map((item) => renderOption(
              item.id, item.name, '', specialtyId === item.id,
              () => handleSelectSpecialty(item.id),
            ))}
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.description}>
              Profesionales para {selectedSpecialty?.name.toLowerCase() ?? 'la especialidad seleccionada'}.
            </Text>
            {veterinarians.map((vet) => renderOption(
              vet.id, vet.name, selectedSpecialty?.name ?? '',
              veterinarianId === vet.id, () => handleSelectVeterinarian(vet.id),
            ))}
            {veterinarians.length === 0 && (
              <Text style={styles.description}>No hay profesionales disponibles para esta especialidad.</Text>
            )}
          </>
        )}

        {step === 4 && (
          <>
            <Text style={styles.description}>
              Elige un día de atención y luego una hora disponible.
            </Text>
            <View style={styles.calendarCard}>
              <View style={styles.monthHeader}>
                <Pressable
                  onPress={() => changeMonth(-1)}
                  disabled={!canGoPreviousMonth}
                  style={styles.monthButton}
                  accessibilityRole="button"
                  accessibilityLabel="Mes anterior"
                >
                  <Ionicons name="chevron-back" size={22} color={canGoPreviousMonth ? colors.appHeading : colors.appDivider} />
                </Pressable>
                <Text style={styles.monthTitle}>{monthTitle(displayedMonth)}</Text>
                <Pressable
                  onPress={() => changeMonth(1)}
                  style={styles.monthButton}
                  accessibilityRole="button"
                  accessibilityLabel="Mes siguiente"
                >
                  <Ionicons name="chevron-forward" size={22} color={colors.appHeading} />
                </Pressable>
              </View>
              <View style={styles.calendarGrid}>
                {WEEKDAYS.map((day) => (
                  <View key={day} style={styles.dayCell}>
                    <Text style={styles.weekdayText}>{day}</Text>
                  </View>
                ))}
                {calendarDays.map((key, index) => {
                  const disabled = !key || key < todayKey;
                  const selected = !!key && date === key;
                  return (
                    <View key={key ?? `blank-${index}`} style={styles.dayCell}>
                      {key && (
                        <Pressable
                          onPress={() => handleSelectDate(key)}
                          disabled={disabled}
                          style={[styles.dayButton, selected && styles.selectedDay]}
                          accessibilityRole="button"
                          accessibilityLabel={`Seleccionar ${key}`}
                          accessibilityState={{ disabled, selected }}
                        >
                          <Text style={[
                            styles.dayText,
                            disabled && styles.disabledDayText,
                            selected && styles.selectedDayText,
                          ]}>
                            {fromLocalDateKey(key).getDate()}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>

            <Text style={styles.sectionTitle}>Horarios disponibles</Text>
            {!date ? (
              <Text style={styles.description}>Selecciona una fecha para consultar los horarios.</Text>
            ) : isLoading ? (
              <View style={styles.feedbackRow}>
                <ActivityIndicator color={colors.appHeading} />
                <Text style={styles.description}>Consultando disponibilidad...</Text>
              </View>
            ) : error ? (
              <View style={styles.feedbackCard}>
                <Text style={styles.description}>{error.message}</Text>
                <Pressable onPress={refetch} style={styles.retryButton} accessibilityRole="button">
                  <Text style={styles.retryText}>Reintentar</Text>
                </Pressable>
              </View>
            ) : validHours.length === 0 ? (
              <Text style={styles.description}>No hay horas disponibles para esta fecha. Selecciona otro día.</Text>
            ) : (
              <View style={styles.hoursGrid}>
                {validHours.map((slot) => (
                  <Pressable
                    key={slot}
                    onPress={() => setHour(slot)}
                    style={[styles.hourButton, hour === slot && styles.selectedHour]}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: hour === slot }}
                  >
                    <Text style={[styles.hourText, hour === slot && styles.selectedHourText]}>{slot}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </>
        )}

        {step === 5 && (
          <>
            <Text style={styles.description}>Comprueba los datos antes de confirmar tu cita.</Text>
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Resumen de la reserva</Text>
              <Text style={styles.summaryText}>Mascota: {selectedPet?.name ?? 'Sin seleccionar'}</Text>
              <Text style={styles.summaryText}>Especialidad: {selectedSpecialty?.name ?? 'Sin seleccionar'}</Text>
              <Text style={styles.summaryText}>Veterinario: {selectedVeterinarian?.name ?? 'Sin seleccionar'}</Text>
              <Text style={styles.summaryText}>Fecha: {date ?? 'Sin seleccionar'}</Text>
              <Text style={styles.summaryText}>Hora: {hour ?? 'Sin seleccionar'}</Text>
            </View>
            <View style={styles.feedbackCard}>
              <Text style={styles.description}>
                Al confirmar, se verificará nuevamente la disponibilidad antes de registrar tu cita.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 12 }]}>
        <Pressable
          onPress={handleBack}
          disabled={isSubmitting}
          style={[styles.secondaryButton, isSubmitting && styles.disabledButton]}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryText}>Atrás</Text>
        </Pressable>
        {step < 5 ? (
          <Pressable
            onPress={handleContinue}
            disabled={!canContinue}
            style={[styles.primaryButton, !canContinue && styles.disabledButton]}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canContinue }}
          >
            <Text style={styles.primaryText}>Continuar</Text>
            <Ionicons name="arrow-forward" size={19} color={colors.textLight} />
          </Pressable>
        ) : (
          <Pressable
            onPress={handleConfirm}
            disabled={isSubmitting}
            style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
            accessibilityRole="button"
            accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.textLight} />
            ) : (
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.textLight} />
            )}
            <Text style={styles.primaryText}>
              {isSubmitting ? 'Confirmando...' : 'Confirmar reserva'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBackground },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  backButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.appSurface, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1, gap: 3 },
  headerTitle: { fontFamily: fonts.bold, fontSize: 21, color: colors.appTitle },
  headerSubtitle: { fontFamily: fonts.medium, fontSize: 13, color: colors.appMuted },
  progress: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, marginBottom: 18 },
  progressSegment: { flex: 1, height: 6, borderRadius: 6, backgroundColor: colors.appDivider },
  progressActive: { backgroundColor: colors.appHeading },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.appTitle, marginBottom: 4 },
  description: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.appMuted, marginBottom: 10 },
  option: { minHeight: 68, flexDirection: 'row', alignItems: 'center', borderRadius: 17, borderWidth: 2, borderColor: colors.appDivider, backgroundColor: colors.appSurface, paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  selectedOption: { borderColor: colors.appHeading, backgroundColor: colors.tintPurple },
  optionText: { flex: 1, gap: 4 },
  optionTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.appTitle },
  optionSubtitle: { fontFamily: fonts.regular, fontSize: 12, color: colors.appMuted },
  calendarCard: { padding: 14, borderRadius: 18, backgroundColor: colors.appSurface, gap: 12 },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  monthTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.appTitle, textTransform: 'capitalize' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.285714%', height: 46, alignItems: 'center', justifyContent: 'center' },
  weekdayText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.appMuted },
  dayButton: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  selectedDay: { backgroundColor: colors.appHeading },
  dayText: { fontFamily: fonts.medium, fontSize: 14, color: colors.appTitle },
  disabledDayText: { color: colors.appDivider },
  selectedDayText: { color: colors.textLight, fontFamily: fonts.bold },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.appTitle, marginTop: 8 },
  feedbackRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  feedbackCard: { padding: 16, borderRadius: 16, backgroundColor: colors.appSurface, gap: 8 },
  retryButton: { minHeight: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.tintPurple, borderRadius: 12 },
  retryText: { fontFamily: fonts.bold, color: colors.appHeading },
  hoursGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  hourButton: { minWidth: 82, minHeight: 48, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: colors.appSurface, borderWidth: 2, borderColor: colors.appDivider },
  selectedHour: { borderColor: colors.appHeading, backgroundColor: colors.tintPurple },
  hourText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.appTitle },
  selectedHourText: { color: colors.appHeading },
  summary: { padding: 18, borderRadius: 18, backgroundColor: colors.appSurface, gap: 10 },
  summaryTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.appTitle },
  summaryText: { fontFamily: fonts.regular, fontSize: 14, color: colors.appMuted },
  footer: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 14, backgroundColor: colors.appSurface, borderTopWidth: 1, borderTopColor: colors.appDivider },
  secondaryButton: { minHeight: 48, flex: 1, borderWidth: 1, borderColor: colors.appDivider, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontFamily: fonts.bold, fontSize: 14, color: colors.appHeading },
  primaryButton: { minHeight: 48, flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, backgroundColor: colors.appHeading },
  disabledButton: { opacity: 0.45 },
  primaryText: { fontFamily: fonts.bold, fontSize: 14, color: colors.textLight },
});
