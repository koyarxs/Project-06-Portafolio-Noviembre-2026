import { existsSync } from 'node:fs';
import { dirname, join, parse } from 'node:path';

export interface Environment {
  NODE_ENV: 'development' | 'test' | 'production';
  API_HOST: string;
  API_PORT: number;
  CORS_ORIGINS: string[];
  DATABASE_URL: string;
  API_RATE_LIMIT: number;
}

export function validateEnvironment(input: Record<string, unknown>): Environment {
  const mode = input.NODE_ENV ?? 'development';
  if (!['development', 'test', 'production'].includes(String(mode))) {
    throw new Error('Invalid configuration: NODE_ENV');
  }
  const rawPort = input.API_PORT ?? '3001';
  const port = Number(rawPort);
  if (!/^\d+$/.test(String(rawPort)) || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Invalid configuration: API_PORT');
  }
  const host = input.API_HOST ?? '127.0.0.1';
  if (!['127.0.0.1', '0.0.0.0', '::1', '::'].includes(String(host))) {
    throw new Error('Invalid configuration: API_HOST');
  }
  const database = String(input.DATABASE_URL ?? '');
  try {
    const url = new URL(database);
    if (!['postgresql:', 'postgres:'].includes(url.protocol) || !url.hostname ||
      !url.username || !url.password || url.pathname.length < 2 || url.hash) throw new Error();
  } catch { throw new Error('Invalid configuration: DATABASE_URL'); }

  const rawOrigins = input.CORS_ORIGINS ?? (mode === 'production' ? '' : 'http://localhost:3000');
  const rateLimit = Number(input.API_RATE_LIMIT ?? 120);
  if (!/^\d+$/.test(String(input.API_RATE_LIMIT ?? 120)) || !Number.isInteger(rateLimit) || rateLimit < 1 || rateLimit > 1000) {
    throw new Error('Invalid configuration: API_RATE_LIMIT');
  }
  const origins = String(rawOrigins).split(',').map(origin => origin.trim());
  try {
    if (origins.some(origin => {
      const url = new URL(origin);
      return origin.includes('*') || !['http:', 'https:'].includes(url.protocol) || url.origin !== origin ||
        url.username !== '' || url.password !== '' || (mode === 'production' && url.protocol !== 'https:');
    })) throw new Error();
  } catch { throw new Error('Invalid configuration: CORS_ORIGINS'); }
  return {
    NODE_ENV: mode as Environment['NODE_ENV'], API_HOST: String(host), API_PORT: port,
    CORS_ORIGINS: [...new Set(origins)], DATABASE_URL: database, API_RATE_LIMIT: rateLimit,
  };
}

// Admite los comandos npm desde la raíz o el workspace y el build compilado.
export function environmentFiles(): string[] {
  let root = process.cwd();
  while (!existsSync(join(root, 'prisma.config.ts'))) {
    if (root === parse(root).root) throw new Error('Repository root not found');
    root = dirname(root);
  }
  const mode = process.env.NODE_ENV ?? 'development';
  return [join(root, `.env.${mode}`), join(root, '.env')];
}
