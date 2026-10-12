'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/components/system/reduced-motion';
import { SHOWCASE, showcaseSrc } from '@/content/showcase';
import { cn } from '@/lib/utils';

// Background video for the hero: the clips play one after another and crossfade into each other.
// Only the playing clip and the next one load; playback stops when the hero is off screen.
// With reduced motion, the first clip's still frame is shown instead.

const FADE_S = 1.6;

export function HeroVideo({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const switching = useRef(false);
  // Start video only after the page has loaded, so it never competes with the page itself.
  const [pageLoaded, setPageLoaded] = useState(false);
  // Fetch the next clip only once the current one is actually playing.
  const [warmNext, setWarmNext] = useState(false);
  /** Clips that have been given their file; they keep it so loops never re-download. */
  const loaded = useRef(new Set<number>());
  const playing = !reduce && visible && pageLoaded;

  useEffect(() => {
    const go = () => setPageLoaded(true);
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
    return () => window.removeEventListener('load', go);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let onScreen = true;
    const update = () => setVisible(onScreen && document.visibilityState === 'visible');
    const io = new IntersectionObserver(([e]) => {
      onScreen = !!e?.isIntersecting;
      update();
    }, { threshold: 0.05 });
    io.observe(el);
    document.addEventListener('visibilitychange', update);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  // Play the active clip; pause the others once their fade-out has finished.
  useEffect(() => {
    switching.current = false;
    const current = videos.current[active];
    if (!current) return;
    if (!playing) {
      current.pause();
      return;
    }
    current.play().catch(() => {});
    const t = window.setTimeout(() => {
      videos.current.forEach((v, i) => {
        if (v && i !== active) {
          v.pause();
          v.currentTime = 0;
        }
      });
    }, FADE_S * 1000 + 100);
    return () => window.clearTimeout(t);
  }, [active, playing]);

  const advance = () => {
    if (switching.current) return;
    switching.current = true;
    const next = (active + 1) % SHOWCASE.length;
    const v = videos.current[next];
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
    setActive(next);
  };

  return (
    <div ref={root} aria-hidden className={cn('absolute inset-0 overflow-hidden bg-void', className)}>
      {SHOWCASE.map((s, i) => {
        const { video, poster } = showcaseSrc(s.id);
        const isNext = i === (active + 1) % SHOWCASE.length;
        const load = pageLoaded && !reduce && (i === active || (isNext && warmNext));
        if (load) loaded.current.add(i);
        const hasSrc = loaded.current.has(i);
        return (
          <video
            key={s.id}
            ref={(el) => {
              videos.current[i] = el;
            }}
            src={hasSrc ? video : undefined}
            poster={i === 0 ? poster : undefined}
            muted
            playsInline
            preload={hasSrc ? 'auto' : 'none'}
            onPlaying={() => i === active && setWarmNext(true)}
            tabIndex={-1}
            className="absolute inset-0 size-full object-cover transition-opacity ease-in-out"
            style={{ opacity: i === active ? 1 : 0, transitionDuration: `${FADE_S}s` }}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (i === active && v.duration && v.currentTime >= v.duration - FADE_S) advance();
            }}
            onEnded={() => i === active && advance()}
          />
        );
      })}
    </div>
  );
}
