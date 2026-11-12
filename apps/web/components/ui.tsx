import Link from 'next/link';
import type { ReactNode } from 'react';
import { Arrow } from './icons';
import { safeUrl, statusLabels } from '../lib/presentation';
import type { Profile, ProjectStatus } from '../lib/contracts';

export function SectionHeading({ number, label, title, description, children }: { number: string; label: string; title: string; description?: string; children?: ReactNode }) {
  return <div className="section-heading"><div><p className="eyebrow"><span>{number}</span> {label}</p><h2>{title}</h2>{description && <p className="muted max-w-xl mt-3">{description}</p>}</div>{children}</div>;
}
export function PageIntro({ label, title, description }: { label: string; title: string; description: string }) {
  return <div className="page-intro"><p className="eyebrow">{label}</p><h1>{title}</h1><p>{description}</p></div>;
}
export function EmptyState({ title, children, unavailable = false }: { title: string; children: ReactNode; unavailable?: boolean }) {
  return <div className={`empty-state ${unavailable ? 'unavailable' : ''}`} role={unavailable ? 'status' : undefined}><span className="empty-mark" aria-hidden="true">{unavailable ? '…' : '↗'}</span><div><h3>{title}</h3><p>{children}</p></div></div>;
}
export function Unavailable() { return <EmptyState title="Una pausa en la conexión" unavailable>Este contenido no está disponible en este momento. Puedes volver a intentarlo en unos instantes.</EmptyState>; }
export function StatusBadge({ status }: { status: ProjectStatus }) { return <span className={`status-badge status-${status.toLowerCase()}`}><span aria-hidden="true" />{statusLabels[status]}</span>; }
export function ExternalLink({ href, children, className = 'text-link' }: { href: string | null | undefined; children: ReactNode; className?: string }) {
  const url = safeUrl(href);
  if (!url) return null;
  return <a href={url} className={className} target="_blank" rel="noopener noreferrer">{children}<Arrow diagonal /><span className="sr-only"> (abre en otra pestaña)</span></a>;
}
export function SocialLinks({ profile }: { profile: Profile | null }) {
  if (!profile) return null;
  return <div className="social-links"><ExternalLink href={profile.githubUrl}>GitHub</ExternalLink><ExternalLink href={profile.linkedinUrl}>LinkedIn</ExternalLink><ExternalLink href={profile.resumeUrl}>Currículum</ExternalLink></div>;
}
export function Pagination({ page, totalPages, path, query = {} }: { page: number; totalPages: number; path: string; query?: Record<string, string> }) {
  if (totalPages < 2) return null;
  const href = (target: number) => `${path}?${new URLSearchParams({ ...query, page: String(target) })}`;
  return <nav className="pagination" aria-label="Paginación"><div>{page > 1 && <Link href={href(page - 1)}>← Anterior</Link>}</div><span>Página {page} de {totalPages}</span><div>{page < totalPages && <Link href={href(page + 1)}>Siguiente →</Link>}</div></nav>;
}
