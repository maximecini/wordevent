import React, { useCallback, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { EventResponse } from '../../types/event.types';
import { getCategoryConfig } from '../../utils/event-category.utils';

type Props = {
  event: EventResponse;
  onSelect: (event: EventResponse) => void;
};

const SIZE = 52;

/** Marqueur style Instagram — cercle image, fonctionne iOS + Android. */
export function EventMarker({ event, onSelect }: Props) {
  const [ready, setReady] = useState(false);
  const config      = getCategoryConfig(event.category);
  const isFull      = event.participantCount >= event.capacity;
  const borderColor = isFull ? '#94A3B8' : config.color;

  const handlePress = useCallback(() => onSelect(event), [event, onSelect]);

  return (
    <Marker
      coordinate={{ latitude: event.lat, longitude: event.lng }}
      onPress={handlePress}
      tracksViewChanges={!ready}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <View style={styles.wrapper} collapsable={false} onLayout={() => setReady(true)}>
        <View style={[styles.border, { borderColor }]}>
          <Image
            source={config.image}
            style={[styles.image, isFull && styles.imageFull]}
          />
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    padding: 6,
  },
  border: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 3,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFull: { opacity: 0.35 },
});
