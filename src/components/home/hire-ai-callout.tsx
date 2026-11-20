import { Caveat } from 'next/font/google';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const hand = Caveat({ subsets: ['latin'], weight: ['500', '700'], display: 'swap' });

/**
 * A pencil-sketched note in the hero pointing at the AI Workforce. It sits in the
 * hero's empty space and never covers the headline, video or calls to action.
 * The arrow draws itself once; reduced-motion visitors see it already drawn.
 */
export function HireAiCallout({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      href="/ai-workforce"
      className={cn('group block w-fit text-white focus-visible:outline-offset-4', className)}
      aria-label="Looking to hire an AI employee? Meet the Kesera AI Workforce"
    >
      <span className={cn(hand.className, 'block -rotate-[4deg] leading-none text-white/90', compact ? 'text-[1.6rem]' : 'text-[2.15rem]')}>
        Looking to hire an AI employee?
      </span>

      <span className={cn('relative block', compact ? 'ml-6 h-[52px] w-[120px]' : 'ml-14 h-[78px] w-[170px]')} aria-hidden>
        <svg viewBox="0 0 170 78" className="absolute inset-0 size-full overflow-visible" fill="none">
          <defs>
            {/* Slight grain and wobble so the line reads as pencil, not vector */}
            <filter id="pencil" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="4" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6" />
            </filter>
          </defs>
          <g filter="url(#pencil)" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
            <path
              d="M8 6 C 18 30, 40 52, 78 58 C 104 62, 126 60, 150 52"
              strokeWidth="2.2"
              pathLength={1}
              className="motion-safe:animate-[pencil-draw_1.1s_ease-out_1.4s_both] [stroke-dasharray:1] [stroke-dashoffset:0]"
            />
            <path
              d="M136 41 L 151 52 L 135 61"
              strokeWidth="2.2"
              pathLength={1}
              className="motion-safe:animate-[pencil-draw_0.35s_ease-out_2.45s_both] [stroke-dasharray:1] [stroke-dashoffset:0]"
            />
          </g>
        </svg>
      </span>

      <span
        className={cn(
          'flex items-center gap-2.5 rounded-full border border-white/20 bg-black/45 py-1.5 pl-1.5 pr-4 backdrop-blur-md transition group-hover:border-white/50 group-hover:bg-black/60',
          'motion-safe:animate-[fade-up_0.6s_cubic-bezier(0.16,1,0.3,1)_2.6s_both]',
          compact ? 'ml-4' : 'ml-[150px]',
        )}
      >
        <span className="flex -space-x-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/workforce/sarah.webp" alt="" width={28} height={28} className="size-7 rounded-full border border-black/60 object-cover" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/workforce/alex.webp" alt="" width={28} height={28} className="size-7 rounded-full border border-black/60 object-cover" />
        </span>
        <span className="whitespace-nowrap text-[0.82rem] font-semibold">Meet the AI Workforce</span>
        <span className="text-[#38e1ff] transition group-hover:translate-x-0.5">→</span>
      </span>
    </Link>
  );
}
