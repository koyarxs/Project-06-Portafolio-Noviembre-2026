import { randomBytes } from 'node:crypto';
import { readFile,writeFile } from 'node:fs/promises';
const paths = [new URL('../.env',import.meta.url),new URL('../apps/web/.env.local',import.meta.url)];
const texts = await Promise.all(paths.map(path => readFile(path,'utf8').catch(() => '')));
for (const name of ['COMMUNITY_SIGNING_SECRET','COMMUNITY_ADMIN_TOKEN']) {
  const matches = texts.map(text => text.match(new RegExp(`^${name}=(.+)$`,'m'))?.[1]?.trim()).filter(Boolean);
  if (new Set(matches).size > 1) throw new Error(`Existing ${name} values differ; reconcile privately before continuing.`);
  const secret = matches[0] ?? randomBytes(48).toString('base64url');
  texts.forEach((text,index) => { if (!new RegExp(`^${name}=.+$`,'m').test(text)) texts[index] = `${text.trimEnd()}\n${name}=${secret}\n`; });
}
await Promise.all(paths.map((path,index) => writeFile(path,texts[index],{ mode:0o600 })));
console.log('Local community secrets configured in ignored environment files. No secrets printed.');
