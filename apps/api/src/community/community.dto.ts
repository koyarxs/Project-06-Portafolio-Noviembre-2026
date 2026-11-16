import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, ArrayUnique, IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';
import { avatars,categories,reactionEmojis,reportReasons,sorts } from '../../../../packages/community/src/contracts.ts';
const trim = ({ value }: { value:unknown }) => typeof value === 'string' ? value.trim() : value;
export class CommunityVisitorDto { @IsOptional() @IsUUID('4') id?:string; }
export class CommunityQueryDto {
  @IsOptional() @IsIn(sorts) sort:'recent'|'popular'|'oldest' = 'recent';
  @Type(() => Number) @IsInt() @Min(1) @Max(10000) page = 1;
}
export class RepliesQueryDto { @Type(() => Number) @IsInt() @Min(1) @Max(10000) page = 1; }
export class IdParamDto { @IsUUID('4') id!:string; }
export class LikeDto { @IsBoolean() liked!:boolean; }
export class CommentDto {
  @Transform(trim) @IsString() @MinLength(2) @MaxLength(60) name!:string;
  @IsIn(avatars) avatar!:string;
  @IsOptional() @IsIn(categories) category?:string;
  @Transform(trim) @IsString() @MinLength(1) @MaxLength(2000) message!:string;
  @IsOptional() @IsUUID('4') parentId?:string;
  @IsArray() @ArrayMaxSize(3) @ArrayUnique() @IsUUID('4',{ each:true }) attachmentIds:string[] = [];
}
export class ReactionDto {
  @IsIn(reactionEmojis) @IsOptional() emoji:typeof reactionEmojis[number] | null = null;
  @IsOptional() @IsUUID('4') commentId?:string;
}
export class ReportDto {
  @IsUUID('4') commentId!:string;
  @IsIn(reportReasons) reason!:string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(500) detail?:string;
}
export class ModerationDto {
  @IsIn(['approve','hide','delete','pin','unpin','block','unblock','resolve','reply']) action!:string;
  @IsUUID('4') commentId!:string;
  @IsOptional() @Transform(trim) @IsString() @MinLength(1) @MaxLength(2000) message?:string;
}
export class AdminQueryDto {
  @IsOptional() @IsIn(['ALL','PENDING','APPROVED','HIDDEN','DELETED','REPORTED']) filter = 'ALL';
  @Type(() => Number) @IsInt() @Min(1) @Max(10000) page = 1;
}
