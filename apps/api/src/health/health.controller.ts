import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.ts';
import { ApiOkResponse, ApiOperation, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/public-response.dto.ts';

@Controller('health')
@ApiTags('Health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Comprobar que el proceso atiende solicitudes' })
  @ApiOkResponse({ schema: { type: 'object', properties: { status: { type: 'string', enum: ['ok'] } } } })
  health() { return { status: 'ok' }; }

  @Get('ready')
  @ApiOperation({ summary: 'Comprobar acceso PostgreSQL mediante Prisma' })
  @ApiOkResponse({ schema: { type: 'object', properties: { status: { type: 'string', enum: ['ok'] } } } })
  @ApiServiceUnavailableResponse({ type: ErrorResponseDto })
  async ready() {
    try { await this.prisma.checkConnection(); }
    catch { throw new ServiceUnavailableException(); }
    return { status: 'ok' };
  }
}
