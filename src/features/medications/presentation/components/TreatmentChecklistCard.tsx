// Responsabilidad: tarjeta de un tratamiento con su checklist de dosis
// agrupado por día (capa PRESENTATION de medications, H2).

import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import type { DosisChecklist, TratamientoChecklist } from '../../domain/checklistDosis';
import { DoseChecklistItem } from './DoseChecklistItem';

function formatFrequency(hours: number): string {
  if (hours < 1) return `cada ${Math.round(hours * 60)} min`;

  return `cada ${Number(hours.toFixed(1))} h`;
}

function formatDuration(days: number): string {
  if (days < 1) return `${Math.round(days * 24 * 60)} min`;

  return days === 1 ? '1 día' : `${Number(days.toFixed(1))} días`;
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function dayLabel(date: Date, now: Date): string {
  const startOfDay = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const days = Math.round((startOfDay(date) - startOfDay(now)) / 86_400_000);

  if (days === 0) return 'Hoy';
  if (days === 1) return 'Mañana';
  if (days === -1) return 'Ayer';

  const label = date.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function groupByDay(
  dosis: DosisChecklist[],
): { key: string; date: Date; items: DosisChecklist[] }[] {
  const groups = new Map<string, { key: string; date: Date; items: DosisChecklist[] }>();

  for (const item of dosis) {
    const date = new Date(item.at);
    const key = dayKey(date);
    const group = groups.get(key) ?? { key, date, items: [] };

    group.items.push(item);
    groups.set(key, group);
  }

  return [...groups.values()];
}

interface TreatmentChecklistCardProps {
  item: TratamientoChecklist;
  onMarcar: (dosis: DosisChecklist) => Promise<void>;
}

export function TreatmentChecklistCard({ item, onMarcar }: TreatmentChecklistCardProps) {
  const { tratamiento, dosis, administradas, total } = item;
  const progress = total > 0 ? Math.round((administradas / total) * 100) : 0;
  const now = new Date();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons name="medical" size={18} color={colors.cardGreen} />
        </View>
        <View style={styles.headerTexts}>
          <Text style={styles.medication}>{tratamiento.medication}</Text>
          <Text style={styles.detail}>
            {tratamiento.dose}, {formatFrequency(tratamiento.frequencyHours)} durante{' '}
            {formatDuration(tratamiento.durationDays)}
          </Text>
        </View>
      </View>

      {tratamiento.instructions ? (
        <Text style={styles.instructions}>{tratamiento.instructions}</Text>
      ) : null}

      <View
        style={styles.progressTrack}
        accessibilityRole="progressbar"
        accessibilityLabel="Dosis administradas"
        accessibilityValue={{ min: 0, max: total, now: administradas }}
      >
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressLabel}>
        {administradas} de {total} dosis administradas
      </Text>

      {groupByDay(dosis).map((group) => (
        <View key={group.key} style={styles.day}>
          <Text style={styles.dayLabel} accessibilityRole="header">
            {dayLabel(group.date, now)}
          </Text>
          {group.items.map((dose) => (
            <DoseChecklistItem key={dose.key} dosis={dose} onMarcar={onMarcar} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 22, padding: 16, backgroundColor: colors.appSurface },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tintGreen,
  },
  headerTexts: { flex: 1 },
  medication: { fontFamily: fonts.bold, fontSize: 16, color: colors.appTitle },
  detail: { marginTop: 2, fontFamily: fonts.regular, fontSize: 13, color: colors.appMuted },
  instructions: {
    marginTop: 12,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19,
    color: colors.appTitle,
  },
  progressTrack: {
    height: 6,
    marginTop: 14,
    borderRadius: 999,
    backgroundColor: colors.tintGreen,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: colors.cardGreen },
  progressLabel: { marginTop: 6, fontFamily: fonts.medium, fontSize: 12, color: colors.appMuted },
  day: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.appDivider,
  },
  dayLabel: { fontFamily: fonts.bold, fontSize: 13, color: colors.appHeading },
});
