import { NextRequest } from 'next/server';
import { apiBase,privateHeaders,unavailable,visitor,visitorHeader } from '../../../../../lib/community-server';
import { ownerHeaders } from '../../../../../lib/community-admin-server';
export const runtime = 'nodejs';
export async function GET(request:NextRequest,{ params }:{ params:Promise<{ id:string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response(null,{ status:404 });
  try {
    const response = await fetch(`${apiBase()}/community/media/${id}`,{ headers:{ ...visitorHeader(visitor(request)),...ownerHeaders(request) },cache:'no-store',signal:AbortSignal.timeout(6000) });
    if (!response.ok) return new Response(null,{ status:response.status === 404 ? 404:503 });
    return new Response(response.body,{ headers:{ ...privateHeaders,'Content-Type':'image/webp','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox" } });
  } catch { return unavailable(); }
}
