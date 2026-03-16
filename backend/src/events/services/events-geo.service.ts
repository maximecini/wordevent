import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FindNearbyDto } from '../dto/find-nearby.dto';
import { EventResponse, RawEvent, serializeEvent } from '../events.types';

const DEFAULT_RADIUS = 5000;

@Injectable()
export class EventsGeoService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retourne les événements actifs dans un rayon donné autour d'un point.
   * Inclut les events PUBLIC et les events PRIVATE dont l'utilisateur
   * est créateur ou a une invitation ACCEPTED.
   *
   * @param userId - Id de l'utilisateur connecté
   * @param dto - Coordonnées et rayon de recherche
   * @returns Liste des événements sérialisés
   */
  async findNearby(userId: string, dto: FindNearbyDto): Promise<EventResponse[]> {
    const radius = dto.radius ?? DEFAULT_RADIUS;
    const rows = await this.prisma.$queryRawUnsafe<RawEvent[]>(
      `SELECT
         id, title, description, capacity, visibility, "startAt", "endAt", "creatorId", "createdAt",
         ST_Y(location) as lat, ST_X(location) as lng,
         (SELECT COUNT(*) FROM participations WHERE "eventId" = events.id) as "participantCount"
       FROM events
       WHERE ST_DWithin(location::geography, ST_MakePoint($1, $2)::geography, $3)
         AND "endAt" > now()
         AND (
           visibility = 'PUBLIC'
           OR "creatorId" = $4
           OR id IN (
             SELECT "eventId" FROM invitations
             WHERE "invitedUserId" = $4 AND status = 'ACCEPTED'
           )
         )
       ORDER BY location <-> ST_MakePoint($1, $2)::geography
       LIMIT 100`,
      dto.lng, dto.lat, radius, userId,
    );
    return rows.map(serializeEvent);
  }
}
