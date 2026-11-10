'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { Media as MediaData } from '@/content/media';
import { useReducedMotion } from '@/components/system/reduced-motion';
import { cn } from '@/lib/utils';

/**
 * A stock photo or a short silent loop, cropped to a frame. Photos lazy-load through next/image
 * (resized WebP/AVIF). Videos show their poster first, fetch the file only when near the screen,
 * pause when scrolled away, and stay on the poster for people who prefer reduced motion.
 */
export function MediaFrame({
  media,
  className,
  aspect = '16/10',
  sizes = '(min-width: 1024px) 50vw, 100vw',
  priority,
  rounded = true,
}: {
  media: MediaData;
  className?: string;
  /** CSS aspect-ratio of the frame; pass "auto" when the parent sets the height */
  aspect?: string;
  sizes?: string;
  priority?: boolean;
  rounded?: boolean;
}) {
  return (
    <div
      className={cn('relative overflow-hidden bg-deep', rounded && 'rounded-[6px]', className)}
      style={aspect === 'auto' ? undefined : { aspectRatio: aspect }}
    >
      <Image
        src={media.src}
        alt={media.kind === 'video' ? '' : media.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
        style={{ objectPosition: media.focus }}
      />
      {media.kind === 'video' && media.video && <LoopVideo src={media.video} label={media.alt} />}
    </div>
  );
}

function LoopVideo({ src, label }: { src: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e) return;
        if (e.isIntersecting) {
          setNear(true);
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  if (reduce) return <span className="sr-only">{label}</span>;
  return (
    <video
      ref={ref}
      src={near ? src : undefined}
      muted
      loop
      playsInline
      autoPlay
      preload="none"
      aria-label={label}
      className="absolute inset-0 size-full object-cover"
    />
  );
}
