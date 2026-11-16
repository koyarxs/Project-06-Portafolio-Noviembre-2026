import { CommunityModule } from '../community/community.module.ts';
import { VisitorGuard,type CommunityRequest } from '../community/community-auth.ts';
import { Req,UseGuards, Controller, Header, Injectable, Module, Post, ServiceUnavailableException } from '@nestjs/common';
import { IsUUID } from 'class-validator';
import { PrismaModule } from '../prisma/prisma.module.ts';
import { PrismaService } from '../prisma/prisma.service.ts';

export class VisitDto { @IsUUID('4') id!: string; }
@Injectable()
export class VisitorsService {
  constructor(private readonly prisma: PrismaService) {}
  async record(id: string) {
    try {
      return await this.prisma.client.$transaction(async db => {
        await db.portfolioVisitor.upsert({ where:{ id },create:{ id },update:{ lastSeen:new Date() } });
        const [time] = await db.$queryRaw<{ midnight:Date }[]>`SELECT date_trunc('day', CURRENT_TIMESTAMP AT TIME ZONE 'America/Santiago') AT TIME ZONE 'America/Santiago' AS midnight`;
        const where = { id:{ not:'00000000-0000-4000-8000-000000000001' } };
        const [total,today,online] = await Promise.all([
          db.portfolioVisitor.count({ where }),
          db.portfolioVisitor.count({ where:{ ...where,firstSeen:{ gte:time.midnight } } }),
          db.portfolioVisitor.count({ where:{ ...where,lastSeen:{ gte:new Date(Date.now()-90000) } } }),
        ]);
        return { total,today,online };
      });
    } catch { throw new ServiceUnavailableException('Visitor statistics unavailable'); }
  }
}
@Controller('visitors')
export class VisitorsController {
  constructor(private readonly service: VisitorsService) {}
  @Post() @UseGuards(VisitorGuard) @Header('Cache-Control', 'no-store')
  record(@Req() req:CommunityRequest) { return this.service.record(req.communityVisitorId); }
}
@Module({ imports: [PrismaModule,CommunityModule], providers: [VisitorsService], controllers: [VisitorsController] })
export class VisitorsModule {}
