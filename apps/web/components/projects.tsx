import Link from 'next/link';
import Image from 'next/image';
import type { Project } from '../lib/contracts';
import { StatusBadge } from './ui';
import { Arrow } from './icons';
import { safeUrl } from '../lib/presentation';

export function imageSource(value: string | null): string | null {
  if (!value) return null;
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  const url = safeUrl(value);
  const hosts = (process.env.IMAGE_HOSTS ?? '').split(',').map(host => host.trim());
  return url && new URL(url).protocol === 'https:' && hosts.includes(new URL(url).hostname) ? url : null;
}
export function ProjectImage({ src, alt, priority = false }: { src: string | null; alt: string; priority?: boolean }) {
  const approved = imageSource(src);
  if (!approved) return null;
  return <div className="project-image"><Image src={approved} alt={alt} fill sizes="(max-width: 760px) 100vw, 50vw" preload={priority} /></div>;
}
export function ProjectList({ projects }: { projects: Project[] }) {
  return <div className="project-list">{projects.map((project, index) => index === 0 && project.isFeatured ? <FeaturedProject project={project} key={project.slug} /> : <article className={`project-row ${index % 2 ? 'project-row--offset' : ''}`} key={project.slug}>
    <span className="project-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
    <div className="project-row-body"><div className="flex flex-wrap gap-4 items-center mb-3"><StatusBadge status={project.status} />{project.isFeatured && <span className="small-label">DESTACADO</span>}</div><h3><Link href={`/proyectos/${encodeURIComponent(project.slug)}`}>{project.name}<Arrow diagonal /></Link></h3>{project.summary && <p className="muted mt-3 max-w-2xl">{project.summary}</p>}<div className="tags mt-5">{project.technologies.map(technology => <span key={technology.slug}>{technology.name}</span>)}</div></div>
    <ProjectImage src={project.coverImageUrl} alt={`Vista de ${project.name}`} />
  </article>)}</div>;
}
function FeaturedProject({ project }: { project: Project }) {
  const hasImage = !!imageSource(project.coverImageUrl);
  return <article className={`project-feature ${hasImage ? 'project-feature--visual' : ''}`}><div className="project-feature-copy"><p className="eyebrow mb-5">CASO DESTACADO <span aria-hidden="true">↗</span></p><StatusBadge status={project.status} /><h3><Link href={`/proyectos/${encodeURIComponent(project.slug)}`}>{project.name}<Arrow diagonal /></Link></h3>{project.summary && <p className="muted mt-4 mb-5 max-w-xl">{project.summary}</p>}<div className="tags">{project.technologies.map(item => <span key={item.slug}>{item.name}</span>)}</div><Link href={`/proyectos/${encodeURIComponent(project.slug)}`} className="text-link mt-8">Explorar el caso <Arrow /></Link></div>{hasImage && <Link href={`/proyectos/${encodeURIComponent(project.slug)}`} className="project-feature-visual" aria-label={`Ver el caso de ${project.name}`} tabIndex={-1}><ProjectImage src={project.coverImageUrl} alt={`Vista de ${project.name}`} /></Link>}</article>;
}
