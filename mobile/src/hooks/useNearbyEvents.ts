import { useCallback, useEffect } from 'react';
import { useEventsStore } from '../store/events.store';

/**
 * Charge tous les événements accessibles au montage de la carte,
 * une fois que la position GPS est prête.
 *
 * @param ready - Indique si la position GPS est disponible
 * @returns Fonction pour recharger manuellement les événements
 */
export function useNearbyEvents(ready: boolean) {
  const fetchEvents = useEventsStore((s) => s.fetchEvents);

  useEffect(() => {
    if (!ready) return;
    console.log(`[${Date.now()}][useNearbyEvents] fetch all events`);
    fetchEvents();
  }, [ready]);

  const refresh = useCallback(() => fetchEvents(), [fetchEvents]);

  return { refresh };
}
