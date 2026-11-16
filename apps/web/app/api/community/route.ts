import { NextRequest,NextResponse } from 'next/server';
import { isCommentPage,isCommunityData } from '../../../../../packages/community/src/contracts';
import { apiBase,privateHeaders,readLimited,sameOrigin,unavailable,upstreamError,visitor,visitorHeader,withVisitor } from '../../../lib/community-server';
export const runtime = 'nodejs';
export async function GET(request:NextRequest) {
  try {
    const id = visitor(request); const query = request.nextUrl.searchParams;
    const replyId = query.get('replies');
    if (replyId && !/^[0-9a-f-]{36}$/i.test(replyId)) return new Response(null,{ status:400 });
    const params = new URLSearchParams({ page:query.get('page') ?? '1' });
    if (!replyId) params.set('sort',query.get('sort') ?? 'recent');
    const path = replyId ? `community/comments/${replyId}/replies` : 'community';
    const response = await fetch(`${apiBase()}/${path}?${params}`,{ headers:visitorHeader(id),cache:'no-store',signal:AbortSignal.timeout(6000) });
    if (!response.ok) return upstreamError(response);
    const data:unknown = await response.json();
    if (!(replyId ? isCommentPage(data) : isCommunityData(data))) return unavailable();
    return withVisitor(NextResponse.json(data,{ headers:privateHeaders }),id,request);
  } catch { return unavailable(); }
}
export async function POST(request:NextRequest) {
  if (!sameOrigin(request)) return new Response(null,{ status:403 });
  try {
    const id = visitor(request);
    const input = JSON.parse(new TextDecoder().decode(await readLimited(request,12000))) as Record<string,unknown>;
    if (!input || input.website) return NextResponse.json({ error:'No se pudo validar el envío.' },{ status:400 });
    const paths:Record<string,string> = { like:'likes',comment:'comments',react:'reactions',report:'reports' };
    const path = paths[String(input.action)];
    if (!path) return new Response(null,{ status:400 });
    const body = input.action === 'like' ? { liked:input.liked } : input.action === 'react' ? { emoji:input.emoji,commentId:input.commentId } : input.action === 'report' ? { commentId:input.commentId,reason:input.reason,detail:input.detail } : { name:input.name,avatar:input.avatar,category:input.category,message:input.message,parentId:input.parentId,attachmentIds:input.attachmentIds ?? [] };
    const response = await fetch(`${apiBase()}/community/${path}`,{ method:'POST',headers:{ ...visitorHeader(id),'Content-Type':'application/json' },body:JSON.stringify(body),cache:'no-store',signal:AbortSignal.timeout(8000) });
    if (!response.ok) return upstreamError(response);
    return withVisitor(NextResponse.json(await response.json(),{ headers:privateHeaders }),id,request);
  } catch { return unavailable(); }
}
