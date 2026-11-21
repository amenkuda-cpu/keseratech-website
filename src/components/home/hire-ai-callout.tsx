'use client';

import { Caveat } from 'next/font/google';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const hand = Caveat({ subsets: ['latin'], weight: ['500', '700'], display: 'swap' });

/** The AI Workforce line-up shown as overlapping portraits (AI-generated people, not real). */
const FACES = [
  { key: 'sarah', name: 'Sarah' },
  { key: 'alex', name: 'Alex' },
  { key: 'maya', name: 'Maya' },
  { key: 'james', name: 'James' },
  { key: 'daniel', name: 'Daniel' },
  { key: 'grace', name: 'Grace' },
];

/**
 * Card stats. Keep these TRUE: replace with real figures (hires, return rate)
 * once the workforce has paying customers. `prefix`/`suffix` frame the counted number.
 */
const STATS = [
  { value: 6, prefix: '', suffix: '', label: 'AI Specialists' },
  { value: 200, prefix: '$', suffix: '', label: 'Per month' },
];

/** Counts from 0 to `to` over ~1.5 s once visible; reduced-motion visitors see the final value. */
function CountUp({ to, prefix, suffix, delay }: { to: number; prefix: string; suffix: string; delay: number }) {
  const [n, setN] = useState(to);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setN(0);
    let raf = 0;
    const timer = setTimeout(() => {
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / 1500);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [to, delay]);
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {n}
      {suffix}
    </span>
  );
}

/**
 * Hero card pointing at the AI Workforce: a pencil-sketched question, the team's
 * faces, two stats and the call to action, read as one unit. It sits in the hero's
 * empty space and never covers the headline, video or buttons.
 */
export function HireAiCallout({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        'w-fit rounded-2xl border border-white/15 bg-black/45 p-5 text-white shadow-[0_24px_60px_-24px_rgb(0_0_0/0.7)] backdrop-blur-md',
        'motion-safe:animate-[fade-up_0.7s_cubic-bezier(0.16,1,0.3,1)_1.2s_both]',
        compact && 'mx-auto w-full max-w-[360px] p-4 text-center',
        className,
      )}
    >
      {/* Question with a short pencil arrow curling down into the card */}
      <div className={cn('flex items-end gap-2', compact && 'justify-center')}>
        <span className={cn(hand.className, 'block -rotate-[3deg] leading-none text-white/95', compact ? 'text-[1.55rem]' : 'text-[1.9rem]')}>
          Looking to hire an AI employee?
        </span>
        <svg viewBox="0 0 44 40" className={cn('shrink-0 overflow-visible text-white/80', compact ? 'hidden' : 'h-9 w-10 -mb-3')} fill="none" aria-hidden>
          <defs>
            <filter id="pencil" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="4" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.4" />
            </filter>
          </defs>
          <g filter="url(#pencil)" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.1">
            <path d="M6 4 C 20 8, 30 18, 26 34" pathLength={1} className="motion-safe:animate-[pencil-draw_0.8s_ease-out_1.9s_both] [stroke-dasharray:1] [stroke-dashoffset:0]" />
            <path d="M19 27 L 26 35 L 33 28" pathLength={1} className="motion-safe:animate-[pencil-draw_0.3s_ease-out_2.65s_both] [stroke-dasharray:1] [stroke-dashoffset:0]" />
          </g>
        </svg>
      </div>

      <div className={cn('mt-4 flex gap-5', compact ? 'flex-col items-center gap-3' : 'items-center')}>
        {/* Overlapping faces (~30% overlap), ending in a brand-colour bubble */}
        <Link href="/ai-workforce#team" className="flex items-center" aria-label="Meet the six AI employees">
          {FACES.map((f, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={f.key}
              src={`/workforce/${f.key}.webp`}
              alt={`${f.name}, AI employee`}
              width={44}
              height={44}
              loading="eager"
              className={cn(
                'rounded-full border-[2.5px] border-white object-cover shadow-[0_4px_12px_rgb(0_0_0/0.35)]',
                compact ? 'size-9' : 'size-11',
                i > 0 && (compact ? '-ml-[11px]' : '-ml-[13px]'),
              )}
              style={{ zIndex: FACES.length - i }}
            />
          ))}
          <span
            className={cn(
              'grid place-items-center rounded-full border-[2.5px] border-white bg-signal font-semibold text-white shadow-[0_4px_12px_rgb(0_0_0/0.35)]',
              compact ? '-ml-[11px] size-9 text-[0.95rem]' : '-ml-[13px] size-11 text-[1.05rem]',
            )}
            title="Or design a custom employee"
          >
            +
          </span>
        </Link>

        {/* Stats, separated by a subtle divider */}
        <dl className="flex items-stretch">
          {STATS.map((s, i) => (
            <div key={s.label} className={cn('px-4 first:pl-0 last:pr-0', i > 0 && 'border-l border-white/20', compact && 'text-center')}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-[1.65rem] font-semibold leading-none text-white">
                <CountUp to={s.value} prefix={s.prefix} suffix={s.suffix} delay={1400 + i * 150} />
              </dd>
              <dd className="mt-1.5 whitespace-nowrap text-[0.72rem] font-medium uppercase tracking-[0.08em] text-white/60">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>

      <Link
        href="/ai-workforce"
        className={cn(
          'group mt-4 flex items-center justify-between gap-3 rounded-full border border-white/20 bg-white/[0.06] py-2 pl-4 pr-3 transition hover:border-white/50 hover:bg-white/[0.12]',
          compact && 'justify-center',
        )}
      >
        <span className="whitespace-nowrap text-[0.85rem] font-semibold">Meet the AI Workforce</span>
        <span className="text-[#38e1ff] transition group-hover:translate-x-0.5" aria-hidden>
          →
        </span>
      </Link>
    </div>
  );
}
