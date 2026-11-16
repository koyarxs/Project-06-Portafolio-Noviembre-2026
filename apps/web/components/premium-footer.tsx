import Link from 'next/link';
import { owner } from '../lib/owner';
import { Arrow } from './icons';
import styles from './premium-footer.module.css';

export function PremiumFooter() {
  return <footer className={styles.footer}>
    <div className={styles.inner}>
      <div className={styles.invitation}>
        <div><p className={styles.eyebrow}><span /> YB VELTRIX SOLUTIONS / CONSTRUYAMOS ALGO BUENO</p><h2>Tu próximo proyecto.<br /><span>Hagámoslo realidad.</span></h2><p className={styles.intro}>Aplicaciones web, plataformas SaaS y soluciones a medida.<br />Con visión de producto y atención a cada detalle.</p></div>
        <Link href="/contacto" className={styles.contact}><span className={styles.contactIcon}><Arrow diagonal /></span><span>Conversemos<small>Cuéntame qué tienes en mente</small></span></Link>
      </div>
      <div className={styles.directory}>
        <div className={styles.identity}><Link href="/" className={styles.brand} aria-label="YB Veltrix Solutions, inicio"><span className={styles.brandLogo} role="img" aria-label="Logo de YB Veltrix Solutions" /></Link><p className={styles.owner}>Yerko Barrera<small>Software Engineer · Full Stack Developer</small></p><p>Ingeniería, diseño y tecnología para<br />convertir ideas en soluciones reales.</p><Link href="/experiencia" className={styles.veltrix}>Conoce mi trayectoria <Arrow diagonal /></Link></div>
        <nav aria-label="Explorar el portafolio"><h3>EXPLORAR</h3><Link href="/#portafolio">Proyectos</Link><Link href="/#stack">Mi stack</Link><Link href="/sobre-mi">Sobre mí</Link><Link href="/experiencia">Trayectoria</Link></nav>
        <nav aria-label="Servicios del pie"><h3>QUÉ CONSTRUYO</h3><Link href="/servicios#desarrollo-web">Desarrollo web</Link><Link href="/servicios#sistemas">Sistemas a medida</Link><Link href="/servicios#integraciones">Integraciones y APIs</Link><Link href="/contacto">Hablemos de tu proyecto</Link></nav>
        <nav aria-label="Perfiles profesionales"><h3>CONECTEMOS</h3><a href={owner.github} target="_blank" rel="noopener noreferrer" className={styles.social}><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.6 9.6 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" /></svg>GitHub<Arrow diagonal /></a><a href={owner.linkedin} target="_blank" rel="noopener noreferrer" className={styles.social}><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3.5 9h3v12h-3V9Zm5.5 0h3v1.6c.7-1.2 1.8-1.9 3.3-1.9 3.2 0 4.2 2.1 4.2 5V21h-3v-6.5c0-1.5-.3-2.9-2.1-2.9-1.9 0-2.4 1.4-2.4 3V21H9V9Z" /></svg>LinkedIn<Arrow diagonal /></a><span className={styles.location}>Valparaíso, Chile <span>↗</span></span></nav>
      </div>
      <div className={styles.bottom}><p>© {new Date().getFullYear()} Yerko Barrera.<span> YB Veltrix Solutions · Valparaíso, Chile.</span></p><a href="#contenido">Volver al inicio <span>↑</span></a></div>
    </div>
  </footer>;
}
