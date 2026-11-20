'use client';

import { useEffect, useRef } from 'react';
import { TypewriterText } from './typewriter-text';
import { DeveloperAvatarHead } from './developer-avatar-head';

export function DeveloperAvatar() {
  const sceneRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const mug = scene.querySelector<SVGGElement>('.studio-mug-moving');
    const arm = scene.querySelector<SVGPathElement>('.studio-drinking-arm');
    const hand = scene.querySelector<SVGGElement>('.studio-drinking-hand');
    const head = scene.querySelector<SVGGElement>('.studio-head');
    const gaze = scene.querySelector<SVGGElement>('.studio-pupils');
    const mouth = scene.querySelector<SVGPathElement>('.studio-mouth');
    const coffee = scene.querySelector<SVGPathElement>('.studio-coffee-flow');
    const coffeeLight = scene.querySelector<SVGPathElement>('.studio-coffee-highlight');
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer: ReturnType<typeof setTimeout>;
    let frame = 0;
    let disposed = false;
    const ease = (value: number) => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
    const reset = () => {
      scene.classList.remove('is-drinking');
      mug?.removeAttribute('transform');
      head?.style.removeProperty('transform');
      gaze?.removeAttribute('transform');
      mouth?.setAttribute('d', 'M249 126Q257 132 265 126');
      coffee?.setAttribute('opacity', '0');
      coffeeLight?.setAttribute('opacity', '0');
      scene.removeAttribute('data-coffee-phase');
    };
    const schedule = (delay = 20000 + Math.random() * 14000) => {
      if (!disposed && !preference.matches) timer = setTimeout(begin, delay);
    };
    const begin = () => {
      const bounds = scene.getBoundingClientRect();
      if (document.hidden || bounds.bottom < 0 || bounds.top > window.innerHeight || scene.closest('[inert]')) { schedule(6000); return; }
      scene.classList.add('is-drinking');
      const started = performance.now();
      const animate = (now: number) => {
        const t = (now - started) / 1000;
        if (t >= 7) { reset(); schedule(); return; }
        const reach = ease(t / .9) * (1 - ease((t - 5.8) / 1.2));
        const lift = ease((t - .9) / 1.35) * (1 - ease((t - 4.5) / 1.3));
        const tilt = ease((t - 2.25) / .5) * (1 - ease((t - 4) / .5));
        const headAngle = 2 * reach + 4 * lift;
        const headRadians = headAngle * Math.PI / 180;
        if (head) head.style.transform = `translateY(${tilt}px) rotate(${headAngle}deg)`;
        // The cup's near rim touches the actual lip position, including the head tilt.
        const lipX = 257 + 14 * Math.sin(headRadians);
        const lipY = 142 - 14 * Math.cos(headRadians) + tilt;
        const angle = -20 * tilt;
        const radians = angle * Math.PI / 180;
        const rimX = 414 - 23 * Math.cos(radians) + 17 * Math.sin(radians);
        const rimY = 250 - 23 * Math.sin(radians) - 17 * Math.cos(radians);
        // Keep a tiny visible gap for the coffee stream during the sip.
        const streamGap = 9 * tilt;
        const dx = (lipX + streamGap - rimX) * lift, dy = (lipY - 5 * tilt - rimY) * lift;
        mug?.setAttribute('transform', `translate(${dx} ${dy}) rotate(${angle} 414 250)`);
        // Follow the handle through exactly the same rotation as the cup.
        const gripX = 414 + 34 * Math.cos(radians) - Math.sin(radians) + dx;
        const gripY = 250 + 34 * Math.sin(radians) + Math.cos(radians) + dy;
        const wristX = 301 + (gripX - 301) * reach;
        const wristY = 270 + (gripY - 270) * reach;
        const elbowX = 342 + 28 * reach - 9 * lift;
        const elbowY = 246 - 51 * lift;
        arm?.setAttribute('d', `M326 190 Q${elbowX} ${elbowY} ${wristX} ${wristY}`);
        hand?.setAttribute('transform', `translate(${wristX} ${wristY}) rotate(${angle})`);
        gaze?.setAttribute('transform', `translate(${4 * reach - 2 * lift} ${2 * reach + lift})`);
        const opening = ease((t - 1.7) / .5) * (1 - ease((t - 4.5) / .4));
        const halfWidth = 8 - 2 * opening;
        const upperY = 132 - 11 * opening;
        const lowerY = 132 + 5 * opening;
        const edgeY = 126 + 2 * opening;
        mouth?.setAttribute('d', `M${257 - halfWidth} ${edgeY} Q257 ${upperY} ${257 + halfWidth} ${edgeY} Q257 ${lowerY} ${257 - halfWidth} ${edgeY}Z`);
        const flow = ease((t - 2.65) / .18) * (1 - ease((t - 3.9) / .2));
        const sourceX = rimX + dx, sourceY = rimY + dy;
        const liquidPath = `M${sourceX + 1} ${sourceY} Q${lipX + 4} ${lipY - 3} ${lipX} ${lipY + 1}`;
        coffee?.setAttribute('d', liquidPath);
        coffee?.setAttribute('opacity', String(flow));
        coffeeLight?.setAttribute('d', liquidPath);
        coffeeLight?.setAttribute('opacity', String(flow * .8));
        scene.dataset.coffeePhase = t < .9 ? 'reach' : t < 2.65 ? 'lift' : t < 4.1 ? 'sip' : t < 5.8 ? 'replace' : 'resume';
        frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
    };
    const onPreferenceChange = () => { clearTimeout(timer); cancelAnimationFrame(frame); reset(); schedule(); };
    preference.addEventListener('change', onPreferenceChange);
    schedule(12000);
    return () => { disposed = true; clearTimeout(timer); cancelAnimationFrame(frame); preference.removeEventListener('change', onPreferenceChange); reset(); };
  }, []);
  return <div ref={sceneRef} className="developer-avatar avatar-studio" role="img" aria-label="Avatar de Yerko escribiendo y tomando ocasionalmente un sorbo de su café Hello World">
    <svg viewBox="0 0 520 315" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="studio-skin" x1="225" y1="50" x2="285" y2="147" gradientUnits="userSpaceOnUse"><stop stopColor="#efbc96" /><stop offset="1" stopColor="#cd8b65" /></linearGradient>
        <linearGradient id="studio-shirt" x1="188" y1="142" x2="315" y2="280" gradientUnits="userSpaceOnUse"><stop stopColor="#364252" /><stop offset=".5" stopColor="#192330" /><stop offset="1" stopColor="#0b1420" /></linearGradient>
        <linearGradient id="studio-metal" x1="191" y1="203" x2="328" y2="277" gradientUnits="userSpaceOnUse"><stop stopColor="#7691ac" /><stop offset=".45" stopColor="#2b425b" /><stop offset="1" stopColor="#102139" /></linearGradient>
        <linearGradient id="studio-mug"><stop stopColor="#fff" /><stop offset=".7" stopColor="#eef5fc" /><stop offset="1" stopColor="#bbd3e8" /></linearGradient>
        <linearGradient id="studio-hair" x2="1" y2="1"><stop stopColor="#463d38" /><stop offset="1" stopColor="#171c23" /></linearGradient>
        <clipPath id="studio-code-clip"><rect className="studio-code-reveal" x="63" y="98" width="120" height="64" /></clipPath>
      </defs>
      <ellipse cx="265" cy="284" rx="220" ry="12" fill="#b7d8ff" opacity=".18" /><path d="M43 282h431" stroke="#d2e8ff" strokeOpacity=".4" strokeWidth="2" strokeLinecap="round" />
      <g className="studio-editor"><rect x="52" y="69" width="134" height="111" rx="13" fill="#fff" stroke="#d4e6f8" strokeWidth="1.5" /><path d="M53 94h132" stroke="#e4edf6" />
        <circle cx="66" cy="82" r="2.5" fill="#ed9b99" /><circle cx="75" cy="82" r="2.5" fill="#edcb79" /><circle cx="84" cy="82" r="2.5" fill="#8ac8ad" /><text x="111" y="85" fill="#7f94ad" fontFamily="monospace" fontSize="7">hello.ts</text>
        <g clipPath="url(#studio-code-clip)" fontFamily="monospace" fontSize="8"><text x="65" y="110" fill="#8559bc">const <tspan fill="#337db0">yerko</tspan><tspan fill="#67788b"> = {'{'}</tspan></text><text x="72" y="124" fill="#337db0">role: <tspan fill="#b16b48">&quot;dev&quot;</tspan>,</text><text x="72" y="138" fill="#337db0">build: <tspan fill="#a57e2e">create</tspan>(),</text><text x="65" y="152" fill="#67788b">{'}'};<tspan fill="#628b69"> // let's code</tspan></text></g>
        <rect className="studio-editor-cursor" x="66" y="157" width="5" height="9" rx="1" fill="#4f92de" />
      </g>
      <g className="studio-output" stroke="#fff" strokeLinecap="round" strokeLinejoin="round"><path className="studio-brackets" d="m390 95-13 12 13 12m27-24 13 12-13 12m-10-29-8 35" strokeWidth="3" /><path className="studio-output-line" d="M378 139h51m-51 12h35m-35 12h43" strokeWidth="2" strokeOpacity=".7" /></g>
      <g className="studio-torso"><path d="M210 136c-21 5-33 25-37 51l-12 78h191l-13-78c-4-26-16-46-38-51Z" fill="url(#studio-shirt)" stroke="#63768b" strokeOpacity=".5" /><path d="M237 118v30l20 17 20-17v-30" fill="url(#studio-skin)" /><path d="m235 142 22 23-22 13-17-36m61 0-22 23 22 13 17-36" fill="#111b28" stroke="#526276" strokeWidth="1.2" /><path d="M257 167v53m-51-44-10 49m113-49 10 49m-37-40h29v23h-29" stroke="#536277" strokeOpacity=".65" strokeWidth="1.2" /><circle cx="260" cy="184" r="1.5" fill="#6e8094" /><circle cx="260" cy="204" r="1.5" fill="#6e8094" /></g>
      <DeveloperAvatarHead skin="url(#studio-skin)" hair="url(#studio-hair)" />
      <g className="studio-sleeve sleeve-left"><path d="m188 190-10 51 33 19" stroke="#192637" strokeWidth="27" strokeLinecap="round" /><path d="m185 201-6 32" stroke="#53657b" strokeOpacity=".6" strokeWidth="2" /></g><g className="studio-sleeve sleeve-right"><path d="m326 190 10 51-33 19" stroke="#192637" strokeWidth="27" strokeLinecap="round" /><path d="m329 201 6 32" stroke="#53657b" strokeOpacity=".6" strokeWidth="2" /></g>
      <g className="studio-notebook"><path d="M197 208h120a7 7 0 0 1 7 8l-10 54H200l-10-54a7 7 0 0 1 7-8Z" fill="url(#studio-metal)" stroke="#b1cce4" strokeWidth="1.5" /><path d="M200 213h114" stroke="#d5eaff" strokeOpacity=".3" /><path className="studio-laptop-mark" d="m247 229-10 9 10 9m21-18 10 9-10 9m-8-21-6 24" stroke="#e2f5ff" strokeWidth="2" strokeLinecap="round" /><circle cx="257" cy="212" r="1" fill="#b4d5ed" /><path d="M189 270h136l16 9H173Z" fill="#bbcfdf" /><path d="M173 279h168l-5 4H178Z" fill="#6c91b1" />
        <g>{Array.from({ length: 12 }, (_, i) => <path key={i} className={`studio-key studio-key-${i % 3}`} d={`M${190 + i * 11} 273h7`} stroke="#335b80" strokeWidth="2" strokeLinecap="round" />)}</g><path d="M243 279h28" stroke="#3e6487" strokeWidth="1.5" />
      </g>
      <g className="studio-hand hand-a"><path d="m188 252 22 14 16 1 11 7-2 3-19-4-12 0-25-12" fill="url(#studio-skin)" /><path d="m218 270 12 5m-20-4 11 4" stroke="#ae7456" strokeWidth="1.2" strokeLinecap="round" /></g><g className="studio-hand hand-b"><path d="m326 252-22 14-16 1-11 7 2 3 19-4 12 0 25-12" fill="url(#studio-skin)" /><path d="m296 270-12 5m20-4-11 4" stroke="#ae7456" strokeWidth="1.2" strokeLinecap="round" /></g>
      <ellipse cx="414" cy="281" rx="36" ry="4" fill="#c8e0f5" fillOpacity=".5" />
      <path className="studio-drinking-arm" d="M326 190 Q342 246 301 270" stroke="#192637" strokeWidth="25" strokeLinecap="round" />
      <g className="studio-mug-moving"><path d="M437 240h8c18 0 18 24 0 24h-8" stroke="#e3f0fd" strokeWidth="6" /><path d="M391 233h47v35a11 11 0 0 1-11 11h-25a11 11 0 0 1-11-11Z" fill="url(#studio-mug)" stroke="#d5e6f6" /><ellipse cx="414.5" cy="233" rx="23.5" ry="4.5" fill="#dbe6ee" /><ellipse cx="414.5" cy="233" rx="19" ry="2.5" fill="#795543" /><text x="414" y="252" textAnchor="middle" fill="#2a5f8e" fontFamily="monospace" fontSize="8" fontWeight="700">Hello</text><text x="414" y="263" textAnchor="middle" fill="#2a5f8e" fontFamily="monospace" fontSize="8" fontWeight="700">World</text>
        <g stroke="#fff" strokeWidth="2" strokeLinecap="round">{[0, 1, 2].map(i => <path key={i} className={`studio-steam steam-${i}`} d={`M${402 + i * 12} 224c-12-12 12-17 0-31s10-16 0-27`} />)}</g>
      </g>
      <path className="studio-coffee-flow" opacity="0" d="M0 0" stroke="#542818" strokeWidth="4.2" strokeLinecap="round" fill="none" />
      <path className="studio-coffee-highlight" opacity="0" d="M0 0" stroke="#cc9866" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <g className="studio-drinking-hand" transform="translate(301 270)"><path d="M-12-6c3-3 7-2 10 0l7-2c5-1 7 2 5 5L5 4c-4 4-9 4-14 1Z" fill="url(#studio-skin)" stroke="#bd805f" strokeWidth=".8" /><path d="m1-2 7 1M0 1l6 1" stroke="#b77c5c" strokeWidth="1" strokeLinecap="round" /></g>
      <g className="studio-build-badge"><rect x="68" y="194" width="96" height="22" rx="11" fill="#fff" /><path d="m78 205 3 3 6-7" stroke="#339683" strokeWidth="1.5" strokeLinecap="round" /><text x="93" y="208" fill="#346c86" fontFamily="monospace" fontSize="7">build successful</text></g>
    </svg>
    <span className="avatar-terminal"><span aria-hidden="true" /><TypewriterText text="yerko@veltrix ~ construyendo ideas" delay={4100} speed={25} tone="comment" /></span>
  </div>;
}
