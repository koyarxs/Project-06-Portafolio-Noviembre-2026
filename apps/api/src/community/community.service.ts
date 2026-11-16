import { BadRequestException, ForbiddenException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '../../../../generated/prisma/client.ts';
import { reactionEmojis, type Emoji, type ReactionSummary } from '../../../../packages/community/src/contracts.ts';
import { PrismaService } from '../prisma/prisma.service.ts';
import { type AdminQueryDto, type CommentDto, type CommunityQueryDto, type ModerationDto, type ReactionDto, type ReportDto } from './community.dto.ts';

export const OWNER_ID = '00000000-0000-4000-8000-000000000001';
export const visible: Prisma.PortfolioCommentWhereInput = { scope:'portfolio', projectId:null, status:'APPROVED', visitor:{ blockedAt:null }, OR:[{ parentId:null },{ parent:{ status:'APPROVED', visitor:{ blockedAt:null } } }] };
const publicSelect = { id:true,name:true,avatar:true,category:true,message:true,createdAt:true,authorRole:true,pinned:true, attachments:{ select:{ id:true,width:true,height:true } }, _count:{ select:{ replies:{ where:visible } } } } satisfies Prisma.PortfolioCommentSelect;
type PublicRow = Prisma.PortfolioCommentGetPayload<{ select:typeof publicSelect }>;
export function reactionSummary(rows: { emoji:string; _count:{ _all:number } }[]): ReactionSummary[] { return reactionEmojis.map(emoji => ({ emoji,count:rows.find(row => row.emoji === emoji)?._count._all ?? 0 })); }
@Injectable()
export class CommunityService {
  constructor(readonly prisma: PrismaService, private readonly config: ConfigService = new ConfigService()) {}
  async participant(id:string, write = false) {
    if (id === OWNER_ID) throw new ForbiddenException();
    const person = await this.prisma.client.portfolioVisitor.upsert({ where:{ id },create:{ id },update:{} });
    if (write && person.blockedAt) throw new ForbiddenException();
    return person;
  }
  async accessible(id:string) {
    const item = await this.prisma.client.portfolioComment.findFirst({ where:{ ...visible,id } });
    if (!item) throw new NotFoundException();
    return item;
  }
  async present(rows:PublicRow[],id:string) {
    const ids = rows.map(row => row.id);
    const [totals,own] = await Promise.all([
      this.prisma.client.communityReaction.groupBy({ by:['targetKey','emoji'], where:{ targetKey:{ in:ids },visitor:{ blockedAt:null } },_count:{ _all:true } }),
      this.prisma.client.communityReaction.findMany({ where:{ visitorId:id,targetKey:{ in:ids } },select:{ targetKey:true,emoji:true } }),
    ]);
    return rows.map(row => ({ id:row.id,name:row.name,avatar:row.avatar,category:row.category,message:row.message,createdAt:row.createdAt.toISOString(),authorRole:row.authorRole,pinned:row.pinned,replyCount:row._count.replies,attachments:row.attachments.map(a => ({ ...a,url:`/api/community/media/${a.id}` })),reactions:reactionSummary(totals.filter(t => t.targetKey === row.id)),myReaction:(own.find(r => r.targetKey === row.id)?.emoji as Emoji | undefined) ?? null }));
  }
  async read(id:string,query:CommunityQueryDto = { sort:'recent',page:1 }) {
    await this.participant(id);
    const roots = { ...visible,parentId:null };
    const order: Prisma.PortfolioCommentOrderByWithRelationInput[] = [{ pinned:'desc' },...(query.sort === 'popular' ? [{ reactions:{ _count:'desc' as const } }] : []),{ createdAt:query.sort === 'oldest' ? 'asc':'desc' },{ id:'desc' }];
    const [likes,comments,own,threads,rows,totals,reaction] = await Promise.all([
      this.prisma.client.portfolioLike.count({ where:{ liked:true,visitor:{ blockedAt:null } } }),
      this.prisma.client.portfolioComment.count({ where:visible }),
      this.prisma.client.portfolioLike.findUnique({ where:{ visitorId:id },select:{ liked:true } }),
      this.prisma.client.portfolioComment.count({ where:roots }),
      this.prisma.client.portfolioComment.findMany({ where:roots,take:12,skip:(query.page-1)*12,orderBy:order,select:publicSelect }),
      this.prisma.client.communityReaction.groupBy({ by:['emoji'],where:{ targetKey:'portfolio',visitor:{ blockedAt:null } },_count:{ _all:true } }),
      this.prisma.client.communityReaction.findUnique({ where:{ visitorId_targetKey:{ visitorId:id,targetKey:'portfolio' } },select:{ emoji:true } }),
    ]);
    return { likes,comments,liked:own?.liked ?? false,items:await this.present(rows,id),page:query.page,pages:Math.max(1,Math.ceil(threads/12)),sort:query.sort,reactions:reactionSummary(totals),myReaction:(reaction?.emoji as Emoji | undefined) ?? null };
  }
  async replies(id:string,parentId:string,page:number) {
    await this.accessible(parentId);
    const where = { ...visible,parentId };
    const [count,rows] = await Promise.all([this.prisma.client.portfolioComment.count({ where }),this.prisma.client.portfolioComment.findMany({ where,skip:(page-1)*12,take:12,orderBy:[{ createdAt:'asc' },{ id:'asc' }],select:publicSelect })]);
    return { items:await this.present(rows,id),page,pages:Math.max(1,Math.ceil(count/12)) };
  }
  async like(id:string,liked:boolean) {
    await this.participant(id,true);
    await this.prisma.client.portfolioLike.upsert({ where:{ visitorId:id },create:{ visitorId:id,liked },update:{ liked } });
    return { ok:true };
  }
  async react(id:string,dto:ReactionDto) {
    await this.participant(id,true);
    if (dto.commentId) await this.accessible(dto.commentId);
    const targetKey = dto.commentId ?? 'portfolio';
    if (dto.emoji === null) await this.prisma.client.communityReaction.deleteMany({ where:{ visitorId:id,targetKey } });
    else await this.prisma.client.communityReaction.upsert({ where:{ visitorId_targetKey:{ visitorId:id,targetKey } },create:{ visitorId:id,targetKey,commentId:dto.commentId,emoji:dto.emoji },update:{ emoji:dto.emoji } });
    return { ok:true };
  }
  async comment(id:string,dto:CommentDto) {
    await this.participant(id,true);
    let parentId:string | undefined;
    if (dto.parentId) { const parent = await this.accessible(dto.parentId); parentId = parent.parentId ?? parent.id; await this.accessible(parentId); }
    const status = this.config.get<boolean>('COMMUNITY_REQUIRE_APPROVAL') ? 'PENDING':'APPROVED';
    const comment = await this.prisma.client.$transaction(async db => {
      await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${id}))`;
      const blocked = await db.portfolioVisitor.findUnique({ where:{ id } });
      if (blocked?.blockedAt) throw new ForbiddenException();
      const recent = await db.portfolioComment.findFirst({ where:{ visitorId:id,createdAt:{ gt:new Date(Date.now()-30000) } } });
      if (recent) throw new HttpException('Wait before posting again',429);
      const item = await db.portfolioComment.create({ data:{ visitorId:id,name:dto.name,avatar:dto.avatar,topic:'Portafolio general',category:dto.category,scope:'portfolio',message:dto.message,parentId,status } });
      if (dto.attachmentIds.length) {
        const attached = await db.commentAttachment.updateMany({ where:{ id:{ in:dto.attachmentIds },visitorId:id,commentId:null,createdAt:{ gt:new Date(Date.now()-86400000) } },data:{ commentId:item.id } });
        if (attached.count !== dto.attachmentIds.length) throw new BadRequestException('Attachments unavailable');
      }
      return item;
    });
    return { ok:true,id:comment.id,submissionStatus:status };
  }
  async report(id:string,dto:ReportDto) {
    await this.participant(id,true); await this.accessible(dto.commentId);
    await this.prisma.client.commentReport.upsert({ where:{ visitorId_commentId:{ visitorId:id,commentId:dto.commentId } },create:{ visitorId:id,commentId:dto.commentId,reason:dto.reason,detail:dto.detail },update:{} });
    return { ok:true };
  }
  async admin(query:AdminQueryDto) {
    const where:Prisma.PortfolioCommentWhereInput = query.filter === 'REPORTED' ? { reports:{ some:{ status:'OPEN' } } } : query.filter === 'ALL' ? {} : { status:query.filter };
    const [total,items,pending,reports,blocked,visits,likes,actions] = await Promise.all([
      this.prisma.client.portfolioComment.count({ where }),
      this.prisma.client.portfolioComment.findMany({ where,take:20,skip:(query.page-1)*20,orderBy:[{ createdAt:'desc' },{ id:'desc' }],include:{ visitor:{ select:{ blockedAt:true } },reports:{ where:{ status:'OPEN' },select:{ id:true,reason:true,detail:true,createdAt:true } },attachments:{ select:{ id:true,width:true,height:true } } } }),
      this.prisma.client.portfolioComment.count({ where:{ status:'PENDING' } }),this.prisma.client.commentReport.count({ where:{ status:'OPEN' } }),this.prisma.client.portfolioVisitor.count({ where:{ blockedAt:{ not:null } } }),this.prisma.client.portfolioVisitor.count({ where:{ id:{ not:OWNER_ID } } }),this.prisma.client.portfolioLike.count({ where:{ liked:true } }),this.prisma.client.moderationAction.findMany({ take:20,orderBy:{ createdAt:'desc' } }),
    ]);
    return { items:items.map(item => ({ ...item,attachments:item.attachments.map(a => ({ ...a,url:`/api/community/media/${a.id}` })) })),page:query.page,pages:Math.max(1,Math.ceil(total/20)),total,stats:{ pending,reports,blocked,visits,likes },actions };
  }
  async moderate(dto:ModerationDto) {
    return this.prisma.client.$transaction(async db => {
      const item = await db.portfolioComment.findUnique({ where:{ id:dto.commentId } });
      if (!item) throw new NotFoundException();
      if (dto.action === 'reply') {
        if (!dto.message) throw new BadRequestException();
        if (['HIDDEN','DELETED'].includes(item.status)) throw new BadRequestException();
        await db.portfolioVisitor.upsert({ where:{ id:OWNER_ID },create:{ id:OWNER_ID },update:{} });
        await db.portfolioComment.create({ data:{ visitorId:OWNER_ID,name:'Yerko Barrera',avatar:'🧑‍💻',topic:'Portafolio general',message:dto.message,parentId:item.parentId ?? item.id,authorRole:'OWNER',status:'APPROVED' } });
      } else if (['block','unblock'].includes(dto.action)) {
        if (item.authorRole === 'OWNER') throw new BadRequestException();
        await db.portfolioVisitor.update({ where:{ id:item.visitorId },data:{ blockedAt:dto.action === 'block' ? new Date():null } });
      } else if (dto.action === 'resolve') {
        await db.commentReport.updateMany({ where:{ commentId:item.id,status:'OPEN' },data:{ status:'RESOLVED' } });
      } else if (['pin','unpin'].includes(dto.action)) {
        if (item.parentId) throw new BadRequestException();
        await db.portfolioComment.update({ where:{ id:item.id },data:{ pinned:dto.action === 'pin' } });
      } else {
        const status = { approve:'APPROVED',hide:'HIDDEN',delete:'DELETED' }[dto.action as 'approve'|'hide'|'delete'];
        if (!status) throw new BadRequestException();
        await db.portfolioComment.update({ where:{ id:item.id },data:{ status } });
      }
      await db.moderationAction.create({ data:{ action:dto.action,commentId:item.id,participantId:item.visitorId } });
      return { ok:true };
    });
  }
}
