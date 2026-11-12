import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.ts';
import { ProjectsController } from './projects.controller.ts';
import { ProjectsService } from './projects.service.ts';
import { ProjectResourcesService } from './project-resources.service.ts';

@Module({ imports: [PrismaModule], controllers: [ProjectsController], providers: [ProjectsService, ProjectResourcesService] })
export class ProjectsModule {}
