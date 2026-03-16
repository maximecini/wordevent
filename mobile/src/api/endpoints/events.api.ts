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
 * Récupère tous les événements actifs accessibles à l'utilisateur.
 *
 * @returns Liste de tous les événements
 */
export async function fetchAllEvents(): Promise<EventResponse[]> {
  const { data } = await apiClient.get<EventResponse[]>('/events');
  return data;
}
