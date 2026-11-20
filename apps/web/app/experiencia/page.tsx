import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { CertificateGallery } from '../../components/certificate-gallery';
import { PortfolioRibbonWalk } from '../../components/portfolio-ribbon-walk';
import { pageMetadata } from '../../lib/seo';
import { careerSource, founder, careerExperience, careerEducation, careerCertifications } from '../../lib/career';
import { CareerMotion } from './career-motion';
import './career.css';

export const metadata = pageMetadata(
  'Trayectoria · Yerko Barrera',
  'Experiencia de Yerko Barrera en YB Veltrix Solutions, ingeniería de software, inteligencia artificial y soporte TI. Formación y certificaciones.',
  '/experiencia',
);

const sections = [
  ['liderazgo', 'Liderazgo'],
  ['experiencia', 'Experiencia'],
  ['formacion', 'Formación'],
  ['credenciales', 'Credenciales'],
] as const;

const cvUrl = '/documents/Yerko-Barrera-CV.pdf';
const cvName = 'CV-Yerko-Barrera.pdf';

const [engineering, programming] = careerEducation;
const academicHighlights = [
  { label: 'Título técnico', name: programming.degree, institution: programming.institution, logo: 'aiep', certificate: 'certificado-titulo-tecnico' },
  { label: 'Título profesional', name: 'Ingeniero en Computación e Informática', institution: engineering.institution, logo: 'unab', certificate: 'certificado-titulo-profesional' },
  { label: 'Grado académico', name: 'Licenciado en Ingeniería', institution: engineering.institution, logo: 'unab', certificate: 'certificado-licenciatura' },
] as const;

const companyLogos: Record<string, string> = {
  outlier: 'outlier',
  reimpact: 'reimpact',
  belator: 'belator',
  'tic-services': 'tic-services',
};

const iconPaths = {
  work: 'M3 7h18v13H3zM8 7V4h8v3M3 12a22 22 0 0 0 18 0m-9 1v2',
  education: 'M2 9l10-5 10 5-10 5L2 9Zm4 2v6c3 3 9 3 12 0v-6m4-2v7',
  organization: 'M3 21h18M5 21V8l7-4 7 4v13M10 21v-4h4v4M8 10h.01m4 0h.01m4 0h.01M8 13h.01m4 0h.01m4 0h.01',
  language: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0 0c5-4 5-16 0-20m0 20c-5-4-5-16 0-20M2 12h20',
  certificate: 'M4 4h16v13h-5m-6 0H4V4Zm4 4h8m-8 4h4m4 7v3l-2-1-2 1v-3m2 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  download: 'M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5',
};

function CareerIcon({ kind }: { kind: keyof typeof iconPaths }) {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={iconPaths[kind]} /></svg>;
}

function Period({ start, end, period }: { start: string; end?: string | null; period: string }) {
  const [from, to] = period.split(' — ');
  return <p className="career-period">
    <time dateTime={start}>{from}</time><span aria-hidden="true"> — </span>
    {end ? <time dateTime={end}>{to}</time> : <span className="career-current">Actualidad</span>}
  </p>;
}

function TimelineItem({ title, organization, logo, kind, start, end, period, children }: {
  title: string; organization: string; logo?: string; kind: 'work' | 'education';
  start: string; end?: string | null; period: string; children: ReactNode;
}) {
  return <li className="career-entry" data-career-reveal>
    <Period start={start} end={end} period={period} />
    <span className="career-marker" aria-hidden="true"><CareerIcon kind={kind} /></span>
    <article className="career-entry-body">
      <div className="career-identity">
        {logo ? <Image src={`/images/career/${logo}.jpg`} alt="" width={42} height={42} /> :
          <span className="career-logo-fallback"><CareerIcon kind="organization" /></span>}
        <div><h3>{title}</h3><p className="career-organization">{organization}</p></div>
      </div>
      {children}
    </article>
  </li>;
}

function Responsibilities({ items }: { items: readonly string[] }) {
  const highlights = items.slice(0, 2);
  const more = items.slice(2);
  return <>
    <ul className="career-contributions">{highlights.map(item => <li key={item}>{item}</li>)}</ul>
    {more.length > 0 && <details className="career-more">
      <summary>Más responsabilidades <span aria-hidden="true">+</span></summary>
      <ul className="career-contributions">{more.map(item => <li key={item}>{item}</li>)}</ul>
    </details>}
  </>;
}

export default function ExperiencePage() {
  return <div className="career-page">
    <header className="career-banner">
      <div className="career-width career-banner-grid">
        <div className="career-intro">
          <h1>Trayectoria</h1>
          <p>Del soporte TI a la ingeniería de software. Hoy reúno esas experiencias en YB Veltrix Solutions.</p>
          <a href={cvUrl} download={cvName} className="career-banner-cv"><CareerIcon kind="download" /> Descargar CV</a>
        </div>
        <figure className="career-banner-visual">
          <span className="career-banner-trace" aria-hidden="true" />
          <div className="career-portrait">
            <Image src="/images/yerko-linkedin.jpg" width={400} height={400} sizes="(max-width: 760px) 132px, 214px"
              alt="Retrato de Yerko Barrera" preload />
          </div>
        </figure>
      </div>
    </header>
    <div className="career-width career-content">
      <nav className="career-index" aria-label="Secciones de Trayectoria">
        {sections.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </nav>

      <CareerMotion>
        <section id="liderazgo" className="career-section career-leadership" aria-labelledby="founder-title">
          <h2 id="founder-title">Liderazgo</h2>
          <ol className="career-timeline">
            <TimelineItem title={`${founder.role} · Full Stack Developer`} organization={founder.company}
              logo="veltrix" kind="work" start={founder.start} period={founder.period}>
              <p className="career-meta">{founder.type} · {founder.location}</p>
              <p className="career-summary">{founder.description}</p>
              <Responsibilities items={founder.responsibilities} />
              <ul className="career-stack" aria-label="Tecnologías de YB Veltrix Solutions">
                {founder.stack.map(tool => <li key={tool}>{tool}</li>)}
              </ul>
              <a href="https://www.linkedin.com/company/122623943/" target="_blank" rel="noopener noreferrer" className="career-link">
                Conocer Veltrix en LinkedIn <span aria-hidden="true">↗</span>
              </a>
            </TimelineItem>
          </ol>
        </section>

        <section id="experiencia" className="career-section" aria-labelledby="experience-title">
          <h2 id="experience-title">Experiencia profesional</h2>
          <ol className="career-timeline">
            {careerExperience.map(job => <TimelineItem key={job.id} title={job.role} organization={job.company}
              logo={companyLogos[job.id]} kind="work" start={job.start} end={job.end} period={job.period}>
              {'context' in job && <p className="career-context">{job.context}</p>}
              <p className="career-meta">{job.type} · {job.location}</p>
              <p className="career-summary">{job.summary}</p>
              <Responsibilities items={job.responsibilities} />
            </TimelineItem>)}
          </ol>
        </section>

        <section id="formacion" className="career-section" aria-labelledby="education-title">
          <h2 id="education-title">Formación académica</h2>
          <div className="career-academic-highlights" aria-labelledby="academic-highlights-title">
            <h3 id="academic-highlights-title">Títulos y grado académico</h3>
            <PortfolioRibbonWalk><ul>
              {academicHighlights.map(item => <li key={item.label} data-ribbon-project={item.certificate} data-institution={item.logo}>
                <p>{item.label}</p>
                <h4>{item.name}</h4>
                <span className="career-academic-institution">{item.institution}</span>
                <a className="career-academic-document" href={`/images/career/${item.certificate}.webp`}
                  target="_blank" rel="noopener noreferrer" aria-label={`Ver certificado de ${item.name} en otra pestaña`}>
                  <span className="career-academic-preview">
                    <Image src={`/images/career/${item.certificate}.webp`} alt="" width={1300} height={1680}
                      sizes="(max-width: 680px) 260px, 220px" />
                    <span className="career-academic-stamp" data-ribbon="" aria-hidden="true">
                      <span className="career-academic-diagonal">
                        <span className="career-academic-ribbon">{item.logo.toUpperCase()}</span>
                      </span>
                      <span className="career-academic-seal">
                        <Image src={`/images/career/${item.logo}.jpg`} alt="" width={42} height={42} />
                      </span>
                    </span>
                  </span>
                  <span>Ver certificado <span aria-hidden="true">↗</span></span>
                </a>
              </li>)}
            </ul></PortfolioRibbonWalk>
            <p className="career-academic-note">Copias de consulta con datos personales y códigos de verificación ocultos.</p>
          </div>
          <ol className="career-timeline">
            {careerEducation.map(item => <TimelineItem key={item.institution} title={item.degree} organization={item.institution}
              logo={item.institution === 'AIEP' ? 'aiep' : 'unab'} kind="education" start={item.start} end={item.end} period={item.period}>
              <p className="career-summary">{item.detail}</p>
            </TimelineItem>)}
          </ol>
          <p className="career-language"><CareerIcon kind="language" /><strong>Inglés</strong><span>Competencia básica, según mi perfil de LinkedIn.</span></p>
        </section>
      </CareerMotion>

      <section id="credenciales" className="career-section" aria-labelledby="certifications-title">
        <h2 id="certifications-title" className="career-heading-icon"><CareerIcon kind="certificate" /> Cursos y credenciales</h2>
        <CertificateGallery certificates={careerCertifications} />
        <p className="career-source">Datos adaptados de <a href={careerSource} target="_blank" rel="noopener noreferrer">mi perfil de LinkedIn ↗</a>. Revisión de noviembre de 2026. Los vencimientos corresponden a lo publicado en el perfil.</p>
      </section>

      <div className="career-outro">
        <Link href="/contacto" className="career-contact">Conversemos <span aria-hidden="true">↗</span></Link>
        <a href={cvUrl} download={cvName} className="career-link">Descargar mi CV <span aria-hidden="true">↓</span></a>
      </div>
    </div>
  </div>;
}
