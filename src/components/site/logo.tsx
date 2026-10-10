import Image from 'next/image';
import { cn } from '@/lib/utils';
import lockup from '../../../public/brand/kesera-lockup.png';
import lockupTagline from '../../../public/brand/kesera-lockup-tagline.png';

// The supplied Kesera Technologies artwork, cut out of its backdrop (brand/extract.cjs). Never redraw it.
// It is white and blue, so it is only placed on dark surfaces.

export function Logo({ className, priority, tagline }: { className?: string; priority?: boolean; tagline?: boolean }) {
  return (
    <Image
      src={tagline ? lockupTagline : lockup}
      alt="Kesera Technologies"
      priority={priority}
      className={cn('h-auto select-none', className)}
      sizes="(min-width: 768px) 320px, 200px"
    />
  );
}
