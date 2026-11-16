"use client";
import { useCommunity } from '../lib/community-client';
import styles from './visitor-rail.module.css';
const number = (value:number) => new Intl.NumberFormat('es-CL',{ notation:value >= 1000 ? 'compact':'standard',maximumFractionDigits:1 }).format(value);
export function VisitorRail() {
  const community = useCommunity();
  const unavailable = community.loading ? 'Cargando':'Sin conexión';
  return <aside className={styles.rail} aria-label="Visitas, Me gusta y comentarios">
    <div className={`${styles.circle} ${styles.views}`} tabIndex={0} aria-label={community.visits ? `${community.visits.total} navegadores visitantes` : `Visitas: ${unavailable}`}><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 4C5.5 4 1 12 1 12s4.5 8 11 8 11-8 11-8-4.5-8-11-8Zm0 13a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></svg><strong>{community.visits ? number(community.visits.total):'—'}</strong><span className={styles.tooltip}>Visitas al portafolio<span>{community.visits ? 'Navegadores únicos desde la activación':unavailable}</span></span></div>
    <button type="button" className={`${styles.circle} ${styles.likes}`} aria-pressed={community.data?.liked ?? false} aria-label={community.data?.liked ? 'Quitar mi Me gusta':'Me gusta este portafolio'} disabled={!community.data || community.saving} onClick={() => { void community.like(); }}><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21 3.2 12.3a5.7 5.7 0 0 1 8.1-8L12 5l.7-.7a5.7 5.7 0 0 1 8.1 8Z"/></svg><strong>{community.data ? number(community.data.likes):'—'}</strong><span className={styles.tooltip}>{community.data?.liked ? 'Gracias por tu apoyo':'¿Te gustó el portafolio?'}<span>{community.data ? 'Me gusta · un voto por navegador':unavailable}</span></span></button>
    <a href="/#comentarios" className={`${styles.circle} ${styles.comments}`} aria-label={community.data ? `Ver ${community.data.comments} comentarios y dejar el tuyo`:'Ir a los comentarios'}><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 3h14a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H8l-6 4V6a3 3 0 0 1 3-3Z"/></svg><strong>{community.data ? number(community.data.comments):'—'}</strong><span className={styles.tooltip}>Deja tu comentario<span>Ideas y opiniones sobre el portafolio</span></span></a>
  </aside>;
}
