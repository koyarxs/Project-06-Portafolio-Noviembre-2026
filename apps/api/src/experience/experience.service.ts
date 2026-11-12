import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.ts';
import { pageArgs, paginate } from '../common/paginate.ts';
import type { PaginationQueryDto } from '../common/query.dto.ts';

@Injectable()
export class ExperienceService {
  constructor(private readonly prisma: PrismaService) {}
  list(query: PaginationQueryDto) {
    const db = this.prisma.client;
    return paginate(db, db.experience.findMany({
      select: { organization: true, position: true, employmentType: true, location: true, description: true, startedAt: true, endedAt: true, isCurrent: true, sortOrder: true },
      orderBy: [{ sortOrder: 'asc' }, { startedAt: 'desc' }, { id: 'asc' }], ...pageArgs(query),
    }), db.experience.count(), query);
  }
}
