import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const isDryRun = process.argv.includes('--dry-run');

async function migrate(): Promise<void> {
  const client = new Client({
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await client.connect();

  if (isDryRun) console.log('[dry-run] Aucune modification ne sera appliquée.\n');

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id        SERIAL PRIMARY KEY,
        filename  TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    let pendingCount = 0;

    for (const file of files) {
      const { rowCount } = await client.query(
        'SELECT 1 FROM _migrations WHERE filename = $1',
        [file],
      );

      if (rowCount && rowCount > 0) {
        console.log(`[skip]    ${file}`);
        continue;
      }

      if (isDryRun) {
        console.log(`[pending] ${file}`);
        pendingCount++;
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO _migrations (filename) VALUES ($1)',
          [file],
        );
        await client.query('COMMIT');
        console.log(`[ok]      ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`[fail]    ${file}`, err);
        throw err;
      }
    }

    if (isDryRun) {
      console.log(
        pendingCount === 0
          ? '\nTout est à jour — aucune migration en attente.'
          : `\n${pendingCount} migration(s) en attente.`,
      );
    } else {
      console.log('Migrations terminées.');
    }
  } finally {
    await client.end();
  }
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
