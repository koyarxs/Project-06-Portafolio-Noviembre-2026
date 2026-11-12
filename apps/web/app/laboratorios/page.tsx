import { Suspense } from 'react';
import { getLab, getLabs } from '../../lib/api';
import { pageMetadata } from '../../lib/seo';
import { EmptyState, ExternalLink, PageIntro, Pagination, Unavailable } from '../../components/ui';

export const metadata = pageMetadata('Laboratorios de seguridad', 'Laboratorios de ciberseguridad publicados, metodología y documentación autorizada para divulgación.', '/laboratorios');
export default async function LabsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const page = typeof params.page === 'string' && /^\d+$/.test(params.page) && Number(params.page) > 0 && Number(params.page) <= 100000 ? Number(params.page) : 1;
  const labs = await getLabs(page);
  return <div className="site-width"><PageIntro label="Investigación y práctica" title="Seguridad, con responsabilidad." description="Un espacio para documentar laboratorios autorizados: metodología, herramientas y medidas de mitigación que puedan compartirse públicamente." /><div className="page-content">{labs.status !== 'ok' ? <Unavailable /> : labs.data.data.length ? <>{labs.data.data.map(lab => <details className="lab-entry" key={lab.slug}><summary>{lab.title}</summary><div className="lab-content">{lab.summary && <p className="prose-text mb-4">{lab.summary}</p>}<p className="small-label text-forest mb-5">{({ PLANNED: 'En planificación', IN_PROGRESS: 'En desarrollo', COMPLETED: 'Completado' })[lab.status]}</p><Suspense fallback={<p role="status">Cargando documentación…</p>}><LabContent slug={lab.slug} /></Suspense></div></details>)}<Pagination page={page} totalPages={labs.data.meta.totalPages} path="/laboratorios" /></> : <EmptyState title="La práctica también merece documentarse.">Los laboratorios aparecerán aquí cuando estén publicados y su documentación esté autorizada para divulgación.</EmptyState>}</div></div>;
}
async function LabContent({ slug }: { slug: string }) {
  const result = await getLab(slug);
  if (result.status !== 'ok') return <Unavailable />;
  const item = result.data.data;
  return <>{[['Descripción', item.description], ['Metodología', item.methodology], ['Mitigación', item.remediation]].filter(([, value]) => value).map(([title, value]) => <section key={title} className="mb-5"><h2 className="font-medium text-base mb-2">{title}</h2><p className="prose-text">{value}</p></section>)}{item.toolsUsed.length > 0 && <div className="tags mb-6">{item.toolsUsed.map(tool => <span key={tool}>{tool}</span>)}</div>}<div className="social-links"><ExternalLink href={item.repositoryUrl}>Repositorio</ExternalLink><ExternalLink href={item.reportUrl}>Consultar reporte</ExternalLink></div></>;
}
