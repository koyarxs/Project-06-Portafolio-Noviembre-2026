import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.ts';
import { ExperienceController } from './experience.controller.ts';
import { ExperienceService } from './experience.service.ts';

@Module({ imports: [PrismaModule], controllers: [ExperienceController], providers: [ExperienceService] })
export class ExperienceModule {}
