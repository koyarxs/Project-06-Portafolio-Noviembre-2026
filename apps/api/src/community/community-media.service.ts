import { BadRequestException, Injectable, NotFoundException, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { mkdir,writeFile,unlink,access } from 'node:fs/promises';
import { resolve,basename } from 'node:path';
import sharp from 'sharp';
import { PrismaService } from '../prisma/prisma.service.ts';
import { CommunityService,visible } from './community.service.ts';
export const MAX_IMAGE_BYTES = 5*1024*1024;
export type BinaryUpload = { buffer:Buffer; mimetype:string; size:number };
export async function sanitizeImage(file:BinaryUpload | undefined) {
  if (!file || file.size > MAX_IMAGE_BYTES || file.buffer.byteLength > MAX_IMAGE_BYTES || !['image/png','image/jpeg','image/webp'].includes(file.mimetype)) throw new BadRequestException('Invalid image');
  try {
    const image = sharp(file.buffer,{ limitInputPixels:16000000,failOn:'warning',animated:false });
    const meta = await image.metadata();
    const types:Record<string,string> = { png:'image/png',jpeg:'image/jpeg',webp:'image/webp' };
    if (!meta.format || types[meta.format] !== file.mimetype || (meta.pages ?? 1) > 1) throw new Error();
    // Re-encoding strips EXIF, GPS, XMP and source filename. Never serve originals.
    const { data,info } = await image.rotate().resize({ width:2560,height:2560,fit:'inside',withoutEnlargement:true }).webp({ quality:85 }).toBuffer({ resolveWithObject:true });
    if (data.byteLength > MAX_IMAGE_BYTES || !info.width || !info.height) throw new Error();
    return { buffer:data,width:info.width,height:info.height };
  } catch { throw new BadRequestException('Invalid image'); }
}
@Injectable()
export class CommunityMediaService {
  readonly directory:string;
  constructor(private readonly prisma:PrismaService,private readonly community:CommunityService,config:ConfigService) { this.directory = resolve(config.getOrThrow<string>('COMMUNITY_UPLOAD_DIR')); }
  path(key:string) {
    if (!/^[0-9a-f-]{36}\.webp$/.test(key) || basename(key) !== key) throw new NotFoundException();
    return resolve(this.directory,key);
  }
  async upload(visitorId:string,file:BinaryUpload | undefined) {
    await this.community.participant(visitorId,true);
    const sanitized = await sanitizeImage(file);
    await mkdir(this.directory,{ recursive:true });
    const id = randomUUID(); const storageKey = `${id}.webp`; const path = this.path(storageKey);
    try {
      await this.prisma.client.$transaction(async db => {
        await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${visitorId}))`;
        const [staged,hourly] = await Promise.all([db.commentAttachment.count({ where:{ visitorId,commentId:null } }),db.commentAttachment.count({ where:{ visitorId,createdAt:{ gt:new Date(Date.now()-3600000) } } })]);
        if (staged >= 6 || hourly >= 15) throw new HttpException('Upload limit reached',429);
        await writeFile(path,sanitized.buffer,{ flag:'wx',mode:0o600 });
        await db.commentAttachment.create({ data:{ id,visitorId,storageKey,width:sanitized.width,height:sanitized.height,bytes:sanitized.buffer.byteLength } });
      });
    } catch(error) { await unlink(path).catch(() => undefined); throw error; }
    return { id,url:`/api/community/media/${id}`,width:sanitized.width,height:sanitized.height };
  }
  async remove(visitorId:string,id:string) {
    const item = await this.prisma.client.commentAttachment.findFirst({ where:{ id,visitorId,commentId:null } });
    if (!item) throw new NotFoundException();
    const removed = await this.prisma.client.commentAttachment.deleteMany({ where:{ id,visitorId,commentId:null } });
    if (!removed.count) throw new NotFoundException();
    await unlink(this.path(item.storageKey)).catch(() => undefined);
    return { ok:true };
  }
  async file(id:string,visitorId:string | null,owner:boolean) {
    const item = await this.prisma.client.commentAttachment.findFirst({ where:{ id,...(owner ? {} : { OR:[{ comment:{ ...visible } },...(visitorId ? [{ visitorId,commentId:null }] : [])] }) } });
    if (!item) throw new NotFoundException();
    const path = this.path(item.storageKey);
    try { await access(path); } catch { throw new NotFoundException(); }
    return path;
  }
  async purgeStaged() {
    const expired = await this.prisma.client.commentAttachment.findMany({ where:{ commentId:null,createdAt:{ lt:new Date(Date.now()-86400000) } },take:100 });
    for (const item of expired) {
      const removed = await this.prisma.client.commentAttachment.deleteMany({ where:{ id:item.id,commentId:null } });
      if (removed.count) await unlink(this.path(item.storageKey)).catch(() => undefined);
    }
    return { removed:expired.length };
  }
}
