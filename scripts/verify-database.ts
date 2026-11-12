import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { seedDatabase } from '../prisma/seed.ts';
import { createDatabaseClient } from '../packages/database/src/client.ts';

const db = createDatabaseClient();
const sql = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await sql.connect();
  assert.equal((await sql.query('SELECT current_database() AS name')).rows[0].name,
    new URL(process.env.DATABASE_URL!).pathname.slice(1));
  await seedDatabase();
  const snapshot = async () => ({
    technologies: await db.technology.findMany({ orderBy: { slug: 'asc' } }),
    projects: await db.project.findMany({ orderBy: { slug: 'asc' } }),
  });
  const before = await snapshot();
  await seedDatabase();
  assert.deepEqual(await snapshot(), before, 'Seed must preserve IDs, timestamps and edited data');
  assert.equal(before.technologies.filter(t => [
    'html5', 'css3', 'javascript', 'typescript', 'react', 'nextjs', 'nodejs', 'nestjs',
    'expressjs', 'tailwind-css', 'postgresql', 'mongodb', 'prisma', 'docker', 'git',
    'github', 'jest', 'vitest', 'playwright', 'github-actions',
  ].includes(t.slug)).length, 20);
  assert.equal(before.projects.filter(p => ['fraudshield', 'flymaster', 'pawly', 'zenvik', 'falta-uno'].includes(p.slug)).length, 5);
  console.log('PASS conexión, catálogo inicial e idempotencia completa del seed');

  // Datos sintéticos exclusivos de verificación: todo se revierte, incluso ante fallos.
  await sql.query('BEGIN');
  const projectId = randomUUID();
  const technologyId = randomUUID();
  const slug = `verification-${randomUUID()}`;
  await sql.query('INSERT INTO "Project" (id, name, slug, "updatedAt") VALUES ($1, $2, $2, now())', [projectId, slug]);
  await sql.query('INSERT INTO "Technology" (id, name, slug, category, "updatedAt") VALUES ($1, $2, $2, $3, now())', [technologyId, slug, 'TOOLS']);
  await sql.query('INSERT INTO "ProjectTechnology" VALUES ($1, $2)', [projectId, technologyId]);

  async function rejected(label: string, query: string, values: unknown[], code: string) {
    await sql.query('SAVEPOINT integrity_check');
    let actual: string | undefined;
    try { await sql.query(query, values); }
    catch (error) { actual = (error as { code: string }).code; }
    finally { await sql.query('ROLLBACK TO SAVEPOINT integrity_check'); }
    assert.equal(actual, code, label);
    console.log(`PASS ${label}`);
  }

  for (const table of ['Project', 'Technology']) {
    const columns = table === 'Technology' ? ', category' : '';
    const value = table === 'Technology' ? ", 'TOOLS'" : '';
    await rejected(`slug único ${table}`, `INSERT INTO "${table}" (id, name, slug, "updatedAt"${columns}) VALUES ($1, $2, $2, now()${value})`, [randomUUID(), slug], '23505');
  }
  await sql.query('INSERT INTO "SecurityLab" (id, title, slug, "updatedAt") VALUES ($1, $2, $2, now())', [randomUUID(), slug]);
  await rejected('slug único SecurityLab', 'INSERT INTO "SecurityLab" (id, title, slug, "updatedAt") VALUES ($1, $2, $2, now())', [randomUUID(), slug], '23505');
  await rejected('relación sin duplicados', 'INSERT INTO "ProjectTechnology" VALUES ($1, $2)', [projectId, technologyId], '23505');
  await rejected('FK proyecto inexistente', 'INSERT INTO "ProjectTechnology" VALUES ($1, $2)', [randomUUID(), technologyId], '23503');
  await rejected('FK tecnología inexistente', 'INSERT INTO "ProjectTechnology" VALUES ($1, $2)', [projectId, randomUUID()], '23503');
  await rejected('tecnología referenciada protegida', 'DELETE FROM "Technology" WHERE id = $1', [technologyId], '23001');
  for (const table of ['ProjectMedia', 'ProjectDeployment']) {
    const columns = table === 'ProjectMedia' ? '"mediaType", url' : 'provider, environment';
    const values = table === 'ProjectMedia' ? "'IMAGE', 'urn:verification'" : "'OTHER', 'DEVELOPMENT'";
    const timestamp = table === 'ProjectDeployment' ? ', "updatedAt"' : '';
    const now = table === 'ProjectDeployment' ? ', now()' : '';
    const query = `INSERT INTO "${table}" (id, "projectId", ${columns}${timestamp}) VALUES ($1, $2, ${values}${now})`;
    await rejected(`FK ${table}`, query, [randomUUID(), randomUUID()], '23503');
    await sql.query(query, [randomUUID(), projectId]);
  }
  await sql.query('DELETE FROM "Project" WHERE id = $1', [projectId]);
  for (const table of ['ProjectTechnology', 'ProjectMedia', 'ProjectDeployment']) {
    assert.equal((await sql.query(`SELECT count(*)::int AS count FROM "${table}" WHERE "projectId" = $1`, [projectId])).rows[0].count, 0);
  }
  console.log('PASS borrado en cascada de relaciones, medios y despliegues');
  if ((await sql.query('SELECT count(*)::int AS count FROM "Profile"')).rows[0].count === 0) {
    await sql.query('INSERT INTO "Profile" (id, "fullName", "professionalTitle", "updatedAt") VALUES ($1, $2, $2, now())', [randomUUID(), 'verification']);
  }
  await rejected('perfil principal único', 'INSERT INTO "Profile" (id, "fullName", "professionalTitle", "updatedAt") VALUES ($1, $2, $2, now())', [randomUUID(), 'verification'], '23505');
  await rejected('slot de perfil no eludible', 'INSERT INTO "Profile" (id, singleton, "fullName", "professionalTitle", "updatedAt") VALUES ($1, false, $2, $2, now())', [randomUUID(), 'verification'], '23514');
  await rejected('UUID válido', 'INSERT INTO "Project" (id, name, slug, "updatedAt") VALUES ($1, $2, $2, now())', ['invalid', randomUUID()], '22P02');
  await rejected('intervalo de proyecto válido', 'INSERT INTO "Project" (id, name, slug, "startedAt", "completedAt", "updatedAt") VALUES ($1, $2, $2, DATE \'2026-02-02\', DATE \'2026-01-01\', now())', [randomUUID(), randomUUID()], '23514');
  await rejected('intervalo laboral válido', 'INSERT INTO "Experience" (id, organization, position, "startedAt", "endedAt", "updatedAt") VALUES ($1, $2, $2, DATE \'2026-02-02\', DATE \'2026-01-01\', now())', [randomUUID(), 'verification'], '23514');
  await rejected('experiencia actual sin fecha de fin', 'INSERT INTO "Experience" (id, organization, position, "startedAt", "endedAt", "isCurrent", "updatedAt") VALUES ($1, $2, $2, DATE \'2026-01-01\', DATE \'2026-02-02\', true, now())', [randomUUID(), 'verification'], '23514');
  await rejected('intervalo académico válido', 'INSERT INTO "Education" (id, institution, degree, "startedAt", "completedAt", "updatedAt") VALUES ($1, $2, $2, DATE \'2026-02-02\', DATE \'2026-01-01\', now())', [randomUUID(), 'verification'], '23514');
  await rejected('vencimiento de certificación válido', 'INSERT INTO "Certification" (id, name, issuer, "issuedAt", "expiresAt", "updatedAt") VALUES ($1, $2, $2, DATE \'2026-02-02\', DATE \'2026-01-01\', now())', [randomUUID(), 'verification'], '23514');
  await rejected('estado enumerado', 'INSERT INTO "Project" (id, name, slug, status, "updatedAt") VALUES ($1, $2, $2, \'INVALID\', now())', [randomUUID(), randomUUID()], '22P02');
  console.log('Todas las verificaciones de integridad pasaron. Fixtures revertidos al salir.');
} finally {
  await sql.query('ROLLBACK').catch(() => {});
  await sql.end();
  await db.$disconnect();
}
