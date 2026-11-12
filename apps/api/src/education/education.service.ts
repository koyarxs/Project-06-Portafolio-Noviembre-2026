import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.ts';
import { pageArgs, paginate } from '../common/paginate.ts';
import type { PaginationQueryDto } from '../common/query.dto.ts';

@Injectable()
export class EducationService {
  constructor(private readonly prisma: PrismaService) {}
  list(query: PaginationQueryDto) {
    const db = this.prisma.client;
    return paginate(db, db.education.findMany({
      select: { institution: true, degree: true, fieldOfStudy: true, description: true, startedAt: true, completedAt: true },
      orderBy: [{ startedAt: 'desc' }, { id: 'asc' }], ...pageArgs(query),
    }), db.education.count(), query);
  }
}
