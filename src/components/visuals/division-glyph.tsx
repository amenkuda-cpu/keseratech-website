import type { DivisionSlug } from '@/content/site';
import { cn } from '@/lib/utils';

// Small line drawings, one per division, in the schematic language of the site.
// Stroke uses currentColor; the accent highlights one element of each drawing.

export function DivisionGlyph({ slug, accent, className }: { slug: DivisionSlug; accent: string; className?: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, vectorEffect: 'non-scaling-stroke' as const };
  const hi = { fill: 'none', stroke: accent, strokeWidth: 1.6, vectorEffect: 'non-scaling-stroke' as const };
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={cn('size-full', className)}>
      {slug === 'sera-tech' && (
        <>
          <rect x="14" y="22" width="92" height="64" rx="3" {...common} />
          <line x1="14" y1="34" x2="106" y2="34" {...common} />
          <path d="M44 52 L34 60 L44 68" {...hi} />
          <path d="M76 52 L86 60 L76 68" {...hi} />
          <line x1="64" y1="48" x2="56" y2="72" {...common} />
          <line x1="40" y1="98" x2="80" y2="98" {...common} />
          <circle cx="20" cy="28" r="1.5" fill={accent} />
        </>
      )}
      {slug === 'agrisera' && (
        <>
          {[30, 48, 66, 84].map((y) => (
            <path key={y} d={`M10 ${y} C 40 ${y - 6}, 80 ${y + 6}, 110 ${y}`} {...common} />
          ))}
          <line x1="22" y1="12" x2="22" y2="104" {...hi} />
          {[30, 48, 66, 84].map((y) => (
            <circle key={y} cx="22" cy={y} r="3" fill="#05060b" stroke={accent} strokeWidth="1.4" />
          ))}
          <path d="M84 40 C 84 40, 76 52, 76 57 a8 8 0 0 0 16 0 C 92 52, 84 40, 84 40 Z" {...hi} />
        </>
      )}
      {slug === 'sera-energy' && (
        <>
          <rect x="34" y="16" width="40" height="78" rx="4" {...common} />
          <rect x="42" y="26" width="24" height="16" rx="1" {...common} />
          <path d="M57 50 L49 64 H58 L52 78" {...hi} />
          <path d="M74 70 H86 C 96 70, 96 92, 86 92 H80 V104" {...common} />
          <line x1="20" y1="104" x2="100" y2="104" {...common} />
        </>
      )}
      {slug === 'sera-home' && (
        <>
          {/* a container home beside an oil drum: both reclaimed */}
          <rect x="8" y="44" width="76" height="40" rx="1" {...common} />
          {[18, 26, 34, 42, 50, 58, 66, 74].map((x) => (
            <line key={x} x1={x} y1="48" x2={x} y2="80" stroke="currentColor" strokeOpacity="0.45" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
          ))}
          <rect x="18" y="54" width="20" height="14" {...hi} />
          <rect x="60" y="52" width="14" height="32" {...hi} />
          <path d="M14 44 L22 34 H60 L52 44" {...common} />
          <ellipse cx="100" cy="62" rx="12" ry="4" {...common} />
          <path d="M88 62 V96 Q100 101 112 96 V62" {...common} />
          <path d="M88 74 Q100 78 112 74 M88 86 Q100 90 112 86" {...common} />
          <line x1="4" y1="98" x2="116" y2="98" {...common} />
        </>
      )}
      {slug === 'sera-assistants' && (
        <>
          <rect x="14" y="20" width="62" height="40" rx="10" {...common} />
          <path d="M28 60 L24 72 L40 60" {...common} />
          <rect x="44" y="58" width="62" height="36" rx="10" {...hi} />
          {[56, 64, 72, 80, 88, 96].map((x, i) => (
            <line key={x} x1={x} y1={76 - [4, 8, 5, 10, 6, 3][i]!} x2={x} y2={76 + [4, 8, 5, 10, 6, 3][i]!} stroke={accent} strokeWidth="1.6" strokeLinecap="round" />
          ))}
          <line x1="26" y1="36" x2="62" y2="36" {...common} />
          <line x1="26" y1="44" x2="52" y2="44" {...common} />
        </>
      )}
      {slug === 'sera-front-desk' && (
        <>
          <path d="M30 26 c-6 0-10 6-8 12 c6 22 22 40 44 50 c6 2 12-2 12-8 v-8 l-14-6 l-6 6 c-10-6-18-14-24-24 l6-6 l-6-14 Z" {...common} />
          <path d="M70 22 a18 18 0 0 1 18 18" {...hi} />
          <path d="M70 10 a30 30 0 0 1 30 30" {...hi} />
          <rect x="62" y="88" width="44" height="18" rx="2" {...common} />
          <line x1="68" y1="97" x2="90" y2="97" stroke={accent} strokeWidth="1.6" />
        </>
      )}
    </svg>
  );
}
