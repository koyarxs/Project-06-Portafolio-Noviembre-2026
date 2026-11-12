import Image from 'next/image';
import { publicWork } from '../lib/owner';
export function PublicWork() {
 return <div className="blue-project-grid">{publicWork.map((p, i) => <article className="blue-project" key={p.name}>
  <a href={p.href} target="_blank" rel="noopener noreferrer" className={`blue-project-cover cover-${i}`} aria-label={`${p.name}: ver repositorio (abre en otra pestaña)`}><Image src={p.image} alt={p.name === 'FraudShield' ? 'Ilustración de portada de FraudShield' : `Captura de ${p.name} en desarrollo con datos de prueba`} width={1200} height={760} sizes="(max-width: 700px) 90vw, 45vw" /><span className="project-round-arrow" aria-hidden="true">↗</span></a>
  <div className="blue-project-meta"><span>{p.category}</span><span>{p.status}</span></div><h3><a href={p.href} target="_blank" rel="noopener noreferrer">{p.name} <span aria-hidden="true">↗</span></a></h3><p>{p.description}</p><div className="blue-project-stack">{p.stack}</div>
 </article>)}</div>;
}
