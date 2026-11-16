import Link from 'next/link';

export function HeroActions() {
  return <div className="hero-actions">
    <div className="hero-action-buttons">
      <a className="hero-action-primary" href="#portafolio">Explorar proyectos <span aria-hidden="true">↗</span></a>
      <a className="hero-action-secondary" href="/documents/Yerko-Barrera-CV.pdf" download="CV-Yerko-Barrera.pdf"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M5 16v4h14v-4" /></svg>Descargar CV</a>
    </div>
    <Link className="hero-action-contact" href="/contacto">Construyamos algo juntos <span aria-hidden="true">→</span></Link>
  </div>;
}
