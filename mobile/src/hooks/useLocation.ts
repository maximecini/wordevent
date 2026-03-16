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
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setReady(true); return; }

      const loc = await Location.getCurrentPositionAsync({});
      setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      setReady(true);

      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 30 },
        (l) => setCoords({ lat: l.coords.latitude, lng: l.coords.longitude }),
      );
    }

    start();
    return () => { sub?.remove(); };
  }, []);

  return { coords, ready };
}
