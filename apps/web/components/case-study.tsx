import type { ProjectDetail } from '../lib/contracts';
import { ProjectImage } from './projects';
import { ExternalLink } from './ui';

export function CaseStudyChapter({ number, title, text, id }: { number: string; title: string; text: string | null; id: string }) {
  if (!text) return null;
  return <section className="case-chapter" id={id}><span className="case-chapter-number" aria-hidden="true">{number}</span><div><h2>{title}</h2><p className="prose-text">{text}</p></div></section>;
}

export function TechnicalEvidence({ media, projectName }: { media: ProjectDetail['media'][number]; projectName: string }) {
  const kind = /^seguridad\s*:/i.test(media.caption ?? '') ? 'Seguridad' : /^(pruebas|testing)\s*:/i.test(media.caption ?? '') ? 'Pruebas' : media.mediaType === 'DIAGRAM' ? 'Arquitectura' : media.mediaType === 'VIDEO' ? 'Video' : 'Captura';
  return <figure className="technical-evidence"><div className="evidence-heading"><span className="small-label">{kind}</span><span aria-hidden="true">↗</span></div>{media.mediaType === 'VIDEO' ? <ExternalLink href={media.url}>Ver video del proyecto</ExternalLink> : <><ProjectImage src={media.url} alt={media.altText ?? `${kind} de ${projectName}`} /><ExternalLink href={media.url}>Abrir recurso original</ExternalLink></>}{media.caption && <figcaption>{media.caption}</figcaption>}</figure>;
}
