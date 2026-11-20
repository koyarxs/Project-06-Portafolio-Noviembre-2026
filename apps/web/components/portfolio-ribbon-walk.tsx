'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { DeveloperAvatarHead } from './developer-avatar-head';
import styles from './public-work.module.css';

export function PortfolioRibbonWalk({ children }: { children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const avatar = useRef<HTMLDivElement>(null);
  const stamped = useRef(new Set<string>());

  useEffect(() => {
    const root = stage.current;
    const walker = avatar.current;
    if (!root || !walker) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const queue = new Set<HTMLElement>();
    let disposed = false;
    let running = false;
    let animation: Animation | undefined;
    let activeRibbon: HTMLElement | undefined;

    const walk = async () => {
      if (running || disposed || motion.matches) return;
      running = true;
      let previous: { x: number; y: number } | undefined;

      for (const card of queue) {
        queue.delete(card);
        const id = card.dataset.ribbonProject;
        const ribbon = card.querySelector<HTMLElement>('[data-ribbon]');
        if (!id || !ribbon || !card.isConnected || stamped.current.has(id)) continue;
        const bounds = ribbon.getBoundingClientRect();
        if (bounds.bottom < 0 || bounds.top > window.innerHeight) continue;
        const origin = root.getBoundingClientRect();
        const x = bounds.left - origin.left + 32;
        const y = bounds.top - origin.top + 19;
        const start = previous?.y === y ? previous.x : x - 34;
        walker.style.transform = `translate(${x}px,${y}px)`;
        walker.dataset.phase = 'walk';
        activeRibbon = ribbon;
        ribbon.dataset.placing = '';

        try {
          animation = walker.animate([
            { transform: `translate(${start}px,${y}px)`, opacity: previous?.y === y ? 1 : 0 },
            { transform: `translate(${x}px,${y}px)`, opacity: 1 },
          ], { duration: Math.min(820, 330 + Math.abs(x - start)), easing: 'ease-out' });
          await animation.finished;
          if (disposed || motion.matches || !card.isConnected) continue;
          walker.dataset.phase = 'stamp';
          delete ribbon.dataset.placing;
          ribbon.dataset.stamped = '';
          stamped.current.add(id);
          animation = walker.animate([{ opacity: 1 }, { opacity: 1, offset: .66 }, { opacity: 0 }], { duration: 560 });
          await animation.finished;
          previous = { x, y };
        } catch {
          break;
        } finally {
          delete ribbon.dataset.placing;
          activeRibbon = undefined;
          delete walker.dataset.phase;
        }
      }
      running = false;
    };

    const observer = new IntersectionObserver(entries => {
      if (motion.matches) return;
      for (const entry of entries) {
        const card = entry.target.closest<HTMLElement>('[data-ribbon-project]');
        if (entry.isIntersecting && card) queue.add(card);
      }
      void walk();
    });
    const observe = () => {
      observer.disconnect();
      root.querySelectorAll<HTMLElement>('[data-ribbon-project]').forEach(card => {
        if (!stamped.current.has(card.dataset.ribbonProject ?? '')) {
          const ribbon = card.querySelector('[data-ribbon]');
          if (ribbon) observer.observe(ribbon);
        }
      });
    };
    const mutation = new MutationObserver(observe);
    mutation.observe(root, { childList: true, subtree: true });
    const motionChanged = () => {
      animation?.cancel();
      queue.clear();
      if (!motion.matches) observe();
    };
    motion.addEventListener('change', motionChanged);
    window.addEventListener('resize', motionChanged);
    observe();

    return () => {
      disposed = true;
      queue.clear();
      observer.disconnect();
      mutation.disconnect();
      motion.removeEventListener('change', motionChanged);
      window.removeEventListener('resize', motionChanged);
      animation?.cancel();
      if (activeRibbon) delete activeRibbon.dataset.placing;
    };
  }, []);

  return <div className={styles.ribbonStage} ref={stage}>
    {children}
    <div className={styles.ribbonWalker} ref={avatar} aria-hidden="true">
      <svg viewBox="0 0 146 220" fill="none">
        <g className={styles.walkLeg} stroke="#243954" strokeWidth="20" strokeLinecap="round">
          <path d="M58 142 52 191" /><path d="M45 202h22" stroke="#17304e" />
        </g>
        <g className={styles.walkLeg} stroke="#3c5776" strokeWidth="20" strokeLinecap="round">
          <path d="M83 142 91 191" /><path d="M85 202h22" stroke="#17304e" />
        </g>
        <path d="M51 86h38c15 0 23 11 23 25l-9 36H37l-7-36c0-14 8-25 21-25Z" fill="#23374f" stroke="#102239" strokeWidth="3" />
        <path d="m65 109-10 8 10 8m12-16 10 8-10 8" stroke="#99dfff" strokeWidth="3" strokeLinecap="round" />
        <path d="m37 98-12 19 10 18" stroke="#354e6b" strokeWidth="12" strokeLinecap="round" />
        <g className={styles.stampArm}>
          <path d="m104 99 12 16 14-17" stroke="#3c5776" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="131" cy="96" r="6.5" fill="#e2a783" />
        </g>
        <g transform="translate(-80 -1) scale(.59)">
          <DeveloperAvatarHead skin="#e2a783" hair="#28282d" />
        </g>
      </svg>
    </div>
  </div>;
}
