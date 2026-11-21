'use client';

import { ChevronsRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/** Card stats. STAT_B is Kesera's client return rate as supplied by the owner. */
const STAT_A = { value: 6, prefix: '', suffix: '', label: 'AI Specialists' };
const STAT_B = { value: 95, prefix: '', suffix: '%', label: 'Return Customers' };

/** Counts from 0 to `to` over ~1.5 s; reduced-motion visitors see the final value. */
function CountUp({ to, prefix = '', suffix = '', delay = 0 }: { to: number; prefix?: string; suffix?: string; delay?: number }) {
  const [n, setN] = useState(to);
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
    <span className="tabular-nums">
      {prefix}
      {n}
      {suffix}
    </span>
  );
}

function Faces({ keys, size, more }: { keys: string[]; size: number; more?: string }) {
  return (
    <span className="flex items-center">
      {keys.map((k, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={k}
          src={`/workforce/${k}.webp`}
          alt=""
          width={size}
          height={size}
          className="rounded-full border-2 border-white object-cover shadow-[0_3px_8px_rgb(0_0_0/0.25)]"
          style={{ width: size, height: size, marginLeft: i ? -size * 0.3 : 0, zIndex: keys.length - i }}
        />
      ))}
      {more && (
        <span
          className="grid place-items-center rounded-full border-2 border-white bg-[#2a2a33] font-semibold text-white shadow-[0_3px_8px_rgb(0_0_0/0.25)]"
          style={{ width: size, height: size, marginLeft: -size * 0.3, fontSize: size * 0.34 }}
        >
          {more}
        </span>
      )}
    </span>
  );
}

/**
 * Hero bento (layout after the supplied reference): a large card with the question,
 * a cut-out AI employee and the call to action; two stat cards beside it.
 * It sits in the hero's empty space and never covers the headline, video or buttons.
 */
export function HireAiCallout({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        'grid grid-cols-[1.55fr_1fr] grid-rows-2 gap-2 motion-safe:animate-[fade-up_0.7s_cubic-bezier(0.16,1,0.3,1)_1.2s_both]',
        compact ? 'mx-auto h-[300px] w-full max-w-[400px]' : 'h-[370px] w-[480px] origin-top-right [@media(max-height:800px)]:scale-[0.82]',
        className,
      )}
    >
      {/* Large card */}
      <Link
        href="/ai-workforce"
        aria-label="Looking to hire an AI employee? Meet the Kesera AI Workforce"
        className="group relative row-span-2 overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,#efe3b8_0%,#f3edd9_55%,#ece6d4_100%)] text-[#1b1712] shadow-[0_24px_60px_-24px_rgb(0_0_0/0.7)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/workforce/sarah-cutout.webp"
          alt="Sarah, AI Executive Assistant"
          className={cn('pointer-events-none absolute bottom-0 select-none object-contain object-bottom', compact ? '-right-[42%] h-[68%]' : '-right-[30%] h-[74%]')}
        />
        <span className={cn('absolute grid place-items-center rounded-full bg-white text-[#1b1712] shadow-sm', compact ? 'left-4 top-4 size-10' : 'left-5 top-5 size-12')}>
          <ShieldCheck size={compact ? 20 : 24} strokeWidth={1.8} />
        </span>
        <span className={cn('absolute z-10', compact ? 'left-4 top-[25%] w-[64%]' : 'left-5 top-[26%] w-[54%]')}>
          <span className={cn('block font-sans font-medium leading-[1.12] tracking-[-0.02em]', compact ? 'text-[1.15rem]' : 'text-[1.35rem]')}>Looking to hire an AI employee?</span>
          <span className={cn('mt-2 block leading-snug text-[#1b1712]/70', compact ? 'text-[0.72rem]' : 'text-[0.8rem]')}>AI employees that get real work done.</span>
          <span className={cn('mt-2.5 inline-flex items-center gap-1 whitespace-nowrap border-b border-[#1b1712]/40 pb-0.5 font-semibold transition group-hover:border-[#1a86fa] group-hover:text-[#1a86fa]', compact ? 'text-[0.68rem]' : 'text-[0.72rem]')}>
            Meet the AI Workforce <span aria-hidden>→</span>
          </span>
        </span>
        {/* Three-circle mark, bottom left */}
        <svg viewBox="0 0 52 48" className={cn('absolute text-[#1b1712]/35', compact ? 'bottom-3 left-4 w-9' : 'bottom-4 left-5 w-12')} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
          <circle cx="26" cy="13" r="11" />
          <circle cx="13" cy="34" r="11" />
          <circle cx="39" cy="34" r="11" />
        </svg>
      </Link>

      {/* Top stat card */}
      <Link href="/ai-workforce#team" className="relative flex flex-col justify-end overflow-hidden rounded-[28px] bg-[#f4a062] p-4 text-white shadow-[0_24px_60px_-24px_rgb(0_0_0/0.7)] sm:p-5">
        <span className="absolute right-3 top-3">
          <Faces keys={['sarah', 'alex', 'maya']} size={compact ? 24 : 30} more="+3" />
        </span>
        <span className={cn('font-display font-semibold leading-none', compact ? 'text-[2.1rem]' : 'text-[2.8rem]')}>
          <CountUp to={STAT_A.value} prefix={STAT_A.prefix} suffix={STAT_A.suffix} delay={1400} />
        </span>
        <span className={cn('mt-1.5 font-medium text-white/90', compact ? 'text-[0.72rem]' : 'text-[0.85rem]')}>{STAT_A.label}</span>
      </Link>

      {/* Bottom stat card */}
      <Link href="/ai-workforce#team" className="relative flex flex-col justify-end overflow-hidden rounded-[28px] bg-[#a596a6] p-4 text-white shadow-[0_24px_60px_-24px_rgb(0_0_0/0.7)] sm:p-5">
        <span className="absolute inset-x-3 top-3 flex items-center justify-between">
          <ChevronsRight size={compact ? 16 : 20} className="text-white/80" aria-hidden />
          <Faces keys={['james', 'daniel', 'grace']} size={compact ? 24 : 30} />
        </span>
        <span className={cn('font-display font-semibold leading-none', compact ? 'text-[2.1rem]' : 'text-[2.8rem]')}>
          <CountUp to={STAT_B.value} prefix={STAT_B.prefix} suffix={STAT_B.suffix} delay={1550} />
        </span>
        <span className={cn('mt-1.5 font-medium text-white/90', compact ? 'text-[0.72rem]' : 'text-[0.85rem]')}>{STAT_B.label}</span>
      </Link>
    </div>
  );
}
