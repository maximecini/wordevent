import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Service Prisma global — gère la connexion à la base de données.
 * Injecté automatiquement dans tous les modules via PrismaModule (@Global).
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /**
   * Établit la connexion à la base de données au démarrage du module.
   */
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /**
   * Ferme proprement la connexion à la base de données à l'arrêt du module.
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
