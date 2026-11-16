import { VisitorRail } from '../components/visitor-rail';
import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/manrope';
import '@fontsource-variable/newsreader';
import './globals.css';
import './hero-premium.css';
import './hero-composition.css';
import './navbar.css';
import './hero-atmosphere.css';
import './avatar-studio.css';
import './epic-intro.css';
import { EpicIntro } from '../components/epic-intro';
import { Header, Footer } from '../components/shell';
import { siteUrl } from '../lib/seo';

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: 'Portafolio · Ingeniería Full Stack', template: '%s · Portafolio Full Stack' },
  description: 'Portafolio profesional de ingeniería en Computación e Informática. Desarrollo Full Stack con React, Next.js, TypeScript y Node.js.',
  openGraph: { type: 'website', locale: 'es_CL', siteName: 'Portafolio · Full Stack' },
  twitter: { card: 'summary_large_image' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#faf9f6' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body className="min-h-screen flex flex-col"><EpicIntro /><div data-intro-content className="min-h-screen flex flex-col"><a className="skip-link" href="#contenido">Saltar al contenido</a><Header /><main id="contenido" tabIndex={-1} className="flex-1">{children}</main><Footer /><VisitorRail /></div></body></html>;
}
