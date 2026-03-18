import { Controller, Post, Delete, Get, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ParticipationsService } from './participations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtUser } from '../common/types/jwt-user.interface';

@ApiTags('participations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('events/:eventId')
export class ParticipationsController {
  constructor(private readonly participations: ParticipationsService) {}

  /**
   * Permet à l'utilisateur connecté de rejoindre un événement.
   *
   * @param user - Utilisateur connecté
   * @param eventId - UUID de l'événement
   */
  @ApiOperation({ summary: 'Rejoindre un événement' })
  @Post('join')
  @HttpCode(HttpStatus.NO_CONTENT)
  join(@CurrentUser() user: JwtUser, @Param('eventId') eventId: string) {
    return this.participations.join(user.id, eventId);
  }

  /**
   * Permet à l'utilisateur connecté de quitter un événement.
   *
   * @param user - Utilisateur connecté
   * @param eventId - UUID de l'événement
   */
  @ApiOperation({ summary: 'Quitter un événement' })
  @Delete('leave')
  @HttpCode(HttpStatus.NO_CONTENT)
  leave(@CurrentUser() user: JwtUser, @Param('eventId') eventId: string) {
    return this.participations.leave(user.id, eventId);
  }

  /**
   * Retourne la liste des participants d'un événement.
   *
   * @param eventId - UUID de l'événement
   */
  @ApiOperation({ summary: "Participants d'un événement" })
  @Get('participants')
  findParticipants(@Param('eventId') eventId: string) {
    return this.participations.findParticipants(eventId);
  }
}
