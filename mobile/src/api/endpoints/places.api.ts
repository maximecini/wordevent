import { apiClient } from '../client';
import { CreatePlacePayload, PlaceResponse } from '../../types/place.types';

/**
 * Récupère tous les POI personnels de l'utilisateur connecté.
 *
 * @returns Liste des POI
 */
export async function fetchMyPlaces(): Promise<PlaceResponse[]> {
  const { data } = await apiClient.get<PlaceResponse[]>('/places', {
    params: { lat: 48.8566, lng: 2.3522, radius: 100_000 },
  });
  return data;
}

/**
 * Crée un nouveau point d'intérêt personnel.
 *
 * @param payload - Données du POI
 * @returns Le POI créé
 */
export async function createPlace(payload: CreatePlacePayload): Promise<PlaceResponse> {
  const { data } = await apiClient.post<PlaceResponse>('/places', payload);
  return data;
}
