import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.ts';
import { ProfileController } from './profile.controller.ts';
import { ProfileService } from './profile.service.ts';

@Module({ imports: [PrismaModule], controllers: [ProfileController], providers: [ProfileService] })
export class ProfileModule {}
