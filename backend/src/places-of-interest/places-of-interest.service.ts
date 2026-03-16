import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { FindNearbyPlacesDto } from './dto/find-nearby-places.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { PlaceResponse, RawPlace, serializePlace } from './places-of-interest.types';

const DEFAULT_RADIUS = 5000;

const PLACE_SELECT = `id, name, description, icon, "userId", "createdAt", "updatedAt", ST_Y(location) as lat, ST_X(location) as lng`;

@Injectable()
export class PlacesOfInterestService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crée un point d'intérêt personnel pour l'utilisateur connecté.
   *
   * @param userId - Id du propriétaire
   * @param dto - Données du POI
   * @returns Le POI créé sérialisé
   */
  async create(userId: string, dto: CreatePlaceDto): Promise<PlaceResponse> {
    const id = randomUUID();
    await this.prisma.$executeRaw`
      INSERT INTO places_of_interest (id, name, description, icon, location, "userId", "createdAt", "updatedAt")
      VALUES (
        ${id}, ${dto.name}, ${dto.description ?? null}, ${dto.icon ?? null},
        ST_SetSRID(ST_MakePoint(${dto.lng}, ${dto.lat}), 4326),
        ${userId}, now(), now()
      )`;
    return this.findByIdRaw(id);
  }

  /**
   * Retourne les POIs personnels de l'utilisateur dans un rayon donné.
   * Utilise ST_DWithin pour le filtre géographique.
   *
   * @param userId - Id du propriétaire — seuls ses POIs sont retournés
   * @param dto - Coordonnées et rayon de recherche
   * @returns Liste des POIs sérialisés triés par distance
   */
  async findNearby(userId: string, dto: FindNearbyPlacesDto): Promise<PlaceResponse[]> {
    const radius = dto.radius ?? DEFAULT_RADIUS;
    const rows = (await this.prisma.$queryRawUnsafe(
      `SELECT ${PLACE_SELECT}
       FROM places_of_interest
       WHERE ST_DWithin(location::geography, ST_MakePoint($1, $2)::geography, $3)
         AND "userId" = $4
       ORDER BY location <-> ST_MakePoint($1, $2)::geography
       LIMIT 200`,
      dto.lng, dto.lat, radius, userId,
    )) as RawPlace[];
    return rows.map(serializePlace);
  }

  /**
   * Retourne un POI par son identifiant.
   * Vérifie que le demandeur est le propriétaire.
   *
   * @param id - UUID du POI
   * @param userId - Id du demandeur
   * @returns Le POI sérialisé
   * @throws NotFoundException si le POI n'existe pas
   * @throws ForbiddenException si le demandeur n'est pas le propriétaire
   */
  async findById(id: string, userId: string): Promise<PlaceResponse> {
    const place = await this.findByIdRaw(id);
    if (place.userId !== userId) throw new ForbiddenException('Non autorisé');
    return place;
  }

  /**
   * Met à jour un POI (propriétaire uniquement).
   *
   * @param id - UUID du POI
   * @param userId - Id du demandeur
   * @param dto - Champs à modifier
   * @returns Le POI mis à jour
   * @throws NotFoundException si le POI n'existe pas
   * @throws ForbiddenException si le demandeur n'est pas le propriétaire
   */
  async update(id: string, userId: string, dto: UpdatePlaceDto): Promise<PlaceResponse> {
    await this.findById(id, userId);
    await this.applyUpdate(id, dto);
    return this.findByIdRaw(id);
  }

  /**
   * Supprime un POI (propriétaire uniquement).
   *
   * @param id - UUID du POI
   * @param userId - Id du demandeur
   * @throws NotFoundException si le POI n'existe pas
   * @throws ForbiddenException si le demandeur n'est pas le propriétaire
   */
  async remove(id: string, userId: string): Promise<void> {
    await this.findById(id, userId);
    await this.prisma.placeOfInterest.delete({ where: { id } });
  }

  private async findByIdRaw(id: string): Promise<PlaceResponse> {
    const rows = await this.prisma.$queryRawUnsafe<RawPlace[]>(
      `SELECT ${PLACE_SELECT} FROM places_of_interest WHERE id = $1`, id,
    );
    if (!rows.length) throw new NotFoundException(`POI ${id} introuvable`);
    return serializePlace(rows[0]);
  }

  private async applyUpdate(id: string, dto: UpdatePlaceDto) {
    const { lat, lng, ...rest } = dto;
    if (Object.keys(rest).length) {
      await this.prisma.placeOfInterest.update({ where: { id }, data: rest as any });
    }
    if (lat !== undefined && lng !== undefined) {
      await this.prisma.$executeRaw`
        UPDATE places_of_interest SET location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326), "updatedAt" = now() WHERE id = ${id}`;
    }
  }
}
