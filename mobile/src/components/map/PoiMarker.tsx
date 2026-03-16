import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { PlaceResponse } from '../../types/place.types';

type Props = {
  place: PlaceResponse;
  onSelect: (place: PlaceResponse) => void;
};

/** Marqueur individuel pour un POI personnel sur la carte. */
export function PoiMarker({ place, onSelect }: Props) {
  const handlePress = useCallback(() => onSelect(place), [place, onSelect]);
  const label = place.icon ?? '📍';

  return (
    <Marker
      coordinate={{ latitude: place.lat, longitude: place.lng }}
      onPress={handlePress}
      tracksViewChanges={true}
    >
      <View style={styles.wrapper} collapsable={false}>
        <View style={styles.bubble}>
          <Text style={styles.icon}>{label}</Text>
          <Text style={styles.name} numberOfLines={1}>{place.name}</Text>
        </View>
        <View style={styles.dot} />
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
    borderColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 130,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  icon: { fontSize: 13 },
  name: { fontSize: 12, fontWeight: '700', color: '#0F172A', flexShrink: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F59E0B', marginTop: 3 },
});
