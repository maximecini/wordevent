import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
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
   * @throws BadRequestException si l'event n'est pas privé ou l'utilisateur déjà invité
   * @throws ForbiddenException si l'invitant n'est pas le créateur
   */
  async create(eventId: string, invitedUserId: string, inviterId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException(`Event ${eventId} introuvable`);
    if (event.visibility !== 'PRIVATE') throw new BadRequestException('Cet événement n\'est pas privé');
    if (event.creatorId !== inviterId) throw new ForbiddenException('Seul le créateur peut inviter');

    const existing = await this.prisma.invitation.findUnique({
      where: { eventId_invitedUserId: { eventId, invitedUserId } },
    });
    if (existing) throw new BadRequestException('Utilisateur déjà invité');

    const invitation = await this.prisma.invitation.create({
      data: { eventId, invitedUserId, invitedById: inviterId },
      include: {
        invitedBy: { select: { id: true, name: true, avatar: true } },
        event: { select: { id: true, title: true, startAt: true, visibility: true } },
      },
    });

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
    return this.prisma.invitation.findMany({
      where: { invitedUserId: userId, status: 'PENDING' },
      include: {
        invitedBy: { select: { id: true, name: true, avatar: true } },
        event: { select: { id: true, title: true, startAt: true, visibility: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
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
   */
  async updateStatus(id: string, status: 'ACCEPTED' | 'DECLINED', userId: string) {
    const invitation = await this.prisma.invitation.findUnique({ where: { id } });
    if (!invitation) throw new NotFoundException(`Invitation ${id} introuvable`);
    if (invitation.invitedUserId !== userId) throw new ForbiddenException('Action non autorisée');
    return this.prisma.invitation.update({ where: { id }, data: { status } });
  }
}
