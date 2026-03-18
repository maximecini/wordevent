import { Pool } from 'pg';

let pool: Pool;

export function getTestPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
  }
  return pool;
}

export async function cleanDatabase(): Promise<void> {
  const db = getTestPool();
  await db.query('DELETE FROM invitations');
  await db.query('DELETE FROM messages');
  await db.query('DELETE FROM participations');
  await db.query('DELETE FROM places_of_interest');
  await db.query('DELETE FROM events');
  await db.query('DELETE FROM users');
}

export async function closeTestPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = undefined as any;
  }
}
