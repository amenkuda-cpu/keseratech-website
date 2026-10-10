import type { MetadataRoute } from 'next';
import { COMPANY, DIVISION_SLUGS } from '@/content/site';
import { listProjects } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? `https://${COMPANY.website}`;
  const paths = [
    '',
    '/projects',
    '/pricing',
    '/start',
    '/about',
    '/legal/privacy',
    '/legal/terms',
    ...DIVISION_SLUGS.map((d) => `/${d}`),
    ...(await listProjects()).map((p) => `/projects/${p.slug}`),
  ];
  return paths.map((p) => ({ url: `${base}${p}`, changeFrequency: 'weekly', priority: p === '' ? 1 : 0.7 }));
}
