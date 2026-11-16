"use client";
import { useRef, useState, type ReactNode } from 'react';
import { VeltrixLogo } from './veltrix-logo';
import styles from './public-work.module.css';

export function ProjectFlipCard({ children, name }: { children: ReactNode; name: string }) {
  const [flipped, setFlipped] = useState(false);
  const frontButton = useRef<HTMLButtonElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  function turn(next: boolean) {
    setFlipped(next);
    requestAnimationFrame(() => (next ? backButton : frontButton).current?.focus({ preventScroll: true }));
  }
  return <div className={styles.flipShell} data-flipped={flipped} onKeyDown={event => { if (event.key === 'Escape' && flipped) turn(false); }}>
    <div className={styles.rotor}>
      <div className={styles.front} inert={flipped} aria-hidden={flipped} onClick={event => { if (!(event.target as HTMLElement).closest('a, button')) turn(true); }}>
        {children}<button ref={frontButton} type="button" className={styles.flipButton} onClick={() => turn(true)} aria-label={`Girar carta de ${name}`}>↻ <span>Girar carta</span></button>
      </div>
      <div className={styles.back} inert={!flipped} aria-hidden={!flipped} onClick={event => { if (!(event.target as HTMLElement).closest('button')) turn(false); }}>
        <span className={styles.backSerial}>PORTAFOLIO / 2026</span>
        <div className={styles.logoPanel}><div className={styles.navbarLogo} aria-label="YB Veltrix Solutions"><VeltrixLogo/></div></div>
        <strong className={styles.backName}>{name}</strong>
        <button ref={backButton} type="button" className={styles.backButton} onClick={() => turn(false)} aria-label={`Volver al proyecto ${name}`}>↻ Volver al proyecto</button>
      </div>
    </div>
  </div>;
}
