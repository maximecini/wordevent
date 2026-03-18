import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { dwithinSQL } from '../../common/helpers/geo.helper';
import { FindNearbyDto } from '../dto/find-nearby.dto';
import { EventResponse, RawEvent, serializeEvent } from '../events.types';

const DEFAULT_RADIUS = 5000;

const EVENT_GEO_SELECT = `
  e.id, e.title, e.description, e.image_url AS "imageUrl", e.address,
  e.capacity, e.visibility, e.category,
  e.start_at AS "startAt", e.end_at AS "endAt",
  e.creator_id AS "creatorId", e.created_at AS "createdAt",
  ST_Y(e.location) AS lat, ST_X(e.location) AS lng,
  COUNT(p.id)::int AS "participantCount",
  COALESCE(BOOL_OR(p.user_id = $1), false) AS "isParticipant"
`;

@Injectable()
export class EventsGeoService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Retourne tous les événements actifs accessibles à l'utilisateur,
   * sans restriction géographique.
   * Inclut les events PUBLIC et les events PRIVATE dont l'utilisateur
   * est créateur ou a une invitation ACCEPTED.
   *
   * @param userId - Id de l'utilisateur connecté
   * @returns Liste des événements sérialisés
   */
  async findAll(userId: string): Promise<EventResponse[]> {
    const rows = await this.db.query<RawEvent>(
      buildFindAllSQL(),
      [userId],
    );
    return rows.map(serializeEvent);
  }

  /**
   * Retourne les événements actifs dans un rayon donné autour d'un point géographique.
   * Inclut les events PUBLIC et les events PRIVATE accessibles à l'utilisateur.
   * Trie par distance croissante et retourne au maximum 100 résultats.
   *
   * @param userId - Id de l'utilisateur connecté
   * @param dto - Coordonnées et rayon de recherche
   * @returns Liste des événements triés par distance
   */
  async findNearby(userId: string, dto: FindNearbyDto): Promise<EventResponse[]> {
    const radius = dto.radius ?? DEFAULT_RADIUS;
    const dwithin = dwithinSQL(dto.lng, dto.lat, radius, 2);
    const distanceSql = `ST_Distance(e.location::geography, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography)`;

    const rows = await this.db.query<RawEvent>(
      buildFindNearbySQL(dwithin.sql, distanceSql),
      [userId, ...dwithin.params],
    );
    return rows.map(serializeEvent);
  }
}

function buildFindAllSQL(): string {
  return `
    SELECT ${EVENT_GEO_SELECT}
    FROM events e
    LEFT JOIN participations p ON p.event_id = e.id
    WHERE e.end_at > now()
      AND (
        e.visibility = 'PUBLIC'
        OR e.creator_id = $1
        OR EXISTS(
          SELECT 1 FROM invitations i
          WHERE i.event_id = e.id AND i.invited_user_id = $1 AND i.status = 'ACCEPTED'
        )
      )
    GROUP BY e.id
    ORDER BY e.start_at ASC
    LIMIT 200
  `;
}

function buildFindNearbySQL(dwithinFragment: string, distanceFragment: string): string {
  return `
    SELECT ${EVENT_GEO_SELECT},
      ${distanceFragment} AS distance
    FROM events e
    LEFT JOIN participations p ON p.event_id = e.id
    WHERE e.end_at > now()
      AND ${dwithinFragment}
      AND (
        e.visibility = 'PUBLIC'
        OR e.creator_id = $1
        OR EXISTS(
          SELECT 1 FROM invitations i
          WHERE i.event_id = e.id AND i.invited_user_id = $1 AND i.status = 'ACCEPTED'
        )
      )
    GROUP BY e.id
    ORDER BY distance ASC
    LIMIT 100
  `;
}
