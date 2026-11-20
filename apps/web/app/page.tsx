import Link from 'next/link';
import Image from 'next/image';
import { PortfolioSection } from '../components/public-work';
import { TechnologyStack } from '../components/technology-stack';
import { TechnologyCarousel } from '../components/technology-carousel';
import { DigitalFireworks } from '../components/digital-fireworks';
import { DeveloperAvatar } from '../components/developer-avatar';
import { HeroSequence } from '../components/hero-sequence';
import { HeroActions } from '../components/hero-actions';
import { FaqSection } from '../components/faq-section';
import { pageMetadata } from '../lib/seo';
export const metadata = pageMetadata('Yerko Barrera · Full Stack Developer', 'Ingeniero en Computación e Informática. Proyectos Full Stack, desde la interfaz hasta los datos.', '/');
export default function Home() {
 return <>
 <section className="blue-hero orbit-hero" aria-labelledby="hero-title">
   <DigitalFireworks /><div className="aurora aurora-mint" aria-hidden="true" /><div className="aurora aurora-violet" aria-hidden="true" />
   <HeroSequence>
   <div className="orbit-intro">
     <h1 id="hero-title"><span className="hero-greeting">Hola, soy Yerko.</span>{' '}Desarrollador <em>Full Stack</em></h1>
     <p className="hero-degree">Ingeniero en Computación e Informática</p>
     <p className="hero-tagline">Desarrollo aplicaciones web con React, Next.js y TypeScript. Construyo APIs con NestJS y conecto sus datos con PostgreSQL.</p>
     <DeveloperAvatar />
     <HeroActions />
   </div>
   <div className="hero-ecosystem">
   <div className="orbit-stage">
     <div className="orbit-aura" aria-hidden="true" />
     <svg className="stack-network" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true">
       <defs><radialGradient id="network-glow"><stop stopColor="#7fffd4" stopOpacity=".4" /><stop offset="1" stopColor="#7fffd4" stopOpacity="0" /></radialGradient></defs>
       <ellipse cx="500" cy="460" rx="260" ry="42" fill="url(#network-glow)" />
       {['M220 70 L220 118 Q220 130 208 142 L132 218 Q120 230 120 242 L120 328 Q120 340 132 352 L180 400', 'M780 70 L780 118 Q780 130 792 142 L868 218 Q880 230 880 242 L880 328 Q880 340 868 352 L820 400', 'M220 70 L280 70 Q300 70 315 55 L340 30 L660 30 L685 55 Q700 70 720 70 L780 70', 'M180 400 L245 465 L755 465 L820 400', 'M220 70 L310 70 L380 140 L620 140 L690 70 L780 70', 'M120 235 L255 235 L325 305 L675 305 L745 235 L880 235', 'M180 400 L275 400 L340 335 L660 335 L725 400 L820 400'].map((d, i) => <g key={d}><path d={d} className="network-line" pathLength="100" /><path d={d} className={`network-pulse network-pulse-${i % 3}`} /><path d={d} className={`network-pulse network-echo network-pulse-${i % 3}`} /><circle r="2.8" className="network-photon"><animateMotion path={d} dur={`${4 + i * .7}s`} begin={`${i * -.65}s`} repeatCount="indefinite" /></circle></g>)}
       {[[220,70],[780,70],[120,235],[880,235],[180,400],[820,400]].map(([cx,cy]) => <g key={cx}><circle cx={cx} cy={cy} r="7" className="network-node-halo" /><circle cx={cx} cy={cy} r="2.5" className="network-node" /></g>)}
     </svg>
     <div className="holo-platform" aria-hidden="true"><span /><span /><span /></div><span className="orbit-backdrop" aria-hidden="true">FULL STACK</span>
     <div className="orbit-person"><Image src="/images/yerko-hero-v2.png" alt="Yerko Barrera sonriendo con los brazos cruzados" width={1152} height={1408} sizes="(max-width: 760px) 50vw, 300px" priority className="orbit-photo" /></div>
     <ul className="orbit-technologies" aria-label="Mi stack tecnológico">
       {[
         ['react', 'React', 'Interfaces'], ['typescript', 'TypeScript', 'Lenguaje'],
         ['nextjs', 'Next.js', 'Frontend'], ['nestjs', 'NestJS', 'Backend'],
         ['nodejs', 'Node.js', 'Servidor'], ['postgresql', 'PostgreSQL', 'Datos'],
         ['amazonwebservices', 'Amazon Web Services', 'Cloud · AWS'],
         ['azure', 'Microsoft Azure', 'Cloud · Azure'],
         ['googlecloud', 'Google Cloud Platform', 'Cloud · GCP'],
         ['prisma', 'Prisma ORM', 'Acceso a datos'], ['docker', 'Docker', 'Contenedores'],
       ].map(([id, name, category], index) => <li className={`orbit-tech orbit-tech-${index + 1}`} style={{ animationDelay: `${2.5 + index * .14}s` }} key={id}><div className="orbit-tech-card"><span className={`orbit-logo logo-${id}`}><Image src={`/images/stack/${id}.svg`} alt="" width={80} height={80} unoptimized /></span><span><small>{category}</small><strong>{name}</strong></span></div></li>)}
     </ul>
     <div className="signal-coordinate signal-coordinate-left" aria-hidden="true">01 / CREATIVE ENGINEERING<span>DISEÑO + DESARROLLO</span></div><div className="signal-coordinate signal-coordinate-right" aria-hidden="true">02 / DIGITAL EXPERIENCES<span>DE LA IDEA AL PRODUCTO</span></div>
   </div>
   <div className="orbit-caption-row"><div className="orbit-caption"><span aria-hidden="true">✳</span> Curiosidad que se convierte en código.</div></div>
   </div>
   </HeroSequence>
 </section>
 <hr className="home-section-divider" aria-hidden="true" />
 <TechnologyCarousel />
 <hr className="home-section-divider" aria-hidden="true" />
 <TechnologyStack />
 <hr className="home-section-divider" aria-hidden="true" />
 <PortfolioSection />
 <hr className="home-section-divider" aria-hidden="true" />
 <section className="blue-about"><div className="site-width blue-about-grid"><div><p className="blue-eyebrow">UN POCO SOBRE MÍ</p><h2>Me gusta entender<br />cómo encaja <span>todo.</span></h2></div><div><p>Soy Yerko, Ingeniero en Computación e Informática y Licenciado en Ingeniería por la Universidad Andrés Bello, con más de 4 años de experiencia profesional en TI.</p><p>Como fundador de YB Veltrix Solutions, desarrollo aplicaciones web, soluciones empresariales y plataformas SaaS. Conecto frontend, backend, datos y testing con prácticas DevOps, poniendo el foco en seguridad y escalabilidad.</p><Link href="/sobre-mi" className="text-link">Conocer mi perfil ↗</Link></div></div></section>
 <hr className="home-section-divider" aria-hidden="true" />
 <FaqSection />
 </>;
}
