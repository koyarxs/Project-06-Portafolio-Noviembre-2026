import Image from 'next/image';
import { cloudPlatforms as clouds, technologyGroups as groups, technologyDetails, technologySummaries } from '../lib/professional-profile';
import { owner } from '../lib/owner';
import styles from './technology-stack.module.css';

const categoryPaths: Record<string, string> = {
  Frontend: 'M3 4h18v13H3zM3 8h18M8 21h8m-4-4v4m-3-11-2 2 2 2m6-4 2 2-2 2',
  Backend: 'M4 3h16v7H4zM4 14h16v7H4zM7 6.5h.01M7 17.5h.01M11 6.5h6M11 17.5h6M12 10v4',
  'Bases de datos': 'M20 6c0 2-3.6 3.5-8 3.5S4 8 4 6s3.6-3.5 8-3.5S20 4 20 6ZM4 6v12c0 2 3.6 3.5 8 3.5s8-1.5 8-3.5V6M4 12c0 2 3.6 3.5 8 3.5s8-1.5 8-3.5',
  Testing: 'M9 3h6M10 3v6L4 19a1.3 1.3 0 0 0 1 2h14a1.3 1.3 0 0 0 1-2L14 9V3M8 14h8m-7 3 2 2 4-4',
  DevOps: 'M7 7h10m0 0-3-3m3 3-3 3M17 17H7m0 0 3-3m-3 3 3 3M4 7a3 3 0 1 1 0 6m16-2a3 3 0 1 1 0 6',
  Seguridad: 'm12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6zM8 12l3 3 5-6',
  Cloud: 'M6 18a4 4 0 0 1-1-7.9A7 7 0 0 1 18.5 8 5 5 0 0 1 0 10H6Zm6-7v7m-3-4 3-3 3 3',
  Herramientas: 'M3 4h18v13H3zM3 8h18m-13 3-2 2 2 2m4-4 2 2-2 2M8 21h8m-4-4v4',
};

const categoryLabels: Record<string, string> = { Frontend: 'INTERFACES & EXPERIENCIA', Backend: 'SERVICIOS & APIS', 'Bases de datos': 'MODELOS & PERSISTENCIA', Testing: 'CALIDAD & CONFIANZA', DevOps: 'AUTOMATIZACIÓN & ENTREGA', Seguridad: 'IDENTIDAD & PROTECCIÓN', Herramientas: 'MI ENTORNO DE TRABAJO', Cloud: 'USO PREVISTO / PRÓXIMOS PROYECTOS' };

function CategoryIcon({ name }: { name: string }) {
  return <span className={styles.categoryIcon}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={categoryPaths[name]} /></svg></span>;
}

export function TechnologyEntry({ name, description }: { name: string; description?: string }) {
  const technology = technologyDetails[name];
  return <li className={styles.technology}><Image className={styles.technologyLogo} data-monochrome={['nextjs', 'express', 'prisma', 'github'].includes(technology.logo)} src={`/images/stack/${technology.logo}.svg`} width={30} height={30} alt="" unoptimized /><div className={styles.technologyBody}><strong>{name}</strong>{description && <p>{description}</p>}</div></li>;
}


type StackGroup = { number: string; title: string; names: readonly string[] };
function StackGroups({ items, utility = false }: { items: readonly StackGroup[]; utility?: boolean }) {
  return <div className={`${styles.groups}${utility ? ` ${styles.utilityGroups}` : ''}`}>{items.map(group => <article className={styles.group} data-category={group.number} key={group.number}>
        <header className={styles.groupHeading}>
          <div className={styles.bannerArt} aria-hidden="true"><span /><span /><span /><svg viewBox="0 0 160 100" fill="none"><path d="M0 70h35l25-25h35l30-30h35M15 100V80l35-35V0M80 100V80l30-30h50" /><circle cx="60" cy="45" r="3" /><circle cx="125" cy="15" r="3" /><circle cx="110" cy="50" r="3" /></svg></div>
          <div className={styles.categoryTitle}><CategoryIcon name={group.title} /><div><span className={styles.number}>{group.number} / STACK</span><h3>{group.title}</h3><p className={styles.categoryLabel}>{categoryLabels[group.title]}</p></div></div>
        </header>
        <ul className={styles.technologyList}>{group.names.map(name => <TechnologyEntry key={name} name={name} description={technologySummaries[name] ?? clouds.find(cloud => cloud.name === name)?.plannedUse} />)}</ul>
      </article>)}</div>;
}

export function TechnologyStack() {
  return <section id="stack" className={styles.section} aria-labelledby="stack-title">
    <div className={styles.inner}>
      <header className={styles.heading}>
        <div><p className={styles.eyebrow}>MI STACK / TECNOLOGÍAS</p><h2 id="stack-title">Las herramientas detrás<br />de cada <span>solución.</span></h2></div>
        <p>Desarrollo Full Stack con foco en calidad, seguridad y aplicaciones que puedan crecer.</p>
      </header>
      <div className={styles.banner}>
        <Image src="/images/stack-architecture.jpg" alt="Arquitectura de líneas curvas y vidrio bajo un cielo azul en Stuttgart" fill sizes="(max-width: 1100px) 100vw, 1040px" className={styles.photo} />
        <div className={styles.bannerContent}><span>DESARROLLO + CLOUD</span><p>Ideas claras.<br /><strong>Sistemas bien conectados.</strong></p><small>Interfaces · APIs · Datos · Infraestructura</small></div>
        <a className={styles.credit} href="https://unsplash.com/photos/rs9iMJReZSs" target="_blank" rel="noopener noreferrer">Fotografía: Maurits Bausenhart / Unsplash ↗</a>
      </div>
      <StackGroups items={groups.slice(0, 3)} />
      <StackGroups utility items={[
        { number: 'TOOLS', title: 'Herramientas', names: ['Visual Studio Code', 'Git', 'GitHub', 'Docker'] },
        { number: 'CLOUD', title: 'Cloud', names: clouds.map(cloud => cloud.name) },
      ]} />
      <StackGroups items={groups.slice(3)} />
      <footer className={styles.footer}><p>Tecnologías, experiencia y aprendizaje continuo.</p><a href={owner.linkedin} target="_blank" rel="noopener noreferrer">Ver mi perfil en LinkedIn ↗</a></footer>
    </div>
  </section>;
}
