import Link from 'next/link';
import { pageMetadata } from '../../lib/seo';

export const metadata = pageMetadata('Servicios', 'Desarrollo web, sistemas a medida e integraciones. Conversemos sobre tu próximo proyecto.', '/servicios');

export default function Services() {
  return <div className="site-width services-page"><p className="blue-eyebrow">VELTRIX SOLUTIONS</p><h1>Ideas claras.<br /><span>Soluciones que conectan.</span></h1><p className="services-lead">Cada proyecto comienza entendiendo lo que necesitas. Estas son las áreas en las que podemos trabajar juntos.</p><div className="services-grid">{[
    ['desarrollo-web', '01', 'Desarrollo web', 'Sitios e interfaces adaptables, con atención al diseño, la accesibilidad y la experiencia de quienes los usan.'],
    ['sistemas', '02', 'Sistemas a medida', 'Herramientas para organizar procesos, gestionar información y conectar la interfaz con la lógica de tu negocio.'],
    ['integraciones', '03', 'Integraciones y APIs', 'Conexiones entre aplicaciones, servicios y bases de datos para que la información fluya de principio a fin.'],
  ].map(([id, number, title, description]) => <section id={id} key={id}><span>{number}</span><h2>{title}</h2><p>{description}</p><Link href="/contacto">Conversemos sobre tu idea ↗</Link></section>)}</div><Link className="blue-button" href="/#portafolio">Explorar proyectos ↗</Link></div>;
}
