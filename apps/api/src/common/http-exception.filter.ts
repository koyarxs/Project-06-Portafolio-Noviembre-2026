import { Catch, HttpException, HttpStatus, Logger, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../../../../generated/prisma/client.ts';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    // Express body-parser emite errores fuera de HttpException.
    const parserType = (exception as { type?: unknown } | null)?.type;
    const status = parserType === 'entity.too.large' ? 413 : parserType === 'entity.parse.failed' ? 400 :
      exception instanceof HttpException ? exception.getStatus() :
      exception instanceof Prisma.PrismaClientInitializationError ||
      (exception instanceof Prisma.PrismaClientKnownRequestError && ['P1001', 'P1002', 'P1008', 'P1017', 'P2024'].includes(exception.code)) ? 503 : 500;
    const code = HttpStatus[status] ?? 'INTERNAL_SERVER_ERROR';
    const messages: Record<number, string> = {
      400: 'Invalid request', 403: 'Forbidden', 404: 'Not found',
      405: 'Method not allowed', 413: 'Request body too large',
      429: 'Too many requests',
      500: 'Internal server error', 503: 'Service unavailable',
    };
    if (status >= 500) this.logger.error({ event: 'request_failed', statusCode: status });
    host.switchToHttp().getResponse<Response>().status(status).json({
      status: 'error', error: { code, message: messages[status] ?? 'Request failed' },
    });
  }
}
