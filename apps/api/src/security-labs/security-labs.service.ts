import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../../../../generated/prisma/client.ts';
import { PrismaService } from '../prisma/prisma.service.ts';
import { labSummarySelect } from '../common/public-selects.ts';
import { pageArgs, paginate } from '../common/paginate.ts';
import type { SecurityLabsQueryDto } from '../common/query.dto.ts';
import type { SecurityLabDetailResponseDto } from '../common/public-response.dto.ts';

@Injectable()
export class SecurityLabsService {
  constructor(private readonly prisma: PrismaService) {}
  list(query: SecurityLabsQueryDto) {
    const db = this.prisma.client;
    const where: Prisma.SecurityLabWhereInput = { isPublished: true, status: query.status };
    return paginate(db, db.securityLab.findMany({ where, select: labSummarySelect,
      orderBy: [{ slug: 'asc' }], ...pageArgs(query),
    }), db.securityLab.count({ where }), query);
  }
  async get(slug: string): Promise<SecurityLabDetailResponseDto> {
    const item = await this.prisma.client.securityLab.findFirst({ where: { slug, isPublished: true }, select: {
      ...labSummarySelect, description: true, methodology: true, toolsUsed: true,
      remediation: true, repositoryUrl: true, reportUrl: true,
    } });
    if (!item) throw new NotFoundException();
    return item;
  }
}
