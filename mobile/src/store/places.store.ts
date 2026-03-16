import { create } from 'zustand';
import { fetchMyPlaces, createPlace } from '../api/endpoints/places.api';
import { CreatePlacePayload, PlaceResponse } from '../types/place.types';

interface PlacesState {
  places: PlaceResponse[];
  loading: boolean;
  fetchPlaces: () => Promise<void>;
  addPlace: (payload: CreatePlacePayload) => Promise<void>;
  removePlace: (id: string) => void;
}

export const usePlacesStore = create<PlacesState>((set) => ({
  places: [],
  loading: false,

  fetchPlaces: async () => {
    set({ loading: true });
    try {
      const places = await fetchMyPlaces();
      set({ places });
    } finally {
      set({ loading: false });
    }
  },

  addPlace: async (payload) => {
    const place = await createPlace(payload);
    set((s) => ({ places: [place, ...s.places] }));
  },

  removePlace: (id) =>
    set((s) => ({ places: s.places.filter((p) => p.id !== id) })),
}));
