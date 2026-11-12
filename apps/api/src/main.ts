import 'reflect-metadata';
import { ConsoleLogger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { configureApp } from './configure-app.ts';
import type { Environment } from './config/environment.ts';

const logger = new ConsoleLogger({ json: true, colors: false,
  logLevels: process.env.NODE_ENV === 'production' ? ['log', 'warn', 'error'] : ['log', 'warn', 'error', 'debug'],
});
let app: NestExpressApplication | undefined;
try {
  // Importación dinámica: también captura errores de validación al cargar ConfigModule.
  const { AppModule } = await import('./app.module.ts');
  app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false, logger, abortOnError: false,
  });
  configureApp(app);
  const config = app.get(ConfigService<Environment, true>);
  await app.listen(config.get('API_PORT', { infer: true }), config.get('API_HOST', { infer: true }));
} catch {
  logger.error({ event: 'startup_failed', message: 'Check application configuration and service availability' });
  await app?.close();
  process.exitCode = 1;
}
