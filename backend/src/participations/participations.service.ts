import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseError } from 'pg';
import { DatabaseService } from '../database/database.service';
import { EventsGateway } from '../events/events.gateway';
import { MessagesGateway } from '../messages/messages.gateway';

interface EventRow {
  id: string;
  capacity: number;
  visibility: string;
  creator_id: string;
  active: boolean;
}

export interface ParticipantRow {
  id: string;
  user_id: string;
  event_id: string;
  joined_at: Date;
  user_name: string;
  user_avatar: string | null;
}

@Injectable()
export class ParticipationsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly gateway: EventsGateway,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  /**
   * Permet à un utilisateur de rejoindre un événement.
   * Vérifie que l'utilisateur n'est pas le créateur, la capacité,
   * l'accès PRIVATE et l'unicité de la participation.
   *
   * @param userId - Id de l'utilisateur
   * @param eventId - UUID de l'événement
   * @throws ForbiddenException si l'utilisateur est le créateur ou sans invitation ACCEPTED
   * @throws BadRequestException si capacité atteinte
   * @throws ConflictException si l'utilisateur participe déjà
   */
  async join(userId: string, eventId: string): Promise<void> {
    const event = await this.getEventOrThrow(eventId);
    if (event.creator_id === userId) {
      throw new ForbiddenException('Le créateur ne peut pas rejoindre son propre événement');
    }
    await this.checkPrivateAccess(userId, eventId, event.visibility);
    await this.checkCapacity(eventId, event.capacity);
    await this.insertParticipation(userId, eventId);
    const count = await this.countParticipants(eventId);
    this.gateway.emitJoined(eventId, count);
  }

  /**
   * Permet à un utilisateur de quitter un événement.
   * Si l'utilisateur est le créateur, le lead est transféré au participant le plus ancien.
   * Si le créateur est seul, l'event est supprimé ou désactivé selon la présence de messages.
   *
   * @param userId - Id de l'utilisateur
   * @param eventId - UUID de l'événement
   * @throws NotFoundException si la participation n'existe pas
   */
  async leave(userId: string, eventId: string): Promise<void> {
    const event = await this.getEventOrThrow(eventId);
    if (event.creator_id !== userId) {
      await this.deleteParticipation(userId, eventId);
      const count = await this.countParticipants(eventId);
      this.gateway.emitLeft(eventId, count);
      this.messagesGateway.kickFromChat(userId, eventId);
      return;
    }
    await this.handleCreatorLeave(userId, eventId);
  }

  /**
   * Retourne la liste des participants d'un événement.
   *
   * @param eventId - UUID de l'événement
   * @returns Liste des participants avec leur profil public
   * @throws NotFoundException si l'événement n'existe pas
   */
  async findParticipants(eventId: string): Promise<ParticipantRow[]> {
    await this.getEventOrThrow(eventId);
    return this.db.query<ParticipantRow>(
      `SELECT p.id, p.user_id, p.event_id, p.joined_at,
              u.name AS user_name, u.avatar AS user_avatar
       FROM participations p
       JOIN users u ON u.id = p.user_id
       WHERE p.event_id = $1
       ORDER BY p.joined_at ASC`,
      [eventId],
    );
  }

  private async handleCreatorLeave(creatorId: string, eventId: string): Promise<void> {
    let transferred = false;

    await this.db.transaction(async (client) => {
      const del = await client.query(
        'DELETE FROM participations WHERE user_id = $1 AND event_id = $2',
        [creatorId, eventId],
      );
      if (del.rowCount === 0) throw new NotFoundException('Participation introuvable');

      const next = await client.query<{ user_id: string }>(
        'SELECT user_id FROM participations WHERE event_id = $1 ORDER BY joined_at ASC LIMIT 1',
        [eventId],
      );

      if (next.rows.length) {
        await client.query(
          'UPDATE events SET creator_id = $1, updated_at = now() WHERE id = $2',
          [next.rows[0].user_id, eventId],
        );
        transferred = true;
      } else {
        const msgs = await client.query(
          'SELECT 1 FROM messages WHERE event_id = $1 LIMIT 1',
          [eventId],
        );
        if (msgs.rows.length) {
          await client.query(
            'UPDATE events SET active = false, updated_at = now() WHERE id = $1',
            [eventId],
          );
        } else {
          await client.query('DELETE FROM events WHERE id = $1', [eventId]);
        }
      }
    });

    if (transferred) {
      const count = await this.countParticipants(eventId);
      this.gateway.emitLeft(eventId, count);
      this.messagesGateway.kickFromChat(creatorId, eventId);
    }
  }

  private async getEventOrThrow(eventId: string): Promise<EventRow> {
    const rows = await this.db.query<EventRow>(
      `SELECT id, capacity, visibility, creator_id, active FROM events WHERE id = $1 AND active = true`,
      [eventId],
    );
    if (!rows.length) throw new NotFoundException(`Event ${eventId} introuvable`);
    return rows[0];
  }

  private async checkPrivateAccess(userId: string, eventId: string, visibility: string) {
    if (visibility !== 'PRIVATE') return;
    const rows = await this.db.query(
      `SELECT id FROM invitations WHERE event_id = $1 AND invited_user_id = $2 AND status = 'ACCEPTED'`,
      [eventId, userId],
    );
    if (!rows.length) throw new ForbiddenException('Invitation requise pour cet événement');
  }

  private async checkCapacity(eventId: string, capacity: number) {
    const count = await this.countParticipants(eventId);
    if (count >= capacity) throw new BadRequestException('Capacité maximale atteinte');
  }

  private async countParticipants(eventId: string): Promise<number> {
    const rows = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM participations WHERE event_id = $1`,
      [eventId],
    );
    return parseInt(rows[0].count, 10);
  }

  private async insertParticipation(userId: string, eventId: string) {
    try {
      await this.db.execute(
        `INSERT INTO participations (user_id, event_id) VALUES ($1, $2)`,
        [userId, eventId],
      );
    } catch (err) {
      if (err instanceof DatabaseError && err.code === '23505') {
        throw new ConflictException('Vous participez déjà à cet événement');
      }
      if (err instanceof DatabaseError && err.code === '23503') {
        throw new NotFoundException('Utilisateur ou événement introuvable');
      }
      throw err;
    }
  }

  private async deleteParticipation(userId: string, eventId: string) {
    const result = await this.db.execute(
      `DELETE FROM participations WHERE user_id = $1 AND event_id = $2`,
      [userId, eventId],
    );
    if (result.rowCount === 0) {
      throw new NotFoundException('Participation introuvable');
    }
  }
}
