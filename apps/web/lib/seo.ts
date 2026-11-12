import type { Metadata } from 'next';
const configured = process.env.SITE_URL ?? 'http://127.0.0.1:3000';
export const siteUrl = new URL(configured);
export function pageMetadata(title: string, description: string, path: string): Metadata {
  return { title, description, alternates: { canonical: path }, openGraph: {
    title, description, url: path, type: 'website', locale: 'es_CL', siteName: 'Portafolio · Full Stack',
  } };
}
