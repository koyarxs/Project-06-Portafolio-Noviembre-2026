import { randomUUID } from 'node:crypto';
import { NextRequest,NextResponse } from 'next/server';
import { equalSecret,signVisitor } from '../../../../../../packages/community/src/identity';
import { isOwner } from '../../../../lib/community-admin-server';
import { privateHeaders,readLimited,sameOrigin,secureCookie } from '../../../../lib/community-server';
export const runtime = 'nodejs';
let attempts = 0; let reset = 0;
export function GET(request:NextRequest) { return NextResponse.json({ authenticated:isOwner(request),configured:!!process.env.COMMUNITY_ADMIN_TOKEN },{ headers:privateHeaders }); }
export async function POST(request:NextRequest) {
  if (!sameOrigin(request)) return new Response(null,{ status:403 });
  if (Date.now() > reset) { attempts = 0; reset = Date.now()+60000; }
  if (++attempts > 10) return NextResponse.json({ error:'Espera un minuto antes de volver a intentar.' },{ status:429 });
  const key = process.env.COMMUNITY_ADMIN_TOKEN;
  if (!key) return NextResponse.json({ error:'Administración sin configurar.' },{ status:503 });
  try {
    const { password } = JSON.parse(new TextDecoder().decode(await readLimited(request,1024))) as { password?:unknown };
    if (typeof password !== 'string' || !equalSecret(password,key)) return NextResponse.json({ error:'Credencial incorrecta.' },{ status:403 });
    const response = NextResponse.json({ authenticated:true },{ headers:privateHeaders });
    response.cookies.set('yb-owner',signVisitor(randomUUID(),key),{ httpOnly:true,sameSite:'strict',secure:secureCookie(request),path:'/',maxAge:28800 });
    return response;
  } catch { return new Response(null,{ status:400 }); }
}
export function DELETE(request:NextRequest) {
  if (!sameOrigin(request)) return new Response(null,{ status:403 });
  const response = NextResponse.json({ authenticated:false },{ headers:privateHeaders }); response.cookies.delete('yb-owner'); return response;
}
