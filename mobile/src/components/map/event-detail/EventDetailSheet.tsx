import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { EventResponse } from '../../../types/event.types';

type Props = {
  event: EventResponse | null;
  onClose: () => void;
};

function formatDateRange(startAt: string, endAt: string): string {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const date = start.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  const from = start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const to = end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${from} – ${to}`;
}

function CapacityBar({ count, capacity }: { count: number; capacity: number }) {
  const ratio = Math.min(count / capacity, 1);
  const isFull = count >= capacity;
  return (
    <View style={styles.capacityRow}>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${ratio * 100}%` as any, backgroundColor: isFull ? '#EF4444' : '#2563EB' }]} />
      </View>
      <Text style={[styles.capacityText, isFull && styles.capacityFull]}>
        {count}/{capacity}
      </Text>
    </View>
  );
}

/** BottomSheet affichant le détail d'un événement sélectionné. */
export function EventDetailSheet({ event, onClose }: Props) {
  const sheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (event) sheetRef.current?.expand();
    else sheetRef.current?.close();
  }, [event]);

  const handleChange = useCallback((index: number) => {
    if (index === -1) onClose();
  }, [onClose]);

  if (!event) return null;

  const isPrivate = event.visibility === 'PRIVATE';
  const isFull = event.participantCount >= event.capacity;

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={['40%']}
      enablePanDownToClose
      onClose={onClose}
      onChange={handleChange}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
            <View style={[styles.badge, isPrivate ? styles.badgePrivate : styles.badgePublic]}>
              <Text style={styles.badgeText}>{isPrivate ? 'Privé' : 'Public'}</Text>
            </View>
          </View>
          <Text style={styles.date}>{formatDateRange(event.startAt, event.endAt)}</Text>
        </View>

        {event.description ? (
          <Text style={styles.description} numberOfLines={3}>{event.description}</Text>
        ) : null}

        <CapacityBar count={event.participantCount} capacity={event.capacity} />

        <TouchableOpacity
          style={[styles.actionBtn, (isFull && !event.isParticipant) && styles.actionDisabled]}
          disabled={isFull && !event.isParticipant}
        >
          <Text style={styles.actionText}>
            {event.isParticipant ? 'Quitter' : isFull ? 'Complet' : 'Rejoindre'}
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBg: { backgroundColor: '#fff', borderRadius: 20 },
  handle: { backgroundColor: '#CBD5E1', width: 40 },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 12 },
  header: { gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  title: { flex: 1, fontSize: 18, fontWeight: '700', color: '#0F172A' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 2 },
  badgePublic: { backgroundColor: '#DBEAFE' },
  badgePrivate: { backgroundColor: '#EDE9FE' },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#1E40AF' },
  date: { fontSize: 13, color: '#64748B' },
  description: { fontSize: 14, color: '#475569', lineHeight: 20 },
  capacityRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barTrack: { flex: 1, height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  capacityText: { fontSize: 13, fontWeight: '600', color: '#64748B', minWidth: 40, textAlign: 'right' },
  capacityFull: { color: '#EF4444' },
  actionBtn: { backgroundColor: '#0F172A', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  actionDisabled: { backgroundColor: '#CBD5E1' },
  actionText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
