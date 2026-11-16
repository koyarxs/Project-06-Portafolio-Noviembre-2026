import 'server-only';
import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { developmentSecret, signVisitor, verifyVisitor } from '../../../packages/community/src/identity';
export function secret() {
  const value = process.env.COMMUNITY_SIGNING_SECRET;
  if (value && value.length >= 48) return value;
  if (value) throw new Error('Invalid signing configuration');
  if (process.env.NODE_ENV === 'production') throw new Error('Community signing not configured');
  return developmentSecret;
}
export function visitor(request: NextRequest) {
  return verifyVisitor(request.cookies.get('yb-visitor')?.value ?? '',secret(),31536000) ?? randomUUID();
}
export function visitorHeader(id: string) { return { 'x-community-visitor':signVisitor(id,secret()) }; }
export function withVisitor(response: NextResponse,id: string,request: NextRequest) {
  response.cookies.set('yb-visitor',signVisitor(id,secret()),{ httpOnly:true, sameSite:'lax', secure:secureCookie(request), maxAge:31536000, path:'/' });
  return response;
}
export function sameOrigin(request:NextRequest) {
  try {
    const raw = request.headers.get('origin'); const host = request.headers.get('host');
    if (!raw || !host || !/^[a-z0-9.:[\]-]+$/i.test(host) || request.headers.get('sec-fetch-site') === 'cross-site') return false;
    const origin = new URL(raw);
    return ['http:','https:'].includes(origin.protocol) && origin.origin === raw && origin.host === new URL(`${origin.protocol}//${host}`).host;
  } catch { return false; }
}
export const apiBase = () => (process.env.PORTFOLIO_API_URL ?? 'http://127.0.0.1:3001/api/v1').replace(/\/$/,'');
export const privateHeaders = { 'Cache-Control':'private, no-store' };
export function unavailable() { return NextResponse.json({ error:'La comunidad no está disponible en este momento. Tu borrador se conserva.' },{ status:503, headers:privateHeaders }); }

export async function readLimited(request:NextRequest,max:number) {
  if (Number(request.headers.get('content-length') ?? 0) > max) throw new Error('Too large');
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks:Uint8Array[] = []; let size = 0;
  try { while (true) { const chunk = await reader.read(); if (chunk.done) break; size += chunk.value.byteLength; if (size > max) { await reader.cancel(); throw new Error('Too large'); } chunks.push(chunk.value); } }
  finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk,offset); offset += chunk.byteLength; }
  return bytes;
}
export async function upstreamError(response:Response) {
  const messages:Record<number,string> = { 400:'Revisa los datos o el formato de las imágenes.',403:'Esta acción no está disponible para este participante.',404:'Este contenido ya no está disponible.',413:'Cada imagen puede pesar hasta 5 MB.',429:'Has enviado varias acciones. Espera un momento antes de continuar.' };
  const status = [400,403,404,413,429].includes(response.status) ? response.status : 503;
  return NextResponse.json({ error:messages[status] ?? 'No pudimos conectar. Tu borrador se conserva.' },{ status,headers:privateHeaders });
}

export function secureCookie(request:NextRequest) {
  return request.nextUrl.protocol === 'https:' || (process.env.NODE_ENV === 'production' && !['localhost','127.0.0.1','[::1]'].includes(request.nextUrl.hostname));
}
