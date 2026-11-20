import Image from 'next/image';
import Link from 'next/link';
import { ProjectFlipCard } from './project-flip-card';
import { CollectionFilter } from './collection-filter';
import { PortfolioRibbonWalk } from './portfolio-ribbon-walk';
import { ProjectGallery, type ProjectCapture } from './project-gallery';
import { publicWork, owner } from '../lib/owner';
import styles from './public-work.module.css';
import detail from './featured-project.module.css';
import { projectStories, type FeaturedSlug } from '../lib/featured-project-stories';
function GithubMark() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.03-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1.01 1.72 2.65 1.22 3.3.93.1-.73.4-1.22.71-1.5-2.5-.28-5.12-1.25-5.12-5.57 0-1.23.44-2.23 1.16-3.01-.12-.28-.5-1.43.11-2.97 0 0 .94-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.14-1.45 3.08-1.15 3.08-1.15.61 1.54.23 2.69.11 2.97.72.78 1.16 1.78 1.16 3.01 0 4.33-2.63 5.28-5.14 5.56.4.35.76 1.03.76 2.08v3.21c0 .3.21.65.78.54A11.2 11.2 0 0 0 12 .8Z"/></svg>;
}
function ExternalArrow() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>; }
const technologyIcons:Record<string,string> = { 'Next.js':'nextjs',NestJS:'nestjs',PostgreSQL:'postgresql','Django REST':'django',Angular:'angular',Prisma:'prisma','Prisma Next':'prisma',React:'react',TypeScript:'typescript',Python:'python','Tailwind CSS':'tailwindcss',Vitest:'vitest',Playwright:'playwright','GitHub Actions':'githubactions',Docker:'docker','Docker Compose':'docker',Hostinger:'hostinger' };
Object.assign(technologyIcons, {
  'Next.js (App Router)': 'nextjs', 'Node.js': 'nodejs', Django: 'django',
  'Django REST Framework': 'django', 'Django ORM': 'django', 'PostgreSQL 17': 'postgresql',
  'Next.js 16': 'nextjs', 'React 19': 'react', 'Tailwind CSS 4': 'tailwindcss',
  'NestJS 11': 'nestjs', Express: 'express', 'Prisma 6': 'prisma', 'Prisma Migrate': 'prisma', Jest: 'jest',
  'NestJS 12': 'nestjs', 'Node.js 24': 'nodejs', 'Angular 22': 'angular', 'PostgreSQL 18': 'postgresql',
  'Prisma 7': 'prisma', 'node-postgres': 'postgresql', 'PostgreSQL 16': 'postgresql', 'API REST': 'rest-api',
  'Playwright (revisión visual)': 'playwright', Postman: 'postman',
  JWT: 'jwt', 'Cloudflare Turnstile (opcional)': 'cloudflare', Selenium: 'selenium', 'Pruebas E2E': 'pipeline',
});
const pawlyIconPaths: Record<string, string> = {
  'Lucide React': 'M12 2 9 9l-7 3 7 3 3 7 3-7 7-3-7-3z',
  Motion: 'M3 16h6l4-8 3 5h5',
  RxJS: 'M3 12h4l3-7 4 14 3-7h4',
  Joi: 'M4 5h16v14H4zM8 12l3 3 5-6',
  Argon2id: 'M14 8a4 4 0 1 1-4-4 4 4 0 0 1 4 4Zm-3 4 8 8m-3-3 2-2',
  'Sesiones con cookies': 'M21 12a9 9 0 1 1-9-9 5 5 0 0 0 9 9ZM8 11h.01m1 5h.01m5 0h.01',
  'Protección CSRF': 'M12 3 4 6v5c0 4 3 7 8 10 5-3 8-6 8-10V6l-8-3Zm-3 9 2 2 4-4',
  Helmet: 'M12 3 4 6v5c0 4 3 7 8 10 5-3 8-6 8-10V6l-8-3Z',
  'NestJS Throttler': 'M4 17a8 8 0 1 1 16 0M12 15l4-5',
  'Permisos por clínica': 'M5 10h14v10H5zM8 10V7a4 4 0 0 1 8 0v3m-4 4v2',
  'Mailpit (opcional)': 'M3 5h18v14H3zM3 14h5l2 2h4l2-2h5m-9-7v5m-2-2 2 2 2-2',
  Supertest: 'M9 3h6m-5 0v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M8 15h8',
  'Node.js Test Runner': 'M4 5h16v14H4zM7 9l3 3-3 3m6 0h4',
  ESLint: 'M4 5h16v14H4zM8 12l3 3 5-6',
  Prettier: 'M4 6h16M4 10h11M4 14h16M4 18h11',
};
const pawlyLayerIcons: Record<string, { tone: string; path: string }> = {
  Frontend: { tone: 'blue', path: 'M3 4h18v13H3zM8 21h8m-4-4v4M3 8h18' },
  Backend: { tone: 'violet', path: 'M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01' },
  'Base de datos y ORM': { tone: 'teal', path: 'M4 6c0-4 16-4 16 0s-16 4-16 0Zm0 0v12c0 4 16 4 16 0V6M4 12c0 4 16 4 16 0' },
  'Seguridad y autorización': { tone: 'rose', path: 'M12 3 4 6v5c0 4 3 7 8 10 5-3 8-6 8-10V6l-8-3Zm-3 9 2 2 4-4' },
  'Entorno local': { tone: 'amber', path: 'M4 5h16v14H4zM7 9l3 3-3 3m6 0h4' },
  'Pruebas y calidad': { tone: 'green', path: 'M9 3h6m-5 0v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M8 15h8' },
};
type Layer = { label: string; technologies: readonly string[] };
type Project = {
  slug: FeaturedSlug;
  name: string;
  image: string;
  href: string;
  site?: string;
  kind: string;
  description: string;
  private?: boolean;
  diagram?: boolean;
  captures?: readonly ProjectCapture[];
  video?: { src: string; caption: string };
};

export const featuredProjects: readonly Project[] = [
  ...publicWork.map(p => ({
    ...p,
    kind: p.name === 'FraudShield' ? 'Universidad · UNAB' : p.name === 'Falta Uno' ? 'Colaborativo' : 'Personal',
    diagram: p.name === 'FraudShield',
    captures: p.name === 'Zenvik' ? [
      { image: '/images/projects/zenvik-shifts.webp', title: 'Calendario de turnos', caption: 'Calendario para planificar los turnos del equipo.', width: 1280, height: 1185 },
      { image: '/images/projects/zenvik-leaves.webp', title: 'Permisos y ausencias', caption: 'Panel para revisar solicitudes de permisos y ausencias.', width: 1280, height: 802 },
    ] : undefined,
  })),
  {
    slug: 'flymaster',
    name: 'FlyMaster',
    image: '/images/projects/flymaster-preview.jpg',
    href: 'https://github.com/koyarxs/Project-02-FlyMaster-Octubre-2026',
    site: 'https://flymaster.cl',
    kind: 'Cliente · FlyMaster',
    description: 'Sitio comercial para explorar servicios con drones y conocer la oferta de formación para pilotos.',
    private: true,
    video: { src: '/images/projects/flymaster-demo.webm', caption: 'Recorrido sin audio por los servicios, la formación y los casos visuales del sitio público.' },
  },
  {
    slug: 'portafolio-profesional',
    name: 'Portafolio Profesional',
    image: '/images/projects/portafolio-preview.jpg',
    href: 'https://github.com/koyarxs/Project-06-Portafolio-Noviembre-2026',
    site: '/',
    kind: 'Personal',
    description: 'Portafolio full stack con proyectos, trayectoria y fichas con evidencia. Registra visitas y permite que los visitantes marquen el sitio con Me gusta.',
    video: { src: '/images/projects/portafolio-demo.webm', caption: 'Recorrido sin audio por la portada, los proyectos y sus fichas de evidencia.' },
  },
];
const descriptions: Record<string,string> = {
  Pawly: 'Reservas, agenda y gestión para una clínica veterinaria.',
  Zenvik: 'Trabajadores, turnos y permisos en una plataforma SaaS.',
  FraudShield: 'Análisis de transacciones y clasificación de riesgo.',
  'Falta Uno': 'Una comunidad para conectar personas a través del deporte.',
  FlyMaster: 'Sitio de servicios con drones y formación para pilotos.',
  'Portafolio Profesional': 'El sitio que estás visitando reúne mis proyectos, mi trayectoria y sus evidencias.',
};
const projectStates = [
  { id: 'complete', label: 'Completados', color: 'teal', icon: 'M12 2l3 2 3.6.4 1 3.5 2.4 2.7-1.5 3.3.1 3.6-3.4 1.3L15 22l-3-1.1L9 22l-2.2-3.2-3.4-1.3.1-3.6L2 10.6l2.4-2.7 1-3.5L9 4zM8 12l2.5 2.5L16 9' },
  { id: 'development', label: 'En desarrollo', color: 'blue', icon: 'M8 6l-6 6 6 6m8-12 6 6-6 6m-2-15-4 18' },
  { id: 'pending', label: 'Pendientes', color: 'amber', icon: 'M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
] as const;
const projectAreas = [
  { id: 'salud', label: 'Salud', color: 'rose', icon: 'M12 21 4.3 13.3a5.2 5.2 0 0 1 7.3-7.4l.4.4.4-.4a5.2 5.2 0 1 1 7.3 7.4ZM8 12h2l1-2 2 4 1-2h2' },
  { id: 'veterinaria', label: 'Veterinaria', color: 'violet', icon: 'M8 14c1-2 2-3 4-3s3 1 4 3l2 3c1 2-1 4-3 3l-3-1-3 1c-2 1-4-1-3-3zM5 10v.5m4-5V7m6-1.5V7m4 3v.5' },
  { id: 'pyme', label: 'Pyme', color: 'blue', icon: 'M4 11v10h16V11M3 8l2-5h14l2 5v3a3 3 0 0 1-4.5 0 3 3 0 0 1-4.5 0 3 3 0 0 1-4.5 0A3 3 0 0 1 3 11ZM3 8h18M10 21v-6h4v6' },
  { id: 'personal', label: 'Personal', color: 'violet', icon: 'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 21a8 8 0 0 1 16 0' },
  { id: 'finanzas', label: 'Finanzas', color: 'teal', icon: 'M4 4v16h16M8 15l4-4 3 2 5-6' },
  { id: 'deporte', label: 'Deporte', color: 'amber', icon: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM6 5l12 14M5 18 19 6M3 11c5 2 9-2 9-8m0 18c0-6 4-10 9-8' },
  { id: 'drones', label: 'Drones', color: 'cyan', icon: 'M2 6h6m8 0h6M5 6v5l4 2m10-7v5l-4 2M8 12h8v6H8zM11 15h2M6 18h12' },
] as const;
const areasByProject: Record<FeaturedSlug, readonly (typeof projectAreas)[number]['id'][]> = {
  pawly: ['salud', 'veterinaria', 'personal'],
  zenvik: ['pyme', 'personal'],
  fraudshield: ['finanzas'],
  'falta-uno': ['deporte'],
  flymaster: ['drones'],
  'portafolio-profesional': ['personal'],
};
type ProjectStatus = (typeof projectStates)[number]['id'] | 'unconfirmed';
export const projectStatuses: Record<FeaturedSlug, { id: ProjectStatus; label: string; newInPortfolio?: boolean }> = {
  pawly: { id: 'development', label: 'Demo en desarrollo' },
  zenvik: { id: 'development', label: 'MVP en desarrollo' },
  fraudshield: { id: 'complete', label: 'MVP académico estable' },
  'falta-uno': { id: 'development', label: 'En desarrollo' },
  flymaster: { id: 'complete', label: 'Sitio publicado' },
  'portafolio-profesional': { id: 'development', label: 'En desarrollo local', newInPortfolio: true },
};
const ribbonLabels = {
  complete: 'Completado',
  development: 'En desarrollo',
  pending: 'Pendiente',
  unconfirmed: 'Por confirmar',
  new: 'Nuevo',
};
const projectLogos: Record<FeaturedSlug, string> = {
  pawly: '/images/projects/porvenir-logo.png',
  zenvik: '/images/projects/zenvik-logo.png',
  fraudshield: '/images/projects/fraudshield-logo.png',
  'falta-uno': '/images/projects/falta-uno-logo.png',
  flymaster: '/images/projects/flymaster-logo.png',
  'portafolio-profesional': '/icon.png',
};

function projectTitle(project: Project) {
  return project.slug === 'pawly' ? 'Clínica Veterinaria Porvenir' : project.name;
}

function ProjectLogo({ slug }: { slug: FeaturedSlug }) {
  return <Image className={styles.projectLogo} src={projectLogos[slug]} alt="" width={78} height={42} unoptimized />;
}

function ProjectKind({ kind }: { kind: string }) {
  const icon = kind === 'Personal'
    ? 'M12 3v4m-2-2h4M7 10l-4 4 4 4m10-8 4 4-4 4m-4-8-2 8'
    : kind === 'Colaborativo'
      ? 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-4m-5-8a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm3-4a4 4 0 0 1 0 8'
      : 'M3 8h18v12H3zM8 8V4h8v4M3 12h18m-11 0v3h4v-3';

  return <span className={styles.kind}>
    {kind === 'Universidad · UNAB'
      ? <Image src="/images/career/unab.jpg" width={20} height={20} alt="" />
      : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icon} /></svg>}
    {kind === 'Universidad · UNAB' ? 'Universidad Andrés Bello' : kind}
  </span>;
}

function BrowserPreview({ name, image, diagram, slug }: Project) {
  const { width, height } = projectStories[slug].cover;
  return <div className={styles.browser}>
    <div className={styles.browserBar} aria-hidden="true"><span /><span /><span /><b>{diagram ? 'Esquema técnico' : name}</b></div>
    <div className={styles.browserScreen}>
      {diagram ? <div className={styles.diagram}><span>FraudShield</span><strong>CSV → Reglas → Riesgo</strong></div> :
        <Image src={image} alt={`Captura de escritorio de ${name}`} width={width} height={height}
          sizes="(max-width: 620px) 90vw, (max-width: 980px) 45vw, 360px" className={styles.screenshot} />}
    </div>
  </div>;
}

function ProjectStack({ layers, expanded = false, pawly = false }: { layers: readonly Layer[]; expanded?: boolean; pawly?: boolean }) {
  return <dl className={expanded ? `${detail.stack}${pawly ? ` ${detail.pawlyStack}` : ''}` : styles.stack}>
    {layers.map(({ label, technologies }) => {
      const layerIcon = pawly ? pawlyLayerIcons[label] : undefined;
      return <div key={label} data-tone={layerIcon?.tone}>
        <dt>{layerIcon && <span className={detail.pawlyLayerIcon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={layerIcon.path} /></svg>
        </span>}{label}</dt>
        <dd><ul>{technologies.map(name => <li key={name} title={name}>
          {technologyIcons[name] ?
            <Image src={`/images/stack/${technologyIcons[name]}.svg`} width={15} height={15} alt="" unoptimized /> :
            <svg className={pawly ? detail.pawlyTechIcon : undefined} width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={pawlyIconPaths[name] ?? 'm8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18'} />
            </svg>}
          {name}
        </li>)}</ul></dd>
      </div>;
    })}
  </dl>;
}

function RiskFlow() {
  return <ol className={detail.flow} aria-label="Flujo de análisis de FraudShield">
    <li><strong>CSV</strong><span>Transacciones</span></li>
    <li><strong>Reglas R1–R5</strong><span>Análisis</span></li>
    <li><strong>Riesgo</strong><span>Clasificación</span></li>
  </ol>;
}

const pawlyFeatures = [
  { label: 'Gestión de pacientes', icon: 'M9 12c1.2-1 4.8-1 6 0 1.3 1.2 3 3.1 3 5a2.5 2.5 0 0 1-2.5 2.5c-1.2 0-2.3-.7-3.5-.7s-2.3.7-3.5.7A2.5 2.5 0 0 1 6 17c0-1.9 1.7-3.8 3-5ZM5.5 11a2 2.6-25 1 0-3.6-1.7A2 2.6-25 0 0 5.5 11Zm5-3a2 2.6 0 1 0-4 0 2 2.6 0 0 0 4 0Zm7 0a2 2.6 0 1 0-4 0 2 2.6 0 0 0 4 0Zm4.6 1.3a2 2.6 25 1 0-3.6 1.7 2 2.6 25 0 0 3.6-1.7Z' },
  { label: 'Agenda y citas', icon: 'M7 3v4m10-4v4M3 10h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm4 10 2 2 4-4' },
  { label: 'Operación clínica', icon: 'M4 21V8h4m8 0h4v13M2 21h20M8 21V4h8v17m-6-11h4m-2-2v4m-1 9v-5h2v5' },
];

function PawlyDescription({ description, technical }: { description: string; technical: string }) {
  return <section id="descripcion" className={detail.pawlyOverview}>
    <div className={detail.pawlyIntro}>
      <p className={detail.pawlyCategory}>Sistema veterinario</p>
      <h2>Descripción</h2>
      <p className={detail.pawlySummary}>{description}</p>
      <ul className={detail.pawlyFeatures}>
        {pawlyFeatures.map(({ label, icon }) => <li key={label}>
          <span><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icon} /></svg></span>
          {label}
        </li>)}
      </ul>
    </div>
    <div className={detail.pawlyVisual}>
      <Image src="/images/projects/pawly-descripcion.webp" alt="" width={1000} height={667}
        sizes="(max-width: 700px) 90vw, (max-width: 1080px) 47vw, 420px" />
    </div>
    <dl className={detail.pawlyNotes}>
      <div>
        <dt>Propósito general</dt>
        <dd>Reunir la reserva de consultas, la agenda y la gestión de pacientes en una demo orientada a la Clínica Veterinaria Porvenir.</dd>
      </div>
      <div>
        <dt>Enfoque técnico</dt>
        <dd>{technical}</dd>
      </div>
    </dl>
  </section>;
}

const detailSections = [
  ['descripcion', 'Descripción'],
  ['capturas', 'Fotos y capturas'],
  ['video', 'Video de funcionamiento'],
  ['tecnologias', 'Tecnologías'],
] as const;

export function FeaturedProjectPage({ project }: { project: Project }) {
  const story = projectStories[project.slug];
  const cover = { image: project.image, ...story.cover };
  const captures = [cover, ...(project.captures ?? [])];

  return <article className={detail.page} data-theme={project.slug}>
    <header className={detail.banner}>
      <div className={detail.container}>
        <Link href="/#portafolio" className={detail.back}>← Volver al portafolio</Link>
        <div className={detail.hero}>
          <div className={detail.intro}>
            <p className={detail.kind}>{project.kind}</p>
            <div className={detail.projectIdentity}>
              <ProjectLogo slug={project.slug} />
              <h1>{projectTitle(project)}</h1>
            </div>
            <p className={detail.pitch}>{story.pitch}</p>
            <a className={detail.primary} href={project.video ? '#video' : '#capturas'}>
              {project.video ? 'Ver demo en video' : project.diagram ? 'Ver esquema técnico' : 'Ver capturas'}
              <span aria-hidden="true">↓</span>
            </a>
          </div>
          <figure className={detail.heroMedia}>
            <div className={detail.frame}>
              {project.diagram ? <RiskFlow /> :
                <Image src={cover.image} alt={cover.caption} width={cover.width} height={cover.height}
                  sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1200px) 52vw, 640px" preload />}
            </div>
            <figcaption>{project.diagram ? 'Esquema técnico · flujo de análisis' : cover.caption}</figcaption>
          </figure>
        </div>
      </div>
    </header>

    <div className={detail.container}>
      <nav className={detail.jumpLinks} aria-label="Contenido de la ficha">
        {detailSections.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </nav>
      <div className={detail.content}>
        {project.slug === 'pawly' ? <PawlyDescription description={project.description} technical={story.technical} /> :
        <section id="descripcion" className={detail.overview}>
          <div>
            <h2>Descripción</h2>
            <p className={detail.summary}>{project.description}</p>
          </div>
          <dl className={detail.context}>
            <div><dt>{story.contextLabel}</dt><dd>{story.context}</dd></div>
            <div><dt>Enfoque técnico</dt><dd>{story.technical}</dd></div>
          </dl>
        </section>}
        <section id="capturas">
          <h2>Fotos y capturas</h2>
          {project.diagram ?
            <div className={detail.diagramEvidence}><RiskFlow /><p>Esquema técnico del procesamiento de transacciones. Capturas de interfaz pendientes.</p></div> :
            <ProjectGallery captures={captures} projectName={project.name} />}
        </section>
        <section id="video">
          <h2>Video de funcionamiento</h2>
          {project.video ? <figure className={detail.demo}>
            <video controls playsInline preload="none" poster={cover.image} src={project.video.src} aria-label={`Demostración de ${project.name}`} />
            <figcaption>{project.video.caption}</figcaption>
          </figure> : <p>Demostración en video pendiente.</p>}
        </section>
        <section id="tecnologias">
          <h2>Tecnologías</h2>
          {story.technologyNote && <p className={detail.technologyNote}>{story.technologyNote}</p>}
          <ProjectStack layers={story.technologies} expanded pawly={project.slug === 'pawly'} />
          <div className={detail.links}>
            <a href={project.href} target="_blank" rel="noopener noreferrer"><GithubMark />{project.private ? 'GitHub · privado' : 'Ver en GitHub'}<ExternalArrow /></a>
            {project.site && <a href={project.site} target="_blank" rel="noopener noreferrer">Ver sitio<ExternalArrow /></a>}
          </div>
        </section>
      </div>
    </div>
  </article>;
}

function projectCardStack(slug: FeaturedSlug): Layer[] {
  return projectStories[slug].technologies.flatMap(({ label, technologies }, index) => {
    if (index < 3) return [{ label, technologies: technologies.slice(0, 4) }];
    const highlights = technologies.filter(name => name === 'Docker Compose' || name === 'Postman');
    return highlights.length ? [{ label, technologies: highlights }] : [];
  });
}

export function PublicWork() {
  const orderedProjects = [...featuredProjects].sort((first, second) =>
    Number(Boolean(projectStatuses[second.slug].newInPortfolio)) -
    Number(Boolean(projectStatuses[first.slug].newInPortfolio)));
  return <CollectionFilter label="Filtrar proyectos por estado" allLabel="Todos" options={projectStates} areas={projectAreas}
    gridClassName={styles.grid} showCounts items={orderedProjects.map(p => {
      const status = projectStatuses[p.slug];
      const ribbon = status.newInPortfolio ? 'new' : status.id;
      return { id: p.slug, category: status.id, areas: areasByProject[p.slug], content: <ProjectFlipCard name={p.name}>
        <article className={styles.card} aria-labelledby={`work-${p.slug}`} data-project={p.name} data-ribbon-project={p.slug}>
    <span className={styles.ribbon} data-ribbon={ribbon} aria-hidden={ribbon !== 'new' || undefined}>
      <span>{ribbonLabels[ribbon]}</span>
    </span>
    {p.diagram ? <div role="img" aria-label="Esquema técnico de FraudShield"><BrowserPreview {...p} /></div> : <a className={styles.screenshotLink} href={p.image} target="_blank" rel="noopener noreferrer" aria-label={`Ampliar captura de ${p.name} (abre en otra pestaña)`}><BrowserPreview {...p} /><span className={styles.expand}><ExternalArrow /></span></a>}
    <div className={styles.body}>
    <div className={styles.titleRow}>
      <ProjectLogo slug={p.slug} />
      <div><h3 id={`work-${p.slug}`}>{projectTitle(p)}</h3><ProjectKind kind={p.kind} /></div>
    </div>
    <div className={styles.projectStatus}>
      <span data-state={status.id}>{status.label}</span>
      <span>{p.video ? 'Video disponible' : 'Video pendiente'}</span>
    </div>
    <p className={styles.description}>{descriptions[p.name]}</p>
    <ProjectStack layers={projectCardStack(p.slug)} />
    <div className={styles.projectActions}>
      <a className={styles.githubButton} href={p.href} target="_blank" rel="noopener noreferrer"
        aria-label={`Repositorio de ${p.name} en GitHub${p.private ? ' · privado, requiere acceso' : ''} (abre en otra pestaña)`}>
        <GithubMark />{p.private ? 'GitHub · privado' : 'GitHub'}
      </a>
      <a className={styles.detailsButton} href={`/proyectos/destacados/${p.slug}`} target="_blank" rel="noopener noreferrer"
        aria-label={`Ver detalles de ${p.name} (abre en otra pestaña)`}>Ver detalles <ExternalArrow /></a>
    </div>
    <div className={styles.siteSlot}>{p.site && <a className={styles.siteLink} href={p.site} target="_blank" rel="noopener noreferrer"
      aria-label={`Visitar ${p.name} (abre en otra pestaña)`}>Ver sitio <ExternalArrow /></a>}</div>
    </div>
  </article></ProjectFlipCard> };
    })} />;
}
export function PortfolioSection() {
  return <section id="portafolio" className={styles.section} aria-labelledby="portfolio-title">
    <header className={styles.bannerInner}>
      <div>
        <h2 id="portfolio-title"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.55"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 10h24v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" fill="#b5e7ff" />
          <path d="M11 10V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3M4 16l12 4 12-4" />
          <rect x="13.5" y="16.5" width="5" height="5" rx="1" fill="#ffca8d" />
        </svg>Portafolio Profesional</h2>
        <p className={styles.bannerDescription}>Explora los proyectos que he desarrollado, desde aplicaciones de gestión hasta sitios web para clientes. Cada ficha reúne el contexto del proyecto, su stack y las capturas o demos disponibles.</p>
        <a className={styles.profileLink} href={owner.github} target="_blank" rel="noopener noreferrer"><GithubMark /> Explorar mi GitHub <ExternalArrow /></a>
      </div>
      <div className={styles.bannerVisual}>
        <Image src="/images/portfolio-banner-illustration.webp" alt="" width={950} height={633}
          sizes="(max-width: 700px) 320px, (max-width: 1050px) 42vw, 465px" />
      </div>
    </header>
    <div className={styles.inner}><PortfolioRibbonWalk><PublicWork /></PortfolioRibbonWalk></div>
  </section>;
}
