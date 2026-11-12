import type { Prisma, PrismaClient } from '../../../../generated/prisma/client.ts';
import type { PaginationQueryDto } from './query.dto.ts';

export async function paginate<T>(
  db: PrismaClient, query: Prisma.PrismaPromise<T[]>, count: Prisma.PrismaPromise<number>,
  { page, limit }: PaginationQueryDto,
) {
  const [data, total] = await db.$transaction([query, count], { isolationLevel: 'RepeatableRead' });
  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export const pageArgs = ({ page, limit }: PaginationQueryDto) => ({ skip: (page - 1) * limit, take: limit });
