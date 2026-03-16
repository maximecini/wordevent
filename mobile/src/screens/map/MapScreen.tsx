import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useLocation } from '../../hooks/useLocation';
import { useEventsStore } from '../../store/events.store';
import { EventMarker } from '../../components/map/EventMarker';
import { FilterSidebar } from '../../components/map/FilterSidebar';
import { EventDetailSheet } from '../../components/map/EventDetailSheet';
import { CreateEventSheet } from '../../components/map/CreateEventSheet';
import { EventResponse } from '../../api/endpoints/events.api';

const DEBOUNCE_MS = 600;

/** Écran principal — carte interactive avec événements, filtres et création. */
export function MapScreen() {
  const { coords, ready } = useLocation();
  const { events, selectedEvent, activeFilter, fetchNearby, setSelectedEvent, setActiveFilter } = useEventsStore();
  const [showCreate, setShowCreate] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visibleEvents = activeFilter ? events.filter((e) => e.visibility === activeFilter) : events;

  const onRegionChange = useCallback((region: Region) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchNearby(region.latitude, region.longitude);
    }, DEBOUNCE_MS);
  }, [fetchNearby]);

  if (!ready) return <View style={styles.loading} />;

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{ latitude: coords.lat, longitude: coords.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
        showsUserLocation
        onRegionChangeComplete={onRegionChange}
      >
        {visibleEvents.map((event: EventResponse) => (
          <Marker key={event.id} coordinate={{ latitude: event.lat, longitude: event.lng }} anchor={{ x: 0.5, y: 0.5 }}>
            <EventMarker event={event} onPress={setSelectedEvent} />
          </Marker>
        ))}
      </MapView>

      <FilterSidebar active={activeFilter} onSelect={setActiveFilter} />

      {selectedEvent && (
        <View style={styles.sheet}>
          <EventDetailSheet event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        </View>
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setShowCreate(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet">
        <CreateEventSheet lat={coords.lat} lng={coords.lng} onClose={() => setShowCreate(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, backgroundColor: '#F8FAFC' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  fab: {
    position: 'absolute', bottom: 32, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 32 },
});
