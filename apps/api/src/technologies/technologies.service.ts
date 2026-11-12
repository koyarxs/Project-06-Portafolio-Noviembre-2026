import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../../../../generated/prisma/client.ts';
import { PrismaService } from '../prisma/prisma.service.ts';
import { technologySelect } from '../common/public-selects.ts';
import { pageArgs, paginate } from '../common/paginate.ts';
import type { TechnologiesQueryDto } from '../common/query.dto.ts';
import type { TechnologyResponseDto } from '../common/public-response.dto.ts';

@Injectable()
export class TechnologiesService {
  constructor(private readonly prisma: PrismaService) {}
  list(query: TechnologiesQueryDto) {
    const where: Prisma.TechnologyWhereInput = { category: query.category, isFeatured: query.featured };
    const db = this.prisma.client;
    return paginate(db, db.technology.findMany({ where, select: technologySelect,
      orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }], ...pageArgs(query),
    }), db.technology.count({ where }), query);
  }
  async get(slug: string): Promise<TechnologyResponseDto> {
    const item = await this.prisma.client.technology.findUnique({ where: { slug }, select: technologySelect });
    if (!item) throw new NotFoundException();
    return item;
  }
}
