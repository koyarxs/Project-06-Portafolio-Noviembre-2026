import 'dotenv/config';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import pg from 'pg';

async function snapshot() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const tables = await client.query<{ tablename: string }>(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
    );
    const result: Record<string, unknown> = {};
    for (const { tablename } of tables.rows) {
      const safeName = tablename.replaceAll('"', '""');
      result[tablename] = (await client.query(`SELECT row_to_json(t) AS data FROM "${safeName}" t ORDER BY row_to_json(t)::text`)).rows;
    }
    return result;
  } finally { await client.end(); }
}

const before = await snapshot();
// Reemplaza únicamente el contenedor postgres de este proyecto; conserva el volumen.
execFileSync('docker', ['compose', 'up', '-d', '--force-recreate', '--wait', 'postgres'], { stdio: 'inherit' });
assert.deepEqual(await snapshot(), before);
console.log('PASS persistencia: todas las tablas y registros idénticos tras recrear el contenedor.');
