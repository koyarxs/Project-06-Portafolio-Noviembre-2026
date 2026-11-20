"use client";
import { useCommunity } from '../lib/community-client';
import styles from './visitor-rail.module.css';
const number = (value:number) => new Intl.NumberFormat('es-CL',{ notation:value >= 1000 ? 'compact':'standard',maximumFractionDigits:1 }).format(value);
export function VisitorRail() {
  const community = useCommunity();
  const unavailable = community.loading ? 'Cargando':'Sin conexión';
  return <aside className={styles.rail} data-visitor-rail aria-label="Visitas y Me gusta">
    <div className={`${styles.circle} ${styles.views}`} tabIndex={0} aria-label={community.visits ? `${community.visits.total} navegadores visitantes` : `Visitas: ${unavailable}`}><svg viewBox="0 0 24 24" aria-hidden="true">
      <g className={styles.eyeBlink}>
        <path className={styles.eyeShape} d="M1.5 12s4-6 10.5-6 10.5 6 10.5 6-4 6-10.5 6-10.5-6-10.5-6Z" />
        <circle cx="12" cy="12" r="4.05" fill="currentColor" />
        <circle cx="12" cy="12" r="2.05" fill="var(--rail-depth)" />
        <circle cx="13.4" cy="10.6" r="1.05" fill="#eef8ff" />
      </g>
    </svg><strong>{community.visits ? number(community.visits.total):'—'}</strong><span className={styles.tooltip}>Visitas al portafolio<span>{community.visits ? 'Navegadores únicos desde la activación':unavailable}</span></span></div>
    <button type="button" className={`${styles.circle} ${styles.likes}`} aria-pressed={community.data?.liked ?? false} aria-label={community.data?.liked ? 'Quitar mi Me gusta':'Me gusta este portafolio'} disabled={!community.data || community.saving} onClick={() => { void community.like(); }}><svg viewBox="0 0 24 24" aria-hidden="true">
      <g className={styles.heartbeat}>
        <path className={styles.heartShape} d="M12 21 3.5 12.8a5.4 5.4 0 0 1 7.6-7.6l.9.9.9-.9a5.4 5.4 0 0 1 7.6 7.6L12 21Z" />
        <path className={styles.heartGlint} d="M5.3 9.3a2.8 2.8 0 0 1 2.6-2.6" />
      </g>
    </svg><strong>{community.data ? number(community.data.likes):'—'}</strong><span className={styles.tooltip}>{community.data?.liked ? 'Gracias por tu apoyo':'¿Te gustó el portafolio?'}<span>{community.data ? 'Me gusta · un voto por navegador':unavailable}</span></span></button>
  </aside>;
}
