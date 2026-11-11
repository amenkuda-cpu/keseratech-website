'use client';

import { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useReducedMotion } from '@/components/system/reduced-motion';
import { PLAN_GROUPS, PLAN_GROUP_INFO, type Plan, type PlanGroup } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import { PlanTable } from './plan-table';

/**
 * One set of pricing cards per service, switched with tabs. The tab follows the URL hash
 * (#pricing-app etc.) so a link can open a given service.
 */
export function PricingTabs({ plans, initial = 'website', className }: { plans: Plan[]; initial?: PlanGroup; className?: string }) {
  const groups = PLAN_GROUPS.filter((g) => plans.some((p) => p.group === g));
  const [active, setActive] = useState<PlanGroup>(groups.includes(initial) ? initial : groups[0]!);
  const reduce = useReducedMotion();
  const uid = useId();

  useEffect(() => {
    const fromHash = () => {
      const g = window.location.hash.replace('#pricing-', '') as PlanGroup;
      if (groups.includes(g)) setActive(g);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = groups[(i + step + groups.length) % groups.length]!;
    setActive(next);
    document.getElementById(`${uid}-tab-${next}`)?.focus();
  };

  const shown = plans.filter((p) => p.group === active).sort((a, b) => a.sort - b.sort);

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Service"
        className="-mx-[var(--gutter)] flex gap-1 overflow-x-auto px-[var(--gutter)] pb-2 [scrollbar-width:none] md:mx-0 md:inline-flex md:rounded-full md:border md:border-ink/12 md:bg-white/80 md:p-1.5"
      >
        {groups.map((g, i) => (
          <button
            key={g}
            id={`${uid}-tab-${g}`}
            role="tab"
            type="button"
            aria-selected={active === g}
            aria-controls={`${uid}-panel`}
            tabIndex={active === g ? 0 : -1}
            onClick={() => setActive(g)}
            onKeyDown={(e) => onKey(e, i)}
            className={cn(
              'relative min-h-11 shrink-0 rounded-full px-5 text-sm font-semibold transition-colors duration-300',
              active === g ? 'text-white' : 'border border-ink/12 text-ink/70 hover:text-ink md:border-0',
            )}
          >
            {active === g && (
              <motion.span
                layoutId={`${uid}-pill`}
                className="absolute inset-0 -z-0 rounded-full bg-ink"
                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }}
              />
            )}
            <span className="relative">{PLAN_GROUP_INFO[g].tab}</span>
          </button>
        ))}
      </div>

      <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${active}`} className="mt-12 md:mt-16">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <PlanTable plans={shown} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
