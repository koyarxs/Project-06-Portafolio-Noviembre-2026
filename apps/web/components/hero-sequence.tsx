'use client';

import { useEffect, useRef, useState } from 'react';

/** Start the hero after the opening overlay has released the page. */
export function HeroSequence({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const content = root.current?.closest('[data-intro-content]');
    let frame = 0;
    const check = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setReady(!content?.hasAttribute('inert')));
    };
    const observer = new MutationObserver(check);
    if (content) observer.observe(content, { attributes: true, attributeFilter: ['inert'] });
    check();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, []);
  return <div ref={root} className="site-width hero-composition" data-hero-ready={ready}>{children}</div>;
}
