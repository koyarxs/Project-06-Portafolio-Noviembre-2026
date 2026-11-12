import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import pg from 'pg';
import { createDatabaseClient } from '../../../packages/database/src/client.ts';

export async function createIsolatedDatabase(connectionString: string) {
  const schema = `test_portfolio_${randomUUID().replaceAll('-', '')}`;
  // Identificador generado internamente; nunca proviene de una URL ni de un usuario.
  assert.match(schema, /^test_portfolio_[0-9a-f]{32}$/);
  const admin = new pg.Client({ connectionString });
  await admin.connect();
  async function publicSnapshot() {
    const tables = (await admin.query<{ tablename: string }>(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
    )).rows;
    const hashes: Record<string, string> = {};
    for (const { tablename } of tables) {
      const name = tablename.replaceAll('"', '""');
      hashes[tablename] = (await admin.query(`SELECT md5(COALESCE(jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)::text)::text, '[]')) AS hash FROM public."${name}" t`)).rows[0].hash;
    }
    return hashes;
  }
  const before = await publicSnapshot();
  const url = new URL(connectionString);
  url.searchParams.set('schema', schema);
  const db = createDatabaseClient({ connectionString: url.href });
  const close = async () => {
    await db.$disconnect();
    try {
      // Limpia exclusivamente las tablas y fixtures de esta ejecución, nunca public.
      await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      assert.deepEqual(await publicSnapshot(), before, 'Real portfolio data must remain identical');
    } finally { await admin.end(); }
  };
  try {
    const migration = (await readFile(resolve('../../prisma/migrations/20261112000100_initial/migration.sql'), 'utf8'))
      .replace('CREATE SCHEMA IF NOT EXISTS "public";', '');
    await admin.query(`CREATE SCHEMA "${schema}"`);
    await admin.query(`SET search_path TO "${schema}"`);
    await admin.query(migration);
    return { db, connectionString: url.href, close };
  } catch (error) { await close(); throw error; }
}
