import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { DatabaseError } from 'pg';
import * as bcrypt from 'bcrypt';

const PUBLIC_FIELDS = `id, email, name, avatar, role,
  created_at AS "createdAt"`;

const FULL_FIELDS = `id, email, name, avatar, role, password,
  provider, provider_id AS "providerId",
  refresh_token AS "refreshToken",
  created_at AS "createdAt", updated_at AS "updatedAt"`;

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Crée un nouvel utilisateur avec email/password.
   *
   * @param dto - Données d'inscription (email, password, name)
   * @returns Utilisateur créé sans le mot de passe
   * @throws ConflictException si l'email est déjà utilisé
   */
  async create(dto: CreateUserDto) {
    const password = await bcrypt.hash(dto.password, 12);
    try {
      const rows = await this.db.query(
        `INSERT INTO users (email, password, name)
         VALUES ($1, $2, $3)
         RETURNING ${PUBLIC_FIELDS}`,
        [dto.email, password, dto.name],
      );
      return rows[0];
    } catch (err) {
      if (err instanceof DatabaseError && err.code === '23505') {
        throw new ConflictException('Email already in use');
      }
      throw err;
    }
  }

  /**
   * Recherche un utilisateur par son email (inclut le mot de passe hashé).
   *
   * @param email - Email à rechercher
   * @returns Utilisateur complet ou null si introuvable
   */
  async findByEmail(email: string) {
    const rows = await this.db.query(
      `SELECT ${FULL_FIELDS} FROM users WHERE email = $1`,
      [email],
    );
    return rows[0] ?? null;
  }

  /**
   * Recherche un utilisateur par son identifiant.
   *
   * @param id - UUID de l'utilisateur
   * @returns Profil public de l'utilisateur (sans password ni refreshToken)
   * @throws NotFoundException si l'utilisateur n'existe pas
   */
  async findById(id: string) {
    const rows = await this.db.query(
      `SELECT ${PUBLIC_FIELDS} FROM users WHERE id = $1`,
      [id],
    );
    if (!rows[0]) throw new NotFoundException('User not found');
    return rows[0];
  }

  /**
   * Trouve un utilisateur OAuth existant ou en crée un nouveau.
   *
   * @param email - Email issu du provider OAuth
   * @param name - Nom issu du provider OAuth
   * @param provider - Fournisseur OAuth (GOOGLE, APPLE)
   * @param providerId - Identifiant unique chez le provider
   * @returns Utilisateur existant ou nouvellement créé
   */
  async findOrCreateOAuth(email: string, name: string, provider: string, providerId: string) {
    const existing = await this.findByEmail(email);
    if (existing) return existing;

    const rows = await this.db.query(
      `INSERT INTO users (email, name, provider, provider_id)
       VALUES ($1, $2, $3, $4)
       RETURNING ${FULL_FIELDS}`,
      [email, name, provider, providerId],
    );
    return rows[0];
  }

  /**
   * Recherche un utilisateur par email pour l'invitation (profil public uniquement).
   *
   * @param email - Email à rechercher
   * @returns Profil public ou null si introuvable
   */
  async searchByEmail(email: string) {
    const rows = await this.db.query(
      `SELECT id, name, avatar FROM users WHERE email = $1`,
      [email],
    );
    return rows[0] ?? null;
  }

  /**
   * Retourne la liste de tous les utilisateurs (usage admin).
   *
   * @returns Liste de profils publics (sans password ni refreshToken)
   */
  async findAll() {
    return this.db.query(
      `SELECT ${PUBLIC_FIELDS} FROM users ORDER BY created_at DESC`,
    );
  }

  /**
   * Supprime un utilisateur par son identifiant (usage admin).
   *
   * @param id - UUID de l'utilisateur à supprimer
   * @throws NotFoundException si l'utilisateur n'existe pas
   */
  async remove(id: string) {
    const result = await this.db.execute(
      `DELETE FROM users WHERE id = $1`,
      [id],
    );
    if (result.rowCount === 0) throw new NotFoundException('User not found');
  }

  /**
   * Met à jour le refresh token hashé de l'utilisateur.
   *
   * @param id - UUID de l'utilisateur
   * @param token - Token brut à hasher et stocker, ou null pour révoquer
   */
  async updateRefreshToken(id: string, token: string | null) {
    const hashed = token ? await bcrypt.hash(token, 10) : null;
    await this.db.execute(
      `UPDATE users SET refresh_token = $1 WHERE id = $2`,
      [hashed, id],
    );
  }
}
