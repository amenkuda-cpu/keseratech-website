'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Pause, Play } from 'lucide-react';
import { useReducedMotion } from '@/components/system/reduced-motion';
import { Cta } from '@/components/system/primitives';
import { Magnetic, MaskLines } from '@/components/system/motion';
import { SHOWCASE, showcaseSrc } from '@/content/showcase';
import { cn } from '@/lib/utils';

// Full-screen cinematic showcase: each clip plays, then slides out to the left as the next one
// slides in from the right. The next clip is preloaded, so the hand-over never shows a blank frame.

const EASE = [0.16, 1, 0.3, 1] as const;
const SLIDE = [0.76, 0, 0.18, 1] as const;
const TRANSITION_S = 1.3;
/** Start the slide this long before a clip ends, so motion never stops between clips. */
const LEAD_S = 0.9;
/** Fallback when a clip can't play (blocked autoplay, low-power mode, network error). */
const FALLBACK_MS = 6500;

function Slide({ id, alt, playing, onNearEnd }: { id: string; alt: string; playing: boolean; onNearEnd: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const fired = useRef(false);
  const { video: src, poster } = showcaseSrc(id);

  const finish = useCallback(() => {
    if (fired.current) return;
    fired.current = true;
    onNearEnd();
  }, [onNearEnd]);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (!playing) {
      v.pause();
      return;
    }
    let fallback: number | undefined;
    const p = v.play();
    if (p) p.catch(() => (fallback = window.setTimeout(finish, FALLBACK_MS)));
    return () => window.clearTimeout(fallback);
  }, [playing, finish]);

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden bg-void"
      initial={{ x: '100%' }}
      animate={{ x: '0%' }}
      exit={{ x: '-32%', opacity: 0.35 }}
      transition={{ duration: TRANSITION_S, ease: SLIDE }}
    >
      {/* slow push-in for a cinematic feel */}
      <div className={cn('absolute inset-0', playing && 'animate-[showcase-push_9s_linear_forwards]')}>
        <video
          ref={video}
          src={src}
          poster={poster}
          muted
          playsInline
          preload="auto"
          aria-label={alt}
          className="absolute inset-0 size-full object-cover"
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (v.duration && v.currentTime >= v.duration - LEAD_S) finish();
          }}
          onEnded={finish}
          onError={() => window.setTimeout(finish, FALLBACK_MS)}
        />
      </div>
    </motion.div>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const section = useRef<HTMLElement>(null);

  // Stop playback while the hero is off screen or the tab is hidden.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    let onScreen = true;
    const update = () => setVisible(onScreen && document.visibilityState === 'visible');
    const io = new IntersectionObserver(([e]) => {
      onScreen = !!e?.isIntersecting;
      update();
    }, { threshold: 0.15 });
    io.observe(el);
    document.addEventListener('visibilitychange', update);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  const next = useCallback(() => setIndex((i) => (i + 1) % SHOWCASE.length), []);
  const playing = !reduce && !paused && visible;
  const slide = SHOWCASE[index]!;
  const upcoming = SHOWCASE[(index + 1) % SHOWCASE.length]!;

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 14 } as const,
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, ease: EASE, delay },
  });

  return (
    <section ref={section} aria-label="Introduction" className="relative isolate h-[100svh] min-h-[560px] overflow-hidden bg-void">
      {/* Stage */}
      <div className="absolute inset-0 -z-10" aria-roledescription="carousel" aria-label="Kesera in pictures">
        <AnimatePresence initial={false}>
          <Slide key={slide.id} id={slide.id} alt={slide.alt} playing={playing} onNearEnd={next} />
        </AnimatePresence>
        {/* Warm the next clip so it is ready the moment it slides in */}
        <video key={`pre-${upcoming.id}`} src={showcaseSrc(upcoming.id).video} preload="auto" muted playsInline aria-hidden tabIndex={-1} className="hidden" />
      </div>

      {/* Grade and legibility */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-[5] bg-[linear-gradient(180deg,rgb(5_6_11/0.7)_0%,rgb(5_6_11/0)_22%,rgb(5_6_11/0)_45%,rgb(5_6_11/0.88)_100%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-[5] bg-[linear-gradient(90deg,rgb(5_6_11/0.72)_0%,rgb(5_6_11/0.25)_45%,rgb(5_6_11/0)_70%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-[5] bg-[radial-gradient(ellipse_at_center,transparent_55%,rgb(0_0_0/0.45)_100%)]" />

      {/* Copy */}
      <div className="shell flex h-full flex-col justify-end pb-28 pt-[68px] sm:pb-32 lg:pb-36">
        <motion.p {...fade(0.05)} className="t-label flex items-center gap-3 text-white/80">
          <span className="size-1.5 rounded-full bg-signal" aria-hidden />
          Kesera Technologies Holdings
        </motion.p>

        <MaskLines
          as="h1"
          immediate
          delay={0.1}
          className="t-display-xl mt-6 max-w-[11ch] text-[clamp(2.6rem,11vw,4.6rem)] drop-shadow-[0_2px_24px_rgb(0_0_0/0.35)] lg:text-[clamp(4.2rem,6.2vw,7rem)]"
          lines={[
            'Building',
            'What’s',
            <span key="next" className="inline-flex items-baseline">
              Next
              <span aria-hidden className="ml-[0.06em] inline-block size-[0.19em] translate-y-[-0.02em] rounded-full bg-signal shadow-[0_0_0.35em_rgb(26_134_250/0.8)]" />
              <span className="sr-only">.</span>
            </span>,
          ]}
        />

        <motion.p {...fade(0.55)} className="t-lead mt-6 max-w-[32rem] text-white/85 md:mt-8">
          Kesera Technologies develops technology, intelligent systems and innovative solutions for the world ahead.
        </motion.p>

        <motion.div {...fade(0.7)} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Magnetic>
            <Cta href="#divisions" className="w-full sm:w-auto">Explore Kesera</Cta>
          </Magnetic>
          <Cta href="/start" variant="ghost" className="w-full border-white/40 bg-black/20 backdrop-blur-sm sm:w-auto">
            Start a project
          </Cta>
        </motion.div>
      </div>

      {/* Showcase controls: caption, progress, pause */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="shell flex items-center gap-4 pb-6 sm:pb-8">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Play showcase' : 'Pause showcase'}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-void"
          >
            {paused || reduce ? <Play className="size-4" /> : <Pause className="size-4" />}
          </button>
          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={slide.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4 }}
                className="t-label truncate text-white/80"
              >
                <span className="text-white">{String(index + 1).padStart(2, '0')}</span>
                <span className="text-white/40"> / {String(SHOWCASE.length).padStart(2, '0')}</span>
                <span className="mx-2 text-white/40">·</span>
                {slide.theme}
                <span className="hidden sm:inline"><span className="mx-2 text-white/40">—</span>{slide.caption}</span>
              </motion.p>
            </AnimatePresence>
            <ol className="mt-1 flex gap-1.5" aria-label="Choose a scene">
              {SHOWCASE.map((s, i) => (
                <li key={s.id} className="flex-1">
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Scene ${i + 1}: ${s.theme}`}
                    aria-current={i === index ? 'true' : undefined}
                    className="block w-full py-3"
                  >
                    <span className="block h-[2px] overflow-hidden rounded-full bg-white/20">
                      <span
                        key={i === index ? `${s.id}-on` : s.id}
                        className={cn(
                          'block h-full origin-left rounded-full bg-white',
                          i < index ? 'scale-x-100' : i > index ? 'scale-x-0' : reduce ? 'scale-x-100' : 'animate-[showcase-progress_6s_linear_forwards]',
                        )}
                        style={i === index ? { animationPlayState: playing ? 'running' : 'paused', animationDuration: `${s.seconds - LEAD_S}s` } : undefined}
                      />
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
