'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';
import { useReducedMotion } from '@/components/system/reduced-motion';
import type { Media } from '@/content/media';
import { cn } from '@/lib/utils';

/**
 * Drag (or use the arrow keys) to compare two photos: "before" on the left, "after" on the right.
 * When it first scrolls into view the divider sweeps across once to show it can be moved.
 * The control underneath is a native range input, so it works with keyboards and screen readers.
 */
export function BeforeAfter({
  before,
  after,
  beforeLabel = 'Before',
  afterLabel = 'After',
  aspect = '16/10',
  className,
  sizes = '(min-width: 1024px) 50vw, 100vw',
}: {
  before: Media;
  after: Media;
  beforeLabel?: string;
  afterLabel?: string;
  aspect?: string;
  className?: string;
  sizes?: string;
}) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();

  // One gentle sweep on first view: 50 → 78 → 22 → 50.
  useEffect(() => {
    if (!inView || reduce || touched) return;
    const keys = [78, 22, 50];
    const timers = keys.map((v, i) => window.setTimeout(() => setPos(v), 500 + i * 900));
    return () => timers.forEach(clearTimeout);
  }, [inView, reduce, touched]);

  const fromPointer = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  const animated = !dragging && !reduce;

  return (
    <div className={cn('select-none', className)}>
      <div
        ref={ref}
        className="relative cursor-ew-resize touch-pan-y overflow-hidden rounded-[6px] bg-deep outline-offset-4 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-ring"
        style={{ aspectRatio: aspect }}
        onPointerDown={(e) => {
          setTouched(true);
          setDragging(true);
          e.currentTarget.setPointerCapture(e.pointerId);
          fromPointer(e.clientX);
        }}
        onPointerMove={(e) => dragging && fromPointer(e.clientX)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        <Image src={after.src} alt={after.alt} fill sizes={sizes} className="object-cover" style={{ objectPosition: after.focus }} draggable={false} />
        <div
          className={cn('absolute inset-0', animated && 'transition-[clip-path] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]')}
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <Image src={before.src} alt={before.alt} fill sizes={sizes} className="object-cover" style={{ objectPosition: before.focus }} draggable={false} />
        </div>

        <span className="t-label absolute left-3 top-3 rounded-sm bg-black/55 px-2 py-1 text-[0.62rem] text-white/90 backdrop-blur-md">{beforeLabel}</span>
        <span className="t-label absolute right-3 top-3 rounded-sm bg-black/55 px-2 py-1 text-[0.62rem] text-white/90 backdrop-blur-md">{afterLabel}</span>

        {/* Divider and handle */}
        <div
          aria-hidden
          className={cn('pointer-events-none absolute inset-y-0 w-px bg-white/90 shadow-[0_0_12px_rgb(0_0_0/0.5)]', animated && 'transition-[left] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]')}
          style={{ left: `${pos}%` }}
        >
          <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/70 bg-void/70 text-white backdrop-blur-md">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
            </svg>
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(pos)}
          onChange={(e) => {
            setTouched(true);
            setPos(Number(e.target.value));
          }}
          aria-label={`Compare: ${beforeLabel} and ${afterLabel}`}
          className="pointer-events-none absolute inset-0 size-full opacity-0"
        />
      </div>
      <p className="t-label mt-2 text-[0.6rem] text-white/45">
        Drag to compare · Photos: {before.credit} and {after.credit}, Pexels
      </p>
    </div>
  );
}
