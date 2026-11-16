export type VisitStats = { total: number; today: number; online: number };
let pending: Promise<VisitStats> | null = null;
export function loadVisitStats(): Promise<VisitStats> {
  if (!pending) pending = fetch('/api/visitors', { method:'POST', signal:AbortSignal.timeout(6000) }).then(async response => {
    if (!response.ok) throw new Error('Unavailable');
    const data: unknown = await response.json();
    if (!data || typeof data !== 'object' || !['total','today','online'].every(key => Number.isSafeInteger((data as Record<string,unknown>)[key]) && (data as Record<string,number>)[key] >= 0)) throw new Error('Invalid');
    return data as VisitStats;
  }).finally(() => { pending = null; });
  return pending;
}
