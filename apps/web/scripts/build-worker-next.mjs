import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const build = spawnSync(process.execPath, [require.resolve('next/dist/bin/next'), 'build', '--webpack'], {
  env: { ...process.env, PORTFOLIO_WORKER_BUILD: '1' },
  stdio: 'inherit',
});

if (build.error) throw build.error;
process.exitCode = build.status ?? 1;
