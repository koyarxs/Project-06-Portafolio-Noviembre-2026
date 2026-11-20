'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export function CareerMotion({ children }: { children: ReactNode }) {
  const timeline = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.IntersectionObserver) return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute('data-career-entered', '');
        observer.unobserve(entry.target);
      }
    }, { threshold: .16 });
    timeline.current?.querySelectorAll('[data-career-reveal]').forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return <div ref={timeline}>{children}</div>;
}
