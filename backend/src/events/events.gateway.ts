import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { EventResponse } from './events.types';

/**
 * Gateway WebSocket pour les événements en temps réel.
 * Authentifie les connexions via JWT et gère les rooms par event.
 */
@WebSocketGateway({
  namespace: '/events',
  cors: { origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(EventsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

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
      client.join(`user:${payload.sub}`);
    } catch (err) {
      this.logger.error('Token JWT invalide à la connexion WebSocket /events', err);
      client.disconnect();
    }
  }

  /** Nettoie à la déconnexion (pas d'action spécifique nécessaire). */
  handleDisconnect(_client: Socket): void {}

  /**
   * Abonne le client à la room d'un événement pour recevoir les mises à jour.
   * @param client - Socket du client
   * @param eventId - UUID de l'événement
   */
  @SubscribeMessage('join:room')
  handleJoinRoom(client: Socket, eventId: string): void {
    client.join(`event:${eventId}`);
  }

  /**
   * Désabonne le client de la room d'un événement.
   * @param client - Socket du client
   * @param eventId - UUID de l'événement
   */
  @SubscribeMessage('leave:room')
  handleLeaveRoom(client: Socket, eventId: string): void {
    client.leave(`event:${eventId}`);
  }

  /** Notifie la room qu'un participant a rejoint. */
  emitJoined(eventId: string, participantCount: number): void {
    this.server.to(`event:${eventId}`).emit('event:joined', { eventId, participantCount });
  }

  /** Notifie la room qu'un participant a quitté. */
  emitLeft(eventId: string, participantCount: number): void {
    this.server.to(`event:${eventId}`).emit('event:left', { eventId, participantCount });
  }

  /** Diffuse un nouvel événement à tous les clients connectés. */
  emitCreated(event: EventResponse): void {
    this.server.emit('event:created', event);
  }

  /** Notifie la room d'une mise à jour d'événement. */
  emitUpdated(event: EventResponse): void {
    this.server.to(`event:${event.id}`).emit('event:updated', event);
  }

  /** Notifie la room de la suppression d'un événement. */
  emitDeleted(eventId: string): void {
    this.server.to(`event:${eventId}`).emit('event:deleted', { id: eventId });
  }

  /**
   * Envoie une invitation en temps réel à l'utilisateur cible.
   *
   * @param userId - UUID de l'utilisateur invité
   * @param invitation - Données de l'invitation à transmettre
   */
  emitInvitation(userId: string, invitation: unknown): void {
    this.server.to(`user:${userId}`).emit('invitation:received', invitation);
  }
}
