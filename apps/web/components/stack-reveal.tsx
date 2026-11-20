'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export function StackReveal({ children, className }: { children: ReactNode; className: string }) {
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.IntersectionObserver) return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute('data-stack-entered', '');
        observer.unobserve(entry.target);
      }
    }, { threshold: .12 });

    grid.current?.querySelectorAll('[data-stack-layer]').forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return <div ref={grid} className={className}>{children}</div>;
}
