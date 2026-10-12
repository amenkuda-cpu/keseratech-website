'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useReducedMotion } from '@/components/system/reduced-motion';
import { ArrowRight } from 'lucide-react';
import { DIVISIONS } from '@/content/site';
import { cn } from '@/lib/utils';

// The Kesera ecosystem drawn as an engineering dial: the parent at the centre, six divisions
// on the orbit, data pulses travelling the links. Hover, focus or tap a node to read about it.

const R = 286; // orbit radius
const CORE = 66;
const NODE = 9;

// Rounded so server and browser render identical numbers (float trig differs between engines).
const r2 = (n: number) => Math.round(n * 100) / 100;
const cos = (deg: number) => r2(Math.cos((deg * Math.PI) / 180) * 1000) / 1000;
const sin = (deg: number) => r2(Math.sin((deg * Math.PI) / 180) * 1000) / 1000;

const nodes = DIVISIONS.map((d, i) => {
  const deg = -90 + i * 60;
  return { ...d, i, x: r2(cos(deg) * R), y: r2(sin(deg) * R), cos: cos(deg), sin: sin(deg) };
});

const ticks = Array.from({ length: 72 }, (_, i) => i * 5);

export function Ecosystem({ className }: { className?: string }) {
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-20% 0px' });
  const reduce = useReducedMotion();

  // Idle: walk through the divisions until someone interacts.
  useEffect(() => {
    if (touched || reduce || !inView) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % nodes.length), 3600);
    return () => window.clearInterval(id);
  }, [touched, reduce, inView]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const ringX = useTransform(sx, (v) => v * 6);
  const ringY = useTransform(sy, (v) => v * 6);
  const nodeX = useTransform(sx, (v) => v * 14);
  const nodeY = useTransform(sy, (v) => v * 14);

  const select = (i: number) => {
    setTouched(true);
    setActive(i);
  };

  const current = nodes[active]!;

  return (
    <div
      ref={ref}
      data-paused={inView ? undefined : ''}
      className={cn('relative', className)}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse' || reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
        my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <svg viewBox="-400 -400 800 800" className="block h-auto w-full overflow-visible" role="group" aria-label="The Kesera ecosystem: six divisions connected to Kesera">
        <defs>
          <radialGradient id="eco-core" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="scale(220)">
            <stop offset="0" stopColor="#1a86fa" stopOpacity="0.32" />
            <stop offset="1" stopColor="#1a86fa" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Dial: rings, ticks and bearings */}
        <motion.g style={{ x: ringX, y: ringY }} aria-hidden>
          <circle r="220" fill="url(#eco-core)" />
          <circle r="356" fill="none" stroke="white" strokeOpacity="0.07" />
          {ticks.map((deg) => {
            const major = deg % 30 === 0;
            const r1 = 356;
            const rr = major ? 340 : 349;
            return (
              <line key={deg} x1={r2(cos(deg) * r1)} y1={r2(sin(deg) * r1)} x2={r2(cos(deg) * rr)} y2={r2(sin(deg) * rr)} stroke="white" strokeOpacity={major ? 0.32 : 0.12} />
            );
          })}
          {[0, 90, 180, 270].map((deg) => {
            return (
              <text key={deg} x={r2(cos(deg - 90) * 378)} y={r2(sin(deg - 90) * 378 + 3)} textAnchor="middle" className="fill-white/30 font-mono text-[10px] tracking-[0.1em]">
                {String(deg).padStart(3, '0')}
              </text>
            );
          })}
          <circle r={R} fill="none" stroke="white" strokeOpacity="0.14" />
          <circle r="196" fill="none" stroke="white" strokeOpacity="0.06" strokeDasharray="2 6" />
          <circle r="118" fill="none" stroke="#1a86fa" strokeOpacity="0.28" strokeDasharray="1 5" />
          <line x1="-356" y1="0" x2="356" y2="0" stroke="white" strokeOpacity="0.04" />
          <line x1="0" y1="-356" x2="0" y2="356" stroke="white" strokeOpacity="0.04" />
        </motion.g>

        <motion.g style={{ x: nodeX, y: nodeY }}>
          {/* Links and pulses */}
          {nodes.map((n) => {
            const on = n.i === active;
            const x1 = r2(n.cos * (CORE + 6));
            const y1 = r2(n.sin * (CORE + 6));
            const x2 = r2(n.x - n.cos * (NODE + 8));
            const y2 = r2(n.y - n.sin * (NODE + 8));
            const d = `M${x1} ${y1} L${x2} ${y2}`;
            return (
              <g key={`l-${n.slug}`} aria-hidden>
                <path d={d} stroke={on ? n.accent : 'white'} strokeOpacity={on ? 0.9 : 0.16} strokeWidth={on ? 1.4 : 1} className="transition-[stroke,stroke-opacity] duration-500" />
                <path d={d} stroke={n.accent} strokeWidth="2.6" strokeLinecap="round" className="pulse-line" style={{ animationDelay: `${-n.i * 0.8}s`, opacity: on ? 1 : 0.55 }} />
              </g>
            );
          })}

          {/* Core */}
          <g aria-hidden>
            <circle r={CORE} fill="#05060b" stroke="#1a86fa" strokeOpacity="0.9" />
            <circle r={CORE - 7} fill="none" stroke="white" strokeOpacity="0.1" />
            <text y="6" textAnchor="middle" className="fill-white text-[15px] font-semibold uppercase tracking-[0.06em] [font-variation-settings:'wdth'_118]">
              Kesera
            </text>
            <circle cx="0" cy="26" r="3.2" fill="#1a86fa" />
          </g>

          {/* Division nodes */}
          {nodes.map((n) => {
            const on = n.i === active;
            const lx = r2(n.x + n.cos * 26);
            const ly = r2(n.y + n.sin * 26);
            const anchor = Math.abs(n.cos) < 0.2 ? 'middle' : n.cos > 0 ? 'start' : 'end';
            const dy = n.sin < -0.5 ? -14 : n.sin > 0.5 ? 20 : 4;
            return (
              <g
                key={n.slug}
                role="button"
                tabIndex={0}
                aria-pressed={on}
                aria-label={`${n.name}: ${n.short}`}
                className="cursor-pointer outline-none [&:focus-visible>circle.ring]:stroke-[3]"
                onPointerEnter={(e) => e.pointerType === 'mouse' && select(n.i)}
                onClick={() => select(n.i)}
                onFocus={() => select(n.i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    select(n.i);
                  }
                }}
              >
                <circle cx={n.x} cy={n.y} r="34" fill="transparent" />
                <circle className="ring transition-all duration-500" cx={n.x} cy={n.y} r={on ? 22 : 15} fill="none" stroke={n.accent} strokeOpacity={on ? 0.45 : 0.18} />
                <circle cx={n.x} cy={n.y} r={on ? NODE + 2 : NODE} fill={on ? n.accent : '#05060b'} stroke={n.accent} strokeWidth="1.5" className="transition-all duration-500" />
                <g className="hidden md:block">
                  <text
                    x={lx}
                    y={ly + dy}
                    textAnchor={anchor}
                    className={cn(
                      'text-[15px] font-semibold uppercase tracking-[0.04em] transition-[fill] duration-500 [font-variation-settings:"wdth"_115]',
                      on ? 'fill-white' : 'fill-white/60',
                    )}
                  >
                    {n.name}
                  </text>
                  <text x={lx} y={ly + dy + 16} textAnchor={anchor} className="fill-white/35 font-mono text-[9.5px] uppercase tracking-[0.1em]">
                    {n.discipline}
                  </text>
                </g>
              </g>
            );
          })}
        </motion.g>
      </svg>

      {/* Phones: labels move out of the drawing into a row of chips */}
      <div className="relative -mx-[var(--gutter)] mt-2 flex gap-2 overflow-x-auto px-[var(--gutter)] pb-1 [scrollbar-width:none] md:hidden" role="group" aria-label="Divisions">
        {nodes.map((n) => (
          <button
            key={n.slug}
            type="button"
            onClick={() => select(n.i)}
            aria-pressed={n.i === active}
            className={cn(
              'flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 text-xs transition-colors',
              n.i === active ? 'border-white/40 bg-white/[0.06] text-white' : 'border-hair text-dim',
            )}
          >
            <span className="size-1.5 rounded-full" style={{ background: n.accent }} />
            {n.name}
          </button>
        ))}
      </div>

      {/* Readout */}
      <div className="relative mt-4 min-h-[150px] md:mx-auto md:mt-2 md:max-w-[420px]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.slug}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="border-l pl-4"
            style={{ borderColor: current.accent }}
          >
            <p className="t-label text-faint">
              {String(current.i + 1).padStart(2, '0')} / 06 · {current.discipline}
            </p>
            <p className="t-title mt-2 text-white">{current.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-dim">{current.short}</p>
            <Link href={`/${current.slug}`} className="t-label mt-3 inline-flex items-center gap-2 py-1 text-white hover:text-signal-soft">
              Explore {current.name} <ArrowRight className="size-3.5" />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
