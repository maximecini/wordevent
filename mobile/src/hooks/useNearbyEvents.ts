import { useCallback, useEffect, useRef } from 'react';
import { Region } from 'react-native-maps';
import { useEventsStore } from '../store/events.store';
import { regionToRadiusMeters } from '../utils/geo.utils';

const DEBOUNCE_MS = 500;

/**
 * Déclenche le fetch des événements proches à chaque changement de région,
 * avec un debounce pour éviter de surcharger le backend.
 *
 * @param initialRegion - Région initiale au montage pour le premier fetch
 * @returns Handler à passer à onRegionChangeComplete de MapView
 */
export function useNearbyEvents(initialRegion: Region) {
  const fetchNearby = useEventsStore((s) => s.fetchNearby);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetch = useCallback((region: Region) => {
    const radius = regionToRadiusMeters(region);
    fetchNearby(region.latitude, region.longitude, radius);
  }, [fetchNearby]);

  useEffect(() => {
    fetch(initialRegion);
  }, []);

  const handleRegionChangeComplete = useCallback((region: Region) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetch(region), DEBOUNCE_MS);
  }, [fetch]);

  return { handleRegionChangeComplete };
}
