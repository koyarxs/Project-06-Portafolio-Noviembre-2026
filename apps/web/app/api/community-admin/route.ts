import { NextRequest,NextResponse } from 'next/server';
import { isOwner,ownerHeaders } from '../../../lib/community-admin-server';
import { apiBase,privateHeaders,readLimited,sameOrigin,unavailable,upstreamError } from '../../../lib/community-server';
export const runtime = 'nodejs';
export async function GET(request:NextRequest) {
  if (!isOwner(request)) return new Response(null,{ status:403 });
  try {
    const query = new URLSearchParams({ page:request.nextUrl.searchParams.get('page') ?? '1',filter:request.nextUrl.searchParams.get('filter') ?? 'ALL' });
    const response = await fetch(`${apiBase()}/community-admin?${query}`,{ headers:ownerHeaders(request),cache:'no-store',signal:AbortSignal.timeout(6000) });
    return response.ok ? NextResponse.json(await response.json(),{ headers:privateHeaders }) : upstreamError(response);
  } catch { return unavailable(); }
}
export async function POST(request:NextRequest) {
  if (!isOwner(request) || !sameOrigin(request)) return new Response(null,{ status:403 });
  try {
    const input = JSON.parse(new TextDecoder().decode(await readLimited(request,12000))) as Record<string,unknown>;
    const purge = input.action === 'purge-staged';
    const response = await fetch(`${apiBase()}/community-admin${purge ? '/purge-staged':''}`,{ method:'POST',headers:{ ...ownerHeaders(request),'Content-Type':'application/json' },body:purge ? '{}' : JSON.stringify({ action:input.action,commentId:input.commentId,message:input.message }),signal:AbortSignal.timeout(8000) });
    return response.ok ? NextResponse.json(await response.json(),{ headers:privateHeaders }) : upstreamError(response);
  } catch { return unavailable(); }
}
