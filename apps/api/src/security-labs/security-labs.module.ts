import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.ts';
import { SecurityLabsController } from './security-labs.controller.ts';
import { SecurityLabsService } from './security-labs.service.ts';

@Module({ imports: [PrismaModule], controllers: [SecurityLabsController], providers: [SecurityLabsService] })
export class SecurityLabsModule {}
