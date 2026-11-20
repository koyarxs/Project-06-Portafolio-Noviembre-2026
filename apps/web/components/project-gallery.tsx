'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState, type KeyboardEvent, type TouchEvent } from 'react';
import { Arrow } from './icons';
import styles from './project-gallery.module.css';

export type ProjectCapture = {
  image: string;
  title: string;
  caption: string;
  alt?: string;
  width: number;
  height: number;
};

const mainSizes = '(max-width: 760px) 92vw, (max-width: 1250px) 75vw, 980px';
const format = (number: number) => String(number).padStart(2, '0');

function CaptureImage({ capture, sizes, onLoad }: { capture: ProjectCapture; sizes: string; onLoad?: () => void }) {
  const [failed, setFailed] = useState(false);
  return failed ? <div className={styles.error}>
    <p role="status">No se pudo cargar esta captura.</p>
    <a href={capture.image} target="_blank" rel="noopener noreferrer">Abrir archivo original</a>
  </div> : <Image src={capture.image} alt={capture.alt ?? capture.caption}
    width={capture.width} height={capture.height} sizes={sizes}
    onLoad={onLoad} onError={() => setFailed(true)} />;
}

export function ProjectGallery({ captures, projectName, loop = true }: {
  captures: readonly ProjectCapture[];
  projectName: string;
  loop?: boolean;
}) {
  const [selection, setSelection] = useState({ index: 0, direction: 0 });
  const [loaded, setLoaded] = useState<string>();
  const [expanded, setExpanded] = useState(false);
  const [zoom, setZoom] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const modalTitle = useId();
  const count = captures.length;
  const index = Math.min(selection.index, Math.max(0, count - 1));
  const capture = captures[index];
  const position = `${format(index + 1)} / ${format(count)}`;

  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [expanded]);

  if (!capture) return <p>No hay capturas disponibles para este proyecto.</p>;

  function neighbor(from: number, step: -1 | 1) {
    const next = from + step;
    return loop ? (next + count) % count : Math.max(0, Math.min(count - 1, next));
  }

  function move(step: -1 | 1) {
    setSelection(current => {
      const from = Math.min(current.index, count - 1);
      const next = neighbor(from, step);
      return next === from ? current : { index: next, direction: step };
    });
    setZoom(false);
  }

  function keys(event: KeyboardEvent) {
    if (count < 2 || zoom || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      event.stopPropagation();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  }

  function startTouch(event: TouchEvent) {
    const point = event.touches[0];
    touch.current = !zoom && event.touches.length === 1 ? { x: point.clientX, y: point.clientY } : null;
  }

  function endTouch(event: TouchEvent) {
    const start = touch.current;
    touch.current = null;
    if (!start || count < 2 || zoom) return;
    const point = event.changedTouches[0];
    const dx = point.clientX - start.x;
    const dy = point.clientY - start.y;
    if (Math.abs(dx) >= 45 && Math.abs(dx) > 1.35 * Math.abs(dy)) move(dx < 0 ? 1 : -1);
  }

  const neighbors = [...new Set([neighbor(index, -1), neighbor(index, 1)])].filter(item => item !== index);
  const direction = selection.direction < 0 ? 'backward' : selection.direction > 0 ? 'forward' : undefined;
  const controls = count > 1 && <div className={styles.controls}>
    <button type="button" className={styles.round} onClick={() => move(-1)} disabled={!loop && index === 0} aria-label="Captura anterior">
      <Arrow className={styles.previous} />
    </button>
    <span aria-hidden="true">{position}</span>
    <button type="button" className={styles.round} onClick={() => move(1)} disabled={!loop && index === count - 1} aria-label="Captura siguiente">
      <Arrow />
    </button>
  </div>;

  return <div className={styles.gallery} role="region" aria-label={`Galería de ${projectName}`} tabIndex={0} onKeyDown={keys}>
    <div className={styles.shell}>
      <div className={styles.toolbar}>
        <span className={styles.logo} role="img" aria-label="YB Veltrix Solutions" />
        <button ref={opener} className={styles.expand} type="button" aria-haspopup="dialog" onClick={() => {
          dialog.current?.showModal();
          closeButton.current?.focus();
          setExpanded(true);
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5" />
          </svg>
          Ampliar
        </button>
      </div>
      <div className={styles.layout} data-multiple={count > 1}>
        <div className={styles.stage} onTouchStart={startTouch} onTouchEnd={endTouch} onTouchCancel={() => { touch.current = null; }}>
          <div key={index} className={styles.slide} data-direction={direction}>
            <CaptureImage capture={capture} sizes={mainSizes} onLoad={() => setLoaded(capture.image)} />
          </div>
          {loaded === capture.image && neighbors.map(item =>
            <Image key={captures[item].image} className={styles.preload} src={captures[item].image} alt=""
              width={captures[item].width} height={captures[item].height} sizes={mainSizes} loading="eager" aria-hidden="true" />)}
        </div>
        {count > 1 && <ul className={styles.thumbs} aria-label="Miniaturas">
          {captures.map((item, itemIndex) => <li key={item.image}>
            <button type="button" aria-current={itemIndex === index ? 'true' : undefined}
              aria-label={`Ver ${item.title}`} onClick={() => setSelection(current => itemIndex === current.index
                ? current : { index: itemIndex, direction: itemIndex < current.index ? -1 : 1 })}>
              <Image src={item.image} width={item.width} height={item.height} sizes="110px" alt="" />
              <span>{format(itemIndex + 1)}</span>
            </button>
          </li>)}
        </ul>}
      </div>
      {controls}
    </div>
    <div className={styles.caption} aria-live="polite" aria-atomic="true">
      <div><strong>{capture.title}</strong><p>{capture.caption}</p></div>
      <span><span className={styles.srOnly}>Captura </span>{position}</span>
    </div>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={modalTitle} onClose={() => {
      setExpanded(false);
      setZoom(false);
      opener.current?.focus({ preventScroll: true });
    }}>
      <div className={styles.modalBar}>
        <h3 id={modalTitle}>{projectName} · Capturas</h3>
        <div>
          <button className={styles.expand} type="button" aria-pressed={zoom} onClick={() => setZoom(value => !value)}>Zoom</button>
          <button ref={closeButton} className={styles.expand} type="button" onClick={() => dialog.current?.close()}>Cerrar</button>
        </div>
      </div>
      {expanded && <>
        <div key={index} className={styles.modalStage} data-zoom={zoom} data-direction={direction}
          tabIndex={zoom ? 0 : undefined} role={zoom ? 'region' : undefined}
          aria-label={zoom ? 'Captura ampliada desplazable' : undefined}
          onTouchStart={startTouch} onTouchEnd={endTouch} onTouchCancel={() => { touch.current = null; }}>
          <CaptureImage capture={capture} sizes={zoom ? '150vw' : '96vw'} />
        </div>
        <div className={styles.modalFooter}>
          <p aria-live="polite" aria-atomic="true">{capture.title} <span>· {position}</span></p>
          {controls}
        </div>
      </>}
    </dialog>
  </div>;
}
