'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type Certificate = { name: string; category: string; issued: string; expires: string; id: string; image: string };
const categories = [['Todos', 'Todos'], ['DESARROLLO', 'Desarrollo'], ['DATOS', 'Datos'], ['SISTEMAS', 'Sistemas'], ['SEGURIDAD', 'Seguridad'], ['PRODUCTIVIDAD', 'Productividad']] as const;

export function CertificateGallery({ certificates }: { certificates: readonly Certificate[] }) {
  const [category, setCategory] = useState('Todos');
  const [selected, setSelected] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const active = selected === null ? null : certificates[selected];
  const visible = certificates.filter(item => category === 'Todos' || item.category === category);

  useEffect(() => {
    if (selected === null) { dialog.current?.close(); return; }
    if (!dialog.current?.open) dialog.current?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [selected]);

  return <>
    <div className="certificate-toolbar"><div className="certificate-filters" role="group" aria-label="Filtrar certificados por área">{categories.map(([value, label]) => <button type="button" key={value} aria-pressed={category === value} onClick={() => setCategory(value)}>{label}<span>{value === 'Todos' ? certificates.length : certificates.filter(item => item.category === value).length}</span></button>)}</div><p role="status">{visible.length} certificados</p></div>
    <div className="certificate-gallery">{visible.map(item => <article className="certificate-card" key={item.id}>
      <button type="button" className="certificate-preview" onClick={() => setSelected(certificates.findIndex(cert => cert.id === item.id))} aria-label={`Ampliar certificado: ${item.name}`}><Image src={item.image} alt={`Certificado de finalización de ${item.name}, a nombre de Yerko Barrera`} width={480} height={360} sizes="(max-width: 700px) 90vw, (max-width: 1050px) 45vw, 33vw" /><span className="certificate-zoom"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6" /></svg>Ampliar</span></button>
      <div className="certificate-card-copy"><div className="certificate-issuer"><Image src="/images/career/udemy.jpg" alt="Udemy" width={27} height={27} /><span>Udemy <small>{item.issued}</small></span><span className="certificate-category">{categories.find(([value]) => value === item.category)?.[1]}</span></div><h3>{item.name}</h3><div className="certificate-card-footer"><button type="button" onClick={() => setSelected(certificates.findIndex(cert => cert.id === item.id))}>Ver certificado <span aria-hidden="true">↗</span></button><a href={`https://www.udemy.com/certificate/${item.id}/`} target="_blank" rel="noopener noreferrer" aria-label={`Consultar credencial de ${item.name} (abre en otra pestaña)`}>Credencial <span aria-hidden="true">↗</span></a></div><details className="certificate-metadata"><summary>Datos de la credencial</summary><p>ID: {item.id}</p><p>Vencimiento publicado en LinkedIn: {item.expires}</p></details></div>
    </article>)}</div>
    <dialog ref={dialog} className="certificate-dialog" aria-labelledby="certificate-dialog-title" onClose={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) setSelected(null); }} onKeyDown={event => {
      if (selected === null) return;
      if (event.key === 'ArrowRight' && selected < certificates.length - 1) { event.preventDefault(); setSelected(selected + 1); }
      if (event.key === 'ArrowLeft' && selected > 0) { event.preventDefault(); setSelected(selected - 1); }
    }}>
      {active && <div className="certificate-dialog-surface"><div className="certificate-dialog-top"><span>ARCHIVO DE APRENDIZAJE / {String((selected ?? 0) + 1).padStart(2, '0')} DE {certificates.length}</span><button type="button" onClick={() => setSelected(null)} aria-label="Cerrar certificado">Cerrar <span aria-hidden="true">×</span></button></div><h2 id="certificate-dialog-title">{active.name}</h2><div className="certificate-dialog-image"><Image src={active.image} alt={`Certificado de ${active.name}, Yerko Barrera`} width={960} height={720} sizes="(max-width: 700px) 92vw, 780px" /></div><div className="certificate-dialog-bottom"><div className="certificate-paging"><button type="button" disabled={selected === 0} onClick={() => setSelected(index => Math.max(0, (index ?? 0) - 1))} aria-label="Certificado anterior">←</button><button type="button" disabled={selected === certificates.length - 1} onClick={() => setSelected(index => Math.min(certificates.length - 1, (index ?? 0) + 1))} aria-label="Siguiente certificado">→</button></div><a href={`https://www.udemy.com/certificate/${active.id}/`} target="_blank" rel="noopener noreferrer">Consultar en Udemy <span aria-hidden="true">↗</span></a></div></div>}
    </dialog>
  </>;
}
