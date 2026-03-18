import { EventVisibility, EventCategory } from '../common/types/enums';
export { EventVisibility, EventCategory };

/** Résultat brut d'une requête PostGIS — lat/lng extraits via ST_Y/ST_X. */
export interface RawEvent {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  address: string | null;
  capacity: number;
  visibility: EventVisibility;
  category: EventCategory;
  startAt: Date;
  endAt: Date;
  creatorId: string;
  createdAt: Date;
  lat: unknown;
  lng: unknown;
  participantCount?: unknown;
  isParticipant?: unknown;
}

/** Réponse sérialisée d'un event avec coordonnées typées. */
export interface EventResponse {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  address: string | null;
  lat: number;
  lng: number;
  capacity: number;
  participantCount: number;
  isParticipant: boolean;
  visibility: EventVisibility;
  category: EventCategory;
  startAt: Date;
  endAt: Date;
  creatorId: string;
  createdAt: Date;
}

/** Sérialise un RawEvent PostGIS en EventResponse. */
export function serializeEvent(raw: RawEvent): EventResponse {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    imageUrl: raw.imageUrl,
    address: raw.address,
    lat: Number(raw.lat),
    lng: Number(raw.lng),
    capacity: raw.capacity,
    participantCount: Number(raw.participantCount ?? 0),
    isParticipant: Boolean(raw.isParticipant),
    visibility: raw.visibility,
    category: raw.category,
    startAt: raw.startAt,
    endAt: raw.endAt,
    creatorId: raw.creatorId,
    createdAt: raw.createdAt,
  };
}
