import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../../generated/prisma/client.ts';

@Injectable()
export class ProjectResourcesService {
  // Se compone con el select del proyecto: relaciones en lote, sin consultas por fila.
  readonly select = {
    media: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }], select: {
      mediaType: true, url: true, altText: true, caption: true, sortOrder: true,
    } },
    deployments: {
      where: { environment: 'PRODUCTION', deploymentStatus: 'ACTIVE', deploymentUrl: { not: null } },
      orderBy: [{ deployedAt: 'desc' }, { id: 'asc' }],
      select: { provider: true, deploymentUrl: true, deploymentStatus: true, deployedAt: true },
    },
  } satisfies Prisma.ProjectSelect;
}
