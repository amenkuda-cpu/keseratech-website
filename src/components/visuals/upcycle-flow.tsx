'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { useReducedMotion } from '@/components/system/reduced-motion';
import { cn } from '@/lib/utils';
import { photo, type Photo as PhotoData } from '@/content/photos';
import { media, type Media } from '@/content/media';
import { Photo } from './photo';

// Waste → transformation → in use, told in photographs: what the material looks like discarded,
// the workshop step that changes it, and what the same material becomes.

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
  /** Pexels photo of the workshop step */
  transform: string;
  after: [string, string];
}[] = [
  {
    id: 'container',
    tab: 'Shipping container',
    stageNotes: ['A retired steel shipping container.', 'Openings cut, frames welded, walls insulated.', 'A finished home, gym or office, ready to move into.'],
    steps: ['Source and inspect a sound container', 'Cut and frame doors, windows and vents', 'Insulate and line against the heat', 'Fit out power, water, lighting and solar', 'Place on foundations and connect'],
    becomes: ['Homes', 'Gyms', 'Offices', 'Shops', 'Studios', 'Site offices'],
    before: 'containers-abandoned',
    transform: 'welding-workshop',
    after: ['container-stall-benin', 'container-flats-le-havre'],
  },
  {
    id: 'drum',
    tab: 'Oil drum',
    stageNotes: ['An empty steel oil drum, headed for the scrap pile.', 'Cleaned, marked and cut to shape.', 'Chairs, tables and handwashing stations.'],
    steps: ['Collect empty drums', 'Clean out every trace of residue', 'Mark and cut the shapes', 'Weld, sand and seal against rust', 'Finish with seats, tops and taps'],
    becomes: ['Chairs', 'Tables', 'Chair-and-table sets', 'Handwashing stations'],
    before: 'drum-field',
    transform: 'metal-cutting',
    after: ['handwash-ethiopia', 'barrel-chairs'],
  },
  {
    id: 'materials',
    tab: 'Reclaimed materials',
    stageNotes: ['Tyres, bottles, timber and scrap that would be thrown away.', 'Sorted, cleaned and prepared by type.', 'Walls, furniture and facilities built from them.'],
    steps: ['Collect what is available locally', 'Sort and prepare each material', 'Design around what was collected', 'Build walls, furniture and facilities', 'Finish, seal and maintain'],
    becomes: ['Walls', 'Furniture', 'Facilities', 'Products'],
    before: 'earthship-wall',
    transform: 'timber-workshop',
    after: ['earthship-brighton', 'bottle-house-aceh'],
  },
];

/** One frame of the stage viewer: an openly licensed reference photo, or a Pexels stock photo. */
type Frame = { key: string; src: string; alt: string; focus?: string; credit: React.ReactNode };

const refFrame = (p: PhotoData): Frame => ({
  key: p.id,
  src: p.src,
  alt: p.alt,
  credit: (
    <>
      {p.caption} {p.place} · Photo: {p.credit}
      {p.license && (
        <>
          {' · '}
          {p.licenseUrl ? <a href={p.licenseUrl} target="_blank" rel="noreferrer license" className="underline-offset-2 hover:underline">{p.license}</a> : p.license}
        </>
      )}
      {p.source && (
        <>
          {' · '}
          <a href={p.source} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">Source</a>
        </>
      )}
    </>
  ),
});

const stockFrame = (m: Media): Frame => ({ key: m.id, src: m.src, alt: m.alt, focus: m.focus, credit: <>Workshop photo: {m.credit}, Pexels</> });

export function UpcycleFlow({ initialTrack = 'container' }: { initialTrack?: TrackId }) {
  const [trackId, setTrackId] = useState<TrackId>(initialTrack);
  const [stage, setStage] = useState(0);
  const [touched, setTouched] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-15% 0px' });
  const reduce = useReducedMotion();
  const track = TRACKS.find((t) => t.id === trackId)!;
  const frames = [refFrame(photo(track.before)), stockFrame(media(track.transform)), refFrame(photo(track.after[0]))];
  const frame = frames[stage]!;

  // Walk through the three stages while on screen, until someone takes control.
  useEffect(() => {
    if (touched || reduce || !inView) return;
    const id = window.setInterval(() => setStage((s) => (s + 1) % 3), 3600);
    return () => window.clearInterval(id);
  }, [touched, reduce, inView]);

  const pickTrack = (id: TrackId) => {
    setTrackId(id);
    setStage(0);
  };

  return (
    <div ref={ref}>
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
          {/* Stage viewer: one photograph per stage */}
          <div className="lg:col-span-8">
            <figure>
              <div className="relative aspect-[16/10] overflow-hidden rounded-[6px] bg-deep">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={frame.key}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduce ? 0 : 0.6 }}
                  >
                    <Image src={frame.src} alt={frame.alt} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" style={{ objectPosition: frame.focus }} />
                  </motion.div>
                </AnimatePresence>
                <span className="t-label absolute left-3 top-3 rounded-sm bg-black/55 px-2 py-1 text-[0.62rem] text-white/90 backdrop-blur-md">
                  0{stage + 1} {STAGES[stage]!.label}
                </span>
              </div>
              <figcaption className="t-label mt-2 min-h-8 text-[0.6rem] leading-relaxed text-white/45">{frame.credit}</figcaption>
            </figure>

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

          {/* Another finished example */}
          <div className="lg:col-span-4">
            <p className="t-label mb-3 flex items-center gap-2 text-faint">
              <span className="size-1.5 rounded-full bg-home" aria-hidden /> Also built from it
            </p>
            <Photo photo={photo(track.after[1])} aspect="4/3" sizes="(min-width: 1024px) 30vw, 100vw" />
          </div>

          {/* Steps and outcomes */}
          <div className="grid gap-8 border-t border-hair pt-8 lg:col-span-12 lg:grid-cols-12">
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
