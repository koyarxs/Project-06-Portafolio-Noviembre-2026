'use client';

import { useEffect, useRef, useState } from 'react';

/** Keeps the full accessible text and reserves its space throughout the reveal. */
export function TypewriterText({ text, delay = 0, speed = 70, tone }: { text: string; delay?: number; speed?: number; tone?: 'keyword' | 'string' | 'function' | 'comment' | 'type' }) {
  const characters = Array.from(text);
  const root = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(characters.length);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sequence = root.current?.closest('[data-hero-ready]');
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      clearInterval(timer);
      if (preference.matches) { setCount(characters.length); return; }
      setCount(0);
      if (sequence?.getAttribute('data-hero-ready') === 'false') return;
      const began = Date.now();
      timer = setInterval(() => {
        const next = Math.min(characters.length, Math.max(0, Math.floor((Date.now() - began - delay) / speed)));
        setCount(next);
        if (next === characters.length) clearInterval(timer);
      }, 40);
    };
    const observer = new MutationObserver(start);
    if (sequence) observer.observe(sequence, { attributes: true, attributeFilter: ['data-hero-ready'] });
    start(); preference.addEventListener('change', start);
    return () => { clearInterval(timer); observer.disconnect(); preference.removeEventListener('change', start); };
  }, [text, delay, speed, characters.length]);
  return <span ref={root} className={`typewriter-text ${count > 0 && count < characters.length ? 'is-typing' : count === characters.length ? 'typing-complete' : 'typing-pending'}${tone ? ` code-${tone}` : ''}`}>
    <span className="sr-only">{text}</span>
    <span aria-hidden="true" className="typewriter-letters">{characters.map((character, index) => <span className={`typed-letter${tone && /[.(){};·/]/.test(character) ? ' code-punctuation' : ''}`} key={index} style={{ opacity: index < count ? 1 : 0 }}>{character}{tone && index === count - 1 && count < characters.length ? <span className="code-inline-caret" /> : null}</span>)}</span>
  </span>;
}
