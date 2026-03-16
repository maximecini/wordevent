export type EventVisibility = 'PUBLIC' | 'PRIVATE';

export interface EventResponse {
  id: string;
  title: string;
  description?: string;
  lat: number;
  lng: number;
  capacity: number;
  visibility: EventVisibility;
  startAt: string;
  endAt: string;
  creatorId: string;
  participantCount: number;
  isParticipant: boolean;
  createdAt: string;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  lat: number;
  lng: number;
  capacity: number;
  visibility: EventVisibility;
  startAt: string;
  endAt: string;
}
