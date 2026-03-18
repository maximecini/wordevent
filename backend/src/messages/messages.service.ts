import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { MessageResponse } from './messages.types';

@Injectable()
export class MessagesService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Retourne l'historique paginé des messages d'un événement.
   * L'utilisateur doit être participant de l'événement.
   *
   * @param eventId - UUID de l'événement
   * @param userId - UUID de l'utilisateur demandeur
   * @param limit - Nombre de messages à retourner (défaut 50)
   * @param cursor - Date ISO du dernier message connu (pagination)
   * @returns Liste de messages triés du plus récent au plus ancien
   * @throws NotFoundException si l'événement n'existe pas
   * @throws ForbiddenException si l'utilisateur n'est pas participant
   */
  async getHistory(
    eventId: string,
    userId: string,
    limit = 50,
    cursor?: string,
  ): Promise<MessageResponse[]> {
    await this.assertEventExists(eventId);
    await this.assertParticipant(eventId, userId);

    const rows = await this.fetchMessages(eventId, limit, cursor);
    return rows.map(this.toResponse);
  }

  /**
   * Sauvegarde un message en base et retourne la réponse formatée.
   * L'utilisateur doit être participant de l'événement.
   *
   * @param eventId - UUID de l'événement
   * @param senderId - UUID de l'expéditeur
   * @param content - Contenu du message
   * @returns Le message créé formaté
   * @throws NotFoundException si l'événement n'existe pas
   * @throws ForbiddenException si l'utilisateur n'est pas participant
   */
  async saveMessage(
    eventId: string,
    senderId: string,
    content: string,
  ): Promise<MessageResponse> {
    await this.assertEventExists(eventId);
    await this.assertParticipant(eventId, senderId);

    const [row] = await this.db.query<MessageRow>(
      `INSERT INTO messages (event_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING
         messages.id,
         messages.content,
         messages.event_id AS "eventId",
         messages.sender_id AS "senderId",
         messages.created_at AS "createdAt",
         (SELECT name FROM users WHERE id = $2) AS "senderName",
         (SELECT avatar FROM users WHERE id = $2) AS "senderAvatar"`,
      [eventId, senderId, content],
    );

    return this.toResponse(row);
  }

  private async assertEventExists(eventId: string): Promise<void> {
    const rows = await this.db.query('SELECT id FROM events WHERE id = $1', [eventId]);
    if (rows.length === 0) throw new NotFoundException(`Event ${eventId} introuvable`);
  }

  private async assertParticipant(eventId: string, userId: string): Promise<void> {
    const [event] = await this.db.query<{ creatorId: string }>(
      'SELECT creator_id AS "creatorId" FROM events WHERE id = $1',
      [eventId],
    );
    if (event?.creatorId === userId) return;

    const rows = await this.db.query(
      'SELECT 1 FROM participations WHERE user_id = $1 AND event_id = $2',
      [userId, eventId],
    );
    if (rows.length === 0) {
      throw new ForbiddenException("Vous n'êtes pas participant de cet événement");
    }
  }

  private async fetchMessages(eventId: string, limit: number, cursor?: string) {
    const cursorClause = cursor ? `AND m.created_at < $3` : '';
    const params: any[] = cursor ? [eventId, limit, cursor] : [eventId, limit];

    return this.db.query<MessageRow>(
      `SELECT
         m.id,
         m.content,
         m.event_id AS "eventId",
         m.sender_id AS "senderId",
         m.created_at AS "createdAt",
         u.name AS "senderName",
         u.avatar AS "senderAvatar"
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.event_id = $1
       ${cursorClause}
       ORDER BY m.created_at DESC
       LIMIT $2`,
      params,
    );
  }

  private toResponse(row: MessageRow): MessageResponse {
    return {
      id: row.id,
      content: row.content,
      eventId: row.eventId,
      senderId: row.senderId,
      senderName: row.senderName,
      senderAvatar: row.senderAvatar,
      createdAt: new Date(row.createdAt).toISOString(),
    };
  }
}

interface MessageRow {
  id: string;
  content: string;
  eventId: string;
  senderId: string;
  createdAt: string | Date;
  senderName: string;
  senderAvatar: string | null;
}
