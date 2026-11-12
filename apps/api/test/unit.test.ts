import 'reflect-metadata';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { validateEnvironment } from '../src/config/environment.ts';
import { HealthController } from '../src/health/health.controller.ts';
import { PrismaService } from '../src/prisma/prisma.service.ts';

const base = { DATABASE_URL: 'postgresql://test:unit-secret@127.0.0.1:55432/test' };
describe('environment validation', () => {
  it('provides safe development defaults and parses explicit settings', () => {
    const config = validateEnvironment(base);
    assert.equal(config.API_PORT, 3001);
    assert.equal(config.API_HOST, '127.0.0.1');
    assert.deepEqual(config.CORS_ORIGINS, ['http://localhost:3000']);
    assert.equal(validateEnvironment({ ...base, API_PORT: '4000' }).API_PORT, 4000);
    assert.deepEqual(validateEnvironment({ ...base, CORS_ORIGINS: 'https://example.com, https://other.example' }).CORS_ORIGINS,
      ['https://example.com', 'https://other.example']);
  });
  it('rejects invalid ports, hosts, environment and database without revealing values', () => {
    for (const invalid of [
      { API_PORT: 0 }, { API_PORT: 65536 }, { API_PORT: '3.2' }, { API_PORT: '' },
      { API_HOST: 'arbitrary-host' }, { NODE_ENV: 'unknown' },
      { DATABASE_URL: undefined }, { DATABASE_URL: 'https://user:unit-secret@example.com/db' },
      { DATABASE_URL: 'postgresql://user@localhost/db' },
    ]) {
      assert.throws(() => validateEnvironment({ ...base, ...invalid }), error =>
        error instanceof Error && error.message.startsWith('Invalid configuration:') && !error.message.includes('unit-secret'));
    }
  });
  it('rejects wildcards, credentials, paths and empty CORS origins', () => {
    for (const CORS_ORIGINS of ['*', 'https://*.example.com', '', 'null', 'http://localhost:3000/', 'https://example.com/path',
      'https://user:unit-secret@example.com', 'https://example.com,']) {
      assert.throws(() => validateEnvironment({ ...base, CORS_ORIGINS }), /CORS_ORIGINS/);
    }
  });
  it('requires explicit HTTPS origins in production', () => {
    assert.throws(() => validateEnvironment({ ...base, NODE_ENV: 'production' }), /CORS_ORIGINS/);
    assert.throws(() => validateEnvironment({ ...base, NODE_ENV: 'production', CORS_ORIGINS: 'http://localhost:3000' }), /CORS_ORIGINS/);
    assert.equal(validateEnvironment({ ...base, NODE_ENV: 'production', CORS_ORIGINS: 'https://example.com' }).NODE_ENV, 'production');
  });
});

describe('health controller', () => {
  it('liveness works without touching the database', async () => {
    let called = false;
    const module = await Test.createTestingModule({ controllers: [HealthController], providers: [
      { provide: PrismaService, useValue: { checkConnection: async () => { called = true; } } },
    ] }).compile();
    try {
      assert.deepEqual(module.get(HealthController).health(), { status: 'ok' });
      assert.equal(called, false);
      assert.deepEqual(await module.get(HealthController).ready(), { status: 'ok' });
      assert.equal(called, true);
    } finally { await module.close(); }
  });
  it('readiness converts database errors into a safe 503', async () => {
    const module = await Test.createTestingModule({ controllers: [HealthController], providers: [
      { provide: PrismaService, useValue: { checkConnection: async () => { throw new Error('database-password'); } } },
    ] }).compile();
    try {
      await assert.rejects(module.get(HealthController).ready(), error =>
        error instanceof ServiceUnavailableException && error.getStatus() === 503 &&
        !error.message.includes('database-password'));
    } finally { await module.close(); }
  });
});
