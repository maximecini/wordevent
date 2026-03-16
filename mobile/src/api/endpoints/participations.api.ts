import { apiClient } from '../client';

/** Rejoint un événement. */
export async function joinEvent(eventId: string): Promise<void> {
  await apiClient.post(`/events/${eventId}/join`);
}

/** Quitte un événement. */
export async function leaveEvent(eventId: string): Promise<void> {
  await apiClient.delete(`/events/${eventId}/leave`);
}
