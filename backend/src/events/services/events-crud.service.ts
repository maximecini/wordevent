import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { EventResponse, RawEvent, serializeEvent } from '../events.types';

const EVENT_SELECT = `
  id, title, description, capacity, visibility, "startAt", "endAt", "creatorId", "createdAt",
  ST_Y(location) as lat, ST_X(location) as lng,
  (SELECT COUNT(*) FROM participations WHERE "eventId" = events.id) as "participantCount"
`;

@Injectable()
export class EventsCrudService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crée un nouvel événement avec sa position géographique.
   *
   * @param userId - Id du créateur
   * @param dto - Données de l'événement
   * @returns L'événement créé sérialisé
   */
  async create(userId: string, dto: CreateEventDto): Promise<EventResponse> {
    const id = randomUUID();
    await this.insertEvent(id, userId, dto);
    return this.findById(id);
  }

  private async insertEvent(id: string, userId: string, dto: CreateEventDto) {
    await this.prisma.$executeRaw`
      INSERT INTO events (id, title, description, location, capacity, visibility, "startAt", "endAt", "creatorId", "createdAt", "updatedAt")
      VALUES (
        ${id}, ${dto.title}, ${dto.description ?? null},
        ST_SetSRID(ST_MakePoint(${dto.lng}, ${dto.lat}), 4326),
        ${dto.capacity}, ${dto.visibility ?? 'PUBLIC'}::"EventVisibility",
        ${dto.startAt}, ${dto.endAt}, ${userId}, now(), now()
      )`;
  }

  /**
   * Retourne un événement par son identifiant avec lat/lng désérialisés.
   *
   * @param id - UUID de l'événement
   * @returns L'événement sérialisé
   * @throws NotFoundException si l'événement n'existe pas
   */
  async findById(id: string): Promise<EventResponse> {
    const rows = await this.prisma.$queryRawUnsafe<RawEvent[]>(
      `SELECT ${EVENT_SELECT} FROM events WHERE id = $1`, id,
    );
    if (!rows.length) throw new NotFoundException(`Event ${id} introuvable`);
    return serializeEvent(rows[0]);
  }

  /**
   * Met à jour un événement (créateur ou ADMIN uniquement).
   *
   * @param userId - Id de l'utilisateur faisant la demande
   * @param id - UUID de l'événement
   * @param dto - Champs à modifier
   * @param userRole - Rôle de l'utilisateur
   * @returns L'événement mis à jour
   */
  async update(userId: string, id: string, dto: UpdateEventDto, userRole: Role): Promise<EventResponse> {
    const event = await this.findById(id);
    if (event.creatorId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Non autorisé');
    }
    await this.applyUpdate(id, dto);
    return this.findById(id);
  }

  private async applyUpdate(id: string, dto: UpdateEventDto) {
    const { lat, lng, ...rest } = dto;
    if (Object.keys(rest).length) {
      await this.prisma.event.update({ where: { id }, data: rest as any });
    }
    if (lat !== undefined && lng !== undefined) {
      await this.prisma.$executeRaw`
        UPDATE events SET location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326), "updatedAt" = now() WHERE id = ${id}`;
    }
  }

  /**
   * Supprime un événement (créateur ou ADMIN uniquement).
   *
   * @param userId - Id de l'utilisateur faisant la demande
   * @param id - UUID de l'événement
   * @param userRole - Rôle de l'utilisateur
   */
  async remove(userId: string, id: string, userRole: Role): Promise<void> {
    const event = await this.findById(id);
    if (event.creatorId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Non autorisé');
    }
    await this.prisma.event.delete({ where: { id } });
  }
}
