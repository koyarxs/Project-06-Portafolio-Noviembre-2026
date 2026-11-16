import { type CanActivate, type ExecutionContext, ForbiddenException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
import { developmentSecret, equalSecret, verifyVisitor } from '../../../../packages/community/src/identity.ts';
export type CommunityRequest = Request & { communityVisitorId: string };
export function signingSecret(config: ConfigService): string {
  const secret = config.get<string>('COMMUNITY_SIGNING_SECRET');
  if (secret) return secret;
  if (config.get<string>('NODE_ENV') === 'production') throw new ServiceUnavailableException();
  return developmentSecret;
}
@Injectable()
export class VisitorGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<CommunityRequest>();
    const id = verifyVisitor(req.get('x-community-visitor') ?? '',signingSecret(this.config));
    if (!id) throw new ForbiddenException();
    req.communityVisitorId = id; return true;
  }
}
@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}
  canActivate(context: ExecutionContext) {
    const key = this.config.get<string>('COMMUNITY_ADMIN_TOKEN');
    if (!key) throw new ServiceUnavailableException();
    const req = context.switchToHttp().getRequest<Request>();
    const supplied = req.get('authorization') ?? '';
    if (!equalSecret(supplied,`Bearer ${key}`)) throw new ForbiddenException();
    return true;
  }
}
@Injectable()
export class CommunityThrottlerGuard extends ThrottlerGuard {
  protected override async getTracker(req: Record<string, unknown>): Promise<string> {
    const headers = req.headers as Record<string,string> | undefined;
    const token = headers?.['x-community-visitor'];
    const secret = process.env.COMMUNITY_SIGNING_SECRET ?? (process.env.NODE_ENV === 'production' ? undefined : developmentSecret);
    const id = token && secret ? verifyVisitor(token,secret) : null;
    return id ? `community:${id}` : String(req.ip ?? 'unknown');
  }
}
