import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { EventResponse } from '../../types/event.types';

type Props = {
  event: EventResponse;
  onSelect: (event: EventResponse) => void;
};

function formatTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

/** Marqueur individuel pour un événement sur la carte. */
export function EventMarker({ event, onSelect }: Props) {
  const isPrivate = event.visibility === 'PRIVATE';
  const isFull = event.participantCount >= event.capacity;

  const handlePress = useCallback(() => onSelect(event), [event, onSelect]);

  const dotColor = isPrivate ? '#7C3AED' : '#2563EB';
  const labelColor = isFull ? '#94A3B8' : dotColor;

  return (
    <Marker
      coordinate={{ latitude: event.lat, longitude: event.lng }}
      onPress={handlePress}
      tracksViewChanges={true}
      hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
    >
      <View style={styles.wrapper} collapsable={false}>
        <View style={[styles.bubble, { borderColor: dotColor }]}>
          <Text style={[styles.title]} numberOfLines={1}>{event.title}</Text>
          <Text style={[styles.time, { color: labelColor }]}>{formatTime(event.startAt)}</Text>
        </View>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  bubble: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 130,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  title: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
  time: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 3 },
});
