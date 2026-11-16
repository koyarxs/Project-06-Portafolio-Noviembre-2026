'use client';

import { useEffect, useRef } from 'react';

/** Reactive energy field, rendered at device resolution and suspended off screen. */
export function DigitalFireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0, height = 0, frame = 0, last = 0, nextBurst = 0, visible = true;
    let pointerX = .5, pointerY = .5, smoothX = .5, smoothY = .5;
    let pointerActive = false;
    const surface = canvas.parentElement;
    const pointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      pointerActive = true;
      const bounds = canvas.getBoundingClientRect();
      pointerX = (event.clientX - bounds.left) / bounds.width;
      pointerY = (event.clientY - bounds.top) / bounds.height;
    };
    const pointerLeave = () => { pointerX = .5; pointerY = .5; pointerActive = false; };
    surface?.addEventListener('pointermove', pointerMove, { passive: true });
    surface?.addEventListener('pointerleave', pointerLeave);
    type Particle = { x: number; y: number; vx: number; vy: number; life: number; hue: number; };
    let particles: Particle[] = [];
    const fieldNodes = Array.from({ length: 25 }, (_, index) => ({
      x: ((index * 37 + 13) % 101) / 100,
      y: ((index * 53 + 21) % 97) / 100,
      phase: index * 2.399,
    }));
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width; height = bounds.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const burst = () => {
      const x = width * (Math.random() < .5 ? .08 + Math.random() * .23 : .69 + Math.random() * .23);
      const y = height * (.18 + Math.random() * .55);
      const hue = Math.random() < .65 ? 210 : 255;
      for (let i = 0; i < 30; i++) {
        const angle = (Math.PI * 2 * i) / 30;
        const speed = 26 + Math.random() * 55;
        particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, hue });
      }
    };
    const draw = (time: number) => {
      frame = 0;
      if (!visible || document.hidden || preference.matches) { last = 0; return; }
      if (last && time - last < (width < 700 ? 30 : 16)) { frame = requestAnimationFrame(draw); return; }
      const dt = Math.min((time - (last || time)) / 1000, .04); last = time;
      context.clearRect(0, 0, width, height);
      smoothX += (pointerX - smoothX) * .045; smoothY += (pointerY - smoothY) * .045;
      const phase = time * .00014;
      context.globalCompositeOperation = 'source-over';
      // A sparse constellation links nearby nodes; the pointer energizes its neighbourhood.
      const points = fieldNodes.map(node => ({
        x: node.x * width + Math.sin(phase + node.phase) * 17,
        y: height * (.22 + node.y * .65) + Math.cos(phase * .8 + node.phase) * 14,
      }));
      const reach = Math.min(width * .23, 180);
      for (let i = 0; i < points.length; i++) {
        const a = points[i];
        const nearby = pointerActive && Math.hypot(a.x - smoothX * width, a.y - smoothY * height) < reach;
        context.fillStyle = nearby ? '#246eeacc' : '#4b81c45c';
        context.beginPath(); context.arc(a.x, a.y, nearby ? 2 : 1.2, 0, Math.PI * 2); context.fill();
        for (let j = i + 1; j < points.length; j++) {
          const b = points[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance > reach) continue;
          context.strokeStyle = `rgba(54, 115, 211, ${(1 - distance / reach) * (nearby ? .32 : .1)})`;
          context.lineWidth = nearby ? .8 : .5;
          context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
        }
      }
      if (pointerActive) {
        const glow = context.createRadialGradient(smoothX * width, smoothY * height, 0, smoothX * width, smoothY * height, 160);
        glow.addColorStop(0, '#6a9fff17'); glow.addColorStop(1, '#6a9fff00');
        context.fillStyle = glow; context.fillRect(0, 0, width, height);
      }
      // A flowing ribbon surface in perspective, displaced gently by the pointer.
      const gradient = context.createLinearGradient(0, height, width, height * .15);
      gradient.addColorStop(0, '#1378ed00'); gradient.addColorStop(.25, '#2588e844');
      gradient.addColorStop(.52, '#7759d64d'); gradient.addColorStop(.78, '#267de866'); gradient.addColorStop(1, '#267de800');
      for (let line = 0; line < 34; line++) {
        const depth = line / 33;
        context.beginPath();
        for (let step = 0; step <= 80; step++) {
          const x = (step / 80) * width;
          const u = step / 80;
          const envelope = Math.sin(u * Math.PI);
          const y = height * (.73 + depth * .24) + Math.sin(u * 7 + phase + depth * 1.8) * height * .12 * envelope
            - Math.sin(u * Math.PI * 1.6 + phase * .6) * depth * height * .22
            + (smoothY - .5) * 35 * envelope + (smoothX - .5) * Math.cos(u * 5) * 25;
          if (step === 0) context.moveTo(x, y); else context.lineTo(x, y);
        }
        context.strokeStyle = gradient; context.lineWidth = line % 8 === 0 ? 1 : .55; context.stroke();
      }
      if (time > nextBurst) { burst(); nextBurst = time + 1500 + Math.random() * 1400; }
      context.globalCompositeOperation = 'source-over';
      for (const p of particles) {
        const oldX = p.x, oldY = p.y;
        p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= Math.exp(-.8 * dt); p.vy *= Math.exp(-.8 * dt); p.life -= dt * .43;
        if (p.life <= 0) continue;
        context.strokeStyle = `hsla(${p.hue}, 80%, 52%, ${p.life * .65})`;
        context.lineWidth = 1;
        context.beginPath(); context.moveTo(oldX - p.vx * .06, oldY - p.vy * .06); context.lineTo(p.x, p.y); context.stroke();
        context.fillStyle = `hsla(${p.hue}, 80%, 55%, ${p.life})`;
        context.fillRect(p.x, p.y, 1.6, 1.6);
      }
      particles = particles.filter(p => p.life > 0);
      frame = requestAnimationFrame(draw);
    };
    const resume = () => {
      if (preference.matches || !visible || document.hidden) {
        cancelAnimationFrame(frame); frame = 0; particles = []; last = 0; context.clearRect(0, 0, width, height);
      } else if (!frame) { frame = requestAnimationFrame(draw); }
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; resume(); });
    observer.observe(canvas);
    const sizeObserver = new ResizeObserver(resize); sizeObserver.observe(canvas);
    preference.addEventListener('change', resume); document.addEventListener('visibilitychange', resume);
    resize(); resume();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); sizeObserver.disconnect(); preference.removeEventListener('change', resume); document.removeEventListener('visibilitychange', resume); surface?.removeEventListener('pointermove', pointerMove); surface?.removeEventListener('pointerleave', pointerLeave); };
  }, []);
  return <canvas ref={canvasRef} className="digital-fireworks" aria-hidden="true" />;
}
