import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.ts';
import { pageArgs, paginate } from '../common/paginate.ts';
import type { PaginationQueryDto } from '../common/query.dto.ts';

@Injectable()
export class CertificationsService {
  constructor(private readonly prisma: PrismaService) {}
  list(query: PaginationQueryDto) {
    const db = this.prisma.client;
    return paginate(db, db.certification.findMany({
      select: { name: true, issuer: true, credentialUrl: true, issuedAt: true, expiresAt: true },
      orderBy: [{ issuedAt: 'desc' }, { id: 'asc' }], ...pageArgs(query),
    }), db.certification.count(), query);
  }
}
