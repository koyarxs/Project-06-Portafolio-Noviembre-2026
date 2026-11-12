import Link from 'next/link';
import { Navigation } from './navigation';
import { owner } from '../lib/owner';
export function Header() {
 return <header className="site-header"><div className="site-width header-inner"><Link href="/" className="wordmark personal-wordmark" aria-label="Yerko Barrera, inicio">Yerko<span>.</span></Link><Navigation /></div></header>;
}
export function Footer() {
 return <footer className="site-footer"><div className="site-width"><div className="footer-top"><div><span className="footer-eyebrow">¿TIENES UNA IDEA EN MENTE?</span><p>Hagamos que<br />suceda<span className="footer-dot">.</span></p></div><a href={owner.linkedin} target="_blank" rel="noopener noreferrer" className="blue-button">Hablemos ↗</a></div><div className="footer-links"><Link href="/" className="personal-wordmark">Yerko<span>.</span></Link><nav aria-label="Navegación del pie"><a href="/#portafolio">Portafolio</a><Link href="/sobre-mi">Sobre mí</Link><Link href="/contacto">Contacto</Link></nav><div><a href={owner.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href={owner.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></div></div><div className="footer-bottom"><span>© 2026 Yerko Barrera · Full Stack Developer</span><span>Desde Valparaíso, Chile.</span><a href="#contenido">Volver arriba ↑</a></div></div></footer>;
}
