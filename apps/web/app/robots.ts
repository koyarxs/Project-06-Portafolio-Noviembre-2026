import type { MetadataRoute } from 'next';
import { siteUrl } from '../lib/seo';
export default function robots(): MetadataRoute.Robots {
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(siteUrl.hostname);
  return { rules: { userAgent: '*', ...(local ? { disallow: '/' } : { allow: '/' }) }, sitemap: new URL('/sitemap.xml', siteUrl).href };
}
