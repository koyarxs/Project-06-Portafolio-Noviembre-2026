import { NextRequest,NextResponse } from 'next/server';
import { apiBase,privateHeaders,sameOrigin,unavailable,visitor,visitorHeader,withVisitor } from '../../../lib/community-server';
export const runtime = 'nodejs';
export async function POST(request:NextRequest) {
  if (!sameOrigin(request)) return new Response(null,{ status:403 });
  try {
    const id = visitor(request);
    const upstream = await fetch(`${apiBase()}/visitors`,{ method:'POST',headers:visitorHeader(id),cache:'no-store',signal:AbortSignal.timeout(4000) });
    if (!upstream.ok) return unavailable();
    const stats = await upstream.json() as Record<string,unknown>;
    if (!['total','today','online'].every(key => Number.isSafeInteger(stats[key]) && (stats[key] as number) >= 0)) return unavailable();
    return withVisitor(NextResponse.json({ total:stats.total,today:stats.today,online:stats.online },{ headers:privateHeaders }),id,request);
  } catch { return unavailable(); }
}
