// Responsabilidad: formulario de calificación post-consulta (H3).
// Capa PRESENTATION de appointments.
// Componente reutilizable desde Inicio y Mis citas.

import { useRef, useState } from 'react';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';

import type { AppointmentRating } from '../../domain/Appointment';

const MAX_COMMENT_LENGTH = 500;

const STARS = [1, 2, 3, 4, 5] as const;

const RATING_LABELS = [
  'Selecciona una calificación',
  'Muy mala',
  'Mala',
  'Regular',
  'Buena',
  'Excelente',
];

interface AppointmentRatingModalProps {
  petName: string;
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: AppointmentRating) => Promise<void>;
}

export function AppointmentRatingModal({
  petName,
  visible,
  onClose,
  onSubmit,
}: AppointmentRatingModalProps) {
  const [stars, setStars] = useState<AppointmentRating['estrellas'] | 0>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submittingRef = useRef(false);

  function resetForm() {
    setStars(0);
    setComment('');
    setError(null);
  }

  function handleClose() {
    if (submittingRef.current) {
      return;
    }

    resetForm();
    onClose();
  }

  async function handleSubmit() {
    if (stars === 0 || submittingRef.current) {
      return;
    }

    if (comment.length > MAX_COMMENT_LENGTH) {
      setError('El comentario no puede superar los 500 caracteres.');
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      const trimmedComment = comment.trim();

      await onSubmit({
        estrellas: stars,
        ...(trimmedComment && { comentario: trimmedComment }),
      });

      resetForm();
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'No se pudo enviar la calificación.',
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  const submitDisabled = stars === 0 || isSubmitting;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Calificar atención</Text>

            <Pressable
              onPress={handleClose}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Cerrar formulario"
              hitSlop={10}
            >
              <Ionicons name="close" size={24} color={colors.appMuted} />
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.question}>¿Cómo fue la atención de {petName}?</Text>

            <View style={styles.stars}>
              {STARS.map((star) => (
                <Pressable
                  key={star}
                  disabled={isSubmitting}
                  accessibilityRole="button"
                  accessibilityLabel={`Calificar con ${star} de 5 estrellas`}
                  accessibilityState={{ selected: stars === star }}
                  onPress={() => {
                    setStars(star);
                    setError(null);
                  }}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= stars ? 'star' : 'star-outline'}
                    size={36}
                    color={star <= stars ? '#E8A317' : colors.appMuted}
                  />
                </Pressable>
              ))}
            </View>

            <Text style={styles.ratingLabel}>{RATING_LABELS[stars]}</Text>

            <Text style={styles.commentLabel}>Comentario (opcional)</Text>

            <TextInput
              value={comment}
              onChangeText={setComment}
              editable={!isSubmitting}
              multiline
              maxLength={MAX_COMMENT_LENGTH}
              placeholder="Cuéntanos cómo fue tu experiencia..."
              placeholderTextColor={colors.appMuted}
              accessibilityLabel="Comentario opcional"
              style={styles.input}
              textAlignVertical="top"
            />

            <Text style={styles.counter}>
              {comment.length}/{MAX_COMMENT_LENGTH} caracteres
            </Text>

            {error ? (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            ) : null}

            <Pressable
              onPress={() => {
                void handleSubmit();
              }}
              disabled={submitDisabled}
              accessibilityRole="button"
              accessibilityState={{ disabled: submitDisabled }}
              style={[styles.submitButton, submitDisabled && styles.submitDisabled]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitLabel}>Enviar calificación</Text>
              )}
            </Pressable>

            <Pressable
              onPress={handleClose}
              disabled={isSubmitting}
              accessibilityRole="button"
              style={styles.cancelButton}
            >
              <Text style={styles.cancelLabel}>Cancelar</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.50)',
  },

  modal: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    padding: 22,
    borderRadius: 24,
    backgroundColor: colors.appSurface,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.appTitle,
  },

  question: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.appTitle,
    textAlign: 'center',
  },

  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    gap: 2,
  },

  starButton: {
    padding: 4,
  },

  ratingLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.appMuted,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 24,
  },

  commentLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.appTitle,
    marginBottom: 8,
  },

  input: {
    minHeight: 110,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.appDivider,
    borderRadius: 12,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.appTitle,
  },

  counter: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.appMuted,
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 18,
  },

  error: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.statusCancelled,
    marginBottom: 14,
  },

  submitButton: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: colors.appHeading,
  },

  submitDisabled: {
    opacity: 0.45,
  },

  submitLabel: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },

  cancelButton: {
    minHeight: 44,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.appMuted,
  },
});
