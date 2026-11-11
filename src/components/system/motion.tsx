'use client';

import { animate, motion, useInView } from 'motion/react';
import { useReducedMotion } from '@/components/system/reduced-motion';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ElementType, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * True once the element has reached the viewport (allowing for the bottom margin) or is already
 * above it.
 *
 * One IntersectionObserver callback per element, no scroll listeners: dozens of per-element
 * scroll handlers, each measuring layout, made scrolling stutter on slower machines. An element
 * that a fast scroll or jump skips over reveals as soon as it comes back into view, and anything
 * already above the viewport when the page loads (a reload mid-page) is shown at once.
 */
function useRevealed(ref: React.RefObject<Element | null>, bottomMargin = 0.1) {
  const inView = useInView(ref, { once: true, margin: `0px 0px -${Math.round(bottomMargin * 100)}% 0px` as `${number}px ${number}px ${number}% ${number}px` });
  const [above, setAbove] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const io = new IntersectionObserver(([e]) => {
      if (e && !e.isIntersecting && e.boundingClientRect.bottom < 0) setAbove(true);
      io.disconnect();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, inView]);
  return inView || above;
}

/**
 * Display headings are big; a single long word ("Intelligence") can be wider than its column and
 * would be cut off by the reveal mask. This shrinks the heading just enough to fit, re-checking on
 * resize and once web fonts have loaded. Headings that already fit are left untouched.
 */
function useFitLines(ref: React.RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const fit = () => {
      el.style.fontSize = '';
      const masks = [...el.querySelectorAll<HTMLElement>(':scope > span')];
      const ratio = Math.max(1, ...masks.map((m) => m.scrollWidth / Math.max(1, m.clientWidth)));
      if (ratio > 1.001) el.style.fontSize = `${parseFloat(getComputedStyle(el).fontSize) / ratio * 0.98}px`;
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    fit();
    document.fonts?.ready.then(schedule).catch(() => {});
    const ro = new ResizeObserver(schedule);
    ro.observe(el.parentElement ?? el);
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, [ref]);
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
  useFitLines(ref);
  if (immediate) {
    // Above the fold: animate in CSS so the headline paints with the HTML instead of waiting for
    // JavaScript (it is usually the page's largest element, so this decides how fast it feels).
    return (
      <Tag ref={ref} id={id} className={className}>
        {lines.map((line, i) => (
          <span key={i} className="block">
            <span className={cn('block animate-[fade-up_0.9s_cubic-bezier(0.16,1,0.3,1)_both]', lineClassName)} style={{ animationDelay: `${delay + i * 0.08}s` }}>
              {line}
            </span>
          </span>
        ))}
      </Tag>
    );
  }
  // A gentle fade, line by line, as the heading scrolls into view.
  return (
    <Tag ref={ref} id={id} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block">
          <motion.span
            className={cn('block', lineClassName)}
            initial={{ opacity: 0, y: 12 }}
            animate={show ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.9, ease: EASE, delay: delay + i * 0.08 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/**
 * A list whose items fade and lift in one after another when it scrolls into view.
 * Pass `as="ul"` / `"ol"` and plain children; each child is wrapped in a motion item of `itemAs`.
 */
export function Stagger({
  children,
  className,
  itemClassName,
  as = 'ul',
  itemAs = 'li',
  gap = 0.07,
  delay = 0,
  y = 18,
}: {
  children: ReactNode[];
  className?: string;
  itemClassName?: string;
  as?: ElementType;
  itemAs?: ElementType;
  gap?: number;
  delay?: number;
  y?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const shown = useRevealed(ref, 0.08);
  const Tag = as;
  const Item = useMemo(() => motion.create(itemAs), [itemAs]);
  return (
    <Tag ref={ref} className={className}>
      {children.map((child, i) => (
        <Item
          key={i}
          className={itemClassName}
          initial={{ opacity: 0, y }}
          animate={shown ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.7, ease: EASE, delay: delay + i * gap }}
        >
          {child}
        </Item>
      ))}
    </Tag>
  );
}

/** Counts up from zero to `to` the first time it scrolls into view. Reduced motion shows the number at once. */
export function CountUp({ to, duration = 1.6, suffix = '', className }: { to: number; duration?: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRevealed(ref, 0.05);
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!shown) return;
    if (reduce) {
      setN(to);
      return;
    }
    const controls = animate(0, to, { duration, ease: EASE, onUpdate: (v) => setN(Math.round(v)) });
    return () => controls.stop();
  }, [shown, reduce, to, duration]);
  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {/* Screen readers and no-JS get the real number */}
      <span aria-hidden>{n}{suffix}</span>
      <span className="sr-only">{to}{suffix}</span>
    </span>
  );
}

/**
 * Moves its content slower than the page as it scrolls past (a subtle depth effect).
 * `strength` is the total travel in px across the element's time on screen.
 */
export function Parallax({ children, className, strength = 80 }: { children: ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.parentElement?.getBoundingClientRect() ?? el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -200 || r.top > vh + 200) return;
      // -0.5 when entering at the bottom, +0.5 when leaving at the top
      const p = (vh - r.top) / (vh + r.height) - 0.5;
      el.style.transform = `translate3d(0, ${(p * strength).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reduce, strength]);
  return (
    <div ref={ref} className={cn('will-change-transform', className)}>
      {children}
    </div>
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
