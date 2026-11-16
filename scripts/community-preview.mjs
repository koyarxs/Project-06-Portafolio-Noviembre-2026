import 'dotenv/config';
import { readFile,mkdir } from 'node:fs/promises';
import { resolve,join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
const root = resolve(import.meta.dirname,'..');
const state = JSON.parse(await readFile(join(root,'.data/community-test-db/state.json'),'utf8'));
process.chdir(join(root,'apps/api'));
const { createIsolatedDatabase } = await import('../dist/test/apps/api/test/isolated-database.js');
const isolated = await createIsolatedDatabase(`postgresql://portfolio_verify:${state.password}@127.0.0.1:${state.port}/community_verify`);
const uploads = join(root,'.data','community-preview-images'); await mkdir(uploads,{ recursive:true });
const portProbe = createServer(); await new Promise(resolve => portProbe.listen(0,'127.0.0.1',resolve));
const apiPort = portProbe.address().port; await new Promise(resolve => portProbe.close(resolve));
const api = spawn(process.execPath,[join(root,'dist/apps/api/src/main.js')],{ cwd:root,env:{ ...process.env,NODE_ENV:'test',API_PORT:String(apiPort),DATABASE_URL:isolated.connectionString,COMMUNITY_UPLOAD_DIR:uploads,CORS_ORIGINS:'http://127.0.0.1:3103' },stdio:'ignore',windowsHide:true });
const readyDeadline = Date.now()+30000;
let ready = false;
while (Date.now() < readyDeadline) {
  if (api.exitCode !== null) throw new Error('Isolated API exited before readiness.');
  try { if ((await fetch(`http://127.0.0.1:${apiPort}/api/v1/health/ready`,{ signal:AbortSignal.timeout(3000) })).ok) { ready = true; break; } } catch { /* Wait for the isolated API only. */ }
  await delay(250);
}
if (!ready) { api.kill(); await isolated.close(); throw new Error('Isolated API not ready.'); }
const web = spawn(process.execPath,[join(root,'node_modules/next/dist/bin/next'),'start','--hostname','127.0.0.1','--port','3103'],{ cwd:join(root,'apps/web'),env:{ ...process.env,PORTFOLIO_API_URL:`http://127.0.0.1:${apiPort}/api/v1`,SITE_URL:'http://127.0.0.1:3103' },stdio:'inherit',windowsHide:true });
let closing = false;
async function close() { if (closing) return; closing = true; web.kill(); api.kill(); await isolated.close(); process.exit(0); }
process.on('SIGINT',() => { void close(); }); process.on('SIGTERM',() => { void close(); });
web.on('exit',() => { void close(); });
console.log('Isolated community preview: http://127.0.0.1:3103/#comentarios — test data only.');

process.stdin.setEncoding('utf8');
process.stdin.on('data',input => { if (input.trim() === 'stop') void close(); });
