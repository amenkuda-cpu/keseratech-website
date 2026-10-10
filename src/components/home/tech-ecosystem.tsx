'use client';

import { motion } from 'motion/react';
import { useReducedMotion } from '@/components/system/reduced-motion';
import { Label } from '@/components/system/primitives';
import { MaskLines } from '@/components/system/motion';

// SERA ONE → capabilities → real-world solutions. Lines draw in as the diagram enters the screen.

const CAPABILITIES = ['Software', 'AI', 'Automation', 'Engineering', 'Energy', 'Agriculture', 'Smart living', 'Upcycling'];
const SOLUTIONS = [
  { what: 'Farms that use water only where crops need it', who: 'AgriSera' },
  { what: 'Food, parcels and errands moved across town', who: 'BikerDash' },
  { what: 'Charging that makes electric vehicles practical', who: 'Sera Energy' },
  { what: 'Phones answered and bookings made, day and night', who: 'Sera Front Desk' },
  { what: 'Businesses run on software built around them', who: 'Sera Tech' },
  { what: 'Homes, gyms and offices made from shipping containers; furniture and handwashing stations from oil drums', who: 'Sera Home' },
];

const EASE = [0.16, 1, 0.3, 1] as const;

export function TechEcosystem({ index = '06' }: { index?: string }) {
  const reduce = useReducedMotion();
  const draw = (delay: number, axis: 'x' | 'y' = 'x') => ({
    initial: axis === 'x' ? { scaleX: 0 } : { scaleY: 0 },
    whileInView: axis === 'x' ? { scaleX: 1 } : { scaleY: 1 },
    viewport: { once: true, margin: '0px 0px -15% 0px' },
    transition: { duration: 0.9, ease: EASE, delay },
  });
  const appear = (delay: number) => ({
    initial: { opacity: 0, y: 10 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '0px 0px -15% 0px' },
    transition: { duration: 0.6, ease: EASE, delay },
  });

  return (
    <section aria-labelledby="eco-title" className="section relative overflow-hidden">
      <div className="shell">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <Label index={index}>Technology ecosystem</Label>
            <MaskLines id="eco-title" as="h2" className="t-display-l mt-10" lines={['Leave the screen.', 'Solve real problems.']} />
          </div>
          <p className="t-body text-dim md:col-span-4">
            Technology should leave the screen. Every capability at Kesera exists to change something physical: water, roads, power, buildings, waste and the working day.
          </p>
        </div>

        <div className="relative mt-20 md:mt-28">
          {/* Source */}
          <motion.div {...appear(0)} className="mx-auto flex w-fit items-center gap-3 rounded-[4px] border border-signal/60 bg-deep px-6 py-4">
            <span className="size-2 rounded-full bg-signal shadow-[0_0_12px_#1a86fa]" aria-hidden />
            <span className="t-title text-[1.1rem]">Kesera</span>
          </motion.div>
          <motion.div {...draw(0.2, 'y')} aria-hidden className="mx-auto h-12 w-px origin-top bg-gradient-to-b from-signal to-white/25" />

          {/* Capabilities bus */}
          <div className="relative">
            <motion.div {...draw(0.4)} aria-hidden className="absolute inset-x-[7%] top-0 hidden h-px origin-center bg-white/25 md:block" />
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-8 md:gap-3" aria-label="Capabilities">
              {CAPABILITIES.map((c, i) => (
                <motion.li key={c} {...appear(0.55 + i * 0.05)} className="flex flex-col items-center">
                  <span aria-hidden className="hidden h-8 w-px bg-white/25 md:block" />
                  <span className="t-label flex min-h-12 w-full items-center justify-center rounded-[4px] border border-hair bg-void px-3 text-center text-white">
                    {c}
                  </span>
                  <span aria-hidden className="hidden h-8 w-px bg-white/25 md:block" />
                </motion.li>
              ))}
            </ul>
            <motion.div {...draw(0.9)} aria-hidden className="absolute inset-x-[7%] bottom-0 hidden h-px origin-center bg-white/25 md:block" />
          </div>

          <motion.div {...draw(1.1, 'y')} aria-hidden className="mx-auto h-12 w-px origin-top bg-gradient-to-b from-white/25 to-signal" />

          {/* Outcomes */}
          <motion.div {...appear(1.2)} className="rounded-[6px] border border-hair bg-deep/60 p-6 md:p-10">
            <p className="t-label text-center text-signal-soft">Real-world solutions</p>
            <ul className="mt-8 grid gap-px overflow-hidden rounded-[4px] bg-hair sm:grid-cols-2 lg:grid-cols-3">
              {SOLUTIONS.map((s) => (
                <li key={s.what} className="bg-[#080c18] p-6">
                  <p className="text-[1.02rem] leading-snug text-white">{s.what}</p>
                  <p className="t-label mt-4 text-faint">{s.who}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
