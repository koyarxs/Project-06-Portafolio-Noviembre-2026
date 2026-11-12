import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProject } from '../../../lib/api';
import { pageMetadata } from '../../../lib/seo';
import { safeUrl, slugPattern } from '../../../lib/presentation';
import { ExternalLink, PageIntro, StatusBadge, Unavailable } from '../../../components/ui';
import { ProjectImage } from '../../../components/projects';
import { CaseStudyChapter, TechnicalEvidence } from '../../../components/case-study';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slugPattern.test(slug) || slug.length > 220) notFound();
  const result = await getProject(slug);
  if (result.status === 'missing') notFound();
  return result.status === 'ok' ? pageMetadata(result.data.data.name, result.data.data.summary ?? 'Contexto técnico y desarrollo del proyecto.', `/proyectos/${slug}`) : { title: 'Proyecto no disponible', robots: { index: false } };
}
function verified(value: string | null, key: 'VERIFIED_DEMO_URLS' | 'VERIFIED_DEPLOYMENT_URLS') {
  const url = safeUrl(value);
  return url && (process.env[key] ?? '').split(',').map(item => safeUrl(item.trim())).includes(url) ? url : null;
}
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slugPattern.test(slug) || slug.length > 220) notFound();
  const result = await getProject(slug);
  if (result.status === 'missing') notFound();
  if (result.status !== 'ok') return <div className="site-width page-content"><PageIntro label="Proyectos" title="Un momento para reconectar." description="El detalle de este proyecto no está disponible en este momento." /><Unavailable /><Link className="text-link mt-6" href="/proyectos">← Volver a proyectos</Link></div>;
  const project = result.data.data;
  const demo = verified(project.demoUrl, 'VERIFIED_DEMO_URLS');
  const deployments = project.deployments.filter(item => item.deploymentStatus === 'ACTIVE' && verified(item.deploymentUrl, 'VERIFIED_DEPLOYMENT_URLS'));
  return <div className="site-width"><div className="pt-9"><Link href="/proyectos" className="text-link">← Todos los proyectos</Link></div><PageIntro label="Caso de proyecto" title={project.name} description={project.summary ?? 'Contexto y desarrollo del proyecto.'} /><div className="mb-9"><StatusBadge status={project.status} /></div><div className="page-content">
    <ProjectImage src={project.coverImageUrl} alt={`Vista de ${project.name}`} priority />
    <div className="detail-grid mt-10"><div className="detail-body">{[['El contexto', project.description, 'contexto'], ['El problema', project.problem, 'problema'], ['La solución', project.solution, 'solucion'], ['Arquitectura', project.architecture, 'arquitectura'], ['Desafíos técnicos', project.technicalChallenges, 'desafios']].map(([title, text, id], index) => <CaseStudyChapter key={id} id={id!} number={String(index + 1).padStart(2, '0')} title={title!} text={text} />)}
      {project.media.length > 0 && <section><h2>Evidencias del trabajo</h2><div className="gallery">{project.media.map((media, index) => <TechnicalEvidence key={`${media.url}-${index}`} media={media} projectName={project.name} />)}</div></section>}
    </div><aside className="detail-aside"><h2>Tecnologías</h2><div className="tags">{project.technologies.map(item => <span key={item.slug}>{item.name}</span>)}</div><div className="detail-links"><ExternalLink href={project.repositoryUrl}>Repositorio público</ExternalLink><ExternalLink href={project.documentationUrl}>Documentación</ExternalLink>{demo && <ExternalLink href={demo}>Explorar demo</ExternalLink>}</div>{deployments.length > 0 && <><h2>Despliegues activos</h2><div className="detail-links">{deployments.map((item, index) => <ExternalLink key={index} href={item.deploymentUrl}>{item.provider}</ExternalLink>)}</div></>}</aside></div>
  </div></div>;
}
