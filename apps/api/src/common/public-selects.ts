import type { Prisma } from '../../../../generated/prisma/client.ts';

export const technologySelect = {
  name: true, slug: true, category: true, description: true, iconUrl: true,
  websiteUrl: true, isFeatured: true, sortOrder: true,
} satisfies Prisma.TechnologySelect;

export const projectSummarySelect = {
  name: true, slug: true, summary: true, status: true, projectType: true,
  coverImageUrl: true, isFeatured: true, sortOrder: true, startedAt: true, completedAt: true,
  technologies: { orderBy: { technology: { slug: 'asc' } }, select: { technology: { select: technologySelect } } },
} satisfies Prisma.ProjectSelect;

export const labSummarySelect = {
  title: true, slug: true, summary: true, status: true,
} satisfies Prisma.SecurityLabSelect;
