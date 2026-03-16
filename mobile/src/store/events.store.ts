import { create } from 'zustand';
import { EventResponse, fetchNearbyEvents } from '../api/endpoints/events.api';
import { joinEvent, leaveEvent } from '../api/endpoints/participations.api';

type VisibilityFilter = 'PUBLIC' | 'PRIVATE' | null;

interface EventsState {
  events: EventResponse[];
  selectedEvent: EventResponse | null;
  activeFilter: VisibilityFilter;
  loading: boolean;
  fetchNearby: (lat: number, lng: number, radius?: number) => Promise<void>;
  setSelectedEvent: (event: EventResponse | null) => void;
  setActiveFilter: (filter: VisibilityFilter) => void;
  join: (eventId: string) => Promise<void>;
  leave: (eventId: string) => Promise<void>;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  selectedEvent: null,
  activeFilter: null,
  loading: false,

  /** Charge les événements autour d'une position géographique. */
  fetchNearby: async (lat, lng, radius = 5000) => {
    set({ loading: true });
    try {
      const events = await fetchNearbyEvents(lat, lng, radius);
      set({ events });
    } finally {
      set({ loading: false });
    }
  },

  /** Sélectionne ou désélectionne un événement pour afficher son détail. */
  setSelectedEvent: (event) => set({ selectedEvent: event }),

  /** Applique un filtre de visibilité sur les marqueurs de la carte. */
  setActiveFilter: (filter) => set({ activeFilter: filter }),

  /** Rejoint un événement et incrémente le compteur local. */
  join: async (eventId) => {
    await joinEvent(eventId);
    set((s) => ({
      events: s.events.map((e) =>
        e.id === eventId ? { ...e, participantCount: e.participantCount + 1 } : e,
      ),
    }));
  },

  /** Quitte un événement et décrémente le compteur local. */
  leave: async (eventId) => {
    await leaveEvent(eventId);
    set((s) => ({
      events: s.events.map((e) =>
        e.id === eventId ? { ...e, participantCount: e.participantCount - 1 } : e,
      ),
    }));
  },
}));
