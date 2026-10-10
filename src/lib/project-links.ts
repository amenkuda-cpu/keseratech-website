import type { Project } from '@/lib/db';
import { divisionBySlug } from '@/content/site';

/** Where a project's main "Explore" button goes. */
export function exploreTarget(p: Pick<Project, 'slug' | 'name' | 'division'>) {
  const division = divisionBySlug(p.division)!;
  // Division ventures point to their division; Sera Tech's own platforms point to the project.
  return p.division === 'sera-tech'
    ? { href: `/projects/${p.slug}`, label: `Explore ${p.name}` }
    : { href: `/${division.slug}`, label: `Explore ${division.name}` };
}
