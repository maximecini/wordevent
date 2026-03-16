import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ParticipationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Permet à un utilisateur de rejoindre un événement.
   * Vérifie la capacité, l'accès PRIVATE et l'unicité de la participation.
   *
   * @param userId - Id de l'utilisateur
   * @param eventId - UUID de l'événement
   * @throws BadRequestException si capacité atteinte ou déjà participant
   * @throws ForbiddenException si event PRIVATE sans invitation ACCEPTED
   */
  async join(userId: string, eventId: string): Promise<void> {
    const event = await this.getEventOrThrow(eventId);
    await this.checkPrivateAccess(userId, eventId, event.visibility);
    await this.checkCapacity(eventId, event.capacity);
    await this.prisma.participation.create({ data: { userId, eventId } });
  }

  private async getEventOrThrow(eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException(`Event ${eventId} introuvable`);
    return event;
  }

  private async checkPrivateAccess(userId: string, eventId: string, visibility: string) {
    if (visibility !== 'PRIVATE') return;
    const invitation = await this.prisma.invitation.findFirst({
      where: { eventId, invitedUserId: userId, status: 'ACCEPTED' },
    });
    if (!invitation) throw new ForbiddenException('Invitation requise pour cet événement');
  }

  private async checkCapacity(eventId: string, capacity: number) {
    const count = await this.prisma.participation.count({ where: { eventId } });
    if (count >= capacity) throw new BadRequestException('Capacité maximale atteinte');
  }

  /**
   * Permet à un utilisateur de quitter un événement.
   * Le créateur ne peut pas quitter son propre événement.
   *
   * @param userId - Id de l'utilisateur
   * @param eventId - UUID de l'événement
   * @throws ForbiddenException si l'utilisateur est le créateur
   * @throws NotFoundException si la participation n'existe pas
   */
  async leave(userId: string, eventId: string): Promise<void> {
    const event = await this.getEventOrThrow(eventId);
    if (event.creatorId === userId) {
      throw new ForbiddenException('Le créateur ne peut pas quitter son événement');
    }
    await this.prisma.participation.delete({
      where: { userId_eventId: { userId, eventId } },
    });
  }

  /**
   * Retourne la liste des participants d'un événement.
   *
   * @param eventId - UUID de l'événement
   * @returns Liste des participants avec leur profil public
   */
  async findParticipants(eventId: string) {
    await this.getEventOrThrow(eventId);
    return this.prisma.participation.findMany({
      where: { eventId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { joinedAt: 'asc' },
    });
  }
}
