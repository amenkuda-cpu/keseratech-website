'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { useReducedMotion } from '@/components/system/reduced-motion';
import { cn } from '@/lib/utils';
import { photo } from '@/content/photos';
import { Photo } from './photo';
import { ContainerDrawing, DrumDrawing, MaterialsDrawing } from './upcycle-drawings';

// Waste → transformation → in use. One drawing per material, paired with real photographs:
// what the material looks like discarded, and what the same material becomes.

type TrackId = 'container' | 'drum' | 'materials';

const STAGES = [
  { id: 0, label: 'Discarded' },
  { id: 1, label: 'Transformed' },
  { id: 2, label: 'In use' },
] as const;

const TRACKS: {
  id: TrackId;
  tab: string;
  stageNotes: [string, string, string];
  steps: string[];
  becomes: string[];
  before: string;
  after: string[];
}[] = [
  {
    id: 'container',
    tab: 'Shipping container',
    stageNotes: ['A retired steel shipping container.', 'Openings cut, frames welded, walls insulated.', 'A finished home, gym or office, ready to move into.'],
    steps: ['Source and inspect a sound container', 'Cut and frame doors, windows and vents', 'Insulate and line against the heat', 'Fit out power, water, lighting and solar', 'Place on foundations and connect'],
    becomes: ['Homes', 'Gyms', 'Offices', 'Shops', 'Studios', 'Site offices'],
    before: 'containers-abandoned',
    after: ['container-stall-benin', 'container-flats-le-havre'],
  },
  {
    id: 'drum',
    tab: 'Oil drum',
    stageNotes: ['An empty steel oil drum, headed for the scrap pile.', 'Cleaned, marked and cut to shape.', 'Chairs, tables and handwashing stations.'],
    steps: ['Collect empty drums', 'Clean out every trace of residue', 'Mark and cut the shapes', 'Weld, sand and seal against rust', 'Finish with seats, tops and taps'],
    becomes: ['Chairs', 'Tables', 'Chair-and-table sets', 'Handwashing stations'],
    before: 'drum-field',
    after: ['handwash-ethiopia', 'barrel-chairs'],
  },
  {
    id: 'materials',
    tab: 'Reclaimed materials',
    stageNotes: ['Tyres, bottles, timber and scrap that would be thrown away.', 'Sorted, cleaned and prepared by type.', 'Walls, furniture and facilities built from them.'],
    steps: ['Collect what is available locally', 'Sort and prepare each material', 'Design around what was collected', 'Build walls, furniture and facilities', 'Finish, seal and maintain'],
    becomes: ['Walls', 'Furniture', 'Facilities', 'Products'],
    before: 'earthship-wall',
    after: ['earthship-brighton', 'bottle-house-aceh'],
  },
];

export function UpcycleFlow({ initialTrack = 'container' }: { initialTrack?: TrackId }) {
  const [trackId, setTrackId] = useState<TrackId>(initialTrack);
  const [stage, setStage] = useState(0);
  const [touched, setTouched] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-15% 0px' });
  const reduce = useReducedMotion();
  const still = !!reduce;
  const track = TRACKS.find((t) => t.id === trackId)!;

  // Walk through the three stages while on screen, until someone takes control.
  useEffect(() => {
    if (touched || reduce || !inView) return;
    const id = window.setInterval(() => setStage((s) => (s + 1) % 3), 2800);
    return () => window.clearInterval(id);
  }, [touched, reduce, inView]);

  useEffect(() => {
    if (reduce) setStage(2);
  }, [reduce]);

  const pickTrack = (id: TrackId) => {
    setTrackId(id);
    setStage(reduce ? 2 : 0);
  };

  return (
    <div ref={ref} data-paused={inView ? undefined : ''}>
      <div role="tablist" aria-label="Material" className="relative -mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)] pb-1 [scrollbar-width:none] md:mx-0 md:px-0">
        {TRACKS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`up-tab-${t.id}`}
            aria-selected={t.id === trackId}
            aria-controls="up-panel"
            onClick={() => pickTrack(t.id)}
            className={cn(
              't-label min-h-11 shrink-0 rounded-full border px-4 transition-colors',
              t.id === trackId ? 'border-home bg-home text-void' : 'border-hair text-dim hover:text-white',
            )}
          >
            {t.tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={track.id}
          id="up-panel"
          role="tabpanel"
          aria-labelledby={`up-tab-${track.id}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 grid gap-6 lg:grid-cols-12 lg:gap-8"
        >
          {/* Before (real) */}
          <div className="order-2 lg:order-1 lg:col-span-3">
            <p className="t-label mb-3 flex items-center gap-2 text-faint">
              <span className="size-1.5 rounded-full bg-white/40" aria-hidden /> Before
            </p>
            <Photo photo={photo(track.before)} aspect="4/5" sizes="(min-width: 1024px) 25vw, 50vw" />
          </div>

          {/* Process drawing */}
          <div className="order-1 lg:order-2 lg:col-span-6">
            <div className="drafting relative overflow-hidden rounded-[6px] border border-hair bg-[#070a14]">
              <p className="t-label absolute left-4 top-3 text-[0.62rem] text-white/60 sm:left-5 sm:top-4 sm:text-[0.72rem]">Sera Home / {track.tab}</p>
              <p className="t-label absolute right-5 top-4 hidden text-white/30 sm:block">Process diagram</p>
              <svg viewBox="0 0 600 380" className="block h-auto w-full" role="img" aria-label={`${track.tab}: ${track.stageNotes.join(' Then: ')}`}>
                {track.id === 'container' && <ContainerDrawing stage={stage} still={still} />}
                {track.id === 'drum' && <DrumDrawing stage={stage} still={still} />}
                {track.id === 'materials' && <MaterialsDrawing stage={stage} />}
              </svg>
            </div>
            <ol className="mt-4 grid grid-cols-3 gap-2" aria-label="Stages">
              {STAGES.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setTouched(true);
                      setStage(s.id);
                    }}
                    aria-current={stage === s.id ? 'step' : undefined}
                    className="group/st block w-full text-left"
                  >
                    <span className="block h-[3px] overflow-hidden rounded-full bg-white/10">
                      <span className="block h-full origin-left rounded-full bg-home transition-transform duration-500" style={{ transform: `scaleX(${stage >= s.id ? 1 : 0})` }} />
                    </span>
                    <span className={cn('t-label mt-3 block', stage === s.id ? 'text-white' : 'text-white/40 group-hover/st:text-white/70')}>
                      0{s.id + 1} {s.label}
                    </span>
                    <span className={cn('mt-1.5 hidden text-sm leading-snug sm:block', stage === s.id ? 'text-dim' : 'text-white/25')}>
                      {track.stageNotes[s.id]}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {/* After (real) */}
          <div className="order-3 grid grid-cols-2 gap-4 lg:col-span-3 lg:grid-cols-1">
            <p className="t-label col-span-2 -mb-1 flex items-center gap-2 text-faint lg:col-span-1">
              <span className="size-1.5 rounded-full bg-home" aria-hidden /> After
            </p>
            {track.after.map((id) => (
              <Photo key={id} photo={photo(id)} aspect="4/3" sizes="(min-width: 1024px) 25vw, 50vw" />
            ))}
          </div>

          {/* Steps and outcomes */}
          <div className="order-4 grid gap-8 border-t border-hair pt-8 lg:col-span-12 lg:grid-cols-12">
            <ol className="grid gap-3 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-5" aria-label="How it is made">
              {track.steps.map((s, i) => (
                <li key={s} className="flex gap-3 text-sm leading-snug lg:block">
                  <span className="t-label shrink-0 text-home">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-white/85 lg:mt-2 lg:block">{s}</span>
                </li>
              ))}
            </ol>
            <div className="lg:col-span-4 lg:border-l lg:border-hair lg:pl-8">
              <p className="t-label text-faint">Becomes</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {track.becomes.map((b) => (
                  <li key={b} className="rounded-full border border-home/40 px-3 py-1.5 text-sm text-white/90">{b}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
