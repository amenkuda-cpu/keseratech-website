import type { MetadataRoute } from 'next';
import { COMPANY } from '@/content/site';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.SITE_URL ?? `https://${COMPANY.website}`;
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/admin'] }], sitemap: `${base}/sitemap.xml` };
}
