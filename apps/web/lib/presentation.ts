import type { ProjectStatus } from './contracts';
export const statusLabels: Record<ProjectStatus, string> = {
  PLANNED: 'En planificación', IN_DEVELOPMENT: 'En desarrollo', DEMO_AVAILABLE: 'Demo disponible',
  COMPLETED: 'Completado', ARCHIVED: 'Archivado',
};
export function safeUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null; }
  catch { return null; }
}
export function dateLabel(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('es', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
}
export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const mainStack = ['React', 'Next.js', 'TypeScript', 'Node.js', 'NestJS', 'Express.js'];
