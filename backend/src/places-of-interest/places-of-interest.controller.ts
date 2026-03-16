import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreatePlaceDto } from './dto/create-place.dto';
import { FindNearbyPlacesDto } from './dto/find-nearby-places.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { PlacesOfInterestService } from './places-of-interest.service';

@ApiTags('places')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('places')
export class PlacesOfInterestController {
  constructor(private readonly places: PlacesOfInterestService) {}

  /**
   * Retourne les POIs personnels autour des coordonnées données.
   *
   * @param user - Utilisateur connecté
   * @param dto - Coordonnées et rayon de recherche
   * @returns Liste des POIs de l'utilisateur dans le rayon
   */
  @Get()
  findNearby(@CurrentUser() user: any, @Query() dto: FindNearbyPlacesDto) {
    return this.places.findNearby(user.id, dto);
  }

  /**
   * Crée un nouveau point d'intérêt personnel.
   *
   * @param user - Utilisateur connecté
   * @param dto - Données du POI
   * @returns Le POI créé
   */
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreatePlaceDto) {
    return this.places.create(user.id, dto);
  }

  /**
   * Retourne le détail d'un POI (propriétaire uniquement).
   *
   * @param user - Utilisateur connecté
   * @param id - UUID du POI
   * @returns Le POI
   */
  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.places.findById(id, user.id);
  }

  /**
   * Met à jour un POI (propriétaire uniquement).
   *
   * @param user - Utilisateur connecté
   * @param id - UUID du POI
   * @param dto - Champs à modifier
   * @returns Le POI mis à jour
   */
  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdatePlaceDto) {
    return this.places.update(id, user.id, dto);
  }

  /**
   * Supprime un POI (propriétaire uniquement).
   *
   * @param user - Utilisateur connecté
   * @param id - UUID du POI
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.places.remove(id, user.id);
  }
}
