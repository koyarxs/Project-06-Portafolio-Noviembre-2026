import { readFileSync, writeFileSync } from 'node:fs';
import { isIP } from 'node:net';

const nextEnv = new URL('../.open-next/cloudflare/next-env.mjs', import.meta.url);
const builtRobots = new URL('../.open-next/robots.build.txt', import.meta.url);
// OpenNext 1.20 serializes dotenv files from the app and monorepo root into this module.
// Workers receives its configuration through runtime bindings instead.
const emptyEnv = ['production', 'development', 'test'].map(mode => `export const ${mode} = {};\n`).join('');
const compiled = readFileSync(nextEnv, 'utf8');

if (process.argv.includes('--check') || process.argv.includes('--deploy')) {
  if (compiled !== emptyEnv) throw new Error('Unsafe Worker environment module. Rebuild with npm run cf:build.');
  if (process.argv.includes('--deploy')) {
    const siteUrl = URL.parse(process.env.SITE_URL ?? '');
    const host = siteUrl?.hostname ?? '';
    if (!siteUrl || siteUrl.protocol !== 'https:' || siteUrl.origin !== siteUrl.href.slice(0, -1) ||
        !host.includes('.') || isIP(host) || /\.(localhost|local|test|invalid|example)\.?$/i.test(host)) {
      throw new Error('Set SITE_URL to the canonical HTTPS origin before building for deployment.');
    }
    const robots = readFileSync(builtRobots, 'utf8');
    if (!robots.split(/\r?\n/).includes(`Sitemap: ${siteUrl.origin}/sitemap.xml`)) {
      throw new Error('Worker metadata does not match SITE_URL. Rebuild with the production origin.');
    }
  }
} else {
  const exports = [...compiled.matchAll(/^export const (\w+) = /gm)].map(([, mode]) => mode);
  if (exports.join(',') !== 'production,development,test') {
    throw new Error('Unexpected OpenNext environment format. Review the adapter before deploying.');
  }
  writeFileSync(nextEnv, emptyEnv);
  const robots = new URL('../.next/server/app/robots.txt.body', import.meta.url);
  writeFileSync(builtRobots, readFileSync(robots));
}
