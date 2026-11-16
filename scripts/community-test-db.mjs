import { spawnSync } from 'node:child_process';
import { mkdir,readFile,writeFile,unlink } from 'node:fs/promises';
import { resolve,join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { createServer } from 'node:net';
import pg from 'pg';
const root = resolve(import.meta.dirname,'..');
const folder = join(root,'.data','community-test-db');
const cluster = join(folder,'cluster');
const bin = process.env.POSTGRES_BIN ?? 'C:/Program Files/PostgreSQL/18/bin';
const statePath = join(folder,'state.json');
function run(file,args,env=process.env) {
  const result = spawnSync(file,args,{ cwd:root,env,encoding:'utf8',windowsHide:true,...(file.endsWith('pg_ctl.exe') ? { stdio:'ignore' } : {}) });
  if (result.status !== 0) { console.error((result.stderr ?? '').replace(/postgres(?:ql)?:\/\/[^\s]+/g,'[redacted database URL]')); throw new Error(`Command failed: ${file}`); }
  return result.stdout ?? '';
}
let state;
try { state = JSON.parse(await readFile(statePath,'utf8')); } catch { /* First isolated run. */ }
if (process.argv.includes('--stop')) {
  if (state) run(join(bin,'pg_ctl.exe'),['-D',cluster,'-m','fast','-w','stop']);
  console.log('Stopped isolated community test database.');
} else {
  await mkdir(folder,{ recursive:true });
  if (!state) {
    const server = createServer(); await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
    const port = server.address().port; await new Promise(resolve => server.close(resolve));
    state = { port,password:randomBytes(32).toString('hex') };
    const passwordFile = join(folder,'password.tmp');
    await writeFile(passwordFile,state.password,{ mode:0o600 });
    try { run(join(bin,'initdb.exe'),['-D',cluster,'-U','portfolio_verify','--auth=scram-sha-256',`--pwfile=${passwordFile}`,'--encoding=UTF8','--locale=C']); }
    finally { await unlink(passwordFile).catch(() => undefined); }
    await writeFile(statePath,JSON.stringify(state),{ mode:0o600 });
  }
  const status = spawnSync(join(bin,'pg_ctl.exe'),['-D',cluster,'status'],{ windowsHide:true });
  if (status.status !== 0) run(join(bin,'pg_ctl.exe'),['-D',cluster,'-l',join(folder,'postgres.log'),'-o',`-p ${state.port} -h 127.0.0.1`,'-w','start']);
  const database = new pg.Client({ host:'127.0.0.1',port:state.port,user:'portfolio_verify',password:state.password,database:'postgres',connectionTimeoutMillis:5000 });
  await database.connect();
  if (!(await database.query("SELECT 1 FROM pg_database WHERE datname='community_verify'")).rowCount) await database.query('CREATE DATABASE community_verify');
  await database.end();
  const url = `postgresql://portfolio_verify:${state.password}@127.0.0.1:${state.port}/community_verify`;
  if (process.argv.includes('--run')) {
    const env = { ...process.env,DATABASE_URL:url,NODE_ENV:'test' };
    console.log('Applying migrations only to isolated verification database.');
    console.log(run(process.execPath,[join(root,'node_modules/prisma/build/index.js'),'migrate','deploy'],env));
    console.log(run(process.execPath,[join(root,'node_modules/typescript/bin/tsc'),'-p','apps/api/tsconfig.test.json'],env));
    const result = spawnSync(process.execPath,['--test',join(root,'dist/test/apps/api/test/integration.test.js'),join(root,'dist/test/apps/api/test/content.integration.test.js'),join(root,'dist/test/apps/api/test/community.integration.test.js')],{ cwd:join(root,'apps/api'),env,stdio:'inherit',windowsHide:true });
    process.exitCode = result.status ?? 1;
  } else console.log('Isolated PostgreSQL ready; existing database configuration untouched.');
}
