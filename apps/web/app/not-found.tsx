import Link from 'next/link';
export default function NotFound() {
  return <div className="site-width page-content py-16"><p className="eyebrow">404 · PÁGINA NO DISPONIBLE</p><h1 className="text-3xl mt-5 mb-4">Este camino no lleva a un proyecto público.</h1><p className="text-muted mb-8">La página no existe o su contenido todavía no está disponible para consulta.</p><Link href="/proyectos" className="button-primary">Explorar proyectos <span aria-hidden="true">→</span></Link></div>;
}
