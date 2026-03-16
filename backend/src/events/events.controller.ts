import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FindNearbyDto } from './dto/find-nearby.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  /**
   * Retourne les événements actifs autour des coordonnées fournies.
   *
   * @param user - Utilisateur connecté
   * @param dto - Latitude, longitude et rayon de recherche
   */
  @ApiOperation({ summary: 'Events autour de moi' })
  @Get()
  findNearby(@CurrentUser() user: any, @Query() dto: FindNearbyDto) {
    return this.events.findNearby(user.id, dto);
  }

  /**
   * Crée un nouvel événement pour l'utilisateur connecté.
   *
   * @param user - Utilisateur connecté (créateur)
   * @param dto - Données du nouvel événement
   */
  @ApiOperation({ summary: 'Créer un événement' })
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateEventDto) {
    return this.events.create(user.id, dto);
  }

  /**
   * Retourne le détail d'un événement par son identifiant.
   *
   * @param id - UUID de l'événement
   */
  @ApiOperation({ summary: "Détail d'un événement" })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.events.findById(id);
  }

  /**
   * Modifie un événement (créateur ou ADMIN uniquement).
   *
   * @param user - Utilisateur connecté
   * @param id - UUID de l'événement
   * @param dto - Champs à modifier
   */
  @ApiOperation({ summary: 'Modifier un événement' })
  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.events.update(user.id, id, dto, user.role);
  }

  /**
   * Supprime un événement (créateur ou ADMIN uniquement).
   *
   * @param user - Utilisateur connecté
   * @param id - UUID de l'événement
   */
  @ApiOperation({ summary: 'Supprimer un événement' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.events.remove(user.id, id, user.role);
  }
}
