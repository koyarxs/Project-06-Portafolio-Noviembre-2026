import sharp from 'sharp';
import { sanitizeImage,MAX_IMAGE_BYTES } from '../src/community/community-media.service.ts';
import { signVisitor,verifyVisitor } from '../../../packages/community/src/identity.ts';
import { CommentDto, LikeDto } from '../src/community/community.module.ts';
import { VisitDto, VisitorsService } from '../src/visitors/visitors.module.ts';
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


describe('anonymous visitors', () => {
  it('accepts only UUID v4 visitor identifiers', async () => {
    assert.deepEqual(await validate(plainToInstance(VisitDto, { id: 'ef2479de-647f-4484-b370-9607647c16f0' })), []);
    for (const id of ['', '127.0.0.1', 'person@example.com', 'not-an-id']) {
      assert.ok((await validate(plainToInstance(VisitDto, { id }))).length > 0);
    }
  });
  it('reports unavailable statistics instead of fabricating a count', async () => {
    const service = new VisitorsService({ client: { $transaction: async () => { throw new Error('private connection detail'); } } } as unknown as PrismaService);
    await assert.rejects(() => service.record('ef2479de-647f-4484-b370-9607647c16f0'), error => error instanceof Error && error.message === 'Visitor statistics unavailable');
  });
});


describe('community validation', () => {
  const valid = { name:'  Visitante  ', avatar:'🚀', category:'Opinión general', message:'  Una buena idea para el portafolio.  ',attachmentIds:[] };
  it('trims text and rejects project targeting, invalid categories, attachments and likes', async () => {
    const dto = plainToInstance(CommentDto,valid);
    assert.deepEqual(await validate(dto),[]);
    assert.equal(dto.name,'Visitante');
    assert.equal(dto.message,'Una buena idea para el portafolio.');
    for (const patch of [{ name:' ' },{ name:'x'.repeat(61) },{ avatar:'unknown' },{ category:'Pawly' },{ message:' ' },{ message:'x'.repeat(2001) },{ attachmentIds:['invalid'] },{ attachmentIds:Array(4).fill('ef2479de-647f-4484-b370-9607647c16f0') }]) assert.ok((await validate(plainToInstance(CommentDto,{ ...valid,...patch }))).length > 0);
    assert.ok((await validate(plainToInstance(LikeDto,{ liked:'true' }))).length > 0);
    assert.deepEqual(await validate(plainToInstance(LikeDto,{ liked:false })),[]);
  });
});

describe('signed visitor identity', () => {
  const key = 'test-signing-key-that-is-longer-than-forty-eight-characters';
  const id = 'ef2479de-647f-4484-b370-9607647c16f0';
  it('rejects unsigned, forged, expired and future tokens', () => {
    const now = 1794772800000;
    const token = signVisitor(id,key,now);
    assert.equal(verifyVisitor(token,key,300,now),id);
    assert.equal(verifyVisitor(id,key,300,now),null);
    assert.equal(verifyVisitor(token+'x',key,300,now),null);
    assert.equal(verifyVisitor(token,key,300,now+301000),null);
    assert.equal(verifyVisitor(token,key,300,now-31000),null);
    assert.equal(verifyVisitor(token,'incorrect-key',300,now),null);
  });
});
describe('image validation and metadata removal', () => {
  it('accepts PNG, JPEG and WebP and always outputs metadata-free WebP', async () => {
    for (const [format,mimetype] of [['png','image/png'],['jpeg','image/jpeg'],['webp','image/webp']] as const) {
      const buffer = await sharp({ create:{ width:12,height:10,channels:3,background:'#245f9e' } }).withExif({ IFD0:{ Artist:'Private fixture author' } })[format]().toBuffer();
      const clean = await sanitizeImage({ buffer,mimetype,size:buffer.length });
      const meta = await sharp(clean.buffer).metadata();
      assert.equal(meta.format,'webp'); assert.equal(meta.exif,undefined); assert.equal(meta.xmp,undefined); assert.equal(meta.width,12);
    }
  });
  it('rejects oversized, deceptive, truncated and unsupported files', async () => {
    for (const file of [
      { buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),mimetype:'image/png',size:50 },
      { buffer:Buffer.from([137,80,78,71,13,10,26,10]),mimetype:'image/png',size:8 },
      { buffer:Buffer.alloc(MAX_IMAGE_BYTES+1),mimetype:'image/jpeg',size:MAX_IMAGE_BYTES+1 },
      { buffer:Buffer.from('test'),mimetype:'text/html',size:4 },
    ]) await assert.rejects(() => sanitizeImage(file));
    const png = await sharp({ create:{ width:1,height:1,channels:3,background:'#fff' } }).png().toBuffer();
    await assert.rejects(() => sanitizeImage({ buffer:png,mimetype:'image/jpeg',size:png.length }));
  });
});
