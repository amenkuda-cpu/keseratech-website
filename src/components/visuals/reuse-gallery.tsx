'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useReducedMotion } from '@/components/system/reduced-motion';
import { PHOTOS, PHOTO_CATEGORIES, type PhotoCategory } from '@/content/photos';
import { cn } from '@/lib/utils';
import { Photo } from './photo';

// Real-world reuse, filterable by material. An editorial rhythm (wide, tall, standard tiles)
// instead of a uniform grid.

const ORDER = [
  'container-flats-le-havre',
  'container-stall-benin',
  'handwash-ethiopia',
  'container-homes-havana',
  'barrel-chairs',
  'earthship-brighton',
  'container-building-groningen',
  'drums-graveyard',
  'handwash-kenya',
  'earthship-wall',
  'container-offices-dundee',
  'bottle-house-aceh',
  'container-cabin',
  'drums-lube',
  'drum-field',
  'containers-abandoned',
];

// Spans on large screens, keyed by position in the visible list: a repeating rhythm.
const RHYTHM = ['lg:col-span-7', 'lg:col-span-5', 'lg:col-span-4 lg:row-span-2', 'lg:col-span-8', 'lg:col-span-4', 'lg:col-span-4', 'lg:col-span-6', 'lg:col-span-6'];
const ASPECT: Record<string, string> = { 'lg:col-span-4 lg:row-span-2': '3/4' };

export function ReuseGallery({ limit, initial = 'all' }: { limit?: number; initial?: PhotoCategory | 'all' }) {
  const [cat, setCat] = useState<PhotoCategory | 'all'>(initial);
  const reduce = useReducedMotion();
  const list = ORDER.map((id) => PHOTOS[id]).filter((p): p is NonNullable<typeof p> => !!p && (cat === 'all' || p.category === cat));
  const shown = limit ? list.slice(0, limit) : list;
  const available = PHOTO_CATEGORIES.filter((c) => c.id === 'all' || ORDER.some((id) => PHOTOS[id]?.category === c.id));

  return (
    <div>
      <div role="group" aria-label="Filter by material" className="relative -mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)] pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
        {available.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={cat === c.id}
            onClick={() => setCat(c.id)}
            className={cn('t-label min-h-11 shrink-0 rounded-full border px-4 transition-colors', cat === c.id ? 'border-white/40 bg-white text-void' : 'border-hair text-dim hover:text-white')}
          >
            {c.label}
          </button>
        ))}
      </div>

      <motion.ul layout={!reduce} className="mt-8 grid grid-flow-dense gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-12">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((p, i) => {
            const span = RHYTHM[i % RHYTHM.length]!;
            return (
              <motion.li
                key={p.id}
                layout={!reduce}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className={cn(span)}
              >
                <Photo photo={p} aspect={ASPECT[span] ?? '3/2'} sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw" />
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>
      <p className="mt-10 max-w-2xl text-xs leading-relaxed text-faint">
        Photos marked “Example” show reuse by other builders and communities around the world, credited to their photographers under open licences. They illustrate the materials and methods Sera Home works with; they are not Sera Home projects.
      </p>
    </div>
  );
}
