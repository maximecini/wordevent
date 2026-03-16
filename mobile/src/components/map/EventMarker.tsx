import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { EventResponse } from '../../api/endpoints/events.api';

interface Props {
  event: EventResponse;
  onPress: (event: EventResponse) => void;
}

const COLORS = {
  PUBLIC: { bg: '#3B82F6', shadow: '#3B82F680' },
  PRIVATE: { bg: '#6366F1', shadow: '#6366F180' },
};

/**
 * Marqueur d'événement sur la carte.
 * Affiche le nombre de participants dans un carré coloré selon la visibilité.
 */
export function EventMarker({ event, onPress }: Props) {
  const colors = COLORS[event.visibility];
  const isFull = event.participantCount >= event.capacity;

  return (
    <TouchableOpacity
      style={[styles.marker, { backgroundColor: isFull ? '#94A3B8' : colors.bg }]}
      onPress={() => onPress(event)}
      activeOpacity={0.85}
    >
      <Text style={styles.count}>{event.participantCount}</Text>
      {event.visibility === 'PRIVATE' && (
        <View style={styles.lockDot} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  marker: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
  },
  count: { color: '#fff', fontWeight: '700', fontSize: 15 },
  lockDot: {
    position: 'absolute', top: -4, right: -4,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#F59E0B', borderWidth: 2, borderColor: '#fff',
  },
});
