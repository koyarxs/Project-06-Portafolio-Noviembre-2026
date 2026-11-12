import 'dotenv/config';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { setTimeout } from 'node:timers/promises';

const entrypoint = fileURLToPath(new URL('../dist/apps/api/src/main.js', import.meta.url));
const reserve = createServer();
reserve.listen(0, '127.0.0.1');
await once(reserve, 'listening');
const port = reserve.address().port;
reserve.close();
await once(reserve, 'close');
const env = {
  ...process.env, NODE_ENV: 'production', API_HOST: '127.0.0.1', API_PORT: String(port),
  CORS_ORIGINS: 'https://example.com',
};
const child = spawn(process.execPath, [entrypoint], { env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
const finished = once(child, 'exit');
let logs = '';
child.stdout.on('data', data => { logs += data.toString(); });
child.stderr.on('data', data => { logs += data.toString(); });
try {
  let live = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (child.exitCode !== null) throw new Error('Production executable exited before health check');
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/v1/health?token=smoke-private-token`, { signal: AbortSignal.timeout(500) });
      live = response.status === 200;
    } catch { /* El socket aún puede no estar escuchando. */ }
    if (live) break;
    await setTimeout(100);
  }
  assert.ok(live, 'Production health must return 200');
  const ready = await fetch(`http://127.0.0.1:${port}/api/v1/health/ready`, { signal: AbortSignal.timeout(7_000) });
  assert.equal(ready.status, 200);
  assert.deepEqual(await ready.json(), { status: 'ok' });
  const projects = await fetch(`http://127.0.0.1:${port}/api/v1/projects`, { signal: AbortSignal.timeout(7_000) });
  assert.equal(projects.status, 200);
  const listing = await projects.json();
  assert.ok(Array.isArray(listing.data));
  assert.equal(typeof listing.meta.total, 'number');
  for (const path of ['docs', 'docs-json', 'docs-yaml']) {
    assert.equal((await fetch(`http://127.0.0.1:${port}/api/v1/${path}`)).status, 404);
  }
  await setTimeout(50);
} finally {
  child.kill('SIGTERM');
  await finished;
}
const entries = logs.trim().split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
assert.ok(entries.length > 0);
assert.ok(!logs.includes('smoke-private-token'), 'HTTP query must not appear in logs');
const password = new URL(process.env.DATABASE_URL).password;
assert.ok(!password || !logs.includes(password), 'Database password must not appear in logs');
console.log('PASS producción: health y readiness 200, API pública 200, Swagger 404, logs JSON sin secretos');

const invalid = spawnSync(process.execPath, [entrypoint], {
  env: { ...env, DATABASE_URL: 'invalid-database-private-token' }, encoding: 'utf8',
  timeout: 10_000, windowsHide: true,
});
assert.equal(invalid.status, 1);
assert.ok(!(invalid.stdout + invalid.stderr).includes('invalid-database-private-token'));
const errorEntries = (invalid.stdout + invalid.stderr).trim().split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
assert.ok(errorEntries.some(entry => entry.message?.event === 'startup_failed'));
console.log('PASS configuración inválida: salida 1 y error de arranque sanitizado');
