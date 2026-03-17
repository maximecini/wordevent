import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { LongPressEvent, Marker, Region } from 'react-native-maps';
import { useLocation } from '../../hooks/useLocation';
import { useNearbyEvents } from '../../hooks/useNearbyEvents';
import { useEventClusters, ClusterItem } from '../../hooks/useEventClusters';
import { useEventsStore } from '../../store/events.store';
import { usePlacesStore } from '../../store/places.store';
import { EventResponse } from '../../types/event.types';
import { PoiMarker } from '../../components/map/PoiMarker';
import { CreateChoiceModal } from '../../components/map/CreateChoiceModal';
import { CreateEventSheet } from '../../components/map/CreateEventSheet';
import { CreatePlaceSheet } from '../../components/map/CreatePlaceSheet';
import { FilterBar } from '../../components/map/FilterBar';
import { FilterSheet } from '../../components/map/FilterSheet';
import { EventMarker } from '../../components/map/EventMarker';
import { ClusterMarker } from '../../components/map/ClusterMarker';
import { EventDetailSheet } from '../../components/map/event-detail/EventDetailSheet';

type TapCoords = { latitude: number; longitude: number };
type Step = 'idle' | 'choice' | 'event' | 'place';

function renderClusterItem(
  item: ClusterItem,
  onSelect: (event: EventResponse) => void,
  onZoom: (coord: { latitude: number; longitude: number }) => void,
) {
  const [lng, lat] = item.geometry.coordinates;
  const coordinate = { latitude: lat, longitude: lng };
  console.log('[renderClusterItem]', { lat, lng, cluster: item.properties.cluster });

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
  const visibilityFilter = useEventsStore((s) => s.visibilityFilter);
  const places = usePlacesStore((s) => s.places);
  const fetchPlaces = usePlacesStore((s) => s.fetchPlaces);
  const filteredEvents = useMemo(() => {
    if (visibilityFilter === 'ALL') return events;
    return events.filter((e) => e.visibility === visibilityFilter);
  }, [events, visibilityFilter]);

  const [tapCoords, setTapCoords] = useState<TapCoords | null>(null);
  const [step, setStep] = useState<Step>('idle');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);

  const initialRegion: Region = {
    latitude: coords.lat, longitude: coords.lng, latitudeDelta: 0.05, longitudeDelta: 0.05,
  };

  const [currentRegion, setCurrentRegion] = useState<Region>(initialRegion);

  useEffect(() => {
    console.log(`[${Date.now()}][MapScreen] ready=${ready} coords=`, coords);
  }, [ready, coords]);

  useEffect(() => {
    console.log(`[${Date.now()}][MapScreen] events=${events.length} filteredEvents=${filteredEvents.length} filter=${visibilityFilter}`);
  }, [events, filteredEvents]);

  useNearbyEvents(ready);

  useEffect(() => {
    if (ready) fetchPlaces();
  }, [ready]);

  const clusters = useEventClusters(filteredEvents, currentRegion);

  useEffect(() => {
    console.log(`[${Date.now()}][MapScreen] clusters=${clusters.length} latDelta=${currentRegion.latitudeDelta.toFixed(4)}`);
  }, [clusters]);

  const handleRegionChange = useCallback((region: Region) => {
    setCurrentRegion(region);
  }, []);

  const handleLongPress = useCallback((e: LongPressEvent) => {
    setTapCoords(e.nativeEvent.coordinate);
    setStep('choice');
  }, []);

  const handleClose = useCallback(() => {
    setStep('idle');
    setTapCoords(null);
  }, []);

  const handleChooseEvent = useCallback(() => setStep('event'), []);
  const handleChoosePlace = useCallback(() => setStep('place'), []);

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
        onLongPress={handleLongPress}
        onPress={selectedEvent ? handleCloseDetail : undefined}
        onRegionChangeComplete={handleRegionChange}
      >
        {currentRegion.latitudeDelta < 0.3 && (
          <Marker
            coordinate={{ latitude: coords.lat, longitude: coords.lng }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <View style={styles.userDot} />
          </Marker>
        )}
        {clusters.map((item) => renderClusterItem(item, handleSelectEvent, handleZoomCluster))}
        {places.map((place) => (
          <PoiMarker key={place.id} place={place} onSelect={() => {}} />
        ))}
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
        onChoosePlace={handleChoosePlace}
      />

      {step === 'event' && tapCoords && (
        <CreateEventSheet
          lat={tapCoords.latitude}
          lng={tapCoords.longitude}
          onClose={handleClose}
        />
      )}

      {step === 'place' && tapCoords && (
        <CreatePlaceSheet
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
  userDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4A90D9',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
