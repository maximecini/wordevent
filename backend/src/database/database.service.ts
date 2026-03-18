import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool, PoolClient, QueryResult } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  onModuleInit(): void {
    this.pool = new Pool({
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }

  /**
   * Exécute une requête SELECT et retourne les lignes.
   *
   * @param sql - Requête SQL paramétrée
   * @param params - Paramètres ($1, $2, …)
   * @returns Tableau de lignes typées
   */
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const result = await this.pool.query(sql, params);
    return result.rows;
  }

  /**
   * Exécute une requête INSERT / UPDATE / DELETE.
   *
   * @param sql - Requête SQL paramétrée
   * @param params - Paramètres ($1, $2, …)
   * @returns QueryResult pg (rowCount, rows)
   */
  async execute(sql: string, params?: any[]): Promise<QueryResult> {
    return this.pool.query(sql, params);
  }

  /**
   * Exécute un ensemble de requêtes dans une transaction.
   * Rollback automatique en cas d'erreur.
   *
   * @param fn - Fonction recevant le PoolClient de la transaction
   * @returns Résultat de la fonction
   * @throws Toute erreur levée par fn (après rollback)
   */
  async transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
