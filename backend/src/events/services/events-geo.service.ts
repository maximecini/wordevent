import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FindNearbyDto } from '../dto/find-nearby.dto';
import { EventResponse, RawEvent, serializeEvent } from '../events.types';

const DEFAULT_RADIUS = 5000;

@Injectable()
export class EventsGeoService {
  constructor(private readonly prisma: PrismaService) {}

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
    const rows = (await this.prisma.$queryRawUnsafe(
      `SELECT
         id, title, description, capacity, visibility, "startAt", "endAt", "creatorId", "createdAt",
         ST_Y(location) as lat, ST_X(location) as lng,
         (SELECT COUNT(*) FROM participations WHERE "eventId" = events.id) as "participantCount",
         EXISTS(SELECT 1 FROM participations WHERE "eventId" = events.id AND "userId" = $1) as "isParticipant"
       FROM events
       WHERE "endAt" > now()
         AND (
           visibility = 'PUBLIC'
           OR "creatorId" = $1
           OR id IN (
             SELECT "eventId" FROM invitations
             WHERE "invitedUserId" = $1 AND status = 'ACCEPTED'
           )
         )
       ORDER BY "startAt" ASC
       LIMIT 200`,
      userId,
    )) as RawEvent[];
    return rows.map(serializeEvent);
  }
}
