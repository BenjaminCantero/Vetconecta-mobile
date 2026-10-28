import { useState } from 'react';
import { SectionList, Pressable, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TabParamList } from '../../../../core/navigation/TabNavigator';
import type { RootStackParamList } from '../../../../core/navigation/RootNavigator';
import { colors } from '../../../../core/theme/colors';
import { fonts } from '../../../../core/theme/typography';
import { ENV } from '../../../../core/config/env';
import { ScreenHeader } from '../../../../shared/components/ScreenHeader';
import { SegmentedTabs } from '../../../../shared/components/SegmentedTabs';
import { QueryState } from '../../../../shared/components/QueryState';
import { ActivePetSwitcher } from '../../../../shared/components/ActivePetSwitcher';
import { useActivePet } from '../../../../shared/context/ActivePetContext';
import { useNotificationsSession } from '../context/NotificationsContext';
import type { Notification } from '../../domain/Notification';

function elapsedLabel(isoDate: string): string {
  const timestamp = Date.parse(isoDate);
  if (!Number.isFinite(timestamp)) return 'Fecha desconocida';

  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;

  return new Date(timestamp).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const PAGE_SIZE = 10;

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Notificaciones'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function NotificationsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { pets, activePetId } = useActivePet();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const paginationKey = `${activePetId ?? 'none'}:${filter}`;
  const [previousPaginationKey, setPreviousPaginationKey] = useState(paginationKey);

  // Al cambiar de mascota o filtro, reiniciar la paginación durante el render
  // para evitar una actualización de estado síncrona dentro de un efecto.
  if (paginationKey !== previousPaginationKey) {
    setPreviousPaginationKey(paginationKey);
    setVisibleCount(PAGE_SIZE);
  }

  // E3: la pantalla y el contador comparten el mismo estado.
  const { notifications, isLoading, error, refetch, isSaving, saveError, markAsRead } =
    useNotificationsSession();

  // Sin mascota activa, no se muestran avisos de otra mascota.
  // Los avisos globales (petId null/undefined) se muestran siempre.
  const forActivePet = notifications.filter((item) => {
    const petId = item.petId ?? (item.target?.screen === 'health' ? item.target.petId : null);

    return !petId || (activePetId !== null && petId === activePetId);
  });

  const unread = forActivePet.filter((item) => !item.read);
  const filtered = filter === 'unread' ? unread : forActivePet;
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function loadMore() {
    if (!isLoading && hasMore) {
      setVisibleCount((count) => Math.min(count + PAGE_SIZE, filtered.length));
    }
  }

  function refresh() {
    setVisibleCount(PAGE_SIZE);
    refetch();
  }

  const sections = visible.reduce<{ title: string; data: Notification[] }[]>((groups, item) => {
    const title = new Date(item.date).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const group = groups.find((entry) => entry.title === title);

    if (group) {
      group.data.push(item);
    } else {
      groups.push({ title, data: [item] });
    }

    return groups;
  }, []);

  async function open(item: Notification) {
    if (!item.read && !(await markAsRead([item.id]))) return;

    if (item.target?.screen === 'appointment') {
      navigation.navigate('Citas', {
        citaId: item.target.appointmentId,
      });
    }

    if (item.target?.screen === 'health') {
      navigation.navigate('HealthCard', {
        petId: item.target.petId,
      });
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.topBar}>
        <View style={styles.texts}>
          <ScreenHeader title="Avisos" />
        </View>

        {ENV.USE_MOCKS && (
          <View style={styles.demo}>
            <Text style={styles.demoText}>Demo</Text>
          </View>
        )}
      </View>

      <QueryState
        isLoading={isLoading}
        error={error ? new Error('No se pudieron cargar tus avisos. Intenta nuevamente.') : null}
        onRetry={refetch}
      >
        <SectionList
          sections={sections}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.intro}>
                <View style={styles.introIcon}>
                  <Ionicons name="notifications-outline" size={28} color={colors.appHeading} />
                </View>

                <View style={styles.texts}>
                  <Text style={styles.introTitle}>Su cuidado, al día</Text>
                  <Text style={styles.description}>
                    Citas y salud de tus mascotas, en un solo lugar.
                  </Text>
                </View>
              </View>

              <Text style={styles.demoDescription}>
                {ENV.USE_MOCKS
                  ? 'Estás viendo avisos de ejemplo.'
                  : 'El centro de avisos estará disponible próximamente.'}
              </Text>

              <ActivePetSwitcher />

              <SegmentedTabs
                options={[
                  {
                    value: 'all',
                    label: `Todos (${forActivePet.length})`,
                  },
                  {
                    value: 'unread',
                    label: `Sin leer (${unread.length})`,
                  },
                ]}
                value={filter}
                onChange={setFilter}
              />

              <View style={styles.toolbar}>
                <Text style={styles.count} accessibilityLiveRegion="polite">
                  {unread.length ? 'Por revisar' : 'Todo revisado'}
                </Text>

                <Pressable
                  disabled={!unread.length || isSaving || isLoading}
                  accessibilityRole="button"
                  accessibilityState={{
                    disabled: !unread.length || isSaving || isLoading,
                    busy: isSaving,
                  }}
                  onPress={() => void markAsRead(unread.map((item) => item.id))}
                  style={[
                    styles.markAll,
                    (!unread.length || isSaving || isLoading) && styles.disabled,
                  ]}
                >
                  <Ionicons name="checkmark-done-outline" size={18} color={colors.appHeading} />

                  <Text style={styles.link}>
                    {isSaving ? 'Guardando…' : 'Marcar todos como leídos'}
                  </Text>
                </Pressable>
              </View>

              {saveError && (
                <Text accessibilityRole="alert" style={styles.error}>
                  {saveError}
                </Text>
              )}
            </View>
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionDate}>{section.title}</Text>
              <View style={styles.rule} />
            </View>
          )}
          keyExtractor={(item) => item.id}
          refreshing={isLoading}
          onRefresh={refresh}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            hasMore ? (
              <View style={styles.paginationFooter}>
                <Text style={styles.demoDescription}>
                  Mostrando {visible.length} de {filtered.length} avisos
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={loadMore}
                  style={styles.loadMoreButton}
                >
                  <Text style={styles.link}>Cargar más avisos</Text>
                </Pressable>
              </View>
            ) : null
          }
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name={filter === 'unread' ? 'checkmark-done-outline' : 'notifications-outline'}
                size={40}
                color={colors.appHeading}
              />

              <Text style={styles.emptyTitle}>
                {filter === 'unread' ? 'Estás al día' : 'No hay avisos todavía'}
              </Text>

              <Text style={styles.description}>
                {filter === 'unread'
                  ? 'Puedes consultar los avisos leídos en Todos.'
                  : 'Los avisos aparecerán aquí cuando estén disponibles.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => void open(item)}
              disabled={isSaving}
              accessibilityRole="button"
              accessibilityLabel={`${
                item.read ? 'Leído' : 'Sin leer'
              }. ${item.title}. ${item.body}`}
              accessibilityHint={
                item.target?.screen === 'appointment' ? 'Abre la cita' : 'Abre el carnet'
              }
              android_ripple={{ color: colors.tintPurple }}
              style={[styles.card, !item.read && styles.unread]}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.icon,
                    item.target?.screen === 'appointment' && styles.appointmentIcon,
                  ]}
                >
                  <Ionicons
                    name={
                      item.target?.screen === 'appointment'
                        ? 'calendar-outline'
                        : 'document-text-outline'
                    }
                    size={22}
                    color={
                      item.target?.screen === 'appointment' ? colors.cardOrange : colors.appHeading
                    }
                  />
                </View>

                <View style={styles.texts}>
                  <Text style={styles.title}>{item.title}</Text>

                  <Text style={styles.date}>{elapsedLabel(item.date)}</Text>
                </View>

                {!item.read && (
                  <View style={styles.newBadge}>
                    <View style={styles.dot} />
                    <Text style={styles.newLabel}>Nuevo</Text>
                  </View>
                )}
              </View>

              <Text style={styles.body}>{item.body}</Text>

              <Text style={styles.petName}>
                Mascota:{' '}
                {pets.find(
                  (pet) =>
                    pet.id ===
                    (item.petId ?? (item.target?.screen === 'health' ? item.target.petId : null)),
                )?.name ?? (item.petId ? 'Mascota registrada' : 'Aviso general')}
              </Text>

              <View style={styles.cardFooter}>
                <Text style={styles.category}>
                  {item.target?.screen === 'appointment' ? 'Citas' : 'Carnet de salud'}
                </Text>

                <View style={styles.openAction}>
                  <Text style={styles.link}>
                    {item.target?.screen === 'appointment' ? 'Ver cita' : 'Ver carnet'}
                  </Text>

                  <Ionicons name="chevron-forward" size={16} color={colors.appHeading} />
                </View>
              </View>
            </Pressable>
          )}
        />
      </QueryState>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  demo: {
    backgroundColor: colors.statSurface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  demoText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.appMuted,
  },
  header: {
    gap: 12,
  },
  intro: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    paddingVertical: 20,
  },
  introIcon: {
    width: 60,
    height: 60,
    borderRadius: 22,
    backgroundColor: colors.tintPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introTitle: {
    fontFamily: fonts.bold,
    fontSize: 23,
    lineHeight: 30,
    color: colors.appTitle,
    marginBottom: 6,
  },
  demoDescription: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.appMuted,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionDate: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.appMuted,
  },
  rule: {
    height: 1,
    flex: 1,
    backgroundColor: colors.appDivider,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.appMuted,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 4,
  },
  count: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.appMuted,
  },
  markAll: {
    minHeight: 48,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  disabled: {
    opacity: 0.45,
  },
  link: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 20,
    color: colors.appHeading,
  },
  list: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  paginationFooter: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  loadMoreButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  separator: {
    height: 12,
  },
  card: {
    backgroundColor: colors.appSurface,
    borderWidth: 1,
    borderColor: colors.appDivider,
    borderRadius: 20,
    padding: 18,
    gap: 12,
    overflow: 'hidden',
  },
  unread: {
    borderColor: '#D7C5EE',
    backgroundColor: colors.appSurface,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  appointmentIcon: {
    backgroundColor: colors.tintOrange,
  },
  newBadge: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    backgroundColor: colors.tintPurple,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.appHeading,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.appDivider,
    paddingTop: 12,
  },
  category: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.appMuted,
  },
  openAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 32,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.tintPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 24,
    color: colors.appTitle,
  },
  date: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 20,
    color: colors.appMuted,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.appMuted,
  },
  petName: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.appHeading,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.appHeading,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.appTitle,
  },
  error: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.danger,
  },
});
