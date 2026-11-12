import { getCertifications, getEducation, getExperience } from '../../lib/api';
import { dateLabel } from '../../lib/presentation';
import { pageMetadata } from '../../lib/seo';
import { EmptyState, ExternalLink, PageIntro, SectionHeading, Unavailable } from '../../components/ui';
import { Timeline } from '../../components/timeline';

export const metadata = pageMetadata('Experiencia y formación', 'Trayectoria profesional, formación académica y certificaciones verificables.', '/experiencia');
export default async function ExperiencePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const number = (key: string) => typeof params[key] === 'string' && /^\d+$/.test(params[key]) && Number(params[key]) >= 1 && Number(params[key]) <= 100000 ? Number(params[key]) : 1;
  const e = number('experiencia'), d = number('formacion'), c = number('certificaciones');
  const [experience, education, certifications] = await Promise.all([getExperience(e), getEducation(d), getCertifications(c)]);
  return <div className="site-width"><PageIntro label="Trayectoria profesional" title="Experiencia que se construye." description="El recorrido profesional, la formación y las credenciales, presentados con contexto y sin adornar lo que aún está por escribir." /><div className="page-content">
    <section><SectionHeading number="01" label="Experiencia" title="Trabajo y responsabilidades." />{experience.status !== 'ok' ? <Unavailable /> : experience.data.data.length ? <><Timeline items={experience.data.data} /><HistoryPagination current={e} total={experience.data.meta.totalPages} field="experiencia" params={params} /></> : <EmptyState title="La experiencia tendrá su lugar aquí.">Los roles y responsabilidades se mostrarán cuando exista información profesional disponible.</EmptyState>}</section>
    <section className="mt-16"><SectionHeading number="02" label="Formación" title="Una base para seguir aprendiendo." />{education.status !== 'ok' ? <Unavailable /> : education.data.data.length ? <>{education.data.data.map((item, i) => <article className="timeline-item" key={i}><p className="timeline-date">{dateLabel(item.startedAt)}{item.completedAt ? ` — ${dateLabel(item.completedAt)}` : ''}</p><div><h3>{item.degree}</h3><p className="organization">{item.institution}{item.fieldOfStudy ? ` · ${item.fieldOfStudy}` : ''}</p>{item.description && <p className="prose-text">{item.description}</p>}</div></article>)}<HistoryPagination current={d} total={education.data.meta.totalPages} field="formacion" params={params} /></> : <EmptyState title="Formación, con contexto.">La información académica aparecerá en esta sección cuando esté disponible.</EmptyState>}</section>
    <section className="mt-16"><SectionHeading number="03" label="Certificaciones" title="Conocimiento con respaldo." />{certifications.status !== 'ok' ? <Unavailable /> : certifications.data.data.length ? <>{certifications.data.data.map((item, i) => <article className="timeline-item" key={i}><p className="timeline-date">{dateLabel(item.issuedAt)}</p><div><h3>{item.name}</h3><p className="organization">{item.issuer}</p>{item.expiresAt && <p className="text-xs text-muted mb-3">Vencimiento: {dateLabel(item.expiresAt)}</p>}<ExternalLink href={item.credentialUrl}>Consultar credencial</ExternalLink></div></article>)}<HistoryPagination current={c} total={certifications.data.meta.totalPages} field="certificaciones" params={params} /></> : <EmptyState title="Solo credenciales verificables.">Las certificaciones obtenidas se mostrarán aquí junto a su entidad emisora y credencial, cuando estén disponibles.</EmptyState>}</section>
  </div></div>;
}
function HistoryPagination({ current, total, field, params }: { current: number; total: number; field: string; params: Record<string, string | string[] | undefined> }) {
  if (total < 2) return null;
  const query = Object.fromEntries(Object.entries(params).filter((item): item is [string, string] => typeof item[1] === 'string'));
  // Pagination usa page; esta sección conserva un nombre propio para no mover las otras listas.
  return <nav className="pagination" aria-label={`Paginación de ${field}`}><div>{current > 1 && <a href={`?${new URLSearchParams({ ...query, [field]: String(current - 1) })}`}>← Anterior</a>}</div><span>Página {current} de {total}</span><div>{current < total && <a href={`?${new URLSearchParams({ ...query, [field]: String(current + 1) })}`}>Siguiente →</a>}</div></nav>;
}
