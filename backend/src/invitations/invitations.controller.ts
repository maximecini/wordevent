import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtUser } from '../common/types/jwt-user.interface';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';

@ApiTags('invitations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class InvitationsController {
  constructor(private readonly service: InvitationsService) {}

  /**
   * Invite un utilisateur à rejoindre un événement privé.
   * Réservé au créateur de l'événement.
   */
  @Post('events/:id/invite')
  invite(
    @Param('id', ParseUUIDPipe) eventId: string,
    @Body() dto: CreateInvitationDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.create(eventId, dto.invitedUserId, user.id);
  }

  /**
   * Retourne les invitations PENDING reçues par l'utilisateur connecté.
   */
  @Get('invitations')
  findPending(@CurrentUser() user: JwtUser) {
    return this.service.findAllPending(user.id);
  }

  /**
   * Accepte ou décline une invitation.
   */
  @Patch('invitations/:id')
  respond(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvitationDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.updateStatus(id, dto.status, user.id);
  }
}
