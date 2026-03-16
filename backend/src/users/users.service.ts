import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Provider } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crée un nouvel utilisateur avec email/password.
   *
   * @param dto - Données d'inscription (email, password, name)
   * @returns Utilisateur créé sans le mot de passe
   * @throws ConflictException si l'email est déjà utilisé
   */
  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already in use');

    const password = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.create({
      data: { email: dto.email, password, name: dto.name },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  /**
   * Recherche un utilisateur par son email (inclut le mot de passe hashé).
   *
   * @param email - Email à rechercher
   * @returns Utilisateur complet ou null si introuvable
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Recherche un utilisateur par son identifiant.
   *
   * @param id - UUID de l'utilisateur
   * @returns Profil public de l'utilisateur (sans password ni refreshToken)
   * @throws NotFoundException si l'utilisateur n'existe pas
   */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, avatar: true, role: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
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
  async findOrCreateOAuth(email: string, name: string, provider: Provider, providerId: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) return existing;

    return this.prisma.user.create({
      data: { email, name, provider, providerId },
    });
  }

  /**
   * Met à jour le refresh token hashé de l'utilisateur.
   *
   * @param id - UUID de l'utilisateur
   * @param token - Token brut à hasher et stocker, ou null pour révoquer
   */
  async updateRefreshToken(id: string, token: string | null) {
    const hashed = token ? await bcrypt.hash(token, 10) : null;
    await this.prisma.user.update({ where: { id }, data: { refreshToken: hashed } });
  }
}
