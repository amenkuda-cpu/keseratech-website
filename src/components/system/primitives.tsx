import Link from 'next/link';
import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STATUS_LABEL, type ProjectStatus } from '@/content/site';

/** Mono technical label, optionally numbered: "02 — WHAT WE BUILD" */
export function Label({ index, children, className }: { index?: string; children: ReactNode; className?: string }) {
  return (
    <p className={cn('t-label flex items-center gap-3 text-muted-foreground', className)}>
      {index && (
        <>
          <span className="text-foreground">{index}</span>
          <span aria-hidden className="h-px w-6 bg-current opacity-40" />
        </>
      )}
      <span>{children}</span>
    </p>
  );
}

/** The dot from the logo's A, in a division's accent. */
export function Dot({ color = 'var(--color-signal)', size = 8, glow = false, className }: { color?: string; size?: number; glow?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('inline-block shrink-0 rounded-full', className)}
      style={{ width: size, height: size, background: color, boxShadow: glow ? `0 0 0 4px color-mix(in srgb, ${color} 18%, transparent), 0 0 18px ${color}` : undefined }}
    />
  );
}

const STATUS_TONE: Record<ProjectStatus, string> = {
  CONCEPT: '#8b93a7',
  RESEARCH: '#b49cff',
  PROTOTYPE: '#ffb547',
  IN_DEVELOPMENT: 'var(--color-signal-soft)',
  PILOT: '#5fcb7e',
  COMING_SOON: '#f4f6fb',
  ACTIVE: '#7ee2a8',
};

export function StatusTag({ status, className }: { status: ProjectStatus; className?: string }) {
  const tone = STATUS_TONE[status];
  return (
    <span
      className={cn('t-label relative inline-flex items-center gap-2 rounded-sm border px-2.5 py-1.5', className)}
      style={{ borderColor: `color-mix(in srgb, ${tone} 40%, transparent)`, color: tone }}
    >
      <span aria-hidden className="status-live inline-block size-1.5 rounded-full" style={{ background: tone }} />
      <span className="sr-only">Status: </span>
      {STATUS_LABEL[status]}
    </span>
  );
}

type CtaProps = {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'ink' | 'text';
  external?: boolean;
  className?: string;
  style?: CSSProperties;
} & Omit<ComponentProps<typeof Link>, 'href' | 'className' | 'children' | 'style'>;

const ctaBase =
  'group/cta relative inline-flex min-h-12 items-center justify-between gap-6 rounded-[4px] px-5 text-[0.8rem] font-semibold uppercase tracking-[0.06em] transition-[background-color,border-color,color] duration-300 [font-variation-settings:"wdth"_112] focus-visible:outline-2';

const ctaVariants = {
  primary: 'bg-signal text-white hover:bg-[#3a98ff]',
  ghost: 'border border-hair-strong text-foreground hover:border-white/50 hover:bg-white/[0.04]',
  ink: 'bg-ink text-white hover:bg-[#16213b]',
  text: 'min-h-0 px-0 gap-3 text-foreground hover:text-signal-soft',
};

export function Cta({ href, children, variant = 'primary', external, className, ...rest }: CtaProps) {
  const Icon = external ? ArrowUpRight : ArrowRight;
  return (
    <Link href={href} className={cn(ctaBase, ctaVariants[variant], className)} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})} {...rest}>
      <span>{children}</span>
      <Icon aria-hidden className="size-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-1" strokeWidth={1.75} />
    </Link>
  );
}

export function HorizonLine({ className }: { className?: string }) {
  return <div aria-hidden className={cn('horizon w-full', className)} />;
}

/** Splits a "\n"-separated headline into block lines. */
export function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <span key={i} className="block">
          {line}
        </span>
      ))}
    </>
  );
}
