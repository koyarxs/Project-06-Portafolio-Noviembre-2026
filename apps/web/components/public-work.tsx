import Image from 'next/image';
import { ProjectFlipCard } from './project-flip-card';
import { publicWork, owner } from '../lib/owner';
import styles from './public-work.module.css';
function GithubMark() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.03-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1.01 1.72 2.65 1.22 3.3.93.1-.73.4-1.22.71-1.5-2.5-.28-5.12-1.25-5.12-5.57 0-1.23.44-2.23 1.16-3.01-.12-.28-.5-1.43.11-2.97 0 0 .94-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.14-1.45 3.08-1.15 3.08-1.15.61 1.54.23 2.69.11 2.97.72.78 1.16 1.78 1.16 3.01 0 4.33-2.63 5.28-5.14 5.56.4.35.76 1.03.76 2.08v3.21c0 .3.21.65.78.54A11.2 11.2 0 0 0 12 .8Z"/></svg>;
}
function ExternalArrow() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>; }
const technologyIcons:Record<string,string> = { 'Next.js':'nextjs',NestJS:'nestjs',PostgreSQL:'postgresql','Django REST':'django',Angular:'angular',Prisma:'prisma','Prisma Next':'prisma',React:'react',TypeScript:'typescript',Python:'python','Tailwind CSS':'tailwindcss',Vitest:'vitest',Playwright:'playwright','GitHub Actions':'githubactions',Docker:'docker','Docker Compose':'docker',Hostinger:'hostinger' };
const shortNames:Record<string,string> = { 'Docker Compose':'Compose','Tailwind CSS':'Tailwind','Django REST':'Django REST','GitHub Actions':'Actions' };
const cards = [
  ...publicWork.map(p => ({ name:p.name,image:p.image,href:p.href,site:null as string | null,kind:p.name === 'FraudShield' ? 'Universidad · UNAB':p.name === 'Falta Uno' ? 'Colaborativo':'Personal',technologies:[...new Set(p.layers.flatMap(layer => [...layer.technologies]))].filter(name => !['Por documentar','CI sin despliegue'].includes(name)),private:false })),
  { name:'FlyMaster',image:'/images/projects/flymaster-preview.jpg',href:'https://github.com/koyarxs/Project-02-FlyMaster-Octubre-2026',site:'https://flymaster.cl',kind:'Cliente · FlyMaster',technologies:['Next.js','React','TypeScript','Tailwind CSS','Three.js','NestJS','PHP','PostgreSQL','Prisma Next','Hostinger','GitHub Actions','Docker Compose'],private:true },
];
const descriptions: Record<string,string> = {
  Pawly: 'Reservas, agenda y gestión para una clínica veterinaria.',
  Zenvik: 'Trabajadores, turnos y permisos en una plataforma SaaS.',
  FraudShield: 'Análisis de transacciones y clasificación de riesgo.',
  'Falta Uno': 'Una comunidad para conectar personas a través del deporte.',
  FlyMaster: 'Sitio de servicios con drones y formación para pilotos.',
};
function DeviceScreen({ name, image, technical = false, decorative = false }: { name: string; image: string; technical?: boolean; decorative?: boolean }) {
  return technical ? <div className={styles.diagram}><span>FRAUDSHIELD</span><strong>Del dato a la decisión.</strong><div><span>CSV</span><b>→</b><span>Reglas</span><b>→</b><span>Riesgo</span></div><small>Esquema técnico</small></div> : <Image src={image} alt={decorative ? '' : `Captura de escritorio de ${name}`} width={1440} height={1000} sizes={decorative ? '140px' : '(max-width: 620px) 85vw, (max-width: 1000px) 42vw, 320px'} className={styles.screenshot} />;
}
function Devices({ name, image }: { name: string; image: string }) {
  const technical = name === 'FraudShield';
  return <div className={styles.devices}>
    <span className={styles.previewLabel}>{technical ? 'ARQUITECTURA / ANÁLISIS DE RIESGO' : 'VISTA DEL PROYECTO'}</span>
    <div className={styles.monitor}><div className={styles.monitorScreen}><span className={styles.camera} /><DeviceScreen name={name} image={image} technical={technical} /></div><span className={styles.monitorChin}><span /></span><span className={styles.monitorStand} /><span className={styles.monitorBase} /></div>
    {!technical && <><div className={styles.tablet} aria-hidden="true"><DeviceScreen name={name} image={image} decorative /></div><div className={styles.phone} aria-hidden="true"><span className={styles.notch} /><DeviceScreen name={name} image={image} decorative /><span className={styles.homeBar} /></div></>}
    <span className={styles.deviceShadow} aria-hidden="true" />
  </div>;
}
export function PublicWork() {
  return <div className={styles.grid}>{cards.map((p,i) => <ProjectFlipCard name={p.name} key={p.name}><article className={styles.card} aria-labelledby={`work-${i}`} data-project={p.name}>
    {p.name === 'FraudShield' ? <div role="img" aria-label="Esquema técnico de FraudShield; sin captura de interfaz disponible"><Devices name={p.name} image={p.image} /></div> : <a className={styles.screenshotLink} href={p.image} target="_blank" rel="noopener noreferrer" aria-label={`Ampliar captura de ${p.name} (abre en otra pestaña)`}><Devices name={p.name} image={p.image} /><span className={styles.expand}><ExternalArrow /></span></a>}
    <div className={styles.body}><div className={styles.titleRow}><h3 id={`work-${i}`}>{p.name}<span>.</span></h3><span className={styles.kind}>{p.kind}</span></div>
    <p className={styles.description}>{descriptions[p.name]}</p><ul className={styles.stack} aria-label={`Stack de ${p.name}`}>{p.technologies.map(name => <li key={name} title={name}>{technologyIcons[name] && <Image src={`/images/stack/${technologyIcons[name]}.svg`} width={12} height={12} alt="" unoptimized/>}{shortNames[name] ?? name}</li>)}</ul>
    <div className={styles.projectLinks}><a href={p.href} target="_blank" rel="noopener noreferrer" aria-label={`Repositorio de ${p.name} en GitHub${p.private ? ' · privado, requiere acceso':''} (abre en otra pestaña)`}><GithubMark /><span>{p.private ? 'GitHub · privado' : 'Ver en GitHub'}</span><ExternalArrow /></a>{p.site && <a href={p.site} target="_blank" rel="noopener noreferrer" aria-label={`Visitar ${p.name} (abre en otra pestaña)`}>Ver sitio<ExternalArrow /></a>}</div>
    {p.private && <p className={styles.privateNote}>Repositorio privado · requiere acceso.</p>}
    </div>
  </article></ProjectFlipCard>)}</div>;
}
export function PortfolioSection() {
  return <section id="portafolio" className={styles.section} aria-labelledby="portfolio-title">
    <div className={styles.portfolioBanner}><div className={styles.bannerInner}>
      <div><p className={styles.eyebrow}>PORTAFOLIO / SELECCIÓN 2026</p><h2 id="portfolio-title">Ideas que toman forma.<br /><span>Software que puedes explorar.</span></h2><p className={styles.bannerDescription}>De una interfaz a un sistema completo. Una selección de mis proyectos personales, académicos, colaborativos y para clientes.</p><a className={styles.profileLink} href={owner.github} target="_blank" rel="noopener noreferrer"><GithubMark /> Explorar mi GitHub <ExternalArrow /></a></div>
      <div className={styles.bannerVisual} aria-hidden="true"><div className={styles.codeWindow}><div className={styles.windowBar}><i /><i /><i /><span>ideas → productos</span></div><div className={styles.codeLines}><span>// cada proyecto cuenta una historia</span><p><em>const</em> proyecto = {'{'}</p><p>  interfaz: <b>'clara'</b>,</p><p>  backend: <b>'conectado'</b>,</p><p>  enfoque: <b>'Full Stack'</b></p><p>{'};'}</p></div></div><div className={styles.bannerSeal}><span>{String(cards.length).padStart(2, '0')}</span>PROYECTOS<br />UNA MISMA CURIOSIDAD</div></div>
    </div></div>
    <div className={styles.inner}><div className={styles.collectionHeading}><p><span /> PROYECTOS DESTACADOS</p><span>Del concepto al código <span aria-hidden="true">↘</span></span></div><PublicWork /><p className={styles.note}>Composiciones de dispositivos a partir de capturas de escritorio; no representan capturas móviles independientes. FraudShield muestra un esquema técnico. Puedes ampliar cada captura y consultar el repositorio.</p></div>
  </section>;
}