import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TechnologiesService } from './technologies.service.ts';
import { ApiItemResponse, ApiListResponse, ApiPublicErrors } from '../common/api-response.decorator.ts';
import { TechnologyResponseDto } from '../common/public-response.dto.ts';
import { EmptyQueryDto, SlugParamDto, TechnologiesQueryDto } from '../common/query.dto.ts';

@ApiTags('Technologies') @ApiPublicErrors() @Controller('technologies')
export class TechnologiesController {
  constructor(private readonly service: TechnologiesService) {}
  @Get() @ApiOperation({ summary: 'Catálogo paginado de tecnologías' }) @ApiListResponse(TechnologyResponseDto)
  list(@Query() query: TechnologiesQueryDto) { return this.service.list(query); }
  @Get(':slug') @ApiOperation({ summary: 'Tecnología por slug' }) @ApiItemResponse(TechnologyResponseDto)
  async get(@Param() { slug }: SlugParamDto, @Query() _query: EmptyQueryDto) {
    return { data: await this.service.get(slug) };
  }
}
