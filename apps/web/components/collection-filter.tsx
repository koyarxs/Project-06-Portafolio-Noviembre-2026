'use client';

import { Fragment, useId, useRef, useState, type ReactNode } from 'react';
import styles from './collection-filter.module.css';

type Option = { id: string; label: string; icon: string; color: string };
type Item = { id: string; category: string; areas?: readonly string[]; content: ReactNode };

export function CollectionFilter({ label, allLabel, options, items, gridClassName, allView, showCounts = false, areas }: {
  label: string; allLabel: string; options: readonly Option[]; items: readonly Item[];
  gridClassName?: string; allView?: ReactNode; showCounts?: boolean; areas?: readonly Option[];
}) {
  const resultId = useId();
  const resetButton = useRef<HTMLButtonElement>(null);
  const [selected, setSelected] = useState('all');
  const [area, setArea] = useState('all');
  const areaItems = area === 'all' ? items : items.filter(item => item.areas?.includes(area));
  const visible = selected === 'all' ? areaItems : areaItems.filter(item => item.category === selected);
  const all = { id: 'all', label: allLabel, icon: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z', color: 'blue' };
  const currentLabel = options.find(option => option.id === selected)?.label ?? allLabel;

  return <>
    {areas && <div className={styles.areaFilter} role="group" aria-label="Filtrar proyectos por área">
      <span className={styles.areaLabel}>Área del proyecto</span>
      <div className={styles.areaOptions}>
        {[{ ...all, label: 'Todas las áreas' }, ...areas].map(option => (
          <button key={option.id} type="button" data-color={option.color} aria-pressed={area === option.id}
            aria-controls={resultId} onClick={() => setArea(option.id)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d={option.icon} /></svg>{option.label}
          </button>
        ))}
      </div>
    </div>}
    {areas && <span className={styles.areaLabel}>Estado del proyecto</span>}
    <div className={styles.controls} data-project-filters={areas ? '' : undefined} role="group" aria-label={label}>
      {[all, ...options].map(option => (
        <button key={option.id} ref={option.id === 'all' ? resetButton : undefined} type="button" data-color={option.color}
          aria-pressed={selected === option.id} aria-controls={resultId} onClick={() => setSelected(option.id)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d={option.icon} /></svg>
          {option.label}
          {showCounts && <span>{option.id === 'all' ? areaItems.length : areaItems.filter(item => item.category === option.id).length}</span>}
        </button>
      ))}
    </div>
    <p className={styles.announcement} role="status">{areas?.find(option => option.id === area)?.label ?? ''} {currentLabel} · {visible.length} resultados</p>
    <div id={resultId}>
      <div key={`${area}-${selected}`} className={styles.enter}>
        {visible.length === 0 ? <div className={styles.empty}>
          <p>No hay proyectos con los filtros seleccionados.</p>
          <button type="button" onClick={() => {
            setSelected('all');
            setArea('all');
            resetButton.current?.focus({ preventScroll: true });
          }}>Ver todos los proyectos</button>
        </div> : selected === 'all' && allView ? allView :
          <div className={gridClassName}>{visible.map(item => <Fragment key={item.id}>{item.content}</Fragment>)}</div>}
      </div>
    </div>
  </>;
}
