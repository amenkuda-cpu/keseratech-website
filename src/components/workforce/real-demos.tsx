'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, FileText, Pause, Play } from 'lucide-react';

/**
 * "Watch it work": real screen recordings of the live Kesera AI Workforce app (workforce.keseratech.com).
 * Each employee was given a real job on a demo business ("Zuva Hardware") using sample files.
 * Recordings are sped up while the employee works; nothing in the output was edited.
 */

type RealDemo = { key: string; name: string; role: string; asked: string; gave: string[]; label: string };

const DEMOS: RealDemo[] = [
  {
    key: 'grace',
    name: 'Grace',
    role: 'Finance Administrator',
    asked: 'Here is our November sales sheet (Excel). Prepare an invoice for Moyo Construction’s unpaid items and summarise November sales.',
    gave: ['Draft invoice: USD 1,188.00, every line recalculated', 'Excel analysis by customer, product and payment method', 'November sales summary, with unclear lines flagged, not guessed'],
    label: 'Sample spreadsheet',
  },
  {
    key: 'daniel',
    name: 'Daniel',
    role: 'Research Analyst',
    asked: 'Research online: cement prices in Zimbabwe right now and the main producers. One page with sources, and what it means for our stock.',
    gave: ['Live web research with dated sources (Herald, Ministry)', 'Prices by brand and supply shortfall (1.6 Mt made vs 2.5 Mt needed)', 'One-page PDF brief with a stock recommendation'],
    label: 'Live internet research',
  },
  {
    key: 'maya',
    name: 'Maya',
    role: 'Marketing Manager',
    asked: 'Here is our Instagram insights export. Which posts worked best and why (format, day, time)? Then give me a 2-week posting plan.',
    gave: ['Post-by-post analysis: reach, saves, WhatsApp clicks', 'What works: reels, evenings, payday weekends', '2-week content calendar with draft captions, held for approval'],
    label: 'Sample Instagram export',
  },
  {
    key: 'sarah',
    name: 'Sarah',
    role: 'Executive Assistant',
    asked: 'Turn these meeting notes into a short summary and an action list with owners and deadlines.',
    gave: ['One-page meeting summary (Word)', 'Action list: who does what, by when', 'Open decisions flagged for the owner'],
    label: 'Sample meeting notes',
  },
  {
    key: 'alex',
    name: 'Alex',
    role: 'Sales Executive',
    asked: 'Rank these 3 leads by priority and draft a short WhatsApp follow-up for each one.',
    gave: ['Leads ranked, with the reasoning', 'A personalised WhatsApp message per lead', 'Nothing sent: drafts wait for your OK'],
    label: 'Sample leads list',
  },
];

export function RealDemos() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const video = useRef<HTMLVideoElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const d = DEMOS[active];

  // Play only while the player is on screen (saves data on phones).
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      const v = video.current;
      if (!v) return;
      if (e.isIntersecting && playing) void v.play().catch(() => {});
      else v.pause();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [playing, active]);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <div ref={box}>
      <div role="tablist" aria-label="AI employees" className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
        {DEMOS.map((x, i) => (
          <button
            key={x.key}
            role="tab"
            aria-selected={i === active}
            onClick={() => {
              setActive(i);
              setPlaying(true);
            }}
            className={`flex shrink-0 items-center gap-2.5 rounded-sm border px-3 py-2 text-left transition ${i === active ? 'border-signal bg-signal/10' : 'border-hair hover:border-white/30'}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/workforce/${x.key}.webp`} alt="" width={32} height={32} className="size-8 rounded-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
            <span>
              <span className="block text-sm font-semibold text-white">{x.name}</span>
              <span className="block text-[11px] text-dim">{x.role}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <figure className="relative overflow-hidden rounded-sm border border-hair bg-black">
          <video
            key={d.key}
            ref={video}
            className="aspect-[16/10] w-full bg-white"
            src={`/workforce/demos/${d.key}.mp4`}
            poster={`/workforce/demos/${d.key}.jpg`}
            muted
            playsInline
            loop
            autoPlay
            preload="metadata"
            aria-label={`Screen recording: ${d.name} doing a real job in the Kesera AI Workforce app`}
          />
          <button onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/65 text-white backdrop-blur hover:bg-black/80">
            {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          </button>
          <figcaption className="absolute left-3 top-3 rounded-sm bg-black/65 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur">
            Real recording · {d.label}
          </figcaption>
        </figure>

        <div className="flex flex-col">
          <p className="t-label text-dim">What {d.name} was asked</p>
          <p className="mt-2 rounded-sm border border-hair bg-white/[0.03] p-4 text-[15px] leading-relaxed text-white/90">“{d.asked}”</p>
          <p className="t-label mt-6 text-dim">What {d.name} delivered</p>
          <ul className="mt-3 space-y-2.5">
            {d.gave.map((g) => (
              <li key={g} className="flex gap-2.5 text-[15px] text-white/85">
                <CheckCircle2 className="mt-0.5 size-[18px] shrink-0 text-signal" /> {g}
              </li>
            ))}
          </ul>
          <p className="mt-6 flex gap-2 text-[13px] leading-relaxed text-faint">
            <FileText className="mt-0.5 size-4 shrink-0" />
            Recorded on the live app with a demo business (“Zuva Hardware”). Sped up while {d.name} works; the results are exactly what {d.name} produced, including an independent quality check.
          </p>
        </div>
      </div>
    </div>
  );
}
