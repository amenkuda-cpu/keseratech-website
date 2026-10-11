'use client';

import { motion } from 'motion/react';
import { useReducedMotion } from '@/components/system/reduced-motion';
import { useRef } from 'react';
import { Cta } from '@/components/system/primitives';
import { Magnetic, MaskLines } from '@/components/system/motion';
import { Ecosystem } from './ecosystem';
import { HeroVideo } from './hero-video';

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero({ projectsInDevelopment }: { projectsInDevelopment: number }) {
  const reduce = useReducedMotion();
  const spot = useRef<HTMLDivElement>(null);

  const fade = (delay: number) => ({
    initial: ({ opacity: 0, y: 14 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, ease: EASE, delay },
  });

  return (
    <section
      aria-label="Introduction"
      className="relative isolate overflow-hidden pt-[68px]"
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse' || !spot.current) return;
        const r = e.currentTarget.getBoundingClientRect();
        spot.current.style.setProperty('--x', `${e.clientX - r.left}px`);
        spot.current.style.setProperty('--y', `${e.clientY - r.top}px`);
      }}
    >
      {/* Background video, darkened so the headline and the dial stay readable */}
      <HeroVideo className="-z-20" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(5_6_11/0.88)_0%,rgb(5_6_11/0.62)_45%,rgb(5_6_11/0.72)_100%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(5_6_11/0.55)_0%,transparent_25%,transparent_70%,rgb(5_6_11/0.95)_100%)]" />
      {/* Drafting grid, lit by the pointer */}
      <div aria-hidden className="drafting absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_70%_40%,black_20%,transparent_75%)]" />
      <div
        ref={spot}
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hidden [background:radial-gradient(520px_circle_at_var(--x,70%)_var(--y,40%),rgb(26_134_250/0.08),transparent_70%)] md:block"
      />

      <div className="shell grid min-h-[calc(100svh-68px)] grid-cols-1 items-center gap-y-12 pb-10 pt-10 md:pt-14 lg:grid-cols-12 lg:gap-x-10 lg:pb-16">
        <div className="lg:col-span-6 xl:col-span-6">
          <motion.p {...fade(0.05)} className="t-label flex items-center gap-3 text-dim">
            <span className="size-1.5 rounded-full bg-signal" aria-hidden />
            Kesera Technologies Holdings
          </motion.p>

          <MaskLines
            as="h1"
            immediate
            delay={0.1}
            className="t-display-xl mt-7 text-[clamp(2.9rem,13.6vw,5.4rem)] lg:text-[clamp(4.6rem,6.6vw,7.4rem)] md:mt-9"
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

          <motion.p {...fade(0.55)} className="t-lead mt-8 max-w-[34rem] text-dim md:mt-10">
            Kesera Technologies develops technology, intelligent systems and innovative solutions for the world ahead.
          </motion.p>

          <motion.div {...fade(0.7)} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Magnetic>
              <Cta href="#divisions" className="w-full sm:w-auto">Explore Kesera</Cta>
            </Magnetic>
            <Cta href="/start" variant="ghost" className="w-full sm:w-auto">
              Start a project
            </Cta>
          </motion.div>
        </div>

        <motion.div
          className="mx-auto w-full max-w-[560px] lg:col-span-6 lg:max-w-[600px]"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: EASE, delay: 0.25 }}
        >
          <Ecosystem />
        </motion.div>
      </div>

      <div className="relative">
        <motion.div
          aria-hidden
          className="horizon origin-center"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: EASE, delay: 0.5 }}
        />
        <div className="shell">
          <dl className="t-label grid grid-cols-2 gap-y-4 py-6 text-faint md:grid-cols-4">
            <div><dt className="sr-only">Divisions</dt><dd><span className="text-white">06</span> Divisions</dd></div>
            <div><dt className="sr-only">Projects</dt><dd><span className="text-white">{String(projectsInDevelopment).padStart(2, '0')}</span> Projects in development</dd></div>
            <div><dt className="sr-only">Disciplines</dt><dd>Software · AI · Engineering</dd></div>
            <div className="md:text-right"><dt className="sr-only">Based in</dt><dd>Zimbabwe → the world</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}
