import { Body,Controller,Delete,Get,Header,Module,Param,Post,Query,Req,StreamableFile,UploadedFile,UseGuards,UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { createReadStream } from 'node:fs';
import type { Request } from 'express';
import { equalSecret,verifyVisitor } from '../../../../packages/community/src/identity.ts';
import { PrismaModule } from '../prisma/prisma.module.ts';
import { CommunityService } from './community.service.ts';
import { CommunityMediaService,MAX_IMAGE_BYTES,type BinaryUpload } from './community-media.service.ts';
import { OwnerGuard,VisitorGuard,signingSecret,type CommunityRequest } from './community-auth.ts';
import { AdminQueryDto,CommentDto,CommunityQueryDto,IdParamDto,LikeDto,ModerationDto,ReactionDto,RepliesQueryDto,ReportDto } from './community.dto.ts';
export { CommunityService } from './community.service.ts';
export { CommentDto,LikeDto,CommunityVisitorDto } from './community.dto.ts';
@Controller('community')
export class CommunityController {
  constructor(private readonly service:CommunityService,private readonly media:CommunityMediaService,private readonly config:ConfigService) {}
  @Get() @UseGuards(VisitorGuard) @Header('Cache-Control','no-store') read(@Req() req:CommunityRequest,@Query() query:CommunityQueryDto) { return this.service.read(req.communityVisitorId,query); }
  @Get('comments/:id/replies') @UseGuards(VisitorGuard) @Header('Cache-Control','no-store') replies(@Req() req:CommunityRequest,@Param() { id }:IdParamDto,@Query() query:RepliesQueryDto) { return this.service.replies(req.communityVisitorId,id,query.page); }
  @Post('likes') @UseGuards(VisitorGuard) like(@Req() req:CommunityRequest,@Body() dto:LikeDto) { return this.service.like(req.communityVisitorId,dto.liked); }
  @Post('reactions') @UseGuards(VisitorGuard) react(@Req() req:CommunityRequest,@Body() dto:ReactionDto) { return this.service.react(req.communityVisitorId,dto); }
  @Post('comments') @UseGuards(VisitorGuard) @Throttle({ default:{ limit:5,ttl:60000 } }) comment(@Req() req:CommunityRequest,@Body() dto:CommentDto) { return this.service.comment(req.communityVisitorId,dto); }
  @Post('reports') @UseGuards(VisitorGuard) @Throttle({ default:{ limit:5,ttl:60000 } }) report(@Req() req:CommunityRequest,@Body() dto:ReportDto) { return this.service.report(req.communityVisitorId,dto); }
  @Post('uploads') @UseGuards(VisitorGuard) @Throttle({ default:{ limit:15,ttl:3600000 } }) @UseInterceptors(FileInterceptor('image',{ limits:{ fileSize:MAX_IMAGE_BYTES,files:1,fields:0 } }))
  upload(@Req() req:CommunityRequest,@UploadedFile() file:BinaryUpload | undefined) { return this.media.upload(req.communityVisitorId,file); }
  @Delete('uploads/:id') @UseGuards(VisitorGuard) remove(@Req() req:CommunityRequest,@Param() { id }:IdParamDto) { return this.media.remove(req.communityVisitorId,id); }
  @Get('media/:id') @Header('Content-Type','image/webp') @Header('Cache-Control','private, no-store') @Header('Content-Security-Policy',"default-src 'none'; sandbox")
  async image(@Req() req:Request,@Param() { id }:IdParamDto) {
    const key = this.config.get<string>('COMMUNITY_ADMIN_TOKEN');
    const owner = !!key && equalSecret(req.get('authorization') ?? '',`Bearer ${key}`);
    const visitor = verifyVisitor(req.get('x-community-visitor') ?? '',signingSecret(this.config));
    return new StreamableFile(createReadStream(await this.media.file(id,visitor,owner)));
  }
}
@Controller('community-admin') @UseGuards(OwnerGuard)
export class CommunityAdminController {
  constructor(private readonly service:CommunityService,private readonly media:CommunityMediaService) {}
  @Get() @Header('Cache-Control','no-store') list(@Query() query:AdminQueryDto) { return this.service.admin(query); }
  @Post() moderate(@Body() dto:ModerationDto) { return this.service.moderate(dto); }
  @Post('purge-staged') purge() { return this.media.purgeStaged(); }
}
@Module({ imports:[PrismaModule],providers:[CommunityService,CommunityMediaService,VisitorGuard,OwnerGuard],controllers:[CommunityController,CommunityAdminController],exports:[VisitorGuard] })
export class CommunityModule {}
