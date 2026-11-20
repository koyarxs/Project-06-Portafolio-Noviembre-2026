'use client';

import Image from 'next/image';
import { useState } from 'react';
import styles from './technology-carousel.module.css';

const technologies = [
  ['react', 'React'], ['nextjs', 'Next.js'], ['typescript', 'TypeScript'],
  ['angular', 'Angular'], ['tailwindcss', 'Tailwind CSS'], ['nodejs', 'Node.js'],
  ['nestjs', 'NestJS'], ['django', 'Django'], ['postgresql', 'PostgreSQL'],
  ['mongodb', 'MongoDB'], ['prisma', 'Prisma'], ['docker', 'Docker'],
  ['vitest', 'Vitest'], ['playwright', 'Playwright'], ['git', 'Git'],
  ['github', 'GitHub'], ['vscode', 'VS Code'],
];

export function TechnologyCarousel() {
  const [paused, setPaused] = useState(false);

  return <section className={styles.section} aria-labelledby="technology-carousel-title">
    <header className={styles.heading}>
      <h2 id="technology-carousel-title">Tecnologías que uso</h2>
      <button className={styles.control} type="button" onClick={() => setPaused(!paused)}
        aria-controls="technology-carousel-track">
        {paused ? 'Reanudar' : 'Pausar'} <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>
      </button>
    </header>
    <div className={styles.viewport} data-paused={paused}>
      <div id="technology-carousel-track" className={styles.track}>
        {[false, true].map(copy => <ul key={String(copy)} className={styles.sequence} aria-hidden={copy || undefined}>
          {technologies.map(([id, name]) => <li key={id}>
            <Image src={`/images/stack/${id}.svg`} width={48} height={48} alt="" unoptimized />
            <span>{name}</span>
          </li>)}
        </ul>)}
      </div>
    </div>
  </section>;
}
