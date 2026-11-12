import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDatabaseClient } from '../../../../packages/database/src/client.ts';
import type { Environment } from '../config/environment.ts';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  readonly client;

  constructor(config: ConfigService<Environment, true>) {
    this.client = createDatabaseClient({
      connectionString: config.get('DATABASE_URL', { infer: true }),
      connectionTimeoutMillis: 2_000,
    });
  }

  async onModuleInit(): Promise<void> {
    try { await this.client.$connect(); }
    catch { this.logger.warn({ event: 'database_unavailable' }); }
  }

  async checkConnection(): Promise<void> {
    await this.client.$queryRaw`SELECT 1`;
  }

  async onModuleDestroy(): Promise<void> { await this.client.$disconnect(); }
}
