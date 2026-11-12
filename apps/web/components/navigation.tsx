'use client';
import Link from 'next/link';
import { useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const links = [['/', 'Inicio'], ['/#portafolio', 'Portafolio'], ['/sobre-mi', 'Sobre mí'], ['/experiencia', 'Trayectoria']] as const;
export function Navigation() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { if (!open) return; const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); document.getElementById('menu-toggle')?.focus(); } }; document.addEventListener('keydown', close); return () => document.removeEventListener('keydown', close); }, [open]);
  return <>
    <button id="menu-toggle" className="menu-toggle" type="button" aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(!open)}>{open ? 'Cerrar' : 'Menú'} <span aria-hidden="true">{open ? '−' : '+'}</span></button>
    <nav id="primary-navigation" className={`navigation ${open ? 'is-open' : ''}`} aria-label="Principal">
      {links.map(([href, label]) => <Link href={href} key={href} onClick={() => setOpen(false)} aria-current={path === href || (href !== '/' && path.startsWith(`${href}/`)) ? 'page' : undefined}>{label}<Pending /></Link>)}
      <Link className="nav-contact" href="/contacto" onClick={() => setOpen(false)} aria-current={path === '/contacto' ? 'page' : undefined}>Conversemos <span aria-hidden="true">↗</span><Pending /></Link>
    </nav>
  </>;
}
function Pending() {
  const { pending } = useLinkStatus();
  return pending ? <span className="nav-pending" role="status"><span className="sr-only">Cargando…</span></span> : null;
}
