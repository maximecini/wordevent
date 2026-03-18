import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { FindNearbyPlacesDto } from './dto/find-nearby-places.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { PlaceResponse, RawPlace, serializePlace } from './places-of-interest.types';

const PLACE_SELECT = `
  id, name, description, icon, user_id AS "userId",
  created_at AS "createdAt", updated_at AS "updatedAt",
  ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lng
`;

@Injectable()
export class PlacesOfInterestService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Crée un point d'intérêt personnel pour l'utilisateur connecté.
   *
   * @param userId - Id du propriétaire
   * @param dto - Données du POI
   * @returns Le POI créé sérialisé
   */
  async create(userId: string, dto: CreatePlaceDto): Promise<PlaceResponse> {
    const id = randomUUID();
    await this.db.execute(
      `INSERT INTO places_of_interest
         (id, name, description, icon, location, user_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326), $7, now(), now())`,
      [id, dto.name, dto.description ?? null, dto.icon ?? null, dto.lng, dto.lat, userId],
    );
    return this.findByIdRaw(id);
  }

  /**
   * Retourne tous les POIs personnels de l'utilisateur, sans restriction géographique.
   *
   * @param userId - Id du propriétaire
   * @returns Liste de tous les POIs sérialisés
   */
  async findAll(userId: string): Promise<PlaceResponse[]> {
    const rows = await this.db.query<RawPlace>(
      `SELECT ${PLACE_SELECT}
       FROM places_of_interest
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 200`,
      [userId],
    );
    return rows.map(serializePlace);
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
    const radius = dto.radius ?? 5000;
    const rows = await this.db.query<RawPlace>(
      `SELECT ${PLACE_SELECT}
       FROM places_of_interest
       WHERE ST_DWithin(
         location::geography,
         ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
         $3
       )
       AND user_id = $4
       ORDER BY location <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)`,
      [dto.lng, dto.lat, radius, userId],
    );
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
    await this.db.execute(
      `DELETE FROM places_of_interest WHERE id = $1`,
      [id],
    );
  }

  private async findByIdRaw(id: string): Promise<PlaceResponse> {
    const rows = await this.db.query<RawPlace>(
      `SELECT ${PLACE_SELECT} FROM places_of_interest WHERE id = $1`,
      [id],
    );
    if (!rows.length) throw new NotFoundException(`POI ${id} introuvable`);
    return serializePlace(rows[0]);
  }

  private async applyUpdate(id: string, dto: UpdatePlaceDto) {
    const { lat, lng, ...rest } = dto;
    const fields = Object.entries(rest).filter(([, v]) => v !== undefined);
    if (fields.length) {
      await this.applyScalarUpdate(id, fields);
    }
    if (lat !== undefined && lng !== undefined) {
      await this.db.execute(
        `UPDATE places_of_interest
         SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326), updated_at = now()
         WHERE id = $3`,
        [lng, lat, id],
      );
    }
  }

  private async applyScalarUpdate(id: string, fields: [string, unknown][]) {
    const setClauses = fields
      .map(([key], i) => `"${key}" = $${i + 1}`)
      .join(', ');
    const values = fields.map(([, v]) => v);
    await this.db.execute(
      `UPDATE places_of_interest SET ${setClauses}, updated_at = now() WHERE id = $${fields.length + 1}`,
      [...values, id],
    );
  }
}
