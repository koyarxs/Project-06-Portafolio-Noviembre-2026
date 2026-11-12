import { ImageResponse } from 'next/og';
export const alt = 'Portafolio profesional · Ingeniería Full Stack';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: '100%', height: '100%', background: '#faf9f6', color: '#244c3d', display: 'flex', flexDirection: 'column', padding: '85px 90px', justifyContent: 'space-between' }}><div style={{ display: 'flex', fontSize: 21, letterSpacing: 5 }}>PORTAFOLIO PROFESIONAL</div><div style={{ display: 'flex', flexDirection: 'column', fontSize: 70, letterSpacing: -3, lineHeight: 1.15 }}><span>Desarrollo Full Stack.</span><span style={{ fontFamily: 'serif', fontStyle: 'italic' }}>Criterio de ingeniería.</span></div><div style={{ fontSize: 21, color: '#626a64' }}>React · Next.js · TypeScript · Node.js · NestJS · Express.js</div></div>, size);
}
