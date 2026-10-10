'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useReducedMotion } from '@/components/system/reduced-motion';
import { ArrowUpRight } from 'lucide-react';
import { DIVISIONS } from '@/content/site';
import { Dot, Label } from '@/components/system/primitives';
import { MaskLines } from '@/components/system/motion';
import { DivisionGlyph } from '@/components/visuals/division-glyph';

// A studio-style index instead of a card grid: each division is a full-width row that opens up on hover.

export function DivisionsIndex() {
  const reduce = useReducedMotion();
  return (
    <section id="divisions" aria-label="Divisions" className="section scroll-mt-16 border-t border-hair">
      <div className="shell">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <Label index="02">Divisions</Label>
            <MaskLines as="h2" className="t-display-l mt-10" lines={['Different industries.', 'One vision.']} />
          </div>
          <p className="t-body text-dim md:col-span-4">
            Six specialised divisions, one engineering culture. Each one builds for its own industry; all of them share the same people, standards and technology.
          </p>
        </div>

        <ul className="mt-16 border-b border-hair md:mt-24">
          {DIVISIONS.map((d, i) => (
            <motion.li
              key={d.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
              className="border-t border-hair"
            >
              <Link
                href={`/${d.slug}`}
                className="group/row relative grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3 py-7 md:grid-cols-12 md:gap-x-8 md:py-9"
              >
                {/* accent wash */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover/row:opacity-100"
                  style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${d.accent} 9%, transparent), transparent 60%)` }}
                />
                <span className="t-label text-faint md:col-span-1">{String(i + 1).padStart(2, '0')}</span>

                <span className="flex items-center gap-4 md:col-span-5">
                  <Dot color={d.accent} size={10} className="transition-transform duration-500 group-hover/row:scale-125" />
                  <span className="t-display-m text-[clamp(1.6rem,3.4vw,3.1rem)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/row:translate-x-2">
                    {d.name}
                  </span>
                </span>

                <span className="col-span-3 col-start-2 max-w-md text-sm leading-relaxed text-dim md:col-span-4 md:col-start-auto">
                  <span className="t-label mb-2 block text-faint">{d.discipline}</span>
                  {d.short}
                </span>

                <span className="col-start-3 row-start-1 flex items-center justify-end gap-4 md:col-span-2 md:col-start-auto md:row-start-auto">
                  <span className="hidden size-16 text-white/30 transition-[color,opacity,transform] duration-500 group-hover/row:text-white/70 lg:block" style={{ color: undefined }}>
                    <DivisionGlyph slug={d.slug} accent={d.accent} />
                  </span>
                  <span className="grid size-11 place-items-center rounded-full border border-hair transition-colors duration-300 group-hover/row:border-white/40 group-hover/row:bg-white group-hover/row:text-void">
                    <ArrowUpRight className="size-4" strokeWidth={1.75} />
                    <span className="sr-only">Explore {d.name}</span>
                  </span>
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
