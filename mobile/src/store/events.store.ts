import { create } from 'zustand';
import { createEvent, fetchAllEvents } from '../api/endpoints/events.api';
import { CreateEventPayload, EventResponse, EventVisibility } from '../types/event.types';

export type VisibilityFilter = 'ALL' | EventVisibility;

interface EventsState {
  events: EventResponse[];
  creating: boolean;
  loading: boolean;
  visibilityFilter: VisibilityFilter;
  setVisibilityFilter: (filter: VisibilityFilter) => void;
  addEvent: (payload: CreateEventPayload) => Promise<void>;
  fetchEvents: () => Promise<void>;
  upsertEvent: (event: EventResponse) => void;
  removeEvent: (id: string) => void;
}

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  creating: false,
  loading: false,
  visibilityFilter: 'ALL',

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

  fetchEvents: async () => {
    set({ loading: true });
    try {
      const events = await fetchAllEvents();
      console.log(`[${Date.now()}][events.store] fetchEvents →`, events.length, 'events');
      set({ events });
    } catch (e) {
      console.error('[events.store] fetchEvents erreur →', e);
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
