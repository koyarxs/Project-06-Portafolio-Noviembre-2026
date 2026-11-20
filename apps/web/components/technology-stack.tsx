import Image from 'next/image';
import type { CSSProperties } from 'react';
import { StackReveal } from './stack-reveal';
import { CollectionFilter } from './collection-filter';
import { cloudPlatforms as clouds, technologyGroups as groups, technologyDetails } from '../lib/professional-profile';
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

const layerDescriptions: Record<string, string> = {
  Frontend: 'Interfaces y experiencia de usuario.',
  Backend: 'Servicios, lógica de negocio y APIs.',
  'Bases de datos': 'Modelos, consultas y persistencia.',
};

const secondaryGroups = [
  { title: 'Pruebas', icon: 'Testing', names: ['Jest', 'Vitest', 'Playwright', 'Selenium', 'Pruebas E2E'] },
  { title: 'DevOps', icon: 'DevOps', names: ['Docker', 'Docker Compose', 'GitHub Actions', 'CI/CD'] },
  { title: 'Seguridad', icon: 'Seguridad', names: ['JWT', 'RBAC', 'OWASP', 'CSRF'] },
  { title: 'Herramientas', icon: 'Herramientas', names: ['Visual Studio Code', 'Git', 'GitHub'] },
  { title: 'Cloud', icon: 'Cloud', names: [...clouds.map(cloud => cloud.name), 'Cloudflare Turnstile'] },
];

const extraLogos: Record<string, string> = {
  'Docker Compose': 'docker',
  CSRF: 'security',
  'Cloudflare Turnstile': 'cloudflare',
  Selenium: 'selenium',
  'Pruebas E2E': 'pipeline',
};
const primaryGroups = groups.slice(0, 3).map(group => ({ ...group, icon: group.title, primary: true }));
const stackCategories = [...primaryGroups, ...secondaryGroups];
const categoryColors = ['blue', 'violet', 'teal', 'amber', 'blue', 'violet', 'teal', 'blue'];
const stackIntro = 'Combino tecnologías de frontend, backend y bases de datos para dar forma a aplicaciones web completas. También uso herramientas de pruebas, seguridad y despliegue para comprobar que cada parte funcione bien junto a las demás.';

function CategoryIcon({ name }: { name: string }) {
  return <span className={styles.categoryIcon}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={categoryPaths[name]} /></svg></span>;
}

function TechnologyEntry({ name }: { name: string }) {
  const logo = extraLogos[name] ?? technologyDetails[name].logo;
  return <li className={styles.technology}>
    <Image className={styles.technologyLogo} src={`/images/stack/${logo}.svg`}
      width={24} height={24} alt="" unoptimized />
    <div>
      <strong>{name}</strong>
      {name === 'Cloudflare Turnstile' && <p>Alternativa a reCAPTCHA</p>}
    </div>
  </li>;
}

function StackGroup({ title, names, icon = title, primary = false }: {
  title: string; names: readonly string[]; icon?: string; primary?: boolean;
}) {
  return <article className={styles.group} data-stack-layer={primary ? '' : undefined} data-category={icon}>
    <header className={styles.groupHeading}>
      <CategoryIcon name={icon} />
      <div><h3>{title}</h3>{primary && <p>{layerDescriptions[title]}</p>}</div>
    </header>
    <ul>{names.map(name => <TechnologyEntry key={name} name={name} />)}</ul>
  </article>;
}

export function TechnologyStack() {
  return <section id="stack" className={styles.section} aria-labelledby="stack-title">
    <div className={styles.inner}>
      <StackReveal className={styles.heading}>
        <header data-stack-layer="">
          <h2 id="stack-title">
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m4 21.5 12 6.5 12-6.5L16 15Z" fill="#ffbf75" stroke="#a94700" />
              <path d="m4 16 12 6.5L28 16 16 9.5Z" fill="#c7acff" stroke="#6637b3" />
              <path d="m16 4 12 6.5L16 17 4 10.5 16 4Z" fill="#73dfff" stroke="#08669d" />
            </svg>
            Mi stack
          </h2>
          <span className={styles.headingBrand}>
            <span className="header-brand-logo" role="img" aria-label="YB Veltrix Solutions" />
          </span>
          <p>
            {Array.from(stackIntro.matchAll(/\S+| /g), ({ 0: word, index: offset }) => {
              if (word === ' ') return ' ';
              return <span className={styles.introWord} key={offset}
                style={{ '--word-offset': offset } as CSSProperties}>{word}</span>;
            })}
          </p>
        </header>
      </StackReveal>
      <CollectionFilter label="Filtrar tecnologías" allLabel="Todas"
        options={stackCategories.map(({ title, icon }, index) => ({
          id: title, label: title, icon: categoryPaths[icon], color: categoryColors[index],
        }))}
        items={stackCategories.map(group => ({
          id: group.title, category: group.title, content: <StackGroup {...group} />,
        }))}
        gridClassName={styles.filteredGrid}
        allView={<StackReveal className={styles.layout}>
        <div className={styles.row}>
          <svg className={styles.visual} viewBox="0 0 120 96" fill="none" aria-hidden="true">
            <path className={styles.visualCircuit} d="M5 37h15l8-8h7M85 24h13l8 8h9M5 86h56l7-7m44-32h4" />
            <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M60 30v16m-31 9v-9h62v9" />
              <rect x="41" y="7" width="38" height="23" rx="5" className={styles.interfaceFill} />
              <path d="m55 14-5 4.5 5 4.5m10-9 5 4.5-5 4.5m-3-9-4 9" />
              <rect x="11" y="55" width="36" height="25" rx="5" className={styles.serverFill} />
              <path d="M11 67.5h36m-29-6h.1m-.1 12h.1m8-12h13m-13 12h13" />
              <path d="M74 61v16c0 4 7.6 7 17 7s17-3 17-7V61" className={styles.serverFill} />
              <ellipse cx="91" cy="61" rx="17" ry="6" className={styles.interfaceFill} />
              <path d="M74 69c0 4 7.6 7 17 7s17-3 17-7" />
              <circle cx="60" cy="46" r="3" className={styles.visualFill} />
            </g>
            <path className={styles.dataPulse} d="M29 55v-9h31V30M60 46h31v9" />
            <circle className={styles.signalLight} cx="18" cy="61.5" r="1.8" />
            <circle className={styles.signalLight} cx="60" cy="46" r="1.8" />
          </svg>
          <div className={styles.primaryCards}>
            {primaryGroups.map(group => <StackGroup key={group.title} {...group} />)}
          </div>
        </div>
        <div className={styles.row}>
          <svg className={`${styles.visual} ${styles.toolsVisual}`} viewBox="0 0 120 96" fill="none" aria-hidden="true">
            <path className={styles.visualCircuit} d="M5 53h21l9-9h10m50-17h10l10 10m-95 48h25l8 7h19" />
            <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M41 36H28a11 11 0 0 1-1-22 16 16 0 0 1 30-2 12 12 0 0 1 11 9" className={styles.interfaceFill} />
              <path d="M16 63h25m-25 8h16m-16 8h10M94 53h12m-9 8h9" opacity=".5" />
              <rect x="45" y="25" width="47" height="53" rx="6" className={styles.visualFill} />
              <path d="M61 24a7.5 7.5 0 0 1 15 0h4v9H57v-9z" className={styles.visualFill} />
              <path d="m54 44 3 3 5-6m-8 15 3 3 5-6m5-9h15m-15 12h12" />
              <path d="m90 56 15 6v9c0 9-8 16-15 19-7-3-15-10-15-19v-9z" className={styles.shield} />
              <path d="m84 72 4 4 8-8" />
            </g>
            <path className={styles.dataPulse} d="M16 63h25m53-10h12" />
            <path className={styles.scanLine} d="M50 38h37" />
            <circle className={styles.signalLight} cx="103" cy="37" r="2.3" />
          </svg>
          <div className={styles.secondaryCards}>
            {secondaryGroups.map(group => <StackGroup key={group.title} {...group} />)}
          </div>
        </div>
      </StackReveal>} />
    </div>
  </section>;
}
