import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.ts';
import { CertificationsController } from './certifications.controller.ts';
import { CertificationsService } from './certifications.service.ts';

@Module({ imports: [PrismaModule], controllers: [CertificationsController], providers: [CertificationsService] })
export class CertificationsModule {}
