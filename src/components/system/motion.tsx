'use client';

import { animate, motion, useInView, useMotionValue, useSpring } from 'motion/react';
import { useReducedMotion } from '@/components/system/reduced-motion';
import { useEffect, useMemo, useRef, useState, type ElementType, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * True once the element has reached the viewport (allowing for the bottom margin) or been
 * scrolled past. A plain intersection check can miss elements during fast scrolls or jumps,
 * which would leave them hidden for good; checking position on scroll as well never does.
 */
function useRevealed(ref: React.RefObject<Element | null>, bottomMargin = 0.1) {
  const inView = useInView(ref, { once: true, margin: `0px 0px -${Math.round(bottomMargin * 100)}% 0px` as `${number}px ${number}px ${number}% ${number}px` });
  const [passed, setPassed] = useState(false);
  useEffect(() => {
    if (inView || passed) return;
    const check = () => {
      const el = ref.current;
      if (el && el.getBoundingClientRect().top < window.innerHeight * (1 - bottomMargin)) setPassed(true);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [ref, inView, passed, bottomMargin]);
  return inView || passed;
}

/** Fades and lifts content in once, when it scrolls into view. */
export function Reveal({ children, delay = 0, className, as = 'div', y = 20 }: { children: ReactNode; delay?: number; className?: string; as?: ElementType; y?: number }) {
  const ref = useRef<HTMLElement>(null);
  const shown = useRevealed(ref, 0.12);
  const Comp = useMemo(() => motion.create(as), [as]);
  return (
    <Comp
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={shown ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}

/**
 * Headline whose lines rise out of a mask, one after another.
 * Pass lines explicitly so the break points are art-directed, not left to the browser.
 */
export function MaskLines({ id, lines, className, lineClassName, delay = 0, as: Tag = 'h2', immediate = false }: {
  id?: string;
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  as?: ElementType;
  immediate?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useRevealed(ref, 0.1);
  const show = immediate || inView;
  return (
    <Tag ref={ref} id={id} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.06em] -mb-[0.06em]">
          <motion.span
            className={cn('block will-change-transform', lineClassName)}
            initial={{ y: '105%' }}
            animate={show ? { y: '0%' } : undefined}
            transition={{ duration: 1, ease: EASE, delay: delay + i * 0.09 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Pulls its child gently toward the pointer. Primary CTAs only. */
export function Magnetic({ children, strength = 0.25, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      className={cn('inline-flex', className)}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== 'mouse' || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** Tweens between numeric values: used for live estimates, never for decoration. */
export function Tween({ value, format }: { value: number; format: (n: number) => string }) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      prev.current = value;
      return;
    }
    const controls = animate(prev.current, value, {
      duration: 0.6,
      ease: EASE,
      onUpdate: (v) => setDisplay(v),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, reduce]);
  return <span className="tabular-nums">{format(Math.round(display))}</span>;
}
