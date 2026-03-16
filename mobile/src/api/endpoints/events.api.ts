import { apiClient } from '../client';

export interface EventResponse {
  id: string;
  title: string;
  description: string | null;
  lat: number;
  lng: number;
  capacity: number;
  participantCount: number;
  visibility: 'PUBLIC' | 'PRIVATE';
  startAt: string;
  endAt: string;
  creatorId: string;
  createdAt: string;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  lat: number;
  lng: number;
  capacity: number;
  visibility?: 'PUBLIC' | 'PRIVATE';
  startAt: string;
  endAt: string;
}

/** Retourne les événements actifs autour des coordonnées données. */
export async function fetchNearbyEvents(lat: number, lng: number, radius = 5000): Promise<EventResponse[]> {
  const { data } = await apiClient.get<EventResponse[]>('/events', { params: { lat, lng, radius } });
  return data;
}

/** Crée un nouvel événement. */
export async function createEvent(payload: CreateEventPayload): Promise<EventResponse> {
  const { data } = await apiClient.post<EventResponse>('/events', payload);
  return data;
}

/** Retourne le détail d'un événement. */
export async function fetchEventById(id: string): Promise<EventResponse> {
  const { data } = await apiClient.get<EventResponse>(`/events/${id}`);
  return data;
}
