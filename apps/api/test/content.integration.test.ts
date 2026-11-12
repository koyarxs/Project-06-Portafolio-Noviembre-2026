import 'reflect-metadata';
import assert from 'node:assert/strict';
import { before, after, describe, it } from 'node:test';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Prisma } from '../../../generated/prisma/client.ts';
import { AppModule } from '../src/app.module.ts';
import { configureApp } from '../src/configure-app.ts';
import { PrismaService } from '../src/prisma/prisma.service.ts';
import { validateEnvironment } from '../src/config/environment.ts';
import { createIsolatedDatabase } from './isolated-database.ts';

Logger.overrideLogger(false);
type Item = Record<string, unknown>;
interface Page { data: Item[]; meta: { page: number; limit: number; total: number; totalPages: number } }

describe('public portfolio HTTP API, isolated PostgreSQL fixtures', { concurrency: false }, () => {
  let isolated: Awaited<ReturnType<typeof createIsolatedDatabase>>;
  let app: NestExpressApplication;
  let baseUrl: string;
  async function createApp(overrides: Record<string, unknown> = {}, prisma?: unknown) {
    const config = validateEnvironment({
      NODE_ENV: 'test', DATABASE_URL: isolated.connectionString, API_RATE_LIMIT: '120', ...overrides,
    });
    const builder = Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ConfigService).useValue(new ConfigService(config));
    if (prisma) builder.overrideProvider(PrismaService).useValue(prisma);
    const module = await builder.compile();
    const application = module.createNestApplication<NestExpressApplication>({ bodyParser: false, logger: false });
    configureApp(application);
    await application.listen(0, '127.0.0.1');
    return application;
  }
  const get = async (path: string, status = 200): Promise<Item> => {
    const response = await fetch(`${baseUrl}/api/v1${path}`);
    assert.equal(response.status, status, path);
    return await response.json() as Item;
  };
  const page = async (path: string) => await get(path) as unknown as Page;

  before(async () => {
    assert.ok(process.env.DATABASE_URL, 'Existing local DATABASE_URL required');
    isolated = await createIsolatedDatabase(process.env.DATABASE_URL);
    const db = isolated.db;
    await db.profile.create({ data: { fullName: 'Fixture Owner', professionalTitle: 'Fixture Engineer', email: 'private@example.invalid', biography: 'Public fixture biography' } });
    const react = await db.technology.create({ data: { name: 'Fixture React', slug: 'react', category: 'FRONTEND', isFeatured: true } });
    const ts = await db.technology.create({ data: { name: 'Fixture TypeScript', slug: 'typescript', category: 'TOOLS' } });
    const pg = await db.technology.create({ data: { name: 'Fixture PostgreSQL', slug: 'postgresql', category: 'DATABASE' } });
    const alpha = await db.project.create({ data: {
      name: 'Fixture Alpha', slug: 'alpha', isPublished: true, isFeatured: true,
      status: 'COMPLETED', projectType: 'PERSONAL', summary: 'Controlled test fixture', sortOrder: 0,
      technologies: { create: [{ technologyId: react.id }, { technologyId: ts.id }] },
      media: { create: [
        { mediaType: 'DIAGRAM', url: 'https://example.invalid/diagram.svg', sortOrder: 2 },
        { mediaType: 'IMAGE', url: 'https://example.invalid/image.png', altText: 'Fixture image', sortOrder: 1 },
      ] },
      deployments: { create: [
        { provider: 'VERCEL', environment: 'PRODUCTION', deploymentStatus: 'ACTIVE', deploymentUrl: 'https://public.example.invalid', region: 'private-region' },
        { provider: 'AWS', environment: 'PRODUCTION', deploymentStatus: 'PLANNED', deploymentUrl: 'https://planned.example.invalid' },
        { provider: 'AWS', environment: 'STAGING', deploymentStatus: 'ACTIVE', deploymentUrl: 'https://staging.internal.invalid' },
        { provider: 'OTHER', environment: 'PRODUCTION', deploymentStatus: 'FAILED' },
      ] },
    } });
    assert.ok(alpha.id);
    await db.project.create({ data: { name: 'Fixture Beta', slug: 'beta', isPublished: true, status: 'IN_DEVELOPMENT', projectType: 'OPEN_SOURCE', sortOrder: 0, technologies: { create: { technologyId: ts.id } } } });
    await db.project.create({ data: { name: 'Fixture Gamma', slug: 'gamma', isPublished: true, status: 'COMPLETED', projectType: 'PERSONAL', sortOrder: 1, technologies: { create: { technologyId: pg.id } } } });
    await db.project.create({ data: { name: 'Private Fixture', slug: 'private-project', isPublished: false, sortOrder: -1, summary: 'private-project-secret' } });
    await db.experience.create({ data: { organization: 'Fixture Organization', position: 'Fixture Role', startedAt: new Date('2020-01-01'), sortOrder: 1 } });
    await db.experience.create({ data: { organization: 'Fixture First', position: 'Fixture Role', startedAt: new Date('2021-01-01'), sortOrder: 0 } });
    await db.education.create({ data: { institution: 'Fixture Institution', degree: 'Fixture Degree', startedAt: new Date('2020-01-01') } });
    await db.certification.create({ data: { name: 'Fixture Credential', issuer: 'Fixture Issuer', issuedAt: new Date('2022-01-01') } });
    await db.securityLab.create({ data: { title: 'Public Fixture Lab', slug: 'public-lab', isPublished: true, status: 'COMPLETED', findings: 'internal-findings-secret', reportUrl: 'https://example.invalid/public-report', toolsUsed: ['Fixture tool'] } });
    await db.securityLab.create({ data: { title: 'Private Fixture Lab', slug: 'private-lab', isPublished: false, reportUrl: 'https://private.internal.invalid' } });
    await db.contactMessage.create({ data: { senderName: 'Fixture Sender', senderEmail: 'sender@example.invalid', subject: 'Fixture', message: 'contact-message-secret' } });
    app = await createApp();
    baseUrl = await app.getUrl();
  });
  after(async () => { try { await app?.close(); } finally { await isolated?.close(); } });

  it('returns only allowlisted public profile fields', async () => {
    const profile = (await get('/profile')).data as Item;
    assert.equal(profile.fullName, 'Fixture Owner');
    for (const field of ['email', 'id', 'singleton', 'createdAt', 'updatedAt']) assert.ok(!(field in profile));
    assert.ok(!JSON.stringify(profile).includes('private@example.invalid'));
  });
  it('paginates published projects and applies stable ordering across equal sortOrder', async () => {
    const first = await page('/projects?limit=2');
    assert.deepEqual(first.data.map(p => p.slug), ['alpha', 'beta']);
    assert.deepEqual(first.meta, { page: 1, limit: 2, total: 3, totalPages: 2 });
    assert.deepEqual((await page('/projects?page=2&limit=2')).data.map(p => p.slug), ['gamma']);
    assert.deepEqual((await page('/projects?page=99&limit=2')).data, []);
    assert.ok(!JSON.stringify(first).includes('private-project-secret'));
    assert.ok(!('id' in first.data[0]));
  });
  it('combines status, type, technology and explicit featured filters', async () => {
    assert.deepEqual((await page('/projects?status=COMPLETED&type=PERSONAL&technology=react&featured=true')).data.map(p => p.slug), ['alpha']);
    assert.deepEqual((await page('/projects?featured=false&technology=typescript')).data.map(p => p.slug), ['beta']);
    assert.equal((await page('/projects?technology=unknown-tech')).meta.total, 0);
  });
  it('returns detail with flattened technologies, ordered media and only active production deployments', async () => {
    const detail = (await get('/projects/alpha')).data as Item;
    assert.deepEqual((detail.technologies as Item[]).map(t => t.slug), ['react', 'typescript']);
    assert.deepEqual((detail.media as Item[]).map(m => m.mediaType), ['IMAGE', 'DIAGRAM']);
    const deployments = detail.deployments as Item[];
    assert.equal(deployments.length, 1);
    assert.equal(deployments[0].deploymentStatus, 'ACTIVE');
    for (const field of ['region', 'environment', 'id', 'projectId', 'createdAt']) assert.ok(!(field in deployments[0]));
    assert.ok(!JSON.stringify(detail).includes('internal.invalid'));
    assert.ok(!JSON.stringify(detail).includes('planned.example'));
  });
  it('uses indistinguishable 404s for private and nonexistent projects', async () => {
    assert.deepEqual(await get('/projects/private-project', 404), await get('/projects/missing', 404));
  });
  it('serves technologies with category, featured and detail validation', async () => {
    assert.deepEqual((await page('/technologies?category=FRONTEND&featured=true')).data.map(t => t.slug), ['react']);
    assert.equal(((await get('/technologies/typescript')).data as Item).name, 'Fixture TypeScript');
    await get('/technologies/missing', 404);
    assert.equal((await page('/technologies?featured=false')).meta.total, 2);
  });
  it('serves professional history in paginated deterministic responses', async () => {
    const experience = await page('/experience?limit=1');
    assert.equal(experience.data[0].organization, 'Fixture First');
    assert.equal(experience.meta.total, 2);
    assert.equal((await page('/education')).data[0].institution, 'Fixture Institution');
    assert.equal((await page('/certifications')).data[0].name, 'Fixture Credential');
  });
  it('exposes only published laboratory documentation without internal findings', async () => {
    assert.deepEqual((await page('/security-labs?status=COMPLETED')).data.map(l => l.slug), ['public-lab']);
    const detail = (await get('/security-labs/public-lab')).data as Item;
    assert.equal(detail.reportUrl, 'https://example.invalid/public-report');
    assert.ok(!('findings' in detail));
    assert.ok(!('isPublished' in detail));
    await get('/security-labs/private-lab', 404);
    await get('/security-labs/missing', 404);
  });
  it('rejects invalid, duplicate and unknown query parameters with 400 instead of 500', async () => {
    for (const path of [
      '/projects?page=0', '/projects?limit=101', '/projects?page=1.5', '/projects?page=1e3',
      '/projects?featured=yes', '/projects?featured=true&featured=false', '/projects?page=1&page=2',
      '/projects?status=INVALID', '/projects?type=INVALID', '/projects?technology=Invalid%20Slug',
      '/projects?isPublished=false', '/projects?sort=arbitrary', '/projects/INVALID_SLUG',
      '/technologies?category=INVALID', '/technologies?featured=1',
      '/security-labs?status=INVALID', '/security-labs/Invalid', '/experience?limit=-1',
      '/education?unknown=true', '/certifications?page=100001', '/profile?email=true',
      '/projects/alpha?include=private', '/technologies/react?include=internal',
    ]) assert.equal((await get(path, 400)).status, 'error');
  });
  it('has no contact-message or public write endpoints', async () => {
    await get('/contact-messages', 404);
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      const response = await fetch(`${baseUrl}/api/v1/projects`, { method });
      assert.equal(response.status, 404);
    }
  });
  it('documents all endpoints, queries, response DTOs and expected errors in OpenAPI', async () => {
    const response = await fetch(`${baseUrl}/api/v1/docs-json`);
    assert.equal(response.status, 200);
    const spec = await response.json() as { paths: Record<string, { get: { parameters: { name: string }[]; responses: Item } }>; components: { schemas: Item } };
    for (const path of ['/profile', '/projects', '/projects/{slug}', '/technologies', '/technologies/{slug}', '/experience', '/education', '/certifications', '/security-labs', '/security-labs/{slug}']) {
      assert.ok(spec.paths[`/api/v1${path}`]?.get, path);
      assert.ok(spec.paths[`/api/v1${path}`].get.responses['429']);
    }
    assert.ok(spec.paths['/api/v1/projects'].get.parameters.some(p => p.name === 'technology'));
    assert.ok(spec.components.schemas.ProjectDetailResponseDto);
    assert.ok(!spec.paths['/api/v1/contact-messages']);
    assert.equal((await fetch(`${baseUrl}/api/v1/docs`)).status, 200);
  });
  it('disables Swagger UI and raw documents in production', async () => {
    const production = await createApp({ NODE_ENV: 'production', CORS_ORIGINS: 'https://example.com' });
    try {
      for (const path of ['docs', 'docs-json', 'docs-yaml']) {
        assert.equal((await fetch(`${await production.getUrl()}/api/v1/${path}`)).status, 404);
      }
    } finally { await production.close(); }
  });
  it('rate-limits public routes, returns 429 and Retry-After without trusting forwarded IPs', async () => {
    const limited = await createApp({ API_RATE_LIMIT: '2' });
    try {
      const url = `${await limited.getUrl()}/api/v1/projects`;
      assert.equal((await fetch(url)).status, 200);
      assert.equal((await fetch(url)).status, 200);
      const denied = await fetch(url, { headers: { 'X-Forwarded-For': '203.0.113.99' } });
      assert.equal(denied.status, 429);
      assert.ok(denied.headers.get('retry-after'));
      assert.equal((await denied.json() as { error: { message: string } }).error.message, 'Too many requests');
    } finally { await limited.close(); }
  });
  it('returns sanitized 503 for infrastructure failures and 500 for unknown errors', async () => {
    for (const [error, status] of [
      [new Prisma.PrismaClientKnownRequestError('database-private-token', { code: 'P1001', clientVersion: '7.10.1' }), 503],
      [new Error('database-private-token'), 500],
    ] as const) {
      const failed = await createApp({}, { client: { profile: { findUnique: () => { throw error; } } } });
      try {
        const response = await fetch(`${await failed.getUrl()}/api/v1/profile`);
        assert.equal(response.status, status);
        assert.ok(!(await response.text()).includes('database-private-token'));
      } finally { await failed.close(); }
    }
  });
});
