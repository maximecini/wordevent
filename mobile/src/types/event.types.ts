export type EventVisibility = 'PUBLIC' | 'PRIVATE';
export type EventCategory = 'SPORT' | 'MUSIC' | 'FOOD' | 'PARTY' | 'ART' | 'OTHER';

export interface EventResponse {
  id: string;
  title: string;
  description?: string;
  lat: number;
  lng: number;
  capacity: number;
  visibility: EventVisibility;
  category: EventCategory;
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
  category: EventCategory;
  startAt: string;
  endAt: string;
}
