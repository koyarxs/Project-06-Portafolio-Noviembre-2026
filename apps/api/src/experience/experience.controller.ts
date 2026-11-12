import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExperienceService } from './experience.service.ts';
import { ApiListResponse, ApiPublicErrors } from '../common/api-response.decorator.ts';
import { ExperienceResponseDto } from '../common/public-response.dto.ts';
import { PaginationQueryDto } from '../common/query.dto.ts';

@ApiTags('Experience') @ApiPublicErrors() @Controller('experience')
export class ExperienceController {
  constructor(private readonly service: ExperienceService) {}
  @Get() @ApiOperation({ summary: 'Experience: información profesional pública paginada' })
  @ApiListResponse(ExperienceResponseDto)
  list(@Query() query: PaginationQueryDto) { return this.service.list(query); }
}
