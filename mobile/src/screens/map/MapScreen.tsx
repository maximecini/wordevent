import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { LongPressEvent, Region } from 'react-native-maps';
import { useLocation } from '../../hooks/useLocation';
import { useNearbyEvents } from '../../hooks/useNearbyEvents';
import { useEventClusters, ClusterItem } from '../../hooks/useEventClusters';
import { useEventsStore } from '../../store/events.store';
import { EventResponse } from '../../types/event.types';
import { CreateChoiceModal } from '../../components/map/CreateChoiceModal';
import { CreateEventSheet } from '../../components/map/CreateEventSheet';
import { FilterBar } from '../../components/map/FilterBar';
import { FilterSheet } from '../../components/map/FilterSheet';
import { EventMarker } from '../../components/map/EventMarker';
import { ClusterMarker } from '../../components/map/ClusterMarker';
import { EventDetailSheet } from '../../components/map/event-detail/EventDetailSheet';

type TapCoords = { latitude: number; longitude: number };
type Step = 'idle' | 'choice' | 'event';

function renderClusterItem(
  item: ClusterItem,
  onSelect: (event: EventResponse) => void,
  onZoom: (coord: { latitude: number; longitude: number }) => void,
) {
  const [lng, lat] = item.geometry.coordinates;
  const coordinate = { latitude: lat, longitude: lng };

  if (item.properties.cluster) {
    const count = (item.properties as { point_count: number }).point_count;
    return (
      <ClusterMarker
        key={`cluster-${item.id}`}
        coordinate={coordinate}
        count={count}
        onZoom={onZoom}
      />
    );
  }

  const event = (item.properties as { event: EventResponse }).event;
  return <EventMarker key={event.id} event={event} onSelect={onSelect} />;
}

/** Écran principal — carte interactive avec clusters d'événements. */
export function MapScreen() {
  const { coords, ready } = useLocation();
  const mapRef = useRef<MapView>(null);
  const events = useEventsStore((s) => s.events);

  const [tapCoords, setTapCoords] = useState<TapCoords | null>(null);
  const [step, setStep] = useState<Step>('idle');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);

  const initialRegion: Region = useMemo(() => ({
    latitude: coords.lat, longitude: coords.lng, latitudeDelta: 0.05, longitudeDelta: 0.05,
  }), []);

  const [currentRegion, setCurrentRegion] = useState<Region>(initialRegion);

  const { handleRegionChangeComplete } = useNearbyEvents(initialRegion);
  const clusters = useEventClusters(events, currentRegion);

  const handleRegionChange = useCallback((region: Region) => {
    setCurrentRegion(region);
    handleRegionChangeComplete(region);
  }, [handleRegionChangeComplete]);

  const handleLongPress = useCallback((e: LongPressEvent) => {
    setTapCoords(e.nativeEvent.coordinate);
    setStep('choice');
  }, []);

  const handleClose = useCallback(() => {
    setStep('idle');
    setTapCoords(null);
  }, []);

  const handleChooseEvent = useCallback(() => setStep('event'), []);

  const handleSelectEvent = useCallback((event: EventResponse) => setSelectedEvent(event), []);

  const handleCloseDetail = useCallback(() => setSelectedEvent(null), []);

  const handleZoomCluster = useCallback((coord: { latitude: number; longitude: number }) => {
    mapRef.current?.animateToRegion(
      { ...coord, latitudeDelta: currentRegion.latitudeDelta / 4, longitudeDelta: currentRegion.longitudeDelta / 4 },
      300,
    );
  }, [currentRegion]);

  if (!ready) return <View style={styles.loading} />;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        showsUserLocation
        onLongPress={handleLongPress}
        onRegionChangeComplete={handleRegionChange}
      >
        {clusters.map((item) => renderClusterItem(item, handleSelectEvent, handleZoomCluster))}
      </MapView>

      <FilterBar onOpenSheet={() => setFilterSheetOpen(true)} />

      <FilterSheet
        visible={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
      />

      <CreateChoiceModal
        visible={step === 'choice'}
        onClose={handleClose}
        onChooseEvent={handleChooseEvent}
        onChoosePlace={handleClose}
      />

      {step === 'event' && tapCoords && (
        <CreateEventSheet
          lat={tapCoords.latitude}
          lng={tapCoords.longitude}
          onClose={handleClose}
        />
      )}

      <EventDetailSheet event={selectedEvent} onClose={handleCloseDetail} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, backgroundColor: '#F8FAFC' },
});
