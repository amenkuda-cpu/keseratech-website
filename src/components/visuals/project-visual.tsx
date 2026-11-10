import type { Project } from '@/lib/db';
import { PROJECT_MEDIA, media } from '@/content/media';
import { MediaFrame } from './media';

/**
 * A real photograph (or, with `loop`, a short silent video) for a project's subject.
 * Replaces the old concept schematics.
 */
export function ProjectVisual({
  visual,
  loop = false,
  className,
  aspect,
  sizes,
  priority,
  rounded,
}: {
  visual: Project['visual'] | 'home';
  loop?: boolean;
  className?: string;
  aspect?: string;
  sizes?: string;
  priority?: boolean;
  rounded?: boolean;
}) {
  const entry = visual === 'none' ? undefined : PROJECT_MEDIA[visual];
  if (!entry) return null;
  const id = loop && entry.loop ? entry.loop : entry.still;
  return <MediaFrame media={media(id)} className={className} aspect={aspect} sizes={sizes} priority={priority} rounded={rounded} />;
}
