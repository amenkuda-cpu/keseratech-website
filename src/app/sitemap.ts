import type { MetadataRoute } from 'next';
import { DIVISION_SLUGS } from '@/content/site';
import { BLOG_POSTS } from '@/content/seo/blog';
import { LOCATION_PAGES } from '@/content/seo/locations';
import { SERVICE_PAGES } from '@/content/seo/services';
import { listProjects } from '@/lib/db';
import { SITE_URL } from '@/lib/schema';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entry = (path: string, priority: number, changeFrequency: 'weekly' | 'monthly' | 'yearly' = 'weekly', lastModified: Date = now) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  });
  return [
    entry('', 1),
    // Money pages: the services people search for, then where we work.
    entry('/services', 0.9),
    ...SERVICE_PAGES.map((s) => entry(`/services/${s.slug}`, 0.9)),
    entry('/ai-workforce', 0.9),
    entry('/pricing', 0.8),
    entry('/locations', 0.7, 'monthly'),
    ...LOCATION_PAGES.map((l) => entry(`/locations/${l.slug}`, 0.8, 'monthly')),
    entry('/work', 0.8),
    entry('/blog', 0.7),
    ...BLOG_POSTS.map((p) => entry(`/blog/${p.slug}`, 0.6, 'monthly', new Date(`${p.published}T00:00:00Z`))),
    entry('/start', 0.7, 'monthly'),
    entry('/about', 0.6, 'monthly'),
    entry('/projects', 0.6),
    ...DIVISION_SLUGS.map((d) => entry(`/${d}`, 0.6, 'monthly')),
    ...(await listProjects()).map((p) => entry(`/projects/${p.slug}`, 0.5, 'monthly')),
    entry('/legal/privacy', 0.2, 'yearly'),
    entry('/legal/terms', 0.2, 'yearly'),
  ];
}
