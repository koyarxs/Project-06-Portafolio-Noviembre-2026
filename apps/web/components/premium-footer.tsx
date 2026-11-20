import Image from 'next/image';
import Link from 'next/link';
import { owner } from '../lib/owner';
import { Arrow } from './icons';
import styles from './premium-footer.module.css';

const email = 'contacto@ybveltrix.cl';
const explore = [
  ['Proyectos', '/#portafolio'], ['Mi stack', '/#stack'], ['Sobre mí', '/sobre-mi'], ['Trayectoria', '/experiencia'],
] as const;
const services = [
  ['Desarrollo web', '/servicios#desarrollo-web'], ['Sistemas a medida', '/servicios#sistemas'],
  ['Integraciones y APIs', '/servicios#integraciones'], ['Soluciones SaaS', '/contacto'],
] as const;

const marks = {
  layers: 'm12 1 12 6-12 6L0 7l12-6ZM0 12l2.5-1.3 9.5 4.8 9.5-4.8L24 12l-12 6L0 12Zm0 5 2.5-1.3 9.5 4.8 9.5-4.8L24 17l-12 6L0 17Z',
  send: 'M23 2 1 11l8 3 10-8-8 10v6l3-5 5 3 4-18Z',
  linkedin: 'M5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3.5 9h3v12h-3V9Zm5.5 0h3v1.6c.7-1.2 1.8-1.9 3.3-1.9 3.2 0 4.2 2.1 4.2 5V21h-3v-6.5c0-1.5-.3-2.9-2.1-2.9-1.9 0-2.4 1.4-2.4 3V21H9V9Z',
};
const outlines = {
  code: 'm8 5-6 7 6 7m8-14 6 7-6 7M14 3l-4 18',
  chevron: 'm9 4 8 8-8 8',
  pin: 'M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Zm-5 0a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z',
  mail: 'M3 5h18v14H3zM3 6l9 7 9-7m-18 12 6-6m12 6-6-6',
};

function FooterIcon({ name }: { name: 'github' | keyof typeof marks | keyof typeof outlines }) {
  if (name === 'github') return <Image className={styles.githubMark} src="/images/stack/github.svg" alt="" width={24} height={24} unoptimized />;
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    {name in marks ? <path fill="currentColor" d={marks[name as keyof typeof marks]} /> :
      <path fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" d={outlines[name as keyof typeof outlines]} />}
  </svg>;
}

function FooterWaves() {
  return <svg className={styles.waves} viewBox="0 0 2172 724" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <filter id="veltrix-footer-logo-matte" colorInterpolationFilters="sRGB">
        <feColorMatrix in="SourceGraphic" type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 1 0 0" />
        <feComponentTransfer result="matte">
          <feFuncA type="table" tableValues="1 1 .95 .08 0 .11 1 1 1 1 1" />
        </feComponentTransfer>
        <feComposite in="SourceGraphic" in2="matte" operator="in" />
      </filter>
      <linearGradient id="veltrix-footer-surface" x1="0" y1="0" x2=".7" y2="1">
        <stop stopColor="#247ab8" /><stop offset="1" stopColor="#153e6c" />
      </linearGradient>
      <linearGradient id="veltrix-footer-line">
        <stop stopColor="#8ae5f8" /><stop offset=".36" stopColor="#54bcf3" stopOpacity=".1" />
        <stop offset=".72" stopColor="#7dddfb" stopOpacity=".7" /><stop offset="1" stopColor="#8ae5f8" />
      </linearGradient>
    </defs>
    <path fill="#2879b7" opacity=".49" d="M1750 0h422v194C2052 97 1910 24 1750 0Z" />
    <path fill="url(#veltrix-footer-surface)" d="M0 495c228 65 410 90 647 110 252 22 458 38 685 13 192-48 270-83 422-73 157 9 274-63 418-83v262H0Z" />
    <path fill="#123e6c" opacity=".72" d="M805 724c147-20 338-38 512-92 180-56 289-96 437-87 157 9 274-63 418-83v262Z" />
    <path fill="none" stroke="url(#veltrix-footer-line)" strokeWidth="4"
      d="M0 495c218 63 457 104 687 113M805 724c186-25 338-38 512-92 180-56 289-96 437-87 157 9 274-63 418-83" />
  </svg>;
}

function FooterNav({ title, icon, links }: {
  title: string; icon: 'layers' | 'code'; links: readonly (readonly [string, string])[];
}) {
  return <nav className={styles.column} aria-label={title}>
    <h2><FooterIcon name={icon} />{title}</h2>
    <ul>{links.map(([label, href]) => <li key={label}>
      <Link href={href}>{label}<FooterIcon name="chevron" /></Link>
    </li>)}</ul>
  </nav>;
}

export function PremiumFooter() {
  return <footer id="footer" className={styles.footer}>
    <FooterWaves />
    <div className={styles.inner}>
      <div className={styles.directory}>
        <div className={styles.identity}>
          <Link href="/" className={styles.brand} aria-label="YB Veltrix Solutions, inicio">
            <Image src="/images/veltrix-footer-logo.webp" alt="YB Veltrix Solutions" width={640} height={195}
              sizes="(max-width: 620px) 216px, 280px" />
          </Link>
          <p>Diseño y desarrollo aplicaciones web, plataformas SaaS y sistemas a medida para simplificar el trabajo diario.</p>
          <div className={styles.socialButtons}>
            <a href={owner.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FooterIcon name="github" /></a>
            <a href={owner.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FooterIcon name="linkedin" /></a>
            <a href={`mailto:${email}`} aria-label="Enviar correo"><FooterIcon name="mail" /></a>
          </div>
        </div>
        <FooterNav title="Explorar" icon="layers" links={explore} />
        <FooterNav title="Qué construyo" icon="code" links={services} />
        <section className={`${styles.column} ${styles.connect}`} aria-labelledby="footer-connect">
          <h2 id="footer-connect"><FooterIcon name="send" />Conectemos</h2>
          <ul>
            <li><a href={owner.github} target="_blank" rel="noopener noreferrer"><FooterIcon name="github" />GitHub <Arrow diagonal /></a></li>
            <li><a href={owner.linkedin} target="_blank" rel="noopener noreferrer"><FooterIcon name="linkedin" />LinkedIn <Arrow diagonal /></a></li>
            <li><span><FooterIcon name="pin" />Valparaíso, Chile</span></li>
            <li><a href={`mailto:${email}`}><FooterIcon name="mail" />{email}</a></li>
          </ul>
        </section>
      </div>
      <div className={styles.bottom}>
        <p className={styles.credit}><span>© {new Date().getFullYear()} Yerko Barrera.</span><span>Desarrollado por YB Veltrix Solutions.</span></p>
        <p className={styles.signature}><span aria-hidden="true"><i /><i /><i /></span>Desarrollo <b>·</b> Tecnología <b>·</b> Innovación</p>
      </div>
    </div>
  </footer>;
}
