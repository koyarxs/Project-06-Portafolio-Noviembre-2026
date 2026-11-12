import { ForbiddenException, NotFoundException, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import type { Request, Response, NextFunction } from 'express';
import { performance } from 'node:perf_hooks';
import type { Environment } from './config/environment.ts';
import { HttpExceptionFilter } from './common/http-exception.filter.ts';
import { configureOpenApi } from './openapi.ts';

export function configureApp(app: NestExpressApplication): void {
  const config = app.get(ConfigService<Environment, true>);
  const logger = new Logger('HTTP');
  app.disable('x-powered-by');
  app.use(helmet());
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = performance.now();
    res.on('finish', () => logger.log({
      event: 'http_request', method: req.method, statusCode: res.statusCode,
      durationMs: Math.round(performance.now() - start),
    }));
    // No se registran URL, query, cabeceras ni cuerpos que puedan contener secretos.
    next();
  });
  const origins = config.get('CORS_ORIGINS', { infer: true });
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || origins.includes(origin)) callback(null, true);
      else callback(new ForbiddenException(), false);
    },
    methods: ['GET', 'HEAD', 'OPTIONS'], allowedHeaders: ['Content-Type'],
    exposedHeaders: ['Retry-After', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    credentials: false, maxAge: 600,
  });
  // Nest 12 limita su 404 al prefijo; encaminar los demás paths al filtro JSON.
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (!req.path.startsWith('/api/v1/')) next(new NotFoundException());
    else next();
  });
  app.useBodyParser('json', { limit: '32kb' });
  app.useBodyParser('urlencoded', { limit: '32kb', extended: false, parameterLimit: 100 });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, transform: true,
    forbidUnknownValues: true, validationError: { target: false, value: false },
  }));
  app.useGlobalFilters(new HttpExceptionFilter());
  configureOpenApi(app);
  app.enableShutdownHooks();
  const server = app.getHttpServer();
  server.requestTimeout = 15_000;
  server.headersTimeout = 10_000;
  server.keepAliveTimeout = 5_000;
}
