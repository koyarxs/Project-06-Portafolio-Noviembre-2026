import 'server-only';
import { NextRequest } from 'next/server';
import { verifyVisitor } from '../../../packages/community/src/identity';
export function isOwner(request:NextRequest) {
  const key = process.env.COMMUNITY_ADMIN_TOKEN;
  return !!key && !!verifyVisitor(request.cookies.get('yb-owner')?.value ?? '',key,28800);
}
export function ownerHeaders(request:NextRequest):Record<string,string> {
  return isOwner(request) ? { Authorization:`Bearer ${process.env.COMMUNITY_ADMIN_TOKEN}` } : {};
}
