import 'dotenv/config';
import { createDatabaseClient } from '../packages/database/src/client.ts';
import type { TechnologyCategory } from '../generated/prisma/enums.ts';

const technologies: [string, string, TechnologyCategory][] = [
  ['HTML5', 'html5', 'FRONTEND'],
  ['CSS3', 'css3', 'FRONTEND'],
  ['JavaScript', 'javascript', 'FRONTEND'],
  ['TypeScript', 'typescript', 'TOOLS'],
  ['React', 'react', 'FRONTEND'],
  ['Next.js', 'nextjs', 'FRONTEND'],
  ['Node.js', 'nodejs', 'BACKEND'],
  ['NestJS', 'nestjs', 'BACKEND'],
  ['Express.js', 'expressjs', 'BACKEND'],
  ['Tailwind CSS', 'tailwind-css', 'FRONTEND'],
  ['PostgreSQL', 'postgresql', 'DATABASE'],
  ['MongoDB', 'mongodb', 'DATABASE'],
  ['Prisma', 'prisma', 'ORM'],
  ['Docker', 'docker', 'DEVOPS'],
  ['Git', 'git', 'TOOLS'],
  ['GitHub', 'github', 'TOOLS'],
  ['Jest', 'jest', 'TESTING'],
  ['Vitest', 'vitest', 'TESTING'],
  ['Playwright', 'playwright', 'TESTING'],
  ['GitHub Actions', 'github-actions', 'DEVOPS'],
];

const projects = [
  ['FraudShield', 'fraudshield'],
  ['FlyMaster', 'flymaster'],
  ['Pawly', 'pawly'],
  ['Zenvik', 'zenvik'],
  ['Falta Uno', 'falta-uno'],
];

export async function seedDatabase() {
  const db = createDatabaseClient();
  try {
    await db.$transaction(async (tx) => {
      for (const [sortOrder, [name, slug, category]] of technologies.entries()) {
        await tx.technology.upsert({
          where: { slug }, update: {}, create: { name, slug, category, sortOrder },
        });
      }
      for (const [sortOrder, [name, slug]] of projects.entries()) {
        await tx.project.upsert({
          where: { slug }, update: {},
          create: { name, slug, status: 'IN_DEVELOPMENT', sortOrder },
        });
      }
    });
  } finally {
    await db.$disconnect();
  }
}

// Separar la función del entrypoint permite verificar idempotencia sin side effects al importar.
if (import.meta.url === (await import('node:url')).pathToFileURL(process.argv[1]).href) {
  await seedDatabase();
  console.log('Seed completado: 20 tecnologías y 5 proyectos preparados (sin sobrescribir ediciones).');
}
