import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.ts';
import { EducationController } from './education.controller.ts';
import { EducationService } from './education.service.ts';

@Module({ imports: [PrismaModule], controllers: [EducationController], providers: [EducationService] })
export class EducationModule {}
