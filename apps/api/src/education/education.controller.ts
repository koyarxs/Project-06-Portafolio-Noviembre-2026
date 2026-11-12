import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EducationService } from './education.service.ts';
import { ApiListResponse, ApiPublicErrors } from '../common/api-response.decorator.ts';
import { EducationResponseDto } from '../common/public-response.dto.ts';
import { PaginationQueryDto } from '../common/query.dto.ts';

@ApiTags('Education') @ApiPublicErrors() @Controller('education')
export class EducationController {
  constructor(private readonly service: EducationService) {}
  @Get() @ApiOperation({ summary: 'Education: información profesional pública paginada' })
  @ApiListResponse(EducationResponseDto)
  list(@Query() query: PaginationQueryDto) { return this.service.list(query); }
}
