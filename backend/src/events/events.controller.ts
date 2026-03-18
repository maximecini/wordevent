import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus, UploadedFile, UseInterceptors, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FindNearbyDto } from './dto/find-nearby.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtUser } from '../common/types/jwt-user.interface';

const imageStorage = diskStorage({
  destination: './uploads/events',
  filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname)}`),
});

function imageFilter(_req: any, file: Express.Multer.File, cb: any) {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
    return cb(new BadRequestException('Seules les images jpg, png et webp sont acceptées'), false);
  }
  cb(null, true);
}

@ApiTags('events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  /**
   * Retourne les événements actifs accessibles à l'utilisateur.
   *
   * @param user - Utilisateur connecté
   * @returns Liste des événements accessibles
   */
  @ApiOperation({ summary: 'Tous les événements accessibles' })
  @Get()
  findAll(@CurrentUser() user: JwtUser) {
    return this.events.findAll(user.id);
  }

  /**
   * Retourne les événements actifs dans un rayon donné autour d'un point géographique.
   * Seuls les events PUBLIC et les events PRIVATE accessibles à l'utilisateur sont retournés.
   * Les résultats sont triés par distance croissante (max 100).
   *
   * @param user - Utilisateur connecté
   * @param dto - Coordonnées (lat, lng) et rayon en mètres (défaut : 5000 m)
   * @returns Liste des événements triés par distance
   */
  @ApiOperation({ summary: 'Événements à proximité (géospatial)' })
  @Get('nearby')
  findNearby(@CurrentUser() user: JwtUser, @Query() dto: FindNearbyDto) {
    return this.events.findNearby(user.id, dto);
  }

  /**
   * Upload une image pour un événement. Retourne l'URL publique.
   *
   * @param file - Fichier image (jpg, png, webp — max 10 Mo)
   * @returns URL publique de l'image uploadée
   */
  @ApiOperation({ summary: "Upload d'une image d'événement" })
  @ApiConsumes('multipart/form-data')
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: imageStorage, fileFilter: imageFilter, limits: { fileSize: 10 * 1024 * 1024 } }))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');
    return { url: `/uploads/events/${file.filename}` };
  }

  /**
   * Crée un nouvel événement pour l'utilisateur connecté.
   *
   * @param user - Utilisateur connecté (créateur)
   * @param dto - Données du nouvel événement
   */
  @ApiOperation({ summary: 'Créer un événement' })
  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateEventDto) {
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
  update(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() dto: UpdateEventDto) {
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
  remove(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.events.remove(user.id, id, user.role);
  }
}
