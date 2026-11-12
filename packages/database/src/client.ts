import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../generated/prisma/client.ts';

// Cada consumidor controla el ciclo de vida y llama a $disconnect al terminar.
// PrismaService de NestJS utiliza esta fábrica y la desconecta en onModuleDestroy.
export function createDatabaseClient(options: {
  connectionString?: string;
  connectionTimeoutMillis?: number;
} = {}): PrismaClient {
  const connectionString = options.connectionString ?? process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is required');
  const schema = new URL(connectionString).searchParams.get('schema') ?? 'public';
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      connectionTimeoutMillis: options.connectionTimeoutMillis ?? 5_000,
      max: 5,
      idleTimeoutMillis: 10_000,
      statement_timeout: 2_000,
      query_timeout: 2_500,
    }, { schema }),
    log: [],
  });
}
