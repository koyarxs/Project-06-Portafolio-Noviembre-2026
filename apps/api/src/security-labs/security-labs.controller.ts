import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SecurityLabsService } from './security-labs.service.ts';
import { ApiItemResponse, ApiListResponse, ApiPublicErrors } from '../common/api-response.decorator.ts';
import { SecurityLabDetailResponseDto, SecurityLabResponseDto } from '../common/public-response.dto.ts';
import { EmptyQueryDto, SecurityLabsQueryDto, SlugParamDto } from '../common/query.dto.ts';

@ApiTags('Security labs') @ApiPublicErrors() @Controller('security-labs')
export class SecurityLabsController {
  constructor(private readonly service: SecurityLabsService) {}
  @Get() @ApiOperation({ summary: 'Laboratorios publicados para divulgación' }) @ApiListResponse(SecurityLabResponseDto)
  list(@Query() query: SecurityLabsQueryDto) { return this.service.list(query); }
  @Get(':slug') @ApiOperation({ summary: 'Documentación pública de laboratorio; excluye hallazgos internos' })
  @ApiItemResponse(SecurityLabDetailResponseDto)
  async get(@Param() { slug }: SlugParamDto, @Query() _query: EmptyQueryDto) { return { data: await this.service.get(slug) }; }
}
