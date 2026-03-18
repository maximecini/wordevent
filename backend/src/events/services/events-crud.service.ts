import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../../database/database.service';
import { makePointSQL } from '../../common/helpers/geo.helper';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { EventResponse, RawEvent, serializeEvent } from '../events.types';

type UserRole = 'USER' | 'ADMIN';

const EVENT_SELECT = `
  id, title, description, image_url AS "imageUrl", address, capacity, visibility, category,
  start_at AS "startAt", end_at AS "endAt", creator_id AS "creatorId", created_at AS "createdAt",
  ST_Y(location) AS lat, ST_X(location) AS lng,
  (SELECT COUNT(*) FROM participations WHERE event_id = events.id)::int AS "participantCount"
`;

@Injectable()
export class EventsCrudService {
  private readonly logger = new Logger(EventsCrudService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Crée un nouvel événement avec sa position géographique.
   * Insère également la participation du créateur en une seule transaction SQL.
   *
   * @param userId - Id du créateur
   * @param dto - Données de l'événement
   * @returns L'événement créé sérialisé
   */
  async create(userId: string, dto: CreateEventDto): Promise<EventResponse> {
    const t0 = Date.now();
    const id = randomUUID();
    const participationId = randomUUID();
    const vis = dto.visibility ?? 'PUBLIC';
    const cat = dto.category ?? 'OTHER';

    this.logger.log(`[create] START — userId=${userId} title="${dto.title}" vis=${vis} cat=${cat}`);

    const point = makePointSQL(dto.lng, dto.lat, 6);
    const rows = await this.db.query<RawEvent>(
      buildCreateSQL(point.sql),
      [id, dto.title, dto.description ?? null, dto.imageUrl ?? null, dto.address ?? null,
        ...point.params, dto.capacity, vis, cat, dto.startAt, dto.endAt, userId, participationId],
    );

    const result = serializeEvent(rows[0]);
    this.logger.log(`[create] DONE en ${Date.now() - t0}ms total — id=${result.id}`);
    return result;
  }

  /**
   * Retourne un événement par son identifiant.
   *
   * @param id - UUID de l'événement
   * @returns L'événement sérialisé
   * @throws NotFoundException si l'événement n'existe pas
   */
  async findById(id: string): Promise<EventResponse> {
    const rows = await this.db.query<RawEvent>(
      `SELECT ${EVENT_SELECT} FROM events WHERE id = $1`, [id],
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
   * @throws ForbiddenException si l'utilisateur n'est ni créateur ni ADMIN
   */
  async update(userId: string, id: string, dto: UpdateEventDto, userRole: UserRole): Promise<EventResponse> {
    const event = await this.findById(id);
    if (event.creatorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Non autorisé');
    }
    await this.applyUpdate(id, dto);
    return this.findById(id);
  }

  /**
   * Supprime un événement (créateur ou ADMIN uniquement).
   *
   * @param userId - Id de l'utilisateur faisant la demande
   * @param id - UUID de l'événement
   * @param userRole - Rôle de l'utilisateur
   * @throws ForbiddenException si l'utilisateur n'est ni créateur ni ADMIN
   */
  async remove(userId: string, id: string, userRole: UserRole): Promise<void> {
    const event = await this.findById(id);
    if (event.creatorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Non autorisé');
    }
    await this.db.execute('DELETE FROM events WHERE id = $1', [id]);
  }

  private async applyUpdate(id: string, dto: UpdateEventDto) {
    const { lat, lng, ...rest } = dto;
    const scalarFields = buildScalarUpdateFields(rest);
    if (scalarFields.clauses.length) {
      await this.db.execute(
        `UPDATE events SET ${scalarFields.clauses.join(', ')}, updated_at = now() WHERE id = $${scalarFields.nextIndex}`,
        [...scalarFields.params, id],
      );
    }
    if (lat !== undefined && lng !== undefined) {
      const point = makePointSQL(lng, lat, 1);
      await this.db.execute(
        `UPDATE events SET location = ${point.sql}, updated_at = now() WHERE id = $3`,
        [...point.params, id],
      );
    }
  }
}

function buildCreateSQL(pointSql: string): string {
  return `
    WITH inserted_event AS (
      INSERT INTO events (id, title, description, image_url, address, location, capacity, visibility, category, start_at, end_at, creator_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, ${pointSql}, $8, $9, $10, $11, $12, $13, now(), now())
      RETURNING id, title, description, image_url AS "imageUrl", address, capacity, visibility, category,
        start_at AS "startAt", end_at AS "endAt", creator_id AS "creatorId", created_at AS "createdAt",
        ST_Y(location) AS lat, ST_X(location) AS lng
    ), inserted_participation AS (
      INSERT INTO participations (id, user_id, event_id, joined_at)
      SELECT $14, $13, id, now() FROM inserted_event
    )
    SELECT *, 1::int AS "participantCount" FROM inserted_event
  `;
}

function buildScalarUpdateFields(
  dto: Omit<UpdateEventDto, 'lat' | 'lng'>,
): { clauses: string[]; params: any[]; nextIndex: number } {
  const mapping: Record<string, string> = {
    title: 'title', description: 'description', address: 'address',
    capacity: 'capacity', visibility: 'visibility', startAt: 'start_at', endAt: 'end_at',
  };
  const clauses: string[] = [];
  const params: any[] = [];
  let index = 1;

  for (const [key, col] of Object.entries(mapping)) {
    const value = (dto as any)[key];
    if (value !== undefined) {
      clauses.push(`${col} = $${index}`);
      params.push(value);
      index++;
    }
  }

  return { clauses, params, nextIndex: index };
}
