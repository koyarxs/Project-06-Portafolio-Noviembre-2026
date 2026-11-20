'use client';
import Link from 'next/link';
import { useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { NavIcon, type NavIconName } from './nav-icon';

const links: readonly [string, string, NavIconName][] = [['/', 'Inicio', 'home'], ['/#stack', 'Mi stack', 'stack'], ['/#portafolio', 'Portafolio', 'stack'], ['/sobre-mi', 'Sobre mí', 'person'], ['/experiencia', 'Trayectoria', 'career']];
export function Navigation() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const services = useRef<HTMLDivElement>(null);
  const servicesButton = useRef<HTMLButtonElement>(null);
  const closeAll = () => { setOpen(false); setServicesOpen(false); };
  useEffect(() => {
    if (!servicesOpen) return;
    const outside = (event: PointerEvent) => { if (!services.current?.contains(event.target as Node)) setServicesOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.stopImmediatePropagation(); setServicesOpen(false); servicesButton.current?.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape, true);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape, true); };
  }, [servicesOpen]);
  useEffect(() => { if (!open) return; const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); document.getElementById('menu-toggle')?.focus(); } }; document.addEventListener('keydown', close); return () => document.removeEventListener('keydown', close); }, [open]);
  return <>
    <button id="menu-toggle" className="menu-toggle" type="button" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} aria-controls="primary-navigation" onClick={() => { setOpen(!open); setServicesOpen(false); }}><span className="menu-toggle-label">{open ? 'Cerrar' : 'Menú'}</span><span className="hamburger-lines" aria-hidden="true"><span /><span /><span /></span></button>
    <button className="nav-scrim" type="button" tabIndex={-1} aria-label="Cerrar navegación" hidden={!open} onClick={closeAll} />
    <nav id="primary-navigation" className={`navigation ${open ? 'is-open' : ''}`} aria-label="Principal">
      {links.map(([href, label, icon], index) => <div className="nav-entry" key={href}>
        {index === 3 && <div className="nav-services" ref={services} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setServicesOpen(false); }}><button ref={servicesButton} type="button" className={`nav-service-toggle${path === '/servicios' ? ' is-current' : ''}`} aria-expanded={servicesOpen} aria-controls="services-navigation" onClick={() => setServicesOpen(!servicesOpen)}><NavIcon name="services" />Servicios<NavIcon name="chevron" /></button><div id="services-navigation" className="nav-service-panel" hidden={!servicesOpen}><span className="nav-service-heading">DE LA IDEA AL PRODUCTO</span><Link href="/servicios#desarrollo-web" onClick={closeAll}>Desarrollo web<small>Interfaces claras y adaptables</small></Link><Link href="/servicios#sistemas" onClick={closeAll}>Sistemas a medida<small>Procesos, datos y herramientas</small></Link><Link href="/servicios#integraciones" onClick={closeAll}>Integraciones y APIs<small>Conecta tus servicios</small></Link></div></div>}
        <Link href={href} onClick={closeAll} aria-current={path === href || (href !== '/' && path.startsWith(`${href}/`)) ? 'page' : undefined}><NavIcon name={icon} />{label}<Pending /></Link>
      </div>)}
      <Link className="nav-contact" href="/contacto" onClick={closeAll} aria-current={path === '/contacto' ? 'page' : undefined}><NavIcon name="chat" />Conversemos<NavIcon name="arrow" /><Pending /></Link>
    </nav>
  </>;
}
function Pending() {
  const { pending } = useLinkStatus();
  return pending ? <span className="nav-pending" role="status"><span className="sr-only">Cargando…</span></span> : null;
}
