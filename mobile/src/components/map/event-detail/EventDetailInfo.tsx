import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EventResponse } from '../../../types/event.types';

type Props = {
  event: EventResponse;
};

function formatDateRange(startAt: string, endAt: string): string {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const date = start.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const from = start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const to   = end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${date}  ·  ${from} – ${to}`;
}

function CapacityBar({ count, capacity }: { count: number; capacity: number }) {
  const ratio  = Math.min(count / capacity, 1);
  const isFull = count >= capacity;
  const fillColor = isFull ? '#EF4444' : '#2563EB';
  return (
    <View style={styles.capacityRow}>
      <Text style={styles.capacityLabel}>👥 Participants</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${ratio * 100}%` as any, backgroundColor: fillColor }]} />
      </View>
      <Text style={[styles.capacityCount, isFull && styles.capacityFull]}>{count}/{capacity}</Text>
    </View>
  );
}

/** Bloc informations : date, description, jauge de capacité. */
export function EventDetailInfo({ event }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.dateRow}>
        <Text style={styles.dateIcon}>🗓</Text>
        <Text style={styles.dateText}>{formatDateRange(event.startAt, event.endAt)}</Text>
      </View>

      {event.description ? (
        <Text style={styles.description} numberOfLines={3}>{event.description}</Text>
      ) : null}

      <CapacityBar count={event.participantCount} capacity={event.capacity} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  dateRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  dateIcon: { fontSize: 16, marginTop: 1 },
  dateText: { flex: 1, fontSize: 13, color: '#475569', lineHeight: 19 },
  description: { fontSize: 14, color: '#475569', lineHeight: 21 },
  capacityRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  capacityLabel: { fontSize: 13, color: '#64748B' },
  barTrack: { flex: 1, height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  capacityCount: { fontSize: 13, fontWeight: '600', color: '#64748B', minWidth: 40, textAlign: 'right' },
  capacityFull: { color: '#EF4444' },
});
