import 'reflect-metadata';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { Controller, Get, Module, Post, Body, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsString } from 'class-validator';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { AppModule } from '../src/app.module.ts';
import { configureApp } from '../src/configure-app.ts';
import { PrismaService } from '../src/prisma/prisma.service.ts';
import { HealthController } from '../src/health/health.controller.ts';
import { validateEnvironment } from '../src/config/environment.ts';

class ProbeDto { @IsString() name!: string; }
// Rutas exclusivas del proceso de pruebas: nunca forman parte de AppModule.
@Controller('_test')
class ProbeController {
  @Get('error') fail() { throw new Error('private-database-secret'); }
  @Post('validation') validate(@Body() body: ProbeDto) { return body; }
}
@Module({ imports: [AppModule], controllers: [ProbeController] })
class TestAppModule {}

Logger.overrideLogger(false);
describe('HTTP integration with existing PostgreSQL', { concurrency: false }, () => {
  let app: NestExpressApplication;
  let baseUrl: string;
  before(async () => {
    const module = await Test.createTestingModule({ imports: [TestAppModule] }).compile();
    app = module.createNestApplication<NestExpressApplication>({ bodyParser: false, logger: false });
    configureApp(app);
    await app.listen(0, '127.0.0.1');
    baseUrl = await app.getUrl();
  });
  after(async () => { await app?.close(); });

  it('initializes AppModule and shares one PrismaService instance', () => {
    assert.ok(app.get(AppModule));
    const prisma = app.get(PrismaService);
    assert.equal(prisma, app.get(PrismaService));
  });
  it('returns 200 for prefixed liveness and real Prisma readiness', async () => {
    for (const path of ['/api/v1/health', '/api/v1/health/ready']) {
      const response = await fetch(`${baseUrl}${path}`);
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { status: 'ok' });
      assert.equal(response.headers.get('x-powered-by'), null);
      assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
      assert.ok(response.headers.get('content-security-policy'));
    }
  });
  it('does not expose unprefixed or unknown routes', async () => {
    for (const path of ['/health', '/api/v1', '/api/v1/', '/api/v1/unknown-route']) {
      const response = await fetch(`${baseUrl}${path}`);
      assert.equal(response.status, 404);
      assert.deepEqual(await response.json(), { status: 'error', error: { code: 'NOT_FOUND', message: 'Not found' } });
    }
  });
  it('allows configured CORS origin and denies other origins', async () => {
    const config = app.get(ConfigService);
    const origin = (config.get('CORS_ORIGINS') as string[])[0];
    const allowed = await fetch(`${baseUrl}/api/v1/health`, { headers: { Origin: origin } });
    assert.equal(allowed.headers.get('access-control-allow-origin'), origin);
    assert.equal(allowed.headers.get('access-control-allow-credentials'), null);
    const preflight = await fetch(`${baseUrl}/api/v1/health`, {
      method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'GET' },
    });
    assert.equal(preflight.status, 204);
    const denied = await fetch(`${baseUrl}/api/v1/health`, { headers: { Origin: 'https://untrusted.invalid' } });
    assert.equal(denied.status, 403);
    assert.equal(denied.headers.get('access-control-allow-origin'), null);
  });
  it('uses a global ValidationPipe to reject unexpected and invalid fields', async () => {
    // Verifica la configuración compartida, sin añadir endpoints al backend real.
    const valid = await fetch(`${baseUrl}/api/v1/_test/validation`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'test' }),
    });
    assert.equal(valid.status, 201);
    for (const body of [{ name: 123 }, { name: 'test', extra: 'private-secret' }]) {
      const response = await fetch(`${baseUrl}/api/v1/_test/validation`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      assert.equal(response.status, 400);
      assert.deepEqual(await response.json(), { status: 'error', error: { code: 'BAD_REQUEST', message: 'Invalid request' } });
    }
  });
  it('bounds JSON and URL-encoded bodies and sanitizes parsing errors', async () => {
    for (const contentType of ['application/json', 'application/x-www-form-urlencoded']) {
      const response = await fetch(`${baseUrl}/api/v1/_test/validation`, {
        method: 'POST', headers: { 'Content-Type': contentType },
        body: contentType === 'application/json' ? JSON.stringify({ name: 'x'.repeat(40_000) }) : `name=${'x'.repeat(40_000)}`,
      });
      assert.equal(response.status, 413);
      assert.equal((await response.json() as { status: string }).status, 'error');
    }
    const malformed = await fetch(`${baseUrl}/api/v1/_test/validation`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{private-secret',
    });
    assert.equal(malformed.status, 400);
    assert.ok(!(await malformed.text()).includes('private-secret'));
  });
  it('sanitizes unexpected exceptions without stack traces', async () => {
    const response = await fetch(`${baseUrl}/api/v1/_test/error`);
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { status: 'error', error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' } });
  });
  it('returns 503 after actual connection failure while keeping liveness operational', async () => {
    // Reservar un puerto TCP sin servicio PostgreSQL evita tocar el contenedor existente.
    // Acepta TCP pero no contesta el handshake: comprobar también el timeout real.
    const unavailable = createServer(socket => socket.resume());
    unavailable.listen(0, '127.0.0.1');
    await once(unavailable, 'listening');
    const address = unavailable.address();
    assert.ok(address && typeof address !== 'string');
    const config = validateEnvironment({
      NODE_ENV: 'production', CORS_ORIGINS: 'https://example.com',
      DATABASE_URL: `postgresql://test:connection-test-secret@127.0.0.1:${address.port}/unavailable`,
    });
    const module = await Test.createTestingModule({
      controllers: [HealthController], providers: [PrismaService,
        { provide: ConfigService, useValue: new ConfigService(config) }],
    }).compile();
    const failedApp = module.createNestApplication<NestExpressApplication>({ bodyParser: false, logger: false });
    try {
      configureApp(failedApp);
      await failedApp.listen(0, '127.0.0.1');
      const url = await failedApp.getUrl();
      assert.equal((await fetch(`${url}/api/v1/health`)).status, 200);
      const response = await fetch(`${url}/api/v1/health/ready`, { signal: AbortSignal.timeout(7_000) });
      assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), { status: 'error', error: { code: 'SERVICE_UNAVAILABLE', message: 'Service unavailable' } });
    } finally {
      await failedApp.close();
      unavailable.close();
      await once(unavailable, 'close');
    }
  });
});
