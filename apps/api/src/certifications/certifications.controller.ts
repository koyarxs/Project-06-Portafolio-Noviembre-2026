import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CertificationsService } from './certifications.service.ts';
import { ApiListResponse, ApiPublicErrors } from '../common/api-response.decorator.ts';
import { CertificationResponseDto } from '../common/public-response.dto.ts';
import { PaginationQueryDto } from '../common/query.dto.ts';

@ApiTags('Certifications') @ApiPublicErrors() @Controller('certifications')
export class CertificationsController {
  constructor(private readonly service: CertificationsService) {}
  @Get() @ApiOperation({ summary: 'Certifications: información profesional pública paginada' })
  @ApiListResponse(CertificationResponseDto)
  list(@Query() query: PaginationQueryDto) { return this.service.list(query); }
}
