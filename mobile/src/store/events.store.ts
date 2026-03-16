import { create } from 'zustand';
import { createEvent, fetchNearbyEvents } from '../api/endpoints/events.api';
import { CreateEventPayload, EventResponse, EventVisibility } from '../types/event.types';

export type VisibilityFilter = 'ALL' | EventVisibility;

export const RADIUS_OPTIONS = [500, 1000, 5000, 10000] as const;
export type RadiusOption = typeof RADIUS_OPTIONS[number];

interface EventsState {
  events: EventResponse[];
  creating: boolean;
  loading: boolean;
  activeRadius: RadiusOption;
  visibilityFilter: VisibilityFilter;
  setRadius: (radius: RadiusOption) => void;
  setVisibilityFilter: (filter: VisibilityFilter) => void;
  addEvent: (payload: CreateEventPayload) => Promise<void>;
  fetchNearby: (lat: number, lng: number, radius: number) => Promise<void>;
  upsertEvent: (event: EventResponse) => void;
  removeEvent: (id: string) => void;
}

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  creating: false,
  loading: false,
  activeRadius: 5000,
  visibilityFilter: 'ALL',

  setRadius: (activeRadius) => set({ activeRadius }),
  setVisibilityFilter: (visibilityFilter) => set({ visibilityFilter }),

  addEvent: async (payload) => {
    set({ creating: true });
    try {
      const event = await createEvent(payload);
      set((s) => ({ events: [event, ...s.events] }));
    } finally {
      set({ creating: false });
    }
  },

  fetchNearby: async (lat, lng, radius) => {
    set({ loading: true });
    try {
      const events = await fetchNearbyEvents(lat, lng, radius);
      set({ events });
    } finally {
      set({ loading: false });
    }
  },

  upsertEvent: (event) =>
    set((s) => {
      const exists = s.events.some((e) => e.id === event.id);
      return {
        events: exists
          ? s.events.map((e) => (e.id === event.id ? event : e))
          : [event, ...s.events],
      };
    }),

  removeEvent: (id) =>
    set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
}));
