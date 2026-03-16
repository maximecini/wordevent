import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * Retourne l'historique paginé des messages d'un événement.
   * L'utilisateur doit être participant de l'événement.
   *
   * @param eventId - UUID de l'événement
   * @param user - Utilisateur connecté
   * @param limit - Nombre de messages (défaut 50, max 100)
   * @param cursor - Date ISO du dernier message pour la pagination
   * @returns Liste de messages
   */
  @Get('events/:id/messages')
  getHistory(
    @Param('id', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: { id: string },
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const parsedLimit = limit ? Math.min(parseInt(limit, 10), 100) : 50;
    return this.messagesService.getHistory(eventId, user.id, parsedLimit, cursor);
  }
}
