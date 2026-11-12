import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.ts';
import { TechnologiesController } from './technologies.controller.ts';
import { TechnologiesService } from './technologies.service.ts';

@Module({ imports: [PrismaModule], controllers: [TechnologiesController], providers: [TechnologiesService] })
export class TechnologiesModule {}
