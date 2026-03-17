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
  console.log(`[${Date.now()}][events.api] GET /events...`);
  const { data } = await apiClient.get<EventResponse[]>('/events');
  console.log(`[${Date.now()}][events.api] GET /events → ${data.length} events`, data.length > 0 ? data[0] : '(vide)');
  return data;
}
