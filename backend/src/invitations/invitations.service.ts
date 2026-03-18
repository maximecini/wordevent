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

@Injectable()
export class InvitationsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly gateway: EventsGateway,
  ) {}

  /**
   * Crée une invitation pour un événement privé.
   * Vérifie que l'invitant est le créateur et que l'utilisateur n'est pas déjà invité.
   *
   * @param eventId - UUID de l'événement
   * @param invitedUserId - UUID de l'utilisateur à inviter
   * @param inviterId - UUID de l'utilisateur qui invite (créateur)
   * @returns Invitation créée avec les données de l'event et de l'invitant
   * @throws NotFoundException si l'event n'existe pas
   * @throws BadRequestException si l'event n'est pas privé
   * @throws ForbiddenException si l'invitant n'est pas le créateur
   * @throws BadRequestException si l'invitant s'invite lui-même
   * @throws NotFoundException si l'utilisateur invité n'existe pas
   * @throws ConflictException si l'utilisateur est déjà invité
   */
  async create(eventId: string, invitedUserId: string, inviterId: string) {
    const event = await this.findEventOrFail(eventId);
    if (event.visibility !== 'PRIVATE') throw new BadRequestException("Cet événement n'est pas privé");
    if (event.creatorId !== inviterId) throw new ForbiddenException('Seul le créateur peut inviter');
    if (invitedUserId === inviterId) throw new BadRequestException('Le créateur est déjà participant');
    await this.findUserOrFail(invitedUserId);

    const invitation = await this.insertInvitation(eventId, invitedUserId, inviterId);
    this.gateway.emitInvitation(invitedUserId, invitation);
    return invitation;
  }

  /**
   * Retourne les invitations PENDING reçues par l'utilisateur connecté.
   *
   * @param userId - UUID de l'utilisateur
   * @returns Liste des invitations en attente avec données de l'event et de l'invitant
   */
  async findAllPending(userId: string) {
    return this.db.query<InvitationRow>(
      `SELECT
         i.id, i.status,
         i.event_id AS "eventId",
         i.invited_by_id AS "invitedById",
         i.invited_user_id AS "invitedUserId",
         i.created_at AS "createdAt",
         i.updated_at AS "updatedAt",
         json_build_object('id', ib.id, 'name', ib.name, 'avatar', ib.avatar) AS "invitedBy",
         json_build_object('id', e.id, 'title', e.title, 'startAt', e.start_at, 'visibility', e.visibility) AS "event"
       FROM invitations i
       JOIN users ib ON ib.id = i.invited_by_id
       JOIN events e ON e.id = i.event_id
       WHERE i.invited_user_id = $1 AND i.status = 'PENDING'
       ORDER BY i.created_at DESC`,
      [userId],
    );
  }

  /**
   * Met à jour le statut d'une invitation (ACCEPTED ou DECLINED).
   * Vérifie que l'utilisateur est bien l'invité.
   *
   * @param id - UUID de l'invitation
   * @param status - Nouveau statut : ACCEPTED ou DECLINED
   * @param userId - UUID de l'utilisateur qui répond
   * @returns Invitation mise à jour
   * @throws NotFoundException si l'invitation n'existe pas
   * @throws ForbiddenException si l'utilisateur n'est pas l'invité
   * @throws BadRequestException si l'invitation n'est plus PENDING
   */
  async updateStatus(id: string, status: 'ACCEPTED' | 'DECLINED', userId: string) {
    const invitation = await this.findInvitationOrFail(id);
    if (invitation.invitedUserId !== userId) throw new ForbiddenException('Action non autorisée');
    if (invitation.status !== 'PENDING') throw new BadRequestException('Cette invitation a déjà reçu une réponse');

    const [updated] = await this.db.query<InvitationRow>(
      `UPDATE invitations SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, status,
         event_id AS "eventId",
         invited_by_id AS "invitedById",
         invited_user_id AS "invitedUserId",
         created_at AS "createdAt",
         updated_at AS "updatedAt"`,
      [status, id],
    );
    return updated;
  }

  private async findUserOrFail(userId: string): Promise<void> {
    const rows = await this.db.query<{ id: string }>('SELECT id FROM users WHERE id = $1', [userId]);
    if (!rows.length) throw new NotFoundException('Utilisateur invité introuvable');
  }

  private async findEventOrFail(eventId: string) {
    const [event] = await this.db.query<{ id: string; visibility: string; creatorId: string }>(
      `SELECT id, visibility, creator_id AS "creatorId" FROM events WHERE id = $1`,
      [eventId],
    );
    if (!event) throw new NotFoundException(`Event ${eventId} introuvable`);
    return event;
  }

  private async findInvitationOrFail(id: string) {
    const [invitation] = await this.db.query<InvitationRow>(
      `SELECT id, status,
         event_id AS "eventId",
         invited_by_id AS "invitedById",
         invited_user_id AS "invitedUserId",
         created_at AS "createdAt",
         updated_at AS "updatedAt"
       FROM invitations WHERE id = $1`,
      [id],
    );
    if (!invitation) throw new NotFoundException(`Invitation ${id} introuvable`);
    return invitation;
  }

  private async insertInvitation(eventId: string, invitedUserId: string, invitedById: string) {
    try {
      const [invitation] = await this.db.query<InvitationRow>(
        `INSERT INTO invitations (event_id, invited_user_id, invited_by_id)
         VALUES ($1, $2, $3)
         RETURNING
           id, status,
           event_id AS "eventId",
           invited_by_id AS "invitedById",
           invited_user_id AS "invitedUserId",
           created_at AS "createdAt",
           updated_at AS "updatedAt"`,
        [eventId, invitedUserId, invitedById],
      );
      return invitation;
    } catch (err) {
      if (err instanceof DatabaseError && err.code === '23505') {
        throw new ConflictException('Utilisateur déjà invité');
      }
      if (err instanceof DatabaseError && err.code === '23503') {
        throw new NotFoundException('Utilisateur invité introuvable');
      }
      throw err;
    }
  }
}

interface InvitationRow {
  id: string;
  status: string;
  eventId: string;
  invitedById: string;
  invitedUserId: string;
  createdAt: Date;
  updatedAt: Date;
  invitedBy?: { id: string; name: string; avatar: string | null };
  event?: { id: string; title: string; startAt: Date; visibility: string };
}
