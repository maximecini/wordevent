import { Client } from 'pg';
import * as bcrypt from 'bcrypt';

async function seed(): Promise<void> {
  const client = new Client({
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await client.connect();

  try {
    const email = process.env.ADMIN_EMAIL ?? 'admin@wordevent.com';
    const password = process.env.ADMIN_PASSWORD ?? 'admin';
    const hash = await bcrypt.hash(password, 10);

    await client.query(
      `INSERT INTO users (email, password, name, role, provider)
       VALUES ($1, $2, 'Admin', 'ADMIN', 'LOCAL')
       ON CONFLICT (email) DO NOTHING`,
      [email, hash],
    );

    console.log(`Admin créé : ${email}`);
  } finally {
    await client.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
