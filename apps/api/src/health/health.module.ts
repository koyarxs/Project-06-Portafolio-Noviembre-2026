import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.ts';
import { HealthController } from './health.controller.ts';

@Module({ imports: [PrismaModule], controllers: [HealthController] })
export class HealthModule {}
