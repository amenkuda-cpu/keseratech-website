import Image from 'next/image';
import type { Photo as PhotoData } from '@/content/photos';
import { cn } from '@/lib/utils';

/**
 * A real photograph with its caption and credit. Reference photos are labelled "Example" so
 * nobody mistakes another builder's work for Sera Home's; Sera Home's own photos say so.
 */
export function Photo({
  photo,
  className,
  imgClassName,
  sizes = '(min-width: 1024px) 50vw, 100vw',
  aspect,
  priority,
  tone = 'dark',
  caption = true,
}: {
  photo: PhotoData;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  /** CSS aspect-ratio, e.g. "4/3"; defaults to the photo's own */
  aspect?: string;
  priority?: boolean;
  tone?: 'dark' | 'paper';
  caption?: boolean;
}) {
  const muted = tone === 'dark' ? 'text-white/45' : 'text-ink/50';
  return (
    <figure className={cn('group/photo', className)}>
      <div
        className={cn('relative overflow-hidden rounded-[6px]', tone === 'dark' ? 'bg-deep' : 'bg-paper-2')}
        style={{ aspectRatio: aspect ?? `${photo.width}/${photo.height}` }}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn('object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover/photo:scale-[1.03]', imgClassName)}
        />
        <span
          className={cn(
            't-label absolute left-3 top-3 rounded-sm px-2 py-1 text-[0.6rem] backdrop-blur-md',
            photo.ours ? 'bg-home text-void' : 'bg-black/55 text-white/85',
          )}
        >
          {photo.ours ? 'Sera Home' : 'Example'}
        </span>
      </div>
      {caption && (
        <figcaption className="mt-3 text-sm leading-snug">
          <span className={tone === 'dark' ? 'text-white/85' : 'text-ink/85'}>{photo.caption}</span>
          <span className={cn('t-label mt-1.5 block text-[0.62rem] leading-relaxed', muted)}>
            {[photo.place, !photo.ours && photo.credit ? `Photo: ${photo.credit}` : null].filter(Boolean).join(' · ')}
            {!photo.ours && photo.license && (
              <>
                {' · '}
                {photo.licenseUrl ? (
                  <a href={photo.licenseUrl} target="_blank" rel="noreferrer license" className="underline-offset-2 hover:underline">{photo.license}</a>
                ) : (
                  photo.license
                )}
              </>
            )}
            {!photo.ours && photo.source && (
              <>
                {' · '}
                <a href={photo.source} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">Source</a>
              </>
            )}
          </span>
        </figcaption>
      )}
    </figure>
  );
}
