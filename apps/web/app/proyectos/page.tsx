import Link from 'next/link';
import { getProjects, getTechnologies } from '../../lib/api';
import { projectStatuses } from '../../lib/contracts';
import { slugPattern, statusLabels } from '../../lib/presentation';
import { pageMetadata } from '../../lib/seo';
import { EmptyState, PageIntro, Pagination, Unavailable } from '../../components/ui';
import { ProjectList } from '../../components/projects';

export const metadata = pageMetadata('Proyectos', 'Proyectos publicados: contexto, arquitectura, tecnologías y estados reales de desarrollo.', '/proyectos');
export default async function ProjectsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const status = typeof params.status === 'string' && projectStatuses.includes(params.status as typeof projectStatuses[number]) ? params.status : '';
  const technology = typeof params.technology === 'string' && params.technology.length <= 120 && slugPattern.test(params.technology) ? params.technology : '';
  const page = typeof params.page === 'string' && /^\d+$/.test(params.page) && Number(params.page) >= 1 && Number(params.page) <= 100000 ? Number(params.page) : 1;
  const query = new URLSearchParams({ page: String(page), limit: '8', ...(status && { status }), ...(technology && { technology }) });
  const [projects, technologies] = await Promise.all([getProjects(query.toString()), getTechnologies()]);
  return <div className="site-width"><PageIntro label="Trabajo seleccionado" title="Proyectos, de principio a contexto." description="El problema, las decisiones y la implementación. Una mirada a cada proyecto más allá de su interfaz." /><div className="page-content">
    <form className="filters" action="/proyectos" method="get"><div className="field"><label htmlFor="project-status">Estado del proyecto</label><select id="project-status" name="status" defaultValue={status}><option value="">Todos los estados</option>{projectStatuses.map(value => <option value={value} key={value}>{statusLabels[value]}</option>)}</select></div>
      <div className="field"><label htmlFor="project-technology">Tecnología</label><select id="project-technology" name="technology" defaultValue={technology}><option value="">Todas las tecnologías</option>{technologies.status === 'ok' && technologies.data.data.filter(item => item.slug !== 'angular' && !/^angular(?:js)?$/i.test(item.name.trim())).map(item => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select></div>
      <button className="button-primary" type="submit">Aplicar filtros <span aria-hidden="true">→</span></button>{(status || technology) && <Link href="/proyectos" className="text-link mb-3">Limpiar filtros</Link>}
    </form>
    {projects.status !== 'ok' ? <Unavailable /> : <><p className="text-xs text-muted mb-5" aria-live="polite">{projects.data.meta.total} {projects.data.meta.total === 1 ? 'proyecto disponible' : 'proyectos disponibles'}</p>{projects.data.data.length ? <ProjectList projects={projects.data.data} /> : <EmptyState title={status || technology ? 'Sin coincidencias por ahora.' : 'Un espacio para el trabajo que viene.'}>{status || technology ? 'Prueba con otro estado o tecnología para explorar los proyectos disponibles.' : 'Los proyectos aparecerán aquí cuando estén disponibles para consulta pública.'}</EmptyState>}<Pagination page={page} totalPages={projects.data.meta.totalPages} path="/proyectos" query={{ ...(status && { status }), ...(technology && { technology }) }} /></>}
  </div></div>;
}
