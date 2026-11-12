import 'reflect-metadata';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../src/prisma/prisma.service.ts';
import { ProjectsService } from '../src/projects/projects.service.ts';
import { ProjectResourcesService } from '../src/projects/project-resources.service.ts';
import { ProfileService } from '../src/profile/profile.service.ts';
import { TechnologiesService } from '../src/technologies/technologies.service.ts';
import { SecurityLabsService } from '../src/security-labs/security-labs.service.ts';
import { ProjectsQueryDto, TechnologiesQueryDto, SlugParamDto } from '../src/common/query.dto.ts';
import { validateEnvironment } from '../src/config/environment.ts';

describe('content validation', () => {
  it('parses only explicit booleans and bounded decimal integers', async () => {
    const query = plainToInstance(ProjectsQueryDto, { featured: 'false', page: '2', limit: '10' });
    assert.deepEqual(await validate(query), []);
    assert.equal(query.featured, false);
    assert.equal(query.page, 2);
    for (const input of [
      { featured: 'yes' }, { featured: '1' }, { page: '1.5' }, { page: '1e2' },
      { page: '-1' }, { page: '100001' }, { limit: '101' }, { limit: '0' },
      { status: 'active' }, { type: 'arbitrary' }, { technology: 'Invalid Slug' },
      { featured: ['true', 'false'] },
    ]) assert.ok((await validate(plainToInstance(ProjectsQueryDto, input))).length > 0);
  });
  it('validates category, slug and rate-limit configuration', async () => {
    assert.ok((await validate(plainToInstance(TechnologiesQueryDto, { category: 'INVALID' }))).length);
    assert.ok((await validate(plainToInstance(SlugParamDto, { slug: 'X<script>' }))).length);
    assert.deepEqual(await validate(plainToInstance(SlugParamDto, { slug: 'falta-uno' })), []);
    for (const API_RATE_LIMIT of ['0', '-1', '1001', '1.5', 'bad']) {
      assert.throws(() => validateEnvironment({ DATABASE_URL: 'postgresql://unit:unit@localhost/unit', API_RATE_LIMIT }), /API_RATE_LIMIT/);
    }
  });
});

describe('public query policy', () => {
  it('enforces publication and all filters in count and data with stable bounded pagination', async () => {
    const captured: Record<string, unknown>[] = [];
    const mock = { client: {
      project: {
        findMany: (args: Record<string, unknown>) => { captured.push(args); return Promise.resolve([]); },
        count: (args: Record<string, unknown>) => { captured.push(args); return Promise.resolve(3); },
      },
      $transaction: (queries: Promise<unknown>[]) => Promise.all(queries),
    } } as unknown as PrismaService;
    const query = plainToInstance(ProjectsQueryDto, { page: '2', limit: '2', status: 'COMPLETED', type: 'PERSONAL', technology: 'typescript', featured: 'false' });
    const result = await new ProjectsService(mock, new ProjectResourcesService()).list(query);
    assert.deepEqual(captured[0].where, {
      isPublished: true, status: 'COMPLETED', projectType: 'PERSONAL', isFeatured: false,
      technologies: { some: { technology: { slug: 'typescript' } } },
    });
    assert.deepEqual(captured[0].where, captured[1].where);
    assert.equal(captured[0].take, 2);
    assert.equal(captured[0].skip, 2);
    assert.deepEqual(captured[0].orderBy, [{ sortOrder: 'asc' }, { slug: 'asc' }]);
    assert.deepEqual(result.meta, { page: 2, limit: 2, total: 3, totalPages: 2 });
  });
  it('hides missing profile, technologies, private projects and private laboratories with 404', async () => {
    const args: Record<string, unknown>[] = [];
    const missing = (input: Record<string, unknown>) => { args.push(input); return Promise.resolve(null); };
    const prisma = { client: {
      profile: { findUnique: missing }, technology: { findUnique: missing },
      project: { findFirst: missing }, securityLab: { findFirst: missing },
    } } as unknown as PrismaService;
    await assert.rejects(new ProfileService(prisma).get(), NotFoundException);
    await assert.rejects(new TechnologiesService(prisma).get('missing'), NotFoundException);
    await assert.rejects(new ProjectsService(prisma, new ProjectResourcesService()).get('private-project'), NotFoundException);
    await assert.rejects(new SecurityLabsService(prisma).get('private-lab'), NotFoundException);
    assert.deepEqual(args[2].where, { slug: 'private-project', isPublished: true });
    assert.deepEqual(args[3].where, { slug: 'private-lab', isPublished: true });
    assert.equal((args[0].select as Record<string, unknown>).email, undefined);
    assert.equal((args[3].select as Record<string, unknown>).findings, undefined);
  });
});
