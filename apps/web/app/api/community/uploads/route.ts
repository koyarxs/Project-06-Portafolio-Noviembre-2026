import { NextRequest,NextResponse } from 'next/server';
import { isAttachment } from '../../../../../../packages/community/src/contracts';
import { apiBase,privateHeaders,readLimited,sameOrigin,unavailable,upstreamError,visitor,visitorHeader,withVisitor } from '../../../../lib/community-server';
export const runtime = 'nodejs';
export async function POST(request:NextRequest) {
  if (!sameOrigin(request)) return new Response(null,{ status:403 });
  if (!request.headers.get('content-type')?.startsWith('multipart/form-data;')) return new Response(null,{ status:400 });
  try {
    const id = visitor(request);
    let bytes:Uint8Array;
    try { bytes = await readLimited(request,5*1024*1024+16384); } catch { return NextResponse.json({ error:'La imagen supera los 5 MB.' },{ status:413 }); }
    const upstream = await fetch(`${apiBase()}/community/uploads`,{ method:'POST',headers:{ ...visitorHeader(id),'Content-Type':request.headers.get('content-type')! },body:new Blob([bytes.buffer as ArrayBuffer]),signal:AbortSignal.timeout(15000) });
    if (!upstream.ok) return upstreamError(upstream);
    const data:unknown = await upstream.json();
    if (!isAttachment(data)) return unavailable();
    return withVisitor(NextResponse.json(data,{ headers:privateHeaders }),id,request);
  } catch { return unavailable(); }
}
export async function DELETE(request:NextRequest) {
  if (!sameOrigin(request)) return new Response(null,{ status:403 });
  try {
    const id = visitor(request), attachmentId = request.nextUrl.searchParams.get('id');
    if (!attachmentId || !/^[0-9a-f-]{36}$/.test(attachmentId)) return new Response(null,{ status:400 });
    const upstream = await fetch(`${apiBase()}/community/uploads/${attachmentId}`,{ method:'DELETE',headers:visitorHeader(id),signal:AbortSignal.timeout(5000) });
    return upstream.ok ? NextResponse.json({ ok:true }) : upstreamError(upstream);
  } catch { return unavailable(); }
}
