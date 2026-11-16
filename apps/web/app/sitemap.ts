import type { MetadataRoute } from 'next';
import { siteUrl } from '../lib/seo';
import { getProjects } from '../lib/api';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = ['/', '/proyectos', '/servicios', '/sobre-mi', '/experiencia', '/laboratorios', '/contacto'];
  // Recorre el catálogo publicado; nunca construye slugs a partir del seed privado.
  for (let page = 1; page <= 1000; page++) {
    const result = await getProjects(`limit=100&page=${page}`);
    if (result.status !== 'ok') break;
    paths.push(...result.data.data.map(item => `/proyectos/${encodeURIComponent(item.slug)}`));
    if (page >= result.data.meta.totalPages) break;
  }
  return paths.map(path => ({ url: new URL(path, siteUrl).href }));
}
