'use client';

import { useEffect, useRef, useState } from 'react';

const sessionKey = 'veltrix-intro-seen';

export function EpicIntro() {
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const skipRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (window.location.pathname.startsWith('/proyectos/destacados/')) return;
    try { if (sessionStorage.getItem(sessionKey)) return; } catch { /* Storage is optional. */ }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setActive(true);
    const focusTimer = window.setTimeout(() => skipRef.current?.focus({ preventScroll: true }), 0);
    const started = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const elapsed = now - started;
      setProgress(Math.min(100, Math.floor((elapsed / 3600) * 100)));
      if (elapsed >= 4400) setLeaving(true);
      if (elapsed >= 5000) { setActive(false); return; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(focusTimer);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    return () => { try { sessionStorage.setItem(sessionKey, '1'); } catch { /* Storage is optional. */ } };
  }, [active]);

  // Restore scroll as soon as the overlay closes, including a manual skip.
  useEffect(() => {
    if (!active) return;
    const root = document.querySelector<HTMLElement>('[data-intro-content]');
    if (root) root.inert = true;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { if (root) root.inert = false; document.body.style.overflow = overflow; document.getElementById('contenido')?.focus({ preventScroll: true }); };
  }, [active]);

  if (!active) return null;
  const complete = progress === 100;
  const status = complete ? '¡Compilación exitosa!' : progress < 28 ? 'Inicializando el universo…' : progress < 65 ? 'Conectando ideas con código…' : 'Compilando la próxima experiencia…';

  return <div className={`epic-intro${leaving ? ' epic-intro-leaving' : ''}`} role="dialog" aria-modal="true" aria-label="Bienvenido a Veltrix Solutions" onKeyDown={event => { if (event.key === 'Escape') setActive(false); }}>
    <div className="intro-grid" aria-hidden="true" />
    <button ref={skipRef} className="intro-skip" onClick={() => setActive(false)}>Saltar intro <span aria-hidden="true">↗</span></button>
    <div className="intro-scene">
      <div className="intro-brand"><span className="intro-logo" aria-hidden="true" /><span>VELTRIX<small>SOLUTIONS</small></span></div>
      <p className="intro-eyebrow">DE LA IDEA AL CÓDIGO. DEL CÓDIGO AL MUNDO.</p>
      <div className="intro-operator" aria-hidden="true">
        <div className="intro-orbit" />
        <span className="intro-code intro-code-left">&lt;build /&gt;<br />system.init()<br />ideas → reality</span>
        <span className="intro-code intro-code-right">01011001<br />deploy.ready<br />&gt; veltrix_</span>
        <svg viewBox="0 0 480 330" fill="none" className="intro-hood">
          <defs><linearGradient id="hood-fabric" x1="140" y1="80" x2="330" y2="300" gradientUnits="userSpaceOnUse"><stop stopColor="#24456d" /><stop offset=".55" stopColor="#0c1830" /><stop offset="1" stopColor="#050c1b" /></linearGradient><linearGradient id="hood-edge"><stop stopColor="#278aff" /><stop offset="1" stopColor="#72f5df" /></linearGradient></defs>
          <ellipse cx="240" cy="307" rx="177" ry="14" fill="#2699ff" opacity=".12" />
          <path d="M99 278c7-60 34-74 68-91-17-28-9-74 14-112 15-25 34-44 59-51 25 7 44 26 59 51 23 38 31 84 14 112 34 17 61 31 68 91Z" fill="url(#hood-fabric)" stroke="#2d557d" strokeWidth="2" />
          <path d="M170 175c-4-53 25-110 70-137 45 27 74 84 70 137l-39 34h-62Z" fill="#030914" stroke="url(#hood-edge)" strokeWidth="2" />
          <path d="m180 175 30 28m90-28-30 28M163 204l-22 53m176-53 22 53" stroke="#37668e" strokeWidth="2" />
          <path className="intro-eyes" d="m212 137 16 4m24 0 16-4" stroke="#70f7e6" strokeWidth="3" strokeLinecap="round" />
          <path d="m151 243 48 24m130-24-48 24" stroke="#34597a" strokeWidth="19" strokeLinecap="round" />
          <path d="m198 267 21 7m63-7-21 7" stroke="#67c7e2" strokeWidth="8" strokeLinecap="round" />
          <path d="M162 223h156l-14 78H176Z" fill="#09172b" stroke="url(#hood-edge)" strokeWidth="2" />
          <path d="m228 252-10 9 10 9m24-18 10 9-10 9m-8-20-8 24" stroke="#60d7f3" strokeWidth="2" />
          <path d="M157 302h166" stroke="#6ab4ef" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
      <div className="intro-load-heading"><span>{complete ? 'SISTEMA EN LÍNEA' : 'SECUENCIA DE INICIO'}</span><strong>{String(progress).padStart(2, '0')}<small>%</small></strong></div>
      <div className="intro-progress" role="progressbar" aria-label="Animación de inicio" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>
      <p className={`intro-status${complete ? ' intro-success' : ''}`} role="status">{complete ? '✓ ' : '> '}{status}</p>
      <p className="intro-footnote">{complete ? 'Bienvenido. Lo que viene, se construye.' : 'CREATIVIDAD HUMANA · INGENIERÍA SIN LÍMITES'}</p>
    </div>
  </div>;
}
