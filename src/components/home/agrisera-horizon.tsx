'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BrainCircuit, Droplets, Play, Radio } from 'lucide-react';
import { MaskLines, Reveal, Stagger } from '@/components/system/motion';
import { Label } from '@/components/system/primitives';

// AgriSera Horizon: "the intelligence beneath your fields". Copy follows the Horizon launch film
// script (agrisera-video/fieldmind/SCRIPT.md). Horizon is in development: describe what it does,
// never claim farms, users or results.

export const HORIZON_FILM = {
  mp4: '/media/agrisera-horizon.mp4',
  poster: '/media/agrisera-horizon.webp',
  duration: '2:03',
};

const PILLARS = [
  {
    icon: Radio,
    title: 'Senses',
    text: 'Soil probes read moisture at three depths every few seconds. Weather stations watch the sky. Every pump, valve and borehole is connected.',
  },
  {
    icon: BrainCircuit,
    title: 'Decides',
    text: 'Your whole farm from above, live. Green is healthy, amber is thirsty. Tap a field for moisture at the roots, the crop’s target and a clear answer: water now, or wait.',
  },
  {
    icon: Droplets,
    title: 'Acts',
    text: 'Press Water now from your phone or laptop. The valve opens, moisture climbs live, and the valve closes on its own when the soil reaches its target.',
  },
];

const MEASURES = [
  'Soil pH, NPK, salinity and soil temperature',
  'Crop health from satellite NDVI',
  'Pest traps and disease risk',
  'Dam and borehole levels',
  'Pump pressure and leak detection',
  'Frost and heat warnings by WhatsApp and SMS',
  'Solar, battery and generator, so load-shedding never stops irrigation',
  'Your own rules, so Horizon runs the farm while you rest',
];

export function AgriseraHorizon({ index, showLink = true }: { index?: string; showLink?: boolean }) {
  return (
    <section id="agrisera-horizon" aria-labelledby="horizon-title" className="relative isolate scroll-mt-16 overflow-hidden border-t border-hair">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(48rem_32rem_at_100%_0%,rgb(95_203_126/0.12),transparent_70%)]" />
      <div className="shell section">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Label index={index}>AgriSera Horizon</Label>
            <MaskLines id="horizon-title" as="h2" className="t-display-l mt-10" lines={['The intelligence', <em key="h">beneath your fields.</em>]} />
          </div>
          <Reveal className="md:col-span-5">
            <p className="t-body text-dim">
              El Niño is coming, and across Zimbabwe every drop of water will count this season. Horizon is AgriSera’s farm system: it senses the soil, weather and water, decides what each field needs, and opens and closes the valves itself.
            </p>
            <p className="mt-4 text-sm text-white/50">In development. The film shows the working dashboard on a demo farm.</p>
          </Reveal>
        </div>

        <Reveal className="mt-14 md:mt-20">
          <Film />
        </Reveal>

        <Stagger as="ul" gap={0.08} className="mt-14 grid gap-3 md:mt-20 md:grid-cols-3" itemClassName="relative">
          {PILLARS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="h-full rounded-[10px] border border-hair bg-white/[0.02] p-6 md:p-8">
              <span className="grid size-10 place-items-center rounded-xl border border-[var(--color-agri)]/40 bg-[var(--color-agri)]/10 text-[var(--color-agri)]">
                <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="t-title mt-6 text-[1.25rem]">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-dim">{text}</p>
            </div>
          ))}
        </Stagger>

        <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-12">
          <div className="md:col-span-4">
            <h3 className="t-title text-[1.25rem]">Go deeper</h3>
            <p className="mt-3 text-sm leading-relaxed text-dim">Beyond water, Horizon brings everything the farm measures into one view.</p>
            {showLink && (
              <Link href="/agrisera" className="t-label mt-8 inline-flex items-center gap-2 text-white hover:text-signal-soft">
                About AgriSera <ArrowRight className="size-3.5" />
              </Link>
            )}
          </div>
          <ul className="grid border-t border-hair sm:grid-cols-2 md:col-span-8">
            {MEASURES.map((m) => (
              <li key={m} className="flex items-baseline gap-4 border-b border-hair py-4 text-[0.95rem] text-white/85 sm:odd:pr-6">
                <span aria-hidden className="size-1.5 shrink-0 translate-y-[-0.15em] rounded-full bg-[var(--color-agri)]" />
                {m}
              </li>
            ))}
          </ul>
        </div>
        <p className="t-label mt-12 text-[0.7rem] text-white/45">Less water. Stronger crops. A new horizon for farming in Zimbabwe.</p>
      </div>
    </section>
  );
}

/** The launch film: poster and play button first; the 2-minute film (with sound) loads only when played. */
function Film() {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const play = () => {
    setStarted(true);
    const v = ref.current;
    if (v) v.play().catch(() => {});
  };

  return (
    <figure>
      <div className="relative aspect-video overflow-hidden rounded-[14px] bg-deep ring-1 ring-white/10 shadow-[0_40px_120px_-40px_rgb(95_203_126/0.45)]">
        <video
          ref={ref}
          src={HORIZON_FILM.mp4}
          poster={HORIZON_FILM.poster}
          preload="none"
          playsInline
          controls={started}
          className="absolute inset-0 size-full object-cover"
          aria-label="AgriSera Horizon launch film"
        />
        {!started && (
          <button
            type="button"
            onClick={play}
            className="group/play absolute inset-0 grid place-items-center bg-gradient-to-t from-black/60 via-black/10 to-transparent"
            aria-label={`Play the AgriSera Horizon film, ${HORIZON_FILM.duration}`}
          >
            <span className="flex items-center gap-4 rounded-full bg-white/95 py-3 pl-3 pr-6 text-void shadow-[0_20px_60px_-10px_rgb(0_0_0/0.6)] transition-transform duration-300 group-hover/play:scale-105">
              <span className="grid size-11 place-items-center rounded-full bg-[var(--color-agri)] text-void">
                <Play className="size-5 translate-x-[1px] fill-current" aria-hidden />
              </span>
              <span className="text-left">
                <span className="block text-sm font-semibold">Watch the film</span>
                <span className="block text-xs text-black/60">{HORIZON_FILM.duration} · sound on</span>
              </span>
            </span>
          </button>
        )}
      </div>
    </figure>
  );
}
