import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';

type Props = {
  coordinate: { latitude: number; longitude: number };
  count: number;
  onZoom: (coordinate: { latitude: number; longitude: number }) => void;
};

function clusterSize(count: number): number {
  if (count >= 50) return 60;
  if (count >= 20) return 52;
  if (count >= 10) return 46;
  return 40;
}

/** Marqueur de cluster — cercle avec le nombre d'événements regroupés. */
export function ClusterMarker({ coordinate, count, onZoom }: Props) {
  const handlePress = useCallback(() => onZoom(coordinate), [coordinate, onZoom]);
  const size = clusterSize(count);

  return (
    <Marker coordinate={coordinate} onPress={handlePress} tracksViewChanges={true}>
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]} collapsable={false}>
        <Text style={styles.count}>{count}</Text>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(37,99,235,0.3)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  count: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
