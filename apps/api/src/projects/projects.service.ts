import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../../../../generated/prisma/client.ts';
import { PrismaService } from '../prisma/prisma.service.ts';
import { projectSummarySelect } from '../common/public-selects.ts';
import { pageArgs, paginate } from '../common/paginate.ts';
import type { ProjectsQueryDto } from '../common/query.dto.ts';
import type { ProjectDetailResponseDto } from '../common/public-response.dto.ts';
import { ProjectResourcesService } from './project-resources.service.ts';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService, private readonly resources: ProjectResourcesService) {}
  async list(query: ProjectsQueryDto) {
    const where: Prisma.ProjectWhereInput = {
      isPublished: true, status: query.status, projectType: query.type, isFeatured: query.featured,
      ...(query.technology ? { technologies: { some: { technology: { slug: query.technology } } } } : {}),
    };
    const db = this.prisma.client;
    const result = await paginate(db, db.project.findMany({
      where, select: projectSummarySelect, orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }], ...pageArgs(query),
    }), db.project.count({ where }), query);
    return { ...result, data: result.data.map(({ technologies, ...project }) => ({
      ...project, technologies: technologies.map(({ technology }) => technology),
    })) };
  }
  async get(slug: string): Promise<ProjectDetailResponseDto> {
    const project = await this.prisma.client.project.findFirst({ where: { slug, isPublished: true }, select: {
      ...projectSummarySelect, description: true, problem: true, solution: true,
      architecture: true, technicalChallenges: true, repositoryUrl: true, demoUrl: true,
      documentationUrl: true, ...this.resources.select,
    } });
    if (!project) throw new NotFoundException();
    return { ...project, technologies: project.technologies.map(({ technology }) => technology) };
  }
}
