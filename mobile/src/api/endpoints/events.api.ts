import { apiClient } from '../client';
import { CreateEventPayload, EventResponse } from '../../types/event.types';

/**
 * Crée un nouvel événement.
 *
 * @param payload - Données de l'événement à créer
 * @returns L'événement créé
 */
export async function createEvent(payload: CreateEventPayload): Promise<EventResponse> {
  const { data } = await apiClient.post<EventResponse>('/events', payload);
  return data;
}

/**
 * Récupère les événements dans un rayon autour d'une position.
 *
 * @param lat - Latitude du centre de recherche
 * @param lng - Longitude du centre de recherche
 * @param radius - Rayon de recherche en mètres
 * @returns Liste des événements dans le rayon
 */
export async function fetchNearbyEvents(
  lat: number,
  lng: number,
  radius: number,
): Promise<EventResponse[]> {
  const { data } = await apiClient.get<EventResponse[]>('/events', {
    params: { lat, lng, radius },
  });
  return data;
}
