import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from './messages.service';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SendMessageDto } from './dto/send-message.dto';

/**
 * Gateway WebSocket pour le chat en temps réel.
 * Authentifie les connexions via JWT et gère les rooms par event.
 */
@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly messagesService: MessagesService,
  ) {}

  private extractToken(client: Socket): string | null {
    const raw = client.handshake.auth?.token as string | undefined;
    return raw?.replace('Bearer ', '') ?? null;
  }

  /**
   * Authentifie le client via le JWT fourni dans le handshake.
   * Déconnecte le client si le token est absent ou invalide.
   */
  async handleConnection(client: Socket): Promise<void> {
    const token = this.extractToken(client);
    if (!token) { client.disconnect(); return; }
    try {
      const payload = this.jwtService.verify<{ sub: string }>(token);
      client.data.userId = payload.sub;
    } catch {
      client.disconnect();
    }
  }

  /** Nettoie à la déconnexion (pas d'action spécifique nécessaire). */
  handleDisconnect(_client: Socket): void {}

  /**
   * Expulse tous les sockets d'un utilisateur d'une room de chat.
   * Appelé quand l'utilisateur quitte un événement.
   *
   * @param userId - Id de l'utilisateur à expulser
   * @param eventId - UUID de l'événement
   */
  kickFromChat(userId: string, eventId: string): void {
    const room = `chat:${eventId}`;
    this.server.sockets.sockets.forEach((socket: Socket) => {
      if (socket.data.userId === userId) socket.leave(room);
    });
  }

  /**
   * Abonne le client à la room de chat d'un événement.
   * @param client - Socket du client
   * @param eventId - UUID de l'événement
   */
  @SubscribeMessage('chat:join')
  handleJoinRoom(client: Socket, eventId: string): void {
    client.join(`chat:${eventId}`);
  }

  /**
   * Désabonne le client de la room de chat d'un événement.
   * @param client - Socket du client
   * @param eventId - UUID de l'événement
   */
  @SubscribeMessage('chat:leave')
  handleLeaveRoom(client: Socket, eventId: string): void {
    client.leave(`chat:${eventId}`);
  }

  /**
   * Reçoit un message du client, le sauvegarde en base et le broadcast à la room.
   * Vérifie que l'utilisateur est bien participant via MessagesService.
   * @param client - Socket du client
   * @param payload - Données brutes du message
   */
  @SubscribeMessage('chat:send')
  async handleSendMessage(client: Socket, payload: unknown): Promise<void> {
    const userId = client.data.userId as string | undefined;
    if (!userId) { client.disconnect(); return; }

    const dto = plainToInstance(SendMessageDto, payload);
    const errors = await validate(dto);
    if (errors.length > 0) return;

    try {
      const message = await this.messagesService.saveMessage(dto.eventId, userId, dto.content);
      this.server.to(`chat:${dto.eventId}`).emit('chat:message', message);
    } catch {
      // ForbiddenException ou NotFoundException : on ignore silencieusement
    }
  }
}
