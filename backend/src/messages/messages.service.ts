import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessageResponse } from './messages.types';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

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

    const messages = await this.prisma.message.findMany({
      where: {
        eventId,
        ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });

    return messages.map(this.toResponse);
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

    const message = await this.prisma.message.create({
      data: { eventId, senderId, content },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });

    return this.toResponse(message);
  }

  private async assertEventExists(eventId: string): Promise<void> {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException(`Event ${eventId} introuvable`);
  }

  private async assertParticipant(eventId: string, userId: string): Promise<void> {
    const participation = await this.prisma.participation.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });
    if (!participation) throw new ForbiddenException('Vous n\'êtes pas participant de cet événement');
  }

  private toResponse(message: {
    id: string;
    content: string;
    eventId: string;
    senderId: string;
    createdAt: Date;
    sender: { id: string; name: string; avatar: string | null };
  }): MessageResponse {
    return {
      id: message.id,
      content: message.content,
      eventId: message.eventId,
      senderId: message.senderId,
      senderName: message.sender.name,
      senderAvatar: message.sender.avatar,
      createdAt: message.createdAt.toISOString(),
    };
  }
}
