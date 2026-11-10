'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/components/system/reduced-motion';

// A muted screen recording that loads only when it nears the screen, plays while it is in view
// (or while hovered on desktop) and pauses otherwise. With reduced motion it waits for a click.

export function WorkVideo({ mp4, webm, poster, label }: { mp4: string; webm?: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [near, setNear] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const load = new IntersectionObserver(([e]) => e?.isIntersecting && setNear(true), { rootMargin: '300px' });
    const play = new IntersectionObserver(
      ([e]) => {
        if (reduce) return;
        if (e?.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.5 },
    );
    load.observe(v);
    play.observe(v);
    return () => {
      load.disconnect();
      play.disconnect();
    };
  }, [reduce]);

  // Sources are added once the video is near the screen; tell the element to pick them up.
  useEffect(() => {
    const v = ref.current;
    if (!near || !v) return;
    v.load();
    const r = v.getBoundingClientRect();
    if (!reduce && r.top < window.innerHeight && r.bottom > 0) v.play().catch(() => {});
  }, [near, reduce]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      controls={reduce}
      aria-label={label}
      onMouseEnter={(e) => !reduce && e.currentTarget.play().catch(() => {})}
      className="block aspect-[16/10] w-full bg-deep object-cover object-top"
    >
      {near && webm && <source src={webm} type="video/webm" />}
      {near && <source src={mp4} type="video/mp4" />}
    </video>
  );
}
