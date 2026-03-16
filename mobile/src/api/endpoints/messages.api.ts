import { apiClient } from '../client';

export interface MessageResponse {
  id: string;
  content: string;
  eventId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  createdAt: string;
}

/**
 * Retourne l'historique paginé des messages d'un événement.
 *
 * @param eventId - UUID de l'événement
 * @param cursor - Date ISO du dernier message pour la pagination (optionnel)
 * @param limit - Nombre de messages à charger (défaut 50)
 * @returns Liste de messages triés du plus récent au plus ancien
 */
export async function fetchMessages(
  eventId: string,
  cursor?: string,
  limit = 50,
): Promise<MessageResponse[]> {
  const { data } = await apiClient.get<MessageResponse[]>(`/events/${eventId}/messages`, {
    params: { limit, ...(cursor ? { cursor } : {}) },
  });
  return data;
}
