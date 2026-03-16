import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface Coords {
  lat: number;
  lng: number;
}

const DEFAULT: Coords = { lat: 48.8566, lng: 2.3522 }; // Paris

/**
 * Hook qui demande la permission GPS et retourne la position de l'utilisateur.
 * Retourne Paris par défaut si la permission est refusée.
 */
export function useLocation() {
  const [coords, setCoords] = useState<Coords>(DEFAULT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;

    async function start() {
      try {
        console.log('[useLocation] demande permission GPS...');
        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log('[useLocation] permission GPS:', status);
        if (status !== 'granted') { setReady(true); return; }

        // Position instantanée depuis le cache système (< 100ms)
        const last = await Location.getLastKnownPositionAsync({});
        if (last) {
          console.log('[useLocation] position cache:', last.coords.latitude, last.coords.longitude);
          setCoords({ lat: last.coords.latitude, lng: last.coords.longitude });
        } else {
          console.warn('[useLocation] pas de position en cache, utilise Paris par défaut');
        }
        console.log('[useLocation] ready=true');

        sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 30 },
          (l) => setCoords({ lat: l.coords.latitude, lng: l.coords.longitude }),
        );
      } catch (e) {
        console.error('[useLocation] erreur GPS, fallback Paris:', e);
      } finally {
        setReady(true);
      }
    }

    start();
    return () => { sub?.remove(); };
  }, []);

  return { coords, ready };
}
