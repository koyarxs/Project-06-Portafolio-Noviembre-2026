import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service.ts';
import { ApiItemResponse, ApiListResponse, ApiPublicErrors } from '../common/api-response.decorator.ts';
import { ProjectDetailResponseDto, ProjectSummaryResponseDto } from '../common/public-response.dto.ts';
import { EmptyQueryDto, ProjectsQueryDto, SlugParamDto } from '../common/query.dto.ts';

@ApiTags('Projects') @ApiPublicErrors() @Controller('projects')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}
  @Get() @ApiOperation({ summary: 'Proyectos publicados; filtros combinados con AND' }) @ApiListResponse(ProjectSummaryResponseDto)
  list(@Query() query: ProjectsQueryDto) { return this.service.list(query); }
  @Get(':slug') @ApiOperation({ summary: 'Proyecto publicado con tecnologías, medios y despliegues públicos activos' })
  @ApiItemResponse(ProjectDetailResponseDto)
  async get(@Param() { slug }: SlugParamDto, @Query() _query: EmptyQueryDto) { return { data: await this.service.get(slug) }; }
}
