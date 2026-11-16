// Responsabilidad: fila del checklist de dosis (capa PRESENTATION de medications, H2).
// Muestra la hora de la toma, su estado y, si corresponde, el botón para
// marcarla como administrada.

import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import type { DosisChecklist, EstadoDosis } from '../../domain/checklistDosis';

const ESTADOS: Record<
  EstadoDosis,
  { label: string; color: string; tint: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  pendiente: {
    label: 'Pendiente',
    color: colors.appHeading,
    tint: colors.tintPurple,
    icon: 'time-outline',
  },
  administrada: {
    label: 'Administrada',
    color: colors.cardGreen,
    tint: colors.tintGreen,
    icon: 'checkmark-circle',
  },
  atrasada: {
    label: 'Atrasada',
    color: colors.cardRed,
    tint: colors.tintRed,
    icon: 'alert-circle',
  },
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

interface DoseChecklistItemProps {
  dosis: DosisChecklist;
  onMarcar: (dosis: DosisChecklist) => Promise<void>;
}

export function DoseChecklistItem({ dosis, onMarcar }: DoseChecklistItemProps) {
  const [saving, setSaving] = useState(false);
  const estado = ESTADOS[dosis.estado];
  const time = formatTime(dosis.at);

  const marcar = async () => {
    setSaving(true);

    try {
      await onMarcar(dosis);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: estado.tint }]}>
        <Ionicons name={estado.icon} size={18} color={estado.color} />
      </View>

      <View style={styles.texts}>
        <Text style={styles.time}>{time}</Text>
        <Text style={[styles.status, { color: estado.color }]}>
          {estado.label}
          {dosis.administradaAt ? ` a las ${formatTime(dosis.administradaAt)}` : ''}
        </Text>
      </View>

      {dosis.puedeMarcar && (
        <Pressable
          onPress={marcar}
          disabled={saving}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          accessibilityRole="button"
          accessibilityLabel={`Marcar como administrada la dosis de las ${time}`}
          accessibilityState={{ disabled: saving, busy: saving }}
          android_ripple={{ color: '#FFFFFF26' }}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.textLight} />
          ) : (
            <Text style={styles.buttonLabel}>Marcar como administrada</Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingVertical: 8,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1 },
  time: { fontFamily: fonts.bold, fontSize: 15, color: colors.appTitle },
  status: { marginTop: 2, fontFamily: fonts.semibold, fontSize: 12 },
  button: {
    minHeight: 44,
    maxWidth: 150,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  buttonPressed: { opacity: 0.85 },
  buttonLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
    color: colors.textLight,
  },
});
