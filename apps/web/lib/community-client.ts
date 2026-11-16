"use client";
import { useEffect,useSyncExternalStore } from 'react';
import { isCommunityData,type CommunityData,type Emoji,type Sort } from '../../../packages/community/src/contracts';
import { loadVisitStats,type VisitStats } from './browser-visits';
type Snapshot = { data:CommunityData | null; visits:VisitStats | null; loading:boolean; saving:boolean; error:string | null; sort:Sort; page:number; version:number };
const initial:Snapshot = { data:null,visits:null,loading:true,saving:false,error:null,sort:'recent',page:1,version:0 };
let state = initial; const listeners = new Set<() => void>();
function publish(patch:Partial<Snapshot>) { state = { ...state,...patch }; listeners.forEach(listener => listener()); }
let pending:Promise<void> | null = null; let initialized = false;
export async function refreshCommunity(sort:Sort = state.sort,page = state.page) {
  if (pending) return pending;
  publish({ loading:true,sort,page });
  pending = (async () => {
    try {
      if (!initialized) { const visits = await loadVisitStats().catch(() => null); publish({ visits }); initialized = !!visits; }
      const response = await fetch(`/api/community?sort=${sort}&page=${page}`,{ cache:'no-store',signal:AbortSignal.timeout(10000) });
      const data:unknown = await response.json();
      if (!response.ok || !isCommunityData(data)) throw new Error();
      publish({ data,error:null,version:state.version+1 });
    } catch { publish({ error:'No pudimos cargar la comunidad. Puedes guardar tu idea y volver a intentar.' }); }
    finally { pending = null; publish({ loading:false }); }
  })(); return pending;
}
async function mutate(input:Record<string,unknown>):Promise<Record<string,unknown> | null> {
  if (state.saving) return null;
  publish({ saving:true,error:null });
  try {
    const response = await fetch('/api/community',{ method:'POST',headers:{ 'Content-Type':'application/json' },body:JSON.stringify(input),signal:AbortSignal.timeout(12000) });
    const result = await response.json() as Record<string,unknown>;
    if (!response.ok || result.ok !== true) throw new Error(typeof result.error === 'string' ? result.error : 'No se pudo enviar. Tu borrador se conserva.');
    await refreshCommunity(); return result;
  } catch(error) { publish({ error:error instanceof Error ? error.message : 'No se pudo enviar.' }); return null; }
  finally { publish({ saving:false }); }
}
export function useCommunity() {
  const snapshot = useSyncExternalStore(listener => { listeners.add(listener); return () => { listeners.delete(listener); }; },() => state,() => initial);
  useEffect(() => { if (!state.data) void refreshCommunity(); },[]);
  return { ...snapshot,refresh:refreshCommunity,like:async () => !!await mutate({ action:'like',liked:!state.data?.liked }),react:(emoji:Emoji | null,commentId?:string) => mutate({ action:'react',emoji,commentId }),comment:(input:Record<string,unknown>) => mutate({ ...input,action:'comment' }),report:(input:Record<string,unknown>) => mutate({ ...input,action:'report' }) };
}
